import type { LevelDefinition } from "../core/types";

const OBJECT_COUNT = 12;

export const level07: LevelDefinition = {
  number: 7,
  title: "Tidy Up",
  mount({ screen, complete, listen }) {
    screen.className = "level-screen level-07";
    screen.innerHTML = `
      <header class="level-heading level-07__heading">
        <div class="level-heading__number">Level 7</div>
        <h1>Tidy Up</h1>
      </header>

      <p class="level-07__message">Get all this useless junk off the screen.</p>

      <button class="level-07__finish" type="button" aria-label="Continue to Level 8" disabled></button>

      <div class="level-07__clutter" aria-label="Objects covering the button">
        ${Array.from(
          { length: OBJECT_COUNT },
          (_, index) => `
            <div class="level-07__object level-07__object--${index + 1}"
              data-object-number="${index + 1}" data-allow-drag role="img"
              aria-label="Movable object ${index + 1}"><span></span></div>
          `,
        ).join("")}
      </div>
    `;

    const finishButton = screen.querySelector<HTMLButtonElement>(".level-07__finish");
    const clutter = screen.querySelector<HTMLElement>(".level-07__clutter");
    if (!finishButton || !clutter) return;

    let remainingObjects = OBJECT_COUNT;
    let draggedObject: HTMLElement | undefined;
    let activePointer: number | undefined;
    let pointerOffsetX = 0;
    let pointerOffsetY = 0;

    const clearObject = (object: HTMLElement, pointerId: number) => {
      object.classList.remove("is-dragging");
      if (object.hasPointerCapture(pointerId)) object.releasePointerCapture(pointerId);
      object.classList.add("is-cleared");
      remainingObjects -= 1;
      if (remainingObjects === 0) {
        finishButton.disabled = false;
        finishButton.classList.add("is-ready");
      }
      draggedObject = undefined;
      activePointer = undefined;
    };

    const endDrag = (event: PointerEvent) => {
      if (!draggedObject || event.pointerId !== activePointer) return;

      const object = draggedObject;
      const screenBounds = screen.getBoundingClientRect();
      const objectBounds = object.getBoundingClientRect();
      const isOutside =
        objectBounds.left < screenBounds.left || objectBounds.right > screenBounds.right ||
        objectBounds.top < screenBounds.top || objectBounds.bottom > screenBounds.bottom;

      object.classList.remove("is-dragging");
      if (object.hasPointerCapture(event.pointerId)) object.releasePointerCapture(event.pointerId);

      if (isOutside) {
        clearObject(object, event.pointerId);
        return;
      }

      draggedObject = undefined;
      activePointer = undefined;
    };

    listen(clutter, "pointerdown", (event) => {
      const object = (event.target as Element).closest<HTMLElement>(".level-07__object");
      if (!object || !clutter.contains(object) || object.classList.contains("is-cleared")) return;

      const screenBounds = screen.getBoundingClientRect();
      const objectBounds = object.getBoundingClientRect();
      draggedObject = object;
      activePointer = event.pointerId;
      pointerOffsetX = event.clientX - objectBounds.left;
      pointerOffsetY = event.clientY - objectBounds.top;
      object.style.left = `${objectBounds.left - screenBounds.left}px`;
      object.style.top = `${objectBounds.top - screenBounds.top}px`;
      object.style.rotate = "none";
      object.style.transform = "none";
      object.classList.add("is-dragging");
      object.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    listen(clutter, "pointermove", (event) => {
      if (!draggedObject || event.pointerId !== activePointer) return;
      const screenBounds = screen.getBoundingClientRect();
      draggedObject.style.left = `${event.clientX - screenBounds.left - pointerOffsetX}px`;
      draggedObject.style.top = `${event.clientY - screenBounds.top - pointerOffsetY}px`;

      const objectBounds = draggedObject.getBoundingClientRect();
      if (
        objectBounds.left < screenBounds.left || objectBounds.right > screenBounds.right ||
        objectBounds.top < screenBounds.top || objectBounds.bottom > screenBounds.bottom
      ) {
        clearObject(draggedObject, event.pointerId);
      }
      event.preventDefault();
    });

    listen(clutter, "pointerup", endDrag);
    listen(clutter, "pointercancel", endDrag);
    listen(finishButton, "click", () => {
      if (remainingObjects === 0) complete();
    });
  },
};
