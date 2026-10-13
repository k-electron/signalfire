# Proposal

## Why

Stage 1 needs saved documents that can change shape later without losing progress. The walking skeleton (Stage 2) cannot save and reload until profile, settings, progress, and run logs have a versioned schema, and until an older save can be migrated by pure functions.

## What Changes

- Add `zod` 4.6.6. Do not add verzod. It is a small library whose published peer is still `zod@^3.22.0`, and its types name Zod 3 symbols (`ZodEffects`, `ZodTypeDef`). The migration we need is one `up` function per version. That lives in `src/core`.
- Remove verzod from the core import allowlist: `biome.jsonc`, horizontal 04, root `AGENTS.md`, `src/AGENTS.md`, the layer-boundary fixtures, and the `layer-boundaries` spec.
- Envelope on every saved document: `v`, `updatedAt`, `rev`.
- Stable ID formats from horizontal 05, including a run id that is a canonical ULID. Core formats a ULID from a timestamp and 10 entropy bytes the caller passes in. It does not read the clock or a random source.
- Version 1 schemas for the documents Stage 2 save and reload needs: `profile`, `settings`, `progress`, `runLog`, and `runIndex`. `runIndex` is the index horizontal 05 pairs with per-run logs. Telemetry and meta stay out: a new document type later is not a migration.
- Migration behavior as pure functions: every fixture parses as the latest version, a newer `v` is a distinct result and is not rewritten, invalid data is a distinct result and is not rewritten. Quarantine keys, backups, and the player notices stay with storage and UI.
- Prove the chain across two versions with a document defined in the test, not with a second version of a saved document. Shipped documents are version 1 only.
- Update the sentences that still name verzod as the library in use (horizontals 04, 05, 06, and the horizontals index).

## Capabilities

### New Capabilities

- `document-schemas`: Saved documents share an envelope and stable IDs. A pure chain validates each document, migrates older versions to the latest, and tells a newer version apart from invalid data. Version 1 covers profile, settings, progress, a run log, and the run index.

### Modified Capabilities

- `layer-boundaries`: A `src/core` module may import `zod`. It may not import `verzod`. The pass fixture stops importing verzod, and a fail fixture that imports verzod fails the check.

## Impact

- New runtime dependency: `zod` 4.6.6. No verzod dependency, and no pnpm peer override.
- New: `src/core/schemas/` (chain, IDs, version 1 documents, fixtures, tests) and `docs/decisions/0003-run-log-encoding.md`.
- Edited: `package.json`, `pnpm-lock.yaml`, `biome.jsonc`, `tools/layer-boundaries/fixtures/`, `docs/horizontals/04-architecture.md`, `docs/horizontals/05-data-model.md`, `docs/horizontals/06-persistence-and-sync.md`, `docs/horizontals/README.md`, root `AGENTS.md`, `src/AGENTS.md`.
- Unchanged: `src/engine`, `src/platform`, `src/app`, storage adapters, merge, `syncState`, telemetry and meta schemas, roadmap status. Stage 1 stays "Not started".

## Principles served

- **P6.** A migration returns data the latest schema accepts. The two-version proof keeps a star count. No shipped migration drops stars, medals, mods, or Keylings, because no shipped document has a second version yet.
- **P11.** These are local documents. `rev` is on the envelope for a later sync. This change does not require an account and does not send anything.
- **P13.** Version 1 is the save the walking skeleton needs. Telemetry, meta, and the rest of the progress maps wait until the systems that write them.
- P1–P5, P7–P10, and P12 are not served.

## Docs implemented

- `docs/ROADMAP.md` Stage 1: the schema item and the verzod check only. The loop, tokens, app-flow machine, and IndexedDB adapter are other changes. Status stays "Not started".
- `docs/horizontals/05-data-model.md`: envelope, stable IDs, the four walking-skeleton documents plus the run index, migrations, newer-version and invalid-data results. The Risk section is closed: the chain is hand-rolled.
- `docs/horizontals/06-persistence-and-sync.md`: the local-storage sentence that reads go through validation and migration. Adapters, backups, quarantine keys, and sync stay for later changes.
- `docs/horizontals/04-architecture.md`: the core import cell, once verzod is dropped. Run-log fields stay as cited from the Determinism section.
- `src/AGENTS.md` (core): schemas, fixtures, and the chain. The platform sentence that names verzod is updated so it matches.
- `openspec/specs/layer-boundaries/spec.md`: the core import requirement, via this change's delta.
- Cited, not implemented: vertical 05 (what a result means), vertical 06 (the full run summary and telemetry document), vertical 11 (call sign, settings screen, the player notices).

## Departures

- Horizontal 05 names verzod. Its Risk section says to hand-roll the same shape (versioned schemas, `up`, parse) when verzod does not match the Zod major. This change does that. The documents do not change because of the library.
- The same change rewrites the sentences that still say verzod is the library in use.
- Version 1 progress stores per-level records only. Barriers, repair stars, mods, Keylings, codex entries, and story flags stay in horizontal 05 as the finished shape and land as a later version of `progress`, with an `up`. Version 1 run-log summaries store the result the walking skeleton can save (accuracy, net WPM, score, stars, medals). The rest of the telemetry summary lands as a later version of `runLog`. Those are thin slices, not a change to the finished docs.

## Assumptions

- The Zod pin is 4.6.6, published 2026-10-11T16:18:23Z. npm `latest` on 2026-10-12 was 4.6.7, published 2026-10-12T16:29:37Z, which `minimumReleaseAge: 1440` rejects.
- `runIndex` is in this change. Without it, a saved run log has no record of which runs are kept. Pruning is not in this change.
- `updatedAt`, `createdAt`, and `startedAt` are arguments. No schema function reads `Date.now`, `performance.now`, or `Math.random`.
- A run id is a 26-character canonical ULID (Crockford base32, uppercase). `formatRunId(timestampMs, entropy)` throws `RangeError` unless the timestamp is an integer from 0 through 2^48−1 and `entropy` is exactly 10 bytes. The known vectors are in the spec. No ULID package.
- Input tuples are `[stepDelta, character, flags]`, three integers, as horizontal 05's size note describes. Flag bits are in the spec and in decision record 0003, written during apply.
- Objects are strict: an unknown field on a known version is invalid, not stripped.
- A newer `v` is classified before the body is checked. Garbage next to `v: 2` is still newer, not invalid, so a later writer cannot replace it.
- Quarantine, backups, the refresh notice, and the invalid-data notice are not implemented here. The parse result is what those layers will branch on.
- Call sign length, and accuracy stored as a 0–1 ratio, are recorded in `design.md`. Horizontal 05 does not pin them.

## Constitution check

- **C1.** One new capability, `document-schemas`. The `layer-boundaries` delta is the allowlist consequence of not adopting verzod, which horizontal 04 already requires in that case. Not a C1 exemption. Apply waits for approval.
- **C2.** Principles, docs, and the verzod resolution are stated above.
- **C3.** Karim approves this proposal before apply. The agent does not merge and does not push to `main`.
- **C4.** Migrations are a logic domain. Tests are written failing first. Every scenario maps to a test. The two-version chain and the ULID sort are the properties.
- **C5.** Strict TypeScript. No `any`. No `@ts-ignore`.
- **C6.** The run-id encoding and the input flag bits are hard to reverse once a log exists. They are recorded in `docs/decisions/0003-run-log-encoding.md` during apply. Dropping verzod is the Risk section of horizontal 05, not a new decision.
- **C7.** New runtime dependency: `zod` 4.6.6, MIT. Purpose: one schema gives runtime checks and TypeScript types for saved documents, which horizontals 03 and 05 already require. Size: the npm package is about 6.1 MB unpacked because it ships a Zod 3 build, locales, and sources. The Zod 4 classic and core `.js` files are about 512 KB before bundling. Alternatives: verzod (rejected above), Valibot (horizontal 03 already chose Zod). No ULID package.
- **C8.** Root `AGENTS.md` and `src/AGENTS.md` lose the verzod allowlist sentence and name the hand-rolled chain. They stay tool-agnostic. Root `AGENTS.md` stays under 200 lines.
- **C9.** Schemas, fixtures, tests, the Zod pin, the allowlist, the doc sentences, the decision record, the delta specs, and `tasks.md` land together. Roadmap status stays "Not started" because Stage 1 is not done. Archive copies the deltas into `openspec/specs/`.
- **C10.** Non-trivial. The fresh-context review is a task.
