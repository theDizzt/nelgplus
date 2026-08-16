# Technical Architecture

## Runtime Structure

- `src/core/Game.ts`: Main menu, Options, Warp Zone, level entry, and level completion
- `src/core/LevelScope.ts`: Level event, timer, and cleanup lifecycle
- `src/levels/registry.ts`: Registration of levels included in the game
- `src/levels/levelNN.ts`: Per-level state and interactions
- `src/styles/levels/levelNN.css`: Per-level visual design
- `public/assets/`: Images, fonts, and audio served directly by the browser

## Lifecycle

A level creates its DOM in `mount(context)` and returns a cleanup function. Use `context.listen`, `context.timeout`, and `context.interval` for global events and timers whenever possible. A multi-scene level must clear its own `AbortController` and timer collection during every scene transition. Audio objects, Red Guy controllers, and drag pointer capture must also be released when a scene ends.

## Shared Systems

- `AudioManager`: Music and SFX enabled state, volume, and the short-effect audio pool
- `StarMaskedInput`: Password entry that displays the real value as stars
- `RedGuy`: Acceleration, inertia, jumping, one-way platforms, and per-scene key mapping
- `floatingPosition`: Coordinate conversion for menus and floating UI at variable display sizes
- `assetUrl`: Deployment-safe asset URLs for repository subpaths such as GitHub Pages
- `SOUND_EFFECTS`: Canonical shared paths that keep preload and playback effect URLs identical
- `HallOfFameService`: Data layer that reads, validates, and sorts the deployed static JSON file
- `InteractionGuard`: Selection and dragging prevention outside explicitly allowed elements
- `LevelContext.session`: In-memory flags that survive level remounts and navigation but reset when the game page is restarted

The browser never writes Hall of Fame records. Follow `docs/HALL_OF_FAME.md` for the JSON format and manual editing procedure.

When coordinate calculations or interactions are repeated by two or more levels, extract a small utility under `core`. Keep presentation logic used by only one level inside that level's module and CSS file.

## Scene State Rules

A scene-rendering function must clean up the previous scene before recreating the full screen. Do not reuse DOM references across scenes. Success and failure transitions require duplicate-execution guards. A repeating click puzzle should define its complete state range and use modular arithmetic to implement a cycle such as `empty screen → phases → input field → empty screen`.

Use `LevelContext.session` for achievement eligibility that must survive leaving or remounting a level but must reset after a complete game restart. Set a failure flag at the moment the disqualifying scene is entered, and check it only when the player completes the qualifying action. Never unlock an achievement on an intermediate input event such as `paste` when the condition also requires a successful submission.

Multi-scene levels expose their administrator entry points through the optional `LevelDefinition.scenes` metadata. Each scene has a stable string `id` and a human-readable `label`. `Game.showLevel` passes the selected id as `LevelContext.initialScene`; the level validates it and falls back to its normal first scene when the value is missing or unsupported. Add this metadata and initial dispatch whenever a new multi-scene level is created so the Options administrator console updates automatically.

Administrator heading-font overrides are applied at the game root with CSS custom properties and `!important` selectors limited to level and Warp Zone headings. Selecting `Default` removes the property so each level's authored typography is restored. Add a font to `fonts.css`, the preload lists, and `ADMIN_FONT_OPTIONS` together; never expose an unregistered font in the administrator selector.

## Expansion Direction

As the number of levels grows, extend the architecture in this order:

1. Extract password forms, Flash-style menus, and Warp checkpoint data into independent components.
2. Move platform-scene layouts into data objects.
3. Register per-level asset lists for selective preloading.
4. Extend the existing administrator scene navigation and add collision-box visualization.
5. Add automated tests for correct answers, incorrect answers, Enter behavior, and cleanup.
