# Spec Delta

## MODIFIED Requirements

### Requirement: Checks run on pull requests and on main

GitHub Actions SHALL run the blocking checks on every pull request and on every push to `main`.

#### Scenario: A pull request is opened or updated

- **WHEN** a pull request is opened, synchronized, or reopened
- **THEN** Install, Types, Lint, Content, Tests, Build, End-to-end, and the pull request title check run

#### Scenario: A commit is pushed to main

- **WHEN** a commit is pushed to `main`
- **THEN** Install, Types, Lint, Content, Tests, Build, and End-to-end run, and the pull request title check does not run

### Requirement: Install fails when the lockfile does not match

The Install check SHALL run `pnpm install --frozen-lockfile`. When that command fails, Types, Lint, Content, Tests, Build, and End-to-end SHALL be skipped on that run.

#### Scenario: The lockfile matches the manifest

- **WHEN** `pnpm install --frozen-lockfile` succeeds
- **THEN** the Install check passes

#### Scenario: The lockfile does not match the manifest

- **WHEN** `pnpm install --frozen-lockfile` fails
- **THEN** the Install check fails, and Types, Lint, Content, Tests, Build, and End-to-end are skipped

## ADDED Requirements

### Requirement: Content fails when content is invalid

The Content check SHALL run `pnpm content:check`.

#### Scenario: Invalid content is the only failure

- **WHEN** `pnpm content:check` fails and `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, and `pnpm test:e2e` succeed
- **THEN** the Content check fails and Types, Lint, Tests, Build, and End-to-end pass
