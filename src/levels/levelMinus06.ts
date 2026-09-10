import { assetUrl, SOUND_EFFECTS } from "../core/assets";
import { clientPointToLocal, type LocalPoint } from "../core/floatingPosition";
import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelDefinition } from "../core/types";
import { tryBackwardsPassword } from "./negativeBackwards";

type Scene = "main" | "fail" | "success";
const COLORS = ["#f00", "#0f0", "#00f"] as const;
const SIZES = [
  { width: 26, height: 20, value: 3 },
  { width: 39, height: 30, value: 6 },
  { width: 52, height: 40, value: 10 },
] as const;
interface Drop {
  element: HTMLElement;
  x: number;
  y: number;
  speed: number;
  color: number;
  size: typeof SIZES[number];
}
const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

export const levelMinus06: LevelDefinition = {
  number: -6,
  title: "Drop",
  scenes: [
    { id: "main", label: "Screen 1 - Main" },
    { id: "fail", label: "Screen 2 - Fail" },
    { id: "success", label: "Screen 3 - Success" },
    { id: "90", label: "Screen 1 - 90.0% reached" },
  ],
  mount({ screen, initialScene, listen, goToLevel, wrongAnswer, unlockAchievement, audio, session }) {
    screen.className = "level-screen level-minus-06";
    screen.innerHTML = `
      <div class="level-minus-06__rain" aria-hidden="true"></div>
      <header class="level-heading"><div class="level-heading__number">Level -6</div><h1>Drop</h1></header>
      <div class="level-minus-06__main">
        <div class="level-minus-06__progress"><progress max="1000" value="0" aria-label="Basket progress"></progress><output>0.0%</output></div>
        <p class="level-minus-06__copy">Catch each color in a basket of the same color!</p>
        <form class="level-minus-06__form" autocomplete="off">
          <input class="nelg-password-input" type="text" aria-label="Password" maxlength="48" autocomplete="off" autocapitalize="off" spellcheck="false" data-allow-select>
        </form>
      </div>
      <div class="level-minus-06__fail"><p>;(</p><button class="level-minus-06__retry" type="button" aria-label="Retry"></button></div>
      <div class="level-minus-06__success"><p>poppin' and cursors</p><button class="level-minus-06__retry" type="button" aria-label="Return to game"></button></div>
      <button class="level-minus-06__submit level-minus-06__rainbow" type="button" hidden>GO</button>
      <div class="level-minus-06__basket" aria-hidden="true" hidden><img src="${assetUrl("cursor/levelm6.png")}" alt="" draggable="false"></div>
    `;
    const rain = screen.querySelector<HTMLElement>(".level-minus-06__rain")!;
    const basket = screen.querySelector<HTMLElement>(".level-minus-06__basket")!;
    basket.style.maskImage = `url("${assetUrl("cursor/levelm6.png")}")`;
    const input = screen.querySelector<HTMLInputElement>("input")!;
    const password = attachStarMaskedInput(input, listen);
    const submit = screen.querySelector<HTMLButtonElement>(".level-minus-06__submit")!;
    const progress = screen.querySelector("progress")!;
    const output = screen.querySelector("output")!;
    let scene: Scene = "main";
    let points = 0;
    let color = 0;
    let drops: Drop[] = [];
    let pointer: LocalPoint | undefined;
    let previousPointer: LocalPoint | undefined;
    let elapsed = 0;
    let nextBatch = 200;
    let nextColor = 0;
    let nextSubmit = 0;
    let rainbowY: number | undefined;
    let rainbowX = 0;
    let frame = 0;
    let lastTime = performance.now();

    const updateProgress = () => {
      progress.value = points;
      output.value = `${(points / 10).toFixed(1)}%`;
      if (points === 666) unlockAchievement(119);
    };
    const changeScene = (next: Scene, startingPoints = 0) => {
      scene = next;
      screen.dataset.scene = next;
      drops = [];
      rain.replaceChildren();
      pointer = previousPointer = undefined;
      basket.hidden = true;
      submit.hidden = true;
      rainbowY = undefined;
      elapsed = 0;
      nextBatch = 200;
      nextColor = randomBetween(3000, 5000);
      nextSubmit = randomBetween(30000, 42000);
      if (next === "main") {
        points = startingPoints;
        color = Math.floor(Math.random() * COLORS.length);
        basket.style.backgroundColor = COLORS[color]!;
        password.clear();
      }
      updateProgress();
    };
    const addDrop = (x: number, y: number, dropColor: number, size: typeof SIZES[number], speed: number) => {
      const element = document.createElement("div");
      element.className = `level-minus-06__drop${scene === "success" ? " level-minus-06__rainbow" : ""}`;
      element.textContent = "GO";
      element.style.width = `${size.width}px`;
      element.style.height = `${size.height}px`;
      element.style.fontSize = `${size.height * 0.65}px`;
      element.style.backgroundColor = COLORS[dropColor]!;
      element.dataset.color = String(dropColor);
      element.dataset.value = String(size.value);
      rain.append(element);
      drops.push({ element, x, y, color: dropColor, size, speed });
    };
    const spawnBatch = () => {
      if (scene === "main" && points >= 900) {
        const size = SIZES[Math.floor(Math.random() * SIZES.length)]!;
        const x = randomBetween(0, 800 - size.width * 3);
        const speed = randomBetween(95, 155);
        const top = -size.height * 5;
        for (let column = 0; column < 3; column += 1) {
          addDrop(x + size.width * column, top, column % 3, size, speed);
        }
        for (let row = 1; row <= 4; row += 1) {
          addDrop(x + size.width, top + size.height * row, row % 3, size, speed);
        }
      } else {
        for (let i = 0; i < 3; i += 1) {
          const size = SIZES[Math.floor(Math.random() * SIZES.length)]!;
          addDrop(randomBetween(0, 800 - size.width), -size.height, Math.floor(Math.random() * 3), size, randomBetween(95, 155));
        }
      }
    };
    const updatePointer = (event: PointerEvent) => {
      if (scene !== "main") return;
      const local = clientPointToLocal(screen, event.clientX, event.clientY);
      pointer = { x: Math.max(36, Math.min(764, local.x)), y: Math.max(0, Math.min(570, local.y)) };
      basket.style.transform = `translate(${pointer.x - 36}px, ${pointer.y}px)`;
      basket.hidden = false;
    };
    listen(screen, "pointerenter", updatePointer);
    listen(screen, "pointermove", updatePointer);
    listen(screen, "pointerleave", () => {
      pointer = previousPointer = undefined;
      basket.hidden = true;
    });
    screen.querySelectorAll<HTMLButtonElement>(".level-minus-06__retry").forEach((button) => {
      listen(button, "click", () => changeScene("main"));
    });
    listen(screen.querySelector("form")!, "submit", (event) => event.preventDefault());
    listen(input, "keydown", (event) => {
      if (event.key === "Enter") event.preventDefault();
    });
    listen(submit, "pointerdown", (event) => {
      if (event.button !== 0 || scene !== "main" || rainbowY === undefined) return;
      // Keep the release/click on the falling button even after it moves away.
      submit.setPointerCapture(event.pointerId);
    });
    listen(submit, "click", () => {
      if (scene !== "main" || rainbowY === undefined) return;
      if (tryBackwardsPassword(password.getValue(), { session, goToLevel })) return;
      if (password.getValue() === "poppin' and cursors") goToLevel(-7);
      else wrongAnswer();
    });

    if (initialScene === "fail" || initialScene === "success") changeScene(initialScene);
    else changeScene("main", initialScene === "90" ? 900 : 0);
    const animate = (now: number) => {
      const delta = Math.min(100, Math.max(0, now - lastTime));
      lastTime = now;
      if (scene !== "fail") {
        elapsed += delta;
        if (scene === "main" && elapsed >= nextColor) {
          color = (color + 1 + Math.floor(Math.random() * 2)) % 3;
          basket.style.backgroundColor = COLORS[color]!;
          nextColor = elapsed + randomBetween(3000, 5000);
        }
        while (elapsed >= nextBatch) {
          spawnBatch();
          nextBatch += 200;
        }
        if (scene === "main" && elapsed >= nextSubmit) {
          rainbowX = randomBetween(0, 800 - 52);
          rainbowY = -40;
          submit.hidden = false;
          nextSubmit = elapsed + randomBetween(30000, 42000);
        }
        if (rainbowY !== undefined) {
          rainbowY += delta * 0.07;
          submit.style.transform = `translate(${rainbowX}px, ${rainbowY}px)`;
          if (rainbowY > 600) { rainbowY = undefined; submit.hidden = true; }
        }
        const remaining: Drop[] = [];
        let terminal: Scene | undefined;
        for (const drop of drops) {
          const oldBottom = drop.y + drop.size.height;
          drop.y += drop.speed * delta / 1000;
          let caught = false;
          if (scene === "main" && pointer) {
            const oldBasket = previousPointer ?? pointer;
            const oldDistance = oldBottom - oldBasket.y;
            const distance = drop.y + drop.size.height - pointer.y;
            if (oldDistance <= 0 && distance >= 0) {
              const fraction = distance === oldDistance ? 1 : -oldDistance / (distance - oldDistance);
              const basketX = oldBasket.x + (pointer.x - oldBasket.x) * fraction;
              caught = drop.x + drop.size.width >= basketX - 36 && drop.x <= basketX + 36;
            }
          }
          if (caught) {
            audio.playEffect(SOUND_EFFECTS.pop);
            // Integer tenths keep the strict 0%, 99.0%, and 100% boundaries exact.
            points += drop.color === color ? drop.size.value : -drop.size.value;
            drop.element.remove();
            updateProgress();
            if (points < 0) { terminal = "fail"; break; }
            if (points >= 1000) { terminal = "success"; break; }
          } else if (drop.y > 600) drop.element.remove();
          else {
            drop.element.style.transform = `translate(${drop.x}px, ${drop.y}px)`;
            remaining.push(drop);
          }
        }
        if (terminal) changeScene(terminal);
        else drops = remaining;
        previousPointer = pointer;
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  },
};
