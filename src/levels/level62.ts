import { SOUND_EFFECTS } from "../core/assets";
import type { LevelDefinition } from "../core/types";

const QUESTION_COUNT = 30;
const OPTIONS = [
  { color: "red", label: "RED ANSWER" },
  { color: "yellow", label: "YELLOW ANSWER" },
  { color: "green", label: "GREEN ANSWER" },
  { color: "blue", label: "BLUE ANSWER" },
] as const;

export const level62: LevelDefinition = {
  number: 62,
  title: "Testify",
  scenes: [
    { id: "1", label: "Scene 1 - Main" },
    { id: "2", label: "Scene 2 - Quiz" },
    { id: "3", label: "Scene 3 - Result" },
  ],
  mount({ screen, initialScene, audio, listen }) {
    screen.className = "level-screen level-62";
    screen.innerHTML = `
      <div class="level-62__paper" aria-hidden="true"></div>
      <header class="level-heading">
        <div class="level-heading__number">Level 62</div>
        <h1>Testify</h1>
      </header>
      <section class="level-62__scene level-62__main" data-panel="1">
        <p class="level-62__intro" lang="ja">そろそろ狂い始めています &gt;:D</p>
        <button class="level-62__begin" type="button">BEGIN</button>
      </section>
      <section class="level-62__scene level-62__quiz" data-panel="2" hidden>
        <p class="level-62__question-number" aria-live="polite"></p>
        <p class="level-62__question">QUIZ CONTENT COMING SOON</p>
        <div class="level-62__answers" role="group" aria-label="Answer choices">
          ${OPTIONS.map((option, index) => `
            <button class="level-62__answer level-62__answer--${option.color}" type="button" data-answer="${index}">
              <span class="level-62__diamond" aria-hidden="true"></span>
              <span>${option.label}</span>
            </button>
          `).join("")}
        </div>
      </section>
      <section class="level-62__scene level-62__result" data-panel="3" hidden>
        <p>SCENE 3<br><span>COMING SOON</span></p>
      </section>
    `;

    const questionNumber = screen.querySelector<HTMLElement>(".level-62__question-number")!;
    let questionIndex = 0;

    const updateQuestion = () => {
      questionNumber.textContent = `QUESTION ${questionIndex + 1} / ${QUESTION_COUNT}`;
    };
    const showScene = (scene: string) => {
      screen.dataset.scene = scene;
      screen.setAttribute("aria-label", `Level 62: Testify, Scene ${scene}`);
      screen.querySelectorAll<HTMLElement>("[data-panel]").forEach(panel => {
        panel.hidden = panel.dataset.panel !== scene;
      });
      if (scene === "2") {
        updateQuestion();
        screen.querySelector<HTMLButtonElement>(".level-62__answer")?.focus({ preventScroll: true });
      }
    };

    listen(screen.querySelector<HTMLButtonElement>(".level-62__begin")!, "click", () => {
      questionIndex = 0;
      showScene("2");
    });
    screen.querySelectorAll<HTMLButtonElement>(".level-62__answer").forEach(button => {
      listen(button, "click", () => {
        audio.playEffect(SOUND_EFFECTS.smack);
        questionIndex += 1;
        if (questionIndex >= QUESTION_COUNT) showScene("3");
        else updateQuestion();
      });
    });

    void audio.playMusic("music/level62.mp3", true);
    const scene = ["1", "2", "3"].includes(initialScene ?? "") ? initialScene! : "1";
    questionIndex = scene === "3" ? QUESTION_COUNT : 0;
    showScene(scene);
    return () => audio.stopMusic();
  },
};
