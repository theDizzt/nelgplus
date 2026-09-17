import { assetUrl } from "../core/assets";
import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelDefinition } from "../core/types";

export const level64: LevelDefinition = {
  number: 64,
  title: "Search",
  scenes: [{ id: "main", label: "Main" }],
  mount({ screen, listen, complete }) {
    screen.className = "level-screen level-64";
    screen.innerHTML = `
      <header class="level-heading level-64__heading">
        <div class="level-heading__number">Level 64</div>
        <h1>Search</h1>
      </header>
      <div class="level-64__content">
        <form class="level-08__form level-64__form" autocomplete="off">
          <input class="nelg-password-input" type="text" data-allow-select autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Password">
          <button type="submit">GO</button>
        </form>
      </div>
    `;
    const form = screen.querySelector<HTMLFormElement>("form")!;
    const input = form.querySelector<HTMLInputElement>("input")!;
    const password = attachStarMaskedInput(input, listen);
    const submit = (event: Event) => {
      event.preventDefault();
      const answer = password.getValue().trim();
      if (answer === "5") complete();
    };
    listen(form, "submit", submit);
    listen(input, "keydown", event => {
      if (event.key !== "Enter" || event.repeat) return;
      event.preventDefault();
      form.requestSubmit();
    });
  },
};
