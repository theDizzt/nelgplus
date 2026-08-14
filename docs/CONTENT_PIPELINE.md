# Content and Asset Management

## Directories

- Images: `public/assets/images/`
- Background music and long voice recordings: `public/assets/music/`
- Short sound effects: `public/assets/sounds/`
- Web fonts: `public/assets/fonts/<family>/`

Use lowercase English letters, numbers, and hyphens for file names whenever possible. When an existing level naming convention must be preserved, make the level number and purpose obvious, as in `level32bg5.jpg` or `level35phase4a.png`.

## URLs and Deployment

Use `assetUrl("images/...")` when referencing assets from TypeScript. Absolute paths written directly in CSS may fail when the game is deployed under a repository subpath on GitHub Pages. Pass the result of `assetUrl` through a dynamic CSS variable or verify that the path follows the shared deployment rules.

## Images

Collision detection for transparent PNG and GIF files should use an alpha mask or an explicitly defined smaller hitbox instead of the full rectangular image bounds. Optimize oversized source files for their rendered dimensions, but do not use lossy compression when a puzzle relies on exact pixel color differences. RGB values used in hidden-color puzzles must match exactly between the documentation and code.

## Audio

Keep Music and SFX volume controls separate. Level-specific background music should loop until the level ends and must stop during cleanup. Do not add long voice recordings to the global initial preloader. Load their metadata when the relevant level opens or load them after the player presses a playback button. Call `play()` only after a browser-recognized user interaction and display a failure state if playback cannot begin.

Do not write raw `"sounds/..."` or `"/assets/sounds/..."` strings in level modules for shared short sound effects. Import `SOUND_EFFECTS` from `src/core/assets.ts` and call effects through a canonical value such as `audio.playEffect(SOUND_EFFECTS.smack)`. This ensures that the development server, GitHub Pages repository subpaths, and the preloaded audio pool all use the same URL key.

When adding a shared sound effect, update all applicable locations:

1. Place the file in `public/assets/sounds/`.
2. Register its name and relative path in `SOUND_EFFECTS`.
3. If the effect is used frequently from the beginning of the game, add the same constant to `PRELOAD_EFFECTS` in `Game.ts`.

If the playback path differs from the preload path by even one character, the prepared audio pool may not be reused. The capitalization of the file extension must also match the real file.

## Fonts

When adding a font file, register it with `@font-face` in `src/styles/fonts.css` and add it to the initial preload lists when necessary. Perpetua is the default title font and Courier is the default subtitle font. Arial, Tahoma, Comic Sans, Papyrus, and other families should only be used when required by a level specification.

A static font file must declare exactly one `font-weight` and `font-style` matching the real file. For example, register `Vivaldi_Bold.woff2` with `font-weight: 700` and request weight `700` from its consuming selector. Do not declare a range such as `700 900` for a file that is not a variable font, and do not request an unregistered weight such as `900`. If the browser cannot find a matching face, it may silently substitute a fallback font.

For a dedicated font that must be visible before gameplay starts, update all of the following:

1. Add the file under `public/assets/fonts/<family>/`.
2. Register `@font-face` in `src/styles/fonts.css` with the exact family, weight, and style.
3. Add the real file URL to `PRELOAD_FONTS` in `Game.ts`.
4. Add a matching family-and-weight request to `PRELOAD_FONT_REQUESTS`.

Screen-critical fonts awaited by the initial preloader may use `font-display: block` to prevent a brief fallback-font flash. Ordinary body fonts may retain `swap`, depending on their loading policy.
