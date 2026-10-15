# Proposal

## Why

Stage 2 needs a level the player can actually play from start to finish. Currently, level 1.1 displays canvas lanes and captures input, but lacks a managed lifecycle machine, briefing, countdown, live HUD metrics (Integrity and Velocity), pause/resume handling on Escape and focus loss, and a results screen with stars, score, and missed-bar feedback. Replacing the Stage 1 stand-in level and pause screens connects the engine to the app flow, delivering the first complete playable level experience.

## What Changes

- Implement the `level-lifecycle` state machine (`loading`, `briefing`, `countdown`, `playing`, `paused`, `finishing`, `results`, `error`) in `src/app/machines/level-lifecycle.ts` using XState v5.
- Connect `src/app/screens/level.tsx` to the `level-lifecycle` machine to host the engine across all phases.
- Add briefing screen showing level title, character briefing line, home/introduced keys, and star bars, advancing on Space.
- Add countdown before gameplay begins and when resuming from pause (3-2-1 countdown).
- Add minimal in-game HUD displaying live Integrity (accuracy percentage), Velocity (net WPM), Score, and Combo.
- Pause gameplay on `Escape` key and on window `blur` (focus loss), freezing the simulation loop and DOM keyboard capture.
- Provide a pause overlay with `Resume` (resumes with a countdown) and `Quit` (quits to the zone map).
- Handle run completion (`LevelEnded`), calculating stars using `awardStars`, saving progress to `ProgressDocument` via `recordCadetRun`, and transitioning to results.
- Implement the results screen displaying stars earned (0 to 3 stars), score, Velocity, Integrity, and missed-bar message if the 1-star bar was missed (e.g. "Integrity 90%, needed 92%"). Actions include Continue (to zone map) and Hub.
- Replace the Stage 1 level and pause stand-ins in `src/app/machines/app-flow.ts` and `src/app/screens/pause.tsx`.
- **Out of scope:** Full pause menu actions beyond Resume and Quit, Calm mode, medals display, zone map polish, audio effects (Tone.js).

## Capabilities

### New Capabilities

- `level-screen`: Manages the complete level lifecycle (loading, briefing, countdown, playing, paused, finishing, results, error), hosting the PixiJS engine, minimal HUD with Integrity and Velocity, pause on Escape and blur with countdown resume, and results with stars, score, and missed-bar reporting.

### Modified Capabilities

- `app-flow`: Retires the stand-in pause screen from top-level app flow, delegating level execution and pause/resume to the level lifecycle, with back from level or results returning to the zone map.

## Impact

- **New code:** `src/app/machines/level-lifecycle.ts` and `src/app/machines/level-lifecycle.test.ts`.
- **Modified code:**
  - `src/app/screens/level.tsx`: hosts the `level-lifecycle` machine, rendering sub-views for briefing, countdown, playing (canvas + HUD), paused overlay, and results.
  - `src/app/screens/results.tsx`: enhanced to render earned stars, final score, Velocity, Integrity, and missed-bar messages.
  - `src/app/screens/pause.tsx`: retired as a standalone app-flow screen (rendered as an overlay within the level screen).
  - `src/app/machines/app-flow.ts`: adjusts transitions for level and pause stand-in retirement.
  - `src/app/stores/hud.ts` and `src/engine/bridge/hud-bridge.ts`: include Velocity (`netWpm`) in the snapshot alongside Integrity/accuracy.
- **Dependencies:** No new runtime dependencies. Uses existing `xstate`, `react`, `zustand`, `pixi.js`.
- **Tests:** Unit tests for `level-lifecycle` state transitions; component/browser tests for briefing, countdown, HUD, pause overlay, and results; Playwright e2e tests playing level 1.1 to results with stars, and pausing/resuming mid-level.

## Principles served

- **P1. The learning is the game**: The player experiences the full arcade loop from mission briefing to typing, with direct feedback on Integrity and Velocity.
- **P2. Accuracy before speed**: Integrity is prominently displayed and required for stars; missed-bar feedback specifically tells the player what was missed.
- **P3. Simpler machines, not training wheels**: Home keys and star targets are clearly presented in the briefing.
- **P6. Nothing is ever taken away**: Finished runs record stars to progress and never decrease earned progress.
- **P10. An honest mirror**: Results clearly state stars, score, and exact shortfalls without euphemisms.
- **P13. Thin, then deep**: Delivers the thin playable slice of level 1.1 from briefing to results with stars and pause/resume.

## Docs implemented

- `docs/ROADMAP.md` Stage 2: "One thin end-to-end path: title, levels 0.1 and 1.1 (waiting lanes), real input judging, scoring, stars, results, save and reload."
- `docs/horizontals/04-architecture.md`: State machines: level lifecycle (`loading → briefing → countdown → playing ⇄ paused → finishing → results; with an error state`), React and the engine, HUD snapshot store, pause and focus loss, error state.
- `docs/verticals/11-ui-ux-and-onboarding.md`: Briefing (card with level name, briefing line, introduced keys, star bars, Space to launch), In-level HUD (Integrity, Velocity, score, combo), Pause (Escape and blur, Resume with 3-2-1 countdown, Quit to zone map), Results (stars, score, Continue, Hub).
- `docs/verticals/05-scoring-and-progression.md`: Stars rules (1, 2, 3 stars; never decrease; missed-bar message), score calculation, cadet run recording.
- `src/AGENTS.md` (app): Screens render from state machines; Zustand holds snapshot data, machines hold flow; typed text uses design tokens; everything works from the keyboard.

## Departures

- Medals display, Calm mode, and full pause menu actions (Restart, Settings) are out of scope for this change and deferred to subsequent Stage 2/3 changes. The pause menu implements Resume (with countdown) and Quit (to zone map).
- HUD uses clean minimal text/token bars for Integrity and Velocity before the full animated SVG rings are introduced in the visual polish stage.

## Dependencies

None. No new runtime dependencies are introduced (complies with C7).

## Assumptions

- Level 1.1 is defined in `src/app/content/campaign.ts` with zone 1 star bars.
- Resuming from pause initiates a 3-second countdown before resuming simulation loop and input judging.
- Losing window focus (`blur`) during the `playing` state triggers a pause transition to prevent unguided note misses.
- Finishing the level records the run into the player's progress document using `recordCadetRun`, persisting via `storage` or progress store.

## Constitution check

- **C1.** One new capability: `level-screen`. One modified capability: `app-flow`. Karim approves this proposal before apply.
- **C2.** Principles served, docs implemented, departures, and dependencies are detailed above.
- **C3.** Karim approves this proposal before apply. Pull request requires review and green CI.
- **C4.** Logic tests for `level-lifecycle` machine written test-first. Component and e2e tests verify play to results and pause/resume.
- **C5.** TypeScript strict. No `any`, no `@ts-ignore`.
- **C6.** Follows architecture in Horizontal 04 and UI/UX in Vertical 11.
- **C7.** No new runtime dependencies added.
- **C8.** Complies with repo rules and `src/AGENTS.md`.
- **C9.** Proposal, specs, design, and tasks land together.
- **C10.** Independent review in fresh context before merge.
