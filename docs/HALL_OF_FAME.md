# Hall of Fame Design

## Game Flow

After completing Level 35 normally or entering its Warp Zone password, pressing `Next` on the checkpoint opens the `Level 35 Winner` screen instead of Level 36. The Winner screen may send a nickname, hidden password, and completion message to a private Discord review channel. A report never changes the Hall of Fame automatically; the administrator must review it and edit the JSON file manually.

## Data File

The Hall of Fame source is `public/assets/data/hall-of-fame.json`. To add, edit, or remove a record, edit this file directly and redeploy the site. The browser, Options administrator panel, and Winner screen never modify the JSON file.

Use the following record format:

```json
{
  "entries": [
    {
      "id": 0,
      "nickname": "Writing guide stored in the file but hidden in the game.",
      "message": "Use this entry as a field-format reference.",
      "achievedAt": "2026-08-14T05:52:39.000Z"
    },
    {
      "id": 1,
      "nickname": "Winner",
      "message": "I survived.",
      "achievedAt": "2026-08-15T02:10:00.000Z"
    }
  ]
}
```

- `id`: A unique integer. Entry `0` is reserved for the writing guide and is never displayed. Real Hall of Fame records start at `1`.
- `nickname`: The displayed nickname, up to 32 characters.
- `message`: A short message or completion comment, up to 240 characters.
- `achievedAt`: An ISO 8601 UTC timestamp.

The UI displays `achievedAt` in `MM/DD/YYYY HH:mm:ss` format. Only entries with an integer `id` of `1` or greater appear in the Hall of Fame. Visible entries are automatically ranked from the earliest timestamp to the latest regardless of their order in the array. Entries with an invalid date or an incorrect required-field type are not displayed.

## Editing Example

August 14, 2026 at 14:52:39 Korea Standard Time converts to the following UTC timestamp:

```json
"achievedAt": "2026-08-14T05:52:39.000Z"
```

Escape quotation marks and line breaks correctly inside JSON strings. After editing the file, run `npm.cmd run build` to verify the JSON syntax and project build.

## Checklist

1. Both normal Level 35 completion and its Warp Zone route open the Winner screen.
2. No automatic registration form appears on the Winner screen.
3. The Hall of Fame reads the JSON file and displays entries by ascending completion time.
4. `NO ENTRIES YET` appears when the array is empty.
5. Nicknames and messages render as plain text, not HTML.
6. The JSON request returns HTTP 200 when deployed under a GitHub Pages repository subpath.
7. Entry `0` remains available as an editing guide but never appears in the Hall of Fame.
