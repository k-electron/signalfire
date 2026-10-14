# Tasks

## 1. Failing tests

- [x] 1.1 Stay on `change/waiting-lanes`. Verify `src/core/sim/` does not exist, `src/core/replay/stand-in-run.ts` still exports `createStandInRun`, and `src/core/input/judge.ts` has no append function. Do not edit the stand-in, schemas, `package.json`, or docs.
- [x] 1.2 Add `src/core/sim/waiting-lanes.test.ts` with one test per `#### Scenario` in `specs/waiting-lanes/spec.md` except "Generated notes stay on f, j, and space" and "An arbitrary seed and input list replay". Import the shipped level and tuning JSON with `with { type: "json" }`, as `src/app/content/campaign.ts` does, and pass those values through `acceptLevel` and `acceptTuning`. Drive `createWaitingLanesRun` and `replayWaitingLanes` from design.md. Use code points f 102, j 106, and space 32. Expect `RangeError` where the scenario says the call throws. Add `src/core/sim/waiting-lanes.property.test.ts` for the two excluded scenarios, using `@fast-check/vitest` and the bounds in design.md. Run `pnpm test:unit src/core/sim` and verify these tests fail because `src/core/sim/waiting-lanes.ts` is missing. Run `pnpm test:unit src/core/replay/stand-in-run.test.ts` and verify the stand-in tests still pass.

## 2. Runtime

- [x] 2.1 Add `appendCharacter` to `src/core/input/judge.ts` from design.md. It returns a new state with that code point appended and leaves the index, the counts, and the clock unchanged. It throws `RangeError` for a surrogate or a value outside a Unicode scalar. Do not change `applyKeystroke`. Run `pnpm test:unit src/core/input` and verify the existing judge tests still pass.
- [x] 2.2 Add `src/core/sim/waiting-lanes.ts` from design.md. Comment why `approachSeconds * 120` must be an integer, and point at the integer-step rule in horizontal 04. Export the functions from task 1.2. Set `engineVersion` to `0.0.0`. Do not add a dependency, edit a schema, edit the stand-in, or edit a doc. Run `pnpm test:unit src/core/sim src/core/input src/core/replay/stand-in-run.test.ts` and verify the new tests, the judge tests, and the stand-in tests pass. Run `pnpm lint` and verify the new module passes the boundary check.

## 3. Retire the stand-in

- [x] 3.1 Delete `src/core/replay/stand-in-run.ts`, `src/core/replay/stand-in-run.test.ts`, and `src/core/replay/stand-in-run.property.test.ts`. Verify no remaining source file mentions `createStandInRun`, `recordStandInRun`, `replayStandInRun`, or `fork("stand-in")`. Run `pnpm test:unit` and verify the suite passes without those files.

## 4. Integration

- [x] 4.1 Run `pnpm check`. Verify typecheck, lint (including the fixture proof), content check, both Vitest projects, and build pass. Verify `package.json` dependencies are unchanged, `docs/ROADMAP.md` still says Stage 2 is "Not started", and the run-log schema and horizontals 04 and 05 are unchanged. Do not fill the playtest checklist: nothing the player sees or hears changes.
- [x] 4.2 Ask a fresh-context agent that did not write the code to review the diff against this change, vertical 04 (Lanes, the waiting-lanes row), vertical 03 (Level anatomy, levels 0.1 and 1.1, no game over), vertical 02 (levels 0.1 and 1.1, zone 0 always completes), horizontal 04 (Game objects, Determinism and replay, Domain events), horizontal 05 (`runLogs`), the roadmap Stage 2 live-log sentence, decisions 0002, 0003, and 0007, and the constitution. The review reports correctness and requirement gaps only. Verify each finding is fixed or answered in the pull request.
- [ ] 4.3 Open the pull request from `change/waiting-lanes` with title `feat(lanes): play waiting lanes for levels 0.1 and 1.1`. Fill the template: OpenSpec link, constitution check, test evidence (`pnpm check`), no visual evidence, docs updated (none; the `LevelEnded` payload and the zero score stay in the proposal and design.md), and the assumptions from the proposal. Do not merge.

## Workflow follow-up

- Archive this change (`/opsx:archive`) on the branch after Karim's review requirements are satisfied and before the squash-merge, so the deltas land in `openspec/specs/`.
- After archive, set the purpose in `openspec/specs/replay-kernel/spec.md` to "Retired. Waiting lanes records the live run and replays it." A delta cannot change that purpose.
- Leave `docs/ROADMAP.md` status "Not started". Stage 2 exits only when Karim says the stage exit has passed.
