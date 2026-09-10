import { readdirSync } from "node:fs";
import { relative, resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";

const PRELOAD_ASSETS_MODULE_ID = "virtual:preload-assets";
const RESOLVED_PRELOAD_ASSETS_MODULE_ID = `\0${PRELOAD_ASSETS_MODULE_ID}`;

function collectAssetFiles(directory: string, root = directory): string[] {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = resolve(directory, entry.name);
      if (entry.isDirectory()) return collectAssetFiles(entryPath, root);
      if (!entry.isFile()) return [];
      return relative(root, entryPath).replaceAll("\\", "/");
    })
    .sort((left, right) => left.localeCompare(right));
}

function preloadAssetsPlugin(): Plugin {
  let assetsRoot = "";
  return {
    name: "nelg-preload-assets",
    configResolved(config) {
      assetsRoot = resolve(config.root, "public/assets");
    },
    resolveId(id) {
      return id === PRELOAD_ASSETS_MODULE_ID ? RESOLVED_PRELOAD_ASSETS_MODULE_ID : null;
    },
    load(id) {
      if (id !== RESOLVED_PRELOAD_ASSETS_MODULE_ID) return null;
      return `const assets = ${JSON.stringify(collectAssetFiles(assetsRoot), null, 2)};\nexport default assets;\n`;
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [preloadAssetsPlugin()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    assetsInlineLimit: 0,
  },
});
