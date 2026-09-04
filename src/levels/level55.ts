import { assetUrl } from "../core/assets";
import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelDefinition } from "../core/types";

const FINAL_ANSWER = "august1st";
const HIDDEN_PASSWORD = "hidden";
const YELLOW_PASSWORD = "hiddeN";
type Level55Mode = "blue" | "green" | "yellow";

export const level55: LevelDefinition = {
  number: 55,
  title: "Negative",
  mount({ screen, complete, listen }) {
    screen.className = "level-screen level-55";
    screen.style.setProperty("--level-55-bg", `url("${assetUrl("images/level55bg.jpg")}")`);
    screen.innerHTML = `
      <header class="level-55__heading" aria-label="Level 55: Negative">
        <div class="level-55__title" aria-hidden="true">
          <span class="level-55__letter level-55__letter--rainbow">L</span>
          <span class="level-55__letter level-55__letter--gold">e</span>
          <span class="level-55__letter level-55__letter--blue">v</span>
          <span class="level-55__letter level-55__letter--violet">e</span>
          <span class="level-55__letter level-55__letter--one">l</span>
          <span class="level-55__spacer"></span>
          <span class="level-55__digit-five level-55__digit-five--first">5</span>
          <span class="level-55__digit-five level-55__digit-five--second">5</span>
        </div>
        <h1 class="level-55__subtitle">
          <span class="level-55__subtitle-letter level-55__subtitle-letter--n">N</span>
          <span class="level-55__subtitle-letter level-55__subtitle-letter--e">e</span>
          <span class="level-55__subtitle-letter level-55__subtitle-letter--g">g</span>
          <span class="level-55__subtitle-letter level-55__subtitle-letter--a">a</span>
          <span class="level-55__subtitle-letter level-55__subtitle-letter--t">t</span>
          <span class="level-55__subtitle-letter level-55__subtitle-letter--i">i</span>
          <span class="level-55__subtitle-letter level-55__subtitle-letter--v">v</span>
          <span class="level-55__subtitle-letter level-55__subtitle-letter--last-e">e</span>
        </h1>
      </header>

      <p class="level-55__green-letter" aria-hidden="true" hidden>N</p>
      <p class="level-55__yellow-message" hidden>
        It was a good attempt, but not a real password. The real password is hidden on screens other than Level 55.
        If you do something special at Level 1, you'll see screens with real passwords.
      </p>

      <form class="level-55__form" autocomplete="off">
        <input class="nelg-password-input" id="level-55-answer" name="nelg-level-fifty-five-answer"
          data-allow-select data-form-type="other" data-lpignore="true" data-1p-ignore="true"
          type="text" maxlength="18" autocomplete="off" autocapitalize="off"
          aria-autocomplete="none" spellcheck="false" aria-label="Password" />
        <button type="submit" aria-label="Submit password"><span>GO</span></button>
      </form>
    `;

    const form = screen.querySelector<HTMLFormElement>(".level-55__form");
    const input = screen.querySelector<HTMLInputElement>("#level-55-answer");
    const greenLetter = screen.querySelector<HTMLElement>(".level-55__green-letter");
    const yellowMessage = screen.querySelector<HTMLElement>(".level-55__yellow-message");
    if (!form || !input || !greenLetter || !yellowMessage) return;

    const maskedInput = attachStarMaskedInput(input, listen);
    let mode: Level55Mode = "blue";

    const setMode = (nextMode: Level55Mode) => {
      mode = nextMode;
      screen.classList.toggle("level-55--green", mode === "green");
      screen.classList.toggle("level-55--yellow", mode === "yellow");
      greenLetter.hidden = mode !== "green";
      yellowMessage.hidden = mode !== "yellow";
      maskedInput.clear();
      input.focus();
    };

    listen(input, "keydown", (event) => {
      if (event.key !== "Enter" || event.repeat) return;
      event.preventDefault();
      form.requestSubmit();
    });
    listen(form, "submit", (event) => {
      event.preventDefault();
      const value = maskedInput.getValue().trim();
      if (mode === "blue" && value === HIDDEN_PASSWORD) {
        setMode("green");
        return;
      }
      if (mode === "green" && value === HIDDEN_PASSWORD) {
        setMode("blue");
        return;
      }
      if (mode === "blue" && value === YELLOW_PASSWORD) {
        setMode("yellow");
        return;
      }
      if (mode === "yellow" && value === YELLOW_PASSWORD) {
        setMode("blue");
        return;
      }
      if (mode === "green" && value.toLowerCase() === FINAL_ANSWER) {
        complete();
        return;
      }
      input.focus();
    });

    input.focus();
  },
};
