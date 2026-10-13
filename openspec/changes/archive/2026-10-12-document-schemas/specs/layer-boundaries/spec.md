# Spec Delta

## MODIFIED Requirements

### Requirement: Core imports only core and Zod

A module under `src/core` SHALL pass the boundary check when it imports only `core` or `zod`. It SHALL fail when it imports any other package, including `verzod`, a Node builtin, another layer, or a module at the `src` root.

#### Scenario: Core imports Zod, verzod, and core

- **WHEN** a `src/core` module imports `zod`, `zod/v4`, `verzod`, or a relative module that stays inside `src/core`
- **THEN** the boundary check passes for `zod`, `zod/v4`, and the relative module, and fails for `verzod`

#### Scenario: Core imports another package

- **WHEN** a `src/core` module imports `react`, `react/jsx-runtime`, `@scope/pkg`, `zodiac`, or `verzod`
- **THEN** the boundary check fails

#### Scenario: Core imports a Node builtin

- **WHEN** a `src/core` module imports `node:fs` or `fs`
- **THEN** the boundary check fails

#### Scenario: Core imports another layer or the src root

- **WHEN** a `src/core` module imports `src/engine`, `src/platform`, `src/app`, or a module at the `src` root
- **THEN** the boundary check fails

## RENAMED Requirements

- FROM: `### Requirement: Core imports only core, Zod, and verzod`
- TO: `### Requirement: Core imports only core and Zod`
