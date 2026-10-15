# Tasks: First Run Walking Skeleton

## 1. Storage Boot Hydration & Checkpoints

- [ ] 1.1 Add unit tests in `src/app/storage/checkpoints.test.ts` for boot storage loading, onboarding profile checkpoint save, level 1.1 progress/run-log checkpoint save, and `navigator.storage.persist()` invocation upon earning the first star, verifying tests fail initially.
- [ ] 1.2 Implement checkpoint and eviction protection helpers in `src/app/storage/checkpoints.ts` using `createLocalStorage()` and verify all checkpoint unit tests pass with `pnpm test checkpoints`.

## 2. Onboarding Flow

- [ ] 2.1 Add component tests in `src/app/screens/onboarding.browser.test.tsx` verifying call sign navigation, 3-step posture confirmation with Space, beacon key detection (F then J), and completion callback, verifying tests fail initially.
- [ ] 2.2 Implement `src/app/screens/onboarding.tsx` with call sign selection, posture prompts, and beacon key check, and verify component tests pass with `pnpm test onboarding.browser`.

## 3. App Flow Machine & Level Routing

- [ ] 3.1 Update unit tests in `src/app/machines/app-flow.test.ts` for the first-run sequence (title -> onboarding -> level 0.1 -> level 1.1 -> results -> zone map) and returning visit skipping onboarding on start, verifying test failures before implementation.
- [ ] 3.2 Update `src/app/machines/app-flow.ts` and `src/app/app.tsx` to coordinate level transitions (0.1 to 1.1), integrate storage checkpoints, and hydrate visit state on boot, verifying all app-flow tests pass with `pnpm test app-flow`.

## 4. Zone Map Star Display

- [ ] 4.1 Add component tests in `src/app/screens/zone-map.browser.test.tsx` verifying Zone 1 level 1.1 displays earned star indicators matching progress and launches on Space, verifying tests fail initially.
- [ ] 4.2 Implement `src/app/screens/zone-map.tsx` to render Zone 1 with level nodes and earned star count, verifying component tests pass with `pnpm test zone-map.browser`.

## 5. End-to-End Verification & Validation

- [ ] 5.1 Implement Playwright test in `e2e/first-run.spec.ts` for Flow 1 (first run from title through onboarding, level 0.1, level 1.1 to results with stars and zone map) and verify with `pnpm test:e2e first-run`.
- [ ] 5.2 Implement Playwright test in `e2e/first-run.spec.ts` for Flow 2 (browser reload restores saved progress and skips onboarding directly to hub/zone map) and verify with `pnpm test:e2e first-run`.
- [ ] 5.3 Complete the visual and game-feel playtest checklist from `docs/horizontals/08-testing-and-dev-practices.md` across the first-run screens.
- [ ] 5.4 Run full repository verification with `pnpm check` to ensure typecheck, lint, content check, tests, and build all pass.
