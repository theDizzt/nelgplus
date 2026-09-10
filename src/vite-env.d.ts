/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WINNER_REPORT_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "virtual:preload-assets" {
  const assets: readonly string[];
  export default assets;
}
