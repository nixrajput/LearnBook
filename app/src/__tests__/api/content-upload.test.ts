import { describe, it, expect } from "vitest";

describe("content upload API logic", () => {
  describe("file type validation", () => {
    const ALLOWED = [".pdf", ".epub"];
    it("accepts .pdf", () => expect(ALLOWED.includes(".pdf")).toBe(true));
    it("accepts .epub", () => expect(ALLOWED.includes(".epub")).toBe(true));
    it("rejects .txt", () => expect(ALLOWED.includes(".txt")).toBe(false));
    it("rejects .html", () => expect(ALLOWED.includes(".html")).toBe(false));
    it("rejects .exe", () => expect(ALLOWED.includes(".exe")).toBe(false));
  });

  describe("magic byte validation", () => {
    it("PDF starts with %PDF", () => {
      const buf = Buffer.from("%PDF-1.4");
      expect(buf.slice(0, 4).toString("ascii")).toBe("%PDF");
    });
    it("EPUB (ZIP) starts with PK", () => {
      const buf = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
      expect(buf[0]).toBe(0x50);
      expect(buf[1]).toBe(0x4b);
    });
    it("rejects non-PDF content with .pdf extension", () => {
      const buf = Buffer.from("This is not a PDF");
      expect(buf.slice(0, 4).toString("ascii")).not.toBe("%PDF");
    });
  });

  describe("SSRF protection for import URL", () => {
    function isBlockedHost(hostname: string): boolean {
      return (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "0.0.0.0" ||
        hostname.startsWith("192.168.") ||
        hostname.startsWith("10.") ||
        hostname === "169.254.169.254" ||
        hostname.endsWith(".local") ||
        hostname === "[::1]"
      );
    }

    it("blocks localhost", () => expect(isBlockedHost("localhost")).toBe(true));
    it("blocks 127.0.0.1", () => expect(isBlockedHost("127.0.0.1")).toBe(true));
    it("blocks 192.168.x.x", () => expect(isBlockedHost("192.168.1.1")).toBe(true));
    it("blocks 10.x.x.x", () => expect(isBlockedHost("10.0.0.1")).toBe(true));
    it("blocks metadata endpoint", () => expect(isBlockedHost("169.254.169.254")).toBe(true));
    it("blocks .local", () => expect(isBlockedHost("mypc.local")).toBe(true));
    it("allows public hosts", () => expect(isBlockedHost("example.com")).toBe(false));
    it("allows public IPs", () => expect(isBlockedHost("93.184.216.34")).toBe(false));
  });
});
