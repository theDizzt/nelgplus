export const CORRECT_SHAPES = [1, 4, 7, 9, 11, 12, 16, 19, 23, 24, 25, 27, 30, 33, 36, 38, 39, 41, 42, 44, 46, 47, 48, 53, 55] as const;
export function createSequence(random = Math.random, decoyIds: readonly number[] = []) {
  const correct = [...CORRECT_SHAPES];
  for (let i = correct.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [correct[i], correct[j]] = [correct[j]!, correct[i]!];
  }
  const wrong = Array.from({ length: 55 }, (_, i) => i + 1).filter(id => !CORRECT_SHAPES.some(correct => correct === id));
  wrong.push(...decoyIds);
  for (let i = wrong.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [wrong[i], wrong[j]] = [wrong[j]!, wrong[i]!];
  }
  let correctIndex = 0;
  let wrongIndex = 0;
  let remaining = 0;
  return () => {
    if (remaining > 0) {
      remaining--;
      return wrong[wrongIndex++ % wrong.length]!;
    }
    remaining = Math.floor(random() * 4);
    return correct[correctIndex++ % correct.length]!;
  };
}

export function nextPath(previous = -1, random = Math.random) {
  const choices = Array.from({ length: 8 }, (_, i) => i).filter(i => i !== previous);
  const direction = choices[Math.floor(random() * choices.length)]!;
  const x = 45 + random() * 710;
  const y = 45 + random() * 510;
  const diagonalOffset = random() * 240 - 120;
  const paths = [
    [-100, y, 900, y], [900, y, -100, y], [x, -100, x, 700], [x, 700, x, -100],
    [-100, -100+diagonalOffset, 900, 700+diagonalOffset], [900, -100+diagonalOffset, -100, 700+diagonalOffset],
    [-100, 700+diagonalOffset, 900, -100+diagonalOffset], [900, 700+diagonalOffset, -100, -100+diagonalOffset],
  ];
  return { direction, points: paths[direction]! };
}

export function scoreFor(shapes: ReadonlySet<number>) {
  return CORRECT_SHAPES.filter(id => shapes.has(id)).length * 4;
}

export function failureScene(score: number, cause: "shape" | "mine" | "bomb") {
  return score >= 84 ? "5" : cause === "shape" ? "3" : "4";
}

export function bombTouchesEdge(x: number, y: number, width: number, height: number) {
  const radius = 32;
  return x <= radius || x >= width - radius || y <= radius || y >= height - radius;
}

// Swept collision prevents fast meteors from skipping over a stationary cursor.
export function meteorHits(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx-ax, dy = by-ay;
  const t = Math.max(0, Math.min(1, ((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy || 1)));
  return Math.hypot(px-ax-t*dx, py-ay-t*dy) <= 28;
}
