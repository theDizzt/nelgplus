import { attachStarMaskedInput } from "../core/StarMaskedInput";
import { SOUND_EFFECTS } from "../core/assets";
import { clientPointToLocal } from "../core/floatingPosition";
import type { LevelDefinition } from "../core/types";

export const level23: LevelDefinition = {
  number: 23,
  title: "Symbol",
  mount({ screen, complete, wrongAnswer, unlockAchievement, listen, timeout, audio, session }) {
    const revival = session.hasFlag("level50-enhanced-run");
    screen.className = `level-screen level-23${revival ? " level-23--revival" : ""}`;
    screen.innerHTML = `
      <header class="level-heading level-23__heading">
        <div class="level-heading__number">Level 23</div><h1>Symbol</h1>
      </header>
      <svg class="level-23__chaos" viewBox="0 0 800 410" aria-hidden="true">
        <defs>
          <linearGradient id="l23-metal"><stop stop-color="#ffb0a8"/><stop offset=".5" stop-color="#e00030"/><stop offset="1" stop-color="#4a0000"/></linearGradient>
          <radialGradient id="l23-orb"><stop stop-color="#fff"/><stop offset=".25" stop-color="#ff7770"/><stop offset="1" stop-color="#350000"/></radialGradient>
        </defs>
        <g class="level-23__polygons">
          <path d="M0 15h154l-37 65 61 39-92 36 43 60L0 184Z"/><path d="M16 4h145l-24 45 61 14-54 60-32-44-79 33 24-57Z"/>
          <path d="M0 213l99-58 55 31-41 48 86 20-84 51 18 73H0Z"/><path d="M800 2H660l22 56-61 28 50 44-58 66 94 3-16 73 109-37Z"/>
          <path d="M800 240l-91-37-56 42 50 42-70 42 82 29-21 52h106Z"/><path d="M205 8l72 5 30 51-37 25 49 40-88 23-61-44 38-35-37-30Z"/>
          <path d="M515 4l105 14-30 43 54 26-44 65-81-13 21-51-59-30Z"/><path d="M174 304l94-63 69 30-20 53 64 21-52 65H201l22-53Z"/>
          <path d="M475 289l81-58 69 32-24 45 53 45-78 57H451l42-60-61-26Z"/>
        </g>
        <g class="level-23__scribbles"><path d="M7 34h108M7 58h78M47 6v91M72 6v73M98 140l108 56-84 14 80 61-132 17"/><path d="M695 18l-51 55 81 11-60 54 101 27M678 258l-80 47 96 14-68 68"/><path d="M212 27l66 61-99 20M250 260l40 58-74 43M536 25l40 58-61 53M537 323l64 25-82 47"/></g>
        <g class="level-23__arrows"><path d="M40 340l157-86-20-32 78 4-37 69-10-27-149 95Z"/><path d="M756 69l-159 95 22 30-79 2 32-72 13 27 151-104Z"/><path d="M75 174l203 36-9-36 68 42-78 22 14-27-205-18Z"/><path d="M730 215l-196 30 19 32-77-20 60-50-4 30 194-45Z"/></g>
        <g class="level-23__bits"><circle cx="130" cy="119" r="23"/><circle cx="675" cy="157" r="31"/><circle cx="113" cy="327" r="15"/><rect x="191" y="156" width="19" height="19"/><rect x="232" y="171" width="12" height="12"/><rect x="593" y="177" width="18" height="18"/><polygon points="317,31 345,80 292,80"/><polygon points="490,43 520,88 464,94"/><path d="M690 350c67-67 108 35 40 44-51 7-62-61-12-71 40-8 62 35 30 52-21 12-40-10-24-25"/></g>
        <g class="level-23__rays"><path d="M400 195L330 82M400 195l-145 32M400 195l-82 130M400 195l74-135M400 195l156 13M400 195l108 138"/></g>
      </svg>
      <div class="level-23__interactive" aria-label="Useless interactive objects">
        <button class="level-23__toy level-23__toy--eye" type="button" data-effect="invert" aria-label="Strange eye"><span></span></button>
        <button class="level-23__toy level-23__toy--gear" type="button" data-effect="spin" aria-label="Strange gear">×</button>
        <button class="level-23__toy level-23__toy--switch" type="button" data-effect="quake" aria-label="Strange switch">?</button>
        <button class="level-23__toy level-23__toy--orb" type="button" data-effect="burst" aria-label="Strange orb"></button>
        <button class="level-23__toy level-23__toy--stamp" type="button" data-effect="stamp" aria-label="Strange stamp">!</button>

        <div class="level-23__drag level-23__drag--one" data-allow-drag aria-label="Movable red diamond"></div>
        <div class="level-23__drag level-23__drag--two" data-allow-drag aria-label="Movable bent bar"></div>
        <div class="level-23__drag level-23__drag--three" data-allow-drag aria-label="Movable striped disc"></div>
        <div class="level-23__drag level-23__drag--four" data-allow-drag aria-label="Movable question mark">¿</div>

        <i class="level-23__decoy level-23__decoy--one"></i>
        <i class="level-23__decoy level-23__decoy--two"></i>
        <i class="level-23__decoy level-23__decoy--three"></i>
        <i class="level-23__decoy level-23__decoy--four"></i>
      </div>
      <div class="level-23__slash" aria-label="Slash symbol">/</div>
      <div class="level-23__effects" aria-hidden="true"></div>
      <form class="level-23__form" autocomplete="off"><div class="level-23__controls">
        <input class="nelg-password-input" id="level-23-answer" data-allow-select data-form-type="other" data-lpignore="true" data-1p-ignore="true" type="text" maxlength="1" autocomplete="off" autocapitalize="off" aria-autocomplete="none" aria-label="Password" spellcheck="false" />
        <button type="submit">GO</button>
      </div></form>`;

    const form = screen.querySelector<HTMLFormElement>(".level-23__form");
    const input = screen.querySelector<HTMLInputElement>("#level-23-answer");
    const button = screen.querySelector<HTMLButtonElement>(".level-23__form button");
    const interactive = screen.querySelector<HTMLElement>(".level-23__interactive");
    const effects = screen.querySelector<HTMLElement>(".level-23__effects");
    if (!form || !input || !button || !interactive || !effects) return;

    if (revival) {
      listen(form, "submit", (event) => event.preventDefault());
      listen(screen, "click", (event) => {
        const target = (event.target as Element).closest<HTMLElement>(
          ".level-heading__number, .level-heading h1, .level-23__chaos, .level-23__toy, .level-23__drag, .level-23__decoy, .level-23__slash, .level-23__form input, .level-23__form button",
        );
        if (!target || target.classList.contains("is-shattered")) return;
        event.preventDefault();
        target.classList.add("is-shattered");
        audio.playEffect(SOUND_EFFECTS.break);
        timeout(() => target.remove(), 520);
        const point = clientPointToLocal(screen, event.clientX, event.clientY);
        for (let index = 0; index < 9; index += 1) {
          const shard = document.createElement("i");
          shard.className = "level-23__break-shard";
          shard.style.left = `${point.x}px`;
          shard.style.top = `${point.y}px`;
          shard.style.setProperty("--break-x", `${Math.cos(index * Math.PI * 2 / 9) * (45 + index * 5)}px`);
          shard.style.setProperty("--break-y", `${Math.sin(index * Math.PI * 2 / 9) * (45 + index * 5)}px`);
          effects.append(shard);
          timeout(() => shard.remove(), 650);
        }
      });
      listen(document, "keydown", (event) => {
        if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;
        if (event.key === "Delete") {
          event.preventDefault();
          complete();
          return;
        }
        if (event.key.length === 1 || event.key === "Enter" || event.key === "Backspace") wrongAnswer();
      });
      return;
    }

    let dragged: HTMLElement | undefined;
    let activePointer: number | undefined;
    let startPointerX = 0;
    let startPointerY = 0;
    let startLeft = 0;
    let startTop = 0;

    listen(interactive, "pointerdown", (event) => {
      const object = (event.target as Element).closest<HTMLElement>(".level-23__drag");
      if (!object) return;
      const screenBounds = screen.getBoundingClientRect();
      const scaleX = screen.clientWidth / screenBounds.width;
      const scaleY = screen.clientHeight / screenBounds.height;
      dragged = object;
      activePointer = event.pointerId;
      startPointerX = (event.clientX - screenBounds.left) * scaleX;
      startPointerY = (event.clientY - screenBounds.top) * scaleY;
      startLeft = object.offsetLeft;
      startTop = object.offsetTop;
      object.style.left = `${startLeft}px`;
      object.style.top = `${startTop}px`;
      object.style.right = "auto";
      object.style.bottom = "auto";
      object.classList.add("is-dragging");
      object.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    listen(interactive, "pointermove", (event) => {
      if (!dragged || event.pointerId !== activePointer) return;
      const bounds = screen.getBoundingClientRect();
      const scaleX = screen.clientWidth / bounds.width;
      const scaleY = screen.clientHeight / bounds.height;
      const pointerX = (event.clientX - bounds.left) * scaleX;
      const pointerY = (event.clientY - bounds.top) * scaleY;
      dragged.style.left = `${startLeft + pointerX - startPointerX}px`;
      dragged.style.top = `${startTop + pointerY - startPointerY}px`;
      event.preventDefault();
    });

    const finishDrag = (event: PointerEvent) => {
      if (!dragged || event.pointerId !== activePointer) return;
      dragged.classList.remove("is-dragging");
      if (dragged.hasPointerCapture(event.pointerId)) dragged.releasePointerCapture(event.pointerId);
      dragged = undefined;
      activePointer = undefined;
    };
    listen(interactive, "pointerup", finishDrag);
    listen(interactive, "pointercancel", finishDrag);

    listen(interactive, "click", (event) => {
      const toy = (event.target as Element).closest<HTMLButtonElement>(".level-23__toy");
      if (!toy) return;
      audio.playEffect(SOUND_EFFECTS.smack);
      const effect = toy.dataset.effect;
      toy.classList.remove("is-active");
      void toy.offsetWidth;
      toy.classList.add("is-active");
      timeout(() => toy.classList.remove("is-active"), 650);

      if (effect === "invert") {
        screen.classList.toggle("level-23--inside-out");
      } else if (effect === "quake") {
        screen.classList.remove("level-23--quake");
        void screen.offsetWidth;
        screen.classList.add("level-23--quake");
        timeout(() => screen.classList.remove("level-23--quake"), 520);
      } else if (effect === "stamp") {
        const stamp = document.createElement("span");
        stamp.className = "level-23__effect-stamp";
        stamp.textContent = ["NO", "WHY", "23", "???"][Math.floor(Math.random() * 4)] ?? "???";
        stamp.style.left = `${80 + Math.random() * 620}px`;
        stamp.style.top = `${180 + Math.random() * 280}px`;
        stamp.style.rotate = `${-35 + Math.random() * 70}deg`;
        effects.append(stamp);
        timeout(() => stamp.remove(), 1400);
      } else if (effect === "burst") {
        for (let index = 0; index < 12; index += 1) {
          const shard = document.createElement("i");
          shard.className = "level-23__effect-shard";
          shard.style.setProperty("--shard-angle", `${index * 30}deg`);
          effects.append(shard);
          timeout(() => shard.remove(), 800);
        }
      }
    });

    const masked = attachStarMaskedInput(input, listen);
    input.focus();
    listen(input, "keydown", (event) => {
      if (event.key === "Enter" && !event.repeat) { event.preventDefault(); form.requestSubmit(); }
    });
    listen(form, "submit", (event) => {
      event.preventDefault();
      audio.playEffect(SOUND_EFFECTS.smack);
      const answer = masked.getValue();
      if (answer === "?") unlockAchievement(28);
      if (answer === "/") { button.disabled = true; complete(); return; }
      if (wrongAnswer()) return;
      masked.clear();
      input.classList.remove("is-wrong"); void input.offsetWidth; input.classList.add("is-wrong"); input.focus();
      timeout(() => input.classList.remove("is-wrong"), 360);
    });
  },
};
