# Design

## Context

See proposal.md for why. The behavior contracts are `specs/scoring/spec.md` and `specs/waiting-lanes/spec.md`.

`src/core/input/judge.ts` already exposes first-attempt counts, `integrityPercent`, and `velocityWpm`. `src/core/sim/waiting-lanes.ts` finishes with those measures and stores score 0 and stars 0. `src/core/schemas/progress.ts` and `src/core/schemas/run-index.ts` already accept the Cadet fields and the kept-run kinds. `src/core/storage/document-store.ts` can save a document and has no public delete for a kept run. Core cannot read the clock, the disk, or `Math.random`.

## Goals / Non-Goals

**Goals:**

- Four pure functions. Tests call them with data. Waiting lanes calls the score and star functions at finish and at replay.
- The same event list is what both the live finish and the replay score.
- A kept set a later checkpoint can save, including the run ids to drop.

**Non-Goals:**

- Opening IndexedDB, deleting keys, or building the run-index envelope. `retainRuns` returns entries and dropped ids.
- Calling `recordCadetRun` from the level runtime. The runtime does not have the progress document.
- A new summary field or a new schema version.

## Decisions

### One folder, four modules

`src/core/scoring/`. The judge stays the owner of Integrity and Velocity. Scoring does not import the sim.

| Module | Export | Does |
|---|---|---|
| `score.ts` | `scoreEvents` | Points from a `DomainEvent` list |
| `stars.ts` | `awardStars` | Cadet stars and the miss report |
| `record-run.ts` | `recordCadetRun` | Next version 1 progress document |
| `retention.ts` | `retainRuns` | Kept entries and dropped run ids |

Alternative: one module. Rejected. The four calls do not share state, and the property files sit next to the behavior they protect.

### Score is 10 per Hit and 250 once

`scoreEvents` adds 10 for every `Hit`. It adds 250 when any event has type `LevelEnded`, once. Every other type adds 0, including `Error` and `WordComplete`. There is no streak.

Alternative: score `correctCharacters` from the judge. Rejected. The points table is per Hit event, and the replay's event list is the source both paths can share.

### Stars use integer percents

`awardStars` takes `finished`, `correctFirstAttempts`, `firstAttempts`, `netWpm`, and `starBars` or `null`.

An accuracy bar is met when `firstAttempts === 0`, or when `correctFirstAttempts * 100 >= accuracyPercent * firstAttempts`. A speed bar is met when `netWpm >= wpm`. The award is 3, 2, or 1, the first of those whose both bars are met, otherwise 0. Not finished, or `starBars === null`, awards 0.

The miss report is empty unless the run is finished, bars exist, and the award is 0. Then each unmet 1-star bar is included, Integrity then Velocity. Measured Integrity is 100 when there is no first attempt, otherwise `(100 * correctFirstAttempts) / firstAttempts`. Measured Velocity is `netWpm`. Shortfall is required minus measured.

```ts
type MissedBar =
	| {
			readonly kind: "integrity";
			readonly measuredPercent: number;
			readonly neededPercent: number;
			readonly shortfallPercent: number;
	  }
	| {
			readonly kind: "velocity";
			readonly measuredWpm: number;
			readonly neededWpm: number;
			readonly shortfallWpm: number;
	  };
```

Alternative: compare the summary's accuracy fraction with `>= percent / 100`. Rejected. The integer product is the spec's rule and stays exact for the attempt counts a level can produce. The report still uses the division, which is the same formula as `integrityPercent`.

### Progress is a new document

`recordCadetRun(document, run, zoneHasStarBars, updatedAt)` returns a new document and does not mutate the argument. `run.tier` other than `"cadet"` throws `RangeError` before a document is built.

The new Cadet record copies medals and `calmUnlocked`. A missing record starts from `medals: []`, `calmUnlocked: false`, and `failedSinceLastStar: 0`. Stars, `bestScore`, `bestNetWpm`, and `bestAccuracy` use `Math.max` with this run. `attempts` increases by 1. `rev` increases by 1. `updatedAt` is the argument. Other level entries and the other tiers of this level are copied.

`failedSinceLastStar` becomes 0 when `run.stars >= 1` and the zone has bars, increases by 1 when `run.stars === 0` and the zone has bars, and is left as it was when the zone has no bars.

The function does not call Zod. The pinned test parses the result with the existing `progress` chain.

Alternative: recompute stars from the bars inside `recordCadetRun`. Rejected. The summary already holds the award, and this function's job is to keep the best of what was awarded.

### Retention is the union of two orderings

`retainRuns` groups by `levelId` and `tier`. Mode is copied onto the entry and is not part of the group. A repeated `runId` throws `RangeError`.

Later `startedAt` means the greater string. The greater `runId` is the greater string. Best is the greatest `score`, then later `startedAt`, then greater `runId`. The last 3 use later `startedAt`, then greater `runId`. The best entry's `kind` is `"best"`. Each other kept entry's `kind` is `"recent"`.

`kept` is sorted by level id, then `cadet`, `veteran`, `ace`, then run id. `dropped` is sorted by run id. The spec cares about membership and kind. The sort makes two calls deeply equal.

Alternative: keep Courier and Daily Signal in separate groups. Rejected for this change. The spec groups every mode by level and tier. No such logs exist yet.

### Waiting lanes pass the zone through

`createWaitingLanesRun(level, zone, tuning, seed, identity)` and `replayWaitingLanes(level, zone, tuning, log, outbox)`. The zone id must equal `level.zoneId`. Otherwise `RangeError`, no run, and replay returns no events. Replay still checks the engine major before it constructs the run.

The run stores `starBars`, which is `zone.starBars` or `null`. Every outbox emit also appends to a private event list. Finish appends `LevelEnded` there, then:

- `scoreEvents` on that list
- `awardStars` with the judge's attempt counts, `velocityWpm`, `finished: true`, and the stored bars
- accuracy as today: 1 when there is no first attempt, otherwise `integrityPercent / 100`

The returned finish value is `{ summary, missed, log }`. Replay returns `{ events, summary, missed }`. `missed` is not written into the log. The preflight `runLog.parse` in the constructor still uses a zero score and zero stars. That value only checks that the identity can be stored. Finish replaces it.

Call sites are `waiting-lanes.ts`, `waiting-lanes.test.ts`, and `waiting-lanes.property.test.ts`. The scenario title "No key-down scores nothing" stays. Its score assertion becomes 250.

### Property bounds

Stars, in `stars.property.test.ts`, using `@fast-check/vitest`:

- Three accuracy percents, strictly increasing integers from 91 through 99.
- Three WPM values, strictly increasing integers from 1 through 40.
- `correctFirstAttempts` from 0 through 30. `firstAttempts` is 0 only when correct is 0, otherwise from `correct` through `correct + 30`.
- `netWpm` is an integer from 0 through 80.
- Two finished measurements. Assert each award is an integer from 0 through 3. When the second ratio and `netWpm` are each at least the first, assert the second award is at least the first. Ratio is 1 when there is no first attempt.
- A second property draws `finished` as either boolean and bars as either that triple or `null`, and asserts the award is an integer from 0 through 3. `null` bars award 0.

Progress, in `record-run.property.test.ts`:

- Start from a Cadet record with `medal:flawless`, stars 0 through 3, finite bests, and attempts 0 through 5.
- Up to 8 runs. Each has stars 0 through 3, score 0 through 5000, accuracy in 0 through 1, net WPM 0 through 200, and a boolean for bars.
- One level id, `level:1.1`, tier `cadet`.
- After each call, stars and each best are at least the previous value, stars are at most 3, attempts are the previous attempts plus 1, and the medal is still there.

Retention, in `retention.property.test.ts`:

- Up to 8 logs. Level id is `level:0.1` or `level:1.1`. Tier is any of the three. Mode is any of the six schema modes. Score is 0 through 500. `startedAt` is `2026-10-12T20:` plus a minute `00` through `59`, then `:00.000Z`. Run ids are unique.
- The oracle groups, sorts by the two spec orderings, and compares the union's ids and kinds. A group shorter than 3 keeps every log. Dropped ids are the rest.

The pinned scenarios stay in the `*.test.ts` files, one test per scenario, including the shipped zone files through `acceptZone`.

## Risks / Trade-offs

- [The report's percent is a float, while the award uses an integer product] → The pinned counts divide evenly. A huge attempt count could display a percent that looks short of a bar the integer rule met. A waiting-lanes level does not produce that count.
- [A run with long pauses can still earn stars] → Velocity already drops the pause. The 50% rule stays deferred, as in the judging and lanes changes.
- [A Courier log shares the level's four slots] → No Courier log is produced in Stage 2. The later rule replaces this grouping.
- [Best is the highest score, so a messy high score can be the kept ghost] → Stars and the other bests live on the progress record. The log retention rule needs one total, and the points table is that total.
- [`5.9 < 6` is exact enough for the star boundary, and `6 - 5.9` is not a clean tenth] → The boundary scenario asserts stars only. Shortfall scenarios use 0, 2, 6, and 42.
- [Dropped ids are not deleted here] → The checkpoint that saves the index has to delete `run:<id>` for each dropped id. This change returns the ids.

## Migration Plan

No schema version and no `up` function. A version 1 log already has `score` and `stars`. There is no saved player log. Rollback is reverting the change. The two waiting-lanes test files are updated in the same change as the signature.

No open questions. The tie breaks, the failure counter, and the Courier grouping are assumptions in proposal.md and requirements in the scoring spec.
