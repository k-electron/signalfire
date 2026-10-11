# Design

## Context

See `proposal.md` for why. Observed at proposal time, OpenSpec CLI 1.14.1:

- `openspec/config.yaml` is the init comment template (32 lines). It sets `schema: spec-driven` and has no `context` or `rules`.
- Root `AGENTS.md` is 138 lines and matches commit `f5dd645`. Root `CLAUDE.md` is `@AGENTS.md`. Init appended nothing.
- Init wrote three tool trees. Skill bodies differ by tool. `.agents/skills/.openspec-target` is `codex`, the ownership marker for that shared skill root (`shared-skill-target.js` in the CLI).
- The CLI injects `context` (trimmed) and `rules.<artifact-id>` into `openspec instructions <artifact> --json`. An artifact with no rule list omits `rules`.

The constitution block is valid for `ProjectConfigSchema`: `schema`, `context`, and `rules` whose values are string arrays.

## Goals / Non-Goals

**Goals:**

- `openspec/config.yaml` is the constitution fence body, so a byte compare can pass.
- One throwaway change proves injection for `proposal`, `specs`, `design`, and `tasks`, then is deleted.
- Repo-setup names `.agents/`, `.claude/`, and `.cursor/` as they exist.
- Generated skills and commands are committed unchanged.

**Non-Goals:**

- A CI check that the two YAML texts stay equal. CI is tasks 0.1–0.5.
- Editing skill or command bodies, pinning the CLI, or adding it to `package.json`.
- Creating `.claude/settings.json`. That hook is Dev Tooling.

## Decisions

### Replace `config.yaml` with the fence body

Copy the YAML inside the fence under "OpenSpec configuration" in `docs/horizontals/01-constitution.md`. Do not include the fence markers. Keep the en dashes in `P1–P13` and `C1–C10`. Do not retype the block.

Alternative considered: leave the init comments above the block. A comment-bearing file would not match the constitution block.

If `openspec instructions` rejects the file, stop and tell Karim. Do not add keys. An addition belongs in the constitution block in the same change, flagged as a patch amendment for Karim to ratify, with the version and date updated. That path is not expected.

### Prove injection, then delete the probe

After the config file is in place:

1. `openspec new change config-probe`
2. `openspec instructions specs --change config-probe --json`
3. The same command for `proposal`, `design`, and `tasks`.

Pass conditions:

- Each response `context` equals the constitution `context` value after YAML parse and trim: the three sentences, separated by newlines.
- `proposal.rules` is the five proposal bullets, in order.
- `specs.rules` is the one specs bullet.
- `tasks.rules` is the two tasks bullets, in order.
- `design` includes `context` and omits `rules`.

Then delete `openspec/changes/config-probe/` and confirm `openspec list` does not show it. Do not archive it.

Alternative considered: check only `specs`, as the named command. The spec says any artifact, and `design` has no rules, so the other three calls are part of the proof.

### Leave `AGENTS.md` and `CLAUDE.md` untouched

Re-check at apply. If they still match `f5dd645`, do not edit them.

If a block has appeared since and the file is still under 200 lines with our sections intact, keep the block. If the file is over 200 lines, remove the added block, restore our content, and tell Karim in the pull request.

"Our content" means the sections in the committed file: Principles, Read first, How work happens, When you're unsure, Commands, Before you say "done", Code rules, Tests, Writing style, Commits and pull requests, Gotchas.

### Commit generated files; do not ignore the ownership marker

Track everything init wrote under `.agents/`, `.claude/`, and `.cursor/`, including `.openspec-target`.

Alternative considered: gitignore `.openspec-target` as local. A clone without the marker can assign the shared skill root to a different tool on `openspec update` and rewrite the skills.

Change `.gitignore` only if apply finds a per-machine file (local settings, machine-specific state). None was in the init tree. Do not ignore skills or commands.

### Doc wording

In the layout tree, replace the single `.claude/` line with:

- `.agents/`: OpenSpec skills and workflows. `.openspec-target` names the skill-tree owner.
- `.claude/`: Claude Code slash commands and OpenSpec skills.
- `.cursor/`: Cursor slash commands and OpenSpec skills.

Keep `.github/` as it is.

Replace the ".claude/ holds ..." paragraph so it names those three folders, states that `.openspec-target` is `codex` after this init, and says the formatting hook arrives with Dev Tooling. Do not say the hook is already in the repo.

## Risks / Trade-offs

- [An editor rewrites en dashes or trims the YAML] → Compare the file to the fence body before commit. Do not retype it.
- [The probe change is left in the tree] → Delete it in the same task that creates it, and check `openspec list`.
- [Config and the constitution drift after this change] → The spec requires they match. No CI enforces that until a later stage. Reviewers compare them on any edit to either file.
- [Generated skills are long and tool-specific] → Commit them as generated. Hand-editing would diverge from `openspec update`.

## Migration Plan

No player data and no runtime behavior. Rollback is reverting the pull request. The probe directory must not be in the commit.
