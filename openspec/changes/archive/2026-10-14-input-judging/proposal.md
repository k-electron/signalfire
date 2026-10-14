# Proposal

## Why

Stage 2 needs real keystroke judging before a level can score a run. Core still matches a key-down against a stand-in target and stores net WPM as 0. Integrity and Velocity are the measures later stars will read, and nothing computes them from typing.

## What Changes

- Add a core keystroke: the typed character, the physical key, the Shift side (left, right, or none), whether the event is a key down or a key up, and the simulation step.
- Judge a key-down against the active character of a sequence the caller supplies. Under the zones 0–4 lane rule, a match emits Hit and the next character becomes active. A mismatch emits Error and the active character stays.
- Integrity counts the first attempt at each character only. A later hit does not erase that error. Further errors on the same character still emit Error and leave the first-attempt counts unchanged.
- Velocity is (correct characters ÷ 5) ÷ active minutes, from the keystrokes of the run so far.
- Reuse the existing `Hit` and `Error` domain events (`{ type, step }`).

Out of this change: DOM capture, auto-repeat, and layout warnings. Static. Misses and flowing lanes. Zone 5 same-hand Shift errors. Combo, Overdrive, shield, score, and stars, including the rule that a run with more than 50% excluded time awards no stars. Raw WPM, rhythm, rollover, and the other telemetry aggregates. Replacing the stand-in replay kernel. Changing the run-log tuple (decision 0003). Word completion and level end.

## Capabilities

### New Capabilities

- `input-judging`: Judges each key-down against the active character, emits Hit or Error, and computes Integrity and Velocity from that run's keystrokes.

### Modified Capabilities

- None. `replay-kernel` still matches the stand-in target and still reports net WPM 0. `core-ports-and-rng` still owns the outbox and the `Hit` and `Error` shapes. `fixed-step-loop` still converts timestamps to steps. `document-schemas` still owns the version 1 run log.

## Impact

- New module under `src/core/input/`, with Node tests and a fast-check property.
- Unchanged: the stand-in run, schemas, ports, `src/engine`, `src/platform`, `src/app`, `package.json`, and the roadmap status. Stage 2 stays "Not started".
- No new runtime dependency. No new dev dependency. fast-check and `@fast-check/vitest` are already installed.

## Principles served

- **P1.** A hit is the character the player was asked to type. An error is a different character, and the active character stays.
- **P2.** Integrity is first-attempt accuracy. Velocity is a separate speed measure.
- **P10.** Integrity and Velocity are the two run measures the HUD and the dossier will show.
- **P12.** The formulas are the ones in the curriculum and the telemetry vertical.
- **P13.** This is the judging piece of the walking skeleton. Capture, lanes, and the live run log come after.
- P3, P4, P5, P6, P7, P8, P9, and P11 are not served. No earned progress is removed.

## Docs implemented

- `docs/ROADMAP.md` Stage 2, the real-input-judging piece. The status cell stays "Not started".
- `docs/verticals/04-core-mechanics-and-game-feel.md`: what a keystroke is, and the Hit and Error rows of the judging table. Same-hand Shift, Static, and focus-loss pause stay later.
- `docs/verticals/02-curriculum.md`: the zones 0–4 lane error policy (a wrong key is an error and the note stays), the rule that accuracy counts the first attempt, and the WPM definition under Standards. Zone 9 free typing stays later.
- `docs/verticals/05-scoring-and-progression.md`: the Integrity and Velocity rows, and the sentence that pauses longer than 3 seconds are excluded from Velocity. Star bars and the 50% exclusion rule stay later.
- `docs/verticals/06-telemetry-and-pilot-profile.md`: Accuracy (Integrity), Net WPM (Velocity), and Active time. Per-key stats, rhythm, and aggregation stay later.
- `docs/horizontals/04-architecture.md`: `core/input` judges the active character and emits Hit and Error. DOM capture and the rest of the event table stay later.
- `src/AGENTS.md`: pure core, integer steps, test-first logic, no DOM and no clock reads.

## Departures

- No departure. The stand-in kernel remains the behavior in `replay-kernel`. This change does not edit that spec, the run log, or a horizontal. The active-minutes reading below is an assumption, recorded in `design.md`, because no doc defines that phrase.

## Assumptions

- The caller supplies the character sequence as Unicode code points. This change does not load level content or move notes.
- A match is an equal code point. Shift side and the physical key are part of the keystroke and do not change the match. Zone 5's same-hand Shift error is not applied.
- A key-up emits no Hit or Error, does not move the active character, and does not change Integrity or Velocity.
- A key-down while no character is active emits nothing and changes no count and no time.
- Steps on one judge are non-decreasing safe integers. An earlier step throws `RangeError` and leaves the state unchanged.
- With no first attempts, Integrity is 100%. The docs define the ratio and do not define the empty denominator. This matches the stand-in accuracy of 1 for no key-down.
- A correct character is a hit. One hit counts once, including a hit that follows errors on that same character. Integrity does not use this count.
- No doc defines "active minutes". Vertical 06 defines active time, and verticals 02 and 05 say pauses longer than 3 seconds are excluded from WPM. `design.md` defines active minutes from those sentences and flags that definition as an assumption. When that active time is 0, Velocity is 0.
- One step is 1/120 s, as horizontal 04 and `fixed-step-loop` already state. The judge names that constant. It does not import the engine loop. A level pause already freezes the step clock, so this change does not subtract pause events.
- The physical key is not stored in the run log. Decision 0003 stays the tuple `[stepDelta, character, flags]`.
- The caller passes one Shift side: left, right, or none.

## Constitution check

- **C1.** One capability, `input-judging`. Not a C1 exemption. Apply waits for approval.
- **C2.** Principles, docs, and departures are stated above.
- **C3.** Karim approves this proposal before apply. The agent does not merge and does not push to `main`.
- **C4.** Input judging is a logic domain. Tests are written failing first. Every scenario maps to a test. The property covers Integrity on generated keystroke sequences.
- **C5.** Strict TypeScript. No `any`. No `@ts-ignore`.
- **C6.** No new decision record. The step rate and the input tuple are already in horizontal 04 and decision 0003. The active-minutes reading is an assumption in `design.md`, not a new encoding.
- **C7.** No new runtime dependency. No new dev dependency.
- **C8.** No `AGENTS.md` edit. `src/AGENTS.md` already places judging in core and requires test-first logic.
- **C9.** Tests, the module, the delta spec, and `tasks.md` land together. Roadmap status stays "Not started". Archive copies the delta into `openspec/specs/`.
- **C10.** Non-trivial. The fresh-context review is a task.
