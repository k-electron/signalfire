# Tasks

## 1. Content version hash

- [x] 1.1 Branch `change/content-pipeline` from current `main`. Verify `git branch --show-current` prints `change/content-pipeline`.
- [x] 1.2 Add `src/core/content/canonical.test.ts` and `src/core/content/canonical.property.test.ts` for every scenario under "Canonical JSON ignores key order and carriage returns" in `specs/content-pipeline/spec.md`. The property test shuffles object key order and rewrites token line endings as CR LF. Run `pnpm test:unit` and verify these tests fail because the modules are missing.
- [x] 1.3 Add `src/core/content/sha256.ts` and `src/core/content/canonical.ts` from design.md. Run `pnpm test:unit` and verify the canonical tests pass, including the empty digest and the digest of `{"a":"x","b":1}`.
- [x] 1.4 Add `docs/decisions/0007-content-version-hash.md` (status accepted, date the day it is written) from the contentVersion decision in design.md, and its row in `docs/decisions/README.md`. Verify the record names SHA-256, the `{ level, starBars, tuning }` preimage, sorted object keys, and carriage-return normalization.

## 2. Zone, level, and tuning schemas

- [x] 2.1 Add `src/core/schemas/content/content.test.ts` for every scenario under these requirements in `specs/content-pipeline/spec.md`: "A zone has an identity and a key set", "Unknown content fields are rejected", "Star bars increase", "A level has an identity", "A level has five phases", "Units use unlocked keys" (the unlearned-key scenario, and the focus-key half of "Focus or allowed keys leave their set"), "A drill unit contains a focus key", and "Tuning stays in range". Run `pnpm test:unit` and verify the test fails because the schema modules are missing.
- [x] 2.2 Add `src/core/schemas/content/zone.ts`, `level.ts`, and `tuning.ts` from design.md, using `z.strictObject`. Relative imports in this graph use a `.ts` extension. Run `pnpm test:unit` and verify the content schema tests pass.
- [x] 2.3 Update `docs/horizontals/05-data-model.md`: add `tuning:<slug>` to Stable IDs with example `tuning:waiting-lanes`, name the schema fields this change covers, name what waits (gate, the other pressure controls, other mechanics and level types, word lists, story, prose), and point `contentVersion` at decision 0007. Verify those sentences are in the file.

## 3. Loader

- [x] 3.1 Add `src/core/content/load.test.ts` for every scenario under "Only zone 0 omits star bars", "Allowed keys and focus keys are sets", "A load resolves ids", "A file name carries its id", "Non-JSON files are not content", and "A level's contentVersion follows the level, its bars, and its tuning", plus the allowed-key-outside-the-zone half of "Focus or allowed keys leave their set". A path that does not end in `.json` is ignored. Run `pnpm test:unit` and verify the test fails because `load.ts` is missing.
- [x] 3.2 Add `src/core/content/load.ts` from design.md, exporting `acceptZone`, `acceptLevel`, `acceptTuning`, `contentVersionOf`, and `loadBundledContent`. Set `allowImportingTsExtensions` in `tsconfig.json`. The first relative import comments why the `.ts` extension is there. Run `pnpm test:unit` and verify the loader tests and the schema tests pass. Run `pnpm typecheck` and verify it passes.

## 4. Shipped levels and the app import

- [x] 4.1 Add `src/app/content/campaign.test.ts` for "Shipped content loads" and "The app exposes levels 0.1 and 1.1". The digest check calls `contentVersionOf` on the loaded level, its zone's star bars, and its tuning. Run `pnpm test:unit` and verify the test fails because `campaign.ts` or the JSON files are missing.
- [x] 4.2 Add the five JSON files from design.md (zones 0 and 1, levels 0.1 and 1.1, waiting-lane tuning) and `src/app/content/campaign.ts`. The module imports the JSON with `with { type: "json" }`, calls the loader, throws if the load fails, and is not imported by a screen. Format the JSON with Biome. Run `pnpm test:unit` and verify the campaign test passes.

## 5. content:check and CI

- [x] 5.1 Add `tools/content/check.mjs`, the `content:check` script, and `tools/content/fixtures/malformed/` from design.md. `pnpm check` runs typecheck, lint, `content:check`, test, and build. `pnpm build` stays `pnpm tokens && vite build`. Run `pnpm content:check` and verify it exits 0 and prints `level:0.1` and `level:1.1` each with a 64-character hex digest. Run `pnpm content:check tools/content/fixtures/malformed` and verify it exits non-zero and the output includes `0-1-twin-beacons.json`.
- [x] 5.2 Add the Content job to `.github/workflows/ci.yml` from design.md. Verify with `rg` that a job named Content runs `pnpm content:check`, needs Install, uses Lint's `if`, and that the workflow's Content job does not run `browsers:install`. Verify the `build` script in `package.json` does not call `content:check`.
- [x] 5.3 Update the docs from design.md's Docs list that 2.3 did not already cover: horizontals 02, 04, 09, and 10; vertical 08's validation section; `content/AGENTS.md`; root `AGENTS.md`. Verify the Content row in horizontal 10 has no pending note, the bundle row is still pending, `content:hash` is still named as later, and `wc -l AGENTS.md` is under 200.

## 6. Integration

- [x] 6.1 Run `pnpm check`. Verify typecheck, lint, `content:check`, both Vitest projects, and build pass, and that `content:check` runs after lint and before test. Verify `docs/ROADMAP.md` still says Stage 2 is "Not started". Do not fill the playtest checklist: no screen, sound, or input changes.
- [x] 6.2 Ask a fresh-context agent that did not write the code to review the diff against this change, verticals 02, 03, and 08, horizontals 04, 05, 09, and 10, decision 0007, and the constitution. The review reports correctness and requirement gaps only. Verify each finding is fixed or answered in the pull request.
- [ ] 6.3 Open the pull request from `change/content-pipeline` with title `feat(content): validate levels 0.1 and 1.1`. Fill the template: OpenSpec link, constitution check, test evidence (`pnpm check`, plus the malformed `content:check` run), no visual evidence, docs updated (horizontals 02, 04, 05, 09, 10, vertical 08, both `AGENTS.md` files, decision 0007), and the assumptions from the proposal. Do not merge.

## Workflow follow-up

- Archive this change (`/opsx:archive`) on the branch after Karim's review requirements are satisfied and before the squash-merge, so the deltas land in `openspec/specs/`.
- Leave `docs/ROADMAP.md` status for Stage 2 as "Not started".
