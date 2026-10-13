# document-schemas Specification

## Purpose

Checks saved documents against versioned schemas, migrates an older version to the latest, and keeps a newer version distinct from invalid data.

## Requirements

### Requirement: Stable IDs match their formats

A caller SHALL accept an ID only when it matches that kind's format.

#### Scenario: Documented IDs are accepted

- **WHEN** the caller checks `zone:0`, `zone:2`, `level:0.1`, `level:2.4`, `side:3.blackout`, `cadet`, `veteran`, `ace`, `char:e`, `char:?`, `medal:flawless`, `machine:dart`, `mod:reach-boosters`, `achievement:first-light`, `dispatch:earn-medals`, `codex:the-hush`, and `cosmetic:trail.river`
- **THEN** each value is accepted as that kind

#### Scenario: Lookalike IDs are rejected

- **WHEN** the caller checks `zone:02`, `zone:two`, `level:2`, `level:01.1`, `level:1.01`, `side:3.Blackout`, `tier:cadet`, `char:ee`, `char:`, `medal:Flawless`, `mod:reach--boosters`, `cosmetic:trail`, and `cosmetic:Trail.river`
- **THEN** each value is rejected

### Requirement: A run id is a canonical ULID

A caller SHALL format a run id from a millisecond timestamp and 10 entropy bytes, and SHALL accept only the canonical 26-character uppercase form.

#### Scenario: Zero time and zero entropy

- **WHEN** the caller formats a run id with timestamp 0 and 10 zero bytes
- **THEN** the id is `00000000000000000000000000`

#### Scenario: The largest ULID

- **WHEN** the caller formats a run id with timestamp 281474976710655 and 10 bytes of 255
- **THEN** the id is `7ZZZZZZZZZZZZZZZZZZZZZZZZZ`

#### Scenario: A mixed timestamp and entropy

- **WHEN** the caller formats a run id with timestamp 1460000000000 and the 10 bytes 01, 23, 45, 67, 89, ab, cd, ef, 10, 32
- **THEN** the id is `01AFQCG20004HMASW9NF6YY41J` and that string is accepted as a run id

#### Scenario: An earlier timestamp sorts first

- **WHEN** the caller formats two run ids with timestamps 1000 and 2000, each with any 10 entropy bytes
- **THEN** the id for timestamp 1000 is lexicographically before the id for timestamp 2000

#### Scenario: The same inputs repeat

- **WHEN** the caller formats a run id twice with the same timestamp and the same 10 entropy bytes
- **THEN** both ids are equal

#### Scenario: Time or entropy is unusable

- **WHEN** the timestamp is -1, 281474976710656, or 1.5, or the entropy is not exactly 10 bytes
- **THEN** the call throws RangeError and produces no id

#### Scenario: A non-canonical string is rejected

- **WHEN** the caller checks `01afqcg20004hmasw9nf6yy41j`, `80000000000000000000000000`, or `0000000000000000000000000I`
- **THEN** each value is rejected as a run id

### Requirement: An older version migrates to the latest

A caller SHALL parse a value through a version chain. An older version SHALL migrate one step at a time to the latest version, and the result SHALL validate as that latest version.

#### Scenario: Version 1 migrates to version 2 and keeps stars

- **WHEN** the caller parses `{ "v": 1, "stars": 2 }` with a chain whose version 1 is that shape and whose version 2 step copies `stars`, sets `v` to 2, and adds `note` of `kept`
- **THEN** the result is ok and migrated, `v` is 2, `stars` is 2, and `note` is `kept`

#### Scenario: The latest version is not migrated

- **WHEN** the caller parses `{ "v": 2, "stars": 2, "note": "kept" }` with that same chain
- **THEN** the result is ok, not migrated, and equal to the input

#### Scenario: The same older value migrates the same way twice

- **WHEN** the caller parses `{ "v": 1, "stars": 2 }` twice with that same chain
- **THEN** both results are equal

#### Scenario: A step that fails the next schema is invalid

- **WHEN** the version 2 step returns `{ "v": 2, "stars": 2 }` and version 2 requires `note`
- **THEN** the result is invalid and carries no document

#### Scenario: A missing intermediate version is invalid

- **WHEN** the chain defines versions 1 and 3 only, and the caller parses a valid version 1 value
- **THEN** the result is invalid and carries no document

### Requirement: A newer version stays newer

A caller SHALL treat an integer `v` greater than the chain's latest version as newer, before judging the rest of the value.

#### Scenario: A future profile is newer

- **WHEN** the caller parses a profile whose `v` is 2 and whose call sign is missing, and the latest profile version is 1
- **THEN** the result is newer, the version is 2, and the result carries no document

#### Scenario: A non-integer version is invalid

- **WHEN** the caller parses a value whose `v` is 1.5, 0, -1, `"1"`, or missing
- **THEN** the result is invalid and is not newer

### Requirement: Invalid data stays invalid

A caller SHALL treat a known version that fails its schema as invalid, including a field the schema does not name.

#### Scenario: A known version fails its schema

- **WHEN** the caller parses a version 1 profile whose call sign is empty
- **THEN** the result is invalid and carries no document

#### Scenario: An unknown field fails the known version

- **WHEN** the caller parses a version 1 progress document that also has `mods`
- **THEN** the result is invalid and carries no document

### Requirement: Saved documents share an envelope

A saved document SHALL include integer `v` of at least 1, an `updatedAt` instant with a timezone offset, and an integer `rev` of at least 0.

#### Scenario: An offset instant and a zero revision are accepted

- **WHEN** the caller parses a profile that is otherwise the shipped example, with `updatedAt` of `2026-10-12T20:00:00.000Z` or `2026-10-12T16:00:00-04:00`, and `rev` 0
- **THEN** the result is ok

#### Scenario: A local time or a bad revision is invalid

- **WHEN** `updatedAt` is `2026-10-12T20:00:00` or `2026-10-12`, or `rev` is -1 or 1.5
- **THEN** the result is invalid

### Requirement: Profile version 1 records the cadet

A version 1 profile SHALL record the call sign, when it was created, whether onboarding is complete, and the preferred thumb.

#### Scenario: The shipped profile parses

- **WHEN** the caller parses a version 1 profile with call sign `Ada`, `createdAt` and `updatedAt` of `2026-10-12T20:00:00.000Z`, `rev` 0, `onboardingComplete` false, and `preferredThumb` of `either`
- **THEN** the result is ok, not migrated, and `v` is 1

#### Scenario: The thumb is one of the three choices

- **WHEN** `preferredThumb` is `left`, `right`, or `either`
- **THEN** each profile is accepted

#### Scenario: A bad call sign or thumb is invalid

- **WHEN** the call sign is empty, ` Ada`, or 25 characters, or `preferredThumb` is `both`
- **THEN** the result is invalid

### Requirement: Settings version 1 records preferences

A version 1 settings document SHALL record master, music, effects, and voices volumes from 0 through 1, an effects intensity of `low`, `medium`, or `high`, and a fullscreen flag.

#### Scenario: The shipped settings parse

- **WHEN** the caller parses version 1 settings with every volume at 1, `effectsIntensity` of `medium`, `fullscreen` false, `updatedAt` of `2026-10-12T20:00:00.000Z`, and `rev` 0
- **THEN** the result is ok, not migrated, and `v` is 1

#### Scenario: A volume or intensity outside the set is invalid

- **WHEN** a volume is -0.1 or 1.1, or `effectsIntensity` is `ultra`
- **THEN** the result is invalid

### Requirement: Progress version 1 records level results

A version 1 progress document SHALL record, for each played level and tier, stars, medals, best score, best net WPM, best accuracy, attempts, failures since the last star, and whether calm is unlocked.

#### Scenario: An empty progress document parses

- **WHEN** the caller parses version 1 progress with no levels, `updatedAt` of `2026-10-12T20:00:00.000Z`, and `rev` 0
- **THEN** the result is ok, not migrated, and `v` is 1

#### Scenario: A cadet result parses and keeps its stars

- **WHEN** the caller parses version 1 progress whose `level:1.1` cadet record has 2 stars, medal `medal:flawless`, best score 100, best net WPM 12.5, best accuracy 0.95, 3 attempts, 1 failure since the last star, and calm locked
- **THEN** the result is ok and that record still has 2 stars

#### Scenario: A side level is a progress key

- **WHEN** the cadet record above is stored under `side:3.blackout` instead of `level:1.1`
- **THEN** the result is ok

#### Scenario: A level result outside its ranges is invalid

- **WHEN** stars are 4, best accuracy is 1.5, the medals list repeats `medal:flawless`, the level key is `level:1`, or the level has no tier records
- **THEN** the result is invalid

### Requirement: A run log version 1 records one run

A version 1 run log SHALL record the run id, level, tier, mode, seed, content version, engine version, start instant, inputs, and a summary.

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

### Requirement: The run index version 1 lists kept logs

A version 1 run index SHALL list each kept run once, with its level, tier, mode, and whether it is kept as the best or as a recent run.

#### Scenario: The shipped index parses

- **WHEN** the caller parses a version 1 run index whose only entry is run id `01AFQCG20004HMASW9NF6YY41J`, level `level:1.1`, tier `cadet`, mode `campaign`, kind `best`, with `updatedAt` of `2026-10-12T20:00:00.000Z` and `rev` 0
- **THEN** the result is ok, not migrated, and `v` is 1

#### Scenario: Best and recent are the kept kinds

- **WHEN** kind is `best` or `recent`
- **THEN** the entry is accepted

#### Scenario: A duplicate run or an unknown kind is invalid

- **WHEN** two entries share one run id, or kind is `ghost`
- **THEN** the result is invalid

### Requirement: Every shipped example parses as the latest version

A caller SHALL parse each shipped version 1 example of profile, settings, progress, run log, and run index as that document's latest version.

#### Scenario: The shipped examples migrate and validate

- **WHEN** the caller parses the shipped example of each of those five documents
- **THEN** each result is ok, not migrated, and `v` is 1
