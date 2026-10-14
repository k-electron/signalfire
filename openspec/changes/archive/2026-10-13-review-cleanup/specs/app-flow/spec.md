# Spec Delta

## REMOVED Requirements

### Requirement: The zone map opens the level

**Reason**: Going back from the level returned to the zone map. Escape on the level now opens pause.
**Migration**: Back from the level opens pause. Space on the level still finishes to results.

## ADDED Requirements

### Requirement: The zone map opens the level, and back opens pause

Asking to start the level from the zone map SHALL open the level. Asking to go back from the level SHALL open pause.

#### Scenario: The zone map opens the level

- **WHEN** the flow is asked to start the level from the zone map
- **THEN** the flow is the level

#### Scenario: Back from the level opens pause

- **WHEN** the flow is asked to go back from the level
- **THEN** the flow is pause

## MODIFIED Requirements

### Requirement: Escape goes back

Escape SHALL ask the flow to go back.

#### Scenario: Escape on onboarding returns to the title

- **WHEN** the player presses Escape on onboarding
- **THEN** the player sees the title heading

#### Scenario: Escape on the title stays on the title

- **WHEN** the player presses Escape on the title
- **THEN** the player still sees the title heading

#### Scenario: Escape on the hub returns to onboarding after a first run

- **WHEN** the player reached the hub from onboarding and presses Escape
- **THEN** the player sees the onboarding heading

#### Scenario: Escape on settings returns to the hub

- **WHEN** the player presses Escape on settings
- **THEN** the player sees the hub heading

#### Scenario: Escape on results returns to the zone map

- **WHEN** the player presses Escape on results
- **THEN** the player sees the zone map heading

#### Scenario: Escape on the level opens pause

- **WHEN** the player presses Escape on the level
- **THEN** the player sees the pause heading

### Requirement: The open screen takes the keyboard

When a screen opens, the player SHALL be able to use the next mapped key without clicking, including when focus is outside the shell. The selected item's focus indicator SHALL be visible.

#### Scenario: Space works on the title without a click

- **WHEN** the title screen has just opened
- **THEN** pressing Space opens onboarding on a first run, and the focus indicator is visible before that press

#### Scenario: Escape works after a click opens settings

- **WHEN** the player clicks Settings on the hub
- **THEN** pressing Escape returns to the hub without another click, and the focus indicator is visible on settings before that press

#### Scenario: Space works when focus is outside the shell

- **WHEN** the title is showing and focus is on the document body
- **THEN** pressing Space opens onboarding on a first run

## ADDED Requirements

### Requirement: Pause resumes the level

Pause SHALL show a heading Pause. Pressing Space or Escape on pause SHALL return to the level.

#### Scenario: Pause shows its name

- **WHEN** pause is showing
- **THEN** the player sees a heading Pause

#### Scenario: Space on pause returns to the level

- **WHEN** the player presses Space on pause
- **THEN** the player sees the level heading

#### Scenario: Escape on pause returns to the level

- **WHEN** the player presses Escape on pause
- **THEN** the player sees the level heading

### Requirement: The selected item is visible

The selected hub item and the selected results item SHALL be painted with the focus ring and glow. Other items on that screen SHALL stay unpainted by that ring.

#### Scenario: The selected hub item shows the focus ring

- **WHEN** the galaxy map item is selected on the hub
- **THEN** that item shows the focus ring and the other hub items do not
