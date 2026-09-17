import { assetUrl } from "../core/assets";
import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelDefinition } from "../core/types";

export const level63: LevelDefinition = {
  number: 63,
  title: "Search",
  scenes: [{ id: "main", label: "Main" }],
  mount({ screen, listen, complete }) {
    screen.className = "level-screen level-63";
    screen.innerHTML = `
      <header class="level-heading level-63__heading">
        <div class="level-heading__number">Level 63</div>
        <h1>Search</h1>
      </header>
      <div class="level-63__content">
        <div class="level-63__copy">
          <p class="level-63__lead">You've come a long way, climbing all the way up here from the very bottom.</p>
          <p>Along the way, you've faced countless hardships,<br>
            been torn apart, bruised, and wounded.<br>
            So for your sake,<br>
            let's take a little time to rest.<br>
            Please make yourself comfortable and enjoy your visit.</p>
          <a class="level-63__link" href="https://dizzt3942.neocities.org/" target="_blank" rel="noopener noreferrer">https://dizzt3942.neocities.org/</a>
          <p>If you look carefully,<br>
            I've hidden something nice here just for you.<br>
            See if you can find out what's waiting for you...</p>
        </div>
        <img class="level-63__art" src="${assetUrl("images/level63a.png")}" alt="A hidden night scene illustration" draggable="false">
        <form class="level-08__form level-63__form" autocomplete="off">
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
      if (answer === "asterisk" || answer === "snowflake") complete();
    };
    listen(form, "submit", submit);
    listen(input, "keydown", event => {
      if (event.key !== "Enter" || event.repeat) return;
      event.preventDefault();
      form.requestSubmit();
    });
  },
};
