# Proposal

## Why

Stage 2 plays levels 0.1 and 1.1, and those levels have nowhere to live. `content/` has no game data, core has no schemas for it, and `pnpm content:check` does not exist, so horizontal 10 still marks the content check pending.

## What Changes

- Zod schemas in `src/core` for a zone, a level, and a tuning file, covering the fields levels 0.1 and 1.1 use.
- Content files for zone 0 (Home Row Station), zone 1 (The Drift), level 0.1 (Twin Beacons), level 1.1 (First Light), and the zone 1 star bars. Zone 0 has no star bars.
- One waiting-lane tuning file. Levels read approach time and queue depth from it.
- A pure `contentVersion` per level: SHA-256 of a canonical form of the level, the zone star bars it uses, and the tuning it uses. Object key order and platform line endings do not change the hash. The same function serves the check and the app.
- `pnpm content:check` validates `content/` and fails on a malformed file. `pnpm check` runs it. CI runs it as a blocking Content job. Horizontal 10's pending note for that row goes away.
- The app imports the validated level 0.1 and level 1.1 definitions.

Out of this change: word lists, story text, prose, the blocklist, `content:words`, `content:hash`, other levels, gameplay, and ghost marking.

## Capabilities

### New Capabilities

- `content-pipeline`: bundled zones, levels, and tuning; the checks those files pass; each level's `contentVersion`; the app import of levels 0.1 and 1.1.

### Modified Capabilities

- `ci-pipeline`: a Content job runs `pnpm content:check` on pull requests and on `main`, and a failed install skips it with the other project jobs.
- `test-harness`: `pnpm check` runs `pnpm content:check` after lint and before test.
- `hermetic-toolchain`: a clean checkout's `pnpm check` includes `pnpm content:check`.

## Impact

- `src/core/schemas` and `src/core/content` for the schemas, the loader, and the hash. `src/app/content` imports the four JSON files and the tuning file and exports the loaded levels.
- `content/zones/`, `content/levels/`, `content/tuning/`.
- `tools/content/check.mjs`, a malformed fixture, `package.json` scripts, `tsconfig.json` (`allowImportingTsExtensions`, so the tool can import the core loader the way the token script imports `tokens.ts`).
- `.github/workflows/ci.yml`: a Content job, same shape as Lint, no browser install.
- Docs: horizontals 02, 05, 09, and 10; vertical 08's validation section; `content/AGENTS.md`; root `AGENTS.md`; decision `0007`.
- No new dependency. SHA-256 is hand-rolled in core (decision 0006). Core cannot import `node:crypto`. Web Crypto is a host API and async. A hash package would be a small thing this repo hand-rolls.

## Principles served

- **P1.** What the player types is the level. The units are the typing task.
- **P2.** Zone 1's star bars are the curriculum table: 92% at 6 WPM, then 95% at 9, then 97% at 12.
- **P4.** Zone 0 awards no stars. The first starred level is 1.1.
- **P8.** These two levels are letter patterns. Words wait for a later level.
- **P12.** The bars are the curriculum's numbers, stored as content.
- **P13.** Two levels of the walking skeleton, not the campaign.
- P3, P5, P6, P7, P9, P10, and P11 are not served. No earned progress is removed.

## Docs implemented

- Vertical 02: zone 0 and zone 1 names and roles, levels 0.1 and 1.1 (keys, type), zone 0 has no stars, zone 1 star bars.
- Vertical 03: five-phase anatomy, 0.1 medals none, 1.1 medals Flawless, Full Clear, and Clean Reach, mechanics lanes-wait and (0.1 only) Space pulse.
- Vertical 08: allowed keys only; a drill unit contains a focus key; pattern-drill shapes for `f` and `j`.
- Horizontal 05: bundled content, `contentVersion`, stable IDs (adds `tuning:<slug>`).
- Horizontal 09: `content/zones`, `content/levels`, `content/tuning`, and what `content:check` runs now.
- Horizontal 10: the content row blocks merge.
- Horizontal 02 and root `AGENTS.md`: the command exists and `pnpm check` runs it.

## Departures

- Horizontal 05's bundled-content table lists gate requirement, the full phase pressure controls, word lists, story, and prose. This change schemas the fields 0.1 and 1.1 use. The same change adds a now/later note to that table, on the pattern already used for saved-document fields. No decision record for the split.
- Horizontal 09, vertical 08, and `content/AGENTS.md` describe `content:check` as also running the blocklist, focus-share, repeat, first-letter, and length checks. This change runs schema validation, the key-set rule, and the drill rule (every unit contains a focus key). Those three docs gain a sentence that the other checks arrive with the content they cover. The blocklist stays out because no level here has words.
- `content:hash` stays a later command. `content:check` prints each level's `contentVersion`. Horizontal 09 keeps `content:hash` as a later script.

## Assumptions

- Zone and level display names and medals are the ones in verticals 02 and 03. Both zones use `machine:skiff`. Keys on these two levels are `f`, `j`, and space, stored as characters, not `char:` ids.
- A zone's key set is the keys its shipped levels may use. Zone 0 and zone 1 both list `f`, `j`, and space until a later level needs more.
- Star bars are integer percents and integer WPM. Zone 0 omits `starBars`. Every other zone includes them, strictly increasing, accuracy above 90 and at most 99.
- Waiting-lane tuning is approach 6 seconds and queue depth 1, shared by both levels. Per-phase pressure overrides wait until a level needs them.
- `contentVersion` hashes the level, that zone's star bars (`null` for zone 0), and the tuning object. It does not hash the zone name or the zone key set.
- Run logs still store `contentVersion` as any non-empty string. This change does not tighten that schema.
- Phase durations for these two lessons are shorter than the typical 2.5-minute anatomy. Vertical 03 calls those durations typical. Each lesson keeps five phases and stays under 4 minutes.
- The lesson text is the pattern-drill shapes in vertical 08 (repeat, alternate, pair, mirror), and 0.1's finale includes a space. Exact strings are fixed in `design.md`.
- `pnpm content:check` with no argument reads `content/`. An argument is a directory, used for the malformed fixture. Pre-push stays `pnpm test:unit`.
- The Content job does not install browsers.

## Constitution check

- **C1.** One new capability, `content-pipeline`. The three modified specs are the commands this change changes. Karim approves this proposal before apply.
- **C2.** Principles, docs, and departures are above.
- **C3.** Apply waits for approval. The agent does not merge and does not push to `main`.
- **C4.** Curriculum and level validation is a logic domain: tests are written failing first, and each scenario maps to a test. `content:check` and the CI job are shown by running the command. The malformed directory is a command run, not a test that only proves a file is absent.
- **C5.** Strict TypeScript. No new `any`.
- **C6.** Decision 0007 records the `contentVersion` canonical form. It is hard to change once a run log stores a hash.
- **C7.** No new dependency. The hash choice is justified above and in 0007.
- **C8.** Root `AGENTS.md` gains the command and drops `content:check` from the "later" sentence. `content/AGENTS.md` matches the checks this command runs. Both stay tool-agnostic.
- **C9.** Schemas, content, the command, CI, docs, the decision, specs, and `tasks.md` land together.
- **C10.** A fresh-context review checks the diff against this change, the docs named above, and the constitution.
