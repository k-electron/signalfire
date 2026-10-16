# test-harness Specification

## Purpose

Runs logic, property, component, and end-to-end tests from pnpm scripts, and keeps browser binaries inside the repository.

## Requirements

### Requirement: Property failures print the seed

Property-based tests SHALL run in the Node test project. When a property fails, the runner output SHALL include the seed that reproduces that failure.

#### Scenario: Property smoke passes

- **WHEN** `pnpm test:unit` runs
- **THEN** the labeled harness property smoke test passes

#### Scenario: A failing property prints its seed

- **WHEN** a property-based test fails
- **THEN** the runner output includes the seed that reproduces that failure

### Requirement: Component tests run in Chromium

`pnpm test` SHALL run the Node project and a browser project. The browser project SHALL collect `src/**/*.browser.test.tsx`, SHALL run those tests in headless Chromium, and SHALL pass when the harness component smoke test sees the heading text Signalfire.

#### Scenario: Component smoke sees the heading

- **WHEN** `pnpm test` runs after browser binaries are installed
- **THEN** the labeled harness component smoke test passes and the heading text is Signalfire

### Requirement: End-to-end tests run against the production build

`pnpm test:e2e` SHALL build the app, serve that build with `vite preview`, and run the tests under `e2e/`. The harness end-to-end smoke test SHALL load that page and see a heading whose text is Signalfire.

#### Scenario: The production page shows Signalfire

- **WHEN** `pnpm test:e2e` runs after browser binaries are installed
- **THEN** the production page loads and shows a heading with the text Signalfire

### Requirement: End-to-end tests step a fake clock

Before navigation, the end-to-end fake clock SHALL be installed at `2026-01-01T00:00:00.000Z`. After a test pauses that clock at `2026-01-01T00:00:01.000Z` and runs it for 1000 milliseconds, the page's `Date.now()` SHALL be `2026-01-01T00:00:02.000Z`.

#### Scenario: The fake clock steps one second

- **WHEN** the end-to-end smoke pauses the installed clock at `2026-01-01T00:00:01.000Z` and runs it for 1000 milliseconds
- **THEN** the page's `Date.now()` is `2026-01-01T00:00:02.000Z`

### Requirement: Browser binaries stay inside the repo

`pnpm browsers:install` SHALL install Chromium under `node_modules/playwright-core/.local-browsers`. Every script that installs or launches a browser SHALL set `PLAYWRIGHT_BROWSERS_PATH=0` itself. A developer shell setting SHALL NOT be required.

#### Scenario: Install writes inside the repo

- **WHEN** `pnpm browsers:install` runs
- **THEN** Chromium is under `node_modules/playwright-core/.local-browsers`

#### Scenario: Test scripts do not need a shell setting

- **WHEN** `pnpm test` or `pnpm test:e2e` runs with `PLAYWRIGHT_BROWSERS_PATH` unset in the parent shell
- **THEN** the browser still resolves under `node_modules/playwright-core/.local-browsers`

### Requirement: Harness smoke tests stay labeled

The repo SHALL keep four tests labeled as harness smoke tests: one Node logic test, one property test, one component test, and one end-to-end test. They are not game logic. Later changes SHALL NOT delete them.

#### Scenario: Each runner collects its smoke

- **WHEN** the Node project, the browser project, and the end-to-end suite collect tests
- **THEN** the Node project collects the logic and property smokes, the browser project collects the component smoke, and the end-to-end suite collects the end-to-end smoke

### Requirement: Node unit tests run

`pnpm test:unit` SHALL run the Node test project and SHALL pass when the harness logic smoke test passes. That project SHALL collect `src/**/*.test.ts`. It SHALL pass without browser binaries installed.

#### Scenario: Logic smoke passes without a browser

- **WHEN** `pnpm test:unit` runs on a checkout with no browser binaries installed
- **THEN** the labeled harness logic smoke test passes and no browser launches

#### Scenario: The Node project collects unit tests

- **WHEN** the Node test project collects tests
- **THEN** it collects `src/**/*.test.ts`

### Requirement: Check runs typecheck, lint, test, and build

`pnpm check` SHALL run typecheck, lint, `pnpm content:check`, `pnpm test`, and build, in that order.

#### Scenario: Check runs both test projects

- **WHEN** `pnpm check` runs after browser binaries are installed
- **THEN** typecheck, lint, `pnpm content:check`, the Node smokes, the component smoke, and the build pass

### Requirement: Pre-push runs the Node unit tests

The pre-push hook SHALL run `pnpm test:unit`. When a Node unit test fails, the hook SHALL reject the push.

#### Scenario: A failing unit test blocks the push

- **WHEN** a Node unit test fails and a push is attempted
- **THEN** the pre-push hook rejects the push and does not publish it

#### Scenario: Pre-push succeeds when the Node tests pass

- **WHEN** pre-push runs and the Node tests pass
- **THEN** the hook succeeds

### Requirement: End-to-end tests support remote preview URLs

When `PLAYWRIGHT_BASE_URL` is set, Playwright SHALL execute tests against that URL without launching a local preview web server.

#### Scenario: Playwright runs against a deployed preview URL

- **WHEN** a test command runs with `PLAYWRIGHT_BASE_URL` pointing to a deployed preview URL
- **THEN** Playwright executes tests directly against that URL without starting a local web server
