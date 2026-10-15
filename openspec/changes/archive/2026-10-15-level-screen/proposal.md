# Proposal

## Why

Stage 1 established pure core logic and placeholder screens, and the engine recently gained DOM keyboard capture and a PixiJS canvas. However, the player still cannot play a real level from start to finish: entering a level drops directly into a canvas with placeholder headers, pausing unmounts and destroys the engine runtime, and finishing lacks briefing, countdown, minimal HUD indicators, and a true results screen with star awards and missed-bar guidance.

This change delivers the complete Stage 2 playable level loop for level 1.1: an XState level-lifecycle machine hosting the PixiJS engine, a briefing card, a 3-2-1 countdown, a minimal HUD displaying live Integrity and Velocity, in-level pause on Escape and on window blur with countdown resumption, and a results screen presenting earned stars, score, and missed-bar feedback.

## What Changes

- Implement the `level-lifecycle` XState state machine in `src/app/machines/level-lifecycle.ts` with states `loading`, `briefing`, `countdown`, `playing`, `paused`, `finishing`, `results`, and `error`.
- Replace the Stage 1 level stand-in (`src/app/screens/level.tsx`) to host the engine runtime inside the level-lifecycle machine: initializing loop, canvas, and keyboard capture upon entering `playing`, cleanly pausing and resuming the loop during pause and countdown, and tearing down upon exit.
- Provide a level briefing card before play, displaying level name ("First Light"), character prompt, medals and star bars, and a "Space to launch" prompt.
- Provide a 3-2-1 countdown overlay transitioning into `playing` both when launching from briefing and when resuming from pause.
- Add a minimal in-level HUD displaying live Integrity (accuracy percentage), Velocity (WPM), Score, and Combo from the throttled HUD store.
- Update `src/engine/bridge/hud-bridge.ts` and `src/app/stores/hud.ts` to include velocity (net WPM) alongside accuracy, score, and combo in the throttled 20 Hz snapshot.
- Replace the Stage 1 pause stand-in (`src/app/screens/pause.tsx`) with an in-level pause overlay in `src/app/screens/level.tsx` (and `pause.tsx`) that triggers on Escape and on window focus loss (`blur`), offering Resume (Space, via countdown) and Quit to zone map (Escape).
- Replace the Stage 1 results stand-in (`src/app/screens/results.tsx`) with a full results view displaying stars earned (0 to 3), score, Integrity %, Velocity WPM, and when 1-star is missed, the exact shortfall message (naming Integrity before Velocity) per curriculum standards, with a Continue action returning to the zone map.
- Record the finished Cadet run into the progress document via `recordCadetRun`, persisting best stars, score, net WPM, and accuracy.
- Update `src/app/machines/app-flow.ts` and `src/app/app.tsx` so the zone map opens the level screen lifecycle and returning from the level returns to the zone map.
- **Out of scope:** Full pause menu actions beyond Resume and Quit (such as Restart, Settings, or Calm mode), Calm mode mechanics, medals display on results, and zone map polish.

## Capabilities

### New Capabilities

- `level-screen`: Manages the level lifecycle (loading, briefing, countdown, playing, paused, finishing, results, error), hosts the engine runtime, presents a minimal HUD with live Integrity and Velocity, handles pause on Escape and focus loss with countdown resumption, and renders the results screen with stars, score, and missed-bar feedback.

### Modified Capabilities

None.

## Impact

- **New code:** `src/app/machines/level-lifecycle.ts` (level lifecycle state machine and logic tests) and `e2e/level-screen.spec.ts` (end-to-end play and pause/resume tests).
- **Modified code:** `src/app/screens/level.tsx`, `src/app/screens/pause.tsx`, `src/app/screens/results.tsx`, `src/app/stores/hud.ts`, `src/engine/bridge/hud-bridge.ts`, `src/app/machines/app-flow.ts`, and `src/app/app.tsx`.
- **Dependencies:** No new runtime or dev dependencies. Leverages existing `xstate`, `@xstate/react`, `zustand`, `pixi.js`, `react`, and `@playwright/test`.
- **Tests:** Node unit tests for `level-lifecycle` machine transitions and countdown logic; Vitest browser component tests for briefing, HUD, pause overlay, and results; and Playwright e2e tests playing level 1.1 to results and testing mid-level pause/resume.

## Principles served

- **P1. The learning is the game**: Keystrokes directly drive the simulation, and performance is mirrored in real time through Integrity and Velocity in the HUD, determining the stars awarded.
- **P2. Accuracy before speed**: Earning stars requires meeting both Integrity and Velocity bars; missing the 1-star bar explicitly surfaces the Integrity shortfall first.
- **P3. Simpler machines, not training wheels**: Level 1.1 presents the authentic home-row keys (F, J, Space) and real HUD feedback without artificial training wheels.
- **P4. A ramp, never a wall**: The briefing clarifies star bars before play, and results tell the player exactly which bar was missed and by how much.
- **P5. Earned, not bought**: Stars on the results screen are awarded strictly based on single-run performance against zone standards; quitting mid-level awards nothing.
- **P9. Spectacle is a requirement**: Smooth flow from briefing to countdown, active 60 fps lane rendering, live HUD updates, and celebratory results screen.
- **P10. An honest mirror**: The HUD gives live Integrity and Velocity numbers, and the results screen reports exact metrics and shortfalls with neutral, supportive tone.
- **P13. Thin, then deep**: Delivers the thin, complete vertical slice of level play from briefing to results before deepening pause menu options, medals, or calm mode.

## Docs implemented

- `docs/ROADMAP.md` Stage 2: "A level the player can actually play, from briefing to results."
- `docs/horizontals/04-architecture.md`: Level lifecycle state machine (`loading → briefing → countdown → playing ⇄ paused → finishing → results; with an error state`), React and engine separation, HUD snapshot bridge via Zustand, error state handling.
- `docs/verticals/11-ui-ux-and-onboarding.md`: Briefing card, In-level HUD (Integrity, Velocity, Score, Combo), Pause behavior (Escape and focus loss, Resume with countdown, Quit), Results screen, and keyboard-first controls.
- `docs/verticals/05-scoring-and-progression.md`: Stars rules, Cadet tier records, missed-bar guidance, results actions.
- `src/AGENTS.md`: State machines hold flow, Zustand holds data, HUD reads throttled snapshot store at 20 Hz, keyboard-first navigation, token styling.

## Departures

- Full pause menu options (Settings, Restart, Calm mode) beyond Resume and Quit to zone map are deferred to later Stage 2 changes to keep the change focused on the core playable loop.
- Medals display on the results screen is deferred to Stage 2's medals change.
- In-level HUD rings are implemented as minimal clean text/badge metrics (Integrity % and Velocity WPM) before final SVG/Pixi circular ring graphics.

## Dependencies

None. No new runtime or development dependencies.

## Assumptions

- Level 1.1 uses shipped level definition `level:1.1`, zone `zone:1`, and tuning `waiting-lanes` with seed `signalfire`.
- The level lifecycle machine context maintains levelId, run metadata, countdown counter, live HUD metrics, run summary, and missed-bar report.
- Resuming from pause initiates a 3-second countdown (3-2-1) before re-entering `playing` and resuming the fixed-step loop.
- Window blur event (`window.addEventListener('blur', ...)`) triggers pause automatically when in `playing` state.
- Space advances through briefing (launches countdown) and results (continues to zone map). During gameplay, Space is a typing key and does not trigger screen transitions.
- Results screen displays stars earned, final score, Integrity %, Velocity WPM, and when 0 stars are awarded on Zone 1, names each missed bar with measured value, needed value, and shortfall (Integrity before Velocity).
- Finished Cadet runs are recorded into the player's progress document using `recordCadetRun` upon entering `finishing`.

## Constitution check

- **C1.** One new capability: `level-screen`. No modified capabilities. Karim approves this proposal before apply.
- **C2.** Principles served, docs implemented, and departures are detailed above.
- **C3.** Karim approves this proposal before `/opsx:apply`. Pull request requires review and green CI.
- **C4.** Logic tests (level lifecycle state machine transitions, countdown ticks, results formatting, progress recording) are written test-first. Browser component tests and Playwright e2e tests verify user experience.
- **C5.** TypeScript strict. No `any`, no `@ts-ignore`.
- **C6.** No new MADR required; follows architecture in Horizontal 04 and UI/UX in Vertical 11.
- **C7.** No new dependencies.
- **C8.** Complies with root and `src/AGENTS.md` instructions.
- **C9.** Proposal, specs, design, and tasks land together.
- **C10.** Non-trivial change; independent fresh-context review is tracked in tasks.
