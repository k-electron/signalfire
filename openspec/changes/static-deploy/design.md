# Design

## Context

See proposal.md for why. The page is `index.html` plus `src/main.tsx`, which renders an `h1` whose text is Signalfire. The head has one inline `<style>` (`color: CanvasText; background: Canvas`). The production build is `pnpm build` (`vite build`), output `dist/`. Vite copies `public/` into `dist/` as-is. There is no `public/` directory yet.

Pins, from `package.json` and `pnpm-lock.yaml`: `packageManager` is `pnpm@12.11.2`, and the lockfile runtime is `node@runtime:26.11.1` via `devEngines.runtime` (`onFail: download`). CI already installs that way. There is no `.nvmrc`.

Pages v3 defaults are Node 22.16.0 and pnpm 10.11.1 (Pages build image, checked 2026-10-12). Node is overridden with `NODE_VERSION`, `.nvmrc`, or `.node-version`. pnpm is overridden with `PNPM_VERSION`. The image does not read `devEngines` or `package.json` `engines`. `PNPM_VERSION` accepts any version, including versions newer than the default.

`vite preview` serves `dist/` and does not apply `_headers`.

## Goals / Non-Goals

**Goals:**

- Pages builds `main` and each pull request with the pinned pnpm and the lockfile Node.
- `dist/_headers` is the header source, because that is where Pages reads it.
- The document policy allows the site itself. The inline style is gone, so `style-src 'self'` is enough.

**Non-Goals:**

- Puter, analytics, a custom domain, release tags, branch protection, Wrangler.

## Decisions

1. **Git-connected Pages project.** Production branch `main`, build command `pnpm build`, output directory `dist`. Preview deployments are Pages' pull request previews. Alternative: `wrangler pages deploy` from GitHub Actions. That adds a tool and a token, and the hosting doc says Cloudflare builds.

2. **`PNPM_VERSION=12.11.2` on production and preview.** Pages installs with that pnpm. `pnpm install` downloads Node `26.11.1` from `devEngines.runtime`, and `pnpm build` runs on it. No `.nvmrc` and no `NODE_VERSION`: a second pin would drift from the lockfile. Alternative: commit `.node-version` with `26.11.1`. That duplicates `devEngines.runtime`.

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

   `no-cache` stores the document and revalidates it before use. `/assets/*` is Vite's content-hashed output. Alternative: set the headers in a Worker. The app has no server code.

4. **Same-origin stylesheet, linked from `index.html`.** Add `src/base.css` with the current `body` rules and `<link rel="stylesheet" href="/src/base.css" />`. Vite rewrites that link to a hashed file under `/assets/`, which the year-long cache then covers. Keep `CanvasText` and `Canvas`. Alternative: a CSP hash of the inline block. The hash changes whenever the block changes. `style-src 'unsafe-inline'` would leave the privacy control open.

5. **Docs.** Horizontal 10's CSP cell becomes: limits network connections to the site itself; Puter and the analytics endpoint are added when those features land. The hosting section gains one sentence: the Pages project sets `PNPM_VERSION` from `packageManager`, and Node is the `devEngines.runtime` lockfile entry. Roadmap Stage 0 status becomes Done after the preview serves the page.

## Risks / Trade-offs

- [Pages install uses pnpm 10.11.1 when `PNPM_VERSION` is unset] → Set the variable on production and preview before the first build. The preview build log must show `12.11.2` and `26.11.1`, or the task is not done.
- [`vite preview` hides a bad `_headers` file] → Header evidence is a request to the preview URL, for `/` and for one `/assets/` file.
- [Vite emits an inline script in `dist/index.html`] → Apply reads that file. If an inline script is present, this change updates the policy or the HTML so the preview still loads. Do not ship `script-src 'unsafe-inline'`.
- [The `*.pages.dev` name is chosen in the dashboard] → The repo does not record a hostname. The pull request records the preview URL that was checked.

## Migration Plan

1. Land the files on `change/static-deploy`.
2. Karim creates the Pages project, connects the repo, and sets the build variable.
3. The pull request's preview is the check. After merge, Pages deploys `main` with the same settings.
4. Rollback is the previous Pages deployment, from the dashboard. No player data is involved.
