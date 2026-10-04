import { clientPointToLocal, localElementBounds, positionFloatingElement } from "../core/floatingPosition";
import type { LevelContext } from "../core/types";

const SPECS = [
  ["red", "#f00", "15", 15], ["yellow", "#ff0", "999999987", 13],
  ["cyan", "#0ff", "694877683", 3], ["orange", "#ff8800", "65536", 1],
  ["green", "#0f0", "ZEST", 41], ["blue", "#00f", "101010", 42],
  ["purple", "#bb44ff", "1", 0], ["pink", "#ff88bb", "0", 0],
] as const;

export function mountCounters(context: LevelContext, listen: LevelContext["listen"], show: (scene: number, optimal?: boolean) => void): () => void {
  const { screen, now, audio } = context;
  let disposed = false, corrupt = false, layer = 5;
  let failureTimer = 0;
  const world = document.createElement("div");
  world.className = "level-67__world";
  world.append(...Array.from(screen.children));
  screen.append(world);
  // Contain counter stacking so raising a dragged counter never covers the UI.
  const counterLayer = document.createElement("div");
  counterLayer.className = "level-67__counters";
  world.append(counterLayer);
  let zoom = 1, panX = 0, panY = 0;
  const renderZoom = () => {
    panX = Math.max(800 - 800 * zoom, Math.min(0, panX));
    panY = Math.max(600 - 600 * zoom, Math.min(0, panY));
    world.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
  };
  const counters = SPECS.map(([name, color, value, minimum], i) => {
    const body = document.createElement("div");
    body.className = "level-67__counter";
    body.dataset.counter = name;
    body.setAttribute("data-allow-drag", "");
    body.style.cssText = `--counter-color:${color};left:${18 + (i % 4) * 194}px;top:${194 + Math.floor(i / 4) * 148}px`;
    body.innerHTML = `<input class="level-67__display" aria-label="${name} counter" type="text" maxlength="9" data-allow-select autocomplete="off" spellcheck="false">
      <button type="button" data-step="-1" aria-label="Decrease ${name}">−</button>
      ${name === "orange" ? '<button type="button" class="level-67__reset" aria-label="Reset orange" data-reset></button>' : ""}
      <button type="button" data-step="1" aria-label="Increase ${name}">+</button>`;
    counterLayer.append(body);
    return { name, minimum, body, input: body.querySelector<HTMLInputElement>("input")!,
      value: String(value), clicks: 0, base: name === "green" ? 36 : name === "blue" ? 16 : 10,
      running: name === "purple", ordinary: false, shakes: 0, lastRandom: 0, offset: 0 };
  });
  type Counter = typeof counters[number];
  const paint = (c: Counter) => {
    if (c.input.value !== c.value) c.input.value = c.value;
    c.body.dataset.clicks = String(c.clicks);
  };
  const check = () => {
    if (disposed || corrupt) return;
    if (counters.every(c => c.value === "67" || (c.name === "green" && c.value === "SIXSEVEN"))) {
      show(3); return;
    }
    if (counters.every(c => c.name === "green" ? c.value === "ZERO" : c.value === "0")) {
      show(2, counters.every(c => c.clicks === c.minimum));
    }
  };
  const updateClock = (c: Counter) => {
    if (c.ordinary) return;
    const time = now();
    const seconds = time.getHours() * 3600 + time.getMinutes() * 60 + time.getSeconds();
    const remaining = ((9582 - seconds + c.offset) % 86400 + 86400) % 86400;
    c.value = String(remaining);
    if (!remaining) c.ordinary = true;
  };
  const step = (c: Counter, delta: number) => {
    if (corrupt) return;
    c.clicks++;
    if (c.name === "purple" && !c.ordinary) {
      c.running = delta > 0;
    } else if (c.name === "pink" && !c.ordinary) {
      c.offset += delta; updateClock(c);
    } else {
      const limit = Math.pow(c.base, 9);
      const number = parseInt(c.value, c.base) || 0;
      c.value = ((number + delta + limit) % limit).toString(c.base).toUpperCase();
    }
    paint(c); check();
  };
  counters.forEach(c => {
    if (c.name === "pink") updateClock(c);
    if (c.name === "purple") c.value = String(1 + Math.floor(Math.random() * 999999999));
    paint(c);
    listen(c.body, "click", event => {
      const button = (event.target as Element).closest<HTMLButtonElement>("button");
      if (!button || corrupt) return;
      if (button.hasAttribute("data-reset")) { c.clicks++; c.value = "0"; paint(c); check(); }
      else if (button.dataset.step) step(c, Number(button.dataset.step));
    });
    listen(c.input, "keydown", event => {
      if (c.name !== "cyan" && (event.key === "Backspace" || event.key === "Delete")) {
        event.preventDefault(); return;
      }
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault(); step(c, event.key === "ArrowUp" ? 1 : -1);
      }
      if (event.key === "Enter") event.preventDefault();
    });
    listen(c.input, "beforeinput", event => {
      const edit = event as InputEvent;
      // Cyan's explicit three-click solution treats deleting selected digits as free.
      const deletion = edit.inputType.startsWith("delete");
      if (corrupt || (c.name === "cyan" ? !deletion : deletion)) event.preventDefault();
    });
    listen(c.input, "paste", event => { if (c.name === "cyan" || corrupt) event.preventDefault(); });
    listen(c.input, "cut", event => { if (c.name !== "cyan" || corrupt) event.preventDefault(); });
    listen(c.input, "drop", event => event.preventDefault());
    listen(c.input, "input", () => {
      if (corrupt) return;
      const value = c.input.value.toUpperCase();
      if (c.name === "cyan" && value === "") { show(2); return; }
      const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(0, c.base);
      if (value.length > 9 || [...value].some(letter => !alphabet.includes(letter))) { paint(c); return; }
      if (c.name !== "cyan") c.clicks++;
      c.value = value || "0";
      if (c.name === "pink") c.ordinary = true;
      if (c.name === "purple") c.running = false;
      paint(c); check();
    });
  });

  // Level 37's standard menu, followed by the counter's additional radix options.
  const menu = document.createElement("div");
  menu.className = "level-09__context-menu level-67__menu";
  menu.setAttribute("role", "menu"); menu.hidden = true;
  menu.setAttribute("aria-label", "Flash player menu");
  menu.innerHTML = `<button type="button" role="menuitemcheckbox" data-command="music">Music</button>
    <button type="button" role="menuitemcheckbox" data-command="effects">Sound Effects</button>
    <button type="button" role="menuitem" data-command="music-volume" aria-haspopup="menu"></button>
    <button type="button" role="menuitem" data-command="effects-volume" aria-haspopup="menu"></button>
    <div class="level-09__volume-menu" role="menu" aria-label="Volume" data-volumes hidden>
      ${Array.from({ length: 11 }, (_, i) => `<button type="button" role="menuitemradio" data-volume="${i * 10}"></button>`).join("")}</div>
    <div class="level-09__menu-separator"></div>
    <button type="button" role="menuitem" data-command="zoom-in">Zoom In</button>
    <button type="button" role="menuitem" data-command="zoom-out">Zoom Out</button>
    <button type="button" role="menuitem" data-command="show-all">Show All</button>
    <div class="level-09__menu-separator"></div>
    <button type="button" data-command="forward">Forward</button><button type="button" data-command="back">Back</button>
    <button type="button" role="menuitem" data-command="rewind">Rewind</button>
    <div class="level-09__menu-separator"></div>
    <button type="button" data-command="radix" aria-haspopup="menu" aria-expanded="false">Radix Mode ▸</button>
    <div class="level-09__volume-menu" role="menu" aria-label="Radix Mode" data-radices hidden>${[2, 8, 10, 16, 36].map(base => `<button type="button" role="menuitemradio" data-base="${base}" aria-checked="${base === 16}">${base === 16 ? "✓ " : ""}Base ${base}</button>`).join("")}
    <button type="button" role="menuitem" data-command="corrupt">Gibberish</button></div>
    <div class="level-09__menu-separator"></div><div class="level-09__player-label">Never Ending Level Game ++</div>`;
  screen.append(menu);
  const volumes = menu.querySelector<HTMLElement>("[data-volumes]")!;
  const radices = menu.querySelector<HTMLElement>("[data-radices]")!;
  let volumeKind: "music" | "effects" = "music";
  const item = (command: string) => menu.querySelector<HTMLButtonElement>(`[data-command="${command}"]`)!;
  const updateSettings = () => {
    for (const kind of ["music", "effects"] as const) {
      const enabled = kind === "music" ? audio.musicEnabled : audio.effectsEnabled;
      item(kind).textContent = `${enabled ? "✓" : ""}  ${kind === "music" ? "Music" : "Sound Effects"}`;
      item(kind).setAttribute("aria-checked", String(enabled));
    }
    item("music-volume").textContent = `   Music Volume: ${audio.musicVolume}%  ▸`;
    item("effects-volume").textContent = `   SFX Volume: ${audio.effectsVolume}%  ▸`;
    volumes.querySelectorAll<HTMLButtonElement>("[data-volume]").forEach(button => {
      const selected = Number(button.dataset.volume) === (volumeKind === "music" ? audio.musicVolume : audio.effectsVolume);
      button.textContent = `${selected ? "✓" : ""}  ${button.dataset.volume}%`;
      button.setAttribute("aria-checked", String(selected));
    });
    item("zoom-in").disabled = zoom >= 4;
    item("zoom-out").disabled = zoom <= 1;
  };
  const closeMenu = () => { menu.hidden = volumes.hidden = radices.hidden = true; item("radix").setAttribute("aria-expanded", "false"); };
  const openSubmenu = (submenu: HTMLElement, trigger: HTMLElement) => {
    volumes.hidden = radices.hidden = true;
    submenu.hidden = false;
    item("radix").setAttribute("aria-expanded", String(submenu === radices));
    const bounds = localElementBounds(screen, menu), sub = localElementBounds(screen, submenu);
    submenu.style.top = `${Math.max(-bounds.top + 4, Math.min(trigger.offsetTop, screen.clientHeight - bounds.top - sub.height - 4))}px`;
    submenu.classList.toggle("opens-left", bounds.left + bounds.width + sub.width + 3 > screen.clientWidth - 4);
  };
  const blue = counters.find(c => c.name === "blue")!;
  listen(blue.body, "contextmenu", event => {
    event.preventDefault(); if (corrupt) return;
    closeMenu(); updateSettings(); menu.hidden = false;
    positionFloatingElement(screen, menu, event.clientX, event.clientY);
  });
  listen(document, "pointerdown", event => { if (!menu.contains(event.target as Node)) closeMenu(); });
  listen(document, "keydown", event => { if (event.key === "Escape") closeMenu(); });
  listen(menu, "click", event => {
    const target = (event.target as Element).closest<HTMLButtonElement>("button");
    if (!target) return;
    if (target.dataset.volume !== undefined) {
      const volume = Number(target.dataset.volume);
      if (volumeKind === "music") audio.setMusicVolume(volume); else audio.setEffectsVolume(volume);
      updateSettings(); volumes.hidden = true; return;
    }
    const command = target.dataset.command;
    if (command === "back" || command === "forward") { show(2); return; }
    if (command === "music") { audio.setMusicEnabled(!audio.musicEnabled); updateSettings(); return; }
    if (command === "effects") { audio.setEffectsEnabled(!audio.effectsEnabled); updateSettings(); return; }
    if (command === "music-volume" || command === "effects-volume") {
      volumeKind = command === "music-volume" ? "music" : "effects";
      updateSettings(); openSubmenu(volumes, target); return;
    }
    if (command === "rewind") { closeMenu(); context.goToMenu(); return; }
    if (command === "zoom-in" || command === "zoom-out" || command === "show-all") {
      const next = command === "show-all" ? 1 : Math.max(1, Math.min(4, zoom + (command === "zoom-in" ? .25 : -.25)));
      panX = 400 - (400 - panX) / zoom * next;
      panY = 300 - (300 - panY) / zoom * next;
      zoom = next; renderZoom(); closeMenu(); return;
    }
    if (command === "radix") {
      openSubmenu(radices, target); return;
    }
    if (command === "corrupt") {
      corrupt = true; menu.hidden = true;
      failureTimer = window.setTimeout(() => { if (!disposed) show(2); }, 5000);
      return;
    }
    if (target.dataset.base) {
      // Reinterpret the displayed digits, rather than convert 0x101010 to binary.
      // Thus selecting base 2 makes the initial 101010 equal decimal 42.
      blue.base = Number(target.dataset.base);
      const number = parseInt(blue.value, blue.base);
      blue.value = Number.isNaN(number) ? "0" : number.toString(blue.base).toUpperCase();
      menu.querySelectorAll<HTMLButtonElement>("[data-base]").forEach(button => {
        const selected = Number(button.dataset.base) === blue.base;
        button.setAttribute("aria-checked", String(selected));
        button.textContent = `${selected ? "✓ " : ""}Base ${button.dataset.base}`;
      });
      menu.hidden = true; paint(blue); check();
    }
  });

  let drag: { c: Counter; id: number; x: number; y: number; lastX: number; direction: number; travel: number } | undefined;
  let pan: { id: number; x: number; y: number; originX: number; originY: number } | undefined;
  listen(screen, "pointerdown", event => {
    if (event.button !== 0 || corrupt || (event.target as Element).closest("input, button, .level-67__menu")) return;
    const body = (event.target as Element).closest<HTMLElement>("[data-counter]");
    const c = counters.find(item => item.body === body);
    if (!c) {
      if (zoom > 1) {
        const point = clientPointToLocal(screen, event.clientX, event.clientY);
        pan = { id: event.pointerId, x: point.x, y: point.y, originX: panX, originY: panY };
        screen.setPointerCapture(event.pointerId); event.preventDefault();
      }
      return;
    }
    const point = clientPointToLocal(world, event.clientX, event.clientY);
    drag = { c, id: event.pointerId, x: point.x - c.body.offsetLeft, y: point.y - c.body.offsetTop, lastX: point.x, direction: 0, travel: 0 };
    c.body.style.zIndex = String(++layer);
    c.body.setPointerCapture(event.pointerId); event.preventDefault();
  });
  listen(screen, "pointermove", event => {
    if (pan?.id === event.pointerId) {
      const point = clientPointToLocal(screen, event.clientX, event.clientY);
      panX = pan.originX + point.x - pan.x; panY = pan.originY + point.y - pan.y; renderZoom();
    }
    if (!drag || event.pointerId !== drag.id) return;
    const point = clientPointToLocal(world, event.clientX, event.clientY);
    const { c } = drag;
    c.body.style.left = `${Math.max(0, Math.min(800 - c.body.offsetWidth, point.x - drag.x))}px`;
    c.body.style.top = `${Math.max(0, Math.min(600 - c.body.offsetHeight, point.y - drag.y))}px`;
    const dx = point.x - drag.lastX;
    if (Math.abs(dx) >= 2) {
      const direction = Math.sign(dx);
      if (direction !== drag.direction && drag.travel >= 20) {
        if (c.name === "purple" && !c.ordinary) {
          c.shakes++;
          if (c.shakes >= 20) { c.value = "0"; c.ordinary = true; c.running = false; paint(c); check(); if (disposed) return; }
        }
        drag.travel = 0;
      }
      drag.travel += Math.abs(dx); drag.direction = direction; drag.lastX = point.x;
    }
  });
  const endDrag = () => {
    if (pan && screen.hasPointerCapture(pan.id)) screen.releasePointerCapture(pan.id);
    pan = undefined;
    if (drag?.c.body.hasPointerCapture(drag.id)) drag.c.body.releasePointerCapture(drag.id);
    drag = undefined;
  };
  listen(screen, "pointerup", endDrag); listen(screen, "pointercancel", endDrag);

  const ticker = window.setInterval(() => {
    if (disposed) return;
    if (corrupt) {
      counters.forEach(c => { c.input.value = Array.from({ length: 9 }, () => String.fromCharCode(0x2500 + Math.floor(Math.random() * 128))).join(""); });
      return;
    }
    counters.forEach(c => {
      if (c.name === "purple" && c.running && performance.now() - c.lastRandom > 50 + c.shakes * 55) {
        c.lastRandom = performance.now(); c.value = String(1 + Math.floor(Math.random() * 999999999));
      }
      if (c.name === "pink") updateClock(c);
      paint(c);
    });
    check();
  }, 50);
  return () => { disposed = true; endDrag(); clearInterval(ticker); clearTimeout(failureTimer); menu.remove(); };
}
