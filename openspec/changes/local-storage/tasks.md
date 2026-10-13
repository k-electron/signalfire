# Tasks

## 1. Document store

- [ ] 1.1 Branch `change/local-storage` from current `main`. Add `src/platform/storage/star-chain.ts` with the two-version chain from design.md, and `src/platform/storage/documents.test.ts` for every scenario in `specs/local-storage/spec.md` that does not name IndexedDB or the Web Lock. Use `createMemoryLocalStore`, `createImmediateWriteLock`, and `createDocumentStore`. Import the shipped profile fixture with `{ type: "json" }`. Run `pnpm test:unit` and verify these tests fail because the document-store module is missing.
- [ ] 1.2 Add `document-store.ts`, `memory-store.ts`, and `write-lock.ts` (`createImmediateWriteLock` only) from design.md. Run `pnpm test:unit` and verify the new tests pass. Verify `documents.test.ts` does not import `idb-keyval` or `indexed-db.ts`.
- [ ] 1.3 Add `docs/decisions/0004-local-document-keys.md` (status accepted, date the day it is written) and its row in `docs/decisions/README.md`. Update `docs/horizontals/06-persistence-and-sync.md` with the database name, the object store name, the backup and quarantine keys, and the sentence that a document load takes `signalfire-write`. Verify those names appear in the decision record and in horizontal 06.

## 2. IndexedDB adapter

- [ ] 2.1 Add `src/platform/storage/indexed-db.browser.test.tsx` for every scenario in the spec that names IndexedDB or the Web Lock, using `createLocalStorage` and the same star chain. The profile scenario reads database `signalfire` through `indexedDB.open`. The lock scenarios request `signalfire-write` outside the factory and observe completion with a flag, not a timer. `afterEach` clears the object store with idb-keyval `clear` and does not call `indexedDB.deleteDatabase`. Run `pnpm test indexed-db.browser` and verify it fails because the adapter module is missing.
- [ ] 2.2 Run `pnpm add idb-keyval@6.3.0`. Add `createWebWriteLock` and `createLocalStorage` from design.md. Run `pnpm test indexed-db.browser` and verify those tests pass. Run `pnpm test:unit` and verify the document-store tests still pass. Verify `package.json` depends on `idb-keyval` 6.3.0.

## 3. Integration

- [ ] 3.1 Run `pnpm check`. Verify typecheck, lint (including the fixture proof), both Vitest projects, and build pass. Verify `docs/ROADMAP.md` still says Stage 1 is "Not started". Do not fill the playtest checklist: nothing the player sees or hears changes.
- [ ] 3.2 Ask a fresh-context agent that did not write the code to review the diff against this change, horizontal 06 (Local storage, Backups, and the write-lock sentence), horizontal 05 (Migrations), and the constitution. The review reports correctness and requirement gaps only. Verify each finding is fixed or answered in the pull request.
- [ ] 3.3 Open the pull request from `change/local-storage` with title `feat(storage): save and migrate a local document`. Fill the template: OpenSpec link, constitution check, test evidence (`pnpm check`), no visual evidence, docs updated (horizontal 06, decision record 0004), and the assumptions from the proposal. Do not merge.

## Workflow follow-up

- Archive this change (`/opsx:archive`) on the branch after Karim's review requirements are satisfied and before the squash-merge, so the delta lands in `openspec/specs/`.
- Leave `docs/ROADMAP.md` status "Not started".
