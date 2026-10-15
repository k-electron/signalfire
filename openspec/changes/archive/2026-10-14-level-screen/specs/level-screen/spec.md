# Spec Delta

## Purpose

Manages the complete level lifecycle from mission briefing through countdown, gameplay, pause, resume, and run completion, displaying minimal HUD metrics and reporting earned stars, score, and performance shortfalls on the results screen.

## ADDED Requirements

### Requirement: Level lifecycle state machine drives mission progression

The level lifecycle SHALL transition through states: loading, briefing, countdown, playing, paused, finishing, results, and error. Loading SHALL automatically transition to briefing upon loading level definition, tuning, and zone data. Briefing SHALL display the level name, character briefing line, introduced home keys, and zone star bars, and pressing Space SHALL transition to countdown.

#### Scenario: Loading transitions to briefing
- **WHEN** level 1.1 begins loading
- **THEN** the level lifecycle enters the briefing state and displays level details, introduced keys, and star bars

#### Scenario: Space on briefing advances to countdown
- **WHEN** the player presses Space on the briefing screen
- **THEN** the level lifecycle transitions from briefing to countdown

### Requirement: Countdown ticks before gameplay and before resuming

The countdown state SHALL display a 3-2-1 sequence before gameplay begins and when resuming from pause. When the countdown completes, the level lifecycle SHALL transition to playing.

#### Scenario: Countdown initiates gameplay
- **WHEN** the countdown completes
- **THEN** the level enters the playing state, initializes the fixed-step loop, and activates keyboard capture

#### Scenario: Countdown precedes resume from pause
- **WHEN** the player resumes from pause
- **THEN** the level enters the countdown state before returning to playing

### Requirement: Minimal HUD displays live Integrity and Velocity

During the playing state, the HUD SHALL display live Integrity (first-attempt accuracy percentage), Velocity (net words per minute), current score, and current combo tier, updated from throttled engine snapshots.

#### Scenario: HUD shows accuracy and net WPM
- **WHEN** the simulation loop publishes a snapshot with 100% accuracy and 15 WPM
- **THEN** the HUD displays 100% Integrity and 15 WPM alongside score and combo

#### Scenario: Mistakes update Integrity
- **WHEN** a wrong key reduces accuracy to 90%
- **THEN** the HUD updates to display 90% Integrity

### Requirement: Escape and focus loss pause active gameplay

While in the playing state, pressing Escape or the browser window losing focus (blur) SHALL transition the level to the paused state. In the paused state, the simulation loop and gameplay keyboard capture SHALL freeze.

#### Scenario: Escape key pauses playing level
- **WHEN** the player presses Escape during active play
- **THEN** the level enters the paused state and displays the pause overlay

#### Scenario: Window blur pauses playing level
- **WHEN** the browser window loses focus during active play
- **THEN** the level enters the paused state and displays the pause overlay

### Requirement: Pause overlay provides Resume and Quit actions

The pause overlay SHALL display Resume and Quit actions. Activating Resume (via Space, 1, or click) SHALL start the countdown to resume play. Activating Quit (via Escape, 2, or click) SHALL terminate the level run and return the player to the zone map.

#### Scenario: Resume restarts the countdown
- **WHEN** the player activates Resume on the pause overlay
- **THEN** the level lifecycle enters the countdown state

#### Scenario: Quit exits to zone map
- **WHEN** the player activates Quit on the pause overlay
- **THEN** the level run terminates and the flow navigates to the zone map

### Requirement: Level completion calculates score and awards stars

When the run finishes or emits LevelEnded, the level SHALL advance to finishing, compute final score, Velocity, and Integrity, award stars (0 to 3) against the zone star bars, record the cadet run to the player's progress document, and transition to results.

#### Scenario: Meeting star bars awards stars
- **WHEN** level 1.1 finishes meeting the 1-star Integrity and Velocity thresholds
- **THEN** the run records at least 1 star to the progress document and transitions to results

#### Scenario: Missing star bars records zero stars and notes shortfall
- **WHEN** level 1.1 finishes below the 1-star threshold
- **THEN** 0 stars are awarded and the shortfall is recorded for display

### Requirement: Results screen displays stars, score, and missed-bar feedback

The results screen SHALL display earned stars (0 to 3), final score, Velocity, Integrity, and if the 1-star bar was missed, an exact missed-bar message stating the measured value and required value. The results screen SHALL provide Continue and Hub actions.

#### Scenario: Results show earned stars and score
- **WHEN** the player completes level 1.1 earning 1 star
- **THEN** the results display shows 1 star, the achieved score, Velocity, and Integrity

#### Scenario: Results report missed bar message
- **WHEN** the player completes level 1.1 missing the 1-star Integrity bar with 90% measured versus 92% required
- **THEN** the results display shows 0 stars and the message "Integrity 90%, needed 92%"

#### Scenario: Continue opens zone map
- **WHEN** the player activates Continue on results
- **THEN** the flow navigates to the zone map

#### Scenario: Hub opens hub
- **WHEN** the player activates Hub on results
- **THEN** the flow navigates to the hub

### Requirement: Error state offers safe return to zone map

If level initialization or runtime execution encounters an unrecoverable error, the level lifecycle SHALL enter the error state, display a friendly recovery message, and provide an action to return to the zone map.

#### Scenario: Loading failure shows error and return action
- **WHEN** level loading encounters an invalid level definition
- **THEN** the player sees an error notification and an action to return to the zone map
