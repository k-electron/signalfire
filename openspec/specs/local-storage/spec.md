# local-storage Specification

## Purpose

Saves each document in IndexedDB, migrates an older version on load, and restores the newest valid backup when the stored document is invalid.

## Requirements

### Requirement: A missing document loads as absent

A load of a key with no value SHALL report absent and SHALL leave the store unchanged.

#### Scenario: Nothing was saved

- **WHEN** the caller loads `profile` and that key has no value
- **THEN** the result is absent and a later load of `profile` is still absent

### Requirement: A document key has a safe name

A document load and save SHALL accept a key of one or more characters, including a run id key. An empty key, or a key prefixed with `backup:` or `quarantine:`, SHALL throw RangeError and SHALL leave the store unchanged.

#### Scenario: A run id key is accepted

- **WHEN** the caller saves a latest-version document under `run:01AFQCG20004HMASW9NF6YY41J`
- **THEN** a load of that key returns that document

#### Scenario: An empty or reserved key is rejected

- **WHEN** the caller saves a latest-version document under `""`, `backup:profile:0`, or `quarantine:profile`
- **THEN** each call throws RangeError and a get of that key resolves to `undefined`

### Requirement: The latest version loads unchanged

A load of a value that is already the latest version SHALL return that document with migrated false and restored false, and SHALL leave the stored keys unchanged.

#### Scenario: The shipped profile round-trips

- **WHEN** the caller saves the shipped version 1 profile under `profile` and loads `profile`
- **THEN** the result is ok, migrated is false, restored is false, and the document equals the saved profile

#### Scenario: Loading the latest version stores no backup

- **WHEN** the shipped version 1 profile is the live value under `profile` and the caller loads `profile`
- **THEN** `backup:profile:0`, `backup:profile:1`, `backup:profile:2`, and `quarantine:profile:0` are absent, and the live key is still the profile

### Requirement: An older version migrates in memory and is backed up

A load of an older version SHALL return the migrated latest document with restored false, SHALL leave the raw older value under the live key, and SHALL store it at `backup:<key>:0` when that backup is not already the same value. Each key is bound to one chain. Callers load and save the key. The progress scenarios use a chain whose version 2 copies stars, sets `v` to 2, and adds `note` of `kept`.

#### Scenario: Version 1 migrates to version 2 and keeps stars

- **WHEN** the caller sets `{ "v": 1, "stars": 2 }` under `progress` and loads `progress`
- **THEN** the result is ok, migrated is true, restored is false, `v` is 2, `stars` is 2, `note` is `kept`, the live key is still `{ "v": 1, "stars": 2 }`, `backup:progress:0` is that same value, and `backup:progress:1` and `backup:progress:2` are absent

#### Scenario: A second load does not store a second copy

- **WHEN** the live key and `backup:progress:0` are both `{ "v": 1, "stars": 2 }` and the caller loads `progress`
- **THEN** `backup:progress:0` is still `{ "v": 1, "stars": 2 }` and `backup:progress:1` is absent

#### Scenario: A failed migration writes nothing

- **WHEN** the live key is `{ "v": 1, "stars": 2 }` and the bound chain's version 2 step returns a value the version 2 schema rejects
- **THEN** the load is failed, the live key is still `{ "v": 1, "stars": 2 }`, and `backup:progress:0` and `quarantine:progress:0` are absent

### Requirement: A save writes the latest version and rotates backups

A save of a latest-version document SHALL report saved and store that document under the live key. It SHALL rotate a previous live value that is not invalid, and whose migration can finish, into `backup:<key>:0`, keeping at most three, unless that value is already the newest backup. The first save SHALL write no backup. An invalid previous live value SHALL be appended to quarantine and stay out of the backup ring.

#### Scenario: The first save stores no backup

- **WHEN** the caller saves `{ "v": 2, "stars": 1, "note": "kept" }` under `progress` on that store and the key was absent
- **THEN** the result is saved, the live key is that document, and `backup:progress:0` is absent

#### Scenario: The migrated document is saved and the older value stays the newest backup

- **WHEN** the caller has loaded `{ "v": 1, "stars": 2 }` so that value is both the live key and `backup:progress:0`, and then saves the migrated document
- **THEN** the result is saved, the live key is `{ "v": 2, "stars": 2, "note": "kept" }`, `backup:progress:0` is `{ "v": 1, "stars": 2 }`, and `backup:progress:1` is absent

#### Scenario: The fourth previous value is dropped

- **WHEN** the caller saves four latest documents under `progress`, in order, with `stars` 1, then 2, then 3, then 4, each with `v` 2 and `note` `kept`
- **THEN** the live key has `stars` 4, `backup:progress:0` has `stars` 3, `backup:progress:1` has `stars` 2, and `backup:progress:2` has `stars` 1

#### Scenario: A value that is not the latest version is refused

- **WHEN** the live key holds `{ "v": 2, "stars": 2, "note": "kept" }` and the caller saves `{ "v": 1, "stars": 9 }`
- **THEN** the result is invalid, the live key is unchanged, and `backup:progress:0` is absent

#### Scenario: An invalid live value stays out of the backup ring

- **WHEN** the live key is `{ "v": 1 }`, every backup slot is absent, and the caller saves `{ "v": 2, "stars": 1, "note": "kept" }`
- **THEN** the result is saved, the live key is that document, `backup:progress:0` is absent, and `quarantine:progress:0` is `{ "v": 1 }`

### Requirement: A newer version stays stored

A load of a newer version SHALL report newer, with that version, and SHALL leave the stored keys unchanged. A save while that newer value is the live key SHALL report newer, with that version, and SHALL leave the stored keys unchanged.

#### Scenario: A future value loads as newer

- **WHEN** the caller sets `{ "v": 3, "stars": 9 }` under `progress` and loads `progress` on that store
- **THEN** the result is newer, the version is 3, the live key is still that value, and `backup:progress:0` and `quarantine:progress:0` are absent

#### Scenario: A save leaves the newer value in place

- **WHEN** the live key is `{ "v": 3, "stars": 9 }` and the caller saves `{ "v": 2, "stars": 1, "note": "kept" }` on that store
- **THEN** the result is newer, the version is 3, the live key is still `{ "v": 3, "stars": 9 }`, and `backup:progress:0` is absent

### Requirement: IndexedDB migrates, saves, and restores one document

An older document set in the game's IndexedDB store SHALL load migrated, SHALL save back as the latest version with that older value kept as the newest backup, and SHALL quarantine a later invalid live value in the next quarantine slot and restore that backup.

#### Scenario: An older IndexedDB document migrates, saves, and restores

- **WHEN** the caller sets `{ "v": 1, "stars": 2 }` under `progress` in database `signalfire`, loads it on a store whose progress key is bound to that chain, saves the migrated document, sets the live key to `{ "v": 1 }`, and loads `progress` again
- **THEN** the first load is ok, migrated is true, restored is false, `stars` is 2, and `note` is `kept`; after the save the live key is `{ "v": 2, "stars": 2, "note": "kept" }` and `backup:progress:0` is `{ "v": 1, "stars": 2 }`; the second load is ok, migrated is true, restored is true, and `stars` is 2; `quarantine:progress:0` is `{ "v": 1 }` and the live key is `{ "v": 1, "stars": 2 }`

### Requirement: IndexedDB stores saved documents

The game's local store SHALL keep values in IndexedDB database `signalfire`, object store `documents`. A second opening of that store SHALL see the same keys. A save SHALL store an independent copy, and a load SHALL return an independent copy.

#### Scenario: A stored profile is in signalfire

- **WHEN** the caller saves the shipped version 1 profile under `profile` and then reads IndexedDB database `signalfire`, object store `documents`, key `profile`
- **THEN** the stored value equals that profile

#### Scenario: Two openings share a key

- **WHEN** one opening saves the shipped version 1 profile under `profile` and a second opening loads `profile`
- **THEN** the load returns that profile

#### Scenario: A saved document round-trips as a copy

- **WHEN** the caller saves the shipped version 1 profile under `profile`, changes the object that was saved, loads `profile`, and changes the object that was returned
- **THEN** both loads return the profile that was saved

### Requirement: Invalid data is appended and the newest valid backup is restored

When the live value fails its own version's schema, the store SHALL append that raw value at the next `quarantine:<key>:<n>` slot, starting at 0, and SHALL leave every earlier slot unchanged. It SHALL restore the newest backup that parses, and the backup slots SHALL stay as they were. When no backup parses, the store SHALL remove the live key and the load SHALL report invalid. A failed migration SHALL leave every stored key unchanged.

#### Scenario: An invalid newer backup is skipped

- **WHEN** the live key is `{ "v": 2 }`, `backup:progress:0` is `{ "v": 1 }`, `backup:progress:1` is `{ "v": 1, "stars": 2 }`, and the caller loads `progress` on that store
- **THEN** the result is ok, migrated is true, restored is true, `stars` is 2, `note` is `kept`, `quarantine:progress:0` is `{ "v": 2 }`, the live key is `{ "v": 1, "stars": 2 }`, and both backup slots are unchanged

#### Scenario: No valid backup removes the live value

- **WHEN** the live key is `{ "v": 1 }`, every backup slot is absent, and the caller loads `progress` on that store
- **THEN** the result is invalid, `quarantine:progress:0` is `{ "v": 1 }`, and the live key is absent

#### Scenario: A later invalid value keeps the earlier quarantine

- **WHEN** `quarantine:progress:0` is `{ "v": 1 }`, every backup slot is absent, and the caller sets the live key to `{ "v": 2 }` and loads `progress` on that store
- **THEN** the result is invalid, `quarantine:progress:0` is `{ "v": 1 }`, and `quarantine:progress:1` is `{ "v": 2 }`

### Requirement: The write lock wait is bounded

A document load and a document save SHALL each hold the exclusive Web Lock `signalfire-write` until that operation finishes. If the lock is not granted within 1000 ms, the operation SHALL finish as busy and SHALL leave the stored keys unchanged.

#### Scenario: A save waits while the lock is held

- **WHEN** a caller holds `signalfire-write` and releases it before 1000 ms, and another caller saves a latest-version document under `profile`
- **THEN** the save does not finish until the holder releases the lock, and after release the live key is that document

#### Scenario: A load that writes a backup waits while the lock is held

- **WHEN** the live key is `{ "v": 1, "stars": 2 }`, a caller holds `signalfire-write` and releases it before 1000 ms, and another caller loads `progress` on that store
- **THEN** the load does not finish until the holder releases the lock, and after release `backup:progress:0` is `{ "v": 1, "stars": 2 }`

#### Scenario: A save finishes busy when the lock stays held

- **WHEN** a caller holds `signalfire-write` for the whole wait and another caller saves a latest-version document under `profile`
- **THEN** the save finishes as busy within the wait and the live key is unchanged

### Requirement: A failed migration refuses a save

A save while the live value's migration cannot finish SHALL report failed and SHALL leave every stored key unchanged.

#### Scenario: A save leaves the failed migration and the backups in place

- **WHEN** the live key is `{ "v": 1, "stars": 2 }`, `backup:progress:0` is `{ "v": 2, "stars": 3, "note": "kept" }`, `backup:progress:1` is `{ "v": 2, "stars": 2, "note": "kept" }`, `backup:progress:2` is `{ "v": 2, "stars": 1, "note": "kept" }`, the bound chain's version 2 step returns a value the version 2 schema rejects, and the caller saves `{ "v": 2, "stars": 9, "note": "kept" }`
- **THEN** the result is failed, the live key is still `{ "v": 1, "stars": 2 }`, `backup:progress:0` has `stars` 3, `backup:progress:1` has `stars` 2, `backup:progress:2` has `stars` 1, and `quarantine:progress:0` is absent

### Requirement: A load returns that key's document

An ok load of `profile`, `settings`, `progress`, `run-index`, or a run id key SHALL return that key's document type.

#### Scenario: Each shipped key returns its document

- **WHEN** the caller saves and loads the shipped latest profile, settings, progress, and run index, and a run log under `run:01AFQCG20004HMASW9NF6YY41J`
- **THEN** each ok document is that key's document type, and the caller reads `callSign`, `master`, `levels`, `kept`, and `runId` with no type assertion
