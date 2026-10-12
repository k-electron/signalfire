# Proposal

## Why

Stage 0 cannot be test-first until the runners exist. Task 0.2 adds them, so later logic changes can write a failing test before the code (constitution C4). This change does not add game logic.

## What Changes

- Add Vitest 5 with two projects: a Node project for `src/**/*.test.ts`, and a browser project (Playwright provider, Chromium, headless) for `src/**/*.browser.test.tsx`. `pnpm test` runs both. `pnpm test:unit` runs the Node project only.
- Add fast-check and `@fast-check/vitest` for property tests in the Node project. A failing property prints the seed.
- Add Playwright end-to-end tests in `e2e/`, run by `pnpm test:e2e` against `vite preview` of the production build. A fixture installs Playwright's fake clock before navigation, and the smoke test steps it.
- Install browser binaries inside the repo. `PLAYWRIGHT_BROWSERS_PATH=0` is set by the pnpm scripts that install or launch a browser, not by the developer shell. `pnpm browsers:install` installs Chromium.
- Extend `pnpm check` to typecheck, lint, `pnpm test`, and build. End-to-end stays out of `check`. No coverage tool and no coverage threshold.
- Lefthook `pre-push` runs `pnpm test:unit` and rejects the push when a Node test fails.
- Add one labeled harness smoke test per kind: Node logic, property, component, end-to-end. The end-to-end smoke loads the production page and sees the "Signalfire" heading. Do not delete these tests later.
- Update the command tables that still say these scripts arrive later. Do not add CI (task 0.4) or the `src/` layer folders (task 0.3).

## Capabilities

### New Capabilities

- `test-harness`: The repo runs Node logic tests, fast-check property tests, Vitest browser component tests, and Playwright end-to-end tests from pnpm scripts. Browser binaries stay inside the repo. `pnpm check` runs the Vitest projects. Pre-push runs the Node tests and blocks on failure.

### Modified Capabilities

- `hermetic-toolchain`: A clean checkout runs `pnpm browsers:install` before `pnpm check`. `pnpm check` now runs the Vitest projects before the build, so install alone is not enough for that command to pass. `openspec-configuration` is unchanged: root `AGENTS.md` stays under 200 lines.

The working tree this proposal was written from is one commit behind `origin/main`. `openspec list --specs` here shows only `openspec-configuration`. The hermetic spec was read from `origin/main` (`f6ee037`, `openspec/specs/hermetic-toolchain/spec.md`).

## Impact

- Edited: `package.json`, `pnpm-lock.yaml`, `tsconfig.json` (include the test files and the two new configs), `lefthook.yml`, `.gitignore` only if a tool writes a new output directory, `AGENTS.md`, `docs/horizontals/02-repo-setup.md`, `docs/horizontals/08-testing-and-dev-practices.md` (the Sources line that cites Vitest 4), `README.md` (the sentence that says tests arrive later).
- New: `vitest.config.ts`, `playwright.config.ts`, `e2e/fixtures.ts`, `e2e/harness-smoke.spec.ts`, `src/harness-smoke.test.ts`, `src/harness-smoke.property.test.ts`, `src/app.browser.test.tsx`.
- Unchanged: the Signalfire page, game logic, `src/` layer folders, GitHub Actions, Cloudflare, roadmap status, `openspec/config.yaml`.
- No new runtime dependency.
- Dev dependencies, exact pins, all published at least one day before 2026-10-12 so `minimumReleaseAge: 1440` accepts them. Playwright alphas are not used.

| Package | Version | Published | License |
|---|---|---|---|
| `vitest` | 5.0.3 | 2026-09-30 | MIT |
| `@vitest/browser-playwright` | 5.0.3 | 2026-09-30 | MIT |
| `playwright` | 1.64.0 | 2026-10-07 | Apache-2.0 |
| `playwright-core` | 1.64.0 | 2026-10-07 | Apache-2.0 |
| `@playwright/test` | 1.64.0 | 2026-10-07 | Apache-2.0 |
| `fast-check` | 4.10.2 | 2026-09-19 | MIT |
| `@fast-check/vitest` | 0.5.0 | 2026-09-11 | MIT |

`vitest` 5.0.3 engines are `^22.12.0 || ^24.0.0 || >=26.0.0`, which accepts the pinned Node 26. It peers Vite `^6.4.0 || ^7.0.0 || ^8.0.0` (this repo has Vite 8.3.4). Vite is a peer of Vitest 5, not a dependency of it, and this repo already depends on Vite. `@fast-check/vitest` 0.5.0 peers Vitest `^4.1.0 || ^5.0.0` and depends on fast-check `^3 || ^4`. `@vitest/browser-playwright` 5.0.3 peers `vitest@5.0.3` and `playwright: *`. `playwright-core` is a direct dependency at the same version as `playwright`, because pnpm does not hoist it and the browser binaries have to land at `node_modules/playwright-core/.local-browsers`. Playwright 1.64.0 engines are `node: >=20`. The registry documents no lifecycle `scripts` on `playwright@1.64.0` or `playwright-core@1.64.0`. Apply still confirms `pnpm install` does not need a new `allowBuilds` entry. If it does, the pull request names the package and why. Do not allow a Playwright postinstall to download browsers; `pnpm browsers:install` is the only download.

## Principles served

- **P13.** This is the thin test path. Later stages deepen game logic on top of it.
- P1–P12 are not served. Nothing the player sees, hears, or does changes.

## Docs implemented

- `docs/ROADMAP.md` Stage 0, task 0.2. Sequence only. Status stays "Not started".
- `docs/horizontals/01-constitution.md`: C4, C5, C7, C8, C9. This change does not edit the constitution.
- `docs/horizontals/02-repo-setup.md`: scripts table, hooks table, and the unit-test naming row (browser and end-to-end filenames).
- `docs/horizontals/03-tech-stack.md`: the Testing row points at horizontal 08. No edit unless apply finds a sentence that names a runner this change does not install.
- `docs/horizontals/08-testing-and-dev-practices.md`: Vitest in Node, Vitest browser mode with Playwright, fast-check, Playwright end-to-end, fake clock, no coverage threshold, logic tests on pre-push. The decision row already says Vitest with no major. The Sources line that cites Vitest 4 is updated to the Vitest 5 browser guide.
- `docs/horizontals/10-ci-cd-and-hosting.md`: CI is task 0.4 and is not added. The doc already lists `pnpm test` and `pnpm test:e2e` as future CI checks.

## Departures

- Horizontal 08 and `AGENTS.md` say not to write tautological tests. The Node smoke (`1 + 1`) and the property smoke (an integer equals itself) only prove the runners. They are labeled harness smoke tests. The rule text stays. The component and end-to-end smokes assert the existing "Signalfire" heading, which is the page outcome `hermetic-toolchain` already requires.
- C4 says every OpenSpec scenario maps to a test. The four runner scenarios are the smoke tests. The hermetic-path, `pnpm check` contents, seed print, and pre-push scenarios are command checks in `tasks.md`: a test cannot watch the hook that runs the tests, or prove a directory outside the repo was not written, without circular setup. This is the same kind of command evidence `hermetic-toolchain` recorded. It is not a constitution amendment, and the standing rule is not edited.
- Task 0.2 originally said Vitest 4. Karim chose Vitest 5.0.3, the current stable. Horizontal 08's decision row says Vitest with no major. The Sources line that cites a Vitest 4 article is updated in this change.
- No decision record. The documented test runner is Vitest, and the major is the current stable. The file layout, the fake clock, and the hook are what horizontal 08 and task 0.2 already ask for.

## Assumptions

- Apply branches from main that contains the hermetic toolchain (`f6ee037` or later), including `package.json` and the Signalfire page.
- `pnpm test:unit` exists so pre-push can run Node tests without launching a browser. `pnpm test` remains both projects.
- `pnpm test` is one-shot (`vitest run`), not watch mode.
- End-to-end is not part of `pnpm check`. It builds the app and launches a browser, so it is a separate command. Pre-push does not run it either.
- Chromium only. Firefox and WebKit are not installed. Horizontal 03's browser support is the product matrix, not this harness.
- The component smoke mounts `App` with `react-dom/client`, the same call as `src/main.tsx`. `vitest-browser-react` is not added.
- The fake-clock fixture calls `page.clock.install` before the test body, at `2026-01-01T00:00:00.000Z`. The end-to-end smoke then pauses and `runFor`s one second. Later gameplay tests type with `keyboard.type` delays, as horizontal 08 says. This change does not add a typing helper.
- Browser mode is headless so `pnpm check` does not open a window.
- No coverage package. Horizontal 08 says no threshold.
- `allowBuilds` stays `lefthook` only unless the install probe reports another required build.

## Constitution check

- **C1.** One capability, `test-harness`. Not a C1 exemption. Apply waits for approval.
- **C2.** Principles, docs, and the departures are stated. The tautological smokes stay labeled, and the rule stays. The Vitest major is resolved by pinning 5.0.3 and updating the horizontal 08 source line.
- **C3.** Karim approves this proposal before apply. The agent does not merge and does not push to `main`. CI does not exist (task 0.4), so this pull request cannot be CI-green. `pnpm check` is the local gate.
- **C4.** This change builds the runners. It does not implement a logic domain. See Departures for which scenarios are smoke tests and which are command checks.
- **C5.** New TypeScript stays strict. No `any`. No `@ts-ignore`. Test files and the two configs are included in `tsconfig.json` so `pnpm typecheck` sees them.
- **C6.** No decision record. See Departures.
- **C7.** No new runtime dependency. The packages above are dev dependencies.
- **C8.** Command and filename edits stay in root `AGENTS.md`, tool-agnostic, under 200 lines (140 lines on `origin/main` today). `CLAUDE.md` stays `@AGENTS.md`. Nested instruction files stay as they are.
- **C9.** Config, tests, docs, the delta spec, and `tasks.md` land together. Roadmap status stays "Not started" because Stage 0 is not done. Archive copies the delta into `openspec/specs/`.
- **C10.** Non-trivial. Tasks require a fresh-context review of the diff before the pull request is treated as ready. That review has not been done yet.
