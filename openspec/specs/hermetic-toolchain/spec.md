# hermetic-toolchain Specification

## Purpose

The repository installs, checks, and serves an empty page from toolchain pins inside the project, without installing project tools globally.

## Requirements

### Requirement: A clean checkout checks and builds

On a clean checkout, `pnpm install`, then `pnpm browsers:install`, then `pnpm check` SHALL run typecheck, lint, the Vitest projects, and build, and all of them SHALL pass. `pnpm check` needs the Chromium binaries from `pnpm browsers:install`.

#### Scenario: Install and check

- **WHEN** `pnpm install`, then `pnpm browsers:install`, then `pnpm check` runs on a clean checkout
- **THEN** typecheck, lint, the Vitest projects, and build pass

### Requirement: Explicit any fails lint

A source file that uses the `any` type SHALL fail lint.

#### Scenario: Source file uses any

- **WHEN** a source file uses `any`
- **THEN** lint fails

### Requirement: Pre-commit rejects a lint failure

The pre-commit hook SHALL reject a commit when a staged file has a lint error or an explicit `any`.

#### Scenario: Staged lint error

- **WHEN** a staged file has a lint error or an explicit `any`
- **THEN** the pre-commit hook rejects the commit

### Requirement: Commit messages are Conventional Commits

The commit-msg hook SHALL reject a message whose first line is not a Conventional Commit. The type SHALL be one of `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, or `content`. A scope SHALL be optional.

#### Scenario: Non-conventional message

- **WHEN** a commit message is not a Conventional Commit
- **THEN** the commit-msg hook rejects it

### Requirement: Install uses the project pins

After install, the store, the cache, and the Node runtime SHALL resolve from the project's pinned settings. No project tool SHALL be installed globally. The OpenSpec CLI is not a project tool.

#### Scenario: Pins stay in the project

- **WHEN** dependencies are installed
- **THEN** the store, cache, and Node runtime resolve from the project's pinned settings and no project tool is installed globally

### Requirement: The dev server shows the title

`pnpm dev` SHALL serve a page whose visible text is "Signalfire" and nothing else.

#### Scenario: Dev server

- **WHEN** `pnpm dev` runs
- **THEN** the page serves and shows the text Signalfire and no other text
