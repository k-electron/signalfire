# Tasks

## 1. Seeded generator

- [x] 1.1 Branch `change/core-ports-and-rng` from current `main`. Verify `src/core` does not exist yet and `package.json` has no generator dependency.
- [x] 1.2 Add `src/core/replay/rng.property.test.ts` and `src/core/replay/rng.browser.test.tsx` for every generator scenario in `specs/core-ports-and-rng/spec.md`. Use `@fast-check/vitest`. Bound property strings to 40 code units. The mixed-series property covers 64 unsigned 32-bit draws, `int(0, 8)`, a pick of three strings, a weighted pick with weights 1, 2, and 3, a shuffle of five numbers, and a chance of 1 in 2. The divergence property uses two strings whose 32-bit mixes differ, and 16 draws. The range property uses safe-integer bounds whose span is 1 through 256, and one example draws from 0 through 4294967295. Assert the `signalfire` prefix, the `signalfirf` first draw, and the `signalfire` shuffle `1, 2, 0, 3, 4` from design.md. Call the zero-weight pick 32 times. Add a property that `fork(label)` matches `createRng` of the derived seed from design.md, including a seed that contains `#` and a seed with one supplementary character. The browser file asserts only the `signalfire` prefix and imports no React. Run `pnpm test:unit` and verify it fails because `src/core/replay/rng.ts` is missing.
- [x] 1.3 Add `src/core/replay/rng.ts` from design.md (`createRng`, mulberry32, FNV-1a 32 over UTF-16 code units). Name mulberry32 in a one-line comment. Do not add a dependency or edit the core import allowlist. Run `pnpm test:unit` and verify the property file passes. Run `pnpm test` and verify the Chromium prefix matches. Run `pnpm lint` and verify the new core module passes the boundary check.
- [x] 1.4 Add `docs/decisions/0002-seeded-generator.md` (status accepted, date the day it is written) and its row in `docs/decisions/README.md`, as design.md describes. Verify the record names mulberry32 and the FNV-1a 32 mix, and says a later change needs a new record.

## 2. Ports and fakes

- [x] 2.1 Add `src/core/ports/fakes.test.ts` and `src/core/ports/outbox.test.ts` for every clock, storage, cloud, outbox, render, and audio scenario in the spec. Use `fc.jsonValue()` for the JSON round-trip and `toEqual`. If a sample fails only on negative zero, exclude negative zero from the arbitrary. Also assert `setStep(1.5)` and an advance past `Number.MAX_SAFE_INTEGER` throw `RangeError` and leave the step unchanged. Run `pnpm test:unit` and verify these tests fail because the port modules are missing. Verify the generator tests still pass.
- [x] 2.2 Add the port modules, `createOutbox`, and the fakes from the design.md table. Copy stored values and recorded events with `structuredClone` or a field copy, as that section says. Do not wire the outbox to render or audio. Run `pnpm test:unit` and verify the port tests and the generator tests pass. Run `pnpm lint` and verify the core modules pass the boundary check.

## 3. Integration

- [x] 3.1 Run `pnpm check`. Verify typecheck, lint (including the fixture proof), both Vitest projects, and build pass, and that `pnpm test:e2e` is not part of that command. Verify `package.json` dependencies are unchanged, `docs/ROADMAP.md` still says Stage 1 is "Not started", and the horizontal docs are unchanged. Do not fill the playtest checklist: nothing the player sees or hears changes.
- [x] 3.2 Ask a fresh-context agent that did not write the code to review the diff against this change, horizontal 04 (Determinism and replay, Ports and adapters, Domain events), `src/AGENTS.md` (core), horizontal 08 (property tests), and the constitution. The review reports correctness and requirement gaps only. Verify each finding is fixed or answered in the pull request.
- [x] 3.3 Open the pull request from `change/core-ports-and-rng` with title `feat(core): add ports and a seeded generator`. Fill the template: OpenSpec link, constitution check, test evidence (`pnpm check`), no visual evidence, docs updated (the decision record), and the assumptions from the proposal. Do not merge.

## Workflow follow-up

- Archive this change (`/opsx:archive`) on the branch after Karim's review requirements are satisfied and before the squash-merge, so the delta lands in `openspec/specs/core-ports-and-rng/`.
- Leave `docs/ROADMAP.md` status "Not started".
