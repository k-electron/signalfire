# Spec Delta

## Purpose

Converts frame timestamps and input timestamps into fixed simulation steps of 1/120 s, and reports the leftover time as an interpolation fraction.

## ADDED Requirements

### Requirement: The first timestamp is the origin

While the sample cursor is unset, the first frame or input SHALL set the sample cursor. It SHALL complete no step. The clock SHALL report 0, and the interpolation fraction SHALL be 0.

#### Scenario: An opening frame does not step

- **WHEN** the caller presents a frame at 10000 ms
- **THEN** the clock reports 0, the interpolation fraction is 0, and the step callback has received no index

#### Scenario: An opening input does not step

- **WHEN** the caller submits an input at 40 ms and then presents a frame at 50 ms
- **THEN** after the input the clock is 0 and the fraction is 0, and after the frame the clock is 1 and the fraction is 1/5

### Requirement: Accepted gaps add fixed steps

After the origin timestamp, a frame timestamp at or after the sample cursor SHALL add the integer closest to (the lesser of the gap and 250) times 120 ticks, where the gap is in milliseconds and a tie rounds to the greater integer, and SHALL then move the sample cursor to that timestamp. One step SHALL be 1000 ticks, which is 1/120 s. The clock SHALL report how many steps the tick total holds. The interpolation fraction SHALL be the remaining ticks divided by 1000.

#### Scenario: Uneven frames keep a leftover fraction

- **WHEN** the caller presents frames at 0 ms, 10 ms, 20 ms, and 27 ms
- **THEN** after 10 ms the clock is 1 and the fraction is 1/5, after 20 ms the clock is 2 and the fraction is 2/5, and after 27 ms the clock is 3 and the fraction is 6/25

#### Scenario: A frame shorter than one step takes no step

- **WHEN** the caller presents a frame at 0 ms and a frame at 8 ms
- **THEN** the clock is 0 and the interpolation fraction is 24/25

#### Scenario: An exact step boundary leaves no leftover

- **WHEN** the caller presents a frame at 0 ms and a frame at 1000/120 ms
- **THEN** the clock is 1 and the interpolation fraction is 0

#### Scenario: A half-tick gap rounds up

- **WHEN** the caller presents a frame at 0 ms and a frame at 1/240 ms
- **THEN** the clock is 0 and the interpolation fraction is 1/1000

#### Scenario: A repeated timestamp adds nothing

- **WHEN** the caller presents frames at 0 ms, 10 ms, and 10 ms
- **THEN** the clock is 1 and the interpolation fraction is 1/5

#### Scenario: A one-second stall adds 250 ms

- **WHEN** the caller presents frames at 0 ms, 1000 ms, and 1016 ms
- **THEN** after 1000 ms the clock is 30 and the fraction is 0, and after 1016 ms the clock is 31 and the fraction is 23/25

#### Scenario: Integer gaps match the clamped tick total

- **WHEN** the caller presents a frame at 0 ms and then any sequence of integer millisecond gaps from 0 through 1000
- **THEN** the clock and the interpolation fraction are the step count and leftover of the tick total for those gaps, each gap limited to 250 ms, at 120 ticks per millisecond and 1000 ticks per step

### Requirement: Each completed step reports its index

Each completed step SHALL call the step callback once, in increasing order, with that step's index, before the frame or input call returns. During the callback the clock SHALL report that same index.

#### Scenario: Three steps in one frame report 1, then 2, then 3

- **WHEN** the caller presents a frame at 0 ms and a frame at 25 ms
- **THEN** the step callback receives 1, then 2, then 3, and during each call the clock reports that same index

#### Scenario: Later steps continue the index

- **WHEN** the caller presents frames at 0 ms, 16 ms, and 41 ms
- **THEN** the step callback receives 1, then 2, then 3, then 4, and during each call the clock reports that same index

### Requirement: An input timestamp lands on its step

The caller SHALL submit an input timestamp in milliseconds. The loop SHALL treat a timestamp at or after the sample cursor as an accepted frame timestamp under the same tick rule, and SHALL finish every new step callback before the call returns.

#### Scenario: Ten milliseconds lands on step 1

- **WHEN** the caller presents a frame at 0 ms and submits an input at 10 ms
- **THEN** before the call returns the step callback has received 1, the clock is 1, and the interpolation fraction is 1/5

#### Scenario: Eight milliseconds stays on step 0

- **WHEN** the caller presents a frame at 0 ms and submits an input at 8 ms
- **THEN** the clock is 0 and the interpolation fraction is 24/25

#### Scenario: Fifty milliseconds crosses six steps

- **WHEN** the caller presents a frame at 0 ms and submits an input at 50 ms
- **THEN** before the call returns the step callback has received 1 through 6, the clock is 6, and the interpolation fraction is 0

#### Scenario: A frame and a later input share one timeline

- **WHEN** the caller presents frames at 0 ms and 16 ms, then submits an input at 20 ms
- **THEN** the clock is 2 and the interpolation fraction is 2/5

#### Scenario: A long input gap clamps, and the next frame does not refill it

- **WHEN** the caller presents a frame at 0 ms, submits an input at 1000 ms, and presents a frame at 1016 ms
- **THEN** after the input the clock is 30 and the fraction is 0, and after the frame the clock is 31 and the fraction is 23/25

### Requirement: An earlier timestamp leaves the sample cursor

A frame timestamp or an input timestamp earlier than the sample cursor SHALL leave the clock, the interpolation fraction, and the sample cursor unchanged.

#### Scenario: A late input and an earlier frame do not move the cursor

- **WHEN** the caller presents frames at 0 ms and 32 ms, submits an input at 20 ms, presents a frame at 30 ms, and presents a frame at 48 ms
- **THEN** after the input and the frame at 30 ms the clock is 3 and the fraction is 21/25, and after the frame at 48 ms the clock is 5 and the fraction is 19/25

### Requirement: Pause holds the simulation

While the loop is paused, a frame timestamp or an input timestamp SHALL leave the clock and the interpolation fraction unchanged. Resume at a timestamp SHALL set the sample cursor to that timestamp and SHALL keep the clock and the leftover time, including when no frame or input has set the cursor yet. A resume while the loop is already running, and a pause while it is already paused, SHALL leave the sample cursor unchanged.

#### Scenario: A paused gap is dropped

- **WHEN** the caller presents frames at 0 ms and 16 ms, pauses, pauses again, presents a frame at 5000 ms, and submits an input at 5100 ms
- **THEN** the clock is 1 and the interpolation fraction is 23/25

#### Scenario: Resume measures the next gap from the resume timestamp

- **WHEN** the caller presents frames at 0 ms and 16 ms, pauses, resumes at 5100 ms, and presents a frame at 5116 ms
- **THEN** the clock is 3 and the interpolation fraction is 21/25

#### Scenario: Resume while running does not move the cursor

- **WHEN** the caller presents frames at 0 ms and 16 ms, resumes at 1000 ms, and presents a frame at 32 ms
- **THEN** the clock is 3 and the interpolation fraction is 21/25

#### Scenario: Resume before any sample sets the cursor

- **WHEN** the caller pauses, resumes at 5100 ms, and presents a frame at 5116 ms
- **THEN** the clock is 1 and the interpolation fraction is 23/25

### Requirement: Animation frames drive the stepper

The caller SHALL start animation frames by passing a schedule function and a cancel function. Each timestamp the schedule function delivers SHALL be presented to the stepper as a frame, and the driver SHALL ask for another frame after each delivery. Stop SHALL cancel the pending frame. A timestamp delivered after stop SHALL leave the clock and the interpolation fraction unchanged.

#### Scenario: Delivered frames match the stepper

- **WHEN** the caller starts animation frames and the schedule function delivers 0 ms and then 16 ms
- **THEN** the clock is 1, the interpolation fraction is 23/25, and another frame has been requested after each delivery

#### Scenario: Stop cancels the pending frame

- **WHEN** the caller starts animation frames, the schedule function delivers 0 ms, the caller stops, and 16 ms is delivered after that
- **THEN** cancel has been called with the pending handle, the clock is 0, and the interpolation fraction is 0

### Requirement: A bad timestamp is rejected

A timestamp that is not finite, or that is negative, SHALL throw RangeError. The clock, the interpolation fraction, and the sample cursor SHALL stay as they were.

#### Scenario: NaN and a negative frame leave the cursor

- **WHEN** the caller presents frames at 0 ms and 10 ms, then presents a frame at NaN, a frame at Infinity, and a frame at -1 ms, then presents a frame at 26 ms
- **THEN** each bad frame throws RangeError, the clock is still 1 and the fraction is still 1/5 after each throw, and after 26 ms the clock is 3 and the fraction is 3/25

#### Scenario: A bad input leaves the cursor

- **WHEN** the caller presents frames at 0 ms and 10 ms, submits an input at NaN, submits an input at -1 ms, and presents a frame at 26 ms
- **THEN** each bad input throws RangeError, the clock is still 1 and the fraction is still 1/5 after each throw, and after 26 ms the clock is 3 and the fraction is 3/25

#### Scenario: A bad resume leaves the cursor

- **WHEN** the caller presents frames at 0 ms and 10 ms, pauses, resumes at Infinity, resumes at -1 ms, presents a frame at 18 ms, resumes at 10 ms, and presents a frame at 18 ms
- **THEN** each bad resume throws RangeError, the clock is 1 and the fraction is 1/5 until the last frame, and after that frame the clock is 2 and the fraction is 4/25
