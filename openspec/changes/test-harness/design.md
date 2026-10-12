# Design

## Context

See proposal.md for why. The base is the merged hermetic toolchain on `origin/main` (`f6ee037`): Vite 8, React 19, TypeScript 7, Biome, Lefthook, pnpm 12.11.2, Node 26 via `devEngines.runtime`. `pnpm check` is typecheck, then lint, then build. Lefthook has `pre-commit` and `commit-msg` only. `allowBuilds` is `lefthook: true`. `strictDepBuilds` and `minimumReleaseAge: 1440` are set. The store and cache are `.pnpm-store` and `.pnpm-cache`. The page is an `h1` whose text is Signalfire (`src/app.tsx`). `.gitignore` already ignores `coverage/`, `test-results/`, `playwright-report/`, `blob-report/`, and `playwright/.cache/`.

Versions below were read from the npm registry on 2026-10-12. Each publish time is at least one day earlier. Vitest `latest` stable was 5.0.3, and that is the pin. Playwright `latest` stable was 1.64.0. A 1.65.0 alpha was newer and is not used.

## Goals / Non-Goals

**Goals:**

- Two Vitest 5 projects behind `pnpm test`, plus `pnpm test:unit` for the hook.
- Playwright end-to-end against `vite preview`, with the fake clock installed before navigation.
- Chromium binaries only under `node_modules/playwright-core/.local-browsers`.
- Four labeled harness smokes, and command checks for the seed, the home-directory cache, `pnpm check`, and pre-push.

**Non-Goals:**

- Game logic, `src/core` and the other layer folders, CI, coverage, Firefox, WebKit, watch mode, `vitest-browser-react`, a typing helper.

## Decisions

### Vitest projects in `vitest.config.ts`

`vite.config.ts` stays the app config. Vitest loads `vitest.config.ts` when that file exists, so the dev server does not carry test projects.

Two projects, matching the [Vitest browser guide](https://vitest.dev/guide/browser/):

- `unit`: `environment: 'node'`, `include: ['src/**/*.test.ts']`, `exclude: ['src/**/*.browser.test.ts']`. The exclude stops a future `*.browser.test.ts` file matching the `*.test.ts` include. `*.browser.test.tsx` is already outside that include.
- `browser`: `include: ['src/**/*.browser.test.tsx']`, `browser.enabled: true`, `browser.headless: true`, `browser.provider: playwright()` from `@vitest/browser-playwright`, `browser.instances: [{ browser: 'chromium' }]`.

Vitest 5 inline projects inherit the root config, including Vite plugins (`extends` defaults to true). Put `@vitejs/plugin-react` on the root of `vitest.config.ts`, same plugin as `vite.config.ts`. Keep `browser` on the browser project only, so the unit project does not inherit browser mode. Do not set `extends: false` unless `pnpm test:unit` launches Chromium. If it does, set `extends: false` on the unit project and put the React plugin on the browser project. That does not change the spec.

`clearMocks` defaults to true in Vitest 5. The smokes do not assert mock history, so leave the default.

`pnpm test` is `vitest run` (one shot, both projects). `pnpm test:unit` is `vitest run --project unit`. Extra arguments pass through, so `pnpm test -- <pattern>` still filters.

Alternatives: a `test` block inside `vite.config.ts` (couples the app server to the runners); a `vitest.workspace` file (the browser guide uses `test.projects`).

### Exact dev dependencies

Write exact versions, no ranges. Install with pnpm from this repo (`pnpm add -D ...`), not npm or npx.

| Package | Version | Why this one |
|---|---|---|
| `vitest` | 5.0.3 | Newest stable. Engines accept Node 26. Peers Vite 6.4, 7, or 8. Vite stays the existing direct dependency. |
| `@vitest/browser-playwright` | 5.0.3 | Provider package. Peers `vitest@5.0.3` and `playwright`. `@vitest/browser` stays transitive. |
| `playwright` | 1.64.0 | Provider peer. Same version as the test runner so one Chromium build serves both. |
| `@playwright/test` | 1.64.0 | End-to-end runner. |
| `fast-check` | 4.10.2 | Direct pin. `@fast-check/vitest` would otherwise accept `^3` or `^4`. |
| `@fast-check/vitest` | 0.5.0 | Peers Vitest 4.1 and 5. `test.prop` is the API. |

Do not add `@vitest/coverage-v8`, `@vitest/browser` as a direct dependency, or `vitest-browser-react`.

The component smoke mounts with `createRoot` from `react-dom/client` and asserts through `page` from `vitest/browser`, which the browser guide uses without a framework package. `vitest-browser-react` can arrive with the first real component test that needs it.

If `playwright` and `@playwright/test` both ship a `playwright` bin, keep both pins and confirm `pnpm exec playwright --version` prints 1.64.0.

### `allowBuilds`

The registry documents no lifecycle scripts on `playwright@1.64.0` or `playwright-core@1.64.0`. Do not add them to `allowBuilds`. `pnpm browsers:install` is the only browser download.

Apply reads the `pnpm install` log. If `ERR_PNPM_IGNORED_BUILDS` names a package whose script is required for the tool to start, add that package to `allowBuilds` and say why in the pull request. Do not allow a script that downloads browsers.

### Hermetic browser path

Playwright's hermetic install (`PLAYWRIGHT_BROWSERS_PATH=0`) writes to `node_modules/playwright-core/.local-browsers`. pnpm does not hoist a transitive `playwright-core`, so that package is also a direct dev dependency at the same version as `playwright`. The browsers then sit on the path the spec names. The path is read when a browser launches, and `playwright install` reads it from the environment. It does not read our Playwright config.

Set the variable in three places:

1. Script prefix on `test`, `test:e2e`, and `browsers:install`, so the process starts with it. This is the path the spec requires.
2. The first lines of `vitest.config.ts` and `playwright.config.ts` assign `process.env.PLAYWRIGHT_BROWSERS_PATH = '0'` before browsers launch. ESM imports run first; launch happens after the config module evaluates. The script prefix is the guarantee. The config line covers `pnpm exec` when the variable was unset.
3. `test:unit` and `pre-push` do not launch a browser. They do not need the variable. The Vitest config may still assign it when the unit project loads. That assignment must not download or spawn Chromium.

`browsers:install` is `PLAYWRIGHT_BROWSERS_PATH=0 playwright install chromium`.

Scripts:

| Script | Command |
|---|---|
| `test` | `PLAYWRIGHT_BROWSERS_PATH=0 vitest run` |
| `test:unit` | `vitest run --project unit` |
| `test:e2e` | `pnpm build && PLAYWRIGHT_BROWSERS_PATH=0 playwright test` |
| `browsers:install` | `PLAYWRIGHT_BROWSERS_PATH=0 playwright install chromium` |
| `check` | `pnpm typecheck && pnpm lint && pnpm test && pnpm build` |

`check` keeps the hermetic order and inserts `pnpm test` before the build. End-to-end stays out: it builds again inside `test:e2e` and launches Playwright.

Alternative: a postinstall download. Rejected. `strictDepBuilds` would ignore it unless `allowBuilds` allowed it, and a postinstall without the variable writes `~/Library/Caches/ms-playwright`.

### End-to-end clock and preview

`playwright.config.ts`:

- `testDir: 'e2e'`, match `*.spec.ts`.
- One project, Chromium, headless (Playwright's default when not headed).
- `baseURL`: `http://127.0.0.1:4173`.
- `webServer.command`: `pnpm preview --host 127.0.0.1 --port 4173 --strictPort`.
- `webServer.url`: the same origin. `reuseExistingServer: false`.

`test:e2e` builds first, then Playwright starts preview. Preview serves `dist/`. `127.0.0.1` avoids a localhost IPv6 mismatch. `--strictPort` fails if 4173 is taken instead of picking another port.

`e2e/fixtures.ts` extends Playwright's `page` fixture. Before the test body, it calls `page.clock.install({ time })` with `2026-01-01T00:00:00.000Z`. The [Playwright clock guide](https://playwright.dev/docs/clock) installs, lets the page load, then `pauseAt` and `runFor`. The smoke does that:

1. `page.goto('/')`.
2. Heading role `heading`, name `Signalfire`, visible.
3. `pauseAt(2026-01-01T00:00:01.000Z)`.
4. `runFor(1000)`.
5. `page.evaluate(() => Date.now())` equals `2026-01-01T00:00:02.000Z`.

Later gameplay tests will call `keyboard.type` with delays while this clock is installed. This change does not add that helper.

Alternative: `setFixedTime` only. Rejected. Horizontal 08 needs a clock that can step timers and animation frames. `install` plus `runFor` is the API that does that. `setFixedTime` leaves real timers running.

### Smoke tests

Each test name starts with `harness smoke:`. A file comment says it proves the runner and is not game logic. Do not delete them.

| File | Project | Body |
|---|---|---|
| `src/harness-smoke.test.ts` | unit | `expect(1 + 1).toBe(2)` |
| `src/harness-smoke.property.test.ts` | unit | `test.prop([fc.integer()])` from `@fast-check/vitest`; the integer equals itself |
| `src/app.browser.test.tsx` | browser | `createRoot` renders `App`; the heading is Signalfire |
| `e2e/harness-smoke.spec.ts` | Playwright | heading plus the clock step above |

The first two are the tautological pair the proposal records. They import no app module. The property file imports `{ fc, test }` from `@fast-check/vitest`.

Seed check, once, during apply: change the property so it fails, run `pnpm test:unit`, confirm the output contains `seed`, restore the passing predicate. Do not keep a test that parses fast-check's error text.

`tsconfig.json` `include` gains `e2e`, `vitest.config.ts`, and `playwright.config.ts`. `src` already covers the other tests. No second tsconfig. Node tests can see the DOM lib and must still not touch it; the Node project fails at runtime if they do.

### Pre-push

```yaml
pre-push:
  jobs:
    - name: unit
      run: pnpm test:unit
```

Lefthook's existing allowed build installs hooks. Apply runs `pnpm exec lefthook install` if `.git/hooks/pre-push` is missing or stale, then confirms the hook file runs `pnpm test:unit`.

Prove rejection with a push attempt, not only `lefthook run`: break the logic smoke, run `git push --dry-run`, confirm the hook rejects it and the remote is not updated, restore the smoke. Do not use `--no-verify`. Prove the success-without-browsers scenario by running the hook before `pnpm browsers:install`, while the Node tests pass.

### Docs and ignore rules

- `AGENTS.md` Commands: add `test`, `test:unit`, `test -- <pattern>`, `test:e2e`, `browsers:install`. `check` becomes typecheck, lint, test, and build. Say that browser and end-to-end runs need `pnpm browsers:install` after `pnpm install`. `content:check`, `tokens`, and `ladle` still arrive later. Update the filename bullet to add `*.browser.test.tsx` and `e2e/*.spec.ts`. Stay under 200 lines.
- `docs/horizontals/02-repo-setup.md`: the same scripts, the pre-push row (`pnpm test:unit`), and naming rows for the three test filenames. Remove the sentence that pre-push arrives with task 0.2.
- `docs/horizontals/08-testing-and-dev-practices.md`: replace the Sources line that cites the Vitest 4 InfoQ article with the Vitest 5 browser guide (`https://vitest.dev/guide/browser/`). Leave the decision row as Vitest, with no major.
- `README.md`: the run-locally sentence that says tests arrive later. `pnpm check` includes tests. Name `pnpm browsers:install`. Content checks still arrive later.
- `.gitignore`: after the first `pnpm test` and `pnpm test:e2e`, add a directory the tools wrote that is not already ignored. Do not add names speculatively. `node_modules` already covers `.local-browsers`.

Roadmap status stays "Not started". Do not edit horizontal 10 or add a workflow.

## Risks / Trade-offs

- [Clock `install` before `goto` prevents the heading from appearing] → The Playwright guide loads the page after `install`. If the heading never appears, stop and report. Do not drop the clock assertion or change the epoch to force a pass.
- [A browser download hits `~/Library/Caches/ms-playwright`] → Scripts force `PLAYWRIGHT_BROWSERS_PATH=0`. Apply compares that directory to a timestamp taken before install. An unexpected new file under `$HOME` is a finding, not something to delete.
- [`pnpm check` fails on a fresh clone that skipped `browsers:install`] → The commands table says to run it. The done criteria include it. Pre-push does not need it.
- [TypeScript 7 rejects Vitest or Playwright types] → Stop and report. Do not add `@ts-ignore` or `@ts-expect-error`.
- [The unit project inherits browser mode and launches Chromium] → Browser options stay on the browser project. If `pnpm test:unit` still launches Chromium, set `extends: false` on the unit project.
- [Chromium only misses a Firefox or WebKit bug] → Accepted for this harness. The product matrix in horizontal 03 is not a test matrix yet.

## Migration Plan

No player data and no deploy change. Rollback is reverting the change. Existing `pnpm check` callers gain a test step and will fail until Chromium is installed.
