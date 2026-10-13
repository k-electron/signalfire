# Design

## Context

See proposal.md for why. `App` renders one heading, Signalfire. `src/main.tsx` mounts it in `StrictMode`. The page already uses the generated theme (`shadow-focus` is `0 0 0 2px var(--ring), var(--glow-sm)`). The layer check allows `xstate` in `src/app` and rejects it in `src/engine`. Harness tests still expect the Signalfire heading. Pre-push runs Node tests only.

## Goals / Non-Goals

**Goals:**

- One pure machine for the transitions in `specs/app-flow/spec.md`, and a shell that renders a placeholder from its state.
- Keyboard, pointer, and the browser Back button all ask that machine. They do not navigate on their own.

**Non-Goals:**

- See proposal.md. No level-lifecycle machine, no sync machine, no stores, no canvas, no router, no deep link.

## Decisions

### The machine is pure, the shell is React

`src/app/machines/app-flow.ts` imports `xstate` only. It exports the machine, the event union, and `keyToEvent`. Node tests import that module and `createActor`. They do not render.

`src/app/app.tsx` renders the shell. The shell uses `useMachine` from `@xstate/react`. That hook stops the actor on effect cleanup and puts the snapshot back, which is what `StrictMode` in `src/main.tsx` does on its double mount. A hand-rolled effect would start again at boot.

`@xstate/react` 6.1.0 depends on `use-isomorphic-layout-effect` and `use-sync-external-store` (both MIT). They are transitive. Do not add them directly.

`App` takes `firstRun?: boolean`, default `true`. `src/main.tsx` does not pass it. Tests pass `false` for a returning visit. The input is fixed for the lifetime of the actor.

### States, context, and events

States: `boot`, `title`, `onboarding`, `hub`, `galaxyMap`, `zoneMap`, `dossier`, `hangar`, `codex`, `settings`, `level`, `results`. The value is one of those strings.

Context:

| Field | Meaning |
|---|---|
| `firstRun` | From the actor input. Default `true`. |
| `hubFrom` | `onboarding` or `title`. Set only when the hub is entered from that screen. Preserved when a hub screen goes back, and when results returns to the hub. |
| `zoneFrom` | `hub` or `galaxyMap`. Set when that screen opens the zone map. |
| `hubIndex` | `0` to `5`. Reset to `0` whenever the hub is entered. |
| `resultsIndex` | `0` or `1`. Reset to `0` whenever results is entered. |

Hub items, in order: Galaxy map, Dossier, Hangar, Codex, Settings, Zone map. Results items: Continue, Hub. One exported table drives the buttons, the digits, and Space, so the order cannot drift.

Events: `ready`, `begin`, `continue`, `openGalaxy`, `openDossier`, `openHangar`, `openCodex`, `openSettings`, `openZone`, `startLevel`, `finish`, `toZoneMap`, `toHub`, `selectNext`, `selectPrevious`, `back`.

Transitions:

| From | Event | To |
|---|---|---|
| `boot` | `ready` | `title` |
| `title` | `begin`, and `firstRun` | `onboarding` |
| `title` | `begin`, and not `firstRun` | `hub`, `hubFrom` `title` |
| `onboarding` | `continue` | `hub`, `hubFrom` `onboarding` |
| `onboarding` | `back` | `title` |
| `hub` | `openGalaxy` | `galaxyMap` |
| `hub` | `openDossier` | `dossier` |
| `hub` | `openHangar` | `hangar` |
| `hub` | `openCodex` | `codex` |
| `hub` | `openSettings` | `settings` |
| `hub` | `openZone` | `zoneMap`, `zoneFrom` `hub` |
| `hub` | `back`, `hubFrom` `onboarding` | `onboarding` |
| `hub` | `back`, `hubFrom` `title` | `title` |
| `galaxyMap` | `openZone` | `zoneMap`, `zoneFrom` `galaxyMap` |
| `galaxyMap` | `back` | `hub` |
| `zoneMap` | `startLevel` | `level` |
| `zoneMap` | `back`, `zoneFrom` `galaxyMap` | `galaxyMap` |
| `zoneMap` | `back`, `zoneFrom` `hub` | `hub` |
| `level` | `finish` | `results`, `resultsIndex` `0` |
| `level` | `back` | `zoneMap` |
| `results` | `toZoneMap` | `zoneMap` |
| `results` | `toHub` | `hub` |
| `results` | `back` | `zoneMap` |
| `dossier`, `hangar`, `codex`, `settings` | `back` | `hub` |
| `hub`, `results` | `selectNext` / `selectPrevious` | same screen, index moves and stops at the ends |

Any other event is ignored, including `back` on `boot` and `title`, `ready` after `boot`, `startLevel` on `title`, `finish` on `hub`, and `begin` on `level`.

`selectNext` is ArrowDown and ArrowRight. `selectPrevious` is ArrowUp and ArrowLeft. Index `0` is selected on entry, which is Galaxy map on the hub and Continue on results.

### Keys and clicks call the machine

`keyToEvent(snapshot, key)` returns one event or nothing. The shell listens on the wrapper, ignores `event.repeat`, and ignores the key when meta, ctrl, or alt is held. A handled key calls `preventDefault` so Space does not scroll.

| Key | Event |
|---|---|
| Space on `title` | `begin` |
| Space on `onboarding` | `continue` |
| Space on `hub` | the open event for `hubIndex` |
| Space on `galaxyMap` | `openZone` |
| Space on `zoneMap` | `startLevel` |
| Space on `level` | `finish` |
| Space on `results` | `toZoneMap` or `toHub` from `resultsIndex` |
| Space on `dossier`, `hangar`, `codex`, `settings` | nothing |
| Escape | `back` |
| 1 to 5 on `hub` | galaxy, dossier, hangar, codex, settings |
| 1 and 2 on `results` | `toZoneMap`, `toHub` |
| Arrows on `hub` or `results` | `selectNext` or `selectPrevious` |

A hub button click sends that item's open event. Continue sends `toZoneMap`. Hub on results sends `toHub`. Buttons use `tabIndex={-1}` so Space is handled once, on the wrapper, and not also as a button click.

### One history trap, not a visit stack

The address path stays `/`. On mount, if `history.state.signalfire` is not `"app-flow"`, `pushState` that marker. `popstate` sends `back`, then `pushState`s the marker again.

Escape sends `back` and does not call `history.back()`. Both paths ask the machine the same thing. The trap is what keeps Back on the title inside the app: the machine ignores `back` there, and the handler puts the marker back.

A visit stack is the wrong model. Continue and "return to the hub" are not pops, and `history.back()` is async, so the stack would disagree with `hubFrom` and `zoneFrom`. Back from results opens the zone map because that is the `back` transition, not because a level entry was replaced.

The `StrictMode` remount must not push a second marker. The state check above is that guard.

### Placeholders

Boot renders nothing. The shell sends `ready` from an effect. The title is the first screen the player reads. Existing heading assertions retry, so the empty boot frame is fine.

Each later screen is a heading of its name: Onboarding, Hub, Galaxy map, Zone map, Dossier, Hangar, Codex, Settings, Level, Results. The title heading is Signalfire, with the text "Press Space to start."

The title heading uses `text-display-xl`. Other headings use `text-display-lg`. The prompt uses `text-ui-lg`. The wrapper uses `outline-none` and `focus:shadow-focus`. No hardcoded color, size, or duration. Do not set a font on `html` or `body`.

The selected hub or results button has `aria-current="true"`.

When the screen changes, focus the wrapper (`tabIndex={-1}`) so the next key works without a click.

Dossier, hangar, codex, and settings are `React.lazy` imports. The others are eager. `Suspense` fallback is a paragraph "Loading", not a heading, inside the boundary so a failed import is caught.

### One boundary per screen

A class boundary wraps the screen body. `key` is the screen id, so each screen has its own boundary and a new screen clears the last failure. `componentDidCatch` calls `console.error`. It does not call `fetch` or any other send.

The failure UI is the text "Something went wrong." and a button named Back. Back sends `back`. The keydown listener and `data-screen` live on the wrapper outside the boundary, so Escape still works and the flow id is still settings while the heading is gone.

### Tests

Node file `src/app/machines/app-flow.test.ts`: one test per scenario from "The flow starts at boot" through "An unoffered request stays put". Assert `snapshot.value` and, where the scenario names a selection, `hubIndex` or `resultsIndex`. Name the test with the scenario name.

Browser file `src/app/app-flow.browser.test.tsx`: headings, Space, Escape, digits, arrows, clicks, focus, the title trap, browser Back from results, and the settings failure. Leave `src/app/app.browser.test.tsx` as the harness smoke.

`e2e/app-flow.spec.ts` uses `e2e/fixtures.ts`. It runs the "Keyboard and browser Back" scenario, and it checks the address path is still `/` after browser Back from settings. That scenario covers "Browser Back from settings returns to the hub". `page.goBack()` is the browser Back button. Wait for the title heading before the first key, so the trap is installed.

The settings failure test stubs the settings module so its render throws, opens settings, sees the message and `data-screen="settings"`, activates Back, and sees the hub heading.

### Dependencies

`pnpm add --save-exact xstate@5.33.2 @xstate/react@6.1.0`. This repo pins exact versions. If pnpm writes a range, change it back to the exact version.

## Risks / Trade-offs

- [Boot paints nothing, then the title] → Harness and theme assertions already retry on the Signalfire heading. Do not send `ready` before the first paint in a way that skips the `boot` state in the Node test. The actor starts at `boot`. The effect sends `ready`.
- [A visit stack would send the player from the zone map back to results] → One trap. `back` is the only backward move.
- [`StrictMode` pushes two history entries] → Push only when the marker is absent.
- [Browser Back on the title leaves the app if the trap is not in yet] → Tests wait for the title heading first.
- [Space activates a focused button and the wrapper] → Screen buttons are `tabIndex={-1}`. The wrapper holds focus. Handled keys call `preventDefault`.
- [A lazy chunk throws] → The boundary is outside `Suspense`.
- [Programmatic focus does not show `:focus-visible`] → The indicator is `focus:shadow-focus`, which follows `:focus`.

## Migration Plan

No saved data. Rollback is reverting the commit. Production and preview show the title screen after deploy, which is the `static-hosting` delta.

In the same change, edit the purpose sentence of `openspec/specs/hermetic-toolchain/spec.md` from "serves an empty page" to "serves the app". Archive does not take a purpose from a delta of an existing capability. Do not change the roadmap status.
