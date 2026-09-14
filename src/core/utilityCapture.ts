// Render at game coordinates, independently of the visible frame's CSS scale.
export async function capturePuzzle(frame: HTMLElement): Promise<HTMLCanvasElement> {
  await document.fonts.ready;
  const { default: html2canvas } = await import("html2canvas");
  if (!frame.isConnected) throw new Error("Capture cancelled");
  return html2canvas(frame, {
    scale: 1,
    width: 800,
    height: 600,
    useCORS: true,
    logging: false,
    backgroundColor: null,
    ignoreElements: element => element.matches(".utility-tools, .game-hud, .mobile-controls, .utility-selection, .debug-controls"),
    onclone: (clonedDocument, clonedFrame) => {
      // Unscale only the clone. Scaling the output alone leaves html2canvas's
      // descendant clipping in screen coordinates and can cut off the puzzle.
      for (const ancestor of [clonedDocument.documentElement, clonedDocument.body, clonedFrame.parentElement]) {
        if (!ancestor) continue;
        ancestor.style.setProperty("--game-scale", "1");
        ancestor.style.setProperty("--game-offset-x", "0px");
        ancestor.style.setProperty("--game-offset-y", "0px");
        Object.assign(ancestor.style, { width: "800px", height: "600px", overflow: "visible", transform: "none", margin: "0" });
      }
      Object.assign(clonedFrame.style, {
        transform: "none", translate: "none", scale: "none",
        position: "absolute", left: "0px", top: "0px",
        width: "800px", height: "600px", border: "0", margin: "0",
      });
    },
  });
}
