# Tasks

## 1. Pins and install

- [x] 1.1 Create branch `change/hermetic-toolchain` from current `main`. Verify `git status` shows that branch and a clean tree apart from this change's files.
- [x] 1.2 Before any `pnpm` command, `touch` a marker file outside the repo under `$HOME`. Verify the marker's mtime is recorded.
- [x] 1.3 Add `package.json` (`packageManager` `pnpm@12.11.2`, `devEngines.runtime` for Node `^26.11.1` with `onFail: download`, `private: true`) and `pnpm-workspace.yaml` (`storeDir: .pnpm-store`, `cacheDir: .pnpm-cache`, `strictDepBuilds: true`, `allowBuilds.lefthook: true`, `minimumReleaseAge: 1440`, no `packages` list). Add `.pnpm-cache/` to `.gitignore`. Verify the files match the proposal's settings table and that `.pnpm-store/` was already ignored.
- [x] 1.4 Download the pnpm 12.11.2 standalone tarball and run `pnpm install` with it. Do not install pnpm globally. Verify install exits 0 and `pnpm exec node -p "process.execPath"` is inside the repo. The engine-warning stop is task 2.1, after the tools are dependencies.
- [x] 1.5 Update the Node pin, layout tree, and hermetic rule in `docs/horizontals/02-repo-setup.md`, the run-locally Node sentence in `README.md`, and the Node sentence in `docs/horizontals/10-ci-cd-and-hosting.md`. Add the hermetic rule to `AGENTS.md`: project tooling (build, lint, test, dev servers, browsers) is installed per project and run through pnpm scripts or `pnpm exec`; the OpenSpec CLI is the only global exception. Verify `AGENTS.md`, `README.md`, and `docs/` no longer say Node 24 or `.nvmrc` (archived OpenSpec changes may still quote the old pin), and `AGENTS.md` is under 200 lines.

## 2. Page, types, lint, and scripts

- [x] 2.1 Add the pinned dependencies with the standalone pnpm: runtime `react` and `react-dom` at 19.3.0; dev `vite` 8.3.4, `@vitejs/plugin-react` 6.1.2, `typescript` 7.0.2, `@biomejs/biome` 2.5.15, `lefthook` 2.2.1, `@types/react` 19.3.0, `@types/react-dom` 19.3.0. Do not add the OpenSpec CLI. If that install prints an engine warning, stop and fall back to Node 24 in the proposal before continuing. If it offers to link agent skills into `.cursor/skills` or `.claude/skills`, set `skills.dirs: []` and do not approve the links. Add `tsconfig.json`, `biome.json`, and `vite.config.ts` as design.md specifies. Verify `pnpm exec tsc --showConfig` lists `strict` and the four extra flags, `biome.json` sets `noExplicitAny` to `error`, `package.json` does not name `openspec`, and those skill directories have no new dependency files.
- [x] 2.2 Add `index.html`, `src/main.tsx`, and `src/app.tsx` so the page text is Signalfire and nothing else. Verify no CSS framework file and no layer folders were added.
- [x] 2.3 Add scripts `dev`, `build`, `preview`, `typecheck`, `lint`, `format`, and `check` (`typecheck`, then `lint`, then `build`). Verify `package.json` has no `test`, `test:e2e`, `content:check`, `tokens`, or `ladle` script.
- [x] 2.4 Run `pnpm check`. Verify typecheck, lint, and build each pass, and record the production build's output size for the pull request.
- [x] 2.5 Add a temporary source file that uses `any`, run `pnpm lint`, then delete the file. Verify lint fails while the file exists and passes after it is gone.
- [x] 2.6 Update the scripts tables in `docs/horizontals/02-repo-setup.md` and `AGENTS.md` to the scripts that exist, and say the rest arrive later. Update the README sentence that says `pnpm check` is everything CI runs, and the design-system sentence that says `pnpm dev` and `pnpm build` run `pnpm tokens`. Verify `pnpm dev` is not described as starting debug tools, and those two sentences match the scripts this change actually adds.

## 3. Hooks

- [x] 3.1 Add `tools/check-commit-msg.mjs` and `lefthook.yml` (`pre-commit`: `pnpm exec biome check --write --staged --no-errors-on-unmatched`, then `pnpm typecheck`; `commit-msg`: `pnpm exec node tools/check-commit-msg.mjs`; no `pre-push`). Do not call bare `node` or `biome`. Run `pnpm exec lefthook install` if `.git/hooks/pre-commit` or `.git/hooks/commit-msg` is missing. Verify both hook files exist and the script is under about fifteen lines with no new dependency.
- [x] 3.2 Attempt a commit whose message is not a Conventional Commit. Verify the commit-msg hook rejects it and `git status` shows no new commit.
- [x] 3.3 Attempt a commit with a staged file that contains `any`, and another with a different lint error. Verify pre-commit rejects both, then restore the tree.
- [x] 3.4 Update the hooks section in `docs/horizontals/02-repo-setup.md` so `pre-commit` is Biome then typecheck, and `pre-push` is described as arriving with task 0.2. Verify the doc does not say those two pre-commit steps run in parallel.

## 4. Integration

- [x] 4.1 Remove `node_modules` and run `pnpm install` then `pnpm check` on the finished tree (lockfile present). Verify typecheck, lint, and build pass, `pnpm exec node -p "process.execPath"` is inside the repo, and `storeDir` and `cacheDir` resolve under the repo.
- [x] 4.2 List paths under `$HOME` newer than the marker from task 1.2, excluding this repo. Verify the pull request will contain that list. Unexpected paths are a finding to report, not to delete.
- [x] 4.3 Run `pnpm dev` and open the page in an automated browser. Confirm the visible text is Signalfire and nothing else. Stop the server. Verify with a screenshot from that run attached to the pull request.
- [x] 4.4 Fill the playtest checklist from `docs/horizontals/08-testing-and-dev-practices.md`. Mark gameplay, audio, focus, and "matches the relevant vertical doc" as not applicable: this change implements horizontals 02 and 03, not a vertical. Do not check the vertical item. Verify the filled list is in the pull request.
- [x] 4.5 Ask a fresh-context agent that did not write the code to review the diff against this change, repo-setup, and the constitution. Verify each finding is fixed or answered in the pull request.
- [ ] 4.6 Open the pull request from `change/hermetic-toolchain` with title `chore: scaffold hermetic toolchain`. Verify the body includes the OpenSpec link, constitution check, the hermetic path list, hook results, the screenshot, and a statement that CI does not exist so `pnpm check` was not run in CI. Do not merge.

## Workflow follow-up

- Archive this change after Karim's review requirements are satisfied and before merge, so the delta lands in `openspec/specs/hermetic-toolchain/`.
- Leave `docs/ROADMAP.md` status "Not started".
