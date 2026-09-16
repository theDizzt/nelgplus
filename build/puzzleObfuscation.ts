import JavaScriptObfuscator from "javascript-obfuscator";
import type { Plugin } from "vite";

// Keep authoring/debugging readable; protect only the shipped puzzle modules.
export function puzzleObfuscationPlugin(): Plugin {
  return {
    name: "nelg-puzzle-obfuscation",
    apply: "build",
    enforce: "post",
    transform(code, id) {
      const path = id.split("?", 1)[0]!.replaceAll("\\", "/");
      if (!/\/src\/(?:levels\/[^/]+|core\/Game)\.ts$/.test(path)) return null;

      const result = JavaScriptObfuscator.obfuscate(code, {
        target: "browser-no-eval",
        compact: true,
        seed: 1729,
        identifierNamesGenerator: "hexadecimal",
        stringArray: true,
        stringArrayThreshold: 1,
        stringArrayEncoding: ["rc4"],
        stringArrayRotate: true,
        stringArrayShuffle: true,
        unicodeEscapeSequence: true,
        // Avoid expensive or behavior-changing anti-debugging transformations.
        controlFlowFlattening: false,
        deadCodeInjection: false,
        debugProtection: false,
        disableConsoleOutput: false,
        selfDefending: false,
        renameGlobals: false,
        renameProperties: false,
        sourceMap: false,
      });
      return { code: result.getObfuscatedCode(), map: null };
    },
  };
}
