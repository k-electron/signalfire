# Horizontal 07: Design System

The tokens, fonts, components, and rules that make the React UI and the PixiJS canvas look like one game. Visual direction comes from the Art Direction vertical; this document turns it into something buildable.

## Decisions

| Topic | Decision |
|---|---|
| Theme | Dark only; zone accent changes per sector |
| Token source | `src/core/theme/tokens.ts` (plain constants), generating CSS variables for Tailwind and shadcn in `src/app/theme/`; the engine imports the same file |
| Typed text font | Atkinson Hyperlegible Mono |
| Display font | Space Grotesk |
| UI font | Inter |
| Font hosting | Self-hosted via Fontsource packages (no requests to third-party font servers) |
| Components | shadcn/ui base components plus custom game components |
| Workbench | Ladle |

## Token pipeline

```
src/core/theme/tokens.ts ──build step──▶ src/app/theme/tokens.css
        │                                   (CSS variables in OKLCH,
        │                                    mapped with @theme inline)
        │                                          │
        ▼                                          ▼
  PixiJS (engine/render)                 Tailwind + shadcn components
  imports numbers directly               use semantic classes
```

- `tokens.ts` is the only place colors, radii, shadows, and motion values are defined.
- `pnpm tokens` regenerates `tokens.css`; it also runs in `pnpm dev` and `pnpm build`.
- No component or renderer hardcodes a color or duration.

## Color tokens

Values are starting points to tune in playtesting. Hex shown for readability; generated CSS uses OKLCH.

### Semantic (shadcn)

| Token | Value | Use |
|---|---|---|
| `background` | `#0B1026` | App background behind panels |
| `foreground` | `#E6EAF5` | Default text |
| `card` | `#121A3A` at 72% opacity | Glass panels |
| `card-foreground` | `#E6EAF5` | |
| `muted` | `#1A2347` | Subtle surfaces |
| `muted-foreground` | `#8B95B8` | Secondary text |
| `border` | `#2A3566` | Panel borders |
| `primary` | `#FCD34D` (Signal gold) | Primary actions, stars |
| `primary-foreground` | `#1A1405` | |
| `accent` | Current zone accent | Focus rings, highlights |
| `ring` | Current zone accent | Keyboard focus |
| `destructive` | `#F43F5E` | Only for destructive actions (delete data, sign out) |
| `radius` | `14px` | Corner radius base |

### Fingers

From the Art Direction vertical. Used only where a key or finger is meant.

| Token | Hex |
|---|---|
| `finger-l-pinky` | `#8B5CF6` |
| `finger-l-ring` | `#3B82F6` |
| `finger-l-middle` | `#22D3EE` |
| `finger-l-index` | `#2DD4BF` |
| `finger-r-index` | `#FACC15` |
| `finger-r-middle` | `#FB923C` |
| `finger-r-ring` | `#FB7185` |
| `finger-r-pinky` | `#E879F9` |
| `finger-thumb` | `#E2E8F0` |

### Meaning

| Token | Value |
|---|---|
| `text-active` | `#FFFFFF` with glow |
| `beacon` | `#FCD34D` |
| `shield` | `#A5D8FF` |
| `static` | `#9CA3AF` (desaturated; rendered with glitch effects, not as a flat color) |

### Zones

The screen root carries `data-zone`, which sets `--zone-bg` and `--zone-accent`.

| Zone | Background | Accent |
|---|---|---|
| 0 Home Row Station | `#1E1B4B` | `#F5C46B` |
| 1 The Drift | `#0B1A33` | `#7DD3FC` |
| 2 Ember Reach | `#2A1030` | `#FB923C` |
| 3 The High Spires | `#062A30` | `#BAE6FD` |
| 4 The Undertow | `#04202A` | `#5EEAD4` |
| 5 Twin Suns | `#1F0F3D` | `#FBBF24` (second accent `#FB7185`) |
| 6 The Riverlight | `#0A1E4A` | `#22D3EE` |
| 7 The Counting Stars | `#0B1533` | `#D4A373` |
| 8 The Glyph Wastes | `#2A1A0E` | `#F59E0B` |
| 9 The Silent Core | `#1F2124` | `#9CA3AF` until restored |

## Typography

### Families

| Role | Font | License |
|---|---|---|
| Typed text (targets, decode, prose) | Atkinson Hyperlegible Mono | OFL (confirm the Mono package's license file before release) |
| Display (titles, big numbers) | Space Grotesk | OFL |
| UI | Inter | OFL |

### Scale

| Token | Font | Size / line height | Use |
|---|---|---|---|
| `type-target` | Mono | 40 / 48 | Single targets in lanes and on enemies |
| `type-prose` | Mono | 26 / 38 | Decode lines and passages |
| `display-xl` | Space Grotesk | 64 / 68 | Title screen, results score |
| `display-lg` | Space Grotesk | 40 / 44 | Screen titles |
| `display-md` | Space Grotesk | 28 / 32 | Section titles, rank |
| `ui-lg` | Inter | 18 / 26 | Briefings, dialogue |
| `ui-md` | Inter | 15 / 22 | Default UI text |
| `ui-sm` | Inter | 13 / 18 | Labels, captions |

Minimums from the Art Direction vertical: typed targets at least 32 px, prose at least 24 px.

## Surfaces and effects

| Token | Value |
|---|---|
| `glass` | `card` background, 16 px backdrop blur, 1 px border in `border` at 60% |
| `glow-sm` | 0 0 8 px current accent at 40% |
| `glow-md` | 0 0 18 px current accent at 45% |
| `glow-lg` | 0 0 36 px current accent at 50% |
| `focus` | 2 px ring in `ring` plus `glow-sm` |

## Motion tokens

From the Art Direction vertical. Exported as durations for CSS and as presets for the Motion library.

| Token | Duration | Easing |
|---|---|---|
| `motion-micro` | 100 ms | ease-out |
| `motion-standard` | 240 ms | spring (stiffness 380, damping 30) |
| `motion-scene` | 650 ms | expo in-out |
| `motion-celebrate` | 1.2–2 s | choreographed sequence |

## Layers

| Layer | z-index |
|---|---|
| Game canvas | 0 |
| HUD | 10 |
| Overlays (pause, briefing) | 20 |
| Modals and dialogs | 30 |
| Toasts | 40 |

## Icons

lucide-react, stroke width 1.75, sizes 16, 20, and 24 px. Icons inherit text color; accent-colored only when active.

## Components

### From shadcn

Button, Card, Dialog, Tabs, Tooltip, Progress, Slider, Switch, Separator, ScrollArea, and Sonner (toasts). All restyled through tokens; `glass` is the default surface.

### Game components

| Component | Purpose |
|---|---|
| `GlassPanel` | Standard panel surface |
| `StarRow` | 0–3 stars, with earn animation |
| `MedalBadge` | Medal with earned and locked states |
| `IntegrityVelocityRings` | Live HUD rings with star notches |
| `ComboMeter` | Signal lock tier and multiplier |
| `OverdriveBar`, `ShieldBar` | HUD meters |
| `KeyCap` | A single key in finger color, with pressed, active, and locked states |
| `MachineConsole` | The current machine's keys |
| `KeyboardHeatmap` | Full keyboard colored by mastery, accuracy, or speed |
| `FingerRadar` | Eight-point finger chart |
| `KeylingAvatar` | Keyling with its four mastery states |
| `Transmission` | Character dialogue panel with typing reveal and voice blips |
| `NodeMap` | Zone map nodes and paths |
| `BarrierMeter` | Stars held vs needed |
| `FlightPlanCard`, `DispatchCard` | Hub cards |
| `SyncStatus` | Top-bar sync indicator |
| `TypedText` | Upcoming, active, typed, error, and pre-filled character states |

## Rules

- Never hardcode a color, size, radius, shadow, or duration. Use tokens.
- Typed text always uses the Mono font and the `TypedText` states.
- Finger colors mean fingers. Don't use them for decoration.
- Gold (`primary`, `beacon`) means reward or primary action.
- Keyboard focus is always visible.

## Ladle

- Stories live next to components as `*.stories.tsx`.
- Every game component has a story per state (for example `StarRow`: 0, 1, 2, 3 stars, earning).
- Visual changes to components attach Ladle screenshots to the pull request (constitution C4).

## Sources

- [Theming shadcn with Tailwind v4 (shadcnblocks)](https://www.shadcnblocks.com/docs/blocks/theming)
- [shadcn Tailwind v4 notes](https://v2.shadcn.com/docs/tailwind-v4)
- [Atkinson Hyperlegible Mono (Fontsource)](https://fontsource.org/fonts/atkinson-hyperlegible-mono/about) and [design background](https://educatingalllearners.org/google-fonts-adds-braille-institutes-hyperlegible-typeface-for-all-to-use/)
- [Storybook vs Ladle vs Histoire (PkgPulse)](https://www.pkgpulse.com/guides/storybook-8-vs-ladle-vs-histoire-2026) and [Ladle v3](https://ladle.dev/blog/ladle-v3)
