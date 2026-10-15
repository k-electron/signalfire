# Design

## Context

In Stage 1, `src/app/screens/level.tsx` was a placeholder that mounted the PixiJS canvas and captured input, but had no managed lifecycle, no briefing, no countdown, no HUD metrics for Integrity or Velocity, and no connection to saved progress or star awards. The app-flow machine had a stand-in `pause` state and screen (`src/app/screens/pause.tsx`) that simply displayed static text.

Per `docs/horizontals/04-architecture.md`, the level experience is governed by the **level-lifecycle** state machine (`loading → briefing → countdown → playing ⇄ paused → finishing → results`, with an `error` state). The Level screen hosts this lifecycle and the engine runtime, delivering the complete mission flow specified in `docs/verticals/11-ui-ux-and-onboarding.md` and `docs/verticals/05-scoring-and-progression.md`.

## Goals / Non-Goals

**Goals:**

- Implement the `level-lifecycle` XState v5 machine in `src/app/machines/level-lifecycle.ts` governing the eight lifecycle states: `loading`, `briefing`, `countdown`, `playing`, `paused`, `finishing`, `results`, and `error`.
- Host the engine and canvas inside `src/app/screens/level.tsx`, synchronizing the engine runtime with the lifecycle states.
- Present a mission briefing card before play begins, displaying the level title, character briefing copy, introduced home keys, star bars, and "Space to launch".
- Display a 3-2-1 countdown sequence before gameplay starts and when resuming from pause.
- Render a clean, token-styled HUD during `playing` showing live Integrity (accuracy %), Velocity (net WPM), Score, and Combo.
- Pause gameplay when the player presses `Escape` or when the window loses focus (`blur`), freezing the fixed-step loop and keyboard capture.
- Provide a pause overlay with `Resume` (resuming through a countdown) and `Quit` (returning to the zone map).
- Calculate stars via `awardStars`, record the run into the player's progress document using `recordCadetRun`, and display the results screen with stars, score, Velocity, Integrity, and exact missed-bar feedback when a bar is not met.
- Retire the standalone Stage 1 `pause` app-flow state and screen.
- Verify through Playwright e2e tests that level 1.1 plays to results with stars, and pauses/resumes mid-level.

**Non-Goals:**

- Full pause menu actions beyond Resume and Quit (Restart, Settings deferred).
- Calm mode and medals display (deferred to later Stage 2/3 changes).
- Procedural audio and Tone.js integration.
- Final visual particle effects, shaders, or 3D assets.

## Decisions

### 1. Level Lifecycle State Machine Architecture

`src/app/machines/level-lifecycle.ts` defines the lifecycle using XState v5:

- **`loading`**:
  - Context loads `level`, `zone`, `tuning`, and initializes seed and identity.
  - Automatically transitions to `briefing` once loaded, or to `error` if definitions are invalid.
- **`briefing`**:
  - Displays mission briefing card: level name, briefing text from character, introduced/home keys, and zone star bars (1, 2, and 3 stars with Integrity % and WPM).
  - Pressing `Space` (or clicking "Launch") transitions to `countdown`.
- **`countdown`**:
  - Ticks 3, 2, 1 before transitioning to `playing`.
  - Reused when resuming from pause to give players time to place fingers on the home keys.
- **`playing`**:
  - Fixed-step loop runs animation frames.
  - DOM keyboard capture is active with `preventDefault` on game keys.
  - PixiJS canvas renders lanes, hit line, and notes.
  - HUD bridge publishes throttled snapshots (Integrity, Velocity, Score, Combo) to `useHudStore` at 20 Hz.
  - Window `blur` or `Escape` triggers `PAUSE` transition to `paused`.
  - `LevelEnded` domain event triggers `COMPLETE` transition to `finishing`.
- **`paused`**:
  - Fixed-step loop and keyboard capture are suspended.
  - Displays pause overlay with two actions:
    1. `Resume` (Space / 1 / click) -> transitions to `countdown`.
    2. `Quit` (Escape / 2 / click) -> tears down engine and returns to `zoneMap`.
- **`finishing`**:
  - Invokes `run.finish(outbox)`, collecting `RunSummary` and `MissedBar[]`.
  - Calculates star award using `awardStars`.
  - Updates player's `ProgressDocument` using `recordCadetRun`.
  - Transitions to `results`.
- **`results`**:
  - Displays results view with earned stars (0 to 3), final score, Velocity, Integrity, and missed-bar feedback if 0 stars were earned.
  - Actions: Continue (opens zone map) and Hub (opens hub).
- **`error`**:
  - Shows friendly error message with action to return to zone map.

*Alternatives considered:*
- *Managing pause and briefing in React component state:* Leads to split state, race conditions during teardown, and untestable transitions. XState provides deterministic, verifiable transitions.

### 2. HUD Bridge Snapshot with Velocity (Net WPM)

`src/engine/bridge/hud-bridge.ts` and `src/app/stores/hud.ts` are expanded to include `velocity` (net WPM):
- During gameplay, `run.step()` and judge state allow computing instantaneous/rolling net WPM alongside Integrity.
- Throttling at 20 Hz (50 ms) ensures React HUD re-renders never exceed 20 fps, while PixiJS renders at full 60 fps.

*Alternatives considered:*
- *Subscribing React directly to the fixed-step loop:* Violates the architecture rule that React never renders per frame.

### 3. Pause on Focus Loss and Escape

In `src/app/screens/level.tsx`:
- A window `blur` listener is added during `playing`:
  ```ts
  const handleBlur = () => send({ type: "PAUSE" });
  window.addEventListener("blur", handleBlur);
  ```
- The keyboard handler routes `Escape` to `send({ type: "PAUSE" })`.
- On entering `paused`, `frames.stop()` halts animation frames and keyboard capture detaches or ignores gameplay keys.
- On `Resume`, entering `countdown` keeps gameplay keyboard capture inactive until `playing` re-enters, ensuring no stray inputs occur during countdown.

### 4. Results Screen Integration and Stand-in Retirement

- In `src/app/machines/app-flow.ts`:
  - Stand-in `pause` state is retired.
  - `level` remains an app-flow state that hosts the `Level` component.
  - When the player selects Continue or Hub on the results view, or quits from pause, the level screen invokes the navigation callback (`toZoneMap` or `toHub`).
- `src/app/screens/results.tsx` is enhanced to render the full results card (stars, score, Velocity, Integrity, missed bar) when accessed from level results, and remains compatible with app flow navigation.

## Risks / Trade-offs

- **[Countdown Timing in Tests]** → A 3-second real-time countdown would slow down automated tests.
  - *Mitigation:* Allow passing an optional countdown duration or instant countdown flag in props/test config so tests can advance instantly without waiting 3 seconds.
- **[Focus Loss During Test Runs]** → Headless browsers or multi-tab test environments might trigger blur events unintentionally.
  - *Mitigation:* Blur listener checks `document.hasFocus()` or active state, and tests explicitly focus the window.
- **[Progress Retention]** → Finished runs must never decrease earned stars or progress.
  - *Mitigation:* Uses pure `recordCadetRun` from `src/core/scoring/record-run.ts`, which enforces monotonic star retention.

## Migration Plan

- Stand-in `pause.tsx` screen in `src/app/screens/pause.tsx` is retired and replaced with the in-level pause overlay.
- No database migrations needed; `ProgressDocument` schema v1 is already established.
