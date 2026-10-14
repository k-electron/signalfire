# Spec Delta

## REMOVED Requirements

### Requirement: Node logic tests run

**Reason**: One scenario's only check was that the Node project leaves browser files out.
**Migration**: `pnpm test:unit` collects `src/**/*.test.ts` and the logic smoke passes without a browser.

### Requirement: Check runs the test projects

**Reason**: One scenario's only check was that end-to-end does not run.
**Migration**: `pnpm check` runs typecheck, lint, `pnpm test`, and build, in that order.

### Requirement: Pre-push runs Node unit tests

**Reason**: One scenario's only check was that browser binaries are absent.
**Migration**: The hook runs `pnpm test:unit`. It rejects the push when a Node test fails, and it succeeds when those tests pass.

### Requirement: No coverage threshold

**Reason**: The requirement's only check was that a coverage gate is absent. Decision 0001 keeps that kind of check out of the spec.
**Migration**: `pnpm test` passes when its tests pass. A coverage gate is not part of the command.

## ADDED Requirements

### Requirement: Node unit tests run

`pnpm test:unit` SHALL run the Node test project and SHALL pass when the harness logic smoke test passes. That project SHALL collect `src/**/*.test.ts`. It SHALL pass without browser binaries installed.

#### Scenario: Logic smoke passes without a browser

- **WHEN** `pnpm test:unit` runs on a checkout with no browser binaries installed
- **THEN** the labeled harness logic smoke test passes and no browser launches

#### Scenario: The Node project collects unit tests

- **WHEN** the Node test project collects tests
- **THEN** it collects `src/**/*.test.ts`

### Requirement: Check runs typecheck, lint, test, and build

`pnpm check` SHALL run typecheck, lint, `pnpm test`, and build, in that order.

#### Scenario: Check runs both test projects

- **WHEN** `pnpm check` runs after browser binaries are installed
- **THEN** typecheck, lint, the Node smokes, the component smoke, and the build pass

### Requirement: Pre-push runs the Node unit tests

The pre-push hook SHALL run `pnpm test:unit`. When a Node unit test fails, the hook SHALL reject the push.

#### Scenario: A failing unit test blocks the push

- **WHEN** a Node unit test fails and a push is attempted
- **THEN** the pre-push hook rejects the push and does not publish it

#### Scenario: Pre-push succeeds when the Node tests pass

- **WHEN** pre-push runs and the Node tests pass
- **THEN** the hook succeeds
