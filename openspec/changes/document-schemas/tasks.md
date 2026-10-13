# Tasks

## 1. Dependencies

- [ ] 1.1 Branch `change/document-schemas` from current `main`. Run `pnpm add zod@4.6.6`. Verify `package.json` depends on `zod` 4.6.6, does not depend on `verzod`, the lockfile records Zod, and `node -e "import('zod').then(m => console.log(m.z.iso.datetime({ offset: true }).safeParse('2026-10-12T20:00:00.000Z').success))"` prints `true`.

## 2. IDs and run ids

- [ ] 2.1 Add `src/core/schemas/ids.test.ts` and `src/core/schemas/run-id.test.ts` for every stable-ID scenario and every run-id scenario in `specs/document-schemas/spec.md`. Include a fast-check property that a timestamp of 1000 sorts before a timestamp of 2000 for arbitrary 10-byte entropies, and that the same inputs repeat. Run `pnpm test:unit` and verify these tests fail because the modules are missing.
- [ ] 2.2 Add `src/core/schemas/ids.ts` and `src/core/schemas/run-id.ts` from design.md. Run `pnpm test:unit` and verify the new tests pass. Run `pnpm lint` and verify the modules pass the boundary check.

## 3. Version chain

- [ ] 3.1 Add `src/core/schemas/parse.test.ts` for every older-version, newer-version, and invalid-data scenario in the spec. Build both chains with `defineDocument` in the test: version 1 to version 2, and versions 1 and 3 with no version 2. Do not add a fixture for either chain. Run `pnpm test:unit` and verify the test fails because `parse.ts` is missing.
- [ ] 3.2 Add `src/core/schemas/parse.ts` from design.md. Run `pnpm test:unit` and verify the parse tests pass.

## 4. Version 1 documents

- [ ] 4.1 Add `src/core/schemas/documents.test.ts` and the five `v1.json` fixtures from design.md, covering every profile, settings, progress, run-log, run-index, envelope, and shipped-example scenario. Run `pnpm test:unit` and verify the test fails because the document modules are missing.
- [ ] 4.2 Add `profile.ts`, `settings.ts`, `progress.ts`, `run-log.ts`, and `run-index.ts` from design.md. Each is a version 1 `defineDocument` using `z.strictObject`. Run `pnpm test:unit` and verify the document tests, the fixture parse, and the earlier schema tests pass.

## 5. Allowlist and docs

- [ ] 5.1 Remove verzod from the three core groups in `biome.jsonc`, using the messages in design.md. Drop the verzod import from the pass fixture `tokens.ts`. Add the `core-verzod` fail fixture. Run `pnpm lint` and verify the pass tree passes and the new fail fixture fails.
- [ ] 5.2 Add `docs/decisions/0003-run-log-encoding.md` (status accepted, date the day it is written) and its row in `docs/decisions/README.md`. Update horizontals 04, 05, 06, the horizontals index, root `AGENTS.md`, and `src/AGENTS.md` as design.md describes. Verify no remaining sentence says verzod is the library in use, `package.json` does not depend on verzod, and `wc -l AGENTS.md` is under 200.

## 6. Integration

- [ ] 6.1 Run `pnpm check`. Verify typecheck, lint (including the fixture proof), both Vitest projects, and build pass. Verify `docs/ROADMAP.md` still says Stage 1 is "Not started". Do not fill the playtest checklist: nothing the player sees or hears changes.
- [ ] 6.2 Ask a fresh-context agent that did not write the code to review the diff against this change, horizontal 05, the allowlist edits, and the constitution. The review reports correctness and requirement gaps only. Verify each finding is fixed or answered in the pull request.
- [ ] 6.3 Open the pull request from `change/document-schemas` with title `feat(schemas): add versioned save documents`. Fill the template: OpenSpec link, constitution check, test evidence (`pnpm check`), no visual evidence, docs updated (horizontals 04, 05, 06, the index, both `AGENTS.md` files, decision record 0003), and the assumptions from the proposal. Do not merge.

## Workflow follow-up

- Archive this change (`/opsx:archive`) on the branch after Karim's review requirements are satisfied and before the squash-merge, so the deltas land in `openspec/specs/`.
- Leave `docs/ROADMAP.md` status "Not started".
