# Horizontal 05: Data Model and Migrations

The shape of everything the game saves and loads, how IDs work, and how saved data survives schema changes.

## Decisions

| Topic | Decision |
|---|---|
| Save structure | Several documents, each with its own schema version |
| Schemas | Zod, in `src/core/schemas` |
| Migrations | A hand-rolled chain in `src/core/schemas`: versioned Zod schemas and one-step `up` functions |
| Run logs | Per level: best run and last 3; plus best Courier and Daily Signal runs |
| Content edits | Stars and medals are kept; ghosts recorded on older content are marked stale |

## Principles

- **Store facts, derive views.** Save what happened (runs, stars, attempts). Compute rank, mastery state, weekly-goal lights, and gate progress from the facts at load time, so they can never fall out of sync.
- **IDs are forever.** IDs are never renamed or reused. Retired things are marked deprecated, not deleted.
- **Never lose progress.** No migration may drop stars, medals, mods, or Keylings (P6).
- **Validate at the edges.** Everything read from storage, the cloud, or content files is parsed with Zod before use.

## Stable IDs

| Kind | Format | Example |
|---|---|---|
| Zone | `zone:<n>` | `zone:2` |
| Level | `level:<zone>.<n>` | `level:2.4` |
| Side level | `side:<zone>.<slug>` | `side:3.blackout` |
| Tier | `cadet` · `veteran` · `ace` | |
| Character (key mastery, Keylings) | `char:<character>` | `char:e`, `char:?` |
| Medal | `medal:<slug>` | `medal:flawless` |
| Machine | `machine:<slug>` | `machine:dart` |
| Mod | `mod:<slug>` | `mod:reach-boosters` |
| Achievement | `achievement:<slug>` | `achievement:first-light` |
| Dispatch template | `dispatch:<slug>` | `dispatch:earn-medals` |
| Codex entry | `codex:<slug>` | `codex:the-hush` |
| Cosmetic | `cosmetic:<kind>.<slug>` | `cosmetic:trail.river` |
| Run | ULID (sortable by time) | `01J9Z…` |

## Document envelope

Every saved document shares an envelope:

| Field | Meaning |
|---|---|
| `v` | Schema version of this document type |
| `updatedAt` | ISO timestamp of the last local change |
| `rev` | Revision counter used by sync (Persistence horizontal) |

## Documents

### `profile`

| Field | Notes |
|---|---|
| `callSign` | Chosen at onboarding |
| `createdAt` | |
| `onboardingComplete` | |
| `preferredThumb` | `left` · `right` · `either` (guidance only) |
| `equipped` | Equipped cosmetics by slot (paint, trail, Dash accessory, title) |

### `settings`

Audio volumes (master, music, effects, voices), effects intensity, fullscreen preference.

### `progress`

| Field | Notes |
|---|---|
| `levels` | Map of level ID → per-tier record |
| `levels[id][tier]` | `stars` (0–3), `medals` (IDs), `bestScore`, `bestNetWpm`, `bestAccuracy`, `attempts`, `failedSinceLastStar`, `calmUnlocked` |
| `barriersBroken` | Zone IDs whose Static barrier is broken |
| `repairStars` | Map of zone ID → repair stars earned (max 3) |
| `mods` | Earned mod IDs with the date earned |
| `keylingsRescued` | Character IDs |
| `codexUnlocked` | Codex entry IDs |
| `storyFlags` | Scenes seen, onboarding steps done |

Derived (not stored): total stars, rank, unlocked levels, current machine, gate progress.

Version 1 stores the envelope and the fields implemented in `src/core/schemas`. These documented fields wait:

| Field | Stage |
|---|---|
| Run-log retention (best and last 3, Courier, Daily Signal) | 2 |
| `progress.barriersBroken`, `progress.repairStars`, the telemetry document, the meta document, `syncState` | 3 |
| `progress.storyFlags` | 5 |
| `profile.equipped`, `progress.mods`, `progress.keylingsRescued`, `progress.codexUnlocked` | 6 |

### `telemetry`

| Field | Notes |
|---|---|
| `keys` | Map of character ID → key record |
| `keys[id]` | `attempts`, `errors`, `smoothedMs`, `recent` (last 100 attempts: correct flag and time), `confusions` (top 5), `lastPracticed` |
| `bigrams` | Top 300 bigrams: `attempts`, `errors`, `smoothedMs` |
| `days` | One summary per day played: active time, runs, average and best net WPM, accuracy, rhythm |
| `runSummaries` | Per level: last 10 summaries plus the best |
| `lifetime` | Characters typed, active time, days practiced, personal bests |

Derived: mastery states, finger stats, insights, weekly-goal lights.

### `meta`

| Field | Notes |
|---|---|
| `dispatches` | Today's date, three dispatch instances with targets and progress |
| `commendations` | Total earned; track position derived from it |
| `achievements` | Unlocked achievement IDs with dates |
| `cosmeticsOwned` | Cosmetic IDs |

### `runLogs`

One document per kept run, plus an index.

| Field | Notes |
|---|---|
| `runId` | ULID |
| `levelId`, `tier`, `mode` | Mode: campaign, repair, systems check, Courier, Daily Signal, Deep Archive |
| `seed` | Seed used for all randomness in the run |
| `contentVersion` | Hash of the level definition and content used |
| `engineVersion` | `major.minor.patch`. Replays require a matching major version |
| `startedAt` | |
| `inputs` | Compact list of `[stepDelta, character, flags]` for every key down and key up; flags hold Shift side and key-up |
| `summary` | The run summary, so the log can be shown without replaying it |

**Retention**, enforced after every run:

- Per level and tier: the best run and the last 3.
- Best Courier run per duration; best Daily Signal run per day for the last 7 days.
- Everything else is pruned.

**Size estimate:** a 3-minute level at 30 WPM has about 450 key presses and 450 releases; at three small numbers each, a log is roughly 10–15 KB as JSON before compression.

### `syncState`

Device ID and per-document sync bookkeeping. Defined in the Persistence horizontal.

## Bundled content (not saved)

Game data in `content/` is validated against Zod schemas at build time:

| Content | Schema covers |
|---|---|
| Zones | ID, sector name, key set, star bars, gate requirement, machine |
| Levels | ID, type, focus keys, mechanics, phases (duration, content mix, pressure controls), medals |
| Word lists | Curated lists per zone, blocklist |
| Story | Dialogue lines with level IDs and speaker |
| Prose | Passages for Zones 6–9 and endless modes |

Each level's `contentVersion` is a hash of its definition and the content it draws on. Changing a level changes its hash.

### When content changes

- Stars, medals, and best scores already earned are kept.
- Run logs recorded on an older `contentVersion` are marked **previous version**: they still show in history but aren't used as ghosts.
- The next qualifying run becomes the new ghost.

## Migrations

### How they work

- Each document type is a versioned chain in `src/core/schemas`. Every version has a Zod schema; every version after the first has an `up` function that converts the previous version.
- On load, each document is parsed, which migrates old versions to the latest. The migrated document is written back on the next save.
- Old version definitions are never deleted.
- `up` functions are pure: no I/O, no randomness, no current time.

### Testing

- Every document version has a fixture file in `src/core/schemas/fixtures/<document>/v<n>.json`.
- Tests migrate every fixture to the latest version and validate it.
- Adding a version requires adding its fixture (constitution C4: migrations are test-first).

### Data from a newer version

If a document's version is newer than this build understands (for example, cloud data saved by a newer release on another device):

- The game does not write that document.
- The player sees: "Your progress was saved by a newer version. Refresh to update." The build is reloaded to pick up the latest version.

### Invalid data

A value is invalid only when it fails the schema of its own version. A migration that cannot finish is not invalid: the store leaves every key unchanged and does not quarantine or delete the document.

If a document fails its own version's schema:

1. The raw data is appended at the next `quarantine:<key>:<n>` slot, starting at 0. An earlier slot is left as it is.
2. The last good backup is loaded (Persistence horizontal keeps backups). An invalid value is not written into the backup ring.
3. The player sees a short notice; the quarantined data can be attached to a bug report.

## Risk

verzod 0.5.1 is not adopted. Its published peer is Zod 3. The chain is in `src/core/schemas`.

## Sources

- [verzod](https://cdn.jsdelivr.net/npm/verzod/README.md), considered and not adopted
- [Save migrations that survive updates](https://crux.supercraft.host/blog/player-data-save-migrations-every-patch/)
- [@wentools/schema-migrations](https://jsr.io/@wentools/schema-migrations), considered
- [Old clients and incompatible schemas (Triplit discussion)](https://github.com/aspen-cloud/triplit/discussions/92)
