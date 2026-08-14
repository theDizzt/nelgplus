/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WINNER_REPORT_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
