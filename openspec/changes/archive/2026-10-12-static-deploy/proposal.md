# Proposal

## Why

Stage 0 is not done until a merge to `main` deploys the empty page. CI is already green and the layer-boundary check already runs. Nothing serves the built app, and nothing sets the headers that keep the page from calling out.

## What Changes

- Connect the GitHub repo to Cloudflare Workers static assets. Production is `main`. Every pull request gets a preview URL. The build command is `pnpm build`. The deploy command is `pnpm exec wrangler deploy`. `wrangler.jsonc` uploads `dist/`.
- Set `PNPM_VERSION` to the `packageManager` version (`pnpm@12.11.2`). pnpm downloads the lockfile Node (`node@runtime:26.11.1`) from `devEngines.runtime`. Do not add `.nvmrc`. Do not deploy with `npx`: npm rejects `devEngines.runtime` when the image Node is older than that pin.
- Add `public/_headers`. Vite copies it into `dist/`. It sets a Content Security Policy for what the app loads today (the site itself), a year-long cache for hashed assets, revalidation for the HTML document, and the standard security headers.
- Move the inline `<style>` in `index.html` to a same-origin stylesheet so the policy can use `style-src 'self'`.
- Update the CSP sentence in `docs/horizontals/10-ci-cd-and-hosting.md`: Puter and the analytics endpoint are added when those features land.
- Mark Stage 0 done in `docs/ROADMAP.md` once the preview serves the page. CI and the layer-boundary check are already on `main`.

## Capabilities

### New Capabilities

- `static-hosting`: Cloudflare Workers builds and serves the app on `main`, posts a preview URL per pull request, and sends the security, cache, and Content Security Policy headers.

### Modified Capabilities

- `contribution-intake`: the README status section says Stage 0 has exited. It stays pre-alpha. The play section still says the game is not deployed yet.

## Impact

- New: `public/_headers`, a same-origin stylesheet linked from `index.html`, `wrangler.jsonc`.
- Dev dependency: `wrangler@4.149.0`. Its install needs `esbuild` and `workerd` build scripts, allowed in `pnpm-workspace.yaml`.
- Edited: `index.html`, `docs/horizontals/10-ci-cd-and-hosting.md`, `docs/ROADMAP.md`, `README.md`.
- Dashboard, not files: the Pages project, the Git connection, production branch `main`, build command, output directory, and `PNPM_VERSION`.
- Unchanged: GitHub Actions, Dependabot, `package.json` pins, Vite config.
- No new runtime dependency. `wrangler` is a dev dependency.

## Principles served

- **P11.** The page is static. Nothing in this change sends player data anywhere.
- **P13.** This is the remaining Stage 0 slice: an empty page on a real URL.
- P1–P10 and P12 are not served.

## Docs implemented

- `docs/ROADMAP.md` Stage 0 exit: an empty page deploys on merge. Status becomes Done in this change.
- `docs/horizontals/10-ci-cd-and-hosting.md`: Hosting and Headers. The CSP sentence is edited so it matches the origins this change allows.
- `docs/horizontals/06-persistence-and-sync.md`: Privacy. Implemented as written. Not edited. No server is added.
- `AGENTS.md`: typing data never leaves the device. Implemented as written. Not edited.
- `docs/horizontals/02-repo-setup.md`: Node and pnpm pins. Implemented as written. Not edited.

## Departures

- Horizontal 10 said Cloudflare Pages. Karim switched to Workers after the Pages project never started a build, and Create application is the path Cloudflare now recommends. The same change updates horizontal 10, its README row, and the Stage 0 roadmap bullet.
- Horizontal 10 says the Content Security Policy limits connections to the site, Puter, and the analytics endpoint. Puter and analytics are out of this change. The policy allows the site only. The same change updates that sentence: those origins are added when those features land. That is the doc update, not a decision record.

## Assumptions

- The Worker name in the dashboard is `signalfire`, matching `wrangler.jsonc`. Production branch is `main`. Build command is `pnpm build`. Deploy command is `pnpm exec wrangler deploy`. Production and preview set `PNPM_VERSION` to `12.11.2` and `NODE_VERSION` to `26.11.1`. `.node-version` carries the same Node pin.
- `pnpm install` on that pnpm downloads Node `26.11.1`. `pnpm build` runs on that runtime. The build log is the check.
- Preview and production share `_headers` and the build command. The pull request evidence is the preview URL. `vite preview` does not apply `_headers`.
- The `workers.dev` hostname is chosen in the dashboard. The repo does not hardcode it.
- The built `index.html` has no inline script. If the build emits one, the policy or the HTML changes in this same change so the preview still loads.

## Constitution check

- **C1.** One capability, `static-hosting`. Not a C1 exemption. Apply waits for approval.
- **C2.** Principles, docs, and the CSP departure are stated. The departure is resolved by editing horizontal 10.
- **C3.** Karim approves this proposal before apply. The agent does not merge and does not push to `main`. Karim's review of the pull request is the Stage 0 exit approval.
- **C4.** Not a logic domain. The evidence is the Pages preview: the page text, the build log's pnpm and Node versions, and the response headers. No Vitest test is added.
- **C5.** The stylesheet and `index.html` stay strict. `pnpm typecheck` and `pnpm lint` are unchanged.
- **C6.** No decision record. Pages is the hosting doc's choice. Header values are in `design.md`.
- **C7.** No new runtime dependency. `wrangler@4.149.0` is a dev dependency (MIT OR Apache-2.0) so `pnpm exec wrangler deploy` resolves. `esbuild` and `workerd` build scripts are allowed because Wrangler needs those binaries and `strictDepBuilds` rejects an unapproved script.
- **C8.** `AGENTS.md` is unchanged.
- **C9.** `_headers`, the stylesheet, `index.html`, horizontal 10, the roadmap status, the delta spec, and `tasks.md` land together.
- **C10.** Non-trivial. A fresh-context review of the diff happens before the pull request is treated as ready.
