import { attachStarMaskedInput } from "../core/StarMaskedInput";
import { assetUrl, SOUND_EFFECTS } from "../core/assets";
import type { LevelContext, LevelDefinition } from "../core/types";
import { localElementBounds, positionFloatingElement } from "../core/floatingPosition";

const SCENE_TWO_OBJECTS = [
  { letter: "h", size: 44, left: 88, top: 294, kind: "gear" },
  { letter: "i", size: 58, left: 222, top: 365, kind: "diamond" },
  { letter: "d", size: 72, left: 346, top: 276, kind: "burst" },
  { letter: "d", size: 88, left: 483, top: 377, kind: "ring" },
  { letter: "e", size: 104, left: 610, top: 256, kind: "blob" },
  { letter: "n", size: 122, left: 83, top: 423, kind: "square" },
] as const;

const SCENE_EIGHT_BUTTONS = [
  { order: 6, left: 77, top: 338 },
  { order: 1, left: 282, top: 285 },
  { order: 7, left: 511, top: 357 },
  { order: 3, left: 666, top: 292 },
  { order: 8, left: 178, top: 479 },
  { order: 4, left: 378, top: 426 },
  { order: 2, left: 580, top: 492 },
  { order: 5, left: 706, top: 437 },
] as const;

const SCENE_FIVE_BUTTONS = [
  { left: 108, top: 285, size: 54 },
  { left: 270, top: 390, size: 68 },
  { left: 404, top: 270, size: 82 },
  { left: 570, top: 402, size: 58 },
  { left: 684, top: 298, size: 72 },
] as const;

const LEVEL_WIDTH = 800;
const LEVEL_HEIGHT = 600;
const VIRTUAL_SCENE_SEVEN_HEIGHT = 800;

const REVIVAL_SCENE_FOUR_ORBS = [
  { left: 78, top: 252 }, { left: 174, top: 340 }, { left: 282, top: 240 },
  { left: 386, top: 382 }, { left: 494, top: 270 }, { left: 620, top: 356 },
  { left: 706, top: 238 }, { left: 112, top: 470 }, { left: 332, top: 490 },
  { left: 554, top: 468 }, { left: 690, top: 466 },
] as const;

const REVIVAL_SCENE_FIVE_BUTTONS = [
  { left: 265, top: 252 }, { left: 265, top: 316 }, { left: 265, top: 380 },
  { left: 265, top: 444 }, { left: 329, top: 444 }, { left: 393, top: 444 }, { left: 457, top: 444 },
] as const;

const REVIVAL_SCENE_EIGHT_BUTTONS = [
  { value: 62135, left: 35, top: 335 },
  { value: -80, left: 220, top: 275 },
  { value: 684, left: 385, top: 322 },
  { value: 42, left: 565, top: 278 },
  { value: 100000, left: 690, top: 365 },
  { value: 1.618, left: 115, top: 440 },
  { value: 4559, left: 280, top: 420 },
  { value: 0, left: 470, top: 440 },
  { value: 656, left: 620, top: 480 },
  { value: 39, left: 22, top: 510 },
  { value: 1000, left: 360, top: 510 },
  { value: 491, left: 710, top: 510 },
] as const;

const REVIVAL_SCENE_EIGHT_ORDER = [...REVIVAL_SCENE_EIGHT_BUTTONS]
  .map(({ value }) => value)
  .sort((a, b) => a - b);

const REVIVAL_SCENE_TEN_RESUME_FLAG = "level50-enhanced-level20-scene10";

function getPolarCoordinates(x: number, y: number): { radius: number; theta: number } {
  const dx = x - LEVEL_WIDTH / 2;
  const dy = y - LEVEL_HEIGHT / 2;
  return {
    radius: Math.round(Math.hypot(dx, dy)),
    theta: Math.round((Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360),
  };
}

function passwordForm(id: string): string {
  return `
    <form class="level-20__password-form" autocomplete="off">
      <input class="nelg-password-input" id="${id}" data-allow-select type="text" maxlength="32"
        autocomplete="off" autocapitalize="off" aria-autocomplete="none" aria-label="Password" spellcheck="false" />
      <button type="submit">GO</button>
    </form>
  `;
}

export const level20: LevelDefinition = {
  number: 20,
  title: "Reunion I",
  scenes: Array.from({ length: 10 }, (_, index) => ({ id: String(index + 1), label: `Scene ${index + 1}` })),
  mount(context) {
    const { screen, complete, wrongAnswer, unlockAchievement, audio, initialScene, session, goToLevel, goToMenu } = context;
    const revival = session.hasFlag("level50-enhanced-run");
    let sceneController = new AbortController();
    const sceneTimers = new Set<number>();

    const clearScene = () => {
      sceneController.abort();
      sceneController = new AbortController();
      sceneTimers.forEach((timer) => {
        window.clearTimeout(timer);
        window.clearInterval(timer);
      });
      sceneTimers.clear();
    };

    const on: LevelContext["listen"] = (target, type, listener, options = {}) => {
      target.addEventListener(type, listener as EventListener, {
        ...options,
        signal: sceneController.signal,
      });
    };

    const sceneTimeout = (callback: () => void, delay: number) => {
      const timer = window.setTimeout(() => {
        sceneTimers.delete(timer);
        callback();
      }, delay);
      sceneTimers.add(timer);
      return timer;
    };

    const renderShell = (scene: number, color: string, content: string, background: "black" | "blue" | "white" | "radial") => {
      clearScene();
      screen.className = `level-screen level-20 level-20--scene-${scene} level-20--background-${background}${revival ? " level-20--revival" : ""}`;
      screen.style.setProperty("--level-20-heading-color", color);
      screen.innerHTML = `
        <header class="level-heading level-20__heading">
          <div class="level-heading__number">Level 20</div>
          <h1>Reunion I</h1>
        </header>
        ${content}
        <span class="level-20__scene-number" aria-hidden="true">${String(scene).padStart(2, "0")} / 10</span>
      `;
    };

    const bindPassword = (
      answers: string | readonly string[],
      nextScene: number,
      achievementAnswers: Readonly<Record<string, number>> = {},
      canSubmit: () => boolean = () => true,
    ) => {
      const form = screen.querySelector<HTMLFormElement>(".level-20__password-form");
      const input = screen.querySelector<HTMLInputElement>(".level-20__password-form input");
      const button = screen.querySelector<HTMLButtonElement>(".level-20__password-form button");
      if (!form || !input || !button) return;

      const acceptedAnswers = new Set(typeof answers === "string" ? [answers] : answers);
      const maskedInput = attachStarMaskedInput(input, on);
      on(input, "keydown", (event) => {
        if (event.key !== "Enter" || event.repeat) return;
        event.preventDefault();
        form.requestSubmit();
      });
      on(form, "submit", (event) => {
        event.preventDefault();
        const answer = maskedInput.getValue();
        const achievementId = achievementAnswers[answer];
        if (achievementId) unlockAchievement(achievementId);
        if (acceptedAnswers.has(answer) && canSubmit()) {
          renderScene(nextScene);
          return;
        }
        if (revival) {
          renderScene(Math.max(1, nextScene - 2));
          return;
        }
        if (wrongAnswer()) return;
        maskedInput.clear();
        input.classList.remove("is-wrong");
        void input.offsetWidth;
        input.classList.add("is-wrong");
        input.focus();
        sceneTimeout(() => input.classList.remove("is-wrong"), 360);
      });
      input.focus();
    };

    const failRevivalScene = (scene: number) => {
      if (!revival) return false;
      if (scene <= 1) goToLevel(19);
      else renderScene(scene - 1);
      return true;
    };

    const makeObjectsDraggable = () => {
      screen.querySelectorAll<HTMLElement>("[data-level-20-draggable]").forEach((object) => {
        let pointerId: number | undefined;
        let startPointerX = 0;
        let startPointerY = 0;
        let startLeft = 0;
        let startTop = 0;
        on(object, "pointerdown", (event) => {
          const screenBounds = screen.getBoundingClientRect();
          const scaleX = screen.clientWidth / screenBounds.width;
          const scaleY = screen.clientHeight / screenBounds.height;
          pointerId = event.pointerId;
          startPointerX = (event.clientX - screenBounds.left) * scaleX;
          startPointerY = (event.clientY - screenBounds.top) * scaleY;
          startLeft = object.offsetLeft;
          startTop = object.offsetTop;
          object.setPointerCapture(event.pointerId);
          object.classList.add("is-dragging");
          event.preventDefault();
        });
        on(object, "pointermove", (event) => {
          if (pointerId !== event.pointerId) return;
          const screenBounds = screen.getBoundingClientRect();
          const scaleX = screen.clientWidth / screenBounds.width;
          const scaleY = screen.clientHeight / screenBounds.height;
          const pointerX = (event.clientX - screenBounds.left) * scaleX;
          const pointerY = (event.clientY - screenBounds.top) * scaleY;
          object.style.left = `${startLeft + pointerX - startPointerX}px`;
          object.style.top = `${startTop + pointerY - startPointerY}px`;
          event.preventDefault();
        });
        const finishDrag = (event: PointerEvent) => {
          if (pointerId !== event.pointerId) return;
          if (object.hasPointerCapture(event.pointerId)) object.releasePointerCapture(event.pointerId);
          object.classList.remove("is-dragging");
          pointerId = undefined;
        };
        on(object, "pointerup", finishDrag);
        on(object, "pointercancel", finishDrag);
      });
    };

    const renderScene = (scene: number): void => {
      switch (scene) {
        case 1: {
          renderShell(
            1,
            revival ? "#ffff00" : "#fff",
            `
              <p class="level-20__intro">
                Welcome to the NELG++ remix level! This level combines puzzles you have encountered so far.<br />
                Recall your past experiences and solve this long chain of puzzles to reach Level 21.<br />
                Reunion levels normally roll you back one scene for a wrong answer, but your first Reunion gives
                you a special break with no such penalty. Good luck.
              </p>
              <div class="level-20__doors" aria-hidden="true">
                <span class="level-20__door level-20__door--red${revival ? " revival-font-perpetua" : ""}">${revival ? "T" : ""}</span>
                <span class="level-20__door level-20__door--blue${revival ? " revival-font-perpetua" : ""}">${revival ? "M" : ""}</span>
                <span class="level-20__door level-20__door--green${revival ? " revival-font-perpetua" : ""}">${revival ? "I" : ""}</span>
              </div>
              <button class="level-20__begin" type="button">BEGIN</button>
            `,
            revival ? "black" : "radial",
          );
          const begin = screen.querySelector<HTMLButtonElement>(".level-20__begin");
          if (begin) on(begin, "click", () => {
            if (failRevivalScene(1)) return;
            audio.playEffect(SOUND_EFFECTS.smack);
            renderScene(2);
          }, { once: true });
          if (revival) {
            let buffer = "";
            on(document, "keydown", (event) => {
              if (event.repeat || event.ctrlKey || event.altKey || event.metaKey || event.key.length !== 1) return;
              buffer = `${buffer}${event.key.toUpperCase()}`.slice(-3);
              if (buffer === "TMI") {
                renderScene(2);
                return;
              }
              if (!"TMI".startsWith(buffer)) failRevivalScene(1);
            });
          }
          break;
        }

        case 2: {
          const objects = SCENE_TWO_OBJECTS.map(
            ({ letter, size, left, top, kind }) => `
              <div class="level-20__size-object level-20__size-object--${kind}"
                style="width:${size}px;height:${size}px;left:${left}px;top:${top}px"
                data-level-20-draggable data-allow-drag role="img" aria-label="Movable letter ${letter}">
                <span>${letter}</span>
              </div>
            `,
          ).join("");
          renderShell(2, revival ? "#f00" : "#1f65ff", `<div class="level-20__size-objects">${objects}</div>${passwordForm("level-20-scene-2-answer")}`, "black");
          let remainingObjects: number = SCENE_TWO_OBJECTS.length;
          if (!revival) {
            makeObjectsDraggable();
          } else {
            screen.querySelectorAll<HTMLElement>("[data-level-20-draggable]").forEach((object) => {
              let pointerId: number | undefined;
              let pointerOffsetX = 0;
              let pointerOffsetY = 0;
              let lastPointerX = 0;
              let lastDirection = 0;
              let shakeDistance = 0;
              let shakeTurns = 0;
              on(object, "pointerdown", (event) => {
                const objectBounds = object.getBoundingClientRect();
                const screenBounds = screen.getBoundingClientRect();
                const scaleX = screen.clientWidth / screenBounds.width;
                const scaleY = screen.clientHeight / screenBounds.height;
                pointerId = event.pointerId;
                pointerOffsetX = (event.clientX - objectBounds.left) * scaleX;
                pointerOffsetY = (event.clientY - objectBounds.top) * scaleY;
                lastPointerX = event.clientX;
                lastDirection = 0;
                shakeDistance = 0;
                shakeTurns = 0;
                object.setPointerCapture(event.pointerId);
                object.classList.add("is-dragging");
                event.preventDefault();
              });
              on(object, "pointermove", (event) => {
                if (pointerId !== event.pointerId) return;
                const screenBounds = screen.getBoundingClientRect();
                const scaleX = screen.clientWidth / screenBounds.width;
                const scaleY = screen.clientHeight / screenBounds.height;
                const left = (event.clientX - screenBounds.left) * scaleX - pointerOffsetX;
                const top = (event.clientY - screenBounds.top) * scaleY - pointerOffsetY;
                object.style.left = `${Math.max(0, Math.min(screen.clientWidth - object.offsetWidth, left))}px`;
                object.style.top = `${Math.max(0, Math.min(screen.clientHeight - object.offsetHeight, top))}px`;
                const deltaX = event.clientX - lastPointerX;
                const direction = Math.sign(deltaX);
                shakeDistance += Math.abs(deltaX);
                if (direction && lastDirection && direction !== lastDirection) shakeTurns += 1;
                if (direction) lastDirection = direction;
                lastPointerX = event.clientX;
                if (shakeDistance >= 150 && shakeTurns >= 4) {
                  object.classList.add("is-cleared");
                  object.releasePointerCapture(event.pointerId);
                  pointerId = undefined;
                  remainingObjects -= 1;
                }
                event.preventDefault();
              });
              const finish = (event: PointerEvent) => {
                if (pointerId !== event.pointerId) return;
                if (object.hasPointerCapture(event.pointerId)) object.releasePointerCapture(event.pointerId);
                object.classList.remove("is-dragging");
                pointerId = undefined;
              };
              on(object, "pointerup", finish);
              on(object, "pointercancel", finish);
            });
          }
          bindPassword("hidden", 3, { neddih: 18 }, () => !revival || remainingObjects === 0);
          break;
        }

        case 3: {
          if (revival) {
            renderShell(
              3,
              "#570000",
              `<p class="level-20__revival-type-twice">TYPE TWICE</p>${passwordForm("level-20-scene-3-answer")}`,
              "black",
            );
            bindPassword("hiddenhidden", 4);
            break;
          }
          renderShell(
            3,
            "#1f65ff",
            `
              <canvas class="level-20__hidden-question" width="700" height="150" aria-hidden="true"></canvas>
              <canvas class="level-20__question-trace" width="700" height="150" aria-hidden="true"></canvas>
              ${passwordForm("level-20-scene-3-answer")}
            `,
            "black",
          );
          const hidden = screen.querySelector<HTMLCanvasElement>(".level-20__hidden-question");
          const trace = screen.querySelector<HTMLCanvasElement>(".level-20__question-trace");
          const hiddenContext = hidden?.getContext("2d", { willReadFrequently: true });
          const traceContext = trace?.getContext("2d");
          if (hidden && trace && hiddenContext && traceContext) {
            const drawQuestion = () => {
              hiddenContext.clearRect(0, 0, hidden.width, hidden.height);
              hiddenContext.fillStyle = "#fff";
              hiddenContext.font = '700 54px "NELG Arial", Arial, sans-serif';
              hiddenContext.textAlign = "center";
              hiddenContext.textBaseline = "middle";
              hiddenContext.fillText("What am I written with?", hidden.width / 2, hidden.height / 2);
            };
            drawQuestion();
            void document.fonts.load('700 54px "NELG Arial"').then(() => {
              if (hidden.isConnected) drawQuestion();
            });
            on(hidden, "pointermove", (event) => {
              const bounds = hidden.getBoundingClientRect();
              const x = Math.floor(((event.clientX - bounds.left) / bounds.width) * hidden.width);
              const y = Math.floor(((event.clientY - bounds.top) / bounds.height) * hidden.height);
              const alpha = hiddenContext.getImageData(Math.max(0, Math.min(699, x)), Math.max(0, Math.min(149, y)), 1, 1).data[3] ?? 0;
              hidden.style.cursor = alpha > 0 ? "pointer" : "default";
              if (alpha === 0) return;
              traceContext.save();
              traceContext.beginPath();
              traceContext.arc(x, y, 24, 0, Math.PI * 2);
              traceContext.clip();
              traceContext.globalAlpha = 0.9;
              traceContext.drawImage(hidden, 0, 0);
              traceContext.restore();
            });
            const fadeTimer = window.setInterval(() => {
              traceContext.save();
              traceContext.globalCompositeOperation = "destination-out";
              traceContext.fillStyle = "rgb(0 0 0 / 12%)";
              traceContext.fillRect(0, 0, trace.width, trace.height);
              traceContext.restore();
            }, 70);
            sceneTimers.add(fadeTimer);
          }
          bindPassword(
            ["alphabet", "letter", "letters", "text", "character", "english", "white"],
            4,
            { arial: 19 },
          );
          break;
        }

        case 4: {
          if (revival) {
            const orbs = REVIVAL_SCENE_FOUR_ORBS.map(
              ({ left, top }, index) => `<button class="level-20__revival-orb" type="button" data-orb="${index}"
                style="--orb-left:${left}px;--orb-top:${top}px;--orb-delay:${-index * 0.23}s"
                aria-label="Moving white circle ${index + 1}"></button>`,
            ).join("");
            renderShell(
              4,
              "#fff",
              `<p class="level-20__catch-message">Catch me, if you can.</p><div class="level-20__revival-orbs">${orbs}</div>`,
              "black",
            );
            const removedDigits = new Set<number>();
            const orbContainer = screen.querySelector<HTMLElement>(".level-20__revival-orbs");
            on(document, "keydown", (event) => {
              if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;
              if (!/^\d$/.test(event.key)) {
                if (event.key.length === 1) failRevivalScene(4);
                return;
              }
              const digit = Number(event.key);
              if (removedDigits.has(digit)) {
                failRevivalScene(4);
                return;
              }
              removedDigits.add(digit);
              orbContainer?.querySelector<HTMLElement>(`[data-orb="${digit}"]`)?.classList.add("is-cleared");
            });
            if (orbContainer) {
              on(orbContainer, "click", (event) => {
                const orb = (event.target as Element).closest<HTMLButtonElement>(".level-20__revival-orb");
                if (!orb) return;
                if (Number(orb.dataset.orb) === 10 && removedDigits.size === 10) {
                  renderScene(5);
                  return;
                }
                failRevivalScene(4);
              });
            }
            break;
          }
          renderShell(
            4,
            "aqua",
            `<p class="level-20__catch-message">Catch me, if you can.</p><button class="level-20__z-button" type="button" aria-label="Moving white button"></button>`,
            "black",
          );
          const movingButton = screen.querySelector<HTMLButtonElement>(".level-20__z-button");
          if (movingButton) on(movingButton, "click", () => audio.playEffect(SOUND_EFFECTS.smack));
          on(document, "keydown", (event) => {
            if (event.repeat || event.key.toLowerCase() !== "z") return;
            renderScene(5);
          });
          break;
        }

        case 5: {
          const buttonLayout = revival ? REVIVAL_SCENE_FIVE_BUTTONS : SCENE_FIVE_BUTTONS;
          const buttons = buttonLayout.map((item, index) => {
            const size = "size" in item ? item.size : 54;
            return `<button class="level-20__near-black-button" type="button" data-index="${index}"
              style="left:${item.left}px;top:${item.top}px;width:${size}px;height:${size}px"
              aria-label="Hidden button ${index + 1}"></button>`;
          }).join("");
          renderShell(5, "#fff", `<div class="level-20__near-black-buttons">${buttons}</div>`, "black");
          if (revival) {
            const container = screen.querySelector<HTMLElement>(".level-20__near-black-buttons");
            if (container) on(container, "click", () => failRevivalScene(5));
            on(document, "keydown", (event) => {
              if (event.repeat || event.ctrlKey || event.altKey || event.metaKey || event.key.length !== 1) return;
              if (event.key.toLowerCase() === "l") renderScene(6);
              else failRevivalScene(5);
            });
            break;
          }
          const clicked = new Set<number>();
          const container = screen.querySelector<HTMLElement>(".level-20__near-black-buttons");
          on(document, "keydown", (event) => {
            if (event.repeat || event.key.toLowerCase() !== "w") return;
            unlockAchievement(20);
          });
          if (container) {
            on(container, "click", (event) => {
              const button = (event.target as Element).closest<HTMLButtonElement>(".level-20__near-black-button");
              if (!button || !container.contains(button)) return;
              const index = Number(button.dataset.index);
              if (clicked.has(index)) return;
              clicked.add(index);
              button.classList.add("is-found");
              button.disabled = true;
              if (clicked.size === SCENE_FIVE_BUTTONS.length) renderScene(6);
            });
          }
          break;
        }

        case 6: {
          if (revival) {
            renderShell(
              6,
              "#000",
              `<p class="level-20__revival-efface">I WILL EFFACE YOU</p>${passwordForm("level-20-scene-6-answer")}`,
              "black",
            );
            bindPassword("15727310", 7);
            break;
          }
          renderShell(6, "#ffff00", `<img class="level-20__face" src="${assetUrl("images/level20a.png")}" alt="A smiling face" />${passwordForm("level-20-scene-6-answer")}`, "blue");
          bindPassword("64206", 7, { "awesome face": 21, "epic smiley": 21 });
          break;
        }

        case 7: {
          if (revival) {
            const targetX = LEVEL_WIDTH / 2 + Math.cos(222 * Math.PI / 180) * 166;
            const targetY = LEVEL_HEIGHT / 2 + Math.sin(222 * Math.PI / 180) * 166;
            renderShell(
              7,
              "#f00",
              `
                <p class="level-20__revival-coordinate-clue">166, 222</p>
                <button class="level-20__coordinate-target level-20__coordinate-target--revival" type="button"
                  style="left:${targetX - 6}px;top:${targetY - 5}px" aria-label="Polar coordinate 166, 222"></button>
                <div class="level-20__coordinates level-20__coordinates--revival revival-font-courier">
                  <div class="revival-font-courier">r : <span class="revival-font-courier" data-coordinate="x">0</span></div>
                  <div class="revival-font-courier">θ : <span class="revival-font-courier" data-coordinate="y">0</span></div>
                </div>
              `,
              "white",
            );
            const radiusOutput = screen.querySelector<HTMLElement>('[data-coordinate="x"]');
            const thetaOutput = screen.querySelector<HTMLElement>('[data-coordinate="y"]');
            const target = screen.querySelector<HTMLButtonElement>(".level-20__coordinate-target--revival");
            on(screen, "pointermove", (event) => {
              const bounds = screen.getBoundingClientRect();
              const x = Math.min(LEVEL_WIDTH - 1, Math.max(0, Math.floor(((event.clientX - bounds.left) / bounds.width) * LEVEL_WIDTH)));
              const y = Math.min(LEVEL_HEIGHT - 1, Math.max(0, Math.floor(((event.clientY - bounds.top) / bounds.height) * LEVEL_HEIGHT)));
              const polar = getPolarCoordinates(x, y);
              if (radiusOutput) radiusOutput.textContent = String(polar.radius);
              if (thetaOutput) thetaOutput.textContent = String(polar.theta);
            });
            on(screen, "pointerdown", (event) => {
              if (target && event.target === target) return;
              failRevivalScene(7);
            });
            if (target) {
              on(target, "pointerdown", (event) => {
                event.stopPropagation();
                renderScene(8);
              });
            }
            break;
          }
          const targetTop = Math.round((716 / VIRTUAL_SCENE_SEVEN_HEIGHT) * 600);
          renderShell(
            7,
            "aqua",
            `
              <img class="level-20__coordinate-image" src="${assetUrl("images/level20b.png")}" alt="A clue image" />
              <button class="level-20__coordinate-target" type="button" style="left:335px;top:${targetTop - 4}px"
                aria-label="Coordinate 339, 716"></button>
              <div class="level-20__coordinates"><div>x : <span data-coordinate="x">0</span></div><div>y : <span data-coordinate="y">0</span></div></div>
            `,
            "white",
          );
          const xOutput = screen.querySelector<HTMLElement>('[data-coordinate="x"]');
          const yOutput = screen.querySelector<HTMLElement>('[data-coordinate="y"]');
          const target = screen.querySelector<HTMLButtonElement>(".level-20__coordinate-target");
          const getVirtualCoordinates = (event: PointerEvent | MouseEvent) => {
            const bounds = screen.getBoundingClientRect();
            return {
              x: Math.min(799, Math.max(0, Math.floor(((event.clientX - bounds.left) / bounds.width) * LEVEL_WIDTH))),
              y: Math.min(
                799,
                Math.max(0, Math.floor(((event.clientY - bounds.top) / bounds.height) * VIRTUAL_SCENE_SEVEN_HEIGHT)),
              ),
            };
          };
          on(screen, "pointermove", (event) => {
            const { x, y } = getVirtualCoordinates(event);
            if (xOutput) xOutput.textContent = String(x);
            if (yOutput) yOutput.textContent = String(y);
          });
          on(screen, "pointerdown", (event) => {
            const { x, y } = getVirtualCoordinates(event);
            if ((Math.abs(x - 20) <= 1 && Math.abs(y - 20) <= 1)
              || (Math.abs(x - 242) <= 1 && Math.abs(y - 242) <= 1)) {
              unlockAchievement(22);
            }
            if (Math.abs(x - 339) <= 1 && Math.abs(y - 716) <= 1) renderScene(8);
          });
          if (target) {
            on(target, "pointerdown", (event) => {
              event.stopPropagation();
              renderScene(8);
            });
          }
          break;
        }

        case 8: {
          if (revival) {
            const buttons = REVIVAL_SCENE_EIGHT_BUTTONS.map(
              ({ value, left, top }) => `<button class="level-20__memory-button level-20__memory-button--revival"
                type="button" data-value="${value}" style="left:${left}px;top:${top}px"
                aria-label="Red memory button"></button>`,
            ).join("");
            renderShell(8, "#f00", `<div class="level-20__memory-buttons">${buttons}</div>`, "black");
            let expectedIndex = 0;
            const container = screen.querySelector<HTMLElement>(".level-20__memory-buttons");
            if (container) {
              on(container, "click", (event) => {
                const button = (event.target as Element).closest<HTMLButtonElement>(".level-20__memory-button--revival");
                if (!button || !container.contains(button)) return;

                if (event.detail !== 0) {
                  failRevivalScene(8);
                  return;
                }

                const value = Number(button.dataset.value);
                if (value !== REVIVAL_SCENE_EIGHT_ORDER[expectedIndex]) {
                  failRevivalScene(8);
                  return;
                }

                button.disabled = true;
                button.classList.add("is-correct");
                expectedIndex += 1;
                if (expectedIndex === REVIVAL_SCENE_EIGHT_ORDER.length) renderScene(9);
              });
            }
            break;
          }
          const buttons = SCENE_EIGHT_BUTTONS.map(
            ({ order, left, top }) => `<button class="level-20__memory-button" type="button" data-order="${order}"
              style="left:${left}px;top:${top}px" aria-label="Yellow memory button"></button>`,
          ).join("");
          renderShell(8, "aqua", `<div class="level-20__memory-buttons">${buttons}</div>`, "radial");
          let expectedOrder = 1;
          const container = screen.querySelector<HTMLElement>(".level-20__memory-buttons");
          if (container) {
            on(container, "click", (event) => {
              const button = (event.target as Element).closest<HTMLButtonElement>(".level-20__memory-button");
              if (!button || !container.contains(button)) return;
              if (Number(button.dataset.order) !== expectedOrder) {
                if (revival) {
                  failRevivalScene(8);
                  return;
                }
                expectedOrder = 1;
                container.querySelectorAll(".level-20__memory-button.is-correct").forEach((item) => {
                  item.classList.remove("is-correct");
                });
                button.classList.remove("is-wrong");
                void button.offsetWidth;
                button.classList.add("is-wrong");
                sceneTimeout(() => button.classList.remove("is-wrong"), 420);
                return;
              }
              expectedOrder += 1;
              button.classList.add("is-correct");
              if (expectedOrder === 9) renderScene(9);
            });
          }
          break;
        }

        case 9: {
          renderShell(
            9,
            "#000",
            `
              <div class="level-20__context-menu" role="menu" aria-label="Flash player menu" hidden>
                <button type="button" role="menuitemcheckbox" data-command="music"></button>
                <button type="button" role="menuitemcheckbox" data-command="effects"></button>
                <button type="button" role="menuitem" data-command="music-volume" aria-haspopup="menu"></button>
                <button type="button" role="menuitem" data-command="effects-volume" aria-haspopup="menu"></button>
                <div class="level-20__volume-menu" role="menu" aria-label="Volume" hidden>
                  ${Array.from({ length: 11 }, (_, index) => `<button type="button" role="menuitemradio" data-volume="${index * 10}"></button>`).join("")}
                </div>
                <div class="level-20__menu-separator" role="separator"></div>
                <button type="button" role="menuitem" data-command="forward">Forward</button>
                <button type="button" role="menuitem" data-command="back">Back</button>
                <button type="button" role="menuitem" data-command="rewind">Rewind</button>
                <div class="level-20__menu-separator" role="separator"></div>
                <div class="level-20__player-label">Never Ending Level Game ++</div>
              </div>
            `,
            "black",
          );
          const menu = screen.querySelector<HTMLElement>(".level-20__context-menu");
          const musicItem = menu?.querySelector<HTMLButtonElement>("[data-command='music']");
          const effectsItem = menu?.querySelector<HTMLButtonElement>("[data-command='effects']");
          const musicVolumeItem = menu?.querySelector<HTMLButtonElement>("[data-command='music-volume']");
          const effectsVolumeItem = menu?.querySelector<HTMLButtonElement>("[data-command='effects-volume']");
          const volumeMenu = menu?.querySelector<HTMLElement>(".level-20__volume-menu");
          if (!menu || !musicItem || !effectsItem || !musicVolumeItem || !effectsVolumeItem || !volumeMenu) break;
          let activeVolumeKind: "music" | "effects" = "music";

          const updateSettings = () => {
            musicItem.textContent = `${audio.musicEnabled ? "✓" : ""}  Music`;
            effectsItem.textContent = `${audio.effectsEnabled ? "✓" : ""}  Sound Effects`;
            musicVolumeItem.textContent = `   Music Volume: ${audio.musicVolume}%  ▶`;
            effectsVolumeItem.textContent = `   SFX Volume: ${audio.effectsVolume}%  ▶`;
            musicItem.setAttribute("aria-checked", String(audio.musicEnabled));
            effectsItem.setAttribute("aria-checked", String(audio.effectsEnabled));
            volumeMenu.querySelectorAll<HTMLButtonElement>("[data-volume]").forEach((option) => {
              const value = Number(option.dataset.volume);
              const selected = value === (activeVolumeKind === "music" ? audio.musicVolume : audio.effectsVolume);
              option.textContent = `${selected ? "✓" : ""}  ${value}%`;
              option.setAttribute("aria-checked", String(selected));
            });
          };
          const closeMenu = () => {
            menu.hidden = true;
            volumeMenu.hidden = true;
          };
          const positionVolumeMenu = (kind: "music" | "effects") => {
            activeVolumeKind = kind;
            volumeMenu.setAttribute("aria-label", kind === "music" ? "Music volume" : "SFX volume");
            updateSettings();
            volumeMenu.hidden = false;
            const menuBounds = localElementBounds(screen, menu);
            const submenuBounds = localElementBounds(screen, volumeMenu);
            const activeItem = kind === "music" ? musicVolumeItem : effectsVolumeItem;
            const maximumTop = screen.clientHeight - menuBounds.top - submenuBounds.height - 4;
            volumeMenu.style.top = `${Math.max(-menuBounds.top + 4, Math.min(activeItem.offsetTop, maximumTop))}px`;
            volumeMenu.classList.toggle(
              "opens-left",
              menuBounds.left + menuBounds.width + submenuBounds.width > screen.clientWidth - 4,
            );
          };
          updateSettings();
          const openMenu = (event: MouseEvent | PointerEvent) => {
            event.preventDefault();
            updateSettings();
            volumeMenu.hidden = true;
            menu.hidden = false;
            positionFloatingElement(screen, menu, event.clientX, event.clientY);
          };
          on(screen, "pointerdown", (event) => {
            if (event.button !== 2) return;
            openMenu(event);
          });
          on(screen, "contextmenu", openMenu);
          on(menu, "click", (event) => {
            const volumeOption = (event.target as Element).closest<HTMLButtonElement>("button[data-volume]");
            if (volumeOption && volumeMenu.contains(volumeOption)) {
              const volume = Number(volumeOption.dataset.volume);
              if (activeVolumeKind === "music") audio.setMusicVolume(volume);
              else audio.setEffectsVolume(volume);
              updateSettings();
              volumeMenu.hidden = true;
              return;
            }
            const item = (event.target as Element).closest<HTMLButtonElement>("button[data-command]");
            if (!item) return;
            if (item.dataset.command === "music") {
              audio.setMusicEnabled(!audio.musicEnabled);
              updateSettings();
              return;
            }
            if (item.dataset.command === "effects") {
              audio.setEffectsEnabled(!audio.effectsEnabled);
              updateSettings();
              return;
            }
            if (item.dataset.command === "music-volume") {
              if (volumeMenu.hidden || activeVolumeKind !== "music") positionVolumeMenu("music");
              else volumeMenu.hidden = true;
              return;
            }
            if (item.dataset.command === "effects-volume") {
              if (volumeMenu.hidden || activeVolumeKind !== "effects") positionVolumeMenu("effects");
              else volumeMenu.hidden = true;
              return;
            }
            if (revival && (item.dataset.command === "forward" || item.dataset.command === "back")) {
              goToLevel(19);
              return;
            }
            if (revival && item.dataset.command === "rewind") {
              session.setFlag(REVIVAL_SCENE_TEN_RESUME_FLAG);
              goToMenu();
              return;
            }
            if (item.dataset.command === "forward") renderScene(10);
            if (item.dataset.command === "back") {
              unlockAchievement(23);
              renderScene(8);
            }
            if (item.dataset.command === "rewind") {
              unlockAchievement(23);
              renderScene(1);
            }
          });
          on(document, "pointerdown", (event) => {
            if (!menu.hidden && !menu.contains(event.target as Node)) closeMenu();
          });
          on(document, "keydown", (event) => {
            if (event.key === "Escape") closeMenu();
          });
          break;
        }

        case 10: {
          if (revival) {
            renderShell(
              10,
              "#f00",
              `<img class="level-20__revival-scene-ten-image" src="${assetUrl("images/level50u20a10.png")}" alt="A hidden color clue" />
               ${passwordForm("level-20-scene-10-answer")}`,
              "white",
            );
            const form = screen.querySelector<HTMLFormElement>(".level-20__password-form");
            const input = screen.querySelector<HTMLInputElement>(".level-20__password-form input");
            if (!form || !input) break;
            const maskedInput = attachStarMaskedInput(input, on);
            on(input, "keydown", (event) => {
              if (event.key !== "Enter" || event.repeat) return;
              event.preventDefault();
              form.requestSubmit();
            });
            on(form, "submit", (event) => {
              event.preventDefault();
              if (maskedInput.getValue().trim().toLowerCase() === "red") {
                complete();
                return;
              }
              renderScene(9);
            });
            input.focus();
            break;
          }
          renderShell(
            10,
            "#fff",
            `<input class="level-20__editable-title" data-allow-select type="text" value="Level 20"
              aria-label="Editable level title" autocomplete="off" autocapitalize="off" spellcheck="false" />`,
            "black",
          );
          const headingNumber = screen.querySelector<HTMLElement>(".level-20__heading .level-heading__number");
          const editableTitle = screen.querySelector<HTMLInputElement>(".level-20__editable-title");
          if (headingNumber) headingNumber.hidden = true;
          if (editableTitle) {
            editableTitle.focus();
            editableTitle.setSelectionRange(editableTitle.value.length, editableTitle.value.length);
            on(editableTitle, "keydown", (event) => {
              if (event.key !== "Enter" || event.repeat) return;
              event.preventDefault();
              const requestedLevel = editableTitle.value.trim();
              if (requestedLevel === "Level 21") {
                complete();
                return;
              }
              if (revival) {
                failRevivalScene(10);
                return;
              }
              if (/^Level\s+-?\d+$/i.test(requestedLevel)) unlockAchievement(24);
            });
          }
          break;
        }
      }
    };

    const requestedScene = Number(initialScene);
    renderScene(Number.isInteger(requestedScene) && requestedScene >= 1 && requestedScene <= 10 ? requestedScene : 1);
    return clearScene;
  },
};
