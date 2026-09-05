import { assetUrl, SOUND_EFFECTS } from "../core/assets";
import type { LevelDefinition } from "../core/types";

const WARNING_COPY: Readonly<Record<number, readonly string[]>> = {
  1: [
    'WARNING! This level contains a huge button in the center that reads "Open unlimited browser windows"',
    "DO NOT PRESS THIS BUTTON!",
    "This button will literally open unlimited browser windows to localhost and probably ruin your screen!",
  ],
  2: [
    "Please take the warning seriously! I swear to God that if you press the center button on Level 46 it will keep opening webpages and you might not be able to stop it! I'm not really religious, but I do not \"swear to God\" unless I mean it, even in written form!",
    "I ASSURE YOU that you can beat the level WITHOUT double-clicking the center button....",
    "In fact, I SWEAR TO GOD you can...",
  ],
  3: [
    "Pressing continue again will bring you to level 46.",
    "If for some reason you don't believe me and decide to press the button anyway, please make sure you're ready for your screen to screw up.",
    "This means save any progressions you have done, and make sure you're not at a call center or something.... your boss will be pissed....",
  ],
};

const SCENES = [
  { id: "warning-1", label: "Scene 1 - Warning 1" },
  { id: "warning-2", label: "Scene 2 - Warning 2" },
  { id: "warning-3", label: "Scene 3 - Warning 3" },
  { id: "main", label: "Scene 4 - Main" },
  { id: "error", label: "Scene 5 - Error" },
] as const;

function sceneFromId(id: string | undefined): number {
  const index = SCENES.findIndex((scene) => scene.id === id);
  return index >= 0 ? index + 1 : 1;
}

function renderHeading(): string {
  return `
    <header class="level-heading level-46__heading" aria-label="Level 46, Hazard">
      <div class="level-heading__number">Level 46</div>
      <h1>Hazard</h1>
    </header>
  `;
}

function renderWarning(sceneNumber: number, showButton: boolean): string {
  const paragraphs = WARNING_COPY[sceneNumber] ?? WARNING_COPY[1]!;
  return `
    ${renderHeading()}
    <div class="level-46__warning-copy">
      ${paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("")}
    </div>
    <button class="level-46__continue" type="button"${showButton ? "" : " hidden"}>Continue...</button>
  `;
}

const ANSWERS = ["phishing", "sql injection", "ddos attack", "mitm attack"];
const CORNER_HINTS = [
  "I wear a trusted face and ask for your secret. You hand it over willingly. What am I?",
  "Thousands knock on the same door at once, until no real visitor can enter. What am I?",
  "I hide strange words inside a database request, making it reveal what it should keep secret. What am I?",
  "I quietly stand between two people, listening and sometimes changing what they say to each other. What am I?",
];

function renderMainScene(): string {
  return `
    ${renderHeading()}
    <div class="level-46__hazard-bg" aria-hidden="true">
      <span class="level-46__hazard-stripes"></span>
      <span class="level-46__hazard-wave level-46__hazard-wave--top"></span>
      <span class="level-46__hazard-wave level-46__hazard-wave--middle"></span>
      <span class="level-46__hazard-wave level-46__hazard-wave--bottom"></span>
      <span class="level-46__hazard-shadow level-46__hazard-shadow--upper"></span>
      <span class="level-46__hazard-shadow level-46__hazard-shadow--lower"></span>
    </div>
    <input class="level-46__last-password" aria-label="Final password" autocomplete="off" disabled>
    <button class="level-46__open-button" type="button">Open unlimited browser windows</button>
    <div class="level-46__passwords">
      ${[1, 2, 3].map((number) => `<form class="level-46__password-form">
        <input aria-label="Password ${number}" autocomplete="off" spellcheck="false">
        <button type="submit">GO</button>
      </form>`).join("")}
    </div>
    <img class="level-46__fake-cursor" src="${assetUrl("cursor/level46.png")}" alt="" draggable="false" aria-hidden="true">
    <section class="level-46__error" role="dialog" aria-labelledby="level-46-error-title" aria-describedby="level-46-error-message">
      <div class="level-46__error-bar">
        <span id="level-46-error-title">Microsoft Internet Error</span>
        <button class="level-46__error-close" type="button" aria-label="Close error" title="Close">X</button>
      </div>
      <div class="level-46__error-body">
        <span class="level-46__error-icon" aria-hidden="true">X</span>
        <div id="level-46-error-message">
          <p>An error has occurred.</p>
          <p>This program has performed an illegal operation and doesn't know what to do.</p>
          <small>Error: 46 - Something went wrong.</small>
        </div>
      </div>
      <button class="level-46__error-ok" type="button">OK</button>
    </section>
  `;
}

export const level46: LevelDefinition = {
  number: 46,
  title: "Hazard",
  scenes: SCENES,
  mount({ screen, initialScene, listen, timeout, complete, audio, wrongAnswer }) {
    let currentScene = sceneFromId(initialScene);

    const renderScene = () => {
      screen.className = `level-screen level-46 level-46--scene-${currentScene}`;
      if (currentScene >= 1 && currentScene <= 3) {
        const delayedButton = currentScene === 1;
        screen.innerHTML = renderWarning(currentScene, !delayedButton);
        const continueButton = screen.querySelector<HTMLButtonElement>(".level-46__continue");
        if (!continueButton) return;

        if (delayedButton) timeout(() => { continueButton.hidden = false; }, 20_000);
        listen(continueButton, "click", () => {
          audio.playEffect(SOUND_EFFECTS.smack);
          currentScene += 1;
          renderScene();
        });
        return;
      }

      screen.innerHTML = currentScene === 4 ? renderMainScene() : '<p class="level-46__fatal">FATAL ERROR...</p>';
      if (currentScene !== 4) return;
      const accepted = new Set<string>();
      let popupClosed = false;
      let finalStageUnlocked = false;
      let buttonMoved = false;
      let draggedClick = false;
      let flooding = false;
      let floodGeneration = 0;
      let clickGeneration = 0;
      const finalInput = screen.querySelector<HTMLInputElement>(".level-46__last-password")!;
      screen.querySelectorAll<HTMLFormElement>(".level-46__password-form").forEach((form) => {
        listen(form, "submit", (event) => {
          event.preventDefault();
          const input = form.querySelector("input")!;
          if (input.disabled) return;
          const answer = input.value.trim().toLowerCase();
          if (!ANSWERS.includes(answer) || accepted.has(answer)) {
            input.setAttribute("aria-invalid", "true");
            wrongAnswer();
            return;
          }
          accepted.add(answer);
          input.removeAttribute("aria-invalid");
          input.disabled = true;
          form.querySelector("button")!.disabled = true;
          form.classList.add("is-solved");
          audio.playEffect(SOUND_EFFECTS.smack);
          if (accepted.size === 3 && popupClosed) {
            currentScene = 5;
            renderScene();
          }
        });
      });
      const fakeCursor = screen.querySelector<HTMLElement>(".level-46__fake-cursor")!;
      listen(screen, "pointermove", (event) => {
        if (currentScene !== 4) return;
        const bounds = screen.getBoundingClientRect();
        const x = (event.clientX - bounds.left) * screen.offsetWidth / bounds.width;
        const y = (event.clientY - bounds.top) * screen.offsetHeight / bounds.height;
        fakeCursor.style.left = `${(x * 1.7 + Math.sin(y / 23) * 140 + 800) % (screen.clientWidth - 32)}px`;
        fakeCursor.style.top = `${(y * 0.6 + Math.cos(x / 31) * 120 + 600) % (screen.clientHeight - 32)}px`;
      });
      const startFlood = () => {
        clickGeneration += 1;
        if (flooding) return;
        flooding = true;
        const generation = ++floodGeneration;
        const spawn = () => {
          if (!flooding || generation !== floodGeneration || currentScene !== 4) return;
          const windows = screen.querySelectorAll(".level-46__browser");
          if (windows.length >= 24) windows[0]!.remove();
          const browser = document.createElement("section");
          browser.className = "level-46__browser";
          browser.style.left = `${Math.random() * (screen.clientWidth - 300)}px`;
          browser.style.top = `${Math.random() * (screen.clientHeight - 160)}px`;
          browser.innerHTML = '<div class="level-46__error-bar">localhost <button type="button" aria-label="Stop browser windows">X</button></div><p>http://localhost/</p>';
          screen.append(browser);
          timeout(spawn, 180);
        };
        spawn();
      };
      listen(screen, "click", (event) => {
        if (!(event.target as Element).closest(".level-46__browser button")) return;
        flooding = false;
        screen.querySelectorAll(".level-46__browser").forEach((window) => window.remove());
      });
      const openButton = screen.querySelector<HTMLButtonElement>(".level-46__open-button");
      if (openButton) {
        listen(openButton, "click", () => {
          if (draggedClick) { draggedClick = false; return; }
          if (!finalStageUnlocked) { startFlood(); return; }
          const generation = ++clickGeneration;
          // Defer the single click so a double click can trigger the trap instead.
          timeout(() => {
            if (generation !== clickGeneration || flooding || currentScene !== 4 || !buttonMoved) return;
            const answer = finalInput.value.trim().toLowerCase();
            if (ANSWERS.includes(answer) && !accepted.has(answer)) complete();
            else wrongAnswer();
          }, 350);
        });
        listen(openButton, "dblclick", startFlood);
      }
      const errorPopup = screen.querySelector<HTMLElement>(".level-46__error");
      if (errorPopup && openButton) {
        const titleBar = errorPopup.querySelector<HTMLElement>(".level-46__error-bar");
        const message = errorPopup.querySelector<HTMLElement>("#level-46-error-message")!;
        const originalMessage = message.innerHTML;
        const makeDraggable = (handle: HTMLElement, target: HTMLElement, isPopup: boolean) => {
          let drag: { pointerId: number; offsetX: number; offsetY: number; startX: number; startY: number } | null = null;
          let moved = false;
          listen(handle, "pointerdown", (event) => {
            if (event.button !== 0 || drag || (!isPopup && !finalStageUnlocked) || (isPopup && (event.target as Element).closest("button"))) return;
            moved = false;
            if (!isPopup) draggedClick = false;
            const bounds = target.getBoundingClientRect();
            const screenBounds = screen.getBoundingClientRect();
            drag = {
              pointerId: event.pointerId,
              startX: event.clientX,
              startY: event.clientY,
              offsetX: (event.clientX - bounds.left) * screen.offsetWidth / screenBounds.width,
              offsetY: (event.clientY - bounds.top) * screen.offsetHeight / screenBounds.height,
            };
            handle.setPointerCapture(event.pointerId);
            event.preventDefault();
          });
          listen(handle, "pointermove", (event) => {
            if (!drag || drag.pointerId !== event.pointerId) return;
            const bounds = screen.getBoundingClientRect();
            // Convert viewport coordinates to the scaled game's local coordinates.
            const x = (event.clientX - bounds.left) * screen.offsetWidth / bounds.width - drag.offsetX;
            const y = (event.clientY - bounds.top) * screen.offsetHeight / bounds.height - drag.offsetY;
            if (!moved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 3) return;
            moved = true;
            const maxX = screen.clientWidth - target.offsetWidth;
            const maxY = screen.clientHeight - target.offsetHeight;
            const left = Math.max(0, Math.min(x, maxX));
            const top = Math.max(0, Math.min(y, maxY));
            target.style.transform = "none";
            target.style.translate = "none";
            target.style.left = `${left}px`;
            target.style.top = `${top}px`;
            if (isPopup) {
              const horizontal = left === 0 ? 0 : left === maxX ? 1 : -1;
              const vertical = top === 0 ? 0 : top === maxY ? 1 : -1;
              if (horizontal >= 0 && vertical >= 0) message.textContent = CORNER_HINTS[vertical * 2 + horizontal]!;
              else message.innerHTML = originalMessage;
            } else {
              buttonMoved = true;
              finalInput.disabled = false;
            }
          });
          const stopDrag = (event: PointerEvent) => {
            if (drag?.pointerId !== event.pointerId) return;
            if (!isPopup && moved) draggedClick = true;
            drag = null;
            if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
          };
          listen(handle, "pointerup", stopDrag);
          listen(handle, "pointercancel", stopDrag);
          listen(handle, "lostpointercapture", stopDrag);
        };
        if (titleBar) makeDraggable(titleBar, errorPopup, true);
        makeDraggable(openButton, openButton, false);
        const dismiss = () => {
          popupClosed = true;
          errorPopup.remove();
          finalStageUnlocked = accepted.size === 3;
          if (finalStageUnlocked) openButton.classList.add("is-draggable");
          openButton.focus();
        };
        errorPopup.querySelectorAll<HTMLButtonElement>("button").forEach((button) => {
          listen(button, "click", dismiss, { once: true });
        });
        listen(errorPopup, "keydown", (event) => {
          if ((event as KeyboardEvent).key === "Escape") dismiss();
        });
        errorPopup.querySelector<HTMLButtonElement>(".level-46__error-ok")?.focus();
      }
    };

    renderScene();
  },
};
