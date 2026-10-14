# Spec Delta

## Purpose

Typed targets, decode lines, and prose use Atkinson Hyperlegible Mono, loaded from the page's own origin, with a visible state on every character.

## ADDED Requirements

### Requirement: The typed-text font loads from the page origin

The served page SHALL load the family Atkinson Hyperlegible Mono by requesting its font file from that page's origin.

#### Scenario: Resolving the family

- **WHEN** the served page resolves the family Atkinson Hyperlegible Mono
- **THEN** every font file request uses that page's origin and the family becomes available

### Requirement: Font sources stay on the site

The document's content security policy SHALL allow font files from the site itself.

#### Scenario: The document policy

- **WHEN** the document is served with its content security policy
- **THEN** that policy includes `font-src 'self'`

### Requirement: Typed text uses the mono face and a type step

Typed text SHALL render in Atkinson Hyperlegible Mono at either the target step or the prose step.

#### Scenario: A target line

- **WHEN** typed text is shown at the target step
- **THEN** each character uses Atkinson Hyperlegible Mono at 40px with a 48px line height

#### Scenario: A prose line

- **WHEN** typed text is shown at the prose step
- **THEN** each character uses Atkinson Hyperlegible Mono at 26px with a 38px line height

### Requirement: Upcoming characters stay bright

An upcoming character SHALL be the foreground color at full opacity.

#### Scenario: An upcoming character

- **WHEN** a character is upcoming
- **THEN** it is shown as `#E6EAF5` at full opacity

### Requirement: The active character is the clearest mark

The active character SHALL be white, underlined, and carrying the small glow, at the same size as the other characters in the line.

#### Scenario: An active character

- **WHEN** a character is active
- **THEN** it is `#FFFFFF`, underlined, the same size as the other characters in that line, and its glow is a 0 0 8px shadow of the current accent at 40% opacity

### Requirement: Typed characters use the finger color

A typed character SHALL be shown in its finger's color at 40% opacity.

#### Scenario: One typed character for each finger

- **WHEN** typed text shows one typed character for each finger
- **THEN** left pinky is `#8B5CF6`, left ring is `#3B82F6`, left middle is `#22D3EE`, left index is `#2DD4BF`, right index is `#FACC15`, right middle is `#FB923C`, right ring is `#FB7185`, right pinky is `#E879F9`, and the thumb is `#E2E8F0`, each at 40% opacity

### Requirement: An error character flickers, then holds

An error character SHALL use the static color and flicker once over the micro duration, and SHALL remain in error until the caller marks it active.

#### Scenario: An error character

- **WHEN** a character is in error
- **THEN** it is `#9CA3AF` and flickers once over 100ms while remaining in error

#### Scenario: The caller clears the error

- **WHEN** the caller then marks that character active
- **THEN** it is `#FFFFFF`, underlined, and the same size as the other characters in that line

### Requirement: A pre-filled character is already typed

A pre-filled character SHALL use the typed treatment and a dotted outline in the finger color.

#### Scenario: A pre-filled character

- **WHEN** a character is pre-filled for the left index finger
- **THEN** it is `#2DD4BF` at 40% opacity with a 1px dotted outline in `#2DD4BF`

### Requirement: The line reads as its characters

Typed text SHALL expose its characters, including spaces, as one line of text.

#### Scenario: A word and a space

- **WHEN** typed text shows the characters `f`, a space, and `j`
- **THEN** the text content is `f j`, including the space

### Requirement: The font notice is included

The project's third-party notices SHALL include the copyright notice and the SIL Open Font License, Version 1.1, for the bundled Atkinson Hyperlegible Mono font.

#### Scenario: A reader opens the notices

- **WHEN** the third-party notices are read
- **THEN** they include that copyright notice and the SIL Open Font License, Version 1.1
