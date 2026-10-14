# Spec Delta

## MODIFIED Requirements

### Requirement: Zone 0 completes after an error

A zone 0 run SHALL emit LevelEnded at its last step after a wrong key. The summary stars SHALL be 0 and the score SHALL be 250. The result SHALL name no missed bar.

#### Scenario: A wrong key on level 0.1 still completes

- **WHEN** the caller applies a key-down of j with flags 0 at step 0 of a shipped level 0.1 run with seed `signalfire` and the shipped zone 0, and then finishes
- **THEN** the events are an Error at step 0 and LevelEnded at step 5999, the summary stars are 0, the summary score is 250, and the result names no missed bar

### Requirement: The summary is Integrity and Velocity

The summary SHALL set accuracy to Integrity divided by 100, or to 1 when there is no first attempt, and net WPM to Velocity. Score SHALL be 10 points for each Hit plus 250 for LevelEnded. Stars SHALL be the award for the zone the caller passed. Medals SHALL be empty. The result SHALL name any missed 1-star bar. The stored summary SHALL contain accuracy, net WPM, score, stars, and medals.

#### Scenario: One hit and a later error

- **WHEN** the caller finishes a shipped level 1.1 run with seed `signalfire` and the shipped zone 1, a key-down of f with flags 0 at step 0, and a key-down of j with flags 0 at step 120
- **THEN** the events are a Hit at step 0, an Error at step 120, and LevelEnded at step 5999, the summary has accuracy 0.5, net WPM 12, score 260, stars 0, and no medals, and the only missed bar is Integrity, measured 50 percent, required 92 percent, shortfall 42 percentage points

#### Scenario: No key-down scores nothing

- **WHEN** the caller finishes a shipped level 1.1 run with seed `signalfire`, the shipped zone 1, and no inputs
- **THEN** the summary has accuracy 1, net WPM 0, score 250, stars 0, and no medals, and the only missed bar is Velocity, measured 0 WPM, required 6 WPM, shortfall 6 WPM

### Requirement: The live run records inputs as they arrive

Each applied input SHALL join the run's input list before the call returns, in apply order. Finishing SHALL return a version 1 run log of those inputs as step deltas, with engine version `0.0.0`, the run's seed and summary, and the identity fields the caller supplied.

#### Scenario: Inputs are listed before the level ends

- **WHEN** the caller applies a key-down of f with flags 0 at step 0 and a key-up of f with flags 1 at step 2 on a shipped level 1.1 run with seed `signalfire`, and has not finished
- **THEN** the run's inputs are that key-down at step 0 and that key-up at step 2

#### Scenario: Steps are stored as deltas

- **WHEN** the caller finishes a shipped level 1.1 run with seed `signalfire` and the shipped zone 1, a key-down of f with flags 0 at step 0, and a key-up of f with flags 1 at step 2, with run id `01AFQCG20004HMASW9NF6YY41J`, level `level:1.1`, tier `cadet`, mode `campaign`, content version `demo`, both instants `2026-10-12T20:00:00.000Z`, and rev 0
- **THEN** the log parses as version 1, its engine version is `0.0.0`, its inputs are `[0, 102, 0]` and `[2, 102, 1]`, and its summary has accuracy 1, net WPM 0, score 260, stars 0, and no medals

#### Scenario: Two inputs at one step keep a zero delta

- **WHEN** the caller finishes a shipped level 1.1 run with seed `signalfire`, a key-down of f at step 3, and a key-down of j at step 3, both with flags 0, with run id `01AFQCG20004HMASW9NF6YY41J`, level `level:1.1`, tier `cadet`, mode `campaign`, content version `demo`, both instants `2026-10-12T20:00:00.000Z`, and rev 0
- **THEN** the log's inputs are `[3, 102, 0]` and `[0, 106, 0]`

#### Scenario: The same play twice is the same log

- **WHEN** the caller plays the same level, zone, tuning, seed, inputs, and identity twice and finishes both runs
- **THEN** the two logs are deeply equal

### Requirement: Replay reproduces the events and the summary

Replaying a version 1 log whose engine version has major 0 SHALL play the caller-supplied level, zone, and tuning from that log's seed and inputs. The replayed events, summary, and missed-bar report SHALL equal the live finish that recorded the log.

#### Scenario: A scripted 1.1 run replays

- **WHEN** the caller plays shipped level 1.1 with seed `signalfire`, the shipped zone 1, a key-down of f with flags 0 at step 0, and a key-down of j with flags 0 at step 120, finishes, and replays that log with the same level, zone, and tuning
- **THEN** the replayed events are a Hit at step 0, an Error at step 120, and LevelEnded at step 5999, the replayed summary equals the summary on the log, and the replayed missed-bar report equals the live report

#### Scenario: Playing matches the replay

- **WHEN** the caller plays shipped level 1.1 with seed `signalfire`, the shipped zone 1, a key-down of f with flags 0 at step 0, and a key-down of j with flags 0 at step 120, finishes, and replays that log with the same level, zone, and tuning
- **THEN** the played events equal the replayed events, the played summary equals the replayed summary, and the played missed-bar report equals the replayed report

#### Scenario: An arbitrary seed and input list replay

- **WHEN** the caller plays either shipped level with that level's shipped zone, an arbitrary seed, and an arbitrary list of inputs whose steps are non-decreasing safe integers inside the level, whose code points are valid, and whose flags are integers from 0 through 7, finishes, and replays that log with the same level, zone, and tuning
- **THEN** the replayed events equal the events emitted while playing, the replayed summary equals the summary stored on the log, and the replayed missed-bar report equals the live report

### Requirement: Replay recomputes the summary

The replayed summary and missed-bar report SHALL be what the level computes from the seed, the inputs, the level, the tuning, and the zone. The stored content version SHALL be kept and SHALL leave the replay unchanged.

#### Scenario: A changed stored score does not change the replay

- **WHEN** the caller plays shipped level 1.1 with seed `signalfire`, the shipped zone 1, and a key-down of f with flags 0 at step 0, finishes, sets the stored score to 9, and replays the log with the same level, zone, and tuning
- **THEN** the replayed score is 260

#### Scenario: Content version is stored and not simulated

- **WHEN** the caller plays the same seed and inputs twice, with the same shipped zone and with content versions `demo` and `other`, and replays both logs
- **THEN** the two logs store those content versions, and the two replays have equal events, equal summaries, and equal missed-bar reports

## ADDED Requirements

### Requirement: The zone matches the level

The caller SHALL throw RangeError when the zone id is not the level's zone id, and SHALL return no log and no events.

#### Scenario: Zone 0 with level 1.1 is rejected

- **WHEN** the caller starts shipped level 1.1 with the shipped zone 0
- **THEN** the call throws RangeError and returns no log

#### Scenario: Replay with the other zone is rejected

- **WHEN** the caller finishes a shipped level 1.1 run with the shipped zone 1 and then replays that log with the shipped zone 0
- **THEN** the replay throws RangeError and returns no events
