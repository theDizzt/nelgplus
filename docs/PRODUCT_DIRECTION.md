# Product Direction

## Goal

Never Ending Level Game ++ is a desktop web game that reinterprets the hostile and bizarre character of 2000s Flash puzzle games in HTML5. The final scope is 159 levels, ranging from Level -8 through Level 150. The game should run on Newgrounds, itch.io, and personal websites without requiring a separate plugin.

## Core Experience

1. Make the player distrust every element on the screen.
2. Treat the mouse, keyboard, dragging, right-click menus, copy and paste, and image or audio analysis as parts of the puzzle system.
3. Transform or betray solutions learned in earlier levels when they return later.
4. Preserve the Flash-era atmosphere through Perpetua titles, Courier subtitles, an 800×600 logical canvas, and deliberately dated UI design.
5. Even at high difficulty, the relationship between the clues and the solution should be explainable after the answer is discovered.

## Development Priorities

1. Eliminate progression-blocking bugs and coordinate or input errors.
2. Preserve exact success and failure conditions.
3. Keep the 800×600 logical screen consistent across variable embed sizes.
4. Make asset loading and audio controls reliable.
5. Preserve visual presentation consistent with the original game's atmosphere.
6. Maintain an efficient new-level production workflow.

## Intentional Friction vs. Bugs

Softlocks, hidden buttons, and invisible cursors are puzzles when explicitly included in the design. Misaligned click coordinates, valid answers that fail to progress, and controls that behave differently at different viewport sizes are bugs. Implement intentional failure states as named scenes in code and record their entry conditions in the walkthrough.

## Save Policy

Do not save normal level progress. `START GAME` must always begin at Level 1. Only player preferences unrelated to progression, such as Music and SFX settings, may persist. Warp Zones and administrator navigation are testing and re-entry tools, not automatic progress saves.
