import { attachCustomCursor } from "../core/CustomCursor";
import { attachStarMaskedInput } from "../core/StarMaskedInput";
import { assetUrl } from "../core/assets";
import { positionFloatingElement } from "../core/floatingPosition";
import type { LevelDefinition } from "../core/types";

interface PasswordControl {
  readonly form: HTMLFormElement;
  readonly input: HTMLInputElement;
  readonly button: HTMLButtonElement;
}

function getControl(screen: HTMLElement, name: string): PasswordControl | undefined {
  const form = screen.querySelector<HTMLFormElement>(`.level-52__form--${name}`);
  const input = form?.querySelector<HTMLInputElement>("input");
  const button = form?.querySelector<HTMLButtonElement>("button");
  if (!form || !input || !button) return undefined;
  return { form, input, button };
}

function lockControl(control: PasswordControl): void {
  control.form.classList.add("is-complete");
  control.input.disabled = false;
  control.button.disabled = false;
}

function unlockControl(control: PasswordControl): void {
  control.form.classList.remove("is-complete");
  control.input.disabled = false;
  control.button.disabled = false;
}

export const level52: LevelDefinition = {
  number: 52,
  title: "Trasition",
  mount(context) {
    const { screen, complete, listen, audio } = context;
    screen.className = "level-screen level-52";
    screen.innerHTML = `
      <header class="level-heading level-52__heading">
        <div class="level-heading__number">Level 52</div>
        <h1>Trasition</h1>
      </header>

      <form class="level-52__form level-52__form--hex" autocomplete="off">
        <div class="level-52__controls">
          <input id="level-52-hex" data-allow-select type="text" maxlength="6"
            inputmode="text" autocomplete="off" autocapitalize="characters" spellcheck="false"
            aria-label="Hexadecimal password" />
          <button type="submit">GO</button>
        </div>
      </form>

      <form class="level-52__form level-52__form--red" autocomplete="off" hidden>
        <div class="level-52__controls">
          <input id="level-52-red" class="nelg-password-input" data-allow-select type="text"
            maxlength="20" autocomplete="off" autocapitalize="off" spellcheck="false"
            aria-label="Red button password" />
          <button type="submit">GO</button>
        </div>
      </form>

      <form class="level-52__form level-52__form--moving" autocomplete="off" hidden>
        <div class="level-52__controls">
          <input id="level-52-moving" class="nelg-password-input" data-allow-select type="text"
            maxlength="20" autocomplete="off" autocapitalize="off" spellcheck="false"
            aria-label="Moving password" />
          <button type="submit">GO</button>
        </div>
      </form>

      <form class="level-52__form level-52__form--menu" autocomplete="off" hidden>
        <div class="level-52__controls">
          <input class="nelg-password-input" data-allow-select type="text" maxlength="20"
            autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Menu password" />
          <button type="submit" aria-label="Open menu clue"><span>GO</span></button>
        </div>
      </form>

      <form class="level-52__form level-52__form--secret" autocomplete="off" hidden>
        <input class="nelg-password-input" data-allow-select type="text" maxlength="20"
          autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Hidden password" />
        <button type="submit">GO</button>
      </form>

      <div class="level-52__stairs" aria-label="Stair-shaped GO buttons" hidden>
        ${Array.from({ length: 32 }, (_, index) => {
            const colors = ["blue", "magenta", "yellow", "aqua"] as const;
            const color = colors[index % colors.length];
            const flight = Math.floor(index / 16);
            const position = index % 16;
            const pair = Math.floor(position / 2);
            const left = flight * 310 + pair * 56;
            const top = (flight === 0 ? 520 : 400) - Math.ceil(position / 2) * 44;
            return `<button type="button" class="is-${color}"
              style="--stair-left:${left}px;--stair-top:${top}px">GO</button>`;
          })
          .join("")}
      </div>

      <div class="level-52__stars" aria-hidden="true" hidden>
        ${Array.from({ length: 56 }, (_, index) => {
          const left = (index * 47 + 13) % 96;
          const top = (index * 71 + 9) % 94;
          const delay = (index % 11) * -0.17;
          const size = 14 + (index % 5) * 4;
          return `<span style="--left:${left}%;--top:${top}%;--delay:${delay}s;--size:${size}px">*</span>`;
        }).join("")}
      </div>

      <img class="level-52__tab-clue" src="${assetUrl("images/level52a.png")}" alt="" aria-hidden="true" hidden />
      <p class="level-52__rewind-clue" aria-live="polite" hidden>PW = rewind</p>

      <div class="level-52__context-menu" role="menu" aria-label="Flash player menu" hidden>
        <button type="button" role="menuitemcheckbox" data-command="music">✓  Music</button>
        <button type="button" role="menuitemcheckbox" data-command="effects">✓  Sound Effects</button>
        <button type="button" role="menuitem">   Music Volume: 50%  ▶</button>
        <button type="button" role="menuitem">   SFX Volume: 50%  ▶</button>
        <div class="level-52__menu-separator" role="separator"></div>
        <button type="button" role="menuitem" data-command="forward">Forward</button>
        <button type="button" role="menuitem" data-command="back">Back</button>
        <button type="button" role="menuitem" data-command="rewind">Rewind</button>
        <div class="level-52__menu-separator" role="separator"></div>
        <div class="level-52__player-label">Never Ending Level Game ++</div>
      </div>
    `;

    const hex = getControl(screen, "hex");
    const red = getControl(screen, "red");
    const moving = getControl(screen, "moving");
    const menuControl = getControl(screen, "menu");
    const secret = getControl(screen, "secret");
    const contextMenu = screen.querySelector<HTMLElement>(".level-52__context-menu");
    const stairs = screen.querySelector<HTMLElement>(".level-52__stairs");
    const stairButtons = Array.from(screen.querySelectorAll<HTMLButtonElement>(".level-52__stairs button"));
    const stars = screen.querySelector<HTMLElement>(".level-52__stars");
    const tabClue = screen.querySelector<HTMLImageElement>(".level-52__tab-clue");
    const rewindClue = screen.querySelector<HTMLElement>(".level-52__rewind-clue");
    if (!hex || !red || !moving || !menuControl || !secret || !contextMenu || !stairs
      || stairButtons.length !== 32 || !stars || !tabClue || !rewindClue) return;

    const redInput = attachStarMaskedInput(red.input, listen);
    const movingInput = attachStarMaskedInput(moving.input, listen);
    const menuInput = attachStarMaskedInput(menuControl.input, listen);
    const secretInput = attachStarMaskedInput(secret.input, listen);
    const passwordControls = [hex, red, moving, menuControl, secret] as const;
    let quest = 1;
    let removeCursor: (() => void) | undefined;
    let remainingStairs = stairButtons.length;
    let rewindRevealed = false;

    const showWrong = (control: PasswordControl) => {
      control.input.focus();
    };

    const submitWithEnter = (control: PasswordControl) => {
      listen(control.input, "keydown", (event) => {
        if (event.key !== "Enter" || event.repeat) return;
        event.preventDefault();
        control.form.requestSubmit();
      });
    };
    submitWithEnter(hex);
    submitWithEnter(red);
    submitWithEnter(moving);
    submitWithEnter(menuControl);
    submitWithEnter(secret);

    listen(hex.input, "input", () => {
      const selection = hex.input.selectionStart ?? hex.input.value.length;
      const before = hex.input.value;
      const normalized = before.toUpperCase().replace(/[^0-9A-F]/g, "").slice(0, 6);
      hex.input.value = normalized;
      const removedBeforeCaret = before.slice(0, selection).replace(/[0-9A-Fa-f]/g, "").length;
      const caret = Math.min(normalized.length, selection - removedBeforeCaret);
      hex.input.setSelectionRange(caret, caret);
    });

    listen(hex.form, "submit", (event) => {
      event.preventDefault();
      if (quest === 1) {
        if (hex.input.value !== "00FF7F") {
          showWrong(hex);
          return;
        }
        quest = 2;
        lockControl(hex);
        red.form.hidden = false;
        red.input.focus();
        return;
      }
      if (quest === 7) {
        if (hex.input.value !== "393939") {
          showWrong(hex);
          return;
        }
        quest = 8;
        lockControl(hex);
        unlockControl(menuControl);
        stars.hidden = false;
        menuControl.input.focus();
      }
    });

    listen(red.form, "submit", (event) => {
      event.preventDefault();
      if (quest === 2) {
        if (redInput.getValue() !== "red") {
          showWrong(red);
          return;
        }
        quest = 3;
        removeCursor = attachCustomCursor(context, { source: "cursor/level52.png", hotspot: "top-left" });
        red.input.focus();
        return;
      }
      if (quest === 3) {
        if (redInput.getValue() !== "cursor") {
          showWrong(red);
          return;
        }
        quest = 4;
        lockControl(red);
        moving.form.hidden = false;
        moving.input.focus({ preventScroll: true });
        return;
      }
      if (quest === 10) {
        if (redInput.getValue() !== "CURSOR") {
          showWrong(red);
          return;
        }
        quest = 11;
        lockControl(red);
        secret.form.hidden = false;
        secret.input.focus();
      }
    });

    listen(secret.form, "submit", (event) => {
      event.preventDefault();
      if (quest !== 11) return;
      if (secretInput.getValue() !== "hidden") {
        showWrong(secret);
        return;
      }
      quest = 12;
      lockControl(secret);
      stairs.classList.add("is-removable");
    });

    stairButtons.forEach((button) => {
      let hits = 0;
      listen(button, "click", () => {
        if (quest !== 12 || rewindRevealed) return;
        hits += 1;
        audio.playEffect(assetUrl("sounds/nelgsmack.WAV"));
        button.classList.remove("is-hit");
        void button.offsetWidth;
        button.classList.add("is-hit");
        if (hits < 10) return;

        button.remove();
        remainingStairs -= 1;
        if (remainingStairs > 0) return;

        rewindRevealed = true;
        rewindClue.hidden = false;
        passwordControls.forEach(unlockControl);
        menuControl.input.focus();
      });
    });

    listen(moving.form, "submit", (event) => {
      event.preventDefault();
      if (quest !== 4) return;
      if (movingInput.getValue() !== "left") {
        showWrong(moving);
        return;
      }
      quest = 5;
      lockControl(moving);
      menuControl.form.hidden = false;
      menuControl.input.focus();
    });

    const closeMenu = () => {
      contextMenu.hidden = true;
    };
    const openMenu = (event: MouseEvent | PointerEvent) => {
      event.preventDefault();
      if (!(event.target as Element).closest(".level-52__form--menu button")) return;
      if (quest === 12) {
        if (!rewindRevealed || menuInput.getValue() !== "rewind") {
          if (rewindRevealed) showWrong(menuControl);
          return;
        }
      } else if (quest !== 5) {
        return;
      }
      contextMenu.hidden = false;
      positionFloatingElement(screen, contextMenu, event.clientX, event.clientY);
    };

    listen(menuControl.button, "contextmenu", openMenu);
    listen(menuControl.button, "pointerdown", (event) => {
      if (event.button === 2) openMenu(event);
    });
    listen(menuControl.button, "click", () => {
      if (quest === 5) menuControl.button.classList.add("is-hinting");
    });
    listen(menuControl.form, "submit", (event) => {
      event.preventDefault();
      if (quest === 5) return;
      if (quest === 6) {
        if (menuInput.getValue() !== "stairs") {
          showWrong(menuControl);
          return;
        }
        quest = 7;
        lockControl(menuControl);
        screen.classList.add("level-52--dark");
        unlockControl(hex);
        hex.input.focus();
        return;
      }
      if (quest === 8) {
        if (menuInput.getValue() !== "stars") {
          showWrong(menuControl);
          return;
        }
        quest = 9;
        lockControl(menuControl);
        tabClue.hidden = false;
        return;
      }
    });
    listen(contextMenu, "click", (event) => {
      const item = (event.target as Element).closest<HTMLButtonElement>("button[data-command]");
      if (!item) return;
      if (item.dataset.command === "forward") {
        if (quest !== 5) return;
        quest = 6;
        closeMenu();
        menuControl.button.classList.remove("is-hinting");
        stairs.hidden = false;
        menuControl.input.focus();
        return;
      }
      if (item.dataset.command === "rewind" && quest === 12 && rewindRevealed
        && menuInput.getValue() === "rewind") {
        complete();
        return;
      }
      closeMenu();
    });
    listen(document, "pointerdown", (event) => {
      if (!contextMenu.hidden && !contextMenu.contains(event.target as Node) && event.target !== menuControl.button) {
        closeMenu();
      }
    });
    listen(document, "keydown", (event) => {
      if (event.key === "Escape") closeMenu();
      if (quest === 9 && event.key === "Tab" && !event.repeat) {
        event.preventDefault();
        quest = 10;
        screen.classList.add("level-52--large-cursor");
        unlockControl(red);
        red.input.focus();
      }
    });

    hex.input.focus();

    return () => {
      removeCursor?.();
    };
  },
};
