import { describe, it, expect, afterEach, vi } from "vitest";
import { assertPublicUrl, parseWebArticle, UnsafeUrlError } from "@/lib/content/parsers/web-parser";

const PUBLIC = "http://93.184.215.14/article";

afterEach(() => vi.unstubAllGlobals());

describe("assertPublicUrl", () => {
  it.each([
    "http://localhost/",
    "http://127.0.0.2/",
    "http://2130706433/",
    "http://[::1]/",
    "http://[::ffff:127.0.0.1]/",
    "http://169.254.169.254/latest/meta-data",
    "http://100.64.0.1/",
    "http://172.20.0.1/",
    "ftp://93.184.215.14/",
  ])("rejects %s", async (url) => {
    await expect(assertPublicUrl(url)).rejects.toBeInstanceOf(UnsafeUrlError);
  });

  it("accepts a public address", async () => {
    await expect(assertPublicUrl(PUBLIC)).resolves.toBeInstanceOf(URL);
  });
});

describe("parseWebArticle", () => {
  it("rejects a redirect to an internal address", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(null, {
          status: 302,
          headers: { location: "http://169.254.169.254/latest/meta-data" },
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(parseWebArticle(PUBLIC)).rejects.toBeInstanceOf(UnsafeUrlError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("rejects a page larger than 5 MB", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () => new Response("x", { headers: { "content-length": String(6 * 1024 * 1024) } }),
      ),
    );

    await expect(parseWebArticle(PUBLIC)).rejects.toThrow("larger than 5 MB");
  });
});
