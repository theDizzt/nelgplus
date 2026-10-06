import { assetUrl, SOUND_EFFECTS } from "../core/assets";
import { blockTabNavigation } from "../core/blockTabNavigation";
import { clientPointToLocal } from "../core/floatingPosition";
import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelContext, LevelDefinition } from "../core/types";
import { createRunner, draggable, lavaSurface, MINIGAME_SCALE, PUZZLES, scalePuzzle, stepRunner, updatePatrol, type PuzzleObject } from "./level66Physics";

const NAMES = ["Main", "I", "II", "III", "IV", "V", "Finish", "Failed", "Cursor Perished"];
const PASSWORD = "redguy must GO!!!";
const boxStyle = (o: { x: number; y: number; width: number; height: number }) => `left:${o.x}px;top:${o.y}px;width:${o.width}px;height:${o.height}px`;
const formMarkup = `<form class="level-08__form level-66__form" autocomplete="off"><input class="nelg-password-input" type="text" data-allow-select autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Password"><button type="submit">GO</button></form>`;

export const level66: LevelDefinition = {
  number: 66, title: "GO",
  scenes: NAMES.map((name, i) => ({ id: String(i + 1), label: `Scene ${i + 1} - ${name}` })),
  mount({ screen, initialScene, listen, goToLevel, wrongAnswer, audio }) {
    blockTabNavigation(listen);
    const layouts = PUZZLES.map(p => scalePuzzle(p, MINIGAME_SCALE));
    let scene = 1, lastPuzzle = 2, running = false, leaving = false;
    let player = createRunner(layouts[0]!.start, MINIGAME_SCALE);
    let clock = 0, previousTime = 0, accumulator = 0, frame = 0;
    let lavaElapsed = 0;
    let sceneEvents = new AbortController();
    let previousCursor: { x: number; y: number } | null = null;
    let explosionPoint = { x: 400, y: 350 };
    let drag: { id: number; object: PuzzleObject; element: HTMLElement; x: number; y: number; ox: number; oy: number } | null = null;
    const sceneListen: LevelContext["listen"] = (target, type, callback, options) => target.addEventListener(type, callback as EventListener, { ...options, signal: sceneEvents.signal });
    const endDrag = () => {
      if (drag?.element.hasPointerCapture(drag.id)) drag.element.releasePointerCapture(drag.id);
      drag?.element.classList.remove("is-dragging");
      drag = null;
    };
    const paintPlayer = () => {
      const el = screen.querySelector<HTMLElement>(".level-66__runner");
      if (!el) return;
      el.style.left = `${player.x - 13 * MINIGAME_SCALE}px`;
      el.style.top = `${player.y - 10 * MINIGAME_SCALE}px`;
      el.style.width = `${64 * MINIGAME_SCALE}px`;
      el.style.height = `${82 * MINIGAME_SCALE}px`;
      el.style.transform = player.direction === 1 ? "none" : "scaleX(-1)";
      const index = !running ? 1 : player.mode === "walking" || player.mode === "climbing" ? (Math.floor(clock / .11) % 2 ? 3 : 2) : player.mode === "jumping" ? 4 : 5;
      const image = el as HTMLImageElement;
      const src = assetUrl(`images/red_${index}.png`);
      if (image.getAttribute("src") !== src) image.src = src;
    };
    const show = (next: number) => {
      endDrag();
      sceneEvents.abort(); sceneEvents = new AbortController();
      scene = next; running = false; accumulator = 0; clock = 0;
      lavaElapsed = 0;
      previousCursor = null;
      screen.className = "level-screen level-66";
      screen.dataset.scene = String(scene);
      screen.dataset.running = "false";
      screen.setAttribute("aria-label", `Level 66: GO, ${NAMES[scene - 1]}`);
      const heading = `<header class="level-heading"><div class="level-heading__number">Level 66</div><h1>GO</h1></header>`;
      if (scene === 1) {
        screen.innerHTML = `${heading}<img class="level-66__giant" src="${assetUrl("images/red_1.png")}" alt="" draggable="false"><div class="level-66__instructions"><p class="level-66__mission"><strong>Get the broken artificial RED GUY to the portal!!!</strong></p><ul class="level-66__rules">
          <li>Drag floors, ladders and jump pads. Black walls are fixed.</li>
          <li>Leave the password empty and press GO to start redguy.</li>
          <li>He starts walking right. Black walls make him turn around.</li>
          <li>He always climbs ladders up, never down.</li>
          <li>Jump pads launch him through black walls until he lands.</li>
          <li>Steve and red-hot walls are deadly, even during a jump.</li>
          <li>Leaving the screen is deadly, too.</li>
          <li>Guide him safely into the portal. Complete all five puzzles!</li>
        </ul></div><button class="level-66__button level-66__begin" data-begin>BEGIN</button>`;
      } else if (scene === 9) {
        screen.innerHTML = `${heading}<p class="level-66__perished" role="alert">PERISHED</p>
          <div class="level-66__cursor-explosion" style="left:${explosionPoint.x}px;top:${explosionPoint.y}px" aria-hidden="true">
            <svg class="level-66__exploding-arrow" viewBox="0 0 24 32"><path d="M2 2V25L8 19L13 30L18 28L13 17H22Z" fill="white" stroke="black" stroke-width="2"/></svg>
            <span class="level-66__blast-ring"></span>
            ${Array.from({ length: 16 }, (_, i) => { const angle = i * Math.PI / 8; const distance = 65 + (i % 3) * 24; return `<i style="--dx:${Math.cos(angle) * distance}px;--dy:${Math.sin(angle) * distance}px;--turn:${i * 53}deg"></i>`; }).join("")}
          </div><button class="level-66__button level-66__retry" data-retry>Try Again</button>`;
        audio.playEffect(SOUND_EFFECTS.explosion);
      } else if (scene === 8) {
        screen.innerHTML = `${heading}<div class="level-66__sinking" aria-hidden="true"><img src="${assetUrl("images/red_1.png")}" alt=""><svg class="level-66__resentful-face" viewBox="0 0 20 16" shape-rendering="crispEdges" aria-hidden="true"><path d="M1 1H4V2H7V3H9V5H6V4H3V3H1ZM19 1H16V2H13V3H11V5H14V4H17V3H19Z" fill="#210000"/><path d="M2 6H8V9H2ZM12 6H18V9H12Z" fill="#ffe9d5"/><path d="M5 6H7V9H5ZM13 6H15V9H13Z" fill="#080000"/><path d="M2 6H4V7H8V8H2ZM18 6H16V7H12V8H18Z" fill="#620000"/><path d="M5 14V12H7V11H13V12H15V14H13V13H7V14Z" fill="#210000"/></svg><svg class="level-66__thumb" viewBox="0 0 70 120"><path d="M7 118V63H27V47L35 36V10Q35 1 44 3L48 8V40H61L67 48V83L58 94V118Z" fill="#ef0800" stroke="#000" stroke-width="5"/><path d="M48 48H63M48 60H65M48 72H63" stroke="#700" stroke-width="4"/></svg></div><div class="level-66__lava" aria-hidden="true"></div><p class="level-66__perished">PERISHED</p><button class="level-66__button level-66__retry" data-retry>Try Again</button>`;
      } else if (scene === 7) {
        screen.innerHTML = `${heading}<p class="level-66__finish">PW = redguy must GO!!!</p>${formMarkup}`;
      } else {
        lastPuzzle = scene;
        const layout = layouts[scene - 2]!;
        layout.objects.forEach(object => updatePatrol(object, 0));
        player = createRunner(layout.start, MINIGAME_SCALE);
        screen.innerHTML = `${heading}<div class="level-66__puzzle-number">${NAMES[scene - 1]}</div>
          ${layout.objects.map((o, index) => {
            const classes = { floor: "level-32__platform", wall: "level-32__wall", ladder: "level-66__ladder", spring: "level-32__platform level-66__spring", hot: "level-32__falling-block", steve: "level-32__steve" };
            const attributes = `class="level-66__object ${classes[o.kind]}${o.kind === "floor" && o.fixed ? " level-66__fixed-floor" : ""}" style="${boxStyle(o)}" data-object="${index}" ${draggable(o) ? `data-allow-drag tabindex="0" role="button" aria-label="Move ${o.kind}"` : `aria-label="${o.fixed ? "Fixed " : ""}${o.kind}"`}`;
            return o.kind === "steve" ? `<img ${attributes} src="${assetUrl("images/Steve.gif")}" alt="Steve" draggable="false">` : `<div ${attributes}>${o.kind === "spring" ? "&uarr;" : ""}</div>`;
          }).join("")}
          <div class="level-32__portal" style="${boxStyle(layout.portal)}" aria-label="Portal"><i></i><i></i><i></i><i></i></div>
          <img class="level-66__runner" src="${assetUrl("images/red_1.png")}" alt="redguy" draggable="false">
          ${layout.lava ? `<div class="level-66__lava level-66__rising-lava" style="top:${lavaSurface(layout,0)}px" aria-label="Rising lava"></div>` : ""}${formMarkup}`;
        paintPlayer();
      }
      const form = screen.querySelector<HTMLFormElement>("form");
      if (form) {
        const input = form.querySelector("input")!;
        const masked = attachStarMaskedInput(input, sceneListen);
        sceneListen(input, "keydown", event => {
          if (event.key !== "Enter" || event.repeat || event.isComposing) return;
          event.preventDefault(); form.requestSubmit();
        });
        sceneListen(form, "submit", event => {
          event.preventDefault();
          if (leaving) return;
          const value = masked.getValue();
          if (value === PASSWORD) { leaving = true; running = false; goToLevel(67); return; }
          if (value === "" && scene >= 2 && scene <= 6) {
            if (running) return;
            endDrag(); running = true; screen.dataset.running = "true";
            input.classList.remove("is-wrong");
          } else if (value !== "") {
            if (wrongAnswer()) return;
            input.classList.add("is-wrong"); input.focus();
          }
        });
      }
    };
    // Sweep the cursor path so fast movement and pointer-captured drags cannot skip hazards.
    const checkCursorPoint = (point: { x: number; y: number }) => {
      if (scene < 2 || scene > 6) return false;
      const from = previousCursor ?? point;
      const steps = Math.max(1, Math.ceil(Math.hypot(point.x - from.x, point.y - from.y) / 2));
      const hazards = layouts[scene - 2]!.objects.filter(o => o.kind === "hot" || o.kind === "steve");
      for (let i = 0; i <= steps; i++) {
        const x = from.x + (point.x - from.x) * i / steps;
        const y = from.y + (point.y - from.y) * i / steps;
        if ((x >= 0 && x <= 800 && y >= lavaSurface(layouts[scene - 2]!, lavaElapsed) && y <= 600) || hazards.some(o => x >= o.x && x <= o.x + o.width && y >= o.y && y <= o.y + o.height)) {
          explosionPoint = { x, y };
          show(9);
          return true;
        }
      }
      previousCursor = point;
      return false;
    };
    const checkCursor = (event: PointerEvent) => {
      if (event.pointerType === "touch") return false;
      return checkCursorPoint(clientPointToLocal(screen, event.clientX, event.clientY));
    };
    listen(screen, "click", event => {
      const target = event.target as Element;
      if (target.closest("[data-begin]")) show(2);
      if (target.closest("[data-retry]")) show(lastPuzzle);
    });
    listen(screen, "pointerdown", event => {
      if (checkCursor(event)) return;
      if (event.button !== 0 || running || scene < 2 || scene > 6 || drag) return;
      const el = (event.target as Element).closest<HTMLElement>("[data-object]");
      if (!el) return;
      const object = layouts[scene - 2]!.objects[Number(el.dataset.object)]!;
      if (!draggable(object)) return;
      const point = clientPointToLocal(screen, event.clientX, event.clientY);
      drag = { id: event.pointerId, object, element: el, x: point.x, y: point.y, ox: object.x, oy: object.y };
      el.setPointerCapture(event.pointerId); el.classList.add("is-dragging"); event.preventDefault();
    });
    listen(screen, "pointermove", event => {
      if (checkCursor(event)) return;
      if (!drag || event.pointerId !== drag.id) return;
      const point = clientPointToLocal(screen, event.clientX, event.clientY);
      drag.object.x = Math.max(0, Math.min(800 - drag.object.width, drag.ox + point.x - drag.x));
      drag.object.y = Math.max(175, Math.min(540 - drag.object.height, drag.oy + point.y - drag.y));
      drag.element.style.cssText = boxStyle(drag.object); event.preventDefault();
    });
    for (const type of ["pointerup", "pointercancel", "lostpointercapture"] as const) listen(screen, type, event => { if (drag?.id === event.pointerId) endDrag(); });
    listen(window, "blur", endDrag);
    listen(screen, "pointerleave", () => { previousCursor = null; });
    listen(screen, "keydown", event => {
      if (running || scene < 2 || scene > 6) return;
      const el = (event.target as Element).closest<HTMLElement>("[data-object]");
      const delta = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
      if (!el || !delta) return;
      const o = layouts[scene - 2]!.objects[Number(el.dataset.object)]!;
      if (!draggable(o)) return;
      event.preventDefault();
      const step = event.shiftKey ? 20 : 5;
      o.x = Math.max(0, Math.min(800 - o.width, o.x + delta[0]! * step));
      o.y = Math.max(175, Math.min(540 - o.height, o.y + delta[1]! * step));
      el.style.cssText = boxStyle(o);
    });
    const tick = (now: number) => {
      const dt = Math.min(.05, (now - previousTime) / 1000 || 0);
      previousTime = now;
      if (scene >= 2 && scene <= 6) {
        accumulator += dt;
        while (accumulator >= 1 / 120 && scene >= 2 && scene <= 6) {
          accumulator -= 1 / 120;
          clock += 1 / 120;
          const layout = layouts[scene - 2]!;
          if (running && layout.lava) {
            lavaElapsed += 1 / 120;
            const lava = screen.querySelector<HTMLElement>(".level-66__rising-lava");
            if (lava) lava.style.top = `${lavaSurface(layout,lavaElapsed)}px`;
          }
          layout.objects.forEach((object, index) => {
            if (!object.patrol) return;
            const direction = updatePatrol(object, clock);
            const element = screen.querySelector<HTMLElement>(`[data-object="${index}"]`);
            if (element) {
              element.style.left = `${object.x}px`;
              element.style.transform = direction === -1 ? "none" : "scaleX(-1)";
            }
          });
          // A moving Steve can hit a stationary cursor, even before GO is pressed.
          if (previousCursor && checkCursorPoint(previousCursor)) break;
          if (running) {
            const surface = lavaSurface(layout,lavaElapsed);
            const result = player.y + player.height >= surface ? "dead" : stepRunner(player, layout.objects, layout.portal, 1 / 120);
            if (result === "dead" || player.y + player.height >= surface) show(8);
            else if (result === "clear") show(scene + 1);
          }
        }
        paintPlayer();
      }
      frame = requestAnimationFrame(tick);
    };
    const requested = Number(initialScene);
    void audio.playMusic("music/level66.mp3", true);
    show(Number.isInteger(requested) && requested >= 1 && requested <= 9 ? requested : 1);
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); endDrag(); sceneEvents.abort(); delete screen.dataset.running; audio.stopMusic(); };
  },
};
