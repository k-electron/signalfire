# Spec Delta

## REMOVED Requirements

### Requirement: The game store is an IndexedDB database

**Reason**: The scenarios required a raw set and a raw delete. The port no longer writes without validation.
**Migration**: A second opening loads the document the first opening saved. Copies are the saved and loaded documents.

### Requirement: Invalid data is quarantined and the newest valid backup is restored

**Reason**: A later invalid value replaced the only quarantine slot.
**Migration**: Quarantine slots append from `quarantine:<key>:0` and an earlier slot stays.

### Requirement: Writes hold the signalfire-write lock

**Reason**: The scenarios required a raw set and a raw delete, and a wait with no bound.
**Migration**: Load and save take the lock. A lock still held after 1000 ms finishes as busy and writes nothing.

### Requirement: A raw get finishes while the write lock is held

**Reason**: The storage port no longer has a raw get. A load may write a backup or a quarantine slot, so it takes the same lock.
**Migration**: Callers load a document. A load that cannot acquire the lock returns busy and writes nothing.

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: The latest version loads unchanged

A load of a value that is already the latest version SHALL return that document with migrated false and restored false, and SHALL leave the stored keys unchanged.

#### Scenario: The shipped profile round-trips

- **WHEN** the caller saves the shipped version 1 profile under `profile` and loads `profile`
- **THEN** the result is ok, migrated is false, restored is false, and the document equals the saved profile

#### Scenario: Loading the latest version stores no backup

- **WHEN** the shipped version 1 profile is the live value under `profile` and the caller loads `profile`
- **THEN** `backup:profile:0`, `backup:profile:1`, `backup:profile:2`, and `quarantine:profile:0` are absent, and the live key is still the profile

### Requirement: An older version migrates in memory and is backed up

A load of an older version SHALL return the migrated latest document with restored false, SHALL leave the raw older value under the live key, and SHALL store that raw value at `backup:<key>:0` when the newest backup is not already that value. The store binds each key to one chain. Callers load and save a key and do not pass a chain.

The chain in these scenarios has version 1 `{ "v": 1, "stars": <number> }` and version 2, which copies `stars`, sets `v` to 2, and adds `note` of `kept`. Version 2 is the latest version. A value that fails its version's shape is invalid. The progress key of this store is bound to that chain.

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

A save of a latest-version document SHALL report saved, SHALL store that document under the live key, and SHALL rotate the previous live value into the backup ring, newest at `backup:<key>:0`, keeping at most three, when that previous value is not invalid. When the previous live value is already the newest backup, that ring SHALL stay as it was. The first save, with no previous value, SHALL write no backup. An invalid previous live value SHALL be appended to the quarantine slots and SHALL stay out of the backup ring.

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
