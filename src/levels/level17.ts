import type { LevelDefinition } from "../core/types";

export const level17: LevelDefinition = {
  number: 17,
  title: "Title",
  mount({ screen, complete, wrongAnswer, unlockAchievement, listen, session }) {
    const revival = session.hasFlag("level50-enhanced-run");
    screen.className = `level-screen level-17${revival ? " level-17--revival" : ""}`;
    screen.innerHTML = `
      <header class="level-heading level-17__heading">
        <input class="level-heading__number level-17__title" data-allow-select type="text" value="Level 17"
          aria-label="Editable level title" autocomplete="off" autocapitalize="off" spellcheck="false" />
        <h1>Title</h1>
      </header>
    `;

    const editableTitle = screen.querySelector<HTMLInputElement>(".level-17__title");
    if (!editableTitle) return;

    editableTitle.focus();
    editableTitle.setSelectionRange(editableTitle.value.length, editableTitle.value.length);

    const tryComplete = () => {
      const requestedLevel = editableTitle.value.trim();
      if (requestedLevel === (revival ? "Level 51" : "Level 18")) {
        complete();
        return;
      }
      if (revival) {
        wrongAnswer();
        return;
      }
      if (/^Level\s+-?\d+$/i.test(requestedLevel)) unlockAchievement(15);
    };

    listen(editableTitle, "keydown", (event) => {
      if (event.key !== "Enter" || event.repeat) return;
      event.preventDefault();
      tryComplete();
    });
  },
};
