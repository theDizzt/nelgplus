import { readdirSync, rmSync } from "node:fs";
import { relative, resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import { isNewgroundsAssetAllowed } from "./src/core/newgroundsMusic";

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
  let outputAssetsRoot = "";
  let newgrounds = false;
  return {
    name: "nelg-preload-assets",
    configResolved(config) {
      assetsRoot = resolve(config.root, "public/assets");
      outputAssetsRoot = resolve(config.root, config.build.outDir, "assets");
      newgrounds = config.mode === "newgrounds";
    },
    resolveId(id) {
      return id === PRELOAD_ASSETS_MODULE_ID ? RESOLVED_PRELOAD_ASSETS_MODULE_ID : null;
    },
    load(id) {
      if (id !== RESOLVED_PRELOAD_ASSETS_MODULE_ID) return null;
      const assets = collectAssetFiles(assetsRoot).filter(path => !newgrounds || isNewgroundsAssetAllowed(path));
      return `const assets = ${JSON.stringify(assets, null, 2)};\nexport default assets;\n`;
    },
    closeBundle() {
      if (!newgrounds) return;
      for (const path of collectAssetFiles(outputAssetsRoot)) {
        if (isNewgroundsAssetAllowed(path)) continue;
        const target = resolve(outputAssetsRoot, path);
        if (!relative(outputAssetsRoot, target).replaceAll("\\", "/").startsWith("music/")) {
          throw new Error(`Refusing to remove an asset outside the output music directory: ${path}`);
        }
        rmSync(target);
      }
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
