# Spec Delta

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

## REMOVED Requirements

### Requirement: The zone map opens the level, and back opens pause

**Reason**: Replaced by level-screen hosting the level lifecycle machine, where pause is handled internally and back from the level exits to the zone map.
**Migration**: The zone map opens the level; pause and resume are managed within level-screen.

### Requirement: Pause resumes the level

**Reason**: Replaced by the level-lifecycle state machine hosting the engine within level-screen.
**Migration**: Pause and resume with countdown are handled within the level-screen capability.

## ADDED Requirements

### Requirement: The zone map opens the level

Asking to start the level from the zone map SHALL open the level. Asking to go back from the level SHALL return to the zone map.

#### Scenario: The zone map opens the level

- **WHEN** the flow is asked to start the level from the zone map
- **THEN** the flow is the level

#### Scenario: Back from the level opens the zone map

- **WHEN** the flow is asked to go back from the level
- **THEN** the flow is the zone map
