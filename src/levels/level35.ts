import { attachStarMaskedInput } from "../core/StarMaskedInput";
import { createRedGuy, type RedGuyController } from "../core/RedGuy";
import { assetUrl } from "../core/assets";
import type { LevelContext, LevelDefinition } from "../core/types";

const CIPHER = "==NZjDQZ2NQZjZGZvOmAjDJZySGA0tGA";
const PHASE_FOUR_IMAGES = ["level35phase4a.png", "level35phase4b.png", "level35phase4c.png", "level35phase4d.png", "level35phase4e.png"];
const RUNNER_PATHS = [
  [[70, 0], [10, 0], [0, 35], [68, 35], [70, 75], [0, 75]],
  [[0, 75], [0, 0], [35, 38], [70, 0], [70, 75]],
  [[0, 0], [35, 75], [70, 0]],
  [[70, 0], [0, 0], [0, 38], [58, 38], [0, 38], [0, 75], [70, 75]],
  [[0, 75], [0, 0], [35, 38], [70, 0], [70, 75]],
  [[70, 0], [70, 60], [52, 75], [15, 75], [0, 55]],
  [[70, 0], [10, 0], [0, 35], [68, 35], [70, 75], [0, 75]],
  [[0, 0], [0, 58], [18, 75], [52, 75], [70, 58], [70, 0]],
] as const;

export const level35: LevelDefinition = {
  number: 35,
  title: "Reunion II",
  mount(context) {
    const { screen, complete, audio } = context;
    let controller = new AbortController();
    const timers = new Set<number>();
    let redGuy: RedGuyController | undefined;
    let recording: HTMLAudioElement | undefined;

    const clearScene = () => {
      controller.abort();
      controller = new AbortController();
      timers.forEach((timer) => {
        window.clearTimeout(timer);
        window.clearInterval(timer);
      });
      timers.clear();
      redGuy?.destroy();
      redGuy = undefined;
      if (recording) {
        recording.pause();
        recording.removeAttribute("src");
        recording.load();
        recording = undefined;
      }
    };
    const on: LevelContext["listen"] = (target, type, listener, options = {}) => {
      target.addEventListener(type, listener as EventListener, { ...options, signal: controller.signal });
    };
    const later = (callback: () => void, delay: number) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        callback();
      }, delay);
      timers.add(timer);
      return timer;
    };
    const every = (callback: () => void, delay: number) => {
      const timer = window.setInterval(callback, delay);
      timers.add(timer);
      return timer;
    };

    const heading = () => `<header class="level-heading level-35__heading"><div class="level-heading__number">Level 35</div><h1>Reunion II</h1></header>`;
    const shell = (scene: number, content: string, className = "") => {
      clearScene();
      screen.className = `level-screen level-35 level-35--scene-${scene} ${className}`;
      screen.style.setProperty("--level-35-space", `url("${assetUrl("images/spacebg.png")}")`);
      screen.style.setProperty("--level-35-ocean", `url("${assetUrl("images/level35bg1.png")}")`);
      screen.innerHTML = `${heading()}${content}<span class="level-35__counter">${String(scene).padStart(2, "0")} / 10</span>`;
    };
    const formMarkup = (plain = false, initial = "", reset = false, maxLength = 128) => `
      <form class="level-35__form${plain ? " level-35__form--plain" : ""}" autocomplete="off">
        <input class="nelg-password-input" data-allow-select type="text" maxlength="${maxLength}" value="${initial}"
          autocomplete="off" autocapitalize="off" aria-autocomplete="none" aria-label="Password" spellcheck="false" />
        <button class="level-35__go" type="submit">GO</button>
        ${reset ? '<button class="level-35__reset" type="button">Reset</button>' : ""}
      </form>`;

    const softlock = () => {
      clearScene();
      screen.className = "level-screen level-35 level-35--softlock";
      screen.style.setProperty("--level-35-space", `url("${assetUrl("images/spacebg.png")}")`);
      screen.innerHTML = `<div class="level-35__fatal"><strong>FATAL ERROR!</strong><p>YOU HAVE BEEN BANISHED FOR FAILING LEVEL 35...<br />START AGAIN FROM THE BEGINNING.</p></div>`;
    };

    const bindPassword = (answer: string, next: number, options: { plain?: boolean; forbiddenKey?: string } = {}) => {
      const form = screen.querySelector<HTMLFormElement>(".level-35__form");
      const input = form?.querySelector<HTMLInputElement>("input");
      if (!form || !input) return;
      const masked = options.plain ? undefined : attachStarMaskedInput(input, on);
      on(input, "keydown", (event) => {
        if (options.forbiddenKey && event.key.toLowerCase() === options.forbiddenKey) {
          event.preventDefault();
          softlock();
          return;
        }
        if (event.key === "Enter" && !event.repeat) {
          event.preventDefault();
          form.requestSubmit();
        }
      });
      on(form, "submit", (event) => {
        event.preventDefault();
        const value = masked?.getValue() ?? input.value;
        if (value === answer) renderScene(next);
        else softlock();
      });
      input.focus();
    };

    const renderPlatformScene = () => {
      shell(8, `
        <div class="level-35__platform" style="left:0;top:558px;width:150px"></div>
        <div class="level-35__platform level-35__platform--drag" data-allow-drag style="left:202px;top:558px;width:150px"></div>
        <div class="level-35__platform" style="left:420px;top:558px;width:175px"></div>
        <div class="level-35__portal" style="left:704px;top:500px"><i></i><i></i><i></i></div>
        <div class="level-35__fallers"><i style="left:205px"></i><i style="left:430px"></i><i style="left:645px"></i></div>
      `, "level-35--space");
      const platforms: Array<{ x: number; y: number; width: number; height: number; draggable?: boolean }> = [
        { x: 0, y: 558, width: 150, height: 28 }, { x: 202, y: 558, width: 150, height: 28, draggable: true }, { x: 420, y: 558, width: 175, height: 28 },
      ];
      const walls = [
        { x: -28, y: -130, width: 28, height: 730 },
        { x: 135, y: -95, width: 28, height: 420 },
        { x: 650, y: 105, width: 28, height: 495 },
        { x: 800, y: -130, width: 28, height: 730 },
      ];
      screen.insertAdjacentHTML("beforeend", `<div class="level-35__walls" aria-hidden="true">${walls.map((wall) => `<i style="left:${wall.x}px;top:${wall.y}px;width:${wall.width}px;height:${wall.height}px"></i>`).join("")}</div>`);
      const drag = screen.querySelector<HTMLElement>(".level-35__platform--drag");
      if (drag) {
        let pointer: number | undefined; let px = 0; let py = 0; let sx = 0; let sy = 0;
        on(drag, "pointerdown", (event) => { pointer = event.pointerId; px = event.clientX; py = event.clientY; sx = platforms[1]!.x; sy = platforms[1]!.y; drag.setPointerCapture(pointer); event.preventDefault(); });
        on(drag, "pointermove", (event) => {
          if (pointer !== event.pointerId) return;
          const bounds = screen.getBoundingClientRect();
          const nextY = Math.max(150, Math.min(558, sy + (event.clientY - py) * 600 / bounds.height));
          const snapshot = redGuy?.getSnapshot();
          const standing = Boolean(snapshot?.grounded && Math.abs(snapshot.y + 72 - platforms[1]!.y) <= 3 && snapshot.x + 38 > platforms[1]!.x && snapshot.x < platforms[1]!.x + 150);
          const verticalChange = nextY - platforms[1]!.y;
          platforms[1]!.x = Math.max(0, Math.min(650, sx + (event.clientX - px) * 800 / bounds.width));
          platforms[1]!.y = nextY;
          drag.style.left = `${platforms[1]!.x}px`; drag.style.top = `${platforms[1]!.y}px`; event.preventDefault();
          if (standing && verticalChange < 0) redGuy?.carryUp(verticalChange);
        });
        on(drag, "pointerup", (event) => { if (pointer === event.pointerId) pointer = undefined; });
      }
      redGuy = createRedGuy(context, {
        parent: screen, x: 38, y: 486, bodyWidth: 38, bodyHeight: 72, platforms: () => platforms,
        oneWayPlatforms: true, solidObstacles: walls, bounds: { x: -28, y: -130, width: 856, height: 890 },
        controls: { up: ["8", "Digit8", "Numpad8"], left: ["ControlRight"], right: ["ShiftLeft"], down: ["f", "F", "KeyF"] },
      });
      const fallers = [...screen.querySelectorAll<HTMLElement>(".level-35__fallers i")];
      const falling = [{ x: 205, y: -50, speed: 180 }, { x: 430, y: -260, speed: 238 }, { x: 645, y: -420, speed: 202 }];
      let last = performance.now(); let done = false;
      every(() => {
        if (!redGuy || done) return;
        const now = performance.now(); const dt = Math.min((now - last) / 1000, .04); last = now;
        falling.forEach((block, index) => { block.y += block.speed * dt; if (block.y > 610) block.y = -100 - index * 130; fallers[index]!.style.top = `${block.y}px`; });
        const player = redGuy.getSnapshot();
        const overlaps = (x: number, y: number, w: number, h: number) => player.x < x + w && player.x + 38 > x && player.y < y + h && player.y + 72 > y;
        if (player.y > 610 || falling.some((block) => overlaps(block.x, block.y, 38, 38))) { done = true; softlock(); return; }
        if (overlaps(704, 500, 58, 58)) { done = true; renderScene(9); }
      }, 16);
    };

    const renderScene = (scene: number): void => {
      switch (scene) {
        case 1:
          shell(1, formMarkup(), "level-35--space");
          bindPassword("blue", 2);
          break;
        case 2:
          shell(2, `<pre class="level-35__code">const cipher = encrypt("hide", secretKey);\nconst fruit = "apple";\nconst herb = "mint";\nconst secretKey = fruit + herb;\nfunction validate(raw) {\n  return raw === mask(cipher);\n}</pre>${formMarkup(true)}`);
          bindPassword("****", 3, { plain: true });
          break;
        case 3:
          shell(3, formMarkup(false, "", false, 1), "level-35--ocean");
          bindPassword("c", 4, { forbiddenKey: "c" });
          break;
        case 4: {
          shell(4, `<img class="level-35__phase-four" hidden alt="" />${formMarkup()}`, "level-35--near-black");
          const image = screen.querySelector<HTMLImageElement>(".level-35__phase-four")!;
          const form = screen.querySelector<HTMLFormElement>(".level-35__form")!;
          form.hidden = true; let phase = 0;
          on(screen, "click", (event) => {
            if ((event.target as Element).closest("form")) return;
            phase = (phase + 1) % (PHASE_FOUR_IMAGES.length + 2);
            image.hidden = true;
            form.hidden = true;
            if (phase > 0 && phase <= PHASE_FOUR_IMAGES.length) {
              image.src = assetUrl(`images/${PHASE_FOUR_IMAGES[phase - 1]}`);
              image.hidden = false;
            } else if (phase === PHASE_FOUR_IMAGES.length + 1) {
              form.hidden = false;
              form.querySelector<HTMLInputElement>("input")?.focus();
            }
          });
          bindPassword("AXIOM", 5);
          break;
        }
        case 5: {
          shell(5, `<p class="level-35__nine">NINE</p><output class="level-35__display">0</output>`, "level-35--math");
          let value = 0; let presses = 0;
          on(document, "keydown", (event) => {
            if (event.repeat || !["9", "+", "-", "*", "/"].includes(event.key)) return;
            event.preventDefault(); presses += 1; if (presses > 6) { softlock(); return; }
            if (event.key === "9") value = Number(`${value}9`);
            if (event.key === "+") value += 9; if (event.key === "-") value -= 9;
            if (event.key === "*") value *= 9; if (event.key === "/") value = Math.trunc(value / 9);
            screen.querySelector(".level-35__display")!.textContent = String(value);
            if (value === 35) renderScene(6);
          });
          break;
        }
        case 6: {
          const letters = ["S", "M", "V", "E", "M", "J", "S", "U"];
          const buttons = letters.map((letter, index) => `<button class="level-35__runner" data-runner="${index}" style="left:${50 + index % 4 * 185}px;top:${230 + Math.floor(index / 4) * 145}px" aria-label="Evasive button ${letter}"></button>`).join("");
          shell(6, `<div class="level-35__runners">${buttons}</div>${formMarkup(false, "", false, 1)}`, "level-35--space");
          screen.querySelectorAll<HTMLElement>(".level-35__runner").forEach((button, index) => {
            let step = 0;
            on(button, "pointerenter", () => { step = (step + 1) % RUNNER_PATHS[index]!.length; const point = RUNNER_PATHS[index]![step]!; button.style.translate = `${point[0]}px ${point[1]}px`; });
          });
          bindPassword("N", 7);
          break;
        }
        case 7: {
          shell(7, `<p class="level-35__remember">DO YOU STILL REMEMBER?</p>${formMarkup(true, CIPHER, true)}`, "level-35--yellow");
          const input = screen.querySelector<HTMLInputElement>(".level-35__form input")!;
          on(screen.querySelector<HTMLButtonElement>(".level-35__reset")!, "click", () => { input.value = CIPHER; input.focus(); });
          bindPassword("creamsoda59", 8, { plain: true });
          break;
        }
        case 8:
          renderPlatformScene();
          break;
        case 9: {
          shell(9, `<p class="level-35__audio-warning">WARNING!!! EAR-SHATTERING NOISE AWAITS YOU!!!</p>${formMarkup()}<div class="level-34__audio-controls level-35__audio-controls"><button class="level-34__audio-button level-34__audio-button--play" data-audio="play"><span></span></button><button class="level-34__audio-button level-34__audio-button--pause" data-audio="pause"><span></span></button><button class="level-34__audio-button level-34__audio-button--stop" data-audio="stop"><span></span></button></div>`, "level-35--space");
          recording = new Audio(assetUrl("music/level35phase9.wav")); recording.volume = audio.musicVolume / 100;
          const warning = screen.querySelector<HTMLElement>(".level-35__audio-warning")!;
          later(() => { warning.textContent = "CAN YOU DRAW A PICTURE WITH AN AUDIO FILE?"; }, 60_000);
          screen.querySelectorAll<HTMLButtonElement>("[data-audio]").forEach((button) => on(button, "click", () => {
            if (!recording) return;
            if (button.dataset.audio === "play") void recording.play();
            if (button.dataset.audio === "pause") recording.pause();
            if (button.dataset.audio === "stop") { recording.pause(); recording.currentTime = 0; }
          }));
          bindPassword("scarecrow", 10);
          break;
        }
        case 10:
          shell(10, `<p class="level-35__final-clue">If you were quick to notice, you may find three level techniques that never returned in this Reunion. Think carefully. Add all of their level numbers to obtain the password.</p><img class="level-35__final-image" src="${assetUrl("images/level35phase10.png")}" alt="A hidden final clue" />${formMarkup()}`);
          bindPassword("77", 11);
          break;
        case 11:
          complete();
          break;
      }
    };

    renderScene(1);
    return clearScene;
  },
};
