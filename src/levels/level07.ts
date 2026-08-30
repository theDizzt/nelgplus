import type { LevelDefinition } from "../core/types";
import { SOUND_EFFECTS } from "../core/assets";

const OBJECT_COUNT = 12;

export const level07: LevelDefinition = {
  number: 7,
  title: "Tidy Up",
  mount({ screen, complete, wrongAnswer, unlockAchievement, listen, audio, session }) {
    const revival = session.hasFlag("level50-enhanced-run");
    screen.className = `level-screen level-07${revival ? " level-07--revival" : ""}`;
    screen.innerHTML = `
      <header class="level-heading level-07__heading">
        <div class="level-heading__number">Level 7</div>
        <h1>Tidy Up</h1>
      </header>

      <p class="level-07__message">Get all this useless junk off the screen.</p>

      <button class="level-07__finish" type="button" aria-label="Continue to Level 8" aria-disabled="true"></button>

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
    let shakeDistance = 0;
    let shakeTurns = 0;
    let lastPointerX = 0;
    let lastDirection = 0;

    const clearObject = (object: HTMLElement, pointerId: number) => {
      object.classList.remove("is-dragging");
      if (object.hasPointerCapture(pointerId)) object.releasePointerCapture(pointerId);
      object.classList.add("is-cleared");
      remainingObjects -= 1;
      if (remainingObjects === 0) {
        finishButton.setAttribute("aria-disabled", "false");
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

      const clutterBounds = clutter.getBoundingClientRect();
      const objectBounds = object.getBoundingClientRect();
      const scaleX = clutter.clientWidth / clutterBounds.width;
      const scaleY = clutter.clientHeight / clutterBounds.height;
      draggedObject = object;
      activePointer = event.pointerId;
      shakeDistance = 0;
      shakeTurns = 0;
      lastPointerX = event.clientX;
      lastDirection = 0;
      pointerOffsetX = (event.clientX - objectBounds.left) * scaleX;
      pointerOffsetY = (event.clientY - objectBounds.top) * scaleY;
      object.style.left = `${(objectBounds.left - clutterBounds.left) * scaleX}px`;
      object.style.top = `${(objectBounds.top - clutterBounds.top) * scaleY}px`;
      object.style.rotate = "none";
      object.style.transform = "none";
      object.classList.add("is-dragging");
      object.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    listen(clutter, "pointermove", (event) => {
      if (!draggedObject || event.pointerId !== activePointer) return;
      const clutterBounds = clutter.getBoundingClientRect();
      const scaleX = clutter.clientWidth / clutterBounds.width;
      const scaleY = clutter.clientHeight / clutterBounds.height;
      const proposedLeft = (event.clientX - clutterBounds.left) * scaleX - pointerOffsetX;
      const proposedTop = (event.clientY - clutterBounds.top) * scaleY - pointerOffsetY;
      draggedObject.style.left = `${revival ? Math.max(0, Math.min(clutter.clientWidth - draggedObject.offsetWidth, proposedLeft)) : proposedLeft}px`;
      draggedObject.style.top = `${revival ? Math.max(0, Math.min(clutter.clientHeight - draggedObject.offsetHeight, proposedTop)) : proposedTop}px`;

      if (revival) {
        const deltaX = event.clientX - lastPointerX;
        const direction = Math.sign(deltaX);
        shakeDistance += Math.abs(deltaX);
        if (direction !== 0 && lastDirection !== 0 && direction !== lastDirection) shakeTurns += 1;
        if (direction !== 0) lastDirection = direction;
        lastPointerX = event.clientX;
        if (shakeDistance >= 150 && shakeTurns >= 4) {
          clearObject(draggedObject, event.pointerId);
          return;
        }
      }

      const objectBounds = draggedObject.getBoundingClientRect();
      if (!revival &&
        objectBounds.left < clutterBounds.left || objectBounds.right > clutterBounds.right ||
        objectBounds.top < clutterBounds.top || objectBounds.bottom > clutterBounds.bottom
      ) {
        clearObject(draggedObject, event.pointerId);
      }
      event.preventDefault();
    });

    listen(clutter, "pointerup", endDrag);
    listen(clutter, "pointercancel", endDrag);
    listen(finishButton, "click", () => {
      if (remainingObjects !== 0) {
        if (revival) {
          wrongAnswer();
          return;
        }
        unlockAchievement(7);
        return;
      }
      audio.playEffect(SOUND_EFFECTS.smack);
      complete();
    });
  },
};
