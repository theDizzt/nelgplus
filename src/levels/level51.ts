import { attachStarMaskedInput } from "../core/StarMaskedInput";
import { attachCustomCursor } from "../core/CustomCursor";
import { assetUrl } from "../core/assets";
import type { LevelDefinition } from "../core/types";

interface FriendDefinition {
  name: string;
  image: string;
  alternateImage?: string;
  width: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface FriendState {
  definition: FriendDefinition;
  element: HTMLElement;
  image: HTMLImageElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  nextTurn: number;
  alternateFrame: boolean;
  exiting: boolean;
  removed: boolean;
}

const FRIENDS: readonly FriendDefinition[] = [
  { name: "steve", image: "Steve.gif", width: 104, x: 28, y: 214, vx: 42, vy: 15 },
  { name: "sir-chair", image: "sirchair.png", width: 58, x: 180, y: 314, vx: -35, vy: 19 },
  { name: "red-guy", image: "red_2.png", alternateImage: "red_3.png", width: 55, x: 294, y: 205, vx: 39, vy: -17 },
  { name: "mr-gear", image: "Mr_gear.gif", width: 72, x: 405, y: 332, vx: -44, vy: -12 },
  { name: "clippy", image: "clippy.gif", width: 66, x: 510, y: 222, vx: 37, vy: 20 },
  { name: "cheesus", image: "cheesus.gif", width: 76, x: 630, y: 340, vx: -41, vy: 13 },
  { name: "bukkit", image: "level18-paint.png", width: 78, x: 104, y: 432, vx: 46, vy: -16 },
  { name: "level-builder", image: "level-builder.png", width: 74, x: 692, y: 420, vx: -34, vy: -18 },
];

export const level51: LevelDefinition = {
  number: 51,
  title: "Inspection",
  mount(context) {
    const { screen, complete, listen, timeout } = context;
    const removeCustomCursor = attachCustomCursor(context, {
      source: "cursor/level51.png",
      hotspot: "top-left",
    });
    screen.className = "level-screen level-51";
    screen.innerHTML = `
      <header class="level-heading level-51__heading" aria-label="Level 51, Inspection">
        <div class="level-heading__number">Level 51</div>
        <h1>Inspection</h1>
      </header>

      <p class="level-51__message">
        This level is SUPER-DUPER EASY!!!<br />
        Just call out these friends' names >:D
      </p>

      <div class="level-51__friends" aria-label="Friends walking around the level">
        ${FRIENDS.map((friend) => `
          <div class="level-51__friend" id="inspection-${friend.name}"
            data-inspection-name="${friend.name}" data-friend="${friend.name}"
            style="--friend-width:${friend.width}px" aria-label="${friend.name}">
            <span class="level-51__friend-visual">
              <img src="${assetUrl(`images/${friend.image}`)}" alt="" draggable="false" />
            </span>
          </div>
        `).join("")}
      </div>

      <form class="level-51__form" autocomplete="off">
        <div class="level-51__controls">
          <input class="nelg-password-input" id="level-51-answer" name="nelg-level-fifty-one-answer"
            data-allow-select data-form-type="other" data-lpignore="true" data-1p-ignore="true"
            type="text" maxlength="20" autocomplete="off" autocapitalize="off"
            aria-autocomplete="none" spellcheck="false" aria-label="Friend name" />
          <button type="submit">GO</button>
        </div>
      </form>
    `;

    const form = screen.querySelector<HTMLFormElement>(".level-51__form");
    const input = screen.querySelector<HTMLInputElement>("#level-51-answer");
    const submitButton = screen.querySelector<HTMLButtonElement>(".level-51__form button");
    if (!form || !input || !submitButton) return;

    const states = FRIENDS.flatMap<FriendState>((definition, index) => {
      const element = screen.querySelector<HTMLElement>(`[data-inspection-name="${definition.name}"]`);
      const image = element?.querySelector<HTMLImageElement>("img");
      if (!element || !image) return [];
      return [{
        definition,
        element,
        image,
        x: definition.x,
        y: definition.y,
        vx: definition.vx,
        vy: definition.vy,
        nextTurn: 1800 + index * 310,
        alternateFrame: false,
        exiting: false,
        removed: false,
      }];
    });
    const stateByName = new Map(states.map((state) => [state.definition.name, state]));
    const maskedInput = attachStarMaskedInput(input, listen);
    let removedFriends = 0;
    let previousFrame = performance.now();
    let elapsed = 0;
    let animationFrame = 0;

    const renderFriend = (state: FriendState) => {
      state.element.style.translate = `${state.x}px ${state.y}px`;
      state.element.classList.toggle("is-facing-left", state.vx < 0);
    };

    states.forEach(renderFriend);

    const animate = (now: number) => {
      const deltaSeconds = Math.min(0.05, Math.max(0, (now - previousFrame) / 1000));
      const deltaMilliseconds = deltaSeconds * 1000;
      previousFrame = now;
      elapsed += deltaMilliseconds;
      const screenWidth = screen.clientWidth;
      const minimumY = 246;
      const maximumBottom = screen.clientHeight - 90;

      states.forEach((state) => {
        if (state.removed) return;
        state.x += state.vx * deltaSeconds;
        state.y += state.vy * deltaSeconds;
        const width = state.element.offsetWidth;
        const height = state.element.offsetHeight;

        if (state.exiting) {
          if (state.x > screenWidth + 20 || state.x + width < -20) {
            state.removed = true;
            state.element.remove();
            removedFriends += 1;
            if (removedFriends === states.length) complete();
            return;
          }
          renderFriend(state);
          return;
        }

        if (state.x <= 8) {
          state.x = 8;
          state.vx = Math.abs(state.vx);
        } else if (state.x + width >= screenWidth - 8) {
          state.x = screenWidth - width - 8;
          state.vx = -Math.abs(state.vx);
        }
        if (state.y <= minimumY) {
          state.y = minimumY;
          state.vy = Math.abs(state.vy);
        } else if (state.y + height >= maximumBottom) {
          state.y = maximumBottom - height;
          state.vy = -Math.abs(state.vy);
        }

        state.nextTurn -= deltaMilliseconds;
        if (state.nextTurn <= 0) {
          const speed = 31 + Math.random() * 20;
          state.vx = (Math.random() < 0.5 ? -1 : 1) * speed;
          state.vy = (Math.random() - 0.5) * 36;
          state.nextTurn = 1900 + Math.random() * 2600;
        }
        renderFriend(state);
      });

      animationFrame = window.requestAnimationFrame(animate);
    };
    animationFrame = window.requestAnimationFrame(animate);

    const redGuy = stateByName.get("red-guy");
    const redFrameTimer = window.setInterval(() => {
      if (!redGuy || redGuy.removed || !redGuy.definition.alternateImage) return;
      redGuy.alternateFrame = !redGuy.alternateFrame;
      const file = redGuy.alternateFrame ? redGuy.definition.alternateImage : redGuy.definition.image;
      redGuy.image.src = assetUrl(`images/${file}`);
    }, 430);

    const showWrongInput = () => {
      input.classList.remove("is-wrong");
      void input.offsetWidth;
      input.classList.add("is-wrong");
      input.focus();
      timeout(() => input.classList.remove("is-wrong"), 360);
    };

    listen(input, "keydown", (event) => {
      if (event.key !== "Enter" || event.repeat) return;
      event.preventDefault();
      form.requestSubmit();
    });

    listen(form, "submit", (event) => {
      event.preventDefault();
      const answer = maskedInput.getValue().trim().toLowerCase();
      const friend = stateByName.get(answer);
      if (!friend || friend.exiting || friend.removed) {
        showWrongInput();
        return;
      }

      friend.exiting = true;
      friend.element.classList.add("is-leaving");
      friend.vx = friend.x + friend.element.offsetWidth / 2 < screen.clientWidth / 2 ? -245 : 245;
      friend.vy = 0;
      maskedInput.clear();
      input.focus();
    });

    input.focus();
    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearInterval(redFrameTimer);
      removeCustomCursor();
    };
  },
};
