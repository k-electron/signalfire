# Tasks

## 1. Exit record

- [x] 1.1 Branch from `main` after storage-safety, review-cleanup, and constitution-c7 are merged. Run the headless replay test and the IndexedDB migrate-save-restore test named in design.md. Verify both pass, and keep the output for the pull request.
- [x] 1.2 In horizontal 05, add the deferred-field table from the proposal assumptions. Verify each named field is absent from the version 1 schema and that fields the schemas do store are not listed as deferred.
- [x] 1.3 In `docs/ROADMAP.md`, set Stage 1 to Done. Under Stage 2, note that a live run must record its own run log and that today the kernel re-simulates a supplied input list. Under Stage 3, note that rev-based save conflicts between tabs are not handled. Verify the status table shows Stages 0 and 1 Done.
- [x] 1.4 Check Stage 0 and Stage 1 sentences in the roadmap, repo setup, architecture, CI/CD and hosting, the README, and root `AGENTS.md` against hosting, the scripts tables, the layout tree, and the commands. Fix sentences that disagree. Label the architecture tree's later directories as the target layout and name the directories that exist. Set the README status to pre-alpha with Stages 0 and 1 exited, and keep the play URL. Verify a search of those files no longer says Stage 1 is not started or that the game is not deployed.
- [ ] 1.5 Open the pull request with the two test names, their passing output, and one sentence asking Karim to approve the Stage 1 exit. Ask a fresh-context reviewer to check the doc sentences against the tree and the scripts. Fix or answer each finding.

## Workflow follow-up

- Archive this change before squash-merge. Karim approves the stage exit and merges (constitution C3).
