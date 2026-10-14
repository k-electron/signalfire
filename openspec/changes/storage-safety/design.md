# Design

## Context

See proposal.md for why. `defineDocument` returns `ok`, `newer`, or `invalid`. A failed `up` is `invalid`, and `createDocumentStore` quarantines every `invalid` load, including one that deletes the live key. `Storage` is `get` / `set` / `delete`. `createLocalStorage` returns `{ raw, documents }`. `star-chain.ts` and `createImmediateWriteLock` sit in `src/platform/storage` and are imported only by tests. `engineVersion` is any non-empty string. The stand-in constant is `0-stand-in`. The write lock calls `navigator.locks.request` with no signal.

## Goals / Non-Goals

**Goals:**

- Failed migrations and invalid documents are different results, and only the second one is quarantined.
- Production reads and writes go through one bound load/save path.
- Quarantine slots append. Invalid bytes stay out of the backup ring.
- The write lock wait ends.

**Non-Goals:**

- Player-facing copy for `failed`, `newer`, or `busy`.
- Changing CloudSync.

## Decisions

1. **`failed` is a parse status.** `defineDocument` returns `{ status: "failed" }` when `v` is an integer from 1 through `latest`, the value matches that version's schema (or that version has no schema), and a later step is missing, is `initial`, rejects `up`'s return value, or `up` throws. Own-schema failure, and a non-integer or sub-1 `v`, stay `invalid`. Alternative: throw on a broken chain. Rejected, because a throw is easy to treat as a crash and the store needs a result that means "write nothing".

2. **The document rules live in core.** `src/core/storage/document-store.ts` exports `loadDocument` and `saveDocument` over a `get` / `apply` key-value port and one chain per key. Platform IndexedDB and the in-memory fake both call it. Core cannot import platform, so the rules cannot stay only in platform. Alternative: duplicate the rules in the fake. Rejected.

3. **Keys select chains.** `createGameStorage` binds `profile`, `settings`, `progress`, `run-index`, and `run:<runId>` (the id must be a canonical run id). `load` and `save` take the key only. A test builds a store with `{ progress: starChain }` in the test file. `src/platform/storage/star-chain.ts` is deleted. The star chain is not imported by `createLocalStorage` or `src/main.tsx`.

4. **The port matches that.** `Storage` is `load` and `save` for those production keys, plus the result types. `createFakeStorage` uses the shipped chains and an in-memory key-value map. `createLocalStorage` returns that `Storage`. There is no `raw` export. Tests that plant bytes use `idb-keyval` in the browser test, or the in-memory `apply` inside the core test, not a production write method.

5. **Quarantine slots.** `quarantine:<key>:0`, then `:1`, and so on. Append when the raw value is not already in a slot. On save, an `invalid` live value is appended and is not passed to `rotate`. An older valid live value still rotates. Decision 0005 records the names. 0004 is not edited.

6. **Lock wait.** `createWebWriteLock` requests `signalfire-write` with `AbortSignal.timeout(1000)`. `AbortError` before the callback runs becomes `{ status: "busy" }` from load and save. The IndexedDB `apply` does not request the lock. Node tests pass a lock that runs the function immediately, defined in the test file. `createImmediateWriteLock` is deleted from `write-lock.ts`.

7. **`engineVersion`.** Schema regex `^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$`. `STAND_IN_ENGINE_VERSION` is `0.0.0`. Replay reads the major (the integer before the first dot) and throws when it is not 0.

8. **Fixtures.** `defineDocument` also returns `versions: readonly number[]`. `documents.test.ts` uses `import.meta.glob("./fixtures/**/*.json", { eager: true })`. For each shipped document, the glob's `v<n>.json` set equals `versions`. Each file parses to `ok`. A missing file fails that equality. The test does not import `node:fs`.

## Risks / Trade-offs

- [A 1000 ms wait makes one browser test take about a second] → One test holds the lock and expects `busy`. The release-before-timeout tests stay fast.
- [`import.meta.glob` is rejected by the boundary check] → Move the glob into the test only. If the checker flags it, read the files through Vitest's glob API the checker already allows for tests. Do not import `node:fs` from `src/core`.
- [A test store and the game store drift] → The star chain stays in the test. Production keys are one map next to the schemas.

## Migration Plan

No player data uses these keys yet. Rollback is reverting the change. Old `quarantine:<key>` values, if any appeared in a dev profile, are ignored; the new slots start at `:0`.

## Open Questions

None.
