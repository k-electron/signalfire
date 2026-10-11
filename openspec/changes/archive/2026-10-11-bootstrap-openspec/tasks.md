# Tasks

## 1. Branch

- [x] 1.1 Create branch `change/bootstrap-openspec` from `main` and verify `git branch --show-current` prints that name

## 2. Root instruction files

- [x] 2.1 Re-read root `AGENTS.md` and `CLAUDE.md` against commit `f5dd645`. Verify `AGENTS.md` is under 200 lines, still has the sections named in `design.md` (Principles through Gotchas), and `CLAUDE.md` is only `@AGENTS.md`. If both files are unchanged, leave them unedited. If an added block pushes `AGENTS.md` over 200 lines, remove that block, restore our content, and say so for Karim. Verify with `wc -l AGENTS.md` and `git diff f5dd645 -- AGENTS.md CLAUDE.md`

## 3. Config and injection

- [x] 3.1 Replace `openspec/config.yaml` with the fenced YAML under "OpenSpec configuration" in `docs/horizontals/01-constitution.md`, fence markers excluded, en dashes kept. Verify the file bytes equal that fence body. If `openspec instructions` rejects the file, stop and ask Karim; do not add keys
- [x] 3.2 Create throwaway change `config-probe`. Run `openspec instructions specs --change config-probe --json`, and the same command for `proposal`, `design`, and `tasks`. Verify every response `context` is the three constitution sentences, `proposal` has its five rules, `specs` has its one rule, `tasks` has its two rules, and `design` has context and omits `rules`. Delete `openspec/changes/config-probe/` and verify `openspec list` does not show it

## 4. Repo-setup doc

- [x] 4.1 Update the layout tree and the ".claude/ holds ..." paragraph in `docs/horizontals/02-repo-setup.md` as `design.md` specifies: name `.agents/`, `.claude/`, and `.cursor/`; state `.openspec-target` is `codex`; say the formatting hook arrives with Dev Tooling. Verify those strings are in the file and the old sentence that the hook is already held in `.claude/` is gone

## 5. Tracked files

- [x] 5.1 Inspect the init tree for per-machine files. Verify `.agents/skills/.openspec-target` is not ignored and still contains `codex`. Change `.gitignore` only if a per-machine file exists; otherwise verify `git diff -- .gitignore` is empty. Do not ignore skill or command files
- [x] 5.2 Leave generated skill and command files unedited. Verify each `SKILL.md` still has `generatedBy: "1.14.1"` and `git diff` shows no edits inside `.agents/`, `.claude/`, and `.cursor/`

## 6. Review and pull request

- [x] 6.1 Run `openspec validate bootstrap-openspec` and verify it passes. Have a fresh-context review of the diff against this change, the constitution (C1–C10), and repo-setup. Verify each finding is fixed or answered in the pull request
- [x] 6.2 Open the pull request from `change/bootstrap-openspec` with title `chore(openspec): initialize OpenSpec`. Verify the body says `pnpm check` does not exist yet and does not claim it passed. Do not merge

## Workflow follow-up

- After Karim merges, archive this change so the delta lands in `openspec/specs/openspec-configuration/spec.md`.
- Do not archive before merge.
