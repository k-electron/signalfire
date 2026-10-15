# Tasks

## 1. Level Lifecycle State Machine

- [ ] 1.1 Write failing unit tests in `src/app/machines/level-lifecycle.test.ts` covering all state transitions: loading → briefing → countdown → playing ⇄ paused → finishing → results, and error transitions.
- [ ] 1.2 Implement the `level-lifecycle` state machine in `src/app/machines/level-lifecycle.ts` using XState v5 and verify all machine unit tests pass.

## 2. Velocity and HUD Bridge Updates

- [ ] 2.1 Write failing unit tests in `src/engine/bridge/hud-bridge.test.ts` verifying Velocity (net WPM) is included in throttled HUD snapshots.
- [ ] 2.2 Update `HudSnapshot` and `createHudBridge` in `src/engine/bridge/hud-bridge.ts` and `useHudStore` in `src/app/stores/hud.ts` to include `netWpm`, and verify bridge unit tests pass.

## 3. Screen Views and Stand-in Replacement

- [ ] 3.1 Write component tests in `src/app/screens/level.browser.test.tsx` covering the briefing card, countdown, minimal HUD (Integrity, Velocity, Score, Combo), pause overlay (Resume, Quit), and results screen with stars and missed-bar message.
- [ ] 3.2 Update `src/app/screens/level.tsx` to host the `level-lifecycle` machine, manage engine loop freeze/resume, handle `Escape` and focus loss (`blur`), and render the corresponding sub-views.
- [ ] 3.3 Update `src/app/screens/results.tsx` to display earned stars, final score, Velocity, Integrity, and exact missed-bar message, with Continue and Hub actions.
- [ ] 3.4 Update `src/app/machines/app-flow.ts` and `src/app/app.tsx` to retire the stand-in `pause` state and screen, routing level exit and completion to the zone map or hub.
- [ ] 3.5 Complete the visual and feel playtest checklist from `docs/horizontals/08-testing-and-dev-practices.md` and attach playtest evidence.

## 4. End-to-End Tests and Verification

- [ ] 4.1 Write Playwright end-to-end test in `e2e/level-screen.spec.ts` that plays level 1.1 from briefing to results with stars.
- [ ] 4.2 Write Playwright end-to-end test in `e2e/level-screen.spec.ts` that pauses and resumes mid-level with countdown.
- [ ] 4.3 Run `pnpm check` and verify typecheck, lint, content check, unit and browser tests, and production build all pass.
- [ ] 4.4 Run `pnpm test:e2e` and verify all end-to-end specs pass.
- [ ] 4.5 Perform independent fresh-context verification of the full diff against constitution principles C1–C10 and OpenSpec specs.
