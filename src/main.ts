import "./styles/global.css";
import { Game } from "./core/Game";

const root = document.querySelector<HTMLElement>("#game-root");

if (!root) {
  throw new Error("The game root element is missing.");
}

const game = new Game(root);
game.start();
