import type { LevelDefinition } from "../core/types";

type Scene = "start" | "game" | "death";

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface MovingHazard extends Rect {
  element: HTMLElement;
  vx: number;
  vy: number;
}

interface LaserHazard extends Rect {
  element: HTMLElement;
  activatesAt: number;
  expiresAt: number;
}

interface MineHazard extends Rect {
  element: HTMLElement;
  detonatesAt: number;
  expiresAt: number;
}

const PLAYER_SIZE = 32;
const PLAYER_SPEED = 205;
const BOOSTED_PLAYER_SPEED = 270;
const BOOST_CHARGE_PER_SECOND = 20;
const BOOST_DRAIN_PER_SECOND = 55;
const SURVIVAL_TIME = 20_000;
const DOOR_OPEN_TIME = 900;
const ARENA: Rect = { x: 192, y: 120, width: 520, height: 400 };
const CORRIDOR: Rect = { x: 0, y: 300, width: 192, height: 108 };
const GREEN_PORTAL: Rect = { x: 202, y: 442, width: 70, height: 70 };
const EXIT_PORTAL: Rect = { x: 14, y: 318, width: 58, height: 72 };
const DOOR: Rect = { x: 92, y: 300, width: 48, height: 108 };
const PLAYER_START = { x: 648, y: 462 };
const RAINBOW_PATTERN = [
  { x: -42, y: 158 },
  { x: -184, y: 252 },
  { x: -338, y: 132 },
  { x: -492, y: 372 },
  { x: -642, y: 214 },
  { x: -274, y: 450 },
  { x: -580, y: 464 },
  { x: -116, y: 356 },
] as const;

function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function pointInsideFloor(x: number, y: number): boolean {
  return [ARENA, CORRIDOR].some((floor) =>
    x > floor.x && x < floor.x + floor.width && y > floor.y && y < floor.y + floor.height,
  );
}

function playerInsideFloor(player: Rect): boolean {
  const inset = 2;
  return [
    [player.x + inset, player.y + inset],
    [player.x + player.width - inset, player.y + inset],
    [player.x + inset, player.y + player.height - inset],
    [player.x + player.width - inset, player.y + player.height - inset],
  ].every(([x, y]) => pointInsideFloor(x!, y!));
}

function randomBetween(minimum: number, maximum: number): number {
  return minimum + Math.random() * (maximum - minimum);
}

function place(element: HTMLElement, rect: Rect): void {
  element.style.left = `${rect.x}px`;
  element.style.top = `${rect.y}px`;
  element.style.width = `${rect.width}px`;
  element.style.height = `${rect.height}px`;
}

function heading(): string {
  return `
    <header class="level-heading level-42__heading" aria-label="Level 42, Arena">
      <div class="level-heading__number">Level 42</div>
      <h1>Arena</h1>
    </header>`;
}

export const level42: LevelDefinition = {
  number: 42,
  title: "Arena",
  scenes: [
    { id: "start", label: "Start Screen" },
    { id: "game", label: "Game Screen" },
    { id: "death", label: "Death Screen" },
  ],
  mount({ screen, initialScene, listen, audio, complete }) {
    let scene: Scene = initialScene === "game" || initialScene === "death" ? initialScene : "start";
    let animationFrame = 0;
    let previousTime = 0;
    let player = { ...PLAYER_START, width: PLAYER_SIZE, height: PLAYER_SIZE };
    let activatedAt: number | undefined;
    let deathReason = "You died in an unknown accident.";
    const pressedKeys = new Set<string>();

    void audio.playMusic("music/level42.mp3", true);

    const stopGameLoop = () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      previousTime = 0;
      pressedKeys.clear();
    };

    const renderStart = () => {
      stopGameLoop();
      scene = "start";
      screen.className = "level-screen level-42 level-42--start";
      screen.innerHTML = `
        ${heading()}
        <div class="level-42__intro">
          <p class="level-42__intro-warning">You fell into a trap on the way to Level 43!</p>
          <p>This trap has several obstacles, and you have to<br />
            hold out for more than 20 seconds without hitting<br />
            an obstacle to enter the portal to the next level!<br />
            Can you survive here?</p>
        </div>
        <p class="level-42__controls">MOVE = ARROW KEYS<br />BOOSTER = SPACE BAR</p>
        <button class="level-42__start-button" type="button">START</button>
      `;
    };

    const renderDeath = () => {
      stopGameLoop();
      scene = "death";
      screen.className = "level-screen level-42 level-42--death";
      screen.innerHTML = `
        ${heading()}
        <p class="level-42__death-message">YOU DIED</p>
        <p class="level-42__death-reason">${deathReason}</p>
        <button class="level-42__retry" type="button" aria-label="Return to the game screen">&lt;----</button>
      `;
    };

    const fail = (reason: string) => {
      if (scene !== "game") return;
      deathReason = reason;
      renderDeath();
    };

    const renderGame = () => {
      stopGameLoop();
      scene = "game";
      player = { ...PLAYER_START, width: PLAYER_SIZE, height: PLAYER_SIZE };
      activatedAt = undefined;
      deathReason = "You died in an unknown accident.";
      screen.className = "level-screen level-42 level-42--game";
      screen.innerHTML = `
        <div class="level-42__floor level-42__floor--arena" aria-hidden="true"></div>
        <div class="level-42__floor level-42__floor--corridor" aria-hidden="true"></div>
        ${heading()}
        <div class="level-42__exit-portal" aria-label="Warp Zone portal"></div>
        <div class="level-42__trigger-portal" aria-label="Start the survival timer"></div>
        <div class="level-42__door-mask" aria-label="Timed door"><div class="level-42__door"></div></div>
        <div class="level-42__hazards" aria-hidden="true"></div>
        <div class="level-42__crusher" aria-hidden="true"></div>
        <div class="level-42__player" role="img" aria-label="Blue player character">
          <span class="level-42__player-face" aria-hidden="true">&gt;:D</span>
          <output class="level-42__effect-timer" aria-label="Reversed controls time remaining"></output>
        </div>
        <p class="level-42__control-status">CONTROLS REVERSED</p>
        <p class="level-42__timer" aria-live="polite">Freedom in <output>20</output></p>
        <aside class="level-42__boost" aria-label="Booster charge">
          <span class="level-42__boost-track"><i class="level-42__boost-fill"></i></span>
          <output class="level-42__boost-percent" aria-live="polite">0%</output>
        </aside>
      `;

      const playerElement = screen.querySelector<HTMLElement>(".level-42__player");
      const doorElement = screen.querySelector<HTMLElement>(".level-42__door");
      const hazardsLayer = screen.querySelector<HTMLElement>(".level-42__hazards");
      const crusherElement = screen.querySelector<HTMLElement>(".level-42__crusher");
      const timerOutput = screen.querySelector<HTMLOutputElement>(".level-42__timer output");
      const effectTimer = screen.querySelector<HTMLOutputElement>(".level-42__effect-timer");
      const boostFill = screen.querySelector<HTMLElement>(".level-42__boost-fill");
      const boostPercent = screen.querySelector<HTMLOutputElement>(".level-42__boost-percent");
      if (!playerElement || !doorElement || !hazardsLayer || !crusherElement || !timerOutput
        || !effectTimer || !boostFill || !boostPercent) return;

      let rainbowHazards: MovingHazard[] = [];
      let rainbowMessages: MovingHazard[] = [];
      let magicCircles: MovingHazard[] = [];
      let meteors: MovingHazard[] = [];
      let lasers: LaserHazard[] = [];
      let mines: MineHazard[] = [];
      let chaser: MovingHazard | undefined;
      let invertedUntil = 0;
      let boostCharge = 0;
      let nextRainbowAt = 0;
      let nextMagicAt = 5_000;
      let nextMeteorAt = 8_000;
      let nextLaserAt = 10_000;
      let nextMineAt = 13_000;
      let rainbowMessageSpawned = false;
      let magicWave = 0;
      let laserWave = 0;

      const createMovingHazard = (className: string, rect: Rect, vx: number, vy: number): MovingHazard => {
        const element = document.createElement("span");
        element.className = className;
        hazardsLayer.append(element);
        const hazard = { ...rect, element, vx, vy };
        place(element, hazard);
        return hazard;
      };

      const removeMovingHazard = (hazard: MovingHazard) => {
        hazard.element.remove();
        return false;
      };

      const spawnRainbowWave = () => {
        RAINBOW_PATTERN.forEach((position) => {
          rainbowHazards.push(createMovingHazard(
            "level-42__rainbow-square",
            { x: position.x, y: position.y, width: 38, height: 38 },
            350,
            0,
          ));
        });
      };

      const spawnRainbowMessage = () => {
        const message = createMovingHazard(
          "level-42__rainbow-message",
          { x: -270, y: 270, width: 270, height: 64 },
          300,
          0,
        );
        message.element.textContent = "I SUCK ;(";
        rainbowMessages.push(message);
      };

      const spawnChaser = () => {
        chaser = createMovingHazard(
          "level-42__chaser",
          { x: ARENA.x + ARENA.width - 48, y: ARENA.y + 18, width: 38, height: 38 },
          0,
          0,
        );
      };

      const spawnMagicCircle = () => {
        const routes = [176, 300, 420];
        magicCircles.push(createMovingHazard(
          "level-42__magic-circle",
          { x: -78, y: routes[magicWave % routes.length]!, width: 70, height: 70 },
          520,
          0,
        ));
        magicWave += 1;
      };

      const spawnMeteor = () => {
        meteors.push(createMovingHazard(
          "level-42__meteor",
          { x: randomBetween(ARENA.x + 24, ARENA.x + ARENA.width - 48), y: 62, width: 26, height: 58 },
          randomBetween(-55, 55),
          510,
        ));
      };

      const spawnLaser = (elapsed: number) => {
        const horizontal = laserWave % 2 === 0;
        const rect: Rect = horizontal
          ? { x: randomBetween(ARENA.x + 8, ARENA.x + 96), y: randomBetween(ARENA.y + 78, ARENA.y + 330), width: 310, height: 18 }
          : { x: randomBetween(ARENA.x + 90, ARENA.x + 410), y: ARENA.y + 18, width: 18, height: 260 };
        const element = document.createElement("span");
        element.className = `level-42__laser ${horizontal ? "is-horizontal" : "is-vertical"}`;
        hazardsLayer.append(element);
        place(element, rect);
        lasers.push({ ...rect, element, activatesAt: elapsed + 650, expiresAt: elapsed + 1_300 });
        laserWave += 1;
      };

      const spawnMine = (elapsed: number) => {
        let x = randomBetween(ARENA.x + 55, ARENA.x + ARENA.width - 75);
        let y = randomBetween(ARENA.y + 75, ARENA.y + ARENA.height - 70);
        for (let attempt = 0; attempt < 4 && Math.hypot(x - player.x, y - player.y) < 115; attempt += 1) {
          x = randomBetween(ARENA.x + 55, ARENA.x + ARENA.width - 75);
          y = randomBetween(ARENA.y + 75, ARENA.y + ARENA.height - 70);
        }
        const rect = { x, y, width: 30, height: 30 };
        const element = document.createElement("span");
        element.className = "level-42__mine";
        hazardsLayer.append(element);
        place(element, rect);
        mines.push({ ...rect, element, detonatesAt: elapsed + 3_000, expiresAt: elapsed + 3_750 });
      };

      const update = (time: number) => {
        if (scene !== "game") return;
        const delta = previousTime ? Math.min((time - previousTime) / 1_000, 0.04) : 0;
        previousTime = time;

        const controlsInverted = time < invertedUntil;
        const boostRequested = pressedKeys.has("Space");
        const boosting = boostRequested && boostCharge > 0;
        boostCharge = Math.max(0, Math.min(100, boostCharge
          + (boostRequested ? -BOOST_DRAIN_PER_SECOND : BOOST_CHARGE_PER_SECOND) * delta));
        boostFill.style.width = `${boostCharge}%`;
        boostPercent.value = `${Math.round(boostCharge)}%`;
        screen.classList.toggle("is-boosting", boosting);
        if (boostCharge >= 100) {
          fail("You died from booster overheating.");
          return;
        }

        let horizontal = Number(pressedKeys.has("ArrowRight")) - Number(pressedKeys.has("ArrowLeft"));
        let vertical = Number(pressedKeys.has("ArrowDown")) - Number(pressedKeys.has("ArrowUp"));
        if (controlsInverted) {
          horizontal *= -1;
          vertical *= -1;
        }
        if (horizontal) playerElement.classList.toggle("is-facing-left", horizontal > 0);
        if (horizontal && vertical) {
          horizontal *= Math.SQRT1_2;
          vertical *= Math.SQRT1_2;
        }
        if (horizontal || vertical) {
          const candidate = {
            ...player,
            x: player.x + horizontal * (boosting ? BOOSTED_PLAYER_SPEED : PLAYER_SPEED) * delta,
            y: player.y + vertical * (boosting ? BOOSTED_PLAYER_SPEED : PLAYER_SPEED) * delta,
          };
          if (!playerInsideFloor(candidate)) {
            fail("You died after smashing your head into a wall.");
            return;
          }
          player = candidate;
        }

        if (activatedAt === undefined && overlaps(player, GREEN_PORTAL)) {
          activatedAt = time;
          screen.classList.add("is-activated");
        }

        const elapsed = activatedAt === undefined ? 0 : time - activatedAt;
        const remaining = activatedAt === undefined ? 20 : Math.max(0, Math.ceil((SURVIVAL_TIME - elapsed) / 1_000));
        timerOutput.value = String(remaining);
        screen.classList.toggle("is-quaking", activatedAt !== undefined && elapsed >= 15_000);

        const doorProgress = Math.min(Math.max((elapsed - SURVIVAL_TIME) / DOOR_OPEN_TIME, 0), 1);
        const door = { ...DOOR, y: DOOR.y + doorProgress * (DOOR.height + 14) };
        doorElement.style.top = `${doorProgress * (DOOR.height + 14)}px`;

        if (activatedAt !== undefined) {
          while (nextRainbowAt <= elapsed && nextRainbowAt < SURVIVAL_TIME) {
            spawnRainbowWave();
            nextRainbowAt += 4_000;
          }
          if (!chaser && elapsed >= 2_000) spawnChaser();
          while (nextMagicAt <= elapsed && nextMagicAt < SURVIVAL_TIME) {
            spawnMagicCircle();
            nextMagicAt += 5_000;
          }
          while (nextMeteorAt <= elapsed && nextMeteorAt < SURVIVAL_TIME) {
            spawnMeteor();
            nextMeteorAt += 2_000;
          }
          while (nextLaserAt <= elapsed && nextLaserAt < SURVIVAL_TIME) {
            spawnLaser(elapsed);
            nextLaserAt += 4_000;
          }
          if (!rainbowMessageSpawned && elapsed >= 10_000) {
            rainbowMessageSpawned = true;
            spawnRainbowMessage();
          }
          while (nextMineAt <= elapsed && nextMineAt < SURVIVAL_TIME) {
            spawnMine(elapsed);
            nextMineAt += 3_000;
          }

          let fatalReason: string | undefined;
          rainbowHazards = rainbowHazards.filter((hazard) => {
            hazard.x += hazard.vx * delta;
            place(hazard.element, hazard);
            if (overlaps(player, hazard)) fatalReason = "You were run over by a rainbow square.";
            return hazard.x < 830 || removeMovingHazard(hazard);
          });

          rainbowMessages = rainbowMessages.filter((message) => {
            message.x += message.vx * delta;
            place(message.element, message);
            return message.x < 830 || removeMovingHazard(message);
          });

          if (chaser) {
            const deltaX = player.x + player.width / 2 - chaser.x - chaser.width / 2;
            const deltaY = player.y + player.height / 2 - chaser.y - chaser.height / 2;
            const distance = Math.max(Math.hypot(deltaX, deltaY), 1);
            chaser.x += deltaX / distance * 118 * delta;
            chaser.y += deltaY / distance * 118 * delta;
            place(chaser.element, chaser);
            if (overlaps(player, chaser)) fatalReason = "You were murdered by the stalker.";
          }

          magicCircles = magicCircles.filter((hazard) => {
            hazard.x += hazard.vx * delta;
            place(hazard.element, hazard);
            if (overlaps(player, hazard)) {
              invertedUntil = time + 3_000;
              return removeMovingHazard(hazard);
            }
            return hazard.x < 850 || removeMovingHazard(hazard);
          });

          meteors = meteors.filter((hazard) => {
            hazard.x += hazard.vx * delta;
            hazard.y += hazard.vy * delta;
            place(hazard.element, hazard);
            if (overlaps(player, hazard)) fatalReason = "You were lucky enough to be hit directly by a meteor.";
            return hazard.y < 570 || removeMovingHazard(hazard);
          });

          lasers = lasers.filter((laser) => {
            const active = elapsed >= laser.activatesAt;
            laser.element.classList.toggle("is-active", active);
            if (active && overlaps(player, laser)) fatalReason = "You were roasted crispy by a laser.";
            if (elapsed < laser.expiresAt) return true;
            laser.element.remove();
            return false;
          });

          mines = mines.filter((mine) => {
            const exploding = elapsed >= mine.detonatesAt;
            mine.element.classList.toggle("is-exploding", exploding);
            if (!exploding && overlaps(player, mine)) fatalReason = "You stepped on a mine and exploded.";
            if (exploding) {
              const explosion = { x: mine.x - 42, y: mine.y - 42, width: 114, height: 114 };
              if (overlaps(player, explosion)) fatalReason = "You stepped on a mine and exploded.";
            }
            if (elapsed < mine.expiresAt) return true;
            mine.element.remove();
            return false;
          });

          if (elapsed >= 17_000) {
            const crusherProgress = Math.min((elapsed - 17_000) / 3_000, 1);
            const crusher = {
              x: ARENA.x + ARENA.width - crusherProgress * 160,
              y: ARENA.y,
              width: 58,
              height: ARENA.height,
            };
            crusherElement.classList.add("is-active");
            place(crusherElement, crusher);
            if (overlaps(player, crusher)) fatalReason = "You were crushed by the spiked wall.";
          }

          if (fatalReason) {
            fail(fatalReason);
            return;
          }
        }

        const inversionRemaining = Math.max(0, invertedUntil - time);
        screen.classList.toggle("is-controls-inverted", inversionRemaining > 0);
        effectTimer.value = inversionRemaining > 0 ? String(Math.ceil(inversionRemaining / 1_000)) : "";

        if (doorProgress < 1 && overlaps(player, door)) {
          fail("You charged into the door and died from a scrape.");
          return;
        }
        if (doorProgress >= 1 && overlaps(player, EXIT_PORTAL)) {
          scene = "start";
          stopGameLoop();
          complete();
          return;
        }

        playerElement.style.left = `${player.x}px`;
        playerElement.style.top = `${player.y}px`;
        animationFrame = window.requestAnimationFrame(update);
      };

      playerElement.style.left = `${player.x}px`;
      playerElement.style.top = `${player.y}px`;
      animationFrame = window.requestAnimationFrame(update);
    };

    listen(document, "keydown", (event) => {
      const control = event.code === "Space" ? "Space" : event.key;
      if (scene !== "game" || (control !== "Space" && !control.startsWith("Arrow"))) return;
      pressedKeys.add(control);
      event.preventDefault();
    });
    listen(document, "keyup", (event) => {
      const control = event.code === "Space" ? "Space" : event.key;
      if (control !== "Space" && !control.startsWith("Arrow")) return;
      pressedKeys.delete(control);
      if (scene === "game") event.preventDefault();
    });
    listen(window, "blur", () => pressedKeys.clear());
    listen(screen, "click", (event) => {
      const target = event.target as Element;
      if (target.closest(".level-42__start-button")) renderGame();
      else if (target.closest(".level-42__retry")) renderGame();
    });

    if (scene === "game") renderGame();
    else if (scene === "death") renderDeath();
    else renderStart();

    return () => stopGameLoop();
  },
};
