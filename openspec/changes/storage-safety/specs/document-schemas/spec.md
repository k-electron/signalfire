# Spec Delta

## REMOVED Requirements

### Requirement: An older version migrates to the latest

**Reason**: A step that cannot finish was called invalid, so the store could quarantine a value that matched its own schema.
**Migration**: The replacement requirement returns failed for a broken step and invalid only when the value's own schema rejects it.

## MODIFIED Requirements

### Requirement: A run log version 1 records one run

A version 1 run log SHALL record the run id, level, tier, mode, seed, content version, engine version as major.minor.patch, start instant, inputs, and a summary.

#### Scenario: The shipped campaign log parses

- **WHEN** the caller parses a version 1 run log with run id `01AFQCG20004HMASW9NF6YY41J`, level `level:1.1`, tier `cadet`, mode `campaign`, seed `signalfire`, content version `demo`, engine version `0.0.0`, `startedAt` and `updatedAt` of `2026-10-12T20:00:00.000Z`, `rev` 0, inputs `[10, 102, 0]` and `[2, 102, 1]`, and a summary of accuracy 1, net WPM 10, score 100, 1 star, and no medals
- **THEN** the result is ok, not migrated, and `v` is 1

#### Scenario: The documented modes are accepted

- **WHEN** mode is `campaign`, `repair`, `systems-check`, `courier`, `daily-signal`, or `deep-archive`
- **THEN** each log is accepted

#### Scenario: Input flags use three bits

- **WHEN** an input's flags are 0, 1, 2, 4, 6, or 7, its step delta is an integer of at least 0, and its character is the code point 102 or 32
- **THEN** the input is accepted

#### Scenario: A bad input, mode, or summary is invalid

- **WHEN** flags are 8, the character is 55296, mode is `practice`, the content version is empty, or the summary has 4 stars
- **THEN** the result is invalid

#### Scenario: A major.minor.patch engine version is accepted

- **WHEN** engine version is `0.0.0` or `1.2.3`
- **THEN** each log is accepted

#### Scenario: An engine version without three parts is invalid

- **WHEN** engine version is `0-stand-in`, `1`, `1.2`, or `01.0.0`
- **THEN** the result is invalid

## ADDED Requirements

### Requirement: An older version migrates, and a broken step is failed

A caller SHALL parse a value through a version chain. An older version SHALL migrate one step at a time to the latest version, and the result SHALL validate as that latest version. When the value matches its own version's schema and a later step cannot finish, the result SHALL be failed and SHALL carry no document.

#### Scenario: Version 1 migrates to version 2 and keeps stars

- **WHEN** the caller parses `{ "v": 1, "stars": 2 }` with a chain whose version 1 is that shape and whose version 2 step copies `stars`, sets `v` to 2, and adds `note` of `kept`
- **THEN** the result is ok and migrated, `v` is 2, `stars` is 2, and `note` is `kept`

#### Scenario: The latest version is not migrated

- **WHEN** the caller parses `{ "v": 2, "stars": 2, "note": "kept" }` with that same chain
- **THEN** the result is ok, not migrated, and equal to the input

#### Scenario: The same older value migrates the same way twice

- **WHEN** the caller parses `{ "v": 1, "stars": 2 }` twice with that same chain
- **THEN** both results are equal

#### Scenario: A step that fails the next schema is failed

- **WHEN** the version 2 step returns `{ "v": 2, "stars": 2 }` and version 2 requires `note`
- **THEN** the result is failed, is not invalid, and carries no document

#### Scenario: A missing intermediate version is failed

- **WHEN** the chain defines versions 1 and 3 only, and the caller parses a valid version 1 value
- **THEN** the result is failed, is not invalid, and carries no document

#### Scenario: A step that throws is failed

- **WHEN** the version 2 step throws and the caller parses a valid version 1 value
- **THEN** the result is failed, is not invalid, and carries no document

### Requirement: Every shipped version has a fixture

Each version of profile, settings, progress, run log, and run index SHALL have one fixture file, and parsing that fixture through the document's chain SHALL succeed as the latest version.

#### Scenario: Each version file parses

- **WHEN** the caller parses every fixture file of those five documents through that document's chain
- **THEN** each result is ok, and each version the chain defines has exactly one of those files
