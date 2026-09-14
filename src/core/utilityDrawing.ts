export interface Point { x: number; y: number }

export function rectangleSelection(start: Point, end: Point, width: number, height: number) {
  const left = Math.floor(Math.max(0, Math.min(width, start.x, end.x)));
  const top = Math.floor(Math.max(0, Math.min(height, start.y, end.y)));
  const right = Math.floor(Math.min(width, Math.max(0, start.x, end.x)));
  const bottom = Math.floor(Math.min(height, Math.max(0, start.y, end.y)));
  return { x: left, y: top, width: right - left, height: bottom - top };
}

// Iterative four-neighbour fill avoids overflowing the call stack on empty layers.
export function floodFill(
  image: ImageData, x: number, y: number, color: string, reference: ImageData = image,
  options: { tolerance?: number; contiguous?: boolean } = {},
): number {
  const { data, width, height } = image;
  if (reference.width !== width || reference.height !== height) throw new Error("Fill reference dimensions must match the drawing.");
  const boundary = reference.data;
  x = Math.floor(x);
  y = Math.floor(y);
  if (x < 0 || y < 0 || x >= width || y >= height) return 0;
  const origin = (y * width + x) * 4;
  const before = Array.from(boundary.slice(origin, origin + 4));
  const after = [parseInt(color.slice(1, 3), 16), parseInt(color.slice(3, 5), 16), parseInt(color.slice(5, 7), 16), 255];
  if (reference === image && before.every((value, i) => value === after[i])) return 0;
  const tolerance = Math.max(0, Math.min(255, options.tolerance ?? 24));
  const matches = (pixel: number) => before.every((value, i) => Math.abs(boundary[pixel * 4 + i]! - value) <= tolerance);
  if (options.contiguous === false) {
    let filled = 0;
    for (let pixel = 0; pixel < width * height; pixel++) {
      if (!matches(pixel)) continue;
      data.set(after, pixel * 4);
      filled++;
    }
    return filled;
  }
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let read = 0;
  let write = 0;
  const add = (pixel: number) => {
    if (visited[pixel]) return;
    visited[pixel] = 1;
    if (!matches(pixel)) return;
    queue[write++] = pixel;
  };
  add(y * width + x);
  while (read < write) {
    const pixel = queue[read++]!;
    data.set(after, pixel * 4);
    if (pixel % width > 0) add(pixel - 1);
    if (pixel % width < width - 1) add(pixel + 1);
    if (pixel >= width) add(pixel - width);
    if (pixel < width * (height - 1)) add(pixel + width);
  }
  return write;
}
