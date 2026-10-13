# Proposal

## Why

Stage 1 includes the fixed-step loop. The replay kernel already advances a run by integer steps the caller names. Nothing turns frame time, or a keystroke's timestamp, into those steps, so a real frame rate would move the simulation by a different amount every frame.

## What Changes

- Add an engine loop that advances a simulation in fixed steps of 1/120 s. The caller supplies timestamps. Leftover time stays in an accumulator, and the loop reports that leftover as an interpolation fraction in the half-open range from 0 up to, but not including, 1.
- A frame gap longer than 250 ms contributes 250 ms. The rest of that gap is dropped, including when the gap comes from an input timestamp.
- Submitting an input timestamp advances the simulation to the step that timestamp falls in, and runs the new step callbacks before the call returns. The caller judges after that return. The loop does not read the DOM.
- Pause holds the step and the fraction. Resume continues from the resume timestamp, so the paused wall-clock gap is not simulated.
- A driver schedules that stepper from `requestAnimationFrame`, through schedule and cancel functions the caller passes. Tests pass timestamps and do not wait on real time.
- The loop's step counter implements `Clock`. `step()` returns how many fixed steps have completed, starting at 0.

Out of this change: PixiJS rendering, DOM keyboard capture, audio, focus and resize listeners, the 3-2-1 resume countdown, judging, and calling the stand-in run. A later renderer reads the fraction. A later level runtime advances the sim inside the step callback and judges after the input call returns.

## Capabilities

### New Capabilities

- `fixed-step-loop`: Converts caller-supplied timestamps into 1/120 s simulation steps, reports the interpolation fraction, clamps a long gap to 250 ms, advances to an input timestamp before the caller judges, and pauses and resumes.

### Modified Capabilities

- None. `core-ports-and-rng` still owns the `Clock` port (`step(): number`) and the in-memory clock fake. This loop implements that port and does not change the fake. `replay-kernel` still advances when the caller names a step. `layer-boundaries` already allows `src/engine` to import `core`. `test-harness` already collects `src/**/*.test.ts` and forbids Node tests from depending on real time.

## Impact

- New: `src/engine/loop/` (the stepper, the animation-frame driver, a Node test, and a property test).
- Unchanged: `src/core`, `src/platform`, `src/app`, `package.json`, and the roadmap status. Stage 1 stays "Not started" until Karim exits the stage.
- No new runtime dependency. No new dev dependency.

## Principles served

- **P13.** This is the thin loop: timestamps in, steps and a fraction out. Rendering, DOM input, and audio come after, on this seam.
- P1 through P12 are not served. Nothing is drawn, heard, or judged.

## Docs implemented

- `docs/ROADMAP.md` Stage 1: the fixed-step loop item only. Status stays "Not started".
- `docs/horizontals/04-architecture.md`: Game loop (`requestAnimationFrame`, 1/120 s steps, accumulator, 250 ms clamp, interpolation fraction) and the Input pipeline sentence that advances the simulation to the event's timestamp before judging.
- `src/AGENTS.md` (engine): the fixed-step loop, the `Clock` implementation, and advancing to the event's step before judging.
- Cited, not implemented: vertical 04 (focus loss pauses, then a 3-2-1 countdown) and vertical 11 (a resize pauses). Horizontal 04's DOM capture, render interpolation, and audio response call this loop later.

## Departures

- No departure. Horizontal 04 describes the finished engine, including rendering from the fraction and pausing when focus is lost. This change supplies the stepper, the fraction, and pause/resume. It does not edit the architecture doc.
- No new decision record. The step size and the clamp are already in horizontal 04. The time unit that makes those numbers exact is an implementation choice in `design.md`.

## Assumptions

- The loop lives in `src/engine/loop/`, as horizontal 04's source layout says. The roadmap line "src/core basics: ... fixed-step loop" names a Stage 1 item. It does not place this code in `core`. Core stays free of frame time. The in-memory clock fake stays the core test double.
- Timestamps are milliseconds, the unit of `requestAnimationFrame` and `event.timeStamp`. The first accepted timestamp is the origin and takes no step. Each later accepted timestamp adds the gap since the previous one.
- A gap above 250 ms adds 250 ms of simulation time. The sample cursor still moves to the new timestamp, so the dropped part of the gap is not integrated on the next sample.
- The step callback runs once per completed step, in order, with that step index. During the callback, `clock.step()` returns the same index. The clock starts at 0 and has no `setStep`.
- An input timestamp uses the same integrator as a frame. A timestamp earlier than the last accepted sample leaves the step, the fraction, and the sample cursor unchanged.
- While paused, frame and input timestamps leave the step and the fraction unchanged. Resume sets the sample cursor to the resume timestamp and keeps the step and the leftover. Resume while already running, and pause while already paused, leave the cursor unchanged.
- The animation driver keeps requesting frames until stop. It forwards each timestamp to the stepper. Stop cancels the pending request. A callback delivered after stop does not advance the stepper.
- The loop does not call `createStandInRun`. The step callback is the seam.
- The `layer-boundaries` sentence "This change SHALL NOT add source files under those directories" names the layer-boundaries change, which already shipped. Later changes already added `src/core` and `src/platform`. This change adds `src/engine` and does not edit that spec.
- Node tests pass timestamps into the stepper and a fake frame scheduler. They do not call `requestAnimationFrame`, `performance.now`, or `Date.now`.

## Constitution check

- **C1.** One capability, `fixed-step-loop`. Not a C1 exemption. Apply waits for approval.
- **C2.** Principles, docs, and departures are stated above.
- **C3.** Karim approves this proposal before apply. The agent does not merge and does not push to `main`.
- **C4.** The stepper is logic. Tests are written failing first. Every scenario maps to a test. One property covers integer millisecond frame gaps. Node tests do not depend on real time (`test-harness`).
- **C5.** Strict TypeScript. No `any`. No `@ts-ignore`.
- **C6.** No new decision record. Horizontal 04 already fixes 1/120 s and the 250 ms clamp.
- **C7.** No new runtime dependency. No new dev dependency. `requestAnimationFrame` is a browser global the caller passes in.
- **C8.** No `AGENTS.md` edit. `src/AGENTS.md` already places the fixed-step loop and the `Clock` adapter in `engine`.
- **C9.** Tests, the loop, the delta spec, and `tasks.md` land together. Roadmap status stays "Not started". Archive copies the delta into `openspec/specs/`.
- **C10.** Non-trivial. The fresh-context review is a task.
