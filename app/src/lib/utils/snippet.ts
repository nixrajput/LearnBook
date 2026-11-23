const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}

/**
 * Builds an HTML search snippet around the first match, with matches wrapped in <mark>.
 * The search dialog renders it as HTML, and the text comes from uploaded or imported
 * content, so every piece is escaped first.
 */
export function snippet(text: string, query: string, maxLen = 120): string {
  const lower = text.toLowerCase();
  const lowerQ = query.toLowerCase();
  const idx = lower.indexOf(lowerQ);
  if (idx === -1) return escapeHtml(text.slice(0, maxLen)) + (text.length > maxLen ? "…" : "");

  const start = Math.max(0, idx - 40);
  const end = Math.min(text.length, idx + query.length + 80);
  const pattern = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const hl = text
    .slice(start, end)
    .split(pattern)
    .map((part, i) => (i % 2 === 1 ? `<mark>${escapeHtml(part)}</mark>` : escapeHtml(part)))
    .join("");
  return (start > 0 ? "…" : "") + hl + (end < text.length ? "…" : "");
}
