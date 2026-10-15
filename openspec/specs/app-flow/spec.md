# app-flow Specification

## Purpose

Decides which screen is showing and how the player moves between the placeholder screens, including with the browser Back button.

## Requirements

### Requirement: The flow starts at boot

A new flow SHALL be at boot until the shell is ready.

#### Scenario: A new flow is boot

- **WHEN** a flow is created and the shell is not ready
- **THEN** the flow is boot

#### Scenario: Ready leaves boot for the title

- **WHEN** the shell becomes ready
- **THEN** the flow is the title

#### Scenario: Going back from boot stays at boot

- **WHEN** the flow is boot and it is asked to go back
- **THEN** the flow stays boot

### Requirement: The title follows the visit

From the title, asking to begin SHALL open onboarding when the visit is a first run, and SHALL open the hub when it is not. A shell that is not told otherwise SHALL treat the visit as a first run. Asking to go back SHALL leave the flow on the title.

#### Scenario: A first run opens onboarding

- **WHEN** the visit is a first run and the flow is asked to begin from the title
- **THEN** the flow is onboarding

#### Scenario: A returning visit opens the hub

- **WHEN** the visit is not a first run and the flow is asked to begin from the title
- **THEN** the flow is the hub

#### Scenario: An untold visit is a first run

- **WHEN** the shell is not told what kind of visit this is and the flow is asked to begin from the title
- **THEN** the flow is onboarding

#### Scenario: Back from the title stays on the title

- **WHEN** the flow is the title and it is asked to go back
- **THEN** the flow stays the title

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

### Requirement: The hub opens its screens

From the hub, the flow SHALL open the galaxy map, the zone map, the dossier, the hangar, the codex, and settings. When the hub opens, the galaxy map item SHALL be selected.

#### Scenario: The hub opens the galaxy map

- **WHEN** the flow is asked to open the galaxy map from the hub
- **THEN** the flow is the galaxy map

#### Scenario: The hub opens the zone map

- **WHEN** the flow is asked to open the zone map from the hub
- **THEN** the flow is the zone map

#### Scenario: The hub opens the dossier

- **WHEN** the flow is asked to open the dossier from the hub
- **THEN** the flow is the dossier

#### Scenario: The hub opens the hangar

- **WHEN** the flow is asked to open the hangar from the hub
- **THEN** the flow is the hangar

#### Scenario: The hub opens the codex

- **WHEN** the flow is asked to open the codex from the hub
- **THEN** the flow is the codex

#### Scenario: The hub opens settings

- **WHEN** the flow is asked to open settings from the hub
- **THEN** the flow is settings

#### Scenario: The hub selects the galaxy map first

- **WHEN** the hub opens
- **THEN** the galaxy map item is selected

### Requirement: Hub screens return to the hub

Asking to go back from the galaxy map, the dossier, the hangar, the codex, or settings SHALL return to the hub.

#### Scenario: Back from the galaxy map returns to the hub

- **WHEN** the flow is asked to go back from the galaxy map
- **THEN** the flow is the hub

#### Scenario: Back from the dossier returns to the hub

- **WHEN** the flow is asked to go back from the dossier
- **THEN** the flow is the hub

#### Scenario: Back from the hangar returns to the hub

- **WHEN** the flow is asked to go back from the hangar
- **THEN** the flow is the hub

#### Scenario: Back from the codex returns to the hub

- **WHEN** the flow is asked to go back from the codex
- **THEN** the flow is the hub

#### Scenario: Back from settings returns to the hub

- **WHEN** the flow is asked to go back from settings
- **THEN** the flow is the hub

### Requirement: The galaxy map opens the zone map

Asking to open the zone map from the galaxy map SHALL open the zone map. Asking to go back from that zone map SHALL return to the galaxy map.

#### Scenario: The galaxy map opens the zone map

- **WHEN** the flow is asked to open the zone map from the galaxy map
- **THEN** the flow is the zone map

#### Scenario: Back returns to the galaxy map

- **WHEN** the zone map was opened from the galaxy map and the flow is asked to go back
- **THEN** the flow is the galaxy map

### Requirement: The zone map remembers what opened it

Asking to go back from a zone map that was opened from the hub SHALL return to the hub.

#### Scenario: Back returns to the hub

- **WHEN** the zone map was opened from the hub and the flow is asked to go back
- **THEN** the flow is the hub

### Requirement: Finishing the level opens results

Asking to finish the level SHALL open results. Continue SHALL be selected. Asking to go back, or asking to return to the zone map, SHALL open the zone map. Asking to return to the hub SHALL open the hub.

#### Scenario: Finish opens results

- **WHEN** the flow is asked to finish the level
- **THEN** the flow is results and Continue is selected

#### Scenario: Back from results opens the zone map

- **WHEN** the flow is asked to go back from results
- **THEN** the flow is the zone map

#### Scenario: Return to the zone map opens the zone map

- **WHEN** the flow is asked to return to the zone map from results
- **THEN** the flow is the zone map

#### Scenario: Return to the hub opens the hub

- **WHEN** the flow is asked to return to the hub from results
- **THEN** the flow is the hub

### Requirement: Back from the hub returns along the visit

Asking to go back from the hub SHALL return to onboarding when the hub was opened from onboarding, and SHALL return to the title when the hub was opened from the title.

#### Scenario: Back returns to onboarding

- **WHEN** the hub was opened from onboarding and the flow is asked to go back
- **THEN** the flow is onboarding

#### Scenario: Back returns to the title

- **WHEN** the hub was opened from the title and the flow is asked to go back
- **THEN** the flow is the title

### Requirement: An unoffered request stays put

Asking for an action the current screen does not offer SHALL leave the flow on that screen.

#### Scenario: Starting a level from the title stays on the title

- **WHEN** the flow is asked to start the level from the title
- **THEN** the flow stays the title

#### Scenario: Finishing from the hub stays on the hub

- **WHEN** the flow is asked to finish from the hub
- **THEN** the flow stays the hub

#### Scenario: Beginning again from the level stays on the level

- **WHEN** the flow is asked to begin from the level
- **THEN** the flow stays the level

### Requirement: The title screen shows the name and the start prompt

The title screen SHALL show a heading Signalfire and the text "Press Space to start."

#### Scenario: The title shows the name and the prompt

- **WHEN** the title screen is showing
- **THEN** the player sees a heading Signalfire and the text "Press Space to start."

### Requirement: Each later screen shows its name

Onboarding, the hub, the galaxy map, the zone map, the dossier, the hangar, the codex, settings, the level, and results SHALL each show a heading of that screen's name, and no other screen's heading.

#### Scenario: Onboarding shows its name

- **WHEN** onboarding is showing
- **THEN** the player sees a heading Onboarding and does not see a heading Signalfire

#### Scenario: The hub shows its name

- **WHEN** the hub is showing
- **THEN** the player sees a heading Hub

#### Scenario: The galaxy map shows its name

- **WHEN** the galaxy map is showing
- **THEN** the player sees a heading Galaxy map

#### Scenario: The zone map shows its name

- **WHEN** the zone map is showing
- **THEN** the player sees a heading Zone map

#### Scenario: The dossier shows its name

- **WHEN** the dossier is showing
- **THEN** the player sees a heading Dossier

#### Scenario: The hangar shows its name

- **WHEN** the hangar is showing
- **THEN** the player sees a heading Hangar

#### Scenario: The codex shows its name

- **WHEN** the codex is showing
- **THEN** the player sees a heading Codex

#### Scenario: Settings shows its name

- **WHEN** settings is showing
- **THEN** the player sees a heading Settings

#### Scenario: The level shows its name

- **WHEN** the level is showing
- **THEN** the player sees a heading Level

#### Scenario: Results shows its name

- **WHEN** results is showing
- **THEN** the player sees a heading Results

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

### Requirement: Escape goes back

Escape SHALL ask the flow to go back.

#### Scenario: Escape on onboarding returns to the title

- **WHEN** the player presses Escape on onboarding
- **THEN** the player sees the title heading

#### Scenario: Escape on the title stays on the title

- **WHEN** the player presses Escape on the title
- **THEN** the player still sees the title heading

#### Scenario: Escape on the hub returns to onboarding when opened from onboarding

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

### Requirement: Number keys pick a destination

On the hub, 1, 2, 3, 4, and 5 SHALL open the galaxy map, the dossier, the hangar, the codex, and settings. On results, 1 SHALL open the zone map and 2 SHALL open the hub. A number key on the title SHALL leave the title showing.

#### Scenario: 1 on the hub opens the galaxy map

- **WHEN** the player presses 1 on the hub
- **THEN** the player sees the galaxy map heading

#### Scenario: 2 on the hub opens the dossier

- **WHEN** the player presses 2 on the hub
- **THEN** the player sees the dossier heading

#### Scenario: 3 on the hub opens the hangar

- **WHEN** the player presses 3 on the hub
- **THEN** the player sees the hangar heading

#### Scenario: 4 on the hub opens the codex

- **WHEN** the player presses 4 on the hub
- **THEN** the player sees the codex heading

#### Scenario: 5 on the hub opens settings

- **WHEN** the player presses 5 on the hub
- **THEN** the player sees the settings heading

#### Scenario: 1 on results opens the zone map

- **WHEN** the player presses 1 on results
- **THEN** the player sees the zone map heading

#### Scenario: 2 on results opens the hub

- **WHEN** the player presses 2 on results
- **THEN** the player sees the hub heading

#### Scenario: 1 on the title stays on the title

- **WHEN** the player presses 1 on the title
- **THEN** the player still sees the title heading

### Requirement: Arrows move the selection and stop at the ends

ArrowDown and ArrowRight SHALL select the next item. ArrowUp and ArrowLeft SHALL select the previous item. The selection SHALL stop at the first and last items. The hub items, in order, SHALL be Galaxy map, Dossier, Hangar, Codex, Settings, and Zone map. The results items, in order, SHALL be Continue and Hub. The galaxy map and the zone map SHALL each have one item, and an arrow there SHALL leave that screen showing.

#### Scenario: ArrowDown on the hub selects the dossier

- **WHEN** the galaxy map item is selected on the hub and the player presses ArrowDown
- **THEN** the dossier item is selected and the hub heading is showing

#### Scenario: ArrowUp on the first hub item stays there

- **WHEN** the galaxy map item is selected on the hub and the player presses ArrowUp
- **THEN** the galaxy map item stays selected

#### Scenario: ArrowDown on the last hub item stays there

- **WHEN** the zone map item is selected on the hub and the player presses ArrowDown
- **THEN** the zone map item stays selected

#### Scenario: ArrowRight matches ArrowDown on the hub

- **WHEN** the galaxy map item is selected on the hub and the player presses ArrowRight
- **THEN** the dossier item is selected

#### Scenario: ArrowDown on results selects Hub

- **WHEN** Continue is selected on results and the player presses ArrowDown
- **THEN** Hub is selected and the results heading is showing

#### Scenario: Space after that arrow opens the hub

- **WHEN** Hub is selected on results and the player presses Space
- **THEN** the player sees the hub heading

#### Scenario: ArrowDown on the galaxy map stays on the galaxy map

- **WHEN** the player presses ArrowDown on the galaxy map
- **THEN** the player still sees the galaxy map heading

### Requirement: The browser Back button goes back and stays in the app

The browser Back button SHALL ask the flow to go back. On the title, the player SHALL remain on the title, in the app. From results, the player SHALL land on the zone map.

#### Scenario: Browser Back from settings returns to the hub

- **WHEN** the player is on settings and presses the browser Back button
- **THEN** the player sees the hub heading and the address path is still `/`

#### Scenario: Browser Back from the title stays on the title

- **WHEN** the player is on the title and presses the browser Back button
- **THEN** the player still sees the title heading and the address path is still `/`

#### Scenario: Browser Back from results opens the zone map

- **WHEN** the player is on results and presses the browser Back button
- **THEN** the player sees the zone map heading

### Requirement: A click activates that control

Activating a control with the pointer SHALL ask for the same destination as selecting it and pressing Space.

#### Scenario: Clicking Settings on the hub opens settings

- **WHEN** the player clicks Settings on the hub
- **THEN** the player sees the settings heading

#### Scenario: Clicking Continue on results opens the zone map

- **WHEN** the player clicks Continue on results
- **THEN** the player sees the zone map heading

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

### Requirement: A failed screen offers a way back

When the screen that is showing fails to render, the player SHALL see the text "Something went wrong." and a Back control. The flow SHALL stay on that screen until the player activates Back, which SHALL ask the flow to go back.

#### Scenario: A failed settings screen shows the message

- **WHEN** the settings screen fails to render
- **THEN** the player sees "Something went wrong." and a Back control, and the flow is still settings

#### Scenario: Back leaves the failed screen

- **WHEN** the settings screen has failed and the player activates Back
- **THEN** the player sees the hub heading and does not see "Something went wrong."

### Requirement: A player can walk to settings and return

A player SHALL be able to move from the title to the hub and settings, then return to the hub by Escape and, after opening settings again, by the browser Back button.

#### Scenario: Keyboard and browser Back

- **WHEN** the player presses Space on the title, 5 on the hub, Escape, 5 again, and then the browser Back button
- **THEN** the player sees, in order, the hub heading, the settings heading, the hub heading, the settings heading, and the hub heading

### Requirement: The zone map opens the level, and back opens pause

Asking to start the level from the zone map SHALL open the level. Asking to go back from the level SHALL open pause.

#### Scenario: The zone map opens the level

- **WHEN** the flow is asked to start the level from the zone map
- **THEN** the flow is the level

#### Scenario: Back from the level opens pause

- **WHEN** the flow is asked to go back from the level
- **THEN** the flow is pause

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

