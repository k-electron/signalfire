# AGENTS.md

Signalfire is a browser game that teaches touch typing through arcade play: a month of 15–20 minute daily sessions takes a beginner to fluent typing. Code is written by AI agents through OpenSpec; Karim approves proposals and merges.

Folders with their own `AGENTS.md` (`src`, `content`, `docs`) add rules for that area. Read them before working there.

## Principles

1. **The docs are the guide.** Build what the verticals and horizontals describe; don't drift from them. If the work shows a doc is wrong or incomplete, stop and ask Karim. An approved change of direction updates the docs in the same change.
2. **Clean, conventional structure.** Use the patterns the architecture names: pure core behind ports and adapters, state machines for flow, stores for data, small single-purpose modules, composition over inheritance. Apply a pattern only when it removes real complexity.
3. **Concise.** Write the smallest code that meets the spec. No speculative abstractions, options, or "just in case" branches; no dead code. Reuse existing code before writing new code; prefer deleting to adding.
4. **Comments explain why.** Comment only what a reader can't infer from the code: trade-offs, constraints, links to docs or decision records. Never restate what the code does.
5. **Everything changes together.** Code, tests, config, comments, docs, OpenSpec specs, and `tasks.md` change in the same change. Work isn't done while any of them lags. Release notes are generated from commit and pull request titles, so write those for readers.
6. **Fresh context for big work.** Hand research and independent subtasks to subagents (or a fresh session if your tool has no subagents). Give each a brief: goal, files and docs to read, constraints, acceptance criteria, and the output you need back. Keep `tasks.md` current so work survives context resets.
7. **Independent verification.** For non-trivial changes, an agent that didn't write the code reviews the diff and its tests against the spec and docs, in fresh context. It reports correctness and requirement gaps only, not style preferences.
8. **Stay in scope.** Do what the approved proposal says. Record unrelated problems in the pull request or an issue instead of fixing them in passing.

## Read first

Always: `docs/PHILOSOPHY.md` (principles P1–P13) and `docs/horizontals/01-constitution.md` (articles C1–C10).

Then the docs for your task:

| Task touches | Read |
|---|---|
| Which stage we're in, what comes next | `docs/ROADMAP.md` |
| Story, characters, in-world names | `docs/verticals/01-lore-and-world.md` |
| Key order, levels, star bars | `docs/verticals/02-curriculum.md`, `03-level-design.md` |
| Gameplay, input, feedback | `docs/verticals/04-core-mechanics-and-game-feel.md` |
| Score, stars, medals, gates, mods | `docs/verticals/05-scoring-and-progression.md` |
| Metrics, pilot dossier | `docs/verticals/06-telemetry-and-pilot-profile.md` |
| Practice missions, systems check | `docs/verticals/07-adaptive-engine.md` |
| Word lists, generated text | `docs/verticals/08-text-content.md` |
| Music and sound | `docs/verticals/09-procedural-audio.md` |
| Visuals and effects | `docs/verticals/10-art-direction-and-vfx.md`, `docs/horizontals/07-design-system.md` |
| Screens, HUD, onboarding | `docs/verticals/11-ui-ux-and-onboarding.md` |
| Quests, achievements, endgame | `docs/verticals/12-meta-game.md` |
| Code structure, loop, determinism | `docs/horizontals/04-architecture.md` |
| Saved data, IDs, migrations | `docs/horizontals/05-data-model.md` |
| Storage, cloud sync | `docs/horizontals/06-persistence-and-sync.md` |
| Tests, workflow, definition of done | `docs/horizontals/08-testing-and-dev-practices.md` |
| Debug tools, content scripts | `docs/horizontals/09-dev-tooling.md` |
| CI, deploys, analytics | `docs/horizontals/10-ci-cd-and-hosting.md` |

Also check `docs/decisions/` for records covering the area, and `openspec/specs/` for what is already built.

**Docs are intent; `openspec/specs/` is truth.** A departure from a doc needs Karim's approval and lands with the doc update or a decision record in the same change.

## How work happens

1. `/opsx:propose` (or your tool's equivalent) creates the change in `openspec/changes/<name>/`.
2. The proposal lists: principles served, docs implemented, departures from docs, new runtime dependencies with justification, and a constitution check.
3. **Stop. Karim approves the proposal before you apply it.**
4. Apply on branch `change/<name>`. Logic is test-first.
5. Open a pull request with the template filled. Karim reviews; CI must be green.
6. After merge, archive the change.

Exempt from proposals (pull request only, branch `fix/<slug>`): typo and wording fixes, formatting, dependency patch updates.

Never push to `main`, merge your own pull request, force-push shared branches, or skip hooks (`--no-verify`).

## When you're unsure

- **Ask Karim** before anything that changes what the player sees, hears, or feels; contradicts a doc; adds a runtime dependency; or touches a "Not now" item in the philosophy.
- **Decide yourself** on implementation details. List every assumption in the proposal or pull request.
- **Never invent** facts, APIs, library behavior, or numbers. Check the source or docs. If you can't verify something, say so.

## Commands

| Command | Does |
|---|---|
| `pnpm install` | Install (CI uses `--frozen-lockfile`) |
| `pnpm dev` | Dev server with debug tools |
| `pnpm check` | Everything CI runs: typecheck, lint, tests, content checks, build |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` / `pnpm format` | Biome check / Biome fix |
| `pnpm test` | Vitest (logic in Node, components in browser mode) |
| `pnpm test -- <pattern>` | Run matching tests only |
| `pnpm test:e2e` | Playwright end-to-end |
| `pnpm content:check` | Validate all content |
| `pnpm tokens` | Regenerate CSS from design tokens |
| `pnpm ladle` | Component workbench |

## Before you say "done"

- `pnpm check` passes. Paste the relevant output; don't just claim it passed.
- Every OpenSpec scenario you implemented has a passing test.
- Visual or feel changes: attach screenshots or a recording (preview URL or local run) and the filled playtest checklist from `docs/horizontals/08-testing-and-dev-practices.md`.
- Docs, specs, config, and `tasks.md` match the code.
- Non-trivial changes: independent review done (principle 7); each finding fixed or answered in the pull request.

## Code rules

- TypeScript strict. No `any`. No `@ts-ignore`. `@ts-expect-error` only with a comment giving the reason and a link to an issue or decision record.
- Layers: `src/core` imports only itself and Zod. `src/engine` and `src/platform` import `core`. `src/app` imports everything. CI enforces this.
- `src/core` is pure and deterministic: no DOM, timers, `Math.random`, `Date.now`, or `performance.now`.
- React never runs per frame or holds simulation state.
- Validate all data from storage, cloud, or content files with Zod.
- Never hardcode colors, sizes, or durations; use design tokens.
- IDs (`level:2.4`, `char:e`, `medal:flawless`) are permanent: never rename or reuse them.
- Never lose player progress: no change may remove stars, medals, mods, or Keylings.
- IMPORTANT: typing data (keystrokes, timings, WPM, accuracy) never leaves the device except to the player's own Puter account. Don't add network destinations.
- Files and folders kebab-case; components PascalCase; tests `*.test.ts` next to the code.

## Tests

- Test outcomes a player or caller depends on, through public interfaces.
- No change-detector tests (big snapshots), no tautological tests that restate the implementation, no mocking internals of the code under test, no testing third-party libraries.
- Use in-memory fakes for ports (storage, cloud, clock, audio, render).
- Rules that must always hold get property-based tests (fast-check).
- Fixing a bug starts with a failing test that reproduces it.
- Never weaken or delete a failing test to get green without explaining why in the pull request.

## Writing style

Applies to proposals, specs, pull requests, commits, docs, and code comments.

- Terse, direct, plain words. Bullets over dense paragraphs.
- No weasel words, filler, or meta-commentary ("It's worth noting", "In order to").
- No em dashes; use commas, colons, semicolons, or parentheses.
- Keep technical details exact; don't simplify away necessary nuance.
- State assumptions as assumptions.
- Link sources, issues, files, and decision records instead of paraphrasing them.

## Commits and pull requests

- Conventional Commits: `type(scope): summary`. Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `content`. Scope is the area (`scoring`, `lanes`, `sync`, `audio`, `content`, `docs`).
- One logical change per commit. Pull requests are squash-merged; the title must follow the same format.
- The pull request template asks for: OpenSpec change link, constitution check, test evidence, visual evidence, docs updated, assumptions.

## Gotchas

- Read Shift side from `event.code` (`ShiftLeft`/`ShiftRight`); ignore `event.repeat`; use `event.timeStamp` for timing.
- During levels, call `preventDefault` on keys the browser would act on (Space, Tab, Backspace, `'`, `/`, Enter).
- Audio can only start after a user gesture.
- puter.js is loaded on demand; `puter.auth.signIn()` must be called from a click.
- Dev-only code lives in `*/dev/` folders behind `import.meta.env.DEV` and must not reach production bundles.
- Saving and sync never block play.
