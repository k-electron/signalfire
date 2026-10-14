# Tasks

## 1. Tokens and tests

- [ ] 1.1 Set `motion.scene.easing` to `[1, 0, 0, 1]` and keep micro easing as `ease-out`. Change `tools/tokens/generate.mjs` so `--ease-micro` and `--ease-scene` are copied from those fields. Run `pnpm tokens` and verify `src/app/theme/tokens.css` contains `--ease-scene: cubic-bezier(1, 0, 0, 1)` and `--ease-micro: ease-out`, and that a second `pnpm tokens` prints that the file is fresh.
- [ ] 1.2 Replace `src/core/theme/tokens.test.ts` with one test that reads `tokens.css` and compares `--ease-micro` and `--ease-scene` to the values on `tokens.motion`, without a second copy of the numbers or the hex table. Run `pnpm test:unit src/core/theme/tokens.test.ts` and verify it passes.
- [ ] 1.3 Delete `WithOptionalInput`. Pass `{ input: undefined }` for a first run and `{ firstRun: false }` for a return visit. Run `pnpm test:unit src/app/machines/app-flow.test.ts` and `pnpm typecheck` and verify both pass.

## 2. Keyboard and pause

- [ ] 2.1 Write failing tests for: back from the level is pause; Escape on the level opens pause; Space and Escape on pause return to the level; Space on the title still begins when focus is not assumed. Run `pnpm test:unit src/app/machines/app-flow.test.ts` and verify the new transition and `keyToEvent` tests fail.
- [ ] 2.2 Add the `pause` state, the Pause screen with heading Pause, the window keydown listener, and the focus-ring paint on the selected hub and results item. Run `pnpm test:unit src/app/machines/app-flow.test.ts` and verify it passes.
- [ ] 2.3 Add a browser test that focuses `document.body` on the title and presses Space, and that the selected hub item exposes the focus ring while the others do not. Run `pnpm test src/app` and verify it passes.
- [ ] 2.4 Fill the playtest checklist in `docs/horizontals/08-testing-and-dev-practices.md` for the selection paint and the pause stand-in: keyboard only, Escape from the level, Space to resume. Attach a screenshot of the hub with the galaxy map item selected.

## 3. CI, specs, and wording

- [ ] 3.1 Rewrite `.github/workflows/ci.yml`: least-privilege permissions, `pnpm/action-setup` at the v4 commit, no Node-path step, no Chromium-directory step, pnpm-store cache before install, browser cache after install. If action-setup cannot run `pnpm install --frozen-lockfile` on the lockfile runtime, record the reason in `design.md` and keep a repo-local pnpm install, and update the ci-pipeline delta in the same commit. Verify the workflow file matches the spec that landed.
- [ ] 3.2 Add a lint check that `.node-version` equals the lockfile's single `node@runtime` version, with the digits only in the lockfile and in `.node-version`. Point horizontal 10 and the static-hosting wording at those fields. Run `pnpm lint` and verify it passes, and that a one-character edit of `.node-version` makes the node check fail; restore the file afterward.
- [ ] 3.3 Apply the spec deltas: positive scenarios in ci-pipeline, test-harness, and layer-boundaries; remove verzod from the layer-boundaries spec and delete `tools/layer-boundaries/fixtures/fail/core-verzod`. Run `pnpm lint` and verify the fixture proof passes.
- [ ] 3.4 Add `@types/culori` 4.0.1 and delete `e2e/culori.d.ts`. If the e2e converter does not typecheck, drop the culori import from `e2e/theme.spec.ts` and compare the computed colors without it. Run `pnpm typecheck` and verify it passes.
- [ ] 3.5 Remove the sentence "Specs already shipped stay as they are." from decision 0001. Update the core test bullet in `src/AGENTS.md` to C4's split. Set the README play line to `https://signalfire.k-electron.workers.dev/` and the status to Stage 0 done, Stage 1 not started. Verify those three files read that way.
- [ ] 3.6 Read the Tests job log after the pull request runs. If the browser cache misses, fix the restore order or the key, say what the log showed, and verify the next run restores it.

## 4. Review

- [ ] 4.1 Ask a fresh-context reviewer to check the diff against the deltas, vertical 11's pause stand-in, decision 0001, and C1–C10, and to report correctness gaps only. Fix or answer each finding.

## Workflow follow-up

- Branch `change/review-cleanup` from current `main`. Open the pull request. Archive this change before squash-merge. Karim merges (constitution C3).
