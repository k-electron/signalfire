# Spec Delta: onboarding

## Purpose

Guides a first-time player through initial flight preparation, including call sign selection, posture checking, and physical beacon key orientation.

## ADDED Requirements

### Requirement: Call sign selection provides generated choices and confirmation

The onboarding screen SHALL display a list of generated call sign options with one option pre-selected, allow navigating choices using Arrow keys, and confirm the selected call sign upon pressing Space or activating selection.

#### Scenario: Default call sign is pre-selected and confirmed with Space
- **WHEN** the player enters onboarding and presses Space without changing selection
- **THEN** the default call sign is selected and onboarding advances to the posture check

#### Scenario: Arrow keys navigate between call sign choices
- **WHEN** the player presses ArrowDown on the call sign selection step
- **THEN** the next call sign option becomes selected

### Requirement: Posture check presents three sequential ergonomics prompts

The posture check step SHALL display three successive ergonomics prompts (sit tall, wrists floating, eyes on screen), advancing to the next prompt upon pressing Space.

#### Scenario: Space confirms each posture prompt in order
- **WHEN** the player is at the posture check and presses Space three times
- **THEN** each posture prompt is confirmed and onboarding advances to find the beacons

### Requirement: Find the beacons guides hands to home row tactile markers

The find the beacons step SHALL highlight the F and J keys with an instructional message to locate the tactile bumps, await an F key press followed by a J key press, and complete onboarding upon receiving both keystrokes in order.

#### Scenario: Pressing F then J completes beacon orientation
- **WHEN** the player is at the beacon check and presses `f` followed by `j`
- **THEN** both beacon keys are registered as found and onboarding completes

### Requirement: Onboarding completion records profile and triggers launch

Upon completing the beacon orientation step, onboarding SHALL record the player's profile data with the chosen call sign and onboardingComplete marked true, and advance to level 0.1.

#### Scenario: Completed onboarding saves profile and advances to level 0.1
- **WHEN** the beacon check completes
- **THEN** the profile is saved with onboardingComplete true and the flow transitions to level 0.1
