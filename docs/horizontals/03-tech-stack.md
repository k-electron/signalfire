# Horizontal 03: Tech Stack

The libraries and platforms the game is built on, and the role each one plays.

## Stack

| Layer | Choice | Role |
|---|---|---|
| Language | TypeScript (strict) | Everything |
| Build and dev server | Vite | Bundling, dev server, static build |
| UI framework | React 19 | Menus, hub, HUD overlays, dossier, settings |
| UI components | shadcn/ui | Accessible base components, themed to the design system |
| Styling | Tailwind CSS v4 | Styling for all React UI |
| Icons | lucide-react | Interface icons |
| UI animation | Motion | Screen transitions, layout and exit animations, results reveals |
| Game rendering | PixiJS v8 | The game canvas: lanes, ships, enemies, particles, shaders |
| App flow | XState v5 | Screen flow and level lifecycle as state machines |
| App state | Zustand | Profile, settings, progress, telemetry summaries |
| Audio | Tone.js | Procedural music, synths, effects, scheduling |
| Runtime validation | Zod | Schemas for content files, saved data, and cloud data |
| Local storage | IndexedDB via idb-keyval | Defined in the Persistence horizontal |
| Cloud sync and sign-in | puter.js | Optional sign-in and per-user cloud key-value storage |
| Analytics | GoatCounter | Anonymous, cookieless event counts (CI/CD and Hosting horizontal) |
| Testing | Defined in the Testing horizontal | |

Versions are pinned in the lockfile. Major-version upgrades go through an OpenSpec change.

## How the pieces fit

```
┌────────────────────────────── Browser ──────────────────────────────┐
│                                                                      │
│  React 19 (shadcn, Tailwind, Motion, lucide)                         │
│    Title · Hub · Maps · HUD overlay · Results · Dossier · Settings   │
│          ▲ reads                         │ sends events               │
│          │                               ▼                            │
│  Zustand stores  ◀──────────────  XState flow machine                 │
│  (profile, progress,               (which screen, level lifecycle)    │
│   settings, telemetry)                   │ starts / pauses / ends     │
│          ▲ writes summaries              ▼                            │
│          │                     Game engine (plain TypeScript)         │
│          └──────────────────── input · judging · scoring · spawning   │
│                                      │                 │              │
│                                      ▼                 ▼              │
│                               PixiJS v8 canvas     Tone.js audio      │
│                                                                      │
│  Persistence: IndexedDB ◀──▶ puter.js cloud (optional)               │
└──────────────────────────────────────────────────────────────────────┘
```

### Boundaries

- **React never runs the game loop.** The engine runs in plain TypeScript, driven by the PixiJS ticker. Per-frame state (positions, timers, particles) never goes through React.
- **The HUD reads, it doesn't drive.** During a level, the HUD subscribes to a small set of values (combo, rings, score) that the engine publishes at a throttled rate.
- **XState owns flow.** Which screen is visible and where a level is in its lifecycle (loading, countdown, playing, paused, results) are machine states. Screens render from the machine's state. The browser back button sends the machine a "back" event.
- **Zustand owns data.** Profile, progress, settings, and telemetry summaries live in stores readable by React and by the engine.
- **The engine is testable without a browser canvas.** Input judging, scoring, spawning, and telemetry are pure logic; PixiJS and Tone.js are output adapters.
- **puter.js loads only when needed.** The library is imported on demand when a player opens sign-in or already has a cloud session, so players who never sign in never load it.

## Choices and reasons

| Choice | Why | Alternatives considered |
|---|---|---|
| PixiJS v8, outside React | GPU-accelerated 2D with WebGL 2 or WebGPU, shaders for bloom and glitch, mature and well known | `@pixi/react` (risk of per-frame re-renders), custom WebGL (too much work), full game engine (heavy, fights React UI) |
| Motion | Declarative React animation with layout and exit transitions; fits shadcn components | GSAP (imperative timelines; can be added later for complex choreography), CSS only (too limited) |
| XState | Screen flow and level lifecycle have many states where invalid transitions cause bugs (pausing during results, starting a level twice) | A router library, ad-hoc booleans |
| Zustand | Simple stores usable from both React and the engine | Jotai, Redux Toolkit |
| Tone.js | Transport, scheduling, synths, and effects make the typing-driven music system much faster to build; raw Web Audio remains available for custom pieces | Raw Web Audio only |
| Zod | One schema gives both runtime validation and TypeScript types; widely known by agents | Valibot, types only |
| puter.js | Optional sign-in and per-user cloud storage with no server to run; each user's usage is billed to their own Puter account | A custom backend, other hosted backends |

## Browser support

- Desktop Chrome, Edge, Firefox, and Safari, latest two versions.
- WebGL 2 required; WebGPU used automatically where available.
- Web Audio required; audio starts after the first user interaction.
- Non-desktop user agents see the desktop warning (UI/UX vertical).

## Known risks

| Risk | Mitigation |
|---|---|
| Tone.js maintenance pace is unclear in 2026 (latest npm release 15.1.22) | Wrap it behind our own audio interface so it can be replaced with raw Web Audio if needed |
| puter.js is a third-party platform | Cloud sync is optional; the full game works locally; sync code sits behind an interface |
| PixiJS and React both want control of animation timing | Strict boundary: Pixi ticker for gameplay, Motion for UI, never both on the same element |

## Sources

- [PixiJS v8 launch](https://pixijs.com/blog/pixi-v8-launches) and [PixiJS React v8](https://pixijs.com/blog/pixi-react-v8-live)
- [Motion vs GSAP (OpenReplay)](https://blog.openreplay.com/motion-vs-gsap/)
- [State management in 2026 (PkgPulse)](https://www.pkgpulse.com/guides/state-of-react-state-management-2026) and [XState vs Zustand](https://www.pkgpulse.com/guides/xstate-vs-zustand-2026)
- [Tone.js README](https://cdn.jsdelivr.net/npm/tone@14.3.43/README.md)
- [shadcn/ui with Tailwind v4 and React 19](https://gist.github.com/Melvynx/eae54e2e6693bd018ca35602c38ea758)
- [Puter auth](https://developer.puter.com/auth/), [Puter key-value storage](https://developer.puter.com/key-value-database/), [Puter.js in React](https://developer.puter.com/tutorials/puter-js-react/)
