import "./styles/global.css";
import { Game } from "./core/Game";

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

const rootElement = document.querySelector<HTMLElement>("#game-root");

if (!rootElement) {
  throw new Error("The game root element is missing.");
}

const root = rootElement;

function updateGameScale() {
  const availableWidth = root.clientWidth;
  const availableHeight = root.clientHeight;
  if (availableWidth <= 0 || availableHeight <= 0) return;

  const scale = Math.min(availableWidth / GAME_WIDTH, availableHeight / GAME_HEIGHT);
  const offsetX = (availableWidth - GAME_WIDTH * scale) / 2;
  const offsetY = (availableHeight - GAME_HEIGHT * scale) / 2;

  root.style.setProperty("--game-scale", String(scale));
  root.style.setProperty("--game-offset-x", `${offsetX}px`);
  root.style.setProperty("--game-offset-y", `${offsetY}px`);
}

updateGameScale();

window.addEventListener("resize", updateGameScale);
window.visualViewport?.addEventListener("resize", updateGameScale);
new ResizeObserver(updateGameScale).observe(root);

const game = new Game(root);
game.start();
