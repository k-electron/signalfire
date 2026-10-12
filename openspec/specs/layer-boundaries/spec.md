# layer-boundaries Specification

## Purpose

Rejects imports that break the core, engine, platform, and app layer rules, and runs that check from `pnpm check`.

## Requirements

### Requirement: The screen module lives in the app layer

The Signalfire component SHALL live at `src/app/app.tsx`. Its browser smoke SHALL live at `src/app/app.browser.test.tsx`. `src/main.tsx` SHALL import that component. The harness smokes SHALL stay at the `src` root.

#### Scenario: The heading module is under app

- **WHEN** the app is built from `src/main.tsx`
- **THEN** the screen component is loaded from `src/app/app.tsx` and the heading text is Signalfire

#### Scenario: Harness smokes stay at the src root

- **WHEN** the test runners collect harness smokes
- **THEN** the Node logic smoke, the property smoke, and the end-to-end smoke stay at their current paths, and the component smoke is `src/app/app.browser.test.tsx`

### Requirement: Core imports only core, Zod, and verzod

A module under `src/core` SHALL pass the boundary check when it imports only `core`, `zod`, or `verzod`. It SHALL fail when it imports any other package, a Node builtin, another layer, or a module at the `src` root.

#### Scenario: Core imports Zod, verzod, and core

- **WHEN** a `src/core` module imports `zod`, `zod/v4`, `verzod`, or a relative module that stays inside `src/core`
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

### Requirement: Engine imports only core from src

A module under `src/engine` SHALL pass the boundary check when it imports `core`, other `engine` modules, or an external package other than `react`, `react-dom`, `zustand`, and `xstate`. It SHALL fail when it imports one of those four packages, `app`, `platform`, or a module at the `src` root.

#### Scenario: Engine imports core and an allowed package

- **WHEN** an `src/engine` module imports `src/core`, another `src/engine` module, or `pixi.js`
- **THEN** the boundary check passes for those imports

#### Scenario: Engine imports React or a store

- **WHEN** an `src/engine` module imports `react`, `react/jsx-runtime`, `react-dom/client`, `zustand`, or `xstate`
- **THEN** the boundary check fails

#### Scenario: Engine imports app, platform, or the src root

- **WHEN** an `src/engine` module imports `src/app`, `src/platform`, or a module at the `src` root
- **THEN** the boundary check fails

### Requirement: Platform imports only core from src

A module under `src/platform` SHALL pass the boundary check when it imports `core`, other `src/platform` modules, or an external package. It SHALL fail when it imports `engine`, `app`, or a module at the `src` root.

#### Scenario: Platform imports core and a package

- **WHEN** an `src/platform` module imports `src/core` or `idb-keyval`
- **THEN** the boundary check passes for those imports

#### Scenario: Platform imports engine, app, or the src root

- **WHEN** an `src/platform` module imports `src/engine`, `src/app`, or a module at the `src` root
- **THEN** the boundary check fails

### Requirement: App imports core, engine, and platform

A module under `src/app` SHALL pass the boundary check when it imports `core`, `engine`, `platform`, other `src/app` modules, or an external package. It SHALL fail when it imports a module at the `src` root.

#### Scenario: App imports the other layers

- **WHEN** an `src/app` module imports `src/core`, `src/engine`, `src/platform`, or `react`
- **THEN** the boundary check passes for those imports

#### Scenario: App imports the src root

- **WHEN** an `src/app` module imports a module at the `src` root
- **THEN** the boundary check fails

### Requirement: The src root is outside the layers

`src/main.tsx` and the other files directly in `src/` SHALL NOT be judged by the four layer rules. `src/main.tsx` SHALL be allowed to import `src/app`.

#### Scenario: main imports app

- **WHEN** `src/main.tsx` imports `src/app` and `react`
- **THEN** the boundary check passes

#### Scenario: A src-root harness file imports React

- **WHEN** `src/harness-smoke.test.ts` imports `vitest` and `react`
- **THEN** the boundary check passes

### Requirement: Type-only imports follow the layer rules

The boundary check SHALL apply the same allow and deny rules to type-only imports and type-only re-exports as to value imports. A type-position `import("mod")` or `typeof import("mod")` is not part of this requirement.

#### Scenario: Core type-imports a forbidden package

- **WHEN** a `src/core` module uses `import type`, an inline `type` modifier, or `export type` from `react`
- **THEN** the boundary check fails

#### Scenario: Engine type-imports app

- **WHEN** an `src/engine` module uses `import type` from `src/app`
- **THEN** the boundary check fails

### Requirement: Dynamic imports follow the layer rules

The boundary check SHALL apply the same allow and deny rules to a string-literal `import()` call as to a static import. A type-position `import()` is not part of this requirement.

#### Scenario: Core dynamically imports a forbidden package

- **WHEN** a `src/core` module calls `import("react")`
- **THEN** the boundary check fails

#### Scenario: Engine dynamically imports platform

- **WHEN** an `src/engine` module calls `import()` on an `src/platform` module
- **THEN** the boundary check fails

### Requirement: Test files may import test libraries

A `*.test.ts` module SHALL be allowed to import `vitest`, `fast-check`, and `@fast-check/vitest` in addition to what its layer allows. A `*.browser.test.tsx` module SHALL also be allowed to import `vitest/browser`. Test files SHALL still fail the check when they break their layer's other rules.

#### Scenario: A core unit test imports the test libraries

- **WHEN** a `src/core` `*.test.ts` file imports `vitest`, `fast-check`, and `@fast-check/vitest`
- **THEN** the boundary check passes for those imports

#### Scenario: A core unit test imports React or vitest/browser

- **WHEN** a `src/core` `*.test.ts` file imports `react` or `vitest/browser`
- **THEN** the boundary check fails

#### Scenario: A core browser test imports vitest/browser

- **WHEN** a `src/core` `*.browser.test.tsx` file imports `vitest/browser`
- **THEN** the boundary check passes for that import

#### Scenario: A core browser test imports React

- **WHEN** a `src/core` `*.browser.test.tsx` file imports `react`
- **THEN** the boundary check fails

### Requirement: The check covers missing layer directories

The boundary check SHALL judge `src/core`, `src/engine`, and `src/platform` the same way when those directories are absent from the repository. This change SHALL NOT add source files under those directories.

#### Scenario: A core fixture fails while the directory is absent

- **WHEN** the repository has no `src/core` source file and the check is given a `src/core` module that imports `react`
- **THEN** the boundary check fails for that module

### Requirement: Fixtures sit outside src

The modules that prove the rules SHALL live outside `src/`. One clean tree SHALL pass. Each forbidden case in these requirements SHALL fail on its own. Forbidden fixtures SHALL NOT be part of the shipped app or of the ordinary source lint set.

#### Scenario: The clean tree passes

- **WHEN** the boundary proof runs the clean fixture tree
- **THEN** the boundary check passes

#### Scenario: A forbidden fixture fails

- **WHEN** the boundary proof runs a fixture whose import this spec forbids
- **THEN** the boundary check fails for that fixture

### Requirement: pnpm check runs the boundary check

`pnpm lint` SHALL run the boundary check, including the fixture proof. `pnpm check` SHALL run `pnpm lint` and therefore SHALL run the boundary check. A failing boundary check SHALL make `pnpm lint` and `pnpm check` fail.

#### Scenario: Check runs the boundary proof

- **WHEN** `pnpm check` runs
- **THEN** the boundary check runs, the clean fixture passes, and every forbidden fixture fails its own run

#### Scenario: A broken layer import fails lint

- **WHEN** a module under a layer contains an import this spec forbids and `pnpm lint` runs
- **THEN** `pnpm lint` fails
