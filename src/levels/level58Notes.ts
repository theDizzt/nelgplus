interface CosmicNote {
  readonly x: number;
  readonly y: number;
  readonly html: string;
  readonly reveal?: string;
}

const signature = '<p class="level-58__signature">H-135 from Haise-62</p>';
const greeting = '<p>Greetings, player...</p>';
const escapeMessage = `${greeting}<p>Everything is done. Let's escape from cosmos by pressing the key "E", which is a abbrev of "Escape" in this screen.</p>${signature}`;

// The unusual spelling and internal spaces are intentional puzzle clues.
export const COSMIC_NOTES: Readonly<Record<string, CosmicNote>> = {
  hidden: {
    x: -310, y: 205,
    html: `${greeting}<p>The enternal final answer of the infinity cosmos is <strong>"unknown"</strong>.</p>${signature}`,
  },
  unknown: {
    x: 720, y: 150,
    html: `${greeting}<p>You have fiund that the cosmo tell you is "unknown". Now you need to find some shorter answer from t he "unknown" universe.</p>
      <p>Once you found them all, just use "<span class="ink-red">Green</span>" - "<span class="ink-purple">Red</span>" - "<span class="ink-yellow">Blue</span>" - "<span class="ink-green">Purple</span>" - "<span class="ink-blue">Yellow</span>" order to pass here.</p>${signature}`,
  },
  know: {
    x: -310, y: 15,
    html: `<p>You "<span class="ink-purple">know</span>" something from the cosmo. Now I would like to tell you more info.</p>
      <p>Here I give you a grid, you just need to from the (1,1), go to (5,1), then (5,3)<br />After that is (1,3), then (5,3) and finally go to (5,5) and (1,5). I define the<br />block on the down lef t is (1,1).</p>
      <div class="level-58__grid" role="img" aria-label="Blank five by five grid. The bottom-left square is (1,1)."></div>`,
  },
  own: {
    x: 720, y: 20,
    html: `<p>You need to do this puzzle on your "<span class="ink-blue">own</span>" since no o ne can help you solving this.</p>
      <p>I would like to give you a puzzle. I give you a word and one word has a<br />number. skate=2, cosmo=2, flick=0, alien=2, bloom=3, what is the value of<br />rebooting?</p>`,
  },
  no: {
    x: -310, y: 435,
    html: `<p>You may know some things, but there are others you have <span class="ink-green">no</span> idea about.</p>
      <p>We are a team and I want to let you help me to know how many aliens in my team.<br />In fact, I don’t know anything I just tell yo u I found 3 teammates in my laboratory<br />and 2 teammates in front of me. I really know nothing besides this.</p>`,
  },
  now: {
    x: 720, y: 420,
    html: `<p>The time before future and past is present, or "<span class="ink-red">now</span>".</p>
      <p>Here I give you a riddle about num ber. Please see it correctly.</p>
      <p>Let me tell you... There is a 30Ω resistance and a 6Ω resistance, now you want<br />them be parallel connected. What is the total resistance?</p>`,
  },
  known: {
    x: -310, y: 490,
    html: `<p>The answer is almost "<span class="ink-yellow">known</span>". And it’s time to give you a n ew puzzle.</p>
      <p>In fact, there exists a lot of lists of numbers. Let me show you one of them:<br />699999999, 69, 15, and what is next and the final number?</p>`,
  },
  "65536": { x: -310, y: 210, html: escapeMessage, reveal: "29 41" },
  "53665": { x: 720, y: 210, html: escapeMessage, reveal: "50-11" },
  "i love nelg++": {
    x: 205, y: 195,
    html: `${greeting}<p>If you went here accidently, I will tell you nothing.</p>
      <p>On every subpuzzle, there is always strange spaces. Find them, and remember:<br />"<span class="ink-red">left</span>", "<span class="ink-blue">left</span>", "<span class="ink-green">right</span>", "<span class="ink-yellow">left</span>", "<span class="ink-purple">right</span>".</p>${signature}`,
  },
  mount: {
    x: 205, y: 215,
    html: `<p>Thank you, player...</p><p>This is my last request.</p><p>Please add ET to the subtitle.</p>${signature}`,
  },
};
