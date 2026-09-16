/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WINNER_REPORT_API_URL?: string;
  readonly VITE_NEWGROUNDS_ENABLED?: string;
  readonly VITE_NEWGROUNDS_APP_ID?: string;
  readonly VITE_NEWGROUNDS_ENCRYPTION_KEY?: string;
  readonly VITE_NEWGROUNDS_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "virtual:preload-assets" {
  const assets: readonly string[];
  export default assets;
}
