import { clientPointToLocal } from "../core/floatingPosition";
import type { LevelContext } from "../core/types";

// Original image coordinates; this circle covers the red X.
const GOAL = { x: 602, y: 10347, radius: 50 };
const SCROLL_SPEED = 105;

export function attachLevel61Maze(
  { screen, listen }: Pick<LevelContext, "screen" | "listen">,
  fail: () => void,
  finish: () => void,
  isInvincible: () => boolean = () => false,
) {
  const world = screen.querySelector<HTMLElement>(".level-61__maze-world")!;
  const image = world.querySelector<HTMLImageElement>("img")!;
  const goal = world.querySelector<HTMLButtonElement>("button")!;
  let pixels: Uint8ClampedArray | undefined;
  let active = false;
  let disposed = false;
  let loadFailed = false;
  let scroll = 0;
  let frame = 0;
  let lastTime = 0;
  let client: { x: number; y: number } | undefined;
  let previous: { x: number; y: number } | undefined;

  const atGoal = (x: number, y: number) => Math.hypot(x - GOAL.x, y - GOAL.y) <= GOAL.radius;
  const check = () => {
    if (!active || !pixels || !client) return false;
    const local = clientPointToLocal(screen, client.x, client.y);
    if (local.x < 0 || local.y < 0 || local.x >= screen.clientWidth || local.y >= screen.clientHeight) {
      fail();
      return false;
    }
    const scale = screen.clientWidth / image.naturalWidth;
    const point = { x: local.x / scale, y: (local.y + scroll) / scale };
    if (isInvincible()) {
      previous = point;
      return true;
    }
    const from = previous ?? point;
    // Sweep the whole path, including scrolling under a stationary cursor.
    const steps = Math.max(1, Math.ceil(Math.hypot(point.x - from.x, point.y - from.y)));
    for (let i = 0; i <= steps; i++) {
      const x = from.x + (point.x - from.x) * i / steps;
      const y = from.y + (point.y - from.y) * i / steps;
      if (atGoal(x, y)) continue;
      if (x < 0 || y < 0 || x >= image.naturalWidth || y >= image.naturalHeight ||
        pixels[(Math.floor(y) * image.naturalWidth + Math.floor(x)) * 4 + 3] !== 0) {
        fail();
        return false;
      }
    }
    previous = point;
    return true;
  };
  const tick = (time: number) => {
    if (!active || disposed) return;
    if (pixels && client) {
      const scale = screen.clientWidth / image.naturalWidth;
      const maximum = Math.max(0, GOAL.y * scale - screen.clientHeight / 2);
      scroll = Math.min(maximum, scroll + Math.max(0, time - lastTime) / 1000 * SCROLL_SPEED);
      world.style.transform = `translateY(${-scroll}px)`;
      check();
    }
    lastTime = time;
    if (active) frame = requestAnimationFrame(tick);
  };
  void image.decode().then(() => {
    if (disposed) return;
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true })!;
    context.drawImage(image, 0, 0);
    pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    goal.style.left = `${GOAL.x / canvas.width * 100}%`;
    goal.style.top = `${GOAL.y / canvas.height * 100}%`;
    goal.style.width = `${GOAL.radius * 2 / canvas.width * 100}%`;
    world.dataset.ready = "true";
    lastTime = performance.now();
    check();
  }).catch(() => {
    loadFailed = true;
    if (!disposed && active) fail();
  });
  listen(screen, "pointermove", event => {
    client = { x: event.clientX, y: event.clientY };
    check();
  });
  listen(screen, "pointerdown", event => {
    client = { x: event.clientX, y: event.clientY };
    check();
  });
  listen(screen, "pointerleave", () => { client = undefined; if (active) fail(); });
  listen(screen, "pointercancel", () => { if (active) fail(); });
  listen(screen, "contextmenu", event => { if (active) { event.preventDefault(); fail(); } });
  listen(window, "blur", () => { if (active) fail(); });
  const visibilityChanged = () => { if (active && document.hidden) fail(); };
  document.addEventListener("visibilitychange", visibilityChanged);
  listen(goal, "click", event => {
    if (!active || !event.isTrusted || event.detail === 0 || !check() || !previous) return;
    if (atGoal(previous.x, previous.y)) finish();
  });
  return {
    setActive(value: boolean) {
      cancelAnimationFrame(frame);
      active = value;
      previous = undefined;
      if (!active) return;
      if (loadFailed) { fail(); return; }
      scroll = 0;
      world.style.transform = "translateY(0px)";
      lastTime = performance.now();
      check();
      if (active) frame = requestAnimationFrame(tick);
    },
    dispose() {
      disposed = true;
      active = false;
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", visibilityChanged);
      pixels = undefined;
    },
  };
}
