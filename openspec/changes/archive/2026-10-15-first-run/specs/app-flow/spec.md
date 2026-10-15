# Spec Delta: app-flow

## MODIFIED Requirements

### Requirement: Onboarding opens the hub or returns to the title

Asking to continue from onboarding SHALL start level 0.1 during first run, or open the hub when onboarding is revisited. Asking to go back SHALL return to the title.

#### Scenario: Continue opens the hub
- **WHEN** the flow is asked to continue from onboarding when returning
- **THEN** the flow is the hub

#### Scenario: Continue starts level 0.1 on first run
- **WHEN** the flow is asked to continue from onboarding during a first run
- **THEN** the flow is the level screen configured for level 0.1

#### Scenario: Back returns to the title
- **WHEN** the flow is asked to go back from onboarding
- **THEN** the flow is the title

### Requirement: Space activates the selected action

Space SHALL activate the selected action. On the title it begins. On onboarding it continues. On the hub, the galaxy map, the zone map, and results it activates the selected item. On the level it finishes. On the dossier, the hangar, the codex, and settings it does nothing.

#### Scenario: Space on the title begins a first run
- **WHEN** the player presses Space on the title during a first run
- **THEN** the player sees the onboarding heading

#### Scenario: Space on onboarding opens the hub
- **WHEN** the player presses Space on onboarding outside first run
- **THEN** the player sees the hub heading

#### Scenario: Space on onboarding completes and starts level 0.1
- **WHEN** the player completes onboarding with Space during first run
- **THEN** the player sees the level screen for level 0.1

#### Scenario: Space on a fresh hub opens the galaxy map
- **WHEN** the player presses Space on a freshly opened hub
- **THEN** the player sees the galaxy map heading

#### Scenario: Space on the selected zone map item opens the zone map
- **WHEN** the zone map item is selected on the hub and the player presses Space
- **THEN** the player sees the zone map heading

#### Scenario: Space on the galaxy map opens the zone map
- **WHEN** the player presses Space on the galaxy map
- **THEN** the player sees the zone map heading

#### Scenario: Space on the zone map opens the level
- **WHEN** the player presses Space on the zone map
- **THEN** the player sees the level heading

#### Scenario: Space on the level opens results
- **WHEN** the player presses Space on the level
- **THEN** the player sees the results heading and Continue is selected

#### Scenario: Space on results opens the zone map
- **WHEN** the player presses Space on results while Continue is selected
- **THEN** the player sees the zone map heading

#### Scenario: Space on settings stays on settings
- **WHEN** the player presses Space on settings
- **THEN** the player still sees the settings heading

## ADDED Requirements

### Requirement: First run flow advances from level 0.1 through level 1.1 to results and zone map

When level 0.1 finishes during a first run, the flow SHALL advance to level 1.1 briefing. When level 1.1 finishes, the flow SHALL advance to results. From results, continuing SHALL advance to the zone map.

#### Scenario: Finishing level 0.1 advances to level 1.1
- **WHEN** the flow is at level 0.1 and receives finish
- **THEN** the flow advances to level 1.1

#### Scenario: Finishing level 1.1 advances to results
- **WHEN** the flow is at level 1.1 and receives finish
- **THEN** the flow advances to results

#### Scenario: Results continue opens the zone map
- **WHEN** the flow is at results and receives continue
- **THEN** the flow advances to the zone map
