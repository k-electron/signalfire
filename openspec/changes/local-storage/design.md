# Design

## Context

See proposal.md for why. Requirements are in `specs/local-storage/spec.md`.

`Storage` in `src/core/ports/storage.ts` is `get`, `set`, and `delete` of `unknown`. `createFakeStorage` stays that raw port. `defineDocument` in `src/core/schemas/parse.ts` returns `{ parse }` with `ok`, `newer`, and `invalid`. Shipped documents are version 1 only. The platform folder does not exist yet. `src/platform` may import `idb-keyval`. Node tests must not touch a DOM. Chromium tests are `src/**/*.browser.test.tsx`. DOM lib includes IndexedDB and Web Locks.

## Goals / Non-Goals

**Goals:**

- One factory the game will call later, and a document store the Node tests can run on a memory map.
- One IndexedDB transaction per backup, quarantine, or save. One Web Lock around each document operation and each raw write.

**Non-Goals:**

- Wiring the factory into `src/app` or writing at a checkpoint.
- A `fake-indexeddb` polyfill. The Chromium project is the real database.
- Growing the core `Storage` port with backups, locks, or `setMany`.

## Decisions

### Modules

| Module | Exports |
|---|---|
| `src/platform/storage/document-store.ts` | `createDocumentStore`, load and save result types |
| `src/platform/storage/write-lock.ts` | `createWebWriteLock`, `createImmediateWriteLock` |
| `src/platform/storage/memory-store.ts` | `createMemoryLocalStore` |
| `src/platform/storage/indexed-db.ts` | `createLocalStorage` |
| `src/platform/storage/star-chain.ts` | the two-version chain from the spec, imported only by the two test files |

`document-store.ts` imports core only (`ParseResult`, and the chain type `{ parse }`). It does not import `idb-keyval` or `indexed-db.ts`. Node tests import the document store, the memory store, and the immediate lock.

`createLocalStorage()` builds the web lock, `createStore("signalfire", "documents")`, the raw adapter, and a document store on that adapter. It returns `{ raw, documents }`. `raw` is the core `Storage` port. Two calls share the database because both use that name.

### Keys

```ts
backup:<documentKey>:0 | :1 | :2
quarantine:<documentKey>
```

`:0` is the newest backup. `assertKey` throws `RangeError` when the key is empty or starts with `backup:` or `quarantine:`. Raw `get`, `set`, and `delete` do not check the key. Document load and save check it before any read or write.

### One transaction

`LocalStore` is the platform shape the document store uses:

```ts
type Change =
  | { readonly type: "set"; readonly key: string; readonly value: unknown }
  | { readonly type: "delete"; readonly key: string };

interface LocalStore {
  get(key: string): Promise<unknown>;
  apply(changes: readonly Change[]): Promise<void>;
}
```

The IndexedDB `apply` is one `readwrite` transaction through the `UseStore` from `createStore`. It does not request the write lock. Puts and deletes share that transaction. Wait on the transaction the way `set` and `setMany` do, with the exported `promisifyRequest`:

```ts
customStore("readwrite", (objectStore) => {
  for (const change of changes) {
    if (change.type === "delete") objectStore.delete(change.key);
    else objectStore.put(change.value, change.key);
  }
  return promisifyRequest(objectStore.transaction);
});
```

An empty change list does not open a transaction. `get` uses idb-keyval `get` and does not take the lock. IndexedDB returns a structured clone, so the adapter does not clone again.

The memory store keeps a `Map`. `get` returns `structuredClone` or `undefined`. `apply` clones into a new map and swaps it in only after every clone succeeds.

Raw `set` and `delete` are `apply` of one change. They take the lock.

### The write lock

`createWebWriteLock` calls `navigator.locks.request("signalfire-write", run)` with no options, so the mode is exclusive and the request waits. It does not keep a depth counter. A counter that stays set across an IndexedDB await lets a second call on the same object skip the browser lock.

The IndexedDB `apply` does not request the lock. Document load and save request it, then call `apply`. Raw `set` and `delete` request it, then write. A nested `apply` does not request the lock again, so a save does not deadlock on its own write. A second load, save, set, or delete requests the browser lock and waits until the first callback finishes.

`createLocalStorage` passes one lock object into both the adapter and the document store. Two factories still share the browser lock by name.

`createImmediateWriteLock` runs the function with no `navigator` access. Node tests use it. It does not prove the browser lock. The Chromium tests do.

Every document load and save enters the lock, including a load that does not write and a save that refuses the value. The key check throws before the lock.

The Chromium wait test requests `signalfire-write` itself, outside the factory, and resolves a promise at the start of that callback. It starts the operation only after that. `navigator.locks.query()` must show a pending request named `signalfire-write`, and the operation's promise must still be pending, before the holder releases. The test does not use a timer. It then releases, awaits the operation, and checks the stored keys.

### Load

Inside the lock, after the key check:

1. Read the live key. If it is absent, return `{ status: "absent" }`.
2. `chain.parse(live)`.
3. `newer`: return `{ status: "newer", version }`. Write nothing.
4. `ok` and not migrated: return `{ status: "ok", migrated: false, restored: false, document }`. Write nothing.
5. `ok` and migrated: if `backup:0` is not deeply equal to the live value, `apply` a rotate that puts the live value at `:0` and shifts the older slots. Do not change the live key. Return `{ status: "ok", migrated: true, restored: false, document }`.
6. `invalid`: `apply` one set of changes. Always set `quarantine:<key>` to the live value. Walk `:0`, then `:1`, then `:2`. The first slot whose raw value parses as `ok` (migrated or not) is written back to the live key. Return that parsed document with `restored: true` and the migration flag from that parse. Leave every backup slot out of the change list. If no slot parses as `ok`, delete the live key and return `{ status: "invalid" }`. A `newer` backup is not a valid backup.

### Save

Inside the lock, after the key check:

- Read the live key. If `chain.parse(live)` is `newer`, return `{ status: "newer", version }` and write nothing, including when the candidate itself is not the latest version.
- Parse the candidate. Anything other than `ok` with `migrated: false` returns `{ status: "invalid" }` and writes nothing. A candidate the chain reports as `newer` is this result when the stored value is not newer.
- If the live key is absent, `apply` a set of the candidate. No backup keys.
- If the live value is deeply equal to `backup:0`, `apply` a set of the live key only.
- Otherwise rotate, then set the live key to the candidate, in the same `apply`.

Rotate builds the next three slots as previous live, old `:0`, old `:1`. It drops old `:2`. Slots that have no value are deletes. A slot that has a value is a set.

Deep equality walks JSON values: `Object.is` for primitives, arrays by index, objects by key set. Key order does not matter. This is only used to skip a duplicate backup.

### The star chain

Tests build this with `defineDocument`. It is not a saved document and has no fixture file.

Version 1 is a strict object `{ v: 1, stars: number }`. Version 2 is `{ v: 2, stars: number, note: "kept" }`. `up` parses the previous value with the version 1 schema and returns `stars` copied, `v` 2, and `note` `"kept"`. `{ "v": 1 }` and `{ "v": 2 }` are invalid. `{ "v": 3, "stars": 9 }` is newer.

The shipped profile scenario imports `src/core/schemas/fixtures/profile/v1.json` with `{ type: "json" }` and parses with `profile` from `src/core/schemas/profile.ts`.

### Tests

`documents.test.ts` (Node) covers every scenario that does not name IndexedDB or the Web Lock. It uses the memory store and the immediate lock.

`indexed-db.browser.test.tsx` (Chromium) covers the IndexedDB scenarios and the lock scenarios. It calls `createLocalStorage()`. The profile-in-`signalfire` scenario reads with `indexedDB.open("signalfire")`, not through `raw.get`.

Do not call `indexedDB.deleteDatabase("signalfire")` in the tests. idb-keyval keeps its connection open, and `deleteDatabase` waits until that connection closes. `afterEach` calls idb-keyval `clear` on `createStore("signalfire", "documents")`.

### Docs

Decision record `docs/decisions/0004-local-document-keys.md`, status accepted, date the day it is written. Context: these names are the saved data. Decision: database `signalfire`, object store `documents`, live key, `backup:<key>:0` through `:2`, `quarantine:<key>`. Consequences: a rename needs a new record and a copy of the old keys. Add the row to `docs/decisions/README.md`.

Horizontal 06, Local storage, add: the IndexedDB database is `signalfire` and the object store is `documents`.

Backups, add: the newest backup is `backup:<document key>:0`, then `:1`, then `:2`. The raw value that failed validation is kept at `quarantine:<document key>`.

Multiple tabs, on the `signalfire-write` sentence, add: a document load takes that lock too, because a load can write a backup or a quarantine entry.

### Dependency

`pnpm add idb-keyval@6.3.0`. It is a `dependency`. Import from `idb-keyval`: `createStore`, `get`, `clear` (tests), and `promisifyRequest`. Do not annotate `any`. The adapter's `get` returns `unknown`.

## Risks / Trade-offs

- [idb-keyval caches the database connection] → Tests clear the object store. They do not delete the database.
- [A nested `navigator.locks.request` for `signalfire-write` deadlocks] → `apply` does not request the lock. The Chromium tests require a pending request named `signalfire-write` before the holder releases.
- [`createStore` does not upgrade an existing database that lacks the object store] → This change is the first creator of `signalfire`. No other code opens that name.
- [Restore writes the backup's raw bytes] → The live key can be an older version until the caller saves the migrated document. `restored: true` is the signal. The same rule as a normal migrated load.
- [One quarantine slot per document] → A later failure replaces the earlier raw value. The spec requires that.
- [Two tabs can both play] → The active-tab lock is Stage 3. This change only serializes writes.

## Migration Plan

No player data exists. Rollback is reverting the change. The first save creates the database.
