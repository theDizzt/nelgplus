# Level 67 — Annihilate

The title retains the shared Perpetua font. All scenes use a white, unshadowed title and subtitle. Scene 1 uses multicolored 64-column rain; Scene 2 uses uninterrupted red rain; Scene 3 uses green rain with a brighter central `67` mask.

## Counters

Eight draggable, nine-character counters share a Courier display and circular minus/plus buttons. Pointer button activations and keyboard button activations count once. Arrow Up/Down also count once. Accepted text edits count once per input event, except cyan deletion: its explicit three-click solution takes precedence over the general keyboard-count rule. Radix menu selections, dragging/shaking, and clock changes do not count.

| Counter | Initial value | Intended solution | Minimum |
| --- | --- | --- | --- |
| Red | 15 | Minus 15 times | 15 |
| Yellow | 999999987 | Plus 13 times; nine-digit wrap to 0 | 13 |
| Cyan | 694877683 | Minus 3 times, select/delete the first eight digits | 3 |
| Orange | 65536 | Click the 1%-opacity center button | 1 |
| Green | ZEST | Minus 41 times in base 36 to display ZERO | 41 |
| Blue | 101010 | Right-click, select base 2, minus 42 times | 42 |
| Purple | Random 1–999999999 | Shake horizontally with at least 20 substantial direction reversals | 0 |
| Pink | Seconds until 02:39:42 | Set the game's custom clock; wait for 02:39:42 | 0 |

- Arithmetic wraps at nine digits in the selected base. Minus from zero wraps to the maximum.
- Cyan accepts deletion but rejects inserted/pasted digits. Erasing everything goes to Scene 2.
- Blue starts in base 16. Selecting another base reinterprets the displayed digits, rather than converting their old numeric value. Its menu follows Level 37: Music, Sound Effects, Music Volume, SFX Volume, Zoom In, Zoom Out, Show All, Forward, Back, and Rewind. Volume submenus offer 0–100% in 10% steps; zoom ranges from 1× to 4× with panning. Rewind returns to the game menu. The added English Radix Mode submenu contains Base 2/8/10/16/36 and Gibberish. Back/Forward fail immediately. Gibberish corrupts every counter for five seconds and then enters Scene 2.
- Purple minus pauses randomization; plus restarts it. Shake reversals gradually increase the randomization interval. After settling at zero, it becomes an ordinary counter.
- Pink reads `LevelContext.now()`, including the existing custom game clock. Plus/minus adjust its countdown by one second. At zero it locks and becomes an ordinary counter.
- When all counters reach their target, Scene 2 opens. Exact minimum counts reveal large `ZER0` lettering made of zero glyphs among random nonzero characters. Nonoptimal attempts show the ordinary red rain.
- Regardless of click totals, displays all equal to `67` reveal Scene 3; green also accepts `SIXSEVEN`.
- BACK from either result screen recreates every counter, resetting values, click counts, radix, randomization, clock offsets, drag positions and corruption timers.

The existing password form remains available; no final password or level-completion rule has been specified yet.

Run `tests/level67.browser.mjs` with Playwright to exercise the real minimum route, deletion, wrap, radix selection, dragging, custom-clock changes, failures, BACK resets, and the hidden scene. Screenshots go to `tmp/level67/`.
