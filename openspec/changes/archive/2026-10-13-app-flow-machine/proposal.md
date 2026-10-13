# Proposal

## Why

Stage 1 includes the app-flow machine skeleton. The served page is still one heading, so nothing decides which screen is showing.

## What Changes

- Add the XState app-flow machine for the states and transitions in horizontal 04's app-flow row: boot, title, onboarding, hub, galaxy map, zone map, dossier, hangar, codex, settings, level, and results.
- Render one placeholder from the current state. The title placeholder keeps the Signalfire heading and shows "Press Space to start."
- Move between those placeholders with Space, Escape, arrows, and number keys, as vertical 11 describes. The browser Back button sends `back`.
- Give each placeholder an error boundary with a short message and a way back.
- **BREAKING** for the empty-page contract: production, preview, and `pnpm dev` show the title screen, not the word Signalfire alone.

Out of this change: real screen contents, the onboarding script, the level-lifecycle machine (briefing, countdown, playing, paused, and its error state), the sync machine, Zustand stores, the engine and canvas, audio, Motion, shadcn, and Ladle.

## Capabilities

### New Capabilities

- `app-flow`: Which screen is showing, the transitions between those screens, the placeholder for each state, keyboard movement, and the browser Back button.

### Modified Capabilities

- `static-hosting`: Production and preview show the title screen (the Signalfire heading and the start prompt), not an empty page with no other visible text.
- `hermetic-toolchain`: `pnpm dev` shows that same title screen.

`design-tokens`, `test-harness`, and `layer-boundaries` still require the Signalfire heading. The title screen keeps it, so those requirements do not change.

## Impact

- New runtime dependencies: `xstate` 5.33.2 and `@xstate/react` 6.1.0. Justified under Constitution check.
- New: `src/app/machines/`, placeholder screens under `src/app/screens/`, a Node test for every transition, a browser test for keyboard, focus, and the error boundary, and `e2e/app-flow.spec.ts`.
- Edited: `src/app/app.tsx`, `package.json`, `pnpm-lock.yaml`, and the purpose sentence in `openspec/specs/hermetic-toolchain/spec.md`. Archive does not take a purpose from a delta for an existing capability, and that sentence still says the repo serves an empty page.
- Unchanged: `src/core`, `src/engine`, `src/platform`, the harness smokes, and the roadmap status. Stage 1 stays "Not started".

## Principles served

- **P13.** This is the thin shell: every screen in the flow exists as a placeholder before any one of them is real.
- **P9** is strained. Placeholders do not animate, and this change does not add Motion. That is accepted because stage 1 is the skeleton and feel is a later stage.
- P1 through P8 and P10 through P12 are not served. Nothing here scores typing, saves progress, or plays audio.

## Docs implemented

- `docs/ROADMAP.md` Stage 1, the app-flow machine skeleton. The status cell stays "Not started".
- `docs/horizontals/04-architecture.md`: the app-flow row, "the browser back button sends a `back` event", and a React error boundary per screen. The level placeholder does not host a canvas or create an engine (React and the engine).
- `docs/horizontals/03-tech-stack.md` Boundaries: XState owns which screen is visible. Screens render from the machine. This is not a router.
- `docs/verticals/11-ui-ux-and-onboarding.md`: the screen map and the keyboard controls, applied to placeholders.
- `src/AGENTS.md` (app): screens render from the machine, navigation is an event, and dossier, codex, hangar, and settings are code-split.

## Departures

- Horizontal 04 marks the app-flow row as simplified. This change reads it as the state list below, and uses vertical 11 where the row has no edge. The docs are not edited. The reading is an assumption; correct it at approval if it is wrong.
  - Hub exchanges directly with galaxy map, zone map, dossier, hangar, codex, and settings.
  - Galaxy map also opens the zone map. Back from the zone map returns to the screen that opened it.
  - A level is entered only from the zone map. Finishing it goes to results. Results goes to the zone map or the hub, and does not return to the level.
  - Title goes to onboarding only when the visit is a first run. The row shows that chain and not the returning skip.
  - Dispatches, account, the gate screen, the desktop warning, and hub modals are not states. Briefing and pause belong to the level-lifecycle machine.
- Vertical 11's "two steps to play", the five-minute onboarding script, the feature-introduction schedule, and "any key skips a scene" are not this skeleton. Onboarding is one placeholder: Space continues, Escape goes back. The doc is not edited.
- Vertical 11 says the first keystroke on the title unlocks audio. This change has no audio. The doc is not edited.
- Horizontal 04's level-machine error state, and attaching an error to a bug report, are out. The boundary logs with `console.error` and sends nothing off the device. The doc is not edited.
- Screen transitions are instant. Motion is not added. Ladle is not installed, so these placeholders have no stories. Those docs are not edited.

## Assumptions

- `firstRun` is an input to the machine. The shell passes `true` until a later change can read progress. Tests may pass `false`. There is no store.
- On the hub, keys 1 to 5 open Galaxy map, Dossier, Hangar, Codex, and Settings, in that order. Zone map is a further hub item, reached with arrows and Space, not with a number key. On the galaxy map, Space opens the zone map.
- On results, Continue is pre-selected and Space goes to the zone map. A second item goes to the hub. Escape and browser Back from results go to the zone map. Opening results replaces the level history entry, so Back does not reopen the level.
- The address path stays `/`. History entries exist so Back fires. They are not deep links.
- Browser Back on the title screen stays on the title screen, inside the app.
- Placeholder text is the screen name, plus the title prompt from vertical 11. The boundary says "Something went wrong."
- Space on the level placeholder finishes the level. Pause is not a state here.

## Constitution check

- **C1.** One new capability, `app-flow`, plus requirement deltas for the empty-page specs this skeleton makes false. Not a C1 exemption. Apply waits for approval.
- **C2.** Principles, docs, and departures are stated above.
- **C3.** Karim approves this proposal before apply. The agent does not merge and does not push to `main`.
- **C4.** Transitions are logic: tests are written failing first, and every transition scenario maps to a Node test. Screen flow is not in C4's named logic-domain list. This change still tests it first, because invalid transitions are why the tech stack chooses XState, and the done-when requires those tests. Keyboard, focus, the error boundary, and browser Back map to browser tests. One end-to-end test walks title, onboarding, hub, and settings, then back by Escape and by the browser Back button. Placeholders get the playtest checklist; most items are N/A.
- **C5.** Strict TypeScript. No `any`. No `@ts-ignore`.
- **C6.** No decision record. The simplified-row reading is an assumption above, reversible before apply.
- **C7.** Two runtime dependencies.
  - `xstate` 5.33.2, MIT. Purpose: the screen statechart, so a forbidden transition cannot be represented. Size: the published `xstate.umd.min.js` is 47,478 bytes (14,649 gzip). The production ESM chunks that entry can reach are 163,727 bytes raw and 38,783 bytes gzip concatenated; `sideEffects` is false, so Vite drops unused chunks. The npm unpacked size is 2,313,340 bytes because the tarball includes every build, the types, and the maps. Alternatives, from horizontal 03: a router library, or ad-hoc booleans. A hand-rolled table would reimplement the thing this change exists to make explicit.
  - `@xstate/react` 6.1.0, MIT. Peers: `xstate` ^5.28 and React 19, both already satisfied. Purpose: start, stop, and subscribe to the actor under the StrictMode already used in `src/main.tsx`. Size: ESM 6,831 bytes (2,293 gzip); unpacked 37,966 bytes; `sideEffects` false. Alternative: a hand-rolled effect. Rejected because StrictMode's double mount would restart the actor and can push a second history entry.
  - Motion, Zustand, and shadcn are not added.
- **C8.** No `AGENTS.md` edit. `src/AGENTS.md` already says screens render from the app-flow machine.
- **C9.** Code, tests, the lockfile, the delta specs, and `tasks.md` land together. The empty-page requirements are updated here, not left stale. Roadmap status stays "Not started". Archive copies the deltas into `openspec/specs/`.
- **C10.** Non-trivial. The fresh-context review is a task.
