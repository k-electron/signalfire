# local-storage Specification

## Purpose

Saves each document in IndexedDB, migrates an older version on load, and restores the newest valid backup when the stored document is invalid.

## Requirements

### Requirement: The game store is an IndexedDB database

The game's local store SHALL keep values in IndexedDB database `signalfire`, object store `documents`. A second opening of that store SHALL see the same keys.

#### Scenario: A stored profile is in signalfire

- **WHEN** the caller saves the shipped version 1 profile under `profile` and then reads IndexedDB database `signalfire`, object store `documents`, key `profile`
- **THEN** the stored value equals that profile

#### Scenario: Two openings share a key

- **WHEN** one opening sets `{ "stars": 1 }` under `progress` and a second opening gets `progress`
- **THEN** the get resolves to `{ "stars": 1 }`

#### Scenario: A raw value round-trips as a copy

- **WHEN** the caller sets `{ "stars": 1 }` under `progress`, changes that object, gets `progress`, and changes the object that was returned
- **THEN** both gets resolve to `{ "stars": 1 }`

#### Scenario: A missing key is absent

- **WHEN** the caller gets `missing`
- **THEN** the get resolves to `undefined`

#### Scenario: Delete removes the key

- **WHEN** the caller sets `{ "stars": 1 }` under `progress` and then deletes `progress`
- **THEN** a later get of `progress` resolves to `undefined`

#### Scenario: Delete of a missing key resolves

- **WHEN** the caller deletes `missing`
- **THEN** the delete resolves and a get of `missing` resolves to `undefined`

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
- **THEN** `backup:profile:0`, `backup:profile:1`, `backup:profile:2`, and `quarantine:profile` are absent, and the live key is still the profile

### Requirement: An older version migrates in memory and is backed up

A load of an older version SHALL return the migrated latest document with restored false, SHALL leave the raw older value under the live key, and SHALL store that raw value at `backup:<key>:0` when the newest backup is not already that value.

The chain in these scenarios has version 1 `{ "v": 1, "stars": <number> }` and version 2, which copies `stars`, sets `v` to 2, and adds `note` of `kept`. Version 2 is the latest version. A value that fails its version's shape is invalid.

#### Scenario: Version 1 migrates to version 2 and keeps stars

- **WHEN** the caller sets `{ "v": 1, "stars": 2 }` under `progress` and loads `progress` with that chain
- **THEN** the result is ok, migrated is true, restored is false, `v` is 2, `stars` is 2, `note` is `kept`, the live key is still `{ "v": 1, "stars": 2 }`, `backup:progress:0` is that same value, and `backup:progress:1` and `backup:progress:2` are absent

#### Scenario: A second load does not store a second copy

- **WHEN** the live key and `backup:progress:0` are both `{ "v": 1, "stars": 2 }` and the caller loads `progress` with that chain
- **THEN** `backup:progress:0` is still `{ "v": 1, "stars": 2 }` and `backup:progress:1` is absent

### Requirement: A save writes the latest version and rotates backups

A save of a latest-version document SHALL report saved, SHALL store that document under the live key, and SHALL rotate the previous live value into the backup ring, newest at `backup:<key>:0`, keeping at most three. When the previous live value is already the newest backup, that ring SHALL stay as it was. The first save, with no previous value, SHALL write no backup.

#### Scenario: The first save stores no backup

- **WHEN** the caller saves `{ "v": 2, "stars": 1, "note": "kept" }` under `progress` with that chain and the key was absent
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

### Requirement: A newer version stays stored

A load of a newer version SHALL report newer, with that version, and SHALL leave the stored keys unchanged. A save while that newer value is the live key SHALL report newer, with that version, and SHALL leave the stored keys unchanged.

#### Scenario: A future value loads as newer

- **WHEN** the caller sets `{ "v": 3, "stars": 9 }` under `progress` and loads `progress` with that chain
- **THEN** the result is newer, the version is 3, the live key is still that value, and `backup:progress:0` and `quarantine:progress` are absent

#### Scenario: A save leaves the newer value in place

- **WHEN** the live key is `{ "v": 3, "stars": 9 }` and the caller saves `{ "v": 2, "stars": 1, "note": "kept" }` with that chain
- **THEN** the result is newer, the version is 3, the live key is still `{ "v": 3, "stars": 9 }`, and `backup:progress:0` is absent

### Requirement: Invalid data is quarantined and the newest valid backup is restored

When the live value fails validation, the store SHALL copy that raw value to `quarantine:<key>` and SHALL put the newest backup that parses back under the live key. The backup slots SHALL stay as they were. The load SHALL return that backup's parsed document with restored true. When no backup parses, the store SHALL remove the live key and the load SHALL report invalid.

#### Scenario: An invalid newer backup is skipped

- **WHEN** the live key is `{ "v": 2 }`, `backup:progress:0` is `{ "v": 1 }`, `backup:progress:1` is `{ "v": 1, "stars": 2 }`, and the caller loads `progress` with that chain
- **THEN** the result is ok, migrated is true, restored is true, `stars` is 2, `note` is `kept`, `quarantine:progress` is `{ "v": 2 }`, the live key is `{ "v": 1, "stars": 2 }`, and both backup slots are unchanged

#### Scenario: No valid backup removes the live value

- **WHEN** the live key is `{ "v": 1 }`, every backup slot is absent, and the caller loads `progress` with that chain
- **THEN** the result is invalid, `quarantine:progress` is `{ "v": 1 }`, and the live key is absent

#### Scenario: A later invalid value replaces the quarantine

- **WHEN** `quarantine:progress` is `{ "v": 1 }`, every backup slot is absent, and the caller sets the live key to `{ "v": 2 }` and loads `progress` with that chain
- **THEN** the result is invalid and `quarantine:progress` is `{ "v": 2 }`

### Requirement: IndexedDB migrates, saves, and restores one document

An older document set in the game's IndexedDB store SHALL load migrated, SHALL save back as the latest version with that older value kept as the newest backup, and SHALL quarantine a later invalid live value and restore that backup.

#### Scenario: An older IndexedDB document migrates, saves, and restores

- **WHEN** the caller sets `{ "v": 1, "stars": 2 }` under `progress` in database `signalfire`, loads it with that chain, saves the migrated document, sets the live key to `{ "v": 1 }`, and loads `progress` again
- **THEN** the first load is ok, migrated is true, restored is false, `stars` is 2, and `note` is `kept`; after the save the live key is `{ "v": 2, "stars": 2, "note": "kept" }` and `backup:progress:0` is `{ "v": 1, "stars": 2 }`; the second load is ok, migrated is true, restored is true, and `stars` is 2; `quarantine:progress` is `{ "v": 1 }` and the live key is `{ "v": 1, "stars": 2 }`

### Requirement: Writes hold the signalfire-write lock

A document load, a document save, a raw set, and a raw delete SHALL each hold the exclusive Web Lock `signalfire-write` until that operation finishes.

#### Scenario: A save waits while the lock is held

- **WHEN** a caller holds `signalfire-write` and another caller saves a latest-version document under `profile`
- **THEN** the save does not finish until the holder releases the lock, and after release the live key is that document

#### Scenario: A raw set waits while the lock is held

- **WHEN** a caller holds `signalfire-write` and another caller sets `{ "stars": 1 }` under `progress`
- **THEN** the set does not finish until the holder releases the lock, and after release a get of `progress` resolves to `{ "stars": 1 }`

#### Scenario: A raw delete waits while the lock is held

- **WHEN** `progress` is `{ "stars": 1 }`, a caller holds `signalfire-write`, and another caller deletes `progress`
- **THEN** the delete does not finish until the holder releases the lock, and after release a get of `progress` resolves to `undefined`

#### Scenario: A load that writes a backup waits while the lock is held

- **WHEN** the live key is `{ "v": 1, "stars": 2 }`, a caller holds `signalfire-write`, and another caller loads `progress` with that chain
- **THEN** the load does not finish until the holder releases the lock, and after release `backup:progress:0` is `{ "v": 1, "stars": 2 }`

### Requirement: A raw get finishes while the write lock is held

A raw get SHALL resolve while another caller holds `signalfire-write`.

#### Scenario: A get does not wait for the write lock

- **WHEN** a caller holds `signalfire-write` and another caller gets `progress`
- **THEN** the get resolves while the holder still holds the lock
