import { lookup } from "node:dns/promises";
import { BlockList, isIP } from "node:net";
import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";

const MAX_REDIRECTS = 5;
const MAX_BYTES = 5 * 1024 * 1024;
const TIMEOUT_MS = 15_000;

// Loopback, private, link-local (cloud metadata), CGNAT, multicast and reserved ranges.
// BlockList also matches IPv4-mapped IPv6 addresses such as ::ffff:127.0.0.1 against the IPv4 rules.
const BLOCKED = new BlockList();
for (const [net, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["224.0.0.0", 3],
] as const) {
  BLOCKED.addSubnet(net, prefix, "ipv4");
}
for (const [net, prefix] of [
  ["::", 127],
  ["fc00::", 7],
  ["fe80::", 10],
  ["ff00::", 8],
] as const) {
  BLOCKED.addSubnet(net, prefix, "ipv6");
}

/** The URL is not an http(s) URL on a public address. Callers report it as a 400. */
export class UnsafeUrlError extends Error {}

/** Resolves the host and rejects the URL if any address it resolves to is not public. */
export async function assertPublicUrl(raw: string): Promise<URL> {
  const url = new URL(raw);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new UnsafeUrlError("Only http/https URLs are supported");
  }
  const host = url.hostname.replace(/^\[|\]$/g, "");
  const family = isIP(host);
  const addresses = family ? [{ address: host, family }] : await lookup(host, { all: true });
  for (const { address, family: f } of addresses) {
    if (BLOCKED.check(address, f === 6 ? "ipv6" : "ipv4")) {
      throw new UnsafeUrlError("Cannot import from private/internal URLs");
    }
  }
  return url;
}

// ponytail: the check and the connection resolve DNS separately, so a rebinding DNS server
// could still pass it. Pin the checked address in a custom dispatcher if that threat matters.
async function fetchPublicHtml(raw: string): Promise<string> {
  let url = await assertPublicUrl(raw);
  for (let hop = 0; ; hop++) {
    const res = await fetch(url, {
      headers: { "User-Agent": "LearnBook/1.0 (Article Import)" },
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const location = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && location) {
      if (hop >= MAX_REDIRECTS) throw new Error("Too many redirects");
      url = await assertPublicUrl(new URL(location, url).href);
      continue;
    }
    if (!res.ok) {
      throw new Error(`Failed to fetch URL: ${res.status}`);
    }
    return readCapped(res);
  }
}

async function readCapped(res: Response): Promise<string> {
  if (Number(res.headers.get("content-length") ?? 0) > MAX_BYTES) {
    throw new Error("Page is larger than 5 MB");
  }
  const chunks: Uint8Array[] = [];
  let size = 0;
  for await (const chunk of res.body ?? []) {
    size += chunk.length;
    if (size > MAX_BYTES) throw new Error("Page is larger than 5 MB");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf-8");
}

export interface ParsedArticle {
  title: string;
  content: string;
  excerpt: string;
  siteName: string | null;
  byline: string | null;
}

/**
 * Fetch a URL and extract the article content using Mozilla Readability.
 * Returns markdown-normalized content.
 */
export async function parseWebArticle(url: string): Promise<ParsedArticle> {
  const html = await fetchPublicHtml(url);
  const { document } = parseHTML(html);

  const reader = new Readability(document);
  const article = reader.parse();

  if (!article || !article.textContent?.trim()) {
    throw new Error("Could not extract article content from this URL");
  }

  // Convert HTML content to simple markdown
  const content = htmlToMarkdown(article.content ?? "");

  return {
    title: article.title || "Untitled Article",
    content,
    excerpt: article.excerpt || "",
    siteName: article.siteName || null,
    byline: article.byline || null,
  };
}

/** Simple HTML to markdown conversion for article content */
function htmlToMarkdown(html: string): string {
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n")
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n")
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n")
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, "#### $1\n\n")
    .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**")
    .replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
    .replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*")
    .replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`")
    .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, "```\n$1\n```\n\n")
    .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
    .replace(/<a[^>]+href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)")
    .replace(/<img[^>]+src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, "![$2]($1)")
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, "> $1\n\n")
    .replace(/<[^>]+>/g, "") // Strip remaining HTML tags
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
