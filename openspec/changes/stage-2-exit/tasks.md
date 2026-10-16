# Tasks

## 1. Deployed Preview E2E Configuration

- [x] 1.1 Update `playwright.config.ts` to use `PLAYWRIGHT_BASE_URL` if set and conditionally skip spawning local `webServer`, and verify `pnpm test:e2e` passes locally.
- [x] 1.2 Document the preview verification command (`PLAYWRIGHT_BASE_URL=<url> PLAYWRIGHT_BROWSERS_PATH=0 pnpm exec playwright test e2e/first-run.spec.ts`) in `AGENTS.md` and `docs/horizontals/10-ci-cd-and-hosting.md`.

## 2. Contribution Intake and Documentation Updates

- [x] 2.1 Update `CONTRIBUTING.md` to state that pull requests from outside contributors are open through OpenSpec and the constitution, and verify content matches the `contribution-intake` spec.
- [x] 2.2 Update `README.md` to invite outside pull requests and declare Stage 2 exited in the status section.
- [x] 2.3 Audit every Stage 2 statement in `docs/ROADMAP.md` against the code to confirm exact alignment.
- [x] 2.4 Update `docs/ROADMAP.md` stages table to mark Stage 2 as **Done**.

## 3. GitHub Permissions and Branch Protection

- [x] 3.1 Update GitHub Actions fork PR workflow approval policy to `all_external_contributors` using `gh api` and verify the updated policy.
- [x] 3.2 Ensure branch protection on `main` requires pull request reviews and CI checks, and list the applied settings.

## 4. Verification and Stage Exit

- [x] 4.1 Run `pnpm check` and ensure typecheck, lint, content check, unit/browser tests, and production build all pass cleanly.
- [x] 4.2 Run the first-run Playwright suite (`e2e/first-run.spec.ts`) against the deployed pull request preview URL and capture execution output.
- [x] 4.3 Open the pull request with filled template, listing preview test evidence, GitHub settings, and asking Karim to approve the Stage 2 exit.

## Workflow follow-up

- Karim reviews the pull request and approves Stage 2 exit.
- Archive the change (`/opsx:archive`) and squash-merge to `main`.
