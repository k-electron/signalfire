# Proposal

## Why

Stage 2 needs a finished run to become a score, a star count, and a progress document. Waiting lanes already finish with Integrity and Velocity, and the summary still stores score 0 and stars 0. Nothing keeps the best stars or decides which run logs stay.

## What Changes

- Score the events levels 0.1 and 1.1 emit. Each Hit is 10 points. LevelEnded adds 250 once. An Error adds nothing. The combo multiplier stays ×1, which is the only multiplier these levels use.
- Award 1, 2, or 3 stars when one finished run meets both bars for that count. Bars are the zone's Cadet bars. Zone 0 has no bars and awards 0 stars. A run that has not ended awards 0 stars.
- When a finished run misses the 1-star bar, the result names each missed bar with the measured value, the required value, and the shortfall. Integrity is listed before Velocity.
- Update that level's Cadet record from the finished run: best stars, best score, best net WPM, best accuracy, attempts, and failedSinceLastStar. An existing medal list and `calmUnlocked` stay as they are. Stars and bests never fall.
- From a set of run logs, keep the best run and the last 3 per level and tier. The result names the other run ids so a later checkpoint can drop them.
- **BREAKING:** a waiting-lanes summary no longer stores score 0 and stars 0. Finish and replay take the level's zone, store the computed score and stars, and return the miss report. The report is not a log field. Replay still recomputes it.

Out of this change: medals, Veteran and Ace bars, Signal lock above ×1, Overdrive hits, word-completion points, beacon and boss points, and the rule that a run with more than 50% excluded time awards no stars. Courier retention per duration and Daily Signal retention per day. Calm unlock, gates, ranks, and mods. The results screen. The level-end checkpoint that writes IndexedDB and deletes the dropped run ids.

## Capabilities

### New Capabilities

- `scoring`: Turns a finished run's events, Integrity, and Velocity into a score, Cadet stars, and a 1-star miss report. Updates the Cadet progress record. Keeps the best run and the last 3 per level and tier.

### Modified Capabilities

- `waiting-lanes`: The summary stores the score and stars from `scoring`, using the zone the caller passes. Finish and replay return the miss report. A tampered stored score still does not change the replay.

## Impact

- New modules under `src/core/scoring/`, with Node tests and fast-check properties. `src/core/sim/waiting-lanes.ts` calls them on finish and on replay. The run constructors take the zone.
- Unchanged: document schemas and fixtures, ports, `src/engine`, `src/platform`, `src/app`, `content/`, `package.json`, and the roadmap status. Stage 2 stays "Not started". The version 1 progress, run-log, and run-index schemas already have the fields this change fills.
- No new runtime dependency. No new dev dependency. fast-check and `@fast-check/vitest` are already installed.

## Principles served

- **P1.** Score is the sum of typing events. Stars come only from Integrity and Velocity.
- **P2.** Every star needs both bars. The accuracy bar is never optional.
- **P5.** Nothing in this change grants stars except those bars.
- **P6.** Recording a run keeps the best stars, the bests, and every medal id already stored.
- **P10.** A miss report states the measured value, the bar, and the shortfall.
- **P12.** The bars are the zone table in the curriculum.
- **P13.** This is the scoring slice of the walking skeleton. Medals, higher tiers, and the results screen stay later.
- P3, P4, P7, P8, P9, and P11 are not served. No gate, session plan, or account is added.

## Docs implemented

- `docs/ROADMAP.md` Stage 2: scoring, stars, and saved progress. The status cell stays "Not started". The results screen and the save-and-reload flow stay later changes.
- `docs/verticals/05-scoring-and-progression.md`: the points table for Hit and level completed, earning stars from both bars, zone 0 awarding none, stars never decreasing, finishing required, and the missed-bar result. Medals, Veteran, Ace, gates, mods, and rank stay later.
- `docs/verticals/02-curriculum.md`: Standards per zone, including zone 0 having no stars. The shipped zone files already store zone 1's bars and omit zone 0's.
- `docs/horizontals/05-data-model.md`: the Cadet fields on `progress.levels`, and run-log retention of the best and the last 3 per level and tier. Courier, Daily Signal, and the deferred fields stay later.
- `docs/horizontals/08-testing-and-dev-practices.md`: the scoring and progress property tests.
- `docs/horizontals/04-architecture.md`: the `src/core/scoring/` place. No edit.
- Cited, not changed: decision 0003 (the run id and the log tuple) and decision 0007 (the content hash already includes star bars).

## Departures

- None. The anti-exploit rule for excluded time stays in vertical 05 and is not applied here; the same deferral is already in the input-judging and waiting-lanes proposals. No doc edit and no decision record.

## Assumptions

- The scorer counts domain events. Each `Hit` adds 10. The first `LevelEnded` adds 250 and another adds nothing. `Error`, `WordComplete`, and any other event add 0. There is no combo state. Ten hits score 100, not a higher tier.
- Stars read the attempt counts and Velocity the judge already exposes. An accuracy bar is met when there is no first attempt, or when `correctFirstAttempts * 100 >= accuracyPercent * firstAttempts`. A speed bar is met when `netWpm >= wpm`. Both bars of a star must be met. The award is the highest such star, or 0. Comparison does not round.
- The caller passes the zone's `starBars`, or null when the zone omits them. Null awards 0 stars and names no missed bar. This change does not add the Veteran or Ace offsets, and it does not cap a bar at 99%.
- A run that has not ended awards 0 stars and names no missed bar, whether or not the numbers would have passed. Quitting does not update progress.
- The miss report covers only the 1-star bars, and only when the finished run awarded 0 stars on a zone that has bars. Each missed bar carries the measured value, the required value, and the shortfall (`required - measured`). Integrity is first. A run that earned 1 or more stars names no bar, including a bar it missed on the way to 2 or 3.
- Measured Integrity percent is 100 when there is no first attempt, otherwise `(100 * correctFirstAttempts) / firstAttempts`. Measured Velocity is the summary's net WPM.
- `recordRun` accepts a finished Cadet run and the current version 1 progress document. The caller supplies `updatedAt`. Core does not read the clock. `rev` becomes the previous `rev` plus 1. A `veteran` or `ace` run throws `RangeError` and leaves the document unchanged.
- The Cadet record uses `max` for stars, best score, best net WPM, and best accuracy. Attempts increase by 1. Medals and `calmUnlocked` are copied; a new record starts with an empty medal list and `calmUnlocked` false. Other levels and other tiers on the same level stay as they are.
- `failedSinceLastStar` resets to 0 when this run's stars are at least 1. It increases by 1 when this run's stars are 0 and the zone has bars. It stays unchanged when the zone has no bars, including a new zone 0 record, which starts at 0. "At least 1" is this run's award, not an increase in the stored best.
- The best run in a level and tier is the greatest `summary.score`. A tie keeps the later `startedAt`. A further tie keeps the lexicographically greater run id. The last 3 are the latest `startedAt`, with the same run-id tie break. The kept set is the union. A run that is both is stored once, with kind `best`. Every other kept run has kind `recent`. Fewer than three runs keeps all of them.
- Retention groups by level id and tier across every mode in the candidate list. It does not keep a separate Courier or Daily Signal set. Stage 2 does not produce those modes.
- The candidate list is the full set under consideration: every log already kept, plus the new log. Run ids in that list are unique. A duplicate throws `RangeError` and returns no kept set. This change returns the kept entries and the dropped run ids. It does not open IndexedDB.
- Waiting lanes pass the shipped zone whose id equals the level's `zoneId`. A mismatch throws `RangeError` and returns no log. Finish and replay both use that zone's bars. The stored summary gains the score and stars and still has no miss field. Replay ignores a tampered score.

## Constitution check

- **C1.** One new capability, `scoring`. The `waiting-lanes` delta only replaces the placeholder score and stars this change computes. Not a C1 exemption. Apply waits for approval.
- **C2.** Principles, docs, and departures are stated above.
- **C3.** Karim approves this proposal before apply. The agent does not merge and does not push to `main`.
- **C4.** Score, stars, progress, and retention are logic. Tests are written failing first. Every scenario maps to a test. The properties cover stars, recording, and retention.
- **C5.** Strict TypeScript. No `any`. No `@ts-ignore`.
- **C6.** No new decision record. The best-run tie break and `failedSinceLastStar` are assumptions above, not a new saved encoding.
- **C7.** No new runtime dependency. No new dev dependency.
- **C8.** No `AGENTS.md` edit. `src/AGENTS.md` already places scoring in `core/scoring` and requires test-first core.
- **C9.** Tests, the modules, the delta specs, and `tasks.md` land together. Schemas and the roadmap status stay as they are. Archive copies the deltas into `openspec/specs/`.
- **C10.** Non-trivial. The fresh-context review is a task.
