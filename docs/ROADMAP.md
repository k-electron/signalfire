# Roadmap

The order we build in, from an empty repo to a finished game. It follows [P13](PHILOSOPHY.md#p13-thin-then-deep): a thin path through every part first, then depth.

The roadmap sets sequence only. If it conflicts with the philosophy, constitution, docs, or specs, they win.

## How to use it

- Each stage is a set of OpenSpec changes (constitution C1). Karim approves every proposal and every stage exit.
- A stage ends only when its exit criteria pass. Don't start a stage's changes before the previous stage exits, except where noted.
- Stage detail lives in OpenSpec (`openspec/changes/`), not here.
- Update the status column in the same pull request that finishes a stage (constitution C9).

## Stages

| # | Stage | Status |
|---|---|---|
| 0 | Scaffold | Done |
| 1 | Core foundations | Not started |
| 2 | Walking skeleton | Not started |
| 3 | Thin pass across every system | Not started |
| 4 | Feel slice | Not started |
| 5 | Campaign, zone by zone | Not started |
| 6 | Deepen | Not started |
| 7 | Tune with real players | Not started |
| 8 | Harden and launch | Not started |
| 9 | Post-launch | Not started |

### 0. Scaffold

- Repo, pnpm, Vite, strict TypeScript, Biome, Lefthook, Vitest, Playwright.
- OpenSpec config, GitHub Actions CI, Cloudflare Workers deploying an empty app.
- Docs: [Repo Setup](horizontals/02-repo-setup.md), [Tech Stack](horizontals/03-tech-stack.md), [CI/CD and Hosting](horizontals/10-ci-cd-and-hosting.md).
- **Exit:** an empty page deploys on merge, CI is green, and the layer-boundary check runs.

### 1. Core foundations

- `src/core` basics: schemas, ports, seeded RNG, run-log format, fixed-step loop.
- Design tokens, the app-flow machine skeleton, the IndexedDB adapter.
- Confirm verzod works with the installed Zod before adopting it; if not, use the hand-rolled chain ([Data Model](horizontals/05-data-model.md#risk)).
- Docs: [Architecture](horizontals/04-architecture.md), [Data Model](horizontals/05-data-model.md), [Design System](horizontals/07-design-system.md).
- **Exit:** a headless replay test passes, and a document saves and migrates.

### 2. Walking skeleton

- One thin end-to-end path: title, levels 0.1 and 1.1 (waiting lanes), real input judging, scoring, stars, results, save and reload.
- Visuals are placeholders.
- Confirm the Atkinson Hyperlegible Mono license file before shipping the font.
- **Exit:** the first-run Playwright flow passes on the deployed preview, and outside pull requests open ([Repo Setup](horizontals/02-repo-setup.md)).

### 3. Thin pass across every system

- Minimal versions of: zone map and gates, hub, telemetry and dossier, repair runs, systems check, cloud sync, settings.
- Later zones use placeholder levels.
- Minimal dev tools: debug overlay, command palette, Level Lab with seed and replay ([Dev Tooling](horizontals/09-dev-tooling.md)).
- Docs: verticals [05](verticals/05-scoring-and-progression.md), [06](verticals/06-telemetry-and-pilot-profile.md), [07](verticals/07-adaptive-engine.md), [11](verticals/11-ui-ux-and-onboarding.md); [Persistence and Sync](horizontals/06-persistence-and-sync.md).
- **Exit:** the full loop works end to end: play, save, review, practice, gate, sync.

### 4. Feel slice

- Zone 1 done properly: flowing lanes, Signal lock, Overdrive, hit effects, basic typing-driven audio, the Peeker boss.
- Dev tools: Tweakpane, and the rest of the Level Lab (frame stepping, phase timeline, hot reload).
- Docs: verticals [04](verticals/04-core-mechanics-and-game-feel.md), [09](verticals/09-procedural-audio.md), [10](verticals/10-art-direction-and-vfx.md).
- **Exit:** Karim plays it and judges the feel good. A feel rework may touch stage 3 code; the engine reads events and never simulation state, which limits the damage.

### 5. Campaign, zone by zone

- Zones 2–9, each with its mechanic debuts (Static, shooter, decode, Shift, convergence, numbers, symbols, editing), content, boss, and story scenes.
- Docs: verticals [02](verticals/02-curriculum.md), [03](verticals/03-level-design.md), [08](verticals/08-text-content.md), [01](verticals/01-lore-and-world.md).
- **Exit (per zone):** playable end to end, word lists reviewed, star bars provisional.

### 6. Deepen

- Full audio and VFX.
- Machines, mods, Keylings.
- Meta-game: dispatches, weekly goal, commendations, achievements, cosmetics ([vertical 12](verticals/12-meta-game.md)).
- Endgame: Veteran and Ace tiers, Courier runs, Deep Archive, Daily Signal.
- Stages 5 and 6 can overlap.
- **Exit:** every feature in the verticals is playable.

### 7. Tune with real players

- Playtest, then calibrate star bars, gate sizes, adaptive weights, and pressure.
- Audit content: blocklist and word lists.
- **Exit:** playtesters reach the month-end target (roughly 20–25 WPM at 95% accuracy) without hitting an unpassable gate.

### 8. Harden and launch

- Performance, cross-browser checks, sync and migration edge cases.
- Close before launch:
  - the analytics default ([CI/CD and Hosting](horizontals/10-ci-cd-and-hosting.md#open-question));
  - the final name and clearance;
  - GoatCounter terms for an open-source project.
- **Exit:** a public release, tagged 1.0.0.

### 9. Post-launch

- Iterate on feedback and bug reports; take community pull requests.
