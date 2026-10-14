# scoring Specification

## Purpose

Turns a finished run into a score, Cadet stars, a missed-bar report, the next progress document, and the run logs kept per level and tier.

## Requirements

### Requirement: Hits and finishing score points

The caller SHALL score 10 points for each Hit and 250 points when the events include LevelEnded. Another LevelEnded SHALL add no points. An Error SHALL add no points. A WordComplete SHALL add no points.

#### Scenario: Three hits and a finish

- **WHEN** the caller scores three Hit events and one LevelEnded event
- **THEN** the score is 280

#### Scenario: Ten hits stay at 10 points each

- **WHEN** the caller scores ten Hit events and one LevelEnded event
- **THEN** the score is 350

#### Scenario: An error adds nothing

- **WHEN** the caller scores one Hit, one Error, and one LevelEnded
- **THEN** the score is 260

#### Scenario: Finishing with no hits scores 250

- **WHEN** the caller scores one LevelEnded and no Hit
- **THEN** the score is 250

#### Scenario: An unfinished hit scores 10

- **WHEN** the caller scores one Hit and no LevelEnded
- **THEN** the score is 10

#### Scenario: A second finish adds nothing

- **WHEN** the caller scores two LevelEnded events and no Hit
- **THEN** the score is 250

#### Scenario: A completed word adds nothing

- **WHEN** the caller scores one WordComplete and one LevelEnded
- **THEN** the score is 250

### Requirement: Both bars award the star

The caller SHALL award the highest star from 1 to 3 for which the accuracy bar and the speed bar are both met, using the three bars the caller supplies. No first attempt SHALL meet every accuracy bar. Any first attempts SHALL meet an accuracy bar only when correct first attempts times 100 is at least that bar's percent times the first attempts. Net WPM SHALL meet a speed bar only when it is at least that bar's WPM. The award SHALL be an integer from 0 through 3.

#### Scenario: The shipped zone 1 bars

- **WHEN** the caller reads the shipped zone 1 star bars
- **THEN** 1 star is 92 percent and 6 WPM, 2 stars is 95 percent and 9 WPM, and 3 stars is 97 percent and 12 WPM

#### Scenario: Both 1-star bars earn one star

- **WHEN** the caller awards a finished run with 92 correct first attempts out of 100 and net WPM 6 on bars of 92 percent at 6 WPM, 95 percent at 9 WPM, and 97 percent at 12 WPM
- **THEN** the award is 1 star

#### Scenario: Both 2-star bars earn two stars

- **WHEN** the caller awards a finished run with 95 correct first attempts out of 100 and net WPM 9 on those same bars
- **THEN** the award is 2 stars

#### Scenario: Both 3-star bars earn three stars

- **WHEN** the caller awards a finished run with 97 correct first attempts out of 100 and net WPM 12 on those same bars
- **THEN** the award is 3 stars

#### Scenario: Past the top bar stays at three

- **WHEN** the caller awards a finished run with 100 correct first attempts out of 100 and net WPM 1000 on those same bars
- **THEN** the award is 3 stars

#### Scenario: Speed without accuracy earns nothing

- **WHEN** the caller awards a finished run with 91 correct first attempts out of 100 and net WPM 12 on those same bars
- **THEN** the award is 0 stars

#### Scenario: Accuracy without speed earns nothing

- **WHEN** the caller awards a finished run with 92 correct first attempts out of 100 and net WPM 5.9 on those same bars
- **THEN** the award is 0 stars

#### Scenario: A higher accuracy bar without its speed stays lower

- **WHEN** the caller awards a finished run with 95 correct first attempts out of 100 and net WPM 6 on those same bars
- **THEN** the award is 1 star

#### Scenario: No first attempt is full Integrity

- **WHEN** the caller awards a finished run with no first attempt and net WPM 12 on those same bars
- **THEN** the award is 3 stars

#### Scenario: The 1-star speed boundary is exact

- **WHEN** the caller awards a finished run with 92 correct first attempts out of 100 and net WPM 6 on those same bars, and another with the same attempts and net WPM 5.9
- **THEN** the first award is 1 star and the second award is 0 stars

### Requirement: More accuracy and speed never earn fewer stars

For one set of bars, a finished measurement SHALL earn at least as many stars as another finished measurement when its correct-first ratio is at least the other's and its net WPM is at least the other's. No first attempt has ratio 1. Otherwise the ratio is correct first attempts divided by first attempts. Each award SHALL be an integer from 0 through 3.

#### Scenario: Any cleaner and faster pair keeps the stars

- **WHEN** the caller awards stars for any two finished measurements on any bars whose percents and WPM values rise from 1 star through 3 stars, and the second ratio and net WPM are each at least the first
- **THEN** the second award is an integer from 0 through 3 and is at least the first award

### Requirement: Zone 0 awards no stars

The caller SHALL award 0 stars when the caller supplies no star bars.

#### Scenario: The shipped zone 0 has no bars

- **WHEN** the caller reads the shipped zone 0 document
- **THEN** it has no star bars

#### Scenario: A perfect run without bars earns nothing

- **WHEN** the caller awards a finished run with 100 correct first attempts out of 100 and net WPM 1000 and supplies no star bars
- **THEN** the award is 0 stars

### Requirement: An unfinished run awards no stars

The caller SHALL award 0 stars when the run has not ended.

#### Scenario: A passing run that did not end earns nothing

- **WHEN** the caller awards a run that has not ended, with 100 correct first attempts out of 100 and net WPM 1000, on bars of 92 percent at 6 WPM, 95 percent at 9 WPM, and 97 percent at 12 WPM
- **THEN** the award is 0 stars

### Requirement: A missed 1-star bar reports the shortfall

When a finished run on a zone with bars awards 0 stars, the caller SHALL report each unmet 1-star bar, Integrity before Velocity. Each report SHALL give the measured value, the required value, and the shortfall, required minus measured. Measured Integrity SHALL be 100 percent with no first attempt, and otherwise 100 times correct first attempts divided by first attempts. A run that awards at least 1 star, a run that has not ended, and a zone with no bars SHALL each report no bar.

#### Scenario: Only Integrity is short

- **WHEN** the caller awards a finished run with 1 correct first attempt out of 2 and net WPM 12 on bars of 92 percent at 6 WPM, 95 percent at 9 WPM, and 97 percent at 12 WPM
- **THEN** the award is 0 stars and the only report is Integrity, measured 50 percent, required 92 percent, shortfall 42 percentage points

#### Scenario: Only Velocity is short

- **WHEN** the caller awards a finished run with 100 correct first attempts out of 100 and net WPM 0 on those same bars
- **THEN** the award is 0 stars and the only report is Velocity, measured 0 WPM, required 6 WPM, shortfall 6 WPM

#### Scenario: Both 1-star bars are short

- **WHEN** the caller awards a finished run with 9 correct first attempts out of 10 and net WPM 4 on those same bars
- **THEN** the award is 0 stars, the first report is Integrity measured 90 percent, required 92 percent, shortfall 2 percentage points, and the second report is Velocity measured 4 WPM, required 6 WPM, shortfall 2 WPM

#### Scenario: One earned star reports nothing

- **WHEN** the caller awards a finished run with 95 correct first attempts out of 100 and net WPM 6 on those same bars
- **THEN** the award is 1 star and the result reports no bar

#### Scenario: Zone 0 reports nothing

- **WHEN** the caller awards a finished run with no correct first attempt out of 1 and net WPM 0 and supplies no star bars
- **THEN** the award is 0 stars and the result reports no bar

#### Scenario: An unfinished run reports nothing

- **WHEN** the caller awards a run that has not ended, with no correct first attempt out of 1 and net WPM 0, on those same bars
- **THEN** the award is 0 stars and the result reports no bar

### Requirement: Recording a Cadet run keeps the bests

The caller SHALL update only that level's Cadet record from a finished Cadet run. Stars and each best SHALL become the greater of the stored value and this run. Attempts SHALL increase by 1. Stored medals and calmUnlocked SHALL remain. A new record SHALL have no medals and calm unlocked false. Other levels and tiers SHALL remain. rev SHALL increase by 1, and updatedAt SHALL become the instant the caller supplies.

#### Scenario: The first miss creates the Cadet record

- **WHEN** the caller records a finished Cadet run of `level:1.1` with stars 0, score 260, accuracy 0.5, and net WPM 12, on a zone with bars, into an empty version 1 progress document at `2026-10-12T20:00:00.000Z` with rev 0, and supplies `2026-10-12T21:00:00.000Z`
- **THEN** rev is 1, updatedAt is `2026-10-12T21:00:00.000Z`, and the only record is Cadet for `level:1.1` with stars 0, no medals, best score 260, best net WPM 12, best accuracy 0.5, attempts 1, failedSinceLastStar 1, and calm unlocked false

#### Scenario: A worse run keeps stars and bests

- **WHEN** the caller records a finished Cadet run of `level:1.1` with stars 0, score 100, accuracy 0.99, and net WPM 8, on a zone with bars, after that level's Cadet record has stars 2, best score 400, best net WPM 12, best accuracy 0.95, and attempts 1
- **THEN** that Cadet record has stars 2, best score 400, best net WPM 12, best accuracy 0.99, and attempts 2

#### Scenario: A medal and calm unlocked stay

- **WHEN** the caller records a finished Cadet run of `level:1.1` with stars 0, score 10, accuracy 0.5, and net WPM 1, on a zone with bars, after that Cadet record has medal `medal:flawless`, calm unlocked true, and stars 1
- **THEN** that Cadet record still has medal `medal:flawless`, calm unlocked true, and stars 1

#### Scenario: Another level and Veteran stay

- **WHEN** the caller records a finished Cadet run of `level:1.1` with stars 1, score 10, accuracy 1, and net WPM 6, on a zone with bars, into a document whose `level:0.1` Cadet stars are 0 and whose `level:1.1` Veteran stars are 3
- **THEN** `level:0.1` Cadet stars are still 0 and `level:1.1` Veteran stars are still 3

### Requirement: Failures since the last star follow this run

On a zone with bars, failedSinceLastStar SHALL increase by 1 when this run awards 0 stars, and SHALL become 0 when this run awards at least 1 star. On a zone with no bars it SHALL stay unchanged, and a new record SHALL start at 0.

#### Scenario: A star resets the failure count

- **WHEN** the caller records three finished Cadet runs of `level:1.1` on a zone with bars, starting from an empty progress document, and those runs award 0 stars, then 2 stars, then 0 stars
- **THEN** failedSinceLastStar is 1 after the first run, 0 after the second, and 1 after the third

#### Scenario: A star below the stored best still resets the count

- **WHEN** the caller records a finished Cadet run of `level:1.1` that awards 1 star, on a zone with bars, after that Cadet record has stars 2 and failedSinceLastStar 4
- **THEN** stars are 2 and failedSinceLastStar is 0

#### Scenario: Zone 0 does not count a failure

- **WHEN** the caller records two finished Cadet runs of `level:0.1` that each award 0 stars, on a zone with no bars, starting from an empty progress document
- **THEN** failedSinceLastStar is 0 after the first run and 0 after the second

### Requirement: Veteran and Ace are refused

The caller SHALL throw RangeError when the finished run's tier is `veteran` or `ace`, and the progress document SHALL stay unchanged.

#### Scenario: A Veteran run leaves progress unchanged

- **WHEN** the caller records a finished Veteran run of `level:1.1` into a version 1 progress document whose Cadet stars for that level are 1
- **THEN** the call throws RangeError and the document is unchanged

### Requirement: Recording never lowers stars or bests

After each finished Cadet run on one level, stars SHALL be an integer from 0 through 3 and at least the stars stored before that run. Best score, best net WPM, and best accuracy SHALL each be at least the value stored before that run. Attempts SHALL increase by 1. A medal stored before the sequence SHALL remain.

#### Scenario: Any later Cadet run keeps stars, bests, and medals

- **WHEN** the caller records any sequence of finished Cadet runs for one level, starting from a Cadet record that already has a medal, and each run's stars are an integer from 0 through 3
- **THEN** after every run the stars are an integer from 0 through 3 and at least the previous stars, each best is at least its previous value, attempts are the previous attempts plus 1, and the medal is still stored

### Requirement: Retention keeps the best and the last 3

Per level id and tier, the caller SHALL keep the best run and the last 3, and SHALL name every other run in that group as dropped. Best is the highest score, then the later startedAt, then the greater run id. The last 3 are the latest startedAt, then the greater run id. The best run's kind SHALL be `best`, including when it is also one of the last 3. Every other kept run's kind SHALL be `recent`.

#### Scenario: An old best is kept with the three newest

- **WHEN** the caller retains five Cadet campaign logs for `level:1.1` with run ids `00000000000000000000000000` through `00000000000000000000000004`, startedAt minutes `2026-10-12T20:00:00.000Z` through `2026-10-12T20:04:00.000Z` in that id order, and scores 100, 10, 20, 30, and 40
- **THEN** the kept runs are `00000000000000000000000000` with kind `best` and `00000000000000000000000002`, `00000000000000000000000003`, and `00000000000000000000000004` with kind `recent`, and `00000000000000000000000001` is dropped

#### Scenario: A best inside the last 3 is kept once

- **WHEN** the caller retains five Cadet campaign logs for `level:1.1` with those same run ids and start times, and scores 1, 2, 3, 4, and 50
- **THEN** the kept runs are `00000000000000000000000002` and `00000000000000000000000003` with kind `recent` and `00000000000000000000000004` with kind `best`, and the two earlier runs are dropped

#### Scenario: The later tie is the best

- **WHEN** the caller retains two Cadet campaign logs for `level:1.1`, run ids `00000000000000000000000000` and `00000000000000000000000001`, startedAt `2026-10-12T20:00:00.000Z` and `2026-10-12T20:01:00.000Z`, and both scores 50
- **THEN** both are kept, and `00000000000000000000000001` has kind `best`

#### Scenario: The same start keeps the greater run id

- **WHEN** the caller retains four Cadet campaign logs for `level:1.1` with run ids `00000000000000000000000000` through `00000000000000000000000003`, the same startedAt `2026-10-12T20:00:00.000Z`, and scores 1, 2, 3, and 9
- **THEN** `00000000000000000000000000` is dropped, `00000000000000000000000003` has kind `best`, and the other two kept runs have kind `recent`

#### Scenario: Another level keeps its own logs

- **WHEN** the caller retains the five logs from the old-best scenario and one Cadet campaign log `00000000000000000000000005` for `level:0.1` with score 1 and startedAt `2026-10-12T20:00:00.000Z`
- **THEN** `00000000000000000000000005` is kept with kind `best` and the `level:1.1` kept and dropped runs are unchanged

#### Scenario: Another tier keeps its own logs

- **WHEN** the caller retains one Cadet campaign log and one Veteran campaign log for `level:1.1`, each the only log of its tier
- **THEN** each log is kept with kind `best`

#### Scenario: One run is the best

- **WHEN** the caller retains one Cadet campaign log
- **THEN** that log is kept with kind `best` and nothing is dropped

#### Scenario: Courier shares the Cadet group

- **WHEN** the caller retains the five Cadet logs from the old-best scenario and changes the dropped log's mode to `courier`
- **THEN** that Courier log is still dropped and the other four are still kept

#### Scenario: A duplicate run id is refused

- **WHEN** the caller retains two logs with run id `00000000000000000000000000`
- **THEN** the call throws RangeError and produces no kept set

### Requirement: Retention keeps exactly the best and the last 3

For any candidate logs with unique run ids, each level id and tier SHALL keep exactly the union of its best run and its last 3, and SHALL drop every other log in that group. A group of fewer than three logs SHALL keep all of them.

#### Scenario: Any logs keep only that union

- **WHEN** the caller retains any list of logs whose run ids are unique
- **THEN** each level id and tier keeps exactly its best run and its last 3, a smaller group keeps every log, and every other log in the list is dropped
