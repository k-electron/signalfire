# Proposal

## Why

Stage 1 starts the pure core. Rules, saves, and replays cannot stay deterministic until core has the interfaces it uses to talk to the outside world, and one seeded generator that every random choice goes through. Those types land before the adapters and the rules.

## What Changes

- Add the five ports from horizontal 04 as TypeScript types, sized to Stage 1 and Stage 2: `Clock`, `RenderOut`, `AudioOut`, `Storage`, and `CloudSync`. They can grow later.
- Add the domain-event outbox the render and audio ports consume, with the Stage 2 event names (`Hit`, `Error`, `WordComplete`, `LevelEnded`).
- Add in-memory fakes for every port, for tests.
- Add a seeded generator in `src/core/replay` with the draws content generation and spawning need: uniform integers, pick, integer weights, shuffle, and a rational chance. The generator is mulberry32, one 32-bit state word. Forking a labeled stream does not advance the parent. The same seed yields the same sequence in Node and in Chromium. Seeds whose mixes differ diverge.
- Record the generator algorithm in a decision record. Changing it later would break replay.
- Out of this change: adapters, the fixed-step loop, schemas, run logs, judging, scoring, spawning, content generation, and ULID generation.

## Capabilities

### New Capabilities

- `core-ports-and-rng`: Core reaches time, storage, cloud, rendering, and audio only through the five ports, and tests stand in with in-memory fakes. Domain events leave through an outbox. Every random draw comes from a seeded generator whose sequence is fixed by the seed in Node and in Chromium.

### Modified Capabilities

- None. `layer-boundaries` already allows `src/core` to import only core, Zod, and verzod. `test-harness` already runs `src/**/*.test.ts` and `src/**/*.browser.test.tsx`. No requirement in those specs changes.

## Impact

- New: `src/core/ports/` (port types, outbox, fakes, tests) and `src/core/replay/` (generator, property test, Chromium known-answer test).
- New: `docs/decisions/0002-seeded-generator.md`, and its row in `docs/decisions/README.md`.
- Unchanged: `src/engine`, `src/platform`, `src/app`, `package.json`, the layer-boundary allowlist, roadmap status, and the horizontal docs. The architecture doc stays the finished shape.
- No new runtime dependency. No new dev dependency.

## Principles served

- **P11.** `Storage` and `CloudSync` are separate ports. A local save does not require an account.
- **P13.** This is the thin slice: types, fakes, and the generator. Adapters and rules come after.
- P1–P10 and P12 are not served.

## Docs implemented

- `docs/ROADMAP.md` Stage 1: the ports and seeded-RNG items only. Status stays "Not started". The loop, schemas, run-log format, tokens, app-flow machine, and IndexedDB adapter are other changes.
- `docs/horizontals/04-architecture.md`: Ports and adapters, Determinism and replay, Domain events. The five port names and the rule that core takes time and randomness from values passed in.
- `docs/horizontals/08-testing-and-dev-practices.md`: in-memory fakes for the five ports, and fast-check properties for the generator.
- `src/AGENTS.md` (core): ports, the outbox, the seeded generator, and fakes.
- Cited, not implemented: horizontal 05 (the `seed` field, ULID for runs), horizontal 06 (IndexedDB and puter.js adapters), vertical 08 (content draws), vertical 03 (spawn draws).

## Departures

- No departure. Horizontal 04's event table and the run summary on `LevelEnded` are the finished shape. This change defines the four Stage 2 names, each with a step number. Later changes add the summary and the other events. The architecture doc is not edited.
- No decision record beyond the generator algorithm. The port list is already in horizontal 04. The algorithm is the hard-to-reverse choice (C6), written as `docs/decisions/0002-seeded-generator.md` during apply.

## Assumptions

- `Clock` reports the simulation step. Wall-clock timestamps, including a document's `updatedAt`, are arguments later save code receives. They are not a clock method.
- `Storage` and `CloudSync` are async get, set, and delete of `unknown` values. Listing keys, backup slots, Web Locks, sign-in, and revisions wait until the adapter and sync changes.
- The fakes copy values with `structuredClone`. A value that cannot be cloned rejects. `get` of a missing key resolves to `undefined`.
- `RenderOut` and `AudioOut` publish a batch of domain events. They do not receive a scene snapshot.
- The generator has no float draw and no jump function. Spawn and content choices that decide an outcome are integers. Visual jitter stays in the engine, later.
- A fork is a new generator from a label, derived from the original seed string. It does not advance the parent, so content and spawning can draw without shifting each other.
- Integer ranges and weight sums must fit in 2^32. A wider range throws `RangeError`. `chance` always consumes one draw.
- Replay restarts from the seed. A mid-run snapshot of generator state is out of scope.
- The known sequence is checked in Node and in the Vitest Chromium project. Firefox and Safari are not in the harness. The steps are `Math.imul` and unsigned 32-bit shifts, which those browsers define the same way.
- Two different strings can mix to the same 32-bit state. The divergence check applies when the mixes differ. `signalfire` and `signalfirf` differ on the first draw.
- The `layer-boundaries` sentence "This change SHALL NOT add source files under those directories" names the layer-boundaries change, which already shipped. The standing scenario is the fixture proof when a directory is absent. This change adds `src/core` and does not edit that spec.

## Constitution check

- **C1.** One capability, `core-ports-and-rng`. Not a C1 exemption. Apply waits for approval.
- **C2.** Principles, docs, and departures are stated above.
- **C3.** Karim approves this proposal before apply. The agent does not merge and does not push to `main`.
- **C4.** Generator sequence and port-fake behavior are logic. Tests are written failing first. Every scenario maps to a test. Properties cover same-seed equality, different-seed divergence, and JSON round-trips through the storage fake.
- **C5.** Strict TypeScript. No `any`. No `@ts-ignore`.
- **C6.** The generator algorithm is recorded in `docs/decisions/0002-seeded-generator.md`. Port shape is an implementation choice in `design.md`, inside the names horizontal 04 already fixed.
- **C7.** No new runtime dependency. Core cannot import a generator package: the boundary check allows only core, Zod, and verzod. The generator is mulberry32, a short function in core, seeded by an FNV-1a 32 mix. fast-check 4.10.2 is already a dev dependency.
- **C8.** No `AGENTS.md` edit. Root `AGENTS.md` stays tool-agnostic and under 200 lines. `src/AGENTS.md` already states these rules.
- **C9.** Types, fakes, tests, the decision record, the delta spec, and `tasks.md` land together. Roadmap status stays "Not started" because Stage 1 is not done. Archive copies the delta into `openspec/specs/`.
- **C10.** Non-trivial. The fresh-context review is a task.
