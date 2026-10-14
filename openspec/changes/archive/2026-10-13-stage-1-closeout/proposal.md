# Proposal

## Why

Stage 1's code is on `main` once storage-safety, review-cleanup, and the C7 amendment have merged. The roadmap still says Stage 1 has not started, horizontal 05 does not say which version 1 fields are deferred, and a few Stage 0 and Stage 1 sentences describe a repo that is not the one that shipped. Karim cannot exit the stage until those match.

## What Changes

- The pull request names the headless replay test and the IndexedDB save-and-migrate test, and pastes a green run of each. It asks Karim to approve the Stage 1 exit.
- Horizontal 05 names the version 1 fields that are not in the schemas yet, and the stage that adds each one.
- `docs/ROADMAP.md`: Stage 1 is Done. Stage 2 notes that a live run must record its own run log; today the kernel re-simulates a list of inputs it is given. Stage 3 notes that rev-based save conflicts between tabs are not handled yet.
- Every doc sentence about Stage 0 and Stage 1 is checked against the code: hosting, the scripts tables, the layout tree, and the command lists. Sentences that are false are fixed. The README status line says Stage 0 and Stage 1 are done, and the play URL stays `https://signalfire.k-electron.workers.dev/`.

Out of this change: new features, Stage 2 implementation, recording a live run, and resolving save conflicts.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `contribution-intake`: the README status says Stages 0 and 1 have exited. The play URL requirement from review-cleanup stays.

## Impact

- `docs/ROADMAP.md`, `docs/horizontals/05-data-model.md`, `README.md`, and any Stage 0 or Stage 1 sentence in `docs/horizontals/02-repo-setup.md`, `docs/horizontals/04-architecture.md`, `docs/horizontals/10-ci-cd-and-hosting.md`, and root `AGENTS.md` that does not match the tree or the scripts.
- No application code, unless a doc fix would be a lie without a one-line comment that already belongs in an earlier change. No such code change is expected.

## Principles served

- **P13.** Stage 1 exits before Stage 2 starts. The roadmap is the sequence.
- P1–P12 are not served.

## Docs implemented

- `docs/ROADMAP.md`: status column, Stage 1 exit, and the two notes under Stages 2 and 3.
- `docs/horizontals/05-data-model.md`: which version 1 document fields exist now, and which wait.
- `README.md`: status matches the roadmap after this change.
- Hosting, scripts, layout, and commands in the Stage 0 and Stage 1 docs listed under Impact, where a sentence is false.

## Departures

- No departure. The roadmap already says its status column updates in the pull request that finishes a stage, and that Karim approves the exit.

## Assumptions

- This change is applied only after storage-safety, review-cleanup, and constitution-c7 are on `main`. Its branch starts from that `main`.
- The headless replay test is `a recorded run replays` in `src/core/replay/stand-in-run.test.ts`. The IndexedDB test is `an older IndexedDB document migrates, saves, and restores` in `src/platform/storage/indexed-db.browser.test.tsx`. If storage-safety renames either test, the pull request uses the name that implements that scenario.
- Version 1 fields present in code: profile (call sign, created at, onboarding, preferred thumb), settings (four volumes, effects intensity, fullscreen), progress (per-level tier records), run log, and run index, each with `v`, `updatedAt`, and `rev`.
- Deferred, and the stage that adds them:
  - Stage 2: run-log retention (best and last 3, Courier, Daily Signal). The schema for one log exists; enforcement waits until a finished run is recorded.
  - Stage 3: `progress.barriersBroken`, `progress.repairStars`, the telemetry document, the meta document, and `syncState`.
  - Stage 5: `progress.storyFlags`.
  - Stage 6: `profile.equipped`, `progress.mods`, `progress.keylingsRescued`, `progress.codexUnlocked`.
- The architecture source tree is the target layout for later stages. Where it reads as a list of directories that exist today, this change says which of those directories exist after Stage 1 and that the rest arrive with the stage that fills them. It does not delete the target list.
- The live site is `https://signalfire.k-electron.workers.dev/`. This change does not redeploy.
- No new dependency.

## Constitution check

- **C1.** One change. It updates `contribution-intake` because the README status is already a requirement. Not a C1 exemption: it is the stage exit, not a typo.
- **C2.** Principles, docs, and departures are stated above.
- **C3.** The pull request asks Karim to approve the Stage 1 exit. The agent does not merge it and does not push to `main`. CI on this pull request is the green run. The pasted test output is additional evidence of the two exit criteria.
- **C4.** No new logic. The exit evidence is the two existing tests, pasted from a green run.
- **C5.** No code, unless a doc fix cannot be true without one. None is planned.
- **C6.** No decision record. The exit is the roadmap, which already assigns approval to Karim.
- **C7.** No new dependency.
- **C8.** Root `AGENTS.md` is edited only where a Stage 0 or Stage 1 command or layout sentence is false. It stays under 200 lines.
- **C9.** Docs, the contribution-intake delta, and `tasks.md` land together.
- **C10.** The fresh-context review checks the doc sentences against the tree and the scripts, and checks that the pasted output is the two named tests.
