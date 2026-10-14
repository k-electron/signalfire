# Tasks

## 1. Parse status and engine version

- [x] 1.1 Write failing tests in `src/core/schemas/parse.test.ts` for the three failed-migration scenarios (next schema rejects, missing intermediate version, `up` throws) and keep the existing invalid-schema cases. Run `pnpm test:unit src/core/schemas/parse.test.ts` and verify the new tests fail because the result is still `invalid`.
- [x] 1.2 Return `failed` from `defineDocument` for those cases, including a thrown `up`. Run `pnpm test:unit src/core/schemas/parse.test.ts` and verify it passes.
- [x] 1.3 Write failing tests that `0.0.0` and `1.2.3` parse as engine versions and that `0-stand-in`, `1`, `1.2`, and `01.0.0` are invalid. Run `pnpm test:unit src/core/schemas/documents.test.ts` and verify the new cases fail.
- [x] 1.4 Restrict `engineVersion` to `major.minor.patch` with no leading zero on a non-zero part. Set `STAND_IN_ENGINE_VERSION` to `0.0.0`. Update replay tests so a recorded log's engine version is `0.0.0`, that log replays, and `1.0.0` throws RangeError with no events. Run `pnpm test:unit src/core/schemas/documents.test.ts src/core/replay/stand-in-run.test.ts` and verify both pass.
- [x] 1.5 Export `versions` from `defineDocument`. Write a failing fixture test that every version of profile, settings, progress, run log, and run index has one fixture file and that each file parses to `ok`. Use `import.meta.glob` on `./fixtures/**/*.json`. Run `pnpm test:unit src/core/schemas/documents.test.ts` and verify the test passes for the current v1 files, and that removing a version from the assertion set is not the way it fails: the test compares the chain's `versions` to the files. If the boundary check rejects the glob, switch to a Vitest API the checker allows and do not import `node:fs` from `src/core`.

## 2. Document store

- [x] 2.1 Move the document rules to `src/core/storage/document-store.ts`. Write the failing Node tests first, in `src/platform/storage/documents.test.ts` or next to the core module, for: failed migration writes nothing; invalid live value stays out of the backup ring; a second quarantine keeps the first slot; load and save take a key and no chain; a save of a non-latest value is refused. Put the star chain in the test file. Run `pnpm test:unit` on that file and verify the new tests fail.
- [x] 2.2 Implement load and save: bind the key to its chain, append `quarantine:<key>:<n>`, skip backup rotation for an invalid live value, and return `failed` without writing. Delete `src/platform/storage/star-chain.ts` and `createImmediateWriteLock`. Run the document-store tests and verify they pass.
- [x] 2.3 Change `Storage` and `createFakeStorage` to load and save the shipped keys (`profile`, `settings`, `progress`, `run-index`, `run:<runId>`). Update `src/core/ports/fakes.test.ts` to the scenarios in the core-ports delta, including cloud staying apart from local load. Run `pnpm test:unit src/core/ports/fakes.test.ts` and verify it passes.
- [x] 2.4 `createLocalStorage` returns that `Storage` and does not export `raw`. `createWebWriteLock` uses `AbortSignal.timeout(1000)` and a timed-out request returns `busy` with the store unchanged. Update `src/platform/storage/indexed-db.browser.test.tsx`: plant bytes with `idb-keyval` in the test, cover the migrate-save-restore scenario with `quarantine:progress:0`, and add the busy scenario. Run `pnpm test src/platform/storage` and verify the Node and browser tests pass.

## 3. Docs and review

- [x] 3.1 Update horizontal 05 (failed migration is not invalid; `engineVersion` is major.minor.patch) and horizontal 06 (invalid live data stays out of the backup ring; quarantine slots append; the write lock wait is 1000 ms). Add `docs/decisions/0005-quarantine-slots.md` and its index line. Do not edit decision 0004. Adjust `src/AGENTS.md` only if a platform bullet still describes a raw write as the port. Verify the new decision is the next number and the horizontals name `quarantine:<key>:0`.
- [x] 3.2 Run `pnpm test:unit` and `pnpm typecheck` and verify both pass. Ask a fresh-context reviewer to check the diff against the deltas, horizontal 05, horizontal 06, and C1–C10, and to report correctness gaps only. Fix or answer each finding.

## Workflow follow-up

- Branch `change/storage-safety`. Open the pull request. Archive this change before squash-merge. Karim merges (constitution C3).
