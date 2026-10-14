# replay-kernel Specification

## Purpose

Steps a stand-in run from its seed and inputs, records a version 1 run log, and replays that log to the same events and summary.

## Requirements

### Requirement: An input applies at the current step

A stand-in run SHALL start at step 0. The caller SHALL advance it by integer steps. An input SHALL be applied only at the run's current step, and events drained before that step SHALL be the same as a run that does not have that input.

#### Scenario: Arriving at a later step emits nothing

- **WHEN** the caller starts a run with seed `signalfire` and advances it to step 3 without applying an input
- **THEN** the outbox drains empty

#### Scenario: The input emits when it is applied

- **WHEN** the caller advances a seed `signalfire` run to step 3 and applies a key-down of code point 97 with flags 0
- **THEN** the drained events are one Hit at step 3

#### Scenario: Two key-downs at one step share one target

- **WHEN** the caller advances a seed `signalfire` run to step 3, applies a key-down of code point 97 with flags 0, then applies a key-down of code point 98 with flags 0
- **THEN** the drained events are a Hit at step 3 followed by an Error at step 3

### Requirement: A key-down matches the stand-in target

A key-down SHALL emit Hit when its code point equals the current step's stand-in target and Error when it does not. A key-up SHALL contribute no domain event. Shift flags SHALL leave that match unchanged.

#### Scenario: Code point 98 at step 0 is a hit

- **WHEN** the caller applies a key-down of code point 98 with flags 0 at step 0 of a seed `signalfire` run
- **THEN** the first event is a Hit at step 0

#### Scenario: Code point 97 at step 0 is an error

- **WHEN** the caller applies a key-down of code point 97 with flags 0 at step 0 of a seed `signalfire` run
- **THEN** the first event is an Error at step 0

#### Scenario: A key-up contributes no match event

- **WHEN** the caller finishes a seed `signalfire` run whose only input is a key-up of code point 98 with flags 1 at step 0
- **THEN** the only event is LevelEnded at step 7

#### Scenario: ShiftLeft leaves a hit unchanged

- **WHEN** the caller applies code point 98 with flags 2 at step 0 of a seed `signalfire` run
- **THEN** the first event is a Hit at step 0

### Requirement: The seed fixes the length and the targets

Stand-in draws SHALL come from the run seed's `stand-in` fork. The horizon SHALL be one plus an integer draw from 0 through 7. The run SHALL simulate each step from 0 up to, and not including, the greater of the horizon and one past the last input step. Each of those steps SHALL pick one target from the code points 97, 98, and 99 before its inputs are applied, including a step with no input.

#### Scenario: An empty signalfire run ends at step 7

- **WHEN** the caller finishes a seed `signalfire` run with no inputs
- **THEN** the only event is LevelEnded at step 7

#### Scenario: An empty signalfirf run ends at step 0

- **WHEN** the caller finishes a seed `signalfirf` run with no inputs
- **THEN** the only event is LevelEnded at step 0

#### Scenario: Step 1 of signalfire targets code point 99

- **WHEN** the caller applies a key-down of code point 99 with flags 0 at step 1 of a seed `signalfire` run
- **THEN** the first event is a Hit at step 1

#### Scenario: An input after the horizon extends the run

- **WHEN** the caller finishes a seed `signalfire` run whose only input is a key-down of code point 98 with flags 0 at step 9
- **THEN** the events are a Hit at step 9 and LevelEnded at step 9

### Requirement: Finishing reports LevelEnded and the stand-in summary

Finishing SHALL emit LevelEnded at the last simulated step and SHALL report the stand-in summary. Accuracy SHALL be the hit count divided by the key-down count, or 1 when there is no key-down. Net WPM SHALL be 0, score SHALL be the hit count, stars SHALL be 0, and medals SHALL be empty.

#### Scenario: One hit and one error

- **WHEN** the caller finishes a seed `signalfire` run with a key-down of code point 98 with flags 0 at step 0 and a key-down of code point 97 with flags 0 at step 1
- **THEN** the events are a Hit at step 0, an Error at step 1, and LevelEnded at step 7, and the summary has accuracy 0.5, net WPM 0, score 1, stars 0, and no medals

#### Scenario: No key-down scores nothing

- **WHEN** the caller finishes a seed `signalfire` run with no inputs
- **THEN** the summary has accuracy 1, net WPM 0, score 0, stars 0, and no medals

#### Scenario: A second finish is rejected

- **WHEN** the caller finishes a seed `signalfire` run with no inputs, drains the outbox, and finishes that run again
- **THEN** the second call throws RangeError and the outbox drains empty

### Requirement: Steps only move forward

The caller SHALL advance the current step to a greater step, or leave it where it is. An advance to an earlier step SHALL throw RangeError and leave the current step unchanged.

#### Scenario: Advancing backward throws

- **WHEN** a seed `signalfire` run is at step 2 and the caller advances it to step 1
- **THEN** the call throws RangeError and the current step is still 2

#### Scenario: Advancing to the current step changes nothing

- **WHEN** a seed `signalfire` run is at step 2 and the caller advances it to step 2
- **THEN** the current step is 2 and the outbox drains empty

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

### Requirement: A record the schema rejects is refused

Recording SHALL throw when the inputs or the identity fields cannot be stored in a version 1 run log, and SHALL return no log.

#### Scenario: A decreasing step throws

- **WHEN** the caller records an input at step 2 followed by an input at step 1
- **THEN** the call throws and returns no log

#### Scenario: Flags above 7 throw

- **WHEN** the caller records a key-down at step 0 with flags 8
- **THEN** the call throws and returns no log

#### Scenario: A surrogate code point throws

- **WHEN** the caller records code point 55296 at step 0
- **THEN** the call throws and returns no log

#### Scenario: A bad level id throws

- **WHEN** the caller records level `level:1` with otherwise usable identity fields
- **THEN** the call throws and returns no log

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

### Requirement: Replay recomputes the summary

The replayed summary SHALL be the summary the stand-in computes from the seed and the inputs.

#### Scenario: A changed stored score does not change the replay

- **WHEN** the caller records a seed `signalfire` run with a key-down of code point 98 with flags 0 at step 0, sets the stored score to 0, and replays the log
- **THEN** the replayed score is 1

#### Scenario: Content version is stored and not simulated

- **WHEN** the caller records the same seed and inputs twice, with content versions `demo` and `other`, and replays both logs
- **THEN** the two logs store those content versions and the two replays have equal events and equal summaries

### Requirement: Replay runs only major version 0

Replay SHALL throw RangeError when the log's engine version has a major other than 0, and SHALL return no events. Replay SHALL run a log whose engine version is `0.0.0`.

#### Scenario: Engine version 0.0.0 replays

- **WHEN** the caller replays a version 1 log that this kernel recorded
- **THEN** the replay returns events and the log's engine version is `0.0.0`

#### Scenario: A different major is refused

- **WHEN** the caller replays a version 1 log that this kernel recorded after replacing its engine version with `1.0.0`
- **THEN** the call throws RangeError and returns no events
