import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    globals: true,
    root: __dirname,
    setupFiles: ["./src/__tests__/setup-dom.ts"],
    // next-auth imports "next/server" without an extension, which Node's ESM loader rejects.
    server: { deps: { inline: ["next-auth"] } },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
