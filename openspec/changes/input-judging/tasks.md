# Tasks

## 1. Failing tests

- [ ] 1.1 Stay on `change/input-judging`. Verify `src/core/ports/domain-event.ts` exports `Hit` and `Error` as `{ type, step }`, and that `src/core/input/` does not exist yet. Do not edit the stand-in, the run log, or `package.json`.
- [ ] 1.2 Add `src/core/input/judge.test.ts` with one test per scenario in `specs/input-judging/spec.md` except "Generated keystrokes stay in range" and "A generated run of only correct keys scores 100". Add `src/core/input/judge.property.test.ts` for those two, using `@fast-check/vitest` and the bounds in design.md. Drive `startJudge`, `applyKeystroke`, `activeCharacter`, `attemptCounts`, `integrityPercent`, and `velocityWpm`. Use code points f 102, j 106, k 107, x 120, F 70, and space 32. Expect `RangeError` for an earlier step and for code point 55296, with the previous state unchanged. In the same test file, reject a negative step, a non-integer step, an empty physical key, a code point below 0, a code point above 0x10FFFF, and a Shift side outside left, right, and none, each with `RangeError` and an unchanged state. Run `pnpm test:unit src/core/input` and verify these tests fail because `src/core/input/judge.ts` is missing. Run `pnpm test:unit src/core/replay/stand-in-run.test.ts` and verify the stand-in tests still pass.

## 2. Judge

- [ ] 2.1 Add `src/core/input/judge.ts` from design.md. Comment why a gap longer than 360 steps is dropped from Velocity, and point at verticals 02, 05, and 06 plus the assumption in design.md. Export the functions from task 1.2. Do not add a dependency, edit a schema, edit the stand-in, or edit a doc. Run `pnpm test:unit src/core/input src/core/replay/stand-in-run.test.ts` and verify the new tests and the stand-in tests pass. Run `pnpm lint` and verify the new module passes the boundary check.

## 3. Integration

- [ ] 3.1 Run `pnpm check`. Verify typecheck, lint (including the fixture proof), content check, both Vitest projects, and build pass. Verify `package.json` dependencies are unchanged, `docs/ROADMAP.md` still says Stage 2 is "Not started", and the stand-in, the run log, and horizontals 04 and 05 are unchanged. Do not fill the playtest checklist: nothing the player sees or hears changes.
- [ ] 3.2 Ask a fresh-context agent that did not write the code to review the diff against this change, vertical 04 (Input model, Judging a keystroke), vertical 02 (Error policy, the WPM definition), vertical 05 (What's measured, the pause sentence), vertical 06 (Active time, Net WPM), horizontal 04 (Input pipeline, Domain events), `src/AGENTS.md` (core), decision 0003, and the constitution. The review reports correctness and requirement gaps only. Verify each finding is fixed or answered in the pull request.
- [ ] 3.3 Open the pull request from `change/input-judging` with title `feat(input): judge keystrokes and compute Integrity and Velocity`. Fill the template: OpenSpec link, constitution check, test evidence (`pnpm check`), no visual evidence, docs updated (none; the active-minutes assumption stays in design.md), and the assumptions from the proposal. Do not merge.

## Workflow follow-up

- Archive this change (`/opsx:archive`) on the branch after Karim's review requirements are satisfied and before the squash-merge, so the delta lands in `openspec/specs/input-judging/`.
- Leave `docs/ROADMAP.md` status "Not started". Stage 2 exits only when Karim says the stage exit has passed.
