# Design

## Context

See proposal.md. Apply this change only from `main` after storage-safety, review-cleanup, and constitution-c7 are merged. Stage 1 on the roadmap is still "Not started" at the start of this change.

## Goals / Non-Goals

**Goals:**

- The roadmap, horizontal 05, and the README say what Stage 1 actually shipped.
- The pull request shows the two exit tests and asks Karim to approve the exit.

**Non-Goals:**

- Implementing retention, telemetry, sync, or tab conflicts.
- Changing a spec other than the README status requirement in `contribution-intake`.

## Decisions

1. **Exit evidence.** In the pull request body, name `a recorded run replays` (`src/core/replay/stand-in-run.test.ts`) and `an older IndexedDB document migrates, saves, and restores` (`src/platform/storage/indexed-db.browser.test.tsx`), or the renamed tests if storage-safety changed the titles. Paste the passing Vitest output for those two tests. Ask Karim, in one sentence, to approve the Stage 1 exit (constitution C3).

2. **Deferred fields.** Add a short table to horizontal 05, under Documents, listing fields the version 1 schemas do not store yet and the stage that adds them. Use the table in proposal.md Assumptions. Do not add the fields to the schemas.

3. **Roadmap.** Status cell for Stage 1 becomes Done. Under Stage 2, one sentence: a live run must record its own run log; today the kernel re-simulates a list of inputs it is given. Under Stage 3, one sentence: rev-based save conflicts between tabs are not handled yet. Do not start Stage 2 work.

4. **Doc audit.** Read every Stage 0 and Stage 1 sentence in `docs/ROADMAP.md`, `docs/horizontals/02-repo-setup.md`, `docs/horizontals/04-architecture.md`, `docs/horizontals/10-ci-cd-and-hosting.md`, `README.md`, and root `AGENTS.md`. Fix a sentence when the hosting URL, a scripts table, a layout tree, or a command list disagrees with the repo. Where the architecture tree lists directories the game will have later, say which directories exist after Stage 1 (`src/core/ports`, `src/core/replay`, `src/core/schemas`, `src/core/theme`, `src/core/storage` if storage-safety added it, `src/engine/loop`, `src/platform/storage`, `src/app`) and that the other names are the target layout. Do not delete the target list.

5. **README.** Status says Stages 0 and 1 are done. The play URL stays `https://signalfire.k-electron.workers.dev/`.

## Risks / Trade-offs

- [A doc "fix" changes design intent for a later stage] → Only fix sentences that claim the repo already has something it does not, or that omit something Stage 0 or Stage 1 shipped. Leave target-state sentences once they are labeled as later stages.

## Migration Plan

Docs and the pull request body. No deploy. Rollback is reverting the pull request; the roadmap would say Stage 1 has not started again, which would be wrong, so this merges only with Karim's exit approval.

## Open Questions

None.
