# Design

## Context

`content/` has the agent rules and no game data. `src/core` has Zod schemas for saved documents only. `tools/tokens/generate.mjs` already imports a `.ts` file that has no relative imports. Core cannot import Node builtins. `pnpm check` is typecheck, lint, test, build. CI has no Content job. See proposal.md for why.

The behavior contract is `specs/content-pipeline/spec.md` and the three command deltas. This file records the shapes and the choices those specs leave open.

## Goals / Non-Goals

**Goals:**

- One loader accepts the shipped files and a malformed file, and both the command and the app call it.
- The lesson text and the phase durations are fixed here, so implementation does not invent a second curriculum.

**Non-Goals:**

- Playing the levels, drawing lanes, or marking ghosts.
- Running `content:check` inside `pnpm build`. The Build job must stay green when only the content check fails.

## Decisions

### Schemas stay data checks; the loader applies the cross-file rules

Zod schemas in `src/core/schemas/content/` accept one zone, one level, or one tuning value. `z.strictObject`, `z.int()`, and `z.enum`, matching the saved-document schemas. Unknown fields fail.

`src/core/content/load.ts` is the caller the specs describe. It accepts `{ path, value }[]`, normalizes strings, parses each file by its directory (`zones`, `levels`, `tuning`), checks ids, file names, key sets, and drill units, sorts allowed keys and focus keys, and attaches `contentVersion`. Zone keys stay in file order.

`acceptZone`, `acceptLevel`, and `acceptTuning` are the single-value entry points tests call. They share the schemas and the key sort with the loader. `contentVersionOf(level, starBars, tuning)` returns the digest. The loader uses it.

A content file has no `v` and no `contentVersion`. The version is derived. Run-log `contentVersion` stays any non-empty string.

Alternatives: a version chain, as for saves. Content is source, edited in the same change as its schema, so there is nothing to migrate. Storing the hash in the file. The file would have to exclude itself from the hash, and the app would still recompute it to be sure.

### Field names

Zone: `id`, `name`, `machine`, `keys`, optional `starBars`.

Star bars: `one`, `two`, `three`. Each bar: `accuracyPercent`, `wpm`. Both integers. Accuracy 91 through 99. WPM at least 1. Both series strictly increase. `zone:0` omits `starBars`. Any other zone includes it.

Level: `id`, `name`, `zoneId`, `type` (`intro` | `drill`), `tuningId`, `allowedKeys`, `focusKeys`, `mechanics`, `medals`, `phases`.

Mechanics: `lanes-wait` and `space-pulse` only. `lanes-wait` is required. Medals: zero to three unique `medal:` ids, order kept.

Phases: a tuple named `arrival`, `build`, `peak`, `breather`, `finale`. Each has `name`, `durationSeconds` (positive integer), and `units` (non-empty strings). Durations sum to at most 240.

A key is one Unicode code point, including space (`U+0020`). Allowed keys and focus keys are sorted by UTF-16 code unit on accept. Duplicates fail. Units, medals, and mechanics keep authored order.

Tuning: `id`, `approachSeconds` (finite number, 1.5 through 6), `queueDepth` (integer 1 through 6).

`tuning:<slug>` uses the same slug shape as other ids. File names:

| Kind | File | Id |
|---|---|---|
| Zone | `<n>-<slug>.json` | `zone:<n>` |
| Level | `<zone>-<n>-<slug>.json` | `level:<zone>.<n>` |
| Tuning | `<slug>.json` | `tuning:<slug>` |

The number text in the file name equals the number text in the id (`0`, not `00`). The slug is not checked against the display name.

Alternatives: `char:` ids for keys. Units are the characters the player types, and the key check compares characters. Percent stored as `0.92`. Star checks are decisions, and the curriculum numbers are integers, so the schema uses integers.

### contentVersion

Decision record `docs/decisions/0007-content-version-hash.md`, status accepted, dated the day it is written. The record says:

- Context: a run log stores `contentVersion` so a later change can mark ghosts from an older level. The hash is permanent once a log stores it. Core cannot import `node:crypto`.
- Decision: lowercase hex SHA-256 (FIPS 180-4) of the UTF-8 bytes of the canonical JSON of `{ level, starBars, tuning }`. `starBars` is `null` when the zone omits them. Canonical JSON sorts object keys by UTF-16 code unit, keeps array order, and uses no insignificant whitespace. Before encoding, `\r\n` and then remaining `\r` in every string become `\n`. The level in that object is the accepted level (keys already sorted). The zone name and the zone key set are not inputs.
- Consequences: changing the canonical form needs a new decision record. Logs that stored a hash would not match after that change. None exist yet. No new dependency.

`src/core/content/sha256.ts` is the hash. `src/core/content/canonical.ts` is the encoding. Tests pin the digests in the spec, including SHA-256 of the empty input and of `{"a":"x","b":1}`.

Alternatives: hash the file bytes. Key order and CRLF would change the version. `crypto.subtle`. Async, and a host API. An npm hash package. Decision 0006 says to hand-roll the small thing.

### The command and the app both call the loader

`tools/content/check.mjs` reads every entry in the three directories with `node:fs`, `JSON.parse`s each `.json` file, and calls the loader with those values plus any non-JSON path and a null value. The loader ignores a path that does not end in `.json`. No argument means `content/` at the repo root. One argument is another root. A missing `zones`, `levels`, or `tuning` directory fails and names it.

Success prints one line per level to stdout, sorted by level id: `level:0.1 <64 hex>`. Failure prints each error path to stderr and exits 1. The path is relative to the root it was given, so the file name is in the line.

`package.json`: `"content:check": "node tools/content/check.mjs"`. `check` becomes typecheck, lint, `content:check`, test, build. `build` stays `pnpm tokens && vite build`.

The loader's relative imports use `.ts` extensions, including `../ids.ts`. `tsconfig.json` sets `allowImportingTsExtensions`. Node 26 loads that graph from the `.mjs` tool the same way the token script loads `tokens.ts`. A one-line comment on the loader's first relative import says why the extensions are there. Other core files stay extensionless.

`src/app/content/campaign.ts` imports the five JSON files with `with { type: "json" }` and calls the loader. If the load fails it throws. It exports the loaded campaign. No screen imports it in this change.

The malformed fixture is `tools/content/fixtures/malformed/`: a valid `zones/0-home-row-station.json`, a valid `tuning/waiting-lanes.json`, and `levels/0-1-twin-beacons.json` whose body is `{ "id": "not-a-level" }`. `pnpm content:check tools/content/fixtures/malformed` exits non-zero and the output includes `0-1-twin-beacons.json`.

Alternatives: a second copy of the schemas in the `.mjs` tool. The hash and the checks would drift. Running the check only as a Vitest file. The command the docs name would not exist.

### Shipped files

Biome formats these. Values:

`content/zones/0-home-row-station.json`: `zone:0`, `Home Row Station`, `machine:skiff`, keys `f`, `j`, space. No `starBars`.

`content/zones/1-the-drift.json`: `zone:1`, `The Drift`, `machine:skiff`, the same keys, bars 92/6, 95/9, 97/12.

`content/tuning/waiting-lanes.json`: `tuning:waiting-lanes`, approach `6`, queue depth `1`.

Both levels use that tuning id, allowed keys `f`, `j`, space, and the five durations 8, 12, 12, 8, 10.

`content/levels/0-1-twin-beacons.json` (`level:0.1`, Twin Beacons, intro, focus `f`, `j`, space, mechanics `lanes-wait` then `space-pulse`, medals `[]`):

| Phase | Units |
|---|---|
| arrival | `fff`, `jjj` |
| build | `fjf`, `jfj` |
| peak | `fjfj`, `jfjf` |
| breather | `f j`, `j f` |
| finale | `fj `, `jf ` |

`content/levels/1-1-first-light.json` (`level:1.1`, First Light, drill, focus `f`, `j`, mechanics `lanes-wait`, medals `medal:flawless`, `medal:full-clear`, `medal:clean-reach`):

| Phase | Units |
|---|---|
| arrival | `fff`, `jjj` |
| build | `fjf jfj`, `f j f j` |
| peak | `fjfj jfjf`, `ff jj fj` |
| breather | `fj jf` |
| finale | `fjf jfj fj` |

These are the pattern-drill shapes from vertical 08 (repeat, alternate, pair, mirror). 0.1's finale includes a space. 1.1 has no space-only unit.

### CI

Add a `content` job to `.github/workflows/ci.yml`, display name `Content`. Copy the Lint job's checkout, pnpm setup, store cache, frozen install, `if`, `needs`, timeout, and permissions. Replace the lint step with `pnpm content:check`. Do not add a browser cache or `pnpm browsers:install`.

### Docs

- Horizontal 10: the Content row's third column becomes `yes`. Delete `pending; the command does not exist` on that row. The bundle row stays pending.
- Horizontal 09: `content:check` runs the schema, the key-set rule, and the drill focus rule. Blocklist, focus-share percent, repeat, first-letter, and length checks arrive with the content they cover. `content:hash` stays a later script.
- Vertical 08, under Validation tools: the same sentence.
- `content/AGENTS.md`: the check bullet matches those three checks, plus the same later sentence.
- Horizontal 05: add `tuning:<slug>` to Stable IDs, with example `tuning:waiting-lanes`. Under Bundled content, say what the schemas cover now (the fields in this design) and what waits (gate, the other pressure controls, other mechanics and level types, word lists, story, prose). Point `contentVersion` at decision 0007.
- Horizontal 04: add `src/core/content` to the sentence that lists directories that exist. Change "validated against `core/schemas` at build time" so it names `pnpm content:check` before a build is trusted, and a parse again when the app loads the files.
- Horizontal 02 and root `AGENTS.md`: add `pnpm content:check`, include it in the `pnpm check` row, and remove it from the "later" sentence. `AGENTS.md` stays under 200 lines.
- `docs/decisions/README.md`: row for 0007.

## Risks / Trade-offs

- [A hand-rolled SHA-256 disagrees with FIPS 180-4] → The empty digest and the `{"a":"x","b":1}` digest are tests. A mismatch fails before any level hash is trusted.
- [The preimage is too small, so a zone-key edit leaves an old ghost looking current] → The preimage is the level, the bars, and the tuning, which is what the level plays with. Recorded in 0007.
- [The preimage is too large, so a sector rename invalidates ghosts] → The sector name is not an input. A bar edit does change the version, which is what we want.
- [Day-1 lessons are short, and the first playtest wants different units] → The units are content. Editing them changes `contentVersion`. No run log stores one yet.
- [An extensionless import inside the loader breaks the Node command while Vitest still passes] → The comment says why the extensions are there. `pnpm content:check` is the proof.
- [`pnpm build` also runs the content check, so the CI "only failure" scenario cannot be true] → `build` does not call `content:check`. CI runs that command only in the Content job.

## Migration Plan

No saved document changes shape. Existing run logs keep `contentVersion: "demo"` in tests. Rollback is reverting the change. Nothing in a player's save depends on this hash yet.

## Open Questions

None.
