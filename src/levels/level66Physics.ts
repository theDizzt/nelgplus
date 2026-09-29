export type ObjectKind = "floor" | "wall" | "ladder" | "spring" | "hot" | "steve";
export interface Rect { x: number; y: number; width: number; height: number }
export interface PuzzleObject extends Rect { kind: ObjectKind }
export interface PuzzleLayout { start: { x: number; y: number }; portal: Rect; objects: PuzzleObject[] }
export interface Runner extends Rect {
  direction: 1 | -1; vy: number; grounded: boolean; boosted: boolean;
  ladder: PuzzleObject | null; mode: "idle" | "walking" | "climbing" | "jumping" | "falling";
}
export const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
export const draggable = (o: PuzzleObject) => ["floor", "wall", "ladder", "spring"].includes(o.kind);
export const createRunner = (start: PuzzleLayout["start"]): Runner => ({ ...start, width: 38, height: 72, direction: 1, vy: 0, grounded: false, boosted: false, ladder: null, mode: "idle" });

// Provisional staging layout: replace each entry when the five puzzle maps are supplied.
export const PUZZLES: PuzzleLayout[] = Array.from({ length: 5 }, () => ({
  start: { x: 48, y: 438 }, portal: { x: 706, y: 422, width: 62, height: 88 },
  objects: [
    { kind: "floor", x: 24, y: 510, width: 216, height: 24 },
    { kind: "floor", x: 265, y: 510, width: 260, height: 24 },
    { kind: "floor", x: 550, y: 510, width: 226, height: 24 },
    { kind: "wall", x: 608, y: 210, width: 28, height: 110 },
    { kind: "ladder", x: 210, y: 265, width: 46, height: 155 },
    { kind: "spring", x: 360, y: 374, width: 64, height: 24 },
    { kind: "hot", x: 492, y: 215, width: 30, height: 112 },
    { kind: "steve", x: 660, y: 232, width: 76, height: 90 },
  ],
}));

/** Fixed small timesteps prevent tunneling through thin walls and hazards. */
export function stepRunner(p: Runner, objects: PuzzleObject[], portal: Rect, dt: number): "running" | "dead" | "clear" {
  const danger = () => p.x < 0 || p.x + p.width > 800 || p.y < 0 || p.y + p.height > 600 || objects.some(o => (o.kind === "hot" || o.kind === "steve") && overlaps(p, o));
  if (danger()) return "dead";
  if (overlaps(p, portal)) return "clear";
  const oldX = p.x;
  const feet = p.y + p.height;
  if (!p.ladder && !p.boosted) {
    p.ladder = objects.find(o => o.kind === "ladder" && p.x + p.width > o.x && p.x < o.x + o.width && feet > o.y + 2 && feet <= o.y + o.height + 8 && p.y < o.y + o.height) ?? null;
  }
  if (p.ladder) {
    p.x = p.ladder.x + (p.ladder.width - p.width) / 2;
    p.y -= 100 * dt;
    p.vy = 0;
    p.grounded = false;
    p.mode = "climbing";
    if (p.y + p.height <= p.ladder.y) {
      p.y = p.ladder.y - p.height;
      p.x = p.direction === 1 ? p.ladder.x + p.ladder.width : p.ladder.x - p.width;
      p.ladder = null;
    }
  } else {
    p.x += p.direction * 115 * dt;
    const pad = objects.find(o => o.kind === "spring" && p.grounded && overlaps(p, o));
    if (pad) { p.y = pad.y - p.height; p.vy = -530; p.boosted = true; p.grounded = false; }
    if (!p.boosted) {
      const wall = objects.find(o => o.kind === "wall" && overlaps(p, o));
      if (wall) {
        p.x = p.direction === 1 ? wall.x - p.width : wall.x + wall.width;
        // If placed inside a wall, resolve toward the previous side before turning.
        if (oldX < wall.x && p.direction === -1) p.x = wall.x - p.width;
        p.direction = p.direction === 1 ? -1 : 1;
      }
    }
    p.vy = Math.min(650, p.vy + 950 * dt);
    p.y += p.vy * dt;
    p.grounded = false;
    const land = objects.filter(o => (o.kind === "floor" || o.kind === "spring") && p.vy >= 0 && p.x + p.width > o.x && p.x < o.x + o.width && feet <= o.y + .5 && p.y + p.height >= o.y).sort((a, b) => a.y - b.y || Number(b.kind === "spring") - Number(a.kind === "spring"))[0];
    if (land) {
      p.y = land.y - p.height;
      p.vy = land.kind === "spring" ? -530 : 0;
      p.boosted = land.kind === "spring";
      p.grounded = land.kind === "floor";
    }
    p.mode = p.grounded ? "walking" : p.vy < 0 ? "jumping" : "falling";
  }
  if (danger()) return "dead";
  return overlaps(p, portal) ? "clear" : "running";
}
