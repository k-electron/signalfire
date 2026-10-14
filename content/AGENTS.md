# content

Game data as JSON: zones, levels, word lists, story, prose, tuning values.

Design: `docs/verticals/02-curriculum.md`, `docs/verticals/03-level-design.md`, `docs/verticals/08-text-content.md`, `docs/horizontals/05-data-model.md`.

## Rules

- Every file must pass `pnpm content:check` (schemas, the key-set rule, and the drill rule that every unit contains a focus key). Blocklist, focus-share percent, repeat, first-letter, and length checks arrive with the content they cover.
- IDs are permanent. Never rename or reuse a level, zone, or word-list ID.
- Text in a level uses only keys unlocked by that level. When a line needs one unlearned letter, mark it pre-filled instead of rewriting the line.
- Shipped word lists come from SCOWL only, filtered through the blocklist. Word lists under 500 entries need human review; say so in the pull request.
- All story text and prose is original. Never copy text from books, songs, articles, or other games.
- Dash speaks only with letters the player has unlocked (punctuation is free).
- Changing a level changes its `contentVersion`; old ghosts become "previous version". Mention this in the pull request.
- Tuning values change only in `content/tuning/`, never as constants in code.
