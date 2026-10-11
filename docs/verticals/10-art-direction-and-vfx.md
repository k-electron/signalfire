# Vertical 10: Art Direction and VFX

How the game looks and moves.

## Visual pillars

1. **Luminous.** Light is the Signal. Everything good glows; everything Static is gray and broken.
2. **Readable.** The next character to type is always the clearest thing on screen.
3. **Alive.** Nothing is ever fully still: starfields drift, panels breathe, Keylings bob.
4. **Earned.** Visual intensity rises with the player's typing. A clean streak looks spectacular; a rough patch looks quieter, never ugly.

## Style

**Neon vector space.** Deep, dark backgrounds with glowing line-art geometry, soft bloom, and crisp vector shapes. Built from code (shapes, gradients, shaders, particles) rather than hand-painted art, so it can be produced without an illustrator and stays sharp at any resolution.

- **Backgrounds:** deep navy-to-indigo gradients, never pure black. Layered starfields and nebula gradients scroll at different speeds for depth.
- **Objects:** clean geometric silhouettes with glowing outlines and translucent fills.
- **Light:** bloom on bright elements, additive blending for particles, soft halos.
- **Texture:** a very light film grain over everything to avoid a sterile look.
- **Rendering:** a GPU-accelerated 2D renderer for gameplay and the hub. Lanes are flat with a slight tilt for depth; the hub is 2D. Bloom and glitch effects run as shaders.
- **The Static:** desaturated, flickering, broken. Horizontal scanlines, color-channel splitting, displaced pixel blocks, and noise. It's the only thing in the game that looks "wrong," which makes it instantly recognizable.

## Color

### Finger colors

Each hand has a color family so the player learns hands at a glance and fingers on a closer look. Left hand is cool, right hand is warm.

| Finger | Color | Hex |
|---|---|---|
| Left pinky | Violet | `#8B5CF6` |
| Left ring | Blue | `#3B82F6` |
| Left middle | Cyan | `#22D3EE` |
| Left index | Teal | `#2DD4BF` |
| Right index | Yellow | `#FACC15` |
| Right middle | Orange | `#FB923C` |
| Right ring | Rose | `#FB7185` |
| Right pinky | Fuchsia | `#E879F9` |
| Thumbs | Silver-white | `#E2E8F0` |

These colors are used everywhere a key appears: lanes, notes, console keys, the dossier heatmap, Keylings.

### Meaning colors

| Meaning | Treatment |
|---|---|
| Active character | Brightest white with a glow and underline |
| Correct (typed) | Fades to a dim version of its finger color |
| Error | Static treatment: a brief gray glitch flicker, not a color. Avoids clashing with finger colors and ties errors to the story. |
| Static targets | Desaturated gray with scanlines |
| Bonus (beacons) | Gold `#FCD34D` |
| Stars | Gold-white |
| Shield | Pale blue |
| Overdrive | The zone's accent color, at full saturation |

### Zone palettes

| Zone | Sector | Background | Accent |
|---|---|---|---|
| 0 | Home Row Station | Warm indigo | Soft gold |
| 1 | The Drift | Midnight blue | Pale cyan |
| 2 | Ember Reach | Dark plum | Ember orange |
| 3 | The High Spires | Deep teal | Crystal white-blue |
| 4 | The Undertow | Abyss green-blue | Bioluminescent aqua |
| 5 | Twin Suns | Deep violet | Twin gold and coral |
| 6 | The Riverlight | Dark sapphire | Bright river cyan |
| 7 | The Counting Stars | Navy | Brass and starlight white |
| 8 | The Glyph Wastes | Dark umber | Rune amber |
| 9 | The Silent Core | Gray (desaturated) | None, until repairs restore every zone's accent |

Each zone starts partly gray (Static-held). As the player clears levels, color returns to the map and the backgrounds.

## Typography

| Use | Style |
|---|---|
| Typed text (targets, decode lines, prose) | Highly legible monospace with distinct letterforms (clear differences between l, 1, I and O, 0). Large: at least 32 px for single targets, 24 px for prose. |
| Titles and big numbers | Geometric display sans, wide and confident |
| UI text | Clean humanist or geometric sans at comfortable reading sizes |
| Dash and characters | Same UI sans, with a subtle per-character typing reveal |

Font choices must be open-licensed; selection belongs to the design system.

### Typed text states

| State | Look |
|---|---|
| Upcoming | Bright, full opacity |
| Active | Brightest, glowing, underlined, slightly larger |
| Typed | Dimmed to 40% in the finger's color |
| Error on active | Static flicker on the character, then back to active |
| Pre-filled (unlearned key) | Shown as already typed, with a faint dotted outline |

## Readability rules

- The active character has the highest contrast on screen.
- No particle, flash, or shake covers the active character or the next two upcoming characters.
- Moving text never rotates more than 15° and never moves faster than the player can read.
- Background motion slows and dims behind dense text (decode and prose).

## Machines

Each machine's silhouette grows in complexity, and its number of console lights matches the keys it has.

| Machine | Look |
|---|---|
| Skiff | Small, round, stubby; eight glowing thrusters in a row underneath; one central pulse light |
| Dart | Sleek arrow; a second row of thrusters above the first |
| Lancer | Longer, with a keel; a third row of thrusters below |
| Twinwing | Two swept wings, each with a reactor glowing at the tip |
| Courier | Long, smooth, built for speed; light trails ripple behind |
| Ranger | Adds a targeting array across the nose: ten small lights |
| Archon | Heavy, ornate; panels etched with glowing symbols |
| Flagship Signalfire | Large and elegant; every light from every previous machine, arranged like a keyboard of stars |

Machine mods appear on the ship: anchors on the pinky thrusters, cannons on the index thrusters, fins for the Undertow, a crown of light for Signal Crown.

## Keylings

- Small, round, softly glowing spirits. Each one's body is shaped around its character's glyph.
- Colored by their finger.
- Personalities show in motion: F and J bob in sync; Q peeks out from behind its key; Space is wide and slow.

| Mastery | Look |
|---|---|
| New | Faint outline, sleepy |
| Learning | Soft glow, awake |
| Solid | Bright glow, bouncy |
| Mastered | Radiant, with a small orbiting spark |

## Wardens

| Warden | Look |
|---|---|
| The Peeker | A cluster of floating eyes around a flickering core |
| Rushfang | A lean, angular beast of jagged static lines that leaves afterimages |
| The Drifter | A wispy, translucent shape with long tendrils that tug at targets |
| The Undertow | A huge eel of dark static, slow, with glowing gill lines |
| The Twin Tyrant | Two masked heads on one body, each facing the other's sun |
| The Stammer | A shape that skips and repeats frames, like a stuck video |
| The Tally | A clockwork disc covered in rotating numbered rings |
| Glyphmaw | A huge stone mouth, its teeth carved with symbols |
| The Hush | Almost nothing: a pale, perfectly smooth shape with no outline, in a gray void |

## Environments

| Location | Description |
|---|---|
| Home Row Station (hub) | A ring station viewed at an angle, eight docking arms, twin beacon towers, a central platform. Grows over the campaign: new lights, docked ships, crew silhouettes, and Keylings on the arms. |
| The Drift | Slow tumbling debris, distant station lights |
| Ember Reach | Warm, glowing clouds and floating embers |
| The High Spires | Towering crystal columns, light refracting through them |
| The Undertow | Deep currents drawn as flowing lines, bioluminescent particles |
| Twin Suns | Two suns on opposite sides of the screen, their light meeting in the middle |
| The Riverlight | A bright river of letters flowing through space |
| The Counting Stars | A star cluster where stars carry tiny glowing numbers |
| The Glyph Wastes | Floating ruins carved with glowing symbols |
| The Silent Core | A gray, empty void |

## Interface style

- **Panels:** dark frosted glass with slight translucency, thin luminous borders, 12–16 px corner radius.
- **Icons:** simple line icons matching the vector look.
- **Components:** a standard component library, themed to this palette (dark by default).
- **Buttons and focus:** a soft outer glow in the zone accent; keyboard focus is always clearly visible, since much of the game is navigated by keyboard.

## Motion language

| Category | Duration | Easing |
|---|---|---|
| Micro (key flash, hover) | 80–120 ms | Ease-out |
| Standard (panel open, card move) | 200–280 ms | Spring with light overshoot |
| Scene (screen change, warp) | 500–800 ms | Expo ease-in-out |
| Celebration (stars, rank up) | 1–2 s | Choreographed sequence |

### Signature transitions

- **Hub to level:** the camera dives toward the sector on the map; stars stretch into lines (a warp); the level fades in from the stretched light.
- **Level to results:** time slows over the final explosion, then the results panel slides up through the debris.
- **Zone map node to level:** the node expands to fill the screen.
- **Barrier break:** the Static wall cracks like glass, then shatters into noise that turns to light.
- **Zone restored:** a wave of color sweeps across the gray map.

## VFX catalog

| Effect | Description |
|---|---|
| Hit burst | 8–12 particles in the finger's color; burst outward and fade in 300 ms |
| Lane flash | The lane's rail brightens briefly on each hit |
| Console key press | The key on the machine's console dips and flashes |
| Word complete | Bracket breaks into particles; size scales with word length |
| Enemy destroyed | Shape fractures along its outline into glowing shards; larger words make larger blasts |
| Combo tier up | A ring expands from the hit line; lane rails gain a brighter glow |
| Overdrive | Screen-edge glow in the zone accent; background saturation and bloom increase; camera pushes in slightly |
| Shield hit | Pale blue ripple across the ship |
| Static hit | Scanline ripple across the playfield for 200 ms |
| Beacon rescue | Gold beam pulls the beacon to the ship |
| Keyling rescue | Keyling bursts out of a Static shell and flies into the console |
| Star core flight | Star flies from the results panel into the station's beacon |
| Boss entrance | Screen darkens, boss assembles from Static, title card |
| Boss defeat | Slow motion, white flash, boss dissolves into Keylings or light |
| Crack repair | Crack shatters into gray shards that turn white and vanish |
| Graduation | New machine lowered into the hangar under spotlights |

### Effect budgets

- Particles near the active target fade within 300 ms.
- Screen shake: explosions and bosses only, maximum 4 px.
- Full-screen flashes: boss events only, under 150 ms.
- Effects scale down automatically if the frame rate drops.

