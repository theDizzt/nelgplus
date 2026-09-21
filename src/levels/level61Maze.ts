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
  const images = [...world.querySelectorAll<HTMLImageElement>("img")];
  const image = images[0]!;
  const goal = world.querySelector<HTMLButtonElement>("button")!;
  let maps: { pixels: Uint8ClampedArray; width: number; height: number; start: number; end: number; ratio: number }[] = [];
  let totalHeight = 0;
  let canLeaveMazeScreen = false;
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
    if (!active || !maps.length || !client) return false;
    const local = clientPointToLocal(screen, client.x, client.y);
    if (local.x < 0 || local.y < 0 || local.x >= screen.clientWidth || local.y >= screen.clientHeight) {
      if (canLeaveMazeScreen) {
        previous = undefined;
        return true;
      }
      fail();
      return false;
    }
    const scale = screen.clientWidth / image.naturalWidth;
    const point = { x: local.x / scale, y: (local.y + scroll) / scale };
    goal.classList.toggle("is-hovered", atGoal(point.x, point.y));
    if (isInvincible()) {
      if (atGoal(point.x, point.y)) canLeaveMazeScreen = true;
      previous = point;
      return true;
    }
    const from = previous ?? point;
    // Sweep the whole path, including scrolling under a stationary cursor.
    const steps = Math.max(1, Math.ceil(Math.hypot(point.x - from.x, point.y - from.y)));
    for (let i = 0; i <= steps; i++) {
      const x = from.x + (point.x - from.x) * i / steps;
      const y = from.y + (point.y - from.y) * i / steps;
      if (atGoal(x, y)) { canLeaveMazeScreen = true; continue; }
      const map = maps.find(map => y >= map.start && y < map.end);
      if (!map || x < 0 || x >= image.naturalWidth ||
        map.pixels[(Math.floor((y - map.start) * map.ratio) * map.width + Math.floor(x * map.ratio)) * 4 + 3] !== 0) {
        fail();
        return false;
      }
    }
    previous = point;
    return true;
  };
  const tick = (time: number) => {
    if (!active || disposed) return;
    let ended = false;
    if (maps.length) {
      const scale = screen.clientWidth / image.naturalWidth;
      const maximum = Math.max(0, totalHeight * scale - screen.clientHeight);
      scroll = Math.min(maximum, scroll + Math.max(0, time - lastTime) / 1000 * SCROLL_SPEED);
      world.style.transform = `translateY(${-scroll}px)`;
      screen.dataset.mazePart = scroll + screen.clientHeight > image.naturalHeight * scale ? "2" : "1";
      ended = scroll >= maximum;
      if (client) check();
    }
    lastTime = time;
    if (active && !ended) frame = requestAnimationFrame(tick);
  };
  void Promise.all(images.map(image => image.decode())).then(() => {
    if (disposed) return;
    maps = images.map(part => {
      const canvas = document.createElement("canvas");
      canvas.width = part.naturalWidth;
      canvas.height = part.naturalHeight;
      const context = canvas.getContext("2d", { willReadFrequently: true })!;
      context.drawImage(part, 0, 0);
      const ratio = part.naturalWidth / image.naturalWidth;
      const start = totalHeight;
      totalHeight += part.naturalHeight / ratio;
      return { pixels: context.getImageData(0, 0, canvas.width, canvas.height).data,
        width: canvas.width, height: canvas.height, start, end: totalHeight, ratio };
    });
    goal.style.left = `${GOAL.x / image.naturalWidth * 100}%`;
    goal.style.top = `${GOAL.y / totalHeight * 100}%`;
    goal.style.width = `${GOAL.radius * 2 / image.naturalWidth * 100}%`;
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
  listen(screen, "pointerleave", () => {
    client = undefined;
    previous = undefined;
    goal.classList.remove("is-hovered");
    if (active && !canLeaveMazeScreen) fail();
  });
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
      canLeaveMazeScreen = false;
      goal.classList.remove("is-hovered");
      screen.dataset.mazePart = "1";
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
      maps = [];
      delete screen.dataset.mazePart;
    },
  };
}
