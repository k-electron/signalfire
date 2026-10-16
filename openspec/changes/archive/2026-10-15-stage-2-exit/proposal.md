# Proposal: Stage 2 Exit: First-run Deployed Preview Verification and Opening Outside Contributions

## Why

Stage 2 (Walking skeleton) is implemented: a complete first-run path (title, onboarding, levels 0.1 and 1.1, real input judging, scoring, stars, results, save, reload) is running in the codebase. Per `docs/ROADMAP.md` and `docs/horizontals/02-repo-setup.md`, Stage 2 exits when the first-run Playwright flow passes on the deployed preview and outside pull requests open. Opening outside contributions with appropriate GitHub Actions approval controls and branch protections ensures repository safety while expanding collaboration.

## Principles Served

- **P13 (Thin, then deep)**: Verifies the thin end-to-end walking skeleton against real deployed infrastructure before starting Stage 3's broader system passes.
- **P11 (Local first, cloud optional)**: Confirms that the first-run local persistence and restore flow functions cleanly in a production deployment environment.

## Docs Implemented

- `docs/ROADMAP.md`: Stage 2 exit criteria and status table update.
- `docs/horizontals/02-repo-setup.md`: Contributions section opening pull requests to outside contributors, git workflow, and GitHub settings.
- `docs/horizontals/05-data-model.md`: Run-log retention (best and last 3 per level and tier) at level completion checkpoint.
- `docs/horizontals/10-ci-cd-and-hosting.md`: Cloudflare Workers PR preview verification and GitHub Actions workflow approval policies.
- `docs/horizontals/01-constitution.md`: Human gate approval for stage exit (C3).

## Departures from Docs

None. Cloudflare Workers natively supplies branch and commit preview URLs on pull requests as described in horizontal 10. Outside pull requests open following OpenSpec and the constitution as specified in horizontal 02.

## Runtime Dependencies

None. Zero new runtime dependencies are added.

## What Changes

- **E2E Preview Execution**: Configure `playwright.config.ts` to respect `PLAYWRIGHT_BASE_URL` so that Playwright can execute tests directly against a remote deployed preview URL (e.g., Cloudflare Workers preview deployments) without spawning a local preview web server.
- **Preview Verification**: Execute the first-run Playwright test suite (`e2e/first-run.spec.ts`) against the deployed PR preview URL and record the passing execution.
- **Documentation & Intake**:
  - Update `CONTRIBUTING.md` to announce that outside pull requests are open and explain how outside contributors follow the OpenSpec propose → apply → review flow and adhere to the constitution.
  - Update `README.md` status to declare Stage 2 exited alongside Stages 0 and 1, and update the contributing section to invite pull requests.
  - Update `docs/ROADMAP.md` stage table to mark Stage 2 as **Done** and update Stage 2 bullets to present tense.
  - Update `docs/horizontals/05-data-model.md` deferred fields table so Stage 2 run-log retention is no longer listed as waiting on Stage 2.
- **Stage 2 Verification & Live Run-Log Checkpoint**: Audit all sentences in `docs/ROADMAP.md` for Stage 2 against the code; wire `Level` and `saveLevelCompletionCheckpoint` to persist the live `WaitingLanesRun` run log (with `generateRunId()` and `level.contentVersion`) and apply `retainRuns` (best + last 3 per level and tier) when updating `run-index`.
- **GitHub Repository Settings**:
  - Set GitHub Actions fork pull request workflow approval policy to `all_external_contributors` so that outside contributors require workflow run approval before Actions run.
  - Verify and document repository branch protection rules on `main` (requiring CI checks and review).

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `contribution-intake`: Update `CONTRIBUTING.md` and `README.md` to open outside pull requests, describe the OpenSpec workflow for contributors, and reflect Stage 2 completion in project status.
- `test-harness`: Support targeting deployed preview URLs in Playwright via `PLAYWRIGHT_BASE_URL` without spinning up a local preview server, enabling end-to-end verification of deployed Cloudflare builds.

## Impact

- `playwright.config.ts`: Added support for `PLAYWRIGHT_BASE_URL` and conditional local web server spawning.
- `src/core/sim/waiting-lanes.ts`, `src/app/screens/level.tsx`, `src/app/app.tsx`, `src/app/storage/checkpoints.ts`: Wired live `WaitingLanesRun` run log and `retainRuns` into level completion checkpoint persistence.
- `CONTRIBUTING.md`, `README.md`, `docs/ROADMAP.md`, `docs/horizontals/05-data-model.md`: Updated contribution instructions, status, and roadmap stage completion.
- GitHub configuration: Actions fork PR approval policy set to `all_external_contributors`.
- APIs / dependencies: No change to APIs or runtime dependencies.

## Constitution Check

- **C1 (OpenSpec)**: Proposed as `stage-2-exit` following the propose → apply → archive flow.
- **C2 (Docs trace)**: Traces to `docs/ROADMAP.md`, `docs/horizontals/02-repo-setup.md`, and `docs/horizontals/10-ci-cd-and-hosting.md`.
- **C3 (Human gates)**: Explicitly requests Karim's approval for the proposal, PR review, and Stage 2 exit sign-off.
- **C4 (Test-first for logic)**: Tooling/docs change verified by command runs and green end-to-end test execution against the deployed preview.
- **C5 (Strict TypeScript)**: Strict TypeScript preserved without any errors, `any`, or `@ts-ignore`.
- **C6 (Decisions recorded)**: Aligns with existing ADRs (0001, 0006). No new architecture decision required.
- **C7 (Dependencies)**: No new runtime or dev dependencies introduced.
- **C8 (Agent instructions)**: Works across agent tools; preserves `AGENTS.md` conventions.
- **C9 (Everything changes together)**: Specs, docs, configurations, and tasks are synchronized within this single change.
- **C10 (Independent verification)**: Plan and diff will undergo independent review before merging.
