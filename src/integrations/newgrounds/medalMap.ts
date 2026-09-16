/**
 * Newgrounds medal mapping
 * -------------------------
 *
 * Edit ONLY this file when choosing which in-game achievements should also
 * unlock Newgrounds medals. The left-hand number is the game's achievement
 * ID (the number passed to unlockAchievement); the right-hand number is the
 * medal ID copied from your Newgrounds Project's Medals page.
 *
 * Example:
 *   1: 123456,
 *   25: 123457,
 *
 * Leave an achievement out of this object to keep it local-only. Do not use
 * the game's achievement number as the Newgrounds medal ID unless Newgrounds
 * actually assigned that exact ID to the medal.
 *
 * Before adding an entry:
 * 1. Create and publish the medal in the Newgrounds Project dashboard.
 * 2. Copy its numeric ID into the right-hand side below.
 * 3. Set the VITE_NEWGROUNDS_* values in .env.local (see .env.example).
 * 4. Run build-newgrounds.bat to create the upload ZIP.
 *
 * The Newgrounds API cannot create medals from the game; this file maps the
 * already-created Newgrounds medals to the game's existing achievements.
 */
export const NEWGROUNDS_MEDAL_MAP: Readonly<Record<number, number>> = {
  // 1: 123456,
};

