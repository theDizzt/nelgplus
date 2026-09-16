/** Both portal builds retain only the music for Levels 34, 35 and 47. */
export function usesRestrictedMusic(mode: string): boolean {
  return mode === "newgrounds" || mode === "itch";
}

/** Files retained in portal packages. */
const NEWGROUNDS_MUSIC = new Set([
  "music/level34.mp3",
  "music/level34proto.mp3",
  "music/level35phase9.wav",
  "music/level47.mp3",
]);

export function isNewgroundsAssetAllowed(source: string): boolean {
  const path = source.replace(/^\/?(?:assets\/)?/, "").toLowerCase();
  return !path.startsWith("music/") || NEWGROUNDS_MUSIC.has(path);
}
