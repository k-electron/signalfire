# Proposal

## Why

Stage 2's walking skeleton needs a real level runtime. The kernel still steps a stand-in: each step draws a target from `a`, `b`, and `c`, net WPM stays 0, and a log is produced by re-simulating a list of inputs the caller already has. Levels 0.1 and 1.1 are loaded and keystrokes are judged, and nothing yet spawns their notes, waits at the hit line, or records the run that is actually being played.

## What Changes

- Spawn notes for the shipped levels 0.1 and 1.1 from that level's phases and the run seed. Every note is a character of a unit in the phase that was current when the unit was picked, so it is one of the level's allowed keys.
- A note approaches, then waits at the hit line. The player can hit it while it approaches and while it waits. An unhit note stays the active character. The level does not emit a miss.
- The level plays for the sum of its phase durations and emits `LevelEnded` at its last step, including when every key was wrong. Zone 0 has no fail state: that ending is a completed run, and its stars stay 0.
- The summary on that ending uses the existing judge: accuracy is Integrity as a fraction from 0 through 1, and net WPM is Velocity. Score stays 0, stars stay 0, and medals stay empty.
- The live run appends each input as it is applied. Finishing returns a version 1 run log. Replaying that log through the same level and tuning reproduces the events and the summary.
- **BREAKING:** remove `createStandInRun`, `recordStandInRun`, and `replayStandInRun`, and remove their labeled tests. The `waiting-lanes` fork replaces the `stand-in` fork.

Out of this change: flowing lanes and misses, word convoys, Signal lock, Overdrive, shield, beacons, bosses, and the points table. Star bars, medals, and the rule that a run with more than 50% excluded time awards no stars. DOM capture, rendering, audio, the HUD, and the results screen. Saving the log, retention, and the run index. Pause on focus loss. The letter-pair generator and practice-mission templates.

## Capabilities

### New Capabilities

- `waiting-lanes`: Plays levels 0.1 and 1.1 as waiting lanes. Notes come from the level and the seed, wait at the hit line, and are judged with the existing hit and error rules. The level ends with a run summary. The live run records a version 1 log as inputs arrive, and replaying that log reproduces the events and the summary.

### Modified Capabilities

- `replay-kernel`: Remove the stand-in requirements. Recording, replay, and the version 1 log move to `waiting-lanes`. The run-log schema is unchanged.

## Impact

- New module under `src/core/sim/`, with Node tests and a fast-check property. The judge gains a way to append a spawned character; existing judge results for a fixed sequence stay as they are.
- Removed: `src/core/replay/stand-in-run.ts` and its two test files. `src/core/replay/rng.ts` stays.
- Unchanged: schemas, ports, the event shapes, `src/engine`, `src/platform`, `src/app`, `content/`, `package.json`, and the roadmap status. Stage 2 stays "Not started".
- No new runtime dependency. No new dev dependency. fast-check and `@fast-check/vitest` are already installed.

## Principles served

- **P1.** The active note is the character the player types. A hit is that character. A miss is not a way to clear it.
- **P2.** The summary's accuracy is first-attempt Integrity. Its net WPM is Velocity. Waiting at the line adds no timing grade.
- **P3.** Levels 0.1 and 1.1 run the waiting-lanes machine only.
- **P4.** Zone 0 always reaches `LevelEnded`. Errors do not end it early and do not award a fail state.
- **P8.** Notes are the level's authored patterns, and those patterns use the unlocked keys.
- **P10.** The log stores the run's Integrity and Velocity.
- **P12.** The scripted 1.1 replay and the property over seeds and inputs are the evidence that the live log reproduces the run.
- **P13.** This is the level-runtime slice of the walking skeleton. Flowing lanes, scoring, and the screen stay later.
- P5, P6, P7, P9, and P11 are not served. No stars or medals are awarded, and nothing already earned is removed.

## Docs implemented

- `docs/ROADMAP.md` Stage 2: waiting lanes for 0.1 and 1.1, and a live run that records its own log. The status cell stays "Not started".
- `docs/verticals/04-core-mechanics-and-game-feel.md`: one active character, waiting lanes, and no timing grades. Flowing lanes, convoys, combo, Overdrive, and shield stay later.
- `docs/verticals/03-level-design.md`: the five phases, player-paced queue and approach, no game over mid-level, and the 0.1 and 1.1 rows. Bosses, medals, and tiers stay later.
- `docs/verticals/02-curriculum.md`: levels 0.1 and 1.1, their keys, and the zone 0 rule that it always completes.
- `docs/horizontals/04-architecture.md`: plain note entities, integer steps, seed plus inputs, and `Hit`, `Error`, and `LevelEnded` through the outbox.
- `docs/horizontals/05-data-model.md`: the version 1 `runLogs` shape, including `[stepDelta, character, flags]`. Retention stays later.
- `docs/horizontals/08-testing-and-dev-practices.md`: a Node logic test and a fast-check property.
- Cited, not changed: decision records 0002 (the generator), 0003 (the run-log encoding), and 0007 (the content hash).

## Departures

- Horizontal 04 says `LevelEnded` carries the run summary. The event stays `{ type, step }`. The summary is the finish result and the log field. The architecture doc is not edited. The results screen is the consumer, and it is a later change.
- No new decision record. The generator, the input tuple, and the content hash stay 0002, 0003, and 0007.

## Assumptions

- The caller passes the accepted level, the accepted tuning, the seed, and the identity fields (`runId`, `levelId`, `tier`, `mode`, `contentVersion`, `startedAt`, `updatedAt`, `rev`). The runtime does not read files, the clock, or a random source. It sets `engineVersion` to `0.0.0`. `levelId` must equal the level's id.
- Draws use `fork("waiting-lanes")` on the run seed. At step 0 the run spawns until the number of unhit notes equals `queueDepth`. A further note spawns, at the step of the hit that opened the slot, when a hit leaves the queue short. The shipped tuning is approach 6 seconds and queue depth 1, so one note is unhit while the level is playing.
- A unit is picked when the previous unit is exhausted, from the phase whose window contains that spawn step. Phase windows are in order, each `durationSeconds * 120` steps long, starting at step 0. The unit's characters spawn in order, including space (`U+0020`). A phase boundary does not drop the rest of the current unit. For seed `signalfire`, the first arrival unit on both shipped levels is `fff`.
- The approach length is `approachSeconds * 120` steps, which is 720 for the shipped tuning. The note is approaching until the current step reaches the spawn step plus that length, then it is waiting. A matching key-down is a hit in either state. Reaching the waiting step emits nothing.
- Judging is the existing judge. The runtime appends each spawned character to that judge's sequence. Flags follow decision 0003: bit 0 is key-up, bit 1 is ShiftLeft, bit 2 is ShiftRight. The match compares characters. The log has no physical key; the runtime passes `Unidentified` into the judge. Both shift bits set means Shift side none.
- The last step is one less than the total phase steps. Both shipped levels end at step 5999. `finish` advances to that step and emits `LevelEnded` there. An input at that step still applies. Advancing past it ends the run there. A later `apply` or `finish` throws `RangeError`.
- Accuracy is Integrity divided by 100, or 1 when there is no first attempt. Net WPM is Velocity, or 0 when active time is 0. Score, stars, and medals are 0, 0, and empty, on zone 0 and on zone 1. Zone 1 star bars are not applied. A zone 0 run with errors still ends this way.
- The run appends each applied input immediately. `finish` returns the version 1 log. Input steps are deltas, as in the stand-in. Replay recomputes the events and the summary from the log's seed and inputs and the level and tuning the caller passes. It does not copy the stored summary, and it does not read `contentVersion`.
- Replay throws `RangeError` when the engine version's major is not 0. There are no saved player logs. A log this runtime wrote uses `0.0.0`.
- The property test keeps generated sequences short and steps inside the level. The runtime accepts any non-decreasing safe-integer steps the run log can store.

## Constitution check

- **C1.** One new capability, `waiting-lanes`. The `replay-kernel` delta only removes the stand-in requirements this runtime replaces. Not a C1 exemption. Apply waits for approval.
- **C2.** Principles, docs, and departures are stated above.
- **C3.** Karim approves this proposal before apply. The agent does not merge and does not push to `main`.
- **C4.** Note generation, judging through the level, the summary, and replay are logic. Tests are written failing first. Every scenario maps to a test. The property covers seeds and input sequences, and notes stay inside the allowed keys.
- **C5.** Strict TypeScript. No `any`. No `@ts-ignore`.
- **C6.** No new decision record.
- **C7.** No new runtime dependency. No new dev dependency.
- **C8.** No `AGENTS.md` edit. `src/AGENTS.md` already places the level runtime in `core/sim` and requires seeded randomness, the outbox, and test-first core.
- **C9.** Tests, the module, the delta specs, and `tasks.md` land together. Roadmap status stays "Not started". Archive copies the deltas into `openspec/specs/`.
- **C10.** Non-trivial. The fresh-context review is a task.
