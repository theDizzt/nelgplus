import { assetUrl } from "./assets";
import { HANDWRITING_GLYPHS } from "./handwritingGlyphs";

/** Render ordinary text with the 43 original sprite glyphs; preserve accessible text.
 * Lowercase uses the uppercase artwork; apostrophes reuse a raised comma.
 * Unsupported characters use the host font.
 * Set font-size/color/line-height on the host to control the image text.
 */
export function setHandwritingText(host: HTMLElement, text: string): void {
  host.classList.add("handwriting-text");
  host.style.setProperty("--handwriting-sheet", `url("${assetUrl("handwriting/sheet.png")}")`);
  const source = document.createElement("span");
  source.className = "handwriting-source";
  source.textContent = text;
  const visual = document.createElement("span");
  visual.className = "handwriting-render";
  visual.setAttribute("aria-hidden", "true");
  for (const token of text.split(/(\r\n|\n|[^\S\r\n]+)/)) {
    if (!token) continue;
    if (token === "\n" || token === "\r\n") { visual.append(document.createElement("br")); continue; }
    if (/^\s+$/.test(token)) { visual.append(document.createTextNode(" ")); continue; }
    const word = document.createElement("span");
    word.className = "handwriting-word";
    for (const character of token) {
      const glyphKey = character.toUpperCase();
      const isApostrophe = character === "'";
      const glyph = HANDWRITING_GLYPHS[isApostrophe ? "," : glyphKey];
      if (!glyph) { word.append(document.createTextNode(character)); continue; }
      const [x, y, width, height, baseline] = glyph;
      const letter = document.createElement("span");
      letter.className = "handwriting-glyph";
      letter.dataset.glyph = glyphKey;
      // Lift the comma to cap height, retaining its original handwritten curve.
      const baselineOffset = isApostrophe ? 66 : baseline - y - height;
      // Common scale preserves narrow punctuation, descenders and uneven pen strokes.
      letter.style.cssText = `width:${width / 110}em;height:${height / 110}em;vertical-align:${baselineOffset / 110}em;--glyph-x:${-x / 110}em;--glyph-y:${-y / 110}em`;
      word.append(letter);
    }
    visual.append(word);
  }
  host.replaceChildren(source, visual);
}
