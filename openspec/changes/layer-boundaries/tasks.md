# Tasks

## 1. Move App

- [ ] 1.1 Branch `change/layer-boundaries` from current `main`. Verify `src/app.tsx` and `src/app.browser.test.tsx` exist and `src/core`, `src/engine`, and `src/platform` do not.
- [ ] 1.2 Move `src/app.tsx` to `src/app/app.tsx` and `src/app.browser.test.tsx` to `src/app/app.browser.test.tsx`. Point `src/main.tsx` at `./app/app`. Leave `index.html` on `/src/main.tsx`. Leave `src/harness-smoke.test.ts`, `src/harness-smoke.property.test.ts`, and `e2e/harness-smoke.spec.ts` where they are. Do not add files under `src/core`, `src/engine`, or `src/platform`. Verify `pnpm typecheck` and `pnpm test` pass, and the component smoke still sees the heading Signalfire.

## 2. Boundary check

- [ ] 2.1 Add `tools/layer-boundaries/fixtures/pass/` and `tools/layer-boundaries/fixtures/fail/<name>/` from design.md, and `tools/layer-boundaries/check-fixtures.mjs`. The script copies `biome.json` into a temp directory, copies each fixture `src/` beside it, runs `biome lint` with `--reporter=json`, and treats `diagnostics[].category` of `lint/style/noRestrictedImports` as the verdict. Pass means zero such diagnostics. Each fail directory means at least one. Do not add the script to `tsconfig.json`. Do not change the Vitest include. Do not add `@types/node`. Run the script and verify it fails because the forbidden fixtures are not yet reported.
- [ ] 2.2 Add the `noRestrictedImports` overrides from design.md to `biome.json`, in that order, at level `error`. Set `files.includes` to `["**", "!tools/layer-boundaries/fixtures/**"]`. Comment above the core test overrides that they repeat the path group because a later `patterns` array replaces the earlier one. Run the fixture script and verify the pass tree passes and every fail directory fails. Verify `pnpm exec biome check src` still lints `src/` and does not lint `tools/layer-boundaries/fixtures`. Verify `package.json` does not depend on `zod`, `verzod`, or `dependency-cruiser`, and `allowBuilds` is still only `lefthook`.
- [ ] 2.3 Set `lint` to `biome check && node tools/layer-boundaries/check-fixtures.mjs`. Leave `check` as `pnpm typecheck && pnpm lint && pnpm test && pnpm build`. Verify `pnpm lint` runs the fixture script and passes.
- [ ] 2.4 Update `docs/horizontals/04-architecture.md`: core "May import" becomes Only `core`, Zod, and verzod; the Decisions "Dependency rule" row matches; one sentence after the layer table states the horizontal 05 risk (if verzod is dropped, the hand-rolled chain lives in `core` and the allowlist loses verzod). Update the first paragraph of `src/AGENTS.md` and the layers bullet in root `AGENTS.md` to the same allowlist, including that risk in one clause. Update the `pnpm lint` row in `AGENTS.md` and `docs/horizontals/02-repo-setup.md` to say Biome check, then the layer-boundary fixture proof. Do not edit `docs/horizontals/10-ci-cd-and-hosting.md`. Do not add a workflow. Verify `wc -l AGENTS.md` is under 200 and those doc sentences match `biome.json`.

## 3. Integration

- [ ] 3.1 Run `pnpm check`. Verify typecheck, lint (including the fixture script), both Vitest projects, and build pass. Verify the output does not run `pnpm test:e2e`. Verify `git status` shows no `src/core`, `src/engine`, or `src/platform`.
- [ ] 3.2 Run `pnpm test:e2e`. Verify the production page still shows the heading Signalfire. Do not fill the playtest checklist: the heading text is unchanged.
- [ ] 3.3 Ask a fresh-context agent that did not write the code to review the diff against this change, horizontal 04, horizontal 05 (Risk), and the constitution. Verify each finding is fixed or answered in the pull request.
- [ ] 3.4 Open the pull request from `change/layer-boundaries` with title `feat(layers): check import boundaries`. Verify the body includes the OpenSpec link, the constitution check, the assumptions from the proposal (segment names, src-root basenames, `require()`, template-literal `import()`, no second TypeScript), and that no `allowBuilds` entry was added. Do not merge.

## Workflow follow-up

- Archive this change (`/opsx:archive`) on the branch after Karim's review requirements are satisfied and before the squash-merge, so the delta lands in `openspec/specs/layer-boundaries/`.
- Leave `docs/ROADMAP.md` status "Not started".
