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

## Level Heading Standard

Every level title and subtitle must use the same position and text size as Level 1. Use the shared `.level-heading`, `.level-heading__number`, and `.level-heading h1` styles: the heading begins at `top: 32px`, the level title is `116px` with `0.9` line height, and the subtitle is `30px` with a `6px` top margin and `1` line height. Level-specific styles may change colors, fonts, effects, or content when required, but must not override these heading coordinates, font sizes, margins, or line heights.

Reference screenshots are visual guides for backgrounds, body copy, objects, color, and overall atmosphere only. A screenshot's level-title or subtitle placement and scale must never override the standard heading guide. Unless an explicit request specifically changes the heading standard itself, keep every level title and subtitle at the Level 1 position and size even when the reference image shows a different design.

## Language and Copy

Use English for all player-facing game content unless a level specification or explicit request requires another language. This rule applies to visible text, hidden clues, background code, error messages, labels, buttons, and accessibility text. Do not introduce non-English game copy merely for decoration or atmosphere without an explicit requirement.

## Walkthrough Maintenance

Building and registering a level is not complete until its solution has been added to the root `walkthrough.md` file in Korean. This documentation requirement is an explicit exception to the English player-facing copy rule above. The walkthrough entry must describe the full playable route, including scene order, clue interpretation, required interactions or inputs, exact passwords and case rules, failure conditions and recovery paths, timed mechanics, and any Warp Zone password introduced by the level.

Whenever a level's mechanics, timing, password, scene flow, success condition, or failure behavior changes, update its Korean walkthrough in the same change so that the document continues to match the shipped implementation. Do not leave a newly built level or materially changed solution undocumented, and do not mark the level work complete until the walkthrough entry has been checked against the current code.

## Input and Passwords

- Tab-key navigation must be disabled in every level. Use the shared `blockTabNavigation` helper so pressing Tab does not move focus between level controls or activate them.
- Passwords are case-sensitive and preserve leading and trailing whitespace unless a level explicitly says otherwise.
- Use `attachStarMaskedInput` for star-masked password fields.
- Puzzles that distinguish direct typing from paste input must clearly separate the roles of `keydown`, `beforeinput`, and `paste`.
- Password controls use the Level 8 design as their baseline. Follow the detailed specification below and apply additional user or level-specific requests to that baseline.
- Record whether Enter submits the form in the level specification. When allowed, Enter and GO must use the same validation path.
- An incorrect password must keep the player's entered value in the field while the wrong-answer animation, color, sound, and focus behavior play. Do not call `clear()` or assign an empty/default value in an incorrect-answer branch unless a level specification explicitly defines clearing the answer as part of that puzzle. Clearing after a successfully consumed answer in a multi-step password puzzle is still allowed.

### Password Control Baseline — Level 8

Build new password controls **using the Level 8 design as the baseline, then modify that design to reflect additional requests.** When a request specifies a different position, size, color, font, instructional text, or input behavior, change those properties and preserve the defaults below for properties that are not addressed. Keep level-specific changes local to that level unless the request explicitly changes the shared baseline.

Reference implementations: `src/levels/level08.ts`, `src/styles/levels/level08.css`, `src/styles/components/password-input.css`, and `src/core/StarMaskedInput.ts`. All measurements below use the 800×600 logical screen. Dimensions include borders and padding through `box-sizing: border-box`.

#### Layout

- Arrange the input on the left and the GO button on the right in a single horizontal row.
- Position the form near the bottom of the screen with `position: absolute; bottom: 33px; left: 0; width: 100%`.
- Use `display: flex; align-items: center; justify-content: center; gap: 10px` to center the pair horizontally and align their vertical centers.
- The combined width is 236px: a 174px input, a 10px gap, and a 52px button. On the baseline screen, the input's top-left corner is `(282, 524)` and the button's top-left corner is `(466, 525.5)`.
- The default layout has no instructional label or placeholder. Add them only when requested, and do not reserve empty space for absent text. Level 8's pink screen background and mazes are not part of the shared password control baseline.

#### Input Field

| Property | Default |
| --- | --- |
| Shared class | `nelg-password-input` |
| Dimensions | Width `174px`, height `43px` |
| Padding | `4px` vertically, `8px` horizontally |
| Text / background | Black `#000` / white `#fff` |
| Border | `3px solid #111` |
| Corners | Square, with `border-radius: 0` |
| Inset shadow | `inset 1px 1px 2px rgb(0 0 0 / 18%)` |
| Font family | `"NELG Perpetua", Perpetua, Georgia, "Times New Roman", serif` |
| Font size | `25px` |
| Focus | `outline: none` in both default and focused states |
| Transition | `background 80ms ease, translate 80ms ease` |

Use `type="text"` with `attachStarMaskedInput` to display a string of `*` characters matching the actual value's length. Validate the value returned by `getValue()`, not the visible masked string. Preserve letter case and leading and trailing whitespace by default, and do not add an arbitrary length limit.

Set `autocomplete="off"` on both the form and input. Set `autocapitalize="off"`, `aria-autocomplete="none"`, `spellcheck="false"`, `aria-label="Password"`, and `data-allow-select` on the input. As in Level 8, use `data-form-type="other"`, `data-lpignore="true"`, and `data-1p-ignore="true"` to discourage password manager interference, and assign a unique `id` and `name` for each level.

#### GO Button

| Property | Default |
| --- | --- |
| Element / label | `button type="submit"` / `GO` |
| Dimensions / padding | Width `52px`, height `40px`, `padding: 0` |
| Text / background | `#111` / yellow `#ffff00` |
| Border / corners | `3px solid #111` / `border-radius: 0` |
| Font family | `"NELG Arial", Arial, sans-serif` |
| Font size / line height | `25px` / `1` |
| Cursor | `pointer` |
| Hover / keyboard focus | Background `#f01818` and no outline for `:hover` and `:focus-visible` on an enabled button |
| While pressed | `radial-gradient(circle at center, #fff 0 30%, #777 54%, #111 76%, #000 100%)` |
| Disabled state | `cursor: wait; opacity: 0.65`; exclude hover and active color effects |

#### Submission and Incorrect-Answer Feedback

- Focus the input on entry by default. Enter and GO must use the same form submission path and prevent the browser's native navigation. Repeated key events from holding Enter must not resubmit the form.
- Guard against duplicate execution and disable the button while processing a submission. Release the guard and re-enable the button after an ordinary incorrect answer that leaves the player on the current screen.
- For an ordinary incorrect answer, preserve the entered value and return focus to the input. Apply `is-wrong` to change the background to `#ff6d87` and shift the field right with `translate: 6px 0`. Remove the state after `360ms` to restore the original position and white background.
- Restart feedback on every incorrect submission, including rapid repeated submissions. This is a shared QA requirement; reusable implementations must clear the previous reset timer and state to guarantee it.
- Explicitly requested puzzle rules, such as failure destinations, input clearing, or Enter restrictions, take precedence. Referencing the design does not mean copying Level 8's answer or special-mode logic.

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
