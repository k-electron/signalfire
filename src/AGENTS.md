# src

Four layers. Design: `docs/horizontals/04-architecture.md`. Imports go one way: `app` imports everything; `engine` and `platform` import only `core`; `core` imports only itself and Zod. CI enforces this.

## core

Pure game logic: input judging, simulation, scoring, telemetry, adaptive engine, content generation, replay, schemas, ports, design tokens. Must run in Node with no browser. Design: `docs/horizontals/05-data-model.md`.

- No DOM, `window`, timers, `Math.random`, `Date.now`, or `performance.now`. Time is the step counter; randomness comes from the seeded generator passed in.
- Outcomes (hits, stars, unlocks) depend only on integer steps and inputs. Floats are allowed for positions, never for decisions.
- Talk to the outside world only through ports in `ports/` and domain events in the outbox.
- Functions take data and return data. No hidden module-level state.
- Test-first (constitution C4); every OpenSpec scenario maps to a test. Invariants get property-based tests (stars never decrease, merges never lose earned items, generated text uses only allowed keys). Use in-memory fakes for ports.
- Every saved document is a verzod versioned entity in `schemas/`. A new version needs a Zod schema, a pure `up` function from the previous version, and a fixture in `schemas/fixtures/<document>/v<n>.json`. Never delete old versions or drop earned progress.

## engine

The runtime: fixed-step loop, keyboard capture, PixiJS rendering, Tone.js audio, HUD bridge. Design: `docs/verticals/04-core-mechanics-and-game-feel.md`, `09-procedural-audio.md`, `10-art-direction-and-vfx.md`.

- Never import React, stores, or `src/app`.
- Implement `core` ports (`RenderOut`, `AudioOut`, `Clock`); react to domain events. Never read or mutate simulation state directly.
- Judge input inside the key handler: advance the simulation to the event's step, then judge.
- No allocations in per-frame code. Pool display objects and particles.
- Target 60 fps and keystroke-to-visual within one frame.
- The active character is always the clearest thing on screen. No effect covers it or the next two characters. Particles near it fade within 300 ms.
- Screen shake only for explosions and bosses, max 4 px. No shake on errors.
- Colors and durations come from `src/core/theme/tokens.ts`.
- Wrap Tone.js behind `AudioOut` so it can be replaced.
- Debug tools go in `engine/dev/`, behind `import.meta.env.DEV`.
- Visual and feel changes need screenshots or a recording plus the playtest checklist (`docs/horizontals/08-testing-and-dev-practices.md`). Use the Level Lab with a fixed seed so captures are reproducible.

## platform

Adapters for browser storage, puter.js cloud sync, and device detection. Design: `docs/horizontals/06-persistence-and-sync.md`.

- Implement the `Storage` and `CloudSync` ports.
- Local storage is IndexedDB through idb-keyval. No `localStorage`.
- Every read is validated and migrated (Zod + verzod) before use.
- Rotate the previous version into a backup slot before every write; back up before migrations.
- Write at checkpoints only, inside the `signalfire-write` Web Lock.
- Merge logic lives in `core`. This layer moves data; it doesn't decide outcomes.
- Load puter.js on demand only. `puter.auth.signIn()` must be triggered by a click.
- Sync never blocks play. Failures retry with backoff and show in the sync status.
- Never send data anywhere except IndexedDB and the player's own Puter account.

## app

React screens, XState machines, Zustand stores, theme CSS, shared components. Design: `docs/verticals/11-ui-ux-and-onboarding.md`, `docs/horizontals/07-design-system.md`, `03-tech-stack.md`.

- Screens render from the app-flow machine's state. Navigation is a machine event, not a router.
- Zustand holds data (profile, progress, settings, telemetry, HUD snapshot). Machines hold flow. Don't duplicate one in the other.
- The HUD reads the throttled snapshot store. Never subscribe React to per-frame values.
- Build on shadcn components styled through tokens. Never hardcode colors, sizes, radii, or durations.
- Typed text always uses the `TypedText` component and the Mono font.
- Finger colors only mean fingers; gold only means reward or primary action.
- Everything works from the keyboard: Space is the primary action, Escape is back, arrows move, number keys pick menu items. Focus is always visible.
- Animate UI with Motion using the motion tokens. Never animate the same element from both Motion and PixiJS.
- Every game component has Ladle stories for each of its states.
- Code-split screens not needed at start (dossier, codex, hangar, settings).
- Copy is short and plain; mistakes are described with what to try, never with judgment.
