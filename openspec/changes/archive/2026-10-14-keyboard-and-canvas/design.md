# Design

## Context

Stage 1 established the pure core simulation (`src/core/sim/waiting-lanes.ts`), the fixed-step loop (`src/engine/loop/fixed-step-loop.ts`), design tokens (`src/core/theme/tokens.ts`), and app navigation (`src/app/machines/app-flow.ts`). However, the Level screen remains a static placeholder (`<h1>Level</h1>`) with no keyboard capture and no rendering canvas.

To make levels playable, the engine layer must bridge real DOM keyboard events into simulation inputs and render placeholder lanes and notes via PixiJS v8. Per architectural rules (Horizontal 04 and `src/AGENTS.md`), per-frame render routines must allocate nothing, the engine must never inspect core simulation state directly, and React must never run per frame.

## Goals / Non-Goals

**Goals:**

- Build DOM keyboard capture in `src/engine/input/` that translates physical keystrokes into simulation steps via high-resolution timestamps, ignores auto-repeat, ignores dead/IME composition, and prevents browser actions for game keys (Space, Tab, Backspace, `'`, `/`, Enter).
- Implement `RenderOut` using PixiJS v8 in `src/engine/render/`, drawing nine colored placeholder lanes, the hit line, and note views.
- Ensure per-frame render routines perform zero object allocations by pooling and reusing display objects and text views.
- Update visual note representations strictly from level initialization and domain events (`Hit`, `Error`, `LevelEnded`), keeping simulation state encapsulated.
- Throttle HUD snapshot emissions in `src/engine/bridge/` to at most 20 Hz (>= 50 ms) into a Zustand store.
- Embed the canvas and engine lifecycle cleanly in `src/app/screens/level.tsx`.
- Verify in browser tests that keystrokes trigger hits and errors on the correct notes and Space does not scroll the viewport.

**Non-Goals:**

- Visual particle effects, shaders (bloom, glitch), screen shake, and final 3D game art (deferred to a later visual polish change).
- Tone.js audio playback and sound effects (deferred to Stage 2 procedural audio change).
- Flowing lanes, convoy groupings, and obstacle targets (waiting lanes only).

## Decisions

### 1. Keyboard Capture Inside Handler with Timestamp Advancement

`src/engine/input/keyboard.ts` attaches to `window` during active gameplay.

- **Timestamp Mapping:** Reads `event.timeStamp` (ms) and feeds it to `loop.input(event.timeStamp)`. The fixed-step loop catches up simulation ticks to that exact instant and executes pending step callbacks before input judging occurs.
- **Filtering:**
  - Ignores `event.repeat` to prevent auto-repeat spam.
  - Ignores dead keys (`event.key === "Dead"`) and IME composition (`event.isComposing`).
  - Ignores standalone modifiers (Shift, Control, Alt, Meta).
- **Physical Key and Shift Side:**
  - Reads `event.code` to determine Shift side: `ShiftLeft` sets flag bit 1, `ShiftRight` sets flag bit 2, both or neither sets none.
  - Key-up events set flag bit 0.
- **Default Prevention:**
  - Calls `event.preventDefault()` on game keys: Space (`" "`), Tab, Backspace, apostrophe (`'`), slash (`/`), and Enter.
  - Leaves unrelated keys (e.g. browser navigation, refresh, developer tools) unhindered.
- **Judging:**
  - Passes Unicode code point (`event.key.codePointAt(0)`) and flags to `run.apply(character, flags, outbox)`.
  - Drains the outbox and publishes domain events to `RenderOut` and the HUD bridge immediately.

*Alternatives considered:*
- *Polling key state in the animation loop:* Adds up to 16.6 ms of input latency and misses rapid taps or rollover releases between frames.
- *Processing input outside the fixed-step loop:* Causes timing desyncs and non-deterministic replays.

### 2. PixiJS v8 RenderOut Adapter with Pre-allocated Object Pools

`src/engine/render/pixi-render.ts` implements `RenderOut`.

- **Canvas & Scene Graph:**
  - Initializes PixiJS `Application` with `autoDensity: true`, `resolution: window.devicePixelRatio || 1`, and antialiasing.
  - Renders 9 lanes based on QWERTY finger assignments:
    - Lanes 0–3: Left pinky (`finger-l-pinky`), ring (`finger-l-ring`), middle (`finger-l-middle`), index (`finger-l-index`).
    - Lane 4: Thumb (`finger-thumb`).
    - Lanes 5–8: Right index (`finger-r-index`), middle (`finger-r-middle`), ring (`finger-r-ring`), pinky (`finger-r-pinky`).
  - Renders the transverse hit line across all lanes using `tokens.color.primary` (Signal gold).
- **Zero Allocations per Frame:**
  - Display objects for lanes, hit line, and note containers (background, glow, label text) are instantiated once during level initialization.
  - A note pool sized to the tuning queue depth plus incoming buffer is pre-allocated.
  - On each animation frame, `render(interpolation)` updates only mutable transform properties (`x`, `y`, `alpha`, `tint`, `visible`). No objects, arrays, or closures are created during the frame.
- **Event-Driven State Updates:**
  - Initial note characters and queue positions are loaded from the level definition at start.
  - When a `Hit` event arrives via `publish(events)`, the active note plays a hit-clear transition and the subsequent note activates.
  - When an `Error` event arrives, the active note flashes an error tint (using `tokens.color.destructive`).
  - The adapter never queries `run.activeNote()` or simulation internals during per-frame rendering.

*Alternatives considered:*
- *Dynamic creation and destruction of Pixi DisplayObjects per note:* Triggers frequent V8 garbage collection pauses, breaking 60 fps smoothness.
- *Direct inspection of simulation entities per frame:* Violates layer separation and makes rendering tightly coupled to simulation implementation.

### 3. Throttled HUD Snapshot Bridge

`src/engine/bridge/hud-bridge.ts` publishes HUD state to React.

- Maintains current score, combo streak, active character, and accuracy derived from level progress and domain events.
- Enforces a minimum interval of 50 ms (20 Hz) between snapshot emissions using `performance.now()`.
- Publishes to a lightweight Zustand store in `src/app/stores/hud.ts`.
- React HUD components subscribe to this store, avoiding per-frame re-renders.

*Alternatives considered:*
- *Direct store update on every step or hit:* Triggers unnecessary React reconciliations during fast typing bursts.
- *Passing simulation state into React context:* Causes wide re-renders across the screen tree.

### 4. Level Screen Lifecycle Management

`src/app/screens/level.tsx` wires the components together:

- Mounts an HTML `<canvas>` element.
- Instantiates `createFixedStepLoop`, `createWaitingLanesRun`, `PixiRenderAdapter`, keyboard capture listeners, and the HUD bridge.
- Starts animation frames via `startAnimationFrames`.
- Cleans up all listeners, stops the loop, and destroys the PixiJS application on unmount.

## Risks / Trade-offs

- **[WebGL Context in Vitest Browser Tests]** → Vitest browser tests run inside real Playwright Chromium browsers (`PLAYWRIGHT_BROWSERS_PATH=0`), where WebGL 2 is fully supported. Headless Node tests continue to use in-memory fakes.
- **[Font Loading for Note Text in Canvas]** → Canvas text uses Atkinson Hyperlegible Mono, already self-hosted and loaded via `@fontsource/atkinson-hyperlegible-mono`. Pre-warming the font before level start prevents layout shift.
- **[Keydown Interception of Browser Hotkeys]** → `preventDefault()` is restricted strictly to game keys (Space, Tab, Backspace, `'`, `/`, Enter) and only while the level is active.
- **[Garbage Collection Spikes]** → Object pooling for note views and persistent geometry instances guarantees zero per-frame heap allocations.

## Migration Plan

No database or local storage document migrations are required. The change replaces the placeholder level screen with the live engine canvas.
