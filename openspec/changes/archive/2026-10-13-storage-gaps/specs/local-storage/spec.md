# Spec Delta

## MODIFIED Requirements

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

## ADDED Requirements

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
