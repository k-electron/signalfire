# content-pipeline Specification

## Purpose

Validates bundled zones, levels, and tuning, gives each level a stable contentVersion, and exposes levels 0.1 and 1.1 to the app.

## Requirements

### Requirement: A zone has an identity and a key set

A caller SHALL accept a zone only when it has a zone id, a non-empty sector name, a machine id, and a non-empty set of keys, each key a single character.

#### Scenario: Home Row Station's shape

- **WHEN** the caller checks a zone `zone:0` named `Home Row Station` with machine `machine:skiff` and keys `f`, `j`, and space
- **THEN** the zone is accepted

#### Scenario: A zone identity is unusable

- **WHEN** the caller checks a zone whose id is `zone:00`, whose name is empty, whose machine is `skiff`, or whose keys include `fj` or a repeated `f`
- **THEN** each zone is rejected

### Requirement: Unknown content fields are rejected

A caller SHALL reject a zone, a level, or a tuning value that contains a field the schema does not name.

#### Scenario: An extra field

- **WHEN** a zone includes `gate`, a level includes `script`, or a tuning value includes `volume`
- **THEN** each value is rejected

### Requirement: Star bars increase

A caller SHALL accept star bars only when the 1-star, 2-star, and 3-star bars each have an integer accuracy percent from 91 through 99 and an integer WPM of at least 1, and both the accuracy percents and the WPM values strictly increase.

#### Scenario: The zone 1 curriculum bars

- **WHEN** the caller checks bars of 92% at 6 WPM, 95% at 9 WPM, and 97% at 12 WPM
- **THEN** the bars are accepted

#### Scenario: Bars that fail the order or the floor

- **WHEN** the caller checks accuracy percents 95, 95, 97, or WPM values 12, 9, 6, or a 1-star accuracy of 90, or a 3-star accuracy of 100
- **THEN** each set of bars is rejected

#### Scenario: The bounds are inclusive

- **WHEN** the caller checks bars of 91% at 1 WPM, 92% at 2 WPM, and 99% at 3 WPM
- **THEN** the bars are accepted

### Requirement: Only zone 0 omits star bars

A caller SHALL accept a loaded set only when `zone:0`, if present, omits star bars, and every other zone includes star bars.

#### Scenario: Zone 0 includes bars

- **WHEN** the set contains `zone:0` with star bars
- **THEN** the load fails

#### Scenario: Another zone omits bars

- **WHEN** the set contains `zone:1` without star bars
- **THEN** the load fails

### Requirement: A level has an identity

A caller SHALL accept a level only when it has a level id, a non-empty name, a zone id, a type of `intro` or `drill`, a tuning id, a non-empty allowed-key set, a non-empty focus-key set, a mechanic list that includes `lanes-wait`, and zero to three unique medal ids. The only mechanics a level may name are `lanes-wait` and `space-pulse`.

#### Scenario: Twin Beacons' shape

- **WHEN** the caller checks `level:0.1` named `Twin Beacons`, zone `zone:0`, type `intro`, tuning `tuning:waiting-lanes`, mechanics `lanes-wait` then `space-pulse`, and no medals
- **THEN** the level is accepted

#### Scenario: First Light's shape

- **WHEN** the caller checks `level:1.1` named `First Light`, zone `zone:1`, type `drill`, mechanics `lanes-wait`, and medals `medal:flawless`, `medal:full-clear`, and `medal:clean-reach` in that order
- **THEN** the level is accepted

#### Scenario: A level identity is unusable

- **WHEN** the id is `level:1`, the type is `words`, the mechanics omit `lanes-wait`, the mechanics include `static`, the focus keys are empty, or a medal is repeated
- **THEN** each level is rejected

### Requirement: A level has five phases

A caller SHALL accept a level only when its phases are `arrival`, `build`, `peak`, `breather`, and `finale`, in that order. Each phase SHALL have a positive integer duration in seconds and at least one non-empty unit. The durations SHALL sum to at most 240.

#### Scenario: Five short phases

- **WHEN** a level has those five phases with durations 8, 12, 12, 8, and 10, and each phase has one non-empty unit
- **THEN** the phases are accepted

#### Scenario: A phase list is unusable

- **WHEN** the finale is missing, two phases are swapped, a duration is 0 or 8.5, a unit is empty, or the durations sum to 241
- **THEN** each level is rejected

#### Scenario: A full four minutes is accepted

- **WHEN** the five durations sum to 240 and each phase has one non-empty unit
- **THEN** the phases are accepted

### Requirement: Units use unlocked keys

A caller SHALL reject a level when a unit contains a character outside that level's allowed keys, when a focus key is outside the allowed keys, or when an allowed key is outside the level's zone key set.

#### Scenario: A unit uses an unlearned key

- **WHEN** a unit contains `k` and the allowed keys are `f`, `j`, and space
- **THEN** the level is rejected

#### Scenario: Focus or allowed keys leave their set

- **WHEN** a focus key is `d` while the allowed keys are `f`, `j`, and space, or an allowed key is `a` while the zone's keys are `f`, `j`, and space
- **THEN** each level is rejected

### Requirement: A drill unit contains a focus key

A caller SHALL reject a drill level when any unit contains none of that level's focus keys.

#### Scenario: A drill unit misses the focus keys

- **WHEN** a drill level's focus keys are `f` and `j` and a unit is a single space
- **THEN** the level is rejected

#### Scenario: An intro unit without a focus key is accepted

- **WHEN** an intro level is otherwise acceptable and one of its units is a single space
- **THEN** the level is accepted

### Requirement: Tuning stays in range

A caller SHALL accept a tuning value only when it has a tuning id, an approach time from 1.5 through 6 seconds, and an integer queue depth from 1 through 6.

#### Scenario: Waiting-lane tuning

- **WHEN** the caller checks `tuning:waiting-lanes` with approach 6 and queue depth 1
- **THEN** the tuning is accepted

#### Scenario: The approach bounds are inclusive

- **WHEN** the caller checks approach 1.5 with queue depth 6, and approach 6 with queue depth 1
- **THEN** both values are accepted

#### Scenario: Tuning is out of range

- **WHEN** approach is 1.4 or 6.1, or queue depth is 0, 7, or 1.5
- **THEN** each tuning value is rejected

### Requirement: Allowed keys and focus keys are sets

A caller SHALL accept a level with its allowed keys and its focus keys each sorted in ascending code-point order. Two levels that differ only by that order SHALL have the same contentVersion. Unit order and medal order SHALL stay as authored.

#### Scenario: Keys come back sorted

- **WHEN** a level lists allowed keys as space, `j`, `f`
- **THEN** the accepted level lists them as space, `f`, `j`

#### Scenario: Key list order does not change the version

- **WHEN** two levels differ only by listing allowed keys as `f`, `j`, space and as space, `j`, `f`
- **THEN** their contentVersions are equal

#### Scenario: Unit order changes the version

- **WHEN** two levels differ only by swapping two units
- **THEN** their contentVersions differ

### Requirement: A load resolves ids

A caller SHALL reject a load when a level's zone id or tuning id is absent, or when two files share an id.

#### Scenario: A level names a missing zone

- **WHEN** a level's zone id is `zone:9` and the set has no `zone:9`
- **THEN** the load fails

#### Scenario: A level names a missing tuning id

- **WHEN** a level's tuning id is `tuning:missing` and the set has no such tuning value
- **THEN** the load fails

#### Scenario: Two levels share an id

- **WHEN** two levels both have id `level:0.1`
- **THEN** the load fails

### Requirement: A file name carries its id

A zone file SHALL be named `<n>-<slug>.json` for id `zone:<n>`. A level file SHALL be named `<zone>-<n>-<slug>.json` for id `level:<zone>.<n>`. A tuning file SHALL be named `<slug>.json` for id `tuning:<slug>`. A slug is lowercase words separated by single hyphens. A caller SHALL reject a file whose name does not carry its id, and SHALL name that file.

#### Scenario: The file name disagrees with the id

- **WHEN** a file named `0-1-twin-beacons.json` contains id `level:1.1`
- **THEN** the load fails and names that file

#### Scenario: A slug with a leading zero or an empty word

- **WHEN** a zone file is named `01-station.json` or `0-.json`
- **THEN** the load fails

### Requirement: Non-JSON files are not content

A caller SHALL load the JSON files in the `zones`, `levels`, and `tuning` directories. A non-JSON file in those directories SHALL leave a valid load successful.

#### Scenario: A markdown file beside the zones

- **WHEN** the zone directory contains a markdown file and one valid zone file, and the rest of the set is valid
- **THEN** the load succeeds and contains that zone

### Requirement: Canonical JSON ignores key order and carriage returns

A caller SHALL encode a value as JSON with object keys sorted by UTF-16 code unit, no insignificant whitespace, and array order kept. Before that encoding, each string SHALL drop a carriage return that is followed by a line feed, and SHALL replace any remaining carriage return with a line feed. The SHA-256 digest SHALL be lowercase hex of the UTF-8 bytes of that text.

#### Scenario: Object keys sort

- **WHEN** the caller canonicalizes an object whose fields were inserted as `b` then `a`, with values `1` and `x`
- **THEN** the text is `{"a":"x","b":1}`

#### Scenario: A carriage return inside a string

- **WHEN** the caller canonicalizes a string of `f`, a carriage return, a line feed, and `j`
- **THEN** the text is `"f\nj"`

#### Scenario: SHA-256 of the sorted object

- **WHEN** the caller hashes the UTF-8 bytes of `{"a":"x","b":1}`
- **THEN** the digest is `cdab067e9f3beb32d1252cfd63e492592fecbf591b0d08cadb24bb17f3864246`

#### Scenario: SHA-256 of the empty input

- **WHEN** the caller hashes the empty byte string
- **THEN** the digest is `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`

#### Scenario: Token line endings do not change the digest

- **WHEN** the caller hashes a JSON value and the same value written with object keys reordered and with carriage-return line feeds between tokens
- **THEN** the digests are equal

### Requirement: A level's contentVersion follows the level, its bars, and its tuning

A level's contentVersion SHALL be the digest of the canonical JSON object whose fields are `level` (the accepted level), `starBars` (the zone's star bars, or `null` when the zone omits them), and `tuning` (the accepted tuning value). The digest SHALL be 64 lowercase hex characters. Changing the level, the star bars, or the tuning SHALL change the digest. Changing the zone's sector name SHALL leave the digest unchanged.

#### Scenario: The same inputs repeat

- **WHEN** the caller computes a level's contentVersion twice from the same level, bars, and tuning
- **THEN** both digests are equal and each is 64 lowercase hex characters

#### Scenario: A unit edit changes the version

- **WHEN** a unit in the level changes and the bars and tuning stay the same
- **THEN** the contentVersion changes

#### Scenario: A star-bar edit changes the version

- **WHEN** the 1-star WPM changes and the level and tuning stay the same
- **THEN** the contentVersion changes

#### Scenario: A tuning edit changes the version

- **WHEN** the queue depth changes and the level and bars stay the same
- **THEN** the contentVersion changes

#### Scenario: The sector name leaves the version unchanged

- **WHEN** only the zone's sector name changes
- **THEN** the contentVersion stays the same

#### Scenario: Zone 0 hashes null bars

- **WHEN** the caller computes a contentVersion for a level whose zone omits star bars
- **THEN** the digest equals the digest of that level with `starBars` set to `null`

### Requirement: Shipped content loads

The shipped content SHALL load `zone:0`, `zone:1`, `level:0.1`, `level:1.1`, and `tuning:waiting-lanes`.

#### Scenario: Levels 0.1 and 1.1 load

- **WHEN** the caller loads the shipped content
- **THEN** `zone:0` is named `Home Row Station` on `machine:skiff` with keys `f`, `j`, and space and with no star bars, `zone:1` is named `The Drift` on `machine:skiff` with those keys and with bars 92% at 6 WPM, 95% at 9 WPM, and 97% at 12 WPM, `level:0.1` is named `Twin Beacons`, is an intro on `zone:0` with mechanics `lanes-wait` then `space-pulse`, has no medals, and has a finale unit that contains a space, `level:1.1` is named `First Light`, is a drill on `zone:1` with mechanics `lanes-wait` and medals `medal:flawless`, `medal:full-clear`, and `medal:clean-reach` in that order, every unit in both levels uses only `f`, `j`, and space, every `level:1.1` unit contains `f` or `j`, and `tuning:waiting-lanes` has approach 6 and queue depth 1

### Requirement: The app exposes levels 0.1 and 1.1

The app SHALL expose the shipped `level:0.1` and `level:1.1` as accepted levels, each with the contentVersion of that level, its zone's star bars, and its tuning.

#### Scenario: The app matches the digest

- **WHEN** the app loads its bundled campaign
- **THEN** it exposes `level:0.1` and `level:1.1`, and each contentVersion equals the digest defined for that level

### Requirement: content:check accepts the shipped tree

`pnpm content:check` with no arguments SHALL exit 0 and SHALL print one line per shipped level: the level id, a space, and that level's contentVersion.

#### Scenario: Shipped content passes

- **WHEN** `pnpm content:check` runs with no arguments
- **THEN** it exits 0 and its output contains a line `level:0.1` plus that level's contentVersion and a line `level:1.1` plus that level's contentVersion

### Requirement: content:check rejects a malformed tree

`pnpm content:check` on a directory SHALL exit non-zero when a JSON file in that directory fails the load, and SHALL print that file's name.

#### Scenario: A level file fails its schema

- **WHEN** `pnpm content:check` runs on a directory whose level file fails the level schema
- **THEN** the command exits non-zero and the output includes that file's name
