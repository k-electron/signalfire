# Design

## Context

Stage 1 implemented pure core logic, initial storage schemas, and stand-in app screens. PR #25 added DOM keyboard capture, a fixed-step game loop, and PixiJS canvas rendering for placeholder waiting lanes. However, the level screen currently lacks level lifecycle management: entering a level mounts the canvas directly with placeholder headings, pressing Escape unmounts the level and destroys engine state via the Stage 1 stand-in pause screen, and finishing lacks a briefing card, countdown, live minimal HUD metrics (Integrity and Velocity), and a results screen with star awards and missed-bar guidance.

The architecture (`docs/horizontals/04-architecture.md`) dictates:
- Core remains pure and deterministic behind ports and adapters.
- React never runs per frame and never holds simulation state.
- The level screen hosts the canvas; a level lifecycle machine manages engine instance creation, pause/resume, and teardown.
- Live gameplay metrics are published via a throttled HUD bridge (at most 20 Hz) to a Zustand store.
- Losing window focus pauses the level.
- Completed runs record Cadet progress with best stars, score, net WPM, and accuracy.

## Goals / Non-Goals

**Goals:**
- Implement an XState `level-lifecycle` state machine in `src/app/machines/level-lifecycle.ts` with 8 states: `loading`, `briefing`, `countdown`, `playing`, `paused`, `finishing`, `results`, and `error`.
- Host the engine runtime within `src/app/screens/level.tsx`, cleanly starting loop and input upon entering `playing`, pausing them during `paused`, and resuming through a countdown.
- Provide a level briefing card for level 1.1 showing level name, character prompt, medals and star bars, and a "Space to launch" prompt.
- Provide a 3-2-1 countdown overlay before play begins and upon resuming from pause.
- Display a minimal in-level HUD presenting live Integrity (accuracy percentage), Velocity (words per minute), Score, and Combo.
- Pause gameplay on Escape and on window focus loss (`blur`), offering Resume (Space, via countdown) and Quit to zone map (Escape).
- Render a results screen with stars earned (0 to 3), final score, Integrity %, Velocity WPM, and missed-bar shortfall guidance when 1 star is missed, with Continue returning to the zone map.
- Persist the finished Cadet run into the progress document via `recordCadetRun`.
- Validate with Node unit tests, Vitest browser component tests, and Playwright end-to-end tests for playing level 1.1 to results and mid-level pause/resume.

**Non-Goals:**
- Full pause menu actions beyond Resume and Quit (Restart, Settings, and Calm mode are deferred).
- Calm mode mechanics or unlocks.
- Medals display on the results screen.
- Zone map visual polish.
- Procedural audio or Tone.js sound synthesis (deferred to audio change).

## Decisions

### 1. Level lifecycle machine separation

- **Choice:** Create a dedicated XState machine `levelLifecycleMachine` in `src/app/machines/level-lifecycle.ts` to manage the level's internal states (`loading`, `briefing`, `countdown`, `playing`, `paused`, `finishing`, `results`, `error`).
- **Rationale:** Isolating level flow into a dedicated machine preserves separation of concerns: `appFlowMachine` governs top-level screen navigation (hub, maps, level), while `levelLifecycleMachine` owns the engine runtime, loop lifecycle, pause/resume transitions, and run completion.
- **Alternatives considered:**
  - *Expanding `appFlowMachine` with all level states*: Rejected because global app navigation should not be coupled to fine-grained level countdowns, pause overlays, or simulation event handling.
  - *Managing level lifecycle with React `useState` hooks*: Rejected because multi-step asynchronous flow (loading -> briefing -> countdown -> playing <-> paused -> finishing -> results) is prone to race conditions and inconsistent states without an explicit state machine.

### 2. Engine lifecycle and pause/resume mechanics

- **Choice:** The engine instance (PixiRenderAdapter, FixedStepLoop, keyboard capture, HUD bridge) is created when entering `playing` (or during `loading`). When transitioning to `paused`, `cancelAnimationFrame` stops the loop, keyboard capture ignores typing keys, and the canvas remains rendered in place underneath the pause overlay. When resuming, the machine enters `countdown` (3, 2, 1) before transitioning back to `playing`, where the loop cursor is updated via `loop.frame(performance.now())` to prevent catch-up frame bursts.
- **Rationale:** Preserves Pixi display objects, note positions, and run progress without re-instantiating the WebGL context or garbage-collecting pooled entities.
- **Alternatives considered:**
  - *Recreating engine on resume*: Rejected because tearing down WebGL on pause loses active notes, creates visible flicker, and leaks allocations.

### 3. Minimal HUD and live metrics

- **Choice:** Extend `HudSnapshot` and `useHudStore` to include `velocity: number`. Expose `metrics(): { integrityPercent: number; velocityWpm: number }` from `WaitingLanesRun` in `src/core/sim/waiting-lanes.ts`. The HUD bridge publishes updates at most once every 50 ms (20 Hz).
- **Rationale:** Keeps React strictly decoupled from the 120 Hz fixed-step loop, while giving the player live feedback on Integrity and Velocity as specified in Horizontal 04 and Vertical 05.
- **Alternatives considered:**
  - *Direct React subscription to simulation step*: Rejected by architecture rule C7 and Horizontal 04 (React never runs per frame).

### 4. Pause triggers and focus management

- **Choice:** In `src/app/screens/level.tsx`, add a `window` blur listener (`window.addEventListener('blur', ...)`) that dispatches a pause event when the window loses focus during `playing`. Keyboard capture dispatches pause on Escape.
- **Rationale:** Directly implements Vertical 11 requirement: losing focus or switching tabs automatically pauses the game so notes do not pass unattended.

### 5. Results presentation and progress document recording

- **Choice:** On run finish (`LevelEnded`), `run.finish(outbox)` yields `RunSummary` and `MissedBar[]`. The Level component dispatches `finish` with this payload to `levelLifecycleMachine`. Upon entering `finishing`, `recordCadetRun` records the run into the player's progress document in IndexedDB storage. The machine then transitions to `results`, rendering stars, score, metrics, and missed-bar shortfall text.
- **Rationale:** Follows deterministic core scoring rules (`src/core/scoring/stars.ts` and `record-run.ts`) and ensures player progress is persisted immediately at run completion.

## Risks / Trade-offs

- **[Risk]** Key collision between `appFlowMachine` and in-game typing keys.
  - **Mitigation:** In `src/app/app.tsx`, `keyToEvent` returns null when the current screen is `level`, allowing `Level` and engine keyboard capture to handle all keystrokes directly.
- **[Risk]** Clock drift or burst steps when resuming from pause.
  - **Mitigation:** FixedStepLoop frame time is clamped to 250 ms, and `loop.frame(performance.now())` resets the last frame timestamp on resume so catch-up steps never fire.
- **[Risk]** Playwright e2e canvas interaction testing.
  - **Mitigation:** Playwright sends real keyboard strokes (`page.keyboard.press("f")`) to the focused window, which DOM keyboard capture processes identically to a real user. Verification targets accessible DOM headings, HUD text, and result buttons.

## Migration Plan

1. Implement `level-lifecycle` state machine with full unit test coverage.
2. Extend `HudSnapshot` and `WaitingLanesRun` to supply live Integrity and Velocity metrics.
3. Update `src/app/screens/level.tsx`, `pause.tsx`, and `results.tsx` to use the lifecycle machine.
4. Update `appFlowMachine` and `app.tsx` to route `level` through the lifecycle machine and remove stand-in routes.
5. Verify all existing tests pass and add new browser and Playwright e2e tests.
