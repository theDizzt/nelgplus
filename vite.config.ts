import { defineConfig } from "vite";

export default defineConfig({
  base: "/nelgplus/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    assetsInlineLimit: 0,
  },
});
