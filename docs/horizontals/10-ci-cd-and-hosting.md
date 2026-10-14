# Horizontal 10: CI/CD and Hosting

How changes are checked, deployed, released, and observed.

## Decisions

| Topic | Decision |
|---|---|
| Hosting | Cloudflare Workers static assets, connected directly to the GitHub repo |
| Deploys | Cloudflare builds and deploys every merge to `main`; every pull request branch gets a preview URL |
| CI | GitHub Actions runs every blocking check on every pull request and every push to main, including end-to-end tests. Pending rows are not run. |
| Releases | Continuous deploy from `main`, plus periodic semver tags with release notes from Conventional Commits |
| Analytics | Cookieless, anonymous counts of coarse game events; never typing data |
| Error reports | Opt-in: players export a bug report and attach it to a GitHub issue |

## CI (GitHub Actions)

Runs on every pull request and on every push to `main`.

| Check | Command | Blocks merge |
|---|---|---|
| Install | `pnpm install --frozen-lockfile` | yes |
| Types | `pnpm typecheck` | yes |
| Lint | `pnpm lint` (Biome, then the layer-boundary fixture proof, then the token check) | yes |
| Unit and component tests | `pnpm test` (Vitest, including browser mode) | yes |
| Content | `pnpm content:check` | pending; the command does not exist |
| Build | `pnpm build` | yes |
| Bundle | No command yet. The production bundle must contain no dev-only modules (Dev Tooling) | pending |
| End-to-end | `pnpm test:e2e` against the production build | yes |
| Pull request title | Conventional Commits, via `tools/check-commit-msg.mjs`, on pull requests | yes |

- Node version comes from `devEngines.runtime` in `package.json`; pnpm from the `packageManager` field.
- The pnpm store and Playwright browsers are cached between runs.
- Branch protection on `main` requires every check in this table that blocks merge, and Karim's approval (constitution C3). Pending rows are not required until a later change adds their commands to the workflow.

## Hosting (Cloudflare Workers)

- Connected to the GitHub repo through Cloudflare's Git integration. The build command is `pnpm build`. The deploy command is `pnpm exec wrangler deploy`. `wrangler.jsonc` uploads `dist/`.
- `PNPM_VERSION` is the `packageManager` version. `NODE_VERSION` and `.node-version` are the lockfile's `node@runtime` entry, which pnpm resolves from `devEngines.runtime`. The image must be that Node before `npm` runs, because npm rejects `devEngines.runtime` instead of downloading it. The deploy command is `pnpm exec wrangler deploy`.
- **Production:** the `main` branch. Because `main` only accepts merges that passed CI and review, every production deploy has passed every check.
- **Previews:** every pull request branch gets its own URL, posted on the pull request. Agents use it for screenshots and recordings; Karim uses it to play changes before merge (Testing horizontal).
- No server code and no environment secrets: the game is fully static, and puter.js runs in the browser.

### Headers

A `_headers` file in `public/` sets:

| Header | Purpose |
|---|---|
| Content Security Policy | Limits network connections to the site itself. Puter and the analytics endpoint are added when those features land. Any other outbound request is blocked by the browser, which enforces the privacy rule technically |
| Cache control | Hashed assets cached for a year; `index.html` always revalidated, so new deploys are picked up immediately |
| Standard security headers | `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` |

## Releases

- Every merge to `main` deploys immediately.
- Periodically, a release is tagged with a semver version. Release notes are generated from Conventional Commits (`feat`, `fix`, `content`, `perf` sections).
- Versions stay at `0.x` until launch; `1.0.0` is the public launch.
- The latest release notes are bundled at build time and shown in an in-game **What's new** panel after an update.

### Dependency updates

- Dependabot opens grouped weekly pull requests for npm dependencies and for GitHub Actions.
- Those pull request titles use the `chore` type and a `deps` or `deps-dev` scope, so they pass the pull request title check.
- Patch updates are exempt from OpenSpec proposals (constitution C1). Minor and major updates of runtime dependencies go through a proposal.

## Analytics

Cookieless, anonymous counts to learn where players get stuck and how far they get. No personal data, no cookies, no identifiers that follow a player across sessions.

### Tool

GoatCounter, which records custom events through its JavaScript API. Its terms for hosted use by an open-source, non-commercial project must be confirmed before launch; if they don't fit, Plausible (paid hosted) is the fallback.

Cloudflare Web Analytics was considered; it counts page views only and has no custom events.

### Events

| Event | Data sent |
|---|---|
| `session-start` | none |
| `level-start/<levelId>` | level ID |
| `level-complete/<levelId>/<stars>` | level ID and stars earned (0–3) |
| `level-quit/<levelId>` | level ID |
| `barrier-broken/<zoneId>` | zone ID |
| `systems-check` | none |
| `calm-mode-used/<levelId>` | level ID |
| `cloud-sign-in` | none |

**Never sent:** keystrokes, WPM, accuracy, timing, run logs, call signs, or any telemetry from the Telemetry vertical.

### Player control

- Settings → Data shows exactly which events are counted, with a switch to turn counting off.
- Once analytics is counting, the privacy note links to this list. Until then, the README note only says typing data stays on the device.

## Bug reports

- Settings → Data → **Export bug report** downloads one file with recent errors, the most recent run logs, and the player's documents.
- The file is never uploaded automatically. The player attaches it to a GitHub issue using the bug-report template (Repo Setup horizontal).
- A run log in a bug report can be replayed exactly in the Level Lab (Dev Tooling horizontal).
- Until Settings → Data → Export bug report exists, the bug-report template takes a written report. A file attachment is optional.

## Open question

- Should anonymous counting be on by default (with the switch to turn it off) or off until the player turns it on? On by default gives more useful data; off by default is the stricter privacy stance.

## Sources

- [Static hosting comparison 2026](https://guptadeepak.com/tools/top-5-static-site-hosting-jamstack-platforms-2026/)
- [Netlify vs Vercel vs Cloudflare Pages](https://toolchase.com/blog/netlify-vs-vercel-vs-cloudflare/)
- [Puter static hosting](https://developer.puter.com/tutorials/host-website-for-free/), considered
- [Privacy-preserving analytics compared](https://dasroot.net/posts/2026/03/privacy-preserving-analytics-plausible-umami-goatcounter/)
- [GoatCounter events](https://goatcounter.com/help/events) and [JavaScript API](https://goatcounter.com/help/js)
- [Cloudflare Web Analytics limits](https://clickport.io/blog/clickport-vs-cloudflare-analytics)
- [Sentry alternatives](https://oneuptime.com/blog/post/2026-03-31-10-best-sentry-alternatives/view)
