import type { LevelContext } from "./types";

interface StarMaskedInput {
  getValue: () => string;
  clear: () => void;
}

export function attachStarMaskedInput(
  input: HTMLInputElement,
  listen: LevelContext["listen"],
): StarMaskedInput {
  let rawValue = "";
  const requestedMaximumLength = input.maxLength > 0 ? input.maxLength : Number.POSITIVE_INFINITY;
  const maximumLength = requestedMaximumLength === 12 && input.classList.contains("nelg-password-input")
    ? Number.POSITIVE_INFINITY
    : requestedMaximumLength;
  const mirror = document.createElement("span");

  input.type = "text";
  input.inputMode = "text";
  input.autocomplete = "off";
  input.setAttribute("autocapitalize", "off");
  input.spellcheck = false;

  mirror.className = "nelg-password-input-mirror";
  mirror.setAttribute("aria-label", "Visible password text");
  input.insertAdjacentElement("afterend", mirror);

  const render = (caret = rawValue.length) => {
    input.value = "*".repeat(rawValue.length);
    mirror.textContent = rawValue;
    input.setSelectionRange(caret, caret);
  };

  const replaceSelection = (replacement: string) => {
    const start = input.selectionStart ?? rawValue.length;
    const end = input.selectionEnd ?? start;
    const available = maximumLength - (rawValue.length - (end - start));
    const accepted = replacement.slice(0, Math.max(0, available));
    rawValue = `${rawValue.slice(0, start)}${accepted}${rawValue.slice(end)}`;
    render(start + accepted.length);
  };

  listen(input, "beforeinput", (event) => {
    const inputEvent = event as InputEvent;
    const start = input.selectionStart ?? rawValue.length;
    const end = input.selectionEnd ?? start;

    if (inputEvent.inputType === "insertText" || inputEvent.inputType === "insertCompositionText") {
      event.preventDefault();
      replaceSelection(inputEvent.data ?? "");
      return;
    }

    if (inputEvent.inputType === "deleteContentBackward") {
      event.preventDefault();
      if (start !== end) {
        rawValue = `${rawValue.slice(0, start)}${rawValue.slice(end)}`;
        render(start);
      } else if (start > 0) {
        rawValue = `${rawValue.slice(0, start - 1)}${rawValue.slice(start)}`;
        render(start - 1);
      }
      return;
    }

    if (inputEvent.inputType === "deleteContentForward" || inputEvent.inputType === "deleteByCut") {
      event.preventDefault();
      if (start !== end) {
        rawValue = `${rawValue.slice(0, start)}${rawValue.slice(end)}`;
        render(start);
      } else if (start < rawValue.length) {
        rawValue = `${rawValue.slice(0, start)}${rawValue.slice(start + 1)}`;
        render(start);
      }
      return;
    }

    if (inputEvent.inputType !== "insertFromPaste") event.preventDefault();
  });

  listen(input, "paste", (event) => {
    event.preventDefault();
    replaceSelection((event as ClipboardEvent).clipboardData?.getData("text") ?? "");
  });

  return {
    getValue: () => rawValue,
    clear: () => {
      rawValue = "";
      render(0);
    },
  };
}
