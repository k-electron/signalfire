# Spec Delta

## MODIFIED Requirements

### Requirement: Install fails when the lockfile does not match

The Install check SHALL run `pnpm install --frozen-lockfile`. When that command fails, Types, Lint, Tests, Build, and End-to-end SHALL be skipped on that run.

#### Scenario: The lockfile matches the manifest

- **WHEN** `pnpm install --frozen-lockfile` succeeds
- **THEN** the Install check passes

#### Scenario: The lockfile does not match the manifest

- **WHEN** `pnpm install --frozen-lockfile` fails
- **THEN** the Install check fails, and Types, Lint, Tests, Build, and End-to-end are skipped

### Requirement: Build fails closed

The Build check SHALL run `pnpm build`. When that command fails, End-to-end SHALL be skipped on that run.

#### Scenario: The production build fails

- **WHEN** `pnpm build` fails
- **THEN** the Build check fails and End-to-end is skipped

### Requirement: The pnpm store and browsers are cached

The workflow SHALL cache `.pnpm-store` and `node_modules/playwright-core/.local-browsers` between runs. A job SHALL restore the browser directory after `pnpm install` in that job.

#### Scenario: A later run restores both caches

- **WHEN** a run starts after a successful run with the same lockfile and the cache entry is still present
- **THEN** that run restores `.pnpm-store` and `node_modules/playwright-core/.local-browsers`

#### Scenario: Tests restores browsers after install

- **WHEN** the Tests job restores a cache entry that contains the browser directory
- **THEN** that directory is present after `pnpm install` and before `pnpm test`

## ADDED Requirements

### Requirement: pnpm and browsers come from the project commands

Project commands SHALL run through pnpm. The workflow SHALL install that pnpm with `pnpm/action-setup` at major 4, reading the `packageManager` field, and SHALL then run `pnpm install --frozen-lockfile`. Browser install and browser runs SHALL use `pnpm browsers:install`, `pnpm test`, and `pnpm test:e2e`.

#### Scenario: Install uses the pinned pnpm

- **WHEN** the Install check runs
- **THEN** it installs pnpm with `pnpm/action-setup` and `pnpm install --frozen-lockfile` succeeds

#### Scenario: Tests install Chromium with the project script

- **WHEN** the Tests check runs
- **THEN** `pnpm browsers:install` succeeds and `pnpm test` runs

### Requirement: Jobs request the permissions they use

The title job SHALL request `contents: read`. Each job that restores or saves the pnpm store or the browser directory SHALL request `contents: read` and `actions: write`.

#### Scenario: The workflow permissions match the jobs

- **WHEN** the workflow file is read
- **THEN** the title job requests contents read, and each job that uses the cache requests contents read and actions write

### Requirement: The Node version has one source

`devEngines.runtime` in `package.json` SHALL be the Node range. The lockfile SHALL record the resolved runtime. `.node-version` SHALL be that resolved version.

#### Scenario: Lint accepts the derived node version

- **WHEN** `.node-version` equals the lockfile's `node@runtime` version and `pnpm lint` runs on a tree that otherwise passes lint
- **THEN** `pnpm lint` succeeds

## REMOVED Requirements

### Requirement: Node and browsers come from the project pins

**Reason**: The scenarios were inline checks of the Node path and the Chromium directory. Decision 0001 checks the command, not a second inventory.
**Migration**: Install uses `pnpm/action-setup` and `pnpm install --frozen-lockfile`. Tests use `pnpm browsers:install` and `pnpm test`.

### Requirement: Content and bundle checks are not stubbed

**Reason**: The jobs that run are already listed. A requirement whose only check is that a command is absent contradicts decision 0001.
**Migration**: The workflow runs Install, Types, Lint, Tests, Build, End-to-end, and, on a pull request, the title check. Content and bundle checks stay pending in the hosting doc until they have commands.
