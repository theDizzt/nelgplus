import "./styles/global.css";
import { Game } from "./core/Game";

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

function updateGameScale() {
  const scaleX = window.innerWidth / GAME_WIDTH;
  const scaleY = window.innerHeight / GAME_HEIGHT;

  const scale = Math.min(scaleX, scaleY, 1);

  document.documentElement.style.setProperty(
    "--game-scale",
    String(scale)
  );
}

updateGameScale();

window.addEventListener("resize", updateGameScale);

const root = document.querySelector<HTMLElement>("#game-root");

if (!root) {
  throw new Error("The game root element is missing.");
}

const game = new Game(root);
game.start();
