const ASSET_PREFIX = import.meta.env.DEV
  ? new URL(`${import.meta.env.BASE_URL}assets/`, document.baseURI)
  : new URL(/* @vite-ignore */ "./", import.meta.url);

/** Resolve a file from public/assets against the active Vite deployment base. */
export function assetUrl(path: string): string {
  const relativePath = path.replace(/^\.?\/?(?:assets\/)?/, "");
  return new URL(relativePath, ASSET_PREFIX).href;
}
