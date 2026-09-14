import { assetUrl } from "../core/assets";

const NAMES = [
  "blue scalene triangle", "gold five-pointed star", "red glowing heart", "green parallelogram", "orange circle", "purple cube",
  "magenta oval", "8ball", "9ball", "navy trapezoid", "yellow right chevron", "purple cross",
  "red pentagon", "Asian dragon resembling matchoi", "red rectangle", "green 16 ball", "cyan six-pointed star", "blue sloping quadrilateral",
  "gray snowflake", "orange sunburst", "rainbow oval", "orange division sign", "dark pink diamond", "yellow lightning bolt",
  "green circle with a blue inset", "yellow crescent", "pink L", "orange downward pentagon", "gray cylinder", "blue and gold gradient rectangle",
  "steve", "red guy", "pink D", "white tilted semicircle", "shape resembling highstrike", "perhaptation star",
  "magenta down arrow", "gray hourglass", "diamond sword", "green glowing diamond", "pale blue triangle with a hole", "kelpo",
  "red prohibition sign", "pale green inverted triangle", "august 19th (or 08:19)", "green beveled square", "orange V smiley", "thinking face",
  "evil go button", "strawberry chex", "solar", "carrot", "ugly one", "brown X", "dizzt's nametag",
];
const RASTER = new Set([14, 31, 32, 36, 39, 42, 48, 50, 51, 52]);
const polygon = (points: string, fill: string) => `<polygon points="${points}" fill="${fill}"/>`;
const circle = (cx: number, cy: number, r: number, fill: string) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;
const rect = (x: number, y: number, w: number, h: number, fill: string) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;
const text = (value: string, size = 34, fill = "black", y = 65) => `<text x="60" y="${y}" text-anchor="middle" font-family="'NELG Perpetua',Perpetua,serif" font-weight="700" font-size="${size}" fill="${fill}">${value}</text>`;
const arialText = (value: string, size = 34, fill = "black", y = 65) => `<text x="60" y="${y}" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="400" font-size="${size}" fill="${fill}">${value}</text>`;
function art(id: number): string {
  switch (id) {
    case 1: return polygon("8,100 90,10 115,100", "blue");
    case 2: return polygon("60,4 73,43 115,43 81,68 94,108 60,84 26,108 39,68 5,43 47,43", "#ffbf00");
    case 3: return '<path d="M60 106C-30 58 18-20 60 32C102-20 150 58 60 106" fill="url(#red)"/>';
    case 4: return polygon("25,25 115,25 90,95 2,95", "#699900");
    case 5: return circle(60, 60, 56, "#f60");
    case 6: return `${rect(10,35,76,76,"#c0f")}${polygon("10,35 35,12 110,12 86,35","#d32bfa")}${polygon("86,35 110,12 110,88 86,111","#9800b7")}<path d="M10 35H86V111M86 35L110 12" fill="none" stroke="black" stroke-width="2"/>`;
    case 7: return '<ellipse cx="60" cy="65" rx="56" ry="26" fill="#c60068"/>';
    case 8: return circle(60,60,55,"black") + circle(60,60,25,"white") + text("8",30,"black",70);
    case 9: return circle(60,60,57,"white") + '<path d="M25 15L116 58A57 57 0 0 1 92 107L4 64A57 57 0 0 1 25 15" fill="#ffc000" stroke="black" stroke-width="2"/>' + circle(60,60,24,"black") + circle(60,60,21,"white") + text("9",29,"black",69);
    case 10: return polygon("3,25 117,25 94,95 26,95","#032359");
    case 11: return polygon("26,15 61,15 100,60 61,105 26,105 65,60","yellow");
    case 12: return polygon("35,8 85,8 85,35 112,35 112,85 85,85 85,112 35,112 35,85 8,85 8,35 35,35","#713197");
    case 13: return polygon("60,5 115,46 94,112 26,112 5,46","red");
    case 15: return rect(4,28,112,66,"#c00");
    case 16: return circle(60,60,56,"#00ed00") + text("16",43,"black",75);
    case 17: return polygon("60,2 79,32 115,32 97,60 115,90 79,90 60,119 41,90 5,90 23,60 5,32 41,32","cyan");
    case 18: return polygon("10,30 105,10 105,105 10,105","#086d92");
    case 19: return `<g stroke="#aaa" stroke-width="10" stroke-linecap="square">${Array.from({length:6},(_,i)=>`<g transform="rotate(${i*60} 60 60)"><path d="M60 60V7M60 25L46 16M60 25L74 16M60 43L40 30M60 43L80 30" fill="none"/></g>`).join("")}</g>`;
    case 20: return polygon(Array.from({length:28},(_,i)=>{const a=i*Math.PI/14;const r=i%2?33:57;return `${60+Math.sin(a)*r},${60+Math.cos(a)*r}`;}).join(" "),"url(#orange)");
    case 21: return '<ellipse cx="60" cy="65" rx="56" ry="34" fill="url(#rainbow)"/>';
    case 22: return rect(8,46,104,28,"#d77c00")+circle(60,23,14,"#d77c00")+circle(60,97,14,"#d77c00");
    case 23: return polygon("60,2 90,60 60,118 30,60","#a00048");
    case 24: return polygon("54,4 15,24 52,48 39,56 82,89 115,118 82,71 93,65 65,38 76,33","url(#yellow)");
    case 25: return circle(60,60,57,"#00ee00")+circle(44,50,28,"black")+circle(44,50,25,"#076a92");
    case 26: return '<path d="M40 9A53 53 0 1 0 111 101Q39 87 40 9" fill="#ffdc67"/>';
    case 27: return polygon("6,4 62,4 62,64 118,64 118,118 6,118","#ff2da2");
    case 28: return polygon("25,18 95,18 95,94 60,115 25,94","#ff3c00");
    case 29: return '<path d="M14 38V96C14 118 106 118 106 96V38" fill="#817e80"/><ellipse cx="60" cy="38" rx="46" ry="15" fill="#817e80" stroke="black" stroke-width="3"/>';
    case 30: return rect(24,2,72,116,"url(#sky)");
    case 33: return '<path d="M25 18H60A44 44 0 0 1 60 106H25Z" fill="#f65eff"/>';
    case 34: return '<path d="M60 8A52 52 0 0 0 60 112Z" fill="white" transform="rotate(-22 60 60)"/>';
    case 35: return rect(19,52,65,65,"#619afa")+circle(73,14,11,"blue")
      +'<path d="M67 24L60 52" stroke="black" stroke-width="4" stroke-linecap="round"/>'
      +'<text x="51.5" y="94" text-anchor="middle" font-family="\'NELG Perpetua\',Perpetua,serif" font-weight="700" font-size="31" fill="white">HS</text>';
    case 36: return "";
    case 37: return polygon("33,4 87,4 87,70 114,70 60,116 6,70 33,70","#f000ed");
    case 38: return polygon("21,8 99,8 21,112 99,112","url(#gray)");
    case 40: return polygon("60,4 116,60 60,116 4,60","url(#green)");
    case 41: return '<path d="M33 4L117 81L3 117ZM53 44A27 27 0 1 0 53 98A27 27 0 1 0 53 44" fill="#9fc2de" fill-rule="evenodd"/>';
    case 43: return '<circle cx="60" cy="60" r="47" fill="none" stroke="red" stroke-width="18"/><path d="M24 24L96 96" stroke="red" stroke-width="17"/>';
    case 44: return polygon("5,24 115,24 60,113","#a8cf8d");
    case 45: return rect(3,28,114,65,"#444")+rect(10,34,100,53,"black")+rect(13,37,94,47,"#817e80")+text("08:19",25,"#0f0",71);
    case 46: return rect(15,15,90,90,"#258b25")+polygon("15,15 105,15 82,38 38,38","#59d159")+polygon("15,15 38,38 38,82 15,105","#87df87")+polygon("15,105 38,82 82,82 105,105","#2dad2d")+'<path d="M15 15L38 38H82L105 15M15 105L38 82H82L105 105M38 38V82M82 38V82" fill="none" stroke="black" stroke-width="3"/>'+rect(40,40,40,40,"#32c632");
    case 47: return '<g transform="rotate(90 60 60)">' + text(">:D",48,"orange",78) + '</g>';
    case 49: return rect(5,35,110,64,"yellow")+arialText("GO",39,"black",79);
    case 53: return '<g fill="url(#purple)"><path d="M10 32Q-3 12 51 19L109 44Q125 55 81 61L70 43L89 36L50 25Z"/><path d="M53 38Q-8 79 12 95L69 110Z"/><path d="M72 71Q103 44 119 87Q128 117 57 101Z"/></g>';
    case 54: return polygon("25,5 60,40 95,5 115,25 80,60 115,95 95,115 60,80 25,115 5,95 40,60 5,25","#a43c00");
    case 55: return rect(2,35,116,55,"#32c832")+text("Dizzt",31,"yellow",72);
    default: return "";
  }
}
const defs = `<defs>
  <filter id="outline" x="-10%" y="-10%" width="120%" height="120%">
    <feMorphology in="SourceAlpha" operator="dilate" radius="2" result="expanded"/>
    <feFlood flood-color="#000"/>
    <feComposite in2="expanded" operator="in"/>
    <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <radialGradient id="red"><stop stop-color="red"/><stop offset="1" stop-color="#400000"/></radialGradient>
  <radialGradient id="orange"><stop stop-color="#ff7900"/><stop offset="1" stop-color="#663000"/></radialGradient>
  <radialGradient id="yellow"><stop stop-color="yellow"/><stop offset="1" stop-color="#333300"/></radialGradient>
  <radialGradient id="green"><stop stop-color="#00f000"/><stop offset="1" stop-color="#005000"/></radialGradient>
  <linearGradient id="purple"><stop stop-color="#11091d"/><stop offset="1" stop-color="#572379"/></linearGradient>
  <linearGradient id="gray" x2="0" y2="1"><stop stop-color="#222"/><stop offset=".5" stop-color="white"/><stop offset="1" stop-color="#222"/></linearGradient>
  <linearGradient id="sky" x2="0" y2="1"><stop stop-color="#287fff"/><stop offset=".38" stop-color="white"/><stop offset=".49" stop-color="white"/><stop offset=".5" stop-color="#997000"/><stop offset=".7" stop-color="#ffdb25"/><stop offset="1" stop-color="#ffffdc"/></linearGradient>
  <linearGradient id="rainbow" x2="0" y2="1">${["red","yellow","lime","cyan","blue","magenta","red"].map((color,i)=>`<stop offset="${i/6}" stop-color="${color}"/>`).join("")}</linearGradient>
</defs>`;

export const SHAPES = NAMES.map((name, index) => {
  const id = index + 1;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="-3 -3 126 126">${defs}<g filter="url(#outline)">${art(id)}</g></svg>`;
  return { id, name, src: RASTER.has(id) ? assetUrl(`images/level59shape${id}.png`) : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` };
});

// A normalized alpha map matches object-fit: contain, including holes inside shapes.
export function loadShapeMasks() {
  const masks = new Map<number, Uint8ClampedArray>();
  const ready = Promise.all(SHAPES.map(shape => new Promise<void>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 120;
      const context = canvas.getContext("2d", { willReadFrequently: true })!;
      const scale = Math.min(120 / image.naturalWidth, 120 / image.naturalHeight);
      const w = image.naturalWidth * scale, h = image.naturalHeight * scale;
      context.drawImage(image, (120-w)/2, (120-h)/2, w, h);
      masks.set(shape.id, context.getImageData(0,0,120,120).data);
      resolve();
    };
    image.onerror = () => reject(new Error(`Could not load shape ${shape.id}`));
    image.src = shape.src;
  })));
  return { ready, hit(id: number, x: number, y: number, flipped = false) {
    if (x < 0 || y < 0 || x >= 1 || y >= 1) return false;
    const px = Math.min(119, Math.floor((flipped ? 1-x : x)*120));
    const py = Math.min(119, Math.floor((flipped ? 1-y : y)*120));
    if (id === 41) {
      // 41 is a ringed triangle: its circular center is a deliberate hole.
      const dx = (px + 0.5) / 120 - 53 / 120;
      const dy = (py + 0.5) / 120 - 71 / 120;
      if (dx * dx + dy * dy <= (25 / 120) ** 2) return false;
    }
    return (masks.get(id)?.[(py*120+px)*4+3] ?? 0) > 32;
  } };
}
