import { attachStarMaskedInput } from "../core/StarMaskedInput";
import { assetUrl, SOUND_EFFECTS } from "../core/assets";
import type { LevelContext, LevelDefinition } from "../core/types";
import { positionFloatingElement } from "../core/floatingPosition";

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
const VIRTUAL_SCENE_SEVEN_HEIGHT = 800;

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
    const { screen, complete, unlockAchievement, audio, initialScene } = context;
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
      screen.className = `level-screen level-20 level-20--scene-${scene} level-20--background-${background}`;
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
        if (acceptedAnswers.has(answer)) {
          renderScene(nextScene);
          return;
        }
        maskedInput.clear();
        input.classList.remove("is-wrong");
        void input.offsetWidth;
        input.classList.add("is-wrong");
        input.focus();
        sceneTimeout(() => input.classList.remove("is-wrong"), 360);
      });
      input.focus();
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
            "#fff",
            `
              <p class="level-20__intro">
                Welcome to the NELG++ remix level! This level combines puzzles you have encountered so far.<br />
                Recall your past experiences and solve this long chain of puzzles to reach Level 21.<br />
                Reunion levels normally roll you back one scene for a wrong answer, but your first Reunion gives
                you a special break with no such penalty. Good luck.
              </p>
              <div class="level-20__doors" aria-hidden="true">
                <span class="level-20__door level-20__door--red"></span>
                <span class="level-20__door level-20__door--blue"></span>
                <span class="level-20__door level-20__door--green"></span>
              </div>
              <button class="level-20__begin" type="button">BEGIN</button>
            `,
            "radial",
          );
          const begin = screen.querySelector<HTMLButtonElement>(".level-20__begin");
          if (begin) on(begin, "click", () => {
            audio.playEffect(SOUND_EFFECTS.smack);
            renderScene(2);
          }, { once: true });
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
          renderShell(2, "#1f65ff", `<div class="level-20__size-objects">${objects}</div>${passwordForm("level-20-scene-2-answer")}`, "black");
          makeObjectsDraggable();
          bindPassword("hidden", 3, { neddih: 18 });
          break;
        }

        case 3: {
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
          const buttons = SCENE_FIVE_BUTTONS.map(
            ({ left, top, size }, index) => `<button class="level-20__near-black-button" type="button" data-index="${index}"
              style="left:${left}px;top:${top}px;width:${size}px;height:${size}px" aria-label="Hidden button ${index + 1}"></button>`,
          ).join("");
          renderShell(5, "#fff", `<div class="level-20__near-black-buttons">${buttons}</div>`, "black");
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
          renderShell(6, "#ffff00", `<img class="level-20__face" src="${assetUrl("images/level20a.png")}" alt="A smiling face" />${passwordForm("level-20-scene-6-answer")}`, "blue");
          bindPassword("64206", 7, { "awesome face": 21, "epic smiley": 21 });
          break;
        }

        case 7: {
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
          if (!menu) break;
          on(screen, "contextmenu", (event) => {
            event.preventDefault();
            menu.hidden = false;
            positionFloatingElement(screen, menu, event.clientX, event.clientY);
          });
          on(menu, "click", (event) => {
            const item = (event.target as Element).closest<HTMLButtonElement>("button[data-command]");
            if (!item) return;
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
            if (!menu.hidden && !menu.contains(event.target as Node)) menu.hidden = true;
          });
          break;
        }

        case 10: {
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
