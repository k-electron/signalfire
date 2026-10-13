# Tasks

## 1. Failing tests

- [ ] 1.1 Branch `change/replay-kernel` from current `main`. Verify `src/core/replay/rng.ts`, `src/core/ports/outbox.ts`, and `src/core/schemas/run-log.ts` exist, and that `src/core/replay/stand-in-run.ts` does not.
- [ ] 1.2 Add `src/core/replay/stand-in-run.test.ts` with one test per scenario in `specs/replay-kernel/spec.md` except "An arbitrary seed and input list replay". Add `src/core/replay/stand-in-run.property.test.ts` for that scenario, using `@fast-check/vitest` and the bounds in design.md. Drive `createStandInRun`, `advance`, `apply`, `finish`, `recordStandInRun`, and `replayStandInRun` through `createOutbox`. Use the campaign identity from the delta scenario (`01AFQCG20004HMASW9NF6YY41J`, `level:1.1`, `cadet`, `campaign`, instants `2026-10-12T20:00:00.000Z`, rev 0). Expect `RangeError` for a backward step, a second finish, a schema refusal, and engine version `0.0.0`. Expect the caller's outbox to stay empty when record or replay throws. Run `pnpm test:unit` and verify these tests fail because `src/core/replay/stand-in-run.ts` is missing. Verify the existing generator tests still pass.

## 2. Stand-in run

- [ ] 2.1 Add `src/core/replay/stand-in-run.ts` from design.md. Comment that the match, horizon, targets, and summary are stand-ins. Export `STAND_IN_ENGINE_VERSION` as `0-stand-in`. Do not add a dependency, edit a schema, or edit a horizontal doc. Run `pnpm test:unit` and verify the new tests and the generator tests pass. Run `pnpm lint` and verify the new module passes the boundary check.

## 3. Integration

- [ ] 3.1 Run `pnpm check`. Verify typecheck, lint (including the fixture proof), both Vitest projects, and build pass. Verify `package.json` dependencies are unchanged, `docs/ROADMAP.md` still says Stage 1 is "Not started", and horizontals 04, 05, and 08 are unchanged. Do not fill the playtest checklist: nothing the player sees or hears changes.
- [ ] 3.2 Ask a fresh-context agent that did not write the code to review the diff against this change, horizontal 04 (Game loop, Input pipeline, Domain events, Determinism and replay), horizontal 05 (`runLogs`), horizontal 08 (logic tests and property tests), decisions 0002 and 0003, and the constitution. The review reports correctness and requirement gaps only. Verify each finding is fixed or answered in the pull request.
- [ ] 3.3 Open the pull request from `change/replay-kernel` with title `feat(replay): record and replay a stand-in run`. Fill the template: OpenSpec link, constitution check, test evidence (`pnpm check`), no visual evidence, docs updated (none; the departures leave the horizontals as the finished shape), and the assumptions from the proposal. Do not merge.

## Workflow follow-up

- Archive this change (`/opsx:archive`) on the branch after Karim's review requirements are satisfied and before the squash-merge, so the delta lands in `openspec/specs/replay-kernel/`.
- Leave `docs/ROADMAP.md` status "Not started". Stage 1 exits only when Karim says both exit checks have passed.
