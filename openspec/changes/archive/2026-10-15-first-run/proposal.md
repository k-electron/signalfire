# Proposal: First Run Walking Skeleton

## Why

Stage 2 of the roadmap requires a thin end-to-end path ("walking skeleton") where a player experiences the first five minutes of the game: booting into the title screen, completing thin onboarding, playing level 0.1 and level 1.1, seeing earned stars on results and the zone map, and having progress preserved across browser reloads. Connecting core gameplay with the platform storage adapter and screen flow validates the foundational player journey and satisfies end-to-end flows 1 and 2.

## What Changes

- **App flow**: Connects the end-to-end first-run sequence: `title` -> `onboarding` -> `level:0.1` -> `level:1.1 briefing` -> `level:1.1` -> `results` -> `zoneMap`. On boot, loads stored documents through the platform storage adapter and skips onboarding when a completed profile exists.
- **Onboarding screen**: Introduces a thin onboarding flow:
  1. Call sign selection (defaults pre-selected, arrow keys navigate, Space selects).
  2. Posture check (3 prompts confirmed with Space: sit tall, wrists floating, eyes on screen).
  3. Find the beacons (guides fingers to F and J bumps; awaits F then J keystrokes).
  4. Writes profile checkpoint upon completion.
- **Level progression (0.1 to 1.1)**: Runs intro level 0.1 (Twin Beacons) with no star bars or fail state, connects to the 1.1 briefing with a one-line narrative bridge, and launches level 1.1 (First Light).
- **Persistence checkpoints & eviction protection**:
  - Saves `profile` document after onboarding completion.
  - Saves `progress` (stars, score, metrics), `run-log`, and `run-index` after level 1.1 completion.
  - Invokes `navigator.storage.persist()` after the first star is earned.
  - Restores `profile` and `progress` at app boot to determine visit state and populate UI.
- **Zone map screen**: Replaces the placeholder heading with a zone view of Zone 1 (The Drift) showing level 1.1 with earned stars.
- **End-to-end tests**: Implements Playwright Flow 1 (first run from title through onboarding and levels to results with stars) and Flow 2 (reload restores saved progress and skips onboarding).

### Principles Served

- **P1 (The learning is the game)**: Gameplay begins immediately with beacon key discovery and home row waiting lanes; typing metrics determine stars.
- **P2 (Accuracy before speed)**: Level 1.1 star bars demand accuracy (92% for 1 star) before speed.
- **P3 (Simpler machines, not training wheels)**: Cadet begins on the Skiff with only F, J, and Space; console display is part of the ship.
- **P4 (A ramp, never a wall)**: Onboarding introduces beacons; level 0.1 introduces waiting lanes with no fail state; level 1.1 introduces stars.
- **P6 (Never punish absence)**: Progress and stars are persisted to local storage at checkpoints and never lost or decremented.
- **P11 (Local first, cloud optional)**: All progress and profile data are saved locally in IndexedDB; full experience works offline without an account.
- **P13 (Thin, then deep)**: Delivers Stage 2 walking skeleton: a thin end-to-end path through title, onboarding, levels 0.1 and 1.1, results, zone map, and reload persistence.

### Docs Implemented

- `docs/verticals/11-ui-ux-and-onboarding.md`: Title, Onboarding, and Feature introduction schedule.
- `docs/horizontals/06-persistence-and-sync.md`: Checkpoints and Eviction protection.
- `docs/horizontals/05-data-model.md`: Profile and Progress document persistence.
- `docs/horizontals/08-testing-and-dev-practices.md`: End-to-end flows 1 and 2.
- `docs/ROADMAP.md`: Stage 2 Walking skeleton.

### Departures from Docs

- Level 0.2 ("Eight Docks") is omitted per proposal scope and deferred to a later change. Level 0.1 advances directly to the Level 1.1 briefing.
- Audio and procedural music are omitted per scope ("Out: audio") and wait for Stage 4 (Feel slice).
- Cloud sign-in and cross-tab Web Locks / BroadcastChannel sync are omitted per scope ("Out: cloud sign-in, multiple tabs") and wait for Stage 3.
- Story scenes are limited to single-line prompts per scope ("Out: story scenes beyond one line each").

### Runtime Dependencies (C7)

No new runtime dependencies. All functionality builds upon existing dependencies (`idb-keyval`, `zod`, `xstate`, `@xstate/react`, `pixi.js`).

### Constitution Check

- **C1 (OpenSpec change)**: Created under `openspec/changes/first-run/`.
- **C2 (Docs trace)**: Traces directly to vertical 11, horizontals 05, 06, 08, and roadmap Stage 2.
- **C3 (Human gates)**: Awaiting Karim's approval before implementation; CI will be green before pull request review.
- **C4 (Test-first for logic)**: Logic in flow machines, checkpoints, and onboarding will have unit/component tests written first; E2E flows 1 and 2 prove end-to-end outcomes.
- **C5 (Strict TypeScript)**: Strict mode enabled; no `any`; no `@ts-ignore`.
- **C6 (Decisions recorded)**: Adheres to existing storage decisions (ADR 0005) and content hashing (ADR 0007).
- **C7 (Dependencies)**: Zero new runtime dependencies.
- **C8 (Agent instruction files)**: Complies with root and scoped `AGENTS.md`.
- **C9 (Everything changes together)**: Code, tests, specs, design, tasks, and roadmap stage status progress together.
- **C10 (Independent verification)**: Independent review required prior to merge.

## Capabilities

### New Capabilities

- `onboarding`: Provides the first-run onboarding sequence: call sign selection, 3-step posture check, and beacon key check (F and J).
- `persistence-checkpoints`: Orchestrates saving documents (profile, progress, run logs) at game checkpoints via the platform storage adapter, restoring state at app boot, and requesting persistent browser storage via `navigator.storage.persist()` after earning the first star.
- `zone-map`: Displays zone level nodes along a sector path with earned star ratings loaded from progress data.

### Modified Capabilities

- `app-flow`: Extends app-flow navigation to coordinate first-run sequence (title -> onboarding -> level 0.1 -> level 1.1 briefing -> level 1.1 -> results -> zone map) and initializes visit state from local storage.

## Impact

- `src/app/app.tsx` and `src/app/machines/app-flow.ts`: Route coordination and initial storage boot load.
- `src/app/screens/onboarding.tsx`: Implements call sign, posture check, and beacon key steps.
- `src/app/screens/zone-map.tsx`: Implements zone node layout with star rating indicators.
- `src/app/screens/level.tsx`: Supports level transition from 0.1 to 1.1 briefing.
- `src/platform/storage/`: Used by app initialization and checkpoint handlers.
- `e2e/`: Adds and updates Playwright end-to-end tests for flows 1 and 2.
