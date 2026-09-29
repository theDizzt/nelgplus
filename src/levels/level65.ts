import { assetUrl } from "../core/assets";
import { blockTabNavigation } from "../core/blockTabNavigation";
import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelDefinition } from "../core/types";

export const level65: LevelDefinition = {
  number: 65,
  title: "Relapse",
  scenes: [
    { id: "main", label: "Scene 1 - Main" },
    { id: "triangle", label: "Scene 2 - Triangle" },
    { id: "square", label: "Scene 3 - Square" },
    { id: "circle", label: "Scene 4 - Circle" },
    { id: "hexagram", label: "Scene 5 - Hexagram" },
    { id: "equation", label: "Scene 6 - Equation" },
  ],
  mount({ screen, initialScene, session, listen, timeout, goToMenu, complete, wrongAnswer }) {
    blockTabNavigation(listen);
    const artwork: Record<string, number> = { triangle: 1, square: 2, circle: 3, hexagram: 4, equation: 5 };
    const scene = initialScene && artwork[initialScene] ? initialScene : "main";
    const main = scene === "main";
    screen.className = "level-screen level-65";
    screen.dataset.scene = scene;
    screen.innerHTML = `
      <div class="level-65__background" aria-hidden="true"></div>
      <header class="level-heading level-65__heading">
        <div class="level-heading__number">Level 65</div><h1>Relapse</h1>
      </header>
      ${main ? `<p class="level-65__copy">there is no best choice<br>but only a choice not to regret</p>` : `
        <img class="level-65__art" src="${assetUrl(`images/level65b${artwork[scene]}.png`)}" alt="${scene} puzzle" draggable="false">
        <img class="level-65__clue" src="${assetUrl(`images/level65c${artwork[scene]}.png`)}" alt="${scene} clue" draggable="false">`}
      <button class="level-65__rewind ${main ? "level-65__rewind--main" : "level-65__rewind--small"}" type="button" aria-label="Rewind to main menu">
        <img src="${assetUrl("images/level65a.png")}" alt="" draggable="false">
      </button>
      ${scene === "equation" ? `<form class="level-08__form level-65__form" autocomplete="off">
        <input class="nelg-password-input" type="text" data-allow-select autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Password">
        <button type="submit">GO</button></form>` : ""}
    `;
    const button = screen.querySelector<HTMLButtonElement>(".level-65__rewind")!;
    const image = button.querySelector<HTMLImageElement>("img")!;
    let pixels: Uint8ClampedArray | undefined;
    let disposed = false;
    let leaving = false;
    void image.decode().then(() => {
      if (disposed) return;
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d", { willReadFrequently: true })!;
      context.drawImage(image, 0, 0);
      pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    }).catch(() => {});
    const opaque = (event: MouseEvent) => {
      if (!pixels) return false;
      const rect = image.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left) / rect.width * image.naturalWidth);
      const y = Math.floor((event.clientY - rect.top) / rect.height * image.naturalHeight);
      return x >= 0 && y >= 0 && x < image.naturalWidth && y < image.naturalHeight
        && (pixels[(y * image.naturalWidth + x) * 4 + 3] ?? 0) > 0;
    };
    listen(button, "pointermove", event => button.classList.toggle("is-hovered", opaque(event)));
    listen(button, "pointerleave", () => button.classList.remove("is-hovered", "is-pressed"));
    listen(button, "pointerdown", event => {
      if (event.button === 0 && opaque(event)) button.classList.add("is-pressed");
    });
    listen(document, "pointerup", () => { if (!leaving) button.classList.remove("is-pressed"); });
    listen(button, "pointercancel", () => button.classList.remove("is-pressed"));
    listen(button, "click", event => {
      if (leaving || (event.detail !== 0 && !opaque(event))) return;
      leaving = true;
      button.classList.add("is-pressed");
      if (main) session.setFlag("level65-rewind");
      timeout(goToMenu, 120);
    });
    const form = screen.querySelector<HTMLFormElement>("form");
    if (form) {
      const input = form.querySelector<HTMLInputElement>("input")!;
      const password = attachStarMaskedInput(input, listen);
      listen(input, "keydown", event => {
        if (event.key !== "Enter" || event.repeat) return;
        event.preventDefault();
        form.requestSubmit();
      });
      listen(form, "submit", event => {
        event.preventDefault();
        if (leaving) return;
        if (password.getValue() === "20210") { leaving = true; complete(); return; }
        if (wrongAnswer()) return;
        input.classList.add("is-wrong");
        timeout(() => input.classList.remove("is-wrong"), 360);
        input.focus();
      });
    }
    return () => { disposed = true; };
  },
};
