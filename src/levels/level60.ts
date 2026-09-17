import { assetUrl } from "../core/assets";
import { clientPointToLocal, localElementBounds, positionFloatingElement } from "../core/floatingPosition";
import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelDefinition } from "../core/types";

const FINALS = ["Lunaris", "RAlNB0W", "Y()UW|N"];
const LETTERS = ["Lunar?s", "RAlNB0W", "Y()UW|N"];
const CLUES = [
  ["", "47", "Absolute Zero", "found", "tea", "", ""],
  ["", "89", "v", "", "microphone", "rewind", "15727310"],
  ["14833", "endive", "5", "", "crop", "duck", "I SUCK ;("],
];
const DERANGEMENTS = [0, 1, 2, 9, 44, 265, 1854];
const DUCK = "⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿=⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿=⣿⣿⣿⣿⣿⣿⣿⣿⡿⢋⣩⣭⣶⣶⣮⣭⡙⠿⣿⣿⣿⣿⣿⣿=⣿⣿⣿⣿⣿⣿⠿⣋⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⡙⢿⣿⣿⣿=⣿⣿⣿⣿⣿⡃⠄⠹⡿⣿⣿⣿⣿⠟⠛⣿⣿⣿⣿⣷⡌⢿⣿⣿=⣿⣿⣿⣿⣿⠐⣠⡶⣶⣲⡎⢻⣿⣤⣴⣾⣿⣿⣿⣿⣿⠸⣿⣿=⣿⠟⣋⡥⡶⣞⡯⣟⣾⣺⢽⡧⣥⣭⣉⢻⣿⣿⣿⣿⣿⣿⣆⢻⣿=⡃⣾⢯⢿⢽⣫⡯⣷⣳⢯⡯⠯⠷⠻⠞⣼⣿⣿⣿⣿⣿⣿⡌⣿=⣦⣍⡙⠫⠛⠕⣋⡓⠭⣡⢶⠗⣡⣶⡝⣿⣿⣿⣿⣿⣿⣿⣧⢹=⣿⣿⣿⣿⣿⣿⣘⣛⣋⣡⣵⣾⣿⣿⣿⢸⣿⣿⣿⣿⣿⣿⣿⢸=⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢸⣿⣿⣿⣿⣿⣿⣿⢸=⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢸⣿⣿⣿⣿⣿⣿⣿⢸";
const SIZE = 88;

export const level60: LevelDefinition = {
  number: 60,
  title: "Reunion III",
  scenes: [
    { id: "1", label: "Scene 1 - Main" },
    { id: "2", label: "Scene 2 - Failed" },
  ],
  mount({ screen, initialScene, listen, now, complete, audio }) {
    screen.className = "level-screen level-60";
    screen.dataset.customCursorRoot = "";
    screen.innerHTML = `
      <div class="level-60__rainbow"></div>
      <div class="level-60__world">
        <header class="level-heading"><div class="level-heading__number">Le<span class="level-60__v">v</span>el 60</div><h1>Reunion III</h1></header>
        <section class="level-60__main">
          <div class="level-60__letters">${Array.from({ length: 7 }, (_, i) => `<span style="left:${44 + i * 104}px"></span>`).join("")}</div>
          <div class="level-60__tiles">${Array.from({ length: 7 }, (_, i) => `<button class="level-60__tile" type="button" data-tile="${i}" tabindex="-1" aria-label="Square ${i + 1}"><img alt="" draggable="false"></button>`).join("")}</div>
          <span class="level-60__found">found</span>
          <form class="level-08__form level-60__form" autocomplete="off">
            <input class="nelg-password-input" type="text" data-allow-select autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Password">
            <button type="submit">GO</button>
          </form>
          <input class="level-60__hidden-input" type="text" data-allow-select aria-label="Hidden password" autocomplete="off" autocapitalize="off" spellcheck="false" tabindex="-1">
        </section>
        <section class="level-60__failed" hidden><p class="level-60__failure-title">FAILED</p><p>Start over from the beginning.</p><button type="button">Try Again</button></section>
      </div>
      <textarea class="level-60__duck" aria-label="Hidden text" data-allow-select readonly tabindex="-1" spellcheck="false" hidden></textarea>
      <div class="level-09__context-menu level-60__menu" role="menu" aria-label="Flash player menu" hidden>
        <button type="button" role="menuitemcheckbox" data-command="music"></button>
        <button type="button" role="menuitemcheckbox" data-command="effects"></button>
        <button type="button" role="menuitem" data-command="music-volume" aria-haspopup="menu"></button>
        <button type="button" role="menuitem" data-command="effects-volume" aria-haspopup="menu"></button>
        <div class="level-09__volume-menu level-60__volumes" role="menu" aria-label="Volume" hidden>${Array.from({ length: 11 }, (_, i) => `<button type="button" role="menuitemradio" data-volume="${i * 10}">${i * 10}%</button>`).join("")}</div>
        <div class="level-09__menu-separator"></div>
        <button type="button" role="menuitem" data-command="zoom-in">Zoom In</button>
        <button type="button" role="menuitem" data-command="zoom-out">Zoom Out</button>
        <button type="button" role="menuitem" data-command="show-all">Show All</button>
        <div class="level-09__menu-separator"></div>
        <button type="button" role="menuitem" data-command="forward">Forward</button>
        <button type="button" role="menuitem" data-command="back">Back</button>
        <button type="button" role="menuitem" data-command="rewind">Rewind</button>
        <div class="level-09__menu-separator" role="separator"></div>
        <div class="level-09__player-label">Never Ending Level Game ++</div>
      </div>
      <span class="custom-cursor level-60__cursor" aria-hidden="true" hidden><img src="${assetUrl("cursor/level37.png")}" alt="" draggable="false"><span class="level-60__microphone">mi<span>crop</span>hone</span></span>
    `;
    const world = screen.querySelector<HTMLElement>(".level-60__world")!;
    const main = screen.querySelector<HTMLElement>(".level-60__main")!;
    const failed = screen.querySelector<HTMLElement>(".level-60__failed")!;
    const tiles = [...screen.querySelectorAll<HTMLButtonElement>(".level-60__tile")];
    const letters = [...screen.querySelectorAll<HTMLElement>(".level-60__letters span")];
    const form = screen.querySelector<HTMLFormElement>("form")!;
    const input = form.querySelector("input")!;
    const password = attachStarMaskedInput(input, listen);
    const hiddenInput = screen.querySelector<HTMLInputElement>(".level-60__hidden-input")!;
    const duck = screen.querySelector<HTMLTextAreaElement>(".level-60__duck")!;
    duck.value = DUCK;
    const found = screen.querySelector<HTMLElement>(".level-60__found")!;
    const cursor = screen.querySelector<HTMLElement>(".level-60__cursor")!;
    const menu = screen.querySelector<HTMLElement>(".level-60__menu")!;
    const volumes = screen.querySelector<HTMLElement>(".level-60__volumes")!;
    let phase = 0;
    let isFailed = false;
    let unlocked = Array<boolean>(7).fill(false);
    let tabArmed = false;
    let tabCount = 0;
    let rewindArmed = false;
    let hiddenPending = false;
    let scroll = 0;
    let zoom = 1;
    let panX = 0;
    let panY = 0;
    let pan: { id: number; x: number; y: number; left: number; top: number } | undefined;
    let volumeKind: "music" | "effects" = "music";
    let drag: { id: number; index: number; x: number; y: number; left: number; top: number; lastX: number; lastY: number; time: number } | undefined;

    const stopDrag = () => {
      const previous = drag;
      drag = undefined;
      const tile = previous && tiles[previous.index];
      if (previous && tile?.hasPointerCapture(previous.id)) tile.releasePointerCapture(previous.id);
    };
    const renderTransform = () => {
      panX = Math.max(-400 * (zoom - 1), Math.min(400 * (zoom - 1), panX));
      panY = Math.max(-300 * (zoom - 1), Math.min(300 * (zoom - 1), panY));
      world.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
      cursor.style.transform = `scale(${zoom})`;
    };
    const stopPan = () => {
      const previous = pan;
      pan = undefined;
      if (previous && screen.hasPointerCapture(previous.id)) screen.releasePointerCapture(previous.id);
    };
    const setZoom = (value: number) => {
      stopPan();
      const next = Math.max(1, Math.min(4, value));
      panX *= next / zoom;
      panY *= next / zoom;
      zoom = next;
      renderTransform();
    };
    const renderPhase = (resetPassword = true) => {
      stopDrag();
      isFailed = false;
      screen.dataset.phase = String(phase + 1);
      screen.dataset.scene = "1";
      screen.classList.remove("level-60--failed");
      screen.style.setProperty("--tile-color", ["#0f0", "#00f", "#f00"][phase]!);
      main.hidden = false;
      failed.hidden = true;
      menu.hidden = true;
      volumes.hidden = true;
      duck.hidden = phase !== 2;
      hiddenInput.disabled = phase !== 2;
      hiddenInput.value = "";
      hiddenPending = false;
      if (resetPassword) password.clear();
      unlocked = Array<boolean>(7).fill(false);
      tabCount = 0;
      tabArmed = false;
      rewindArmed = false;
      scroll = 0;
      found.style.transform = "translateY(100px)";
      found.style.opacity = "0";
      setZoom(1);
      tiles.forEach((tile, index) => {
        tile.style.left = `${44 + index * 104}px`;
        tile.style.top = "275px";
        tile.style.zIndex = "";
        tile.tabIndex = phase === 1 && index === 0 ? 0 : -1;
        letters[index]!.textContent = LETTERS[phase]![index]!;
        const img = tile.querySelector("img")!;
        img.hidden = phase === 2 && index === 0;
        if (img.hidden) img.removeAttribute("src");
        else img.src = assetUrl(`images/level60${"abc"[phase]}${index + 1}.png`);
      });
      (document.activeElement as HTMLElement | null)?.blur();
    };
    const fail = () => {
      stopDrag();
      isFailed = true;
      screen.dataset.scene = "2";
      screen.classList.add("level-60--failed");
      main.hidden = true;
      failed.hidden = false;
      menu.hidden = true;
      duck.hidden = true;
      setZoom(1);
      (document.activeElement as HTMLElement | null)?.blur();
    };
    const canDrag = (index: number) => {
      if (isFailed) return false;
      if (phase === 0 && index === 0) {
        const date = now();
        return date.getHours() === 15 && date.getMinutes() === 0 && date.getSeconds() <= 3;
      }
      if (phase === 0 && index === 6) { const date = now(); return date.getMonth() === 7 && date.getDate() === 1; }
      return unlocked[index] || (phase === 0 && index === 5) || (phase === 1 && index === 3);
    };
    const submit = (fromHidden = false) => {
      if (isFailed) return;
      if (phase === 2 && (fromHidden || hiddenPending)) {
        if (hiddenInput.value !== "hidden") { fail(); return; }
        unlocked[3] = true;
        hiddenPending = false;
        return;
      }
      const answer = password.getValue();
      if (answer === FINALS[phase]) {
        if (phase === 2) complete();
        else { phase++; renderPhase(false); }
        return;
      }
      const index = CLUES[phase]!.findIndex(value => value !== "" && value === answer);
      if (index === -1) { fail(); return; }
      if (phase === 1 && index === 5) rewindArmed = true;
      else unlocked[index] = true;
    };
    listen(hiddenInput, "input", () => { hiddenPending = true; });
    listen(form, "submit", event => { event.preventDefault(); submit(); });
    for (const field of [input, hiddenInput]) listen(field, "keydown", event => {
      if (event.key === "Enter" && !event.repeat) { event.preventDefault(); submit(field === hiddenInput); }
    });
    listen(failed.querySelector("button")!, "click", () => { phase = 0; renderPhase(); });
    listen(document, "keydown", event => {
      if (isFailed || !screen.isConnected) return;
      if (event.key === "Escape") { menu.hidden = true; return; }
      if (event.key !== "Tab" || !menu.hidden) return;
      if (phase === 1) {
        event.preventDefault();
        if (!event.repeat) { tiles[0]!.focus({ preventScroll: true }); tabArmed = true; }
      } else if (phase === 2) {
        event.preventDefault();
        hiddenInput.focus({ preventScroll: true });
      }
    });
    listen(tiles[0]!, "keydown", event => {
      if (phase !== 1 || isFailed || event.key !== "Enter") return;
      event.preventDefault();
      if (!event.repeat && tabArmed) { tabArmed = false; tabCount++; if (tabCount >= 15) unlocked[0] = true; }
    });
    tiles.forEach((tile, index) => {
      listen(tile, "click", () => { if (!isFailed && phase === 2) console.log(DERANGEMENTS[index]); });
      listen(tile, "pointerdown", event => {
        if (event.button !== 0 || drag || !canDrag(index)) return;
        event.preventDefault();
        const point = clientPointToLocal(world, event.clientX, event.clientY);
        drag = { id: event.pointerId, index, x: point.x, y: point.y, left: parseFloat(tile.style.left), top: parseFloat(tile.style.top), lastX: point.x, lastY: point.y, time: performance.now() };
        tile.style.zIndex = "3";
        tile.setPointerCapture(event.pointerId);
      });
      listen(tile, "pointermove", event => {
        if (drag?.id !== event.pointerId || drag.index !== index) return;
        if (!canDrag(index)) { stopDrag(); return; }
        const point = clientPointToLocal(world, event.clientX, event.clientY);
        const time = performance.now();
        const speed = Math.hypot(point.x - drag.lastX, point.y - drag.lastY) / Math.max(16, time - drag.time) * 1000;
        if (phase === 1 && index === 3 && speed > 200) { fail(); return; }
        drag.lastX = point.x; drag.lastY = point.y; drag.time = time;
        const left = Math.max(0, Math.min(800 - SIZE, drag.left + point.x - drag.x));
        const top = Math.max(0, Math.min(600 - SIZE, drag.top + point.y - drag.y));
        tile.style.left = `${left}px`; tile.style.top = `${top}px`;
        if (phase === 0 && index === 5 && left >= 800 - SIZE - 4 && top <= 4) letters[5]!.textContent = "i";
      });
      for (const type of ["pointerup", "pointercancel", "lostpointercapture"] as const) listen(tile, type, event => { if (drag?.id === event.pointerId) stopDrag(); });
    });
    listen(screen, "wheel", event => {
      if (isFailed || phase !== 0) return;
      event.preventDefault();
      scroll = Math.max(0, Math.min(1000, scroll + event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 600 : 1)));
      found.style.transform = `translateY(${100 - scroll / 10}px)`;
      found.style.opacity = String(scroll / 1000);
    }, { passive: false });
    listen(screen, "pointermove", event => {
      const point = clientPointToLocal(screen, event.clientX, event.clientY);
      cursor.hidden = false;
      cursor.style.left = `${point.x}px`; cursor.style.top = `${point.y}px`;
      if (pan?.id === event.pointerId) {
        panX = pan.left + point.x - pan.x;
        panY = pan.top + point.y - pan.y;
        renderTransform();
      }
    });
    listen(screen, "pointerdown", event => {
      if (event.button !== 0 || isFailed || zoom <= 1 || drag || pan) return;
      if ((event.target as Element).closest("button, input, textarea, form, .level-60__menu")) return;
      event.preventDefault();
      const point = clientPointToLocal(screen, event.clientX, event.clientY);
      pan = { id: event.pointerId, x: point.x, y: point.y, left: panX, top: panY };
      screen.setPointerCapture(event.pointerId);
    });
    for (const type of ["pointerup", "pointercancel", "lostpointercapture"] as const) listen(screen, type, event => {
      if (pan?.id === event.pointerId) stopPan();
    });
    listen(screen, "pointerleave", () => { cursor.hidden = true; });
    const updateMenu = () => {
      for (const kind of ["music", "effects"] as const) {
        const button = menu.querySelector<HTMLButtonElement>(`[data-command="${kind}"]`)!;
        const enabled = kind === "music" ? audio.musicEnabled : audio.effectsEnabled;
        button.textContent = `${enabled ? "\u2713" : ""}  ${kind === "music" ? "Music" : "Sound Effects"}`;
        button.setAttribute("aria-checked", String(enabled));
        menu.querySelector<HTMLButtonElement>(`[data-command="${kind}-volume"]`)!.textContent = `   ${kind === "music" ? "Music" : "SFX"} Volume: ${kind === "music" ? audio.musicVolume : audio.effectsVolume}%  \u25b6`;
      }
      volumes.querySelectorAll<HTMLButtonElement>("button").forEach(button => {
        const selected = Number(button.dataset.volume) === (volumeKind === "music" ? audio.musicVolume : audio.effectsVolume);
        button.textContent = `${selected ? "\u2713" : ""}  ${button.dataset.volume}%`;
        button.setAttribute("aria-checked", String(selected));
      });
      menu.querySelector<HTMLButtonElement>('[data-command="zoom-in"]')!.disabled = zoom >= 4;
      menu.querySelector<HTMLButtonElement>('[data-command="zoom-out"]')!.disabled = zoom <= 1;
    };
    const positionVolumes = (kind: "music" | "effects") => {
      volumeKind = kind;
      volumes.setAttribute("aria-label", kind === "music" ? "Music volume" : "SFX volume");
      updateMenu();
      volumes.hidden = false;
      const bounds = localElementBounds(screen, menu);
      const submenu = localElementBounds(screen, volumes);
      const item = menu.querySelector<HTMLButtonElement>(`[data-command="${kind}-volume"]`)!;
      const maximumTop = screen.clientHeight - bounds.top - submenu.height - 4;
      volumes.style.top = `${Math.max(-bounds.top + 4, Math.min(item.offsetTop, maximumTop))}px`;
      volumes.classList.toggle("opens-left", bounds.left + bounds.width + submenu.width > screen.clientWidth - 4);
    };
    listen(screen, "contextmenu", event => {
      if (isFailed || phase !== 1) return;
      event.preventDefault();
      menu.hidden = false; volumes.hidden = true; updateMenu();
      positionFloatingElement(screen, menu, event.clientX, event.clientY);
    });
    listen(screen, "pointerdown", event => { if (!menu.contains(event.target as Node)) menu.hidden = true; });
    listen(menu, "click", event => {
      const button = (event.target as Element).closest<HTMLButtonElement>("button");
      if (!button || button.disabled) return;
      if (button.dataset.volume !== undefined) {
        const value = Number(button.dataset.volume);
        if (volumeKind === "music") audio.setMusicVolume(value); else audio.setEffectsVolume(value);
        updateMenu(); volumes.hidden = true; return;
      } else {
        switch (button.dataset.command) {
          case "music": audio.setMusicEnabled(!audio.musicEnabled); updateMenu(); return;
          case "effects": audio.setEffectsEnabled(!audio.effectsEnabled); updateMenu(); return;
          case "music-volume": case "effects-volume":
            { const kind = button.dataset.command === "music-volume" ? "music" : "effects";
              if (volumes.hidden || volumeKind !== kind) positionVolumes(kind);
              else volumes.hidden = true;
              return; }
          case "zoom-in": setZoom(zoom + 0.25); break;
          case "zoom-out": setZoom(zoom - 0.25); break;
          case "show-all": setZoom(1); break;
          case "rewind": if (rewindArmed) { unlocked[5] = true; rewindArmed = false; } break;
        }
      }
      menu.hidden = true;
    });
    renderPhase();
    if (initialScene === "2") fail();
    return () => { stopDrag(); stopPan(); delete screen.dataset.customCursorRoot; };
  },
};
