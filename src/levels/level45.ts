import { attachStarMaskedInput } from "../core/StarMaskedInput";
import { assetUrl } from "../core/assets";
import type { LevelDefinition } from "../core/types";

const ANSWER = "yosemite";

const CLOCK_CLUES: Readonly<Record<string, string>> = {
  "02:39:42": "92°04′ / 100°44′ / 167°12′",
  "04:40:08": "yo",
  "07:19:52": "se",
  "16:40:08": "mi",
  "19:19:52": "te",
};

function renderClockNumbers(): string {
  return Array.from({ length: 12 }, (_, index) => {
    const number = index + 1;
    const angle = number * Math.PI / 6;
    const left = 50 + Math.sin(angle) * 37;
    const top = 50 - Math.cos(angle) * 37;
    return `<span class="level-45__clock-number" style="left:${left}%;top:${top}%">${number}</span>`;
  }).join("");
}

function renderClockTicks(): string {
  return Array.from({ length: 60 }, (_, second) => `
    <i class="level-45__clock-tick${second % 5 === 0 ? " level-45__clock-tick--major" : ""}"
      style="--level-45-tick-angle:${second * 6}deg" aria-hidden="true"></i>
  `).join("");
}

function formatClockTime(date: Date): string {
  return [date.getHours(), date.getMinutes(), date.getSeconds()]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}

export const level45: LevelDefinition = {
  number: 45,
  title: "Clockwork",
  mount({ screen, complete, listen, interval, timeout }) {
    screen.className = "level-screen level-45";
    screen.style.setProperty("--level-45-background", `url("${assetUrl("images/level45bg.png")}")`);
    screen.innerHTML = `
      <header class="level-heading level-45__heading" aria-label="Level 45, Clockwork">
        <div class="level-heading__number">Level 45</div>
        <h1>Clockwork</h1>
      </header>

      <div class="level-45__clock" role="img" aria-label="Analog clock showing the computer time">
        ${renderClockTicks()}
        ${renderClockNumbers()}
        <p class="level-45__clue" data-clock-clue></p>
        <i class="level-45__hand level-45__hand--hour" data-clock-hour aria-hidden="true"></i>
        <i class="level-45__hand level-45__hand--minute" data-clock-minute aria-hidden="true"></i>
        <i class="level-45__hand level-45__hand--second" data-clock-second aria-hidden="true"></i>
        <i class="level-45__clock-pin" aria-hidden="true"></i>
      </div>

      <form class="level-45__form" autocomplete="off">
        <input class="nelg-password-input" id="level-45-answer" name="nelg-level-forty-five-answer"
          data-allow-select data-form-type="other" data-lpignore="true" data-1p-ignore="true"
          type="text" maxlength="16" autocomplete="off" autocapitalize="off"
          aria-autocomplete="none" spellcheck="false" aria-label="Password" />
        <button type="submit">GO</button>
      </form>
    `;

    const clock = screen.querySelector<HTMLElement>(".level-45__clock");
    const hourHand = screen.querySelector<HTMLElement>("[data-clock-hour]");
    const minuteHand = screen.querySelector<HTMLElement>("[data-clock-minute]");
    const secondHand = screen.querySelector<HTMLElement>("[data-clock-second]");
    const clue = screen.querySelector<HTMLElement>("[data-clock-clue]");
    const form = screen.querySelector<HTMLFormElement>(".level-45__form");
    const input = screen.querySelector<HTMLInputElement>("#level-45-answer");
    const submitButton = form?.querySelector<HTMLButtonElement>("button");
    if (!clock || !hourHand || !minuteHand || !secondHand || !clue || !form || !input || !submitButton) return;

    let lastClockTime = "";
    const updateClock = () => {
      const now = new Date();
      const milliseconds = now.getMilliseconds();
      const seconds = now.getSeconds() + milliseconds / 1_000;
      const minutes = now.getMinutes() + seconds / 60;
      const hours = now.getHours() % 12 + minutes / 60;
      hourHand.style.rotate = `${hours * 30}deg`;
      minuteHand.style.rotate = `${minutes * 6}deg`;
      secondHand.style.rotate = `${seconds * 6}deg`;

      const clockTime = formatClockTime(now);
      if (clockTime === lastClockTime) return;
      lastClockTime = clockTime;
      clue.textContent = CLOCK_CLUES[clockTime] ?? "";
      clock.setAttribute("aria-label", `Analog clock showing ${clockTime}`);
    };
    updateClock();
    interval(updateClock, 50);

    const maskedInput = attachStarMaskedInput(input, listen);
    listen(input, "keydown", (event) => {
      if (event.key !== "Enter" || event.repeat) return;
      event.preventDefault();
      form.requestSubmit();
    });

    listen(form, "submit", (event) => {
      event.preventDefault();
      if (maskedInput.getValue() === ANSWER) {
        submitButton.disabled = true;
        complete();
        return;
      }
      input.classList.add("is-wrong");
      input.focus();
      timeout(() => input.classList.remove("is-wrong"), 360);
    });
  },
};
