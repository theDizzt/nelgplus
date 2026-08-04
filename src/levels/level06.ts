import type { LevelDefinition } from "../core/types";

export const level06: LevelDefinition = {
  number: 6,
  title: "Catch",
  mount({ screen, complete, listen }) {
    screen.className = "level-screen level-06";
    screen.innerHTML = `
      <header class="level-heading level-06__heading">
        <div class="level-heading__number">Level 6</div>
        <h1>Catch</h1>
      </header>

      <div class="level-06__buttons">
        <button class="level-06__button level-06__button--1" type="button" data-number="1">1</button>
        <button class="level-06__button level-06__button--2" type="button" data-number="2">2</button>
        <button class="level-06__button level-06__button--3" type="button" data-number="3">3</button>
      </div>
    `;

    const buttonContainer = screen.querySelector<HTMLElement>(".level-06__buttons");
    if (!buttonContainer) return;

    let expectedNumber = 1;
    listen(buttonContainer, "click", (event) => {
      const button = (event.target as Element).closest<HTMLButtonElement>(".level-06__button");
      if (!button || !buttonContainer.contains(button)) return;

      const clickedNumber = Number(button.dataset.number);
      if (clickedNumber !== expectedNumber) {
        expectedNumber = 1;
        buttonContainer.querySelectorAll<HTMLButtonElement>(".level-06__button").forEach((item) => {
          item.hidden = false;
        });
        return;
      }

      button.hidden = true;
      expectedNumber += 1;
      if (expectedNumber === 4) complete();
    });
  },
};
