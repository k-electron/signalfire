# Tasks

## 1. Node runner and pre-push

- [x] 1.1 Branch `change/test-harness` from `origin/main` at `f6ee037` or later, so `package.json` and the Signalfire page exist. Verify `git merge-base --is-ancestor f6ee037 HEAD`.
- [x] 1.2 Add `src/harness-smoke.test.ts` and `src/harness-smoke.property.test.ts` as labeled harness smokes (names start with `harness smoke:`). The logic smoke expects `1 + 1` to be `2`. The property smoke uses `test.prop` and `fc.integer` from `@fast-check/vitest` and asserts the integer equals itself. Run `pnpm test:unit` and verify it fails because the script is not defined yet.
- [x] 1.3 Add exact dev dependencies `vitest@5.0.3`, `fast-check@4.10.2`, and `@fast-check/vitest@0.5.0` with pnpm. Add `vitest.config.ts` with the `unit` project from design.md (`environment: 'node'`, include `src/**/*.test.ts`, exclude `src/**/*.browser.test.ts`). Add `test:unit` as `vitest run --project unit`. Include `vitest.config.ts` in `tsconfig.json`. Verify `pnpm test:unit` passes, `pnpm typecheck` passes, and `pnpm lint` passes.
- [x] 1.4 Run `pnpm test:unit` before any browser install. Verify both smokes pass and the output does not mention Chromium or a browser launch.
- [x] 1.5 Temporarily fail the property smoke. Run `pnpm test:unit` and verify the output includes `seed`. Restore the passing predicate. Verify `pnpm test:unit` passes and the diff no longer contains the temporary failure.
- [x] 1.6 Add Lefthook `pre-push` running `pnpm test:unit`. Run `pnpm exec lefthook install` if `.git/hooks/pre-push` is missing. Verify the hook file invokes `pnpm test:unit` and does not invoke `pnpm test` or `pnpm test:e2e`.
- [x] 1.7 With browser binaries not installed and the Node smokes passing, run `pnpm exec lefthook run pre-push`. Verify the hook exits 0.
- [x] 1.8 Break the logic smoke, run `git push --dry-run` on `change/test-harness`, and verify the hook rejects the push before any remote update. Restore the smoke. Verify `pnpm test:unit` passes and `git status` shows no commit from the dry run.
- [x] 1.9 Update the `AGENTS.md` Commands table and the scripts and hooks tables in `docs/horizontals/02-repo-setup.md` so `pnpm test:unit` and pre-push (`pnpm test:unit`) are listed, and the "pre-push arrives with task 0.2" sentence is gone. Verify those rows match `package.json` and `lefthook.yml`.

## 2. Browser project

- [x] 2.1 Add `src/app.browser.test.tsx`, a labeled harness smoke that mounts `App` with `createRoot` from `react-dom/client` and expects the heading Signalfire. Run `pnpm test:unit` and verify it does not collect that file. Run `pnpm test` and verify pnpm reports the script is missing.
- [x] 2.2 Add exact dev dependencies `playwright@1.64.0` and `@vitest/browser-playwright@5.0.3` with pnpm. Read the install log. If `ERR_PNPM_IGNORED_BUILDS` names a package whose script is required for the tool to start, add it to `allowBuilds` and record why. Do not allow a script that downloads browsers. Verify `allowBuilds` is otherwise still only `lefthook`.
- [x] 2.3 Add the `browser` project from design.md (headless Chromium, `playwright()` provider, include `src/**/*.browser.test.tsx`). Put the React plugin on the root of `vitest.config.ts`. Keep `browser` off the root and off the unit project. Set `PLAYWRIGHT_BROWSERS_PATH=0` in `vitest.config.ts` and in the `test` and `browsers:install` scripts from design.md. Verify `pnpm exec playwright --version` prints `1.64.0`. If `pnpm test:unit` launches Chromium, set `extends: false` on the unit project and move the React plugin onto the browser project. Verify `pnpm test:unit` still passes without a browser.
- [x] 2.4 Run `pnpm browsers:install` with `PLAYWRIGHT_BROWSERS_PATH` unset in the parent shell. Verify Chromium is under `node_modules/playwright-core/.local-browsers`. Record whether `~/Library/Caches/ms-playwright` is absent or older than the install. Verify it was not written by this command.
- [x] 2.5 Run `pnpm test` with `PLAYWRIGHT_BROWSERS_PATH` unset in the parent shell. Verify the logic, property, and component smokes pass, the component smoke is headless, and the browser resolves under `node_modules/playwright-core/.local-browsers`. Verify `pnpm typecheck` and `pnpm lint` pass.
- [x] 2.6 Confirm `package.json` has no `@vitest/coverage-v8` and `vitest.config.ts` sets no coverage threshold. Verify `pnpm test` does not print a coverage gate.
- [x] 2.7 Update the `AGENTS.md` Commands table and the doc 02 scripts table with `pnpm test`, `pnpm test -- <pattern>`, and `pnpm browsers:install`, including that browser runs need `pnpm browsers:install` after `pnpm install`. Add the `*.browser.test.tsx` naming row in doc 02 and the matching filename bullet in `AGENTS.md`. Verify the rows match the scripts.

## 3. End-to-end

- [x] 3.1 Add `e2e/harness-smoke.spec.ts` as a labeled harness smoke: heading Signalfire, then `pauseAt` `2026-01-01T00:00:01.000Z`, `runFor(1000)`, and `Date.now()` equals `2026-01-01T00:00:02.000Z`. It must use the fixture from the next task, so leave the import pointed at `./fixtures`. Run `pnpm test:e2e` and verify it fails because the script is not defined yet.
- [x] 3.2 Add exact dev dependency `@playwright/test@1.64.0`. Add `playwright.config.ts` and `e2e/fixtures.ts` from design.md (`page.clock.install` at `2026-01-01T00:00:00.000Z` before the test body, preview on `127.0.0.1:4173`, `PLAYWRIGHT_BROWSERS_PATH=0`). Add the `test:e2e` script. Include `e2e` and `playwright.config.ts` in `tsconfig.json`. Verify `pnpm test:e2e` passes both the heading and the clock step, with the variable unset in the parent shell. If the heading never appears, stop and report. Do not drop the clock assertion or change the epoch.
- [x] 3.3 Diff `src/app.tsx`, `src/main.tsx`, and `index.html` against the branch base. Verify they are unchanged. Do not fill the playtest checklist: this change does not alter visuals or feel.
- [x] 3.4 After `pnpm test` and `pnpm test:e2e`, run `git status`. If a tool wrote an output directory that `.gitignore` does not cover, add it. Verify `node_modules` still covers `.local-browsers` and that no speculative ignore lines were added.
- [x] 3.5 Update the `AGENTS.md` Commands table, the doc 02 scripts table, and the doc 02 naming table for `pnpm test:e2e` and `e2e/*.spec.ts`. Verify the rows match `package.json`.

## 4. Check

- [x] 4.1 Change `check` to `pnpm typecheck && pnpm lint && pnpm test && pnpm build`. Verify the script text does not contain `test:e2e`.
- [x] 4.2 Run `pnpm check`. Verify typecheck, lint, both Vitest projects, and build pass, and the output does not run the end-to-end smoke.
- [x] 4.3 Update `AGENTS.md`, doc 02, and the run-locally paragraph in `README.md` so `pnpm check` is typecheck, lint, test, and build. Keep the note that content checks, tokens, and ladle arrive later. In `docs/horizontals/08-testing-and-dev-practices.md`, replace the Sources line that cites the Vitest 4 InfoQ article with the Vitest 5 browser guide (`https://vitest.dev/guide/browser/`). Leave the decision row as Vitest, with no major. Verify the file no longer says Vitest 4, `wc -l AGENTS.md` is under 200, and `CLAUDE.md` is still only `@AGENTS.md`.

## 5. Integration

- [x] 5.1 Commit the harness on `change/test-harness`. Clone that HEAD into `.tmp/test-harness-clone`. There, run `pnpm install`, then `pnpm test:unit` and `pnpm exec lefthook run pre-push` before `pnpm browsers:install`. Verify both succeed. Then run `pnpm browsers:install`, `pnpm check`, and `pnpm test:e2e`. Verify all three succeed.
- [x] 5.2 For that clone, list paths under `$HOME` newer than a marker taken before `pnpm install`, excluding this repo and the clone. Verify `~/Library/Caches/ms-playwright` is absent or older than the marker. Put that list in the pull request. Unexpected paths are a finding to report, not to delete.
- [x] 5.3 Ask a fresh-context agent that did not write the code to review the diff against this change, horizontal 08, horizontal 02, and the constitution. Verify each finding is fixed or answered in the pull request.
- [ ] 5.4 Open the pull request from `change/test-harness` with title `test: add the test harness`. Verify the body includes the OpenSpec link, constitution check, assumptions, the hermetic path list, the pre-push result, and a statement that CI does not exist so `pnpm check` was not run in CI. Do not merge.

## Workflow follow-up

- Archive this change after Karim's review requirements are satisfied and before merge, so the delta lands in `openspec/specs/test-harness/`.
- Leave `docs/ROADMAP.md` status "Not started".
