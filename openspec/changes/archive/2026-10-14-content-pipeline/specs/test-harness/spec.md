# Spec Delta

## MODIFIED Requirements

### Requirement: Check runs typecheck, lint, test, and build

`pnpm check` SHALL run typecheck, lint, `pnpm content:check`, `pnpm test`, and build, in that order.

#### Scenario: Check runs both test projects

- **WHEN** `pnpm check` runs after browser binaries are installed
- **THEN** typecheck, lint, `pnpm content:check`, the Node smokes, the component smoke, and the build pass
