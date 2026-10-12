# Tasks

## 1. Files

- [x] 1.1 Branch `change/static-deploy` from current `main`. Verify `git status` is clean.
- [x] 1.2 Add `src/base.css` and the `<link>` in `index.html` from design.md. Remove the inline `<style>`. Verify `index.html` has no `<style`, the link href is `/src/base.css`, and `src/base.css` sets `color: CanvasText` and `background: Canvas` on `body`.
- [x] 1.3 Add `public/_headers` from design.md. Verify the file matches that block.
- [x] 1.4 Run `pnpm build`. Verify `dist/_headers` matches `public/_headers`, `dist/index.html` has no `<style` and no inline `<script`, and its stylesheet link points at `/assets/`. If an inline script is present, update the policy or the HTML in this change so `script-src` stays `'self'`, then rebuild and verify again.
- [x] 1.5 Update `docs/horizontals/10-ci-cd-and-hosting.md` from design.md decision 5: the CSP cell, and one hosting sentence that the Pages project sets `PNPM_VERSION` from `packageManager` and Node is the `devEngines.runtime` lockfile entry. Leave `docs/ROADMAP.md` status unchanged in this task. Verify the CSP cell names the site itself as the current limit, and the hosting section names `PNPM_VERSION` and `devEngines.runtime`.
- [x] 1.6 Run `pnpm check`. Verify it passes.

## 2. Preview

- [x] 2.1 The pull request is https://github.com/k-electron/signalfire/pull/9. The Worker is named `signalfire`. Build command is `pnpm build`. Deploy command is `pnpm exec wrangler deploy`, not `npx wrangler deploy`. `PNPM_VERSION` is `12.11.2` for production and preview. Verify the pull request has a Workers preview URL.
- [x] 2.2 On that preview, verify the build log shows pnpm `12.11.2` and Node `26.11.1`. Request `/` and one file under `/assets/`. Verify `/` shows Signalfire and no other visible text, and the response matches the static-hosting document scenario (`Content-Security-Policy` with `default-src 'self'`, `script-src 'self'`, `style-src 'self'`, and `connect-src 'self'`; `X-Content-Type-Options: nosniff`; `Referrer-Policy: no-referrer`; `Permissions-Policy` disabling camera, microphone, and geolocation; `Cache-Control: no-cache`). Verify the asset `Cache-Control` is `public, max-age=31536000, immutable`. Record the preview URL and the header output in the pull request. Do not use `vite preview` as the header check. Do not fill the playtest checklist.
- [x] 2.3 Set Stage 0 status to Done in `docs/ROADMAP.md`. Verify that status cell is Done.
- [ ] 2.4 Ask a fresh-context agent that did not write the code to review the diff against this change, horizontal 10, the constitution, and `openspec/specs/ci-pipeline` and `hermetic-toolchain`. Verify each finding is fixed or answered in the pull request.

## Workflow follow-up

- Archive this change (`/opsx:archive`) on the branch after Karim's review requirements are satisfied and before the squash-merge, so the delta lands in `openspec/specs/static-hosting/`.
- After merge, Workers deploys `main` with the same settings. Confirm the production document shows Signalfire.
