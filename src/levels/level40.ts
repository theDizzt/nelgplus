import { SOUND_EFFECTS, assetUrl } from "../core/assets";
import { clientPointToLocal, type LocalPoint } from "../core/floatingPosition";
import type { LevelDefinition } from "../core/types";

const MAX_POINTER_SPEED = 40;

interface Level40Scene {
  readonly title: string;
  readonly body: readonly string[];
  readonly emphasis?: string;
}

const SCENES: readonly Level40Scene[] = [
  {
    title: "Fury and Speed",
    body: [
      "It's human nature to like",
      "speed, so if you let go for a",
      "moment, the accelerator will",
      "gradually apply more power.",
      "When you are overtaken, you",
      "feel a sense of competition.",
    ],
  },
  {
    title: "Fury and Speed",
    body: [
      "If you have been in a stressful",
      "situation, the problem becomes bigger.",
      "You grip the steering wheel, not",
      "wanting to lose. You get into a rage with",
      "someone you've never seen before. Not",
      "only will you be fined, but if you are not",
      "careful, many people will be put at risk.",
    ],
  },
  {
    title: "Fury and Speed",
    body: [
      "Jerry Diefenbacher, a psychology",
      "professor at Colorado State University,",
      "studied the relationship between anger",
      "and thinking. However, the most",
      "important cause of accidents was not",
      "poor driving skills. ",
    ],
    emphasis: "It was anger.",
  },
  {
    title: "Slow Down",
    body: [
      "A limit is not there to annoy you.",
      "It is there because the world needs time",
      "to react to sudden decisions.",
    ],
  },
  {
    title: "Slow Down",
    body: [
      "Move patiently.",
      "Even a small rush can carry you",
      "farther than you intended.",
    ],
  },
  {
    title: "Slow Down",
    body: [
      "In this level, speed is the trap.",
      "Keep the cursor calm and steady.",
    ],
  },
  {
    title: "Slow Down",
    body: [
      "Do not fight the limit.",
      "Let your hand become slower than",
      "your first instinct.",
    ],
  },
  {
    title: "Slow Down",
    body: [
      "You made it this far.",
      "One last careful movement will carry",
      "you through the limitation.",
    ],
  },
] as const;

function renderBody(scene: (typeof SCENES)[number]): string {
  const lines = scene.body.map((line) => `<span>${line}</span>`).join("");
  return scene.emphasis ? `${lines}<span><em>${scene.emphasis}</em></span>` : lines;
}

export const level40: LevelDefinition = {
  number: 40,
  title: "Limitation",
  scenes: SCENES.map((_, index) => ({ id: String(index + 1), label: `Scene ${index + 1}` })),
  mount({ screen, listen, audio, complete, restart, initialScene }) {
    let sceneIndex = Math.max(0, Math.min(SCENES.length - 1, Number(initialScene ?? "1") - 1));
    let previousPointer: { readonly point: LocalPoint; readonly time: number } | undefined;
    let failed = false;

    const renderScene = () => {
      const scene = SCENES[sceneIndex];
      if (!scene) return;
      screen.className = "level-screen level-40";
      screen.dataset.scene = String(sceneIndex + 1);
      screen.style.setProperty("--level-40-bg", `url("${assetUrl("images/level40bg1.png")}")`);
      screen.innerHTML = `
        <header class="level-heading level-40__heading" aria-label="Level 40, Limitation">
          <div class="level-heading__number level-40__title">Level 40</div>
          <h1 class="level-40__subtitle">Limitation</h1>
        </header>

        <article class="level-40__copy" aria-live="polite">
          <h2>${scene.title}</h2>
          <p>${renderBody(scene)}</p>
        </article>

        <button class="level-40__next" type="button" aria-label="Continue to the next screen"></button>
        <p class="level-40__warning" role="alert">TOO FAST</p>
      `;
      previousPointer = undefined;
    };

    const fail = () => {
      if (failed) return;
      failed = true;
      screen.classList.add("is-too-fast");
      audio.playEffect(SOUND_EFFECTS.break);
      window.setTimeout(() => restart(), 520);
    };

    renderScene();

    listen(screen, "pointermove", (event) => {
      if (failed) return;
      if (sceneIndex < 3) {
        previousPointer = undefined;
        return;
      }
      const point = clientPointToLocal(screen, event.clientX, event.clientY);
      const time = event.timeStamp;
      if (previousPointer) {
        const deltaSeconds = Math.max((time - previousPointer.time) / 1000, 0.001);
        const distance = Math.hypot(point.x - previousPointer.point.x, point.y - previousPointer.point.y);
        if (distance / deltaSeconds > MAX_POINTER_SPEED) {
          fail();
          return;
        }
      }
      previousPointer = { point, time };
    });

    listen(screen, "pointerleave", () => {
      previousPointer = undefined;
    });

    listen(screen, "click", (event) => {
      const button = (event.target as Element).closest<HTMLButtonElement>(".level-40__next");
      if (!button || failed) return;
      audio.playEffect(SOUND_EFFECTS.smack);
      button.disabled = true;
      if (sceneIndex >= SCENES.length - 1) {
        complete();
        return;
      }
      sceneIndex += 1;
      renderScene();
    });
  },
};
