import type { LevelContext } from "../core/types";

export const BACKWARDS_UNLOCKED = "level-minus-08-s-clicked";

export function tryBackwardsPassword(
  answer: string,
  { session, goToLevel }: Pick<LevelContext, "session" | "goToLevel">,
): boolean {
  if (answer !== "BACK" || !session.hasFlag(BACKWARDS_UNLOCKED)) return false;
  goToLevel(-9, "success");
  return true;
}
