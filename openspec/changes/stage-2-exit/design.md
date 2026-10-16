# Design: Stage 2 Exit: First-run Deployed Preview Verification and Opening Outside Contributions

## Context

See `proposal.md` for motivation.

Stage 2 implementation is complete on `main`. Cloudflare Workers Git integration deploys previews for pull requests (confirmed on PR #28). Currently, `playwright.config.ts` hardcodes `baseURL: "http://127.0.0.1:4173"` and unconditionally launches a local `vite preview` web server. Outside contributors are currently instructed not to open pull requests in `CONTRIBUTING.md` and `README.md`, and GitHub Actions workflow approval policy defaults to `first_time_contributors`.

## Goals / Non-Goals

**Goals:**
- Configure `playwright.config.ts` to support remote deployed preview URLs via `PLAYWRIGHT_BASE_URL` without spinning up a local preview server.
- Run the first-run end-to-end flow (`e2e/first-run.spec.ts`) against the deployed preview URL and document the passing evidence.
- Update `CONTRIBUTING.md`, `README.md`, and `docs/ROADMAP.md` to open outside pull requests and mark Stage 2 as Done.
- Set GitHub Actions fork approval policy to `all_external_contributors` and maintain required review on `main`.

**Non-Goals:**
- Altering core game mechanics, scoring, or asset pipelines.
- Polling Cloudflare deployment status within GitHub Actions CI (Cloudflare deploys asynchronously and comments on the PR).

## Decisions

### 1. Playwright Environment-driven Base URL
In `playwright.config.ts`, set:
```typescript
const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:4173";
```
When `PLAYWRIGHT_BASE_URL` is set, `webServer` is set to `undefined`, allowing Playwright to test against a remote deployed target (such as `https://<preview>.workers.dev`). When unset, standard local `vite preview` behavior is preserved for `pnpm test:e2e`.

*Alternative considered*: A dedicated `playwright.preview.config.ts`. Rejected to avoid configuration duplication and maintain one unified configuration file.

### 2. Documented Remote Preview Execution Command
A script or documented command:
```bash
PLAYWRIGHT_BASE_URL=<preview-url> PLAYWRIGHT_BROWSERS_PATH=0 pnpm exec playwright test e2e/first-run.spec.ts
```
allows maintainers and agents to verify deployed preview builds on pull requests.

### 3. GitHub Fork PR Workflow Approval Setting
Set `approval_policy` on `/repos/k-electron/signalfire/actions/permissions/fork-pr-contributor-approval` to `all_external_contributors`. This ensures that any fork PR submitted by an outside contributor must be explicitly approved by Karim before any GitHub Actions workflow executes.

### 4. Branch Protection and Required Review on `main`
Ensure `main` requires pull request reviews (preventing direct pushes and unreviewed merges, satisfying constitution C3) and requires green CI before merge.

## Risks / Trade-offs

- **[Risk]**: Cloudflare preview deployment builds asynchronously after push.
  → **Mitigation**: Agents or maintainers run the preview verification command once Cloudflare posts the deployment preview URL comment to the pull request.
- **[Risk]**: Client-side fake clock behavior over remote latency.
  → **Mitigation**: `page.clock.install()` installs in the browser runtime prior to navigation and operates client-side; network latency does not impact deterministic clock stepping.
