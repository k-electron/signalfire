# Design

## Context

See proposal.md for why. `createRng` and `fork` live in `src/core/replay/rng.ts` (decision 0002). `createOutbox` emits `Hit`, `Error`, `WordComplete`, and `LevelEnded`, each `{ type, step }`. `runLog.parse` in `src/core/schemas/run-log.ts` accepts a version 1 log and returns `{ status: "ok" | "invalid" | "newer" }`; it does not throw. Input tuples are `[stepDelta, character, flags]` (decision 0003): bit 0 is key-up, bit 1 is ShiftLeft, bit 2 is ShiftRight. Requirements are in `specs/replay-kernel/spec.md`.

## Goals / Non-Goals

**Goals:**

- One mutable run object the caller advances, with record and replay both driving that object.
- Stand-in match, horizon, and summary in that same module, labeled in a comment, with no plugin seam.
- Known answers fall out of `fork("stand-in")`. Tests assert them; the module does not hardcode them.

**Non-Goals:**

- A rules interface, an entity list, or a `Clock` read.
- Converting a timestamp to a step, or naming the 1/120 s rate.
- Re-emitting into `RenderOut` or `AudioOut`. The caller drains the outbox.

## Decisions

### One module, mutable like the generator

`src/core/replay/stand-in-run.ts`. A file comment states that the match, the horizon, the target list, and the summary formula are stand-ins, replaced when judging and scoring land.

`createStandInRun(seed)` returns an object:

| Method | Behavior |
|---|---|
| `step()` | Current integer step, starting at 0 |
| `advance(toStep, outbox)` | Move forward to `toStep` |
| `apply(character, flags, outbox)` | Apply one input at the current step |
| `finish(outbox)` | Simulate through the end, emit `LevelEnded`, return the summary |

`recordStandInRun(seed, inputs, identity, outbox)` and `replayStandInRun(log, outbox)` are functions. Export `STAND_IN_ENGINE_VERSION` as `"0-stand-in"`.

Alternative: a pure reducer that returns a new run per step. The generator is already a mutable object with its sequence in a closure. A second style for the same folder costs more than it saves. Alternative: record and replay as batch functions only. The spec requires stepping the same inputs to equal the recording, which is the seam the frame loop will call.

### Draws, then the step, then the input

On create, fork `"stand-in"`, draw `horizon = 1 + rng.int(0, 7)`, and pick the step-0 target. `advance` to a later step increments one step at a time and picks a target as it enters each step. `apply` reads the target already picked for the current step. `finish` sets `lastStep` to `max(horizon, lastInputStep + 1) - 1`, where `lastInputStep` is -1 when nothing has been applied. It then advances to `lastStep` with no further inputs, emits `LevelEnded` at that step, and returns the summary. A second `finish` throws `RangeError` before emitting.

Targets are the code points 97, 98, and 99, via `rng.pick`. One pick per simulated step, including steps with no input.

`flags & 1` means key-up (decision 0003): record the input, emit nothing. Any other flags compare the code point to the target and emit `Hit` or `Error`. Shift bits are not read.

Summary: `accuracy` is `hits / (hits + errors)`, or `1` when that denominator is 0. `netWpm` is 0, `score` is `hits`, `stars` is 0, `medals` is `[]`. Use the division result as the number. Do not round it.

Alternative: draw the target inside `apply`, so an empty step would skip a pick. The step-9 hit on seed `signalfire` would then miss, and the spec's extend scenario would fail. Empty steps have to consume a pick so the seed alone fixes later targets.

### Record checks the schema, then plays, then publishes

Build the version 1 object with the caller's identity, `v: 1`, `engineVersion: STAND_IN_ENGINE_VERSION`, the encoded inputs, and a placeholder summary (`accuracy` 1, `netWpm` 0, `score` 0, `stars` 0, `medals` `[]`). Encode deltas by a running step that starts at 0: each delta is `step - previous`. Run `runLog.parse`. When `status` is not `"ok"`, throw `RangeError` and do not emit.

Then play into a private outbox: for each absolute input, `advance` to its step and `apply`, then `finish`. Build the real log with that summary, and parse again. When that parse is not `"ok"`, throw `RangeError` and leave the caller's outbox empty. Otherwise emit the private batch to the caller's outbox and return the parsed document.

`advance` throws `RangeError` when `toStep` is not a safe integer, or is less than the current step, and leaves the step unchanged. `toStep === step()` returns without emitting. `apply` throws `RangeError` when the character or flags could not be stored, or the run is already finished, and emits nothing for that call.

Alternative: duplicate the schema's code-point and flag checks in this module. The schema already rejects them. A probe parse stays aligned with version 1.

### Replay runs the seed and the inputs

`replayStandInRun` throws `RangeError` before any emit when `log.engineVersion !== STAND_IN_ENGINE_VERSION`. Expand deltas with a running step from 0. Throw `RangeError` before any emit when a running step is not a safe integer. Play into a private outbox, emit that batch to the caller's outbox, and return `{ events, summary }`. Do not read `log.summary`, `contentVersion`, or the identity fields.

Record and replay both call the same play path. That is what makes the property true.

### Property bounds

`src/core/replay/stand-in-run.property.test.ts` uses `@fast-check/vitest`. Seed strings are at most 40 code units. An input list has at most 8 rows. Each row adds a delta from 0 through 4, so a generated step stays small, then a code point from 0 through 1114111 excluding 55296 through 57343, and flags from 0 through 7. The identity is the fixed campaign example in the spec. One property: record, drain, replay, and expect the drained events and the replayed events to be equal, and the replayed summary to equal the log's summary.

fast-check shrinks a failure and prints the seed. Do not raise the bounds to make the test look stronger. A wide step gap would spend the test drawing one pick per step.

## Risks / Trade-offs

- [Stand-in `Hit` is not a typed character] → The file comment and `STAND_IN_ENGINE_VERSION` mark it. Stage 2 changes the version string when it replaces the rules. No player log uses `0-stand-in`.
- [A log with a huge last step draws once per step] → The kernel does not add a cap. The property stays inside a small bound. A real keystroke log is thousands of steps, not billions.
- [Repeating fractions in `accuracy`] → Record and replay divide the same counts. Compare the number. Do not round-trip it through a fixed decimal format.
- [The probe parse uses a placeholder summary] → It only accepts or refuses identity and inputs. The returned log is the second parse, with the real summary.

## Migration Plan

No saved run uses this engine version. Rollback is reverting the change. The shipped fixture stays `engineVersion` `0.0.0`; replay refuses it.
