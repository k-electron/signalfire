# Proposal

## Why

Stage 0 needs GitHub Actions to run the checks that exist today, on every pull request and every push to `main`. Nothing in the repo does that yet, so a broken change can merge with only the local hooks as a gate.

## What Changes

- Add a GitHub Actions workflow that blocks on: `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm lint` (Biome, then the layer-boundary fixture proof), `pnpm test` (Node and browser), `pnpm build`, `pnpm test:e2e`, and the pull request title via `tools/check-commit-msg.mjs`.
- Cache the pnpm store (`.pnpm-store`) and the Playwright browsers (`node_modules/playwright-core/.local-browsers`).
- Take Node from `devEngines.runtime` (`onFail: download`, lockfile `node@runtime:26.11.1`) and pnpm from `packageManager` (`pnpm@12.11.2`). Do not use `actions/setup-node`. Do not install Playwright or its browsers outside the repo.
- Add Dependabot grouped weekly updates for the pnpm lockfile and for GitHub Actions.
- Update the CI table in `docs/horizontals/10-ci-cd-and-hosting.md`: the layer-boundary check is part of `pnpm lint`; `pnpm content:check` and the bundle check are pending because those commands do not exist. Do not add stub jobs for them.
- Deploys, Cloudflare, release tags, analytics, and branch-protection settings stay out of this change.

## Capabilities

### New Capabilities

- `ci-pipeline`: GitHub Actions runs the existing blocking checks on pull requests and on pushes to `main`, with the project's Node and browser paths, and Dependabot opens grouped weekly update pull requests.

### Modified Capabilities

- None. `hermetic-toolchain`, `test-harness`, `layer-boundaries`, and `openspec-configuration` keep their current requirements. This change runs the commands those specs already define.

## Impact

- New: `.github/workflows/ci.yml`, `.github/dependabot.yml`.
- Edited: `docs/horizontals/10-ci-cd-and-hosting.md` (the CI table, the branch-protection sentence that cites it, and the dependency-update sentence so commit titles stay Conventional Commits).
- Unchanged: `package.json` scripts, `pnpm-workspace.yaml`, Playwright config, hooks, roadmap status, `AGENTS.md`, horizontals 02 and 08.
- No new runtime dependency. No new dev dependency. `actions/checkout` and `actions/cache` are workflow actions, not packages.

## Principles served

- **P13.** CI is the thin Stage 0 gate. The game is still an empty page. Deploys stay a later change in the same stage.
- P1–P12 are not served.

## Docs implemented

- `docs/ROADMAP.md` Stage 0: the GitHub Actions item. Status stays "Not started" because the stage also requires a Cloudflare deploy.
- `docs/horizontals/10-ci-cd-and-hosting.md`: CI, and Dependency updates. The table is edited where it no longer matches the repo.
- `docs/horizontals/02-repo-setup.md`: frozen lockfile, Conventional Commits, CI as the authority. Implemented as written. Not edited.
- `docs/horizontals/08-testing-and-dev-practices.md`: `pnpm check` passes in CI; logic tests run in CI. Implemented as written. Not edited. CI runs the four `pnpm check` commands as separate jobs, plus end-to-end and the title check.
- `docs/horizontals/01-constitution.md`: C3 (CI green before review), C5 (strict TypeScript enforced in CI). Not edited.

## Departures

- Horizontal 10 lists a separate layer-boundaries command, and lists `pnpm content:check` and the bundle check as checks that block merge. `pnpm lint` already runs the boundary fixture proof (`layer-boundaries` spec). `content:check` is not a script. The bundle check has no command (`docs/horizontals/09-dev-tooling.md` only states the rule). This change updates the table: lint is one blocking check; content and bundle stay in the table as pending and are not workflow jobs. That is the doc update, not a decision record.
- C4 and the testing horizontal say every OpenSpec scenario maps to a test. This is not a logic domain. The scenarios are verified by the workflow run on this change's pull request, and by draft pull requests that each break one check. Those drafts are closed and their branches deleted. No Vitest test is added. This is not a constitution amendment.

## Assumptions

- The runner is `ubuntu-latest`. The pnpm binary is the v12.11.2 release asset for that machine (`pnpm-linux-x64.tar.gz` exists on the `v12.11.2` release, checked 2026-10-12), extracted into the job's temp directory. The version string is read from `packageManager`. `npm install -g` is not used.
- `pnpm install --frozen-lockfile` installs the lockfile's Node runtime. Project scripts run through `pnpm`, so they use that runtime. Apply records `pnpm exec node --version` and confirms it matches the lockfile's `node@runtime` entry.
- Browser binaries come only from `pnpm browsers:install`. If Chromium cannot launch because OS libraries are missing, the install job adds `pnpm exec playwright install-deps chromium` with `PLAYWRIGHT_BROWSERS_PATH=0`. That installs OS packages through the project's Playwright. It does not download browsers into the default Playwright cache.
- One job per blocking check. Jobs that run project commands need the Install job. End-to-end also needs the Build job. `pnpm test:e2e` still runs its own build. A lockfile failure fails Install and skips the other project jobs. A build failure fails Build and skips End-to-end.
- The title check runs on `pull_request` only, including `edited`, by passing the title to `tools/check-commit-msg.mjs`. Pushes to `main` have no pull request title, so that job is skipped there. The script is run with the runner's `node` because it only reads a file. The other jobs do not use that `node` to run the app.
- Superseded pull request runs are cancelled. Pushes to `main` are not.
- Dependabot uses ecosystem `npm` (documented for pnpm lockfile v9; this lockfile is `9.0`) and `github-actions`. Each ecosystem is one weekly group. Commit prefix is `chore` for production and development dependencies, with `include: scope`, so titles match the commit checker. The allowed types do not include `ci`. Security updates stay on Dependabot's default schedule and are not forced into the weekly group.
- `minimumReleaseAge: 1440` stays. A Dependabot pull request for a release younger than a day can fail Install until the release is old enough.
- Branch protection (required checks plus Karim's approval) stays a GitHub setting. This change does not call the GitHub API to change it. The pull request lists the check names for that setting.
- Job timeout is 20 minutes.
- Checkout and cache actions use the current majors on 2026-10-12: `actions/checkout@v7`, `actions/cache@v6`.

## Constitution check

- **C1.** One capability, `ci-pipeline`. Not a C1 exemption. Apply waits for approval.
- **C2.** Principles, docs, and the table departure are stated. The departure is resolved by editing horizontal 10.
- **C3.** Karim approves this proposal before apply. The agent does not merge and does not push to `main`. After the workflow lands on the branch, this pull request's own checks are the CI gate.
- **C4.** Not a logic domain. See Departures.
- **C5.** No application TypeScript changes. The existing `pnpm typecheck` and `pnpm lint` jobs are what enforce strict TypeScript and `noExplicitAny`.
- **C6.** No decision record. The runner, cache, and job split are implementation choices in `design.md`. The table change follows the toolchain that already shipped.
- **C7.** No new runtime dependency.
- **C8.** `AGENTS.md` already says CI installs with a frozen lockfile. It stays tool-agnostic and is not edited.
- **C9.** The workflow, Dependabot config, horizontal 10, the delta spec, and `tasks.md` land together. Roadmap status stays "Not started". Archive copies the delta into `openspec/specs/`.
- **C10.** Non-trivial. A fresh-context review of the diff happens before the pull request is treated as ready.
