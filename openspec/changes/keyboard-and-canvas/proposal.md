# Proposal

## Why

Stage 1 established pure core logic and placeholder screens, but gameplay still lacks physical input and visual feedback. To make levels playable as an arcade game, the browser runtime needs direct keyboard capture that translates physical keystrokes into simulation events at the right simulation step, and a 2D rendering canvas that draws the lanes, hit line, and notes with zero per-frame allocation.

## What Changes

- Add DOM keyboard capture in `src/engine/input/` that listens to `keydown` and `keyup`, reads character, physical key, Shift side, ignores held-key auto-repeat, ignores dead/IME composition, and suppresses default browser behavior (`preventDefault`) for game keys (Space, Tab, Backspace, `'`, `/`, Enter) during an active level.
- Feed event timestamps into `FixedStepLoop` to advance the simulation to the event's step before judging, matching the single-frame response target.
- Add a PixiJS v8 `RenderOut` adapter in `src/engine/render/` that renders nine placeholder lanes, notes, the hit line, and the active note, colored by design tokens (`src/core/theme/tokens.ts`).
- Ensure per-frame render routines allocate nothing (display objects and text views are pooled/reused).
- Add an engine-to-app bridge in `src/engine/bridge/` that publishes a throttled HUD snapshot (combo, score, active note, accuracy) to a Zustand store at most 20 times per second (20 Hz).
- Wire the engine runtime into `src/app/screens/level.tsx`, initializing the engine instance on level mount and tearing it down cleanly on unmount.
- Host the engine runtime within `src/app/screens/level.tsx`, initializing the engine instance on level mount and tearing it down cleanly on unmount.
- **Out of scope:** visual particles, screen shake, bloom/glitch shaders, audio output (Tone.js), and final 3D/animated game art.

## Capabilities

### New Capabilities

- `keyboard-and-canvas`: Captures DOM keyboard events into core simulation steps without auto-repeat or default browser scrolling, and renders placeholder lanes, notes, the hit line, and the active note to a PixiJS canvas from domain events using token colors, with throttled HUD snapshot updates.

### Modified Capabilities

None.

## Impact

- **New code:** `src/engine/input/` (DOM keyboard listener and step converter), `src/engine/render/` (PixiJS scene manager and lane/note views), `src/engine/bridge/` (throttled HUD snapshot publisher), and `src/app/stores/hud.ts`.
- **Modified code:** `src/app/screens/level.tsx` (hosts PixiJS canvas, attaches engine input listener, and creates/disposes engine instance).
- **Dependencies:** Add `pixi.js` (PixiJS v8) and `zustand` to runtime dependencies in `package.json`.
- **Tests:** Node unit tests for input event translation and HUD snapshot throttling; Vitest browser component/smoke tests for keyboard capture, default prevention, and canvas rendering.

## Principles served

- **P1. The learning is the game**: Keystrokes are captured directly and judged strictly on physical key and character.
- **P2. Accuracy before speed**: Keys are captured at their exact hardware timestamps without loose timing windows or artificial timing grades.
- **P3. Simpler machines, not training wheels**: Renders the exact nine lanes and active notes corresponding to the unlocked home-row keys.
- **P9. Spectacle is a requirement**: Sets up the GPU-accelerated PixiJS v8 foundation targeting 60 fps and keystroke-to-visual response within one frame.
- **P10. An honest mirror**: The HUD receives live performance metrics through throttled snapshots without lagging the simulation.
- **P13. Thin, then deep**: Proves the engine side of the walking skeleton: real keys in, PixiJS canvas out, with placeholder graphics before complex VFX.

## Docs implemented

- `docs/ROADMAP.md` Stage 2: "The engine side of play: real keys in, placeholder lanes out."
- `docs/verticals/04-core-mechanics-and-game-feel.md`: Input model (character, physical key, ignore repeat, Shift side from `event.code`, preventDefault on browser keys), nine lanes colored by finger tokens, hit line, active note glow, response within one frame.
- `docs/horizontals/04-architecture.md`: Input pipeline (DOM event -> advance loop -> judge -> outbox -> render/HUD), fixed-step loop integration, React and engine separation, `RenderOut` port implementation.
- `docs/horizontals/03-tech-stack.md`: PixiJS v8 canvas rendering outside React, Zustand for app stores/HUD snapshots, strict layer boundaries.
- `docs/horizontals/07-design-system.md`: Finger colors (`finger-l-*`, `finger-r-*`, `finger-thumb`), `text-active`, `primary` for hit line, imported directly from `src/core/theme/tokens.ts`.
- `src/AGENTS.md`: Engine rules: import only `core`, never import React or stores in `src/engine`, no allocations in per-frame code, implement `RenderOut`, react to domain events.

## Departures

- Audio output (`AudioOut` / Tone.js) is deferred to a dedicated audio change in Stage 2. The engine wires rendering and HUD bridging first to keep this change focused and within the single-capability boundary.
- Horizontal 04 describes views mapping entities to PixiJS objects in response to domain events. Since `waiting-lanes` emits `Hit`, `Error`, and `LevelEnded`, the engine initializes note views from the level definition and updates posture and active states as step advances and domain events arrive, without reading simulation internals.

## Dependencies

- **`pixi.js`** (`^8.0.0`):
  - *Purpose:* WebGL 2 / WebGPU 2D canvas rendering for gameplay lanes, notes, and hit line.
  - *Size impact:* ~400 KB minified (~100 KB gzipped).
  - *License:* MIT.
  - *Alternatives considered:* Raw WebGL (excessive boilerplate and maintenance), Three.js (3D engine overhead not required for 2D lane rendering), `@pixi/react` (rejected in Horizontal 03 due to per-frame React re-render hazards).
- **`zustand`** (`^5.0.0`):
  - *Purpose:* Minimal store for publishing throttled HUD snapshots from the engine bridge to React overlays.
  - *Size impact:* ~1.2 KB minified/gzipped.
  - *License:* MIT.
  - *Alternatives considered:* React Context (triggers full subtree re-renders per snapshot), Redux Toolkit (unnecessary boilerplate).

## Assumptions

- DOM keyboard events provide high-resolution `event.timeStamp` in milliseconds, consistent with `performance.now()` used by `FixedStepLoop`.
- The engine's keyboard capture attaches to `window` while the Level screen is mounted and playing, and detaches when paused or unmounted.
- `event.preventDefault()` is invoked for Space, Tab, Backspace, apostrophe (`'`), slash (`/`), and Enter when the level is active, preventing browser scrolling and shortcuts.
- Placeholder lanes draw 9 lanes: 4 left fingers, 1 thumb (Space), 4 right fingers. Finger token colors are mapped based on standard QWERTY finger assignments.
- Note views for the level are pre-allocated or pooled upon level setup; during the loop, note positions and visibility are updated without creating new objects or closures.
- HUD snapshots are published via an engine bridge callback at most once every 50 ms (20 Hz).

## Constitution check

- **C1.** One new capability: `keyboard-and-canvas`. No modified capabilities. Apply waits for Karim's approval.
- **C2.** Principles served, docs implemented, and departures are detailed above.
- **C3.** Karim approves this proposal before apply. Pull request requires review and green CI.
- **C4.** Logic tests (DOM event mapping, timestamp calculation, HUD bridge throttling) are written test-first. Visual and input behavior is verified by Vitest browser tests and a manual playtest checklist.
- **C5.** TypeScript strict. No `any`, no `@ts-ignore`.
- **C6.** No MADR required; follows established architecture decisions in Horizontal 03 and 04.
- **C7.** Runtime dependencies `pixi.js` and `zustand` are named and justified above.
- **C8.** Complies with repo and `src/AGENTS.md` instructions.
- **C9.** Proposal, specs, design, and tasks land together.
- **C10.** Non-trivial change; independent fresh-context review is tracked in tasks.
