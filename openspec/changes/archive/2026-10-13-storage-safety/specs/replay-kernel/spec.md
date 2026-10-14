# Spec Delta

## MODIFIED Requirements

### Requirement: Recording writes a version 1 run log

Recording SHALL take a seed, an input list, and the caller's identity fields, and SHALL return a version 1 run log. The log's engine version SHALL be `0.0.0`. Its seed, inputs, and summary SHALL be that run's. Every other field SHALL be the value the caller supplied. Input steps SHALL be stored as deltas: the first delta is the first absolute step, and each later delta is the gap from the previous step.

#### Scenario: The same record twice is the same log

- **WHEN** the caller records the same seed, inputs, and identity twice
- **THEN** the two logs are deeply equal

#### Scenario: Steps are stored as deltas

- **WHEN** the caller records seed `signalfire`, a key-down of code point 98 with flags 0 at step 0, and a key-up of code point 98 with flags 1 at step 2, with run id `01AFQCG20004HMASW9NF6YY41J`, level `level:1.1`, tier `cadet`, mode `campaign`, content version `demo`, both instants `2026-10-12T20:00:00.000Z`, and rev 0
- **THEN** the log parses as version 1, its engine version is `0.0.0`, its inputs are `[0, 98, 0]` and `[2, 98, 1]`, and its summary has accuracy 1, net WPM 0, score 1, stars 0, and no medals

#### Scenario: Two inputs at one step keep a zero delta

- **WHEN** the caller records a seed `signalfire` run with a key-down of code point 97 at step 3 and a key-down of code point 98 at step 3, both with flags 0
- **THEN** the log's inputs are `[3, 97, 0]` and `[0, 98, 0]`

### Requirement: Replay reproduces the events and the summary

Replaying a version 1 log whose engine version has major 0 SHALL run the stand-in from that log's seed and inputs. The replayed events and summary SHALL equal the events and summary produced by recording that run. Stepping the same seed and inputs to the end SHALL equal that recording.

#### Scenario: A recorded run replays

- **WHEN** the caller records seed `signalfire` with a key-down of code point 98 with flags 0 at step 0 and a key-down of code point 97 with flags 0 at step 1, then replays that log
- **THEN** the replayed events are a Hit at step 0, an Error at step 1, and LevelEnded at step 7, and the replayed summary equals the summary on the log

#### Scenario: Stepping matches the recording

- **WHEN** the caller records seed `signalfire` with a key-down of code point 98 with flags 0 at step 0 and a key-down of code point 97 with flags 0 at step 1, and also advances a run with that seed, applies those inputs at their steps, and finishes
- **THEN** the stepped events equal the recorded events and the stepped summary equals the recorded summary

#### Scenario: An arbitrary seed and input list replay

- **WHEN** the caller records a run with an arbitrary seed and an arbitrary list of inputs whose steps are non-decreasing safe integers, whose code points are valid, and whose flags are integers from 0 through 7, then replays that log
- **THEN** the replayed events equal the events emitted while recording and the replayed summary equals the summary stored on the log

## REMOVED Requirements

### Requirement: Replay runs only engine version 0-stand-in

**Reason**: Horizontal 05 requires a matching major. The stand-in string `0-stand-in` is not a major.minor.patch version.
**Migration**: Replay accepts a log whose major is 0, including `0.0.0`, and refuses any other major.

## ADDED Requirements

### Requirement: Replay runs only major version 0

Replay SHALL throw RangeError when the log's engine version has a major other than 0, and SHALL return no events. Replay SHALL run a log whose engine version is `0.0.0`.

#### Scenario: Engine version 0.0.0 replays

- **WHEN** the caller replays a version 1 log that this kernel recorded
- **THEN** the replay returns events and the log's engine version is `0.0.0`

#### Scenario: A different major is refused

- **WHEN** the caller replays a version 1 log that this kernel recorded after replacing its engine version with `1.0.0`
- **THEN** the call throws RangeError and returns no events
