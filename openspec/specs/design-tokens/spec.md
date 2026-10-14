# design-tokens Specification

## Purpose

One theme source for colors, type, surfaces, and motion, shared by the page and the renderer, with generated CSS that stays in sync.

## Requirements

### Requirement: Semantic colors

The theme constants SHALL use the semantic colors and the base radius from the design system.

#### Scenario: Semantic values

- **WHEN** the theme constants are read
- **THEN** background is `#0B1026`, foreground is `#E6EAF5`, card is `#121A3A` at 72% opacity, card foreground is `#E6EAF5`, muted is `#1A2347`, muted foreground is `#8B95B8`, border is `#2A3566`, primary is `#FCD34D`, primary foreground is `#1A1405`, destructive is `#F43F5E`, accent and ring are the current zone accent, and the base radius is 14px

### Requirement: Finger colors

The theme constants SHALL use the finger colors from the design system.

#### Scenario: Finger hex values

- **WHEN** the theme constants are read
- **THEN** `finger-l-pinky` is `#8B5CF6`, `finger-l-ring` is `#3B82F6`, `finger-l-middle` is `#22D3EE`, `finger-l-index` is `#2DD4BF`, `finger-r-index` is `#FACC15`, `finger-r-middle` is `#FB923C`, `finger-r-ring` is `#FB7185`, `finger-r-pinky` is `#E879F9`, and `finger-thumb` is `#E2E8F0`

### Requirement: Meaning colors

The theme constants SHALL use the meaning colors from the design system.

#### Scenario: Meaning hex values

- **WHEN** the theme constants are read
- **THEN** `text-active` is `#FFFFFF` and uses `glow-sm`, `beacon` is `#FCD34D`, `shield` is `#A5D8FF`, and `static` is `#9CA3AF`

### Requirement: Zone colors

The theme constants SHALL use each zone's background and accent from the design system.

#### Scenario: Zone table

- **WHEN** the theme constants are read
- **THEN** zone 0 is background `#1E1B4B` and accent `#F5C46B`, zone 1 is `#0B1A33` and `#7DD3FC`, zone 2 is `#2A1030` and `#FB923C`, zone 3 is `#062A30` and `#BAE6FD`, zone 4 is `#04202A` and `#5EEAD4`, zone 5 is `#1F0F3D` and `#FBBF24` with second accent `#FB7185`, zone 6 is `#0A1E4A` and `#22D3EE`, zone 7 is `#0B1533` and `#D4A373`, zone 8 is `#2A1A0E` and `#F59E0B`, and zone 9 is `#1F2124` and `#9CA3AF`

### Requirement: Type scale

The theme constants SHALL use the font families and the type scale from the design system.

#### Scenario: Families and sizes

- **WHEN** the theme constants are read
- **THEN** the typed-text family is Atkinson Hyperlegible Mono, the display family is Space Grotesk, the UI family is Inter, and the size and line height in pixels are `type-target` 40/48, `type-prose` 26/38, `display-xl` 64/68, `display-lg` 40/44, `display-md` 28/32, `ui-lg` 18/26, `ui-md` 15/22, and `ui-sm` 13/18

### Requirement: Surfaces

The theme constants SHALL use the glass, glow, and focus values from the design system.

#### Scenario: Glass, glow, and focus

- **WHEN** the theme constants are read
- **THEN** glass uses the card color, a 16px backdrop blur, and a 1px border in the border color at 60% opacity; `glow-sm` is a 0 0 8px shadow of the current accent at 40% opacity; `glow-md` is 0 0 18px at 45%; `glow-lg` is 0 0 36px at 50%; and focus is a 2px ring in the ring color plus `glow-sm`

### Requirement: Motion

The theme constants SHALL use the motion durations and easings from the design system. Micro easing SHALL be `ease-out`. Scene easing SHALL be the cubic-bezier control points 1, 0, 0, 1. The generated stylesheet SHALL copy those easing values from the constants.

#### Scenario: Four motion tokens

- **WHEN** the theme constants are read
- **THEN** `motion-micro` is 100ms ease-out, `motion-standard` is 240ms with spring stiffness 380 and damping 30, `motion-scene` is 650ms with cubic-bezier control points 1, 0, 0, 1, and `motion-celebrate` spans 1.2s to 2s

#### Scenario: The stylesheet copies the easing

- **WHEN** `pnpm tokens` writes the stylesheet
- **THEN** `--ease-micro` is `ease-out` and `--ease-scene` is `cubic-bezier(1, 0, 0, 1)`, both copied from the theme constants

### Requirement: Stacking layers

The theme constants SHALL use the stacking order from the design system.

#### Scenario: Layer order

- **WHEN** the theme constants are read
- **THEN** the game canvas is 0, the HUD is 10, overlays are 20, modals and dialogs are 30, and toasts are 40

### Requirement: Icon metrics

The theme constants SHALL use the icon stroke and sizes from the design system.

#### Scenario: Stroke and sizes

- **WHEN** the theme constants are read
- **THEN** the stroke width is 1.75 and the sizes are 16px, 20px, and 24px

### Requirement: Colors are renderer integers

Each documented hex color SHALL also be available as the integer for that hex.

#### Scenario: Background integer

- **WHEN** the theme constants are read
- **THEN** the background integer is `0x0B1026` and every other documented hex color's integer equals that hex

### Requirement: Generated colors are OKLCH

`pnpm tokens` SHALL write a theme stylesheet whose colors are the OKLCH form of the theme constants. A second run SHALL leave that stylesheet unchanged.

#### Scenario: Regeneration is stable

- **WHEN** `pnpm tokens` runs twice
- **THEN** both runs write the same stylesheet bytes, and the background color in that stylesheet is the OKLCH form of `#0B1026`

### Requirement: The zone attribute selects the zone colors

The theme stylesheet SHALL set the zone background and zone accent from `data-zone`. Zone 5 SHALL also set the second accent. Glow shadows SHALL use the selected accent.

#### Scenario: Each zone id selects its pair

- **WHEN** the document `data-zone` is one of `0` through `9`
- **THEN** the zone background and zone accent are that zone's colors, `data-zone` `5` also sets second accent `#FB7185`, and the glow shadows use the selected accent

### Requirement: Dev regenerates the stylesheet

`pnpm dev` SHALL regenerate the theme stylesheet before it serves the page.

#### Scenario: Dev starts from the constants

- **WHEN** `pnpm dev` starts
- **THEN** the theme stylesheet is regenerated before the page is served

### Requirement: Build regenerates the stylesheet

`pnpm build` SHALL regenerate the theme stylesheet before it produces the production build.

#### Scenario: Build starts from the constants

- **WHEN** `pnpm build` runs
- **THEN** the theme stylesheet is regenerated before the production assets are emitted

### Requirement: A matching stylesheet passes the check

`pnpm tokens --check` SHALL succeed when the theme stylesheet matches the theme constants, and SHALL leave that stylesheet unchanged.

#### Scenario: Check leaves a fresh stylesheet alone

- **WHEN** `pnpm tokens --check` runs and the stylesheet already matches the constants
- **THEN** the command succeeds and the stylesheet bytes stay the same

### Requirement: Lint fails when the stylesheet is stale

`pnpm lint` SHALL fail when the theme stylesheet differs from the stylesheet `pnpm tokens` would write.

#### Scenario: A drifted stylesheet fails lint

- **WHEN** the theme stylesheet differs from the stylesheet `pnpm tokens` would write and `pnpm lint` runs
- **THEN** `pnpm lint` fails

### Requirement: The page uses the semantic colors

The served page SHALL paint the document with the semantic background and foreground. The visible heading SHALL be Signalfire.

#### Scenario: The page shows the token colors

- **WHEN** the page is served
- **THEN** the document background is `#0B1026`, the document text color is `#E6EAF5`, and the visible heading is Signalfire
