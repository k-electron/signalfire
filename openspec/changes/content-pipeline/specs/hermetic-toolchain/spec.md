# Spec Delta

## MODIFIED Requirements

### Requirement: A clean checkout checks and builds

On a clean checkout, `pnpm install`, then `pnpm browsers:install`, then `pnpm check` SHALL run typecheck, lint, `pnpm content:check`, the Vitest projects, and build, and all of them SHALL pass. `pnpm check` needs the Chromium binaries from `pnpm browsers:install`.

#### Scenario: Install and check

- **WHEN** `pnpm install`, then `pnpm browsers:install`, then `pnpm check` runs on a clean checkout
- **THEN** typecheck, lint, `pnpm content:check`, the Vitest projects, and build pass
