import { assetUrl, SOUND_EFFECTS } from "../core/assets";
import { blockTabNavigation } from "../core/blockTabNavigation";
import { setHandwritingText } from "../core/HandwritingText";
import type { LevelDefinition } from "../core/types";
import { getLevel62Result, LEVEL62_QUESTIONS } from "./level62Questions";

const QUESTION_COUNT = LEVEL62_QUESTIONS.length;
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
    blockTabNavigation(listen);
    screen.className = "level-screen level-62";
    screen.innerHTML = `
      <svg class="level-62__filters" aria-hidden="true" focusable="false">
        <defs>
          <filter id="level-62-cloth-texture" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.72 0.045" numOctaves="2" seed="62" result="warpThreads" />
            <feTurbulence type="fractalNoise" baseFrequency="0.045 0.72" numOctaves="2" seed="63" result="weftThreads" />
            <feBlend in="warpThreads" in2="weftThreads" mode="multiply" result="wovenFibers" />
            <feColorMatrix in="wovenFibers" type="saturate" values="0" result="grayFibers" />
            <feComponentTransfer in="grayFibers" result="softFibers">
              <feFuncR type="linear" slope="0.22" intercept="0.78" />
              <feFuncG type="linear" slope="0.22" intercept="0.78" />
              <feFuncB type="linear" slope="0.22" intercept="0.78" />
            </feComponentTransfer>
            <feComposite in="softFibers" in2="SourceAlpha" operator="in" result="clothGrain" />
            <feBlend in="SourceGraphic" in2="clothGrain" mode="multiply" />
          </filter>
        </defs>
      </svg>
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
        <div class="level-62__question-content">
          <p class="level-62__question"></p>
          <img class="level-62__question-image" hidden />
        </div>
        <div class="level-62__answers" role="group" aria-label="Answer choices">
          ${OPTIONS.map((option, index) => `
            <button class="level-62__answer level-62__answer--${option.color}" type="button" data-answer="${index}">
              <span>${option.label}</span>
            </button>
          `).join("")}
        </div>
      </section>
      <section class="level-62__scene level-62__result" data-panel="3" hidden>
        <div class="level-62__result-content" aria-live="polite">
          <p class="level-62__score"></p>
          <h2 class="level-62__result-title"></h2>
          <p class="level-62__result-message"></p>
          <button class="level-62__retry" type="button">TRY AGAIN</button>
        </div>
      </section>
    `;

    const questionNumber = screen.querySelector<HTMLElement>(".level-62__question-number")!;
    const questionText = screen.querySelector<HTMLElement>(".level-62__question")!;
    const questionContent = screen.querySelector<HTMLElement>(".level-62__question-content")!;
    const questionImage = screen.querySelector<HTMLImageElement>(".level-62__question-image")!;
    const answerLabels = screen.querySelectorAll<HTMLElement>(".level-62__answer > span");
    let questionIndex = 0;
    let totalScore = 0;

    const updateQuestion = () => {
      const question = LEVEL62_QUESTIONS[questionIndex]!;
      setHandwritingText(questionNumber, `${questionIndex + 1}.`);
      questionNumber.setAttribute("aria-label", `Question ${questionIndex + 1} of ${QUESTION_COUNT}`);
      setHandwritingText(questionText, question.text);
      answerLabels.forEach((label, index) => setHandwritingText(label, question.choices[index]!.text));
      questionContent.classList.toggle("has-image", Boolean(question.image));
      questionImage.hidden = !question.image;
      questionImage.alt = question.imageAlt ?? question.text;
      if (question.image) questionImage.src = assetUrl(`images/${question.image}`);
      else questionImage.removeAttribute("src");
      questionContent.scrollTop = 0;
      answerLabels.forEach(label => { label.scrollTop = 0; });
    };
    const updateResult = () => {
      const result = getLevel62Result(totalScore);
      screen.dataset.result = result.id;
      screen.dataset.score = String(totalScore);
      setHandwritingText(screen.querySelector<HTMLElement>(".level-62__score")!, `SCORE ${totalScore}`);
      setHandwritingText(screen.querySelector<HTMLElement>(".level-62__result-title")!, result.title);
      setHandwritingText(screen.querySelector<HTMLElement>(".level-62__result-message")!, result.message);
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
      if (scene === "3") updateResult();
    };

    const startQuiz = () => {
      questionIndex = 0;
      totalScore = 0;
      delete screen.dataset.result;
      delete screen.dataset.score;
      showScene("2");
    };
    listen(screen.querySelector<HTMLButtonElement>(".level-62__begin")!, "click", startQuiz);
    listen(screen.querySelector<HTMLButtonElement>(".level-62__retry")!, "click", startQuiz);
    screen.querySelectorAll<HTMLButtonElement>(".level-62__answer").forEach(button => {
      listen(button, "click", () => {
        if (screen.dataset.scene !== "2" || questionIndex >= QUESTION_COUNT) return;
        const answerIndex = Number(button.dataset.answer);
        totalScore += LEVEL62_QUESTIONS[questionIndex]!.choices[answerIndex]!.score;
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
    return () => {
      delete screen.dataset.result;
      delete screen.dataset.score;
      audio.stopMusic();
    };
  },
};
