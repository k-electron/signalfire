# Horizontal 04: Architecture

How the code is organized, how data and time flow through the game, and the rules that keep the game deterministic, testable, and fast.

## Decisions

| Topic | Decision |
|---|---|
| Code organization | Four layers: `core`, `engine`, `app`, `platform` |
| Dependency rule | `core` imports only `core` and Zod; the dependency-boundary check enforces the layer rules |
| Game objects | Plain TypeScript entities updated by system functions; no ECS library |
| Simulation timing | Fixed step with an accumulator; rendering interpolates |
| Input timing | Keystrokes use their event timestamps and apply at the step they happened in |
| Determinism | Seeded randomness everywhere; every run can be recorded as seed + inputs and replayed exactly |

## Layers

```
            ┌────────────────────────────┐
            │  app (React, XState,       │
            │       Zustand)             │
            └──────┬───────────────┬─────┘
                   │               │
                   ▼               ▼
            ┌────────────┐   ┌────────────┐
            │  engine    │   │  platform  │
            │  (loop,    │   │  (storage, │
            │   PixiJS,  │   │   puter,   │
            │   Tone.js) │   │   device)  │
            └──────┬─────┘   └──────┬─────┘
                   │                │
                   ▼                ▼
            ┌────────────────────────────┐
            │  core (pure logic, ports)  │
            └────────────────────────────┘
```

| Layer | Contains | May import |
|---|---|---|
| `core` | Pure, deterministic game logic and the interfaces (ports) it needs from the outside world. No DOM, no PixiJS, no React, no timers. Also holds the design tokens (plain constants). | Only `core` and Zod |
| `engine` | The runtime: loop, keyboard capture, PixiJS rendering, Tone.js audio. Implements the rendering and audio ports. | `core` |
| `platform` | Browser and cloud adapters: local storage, puter.js, device detection. Implements the storage and sync ports. | `core` |
| `app` | React screens, XState machines, Zustand stores. Wires everything together. | `core`, `engine`, `platform` |

A dependency-boundary check runs in CI and fails on any import that breaks these rules. The migration chain lives in `core`. verzod is not a dependency.

## Source layout

```
src/
├── core/
│   ├── input/        Keystroke model, judging (hit, error, Shift side, Static)
│   ├── curriculum/   Zones, levels, key sets, finger map, star bars
│   ├── content/      Text generation and runtime validation
│   ├── sim/          Entities, systems, spawning, level runtime
│   ├── scoring/      Score, stars, medals, gates, mods, ranks
│   ├── telemetry/    Metrics and checkpoint aggregation
│   ├── adaptive/     Key priority, repair runs, systems check, flight plan
│   ├── meta/         Dispatches, weekly goal, achievements
│   ├── replay/       Seeded randomness, run logs, replay runner
│   ├── schemas/      Zod schemas and the types derived from them
│   ├── theme/        Design tokens: colors, motion, sizes (plain constants)
│   └── ports/        Interfaces: Clock, Storage, CloudSync, AudioOut, RenderOut
├── engine/
│   ├── loop/         Fixed-step loop and clock
│   ├── input/        DOM keyboard capture → core input events
│   ├── render/       PixiJS scenes, entity views, shaders, effects
│   ├── audio/        Tone.js adapter and the music system
│   └── bridge/       Publishes HUD snapshots to stores
├── platform/
│   ├── storage/      Local storage adapter
│   ├── cloud/        puter.js adapter (loaded on demand)
│   └── device/       Desktop and keyboard-layout detection
├── app/
│   ├── machines/     XState: app flow, level lifecycle, sync
│   ├── stores/       Zustand: profile, progress, settings, telemetry, HUD
│   ├── screens/      Title, hub, maps, level, results, dossier, hangar, codex, settings
│   ├── components/   Shared UI built on shadcn
│   └── theme/        Generated token CSS and Tailwind setup
└── main.tsx
```

Game data lives in `content/` at the repo root. It is validated against `core/schemas` at build time and bundled.

## Game loop

- `requestAnimationFrame` drives the loop.
- The simulation advances in **fixed steps of 1/120 s**.
- Leftover time carries to the next frame through an accumulator.
- Frame time is clamped to 250 ms so returning to the tab doesn't trigger a burst of catch-up steps. Losing focus pauses the level (UI/UX vertical).
- Rendering interpolates between the previous and current simulation state using the leftover fraction. Interpolation is visual only; simulation and replays never read interpolated values.

## Input pipeline

```
keydown / keyup (DOM)
   │  engine/input: ignore auto-repeat, read character, physical key,
   │  Shift side, and the event's high-resolution timestamp
   ▼
advance simulation to the event's step
   │
   ▼
core/input: judge against the active character → domain events
   │  (Hit, Error, StaticHit, WordComplete, ...)
   ▼
event outbox ──▶ audio (plays immediately)
            ──▶ telemetry collector
            ──▶ render (shows on the next frame)
            ──▶ HUD bridge
```

- Input is processed **inside the key handler**: the loop advances the simulation to the step containing the event's timestamp, then judges it. Audio responds within the handler and visuals on the next frame, which meets the one-frame response target (Core Mechanics vertical).
- Key-up events are recorded for rollover measurement.
- Every input is appended to the run's log.

## Domain events

`core` communicates outward only through typed domain events, emitted to an outbox each step:

| Event | Emitted when |
|---|---|
| `Hit` | A correct keystroke |
| `Error` | A wrong keystroke |
| `StaticHit` | A Static target's key was pressed |
| `Miss` | A target passed the line or reached the ship |
| `WordComplete` | A word or enemy finished |
| `ComboChanged` | Combo tier rose or fell |
| `OverdriveChanged` | Overdrive started or ended |
| `ShieldChanged` | Shield level changed |
| `BeaconRescued` | A bonus target was typed |
| `PhaseChanged` | A level or boss phase began |
| `LevelEnded` | The level finished; carries the run summary |

Adapters (render, audio, telemetry, HUD) subscribe; they never reach into simulation state.

## Determinism and replay

### Rules for `core`

- No `Math.random`, `Date.now`, `performance.now`, or timers. Time comes from the step counter; randomness from a seeded generator passed in.
- Every generated thing (level content, spawn patterns, practice missions, Daily Signal) is derived from a seed.
- Simulation logic works in integer steps. Floating-point math is allowed for positions, but nothing that decides an outcome depends on it.

### Run logs

Every run produces a log: format version, level and tier, seed, content version, and the ordered list of inputs with their step numbers. Exact schemas are in the Data Model horizontal.

Run logs enable:

- **Ghost races:** replay the player's best run alongside them.
- **Daily Signal:** the same seed for every player on a given day.
- **Bug reproduction:** attach a run log to a bug report and replay it exactly.
- **Replay tests:** recorded runs replayed headlessly in CI must produce the same results.

### Known limit

Floating-point results can differ slightly between browsers. Outcomes are protected by the integer-step rule. Replays of the same browser engine match exactly; cross-browser replays may differ in visual detail but not in outcomes.

## Game objects

- Entities are plain typed objects in per-type lists (notes, enemies, beacons, projectiles).
- Systems are small functions that update lists each step (movement, spawning, arrival, judging).
- Particles and other visual-only objects live in `engine/render`, not in the simulation, and use object pools to avoid garbage-collection pauses.
- Views map entities to PixiJS display objects by ID; they are created and destroyed in response to events.

## React and the engine

- The level screen hosts the canvas. The level machine creates the engine instance when a level starts and disposes of it when the level ends.
- The engine publishes a small HUD snapshot (combo, rings, score, shield, Overdrive) to a Zustand store at most 20 times per second. The HUD renders from that store.
- React never renders per frame and never holds simulation state.

## State machines (XState)

| Machine | States (simplified) |
|---|---|
| **App flow** | boot → title → onboarding → hub ⇄ (galaxy map, zone map, dossier, hangar, codex, settings) → level → results → back to map or hub |
| **Level lifecycle** | loading → briefing → countdown → playing ⇄ paused → finishing → results; with an error state |
| **Sync** | Defined in the Persistence horizontal |

The browser back button sends a `back` event to the app-flow machine.

## Ports and adapters

| Port (in `core/ports`) | Adapter | Layer |
|---|---|---|
| `Clock` | Step clock driven by the loop | engine |
| `RenderOut` | PixiJS scene manager | engine |
| `AudioOut` | Tone.js music and effects | engine |
| `Storage` | Local storage | platform |
| `CloudSync` | puter.js | platform |

Tests use in-memory fakes for every port.

## Loading

- Screens that aren't needed at start (dossier, codex, hangar, settings) are code-split.
- The puter.js adapter is loaded only when sign-in is opened or a cloud session exists.
- Tone.js loads with the first user interaction, since audio can't start before it.
- Procedural textures are generated once at startup and cached.

## Errors

- An error inside a level moves the level machine to its error state; the player sees a friendly message and returns to the map. Progress up to the last checkpoint is safe.
- Each screen has a React error boundary.
- Errors are logged locally and can be attached to a bug report along with the run log.

## Sources

- [Fix Your Timestep (Gaffer on Games)](https://gafferongames.com/post/fix_your_timestep/)
- [JavaScript game loop foundations](https://codeincomplete.com/articles/javascript-game-foundations-the-game-loop)
- [W3C Event Timing API](https://www.w3.org/TR/2025/WD-event-timing-20250305/)
- [High-resolution event timestamps (WebKit)](https://webkit.googlesource.com/WebKit/+/8e7403520f2828457611bf784c9e727445631593%5E%21/Source/WebCore/dom/Event.h)
- [bitECS](https://cdn.jsdelivr.net/npm/bitecs@0.4.0/README.md) and [Miniplex](https://github.com/jure/miniplex), considered and not adopted
