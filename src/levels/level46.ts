import type { LevelDefinition } from "../core/types";

const WARNING_COPY: Readonly<Record<number, readonly string[]>> = {
  1: [
    'WARNING! This level contains a huge button in the center that reads "Open unlimited browser windows"',
    "DO NOT PRESS THIS BUTTON!",
    "This button will literally open unlimited browser windows to google and yahoo and probably crash your computer!",
  ],
  2: [
    "Please take the warning seriously! I swear to God that if you press the center button on level 46 it will keep opening webpages and you might not be able to stop it! I'm not really religious, but I do not \"swear to God\" unless I mean it, even in written form!",
    "I ASSURE YOU that you can beat the level WITHOUT pressing the center button....",
    "In fact, I SWEAR TO GOD you can...",
  ],
  3: [
    "Pressing continue again will bring you to level 46.",
    "If for some reason you don't believe me and decide to press the button anyway, please make sure you're ready for your computer to crash.",
    "This means save any programs you have running, and make sure you're not at a call center or something.... your boss will be pissed....",
  ],
};

const SCENES = [
  { id: "warning-1", label: "Scene 1 - Warning 1" },
  { id: "warning-2", label: "Scene 2 - Warning 2" },
  { id: "warning-3", label: "Scene 3 - Warning 3" },
  { id: "main", label: "Scene 4 - Main" },
  { id: "error", label: "Scene 5 - Error" },
] as const;

function sceneFromId(id: string | undefined): number {
  const index = SCENES.findIndex((scene) => scene.id === id);
  return index >= 0 ? index + 1 : 1;
}

function renderHeading(): string {
  return `
    <header class="level-heading level-46__heading" aria-label="Level 46, Hazard">
      <div class="level-heading__number">Level 46</div>
      <h1>Hazard</h1>
    </header>
  `;
}

function renderWarning(sceneNumber: number, showButton: boolean): string {
  const paragraphs = WARNING_COPY[sceneNumber] ?? WARNING_COPY[1]!;
  return `
    ${renderHeading()}
    <div class="level-46__warning-copy">
      ${paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("")}
    </div>
    <button class="level-46__continue" type="button"${showButton ? "" : " hidden"}>Continue...</button>
  `;
}

function renderPendingScene(sceneNumber: number): string {
  return `
    ${renderHeading()}
    <p class="level-46__pending">${sceneNumber === 4 ? "MAIN SCREEN" : "ERROR SCREEN"}</p>
  `;
}

function renderMainScene(): string {
  return `
    ${renderHeading()}
    <div class="level-46__hazard-bg" aria-hidden="true">
      <span class="level-46__hazard-stripes"></span>
      <span class="level-46__hazard-wave level-46__hazard-wave--top"></span>
      <span class="level-46__hazard-wave level-46__hazard-wave--middle"></span>
      <span class="level-46__hazard-wave level-46__hazard-wave--bottom"></span>
      <span class="level-46__hazard-shadow level-46__hazard-shadow--upper"></span>
      <span class="level-46__hazard-shadow level-46__hazard-shadow--lower"></span>
    </div>
    <button class="level-46__open-button" type="button">Open unlimited browser windows</button>
  `;
}

export const level46: LevelDefinition = {
  number: 46,
  title: "Hazard",
  scenes: SCENES,
  mount({ screen, initialScene, listen, timeout, complete }) {
    let currentScene = sceneFromId(initialScene);

    const renderScene = () => {
      screen.className = `level-screen level-46 level-46--scene-${currentScene}`;
      if (currentScene >= 1 && currentScene <= 3) {
        const delayedButton = currentScene === 1;
        screen.innerHTML = renderWarning(currentScene, !delayedButton);
        const continueButton = screen.querySelector<HTMLButtonElement>(".level-46__continue");
        if (!continueButton) return;

        if (delayedButton) timeout(() => { continueButton.hidden = false; }, 20_000);
        listen(continueButton, "click", () => {
          currentScene += 1;
          renderScene();
        });
        return;
      }

      screen.innerHTML = currentScene === 4 ? renderMainScene() : renderPendingScene(currentScene);
      const openButton = screen.querySelector<HTMLButtonElement>(".level-46__open-button");
      if (openButton) listen(openButton, "click", complete, { once: true });
    };

    renderScene();
  },
};
