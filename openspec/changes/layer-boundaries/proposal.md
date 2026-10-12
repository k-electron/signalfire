# Proposal

## Why

Stage 0's exit needs a dependency-boundary check before any game logic lands. Task 0.3 adds that check and puts the existing screen in `src/app`, so later layers cannot import sideways. This change does not add game logic.

## What Changes

- Move `App` to `src/app/app.tsx` and its browser smoke to `src/app/app.browser.test.tsx`. Point `src/main.tsx` at that module. Leave the harness smokes at the `src` root.
- Do not create `src/core`, `src/engine`, or `src/platform`, and add no placeholder files. The check's rules still name those layers.
- Enforce the layer rules with Biome `noRestrictedImports` overrides, so they run inside `pnpm lint`. No new dependency. `pnpm check` already runs lint, so it runs the check. Design records why dependency-cruiser is rejected.
- Prove each rule with fixtures outside `src/`. One clean tree passes. Each forbidden case fails. A Node script runs those fixtures from `pnpm lint`, after `biome check`. The Vitest include stays `src/**/*.test.ts`. `@types/node` is not added.
- Update the core import rule in `docs/horizontals/04-architecture.md`, the opening of `src/AGENTS.md`, and the same sentence in root `AGENTS.md`. Note that verzod stays on the allowlist only until the compatibility check in horizontal 05. Do not edit horizontal 10 and do not add a workflow.

## Capabilities

### New Capabilities

- `layer-boundaries`: The repo rejects imports that break the four-layer rules, including type-only imports and `import()`. Test files may import the test libraries named below and still obey the layer rules. `pnpm check` runs the check. The rules apply before `src/core`, `src/engine`, and `src/platform` exist.

### Modified Capabilities

- None. `test-harness` still says `pnpm check` runs typecheck, lint, `pnpm test`, and build, in that order. The fixture proof is part of `pnpm lint`, not a new step. `hermetic-toolchain` and `openspec-configuration` are unchanged.

## Impact

- Edited: `src/main.tsx`, `package.json` (`lint` runs the fixture script after `biome check`), `biome.json`, `AGENTS.md`, `src/AGENTS.md`, `docs/horizontals/04-architecture.md`, `docs/horizontals/02-repo-setup.md` (the `pnpm lint` row).
- Moved: `src/app.tsx` to `src/app/app.tsx`; `src/app.browser.test.tsx` to `src/app/app.browser.test.tsx`.
- New: `tools/layer-boundaries/check-fixtures.mjs` and fixture trees under `tools/layer-boundaries/fixtures/`. Those trees are outside `src/` and are excluded from Biome's file set, so a forbidden fixture does not fail `biome check` by sitting in the repo.
- Unchanged: the Signalfire heading, game logic, `src/core`, `src/engine`, `src/platform`, GitHub Actions, Cloudflare, roadmap status, `openspec/config.yaml`, the Vitest include, `allowBuilds`.
- No new runtime dependency. No new dev dependency. Zod and verzod are not installed. The check allows those package names.

## Principles served

- **P13.** The boundary check is the thin guard. Stage 1 adds real modules behind it.
- P1–P12 are not served. The heading text stays Signalfire.

## Docs implemented

- `docs/ROADMAP.md` Stage 0, task 0.3. Sequence only. Status stays "Not started".
- `docs/horizontals/04-architecture.md`: the core "May import" cell and the Decisions row "Dependency rule".
- `docs/horizontals/05-data-model.md` Risk: cited, not edited. Adopting verzod still waits on that check.
- `docs/horizontals/02-repo-setup.md`: the `pnpm lint` row. No new script name.
- `docs/horizontals/01-constitution.md`: C4, C8, C9. This change does not edit the constitution.
- `docs/horizontals/10-ci-cd-and-hosting.md`: the "Layer boundaries" row already names the check. CI wiring is task 0.4 and is not added.

## Departures

- Horizontal 04's core cell says only `core` and Zod. Horizontal 05 already uses verzod for migrations, with a compatibility risk. This change updates the core cell and the "Dependency rule" row to "only `core`, Zod, and verzod", and records the risk: if stage 1 drops verzod, the hand-rolled chain lives in `core` and the allowlist loses verzod. The engine, platform, and app cells stay as written. Their "May import" lists are the other layers. External packages are a separate rule, stated by this change for engine.
- C4 says every OpenSpec scenario maps to a test. These scenarios are asserted by `tools/layer-boundaries/check-fixtures.mjs`, which `pnpm lint` runs. They are not Vitest tests. The unit project only collects `src/**/*.test.ts`, and a Vitest file that spawns the checker would need `@types/node` or a Node import at the `src` root. Neither change is made. This is not a constitution amendment.
- No decision record. Horizontal 04 already requires a dependency-boundary check. The tool is an implementation choice recorded in `design.md`.

## Assumptions

- Engine and platform "May import: `core`" in horizontal 04 means other layers. Engine may import external packages except `react`, `react-dom`, `zustand`, and `xstate`, including subpaths (`react/jsx-runtime`, `react-dom/client`). Platform and app may import other external packages. `node:` builtins are forbidden in `core` only.
- The only modules at the `src` root are `main.tsx`, `harness-smoke.test.ts`, and `harness-smoke.property.test.ts`. The check rejects those basenames from every layer. A new `src`-root file is not rejected until its basename is added to the patterns.
- A specifier is rejected when a path segment is exactly a forbidden layer name. A same-layer file whose segment is `app`, `engine`, `platform`, or `core` is rejected too. `engine-helper` and `approach` are not.
- The rules match string-literal specifiers: static import, side-effect import, `export ... from`, `export type ... from`, `import type`, inline `type` modifiers, and `import("...")`. A template-literal `import()` is not detected. `require()` is not detected by Biome pattern groups (probed on 2.5.15). Exact `paths` keys do detect `require()`, and core cannot list every forbidden package there. `require` in `src/` still fails typecheck: there is no `@types/node` and no `require` binding.
- `*.test.ts` may import the packages `vitest`, `fast-check`, and `@fast-check/vitest`, not other subpaths. `vitest/browser` is only for `*.browser.test.tsx`.
- No path aliases. `:ALIAS:` is banned in `core` so a future alias fails there.
- `verzod` and `zod` subpaths (`zod/v4`) are allowed in `core`. A different package whose name starts with `zod` (`zodiac`) is not.

## Constitution check

- **C1.** One capability, `layer-boundaries`. Not a C1 exemption. Apply waits for approval.
- **C2.** Principles, docs, and the core-row update are stated. The verzod risk is resolved in the architecture doc, not by installing verzod.
- **C3.** Karim approves this proposal before apply. The agent does not merge and does not push to `main`. CI does not exist yet (task 0.4), so this pull request cannot be CI-green. `pnpm check` is the local gate.
- **C4.** Not a logic domain from the constitution list. Scenarios are asserted by the fixture script. See Departures.
- **C5.** The moved component stays strict. No `any`. No `@ts-ignore`. The fixture script is plain `.mjs`, the same pattern as `tools/check-commit-msg.mjs`, and is not part of `tsconfig.json`.
- **C6.** No decision record. See Departures.
- **C7.** No new runtime dependency. No new dev dependency.
- **C8.** Root `AGENTS.md` stays tool-agnostic and under 200 lines (145 lines today). `CLAUDE.md` stays `@AGENTS.md`. `src/AGENTS.md` keeps one section per layer; only the opening import sentence changes.
- **C9.** The move, the check, the fixtures, the docs, the delta spec, and `tasks.md` land together. Roadmap status stays "Not started" because Stage 0 is not done. Archive copies the delta into `openspec/specs/`.
- **C10.** Non-trivial. Tasks require a fresh-context review before the pull request is treated as ready. That review has not been done yet.
