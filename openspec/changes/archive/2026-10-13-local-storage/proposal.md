# Proposal

## Why

Stage 1's exit needs a document that saves and migrates. Schemas and the in-memory `Storage` port exist; nothing writes IndexedDB, rotates backups, or refuses to clobber a newer save. Stage 2 cannot reload progress until that path exists.

## What Changes

- Add `idb-keyval` 6.3.0. The IndexedDB adapter implements the `Storage` port (`get`, `set`, `delete`) on database `signalfire`, object store `documents`.
- Add a document store in `src/platform/storage` that loads and saves through a core version chain. A load validates and migrates in memory. The migrated document is written back on the next save. A load that migrates copies the stored raw value into the backup ring first and leaves that raw value in place.
- Before a save, rotate the previous value into the backup ring. Keep the last 3. Skip the rotate when that value is already the newest backup, so a migration backup is not stored twice.
- If the stored value is invalid, copy the raw value to a quarantine key and restore the newest backup that parses. If none parses, remove the live value and keep the quarantine.
- If the stored value is a newer version, leave it untouched. A save does not replace it.
- Run document loads, document saves, and raw `set` and `delete` inside the exclusive Web Lock `signalfire-write`. The IndexedDB batch write does not request the lock again, so a save does not wait on itself. A second operation requests the lock and waits.
- Prove migration with a two-version chain defined in the test, the same approach as `document-schemas`. Shipped documents are version 1 only. The Chromium test plants an older value in real IndexedDB, loads it migrated, saves the latest version, checks the backup, then quarantines an invalid value and restores that backup.
- Record the database name and the backup and quarantine key names in decision record 0004 and in horizontal 06. Those names are part of the saved data.

Out of this change: cloud sync, `syncState`, merge, the `signalfire-active` lock, BroadcastChannel, `navigator.storage.persist`, checkpoint scheduling, run-log retention, telemetry and meta schemas, and the player notices (newer-version refresh, invalid-data notice).

## Capabilities

### New Capabilities

- `local-storage`: IndexedDB implements the storage port. A document load validates and migrates, backups keep the last three values, invalid data is quarantined and the newest valid backup is restored, a newer version is not written, and writes run inside `signalfire-write`.

### Modified Capabilities

- None. `core-ports-and-rng` still specifies the in-memory port only. `document-schemas` still specifies the chain. `layer-boundaries` already allows `src/platform` to import `idb-keyval`. `test-harness` already runs `src/**/*.test.ts` in Node and `src/**/*.browser.test.tsx` in Chromium.

## Impact

- New runtime dependency: `idb-keyval` 6.3.0.
- New: `src/platform/storage/` (IndexedDB adapter, write lock, document store, Node tests, Chromium test) and `docs/decisions/0004-local-document-keys.md`.
- Edited: `package.json`, `pnpm-lock.yaml`, `docs/horizontals/06-persistence-and-sync.md`, `docs/decisions/README.md`.
- Unchanged: `src/core` port types and schemas, `src/engine`, `src/app`, roadmap status. Stage 1 stays "Not started".

## Principles served

- **P6.** A failed document is quarantined and the newest valid backup is restored. A migration backup is taken before the old bytes are replaced. No save drops a star count the chain kept.
- **P11.** The game stores documents on this device with no account. This change does not send them anywhere.
- **P13.** This is the save path Stage 2 needs. Sync, tab takeover, and eviction protection wait.
- P1–P5, P7–P10, and P12 are not served.

## Docs implemented

- `docs/ROADMAP.md` Stage 1: the IndexedDB adapter, and the exit line "a document saves and migrates". Status stays "Not started". The loop, tokens, app-flow machine, and headless replay are other changes.
- `docs/horizontals/06-persistence-and-sync.md`: Local storage, Backups, and the `signalfire-write` sentence under Multiple tabs. The same change names the database and the backup and quarantine keys.
- `docs/horizontals/05-data-model.md`: Migrations, including write-back on the next save, no write of a newer version, and quarantine plus the last good backup. The horizontal is not edited; this change implements those rules.
- `src/AGENTS.md` (platform): IndexedDB through idb-keyval, validate and migrate on read, backups, and the write lock. The file already says this. It is not edited.
- Cited, not implemented: horizontal 06 checkpoints, eviction protection, cloud sync, the `signalfire-active` lock, and BroadcastChannel. Vertical 11 (the player notices). Horizontal 05 run-log retention and the telemetry, meta, and `syncState` documents.

## Departures

- No departure. The notices and the refresh reload stay in the docs and ship with the screen that shows them. This change returns `newer` and `restored` so that screen can branch. Checkpoint choice stays with the caller; the store does not write on its own.

## Assumptions

- The pin is `idb-keyval` 6.3.0, published 2026-07-08T10:36:24.985Z. npm reports license Apache-2.0 and unpacked size 55,849 bytes. `minimumReleaseAge: 1440` accepts it. The horizontal's source line cites `^6.2.0`; 6.3.0 is that major.
- The adapter uses `createStore("signalfire", "documents")`. It does not use idb-keyval's default `keyval-store` database.
- Document keys are non-empty strings other than those that start with `backup:` or `quarantine:`. Backup slots are `backup:<key>:0` (newest) through `backup:<key>:2`. The quarantine key is `quarantine:<key>`.
- The caller passes a `defineDocument` chain and a value. The store does not fill `updatedAt` or `rev`, and it does not pick which document to write.
- A save accepts only a value the chain parses as the latest version (`ok`, not migrated). Anything else is refused and the stored keys stay as they were. If the stored value is a newer version, that refusal reports `newer` with the stored version, including when the value being saved is not the latest version.
- A missing key loads as absent. It is not an invalid document and it does not write.
- "Newest valid backup" means the newest slot whose raw value parses as `ok`, including one the chain migrates. Restore writes that raw value back to the live key. The load result is the parsed document, with `restored` set. The backup slot is kept.
- When no backup parses, the live key is removed and the load result is `invalid`. The quarantine key still holds the raw value.
- A second load of the same unmigrated value does not push a second copy of it into the ring.
- The write lock is `navigator.locks.request("signalfire-write")` with the default exclusive mode. Node tests inject a lock that runs the function immediately. The Chromium test uses the real lock. There is no `navigator.locks` polyfill in Node.
- idb-keyval's `UseStore` callback puts and deletes the keys of one document operation in one IndexedDB transaction. `setMany` alone cannot delete, so the adapter uses the callback the way `set` and `setMany` do: mutate the store, then wait on the transaction.
- The core `Storage` port stays `get`, `set`, and `delete` of `unknown`. The document store is platform code. Tests of its rules use an in-memory store in Node. The done-when test uses the IndexedDB adapter in the existing Chromium project, in a `*.browser.test.tsx` file, with its own database name, deleted afterward.
- A failed IndexedDB request rejects the call. This change does not retry.
- Quarantine and backup bytes are readable by a later bug report through the raw store. This change does not add a download or a notice.

## Constitution check

- **C1.** One capability, `local-storage`. Not a C1 exemption. Apply waits for approval.
- **C2.** Principles, docs, and departures are stated above.
- **C3.** Karim approves this proposal before apply. The agent does not merge and does not push to `main`.
- **C4.** Persistence and migrations are logic domains. Tests are written failing first. Every scenario maps to a test. The Chromium test is the real IndexedDB path. Node tests cover the same document rules against the in-memory store so pre-push runs them.
- **C5.** Strict TypeScript. No `any`. No `@ts-ignore`. The wrapper types idb-keyval's values as `unknown`.
- **C6.** The database name and the key layout are hard to reverse once a player has data. They are recorded in `docs/decisions/0004-local-document-keys.md` during apply. The lock name is already in horizontal 06.
- **C7.** New runtime dependency: `idb-keyval` 6.3.0, Apache-2.0. Purpose: the IndexedDB key-value store horizontal 03 and horizontal 06 already require. Size: npm unpacked size 55,849 bytes. The package README states 295 bytes brotli for `get`/`set` and 573 bytes brotli for every method. Alternatives: raw IndexedDB (same browser API, more of our code), `idb` (the idb-keyval README calls it about 1 KB and more than a key-value store needs), localForage (that README calls it about 7 KB, for old browsers this game does not support), `localStorage` (rejected by horizontal 06 and `src/AGENTS.md`).
- **C8.** No `AGENTS.md` edit. Root `AGENTS.md` stays tool-agnostic and under 200 lines. `src/AGENTS.md` already states the platform rules this change implements.
- **C9.** Adapter, document store, tests, the `idb-keyval` pin, decision record 0004, the horizontal 06 key names, the delta spec, and `tasks.md` land together. Roadmap status stays "Not started" because Stage 1 is not done. Archive copies the delta into `openspec/specs/`.
- **C10.** Non-trivial. The fresh-context review is a task.
