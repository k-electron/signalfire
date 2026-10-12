# Proposal

## Why

Stage 0 cannot install, lint, type-check, or build until the repo has a toolchain. Task 0.1 adds that toolchain inside the project folder, so development does not install tools on the host. Later Stage 0 tasks (tests, folders, CI, hosting) start from this.

## What Changes

- Pin pnpm `12.11.2` with `packageManager`, and Node with `devEngines.runtime` (`name: node`, `version: ^26.11.1`, `onFail: download`). Do not add `.nvmrc`. Do not add a second `engines` pin.
- Add `pnpm-workspace.yaml` with the settings listed under "pnpm settings". Ignore `.pnpm-cache/`. `.pnpm-store/` is already ignored.
- Add Vite, React 19, TypeScript, Biome, and Lefthook. A page renders the text "Signalfire" and nothing else.
- Scripts: `dev`, `build`, `preview`, `typecheck`, `lint`, `format`, `check`. `check` is typecheck, lint, and build. No test, content, token, or e2e scripts.
- Lefthook: `pre-commit` (Biome safe fixes on staged files, then typecheck) and `commit-msg` (a small Conventional Commits script). No `pre-push`.
- Update the docs that still name `.nvmrc` or Node 24. Leave the roadmap status "Not started".
- Do not add the OpenSpec CLI to `package.json`.

## Capabilities

### New Capabilities

- `hermetic-toolchain`: The repo installs, checks, and serves an empty page from pins inside the project. Project tools are not installed globally. Lint rejects `any`. The commit-msg hook rejects a message that is not a Conventional Commit.

### Modified Capabilities

- None. `openspec-configuration` does not change.

## Impact

- New: `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `tsconfig.json`, `vite.config.ts`, `biome.json`, `lefthook.yml`, `index.html`, `src/main.tsx`, `src/app.tsx`, `tools/check-commit-msg.mjs`.
- Edited: `.gitignore`, `AGENTS.md`, `docs/horizontals/02-repo-setup.md`, `docs/horizontals/10-ci-cd-and-hosting.md` (the Node pin sentence only), `README.md` (the Node sentence and the `pnpm check` sentence), `docs/horizontals/07-design-system.md` (the sentence that says `pnpm dev` and `pnpm build` run `pnpm tokens`).
- Unchanged: `docs/ROADMAP.md` status, constitution, game code, Tailwind, shadcn, tokens, Vitest, Playwright, GitHub Actions, Cloudflare.
- Runtime dependencies: `react`, `react-dom`. See below.

## Principles served

- **P13.** This is the thin toolchain path. The page is a title so later tasks have a server and a build.
- P1–P12 are not served. Nothing about play, scoring, content, or player data changes.

## Docs implemented

- `docs/ROADMAP.md` Stage 0, task 0.1. Sequence only. Status stays "Not started".
- `docs/horizontals/01-constitution.md`: C5, C7, C9. This change does not edit the constitution.
- `docs/horizontals/02-repo-setup.md`: Decisions, layout, toolchain pins, scripts, TypeScript settings, Biome settings, git workflow, hooks.
- `docs/horizontals/03-tech-stack.md`: Vite, React 19, TypeScript. No other stack rows are installed.
- `docs/horizontals/08-testing-and-dev-practices.md`: workflow steps that this change can satisfy (local `pnpm check`, archive before merge). Definition of done still requires CI, which does not exist yet.
- `docs/horizontals/10-ci-cd-and-hosting.md`: the sentence that Node comes from `.nvmrc`, updated so it does not name a file this change removes. CI itself is task 0.4 and is not added.

## Departures

The repo-setup pin is "the current Active LTS (Node 24 at time of writing), pinned in `.nvmrc` and `engines`." This change replaces that with `devEngines.runtime` for Node 26.

- Node 26 is **Current** on 2026-10-11. The [Node.js release schedule](https://github.com/nodejs/Release/blob/main/README.md) starts its Active LTS on 2026-10-28. Node 24 is Active LTS until its maintenance start on 2026-10-20. We pin 26 now because that is the line that becomes Active LTS this month, and the tools below accept it. The doc must not call 26 "Active LTS" until that date.
- `.nvmrc` is removed from the layout. Nothing else reads it after the README and CI doc sentences are updated.
- `engines` is not set. `devEngines.runtime` is the pin. Two pins would drift.
- The hooks table says commands run "in parallel." `pre-commit` runs Biome, then typecheck, because typecheck must see Biome's fixes. Lefthook's `parallel` default is false. The doc should say that order.
- The scripts table lists commands this task does not create (`test`, `test:e2e`, `content:check`, `content:words`, `content:hash`, `tokens`, `ladle`). Show the scripts that exist, plus one line that the rest arrive with later tasks.
- `pre-push` stays in the doc as arriving with task 0.2. It is not installed now.
- Horizontal 07 says `pnpm tokens` runs inside `pnpm dev` and `pnpm build`. Tokens are out of scope, so those scripts will not run it. The sentence gains a clause that the token step arrives with the token generator, not with this scaffold.
- Horizontal 08 and constitution C4 say each OpenSpec scenario has a test, with visual evidence instead for visual scenarios. Vitest is task 0.2 and is out of scope. The page scenario uses a screenshot from an automated browser run. The other scenarios are checked by the commands in `tasks.md` (install and check, a lint fixture, hook runs, path checks). Those checks are not Vitest tests. This change does not weaken the standing rule in `AGENTS.md` or horizontal 08.

These edits are the doc update for the pin departure. The C4 exception is recorded here and is not a constitution amendment: C4's logic-domain list does not include the toolchain, and the command checks are what this task can run before Vitest exists. No decision record: the pin mechanism is the one the task asked for, and the Node major is the upcoming Active LTS line, not a new policy.

## Node 26 check

Checked 2026-10-11 against npm and a throwaway install (not in this repo) on the host's Node `v26.11.1`, using the pnpm `12.11.2` standalone binary. `pnpm install` printed no engine warning. After allowing Lefthook's build, these ran:

| Tool | Version | Engines field | Result |
|---|---|---|---|
| Vite | 8.3.4 | `^20.19.0 \|\| >=22.12.0` | `vite/8.3.4 darwin-arm64 node-v26.11.1` |
| `@vitejs/plugin-react` | 6.1.2 | `^20.19.0 \|\| >=22.12.0` | installed |
| TypeScript | 7.0.2 | `>=16.20.0` | `tsc` 7.0.2 accepts the four extra strict flags |
| Biome | 2.5.15 | `>=14.21.3` | `biome` 2.5.15; `check --write` is safe fixes; `--staged` exists |
| Lefthook | 2.2.1 | none | `lefthook` 2.2.1 |
| React / React DOM | 19.3.0 | React: `>=0.10.0` | installed |

No fallback to Node 24. Node 26.11.1 was published 2026-10-07 (`lts` false on nodejs.org).

## pnpm settings

All of these are in `pnpm-workspace.yaml`. pnpm 11+ ignores a `pnpm` key in `package.json`. `packages` is omitted, so the workspace is the root package only.

| Setting | Value | Why |
|---|---|---|
| `storeDir` | `.pnpm-store` | Allowed in the project file. The v11.22 ban on machine-level paths does not include `storeDir`. Probe store: `.pnpm-store/v11`. |
| `cacheDir` | `.pnpm-cache` | Same exception as `storeDir`. Default on macOS is `~/Library/Caches/pnpm`. |
| `strictDepBuilds` | `true` | Documented default. Set in the file so an unknown key fails (pnpm 12 errors on unrecognized settings when `packageManager` matches) and the policy is visible. |
| `allowBuilds` | `lefthook: true` only | With `strictDepBuilds`, the probe failed `ERR_PNPM_IGNORED_BUILDS` for `lefthook@2.2.1` and named no other package. Lefthook's postinstall selects its binary. `dangerouslyAllowAllBuilds` is not set. |
| `minimumReleaseAge` | `1440` | One day, the documented example. The built-in default is also 1440 but non-strict. Setting it here turns `minimumReleaseAgeStrict` on. A longer window is not set. |

Not set: `minimumReleaseAgeExclude`, `trustPolicy`, `skills.dirs`, `dangerouslyAllowAllBuilds`. If install offers to link agent skills into `.cursor/skills` or `.claude/skills`, set `skills.dirs: []`, do not approve the links, and record that in the pull request. Apply checks those directories for files the install added.

`devEngines.runtime` shape, from the pnpm `package.json` docs (added in 10.14):

```json
"devEngines": {
  "runtime": {
    "name": "node",
    "version": "^26.11.1",
    "onFail": "download"
  }
}
```

The lockfile records the resolved Node version. The probe linked it at `node_modules/.pnpm/node@runtime+26.11.1/.../bin/node`. `pnpm exec node` used that path, not a new global Node.

Versions below are the ones the probe installed. Each was published at least one day before 2026-10-11, so `minimumReleaseAge: 1440` accepts them. pnpm `12.11.2` was published 2026-10-09. npm `latest` was `12.11.2` when checked.

## Runtime dependencies

| Package | Version | License | Unpacked size | Why |
|---|---|---|---|---|
| `react` | 19.3.0 | MIT | 178,663 bytes | Renders the page. Horizontal 03 assigns React 19 to menus, HUD, and screens. This page is that shell with only the title. |
| `react-dom` | 19.3.0 | MIT | 8,063,782 bytes | Mounts React into the document. The unpacked size includes development builds. Apply records the production `pnpm build` output size in the pull request. |

Alternatives: a page with no UI library (rejected: the documented UI layer is React, and later screens mount here); Preact (smaller, not the documented stack).

Dev dependencies, not justified under C7: `vite`, `@vitejs/plugin-react`, `typescript`, `@biomejs/biome`, `lefthook`, `@types/react`, `@types/react-dom`. pnpm also records the Node runtime in the lockfile from `devEngines`. That is the pin, not a hand-added library.

## Assumptions

- Filename convention wins over Vite's `App.tsx`: the component file is `src/app.tsx` and the export is `App`. `src/main.tsx` is the Vite entry. No `src/core` or other layer folders (task 0.3).
- The visible page is the word Signalfire. No stylesheet, logo, or counter. The document title is Signalfire.
- `check` is `typecheck`, then `lint`, then `build`.
- Conventional Commits scope is optional. The pull request title `chore: scaffold hermetic toolchain` has no scope. Types are `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `content`. The checker is `tools/check-commit-msg.mjs`, about fifteen lines. `@commitlint` is not added.
- Lefthook `pre-commit` uses two jobs, Biome first (`priority: 1`), typecheck second (`priority: 2`), `parallel` left false. Biome command: `biome check --write --staged --no-errors-on-unmatched`, with `stage_fixed: true`. `--unsafe` is not passed.
- This machine has no `pnpm` on `PATH` (checked 2026-10-11). Apply downloads the pnpm 12.11.2 standalone tarball to run install. It does not install pnpm, Node, Vite, TypeScript, Biome, or Lefthook globally.
- The OpenSpec CLI stays the global exception (`/opt/homebrew/bin/openspec` on this machine). It is not a dependency.
- `AGENTS.md` is 138 lines. The hermetic rule and the shorter command table stay under 200 lines.
- `pnpm check` is not in CI. The pull request says so. Do not claim CI ran it.
- Apply uses branch `change/hermetic-toolchain`. Pull request title: `chore: scaffold hermetic toolchain`. Archive the change before merge.
- No decision record.

## Constitution check

- **C1.** One capability, `hermetic-toolchain`. Not a C1 exemption. Apply waits for approval.
- **C2.** Principles, docs, and the Node pin departure are stated. The departure is resolved by editing the docs that cite `.nvmrc` or Node 24.
- **C3.** Karim approves this proposal before apply. The agent does not merge and does not push to `main`. CI does not exist, so this pull request cannot be green.
- **C4.** Not a logic domain, so there is no test-first Vitest work (task 0.2). See Departures: command checks cover the non-visual scenarios, and the page scenario has an automated-browser screenshot. The standing "one test per scenario" rule is not edited.
- **C5.** `strict` plus the four flags in repo-setup. Biome `suspicious.noExplicitAny` is `error`. No `@ts-ignore`.
- **C6.** No decision record. See Departures.
- **C7.** `react` and `react-dom` are named above. Dev dependencies are not runtime.
- **C8.** The hermetic rule goes in root `AGENTS.md`, tool-agnostic, still under 200 lines. `CLAUDE.md` stays `@AGENTS.md`. Nested instruction files stay as they are.
- **C9.** Code, config, docs, the delta spec, and `tasks.md` land together. Roadmap status stays "Not started" because Stage 0 is not done. Archive copies the delta into `openspec/specs/`.
- **C10.** Non-trivial. A fresh-context review of these artifacts (before this approval request) reported nine gaps: the home listing and the clean-checkout check were too early, the engine-warning stop was on the empty install, hooks called bare `node` and `biome`, README and the design-system token sentence would stay stale, C4 was treated as met without a recorded departure, the playtest item cited a vertical, and the skill-link guard was not in the tasks. Those are fixed in this proposal, `design.md`, and `tasks.md`. A second fresh-context review of the diff happens before the pull request is treated as ready.
