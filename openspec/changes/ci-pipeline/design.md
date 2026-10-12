# Design

## Context

See proposal.md for why. Specs: `specs/ci-pipeline/spec.md`.

There is no `.github/` directory. The commands that exist are in `package.json`: `pnpm lint` is Biome plus `tools/layer-boundaries/check-fixtures.mjs`; `pnpm test` and `pnpm test:e2e` set `PLAYWRIGHT_BROWSERS_PATH=0`; `pnpm test:e2e` runs `pnpm build` first. The store is `.pnpm-store` (`pnpm-workspace.yaml`). Chromium installs under `node_modules/playwright-core/.local-browsers` (`test-harness` spec). The lockfile has one runtime package, `node@runtime:26.11.1`. `packageManager` is `pnpm@12.11.2`. The title rule is `tools/check-commit-msg.mjs`.

The `v12.11.2` GitHub release includes `pnpm-linux-x64.tar.gz` and `pnpm-linux-arm64.tar.gz`. The archive root contains the `pnpm` binary and a sibling `dist/` directory (inspected 2026-10-12). `actions/checkout` current major is v7 (`v7.0.1`). `actions/cache` current major is v6 (`v6.1.0`); its inputs are `path`, `key`, and `restore-keys`, and it saves on job success.

## Goals / Non-Goals

**Goals:**

- One GitHub check per blocking command, with the names in the spec.
- A failed command fails its check. An Install failure skips the other project checks. A Build failure skips End-to-end.
- pnpm and Node come from the repo pins. Browsers stay under `node_modules`.

**Non-Goals:**

- Calling the GitHub API to turn on branch protection.
- Pinning actions to commit SHAs. Majors are pinned; Dependabot bumps them.
- Caching `node_modules` or running `pnpm check` as a single job.
- Adding `content:check`, a bundle check, or a deploy.

## Decisions

### One workflow, one job per check

`.github/workflows/ci.yml`, workflow name `CI`.

| Job name | Needs | Runs |
|---|---|---|
| Install | | frozen install, then `pnpm browsers:install` |
| Types | Install | `pnpm typecheck` |
| Lint | Install | `pnpm lint` |
| Tests | Install | `pnpm browsers:install`, then `pnpm test` |
| Build | Install | `pnpm build` |
| End-to-end | Install, Build | `pnpm browsers:install`, then `pnpm test:e2e` |
| Pull request title | | `tools/check-commit-msg.mjs` on the title |

`needs: Install` makes a lockfile failure skip the other project jobs, so they do not pass. `needs: Build` makes a build failure skip End-to-end. `pnpm test:e2e` still builds again inside its own job. The script stays as it is.

Triggers:

- `pull_request`: `opened`, `synchronize`, `reopened`, `edited`
- `push` to `main`

Project jobs use `if: github.event_name == 'push' || github.event.action != 'edited'`. A title edit re-runs the title job and skips the project jobs. An edit of the description does the same. The title job uses `if: github.event_name == 'pull_request'`.

Concurrency group `ci-${{ github.workflow }}-${{ github.ref }}`. `cancel-in-progress` is true for `pull_request` and false for pushes to `main`.

Each job: `runs-on: ubuntu-latest`, `timeout-minutes: 20`.

Permissions, because a workflow `permissions` block sets every omitted scope to none:

```yaml
permissions:
  contents: read
  actions: write
```

`actions: write` is the cache. The workflow has no secrets.

Alternative considered: one job that runs `pnpm check` and then `pnpm test:e2e`. A type error and a lint error would fail the same check, which breaks the spec.

### pnpm from the release archive, Node from the lockfile

A composite action `.github/actions/pnpm/action.yml` used by every project job:

1. Read `packageManager` with the runner's `node`. Require a `pnpm@` prefix.
2. Map `uname -m` `x86_64` to `pnpm-linux-x64.tar.gz` and `aarch64` or `arm64` to `pnpm-linux-arm64.tar.gz`. Any other arch fails the job.
3. Download `https://github.com/pnpm/pnpm/releases/download/v<version>/<asset>` into `$RUNNER_TEMP`, extract it, and add that directory to `GITHUB_PATH`. The binary and `dist/` stay siblings.
4. `pnpm --version` must equal the `packageManager` version.

The runner image's Node only reads `package.json` and, in the title job, runs the checker. It is not the runtime for `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, or `pnpm test:e2e`.

After Install's frozen install, the job runs `pnpm exec node -p "process.execPath"` and `pnpm exec node --version`. The version, without a leading `v`, must be the lockfile's `node@runtime:` version (`26.11.1` today). The exec path must be inside the workspace `node_modules`. Either miss fails Install.

Do not set `PLAYWRIGHT_BROWSERS_PATH` in the workflow. The scripts set it.

Alternative considered: `actions/setup-node` with `node-version` 26, and `pnpm/action-setup`. Both were rejected. `setup-node` selects Node outside `devEngines`. `pnpm/action-setup` runs `pnpm runtime set -g`, which places Node in `PNPM_HOME` rather than the project runtime under `node_modules`.

### Cache the store and the browsers together

Every project job restores one cache, then runs `pnpm install --frozen-lockfile`:

- `path`: `.pnpm-store` and `node_modules/playwright-core/.local-browsers`
- `key`: `pnpm-${{ runner.os }}-${{ hashFiles('pnpm-lock.yaml') }}`
- `restore-keys`: `pnpm-${{ runner.os }}-`
- `fail-on-cache-miss`: false

`actions/cache@v6` saves at the end of a successful job. Install populates both paths (`browsers:install` after the frozen install) and the save runs before jobs that `need` Install. Those jobs restore, then install again so `node_modules` links exist. Tests and End-to-end run `pnpm browsers:install` again so a stale restore still ends with the lockfile's Chromium. Install fails if `node_modules/playwright-core/.local-browsers` is missing after `pnpm browsers:install`.

Alternative considered: caching the whole of `node_modules`. The doc asks for the store and the browsers. A second install from the store is the frozen-lockfile check's input, and the link step is cheap when the store hits.

### OS libraries for Chromium

The first apply does not run `playwright install-deps`. GitHub's Ubuntu image often already has the libraries Chrome needs.

If Tests or End-to-end fail because a shared library is missing, add this to Tests and End-to-end, after install, with `PLAYWRIGHT_BROWSERS_PATH=0`:

```bash
pnpm exec playwright install-deps chromium
```

That uses the project's Playwright to install OS packages on that runner. Apt state is not in the cache, so the step belongs on every job that launches Chromium, not only Install. Do not point browsers at `~/.cache/ms-playwright`.

### Title check

The title job checks out the repo and runs the runner's `node` on `tools/check-commit-msg.mjs`. The title is passed as a file:

```bash
printf '%s\n' "$TITLE" > "$RUNNER_TEMP/pr-title.txt"
node tools/check-commit-msg.mjs "$RUNNER_TEMP/pr-title.txt"
```

`TITLE` is `github.event.pull_request.title`. The script is the same one Lefthook runs. If the runner has no `node`, stop. Do not add `actions/setup-node` to supply it.

### Dependabot

`.github/dependabot.yml`, `version: 2`.

Two `updates` entries, both `directory: /`, `schedule.interval: weekly`:

| Ecosystem | Group id | Patterns |
|---|---|---|
| `npm` | `dependencies` | `"*"` |
| `github-actions` | `actions` | `"*"` |

`npm` is the ecosystem Dependabot documents for a pnpm lockfile (v7 through v10). This lockfile is `9.0`.

Both entries:

```yaml
commit-message:
  prefix: chore
  prefix-development: chore
  include: scope
```

`github-actions` ignores `prefix-development`; `prefix: chore` still applies. The allowed commit types do not include `ci`.

Groups default to version updates. Security updates stay on Dependabot's own schedule, outside the weekly group.

`minimumReleaseAge: 1440` is unchanged. A pull request that bumps a package younger than a day can fail Install until the package is old enough.

### Horizontal 10 table

Replace the check table with:

| Check | Command | Blocks merge |
|---|---|---|
| Install | `pnpm install --frozen-lockfile` | yes |
| Types | `pnpm typecheck` | yes |
| Lint | `pnpm lint` (Biome, then the layer-boundary fixture proof) | yes |
| Unit and component tests | `pnpm test` (Vitest, including browser mode) | yes |
| Content | `pnpm content:check` | pending; the command does not exist |
| Build | `pnpm build` | yes |
| Bundle | No command yet. The production bundle must contain no dev-only modules (Dev Tooling) | pending |
| End-to-end | `pnpm test:e2e` against the production build | yes |
| Pull request title | Conventional Commits, via `tools/check-commit-msg.mjs`, on pull requests | yes |

Delete the separate Layer boundaries row.

Decisions row for CI: `GitHub Actions runs every blocking check on every pull request and every push to main, including end-to-end tests. Pending rows are not run.`

Replace the branch-protection bullet with: Branch protection on `main` requires every check in this table that blocks merge, and Karim's approval (constitution C3). Pending rows are not required until a later change adds their commands to the workflow.

Under Dependency updates, add that the grouped weekly pull requests cover npm dependencies and GitHub Actions, and that their titles use `chore` with a `deps` or `deps-dev` scope so they pass the title check. Keep the patch / minor / major proposal sentence.

## Risks / Trade-offs

- [A grouped Dependabot title omits the `chore(deps):` prefix] → The title check fails that pull request. The fix is the `commit-message` block, which is already set from the Dependabot docs. Apply does not wait for the weekly run. The pull request says to watch the first Dependabot title.
- [Ubuntu is missing a Chromium library] → Add `playwright install-deps` on the jobs that launch the browser, as above.
- [The runner Node cannot start the pnpm archive] → Install fails with the version output. Do not fall back to `actions/setup-node`.
- [`actions/cache` post-step only saves on success] → A failed Install does not poison the cache.
- [Each project job installs again] → Extra minutes on a cold store. A warm store only re-links. Isolation of the Install check is worth that.
- [End-to-end builds twice] → The Build job and `pnpm test:e2e` both build. Changing the script would hide a build failure inside End-to-end when someone runs the script locally. Leave the script.

## Migration Plan

No saved data and no player-facing behavior. The workflow starts when it is on the pull request branch. Rollback is reverting that commit. Branch protection is still off, so a revert cannot leave `main` requiring checks that no longer exist.

## Open Questions

None. The OS-library step is a conditional task, not an open product choice.
