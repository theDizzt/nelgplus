import { attachStarMaskedInput } from "../core/StarMaskedInput";
import { assetUrl } from "../core/assets";
import { clientPointToLocal } from "../core/floatingPosition";
import type { LevelDefinition } from "../core/types";

interface AlphaMask {
  readonly alpha: Uint8ClampedArray;
  readonly width: number;
  readonly height: number;
}

interface DistanceMessage {
  readonly centimeters: number;
  readonly text: string;
  readonly color: string;
  readonly terminal?: boolean;
}

const ANSWER = "scroll lock";
const RAINBOW = "rainbow";
const MAXIMUM_DISTANCE = 900_001;
const TERMINAL_MESSAGE_DISTANCE = 884_886;
const TERMINAL_MESSAGE_Y = 220;
const BOOST_DISTANCES = [80, 234, 456, 789] as const;

const RANDOM_COLORS = [
  "#ff3030", "#ff8c00", "#ffff00", "#7fff00", "#00c853", "#00ff7f",
  "#00ffff", "#66ccff", "#006cff", "#000080", "#4b0082", "#8000ff",
  "#a020f0", "#ff00ff", "#ff69b4", "#ffffff", "#000000", "#808080",
  "#808000", "#800000", "#ff7f50", "#ffd700", "#40e0d0", "#e6e6fa",
] as const;

const REPEATING_MESSAGES = [
  { interval: 7, text: "*" },
  { interval: 39, text: "wow" },
  { interval: 42, text: "lulz" },
  { interval: 123, text: "keep going" },
  { interval: 255, text: "cool" },
  { interval: 384, text: "awesome" },
  { interval: 491, text: "(☞ ͡° ͜ʖ ͡°)☞" },
  { interval: 769, text: "me gusta" },
  { interval: 1_000, text: "( ͡°( ͡° ͜ʖ( ͡° ͜ʖ ͡°)ʖ ͡°) ͡°)" },
] as const;

const DISTANCE_MESSAGES: readonly DistanceMessage[] = [
  { centimeters: 100, text: "2^0", color: "#8000ff" },
  { centimeters: 200, text: "2^1", color: "#8000ff" },
  { centimeters: 400, text: "2^2", color: "#8000ff" },
  { centimeters: 800, text: "2^3", color: "#8000ff" },
  { centimeters: 900, text: "Kaprekar number", color: RAINBOW },
  { centimeters: 1_600, text: "2^4", color: "#8000ff" },
  { centimeters: 2_100, text: "10 + 9 = ?", color: "#fff" },
  { centimeters: 3_200, text: "2^5", color: "#8000ff" },
  { centimeters: 3_900, text: "dizzt's life number lol", color: "#ffff00" },
  { centimeters: 4_500, text: "Kaprekar number", color: RAINBOW },
  { centimeters: 5_500, text: "Kaprekar number", color: RAINBOW },
  { centimeters: 6_100, text: "The bluest numbers in the world!", color: "#006cff" },
  { centimeters: 6_200, text: "hs300's life number lol", color: "#00ffff" },
  { centimeters: 6_400, text: "2^6", color: "#8000ff" },
  { centimeters: 6_900, text: "69", color: "#ff00ff" },
  { centimeters: 8_400, text: "argentum's life number lol", color: "#7fff00" },
  { centimeters: 9_100, text: "kukui's life number lol", color: "#000" },
  { centimeters: 9_900, text: "Kaprekar number", color: RAINBOW },
  { centimeters: 12_000, text: "This is where TEDNE ought to end with a final examination...", color: "#ffffff" },
  { centimeters: 12_300, text: "123123123123", color: RAINBOW },
  { centimeters: 12_800, text: "2^7", color: "#8000ff" },
  { centimeters: 13_500, text: "hs300's second life number lol", color: "#00ffff" },
  { centimeters: 16_000, text: "dapur's life number lol", color: "#800080" },
  { centimeters: 22_200, text: "archbear is here", color: "#ff69b4" },
  { centimeters: 22_222, text: "FREEDOM DiVE↓", color: RAINBOW },
  { centimeters: 25_500, text: "ntg's life number lol", color: "#f00" },
  { centimeters: 25_600, text: "2^8", color: "#8000ff" },
  { centimeters: 29_700, text: "Kaprekar number", color: RAINBOW },
  { centimeters: 30_000, text: "THIS IS SPARTA!!!", color: "#f00" },
  { centimeters: 36_900, text: "369", color: "#000" },
  { centimeters: 38_400, text: "rayquaza's pokédex number", color: "#00a000" },
  { centimeters: 40_400, text: "NOT FOUND", color: "#006cff" },
  { centimeters: 41_426, text: "Re: Labyrinth Patterns was released (4. 14. 2026)", color: "#00ffff" },
  { centimeters: 42_000, text: "Smoke Weed Everyday", color: "#7fff00" },
  { centimeters: 48_600, text: "i love you", color: "#ff69b4" },
  { centimeters: 49_100, text: "darkrai's pokédex number", color: "#fff" },
  { centimeters: 51_200, text: "2^9", color: "#8000ff" },
  { centimeters: 55_500, text: "The Height of Lotte Tower", color: "#000080" },
  { centimeters: 66_600, text: "666", color: "#f00" },
  { centimeters: 70_300, text: "Kaprekar number", color: RAINBOW },
  { centimeters: 73_000, text: "mandu is carrot", color: "#ff8c00" },
  { centimeters: 77_700, text: "777", color: "#00ffff" },
  { centimeters: 81_926, text: "08/19/2026 NELG++ Released Date (8. 19. 2026)", color: "#ff8c00" },
  { centimeters: 82_980, text: "Burj Khalifa", color: "#66ccff" },
  { centimeters: 87_400, text: "slap your face", color: "#f00" },
  { centimeters: 90_614, text: "dizzt's website was released (9. 6. 2016)", color: "#ffff00" },
  { centimeters: 99_900, text: "Kaprekar number", color: RAINBOW },
  { centimeters: 100_400, text: "decing is here", color: "#ff69b4" },
  { centimeters: 102_400, text: "2^10", color: "#8000ff" },
  { centimeters: 111_100, text: "1111", color: "#fff" },
  { centimeters: 111_600, text: "EVERYONE DINO", color: "#00c853" },
  { centimeters: 123_119, text: "Level Killer is coming (12. 31. 2019)", color: "#f00" },
  { centimeters: 133_700, text: "l33t", color: "#808080" },
  { centimeters: 144_400, text: "Lanota", color: "#000080" },
  { centimeters: 155_700, text: "15:57", color: "#800080" },
  { centimeters: 198_400, text: "1.19.84", color: "#66ccff" },
  { centimeters: 200_500, text: "This is when the original NELG was released!! (11. 2. 2005)", color: RAINBOW },
  { centimeters: 204_800, text: "2^11", color: "#8000ff" },
  { centimeters: 207_700, text: "cyberpunk yay!!", color: "#ffff00" },
  { centimeters: 218_700, text: "2187", color: "#fff" },
  { centimeters: 222_200, text: "Storm Zerg", color: "#ffff00" },
  { centimeters: 222_300, text: "Kaprekar number", color: RAINBOW },
  { centimeters: 234_900, text: "hwarang is here", color: "#ff8c00" },
  { centimeters: 267_600, text: "Let's go stargazing... shall we? (7. 6. 2026)", color: "#fff" },
  { centimeters: 272_800, text: "Kaprekar number", color: RAINBOW },
  { centimeters: 276_300, text: "Yoyleland :)", color: "#006cff" },
  { centimeters: 300_000, text: "-3000", color: "#800080" },
  { centimeters: 300_800, text: "SCP-3008", color: "#f00" },
  { centimeters: 302_500, text: "Kaprekar number", color: RAINBOW },
  { centimeters: 307_700, text: "NGC 3077", color: "#ffff00" },
  { centimeters: 314_159, text: "1000 x pi", color: "#808000" },
  { centimeters: 318_400, text: "https://www.explainxkcd.com/wiki/index.php/3184:_Funny_Numbers", color: "#006cff" },
  { centimeters: 330_100, text: "Cicada 3301", color: "#f00" },
  { centimeters: 333_100, text: "sm16036598", color: "#00ff7f" },
  { centimeters: 343_500, text: "Münchausen number", color: "#808000" },
  { centimeters: 350_234, text: "jm350234", color: "#f00" },
  { centimeters: 394_200, text: "DIZZT >:D", color: RAINBOW },
  { centimeters: 409_600, text: "2^12", color: "#8000ff" },
  { centimeters: 421_950, text: "10% of marathon", color: "#fff" },
  { centimeters: 442_443, text: "HALF", color: RAINBOW },
  { centimeters: 448_100, text: "MATHMATICS LEGENDARY 4481", color: RAINBOW },
  { centimeters: 455_900, text: "IVORY!!!", color: "#66ccff" },
  { centimeters: 476_100, text: "69^2", color: RAINBOW },
  { centimeters: 486_900, text: "アポトキシン4869", color: "#800080" },
  { centimeters: 487_900, text: "Kaprekar number", color: RAINBOW },
  { centimeters: 495_000, text: "Kaprekar number", color: RAINBOW },
  { centimeters: 497_400, text: "κύκνος", color: "#fff" },
  { centimeters: 505_000, text: "1 + 2 + ... + 99 + 100", color: "#66ccff" },
  { centimeters: 505_000, text: "Kaprekar number", color: RAINBOW },
  { centimeters: 515_000, text: "Van Halen!!", color: "#66ccff" },
  { centimeters: 529_200, text: "Kaprekar number", color: RAINBOW },
  { centimeters: 548_900, text: "いいごよやく!", color: "#006cff" },
  { centimeters: 555_500, text: "Interstella 5555: The 5tory of the 5ecret 5tar 5ystem", color: "#fff" },
  { centimeters: 575_900, text: "horror", color: "#ff8c00" },
  { centimeters: 578_800, text: "I HATE LOTTE GIANTS...", color: "#f00" },
  { centimeters: 617_400, text: "Kaprekar number", color: RAINBOW },
  { centimeters: 618_000, text: "6180 the moon", color: "#fff" },
  { centimeters: 697_400, text: "6974", color: "#ff4dff" },
  { centimeters: 727_200, text: "Kaprekar number", color: RAINBOW },
  { centimeters: 755_400, text: "GLORIOUS MEMORIES REVIVED", color: "#f00" },
  { centimeters: 775_300, text: "七谷小鳥♥", color: "#f00" },
  { centimeters: 777_700, text: "Kaprekar number", color: RAINBOW },
  { centimeters: 802_701, text: "The Time Machine", color: "#7fff00" },
  { centimeters: 808_500, text: "INTEL 8085", color: "#66ccff" },
  { centimeters: 812_800, text: "8128 Nicomachus", color: "#f00" },
  { centimeters: 819_200, text: "2^13", color: "#8000ff" },
  { centimeters: 828_200, text: "8282!!!", color: "#f00" },
  { centimeters: 828_400, text: "Hu∑eR", color: "#7fff00" },
  { centimeters: 849_200, text: "Operation Doodlebug", color: "#808000" },
  {
    centimeters: 884_886,
    text: "The official height of Mount Everest\nYou did it!!!\nThe password is \"plus lock\"!\nThanks for playing!!",
    color: RAINBOW,
    terminal: true,
  },
  { centimeters: 900_001, text: "IT'S OVER 9000!!!!!!!!!", color: RAINBOW },
] as const;

const DISTANCE_MESSAGE_MAP = new Map<number, DistanceMessage[]>();
DISTANCE_MESSAGES.forEach((message) => {
  const messages = DISTANCE_MESSAGE_MAP.get(message.centimeters) ?? [];
  messages.push(message);
  DISTANCE_MESSAGE_MAP.set(message.centimeters, messages);
});

function captureAlphaMask(image: HTMLImageElement): AlphaMask | undefined {
  if (!image.naturalWidth || !image.naturalHeight) return undefined;
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return undefined;
  context.drawImage(image, 0, 0);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const alpha = new Uint8ClampedArray(canvas.width * canvas.height);
  for (let index = 0; index < alpha.length; index += 1) alpha[index] = pixels[index * 4 + 3] ?? 0;
  return { alpha, width: canvas.width, height: canvas.height };
}

function isOpaqueAtPointer(image: HTMLImageElement, mask: AlphaMask | undefined, clientX: number, clientY: number): boolean {
  if (!mask) return false;
  const bounds = image.getBoundingClientRect();
  if (clientX < bounds.left || clientX >= bounds.right || clientY < bounds.top || clientY >= bounds.bottom) return false;
  const x = Math.floor(((clientX - bounds.left) / bounds.width) * mask.width);
  const y = Math.floor(((clientY - bounds.top) / bounds.height) * mask.height);
  return (mask.alpha[y * mask.width + x] ?? 0) > 32;
}

function formatDistance(centimeters: number): string {
  return `${(centimeters / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} m`;
}

export const level48: LevelDefinition = {
  number: 48,
  title: "Scroll",
  scenes: [
    { id: "start", label: "Start - 0.00m" },
    { id: "8848m", label: "Near Everest - 8,848.00m" },
  ],
  mount({ screen, initialScene, complete, listen, timeout }) {
    screen.className = "level-screen level-48";
    screen.style.setProperty("--level-48-background", `url("${assetUrl("images/level48bg.gif")}")`);
    screen.innerHTML = `
      <header class="level-heading level-48__heading" aria-label="Level 48, Scroll">
        <div class="level-heading__number">Level 48</div>
        <h1>Scroll</h1>
      </header>

      <div class="level-48__message-stage" data-message-stage aria-live="polite"></div>

      <img class="level-48__scroll" data-level-48-scroll src="${assetUrl("images/level48a.png")}"
        alt="A draggable parchment scroll" draggable="false" />

      <output class="level-48__distance" data-distance hidden>0.00 m</output>

      <form class="level-48__form" autocomplete="off">
        <input class="nelg-password-input" id="level-48-answer" name="nelg-level-forty-eight-answer"
          data-allow-select data-form-type="other" data-lpignore="true" data-1p-ignore="true"
          type="text" maxlength="24" autocomplete="off" autocapitalize="off"
          aria-autocomplete="none" spellcheck="false" aria-label="Password" />
        <button type="submit">GO</button>
      </form>
    `;

    const scrollImage = screen.querySelector<HTMLImageElement>("[data-level-48-scroll]");
    const messageStage = screen.querySelector<HTMLElement>("[data-message-stage]");
    const distanceOutput = screen.querySelector<HTMLOutputElement>("[data-distance]");
    const form = screen.querySelector<HTMLFormElement>(".level-48__form");
    const input = screen.querySelector<HTMLInputElement>("#level-48-answer");
    const submitButton = form?.querySelector<HTMLButtonElement>("button");
    if (!scrollImage || !messageStage || !distanceOutput || !form || !input || !submitButton) return;

    let centimeters = initialScene === "8848m" ? 884_800 : 0;
    let boostCycleStarted = false;
    let terminalMessagePending = false;
    let terminalMessageShown = false;
    let alphaMask: AlphaMask | undefined;
    let scrollX = 115;
    let scrollY = -190;
    let drag:
      | {
          readonly pointerId: number;
          readonly pointerX: number;
          readonly pointerY: number;
          readonly imageX: number;
          readonly imageY: number;
        }
      | undefined;

    const loadMask = () => { alphaMask = captureAlphaMask(scrollImage); };
    if (scrollImage.complete) loadMask();
    else listen(scrollImage, "load", loadMask, { once: true });

    const spawnMessage = (text: string, color: string, terminal = false) => {
      const message = document.createElement("p");
      message.className = "level-48__message";
      if (color === RAINBOW && !terminal) message.classList.add("is-rainbow");
      else message.style.setProperty("--level-48-message-color", color);
      if (terminal) {
        message.classList.add("is-terminal");
        const textLayer = document.createElement("span");
        textLayer.className = "level-48__terminal-text";
        textLayer.textContent = text;
        message.append(textLayer);
      } else {
        message.textContent = text;
      }
      message.style.left = terminal ? "400px" : `${Math.round(70 + Math.random() * 660)}px`;
      message.dataset.scrollY = "618";
      message.style.top = "618px";
      messageStage.append(message);
    };

    const advanceMessages = () => {
      messageStage.querySelectorAll<HTMLElement>(".level-48__message").forEach((message) => {
        const currentY = Number(message.dataset.scrollY ?? 618);
        const y = message.classList.contains("is-terminal")
          ? Math.max(TERMINAL_MESSAGE_Y, currentY - 18)
          : currentY - 18;
        message.dataset.scrollY = String(y);
        message.style.top = `${y}px`;
        if (!message.classList.contains("is-terminal") && y + message.offsetHeight < 0) message.remove();
      });
    };

    const renderDistance = () => {
      distanceOutput.hidden = false;
      distanceOutput.value = formatDistance(centimeters);
      distanceOutput.textContent = distanceOutput.value;
    };

    const spawnTerminalMessage = () => {
      if (terminalMessageShown) return;
      const terminalMessage = DISTANCE_MESSAGE_MAP.get(TERMINAL_MESSAGE_DISTANCE)
        ?.find((message) => message.terminal);
      if (!terminalMessage) return;
      terminalMessageShown = true;
      terminalMessagePending = false;
      spawnMessage(terminalMessage.text, terminalMessage.color, true);
    };

    const spawnDistanceMessages = () => {
      REPEATING_MESSAGES.forEach((message) => {
        if (centimeters % message.interval !== 0) return;
        const randomIndex = Math.floor(Math.random() * (RANDOM_COLORS.length + 1));
        spawnMessage(message.text, randomIndex === RANDOM_COLORS.length ? RAINBOW : RANDOM_COLORS[randomIndex]!);
      });

      if (centimeters % 100 === 0 && Math.floor(centimeters / 100) % 100 === 42) {
        spawnMessage("The Universe's Answer", RAINBOW);
      }
      DISTANCE_MESSAGE_MAP.get(centimeters)?.forEach((message) => {
        if (message.terminal) spawnTerminalMessage();
        else spawnMessage(message.text, message.color);
      });
    };

    const addBoostDistance = (meters: number) => {
      const previousDistance = centimeters;
      centimeters = Math.min(MAXIMUM_DISTANCE, centimeters + meters * 100);
      if (!terminalMessageShown
        && previousDistance < TERMINAL_MESSAGE_DISTANCE
        && centimeters >= TERMINAL_MESSAGE_DISTANCE) {
        terminalMessagePending = true;
      }
      renderDistance();
    };

    const scheduleBoostButton = () => {
      if (centimeters >= MAXIMUM_DISTANCE) return;
      const delay = 35_000 + Math.floor(Math.random() * 25_001);
      timeout(() => {
        if (centimeters >= MAXIMUM_DISTANCE) return;
        const meters = BOOST_DISTANCES[Math.floor(Math.random() * BOOST_DISTANCES.length)]!;
        const button = document.createElement("button");
        button.className = "level-48__boost-button";
        button.type = "button";
        button.textContent = `+${meters}m`;
        button.style.left = `${Math.round(18 + Math.random() * 694)}px`;
        button.style.top = `${Math.round(178 + Math.random() * 292)}px`;
        screen.append(button);

        let settled = false;
        const settle = () => {
          if (settled) return;
          settled = true;
          button.remove();
          scheduleBoostButton();
        };
        listen(button, "click", () => {
          addBoostDistance(meters);
          settle();
        }, { once: true });
        timeout(settle, 2_000);
      }, delay);
    };

    const ensureBoostCycle = () => {
      if (boostCycleStarted || centimeters <= 100) return;
      boostCycleStarted = true;
      scheduleBoostButton();
    };

    const scrollDown = () => {
      advanceMessages();
      if (terminalMessagePending) spawnTerminalMessage();
      if (centimeters >= MAXIMUM_DISTANCE) return;
      centimeters += 1;
      renderDistance();
      spawnDistanceMessages();
      ensureBoostCycle();
    };

    listen(screen, "wheel", (event) => {
      if (event.deltaY <= 0) return;
      event.preventDefault();
      scrollDown();
    }, { passive: false });

    listen(scrollImage, "pointerdown", (event) => {
      if (event.button !== 0 || !isOpaqueAtPointer(scrollImage, alphaMask, event.clientX, event.clientY)) return;
      const pointer = clientPointToLocal(screen, event.clientX, event.clientY);
      drag = {
        pointerId: event.pointerId,
        pointerX: pointer.x,
        pointerY: pointer.y,
        imageX: scrollX,
        imageY: scrollY,
      };
      scrollImage.setPointerCapture(event.pointerId);
      scrollImage.classList.add("is-dragging");
      event.preventDefault();
    });

    listen(scrollImage, "pointermove", (event) => {
      if (!drag || drag.pointerId !== event.pointerId) return;
      const pointer = clientPointToLocal(screen, event.clientX, event.clientY);
      scrollX = Math.max(-scrollImage.offsetWidth, Math.min(800, drag.imageX + pointer.x - drag.pointerX));
      scrollY = Math.max(-scrollImage.offsetHeight, Math.min(600, drag.imageY + pointer.y - drag.pointerY));
      scrollImage.style.left = `${scrollX}px`;
      scrollImage.style.top = `${scrollY}px`;
      event.preventDefault();
    });

    const finishDrag = (event: PointerEvent) => {
      if (!drag || drag.pointerId !== event.pointerId) return;
      if (scrollImage.hasPointerCapture(event.pointerId)) scrollImage.releasePointerCapture(event.pointerId);
      scrollImage.classList.remove("is-dragging");
      drag = undefined;
    };
    listen(scrollImage, "pointerup", finishDrag);
    listen(scrollImage, "pointercancel", finishDrag);

    const maskedInput = attachStarMaskedInput(input, listen);
    listen(input, "keydown", (event) => {
      if (event.key !== "Enter" || event.repeat) return;
      event.preventDefault();
    });
    listen(form, "submit", (event) => event.preventDefault());

    listen(document, "keydown", (event) => {
      if (event.key === "PageDown" || event.code === "PageDown") {
        event.preventDefault();
        scrollDown();
        return;
      }
      if ((event.key !== "ScrollLock" && event.code !== "ScrollLock") || event.repeat) return;
      event.preventDefault();
      if (maskedInput.getValue().trim().toLowerCase() === ANSWER) {
        submitButton.disabled = true;
        complete();
        return;
      }
      input.classList.add("is-wrong");
      timeout(() => input.classList.remove("is-wrong"), 360);
    });

    if (centimeters > 0) {
      renderDistance();
      ensureBoostCycle();
    }
  },
};
