import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelDefinition } from "../core/types";

function corruptCoordinate(value: number): string {
  const rounded = Math.round(value);
  const mode = Math.floor(Math.random() * 9);
  if (mode === 0) return "NaN";
  if (mode === 1) return `0x${Math.abs(rounded + Math.floor(Math.random() * 64)).toString(16).toUpperCase()}`;
  if (mode === 2) return String(-rounded - Math.floor(Math.random() * 300));
  if (mode === 3) return `${rounded}${Math.floor(Math.random() * 10)}`;
  if (mode === 4) return Math.random() > 0.5 ? "∞" : "-∞";
  if (mode === 5) return String((rounded ^ Math.floor(Math.random() * 511)) & 1023);
  return String(rounded + Math.floor(Math.random() * 181) - 90);
}

export const level39: LevelDefinition = {
  number: 39,
  title: "Glitch",
  mount({ screen, listen, timeout }) {
    screen.className = "level-screen level-39";
    screen.innerHTML = `
      <div class="level-39__gradient level-39__gradient--yellow" aria-hidden="true"></div>
      <div class="level-39__gradient level-39__gradient--lime" aria-hidden="true"></div>
      <div class="level-39__scanlines" aria-hidden="true"></div>

      <header class="level-heading level-39__heading" aria-label="Level 39, Glitch">
        <div class="level-heading__number level-39__title">Level 39</div>
        <h1 class="level-39__subtitle">Glitch</h1>
      </header>

      <aside class="level-39__telemetry" aria-label="Corrupted cursor coordinates">
        <p><span>x :</span> <output class="level-39__x">0</output></p>
        <p><span>y :</span> <output class="level-39__y">0</output></p>
        <svg class="level-39__sigil" viewBox="0 0 180 245" aria-hidden="true">
          <path d="M83 12 62 70 78 109 49 157 88 146 102 213M83 12 108 82 91 119 135 169 101 166M25 190 47 143M26 190 67 185M144 205 123 166M144 205 111 196" />
          <path class="level-39__sigil-eye" d="M54 92 Q88 61 126 94 Q91 126 54 92 Z M78 92 A13 13 0 1 0 104 92 A13 13 0 1 0 78 92" />
          <text x="12" y="235">9  A4  Ǝ  ?</text>
        </svg>
      </aside>

      <section class="level-39__rupture" aria-hidden="true">
        <pre><code><span>export</span> const level = memory[<b>0x27</b>];
if (cursor.x !== cursor.y) {
  frame.splice(<i>UNKNOWN</i>, 39);
  throw new RangeError("G̷A̵T̷E̶");
}
screen.render(fragment[NaN]);
while (signal) signal ^= 0x39;
// DO NOT TRUST THE TITLE
return void 0x000000;</code></pre>
      </section>

      <svg class="level-39__cracks" viewBox="0 0 800 600" preserveAspectRatio="none" aria-hidden="true">
        <g>
          <path d="M608 291 561 248 574 205 529 164M608 291 548 307 511 283 467 318 425 294" />
          <path d="M608 291 650 239 697 229 729 181M608 291 665 315 690 365 749 382" />
          <path d="M608 291 588 349 608 397 566 449 582 506" />
          <path d="M561 248 517 232 490 194M548 307 519 352 475 365M665 315 719 290 764 307" />
        </g>
      </svg>

      <div class="level-39__dead-shard level-39__dead-shard--one" aria-hidden="true"></div>
      <div class="level-39__dead-shard level-39__dead-shard--two" aria-hidden="true"></div>
      <div class="level-39__dead-shard level-39__dead-shard--three" aria-hidden="true"></div>
      <div class="level-39__glitch-bar level-39__glitch-bar--one" aria-hidden="true"></div>
      <div class="level-39__glitch-bar level-39__glitch-bar--two" aria-hidden="true"></div>
      <div class="level-39__glitch-bar level-39__glitch-bar--three" aria-hidden="true"></div>

      <form class="level-39__form" autocomplete="off">
        <label for="level-39-answer">Type the background color</label>
        <div class="level-39__controls">
          <div class="level-39__broken-input">
            <input class="nelg-password-input" id="level-39-answer" name="nelg-level-thirty-nine-answer"
              data-allow-select type="text" maxlength="64" autocomplete="off" autocapitalize="off"
              aria-autocomplete="none" data-form-type="other" data-lpignore="true" data-1p-ignore="true"
              spellcheck="false" aria-label="Damaged password input" />
            <i aria-hidden="true"></i>
          </div>
          <button type="submit" data-text="GO" aria-label="Damaged GO button">GO</button>
        </div>
      </form>
    `;

    const xOutput = screen.querySelector<HTMLOutputElement>(".level-39__x");
    const yOutput = screen.querySelector<HTMLOutputElement>(".level-39__y");
    const sigil = screen.querySelector<SVGElement>(".level-39__sigil");
    const form = screen.querySelector<HTMLFormElement>(".level-39__form");
    const input = screen.querySelector<HTMLInputElement>("#level-39-answer");
    const submit = screen.querySelector<HTMLButtonElement>(".level-39__form button");
    if (!xOutput || !yOutput || !sigil || !form || !input || !submit) return;

    attachStarMaskedInput(input, listen);

    listen(screen, "pointermove", () => {
      xOutput.value = corruptCoordinate(Math.random() * 800);
      yOutput.value = corruptCoordinate(Math.random() * 600);
      sigil.style.setProperty("--sigil-shift-x", `${Math.floor(Math.random() * 17) - 8}px`);
      sigil.style.setProperty("--sigil-skew", `${Math.floor(Math.random() * 13) - 6}deg`);
    });

    listen(form, "submit", (event) => {
      event.preventDefault();
      form.classList.remove("is-malfunctioning");
      void form.offsetWidth;
      form.classList.add("is-malfunctioning");
      submit.textContent = Math.random() > 0.5 ? "G?" : "0xGO";
      submit.dataset.text = submit.textContent;
      timeout(() => {
        form.classList.remove("is-malfunctioning");
        submit.textContent = "GO";
        submit.dataset.text = "GO";
        input.focus();
      }, 520);
    });
  },
};
