# Spec Delta

## REMOVED Requirements

### Requirement: An input applies at the current step

**Reason**: The stand-in applied inputs against a per-step target. Waiting lanes apply an input against the active note.
**Migration**: `waiting-lanes` starts at step 0, advances by integer steps, and applies an input at the current step.

### Requirement: A key-down matches the stand-in target

**Reason**: The stand-in matched code points 97, 98, and 99. A waiting-lanes key-down matches the active note.
**Migration**: `waiting-lanes` emits Hit or Error from that note. A key-up still adds no event. Shift flags still leave the match unchanged.

### Requirement: The seed fixes the length and the targets

**Reason**: The stand-in horizon and the `stand-in` fork are retired. Level length comes from the phase durations, and notes come from the level units.
**Migration**: `waiting-lanes` draws on the `waiting-lanes` fork. Shipped levels 0.1 and 1.1 end at step 5999.

### Requirement: Finishing reports LevelEnded and the stand-in summary

**Reason**: The stand-in summary used hit count for accuracy and score, and stored net WPM as 0.
**Migration**: `waiting-lanes` emits LevelEnded at the level's last step. Accuracy is Integrity as a fraction, net WPM is Velocity, and score, stars, and medals stay 0, 0, and empty.

### Requirement: Steps only move forward

**Reason**: The stand-in run is removed. The step rule moves with the level runtime.
**Migration**: `waiting-lanes` rejects an advance that is not a greater non-negative safe integer.

### Requirement: Recording writes a version 1 run log

**Reason**: Recording no longer re-simulates a list of inputs the caller already has.
**Migration**: `waiting-lanes` appends each input as it is applied and returns a version 1 log on finish. The engine version stays `0.0.0`. Deltas stay the same.

### Requirement: A record the schema rejects is refused

**Reason**: The batch recorder is removed.
**Migration**: `waiting-lanes` throws RangeError for an identity, character, or flags the version 1 log cannot store, and returns no log.

### Requirement: Replay reproduces the events and the summary

**Reason**: Replay no longer runs the stand-in.
**Migration**: `waiting-lanes` replays the live log through the same level and tuning. The events and the summary match the live run, including a scripted level 1.1 run and arbitrary seeds and input sequences.

### Requirement: Replay recomputes the summary

**Reason**: The recomputed summary is no longer the stand-in summary.
**Migration**: `waiting-lanes` recomputes the summary from the seed, the inputs, the level, and the tuning. Content version is stored and is not simulated.

### Requirement: Replay runs only major version 0

**Reason**: The stand-in runtime is removed. The major-version rule moves with replay.
**Migration**: `waiting-lanes` replays engine version `0.0.0` and throws RangeError for any other major.
