# Design

## Context

See proposal.md for why. The behavior contract is `specs/waiting-lanes/spec.md`. `specs/replay-kernel/spec.md` in this change removes the stand-in requirements.

`src/core/replay/stand-in-run.ts` steps a seeded target list, writes a version 1 log from a caller-supplied input list, and replays that list. `src/core/input/judge.ts` already judges a fixed sequence and computes Integrity and Velocity. `src/core/schemas/run-log.ts` already accepts the version 1 log. `src/app/content/campaign.ts` already loads levels 0.1 and 1.1 and `tuning:waiting-lanes`. Core cannot read the clock, the disk, or `Math.random`.

## Goals / Non-Goals

**Goals:**

- One pure run object. The caller advances steps and applies inputs. Finish returns the summary and the log.
- The same transition function replays that log.
- Tests import the shipped level JSON, so a content edit fails the pinned scenarios.

**Non-Goals:**

- A batch `record(seed, inputs)` entry point. The live run is the recorder.
- Connecting `src/engine/loop`. The caller names integer steps.
- A new domain-event field. `LevelEnded` stays `{ type, step }`.

## Decisions

### The run lives in `src/core/sim`

`src/core/sim/waiting-lanes.ts` is the level runtime horizontal 04 names. `src/core/replay/rng.ts` stays. Delete `stand-in-run.ts`, `stand-in-run.test.ts`, and `stand-in-run.property.test.ts`.

```ts
type NotePosture = "approaching" | "waiting";

type ActiveNote = {
  readonly character: number;
  readonly spawnStep: number;
  readonly posture: NotePosture;
};

type WaitingLanesRun = {
  step(): number;
  advance(toStep: number, outbox: Outbox): void;
  apply(character: number, flags: number, outbox: Outbox): void;
  inputs(): readonly { step: number; character: number; flags: number }[];
  activeNote(): ActiveNote | null;
  unhitCount(): number;
  finish(outbox: Outbox): { summary: RunSummary; log: RunLogDocument };
};

createWaitingLanesRun(level, tuning, seed, identity): WaitingLanesRun
replayWaitingLanes(level, tuning, log, outbox): { events: DomainEvent[]; summary: RunSummary }
```

`Level` and `Tuning` are the accepted types from `src/core/content/load.ts`. Tests import the shipped JSON with `with { type: "json" }`, the same form as `src/app/content/campaign.ts`, and pass the values through `acceptLevel` and `acceptTuning`. The sim module does not import `content/`.

Alternative: keep the API on `src/core/replay/stand-in-run.ts` and change its body. The file name and the `stand-in` fork would keep describing a runtime this change removes.

### Notes are a cursor over authored units

`createRng(seed).fork("waiting-lanes")` is the only draw source. `create` spawns at step 0 until `unhitCount` equals `queueDepth`.

Phase windows are in file order. A phase covers `durationSeconds * 120` steps. Arrival on both shipped levels is steps 0 through 959. The next phase starts at 960. The last step is the sum minus 1, which is 5999.

When a spawn needs a unit, `rng.pick` chooses one from that phase's `units`, in authored order. Characters are the string's Unicode code points, in order, including space (`U+0020`). A phase boundary does not drop the rest of the current unit. For seed `signalfire` the first pick on both levels is `fff`. The pick at spawn step 962 is level 0.1's `jfj` and level 1.1's `f j f j`.

A note's posture is `approaching` while `step < spawnStep + approachSeconds * 120`, and `waiting` from that step on. The shipped product is 720. If `approachSeconds * 120` is not an integer, `create` throws `RangeError`. Posture is not an event. A hit is valid in both postures.

On a hit, the run spawns at that same step until the queue is full again, before `apply` returns. Spawn adds no event. The shipped queue depth is 1, so the active note after a hit is the next character.

Alternative: prebuild a tape of 6000 characters at `create`. The phase of a unit depends on the spawn step, and the spawn step depends on when the player hits, so the tape cannot be fixed before the inputs.

### The judge keeps the measures

`startJudge([])` then `appendCharacter(state, codePoint)` for each spawn. `appendCharacter` returns a new state whose sequence has that code point at the end. It checks the same scalar-value rule as a keystroke. It does not change the index, the counts, or the clock. `applyKeystroke` is unchanged, so a sequence fixed at `startJudge` still judges as `input-judging` specifies.

`apply` maps decision 0003 flags, then calls `applyKeystroke`:

| Bits | Meaning |
|---|---|
| bit 0 (1) | key-up |
| bit 1 (2) | ShiftLeft |
| bit 2 (4) | ShiftRight |

Bit 0 sets phase `up`. Shift side is `left` for bit 1 alone, `right` for bit 2 alone, and `none` when neither or both are set. `physicalKey` is `Unidentified`. The run emits the returned event, if there is one.

The input is appended only after those checks pass. A throw leaves the list and the judge state unchanged.

### Finish, summary, and the log

`lastStep` is the summed phase steps minus 1. `advance` to a step greater than `lastStep` moves to `lastStep`, emits `LevelEnded` there, and marks the run finished. `advance` to `lastStep` does not finish, so an input at that step still applies. `finish` from an earlier step advances to `lastStep` and then emits `LevelEnded`. `advance`, `apply`, and `finish` throw `RangeError` once the run is finished.

The summary reads the judge at finish:

- `accuracy` is `integrityPercent / 100`, or 1 when `firstAttempts` is 0
- `netWpm` is `velocityWpm`
- `score` is 0, `stars` is 0, `medals` is `[]`

Deltas match the stand-in: the first delta is the first absolute step, and each later delta is the gap. `engineVersion` is the string `0.0.0`. Identity fields are the caller's. `create` parses a document with an empty input list and a zero summary, and throws `RangeError` before returning a run when that document is rejected. `finish` parses again with the real inputs and summary.

`replayWaitingLanes` checks the major with the same `/^(0|[1-9]\d*)\./` read the stand-in uses, throws `RangeError` for any major other than 0, expands deltas, and plays those inputs through `createWaitingLanesRun`. The level and tuning are the caller's. The stored summary and `contentVersion` are not inputs to the play. Replay emits to the caller's outbox and returns the played events and summary.

Alternative: bump `engineVersion` to `0.1.0` so a stand-in log cannot replay. No player log exists. Major 0 stays the rule in horizontal 05, and the stand-in tests are deleted rather than replayed.

### Properties

`src/core/sim/waiting-lanes.property.test.ts` uses `@fast-check/vitest`.

- Replay: either shipped level, an arbitrary seed string, and a list of 0 to 16 inputs. Steps are non-decreasing safe integers from 0 through 5999. Flags are integers from 0 through 7. Code points are the level's allowed keys or a small set of other scalars. Play, finish, replay, and compare events and summaries.
- Allowed keys: either shipped level and an arbitrary seed. Hit the active note at each phase's first step, and keep hitting at that step until the unit that was current at the start of the phase is exhausted. Every character that became active is one of the level's allowed keys. Five phases times a short unit is enough to leave arrival, and it does not walk all 6000 steps.

## Risks / Trade-offs

- [A content edit moves a pinned character] → The scenarios name the shipped units. Updating a unit updates the scenario in the same change.
- [A stand-in log replayed under these rules diverges from its stored summary] → No player log exists. The stand-in tests are deleted. Replay still recomputes.
- [Score 0 is what a later scoring change will replace] → The field is specified as 0 here. Scoring does not read a stored placeholder as a rule.
- [Finish walks every step to 5999] → The walk only advances an integer. It does not spawn. The property caps the input list, not the level length.
- [`appendCharacter` drifts from the judge] → It only appends a code point. Counts and the clock stay on `applyKeystroke`.

## Migration Plan

No saved run is migrated. There is no player log and no retention yet. Removing the three stand-in exports is the break, and only this repo's tests call them.

Archive removes the stand-in requirements from `openspec/specs/replay-kernel/spec.md`. A delta cannot change that file's purpose. After archive, set the purpose to: "Retired. Waiting lanes records the live run and replays it."

Rollback is reverting the change. Nothing in storage uses the new spawn rules.
