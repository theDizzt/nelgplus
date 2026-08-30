import type { LevelDefinition } from "../core/types";

export const level02: LevelDefinition = {
  number: 2,
  title: "Tutorial II",
  mount({ screen, complete, wrongAnswer, listen, session }) {
    const revivalMode = session.hasFlag("level50-enhanced-run");
    screen.className = `level-screen level-02${revivalMode ? " level-02--revival" : ""}`;
    screen.innerHTML = `
      <div class="level-02__orb" aria-hidden="true"></div>

      <header class="level-heading level-02__heading">
        <div class="level-heading__number">Level 2</div>
        <h1>TUTORIAL II - TYPING</h1>
      </header>

      <div class="level-02__copy">
        <p class="level-02__lead">
          Secondly, you should know that keyboard<br />
          operation is required in addition to mouse<br />
          operation.
        </p>
        <p>
          Sometimes it is necessary to use the keyboard rather<br />
          than the mouse operation. You will learn when to use<br />
          the keyboard through future levels. This time you will<br />
          learn simple keyboard operation.
        </p>
      </div>

      <p class="level-02__prompt">Try typing &quot;N&quot; on your keyboard!</p>
    `;

    listen(document, "keydown", (event) => {
      const answer = revivalMode ? "8" : "n";
      if (event.repeat) return;
      if (event.key.toLowerCase() === answer) {
        complete();
        return;
      }
      if (revivalMode && event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) wrongAnswer();
    });
  },
};
