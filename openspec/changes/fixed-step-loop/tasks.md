# Tasks

## 1. Failing tests

- [x] 1.1 Branch `change/fixed-step-loop` from current `main`. Verify `src/core/ports/clock.ts` exists, and that `src/engine` does not.
- [x] 1.2 Add `src/engine/loop/fixed-step-loop.test.ts` with one test per scenario in `specs/fixed-step-loop/spec.md` except "Integer gaps match the clamped tick total". Add `src/engine/loop/fixed-step-loop.property.test.ts` for that scenario, using `@fast-check/vitest` and the bounds in design.md. Drive `createFixedStepLoop` and `startAnimationFrames` with timestamps and a scheduler that stores callbacks and returns handles. Do not call `requestAnimationFrame`, `performance.now`, `Date.now`, or `createFakeClock`. Compare fractions with `toBe` and the ratios in the spec. Expect `RangeError` for a non-finite frame and for `-1`. Run `pnpm test:unit` and verify these tests fail because `src/engine/loop/fixed-step-loop.ts` is missing. Verify the existing unit tests still pass.

## 2. Fixed-step loop

- [x] 2.1 Add `src/engine/loop/fixed-step-loop.ts` from design.md. Export `createFixedStepLoop` and `startAnimationFrames`. Comment why 120 ticks per millisecond makes 1/120 s an exact 1000 ticks. Do not add a dependency, bind `window`, call the stand-in run, or edit a horizontal doc. Run `pnpm test:unit` and verify the new tests pass. Run `pnpm lint` and verify the new module passes the boundary check.

## 3. Integration

- [x] 3.1 Run `pnpm check`. Verify typecheck, lint (including the fixture proof), both Vitest projects, and build pass. Verify `package.json` dependencies are unchanged, `docs/ROADMAP.md` still says Stage 1 is "Not started", and horizontal 04 is unchanged. Do not fill the playtest checklist: nothing the player sees or hears changes.
- [x] 3.2 Ask a fresh-context agent that did not write the code to review the diff against this change, horizontal 04 (Game loop, Input pipeline), `src/AGENTS.md` (engine), the `Clock` port, and the constitution. The review reports correctness and requirement gaps only. Verify each finding is fixed or answered in the pull request.
- [ ] 3.3 Open the pull request from `change/fixed-step-loop` with title `feat(loop): advance the simulation in fixed steps`. Fill the template: OpenSpec link, constitution check, test evidence (`pnpm check`), no visual evidence, docs updated (none; the loop follows horizontal 04 and does not edit it), and the assumptions from the proposal. Do not merge.

## Workflow follow-up

- Archive this change (`/opsx:archive`) on the branch after Karim's review requirements are satisfied and before the squash-merge, so the delta lands in `openspec/specs/fixed-step-loop/`.
- Leave `docs/ROADMAP.md` status "Not started". Stage 1 exits only when Karim says the stage's exit checks have passed.
