# Proposal

## Why

`openspec init` (CLI 1.14.1) created the OpenSpec root and tool folders, but `openspec/config.yaml` is still the commented template. Later changes will not receive the constitution's context or artifact rules until that file matches the constitution. This is task 0.0 of Stage 0.

## What Changes

- Replace `openspec/config.yaml` with the YAML in the constitution's "OpenSpec configuration" block, verbatim.
- Leave root `AGENTS.md` and `CLAUDE.md` as they are. Init did not append a block. `AGENTS.md` is 138 lines and already holds our instructions. `CLAUDE.md` is `@AGENTS.md`.
- Commit the slash commands and skills init wrote under `.agents/`, `.claude/`, and `.cursor/`, including `.agents/skills/.openspec-target`.
- Update the top-level layout tree and the Agent files paragraph in `docs/horizontals/02-repo-setup.md` so they name the tool folders init created.
- Prove injection with a throwaway change: `openspec instructions specs --change <name> --json`, then delete that change.
- Do not change `.gitignore` unless apply finds a per-machine file init created. None was found while drafting this proposal.

## Capabilities

### New Capabilities

- `openspec-configuration`: Generated artifacts receive the project context and the rules for that artifact from `openspec/config.yaml`. That file matches the constitution block. Root `AGENTS.md` stays our instruction file and stays under 200 lines.

### Modified Capabilities

- None. `openspec list --specs` returns no specs.

## Impact

- `openspec/config.yaml` (replace the init template).
- `docs/horizontals/02-repo-setup.md` (layout tree and the `.claude/` paragraph).
- New tracked files: `.agents/`, `.claude/commands/`, `.claude/skills/`, `.cursor/commands/`, `.cursor/skills/`.
- Unchanged: root `AGENTS.md`, root `CLAUDE.md`, nested `AGENTS.md` / `CLAUDE.md` files, `.gitignore`, `docs/ROADMAP.md`, `package.json`, source, CI.
- No runtime dependency. The proof uses the OpenSpec CLI already installed on the machine (1.14.1). It is not added to `package.json`.

## Principles served

- **P13.** Stage 0 is the thin scaffold before any game system. This change is the OpenSpec half of that scaffold.
- P1–P12 are not served. This change does not affect play, scoring, content, or player data.

## Docs implemented

- `docs/ROADMAP.md` Stage 0, task 0.0 (sequence only; the status column stays "Not started").
- `docs/horizontals/01-constitution.md`: C1, C8, C9, and the "OpenSpec configuration" block. The block is the source for `config.yaml`. This change does not edit the constitution.
- `docs/horizontals/02-repo-setup.md`: top-level layout and "Agent files".

## Departures

None. The layout tree names only `.claude/` today. Listing `.agents/` and `.cursor/` updates that doc to the folders init created. It does not change the rule that tool folders hold the same OpenSpec workflows.

No constitution amendment. The config file is the existing block, with nothing added. If apply finds the CLI rejects that YAML, stop and ask Karim. Do not add fields and do not bump the constitution version (1.2.0) in this change.

## Runtime dependencies

None.

## Assumptions

- Init did not modify root `AGENTS.md` or `CLAUDE.md` (`git diff` is empty; both match commit `f5dd645`). There is no OpenSpec block to keep or revert.
- "Match exactly" means the file body equals the fenced YAML in the constitution, including the en dashes in `P1–P13` and `C1–C10`, and excluding the markdown fence.
- `.agents/skills/.openspec-target` contains `codex`. That marks Codex as the writer of the shared `.agents` skill tree so a later `openspec update` does not overwrite it. It is project state, not a per-machine file, and is committed.
- Init created no per-machine file. Existing ignores (`.claude/settings.local.json`, `CLAUDE.local.md`) stay. `.gitignore` is not edited unless apply finds a per-machine file.
- Skill and command files are committed as generated. They are not rewritten.
- The throwaway change is deleted before commit. It is not archived and does not become a spec.
- `pnpm check` does not exist yet (tasks 0.1–0.5). This change does not claim it passed.
- The Claude Code formatting hook in Dev Tooling (`.claude/settings.json`) is not part of this change. The repo-setup paragraph may say it arrives with that later work.
- `config.yaml` defines rules for `proposal`, `specs`, and `tasks` only. `design` gets context and no rule list. The named proof command is `openspec instructions specs`. Apply also checks `proposal`, `design`, and `tasks` so the "any artifact" scenario is covered.
- No decision record. Copying the constitution block is not a new decision.
- Apply uses branch `change/bootstrap-openspec`. Pull request title: `chore(openspec): initialize OpenSpec`.

## Constitution check

- **C1.** This change is the OpenSpec path for task 0.0. One capability: `openspec-configuration`. It is not a C1 exemption.
- **C2.** Principles, docs, and departures are stated above. No departure.
- **C3.** Apply waits for Karim's approval. The agent does not merge and does not push to `main`. CI does not exist yet, so this pull request cannot be green. Say that in the pull request. Do not claim `pnpm check` passed.
- **C4.** Not a logic domain. No Vitest. The three scenarios are checked by `openspec instructions` and by file comparison.
- **C5.** No TypeScript.
- **C6.** No decision record. The config text already lives in the constitution.
- **C7.** No new runtime dependency.
- **C8.** Root `AGENTS.md` stays the tool-agnostic instruction file, under 200 lines, and is not rewritten. `CLAUDE.md` stays `@AGENTS.md`. Nested instruction files are untouched. Tool folders are adapters for the same workflows.
- **C9.** Config, the repo-setup doc, the delta spec, and `tasks.md` land together. Nothing else in scope lags. Archive, after merge, copies the delta into `openspec/specs/`.
- **C10.** Non-trivial. Before the pull request is treated as ready, a fresh-context review checks the diff against this change, the constitution, and repo-setup. The reviewer reports correctness and requirement gaps only. Each finding is fixed or answered in the pull request.
