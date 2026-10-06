export type ObjectKind = "floor" | "wall" | "ladder" | "spring" | "hot" | "steve";
export interface Rect { x: number; y: number; width: number; height: number }
export interface PuzzleObject extends Rect {
  kind: ObjectKind; fixed?: boolean;
  launchSpeed?: number;
  launchHorizontalSpeed?: number;
  /** Horizontal patrol bounds refer to the sprite's left edge. */
  patrol?: { minX: number; maxX: number; speed: number };
}
export interface PuzzleLayout { start: { x: number; y: number }; portal: Rect; objects: PuzzleObject[]; lava?: { startY: number; riseSpeed: number } }
export interface Runner extends Rect {
  scale: number;
  jumpSpeed?: number;
  direction: 1 | -1; vy: number; grounded: boolean; boosted: boolean;
  ladder: PuzzleObject | null; mode: "idle" | "walking" | "climbing" | "jumping" | "falling";
}
export const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
export const draggable = (o: PuzzleObject) => !o.fixed && ["floor", "ladder", "spring"].includes(o.kind);
export const MINIGAME_SCALE = .8;
export const createRunner = (start: PuzzleLayout["start"], scale = 1): Runner => ({ ...start, scale, width: 38 * scale, height: 72 * scale, direction: 1, vy: 0, grounded: false, boosted: false, ladder: null, mode: "idle" });

/** Scale around the play area's bottom center, preserving relative puzzle geometry. */
export function scalePuzzle(layout: PuzzleLayout, scale: number): PuzzleLayout {
  const point = (p: { x: number; y: number }) => ({ x: 400 + (p.x - 400) * scale, y: 510 + (p.y - 510) * scale });
  const rect = (r: Rect) => ({ ...point(r), width: r.width * scale, height: r.height * scale });
  return { start: point(layout.start), portal: rect(layout.portal), ...(layout.lava ? {lava:{startY:510+(layout.lava.startY-510)*scale,riseSpeed:layout.lava.riseSpeed*scale}} : {}), objects: layout.objects.map(o => ({ ...o, ...rect(o), ...(o.patrol ? {patrol:{minX:400+(o.patrol.minX-400)*scale,maxX:400+(o.patrol.maxX-400)*scale,speed:o.patrol.speed*scale}} : {}) })) };
}

export const lavaSurface = (layout: PuzzleLayout, elapsed: number): number => layout.lava ? Math.max(0, layout.lava.startY - Math.max(0, elapsed) * layout.lava.riseSpeed) : Infinity;

/** Deterministic ping-pong motion, used by both rendering and collision detection. */
export function updatePatrol(object: PuzzleObject, seconds: number): 1 | -1 {
  if (!object.patrol) return -1;
  const {minX,maxX,speed}=object.patrol;
  const distance=maxX-minX;
  if (distance<=0) { object.x=minX; return -1; }
  const phase=seconds*speed%(2*distance);
  object.x=phase<distance?maxX-phase:minX+phase-distance;
  return phase<distance?-1:1;
}

// Provisional staging layout: replace each entry when the five puzzle maps are supplied.
export const PUZZLES: PuzzleLayout[] = Array.from({ length: 5 }, () => ({
  start: { x: 48, y: 438 }, portal: { x: 346, y: 422, width: 62, height: 88 },
  objects: [
    // Same dimensions as the hot wall, turned sideways. Keep the provisional
    // portal within reach of a continuous path made from these three floors.
    { kind: "floor", x: 24, y: 510, width: 112, height: 30 },
    { kind: "floor", x: 160, y: 510, width: 112, height: 30 },
    { kind: "floor", x: 296, y: 510, width: 112, height: 30 },
    { kind: "wall", x: 608, y: 210, width: 28, height: 110 },
    { kind: "ladder", x: 210, y: 265, width: 46, height: 155 },
    { kind: "spring", x: 360, y: 374, width: 64, height: 24 },
    { kind: "hot", x: 492, y: 215, width: 30, height: 112 },
    { kind: "steve", x: 660, y: 232, width: 76, height: 90 },
  ],
}));

// Scene 2: fixed blue floor, hot wall and portal follow the supplied diagram.
// Construction pieces deliberately start away from the intended route.
PUZZLES[0] = {
  start: { x: 270, y: 284 },
  portal: { x: 260, y: 414, width: 74, height: 96 },
  objects: [
    { kind: "floor", x: 64, y: 270, width: 112, height: 30 },
    { kind: "floor", x: 560, y: 480, width: 112, height: 30 },
    { kind: "floor", fixed: true, x: 240, y: 356, width: 112, height: 30 },
    // Upper turn-around wall: bottom aligns with the upper route's floor height.
    { kind: "wall", x: 544, y: 118, width: 38, height: 112 },
    { kind: "wall", x: 110, y: 398, width: 38, height: 112 },
    { kind: "spring", x: 600, y: 420, width: 64, height: 30 },
    { kind: "hot", x: 416, y: 246, width: 38, height: 112 },
  ],
};

/** Scene 3 diagram coordinates are fitted below the heading; artwork stays unchanged. */
function createSecondPuzzle(): PuzzleLayout {
  const drawingScale = .62;
  const fromDrawing = (x: number, y: number, width: number, height: number): Rect => ({
    x: 100 + x * drawingScale, y: 120 + y * drawingScale,
    width: width * drawingScale, height: height * drawingScale,
  });
  // Outer bounds traced from 66-2.png, including the black outlines.
  // Keep individual dimensions: the red wall beside the upper ladder is shorter.
  const blue = { kind: "floor" as const, fixed: true, ...fromDrawing(41, 185, 124, 45) };
  const portal = fromDrawing(799, 115, 84, 107);
  const drawingObjects = (kind: ObjectKind, bounds: readonly (readonly [number, number, number, number])[]): PuzzleObject[] =>
    bounds.map(([x,y,width,height]) => ({kind,...fromDrawing(x,y,width,height)}));
  const hazards = drawingObjects("hot", [
    [0,228,44,124], [41,349,44,124], [257,348,46,125],
    [569,255,45,101], [730,232,45,124],
  ]);
  const pieces: PuzzleObject[] = [
    ...drawingObjects("floor", [[125,551,120,45],[200,305,124,45],[283,455,125,45],[405,457,124,45],[453,334,124,45],[503,213,124,45],[611,600,124,45]]),
    ...drawingObjects("wall", [[257,106,46,124],[437,106,45,124],[684,110,45,125],[301,227,44,125],[83,471,45,125],[524,354,44,125],[387,479,45,125],[566,479,45,125],[684,356,45,125],[896,355,45,124]]),
    ...drawingObjects("spring", [[265,582,75,45],[731,600,74,45],[819,477,75,45],[799,315,75,45]]),
    ...drawingObjects("ladder", [[467,334,45,125],[515,213,45,123]]),
  ];
  return scatterDrawing(blue, portal, hazards, pieces);
}

function scatterDrawing(blue: PuzzleObject, portal: Rect, hazards: PuzzleObject[], pieces: PuzzleObject[], reserved: Rect[] = []): PuzzleLayout {
  const start = { x: blue.x + 12, y: blue.y - 72 * MINIGAME_SCALE };
  const occupied: Rect[] = [blue, portal, ...hazards, ...reserved, ...pieces.filter(piece => !draggable(piece)), { ...start, width: 38 * MINIGAME_SCALE, height: 72 * MINIGAME_SCALE }];
  // Deterministic scattered inventory: no piece covers another piece or a fixed hazard.
  pieces.forEach((piece, index) => {
    // Fixed walls stay at their diagram positions, outside the scattered inventory.
    if (!draggable(piece)) return;
    const candidates: Rect[] = [];
    for (let y = 195; y + piece.height <= 525; y += 10) {
      for (let x = 20; x + piece.width <= 780; x += 10) candidates.push({ ...piece, x, y });
    }
    candidates.sort((a,b) => ((a.x * 73 + a.y * 137 + index * 419) % 997) - ((b.x * 73 + b.y * 137 + index * 419) % 997));
    const spot = candidates.find(candidate => Math.hypot(candidate.x-piece.x,candidate.y-piece.y)>60 && !occupied.some(o => overlaps({x:candidate.x-7,y:candidate.y-7,width:candidate.width+14,height:candidate.height+14},o)));
    if (!spot) throw new Error("Level 66 diagram inventory does not fit");
    Object.assign(piece, { x: spot.x, y: spot.y });
    occupied.push(piece);
  });
  // Store in the same authoring space as other maps; mount applies the common scale.
  const unscalePoint = (p: {x:number;y:number}) => ({x:400+(p.x-400)/MINIGAME_SCALE,y:510+(p.y-510)/MINIGAME_SCALE});
  const unscaleRect = (r: Rect) => ({...unscalePoint(r),width:r.width/MINIGAME_SCALE,height:r.height/MINIGAME_SCALE});
  return { start: unscalePoint(start), portal: unscaleRect(portal), objects: [blue,...hazards,...pieces].map(o=>({...o,...unscaleRect(o),...(o.patrol?{patrol:{minX:400+(o.patrol.minX-400)/MINIGAME_SCALE,maxX:400+(o.patrol.maxX-400)/MINIGAME_SCALE,speed:o.patrol.speed/MINIGAME_SCALE}}:{})})) };
}
PUZZLES[1] = createSecondPuzzle();

function createFourthPuzzle(): PuzzleLayout {
  const rect = (x:number,y:number,width:number,height:number):Rect => ({x:100+x*.62,y:120+y*.62,width:width*.62,height:height*.62});
  const blue: PuzzleObject = {kind:"floor",fixed:true,...rect(42,429,122,42)};
  const portal=rect(102,103,82,103);
  const steve: PuzzleObject = {kind:"steve",...rect(211,191,76,74),patrol:{minX:100+23*.62,maxX:100+211*.62,speed:40}};
  const hazards: PuzzleObject[] = [
    // Small clearance adjustment leaves room below the upper hazard and behind a leftward jump.
    ...[[362,221],[565,43],[829,362],[616,511]].map(([x,y])=>({kind:"hot" as const,...rect(x!,y!,42,122)})),
    steve,
    ...[[164,578],[398,510],[631,441]].map(([x,y])=>({kind:"floor" as const,fixed:true,...rect(x!,y!,122,42)})),
  ];
  const pieces: PuzzleObject[] = [
    ...[[294,215],[508,300],[666,252]].map(([x,y])=>({kind:"floor" as const,...rect(x!,y!,122,42)})),
    ...[[121,472],[589,361],[787,130]].map(([x,y])=>({kind:"wall" as const,...rect(x!,y!,42,122)})),
    ...[[199,269],[433,300],[288,578],[520,510]].map(([x,y])=>({kind:"spring" as const,launchSpeed:450,launchHorizontalSpeed:155,...rect(x!,y!,72,42)})),
    {kind:"ladder",...rect(710,253,42,188)},
  ];
  const layout = scatterDrawing(blue,portal,hazards,pieces,[{x:steve.patrol!.minX,y:steve.y,width:steve.patrol!.maxX-steve.patrol!.minX+steve.width,height:steve.height}]);
  // Leave the GO form accessible before starting; rise only after an empty GO.
  layout.lava = {startY:510+(590-510)/MINIGAME_SCALE,riseSpeed:3/MINIGAME_SCALE};
  return layout;
}
PUZZLES[3] = createFourthPuzzle();

function createThirdPuzzle(): PuzzleLayout {
  const rect = (x:number,y:number,width:number,height:number):Rect => ({x:100+x*.62,y:120+y*.62,width:width*.62,height:height*.62});
  const blue: PuzzleObject = {kind:"floor",fixed:true,...rect(51,581,122,42)};
  const portal=rect(758,460,82,103);
  const steve: PuzzleObject = {kind:"steve",...rect(424,506,76,74),patrol:{minX:100+197*.62,maxX:100+424*.62,speed:45}};
  const hazards: PuzzleObject[] = [
    ...[[403,106],[849,89],[689,210],[689,453],[856,450]].map(([x,y])=>({kind:"hot" as const,...rect(x!,y!,42,122)})),
    steve,
  ];
  const pieces: PuzzleObject[] = [
    ...[[90,336,122],[214,145,82],[470,146,122],[592,146,122],[368,334,122],[173,581,122],[564,454,122],[503,578,122]].map(([x,y,w])=>({kind:"floor" as const,...rect(x!,y!,w!,42)})),
    ...[[51,215],[689,332]].map(([x,y])=>({kind:"wall" as const,...rect(x!,y!,42,122)})),
    ...[[302,144],[296,334],[492,453],[295,581]].map(([x,y])=>({kind:"spring" as const,...rect(x!,y!,72,42)})),
    {kind:"ladder",...rect(171,146,42,190)},
    {kind:"ladder",...rect(579,454,42,124)},
  ];
  return scatterDrawing(blue,portal,hazards,pieces,[{x:steve.patrol!.minX,y:steve.y,width:steve.patrol!.maxX-steve.patrol!.minX+steve.width,height:steve.height}]);
}
PUZZLES[2] = createThirdPuzzle();

/** Fixed small timesteps prevent tunneling through thin walls and hazards. */
export function stepRunner(p: Runner, objects: PuzzleObject[], portal: Rect, dt: number): "running" | "dead" | "clear" {
  const danger = () => p.x < 0 || p.x + p.width > 800 || p.y < 0 || p.y + p.height > 600 || objects.some(o => (o.kind === "hot" || o.kind === "steve") && overlaps(p, o));
  if (danger()) return "dead";
  if (overlaps(p, portal)) return "clear";
  const oldX = p.x;
  const feet = p.y + p.height;
  if (!p.ladder && !p.boosted) {
    p.ladder = objects.find(o => o.kind === "ladder" && p.x + p.width > o.x && p.x < o.x + o.width && feet > o.y + 2 && feet <= o.y + o.height + 8 && p.y < o.y + o.height) ?? null;
  }
  if (p.ladder) {
    p.x = p.ladder.x + (p.ladder.width - p.width) / 2;
    p.y -= 100 * p.scale * dt;
    p.vy = 0;
    p.grounded = false;
    p.mode = "climbing";
    if (p.y + p.height <= p.ladder.y) {
      p.y = p.ladder.y - p.height;
      p.x = p.direction === 1 ? p.ladder.x + p.ladder.width : p.ladder.x - p.width;
      p.ladder = null;
    }
  } else {
    p.x += p.direction * (p.boosted ? p.jumpSpeed ?? 115 : 115) * p.scale * dt;
    const pad = objects.find(o => o.kind === "spring" && p.grounded && overlaps(p, o));
    if (pad) { p.y = pad.y - p.height; p.vy = -(pad.launchSpeed ?? 530) * p.scale; p.jumpSpeed = pad.launchHorizontalSpeed; p.boosted = true; p.grounded = false; }
    if (!p.boosted) {
      const wall = objects.find(o => o.kind === "wall" && overlaps(p, o));
      if (wall) {
        p.x = p.direction === 1 ? wall.x - p.width : wall.x + wall.width;
        // If placed inside a wall, resolve toward the previous side before turning.
        if (oldX < wall.x && p.direction === -1) p.x = wall.x - p.width;
        p.direction = p.direction === 1 ? -1 : 1;
      }
    }
    p.vy = Math.min(650 * p.scale, p.vy + 950 * p.scale * dt);
    p.y += p.vy * dt;
    p.grounded = false;
    const land = objects.filter(o => (o.kind === "floor" || o.kind === "spring") && p.vy >= 0 && p.x + p.width > o.x && p.x < o.x + o.width && feet <= o.y + .5 && p.y + p.height >= o.y).sort((a, b) => a.y - b.y || Number(b.kind === "spring") - Number(a.kind === "spring"))[0];
    if (land) {
      p.y = land.y - p.height;
      p.vy = land.kind === "spring" ? -(land.launchSpeed ?? 530) * p.scale : 0;
      p.boosted = land.kind === "spring";
      p.jumpSpeed = land.launchHorizontalSpeed;
      p.grounded = land.kind === "floor";
    }
    p.mode = p.grounded ? "walking" : p.vy < 0 ? "jumping" : "falling";
  }
  if (danger()) return "dead";
  return overlaps(p, portal) ? "clear" : "running";
}
