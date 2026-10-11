# Horizontal 09: Dev Tooling

Tools that make the game fast to build, tune, and debug, for agents and for Karim.

## Decisions

| Topic | Decision |
|---|---|
| In-game debug tools | Overlay, command palette, and Level Lab; dev builds only |
| Tuning panel | Tweakpane; dev builds only |
| Content format | JSON in `content/`, validated by Zod at build, hot-reloaded in dev |
| Claude Code hooks | Auto-format after edits |

## Dev-only by construction

- All debug code lives under `src/app/dev/` and `src/engine/dev/` and is imported only behind `import.meta.env.DEV`.
- Production builds exclude it entirely; CI checks the production bundle contains no dev modules.
- In dev builds, `Ctrl+Shift+D` toggles the debug overlay and `Ctrl+Shift+P` opens the command palette. These avoid every key the game teaches.

## Debug overlay

A small panel in a screen corner showing:

| Item | Shows |
|---|---|
| FPS | Current and 1-second minimum |
| Sim | Current step, steps per frame, accumulator |
| Input latency | Time from key event to judgment, and to the next rendered frame |
| Active character | Expected character, mode, combo tier |
| Event log | Last 20 domain events (`Hit`, `Error`, `Miss`, ...) |
| Level | ID, tier, seed, phase, elapsed time |
| Sync | Sync machine state and dirty documents |

## Command palette

| Command | Does |
|---|---|
| `unlock all` | Unlock every zone and level |
| `set stars <level> <tier> <n>` | Set a level's stars |
| `grant <medal\|mod\|keyling\|achievement> <id>` | Grant an item |
| `goto <level>` | Jump straight into a level |
| `time scale <x>` | Run the simulation at 0.25×–4× |
| `days away <n>` | Pretend the player was away n days (to test systems check) |
| `reset <document>` | Reset one saved document |
| `export bug report` | Download recent run logs, errors, and documents as one file |
| `sync now` / `sync offline` | Force a sync, or simulate being offline |

## Level Lab

A dev screen for building and checking levels without playing through the map.

- Pick any level, tier, mode (normal or Calm), and **seed**.
- Play it, or watch it run with no input to see spawn patterns and pacing.
- Step the simulation one frame at a time; pause on any phase.
- Show a timeline of phases and spawns, with the level's difficulty controls (queue depth, approach speed, Static share) per phase.
- Load a run log file and replay it exactly (Architecture: determinism and replay).
- Edit the level's JSON and see changes on reload (hot reload).

## Tuning panel (Tweakpane)

- Exposes engine and UI values live: approach speeds, queue depth, Static note duration, particle budgets, effect intensities, audio layer levels, combo thresholds.
- Each panel folder maps to a tuning file in `content/tuning/`. A "copy values" button outputs JSON to paste back into the file, so tuned values are committed, not lost.
- Never shipped in production.

## Content tooling

| Script | Does |
|---|---|
| `pnpm content:check` | Validates all content against Zod schemas; runs the key-set, blocklist, focus-coverage, repeat, first-letter, and length checks (Text Content vertical) |
| `pnpm content:words` | Builds curated word lists from SCOWL for each zone's key set, applies the blocklist, and writes candidates for human review |
| `pnpm tokens` | Regenerates CSS variables from `tokens.ts` (Design System horizontal) |
| `pnpm content:hash` | Prints each level's `contentVersion` hash (Data Model horizontal) |

Content files in `content/`:

| Folder | Contents |
|---|---|
| `content/zones/` | One JSON file per zone |
| `content/levels/` | One JSON file per level |
| `content/words/` | Curated word lists, blocklist |
| `content/story/` | Dialogue lines by level |
| `content/prose/` | Passages |
| `content/tuning/` | Tuning values exposed in the panel |

In dev, editing any content file hot-reloads the running game.

## Claude Code hooks

`.claude/settings.json` defines one hook:

| Event | Matcher | Action |
|---|---|---|
| `PostToolUse` | `Edit\|Write` | Run Biome format and safe fixes on the edited file |

This is a convenience for Claude Code only. Formatting is guaranteed for every agent by the Lefthook pre-commit hook and CI. Other rules (protected files, git safety) rely on the constitution, Lefthook, branch protection, and CI.

## Sources

- [Claude Code hooks guide](https://code.claude.com/docs/en/hooks-guide)
- [Debug GUI libraries overview](https://techstacktools.substack.com/p/tech-stack-collection-share-vol6)
- [lil-gui vs dat.gui discussion](https://discourse.threejs.org/t/lib-why-changed-dat-gui-to-lil-gui/62124)
