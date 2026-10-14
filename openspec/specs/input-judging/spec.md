# input-judging Specification

## Purpose

Judges each key-down against the active character, emits Hit or Error, and computes Integrity and Velocity from that run's keystrokes.

## Requirements

### Requirement: A matching key-down is a hit

A key-down whose character equals the active character SHALL emit Hit at that keystroke's step and SHALL make the next character in the sequence active. The first character of the sequence SHALL be active before any keystroke.

#### Scenario: f against f is a hit

- **WHEN** the sequence is f, j and the caller applies a key-down of f at step 0
- **THEN** the event is a Hit at step 0, the active character is j, Integrity is 100, and Velocity is 0

#### Scenario: The last character ends the sequence

- **WHEN** the sequence is f and the caller applies a key-down of f at step 4
- **THEN** the event is a Hit at step 4 and no character is active

#### Scenario: Two matches at one step both hit

- **WHEN** the sequence is f, j and the caller applies a key-down of f at step 3 and a key-down of j at step 3
- **THEN** the events are a Hit at step 3 and a Hit at step 3, no character is active, and Integrity is 100

#### Scenario: Space is a character

- **WHEN** the sequence is a space and the caller applies a key-down of space at step 0
- **THEN** the event is a Hit at step 0 and no character is active

### Requirement: A wrong key is an error and the note stays

A key-down whose character differs from the active character SHALL emit Error at that step and SHALL leave that same character active.

#### Scenario: j against f is an error

- **WHEN** the sequence is f and the caller applies a key-down of j at step 0
- **THEN** the event is an Error at step 0, the active character is f, Integrity is 0, and Velocity is 0

### Requirement: Integrity counts the first attempt only

Integrity SHALL be 100 times the number of correct first attempts divided by the number of first attempts, and SHALL be 100 when there are no first attempts. The first key-down judged against a character is that character's only first attempt. A matching first attempt is correct. A later key-down against that same character SHALL leave both first-attempt counts unchanged.

#### Scenario: No key-down scores 100

- **WHEN** the sequence is f and the caller applies no keystroke
- **THEN** Integrity is 100 and Velocity is 0

#### Scenario: An error then a hit stays an error

- **WHEN** the sequence is f, j and the caller applies a key-down of x at step 0, a key-down of f at step 120, and a key-down of j at step 240
- **THEN** the events are an Error at step 0, a Hit at step 120, and a Hit at step 240, Integrity is 0 after the error and after the first hit, Integrity is 50 after the second hit, and Velocity is 12

#### Scenario: Only correct keys score 100

- **WHEN** the sequence is f, j, space and the caller applies a key-down of each character in order at steps 0, 120, and 240
- **THEN** Integrity is 100 and Velocity is 18

### Requirement: Repeated errors on one character count once

Each wrong key-down SHALL emit Error. After the first attempt at a character, another wrong key-down at that character SHALL leave the first-attempt counts and Integrity unchanged.

#### Scenario: Two errors then a hit

- **WHEN** the sequence is f and the caller applies a key-down of j at step 0, a key-down of k at step 120, and a key-down of f at step 240
- **THEN** the events are an Error at step 0, an Error at step 120, and a Hit at step 240, the first-attempt total is 1 after each of those key-downs, Integrity is 0 after each of them, and Velocity is 6

### Requirement: A key-up is not judged

A key-up SHALL emit no event, SHALL leave the active character unchanged, and SHALL leave Integrity, Velocity, and the first-attempt counts unchanged. A key-up SHALL not start or extend the span used for Velocity.

#### Scenario: Releasing the active character does nothing

- **WHEN** the sequence is f and the caller applies a key-up of f at step 0
- **THEN** no event is emitted, the active character is f, Integrity is 100, and Velocity is 0

#### Scenario: A key-up before the first key-down does not start time

- **WHEN** the sequence is f and the caller applies a key-up of f at step 0 and a key-down of f at step 120
- **THEN** the only event is a Hit at step 120 and Velocity is 0

#### Scenario: A key-up after the last key-down does not extend time

- **WHEN** the sequence is f, j and the caller applies a key-down of f at step 0, a key-down of j at step 120, and a key-up of j at step 480
- **THEN** the events are a Hit at step 0 and a Hit at step 120, and Velocity is 24

### Requirement: The match compares characters

The judgment SHALL compare the typed character with the active character. Shift side left, right, or none SHALL leave that result unchanged. The physical key SHALL leave that result unchanged.

#### Scenario: The same character with left Shift is a hit

- **WHEN** the sequence is f and the caller applies a key-down of f at step 0 with Shift side left and physical key KeyF
- **THEN** the event is a Hit at step 0

#### Scenario: A different physical key with the same character is a hit

- **WHEN** the sequence is f and the caller applies a key-down of f at step 0 with Shift side none and physical key KeyJ
- **THEN** the event is a Hit at step 0

#### Scenario: A capital does not match the lowercase character

- **WHEN** the sequence is f and the caller applies a key-down of F at step 0 with Shift side right and physical key KeyF
- **THEN** the event is an Error at step 0 and the active character is f

### Requirement: No active character means no judgment

A key-down while no character is active SHALL emit no event and SHALL leave Integrity, Velocity, and the first-attempt counts unchanged.

#### Scenario: An extra key after the sequence

- **WHEN** the sequence is f and the caller applies a key-down of f at step 0 and a key-down of j at step 120
- **THEN** the only event is a Hit at step 0, Integrity is 100, and Velocity is 0

#### Scenario: An empty sequence accepts no judgment

- **WHEN** the sequence is empty and the caller applies a key-down of f at step 0
- **THEN** no event is emitted, Integrity is 100, and Velocity is 0

### Requirement: Velocity divides correct characters by active minutes

Velocity, in WPM, SHALL be (correct characters ÷ 5) ÷ active minutes, and SHALL be 0 when active minutes is 0. Each hit SHALL add one correct character. Active time SHALL run from the first judged key-down to the last. A gap between consecutive judged key-downs that is longer than 3 seconds SHALL be excluded in full. A gap of 3 seconds SHALL stay included. One step SHALL be 1/120 second. Active minutes SHALL be that active time in minutes.

#### Scenario: Five hits in four seconds score 15

- **WHEN** the sequence is f, f, f, f, f and the caller applies a key-down of f at steps 0, 120, 240, 360, and 480
- **THEN** Integrity is 100 and Velocity is 15

#### Scenario: A three-second gap stays in the time

- **WHEN** the sequence is f, j and the caller applies a key-down of f at step 0 and a key-down of j at step 360
- **THEN** Integrity is 100 and Velocity is 8

#### Scenario: A longer gap is excluded and the rest of the run remains

- **WHEN** the sequence is f, j, f and the caller applies a key-down of f at step 0, a key-down of j at step 361, and a key-down of f at step 481
- **THEN** Integrity is 100 and Velocity is 36

#### Scenario: Excluding the whole span scores 0

- **WHEN** the sequence is f, j and the caller applies a key-down of f at step 0 and a key-down of j at step 361
- **THEN** Integrity is 100 and Velocity is 0

### Requirement: Integrity stays within 0 through 100

For any character sequence and any list of keystrokes with non-decreasing steps, Integrity SHALL be a number from 0 through 100 inclusive. When every judged key-down matches the character that is active for it, Integrity SHALL be 100.

#### Scenario: Generated keystrokes stay in range

- **WHEN** the caller judges an arbitrary character sequence with an arbitrary list of key-downs and key-ups whose steps are non-decreasing
- **THEN** Integrity is from 0 through 100 inclusive

#### Scenario: A generated run of only correct keys scores 100

- **WHEN** the caller judges an arbitrary character sequence and applies a key-down of each of its characters in order, and may apply key-ups at those same steps
- **THEN** Integrity is 100

### Requirement: A bad keystroke is rejected

A keystroke whose step is earlier than the previous keystroke on that judge, or whose character is not a Unicode scalar value, SHALL throw RangeError and SHALL leave the active character, the emitted events, and both measures unchanged.

#### Scenario: An earlier step throws

- **WHEN** the sequence is f, j and the caller has applied a key-down of f at step 2, then applies a key-down of j at step 1
- **THEN** the call throws RangeError, the active character is j, and the only event is the Hit at step 2

#### Scenario: A surrogate code point throws

- **WHEN** the sequence is f and the caller applies a key-down of code point 55296 at step 0
- **THEN** the call throws RangeError, the active character is f, and no event is emitted
