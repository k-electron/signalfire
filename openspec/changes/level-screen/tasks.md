# Tasks

## 1. Core and Engine Live Metrics

- [ ] 1.1 Write tests for `waiting-lanes` live metrics (Integrity percentage and Velocity net WPM) and HUD bridge velocity forwarding in `src/core/sim/waiting-lanes.test.ts` and `src/engine/bridge/hud-bridge.test.ts`. Verify tests fail initially.
- [ ] 1.2 Implement live metrics in `src/core/sim/waiting-lanes.ts`, update `src/engine/bridge/hud-bridge.ts`, and update `src/app/stores/hud.ts` to include velocity. Verify tests pass with `pnpm test:unit`.

## 2. Level Lifecycle State Machine

- [ ] 2.1 Write unit tests for `levelLifecycleMachine` in `src/app/machines/level-lifecycle.test.ts` covering initial state `loading`, transitions to `briefing`, countdown ticks and transition to `playing`, pause on Escape and blur, resume countdown, run finish transition, results display, and error state. Verify tests fail initially.
- [ ] 2.2 Implement `levelLifecycleMachine` in `src/app/machines/level-lifecycle.ts` using XState with context for level metadata, countdown ticks, live HUD metrics, run summary, and missed-bar reports. Verify with `pnpm test:unit src/app/machines/level-lifecycle.test.ts`.

## 3. Level Screen, HUD, Pause, and Results

- [ ] 3.1 Update `src/app/machines/app-flow.ts` and `src/app/app.tsx` to route `level` through the level lifecycle machine and delegate key handling on `level`. Update `src/app/machines/app-flow.test.ts` and verify with `pnpm test:unit`.
- [ ] 3.2 Implement the level briefing card and 3-2-1 countdown overlay in `src/app/screens/level.tsx` using token styles. Verify with browser tests.
- [ ] 3.3 Implement the minimal HUD (Integrity %, Velocity WPM, Score, Combo) and in-level pause overlay with Resume and Quit in `src/app/screens/level.tsx` and `src/app/screens/pause.tsx`, attaching window blur and Escape listeners. Verify with browser tests.
- [ ] 3.4 Implement the full results screen in `src/app/screens/results.tsx` presenting earned stars, score, Integrity %, Velocity WPM, and missed-bar shortfall text when 1-star bar is missed, with Continue returning to the zone map. Verify with browser tests.
- [ ] 3.5 Update and add Vitest browser tests in `src/app/screens/level.browser.test.tsx` and `src/app/app-flow.browser.test.tsx` covering briefing launch, HUD metrics, pause overlay, and results. Verify with `pnpm test`.

## 4. End-to-End Verification and Polish

- [ ] 4.1 Create Playwright e2e test `e2e/level-screen.spec.ts` covering (1) playing level 1.1 through briefing and countdown to results with stars, and (2) pausing mid-level on Escape, verifying the pause overlay, and resuming through countdown back into gameplay. Verify with `pnpm test:e2e`.
- [ ] 4.2 Fill the playtest checklist from `docs/horizontals/08-testing-and-dev-practices.md` for visual and feel verification across briefing, countdown, HUD, pause overlay, and results screen.
- [ ] 4.3 Run `pnpm check` (typecheck, lint, content check, unit/browser tests, and production build) and verify clean pass.
- [ ] 4.4 Conduct independent fresh-context review against spec, docs, and constitution (Constitution C10), resolving any findings.

## Workflow follow-up

- Archive the change after Karim approves the proposal, the implementation lands, and review requirements are satisfied.
- Verify the archived spec delta merges into `openspec/specs/`.
