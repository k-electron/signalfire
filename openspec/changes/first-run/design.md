# Design: First Run Walking Skeleton

## Context

Stage 2 of the roadmap bridges pure core domain logic (scoring, simulation, document storage schemas) with the player-facing application layer. Currently:
- `src/platform/storage/indexed-db.ts` provides `createLocalStorage(): Storage`, which exposes a `DocumentStore` covering `profile`, `progress`, `settings`, `run-index`, and `run:<runId>`.
- `src/app/machines/app-flow.ts` provides `appFlowMachine` for managing high-level screen navigation.
- `src/app/screens/level.tsx` hosts the fixed-step loop and PixiJS canvas for waiting lanes gameplay.
- `src/app/screens/onboarding.tsx` and `src/app/screens/zone-map.tsx` are temporary placeholder headings.
- Bundled campaign data in `src/app/content/campaign.ts` already includes levels `level:0.1`, `level:1.1`, zones `zone:0`, `zone:1`, and tuning `waiting-lanes`.

This design details the wiring of storage hydration, onboarding progression, sequential level transitions, checkpoint writes, and eviction protection.

## Goals / Non-Goals

**Goals:**
- Hydrate player profile and progress from local storage on boot, skipping onboarding when an existing profile is found.
- Implement an interactive thin onboarding screen covering call sign selection, posture check, and beacon key discovery (F and J).
- Route first-run player seamlessly from onboarding through level 0.1, into level 1.1 briefing and gameplay, through results, and onto the zone map.
- Write storage checkpoints: `profile` on onboarding completion; `progress`, `run-log`, and `run-index` on level 1.1 completion.
- Invoke `navigator.storage.persist()` when the player earns their first star.
- Render Zone 1 in `ZoneMap` with the level 1.1 node displaying earned stars from stored progress.
- Validate end-to-end flows 1 (first run) and 2 (reload) via Playwright tests.

**Non-Goals:**
- Audio integration (Tone.js / procedural music) is deferred to Stage 4.
- Level 0.2 ("Eight Docks") home keys drill is deferred to a future change.
- Multi-dialogue narrative cutscenes (dialogues remain single-line character prompts).
- Cloud synchronization with Puter.js and cross-tab Web Locks sync (deferred to Stage 3).

## Decisions

### 1. Storage Boot Hydration and Visit State

**Choice**: At startup (`src/app/app.tsx`), query `createLocalStorage()` for `profile` and `progress`. If a valid `profile` with `onboardingComplete: true` is found, set `firstRun: false` and hydrate the player's progress into memory. If no profile exists, retain `firstRun: true`.
**Rationale**: Keeps `appFlowMachine` pure while enabling initial state customization on boot.
**Alternatives considered**:
- *Synchronous storage wrapper*: Rejected because IndexedDB and schema migrations are asynchronous.
- *Querying storage at each transition*: Rejected because visit type and profile are foundational session attributes.

### 2. Onboarding Screen Architecture

**Choice**: Implement `src/app/screens/onboarding.tsx` with sequential interactive steps:
1. `call-sign`: Displays generated cadet call signs (e.g. "Cadet Nova", "Beacon One", "Vanguard", "Skiff Pilot"). Arrow keys navigate, Space selects.
2. `posture`: Displays 3 successive prompts ("Sit tall", "Wrists floating", "Eyes on the screen"), each confirmed with Space.
3. `beacons`: Prompts the player to find the physical bumps on F and J. Awaits `f` then `j` keystrokes.
4. Completion: Fires `onComplete({ callSign, preferredThumb: 'either' })`.
**Rationale**: Matches the vertical 11 onboarding sequence without overwhelming the player. Space remains the universal confirmation action.
**Alternatives considered**:
- *Freeform text input for call sign*: Rejected; vertical 11 specifies generated list during onboarding with custom naming reserved for Settings.

### 3. Level 0.1 to 1.1 Sequencing

**Choice**: Onboarding completion immediately transitions `appFlowMachine` to `level` with `levelId: "level:0.1"`. Level 0.1 operates as an intro level (no star bars). When level 0.1 completes, `appFlowMachine` advances to `level:1.1` (which opens the briefing card for First Light). Level 1.1 completes to `results`, which continues to `zoneMap`.
**Rationale**: Follows vertical 11's schedule where stars and results are introduced after level 1.1. Level 0.1 serves as an unrated mechanics orientation.
**Alternatives considered**:
- *Showing results after level 0.1*: Rejected because level 0.1 has no star bars or medals.

### 4. Checkpoints & Eviction Protection Integration

**Choice**:
- Checkpoint 1 (Onboarding): Call `storage.save("profile", profileDoc)`.
- Checkpoint 2 (Level 1.1 End): Call `storage.save("progress", progressDoc)`, `storage.save("run-index", indexDoc)`, and `storage.save("run:<runId>", logDoc)`.
- Eviction Protection: In `onFinish` when `stars >= 1`, execute:
  ```ts
  if (typeof navigator !== "undefined" && "storage" in navigator && typeof navigator.storage.persist === "function") {
    navigator.storage.persist().catch(() => {});
  }
  ```
**Rationale**: Meets horizontal 06 checkpoint specifications. Non-blocking async persistence guarantees gameplay is never paused or interrupted by disk I/O.
**Alternatives considered**:
- *Awaiting persistence before showing results*: Rejected because browser prompt or failure would delay results transition.

### 5. Zone Map Screen Implementation

**Choice**: Replace placeholder `ZoneMap` with a component rendering Zone 1 ("The Drift"). It reads the current `progress` document from props or store to display:
- Sector heading and zone title ("Zone 1: The Drift").
- Level 1.1 node ("First Light") with 3 star slots indicating earned stars (e.g. `★☆☆`).
- Space or click on the node launches the level.
**Rationale**: Satisfies the first-run exit criterion where the zone map visually confirms earned stars.

## Risks / Trade-offs

- **[Risk]** Storage load latency during app boot could cause a flash of content.
  - **Mitigation**: The app begins at `boot` state; storage resolves before transitioning to `title` via `ready`.
- **[Risk]** Headless environments in CI/Playwright lack `navigator.storage.persist`.
  - **Mitigation**: Guard with feature detection and silent error handling.
- **[Risk]** Fast simulation in E2E tests for waiting lanes levels.
  - **Mitigation**: Maintain dev-only finish button / clock fast-forward mechanisms used in existing level test harness.
