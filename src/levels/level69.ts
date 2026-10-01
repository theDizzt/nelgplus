import { assetUrl } from "../core/assets";
import { blockTabNavigation } from "../core/blockTabNavigation";
import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelContext, LevelDefinition } from "../core/types";
import { FISH, FISH_SECTION_TITLES, INTRODUCTION } from "./level69Fish";

const SCENE_NAMES = ["Main", "Encyclopedia", ...FISH.map(fish => fish.name), "?", "!"];
// Sort the English entry names, not the image filenames or scientific names.
export const FISH_ALPHABETICAL_ORDER = FISH.map((_, index) => index)
  .sort((a, b) => FISH[a]!.name.toLowerCase().localeCompare(FISH[b]!.name.toLowerCase(), "en"));

const escape = (text: string) => text.replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]!);

interface FishMask { width: number; height: number; data: Uint8ClampedArray }

// Scattered home positions keep the fish distributed while they wander independently.
// The order remains a..o; only the visual layout is shuffled.
const FISH_LAYOUT = [
  [260, 16, 128, 62, -16], [28, 0, 115, 110, 12], [573, 24, 127, 90, -12],
  [430, 175, 110, 100, 15], [165, 89, 120, 120, -8], [630, 188, 102, 132, 8],
  [17, 152, 151, 75, 12], [390, 55, 112, 109, -13], [196, 267, 146, 67, -8],
  [300, 151, 99, 104, 16], [22, 282, 163, 74, -4], [477, 280, 149, 63, 10],
  [492, 91, 120, 98, -9], [328, 264, 125, 92, 5], [604, 124, 116, 58, -14],
] as const;
// Direction the original artwork faces (+1 right, -1 left).
const FISH_FACING = [1, 1, -1, -1, -1, -1, -1, -1, -1, -1, 1, -1, -1, 1, -1];

/** Undo the current rotation/reflection and game scale, then remove the letterbox. */
function hitsFish(image: HTMLImageElement, mask: FishMask | undefined, x: number, y: number): boolean {
  if (!mask) return false; // Never make the transparent rectangle clickable while loading.
  const bounds = image.getBoundingClientRect();
  const parent = image.parentElement!;
  const gameScale = parent.getBoundingClientRect().width / parent.offsetWidth;
  const dx = (x - bounds.left - bounds.width / 2) / gameScale;
  const dy = (y - bounds.top - bounds.height / 2) / gameScale;
  const point = new DOMMatrix(getComputedStyle(image).transform).inverse().transformPoint(new DOMPoint(dx, dy));
  const localX = point.x + image.offsetWidth / 2;
  const localY = point.y + image.offsetHeight / 2;
  const scale = Math.min(image.offsetWidth / mask.width, image.offsetHeight / mask.height);
  if (scale <= 0) return false;
  const px = Math.floor((localX - (image.offsetWidth - mask.width * scale) / 2) / scale);
  const py = Math.floor((localY - (image.offsetHeight - mask.height * scale) / 2) / scale);
  return px >= 0 && py >= 0 && px < mask.width && py < mask.height
    && mask.data[(py * mask.width + px) * 4 + 3]! > 0;
}

export const level69: LevelDefinition = {
  number: 69,
  title: "Encyclopedia",
  scenes: SCENE_NAMES.map((name, index) => ({ id: String(index + 1), label: `Scene ${index + 1} - ${name}` })),
  mount({ screen, initialScene, listen, timeout, audio, goToWarpZone }) {
    blockTabNavigation(listen); // One level-lifetime listener covers all 19 scenes, including the input.
    let scene = 1;
    let hovers = 0;
    let sequence = 0;
    let leaving = false;
    let disposed = false;
    let swimFrame = 0;
    // Keep positions when an entry opens, then resume from there on BACK.
    const swimmers = FISH_LAYOUT.map(([x, y]) => ({
      x: Number(x), y: Number(y), fromX: Number(x), fromY: Number(y), toX: Number(x), toY: Number(y),
      elapsed: 0, duration: 0, direction: 1, phase: Math.random() * Math.PI * 2,
    }));
    let sceneEvents = new AbortController();
    const sceneListen: LevelContext["listen"] = (target, type, callback, options) => {
      target.addEventListener(type, callback as EventListener, { ...options, signal: sceneEvents.signal });
    };
    const masks = new Map<number, FishMask>();
    const maskLoads = new Map<number, Promise<void>>();
    const loadMask = (index: number, image: HTMLImageElement) => {
      if (maskLoads.has(index)) return;
      const task = image.decode().then(() => {
        if (disposed) return;
        const canvas = document.createElement("canvas");
        // Keep native alpha so thin fins and low-opacity edges remain clickable.
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) return;
        context.drawImage(image, 0, 0);
        masks.set(index, { width: canvas.width, height: canvas.height,
          data: context.getImageData(0, 0, canvas.width, canvas.height).data });
      }).catch(() => { maskLoads.delete(index); });
      maskLoads.set(index, task);
    };

    // These nodes are created ONCE. Only the foreground changes when a scene changes;
    // gradient phase, bubble trajectories and music playback therefore remain continuous.
    screen.className = "level-screen level-69";
    screen.innerHTML = `
      <div class="level-69__water" aria-hidden="true"><div class="level-69__rainbow"></div>
        <div class="level-69__bubbles">${Array.from({ length: 46 }, (_, i) => {
          const size = 6 + (i * 13 % 34);
          return `<i style="--x:${(i * 37 % 101)}%;--size:${size}px;--duration:${9 + i * 7 % 16}s;--delay:-${i * 1.71}s;--sway:${(i % 2 ? 1 : -1) * (12 + i % 25)}px"></i>`;
        }).join("")}</div>
      </div>
      <header class="level-heading"><div class="level-heading__number">Level 69</div><h1>Encyclopedia</h1></header>
      <div class="level-69__scene"></div>`;
    const content = screen.querySelector<HTMLElement>(".level-69__scene")!;
    void audio.playMusic("music/level69.mp3");

    const startSwimming = (indexElement: HTMLElement, images: HTMLImageElement[]) => {
      let previousTime = performance.now();
      const tick = (time: number) => {
        if (disposed || scene !== 2) return;
        // Clamp background-tab gaps so returning to the game never teleports a fish.
        const dt = Math.min((time - previousTime) / 1000, 0.05);
        previousTime = time;
        images.forEach((image, i) => {
          const fish = swimmers[i]!;
          const [homeX, homeY, width, height, tilt] = FISH_LAYOUT[i]!;
          // Room for the largest rotation keeps fins clear of the title and BACK.
          const marginX = height * 0.19 + 4;
          const marginY = width * 0.19 + 4;
          const clampX = (x: number) => Math.max(marginX, Math.min(indexElement.clientWidth - width - marginX, x));
          const clampY = (y: number) => Math.max(marginY, Math.min(indexElement.clientHeight - height - marginY, y));
          if (fish.elapsed >= fish.duration) {
            fish.x = clampX(fish.x); fish.y = clampY(fish.y);
            fish.fromX = fish.x; fish.fromY = fish.y;
            fish.toX = clampX(homeX + (Math.random() - 0.5) * 130);
            fish.toY = clampY(homeY + (Math.random() - 0.5) * 86);
            fish.duration = 3 + Math.random() * 4;
            fish.elapsed = 0;
            if (Math.abs(fish.toX - fish.x) > 1) fish.direction = Math.sign(fish.toX - fish.x);
          }
          fish.elapsed = Math.min(fish.elapsed + dt, fish.duration);
          const t = fish.elapsed / fish.duration;
          const ease = (1 - Math.cos(t * Math.PI)) / 2;
          fish.x = fish.fromX + (fish.toX - fish.fromX) * ease;
          fish.y = fish.fromY + (fish.toY - fish.fromY) * ease;
          fish.phase += dt * 2;
          image.parentElement!.style.transform = `translate(${fish.x - homeX}px, ${fish.y - homeY}px)`;
          image.style.transform = `rotate(${tilt + Math.sin(fish.phase) * 3}deg) scaleX(${fish.direction * FISH_FACING[i]!})`;
        });
        swimFrame = requestAnimationFrame(tick);
      };
      tick(previousTime);
    };

    const back = (target: number) => {
      const button = content.querySelector<HTMLButtonElement>("[data-back]");
      if (button) sceneListen(button, "click", () => show(target));
    };
    const show = (next: number) => {
      cancelAnimationFrame(swimFrame);
      sceneEvents.abort();
      sceneEvents = new AbortController();
      scene = next;
      screen.dataset.scene = String(scene);
      screen.setAttribute("aria-label", `Level 69: Encyclopedia, ${SCENE_NAMES[scene - 1]}`);

      if (scene === 1) {
        sequence = 0;
        content.innerHTML = `<div class="level-69__intro"><p class="level-69__welcome">Welcome to the NELG Fish Encyclopedia!</p>
          <p>${INTRODUCTION}</p></div><button type="button" class="level-69__text-button level-69__start" data-start>START</button>`;
        const start = content.querySelector<HTMLButtonElement>("[data-start]")!;
        sceneListen(start, "pointerenter", event => {
          if (event.pointerType !== "touch") hovers++;
        });
        sceneListen(start, "click", () => show(hovers >= 69 ? 19 : 2));
      } else if (scene === 2) {
        content.innerHTML = `<div class="level-69__index">${FISH.map((fish, index) => {
          const [x, y, width, height, tilt] = FISH_LAYOUT[index]!;
          return `<figure style="left:${x}px;top:${y}px;width:${width}px;height:${height}px">
            <img src="${assetUrl(`images/${fish.image}`)}" data-fish="${index}" data-tilt="${tilt}"
              style="transform:rotate(${tilt}deg)" alt="${escape(fish.name)}" draggable="false"></figure>`;
        }).join("")}</div>
          <button type="button" class="level-69__text-button level-69__back" data-back>BACK</button>`;
        const indexElement = content.querySelector<HTMLElement>(".level-69__index")!;
        const images = [...indexElement.querySelectorAll<HTMLImageElement>("[data-fish]")];
        images.forEach(image => {
          const index = Number(image.dataset.fish);
          loadMask(index, image);
        });
        // Resolve front-to-back by alpha: a transparent part of a passing fish must
        // not block another fish's body underneath it.
        const fishAt = (x: number, y: number) => [...images].reverse().find(image =>
          hitsFish(image, masks.get(Number(image.dataset.fish)), x, y));
        sceneListen(indexElement, "pointermove", event => {
          indexElement.style.cursor = fishAt(event.clientX, event.clientY) ? "pointer" : "default";
        });
        sceneListen(indexElement, "click", event => {
            const image = fishAt(event.clientX, event.clientY);
            if (!image) return;
            const index = Number(image.dataset.fish);
            sequence = index === FISH_ALPHABETICAL_ORDER[sequence] ? sequence + 1
              : index === FISH_ALPHABETICAL_ORDER[0] ? 1 : 0;
            show(sequence === FISH.length ? 18 : index + 3);
        });
        startSwimming(indexElement, images);
        back(1);
      } else if (scene >= 3 && scene <= 17) {
        const fish = FISH[scene - 3]!;
        content.innerHTML = `<h2 class="level-69__fish-name">${escape(fish.name)}</h2>
          <img class="level-69__portrait" src="${assetUrl(`images/${fish.image}`)}" alt="${escape(fish.name)}" draggable="false">
          <article class="level-69__article" aria-label="${escape(fish.name)} facts" tabindex="-1">
            ${fish.sections.map((text, index) => `<section><h3>${FISH_SECTION_TITLES[index]}</h3><p>${escape(text)}</p></section>`).join("")}
            <p class="level-69__note">Typical sizes vary by population. Reported maxima are not averages; a species-wide mean lifespan is often unavailable.</p>
            <p class="level-69__sources">Sources: ${fish.sources.map(source => `<a href="${source}" target="_blank" rel="noopener noreferrer">${source.includes("noaa") ? "NOAA Fisheries" : "FishBase"}</a>`).join(" · ")}</p>
          </article><button type="button" class="level-69__text-button level-69__back" data-back>BACK</button>`;
        back(2); // Do not reset the alphabetical sequence when returning from an entry.
      } else if (scene === 18) {
        content.innerHTML = `<div class="level-69__revelation"><h2>?</h2>
          <p>This is nothing but a deception.<br>This place was a trap designed to imprison you from the very beginning.<br>The hidden space is on the very first screen.</p></div>
          <button type="button" class="level-69__text-button level-69__back" data-back>BACK</button>`;
        back(1);
      } else {
        content.innerHTML = `<h2 class="level-69__secret-title">!</h2>
          <form class="level-08__form level-69__form" autocomplete="off">
            <input class="nelg-password-input" name="nelg-level-sixty-nine-answer" data-allow-select
              data-form-type="other" data-lpignore="true" data-1p-ignore="true" type="text"
              autocomplete="off" autocapitalize="off" aria-autocomplete="none" aria-label="Password" spellcheck="false">
            <svg class="level-69__go" width="52" height="40" viewBox="0 0 52 40" role="button" aria-label="Submit password by clicking the orange border">
              <rect data-go x="1.5" y="1.5" width="49" height="37" fill="none" stroke="#ff9900" stroke-width="3" />
            </svg>
          </form>`;
        const form = content.querySelector<HTMLFormElement>("form")!;
        const input = form.querySelector<HTMLInputElement>("input")!;
        const masked = attachStarMaskedInput(input, sceneListen);
        // Enter and implicit form submission must not bypass the border-only puzzle.
        sceneListen(form, "submit", event => event.preventDefault());
        sceneListen(input, "keydown", event => { if (event.key === "Enter") event.preventDefault(); });
        sceneListen(form, "click", event => {
          if (!(event.target instanceof Element) || !event.target.matches("[data-go]") || leaving) return;
          if (masked.getValue() === "salmon") {
            leaving = true;
            goToWarpZone(17);
          } else {
            input.classList.add("is-wrong");
            timeout(() => input.classList.remove("is-wrong"), 360);
            input.focus();
          }
        });
        input.focus();
      }
    };
    const requestedScene = Number(initialScene);
    show(Number.isInteger(requestedScene) && requestedScene >= 1 && requestedScene <= 19 ? requestedScene : 1);
    return () => {
      disposed = true;
      cancelAnimationFrame(swimFrame);
      sceneEvents.abort();
      masks.clear();
      maskLoads.clear();
      audio.stopMusic();
    };
  },
};
