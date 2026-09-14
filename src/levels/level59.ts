import { assetUrl, SOUND_EFFECTS } from "../core/assets";
import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelDefinition } from "../core/types";
import { clientPointToLocal } from "../core/floatingPosition";
import { SHAPES, loadShapeMasks } from "./level59Shapes";
import { bombTouchesEdge, CORRECT_SHAPES, createSequence, failureScene, nextPath, scoreFor } from "./level59Sequence";

export const level59: LevelDefinition = {
  number: 59,
  title: "Sequence",
  scenes: [
    { id: "1", label: "Scene 1 — Main" },
    { id: "2", label: "Scene 2 — Main" },
    { id: "3", label: "Scene 3 — Failed" },
    { id: "4", label: "Scene 4 — Died" },
    { id: "5", label: "Scene 5 — 84% Complete" },
    { id: "6", label: "Scene 6 — 100% Complete" },
    { id: "7", label: "Scene 7 — Hidden" },
  ],
  mount({ screen, initialScene, audio, listen, interval, goToLevel, goToWarpZone, wrongAnswer }) {
    screen.className = "level-screen level-59";
    screen.dataset.shapesReady = "false";
    screen.style.setProperty("--level-59-background", `url("${assetUrl("images/level59bg.png")}")`);
    screen.innerHTML = `
      <header class="level-heading">
        <div class="level-heading__number">Level 59</div>
        <h1>Sequence</h1>
      </header>
      <section class="level-59__scene" data-scene="1">
        <img class="level-59__art" src="${assetUrl("images/level59a.png")}"
          alt="" aria-hidden="true" draggable="false" />
        <div class="level-59__intro">
          <p>Keep outsourcing your brain to AI and you'll end up a brainlet, dude.
            Time to fire up those neurons.</p>
          <p>Just get at least 84% right...<br />Hit 100% and there's a special reward in it for you.</p>
          <p>Find the correct shapes and click every one of them.</p>
          <p>Yeet the bombs off-screen before they blow.
            Watch your step around the landmines.</p>
        </div>
        <button class="level-59__begin" type="button">BEGIN</button>
      </section>
      <section class="level-59__scene" data-scene="2" hidden>
        <div class="level-59__playfield"></div>
        <p class="level-59__loading" role="status" hidden>Loading shapes...</p>
        <div class="level-59__controls">
          <div class="level-59__score">
            <output class="level-59__percentage" aria-label="Accuracy">0%</output>
            <div class="level-59__gauge" role="progressbar" aria-label="Accuracy"
              aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
              <div class="level-59__gauge-fill"></div>
            </div>
          </div>
          <form class="level-08__form level-59__form" autocomplete="off">
            <input class="nelg-password-input" id="level-59-answer" name="nelg-level-fifty-nine-answer"
              data-allow-select data-form-type="other" data-lpignore="true" data-1p-ignore="true"
              type="text" maxlength="40" autocomplete="off" autocapitalize="off"
              aria-autocomplete="none" spellcheck="false" aria-label="Password" />
            <button type="submit">GO</button>
          </form>
        </div>
      </section>
      <section class="level-59__scene level-59__failed" data-scene="3" hidden>
        <button class="level-59__failed-shape" type="button" aria-label="Try again"><img alt="" draggable="false" /></button>
        <p class="level-59__result level-59__failure-text"></p>
      </section>
      <section class="level-59__scene" data-scene="4" hidden>
        <div class="level-59__explosion" aria-hidden="true">✹</div>
        <p class="level-59__result level-59__death-text"></p>
        <button class="level-59__back" data-back type="button">TRY AGAIN</button>
      </section>
      <section class="level-59__scene" data-scene="5" hidden>
        <p class="level-59__result level-59__reward">G_G<br />have a nice game... - Dizzt<br /><strong data-allow-select>PW = bloomin' lady</strong></p>
        <button class="level-59__back" data-back type="button">BACK</button>
      </section>
      <section class="level-59__scene" data-scene="6" hidden>
        <p class="level-59__result level-59__reward">100%!!! Absolute madlad, you did it!<br /><strong data-allow-select>PW = bloomin' lady</strong><br />Dizzt's got two special options for you!</p>
        <div class="level-59__choices"><button type="button" data-next>Go to Level 60</button><button type="button" data-skip>Skip Level 60 and 61</button></div>
      </section>
      <section class="level-59__scene" data-scene="7" hidden>
        <p class="level-59__secret">SUPER SECRET!!!</p>
        <div class="level-59__catalog">${SHAPES.map(shape => `<button class="level-59__catalog-shape" data-shape="${shape.id}" type="button" aria-label="${shape.id}: ${shape.name}"><img src="${shape.src}" alt="" draggable="false"/></button>`).join("")}</div>
        <p class="level-59__shape-name" aria-live="polite">Click a shape to see info.</p>
        <button class="level-59__back" data-back type="button">BACK</button>
      </section>
      <div class="level-59__cursor" aria-hidden="true" hidden><img class="level-59__cursor-main" src="${assetUrl("cursor/level37.png")}" alt="" /><span class="level-59__cursor-orbit"><img src="${assetUrl("cursor/level39.png")}" alt="" /></span></div>`;

    const input = screen.querySelector<HTMLInputElement>("#level-59-answer")!;
    const begin = screen.querySelector<HTMLButtonElement>(".level-59__begin")!;
    const masked = attachStarMaskedInput(input, listen);
    const field = screen.querySelector<HTMLElement>(".level-59__playfield")!;
    const cursor = screen.querySelector<HTMLElement>(".level-59__cursor")!;
    const loading = screen.querySelector<HTMLElement>(".level-59__loading")!;
    const masks = loadShapeMasks();
    let ready = false, disposed = false, scene = "1";
    let collected = new Set<number>();
    let nextShape = createSequence();
    let time = 0, spawnAt = 0, mineAt = 5000, bombAt = 10000, lastDirection = -1;
    let lastTick = performance.now();
    let pointer: { x: number; y: number } | undefined;
    let failedId = 2;
    type Moving = { id: number; element: HTMLButtonElement; start: number; duration: number; points: number[]; x: number; y: number; flipped: boolean; suppressFlip: boolean };
    type Mine = { element: HTMLElement; x: number; y: number; liveAt: number };
    type Bomb = { element: HTMLElement; x: number; y: number; expires: number };
    const moving: Moving[] = [], mines: Mine[] = [], bombs: Bomb[] = [];
    let drag: { bomb: Bomb; pointerId: number; dx: number; dy: number } | undefined;
    const random = (min: number, max: number) => min + Math.random() * (max-min);
    const smack = () => audio.playEffect(SOUND_EFFECTS.smack);
    const blockTab = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        event.preventDefault();
        // Keep the puzzle's pointer based interaction from activating via focus traversal.
        (event.target as HTMLElement).blur();
      }
    };
    // The first Tab press can occur before focus enters #level-screen, so capture it at document level.
    listen(document, "keydown", blockTab, { capture: true });
    const score = () => scoreFor(collected);
    const updateScore = () => {
      screen.querySelector(".level-59__percentage")!.textContent = `${score()}%`;
      screen.querySelector(".level-59__gauge")!.setAttribute("aria-valuenow", String(score()));
      screen.querySelector<HTMLElement>(".level-59__gauge-fill")!.style.width = `${score()}%`;
      moving.forEach(item => item.element.classList.toggle("is-collected", collected.has(item.id)));
    };
    const clearGame = () => {
      if (drag && screen.hasPointerCapture(drag.pointerId)) screen.releasePointerCapture(drag.pointerId);
      drag = undefined;
      moving.length = mines.length = bombs.length = 0;
      field.replaceChildren();
    };

    const showScene = (next: string) => {
      clearGame();
      scene = next;
      screen.dataset.scene = scene;
      screen.setAttribute("aria-label", `Level 59: Sequence, Scene ${scene}`);
      screen.querySelectorAll<HTMLElement>(".level-59__scene").forEach(panel => {
        panel.hidden = panel.dataset.scene !== scene;
      });
      if (scene === "2") {
        collected = new Set();
        nextShape = createSequence();
        time = spawnAt = 0; mineAt = 5000; bombAt = 10000; lastDirection = -1;
        lastTick = performance.now();
        masked.clear();
        input.classList.remove("is-wrong"); input.removeAttribute("aria-invalid");
        updateScore();
        loading.hidden = ready;
        input.focus();
      } else {
        screen.querySelector<HTMLButtonElement>(`.level-59__scene[data-scene="${scene}"] button`)?.focus({ preventScroll: true });
      }
    };
    const fail = (cause: "shape" | "mine" | "bomb", id = failedId) => {
      failedId = id;
      const shape = SHAPES[id-1]!;
      const failedImage = screen.querySelector<HTMLImageElement>(".level-59__failed-shape img")!;
      failedImage.src = shape.src;
      screen.querySelector(".level-59__failure-text")!.textContent = `You weren't supposed to click the ${shape.name} button`;
      screen.querySelector(".level-59__death-text")!.textContent = cause === "mine"
        ? "You stepped on a landmine. Actual skill issue >:D"
        : "You let the bomb cook for five seconds. Get rekt, dude.";
      showScene(failureScene(score(), cause));
    };
    const spawn = () => {
      const id = nextShape();
      const path = nextPath(lastDirection);
      lastDirection = path.direction;
      const element = document.createElement("button");
      element.type = "button";
      element.className = "level-59__moving-shape";
      element.dataset.shape = String(id);
      element.setAttribute("aria-label", SHAPES[id-1]!.name);
      element.innerHTML = `<img src="${SHAPES[id-1]!.src}" alt="" draggable="false"/>`;
      element.classList.toggle("is-collected", collected.has(id));
      field.append(element);
      moving.push({ id, element, start: time, duration: random(4500,6000) / 1.5, points: path.points, x: path.points[0]!, y: path.points[1]!, flipped: false, suppressFlip: false });
    };
    const elementHit = (id: number, element: HTMLElement, event: MouseEvent, flipped = false) => {
      if (event.detail === 0) return true; // Keyboard activation has no pointer location.
      // Use the rendered image box rather than its square button. Portrait assets
      // (notably the carrot) have object-fit letterboxing inside the button.
      const box = element.querySelector("img")?.getBoundingClientRect() ?? element.getBoundingClientRect();
      return masks.hit(id, (event.clientX-box.left)/box.width, (event.clientY-box.top)/box.height, flipped);
    };
    const checkMines = () => {
      if (scene !== "2" || !pointer) return;
      if (mines.some(m => time >= m.liveAt && time < m.liveAt+3000 && Math.hypot(pointer!.x-m.x,pointer!.y-m.y) <= 23)) fail("mine");
    };
    listen(field, "click", event => {
      const target = (event.target as Element).closest<HTMLButtonElement>(".level-59__moving-shape");
      const item = moving.find(item => item.element === target);
      if (!item || scene !== "2" || !elementHit(item.id,item.element,event,item.flipped)) return;
      item.flipped = false; item.suppressFlip = true;
      item.element.classList.remove("is-flipped");
      smack();
      if (!CORRECT_SHAPES.some(id => id === item.id)) { fail("shape", item.id); return; }
      collected.add(item.id);
      updateScore();
      if (score() === 100) showScene("6");
    });
    const moveBomb = (event: PointerEvent) => {
      if (drag && event.pointerId === drag.pointerId) {
        const point = clientPointToLocal(screen,event.clientX,event.clientY);
        const bomb = drag.bomb;
        bomb.x = point.x-drag.dx; bomb.y = point.y-drag.dy;
        bomb.element.style.left = `${bomb.x}px`; bomb.element.style.top = `${bomb.y}px`;
        // Contact with an edge is enough; players never need to leave the viewport.
        if (bombTouchesEdge(bomb.x,bomb.y,screen.clientWidth,screen.clientHeight)) {
          bomb.element.remove(); bombs.splice(bombs.indexOf(bomb),1);
          drag = undefined;
          if (screen.hasPointerCapture(event.pointerId)) screen.releasePointerCapture(event.pointerId);
        }
      }
    };
    listen(screen, "pointermove", event => {
      pointer = clientPointToLocal(screen,event.clientX,event.clientY);
      cursor.hidden = event.pointerType === "touch";
      cursor.style.left = `${pointer.x}px`; cursor.style.top = `${pointer.y}px`;
      moveBomb(event);
      checkMines();
    });
    listen(screen,"pointerleave",() => { cursor.hidden = true; pointer = undefined; });
    listen(field,"pointerdown",event => {
      if (event.button !== 0 || drag || scene !== "2") return;
      const target = (event.target as Element).closest<HTMLElement>(".level-59__bomb");
      const bomb = bombs.find(b => b.element === target);
      if (!bomb) { pointer = clientPointToLocal(screen,event.clientX,event.clientY); checkMines(); return; }
      const point = clientPointToLocal(screen,event.clientX,event.clientY);
      drag = { bomb, pointerId:event.pointerId, dx:point.x-bomb.x, dy:point.y-bomb.y };
      screen.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    const release = () => {
      if (drag && screen.hasPointerCapture(drag.pointerId)) screen.releasePointerCapture(drag.pointerId);
      drag = undefined;
    };
    listen(screen,"pointerup",event => {
      if (drag?.pointerId !== event.pointerId) return;
      moveBomb(event);
      release();
    });
    listen(screen,"pointercancel",event => { if (drag?.pointerId === event.pointerId) release(); });
    listen(screen,"lostpointercapture",event => { if (drag?.pointerId === event.pointerId) release(); });
    listen(screen.querySelector<HTMLElement>(".level-59__catalog")!,"click",event => {
      const button = (event.target as Element).closest<HTMLElement>("[data-shape]");
      const id = Number(button?.dataset.shape);
      if (!button || !elementHit(id,button,event)) return;
      smack(); screen.querySelector(".level-59__shape-name")!.textContent = `${id} — ${SHAPES[id-1]!.name}`;
    });
    listen(screen.querySelector<HTMLElement>(".level-59__failed-shape")!,"click",event => {
      const button = screen.querySelector<HTMLElement>(".level-59__failed-shape")!;
      if (elementHit(failedId,button,event)) { smack(); showScene("2"); }
    });
    screen.querySelectorAll<HTMLElement>("[data-back]").forEach(button => listen(button,"click",() => { smack(); showScene("2"); }));
    listen(screen.querySelector<HTMLElement>("[data-next]")!,"click",() => { smack(); goToLevel(60); });
    listen(screen.querySelector<HTMLElement>("[data-skip]")!,"click",() => { smack(); goToWarpZone(15); });
    listen(begin, "click", () => {
      smack();
      showScene("2");
    });
    listen(screen.querySelector<HTMLFormElement>("form")!, "submit", event => {
      event.preventDefault();
      if (scene !== "2") return;
      const answer = masked.getValue().trim().toLowerCase();
      smack();
      if (answer === "bloomin' lady") { goToLevel(60); return; }
      if (answer === "ivory") { showScene("7"); return; }
      if (wrongAnswer()) return;
      input.classList.add("is-wrong");
      input.setAttribute("aria-invalid","true");
    });
    listen(input, "keydown", event => {
      if (event.key !== "Enter" || event.repeat) return;
      event.preventDefault();
      input.closest<HTMLFormElement>("form")?.requestSubmit();
    });
    const clearInvalid = () => { input.classList.remove("is-wrong"); input.removeAttribute("aria-invalid"); };
    listen(input,"beforeinput",clearInvalid); listen(input,"paste",clearInvalid);
    interval(() => {
      const now = performance.now();
      const elapsed = now-lastTick;
      lastTick = now;
      if (scene !== "2" || !ready || document.hidden) return;
      time += Math.min(elapsed,100);
      if (time >= spawnAt) { spawn(); spawnAt = time+random(500,2000); }
      for (let i = moving.length-1; i >= 0; i--) {
        const item = moving[i]!;
        const progress = (time-item.start)/item.duration;
        if (progress >= 1) { item.element.remove(); moving.splice(i,1); continue; }
        item.x = item.points[0]!+(item.points[2]!-item.points[0]!)*progress;
        item.y = item.points[1]!+(item.points[3]!-item.points[1]!)*progress;
        item.element.style.left = `${item.x}px`; item.element.style.top = `${item.y}px`;
        const hovered = !!pointer && pointer.x >= item.x-44 && pointer.x <= item.x+44 && pointer.y >= item.y-44 && pointer.y <= item.y+44;
        if (!hovered) item.suppressFlip = false;
        item.flipped = hovered && !item.suppressFlip;
        item.element.classList.toggle("is-flipped",item.flipped);
      }
      if (time >= mineAt-1000) {
        const element = document.createElement("div");
        element.className = "level-59__mine is-warning";
        element.setAttribute("aria-label","Landmine warning");
        element.innerHTML = '<span aria-hidden="true">✹</span>';
        const x = random(36,764), y = random(36,564);
        element.style.left = `${x}px`; element.style.top = `${y}px`;
        field.append(element); mines.push({element,x,y,liveAt:mineAt});
        mineAt += random(2000,5000);
      }
      for (let i = mines.length-1; i >= 0; i--) {
        const mine = mines[i]!;
        if (time >= mine.liveAt+3000) { mine.element.remove(); mines.splice(i,1); }
        else if (time >= mine.liveAt) { mine.element.classList.remove("is-warning"); mine.element.setAttribute("aria-label","Active landmine"); }
      }
      checkMines();
      if (scene !== "2") return;
      if (time >= bombAt) {
        const element = document.createElement("div");
        element.className = "level-59__bomb";
        element.setAttribute("data-allow-drag", "");
        element.setAttribute("aria-label","Bomb: drag off-screen before the timer reaches zero");
        element.innerHTML = '<span class="level-59__bomb-timer">5</span><span class="level-59__fuse" aria-hidden="true">✦</span>';
        const x = random(60,740), y = random(70,530);
        element.style.left = `${x}px`; element.style.top = `${y}px`;
        field.append(element); bombs.push({element,x,y,expires:time+5000});
        bombAt = time+random(3500,6000);
      }
      for (const bomb of bombs) {
        bomb.element.querySelector(".level-59__bomb-timer")!.textContent = String(Math.max(0,Math.ceil((bomb.expires-time)/1000)));
        bomb.element.classList.toggle("is-urgent",bomb.expires-time <= 2000);
        if (time >= bomb.expires) { fail("bomb"); break; }
      }
    },16);
    void masks.ready.then(() => { if (!disposed) { ready = true; screen.dataset.shapesReady = "true"; loading.hidden = true; lastTick = performance.now(); } }).catch(() => {
      if (!disposed) { loading.hidden = false; loading.textContent = "A shape failed to load. Reload and try again."; }
    });
    screen.querySelector<HTMLImageElement>(".level-59__failed-shape img")!.src = SHAPES[1]!.src;
    screen.querySelector(".level-59__failure-text")!.textContent = "You weren't supposed to click the gold five-pointed star button.";
    screen.querySelector(".level-59__death-text")!.textContent = "You let the bomb cook for five seconds. Get rekt.";
    showScene(initialScene && /^[1-7]$/.test(initialScene) ? initialScene : "1");
    return () => { disposed = true; clearGame(); };
  },
};
