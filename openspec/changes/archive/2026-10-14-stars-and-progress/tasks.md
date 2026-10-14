# Tasks

## 1. Score and stars

- [x] 1.1 Stay on `change/stars-and-progress`. Add `src/core/scoring/score.test.ts` and `src/core/scoring/stars.test.ts` with one test per `#### Scenario` in `specs/scoring/spec.md` for the score, star, zone 0, unfinished, and miss-report requirements. Add `src/core/scoring/stars.property.test.ts` for "Any cleaner and faster pair keeps the stars", using `@fast-check/vitest` and the bounds in design.md, and include the second property that null bars award 0 and every award is an integer from 0 through 3. Import the shipped zone JSON with `with { type: "json" }` and pass it through `acceptZone`. Drive `scoreEvents` and `awardStars` from design.md. Run `pnpm test:unit src/core/scoring/score.test.ts src/core/scoring/stars.test.ts src/core/scoring/stars.property.test.ts` and verify these tests fail because the modules are missing. Do not edit the judge, the schemas, `package.json`, or docs.
- [x] 1.2 Add `src/core/scoring/score.ts` and `src/core/scoring/stars.ts` from design.md. Run `pnpm test:unit src/core/scoring/score.test.ts src/core/scoring/stars.test.ts src/core/scoring/stars.property.test.ts` and verify they pass. Run `pnpm test:unit src/core/input` and verify the judge tests still pass.

## 2. Progress and retention

- [x] 2.1 Add `src/core/scoring/record-run.test.ts` and `src/core/scoring/retention.test.ts` with one test per remaining `#### Scenario` in `specs/scoring/spec.md` except "Any later Cadet run keeps stars, bests, and medals" and "Any logs keep only that union". Add `src/core/scoring/record-run.property.test.ts` and `src/core/scoring/retention.property.test.ts` for those two, using the bounds and the retention oracle in design.md. The first-miss test parses its result with the existing `progress` chain and expects `status` `"ok"`. The old-best retention test places the kept entries on a version 1 run index and parses it with the existing `runIndex` chain. Drive `recordCadetRun` and `retainRuns` from design.md. Run `pnpm test:unit src/core/scoring/record-run.test.ts src/core/scoring/record-run.property.test.ts src/core/scoring/retention.test.ts src/core/scoring/retention.property.test.ts` and verify these tests fail because the modules are missing.
- [x] 2.2 Add `src/core/scoring/record-run.ts` and `src/core/scoring/retention.ts` from design.md. Do not mutate the progress argument. Do not add a schema version. Run `pnpm test:unit src/core/scoring` and verify the scoring tests pass. Run `pnpm lint` and verify the new modules pass the boundary check.

## 3. Waiting lanes

- [x] 3.1 Update `src/core/sim/waiting-lanes.test.ts` and `src/core/sim/waiting-lanes.property.test.ts` so every `createWaitingLanesRun` and `replayWaitingLanes` call passes the shipped zone for that level, through `acceptZone`. Update the assertions for the MODIFIED scenarios in `specs/waiting-lanes/spec.md`. Keep the scenario title "No key-down scores nothing" and expect score 250. Add the two ADDED zone-mismatch scenarios. Expect `missed` from finish and from replay, and expect the stored summary to stay accuracy, net WPM, score, stars, and medals. Run `pnpm test:unit src/core/sim` and verify the updated assertions fail while score and stars are still 0 and the constructors do not take a zone.
- [x] 3.2 Change `createWaitingLanesRun` and `replayWaitingLanes` to take the zone, as in design.md. Score the private event list with `scoreEvents` and award stars with `awardStars`. Return `missed` beside the summary. Leave the constructor's preflight summary at score 0 and stars 0. Do not call `recordCadetRun` or `retainRuns` from the sim. Run `pnpm test:unit src/core/sim src/core/scoring` and verify both suites pass.

## 4. Integration

- [x] 4.1 Run `pnpm check`. Verify typecheck, lint (including the fixture proof), content check, both Vitest projects, and build pass. Verify `package.json` dependencies are unchanged, `docs/ROADMAP.md` still says Stage 2 is "Not started", and the progress, run-log, and run-index schemas are unchanged. Do not fill the playtest checklist: nothing the player sees or hears changes.
- [x] 4.2 Ask a fresh-context agent that did not write the code to review the diff against this change, vertical 05 (Score, Stars, Rules), vertical 02 (Standards per zone), horizontal 05 (the Cadet progress fields and run-log retention of the best and the last 3), horizontal 08 (the scoring and progress properties), horizontal 04 (`src/core/scoring/`), the roadmap Stage 2 scoring sentence, decisions 0003 and 0007, and the constitution. The review reports correctness and requirement gaps only. Verify each finding is fixed or answered in the pull request.
- [ ] 4.3 Open the pull request from `change/stars-and-progress` with title `feat(scoring): turn a finished run into stars and progress`. Fill the template: OpenSpec link, constitution check, test evidence (`pnpm check`), no visual evidence, docs updated (none; the deferred anti-exploit rule and the checkpoint stay in the proposal and design.md), and the assumptions from the proposal. Do not merge.

## Workflow follow-up

- Archive this change (`/opsx:archive`) on the branch after Karim's review requirements are satisfied and before the squash-merge, so the deltas land in `openspec/specs/`.
- Leave `docs/ROADMAP.md` status "Not started". Stage 2 exits only when Karim says the stage exit has passed.
