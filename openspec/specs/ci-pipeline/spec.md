# ci-pipeline Specification

## Purpose

GitHub Actions runs the repository checks that exist today, on pull requests and on `main`, and Dependabot opens grouped weekly dependency updates.

## Requirements

### Requirement: Checks run on pull requests and on main

GitHub Actions SHALL run the blocking checks on every pull request and on every push to `main`.

#### Scenario: A pull request is opened or updated

- **WHEN** a pull request is opened, synchronized, or reopened
- **THEN** Install, Types, Lint, Tests, Build, End-to-end, and the pull request title check run

#### Scenario: A commit is pushed to main

- **WHEN** a commit is pushed to `main`
- **THEN** Install, Types, Lint, Tests, Build, and End-to-end run, and the pull request title check does not run

### Requirement: Install fails when the lockfile does not match

The Install check SHALL run `pnpm install --frozen-lockfile`. When that command fails, Types, Lint, Tests, Build, and End-to-end SHALL be skipped on that run.

#### Scenario: The lockfile matches the manifest

- **WHEN** `pnpm install --frozen-lockfile` succeeds
- **THEN** the Install check passes

#### Scenario: The lockfile does not match the manifest

- **WHEN** `pnpm install --frozen-lockfile` fails
- **THEN** the Install check fails, and Types, Lint, Tests, Build, and End-to-end are skipped

### Requirement: Types fails on a type error

The Types check SHALL run `pnpm typecheck`.

#### Scenario: A type error is the only failure

- **WHEN** `pnpm typecheck` fails and `pnpm lint`, `pnpm test`, `pnpm build`, and `pnpm test:e2e` succeed
- **THEN** the Types check fails and Lint, Tests, Build, and End-to-end pass

### Requirement: Lint runs format and layer boundaries

The Lint check SHALL run `pnpm lint`. That command is the layer-boundary check. The workflow SHALL NOT add a separate layer-boundaries check.

#### Scenario: Lint is the only failure

- **WHEN** `pnpm lint` fails and `pnpm typecheck`, `pnpm test`, `pnpm build`, and `pnpm test:e2e` succeed
- **THEN** the Lint check fails and Types, Tests, Build, and End-to-end pass

#### Scenario: A boundary failure fails lint

- **WHEN** the layer-boundary fixture proof fails inside `pnpm lint`
- **THEN** the Lint check fails

### Requirement: Tests run Node and browser projects

The Tests check SHALL run `pnpm test`, including the Vitest Node project and the browser project.

#### Scenario: A test is the only failure

- **WHEN** `pnpm test` fails and `pnpm typecheck`, `pnpm lint`, `pnpm build`, and `pnpm test:e2e` succeed
- **THEN** the Tests check fails and Types, Lint, Build, and End-to-end pass

### Requirement: Build fails closed

The Build check SHALL run `pnpm build`. When that command fails, End-to-end SHALL be skipped on that run.

#### Scenario: The production build fails

- **WHEN** `pnpm build` fails
- **THEN** the Build check fails and End-to-end is skipped

### Requirement: End-to-end runs the production build

The End-to-end check SHALL run `pnpm test:e2e`.

#### Scenario: An end-to-end assertion fails after a successful build

- **WHEN** `pnpm build` succeeds and `pnpm test:e2e` fails
- **THEN** the End-to-end check fails and the Build check passes

### Requirement: Pull request titles are Conventional Commits

On a pull request, the title check SHALL pass only when `tools/check-commit-msg.mjs` accepts the title. A title edit SHALL re-run that check.

#### Scenario: The title is a Conventional Commit

- **WHEN** the pull request title is a line `tools/check-commit-msg.mjs` accepts
- **THEN** the title check passes

#### Scenario: The title is not a Conventional Commit

- **WHEN** the pull request title is a line `tools/check-commit-msg.mjs` rejects
- **THEN** the title check fails

#### Scenario: The title is edited

- **WHEN** the pull request title changes without a new commit
- **THEN** the title check runs again against the new title

### Requirement: The pnpm store and browsers are cached

The workflow SHALL cache `.pnpm-store` and `node_modules/playwright-core/.local-browsers` between runs. A job SHALL restore the browser directory after `pnpm install` in that job.

#### Scenario: A later run restores both caches

- **WHEN** a run starts after a successful run with the same lockfile and the cache entry is still present
- **THEN** that run restores `.pnpm-store` and `node_modules/playwright-core/.local-browsers`

#### Scenario: Tests restores browsers after install

- **WHEN** the Tests job restores a cache entry that contains the browser directory
- **THEN** that directory is present after `pnpm install` and before `pnpm test`

### Requirement: Dependabot opens grouped weekly updates

Dependabot SHALL open grouped weekly version updates for the npm ecosystem and grouped weekly version updates for GitHub Actions. Those pull request titles SHALL be lines `tools/check-commit-msg.mjs` accepts. Security updates SHALL NOT be held for the weekly version group.

#### Scenario: Several npm packages update in one week

- **WHEN** more than one npm dependency has a version update in the same week
- **THEN** Dependabot opens one grouped pull request for those updates

#### Scenario: Several actions update in one week

- **WHEN** more than one GitHub Action has a version update in the same week
- **THEN** Dependabot opens one grouped pull request for those updates

#### Scenario: A grouped title reaches the title check

- **WHEN** Dependabot opens a grouped version-update pull request
- **THEN** its title passes the pull request title check

### Requirement: pnpm and browsers come from the project commands

Project commands SHALL run through pnpm. The workflow SHALL install that pnpm with `pnpm/action-setup` at major 4, reading the `packageManager` field, and SHALL then run `pnpm install --frozen-lockfile`. Browser install and browser runs SHALL use `pnpm browsers:install`, `pnpm test`, and `pnpm test:e2e`.

#### Scenario: Install uses the pinned pnpm

- **WHEN** the Install check runs
- **THEN** it installs pnpm with `pnpm/action-setup` and `pnpm install --frozen-lockfile` succeeds

#### Scenario: Tests install Chromium with the project script

- **WHEN** the Tests check runs
- **THEN** `pnpm browsers:install` succeeds and `pnpm test` runs

### Requirement: Jobs request the permissions they use

The workflow SHALL request `contents: read`. Every job SHALL run with that permission, including the title job and each job that restores or saves the pnpm store or the browser directory.

#### Scenario: The workflow permissions match the jobs

- **WHEN** the workflow file is read
- **THEN** the workflow requests contents read, and the title job and each job that restores or saves a cache run with contents read

### Requirement: The Node version has one source

`devEngines.runtime` in `package.json` SHALL be the Node range. The lockfile SHALL record the resolved runtime. `.node-version` SHALL be that resolved version.

#### Scenario: Lint accepts the derived node version

- **WHEN** `.node-version` equals the lockfile's `node@runtime` version and `pnpm lint` runs on a tree that otherwise passes lint
- **THEN** `pnpm lint` succeeds
