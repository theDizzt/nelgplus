import { attachCustomCursor } from "../core/CustomCursor";
import { clientPointToLocal, type LocalPoint } from "../core/floatingPosition";
import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelDefinition } from "../core/types";

const TAU = Math.PI * 2;
const CENTER = { x: 400, y: 370 };
const RINGS = [
  { radius: 188, width: 14, speed: 0.3, offset: 0, gap: 0.55 },
  { radius: 153, width: 12, speed: -0.46, offset: 2.7, gap: 0.65 },
  { radius: 122, width: 11, speed: 0.65, offset: 2.5, gap: 0.7 },
  { radius: 93, width: 11, speed: -0.9, offset: 0.1, gap: 0.75 },
  { radius: 65, width: 10, speed: 1.5, offset: -0.2, gap: 0.8 },
  { radius: 37, width: 7, speed: -6.5, offset: 2, gap: 1 },
] as const;

function touchesRing(point: LocalPoint, seconds: number): boolean {
  const x = point.x - CENTER.x;
  const y = point.y - CENTER.y;
  const distance = Math.hypot(x, y);
  const angle = Math.atan2(y, x);
  return RINGS.some((ring) => {
    if (Math.abs(distance - ring.radius) > ring.width / 2) return false;
    const relative = ((angle - ring.offset - seconds * ring.speed) % TAU + TAU) % TAU;
    return relative >= ring.gap;
  });
}

export const levelMinus05: LevelDefinition = {
  number: -5,
  title: "Patient",
  scenes: [{ id: "main", label: "Scene 1 - Main" }, { id: "failure", label: "Scene 2 - EPIC FAILURE" }],
  mount(context) {
    const { screen, initialScene, listen, goToLevel, wrongAnswer } = context;
    let failed = initialScene === "failure";
    let clicks = 0;
    let pointer: LocalPoint | undefined;
    let startedAt = performance.now();
    let previousTime = startedAt;
    let animationFrame = 0;
    let canvasContext: CanvasRenderingContext2D | null = null;
    let hint: HTMLElement | null = null;

    const fail = () => {
      if (failed) return;
      failed = true;
      pointer = undefined;
      render();
    };
    const checkPoint = (point: LocalPoint) => {
      if (!failed && touchesRing(point, (performance.now() - startedAt) / 1000)) fail();
    };
    const render = () => {
      screen.className = `level-screen level-minus-05${failed ? " level-minus-05--failure" : ""}`;
      screen.innerHTML = `
        <header class="level-heading">
          <div class="level-heading__number">Level -5</div>
          <h1>Patient</h1>
        </header>
        ${failed ? `
          <p class="level-minus-05__failure">EPIC FAILURE</p>
          <button class="level-minus-05__retry" type="button">Retry</button>
        ` : `
          <p class="level-minus-05__copy">NELG 117 &gt;:D</p>
          <canvas class="level-minus-05__rings" width="800" height="600" aria-hidden="true"></canvas>
          <button class="level-minus-05__center" type="button" tabindex="-1" aria-label="Center button"></button>
          <form class="level-minus-05__form" autocomplete="off">
            <input class="nelg-password-input" type="text" aria-label="Password" maxlength="32" autocomplete="off" autocapitalize="off" spellcheck="false" data-allow-select>
            <button type="submit">GO</button>
          </form>
          <p class="level-minus-05__hint" hidden>con<span>s</span>tant</p>
        `}
      `;
      canvasContext = screen.querySelector("canvas")?.getContext("2d") ?? null;
      hint = screen.querySelector(".level-minus-05__hint");
      const retry = screen.querySelector<HTMLButtonElement>(".level-minus-05__retry");
      if (retry) {
        listen(retry, "click", () => {
          failed = false;
          clicks = 0;
          pointer = undefined;
          startedAt = previousTime = performance.now();
          render();
        });
        return;
      }
      const center = screen.querySelector<HTMLButtonElement>(".level-minus-05__center")!;
      listen(center, "click", (event) => {
        if (failed || event.detail === 0) return;
        const point = clientPointToLocal(screen, event.clientX, event.clientY);
        checkPoint(point);
        if (failed) return;
        clicks += 1;
        if (hint) {
          hint.hidden = false;
          hint.classList.toggle("is-secret", clicks >= 10);
        }
      });
      const form = screen.querySelector<HTMLFormElement>("form")!;
      const input = form.querySelector("input")!;
      const password = attachStarMaskedInput(input, listen);
      listen(input, "keydown", (event) => {
        if (event.key !== "Enter" || event.repeat) return;
        event.preventDefault();
        form.requestSubmit();
      });
      listen(form, "submit", (event) => {
        event.preventDefault();
        if (failed) return;
        if (password.getValue() === "constant") goToLevel(-6);
        else {
          wrongAnswer();
          password.clear();
          input.focus();
        }
      });
    };

    render();
    const cleanCursor = attachCustomCursor(context, { source: "cursor/levelm5.png", hotspot: "center" });
    listen(screen, "pointermove", (event) => {
      if (failed) return;
      const next = clientPointToLocal(screen, event.clientX, event.clientY);
      if (pointer) {
        // Sample the whole movement so a fast pointer cannot skip a thin ring.
        const steps = Math.ceil(Math.hypot(next.x - pointer.x, next.y - pointer.y) / 2);
        for (let step = 1; step <= steps && !failed; step += 1) {
          checkPoint({ x: pointer.x + (next.x - pointer.x) * step / steps, y: pointer.y + (next.y - pointer.y) * step / steps });
        }
      } else checkPoint(next);
      pointer = failed ? undefined : next;
    });
    listen(screen, "pointerenter", (event) => {
      if (failed) return;
      const point = clientPointToLocal(screen, event.clientX, event.clientY);
      checkPoint(point);
      if (!failed) pointer = point;
    });
    listen(screen, "pointerdown", (event) => {
      if (failed) return;
      const point = clientPointToLocal(screen, event.clientX, event.clientY);
      checkPoint(point);
      if (!failed) pointer = point;
    });
    listen(screen, "pointerleave", () => { pointer = undefined; });
    const animate = (now: number) => {
      const seconds = (now - startedAt) / 1000;
      if (!failed && pointer) {
        // Include intermediate angles when a rendered frame is delayed.
        const steps = Math.max(1, Math.ceil((now - previousTime) / 16));
        for (let step = 1; step <= steps && !failed; step += 1) {
          const sampleTime = previousTime + (now - previousTime) * step / steps;
          if (touchesRing(pointer, (sampleTime - startedAt) / 1000)) fail();
        }
      }
      const blueBackground = Math.floor(seconds / 3) % 2 === 1;
      screen.style.backgroundColor = blueBackground ? "#00f" : "#000";
      if (!failed && canvasContext) {
        canvasContext.clearRect(0, 0, 800, 600);
        canvasContext.strokeStyle = blueBackground ? "#000" : "#00f";
        for (const ring of RINGS) {
          const angle = ring.offset + seconds * ring.speed;
          canvasContext.beginPath();
          canvasContext.lineWidth = ring.width;
          canvasContext.arc(CENTER.x, CENTER.y, ring.radius, angle + ring.gap, angle + TAU);
          canvasContext.stroke();
        }
      }
      previousTime = now;
      animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationFrame);
      cleanCursor();
    };
  },
};
