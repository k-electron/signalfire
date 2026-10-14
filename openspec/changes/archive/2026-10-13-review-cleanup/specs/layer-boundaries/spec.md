# Spec Delta

## REMOVED Requirements

### Requirement: Core imports only core and Zod

**Reason**: The requirement named verzod, which this project does not use.
**Migration**: Core still passes for `zod` and for a relative core import, and fails for another package, a Node builtin, another layer, or the src root.

### Requirement: The check covers missing layer directories

**Reason**: The fixture requirement already says a forbidden core import fails. The repository has `src/core`, `src/engine`, and `src/platform`. The old requirement's check was that those directories were missing.
**Migration**: The proof keeps using fixture trees outside `src/`. A core fixture that imports `react` still fails.

## ADDED Requirements

### Requirement: Core passes for Zod and fails for other packages

A module under `src/core` SHALL pass the boundary check when it imports only `core` or `zod`. It SHALL fail when it imports any other package, a Node builtin, another layer, or a module at the `src` root.

#### Scenario: Core imports Zod and core

- **WHEN** a `src/core` module imports `zod`, `zod/v4`, or a relative module that stays inside `src/core`
- **THEN** the boundary check passes for those imports

#### Scenario: Core imports another package

- **WHEN** a `src/core` module imports `react`, `react/jsx-runtime`, `@scope/pkg`, or `zodiac`
- **THEN** the boundary check fails

#### Scenario: Core imports a Node builtin

- **WHEN** a `src/core` module imports `node:fs` or `fs`
- **THEN** the boundary check fails

#### Scenario: Core imports another layer or the src root

- **WHEN** a `src/core` module imports `src/engine`, `src/platform`, `src/app`, or a module at the `src` root
- **THEN** the boundary check fails

## MODIFIED Requirements

### Requirement: Fixtures sit outside src

The modules that prove the rules SHALL live outside `src/`. One clean tree SHALL pass. Each forbidden case in these requirements SHALL fail on its own. The proof SHALL run those fixtures from that outside tree.

#### Scenario: The clean tree passes

- **WHEN** the boundary proof runs the clean fixture tree
- **THEN** the boundary check passes

#### Scenario: A forbidden fixture fails

- **WHEN** the boundary proof runs a fixture whose import this spec forbids
- **THEN** the boundary check fails for that fixture
