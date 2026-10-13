# Design

## Context

See proposal.md for why. Requirements are in `specs/fixed-step-loop/spec.md`. `Clock` in `src/core/ports/clock.ts` is `step(): number`. `createFakeClock` in `src/core/ports/fakes.ts` is the in-memory test double and stays there. `src/engine` does not exist yet. `src/AGENTS.md` forbids allocations on the per-frame path and forbids the engine from importing React, stores, or `src/app`. Node tests must not wait on real time (`test-harness`).

## Goals / Non-Goals

**Goals:**

- One stepper a test can drive with timestamps, plus a driver that forwards scheduled timestamps into that stepper.
- Step counts and fractions that compare with `toBe` for the ratios in the spec.
- The returned clock satisfies `Clock` without using the fake's `setStep` or `advance`.

**Non-Goals:**

- Binding `window.requestAnimationFrame` inside this module. The level screen passes it later.
- Calling `createStandInRun`, judging, or publishing to `RenderOut` or `AudioOut`.

## Decisions

### One module, stepper separate from the driver

`src/engine/loop/fixed-step-loop.ts`.

`createFixedStepLoop(onStep)` takes the step callback directly. No options object. It returns:

| Member | Behavior |
|---|---|
| `clock` | `Clock`. `step()` is the count of completed steps, starting at 0 |
| `frame(timeMs)` | Integrate one frame timestamp |
| `input(timeMs)` | Integrate one input timestamp on the same timeline |
| `pause()` | Freeze integration |
| `resume(timeMs)` | Set the sample cursor and continue |
| `interpolation()` | Leftover ticks divided by 1000 |

`startAnimationFrames(loop, schedule, cancel)` returns `{ stop() }`. `schedule` matches `requestAnimationFrame`: it takes a callback of one millisecond timestamp and returns a numeric handle. `cancel` takes that handle.

`frame` and `input` both call one internal sample function. The spec's input rule is the frame rule, with callbacks finished before return.

Alternative: store the driver on the loop and read `globalThis.requestAnimationFrame`. Tests would need a DOM, and `test-harness` forbids real time. A passed-in scheduler keeps the Node tests synchronous.

### Ticks, not a float accumulator

Time inside the stepper is an integer tick count. 1 ms is 120 ticks. One step is 1000 ticks, which is 1/120 s. A comment on those two constants says why: a float accumulator of `1000/120` ms does not land on the spec's exact fractions, and rounding milliseconds to a coarser grid moves 8.3 ms across a step boundary.

For an accepted gap of `g` milliseconds, add `Math.round(Math.min(g, 250) * 120)`. For a positive gap, `Math.round` ties round to the greater integer, which is the spec's tie rule. Then set the sample cursor to the timestamp that was accepted, including when the gap was limited to 250 ms.

`clock.step()` is `Math.floor(ticks / 1000)` after the sample returns. `interpolation()` is `(ticks % 1000) / 1000`. Do not keep a second copy of the fraction.

The first accepted `frame` or `input` stores the cursor and adds no ticks. There is no step callback.

Alternative: integrate `g / (1000/120)` in floating point and assert with `toBeCloseTo`. The spec's `1000/120` scenario and the `toBe(23/25)` ratios would then depend on accumulated error. Integer ticks make `920/1000 === 23/25`.

### Callbacks see the step; the fraction updates after them

When a sample completes `n` new steps, call `onStep` `n` times with indexes `previous + 1` through `previous + n`, in that order, before updating the leftover. Set the value `clock.step()` reads to that index before each call. After the last call, store the full tick total, leftover included, and move the cursor.

`onStep` is synchronous and is expected to return. The loop does not catch it. The sample path does not allocate: the argument is a number, and the methods are created once in `createFixedStepLoop`.

Alternative: pass the fraction into `onStep`. The spec keeps the fraction for rendering. The simulation callback receives the step index only.

### Earlier samples, pause, and bad timestamps

Validate every `frame`, `input`, and `resume` timestamp before changing state. `Number.isFinite(timeMs)` and `timeMs >= 0`, or throw `RangeError` with a message that the timestamp must be a finite number of milliseconds, zero or greater.

After validation:

- While paused, `frame` and `input` return. They do not move the cursor, so a paused timestamp cannot become the origin.
- A timestamp strictly earlier than the cursor returns. The cursor stays, so the next later sample still measures from the last accepted one.
- A timestamp equal to the cursor adds zero ticks and leaves the cursor there.
- `pause` while already paused returns. `resume` while not paused returns, without moving the cursor.
- `resume` while paused sets the cursor to that timestamp and clears paused. It does not add ticks. It may set the cursor earlier than the previous cursor; the next accepted sample measures from the resume timestamp.
- A second `stop` on the driver does not call `cancel` again.

### The driver is a schedule loop

On start, call `schedule` with the driver's callback. When that callback runs, if the driver is stopped, return. Otherwise call `loop.frame` with the timestamp, and if still not stopped, call `schedule` again and keep that handle. `stop` marks the driver stopped and cancels the pending handle.

A test scheduler stores the callback and returns an increasing handle. It does not invoke the callback itself, and it does not use timers.

### Property bounds

`src/engine/loop/fixed-step-loop.property.test.ts` uses `@fast-check/vitest`. Generate a list of at most 20 integer gaps, each from 0 through 1000. Present a frame at 0, then frames at the cumulative sums. The oracle adds `Math.round(Math.min(gap, 250) * 120)` per gap and compares `clock.step()` to `Math.floor(total / 1000)` and `interpolation()` to `(total % 1000) / 1000`.

Do not raise the bounds. Twenty gaps of 250 ms are 600 steps. That is enough to exercise the clamp and the leftover.

### Tests

`src/engine/loop/fixed-step-loop.test.ts` has one test per scenario except "Integer gaps match the clamped tick total", which is the property file. Compare fractions with `toBe` and the ratios written in the spec (`1/5`, `23/25`, `6/25`, and the others). Expect `RangeError` for a non-finite frame and for `-1`, and expect the following 26 ms frame to measure from 10 ms.

The scenario tests and the property test must not import `createFakeClock`.

## Risks / Trade-offs

- [The sample cursor is a double] → `requestAnimationFrame` timestamps stay far below the point where a 16 ms gap disappears into the ulp. The stepper does not re-base the cursor.
- [A clamped gap drops wall time] → The cursor still jumps to the timestamp, so the next sample cannot refill the dropped part. Inputs use that same cursor. This is the 250 ms rule from horizontal 04.
- [`onStep` throws mid-sample] → The loop does not catch it. Callers keep the callback total. A throw leaves the sample unfinished; the spec's callbacks return.
- [Tick totals past `Number.MAX_SAFE_INTEGER`] → Not guarded. 2^53 ticks is thousands of years of steps. A session does not reach it.

## Migration Plan

No saved document changes. The app does not start the loop yet. Rollback is reverting the change.
