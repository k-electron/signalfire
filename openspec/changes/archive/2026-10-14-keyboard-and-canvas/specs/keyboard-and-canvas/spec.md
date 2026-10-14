# Spec Delta

## Purpose

Translates browser keyboard events into simulation inputs without auto-repeat or page scrolling, and renders placeholder lanes, notes, and the hit line on a PixiJS canvas with throttled HUD snapshots.

## ADDED Requirements

### Requirement: DOM keyboard events convert to simulation inputs

The engine input listener SHALL capture keydown and keyup events, ignore repeated keydown events where `repeat` is true, ignore dead and IME composition events, and ignore standalone modifier keys. It SHALL extract the character, physical key code, Shift side from `event.code` (left, right, or none), and the high-resolution event timestamp.

#### Scenario: Normal keydown delivers input to the simulation step

- **WHEN** the player presses the f key at timestamp 16.6 ms with `repeat` false
- **THEN** the loop advances to step 2 and judges character 102 as a key-down event

#### Scenario: Key repeat is ignored

- **WHEN** a keydown event arrives with `repeat` true
- **THEN** no input is applied to the simulation and the simulation step does not advance

#### Scenario: Keyup event is delivered for rollover tracking

- **WHEN** the player releases the f key at timestamp 50.0 ms
- **THEN** the simulation records a key-up input at the corresponding step without judging an error

#### Scenario: Shift side is identified from code

- **WHEN** the player presses a key while ShiftLeft is held
- **THEN** the applied input flags indicate left-hand Shift

### Requirement: Game keys prevent default browser actions during a level

While a level is active, the engine input handler SHALL call `preventDefault` on keyboard events for Space, Tab, Backspace, apostrophe, slash, and Enter, preventing page scrolling and browser shortcuts.

#### Scenario: Space key does not scroll the page

- **WHEN** the player presses Space during an active level
- **THEN** default prevention is called on the event and the page scroll position remains unchanged

#### Scenario: Tab and Backspace prevent default navigation

- **WHEN** the player presses Tab or Backspace during an active level
- **THEN** default prevention is called on the event and focus does not leave the level canvas

### Requirement: Placeholder lanes and hit line render from tokens

The PixiJS canvas SHALL draw nine lanes corresponding to the four left fingers, thumb, and four right fingers, using finger colors from design tokens, and SHALL draw a transverse hit line using the primary token color.

#### Scenario: Nine colored lanes are visible

- **WHEN** the level canvas initializes
- **THEN** nine lanes are rendered, each colored with its designated finger token color

#### Scenario: Hit line is positioned across lanes

- **WHEN** the level canvas initializes
- **THEN** the hit line is rendered across all nine lanes at the target arrival position

### Requirement: Active note is highlighted in its assigned lane

The renderer SHALL position each note in the lane matching its finger reach, with home-row notes vertically centered in the lane and the thumb note centered in the thumb lane. The active note SHALL be visually highlighted with an active text glow.

#### Scenario: Level 1.1 first note sits in left index lane

- **WHEN** level 1.1 starts with seed `signalfire`
- **THEN** note f is rendered in the left index lane at the hit line and displays the active highlight

#### Scenario: Space note sits in thumb lane

- **WHEN** a space note becomes active
- **THEN** it is rendered in the center thumb lane

### Requirement: Domain events update note visual states

The `RenderOut` adapter SHALL process domain events received from the simulation outbox. On `Hit`, the hit note SHALL transition out and the next note SHALL become active. On `Error`, the active note SHALL display visual error feedback.

#### Scenario: Hit event clears the active note

- **WHEN** a Hit event is published to the render adapter
- **THEN** the current active note is cleared and the subsequent note activates

#### Scenario: Error event triggers visual feedback

- **WHEN** an Error event is published to the render adapter
- **THEN** the active note displays error styling while remaining the active note

### Requirement: Zero per-frame allocations during gameplay

The per-frame render ticker SHALL update existing display object transforms, tints, and visibility without allocating new display objects, graphics buffers, or closures during frame rendering.

#### Scenario: Animation frames run without allocating display objects

- **WHEN** the simulation runs for 60 consecutive animation frames
- **THEN** the number of instantiated PixiJS display objects remains constant

### Requirement: HUD snapshot is throttled to 20 Hz

The engine bridge SHALL publish HUD snapshots containing current score, combo, active character, and accuracy to the HUD store at most once every 50 milliseconds.

#### Scenario: Rapid events emit at most once per 50 ms window

- **WHEN** multiple keystrokes and simulation steps occur within a 20 ms interval
- **THEN** the HUD store receives at most one snapshot update during that interval
