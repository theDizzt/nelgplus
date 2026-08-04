import type { LevelDefinition } from "../core/types";

const ANSWER = "nelg";

export const level11: LevelDefinition = {
  number: 11,
  title: "Homage",
  mount({ screen, complete, listen, timeout }) {
    screen.className = "level-screen level-11";
    screen.innerHTML = `
      <div class="level-11__background" aria-hidden="true"></div>

      <header class="level-heading level-11__heading">
        <div class="level-heading__number">Level 11</div>
        <h1>Homage</h1>
      </header>

      <div class="level-11__message">
        <p>We have faithfully recreated the design of</p>
        <div class="level-11__letters" aria-label="NELG">
          <span>N</span><span>E</span><span>L</span><span>G</span>
        </div>
      </div>
    `;

    const letters = [...screen.querySelectorAll<HTMLElement>(".level-11__letters span")];
    if (letters.length !== ANSWER.length) return;

    let expectedIndex = 0;
    let finished = false;
    listen(document, "keydown", (event) => {
      if (finished || event.repeat || event.ctrlKey || event.altKey || event.metaKey || event.key.length !== 1) return;

      const pressedKey = event.key.toLowerCase();
      if (pressedKey !== ANSWER[expectedIndex]) {
        expectedIndex = 0;
        letters.forEach((letter) => letter.classList.remove("is-pressed"));
        if (pressedKey !== ANSWER[0]) return;
      }

      event.preventDefault();
      letters[expectedIndex]?.classList.add("is-pressed");
      expectedIndex += 1;
      if (expectedIndex === ANSWER.length) {
        finished = true;
        timeout(complete, 320);
      }
    });
  },
};
