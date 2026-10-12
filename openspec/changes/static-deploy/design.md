# Design

## Context

See proposal.md for why. The page is `index.html` plus `src/main.tsx`, which renders an `h1` whose text is Signalfire. The document style lives in `src/base.css`. The production build is `pnpm build` (`vite build`), output `dist/`. Vite copies `public/` into `dist/` as-is.

Pins, from `package.json` and `pnpm-lock.yaml`: `packageManager` is `pnpm@12.11.2`, and the lockfile runtime is `node@runtime:26.11.1` via `devEngines.runtime` (`onFail: download`). CI already installs that way. There is no `.nvmrc`. The Workers build image on 2026-10-12 used Node `v24.18.0` for `npx`.

`vite preview` serves `dist/` and does not apply `_headers`.

## Goals / Non-Goals

**Goals:**

- Workers builds `main` and each pull request with the pinned pnpm and the lockfile Node.
- `dist/_headers` is the header source. Workers static assets read it from the asset directory.
- The document policy allows the site itself. The inline style is gone, so `style-src 'self'` is enough.

**Non-Goals:**

- Puter, analytics, a custom domain, release tags, branch protection. No Worker script. The app stays static.

## Decisions

1. **Git-connected Workers project.** Production branch `main`. Build command `pnpm build`. Deploy command `pnpm exec wrangler deploy`. `wrangler.jsonc` names the Worker `signalfire`, sets `assets.directory` to `./dist`, and turns on `workers.dev` and preview URLs. There is no `main` script. The Pages project never started a build. Create application is the Workers path Cloudflare documents for a new site. Alternative: keep debugging Pages. The GitHub check for that project stayed queued with no check run.

2. **Deploy through pnpm, not `npx`.** A Workers build on 2026-10-12 ran `pnpm build` successfully, then `npx wrangler deploy` failed: npm `EBADDEVENGINES`, image Node `v24.18.0` against `devEngines.runtime` `^26.11.1`. npm does not download the runtime. `pnpm exec` does, via `onFail: download`. `wrangler@4.149.0` is a dev dependency so the exec resolves. `esbuild` and `workerd` are in `allowBuilds` because `strictDepBuilds` otherwise fails the install. No `.nvmrc`. `PNPM_VERSION` is `12.11.2` on production and preview. Alternative: set `NODE_VERSION` to `26.11.1` and keep `npx`. That second pin is only there to satisfy npm.

3. **`public/_headers`, copied by Vite into `dist/_headers`.** Pages applies that file from the build output. Rules combine; a more specific path overrides the same header name.

   ```
   /*
     X-Content-Type-Options: nosniff
     Referrer-Policy: no-referrer
     Permissions-Policy: camera=(), microphone=(), geolocation=()
     Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'

   /
     Cache-Control: no-cache

   /index.html
     Cache-Control: no-cache

   /assets/*
     Cache-Control: public, max-age=31536000, immutable
   ```

   `no-cache` stores the document and revalidates it before use. `/assets/*` is Vite's content-hashed output. Workers applies this file from the asset directory. The app has no server code.

4. **Same-origin stylesheet, linked from `index.html`.** Add `src/base.css` with the current `body` rules and `<link rel="stylesheet" href="/src/base.css" />`. Vite rewrites that link to a hashed file under `/assets/`, which the year-long cache then covers. Keep `CanvasText` and `Canvas`. Alternative: a CSP hash of the inline block. The hash changes whenever the block changes. `style-src 'unsafe-inline'` would leave the privacy control open.

5. **Docs.** Horizontal 10 names Workers, the two commands, and why deploy does not use `npx`. The CSP cell limits connections to the site itself; Puter and the analytics endpoint are added when those features land. The README row and the Stage 0 roadmap bullet name Workers. Roadmap status becomes Done after the preview serves the page.

## Risks / Trade-offs

- [`npx wrangler deploy` fails `EBADDEVENGINES` on the image Node] → The deploy command is `pnpm exec wrangler deploy`. Retrying with `npx` fails the same way.
- [The dashboard Worker name differs from `signalfire`] → Rename the dashboard Worker or `wrangler.jsonc` `name` so they match, then retry.
- [`vite preview` hides a bad `_headers` file] → Header evidence is a request to the preview URL, for `/` and for one `/assets/` file.
- [Vite emits an inline script in `dist/index.html`] → Apply reads that file. If an inline script is present, this change updates the policy or the HTML so the preview still loads. Do not ship `script-src 'unsafe-inline'`.
- [The `workers.dev` name is chosen in the dashboard] → The repo does not record a hostname. The pull request records the preview URL that was checked.

## Migration Plan

1. Land the Workers config on `change/static-deploy`.
2. Karim sets the deploy command to `pnpm exec wrangler deploy` and retries the build.
3. The pull request's preview is the check. After merge, Workers deploys `main` with the same settings.
4. Rollback is the previous Workers deployment, from the dashboard. No player data is involved.
