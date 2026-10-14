# Spec Delta

## REMOVED Requirements

### Requirement: Local storage round-trips a copy

**Reason**: The requirement was raw get, set, and delete of any JSON value. The port now loads and saves a document for a bound key.
**Migration**: Save and load the shipped profile. A value that is not that document is refused. Cloud sync still uses get, set, and delete.

## ADDED Requirements

### Requirement: Local storage loads and saves a document

An in-memory storage SHALL resolve load and save as promises. A load SHALL return an independent copy of the last document saved for that key. A save SHALL accept only a latest-version document for the key's chain.

#### Scenario: A stored document is returned

- **WHEN** a caller saves the shipped version 1 profile under `profile`
- **THEN** the save is saved and a load of `profile` returns a deeply equal document

#### Scenario: A missing key is absent

- **WHEN** a caller loads `profile` and nothing has been saved there
- **THEN** the load is absent

#### Scenario: Mutating the stored object does not change the saved value

- **WHEN** a caller saves the shipped version 1 profile and then changes that object
- **THEN** a later load still returns the profile that was saved

#### Scenario: Mutating the loaded object does not change the saved value

- **WHEN** a caller changes a document returned by load
- **THEN** a later load still returns the profile that was saved

#### Scenario: A value that is not the latest document is refused

- **WHEN** a caller saves `{ "stars": 1 }` under `profile`
- **THEN** the save is invalid and a load of `profile` is absent

#### Scenario: Two storages do not share entries

- **WHEN** a caller saves the shipped version 1 profile in one in-memory storage
- **THEN** a load of `profile` on a second in-memory storage is absent

## MODIFIED Requirements

### Requirement: Cloud sync stores values apart from local storage

An in-memory cloud sync SHALL resolve get, set, and delete as promises, and SHALL keep its entries apart from local storage.

#### Scenario: A local write is not in the cloud

- **WHEN** a caller saves the shipped version 1 profile in local storage
- **THEN** a cloud get of `profile` resolves to `undefined`

#### Scenario: A cloud value round-trips as a copy

- **WHEN** a caller stores `{ rev: 1 }` under `progress` in the cloud and then changes the object that was stored
- **THEN** a cloud get resolves to `{ rev: 1 }` and a local load of `progress` is absent

#### Scenario: Cloud delete removes the key

- **WHEN** a caller stores a value in the cloud and then deletes that key
- **THEN** a cloud get of that key resolves to `undefined`
