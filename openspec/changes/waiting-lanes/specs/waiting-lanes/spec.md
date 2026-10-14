# Spec Delta

## Purpose

Plays levels 0.1 and 1.1 as waiting lanes: notes come from the level and the seed, wait at the hit line, and the live run records a log that replays to the same events and summary.

## ADDED Requirements

### Requirement: Notes come from the level and the seed

The run SHALL spawn each note from the shipped level's phase units and the run seed. It SHALL pick a new unit only when the previous unit is exhausted, from the phase whose step window contains that spawn step. The note's character SHALL be the next character of the picked unit.

#### Scenario: Seed signalfire starts level 1.1 on f

- **WHEN** the caller starts shipped level 1.1 with seed `signalfire` and the shipped waiting-lanes tuning, and applies no input
- **THEN** the active note's character is f, code point 102

#### Scenario: Three hits on f open the next unit

- **WHEN** the caller hits f three times at step 0 on shipped level 1.1 with seed `signalfire`
- **THEN** the events are three Hits at step 0 and the active note's character is j, code point 106

#### Scenario: Seed a starts level 1.1 on j

- **WHEN** the caller starts shipped level 1.1 with seed `a` and the shipped waiting-lanes tuning, and applies no input
- **THEN** the active note's character is j, code point 106

#### Scenario: Level 0.1's build unit starts on j

- **WHEN** the caller hits f at step 960, f at step 961, and f at step 962 on shipped level 0.1 with seed `signalfire`
- **THEN** the active note's character is j, code point 106

#### Scenario: Level 1.1's build unit continues to space

- **WHEN** the caller hits f at step 960, f at step 961, and f twice at step 962 on shipped level 1.1 with seed `signalfire`
- **THEN** the active note's character is space, code point 32

### Requirement: Every note is an allowed key

Each spawned note's character SHALL be one of the level's allowed keys.

#### Scenario: Generated notes stay on f, j, and space

- **WHEN** the caller plays either shipped level with any seed and hits each active note
- **THEN** each of those characters is one of that level's allowed keys

### Requirement: A note waits at the hit line

A note SHALL approach until the current step reaches its spawn step plus `approachSeconds` times 120, and SHALL wait from that step on. A matching key-down SHALL emit Hit while the note is approaching and while it is waiting. Reaching the waiting step SHALL leave that note active and SHALL add no event.

#### Scenario: Step 719 is still approaching

- **WHEN** the caller advances a shipped level 1.1 run with seed `signalfire` to step 719 and applies no input
- **THEN** the active note is f, it is approaching, and the outbox drains empty

#### Scenario: Step 720 waits on the same note

- **WHEN** the caller advances a shipped level 1.1 run with seed `signalfire` to step 720 and applies no input
- **THEN** the active note is f, it is waiting, and the outbox drains empty

#### Scenario: A hit before the line counts

- **WHEN** the caller applies a key-down of f with flags 0 at step 0 of a shipped level 1.1 run with seed `signalfire`
- **THEN** the first event is a Hit at step 0

#### Scenario: A hit while waiting counts

- **WHEN** the caller applies a key-down of f with flags 0 at step 720 of a shipped level 1.1 run with seed `signalfire`
- **THEN** the first event is a Hit at step 720

### Requirement: The queue stays at the tuning depth

While the level is playing, the number of unhit notes SHALL equal the tuning's queue depth. A hit SHALL spawn the next note at the hit's step when the queue is short.

#### Scenario: The shipped tuning shows one note

- **WHEN** the caller starts shipped level 1.1 with seed `signalfire` and the shipped waiting-lanes tuning, and applies no input
- **THEN** one note is unhit

#### Scenario: A hit refills the queue at that step

- **WHEN** the caller hits f at step 0 on shipped level 1.1 with seed `signalfire`
- **THEN** one note is unhit and its character is f, code point 102

### Requirement: The active note is judged

A key-down SHALL emit Hit when its character equals the active note, and the next note SHALL then be active. A different character SHALL emit Error and SHALL leave that note active. A key-up SHALL add no event. Shift flags SHALL leave the match unchanged.

#### Scenario: j against f is an error

- **WHEN** the caller applies a key-down of j with flags 0 at step 0 of a shipped level 1.1 run with seed `signalfire`
- **THEN** the first event is an Error at step 0 and the active note's character is f

#### Scenario: A key-up adds no event

- **WHEN** the caller finishes a shipped level 1.1 run with seed `signalfire` whose only input is a key-up of f with flags 1 at step 0
- **THEN** the only event is LevelEnded at step 5999

#### Scenario: ShiftLeft leaves a hit unchanged

- **WHEN** the caller applies a key-down of f with flags 2 at step 0 of a shipped level 1.1 run with seed `signalfire`
- **THEN** the first event is a Hit at step 0

### Requirement: The level ends at its last step

Finishing SHALL emit LevelEnded at the last step of the level. For shipped levels 0.1 and 1.1 that step SHALL be 5999. An input at that step SHALL be judged, and LevelEnded SHALL follow it. A second finish SHALL throw RangeError and SHALL add no event. An apply after finish SHALL throw RangeError and SHALL leave the input list unchanged.

#### Scenario: An empty run ends at step 5999

- **WHEN** the caller finishes a shipped level 1.1 run with seed `signalfire` and no inputs
- **THEN** the only event is LevelEnded at step 5999

#### Scenario: A hit on the last step precedes LevelEnded

- **WHEN** the caller applies a key-down of f with flags 0 at step 5999 of a shipped level 1.1 run with seed `signalfire` and then finishes
- **THEN** the events are a Hit at step 5999 and LevelEnded at step 5999

#### Scenario: Advancing past the end stops on the last step

- **WHEN** the caller advances a shipped level 1.1 run with seed `signalfire` and no inputs to step 6000
- **THEN** the current step is 5999 and the only event is LevelEnded at step 5999

#### Scenario: A second finish is rejected

- **WHEN** the caller finishes a shipped level 1.1 run with seed `signalfire` and no inputs, drains the outbox, and finishes that run again
- **THEN** the second call throws RangeError and the outbox drains empty

#### Scenario: An apply after the end is rejected

- **WHEN** the caller finishes a shipped level 1.1 run with seed `signalfire` and no inputs, and then applies a key-down of f with flags 0
- **THEN** the call throws RangeError and the input list stays empty

### Requirement: Zone 0 completes after an error

A zone 0 run SHALL emit LevelEnded at its last step after a wrong key, and the summary stars SHALL be 0.

#### Scenario: A wrong key on level 0.1 still completes

- **WHEN** the caller applies a key-down of j with flags 0 at step 0 of a shipped level 0.1 run with seed `signalfire` and then finishes
- **THEN** the events are an Error at step 0 and LevelEnded at step 5999, and the summary stars are 0

### Requirement: The summary is Integrity and Velocity

The summary SHALL set accuracy to Integrity divided by 100, or to 1 when there is no first attempt, and net WPM to Velocity. Score SHALL be 0, stars SHALL be 0, and medals SHALL be empty.

#### Scenario: One hit and a later error

- **WHEN** the caller finishes a shipped level 1.1 run with seed `signalfire`, a key-down of f with flags 0 at step 0, and a key-down of j with flags 0 at step 120
- **THEN** the events are a Hit at step 0, an Error at step 120, and LevelEnded at step 5999, and the summary has accuracy 0.5, net WPM 12, score 0, stars 0, and no medals

#### Scenario: No key-down scores nothing

- **WHEN** the caller finishes a shipped level 1.1 run with seed `signalfire` and no inputs
- **THEN** the summary has accuracy 1, net WPM 0, score 0, stars 0, and no medals

### Requirement: The live run records inputs as they arrive

Each applied input SHALL join the run's input list before the call returns, in apply order. Finishing SHALL return a version 1 run log of those inputs as step deltas, with engine version `0.0.0`, the run's seed and summary, and the identity fields the caller supplied.

#### Scenario: Inputs are listed before the level ends

- **WHEN** the caller applies a key-down of f with flags 0 at step 0 and a key-up of f with flags 1 at step 2 on a shipped level 1.1 run with seed `signalfire`, and has not finished
- **THEN** the run's inputs are that key-down at step 0 and that key-up at step 2

#### Scenario: Steps are stored as deltas

- **WHEN** the caller finishes a shipped level 1.1 run with seed `signalfire`, a key-down of f with flags 0 at step 0, and a key-up of f with flags 1 at step 2, with run id `01AFQCG20004HMASW9NF6YY41J`, level `level:1.1`, tier `cadet`, mode `campaign`, content version `demo`, both instants `2026-10-12T20:00:00.000Z`, and rev 0
- **THEN** the log parses as version 1, its engine version is `0.0.0`, its inputs are `[0, 102, 0]` and `[2, 102, 1]`, and its summary has accuracy 1, net WPM 0, score 0, stars 0, and no medals

#### Scenario: Two inputs at one step keep a zero delta

- **WHEN** the caller finishes a shipped level 1.1 run with seed `signalfire`, a key-down of f at step 3, and a key-down of j at step 3, both with flags 0, with run id `01AFQCG20004HMASW9NF6YY41J`, level `level:1.1`, tier `cadet`, mode `campaign`, content version `demo`, both instants `2026-10-12T20:00:00.000Z`, and rev 0
- **THEN** the log's inputs are `[3, 102, 0]` and `[0, 106, 0]`

#### Scenario: The same play twice is the same log

- **WHEN** the caller plays the same level, tuning, seed, inputs, and identity twice and finishes both runs
- **THEN** the two logs are deeply equal

### Requirement: A log the schema rejects is refused

The run SHALL throw RangeError when the identity, the character, or the flags cannot be stored in a version 1 run log, and SHALL return no log. An input that throws SHALL leave the input list unchanged.

#### Scenario: A bad level id throws

- **WHEN** the caller starts shipped level 1.1 with level id `level:1` and otherwise usable identity fields
- **THEN** the call throws RangeError and returns no log

#### Scenario: Flags above 7 throw

- **WHEN** the caller applies a key-down at step 0 with flags 8
- **THEN** the call throws RangeError and the input list is empty

#### Scenario: A surrogate code point throws

- **WHEN** the caller applies code point 55296 at step 0 with flags 0
- **THEN** the call throws RangeError and the input list is empty

### Requirement: Steps only move forward

The caller SHALL advance the current step to a greater step, or leave it where it is. An advance that is not a greater non-negative safe integer SHALL throw RangeError and leave the current step unchanged.

#### Scenario: Advancing backward throws

- **WHEN** a shipped level 1.1 run with seed `signalfire` is at step 2 and the caller advances it to step 1
- **THEN** the call throws RangeError and the current step is still 2

#### Scenario: Advancing to the current step changes nothing

- **WHEN** a shipped level 1.1 run with seed `signalfire` is at step 2 and the caller advances it to step 2
- **THEN** the current step is 2 and the outbox drains empty

#### Scenario: A negative step throws

- **WHEN** the caller advances a new shipped level 1.1 run to step -1
- **THEN** the call throws RangeError and the current step is 0

#### Scenario: A fractional step throws

- **WHEN** the caller advances a new shipped level 1.1 run to step 1.5
- **THEN** the call throws RangeError and the current step is 0

### Requirement: Replay reproduces the events and the summary

Replaying a version 1 log whose engine version has major 0 SHALL play the caller-supplied level and tuning from that log's seed and inputs. The replayed events and summary SHALL equal the live run that recorded the log.

#### Scenario: A scripted 1.1 run replays

- **WHEN** the caller plays shipped level 1.1 with seed `signalfire`, a key-down of f with flags 0 at step 0, and a key-down of j with flags 0 at step 120, finishes, and replays that log with the same level and tuning
- **THEN** the replayed events are a Hit at step 0, an Error at step 120, and LevelEnded at step 5999, and the replayed summary equals the summary on the log

#### Scenario: Playing matches the replay

- **WHEN** the caller plays shipped level 1.1 with seed `signalfire`, a key-down of f with flags 0 at step 0, and a key-down of j with flags 0 at step 120, finishes, and replays that log with the same level and tuning
- **THEN** the played events equal the replayed events and the played summary equals the replayed summary

#### Scenario: An arbitrary seed and input list replay

- **WHEN** the caller plays either shipped level with an arbitrary seed and an arbitrary list of inputs whose steps are non-decreasing safe integers inside the level, whose code points are valid, and whose flags are integers from 0 through 7, finishes, and replays that log
- **THEN** the replayed events equal the events emitted while playing and the replayed summary equals the summary stored on the log

### Requirement: Replay recomputes the summary

The replayed summary SHALL be the summary the level computes from the seed, the inputs, the level, and the tuning. The stored content version SHALL be kept and SHALL leave the replay unchanged.

#### Scenario: A changed stored score does not change the replay

- **WHEN** the caller plays shipped level 1.1 with seed `signalfire` and a key-down of f with flags 0 at step 0, finishes, sets the stored score to 9, and replays the log
- **THEN** the replayed score is 0

#### Scenario: Content version is stored and not simulated

- **WHEN** the caller plays the same seed and inputs twice, with content versions `demo` and `other`, and replays both logs
- **THEN** the two logs store those content versions and the two replays have equal events and equal summaries

### Requirement: Replay runs only major version 0

Replay SHALL throw RangeError when the log's engine version has a major other than 0, and SHALL return no events. Replay SHALL run a log whose engine version is `0.0.0`.

#### Scenario: Engine version 0.0.0 replays

- **WHEN** the caller replays a version 1 log that this runtime recorded
- **THEN** the replay returns events and the log's engine version is `0.0.0`

#### Scenario: A different major is refused

- **WHEN** the caller replays a version 1 log that this runtime recorded after replacing its engine version with `1.0.0`
- **THEN** the call throws RangeError and returns no events
