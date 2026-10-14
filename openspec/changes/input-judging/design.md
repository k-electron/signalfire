# Design

## Context

See proposal.md for why. `DomainEvent` in `src/core/ports/domain-event.ts` already has `Hit` and `Error` as `{ type, step }`. The stand-in in `src/core/replay/stand-in-run.ts` emits those for a random target and sets `netWpm` to 0. This change does not call it or edit it. The engine loop in `src/engine/loop/fixed-step-loop.ts` already turns timestamps into steps of 1/120 s and holds that clock while paused. Core cannot import the engine. Decision 0003 stores a saved input as `[stepDelta, character, flags]` and does not store a physical key.

Requirements are in `specs/input-judging/spec.md`.

## Goals / Non-Goals

**Goals:**

- One pure module the caller runs one keystroke at a time.
- Integrity and Velocity are functions of that state, so a test can read them after every key.

**Non-Goals:**

- An outbox parameter. The caller emits the returned event.
- A list-only API. The key handler will judge one keystroke after the loop advances.

## Decisions

### One module, data in and data out

`src/core/input/judge.ts`. `src/AGENTS.md` says core functions take data and return data. The stand-in object is mutable because it holds a generator cursor. This judge has no cursor.

```ts
type ShiftSide = "left" | "right" | "none";
type KeyPhase = "down" | "up";

type Keystroke = {
  readonly step: number;
  readonly character: number;
  readonly physicalKey: string;
  readonly shiftSide: ShiftSide;
  readonly phase: KeyPhase;
};

startJudge(sequence: readonly number[]): JudgeState
applyKeystroke(state, keystroke): { readonly state: JudgeState; readonly event: DomainEvent | null }
activeCharacter(state): number | null
attemptCounts(state): { readonly correctFirstAttempts: number; readonly firstAttempts: number }
integrityPercent(state): number
velocityWpm(state): number
```

`startJudge` copies the sequence. `applyKeystroke` returns a new state and does not mutate the old one. On `RangeError` it throws before that return, so the caller's state is unchanged.

`activeCharacter` is the code point at the index, or `null` when the index is past the end. `attemptCounts` is how the repeated-error scenario reads the first-attempt total. Tests use these functions, the event, `integrityPercent`, and `velocityWpm`. They do not read the step-span fields.

Characters in the spec are these code points: `f` 102, `j` 106, `k` 107, `x` 120, `F` 70, space 32.

Alternative: pass the outbox, as the stand-in does. The event would be harder to assert without draining, and the judge would depend on a port it does not need. Alternative: a mutable object. It would fight the core rule for no benefit.

### Match, then the first-attempt counts, then the clock

A key-up returns the same measures and a `null` event. It still advances the previous-step mark.

A key-down while `activeCharacter` is `null` does the same: no event, no counts, no clock. The previous-step mark still advances.

A key-down while a character is active is a judged key-down:

- Equal code points: event `Hit`, add one correct character, advance the index, and clear the first-attempt mark for the new index.
- Any other code point: event `Error`, leave the index.
- If this index had no first attempt yet, add one first attempt. A hit adds one correct first attempt. An error does not. Then set the mark. If the mark was already set, leave both counts as they are.

The first-attempt mark lives on the current index only. Advancing clears it, so the next character has its own first attempt.

### Assumption: active minutes

No doc defines the phrase "active minutes". The pieces around it are:

- Vertical 05: Velocity is (correct characters ÷ 5) ÷ active minutes, and pauses longer than 3 seconds are excluded from Velocity.
- Vertical 06: active time is the time from the first keystroke to the last, minus pauses over 3 s. Net WPM divides by active minutes.
- Vertical 02: WPM divides by minutes of active typing, excludes time spent in pauses longer than 3 seconds, and starts at the first keystroke rather than at level load.

**Assumption.** Active minutes are that active time, expressed in minutes, measured on judged key-downs:

- The span starts at the first judged key-down and ends at the last. A key-up is outside the span. A key-down with no active character is outside the span.
- One step is 1/120 s. Three seconds is 360 steps. Name both constants in this module. Do not import the engine loop.
- A pause is a gap between two consecutive judged key-downs that is strictly longer than 360 steps. Subtract that gap in full. A gap of 360 steps stays in the span.
- `activeSteps` is `(lastStep - firstStep) - excludedSteps`. With no judged key-down, or with `activeSteps` 0, Velocity is 0.
- Otherwise Velocity is `correctCharacters * 1440 / activeSteps`. That is `(correctCharacters / 5) / (activeSteps / 7200)`. Do not round.

This treats the pause as the whole long gap, which is the reading that later lets excluded time be compared with the run. The docs do not say to keep the first 3 seconds of a long gap. **Assumption:** when the subtraction leaves no time, Velocity is 0. The docs do not define division by zero. The run log's `netWpm` is a number greater than or equal to 0, and this change does not write that log.

A level pause never reaches this module as a gap. The fixed-step loop holds the step clock while paused, so those seconds are already absent from the step numbers.

Worked values, matching the spec:

| Judged key-downs | Correct | Active steps | Velocity |
|---|---|---|---|
| steps 0, 120, 240, 360, 480 | 5 | 480 | 15 |
| steps 0, 120, 240 | 3 | 240 | 18 |
| error, hit, hit at 0, 120, 240 | 2 | 240 | 12 |
| error, error, hit at 0, 120, 240 | 1 | 240 | 6 |
| steps 0, 360 | 2 | 360 | 8 |
| steps 0, 361, 481 | 3 | 120 | 36 |
| steps 0, 361 | 2 | 0 | 0 |
| downs at 0 and 120 | 2 | 120 | 24 |

Integrity is `100` when `firstAttempts` is 0. Otherwise it is `(100 * correctFirstAttempts) / firstAttempts`. Do not round. When the two counts are equal the result is exactly 100.

Alternative: cap each gap at 360 steps, so a long gap still contributes 3 seconds. That keeps a two-keystroke run from scoring 0, and it is a different excluded-time total than "the pause is excluded". The spec locks the full-gap reading.

### Reject a keystroke the run log could not store

Throw `RangeError` before changing state when:

- `step` is not a safe integer greater than or equal to 0, or is less than the previous accepted keystroke's step
- `character` is not a Unicode scalar value (the run-log rule: an integer from 0 through 0x10FFFF, excluding 0xD800 through 0xDFFF)
- `physicalKey` is not a non-empty string
- `shiftSide` is not `left`, `right`, or `none`

The previous-step mark updates on every accepted keystroke, including a key-up and a key-down that is not judged. The spec's throw scenarios are an earlier step and code point 55296. The same check covers a negative step, a non-integer step, an empty physical key, a code point below 0 or above 0x10FFFF, and a Shift side outside the three values.

Alternative: trust TypeScript for the union fields and skip the runtime check. The step and the code point are plain numbers, and the stand-in already rejects a bad code point at the boundary. Checking the string fields the same way keeps one gate.

### Property bounds

`src/core/input/judge.property.test.ts` uses `@fast-check/vitest`.

Shared bounds: a sequence holds 0 through 12 code points, each from 32 through 126. A keystroke list holds 0 through 24 rows. Each row adds a step delta from 0 through 400, so some gaps pass 360 steps, and the run stays small.

One property builds those keystrokes with either phase, any code point in that range, any of the three Shift sides, and a physical key from `KeyF`, `KeyJ`, and `Space`. Integrity is from 0 through 100 inclusive, and Velocity is finite and greater than or equal to 0.

The other builds one key-down per sequence character, in order, at non-decreasing steps, and may place a key-up of that character on the same step. Integrity is 100.

Do not raise the bounds. A wide code-point range does not change the ratio.

## Risks / Trade-offs

- [Active minutes is an assumption] → It is marked above, and the spec scenarios lock the arithmetic. Karim can correct it before apply.
- [A run whose only gap exceeds 3 seconds scores Velocity 0] → The spec says so. It does not award stars; stars are a later change.
- [The stand-in still emits Hit for a different rule] → A later walking-skeleton change wires this judge into the level. This change does not.
- [Integrity is a percent and the run log stores a 0-to-1 accuracy] → This change does not write the log. A later scoring change divides by 100 when it stores the summary.
- [The physical key is not in the saved tuple] → It stays on the in-memory keystroke. Widening decision 0003 waits for the change that records a live run.

## Migration Plan

No saved document changes. Rollback is reverting the change. The stand-in and the version 1 run log stay as they are.
