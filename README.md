# Never Ending Level Game ++

Desktop HTML5 puzzle game scaffold for Newgrounds.

## Development

On Windows, double-click `run-game.bat` to install missing packages, start the
development server, and open the game in a browser.

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

Upload the **contents** of `dist/` as a ZIP to Newgrounds. `index.html` must be
at the root of the ZIP.

## Adding fonts

The bundled webfont files live under:

- `public/assets/fonts/perpetua/`
- `public/assets/fonts/courier/`
- `public/assets/fonts/arial/`

The matching `@font-face` declarations are in `src/styles/global.css`.

## Adding levels

Create a level module under `src/levels/` and add it to
`src/levels/registry.ts`. Every level receives a scoped context. Register
events and timers through that context so they are removed automatically when
the player changes levels.

Optional level music and sound effects are available through `context.audio`.

Open `?debug=1` during development to display previous/next level controls.
