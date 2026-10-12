# Design

## Context

See proposal.md for why. `src/` today is `main.tsx`, `app.tsx`, `app.browser.test.tsx`, and two harness smokes at the root. `index.html` loads `/src/main.tsx`. Biome is `@biomejs/biome` 2.5.15 (`biome.json` `$schema` is `https://biomejs.dev/schemas/2.5.15/schema.json`). `pnpm lint` is `biome check`. `pnpm check` is typecheck, lint, test, build. Vitest's unit project collects only `src/**/*.test.ts`. There is no `@types/node`. `allowBuilds` is `lefthook` only. `minimumReleaseAge` is 1440. TypeScript is 7.0.2. Its package entry `.` is `lib/version.cjs`, which exports `version` only. The public entry has no `createSourceFile`.

The rule behavior below was probed with that Biome binary on 2026-10-12. Do not replace it with an unprobed config.

## Goals / Non-Goals

**Goals:**

- Layer rules run inside `pnpm lint` with no new dependency.
- Relative specifiers are judged at any `../` depth the probe covered (`src/core/nested/deep`, `src/engine/loop/deep`).
- The fixture script fails closed: a forbidden fixture with no `noRestrictedImports` diagnostic is a failed proof.

**Non-Goals:**

- A GitHub workflow (task 0.4).
- Installing `zod` or `verzod`.
- Creating `src/core`, `src/engine`, or `src/platform`.
- Catching template-literal `import()` or `require()`. See Risks.
- Path aliases. None exist (`tsconfig.json` has no `paths`).

## Decisions

### Biome `noRestrictedImports`, not dependency-cruiser

Use Biome overrides. The rule is off unless an override enables it (`recommended` does not include it). Files that match no override, including `src/main.tsx` and the root harness smokes, are not layer-checked.

Docs used, not memory:

- [noRestrictedImports](https://biomejs.dev/linter/rules/no-restricted-imports/): static import, `export ... from`, `import type`, inline `type`, and string-literal `import()` are in scope. `patterns` (since 2.2.0) are gitignore-style groups. A later `!pattern` in the same group is an exception. Set `"level": "error"` in the override. The rule's default severity is warning.
- Biome 2.5.15 `PatternOptions.group` is a `SourcesMatcher` (`crates/biome_rule_options/src/no_restricted_imports.rs`). That matcher accepts predefined groups from `PredefinedSourceMatcher` in `import_groups.rs`: `:PACKAGE:`, `:NODE:`, `:PACKAGE_WITH_PROTOCOL:`, `:BUN:`, `:URL:`, `:ALIAS:`, `:PATH:`, `:STYLE:`. A leading `!` negates them. The public rule page shows glob examples; the predefined names are the shared matcher, and the probe accepted them in `noRestrictedImports`.
- `NoRestrictedImportsOptions::merge_with` replaces the whole `patterns` array when the later config sets it. Override order matters: the last matching override wins, and a test override must repeat the path globs or it drops them.
- [Configuration `overrides`](https://biomejs.dev/reference/configuration/#overrides): `includes` selects files. `files.includes` uses `!` to exclude.

Rejected: dependency-cruiser. Latest is 18.6.0 (published 2026-10-11T19:35:10Z, inside `minimumReleaseAge` on 2026-10-12). `src/meta.cjs` at tag `v18.6.0` sets `supportedTranspilers.typescript` to `>=2.0.0 <7.0.0`. `src/extract/tsc/parse.mjs` calls `typescript.createSourceFile`. This repo's TypeScript 7.0.2 cannot serve that call. npm `latest` is 7.0.2; `7.1.0` exists only as `7.1.0-dev.*` tags. The [v18.1.0 release note](https://github.com/sverweij/dependency-cruiser/releases/tag/v18.1.0) says TypeScript 7 support waits on a public API in 7.1.0. Their options reference says `import type` needs the `tsc` parser. Adding a second TypeScript (6.x) is not allowed without stopping, so it is not the plan. The deprecated `swc` parser would add `@swc/core` and is not used.

### Overrides

Add these to `biome.json`. Keep the recommended preset and `noExplicitAny`. Add `"includes": ["**", "!tools/layer-boundaries/fixtures/**"]` under `files` so forbidden fixtures are not in `biome check`. Apply confirms a fixture file is skipped and `src/` is still checked.

Messages below are the diagnostic text. The proof looks at the category `lint/style/noRestrictedImports`, not the message.

Core, all files (`src/core/**`):

```json
{
  "patterns": [
    {
      "group": [
        ":PACKAGE:",
        ":NODE:",
        ":PACKAGE_WITH_PROTOCOL:",
        ":BUN:",
        ":URL:",
        ":ALIAS:",
        "!zod",
        "!zod/**",
        "!verzod",
        "!verzod/**"
      ],
      "message": "core may import only core, zod, and verzod."
    },
    {
      "group": [
        "**/app",
        "**/app/**",
        "**/engine",
        "**/engine/**",
        "**/platform",
        "**/platform/**",
        "**/main",
        "**/main.*",
        "**/harness-smoke.test",
        "**/harness-smoke.test.*",
        "**/harness-smoke.property.test",
        "**/harness-smoke.property.test.*"
      ],
      "message": "core may not import another layer or a src-root module."
    }
  ]
}
```

Core unit tests (`src/core/**/*.test.ts`), after the block above. Same path group. Package group adds `!vitest`, `!fast-check`, and `!@fast-check/vitest`. Do not add `!vitest/**`: the probe showed that also allows `vitest/browser`.

Core browser tests (`src/core/**/*.browser.test.tsx`), after the unit-test block. Same path group. Package group adds those three names and `!vitest/browser`.

Engine (`src/engine/**`):

```json
{
  "patterns": [
    {
      "group": [
        "react",
        "react/**",
        "react-dom",
        "react-dom/**",
        "zustand",
        "zustand/**",
        "xstate",
        "xstate/**"
      ],
      "message": "engine may not import react, react-dom, zustand, or xstate."
    },
    {
      "group": [
        "**/app",
        "**/app/**",
        "**/platform",
        "**/platform/**",
        "**/main",
        "**/main.*",
        "**/harness-smoke.test",
        "**/harness-smoke.test.*",
        "**/harness-smoke.property.test",
        "**/harness-smoke.property.test.*"
      ],
      "message": "engine may import only core from src."
    }
  ]
}
```

Platform (`src/platform/**`): one path group for `app`, `engine`, and the same src-root basenames. Message: `platform may import only core from src.` No package ban. `idb-keyval` stays allowed.

App (`src/app/**`): one path group for the src-root basenames only. Message: `app may not import a src-root module.` `react` and the other layers stay allowed.

No engine, platform, or app test overrides. Those layers do not use a package allowlist, so `vitest` is already allowed. A browser test there may import `vitest/browser` for the same reason.

`src/core/**/*.test.ts` does not match `*.browser.test.tsx`. Both overrides are required. Probe: a browser test was judged by the general core allowlist until the later browser override existed.

### Why segment globs, not one override per depth

`noRestrictedImports` matches the specifier text. It does not resolve `..`. A blanket `../*` forbids `../sibling` inside the same layer (probed). Globs on the path segment (`**/engine`, `**/engine/**`, `**/main`, `**/main.*`) flag `../engine`, `../../engine/loop`, `../../../main`, and `../main.tsx` from nested files, and they do not flag `../tokens`, `./engine-helper`, `./approach`, or `../maintain` (probed). That covers every depth without a per-directory override.

### Fixture proof

`tools/layer-boundaries/check-fixtures.mjs`, same style as `tools/check-commit-msg.mjs`. Not added to `tsconfig.json`.

`pnpm lint` becomes `biome check && node tools/layer-boundaries/check-fixtures.mjs`. `pnpm check` is unchanged and already calls `pnpm lint`. No `lint:layers` script.

For `fixtures/pass` and each directory under `fixtures/fail/<name>`:

1. Make a temp directory.
2. Copy the repo `biome.json` into it.
3. Copy that fixture's `src/` to `temp/src`.
4. Run `biome lint <temp>/src --config-path <temp> --reporter=json`.
5. Read stdout JSON. Ignore the experimental-reporter line on stderr. Biome is pinned, so this shape is the one apply uses: `diagnostics[].category`.
6. Pass tree: zero diagnostics whose category is `lint/style/noRestrictedImports`.
7. Each fail directory: at least one such diagnostic.

Do not use `--stdin-file-path`. The probe's stdin runs reported "The contents aren't fixed" and did not return the override diagnostic. Do not use `--only`: it is unnecessary if the assertion is the category, and pass files should not depend on it.

Print one line per fixture. Exit non-zero if any verdict is wrong. A missing diagnostic on a forbidden fixture is a failure, so the script fails before the overrides exist.

Layout:

- `tools/layer-boundaries/fixtures/pass/src/` is the clean tree.
- `tools/layer-boundaries/fixtures/fail/<name>/src/` is one forbidden module.

Pass tree (export the bindings so unused-import warnings are not required for a pass):

| Path | Imports |
|---|---|
| `src/core/tokens.ts` | `zod`, `verzod`, `./sibling` |
| `src/core/sibling.ts` | nothing |
| `src/core/subpath.ts` | `zod/v4` |
| `src/core/nested/score.ts` | `../tokens` |
| `src/core/nested/deep/rank.ts` | `../../tokens` |
| `src/core/nested/helper.ts` | `./engine-helper` |
| `src/core/rules.test.ts` | `vitest`, `fast-check`, `@fast-check/vitest`, `./tokens` |
| `src/core/rules.browser.test.tsx` | `vitest`, `vitest/browser`, `./tokens` |
| `src/engine/loop.ts` | `../core/tokens`, `pixi.js` |
| `src/engine/loop/clock.ts` | `../../core/tokens` |
| `src/engine/loop/deep/frame.ts` | `../../../core/tokens` |
| `src/engine/render/approach.ts` | `./neighbor` |
| `src/platform/storage.ts` | `../core/tokens`, `idb-keyval` |
| `src/app/screen.ts` | `../core/tokens`, `../engine/loop`, `../platform/storage`, `react` |
| `src/app/screens/title.ts` | `../../engine/loop` |
| `src/main.tsx` | `./app/screen`, `react` |
| `src/harness-smoke.test.ts` | `vitest`, `react` |

Fail fixtures, one import each:

| Name | Logical path | Import |
|---|---|---|
| `core-react` | `src/core/bad.ts` | `react` |
| `core-react-subpath` | `src/core/bad.ts` | `react/jsx-runtime` |
| `core-scope` | `src/core/bad.ts` | `@scope/pkg` |
| `core-zodiac` | `src/core/bad.ts` | `zodiac` |
| `core-node` | `src/core/bad.ts` | `node:fs` |
| `core-fs` | `src/core/bad.ts` | `fs` |
| `core-engine` | `src/core/nested/bad.ts` | `../../engine/loop` |
| `core-platform` | `src/core/nested/bad.ts` | `../../platform/storage` |
| `core-app` | `src/core/bad.ts` | `../app/screen` |
| `core-main` | `src/core/bad.ts` | `../main` |
| `core-main-ext` | `src/core/bad.ts` | `../main.tsx` |
| `core-deep-main` | `src/core/nested/deep/bad.ts` | `../../../main` |
| `core-smoke` | `src/core/nested/deep/bad.ts` | `../../../harness-smoke.test` |
| `core-type` | `src/core/bad.ts` | `import type` from `react` |
| `core-inline-type` | `src/core/bad.ts` | `import { type X }` from `react` |
| `core-export-type` | `src/core/bad.ts` | `export type` from `react` |
| `core-dynamic` | `src/core/bad.ts` | `import("react")` |
| `core-reexport` | `src/core/bad.ts` | `export { x }` from `react` |
| `core-side-effect` | `src/core/bad.ts` | `import "react"` |
| `core-test-react` | `src/core/bad.test.ts` | `react` |
| `core-test-browser-entry` | `src/core/bad.test.ts` | `vitest/browser` |
| `core-test-main` | `src/core/nested/bad.test.ts` | `../../main` |
| `core-browser-ok-shape` | `src/core/bad.browser.test.tsx` | `react` |
| `engine-react` | `src/engine/bad.ts` | `react` |
| `engine-react-dom` | `src/engine/bad.ts` | `react-dom/client` |
| `engine-zustand` | `src/engine/bad.ts` | `zustand` |
| `engine-xstate` | `src/engine/bad.ts` | `xstate` |
| `engine-app` | `src/engine/bad.ts` | `../app/screen` |
| `engine-platform` | `src/engine/bad.ts` | `../platform/storage` |
| `engine-main` | `src/engine/bad.ts` | `../main` |
| `engine-type-app` | `src/engine/bad.ts` | `import type` from `../app/screen` |
| `engine-dynamic-platform` | `src/engine/bad.ts` | `import("../platform/storage")` |
| `engine-deep-app` | `src/engine/loop/deep/bad.ts` | `../../../app/screen` |
| `engine-deep-main` | `src/engine/loop/deep/bad.ts` | `../../../main.tsx` |
| `platform-engine` | `src/platform/bad.ts` | `../engine/loop` |
| `platform-app` | `src/platform/bad.ts` | `../app/screen` |
| `platform-main` | `src/platform/bad.ts` | `../main` |
| `app-main` | `src/app/bad.ts` | `../main` |
| `app-deep-smoke` | `src/app/screens/bad.ts` | `../../harness-smoke.property.test` |

`core-browser-ok-shape` is the forbidden browser case (React from core). The allowed `vitest/browser` import is in the pass tree, not a fail fixture.

### Move App

`src/app/app.tsx` keeps `export function App`. `src/app/app.browser.test.tsx` still imports `./app`. `src/main.tsx` imports `./app/app`. `index.html` stays on `/src/main.tsx`. Do not add `src/core`, `src/engine`, or `src/platform`.

### Docs

`docs/horizontals/04-architecture.md` core "May import" cell: Only `core`, Zod, and verzod.

Decisions row "Dependency rule": `core` imports only `core`, Zod, and verzod; the dependency-boundary check enforces the layer rules.

After the layer table, one sentence: adopting verzod still depends on the compatibility check in horizontal 05 (Risk); if that check drops verzod, the hand-rolled chain lives in `core` and the allowlist loses verzod. Leave the existing sentence that the check runs in CI. Task 0.4 wires CI. Do not edit horizontal 10.

`src/AGENTS.md` first paragraph: `core` imports only itself, Zod, and verzod; `engine` and `platform` import only `core` from `src`; `engine` does not import React or stores; `app` imports `core`, `engine`, and `platform`. Same verzod risk, one clause.

Root `AGENTS.md` code-rules bullet that says `core` imports only itself and Zod: same allowlist, one clause for the verzod risk. Stay under 200 lines.

Commands tables in `AGENTS.md` and `docs/horizontals/02-repo-setup.md`: the `pnpm lint` row says Biome check, then the layer-boundary fixture proof. No new script row.

### Vitest and `@types/node` stay as they are

The proof is the `.mjs` script. A `src/**/*.test.ts` file that spawns Biome would import `node:child_process` and fail typecheck without `@types/node`. Widening the Vitest include to `tools/**` would typecheck that file too. Neither change is required. See proposal Assumptions.

## Risks / Trade-offs

- [Segment name collision] A same-layer file imported as `./app` or `./engine` fails. `./engine-helper` and `./approach` do not. → The pass tree locks the negative cases. The PR states the assumption. Stage 1 must not name a module after another layer.
- [Src-root list is closed] Only `main`, `harness-smoke.test`, and `harness-smoke.property.test` are rejected. → A new root file is invisible until the globs gain its basename. The PR states that.
- [`require()` and template-literal `import()`] Pattern groups did not flag `require("react")` or a template-literal `import()` of `react`. Exact `paths` keys do flag `require`, and core cannot list every package there. → Not in the spec. `require` in `src/` still fails typecheck. The PR states both holes.
- [JSON reporter] Biome prints that the JSON reporter is experimental. → The pin is 2.5.15. If a later Biome bump changes the shape, the script update lands with that bump.
- [Override replacement] A new core override appended after the test overrides will not apply to tests. → Comment in `biome.json` above the test overrides: they repeat the path group because later `patterns` replace earlier ones.
- [`files.includes`] A bad exclude would stop linting `src/`. → Apply runs `pnpm lint` and confirms `src/` is still checked.

## Migration Plan

No saved data and no deploy step beyond the pull request. Revert the commit to roll back. The heading text does not change.
