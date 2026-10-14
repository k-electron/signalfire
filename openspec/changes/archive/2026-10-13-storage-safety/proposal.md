# Proposal

## Why

A failed migration is treated as corrupt data: the store can quarantine it and delete the live key. The storage port can also write bytes without validation, put an invalid value into the backup ring, and wait forever on `signalfire-write`. Those paths can destroy a save that was valid for the version that wrote it.

## What Changes

- A value that fails its own version's schema is invalid. A migration that cannot finish is a different result. The store does not quarantine or delete anything for that result, and it does not write.
- **BREAKING** The `Storage` port is load and save of a key bound to that key's document chain. Callers cannot pass a different chain, and nothing outside tests can write a document without validation and backup rotation.
- An invalid live value is not rotated into the backup ring. A later quarantine is stored in a new slot and does not replace an earlier one.
- A save or a load that needs the write lock stops waiting after a bound and leaves the store unchanged.
- The fixture test reads every version file for each shipped document and fails when a version has no fixture.
- The two-version star chain and the immediate write lock move out of modules the app can import.
- `engineVersion` is `major.minor.patch`. Replay accepts a log whose major matches this kernel's major.

Out of this change: cloud sync, the `signalfire-active` lock, checkpoint scheduling, player notices, live run recording, and save conflicts between tabs.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `document-schemas`: a failed migration is not invalid; every shipped version has a fixture; `engineVersion` has a major, a minor, and a patch.
- `local-storage`: keys are bound to chains; invalid data stays out of the backup ring; quarantines append; the write lock wait is bounded; shipped code does not expose an unvalidated write.
- `core-ports-and-rng`: the in-memory `Storage` port loads and saves through that same contract.
- `replay-kernel`: this kernel's engine version is `0.0.0`, and replay compares majors.

## Impact

- `src/core/schemas/parse.ts`, the shipped document schemas, `src/core/schemas/fixtures/`, `src/core/ports/storage.ts`, `src/core/ports/fakes.ts`, `src/core/replay/stand-in-run.ts`.
- `src/platform/storage/` (document store, IndexedDB adapter, tests). `star-chain.ts` leaves the shipped tree.
- Docs: horizontal 05, horizontal 06, decision 0005. Decision 0004 is not edited.

## Principles served

- **P6.** A migration that fails does not quarantine or delete the save. Invalid bytes are not written into the three backups that a restore would trust.
- **P11.** This stays on the device. No new network destination.
- **P13.** This hardens the Stage 1 save path. Sync and tab conflicts stay later.
- P1–P5, P7–P10, and P12 are not served.

## Docs implemented

- `docs/horizontals/05-data-model.md`: Migrations, Invalid data, and the `engineVersion` row. A failed migration is not invalid data. `engineVersion` is `major.minor.patch`; replay requires the same major.
- `docs/horizontals/06-persistence-and-sync.md`: Backups, and the `signalfire-write` sentence. Invalid live data is not a backup. Quarantine slots append. The write lock wait is bounded.
- `docs/decisions/0005-quarantine-slots.md`: numbered quarantine keys. It supersedes the single `quarantine:<key>` sentence in decision 0004.
- `src/AGENTS.md` platform bullets: reads are validated; writes go through the port. Wording only if a bullet still says a raw write is the port.

## Departures

- Decision 0004 keeps a single `quarantine:<key>`. This change stores `quarantine:<key>:0`, then `:1`, and does not overwrite an earlier slot. Decision 0005 records that. No player data uses the old key.
- Horizontal 06 says a write waits inside `signalfire-write` and does not name a bound. This change waits at most 1000 ms, then reports busy and writes nothing. The same change adds that sentence to horizontal 06.
- The replay kernel's archived spec uses the exact string `0-stand-in`. Horizontal 05 already required a matching major. This change follows the horizontal: the kernel's version is `0.0.0`, and any other major is refused. The delta updates `replay-kernel`.

## Assumptions

- The new parse status is `failed`. It carries no document. `invalid` remains the status when the value's own version schema rejects it, or when `v` is missing, not an integer, or less than 1.
- A version integer from 1 through the chain's latest that has no schema, a missing later step, or an `up` result the next schema rejects is `failed`, including when `up` throws. The store returns `failed` and writes nothing.
- Production keys are `profile`, `settings`, `progress`, `run-index`, and `run:<runId>`. Each key selects one chain inside the store. A test may construct a store with a different map; that map lives in the test file.
- The first quarantine slot is `quarantine:<key>:0`. The next new raw value uses the next free index. The same raw value is not stored twice.
- On save, a live value whose parse is `invalid` is appended to quarantine if it is not already there, and it is not moved into `backup:<key>:0`. A live value that parsed as an older version still rotates, as it does today.
- `createWebWriteLock` passes `AbortSignal.timeout(1000)` to `navigator.locks.request`. If the signal aborts before the lock is granted, load and save return `{ status: "busy" }` and write nothing. `1000` is this change's bound, not a design token.
- `engineVersion` matches one or more digits, a dot, one or more digits, a dot, and one or more digits, with no leading zero on a part other than `0`. The stand-in constant becomes `0.0.0`. Replay throws when the major number differs from `0`.
- No new runtime dependency.

## Constitution check

- **C1.** One change, as named. It edits four existing specs because the safety property is already split across them; leaving an old requirement in place would still tell the store to quarantine a failed migration. No new capability. Not a C1 exemption.
- **C2.** Principles, docs, and departures are stated above.
- **C3.** Karim approves this proposal before apply. The agent does not merge it and does not push to `main`.
- **C4.** Migrations and persistence are logic domains. Tests are written failing first. Every scenario in the deltas maps to a test. Tooling has no new command.
- **C5.** Strict TypeScript. No `any`. No `@ts-ignore`.
- **C6.** Decision 0005 records the quarantine key change. Decision 0004 is not edited.
- **C7.** No new runtime dependency. No new development dependency.
- **C8.** `src/AGENTS.md` is edited only to match the port this change implements. Root `AGENTS.md` stays as it is.
- **C9.** Schemas, port, adapter, tests, horizontal 05, horizontal 06, decision 0005, the deltas, and `tasks.md` land together.
- **C10.** Non-trivial. The fresh-context review is a task.
