import { marked } from "marked";
import DOMPurify from "dompurify";
import { floodFill, rectangleSelection, type Point } from "./utilityDrawing";
import { capturePuzzle } from "./utilityCapture";

type Tool = "pen" | "eraser" | "fill" | "text" | "capture" | "notes";
const SYSTEM_FONTS = ["Courier", "Arial", "Georgia", "monospace", "sans-serif"];
const NOTE_KEY = "nelg-utility-note";
const FONT_KEY = "nelg-utility-note-font";
const fontFamily = (font: string) => ["monospace", "sans-serif"].includes(font) ? font : `"${font}"`;

export class UtilityTools {
  readonly hud = document.createElement("div");
  private readonly toggle = document.createElement("button");
  private enabled = false;
  private frame?: HTMLElement;
  private layer?: HTMLCanvasElement;
  private panel?: HTMLElement;
  private selection?: HTMLElement;
  private controller?: AbortController;
  private open = false;
  private tool: Tool = "pen";
  private history: ImageData[] = [];
  private redoHistory: ImageData[] = [];
  private pointer?: number;
  private start?: Point;
  private last?: Point;
  private captureUrl?: string;
  private captureBlob?: Blob;
  private busy = false;
  private fonts = SYSTEM_FONTS;

  constructor() {
    this.hud.className = "game-hud";
    this.toggle.className = "utility-toggle";
    this.toggle.type = "button";
    this.toggle.textContent = "✎";
    this.toggle.title = "Utility tools";
    this.toggle.setAttribute("aria-label", "Utility tools");
    this.toggle.setAttribute("aria-controls", "utility-tools-panel");
    this.toggle.setAttribute("aria-expanded", "false");
    this.toggle.hidden = true;
    this.toggle.addEventListener("click", () => this.setOpen(!this.open));
    this.hud.append(this.toggle);
    document.body.append(this.hud);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    const frame = this.frame;
    this.unmount();
    if (frame) this.mount(frame);
  }

  mount(frame: HTMLElement): void {
    this.frame = frame;
    if (!this.enabled) return;
    const controller = new AbortController();
    this.controller = controller;
    const signal = controller.signal;
    const layer = document.createElement("canvas");
    layer.className = "utility-drawing";
    layer.width = 800;
    layer.height = 600;
    layer.setAttribute("aria-label", "Puzzle annotation layer");
    this.layer = layer;
    const selection = document.createElement("div");
    selection.className = "utility-selection";
    selection.dataset.html2canvasIgnore = "true";
    selection.hidden = true;
    this.selection = selection;
    frame.append(layer, selection);
    const panel = document.createElement("section");
    panel.id = "utility-tools-panel";
    panel.className = "utility-tools";
    panel.setAttribute("aria-label", "Utility tools");
    panel.hidden = true;
    // Reuse the @font-face registry from fonts.css, including future game families.
    const gameFonts = [...new Set(Array.from(document.fonts, face => face.family.replace(/^["']|["']$/g, "")))]
      .filter(font => font.startsWith("NELG ")).sort();
    this.fonts = [...SYSTEM_FONTS, ...gameFonts];
    const fontOptions = '<optgroup label="System fonts">'
      + SYSTEM_FONTS.map(font => `<option>${font}</option>`).join("")
      + '</optgroup><optgroup label="Game fonts">'
      + gameFonts.map(font => `<option value="${font}">${font.replace(/^NELG /, "")}</option>`).join("")
      + '</optgroup>';
    panel.innerHTML = `
      <header title="Drag the title to move tools"><strong>UTILITY TOOLS</strong><span><button type="button" data-action="minimize" aria-label="Minimize tools" aria-expanded="true">−</button><button type="button" data-action="close" aria-label="Close tools">×</button></span></header>
      <nav aria-label="Tools">${([['pen', 'Pen'], ['eraser', 'Eraser'], ['fill', 'Fill'], ['text', 'Text'], ['capture', 'Capture'], ['notes', 'Notepad']] as const).map(([tool, label]) => `<button type="button" data-tool="${tool}" aria-pressed="false">${label}</button>`).join("")}</nav>
      <div class="utility-tools__settings" data-settings="pen eraser fill">
        <label>Color <input data-field="color" type="color" value="#228b22"></label>
        <label>Thickness <input data-field="width" type="range" min="1" max="60" value="5"><output data-width>5 px</output></label>
        <p>Draw over the puzzle. Fill colors a connected area of your drawing.</p>
      </div>
      <div class="utility-tools__settings" data-settings="fill" hidden>
        <label>Include puzzle background <input data-field="fill-background" type="checkbox"></label>
        <label>Color tolerance <input data-field="fill-tolerance" type="range" min="0" max="64" value="24"><output data-tolerance>24</output></label>
        <label>Connected pixels only <input data-field="fill-contiguous" type="checkbox" checked></label>
        <button type="button" data-action="precision-fill">Precision fill</button>
        <p>For nearly identical colors: choose Precision fill, then tap the background. Tolerance 0 preserves even a one-step color difference. Uncheck Connected pixels only to replace the same color everywhere.</p>
        <p>Use the visible puzzle and drawing colors as boundaries. Undo or Eraser restores the original background.</p>
      </div>
      <div class="utility-tools__settings" data-settings="text" hidden>
        <label>Text <textarea data-field="text" rows="2" placeholder="Type, then tap the puzzle" maxlength="2000"></textarea></label>
        <label>Font <select data-field="font">${fontOptions}</select></label>
        <label>Size <input data-field="size" type="number" min="8" max="160" value="28"></label>
        <label>Text color <input data-field="text-color" type="color" value="#ffffff"></label>
        <label>Outline <input data-field="outline" type="checkbox" checked></label>
        <label>Outline color <input data-field="outline-color" type="color" value="#111111"></label>
        <p>Tap the puzzle to place text. Use Undo or Eraser to remove it.</p>
      </div>
      <div class="utility-tools__settings" data-settings="capture" hidden>
        <p>Drag a rectangle on the puzzle. The capture is copied to your clipboard. Annotations are included; this panel is excluded.</p>
        <img class="utility-tools__preview" alt="Selected rectangle capture" hidden>
        <button type="button" data-action="copy-capture" hidden>Copy image</button>
        <a class="utility-tools__download" data-capture-download download="puzzle-capture.png" hidden>Save PNG</a>
      </div>
      <div class="utility-tools__settings" data-settings="notes" hidden>
        <label>Note font <select data-field="note-font">${fontOptions}</select></label>
        <label>Markdown note <textarea data-field="note" rows="9" spellcheck="false" placeholder="# Puzzle notes"></textarea></label>
        <div class="utility-tools__row"><button type="button" data-action="preview">Preview</button><button type="button" data-action="download-note">Download .md</button></div>
        <article class="utility-tools__markdown" hidden></article>
        <p>Notes are saved in this browser and kept between levels.</p>
      </div>
      <footer><button type="button" data-action="undo" title="Ctrl+Z" aria-keyshortcuts="Control+z Meta+z">Undo</button><button type="button" data-action="redo" title="Ctrl+Y / Ctrl+Shift+Z" aria-keyshortcuts="Control+y Control+Shift+z Meta+Shift+z">Redo</button><button type="button" data-action="clear">Clear drawing</button></footer>
      <p class="utility-tools__status" role="status" aria-live="polite"></p>
      <p class="utility-tools__hint">Drag the title or minimize to uncover the puzzle. Close tools to hide annotations and play; reopen to show them again. Drawings reset when you leave the level.</p>`;
    document.body.append(panel);
    this.panel = panel;
    this.toggle.hidden = false;
    this.tool = "pen";
    this.selectTool(this.tool);
    this.updateUndo();
    const note = this.field<HTMLTextAreaElement>("note");
    const noteFont = this.field<HTMLSelectElement>("note-font");
    try {
      note.value = localStorage.getItem(NOTE_KEY) ?? "";
      const font = localStorage.getItem(FONT_KEY);
      if (font && this.fonts.includes(font)) noteFont.value = font;
    } catch { this.status("Browser storage is unavailable. Download notes to keep them."); }
    this.applyNoteFont();
    const header = panel.querySelector("header")!;
    let drag: { pointer: number; x: number; y: number } | undefined;
    header.addEventListener("pointerdown", event => {
      if (event.button !== 0 || (event.target as Element).closest("button")) return;
      event.preventDefault();
      const rect = panel.getBoundingClientRect();
      drag = { pointer: event.pointerId, x: event.clientX - rect.left, y: event.clientY - rect.top };
      header.setPointerCapture(event.pointerId);
    }, { signal });
    header.addEventListener("pointermove", event => {
      if (drag?.pointer !== event.pointerId) return;
      const x = Math.max(4, Math.min(window.innerWidth - panel.offsetWidth - 4, event.clientX - drag.x));
      const y = Math.max(4, Math.min(window.innerHeight - 60, event.clientY - drag.y));
      panel.style.left = `${x}px`;
      panel.style.right = "auto";
      panel.style.top = `${y}px`;
      panel.style.maxHeight = `calc(100dvh - ${y + 8}px)`;
    }, { signal });
    const finishDrag = () => { drag = undefined; };
    header.addEventListener("pointerup", finishDrag, { signal });
    header.addEventListener("pointercancel", finishDrag, { signal });
    header.addEventListener("lostpointercapture", finishDrag, { signal });
    window.addEventListener("resize", () => {
      panel.style.left = panel.style.right = panel.style.top = panel.style.maxHeight = "";
    }, { signal });
    note.addEventListener("input", () => {
      this.saveNote();
      this.renderNote();
    }, { signal });
    noteFont.addEventListener("change", () => { this.applyNoteFont(); this.saveNote(); }, { signal });
    this.field("width").addEventListener("input", () => {
      panel.querySelector("[data-width]")!.textContent = `${this.field("width").value} px`;
    }, { signal });
    this.field("fill-tolerance").addEventListener("input", () => {
      panel.querySelector("[data-tolerance]")!.textContent = this.field("fill-tolerance").value;
    }, { signal });
    panel.addEventListener("click", (event) => {
      const button = (event.target as Element).closest<HTMLButtonElement>("button");
      if (!button) return;
      if (this.busy && ["undo", "redo", "clear", "precision-fill"].includes(button.dataset.action ?? "")) return;
      if (button.dataset.tool) this.selectTool(button.dataset.tool as Tool);
      switch (button.dataset.action) {
        case "close": this.setOpen(false); break;
        case "minimize": {
          const minimized = panel.classList.toggle("utility-tools--minimized");
          button.textContent = minimized ? "+" : "−";
          button.setAttribute("aria-label", minimized ? "Expand tools" : "Minimize tools");
          button.setAttribute("aria-expanded", String(!minimized));
          break;
        }
        case "undo": this.undo(); break;
        case "redo": this.redo(); break;
        case "clear": this.remember(); this.context().clearRect(0, 0, 800, 600); break;
        case "preview": {
          const preview = panel.querySelector<HTMLElement>("article")!;
          preview.hidden = !preview.hidden;
          button.textContent = preview.hidden ? "Preview" : "Hide preview";
          this.renderNote();
          break;
        }
        case "download-note": this.downloadNote(); break;
        case "copy-capture": void this.copyCapture(); break;
        case "precision-fill":
          this.field("fill-background").checked = true;
          this.field("fill-tolerance").value = "0";
          this.field("fill-contiguous").checked = false;
          panel.querySelector("[data-tolerance]")!.textContent = "0";
          this.status("Precision fill ready. Tap the background to reveal subtle colors. Undo before inspecting the next image.");
          break;
      }
    }, { signal });
    // Editing must not trigger document-level puzzle shortcuts or virtual controls.
    for (const type of ["keydown", "keyup", "pointerdown", "pointerup", "pointermove", "click", "contextmenu", "wheel"]) {
      panel.addEventListener(type, event => event.stopPropagation(), { signal });
    }
    window.addEventListener("keydown", event => {
      if (!this.open) return;
      const target = event.target;
      const editable = target instanceof HTMLTextAreaElement
        || (target instanceof HTMLInputElement && !["checkbox", "color", "range", "button"].includes(target.type))
        || (target instanceof HTMLElement && target.isContentEditable);
      const key = event.key.toLowerCase();
      if (!editable && !event.isComposing && !event.altKey && (event.ctrlKey || event.metaKey) && ["z", "y"].includes(key)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (key === "y" || event.shiftKey) this.redo();
        else this.undo();
        return;
      }
      if (event.key === "Escape") { event.preventDefault(); this.setOpen(false); }
      if (!(event.target instanceof Node) || !panel.contains(event.target)) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    }, { signal, capture: true });
    window.addEventListener("keyup", event => {
      if (this.open && (!(event.target instanceof Node) || !panel.contains(event.target))) event.stopImmediatePropagation();
    }, { signal, capture: true });
    layer.addEventListener("pointerdown", event => this.begin(event), { signal });
    layer.addEventListener("pointermove", event => this.move(event), { signal });
    layer.addEventListener("pointerup", event => this.end(event), { signal });
    layer.addEventListener("pointercancel", () => this.cancelStroke(), { signal });
    layer.addEventListener("lostpointercapture", () => this.cancelStroke(), { signal });
    for (const type of ["click", "contextmenu", "wheel"]) {
      layer.addEventListener(type, event => { event.preventDefault(); event.stopPropagation(); }, { signal });
    }
  }

  unmount(): void {
    this.setOpen(false);
    this.controller?.abort();
    this.controller = undefined;
    this.layer?.remove();
    this.panel?.remove();
    this.selection?.remove();
    this.layer = undefined;
    this.panel = undefined;
    this.frame = undefined;
    this.selection = undefined;
    this.history = [];
    this.redoHistory = [];
    this.toggle.hidden = true;
    if (this.captureUrl) URL.revokeObjectURL(this.captureUrl);
    this.captureUrl = undefined;
    this.captureBlob = undefined;
    this.busy = false;
  }

  private field<T extends HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement = HTMLInputElement>(name: string): T {
    return this.panel!.querySelector<T>(`[data-field="${name}"]`)!;
  }

  private context(): CanvasRenderingContext2D { return this.layer!.getContext("2d", { willReadFrequently: true })!; }
  private status(message: string): void { const el = this.panel?.querySelector("[role=status]"); if (el) el.textContent = message; }

  private setOpen(open: boolean): void {
    this.cancelStroke();
    if (open && !this.open) {
      // Release movement while key-up events can still reach the puzzle.
      for (const key of ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "a", "d", "w", "s"]) {
        document.dispatchEvent(new KeyboardEvent("keyup", { key, code: key === " " ? "Space" : key.length === 1 ? `Key${key.toUpperCase()}` : key, bubbles: true }));
      }
    }
    this.open = open && !!this.panel;
    this.toggle.setAttribute("aria-expanded", String(this.open));
    if (this.panel) this.panel.hidden = !this.open;
    this.layer?.classList.toggle("utility-drawing--active", this.open);
    document.body.classList.toggle("utility-tools-open", this.open);
    if (this.open) {
      this.panel?.querySelector<HTMLButtonElement>("[data-action=close]")?.focus();
    }
  }

  private selectTool(tool: Tool): void {
    if (this.busy) return;
    this.cancelStroke();
    this.tool = tool;
    this.panel!.querySelectorAll<HTMLElement>("[data-settings]").forEach(el => { el.hidden = !el.dataset.settings!.split(" ").includes(tool); });
    this.panel!.querySelectorAll<HTMLButtonElement>("[data-tool]").forEach(el => el.setAttribute("aria-pressed", String(el.dataset.tool === tool)));
    this.status(tool === "notes" ? "" : "Editing mode · game input is blocked until you close tools.");
  }

  private point(event: PointerEvent): Point {
    const rect = this.layer!.getBoundingClientRect();
    return { x: Math.max(0, Math.min(799, (event.clientX - rect.left) * 800 / rect.width)), y: Math.max(0, Math.min(599, (event.clientY - rect.top) * 600 / rect.height)) };
  }

  private begin(event: PointerEvent): void {
    event.preventDefault(); event.stopPropagation();
    if (this.busy || event.button !== 0 || this.pointer !== undefined || this.tool === "notes") return;
    const point = this.point(event);
    if (this.tool === "text") {
      void this.placeText(point);
      return;
    }
    if (this.tool === "fill") {
      if (this.field("fill-background").checked) {
        void this.fillBackground(point);
        return;
      }
      this.remember();
      const image = this.context().getImageData(0, 0, 800, 600);
      floodFill(image, point.x, point.y, this.field("color").value, image, this.fillOptions());
      this.context().putImageData(image, 0, 0);
      return;
    }
    this.pointer = event.pointerId;
    this.start = this.last = point;
    this.layer!.setPointerCapture(event.pointerId);
    if (this.tool === "capture") {
      this.selection!.hidden = false;
      this.updateSelection(point);
    } else {
      this.remember();
      this.stroke(point, point);
    }
  }

  private move(event: PointerEvent): void {
    event.stopPropagation();
    if (event.pointerId !== this.pointer) return;
    const point = this.point(event);
    if (this.tool === "capture") this.updateSelection(point);
    else this.stroke(this.last!, point);
    this.last = point;
  }

  private end(event: PointerEvent): void {
    event.preventDefault(); event.stopPropagation();
    if (event.pointerId !== this.pointer) return;
    const point = this.point(event);
    const area = rectangleSelection(this.start!, point, 800, 600);
    if (this.tool !== "capture") this.stroke(this.last!, point);
    this.cancelStroke();
    if (this.tool === "capture") {
      if (area.width < 8 || area.height < 8) this.status("Drag a rectangle at least 8 × 8 pixels.");
      else void this.capture(area);
    }
  }

  private cancelStroke(): void {
    const pointer = this.pointer;
    this.pointer = undefined;
    if (pointer !== undefined && this.layer?.hasPointerCapture(pointer)) this.layer.releasePointerCapture(pointer);
    this.start = this.last = undefined;
    if (this.selection) this.selection.hidden = true;
  }

  private stroke(from: Point, to: Point): void {
    const ctx = this.context();
    ctx.save();
    ctx.globalCompositeOperation = this.tool === "eraser" ? "destination-out" : "source-over";
    ctx.strokeStyle = ctx.fillStyle = this.field("color").value;
    ctx.lineWidth = Number(this.field("width").value);
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
    ctx.beginPath(); ctx.arc(to.x, to.y, ctx.lineWidth / 2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  private remember(): void {
    this.redoHistory = [];
    this.history.push(this.context().getImageData(0, 0, 800, 600));
    if (this.history.length > 20) this.history.shift();
    this.updateUndo();
  }
  private undo(): void {
    if (this.busy) return;
    this.cancelStroke();
    const image = this.history.pop();
    if (image) {
      this.redoHistory.push(this.context().getImageData(0, 0, 800, 600));
      this.context().putImageData(image, 0, 0);
    }
    this.updateUndo();
  }
  private redo(): void {
    if (this.busy) return;
    this.cancelStroke();
    const image = this.redoHistory.pop();
    if (image) {
      this.history.push(this.context().getImageData(0, 0, 800, 600));
      this.context().putImageData(image, 0, 0);
    }
    this.updateUndo();
  }
  private updateUndo(): void {
    const undo = this.panel?.querySelector<HTMLButtonElement>("[data-action=undo]");
    const redo = this.panel?.querySelector<HTMLButtonElement>("[data-action=redo]");
    if (undo) undo.disabled = !this.history.length;
    if (redo) redo.disabled = !this.redoHistory.length;
  }

  private updateSelection(end: Point): void {
    const { x, y, width, height } = rectangleSelection(this.start!, end, 800, 600);
    Object.assign(this.selection!.style, { left: `${x}px`, top: `${y}px`, width: `${width}px`, height: `${height}px` });
  }

  private async placeText(point: Point): Promise<void> {
    const text = this.field<HTMLTextAreaElement>("text").value;
    if (!text.trim()) { this.status("Enter text first, then tap the puzzle."); return; }
    const panel = this.panel!;
    const size = Math.max(8, Math.min(160, Number(this.field("size").value) || 28));
    const font = `${size}px ${fontFamily(this.field<HTMLSelectElement>("font").value)}`;
    const color = this.field("text-color").value;
    const outlineColor = this.field("outline-color").value;
    const outline = this.field("outline").checked;
    this.busy = true;
    this.status("Loading text font…");
    try {
      await document.fonts.load(font, text);
      if (this.panel !== panel || !this.open) return;
      this.remember();
      const ctx = this.context();
      ctx.save();
      ctx.font = font;
      ctx.textBaseline = "top";
      ctx.fillStyle = color;
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = Math.max(2, size / 10);
      ctx.lineJoin = "round";
      text.split("\n").forEach((line, i) => {
        const y = point.y + i * size * 1.25;
        if (outline) ctx.strokeText(line, point.x, y);
        ctx.fillText(line, point.x, y);
      });
      ctx.restore();
      this.status("Text placed.");
    } catch {
      if (this.panel === panel) this.status("Could not load this font. Select another font or try again.");
    } finally {
      if (this.panel === panel) this.busy = false;
    }
  }

  private async fillBackground(point: Point): Promise<void> {
    const frame = this.frame!;
    const panel = this.panel!;
    const color = this.field("color").value;
    const options = this.fillOptions();
    this.busy = true;
    panel.setAttribute("aria-busy", "true");
    this.status("Reading puzzle colors…");
    try {
      if (!frame.isConnected || this.panel !== panel || !this.open) return;
      const snapshot = await capturePuzzle(frame);
      if (!frame.isConnected || this.panel !== panel || !this.open) return;
      // Normalize the rendered frame to the annotation layer's logical coordinates.
      const reference = document.createElement("canvas");
      reference.width = 800;
      reference.height = 600;
      const ctx = reference.getContext("2d", { willReadFrequently: true })!;
      ctx.drawImage(snapshot, 0, 0, 800, 600);
      const image = this.context().getImageData(0, 0, 800, 600);
      const filled = floodFill(image, point.x, point.y, color, ctx.getImageData(0, 0, 800, 600), options);
      this.remember();
      this.context().putImageData(image, 0, 0);
      this.status(`Puzzle region filled (${filled.toLocaleString()} pixels). Use Undo or Eraser to restore it.`);
    } catch {
      if (this.panel === panel) this.status("Could not read puzzle colors. Try again; externally hosted images may be unavailable.");
    } finally {
      if (this.panel === panel) {
        this.busy = false;
        panel.removeAttribute("aria-busy");
      }
    }
  }

  private fillOptions(): { tolerance: number; contiguous: boolean } {
    return { tolerance: Number(this.field("fill-tolerance").value), contiguous: this.field("fill-contiguous").checked };
  }

  private async writeCaptureClipboard(blob: Blob | Promise<Blob>): Promise<boolean> {
    try {
      if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") return false;
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      return true;
    } catch { return false; }
  }

  private async copyCapture(): Promise<void> {
    if (!this.captureBlob || this.busy) return;
    const panel = this.panel;
    const copied = await this.writeCaptureClipboard(this.captureBlob);
    if (this.panel === panel) this.status(copied ? "Image copied to clipboard." : "Clipboard unavailable or permission denied. Use Save PNG instead.");
  }

  private async capture(area: { x: number; y: number; width: number; height: number }): Promise<void> {
    const frame = this.frame!;
    const panel = this.panel!;
    this.busy = true;
    this.status("Preparing capture…");
    const imagePromise = (async () => {
      if (!frame.isConnected || this.panel !== panel) throw new Error("Capture cancelled");
      const snapshot = await capturePuzzle(frame);
      if (!frame.isConnected || this.panel !== panel) throw new Error("Capture cancelled");
      const crop = document.createElement("canvas");
      crop.width = area.width;
      crop.height = area.height;
      crop.getContext("2d")!.drawImage(snapshot, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);
      return new Promise<Blob>((resolve, reject) => crop.toBlob(value => value ? resolve(value) : reject(new Error("Could not encode PNG")), "image/png"));
    })();
    // Start the write during the pointer gesture; rendering can finish asynchronously.
    const clipboardResult = this.writeCaptureClipboard(imagePromise);
    try {
      const blob = await imagePromise;
      if (this.panel !== panel) return;
      if (this.captureUrl) URL.revokeObjectURL(this.captureUrl);
      this.captureUrl = URL.createObjectURL(blob);
      this.captureBlob = blob;
      panel.querySelector<HTMLButtonElement>("[data-action=copy-capture]")!.hidden = false;
      panel.classList.remove("utility-tools--minimized");
      const expand = panel.querySelector<HTMLButtonElement>("[data-action=minimize]")!;
      expand.textContent = "−";
      expand.setAttribute("aria-label", "Minimize tools");
      expand.setAttribute("aria-expanded", "true");
      const preview = panel.querySelector<HTMLImageElement>(".utility-tools__preview")!;
      preview.src = this.captureUrl;
      preview.hidden = false;
      const link = panel.querySelector<HTMLAnchorElement>("[data-capture-download]")!;
      link.href = this.captureUrl;
      link.hidden = false;
      this.status(`${area.width} × ${area.height} PNG ready. Copying to clipboard…`);
      const copied = await clipboardResult;
      if (this.panel === panel) this.status(copied
        ? `${area.width} × ${area.height} image copied to clipboard. You can also save the PNG.`
        : `${area.width} × ${area.height} PNG ready. Automatic copy was unavailable. Try Copy image or Save PNG.`);
    } catch {
      if (this.panel === panel) this.status("Capture failed. Try again; externally hosted images may be unavailable.");
    } finally {
      if (this.panel === panel) this.busy = false;
    }
  }

  private applyNoteFont(): void {
    const font = this.field<HTMLSelectElement>("note-font").value;
    this.field("note").style.fontFamily = fontFamily(font);
    this.panel!.querySelector<HTMLElement>("article")!.style.fontFamily = fontFamily(font);
  }
  private saveNote(): void {
    try {
      localStorage.setItem(NOTE_KEY, this.field("note").value);
      localStorage.setItem(FONT_KEY, this.field("note-font").value);
      this.status("Note saved in this browser.");
    } catch { this.status("Could not save locally. Download your note to keep it."); }
  }
  private renderNote(): void {
    const preview = this.panel!.querySelector<HTMLElement>("article")!;
    if (preview.hidden) return;
    preview.innerHTML = DOMPurify.sanitize(marked.parse(this.field("note").value, { async: false }) as string, { FORBID_TAGS: ["img", "style", "input", "form"] });
    preview.querySelectorAll("a").forEach(link => { link.target = "_blank"; link.rel = "noopener noreferrer"; });
  }
  private downloadNote(): void {
    const url = URL.createObjectURL(new Blob([this.field("note").value], { type: "text/markdown;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = "puzzle-notes.md";
    document.body.append(link); link.click(); link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
}
