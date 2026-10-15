# Spec Delta: zone-map

## Purpose

Presents the sector level nodes, paths, and earned star ratings for a zone, enabling level launch.

## ADDED Requirements

### Requirement: Zone map displays level nodes with earned star ratings

The zone map screen SHALL display the level nodes for the active zone, showing the earned star count (0 to 3 stars) for each node based on the current progress document.

#### Scenario: Zone 1 displays level 1.1 with earned stars
- **WHEN** the zone map opens for Zone 1 and progress contains 1 star for level 1.1
- **THEN** the level 1.1 node displays 1 star (★☆☆)

#### Scenario: Unplayed level displays zero stars
- **WHEN** the zone map opens and progress has no record for a level
- **THEN** that level node displays 0 stars (☆☆☆)

### Requirement: Pre-selected level node launches level briefing

The zone map SHALL pre-select the current active level node and launch its briefing upon pressing Space or clicking the node.

#### Scenario: Space on pre-selected node launches briefing
- **WHEN** the player is on the zone map with level 1.1 selected and presses Space
- **THEN** the flow transitions to the level screen for level 1.1
