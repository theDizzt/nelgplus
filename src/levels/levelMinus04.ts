import { assetUrl } from "../core/assets";
import { attachStarMaskedInput } from "../core/StarMaskedInput";
import type { LevelDefinition } from "../core/types";
import { tryBackwardsPassword } from "./negativeBackwards";

const COPY = 'Welcome to the Level Negative Three! As the level between Negative Two and Negative Four, this is an amazing level where you will experience extreme suffering. You will never complete this level. Now I guess that you are decrypting this text. If you are reading this text, then you have decrypted it, fully or not. The password to the next level is "recreative" and the password to the previous level is "diving". Would you like to do some deep digging? Then good luck and have fun.';
const MUSIC = ["level32.mp3", "level34.mp3", "level34proto.mp3", "level39a.mp3", "level39b.mp3", "level42.mp3", "level47.mp3", "level50.mp3"];

function caesar(text: string): string {
  return text.replace(/[a-z]/gi, (letter) => {
    const base = letter >= "a" && letter <= "z" ? 97 : 65;
    return String.fromCharCode(base + (letter.charCodeAt(0) - base + 3) % 26);
  });
}

export const levelMinus04: LevelDefinition = {
  number: -4,
  title: caesar("Caesar"),
  mount({ screen, listen, interval, audio, goToLevel, wrongAnswer, session }) {
    screen.className = "level-screen level-minus-04";
    screen.style.backgroundImage = `url("${assetUrl("images/levelm4bg.png")}")`;
    screen.innerHTML = `
      <img class="level-minus-04__image" src="${assetUrl("images/levelm4a.png")}" alt="levelm4a">
      <header class="level-heading">
        <div class="level-heading__number">Level -4</div>
        <h1>${caesar("Caesar")}</h1>
      </header>
      <p class="level-minus-04__copy" data-allow-select></p>
      <form class="level-minus-04__form" autocomplete="off">
        <input class="nelg-password-input" type="text" aria-label="Password" maxlength="32" autocomplete="off" autocapitalize="off" spellcheck="false" data-allow-select>
        <button type="submit">GO</button>
      </form>
    `;
    const copy = screen.querySelector<HTMLElement>(".level-minus-04__copy")!;
    for (const part of COPY.split(/(\byou\b)/gi)) {
      if (/^you$/i.test(part)) {
        const hint = document.createElement("span");
        hint.className = "level-minus-04__hint";
        hint.textContent = caesar(part);
        copy.append(hint);
      } else copy.append(document.createTextNode(caesar(part)));
    }
    const form = screen.querySelector<HTMLFormElement>("form")!;
    const input = form.querySelector("input")!;
    const password = attachStarMaskedInput(input, listen);
    listen(input, "keydown", (event) => {
      if (event.key !== "Enter" || event.repeat) return;
      event.preventDefault();
      form.requestSubmit();
    });
    listen(form, "submit", (event) => {
      event.preventDefault();
      const answer = password.getValue();
      if (tryBackwardsPassword(answer, { session, goToLevel })) return;
      if (answer === "diving") goToLevel(-5);
      else if (answer === "recreative") goToLevel(-3);
      else {
        wrongAnswer();
        password.clear();
        input.focus();
      }
    });

    audio.stopMusic();
    let disposed = false;
    const tracks = MUSIC.map((filename) => {
      const track = new Audio(assetUrl(`music/${filename}`));
      track.loop = true;
      track.preload = "auto";
      return track;
    });
    const pending = new Set<HTMLAudioElement>();
    const playTracks = () => {
      if (disposed || !audio.musicEnabled) return;
      for (const track of tracks) {
        if (!track.paused || pending.has(track)) continue;
        pending.add(track);
        void track.play().then(() => {
          if (disposed || !audio.musicEnabled) track.pause();
        }).catch(() => undefined).finally(() => pending.delete(track));
      }
    };
    let previousEnabled: boolean | undefined;
    const syncAudio = () => {
      if (disposed) return;
      for (const track of tracks) track.volume = audio.musicVolume / 100 * 0.16;
      if (previousEnabled !== audio.musicEnabled) {
        previousEnabled = audio.musicEnabled;
        if (audio.musicEnabled) playTracks();
        else tracks.forEach((track) => track.pause());
      }
    };
    syncAudio();
    const timer = interval(syncAudio, 100);
    listen(screen, "pointerdown", playTracks);
    listen(screen, "keydown", playTracks);
    return () => {
      disposed = true;
      window.clearInterval(timer);
      for (const track of tracks) {
        track.pause();
        track.removeAttribute("src");
        track.load();
      }
    };
  },
};
