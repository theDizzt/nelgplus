const ASSET_PREFIX = `${import.meta.env.BASE_URL}assets/`;

/** Resolve a file from public/assets against the active Vite deployment base. */
export function assetUrl(path: string): string {
  const relativePath = path.replace(/^\.?\/?(?:assets\/)?/, "");
  return `${ASSET_PREFIX}${relativePath}`;
}
