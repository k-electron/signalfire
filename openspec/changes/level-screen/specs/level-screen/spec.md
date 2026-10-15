# Spec Delta

## Purpose

Provides the playable level screen lifecycle from briefing through countdown, gameplay hosting the PixiJS engine with a minimal HUD, in-level pause with countdown resumption, and results presentation with stars and missed-bar feedback.

## ADDED Requirements

### Requirement: The level lifecycle starts at loading and advances to briefing

The level lifecycle machine SHALL start at loading, initialize the level data and note definitions, and advance to briefing upon successful load. On initialization failure, it SHALL transition to the error state.

#### Scenario: Successful load enters briefing
- **WHEN** the level screen is opened for level 1.1
- **THEN** the lifecycle state is briefing and the briefing card is displayed

#### Scenario: Failure to load enters error state
- **WHEN** loading level content encounters an invalid level definition or asset error
- **THEN** the lifecycle state is error and the player sees an error message

### Requirement: The briefing card shows level details and launches with Space

The briefing card SHALL display the level name, character prompt, star bars, and a launch prompt. Activating launch with Space or pointer click SHALL advance the lifecycle to countdown.

#### Scenario: Space launches the countdown
- **WHEN** the briefing card is displayed and the player presses Space
- **THEN** the lifecycle state advances to countdown

#### Scenario: Clicking Launch starts countdown
- **WHEN** the player clicks the Launch button on the briefing card
- **THEN** the lifecycle state advances to countdown

### Requirement: Countdown counts down before playing begins

The countdown state SHALL display a 3-second countdown (3, 2, 1) and advance to playing upon completion.

#### Scenario: Countdown finishes and gameplay starts
- **WHEN** the countdown completes
- **THEN** the lifecycle state advances to playing and the engine simulation advances

### Requirement: In-level HUD displays Integrity, Velocity, Score, and Combo

While in playing state, the HUD SHALL display live Integrity as an accuracy percentage, Velocity in words per minute, current score, and combo count, updated from the throttled HUD bridge.

#### Scenario: Initial HUD displays baseline metrics
- **WHEN** level 1.1 enters playing state
- **THEN** Integrity displays 100%, Velocity displays 0 WPM, Score displays 0, and Combo displays 0

#### Scenario: Keystroke updates HUD metrics
- **WHEN** the player hits the first note correctly
- **THEN** the HUD updates with Score 10, Combo 1, and positive Velocity

### Requirement: Escape and focus loss pause the level

While in playing state, pressing Escape or losing window focus SHALL transition the lifecycle to paused, halt the loop animation frames, and disable keyboard capture.

#### Scenario: Escape key pauses play
- **WHEN** the player presses Escape during active gameplay
- **THEN** the lifecycle state is paused, the pause overlay is visible, and the simulation loop halts

#### Scenario: Window blur pauses play
- **WHEN** the window loses focus during active gameplay
- **THEN** the lifecycle state is paused and the pause overlay is visible

### Requirement: Pause overlay offers Resume and Quit

The pause overlay SHALL display the Pause heading and options to Resume or Quit to zone map. Activating Resume SHALL advance to countdown before returning to play. Activating Quit SHALL exit the level and return to the zone map.

#### Scenario: Resume restarts countdown
- **WHEN** the player selects Resume on the pause overlay
- **THEN** the lifecycle state transitions to countdown and counts down before playing resumes

#### Scenario: Quit exits to zone map
- **WHEN** the player selects Quit on the pause overlay
- **THEN** the level screen exits and returns the player to the zone map

### Requirement: Level completion transitions through finishing to results

When the run ends, the lifecycle SHALL transition to finishing, record the Cadet run in progress, compute stars and score, and advance to results.

#### Scenario: Completed run shows results
- **WHEN** the level run emits LevelEnded
- **THEN** the lifecycle state transitions to results and displays the earned stars and score

### Requirement: Results screen displays stars, score, and missed-bar report

The results screen SHALL display stars earned, score, Integrity percentage, Velocity WPM, and a Continue action. When zero stars are earned on a zone with star bars, it SHALL display the exact missed bar shortfall naming Integrity before Velocity.

#### Scenario: Earning stars on Level 1.1
- **WHEN** the player completes level 1.1 meeting both 1-star bars
- **THEN** the results screen displays 1 star, the achieved score, Integrity, and Velocity

#### Scenario: Missed star displays shortfall
- **WHEN** the player finishes level 1.1 with Integrity below the 1-star bar
- **THEN** the results screen displays 0 stars and the Integrity shortfall message

#### Scenario: Continue returns to zone map
- **WHEN** the player activates Continue on the results screen
- **THEN** the flow returns to the zone map
