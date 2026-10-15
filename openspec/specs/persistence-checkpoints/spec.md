# persistence-checkpoints Specification

## Purpose

Coordinates saving player documents at game checkpoints, restoring state on startup, and requesting persistent browser storage eviction protection.

## Requirements

### Requirement: Profile is saved at the onboarding completion checkpoint

Upon completing onboarding, the system SHALL save the profile document containing callSign, onboardingComplete true, createdAt, and updatedAt timestamps to local storage via the storage port.

#### Scenario: Onboarding complete writes profile to local storage

- **WHEN** the player completes the onboarding sequence
- **THEN** the profile document is written to local storage with onboardingComplete true and rev incremented

### Requirement: Progress and run logs are saved at level completion checkpoint

Upon completing a level run, the system SHALL record cadet performance and save the updated progress document, the run log document, and the run index to local storage.

#### Scenario: Completing level 1.1 saves progress and run log

- **WHEN** level 1.1 run ends with earned stars
- **THEN** progress is saved with level 1.1 cadet tier stars, and a corresponding run log and run index are saved

### Requirement: Local storage state restores profile and progress on boot

At app startup, the system SHALL query local storage for existing profile and progress documents, restoring saved progress into state and treating visits with onboardingComplete true as returning player visits.

#### Scenario: Saved profile with onboardingComplete true marks returning visit

- **WHEN** the app boots with a stored profile where onboardingComplete is true
- **THEN** the app flow treats the session as a returning visit and skips onboarding

#### Scenario: Saved progress restores star counts into state

- **WHEN** the app boots with stored progress containing earned level stars
- **THEN** the restored stars are reflected in the zone map and player profile state

### Requirement: Persistent storage is requested after first star is earned

Upon completing a run where the player earns their first star, the system SHALL invoke navigator.storage.persist() when available to protect game storage from browser eviction.

#### Scenario: Earning first star requests storage persistence

- **WHEN** the player completes level 1.1 and earns at least 1 star
- **THEN** navigator.storage.persist() is invoked
