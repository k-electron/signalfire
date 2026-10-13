# Proposal

## Why

Stage 1 exits when a headless replay test passes. The ports, the seeded generator, and the version 1 run-log schema are already in core. Nothing steps a run, writes that log from the run, or plays the log back.

## What Changes

- Add the core side of a run: the caller advances it in integer steps, an input applies at the step the run has reached, and each step emits domain events to the existing outbox. Draws come from the run's seed through the existing generator.
- Prove that path with the smallest rules that use an input, a draw, and an event. Those rules are stand-ins, labeled in the spec and in the code. Real judging, scoring, levels, and content stay in Stage 2.
- Recording a finished run produces a version 1 run log in the horizontal 05 shape. The caller supplies the identity fields. This kernel sets `engineVersion`. Inputs are stored as `[stepDelta, character, flags]`. The summary is the stand-in summary.
- A replay runner feeds that log back through the same steps and returns the same events and the same summary.
- A Node test records one run and replays it. A fast-check property does the same for generated seeds and input sequences.

Out of this change: real judging, scoring, stars, medals, levels, and content. The `requestAnimationFrame` loop, the accumulator, and timestamp-to-step conversion. Rendering, audio, and writing the log to IndexedDB. Run-log retention and the run index. Ghosts, the Daily Signal, and golden-replay fixtures.

## Capabilities

### New Capabilities

- `replay-kernel`: A caller advances a run in integer steps, applies inputs at the current step, and reads domain events from the outbox. The run's seed drives its draws. Recording produces a version 1 run log. Replaying that log reproduces the events and the summary. The match rule and the summary formula are stand-ins.

### Modified Capabilities

- None. `core-ports-and-rng` still owns the outbox, the generator, and the port fakes. `document-schemas` still owns the version 1 run-log shape; this change fills a log and does not change what parses. `test-harness` already runs `src/**/*.test.ts` and fast-check. `layer-boundaries` already allows `src/core` to import only core and Zod.

## Impact

- New: a stand-in run under `src/core/replay/`, a Node test, and a property test.
- Unchanged: schemas, ports, `src/engine`, `src/platform`, `src/app`, `package.json`, and the roadmap status. Stage 1 stays "Not started" until Karim exits the stage.
- No new runtime dependency. No new dev dependency. fast-check 4.10.2 and `@fast-check/vitest` 0.5.0 are already installed.

## Principles served

- **P13.** This is the thin kernel: step, record, and replay. Judging and the frame loop come after, on this seam.
- **P12.** The Stage 1 exit is a headless test, and a property over seeds and inputs, rather than a claim that replay will work.
- P1 through P11 are not served. The stand-in match is not typing skill, a score, or a save.

## Docs implemented

- `docs/ROADMAP.md` Stage 1 exit, the headless-replay half. The status cell stays "Not started".
- `docs/horizontals/04-architecture.md`: integer steps, inputs applied at their step, domain events through the outbox, and determinism (a run is its seed plus its inputs). The frame loop and entity lists are not this change.
- `docs/horizontals/05-data-model.md`: the `runLogs` field shape, including `[stepDelta, character, flags]`. Retention is not implemented.
- `docs/horizontals/08-testing-and-dev-practices.md`: a Node logic test and a fast-check property. Golden-replay fixtures stay later, as that doc says.
- Cited, not changed: decision records 0002 (the generator) and 0003 (the run-log encoding).

## Departures

- Horizontal 04's event table is the finished game: `Hit` is a correct keystroke, and `LevelEnded` carries the run summary. This change reuses `Hit`, `Error`, and `LevelEnded` for the stand-in, and leaves `LevelEnded` as `{ type, step }`. The summary is the run-log field and the replay result. The architecture doc is not edited. Stage 2 replaces the stand-in.
- Horizontal 04 drives steps from `requestAnimationFrame`, a 1/120 s step, and an accumulator. This change advances integer steps the caller names. It does not convert timestamps and it does not read `Clock`. That loop is the next change. The architecture doc is not edited.
- Horizontal 05 says a replay needs a matching major `engineVersion`. This kernel's version is the exact string `0-stand-in`. Any other string is refused. There is no major/minor split yet. The doc is not edited.
- No new decision record. The stand-in is labeled and replaced in Stage 2. The generator and the input tuple stay 0002 and 0003.

## Assumptions

- The caller passes absolute steps. The log stores deltas. The first delta is the first absolute step; each later delta is the gap from the previous step.
- The caller supplies `runId`, `levelId`, `tier`, `mode`, `contentVersion`, `startedAt`, `updatedAt`, and `rev`. The kernel does not read a clock or a random source for them. It sets `engineVersion` to `0-stand-in`.
- Stand-in draws use `fork("stand-in")` on the run seed. The horizon is `1 + int(0, 7)` steps. Each step picks a target from the code points 97, 98, and 99. A key-down whose code point equals that target emits `Hit`; any other key-down emits `Error`. A key-up emits no event. Shift flags are stored and do not affect the match. The run covers `max(horizon, lastInputStep + 1)` steps, then emits `LevelEnded` on the last of those steps. A step with no input still consumes one pick.
- The stand-in summary sets accuracy to hits divided by hits plus errors, or 1 when there is no key-down. `netWpm` is 0, `score` is the hit count, `stars` is 0, and `medals` is empty.
- Replay recomputes the events and the summary from the seed and the inputs. It does not copy the summary stored on the log.
- The property test keeps generated steps and sequence lengths small. The kernel accepts any non-decreasing safe-integer steps the run log can store.
- The shipped run-log fixture (`engineVersion` `0.0.0`) is an example document, not a log this kernel recorded. Replay refuses it.

## Constitution check

- **C1.** One capability, `replay-kernel`. Not a C1 exemption. Apply waits for approval.
- **C2.** Principles, docs, and departures are stated above.
- **C3.** Karim approves this proposal before apply. The agent does not merge and does not push to `main`.
- **C4.** Stepping, recording, and replay are logic. Tests are written failing first. Every scenario maps to a test. The property covers generated seeds and input sequences.
- **C5.** Strict TypeScript. No `any`. No `@ts-ignore`.
- **C6.** No new decision record. 0002 and 0003 already cover the generator and the input tuple.
- **C7.** No new runtime dependency. No new dev dependency.
- **C8.** No `AGENTS.md` edit. `src/AGENTS.md` already requires seeded randomness, the outbox, and test-first core.
- **C9.** Tests, the kernel, the delta spec, and `tasks.md` land together. Roadmap status stays "Not started". Archive copies the delta into `openspec/specs/`.
- **C10.** Non-trivial. The fresh-context review is a task.
