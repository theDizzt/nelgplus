# Quality Assurance Standards

## Required Tests for Every Level

1. The correct solution opens the next scene or level.
2. Incorrect answers, capitalization differences, and leading or trailing spaces behave exactly as specified.
3. GO and Enter either behave identically or differ intentionally according to the specification.
4. Re-entering a level leaves no timers, audio, or events from the previous scene.
5. Music and SFX respect their enabled state and volume range from 0 to 100.
6. Drag and click coordinates remain accurate at multiple rendered sizes.
7. Every image, font, and audio file loads on both the development server and a GitHub Pages repository subpath.
8. A click sound still plays when its click immediately transitions to another scene.
9. Rapidly repeating the same effect does not cause later playback to be dropped behind an earlier instance.

## Font Regression Tests

After adding or changing a font, verify the following:

- The `font-family`, `font-weight`, and `font-style` in `@font-face` exactly match the real file and its consuming CSS selector.
- Static font files do not declare variable weight ranges.
- Screen-critical font file URLs and CSS requests are present in `PRELOAD_FONTS` and `PRELOAD_FONT_REQUESTS`, respectively.
- A console check such as `document.fonts.check('700 34px "NELG Vivaldi"')` returns `true` for the actual requested weight.
- Font requests return HTTP 200 on the development server and GitHub Pages, with no 404 or capitalization mismatch in the Network panel.
- The same glyph shape is visible immediately after the preloader and after a refresh, without a fallback-font flash.

Test the Level 25 failure-screen body separately to ensure that it uses `NELG Vivaldi` at weight `700`. Its level title and subtitle must retain the shared Perpetua and Courier rules.

## Sound Effect Regression Tests

After changing a shared sound effect, enable SFX in Options, set its volume to 100, and manually verify these interactions:

- Level 6 number buttons
- Level 20 Scene 1 `BEGIN`
- Level 20 Scene 4 moving button
- Level 23 interactive objects and `GO`
- Level 24 failure-screen Space-bar presses

In the browser Network panel, confirm that sound requests target `/assets/sounds/` under the current deployment base and return HTTP 200. A code search must find no raw `playEffect("...` string calls. Every call must use a `SOUND_EFFECTS` constant.

## Screen Size Tests

Test at least these three sizes:

- 800×600 or a close baseline size
- A wide desktop embed
- A small blog or Newgrounds embed

The game must preserve its aspect ratio and remain centered. Coordinate-based menus must stay within the viewport when opened near any corner. Draggable objects must follow the pointer in the same logical coordinate system.

## Platform Level Tests

- Every platform gap is reachable with the current jump speed.
- One-way platforms are solid only when the character lands from above.
- Characters standing on moving or draggable platforms travel in the intended direction with them.
- Transparent image regions do not count as enemy collisions.
- Off-screen puzzle spaces and containment walls do not become visible in the viewport.
- Music and character loops do not duplicate after a failure restart.

## Pre-deployment Commands

```powershell
npm.cmd run build
git diff --check
```

After building, confirm that major asset requests from `dist/` return HTTP 200. The browser console must contain no errors, and the game must have no missing files, infinite timers, or duplicated audio. After registering a new level, also verify the included-level count on the main menu and its Warp Zone number.
