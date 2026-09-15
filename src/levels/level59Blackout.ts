/** Uses the level's foreground clock independently of moving objects and hazards. */
export class BlackoutCycle {
  phase: "idle" | "fading" | "locked" = "idle";
  pin = "";
  entry = "";
  private elapsed = 0;
  private wait = 0;
  constructor(private readonly random = Math.random) { this.reset(); }
  get active() { return this.phase !== "idle"; }
  get opacity() { return this.phase === "locked" ? 1 : this.phase === "fading" ? Math.min(1,this.elapsed/1800) : 0; }
  reset() {
    this.phase = "idle";
    this.pin = this.entry = "";
    this.elapsed = 0;
    this.wait = 20000+this.random()*4000;
  }
  advance(ms: number) {
    if (this.phase === "locked") return;
    this.elapsed += ms;
    if (this.phase === "idle" && this.elapsed >= this.wait) {
      this.elapsed -= this.wait;
      this.phase = "fading";
      this.pin = String(Math.floor(this.random()*10000)).padStart(4,"0");
    }
    if (this.phase === "fading" && this.elapsed >= 1800) this.phase = "locked";
  }
  key(key: string): "pending" | "wrong" | "unlocked" {
    if (this.phase !== "locked") return "pending";
    if (key === "Backspace") this.entry = this.entry.slice(0,-1);
    else if (key === "Escape") this.entry = "";
    else if (/^\d$/.test(key) && this.entry.length < 4) this.entry += key;
    if (key !== "Enter") return "pending";
    if (this.entry.length !== 4 || this.entry !== this.pin) {
      this.entry = "";
      return "wrong";
    }
    this.reset();
    return "unlocked";
  }
}
