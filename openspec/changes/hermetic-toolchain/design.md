# Design

## Context

The repo has docs, OpenSpec, and empty `src/` instruction files. It has no `package.json`. See proposal.md for why, the Node 26 evidence, and the pnpm settings. Specs: `specs/hermetic-toolchain/spec.md`.

Host check on 2026-10-11: Node `v26.11.1` is installed; `pnpm` is not on `PATH`. The OpenSpec CLI is at `/opt/homebrew/bin/openspec`.

## Goals / Non-Goals

**Goals:**

- One install path: `pnpm install` uses the workspace settings and the Node pin.
- `pnpm check` is typecheck, lint, and build.
- Hooks fail closed on lint and on commit text.
- The hermetic claim is measured, not assumed.

**Non-Goals:**

- Choosing a test runner, a CI image, or a deploy target.
- Restructuring `src/` into layers.
- Styling the page.

## Decisions

### Bootstrap pnpm without a global install

Apply downloads `pnpm-darwin-arm64.tar.gz` for 12.11.2 from the pnpm GitHub release, runs that binary, and does not put it on the global `PATH`. `packageManager` is `pnpm@12.11.2`, so a later Corepack or pnpm invocation uses the same version.

Alternative: `npm install -g pnpm`. Rejected. That writes a global tool, which this change is trying not to do.

### Project files

- `package.json` scripts call the local binaries (`tsc --noEmit`, `biome check`, `biome check --write`, `vite`, `vite build`, `vite preview`). `check` runs `pnpm typecheck && pnpm lint && pnpm build`.
- `tsconfig.json`: `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`, `jsx: react-jsx`, `module: esnext`, `moduleResolution: bundler`, `noEmit`, `target: ES2023`, `lib` including DOM. TypeScript 7.0.2 accepted this set in the probe (`tsc --showConfig`).
- `biome.json`: recommended lint rules, `suspicious.noExplicitAny` set to `error`, formatter enabled with no custom style, `assist.actions.source.organizeImports` set to `on`. Those keys are in the Biome 2.5.15 schema.
- `vite.config.ts` uses `@vitejs/plugin-react` only.
- `index.html` mounts `src/main.tsx`. `src/app.tsx` exports `App`, which returns the text Signalfire. No CSS file.

### Hooks

Lefthook's `parallel` default is false, so jobs run in order. `pre-commit` sets `priority: 1` on `pnpm exec biome check --write --staged --no-errors-on-unmatched` (`stage_fixed: true`) and `priority: 2` on `pnpm typecheck`. Do not set `piped: true`: that feeds one job's stdout into the next.

`commit-msg` runs `pnpm exec node tools/check-commit-msg.mjs` on the message file Lefthook passes. `pre-commit` runs `pnpm exec biome`, then `pnpm typecheck`. Bare `node` and `biome` are not used: those would be whatever is on `PATH`, not the pinned runtime or the project binary. The script reads the first line and exits 1 unless it matches:

`^(feat|fix|refactor|test|docs|chore|perf|content)(\([a-z0-9-]+\))?!?: \S`

Alternative: `commitlint`. Rejected. The check is one regular expression over a fixed type list.

After install, confirm `.git/hooks/pre-commit` and `.git/hooks/commit-msg` exist. The probe's Lefthook postinstall exited 128 outside a git repo and pnpm still finished. Inside this repo, run `pnpm exec lefthook install` if the hook files are missing.

### Hermetic measurement

The marker is touched before the first `pnpm` command. The listing happens after the finished project has been installed and `pnpm check` has passed, including a second install from a tree that has the lockfile and no `node_modules`. An earlier listing would miss files created when Vite, TypeScript, Biome, and Lefthook are added.

1. `touch` a marker file outside the repo, under `$HOME`.
2. Finish the toolchain, then remove `node_modules` and run `pnpm install` and `pnpm check`.
3. List files and directories under `$HOME` newer than the marker, excluding this repo.

Report the list in the pull request. Expected: pnpm's own home (on macOS, under `~/Library/pnpm`) and nothing else. The probe put the store, cache, and Node runtime inside the project (`node_modules/.pnpm/node@runtime+26.11.1`). Anything else new under `$HOME` is a finding. Do not delete the finding to make the report look clean.

Also record `pnpm exec node -p "process.execPath"` and confirm it is inside the repo. Confirm `storeDir` and `cacheDir` resolve under the repo (`pnpm config list`, or the directories `.pnpm-store` and `.pnpm-cache` existing beside the lockfile).

If that install prints an engine warning for Vite, React, TypeScript, Biome, or Lefthook, stop. Fall back to Node 24 in this proposal and say so. Do not continue on 26.

If install offers to link agent skills into `.cursor/skills` or `.claude/skills`, set `skills.dirs: []` and do not approve the links.

### Doc edits

- Repo-setup: drop `.nvmrc` from the tree, add `pnpm-workspace.yaml`, replace the Node 24 sentence with the `devEngines.runtime` pin and the Active LTS date, list only the scripts and hooks this change creates, and state the hermetic rule in full: project tooling (build, lint, test, dev servers, browsers) is installed per project and run through pnpm scripts or `pnpm exec`; the OpenSpec CLI is the only global exception and is not a dependency.
- `AGENTS.md`: the same rule, and a command table of only the scripts that exist. `pnpm dev` is the dev server, not "with debug tools". `pnpm check` is typecheck, lint, and build. Leave the standing "one test per scenario" bullet as it is.
- README: replace the `.nvmrc` sentence, and change the `pnpm check` sentence so it does not say check is everything CI runs. It is typecheck, lint, and build until later tasks add the rest.
- CI doc: replace the `.nvmrc` sentence. Do not add a workflow file.
- Design system: the sentence that `pnpm dev` and `pnpm build` run `pnpm tokens` gains a clause that the scaffold does not run that step. The token generator is a later change.

## Risks / Trade-offs

- [Node 26 is Current until 2026-10-28] → The pin stays. If apply sees an engine warning the probe did not, stop and fall back to Node 24 in the proposal before continuing. Do not switch silently.
- [pnpm is not on PATH] → Use the standalone 12.11.2 binary for apply. Do not install it globally.
- [`minimumReleaseAge: 1440` is strict because it is set explicitly] → The pinned versions were all older than one day on 2026-10-11. If a resolved transitive version is newer than one day, pick an older release that still satisfies the range, or wait. Do not set the age to 0.
- [Lefthook is the only allowed build] → A later dependency with a build script fails install until `allowBuilds` names it. That is the point of `strictDepBuilds`.
- [A project store is not shared across repos] → Extra disk use. Accepted: the host store is what this change is avoiding.
- [pnpm still has a home directory] → The marker listing is the record. Expected home state is not a failure. Unexpected paths are.
- [The page has no CSS] → Browser default type. Accepted until the design system (Stage 1).

## Migration Plan

No player data and no existing install. Rollback is reverting the merge. Archive the change before that merge, so `openspec/specs/hermetic-toolchain/` exists on `main`.

## Open Questions

None.
