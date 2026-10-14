# core-ports-and-rng Specification

## Purpose

Core reaches time, storage, cloud, rendering, and audio through five ports, and takes every random draw from a seeded generator that repeats a seed exactly.

## Requirements

### Requirement: The clock reports the simulation step

An in-memory clock SHALL report the current simulation step as an integer, starting from the step it was given.

#### Scenario: The clock starts at a chosen step

- **WHEN** a caller creates an in-memory clock at step 4
- **THEN** the reported step is 4

#### Scenario: The caller advances the clock

- **WHEN** the clock is at step 4 and the caller advances it by 2
- **THEN** the reported step is 6

#### Scenario: The caller sets the step

- **WHEN** the caller sets the step to 1
- **THEN** the reported step is 1

#### Scenario: A negative step is rejected

- **WHEN** the caller sets the step to -1, or advances by -1, from step 4
- **THEN** the call throws RangeError and the reported step stays 4

### Requirement: Cloud sync stores values apart from local storage

An in-memory cloud sync SHALL resolve get, set, and delete as promises, and SHALL keep its entries apart from local storage.

#### Scenario: A local write is not in the cloud

- **WHEN** a caller saves the shipped version 1 profile in local storage
- **THEN** a cloud get of `profile` resolves to `undefined`

#### Scenario: A cloud value round-trips as a copy

- **WHEN** a caller stores `{ rev: 1 }` under `progress` in the cloud and then changes the object that was stored
- **THEN** a cloud get resolves to `{ rev: 1 }` and a local load of `progress` is absent

#### Scenario: Cloud delete removes the key

- **WHEN** a caller stores a value in the cloud and then deletes that key
- **THEN** a cloud get of that key resolves to `undefined`

### Requirement: The outbox drains events in emit order

A caller SHALL emit domain events and drain those emitted since the previous drain, in emit order. A drained batch SHALL be independent of later emits.

#### Scenario: Drain returns the emitted events and then is empty

- **WHEN** a caller emits Hit, Error, WordComplete, and LevelEnded, each with step 2, and then drains
- **THEN** the batch is those four events in that order, each with step 2, and the next drain is empty

#### Scenario: A later emit does not change a drained batch

- **WHEN** a caller drains a Hit and then emits an Error
- **THEN** the drained batch is still that Hit alone

### Requirement: Render and audio record published batches separately

An in-memory render output and an in-memory audio output SHALL each record published batches in order, as independent copies.

#### Scenario: Batches stay in publish order

- **WHEN** a caller publishes a Hit at step 1 and then publishes a LevelEnded at step 9 to the render output
- **THEN** the recorded render batches are those two, in that order

#### Scenario: Changing the published array does not change the record

- **WHEN** a caller publishes a batch and then changes that array
- **THEN** the recorded batch still contains the events that were published

#### Scenario: An empty batch is recorded

- **WHEN** a caller publishes an empty batch
- **THEN** the output records one empty batch

#### Scenario: Render and audio do not share batches

- **WHEN** a caller publishes a Hit to the render output
- **THEN** the audio output's recorded batches are empty

### Requirement: The same seed repeats the same draws

Two generators created from the same seed string SHALL produce the same unsigned 32-bit draws and the same results for an integer draw, a pick, a weighted pick, a shuffle, and a chance. The seed `signalfire` SHALL produce this first eight unsigned 32-bit draws in Node and in Chromium: 2167704384, 631539707, 4290395976, 3656436552, 3265773535, 4231166332, 427553985, 1826991209.

#### Scenario: One seed matches across a mixed series

- **WHEN** two generators are created from the same arbitrary seed string, and each produces 64 unsigned 32-bit draws, one integer from 0 through 8, one pick from three strings, one weighted pick with weights 1, 2, and 3, one shuffle of five numbers, and one chance of 1 in 2
- **THEN** each pair of results is equal

#### Scenario: The signalfire prefix is fixed in Node and Chromium

- **WHEN** a generator is created with the seed `signalfire` in the Node test project and in the Chromium browser project
- **THEN** both first-eight unsigned 32-bit sequences are 2167704384, 631539707, 4290395976, 3656436552, 3265773535, 4231166332, 427553985, 1826991209

### Requirement: Different seeds diverge

Two seed strings with different 32-bit mixes SHALL produce sequences whose first 16 unsigned 32-bit draws are not all equal.

#### Scenario: A one-character change diverges

- **WHEN** one generator uses the seed `signalfire` and another uses `signalfirf`
- **THEN** the first unsigned 32-bit draw is 2167704384 for `signalfire` and 2472031719 for `signalfirf`

#### Scenario: Any two different seeds diverge within 16 draws

- **WHEN** two generators are created from two different arbitrary seed strings whose 32-bit mixes differ
- **THEN** their first 16 unsigned 32-bit draws are not all equal

### Requirement: Integer draws stay inside inclusive bounds

An integer draw SHALL return a safe integer inside the inclusive bounds. The bounds SHALL be safe integers, the lower bound SHALL be less than or equal to the upper bound, and the count of integers in the range SHALL be from 1 through 4294967296.

#### Scenario: A draw stays inside the bounds

- **WHEN** a caller draws an integer from an inclusive range whose bounds are safe integers and whose size is from 1 through 4294967296
- **THEN** the result is an integer inside that range, including both bounds

#### Scenario: A reversed range is rejected

- **WHEN** a caller draws an integer from 6 through 3
- **THEN** the call throws RangeError

#### Scenario: A non-integer bound is rejected

- **WHEN** a caller draws an integer from 0 through 1.5
- **THEN** the call throws RangeError

#### Scenario: A range wider than 4294967296 is rejected

- **WHEN** a caller draws an integer from 0 through 4294967296
- **THEN** the call throws RangeError

### Requirement: Pick returns an element of the list

A pick SHALL return one element of a non-empty list.

#### Scenario: The pick is one of the elements

- **WHEN** a caller picks from `a`, `b`, and `c`
- **THEN** the result is `a`, `b`, or `c`

#### Scenario: An empty list is rejected

- **WHEN** a caller picks from an empty list
- **THEN** the call throws RangeError

### Requirement: Weighted pick uses positive integer weights

A weighted pick SHALL take one non-negative safe-integer weight per item and SHALL return an item whose weight is positive. The sum of the weights SHALL be a safe integer from 1 through 4294967296.

#### Scenario: A zero weight is not chosen

- **WHEN** a caller picks between `a` and `b` with weights 0 and 1
- **THEN** every result is `b`

#### Scenario: A zero total is rejected

- **WHEN** the item list is empty, or every weight is 0
- **THEN** the call throws RangeError

#### Scenario: A weight sum above 4294967296 is rejected

- **WHEN** a caller picks one item with weight 4294967297
- **THEN** the call throws RangeError

#### Scenario: A negative weight is rejected

- **WHEN** a weight is -1
- **THEN** the call throws RangeError

#### Scenario: A mismatched weight list is rejected

- **WHEN** the weight list is shorter than the item list
- **THEN** the call throws RangeError

### Requirement: Shuffle returns a permutation

A shuffle SHALL return a new list that contains each input element once and SHALL leave the input list unchanged.

#### Scenario: Five numbers are rearranged without changing the input

- **WHEN** a caller shuffles `0`, `1`, `2`, `3`, and `4`
- **THEN** the result contains each of those numbers once and the input list is still `0`, `1`, `2`, `3`, `4` in that order

#### Scenario: The signalfire shuffle is fixed

- **WHEN** the first draw from seed `signalfire` is a shuffle of `0`, `1`, `2`, `3`, and `4`
- **THEN** the result is `1`, `2`, `0`, `3`, `4`

### Requirement: Chance uses one integer draw

For a positive integer `d` and an integer `n` from 0 through `d`, a chance of `n` in `d` SHALL be false when `n` is 0 and true when `n` equals `d`, and SHALL consume the same generator draws as one integer from 0 through `d - 1`. Any other `n` or `d` SHALL throw RangeError before consuming a draw.

#### Scenario: Zero and certain chances

- **WHEN** a caller asks for a chance of 0 in 5, and another generator from the same seed asks for a chance of 5 in 5
- **THEN** the first result is false and the second result is true

#### Scenario: A chance consumes the same draws as one integer

- **WHEN** one generator asks for a chance of 0 in 5 and then an unsigned 32-bit draw, and another generator from the same seed asks for an integer from 0 through 4 and then an unsigned 32-bit draw
- **THEN** the chance is false and the two unsigned 32-bit draws are equal

#### Scenario: An invalid chance consumes nothing

- **WHEN** a caller asks for a chance of 1 in 0
- **THEN** the call throws RangeError and the next unsigned 32-bit draw equals the first draw of a new generator from the same seed

### Requirement: A labeled fork leaves the parent sequence unchanged

A labeled fork SHALL be a generator seeded with the parent seed's UTF-16 code unit count in lowercase hexadecimal, a `#`, the parent seed, the label's UTF-16 code unit count in lowercase hexadecimal, a `#`, and the label. Creating the fork SHALL leave the parent's later draws unchanged, including when the parent has already drawn.

#### Scenario: The content fork matches the derived seed

- **WHEN** a caller forks the label `content` from the seed `signalfire`
- **THEN** the fork's first eight unsigned 32-bit draws equal those of a generator created from the seed `a#signalfire7#content`

#### Scenario: Earlier parent draws do not change the fork

- **WHEN** one caller draws from the parent and then forks `content`, and another caller forks `content` before drawing
- **THEN** the two forks produce the same first eight unsigned 32-bit draws

#### Scenario: Fork draws do not change the parent

- **WHEN** a caller forks, draws from the fork, and then draws an unsigned 32-bit value from the parent
- **THEN** that parent draw equals the first draw of a generator from the same seed that never forked

#### Scenario: Content and spawn labels diverge

- **WHEN** a caller forks `content` and `spawn` from the seed `signalfire`
- **THEN** the two forks' first eight unsigned 32-bit draws are not all equal

### Requirement: Local storage loads and saves a document

An in-memory storage SHALL resolve load and save as promises. A load SHALL return an independent copy of the last document saved for that key. A save SHALL accept only a latest-version document for the key's chain.

#### Scenario: A stored document is returned

- **WHEN** a caller saves the shipped version 1 profile under `profile`
- **THEN** the save is saved and a load of `profile` returns a deeply equal document

#### Scenario: A missing key is absent

- **WHEN** a caller loads `profile` and nothing has been saved there
- **THEN** the load is absent

#### Scenario: Mutating the stored object does not change the saved value

- **WHEN** a caller saves the shipped version 1 profile and then changes that object
- **THEN** a later load still returns the profile that was saved

#### Scenario: Mutating the loaded object does not change the saved value

- **WHEN** a caller changes a document returned by load
- **THEN** a later load still returns the profile that was saved

#### Scenario: A value that is not the latest document is refused

- **WHEN** a caller saves `{ "stars": 1 }` under `profile`
- **THEN** the save is invalid and a load of `profile` is absent

#### Scenario: Two storages do not share entries

- **WHEN** a caller saves the shipped version 1 profile in one in-memory storage
- **THEN** a load of `profile` on a second in-memory storage is absent
