# Level Design Rules

## Basic Level Specification

Every level must define at least the following:

- Level number and subtitle
- Number of scenes
- Title, subtitle, and body text colors and fonts
- Background and required assets
- Interactive objects
- Input method and exact success condition
- Failure conditions and failure destinations
- Audio start, loop, and stop timing
- Whether the level has a Warp Zone and its password
- Walkthrough logic explaining how the player can infer the solution from the clues

## Screen and Coordinates

The logical game resolution is 800×600. Place elements in CSS pixel coordinates, but always convert browser pointer coordinates using `getBoundingClientRect()` and the logical-screen scale. Context menus, draggable elements, and invisible coordinate buttons must use the shared coordinate utility. Puzzles that use off-screen space must define their playable bounds separately from the visible viewport.

## Input and Passwords

- Passwords are case-sensitive and preserve leading and trailing whitespace unless a level explicitly says otherwise.
- Use `attachStarMaskedInput` for star-masked password fields.
- Puzzles that distinguish direct typing from paste input must clearly separate the roles of `keydown`, `beforeinput`, and `paste`.
- Unless a puzzle explicitly requires a different visual treatment, password controls must follow the Level 5 control design. The input is 174×43, uses a square three-pixel dark border, a white background, Perpetua text, and the shared star-masking behavior. The GO button is 52×40, yellow with a square three-pixel dark border and 25px Arial text; hover/focus turns it red, and active press uses the white-center-to-black radial gradient.
- The instructional label above Level 5's input (`Type the background color`) is level content, not part of the reusable password-control design. Do not copy or reserve space for that label unless the new level specification explicitly requests one.
- Level-specific colors may override the Level 5 palette when the specification requires them, but ordinary field and button dimensions, border proportions, font roles, and interaction states should remain consistent.
- Record whether Enter submits the form in the level specification. When allowed, Enter and GO must use the same validation path.

## Repetition and Composite Levels

Reunion levels should not merely copy earlier mechanics. Combine at least two techniques or alter the controls. The solution must remain logically inferable from knowledge acquired in earlier levels. Both techniques that return and techniques that do not return may serve as clues. A multi-scene level should switch state inside one level module and clean up events, timers, audio, and characters whenever the scene changes.

## Level 39 Fake-Level Canvas

Every fake-level card has a visible size of 400×300, but its contents must be authored inside `.level-39__fake-level-canvas` using the normal 800×600 coordinate system. The canvas applies `--fake-level-scale: 0.5`, so positions, font sizes, images, and interactive objects should use the same values they would use in a regular level and will automatically render at half size. Keep click and drag handlers on elements inside this canvas; do not compensate for the scale a second time in individual fake-level designs.

## Warp Zone

Each Warp Zone target receives a two-digit number based on its order in the main Warp Zone list. Completing a target level normally opens a checkpoint that displays its password and message. Entering the same password from the main menu returns the player to that checkpoint. `Next` normally opens the following level. Level-specific terminal checkpoints, such as Level 35, may route to a dedicated completion screen instead.

## Difficulty and Fairness

- Present every critical clue in an observable form at least once.
- Pixel-precise clicks must provide a verification aid such as coordinate hints or hover feedback.
- Long waits and long audio segments must provide visible progress or playback state.
- If failure intentionally creates a softlock, communicate it through a clearly dedicated failure screen.
- Verify that platforming scenes are completable with the current character jump height and acceleration.

## Level 37 Stateful Restart Pattern

Level 37 deliberately turns the Flash-style `Rewind` command into part of the puzzle. After the exact case-sensitive repair password is accepted, keep the screen in a troubleshooting state for 60 seconds. Only then may the custom context menu expose an effective `Rewind` action. That action stores the repaired-portal flag in the in-memory game session and returns to the main menu. Re-entering Level 37 during the same page session must show the repaired portal; a full browser reload intentionally clears the repair. Browser context-menu coordinates must be converted through the shared floating-position utility so scaled embeds remain aligned.
