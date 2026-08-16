import { assetUrl, SOUND_EFFECTS } from "../core/assets";
import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelDefinition } from "../core/types";

type DrinkId = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h";

interface DrinkDefinition {
  readonly id: DrinkId;
  readonly name: string;
  readonly image: string;
  readonly threshold: number;
  readonly highlightedLetter: string;
  readonly highlightedOccurrence: number;
  readonly screenClass: string;
}

const DRINKS: readonly DrinkDefinition[] = [
  { id: "a", name: "PEPSI", image: "level36a.png", threshold: 59, highlightedLetter: "I", highlightedOccurrence: 1, screenClass: "level-36--pepsi" },
  { id: "b", name: "PEPSI ZERO LIME", image: "level36b.png", threshold: 31, highlightedLetter: "O", highlightedOccurrence: 1, screenClass: "level-36--lime" },
  { id: "c", name: "COCA COLA", image: "level36c.png", threshold: 24, highlightedLetter: "C", highlightedOccurrence: 1, screenClass: "level-36--cola" },
  { id: "d", name: "MOUNTAIN DEW", image: "level36d.png", threshold: 47, highlightedLetter: "T", highlightedOccurrence: 1, screenClass: "level-36--dew" },
  { id: "e", name: "RED BULL", image: "level36e.png", threshold: 76, highlightedLetter: "U", highlightedOccurrence: 1, screenClass: "level-36--bull" },
  { id: "f", name: "FANTA ORANGE", image: "level36f.png", threshold: 39, highlightedLetter: "N", highlightedOccurrence: 1, screenClass: "level-36--fanta" },
  { id: "g", name: "DR. PEPPER", image: "level36g.png", threshold: 84, highlightedLetter: "E", highlightedOccurrence: 2, screenClass: "level-36--pepper" },
  { id: "h", name: "MONSTER", image: "level36h.png", threshold: 69, highlightedLetter: "N", highlightedOccurrence: 1, screenClass: "level-36--monster" },
] as const;

function emphasizeLetter(text: string, letter: string, occurrence: number): string {
  let remaining = occurrence;
  return [...text].map((character) => {
    if (character === letter && --remaining === 0) {
      return `<span class="level-36__chosen-letter">${character}</span>`;
    }
    return character;
  }).join("");
}

function heading(): string {
  return `<header class="level-heading level-36__heading">
    <div class="level-heading__number">Level 36</div>
    <h1>Vending Machine</h1>
  </header>`;
}

export const level36: LevelDefinition = {
  number: 36,
  title: "Vending Machine",
  scenes: [
    { id: "1", label: "Scene 1 — Vending machine" },
    ...DRINKS.map((drink) => ({ id: drink.id, label: `${drink.name} selection` })),
    { id: "killed", label: "Killed drink" },
  ],
  mount(context) {
    const { screen, complete, audio, initialScene } = context;
    let sceneController = new AbortController();
    let selectedDrink: DrinkDefinition = DRINKS[0]!;
    let clickCount = 0;

    screen.style.setProperty("--level-36-warp", `url("${assetUrl("images/warp.png")}")`);
    screen.style.setProperty("--level-36-magic", `url("${assetUrl("images/level36bg.png")}")`);

    const resetSceneListeners = () => {
      sceneController.abort();
      sceneController = new AbortController();
    };

    const on = <K extends keyof HTMLElementEventMap>(
      target: HTMLElement,
      type: K,
      listener: (event: HTMLElementEventMap[K]) => void,
    ) => target.addEventListener(type, listener as EventListener, { signal: sceneController.signal });

    const playSmack = () => audio.playEffect(SOUND_EFFECTS.smack);

    const renderLobby = () => {
      resetSceneListeners();
      screen.className = "level-screen level-36 level-36--lobby";
      screen.innerHTML = `${heading()}
        <div class="level-36__intro">
          <p>This level is a short breather...</p>
          <p>Abracadabra...</p>
          <p>The magic vending machine has eight drinks. Choose your favorite flavor.</p>
        </div>
        <div class="level-36__drink-grid" aria-label="Magic vending machine drinks">
          ${DRINKS.map((drink) => `<button class="level-36__drink-choice" type="button" data-drink="${drink.id}" aria-label="Choose ${drink.name}">
            <img src="${assetUrl(`images/${drink.image}`)}" alt="${drink.name}" draggable="false" />
          </button>`).join("")}
        </div>`;

      screen.querySelectorAll<HTMLButtonElement>(".level-36__drink-choice").forEach((button) => {
        on(button, "pointerenter", () => button.classList.add("is-hovered"));
        on(button, "pointerleave", () => button.classList.remove("is-hovered"));
        on(button, "click", () => {
          button.classList.remove("is-hovered");
          const drink = DRINKS.find((candidate) => candidate.id === button.dataset.drink);
          if (!drink) return;
          playSmack();
          renderDrink(drink);
        });
      });
    };

    const renderDrink = (drink: DrinkDefinition) => {
      resetSceneListeners();
      selectedDrink = drink;
      clickCount = 0;
      screen.className = `level-screen level-36 level-36--choice ${drink.screenClass}`;
      screen.innerHTML = `${heading()}
        <p class="level-36__choice-message">YOU HAVE CHOSEN ${emphasizeLetter(drink.name, drink.highlightedLetter, drink.highlightedOccurrence)}!!!</p>
        <button class="level-36__drink-focus" type="button" aria-label="Click the ${drink.name} drink">
          <img src="${assetUrl(`images/${drink.image}`)}" alt="${drink.name}" draggable="false" />
        </button>
        <button class="level-36__back" type="button">BACK</button>`;

      const drinkButton = screen.querySelector<HTMLButtonElement>(".level-36__drink-focus");
      const backButton = screen.querySelector<HTMLButtonElement>(".level-36__back");
      if (drinkButton) {
        on(drinkButton, "click", () => {
          playSmack();
          clickCount += 1;
          drinkButton.classList.remove("is-hit");
          void drinkButton.offsetWidth;
          drinkButton.classList.add("is-hit");
          if (clickCount >= drink.threshold) renderKilled(drink);
        });
      }
      if (backButton) on(backButton, "click", renderLobby);
    };

    const renderKilled = (drink: DrinkDefinition) => {
      resetSceneListeners();
      selectedDrink = drink;
      screen.className = "level-screen level-36 level-36--killed";
      screen.innerHTML = `${heading()}
        <p class="level-36__death-message">YOU KILLED YOUR DRINK!!!</p>
        <img class="level-36__dead-drink" src="${assetUrl(`images/${drink.image}`)}" alt="The defeated ${drink.name} drink" draggable="false" />
        <button class="level-36__back" type="button">BACK</button>
        <form class="level-36__form" autocomplete="off">
          <div class="level-36__controls">
            <input class="nelg-password-input" id="level-36-answer" name="nelg-level-thirty-six-answer" data-allow-select
              data-form-type="other" data-lpignore="true" data-1p-ignore="true" type="text" maxlength="24"
              autocomplete="off" autocapitalize="off" aria-autocomplete="none" spellcheck="false" aria-label="Password" />
            <button type="submit">GO</button>
          </div>
        </form>`;

      const backButton = screen.querySelector<HTMLButtonElement>(".level-36__back");
      const form = screen.querySelector<HTMLFormElement>(".level-36__form");
      const input = screen.querySelector<HTMLInputElement>("#level-36-answer");
      if (backButton) on(backButton, "click", renderLobby);
      if (!form || !input) return;
      const maskedInput = attachStarMaskedInput(input, context.listen);
      input.focus();
      on(input, "animationend", () => input.classList.remove("is-wrong"));
      on(input, "keydown", (event) => {
        if (event.key !== "Enter" || event.repeat) return;
        event.preventDefault();
        form.requestSubmit();
      });
      on(form, "submit", (event) => {
        event.preventDefault();
        if (maskedInput.getValue() === "continue") complete();
        else {
          maskedInput.clear();
          input.classList.remove("is-wrong");
          void input.offsetWidth;
          input.classList.add("is-wrong");
          input.focus();
        }
      });
    };

    const requestedDrink = DRINKS.find((drink) => drink.id === initialScene);
    if (initialScene === "killed") renderKilled(selectedDrink);
    else if (requestedDrink) renderDrink(requestedDrink);
    else renderLobby();

    return () => sceneController.abort();
  },
};
