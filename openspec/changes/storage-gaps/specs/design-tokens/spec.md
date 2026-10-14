# Spec Delta

## MODIFIED Requirements

### Requirement: Motion

The theme constants SHALL use the motion durations and easings from the design system. Micro easing SHALL be `ease-out`. Scene easing SHALL be the cubic-bezier control points 0.87, 0, 0.13, 1. The generated stylesheet SHALL copy those easing values from the constants.

#### Scenario: Four motion tokens

- **WHEN** the theme constants are read
- **THEN** `motion-micro` is 100ms ease-out, `motion-standard` is 240ms with spring stiffness 380 and damping 30, `motion-scene` is 650ms with cubic-bezier control points 0.87, 0, 0.13, 1, and `motion-celebrate` spans 1.2s to 2s

#### Scenario: The stylesheet copies the easing

- **WHEN** `pnpm tokens` writes the stylesheet
- **THEN** `--ease-micro` is `ease-out` and `--ease-scene` is `cubic-bezier(0.87, 0, 0.13, 1)`, both copied from the theme constants
