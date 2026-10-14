# Tasks

## 1. Failed migration save

- [ ] 1.1 Add a failing test in `src/platform/storage/documents.test.ts` for the scenario "A save leaves the failed migration and the backups in place". Use `brokenStarChain`. Plant the live value and the three backup slots with the test's raw set, then save `{ "v": 2, "stars": 9, "note": "kept" }`. Run `pnpm test:unit src/platform/storage/documents.test.ts` and verify the new test fails because the save still reports saved and rotates the backups.
- [ ] 1.2 Return `{ status: "failed" }` from `saveDocument` when the live parse is `failed`, before the candidate is parsed, and write nothing. Add that status to `SaveResult`. Run `pnpm test:unit src/platform/storage/documents.test.ts` and verify the file passes, including the existing save scenarios.
- [ ] 1.3 Update horizontal 05 (a save during a failed migration reports failed and leaves every key unchanged), horizontal 06 (that save does not run and the live value is not rotated), and the platform backup bullet in `src/AGENTS.md` (rotate only a previous value that is not invalid and whose migration can finish). Verify those three sentences are in those files.

## 2. Typed load results

- [ ] 2.1 Add a failing test in `src/core/ports/fakes.test.ts` that saves and loads the shipped v1 fixtures for profile, settings, progress, and run index, and the run log fixture under `run:01AFQCG20004HMASW9NF6YY41J`. When the result is ok, `expectTypeOf` the document against the type inferred from that schema's `parse`, and read `callSign`, `master`, `levels`, `kept`, and `runId` with no `as`. Run `pnpm typecheck` and verify it fails because those documents are still `unknown`.
- [ ] 2.2 Make `loadDocument` generic over the chain document. Give `createDocumentStore` a const type parameter for the chains and the optional run chain, with overloads so an exact key and a `run:` key return that chain's document. Type `Storage` with the five shipped overloads inferred from `profile`, `settings`, `progress`, `runIndex`, and `runLog`. `createGameStorage` returns `Storage` with no `as`. Leave `save`'s value as `unknown`. Run `pnpm typecheck` and `pnpm test:unit src/core/ports/fakes.test.ts src/platform/storage/documents.test.ts` and verify both pass.

## 3. Scene easing

- [ ] 3.1 Set `tokens.motion.scene.easing` to `[0.87, 0, 0.13, 1]`. Do not change the generator. Run `pnpm tokens` and verify `src/app/theme/tokens.css` contains `--ease-scene: cubic-bezier(0.87, 0, 0.13, 1)` and `--ease-micro: ease-out`, and that a second `pnpm tokens` reports the file is fresh. Run `pnpm test:unit src/app/theme/tokens-output.test.ts` and verify it passes.
- [ ] 3.2 Playtest checklist: not filled. No screen reads the scene easing. Search for `--ease-scene` and `motion.scene` and verify the only matches are `src/core/theme/tokens.ts`, `tools/tokens/generate.mjs`, `src/app/theme/tokens.css`, and `src/app/theme/tokens-output.test.ts`.

## 4. Cache permissions

- [ ] 4.1 Delete the job-level `permissions` blocks in `.github/workflows/ci.yml`. Leave the workflow `permissions: contents: read`. Do not add `cache-mode`. Read the file and verify that workflow permission is `contents: read` and that Install, Types, Lint, Tests, Build, End-to-end, and the title job have no `permissions` block of their own.

## 5. Integration

- [ ] 5.1 Run `pnpm check` and verify it passes.
- [ ] 5.2 Run `pnpm test:e2e` and verify it passes.
- [ ] 5.3 Ask a fresh-context reviewer to check the diff against the three deltas, design.md, horizontals 05 and 06, the design-system motion row, and C1–C10, and to report correctness gaps only. Fix or answer each finding.

## Workflow follow-up

- Branch `change/storage-gaps`. Open the pull request. CI must be green.
- Archive this change before squash-merge. Karim merges (constitution C3).
