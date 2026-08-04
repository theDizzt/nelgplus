import type { LevelDefinition } from "../core/types";

function placeCaretAtEnd(element: HTMLElement): void {
  const selection = window.getSelection();
  if (!selection) return;

  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

export const level17: LevelDefinition = {
  number: 17,
  title: "Title",
  mount({ screen, complete, listen }) {
    screen.className = "level-screen level-17";
    screen.innerHTML = `
      <header class="level-heading level-17__heading">
        <div class="level-heading__number level-17__title" data-allow-select contenteditable="true"
          role="textbox" aria-label="Editable level title" aria-multiline="false" spellcheck="false">Level 17</div>
        <h1>Title</h1>
      </header>
    `;

    const editableTitle = screen.querySelector<HTMLElement>(".level-17__title");
    if (!editableTitle) return;

    editableTitle.focus();
    placeCaretAtEnd(editableTitle);

    listen(editableTitle, "beforeinput", (event) => {
      if ((event as InputEvent).inputType === "insertParagraph") event.preventDefault();
    });

    listen(editableTitle, "paste", (event) => {
      event.preventDefault();
      const text = (event as ClipboardEvent).clipboardData?.getData("text").replace(/[\r\n]+/g, " ") ?? "";
      const selection = window.getSelection();
      if (!selection?.rangeCount) return;

      const range = selection.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(text);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    });

    listen(editableTitle, "keydown", (event) => {
      if (event.key !== "Enter" || event.repeat) return;
      event.preventDefault();

      const answer = (editableTitle.textContent ?? "")
        .replace(/\u00a0/g, " ")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();

      if (answer === "level 18") complete();
    });
  },
};
