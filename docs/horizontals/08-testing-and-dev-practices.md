# Horizontal 08: Testing and Dev Practices

How changes are tested and how work moves from idea to merge.

## Decisions

| Topic | Decision |
|---|---|
| Unit and logic tests | Vitest, in Node |
| Component tests | Vitest browser mode (real browser via Playwright) |
| End-to-end tests | Playwright |
| Extra test kinds | Property-based tests with fast-check for core logic; other kinds added when a need appears |
| Coverage | No threshold. Tests are judged by the outcomes they protect, not by percentage |
| Visual and feel evidence | Agent-captured screenshots or recording plus a filled playtest checklist; Karim plays it before merge when feel is affected |

## Testing philosophy

**Test outcomes, not implementation.** A good test fails when the game behaves wrongly and passes when it behaves correctly, regardless of how the code is written.

### Write tests that

- check behavior a player or another module depends on ("a run at 93% and 10 WPM in Zone 3 earns 1 star");
- come from OpenSpec scenarios (each WHEN/THEN scenario has at least one test, constitution C4);
- use public interfaces of a module, with in-memory fakes for ports (storage, cloud, clock, audio, render);
- state rules that must always hold, as property-based tests where inputs vary widely.

### Don't write tests that

- restate the implementation (asserting that a function calls another function);
- only detect change (large snapshots of objects or markup that break on any edit and get re-approved without thought);
- mock internal modules of the code under test;
- test third-party libraries (PixiJS draws, Zod validates, Tone.js plays).

### How much

Be pragmatic. Test effort follows risk:

| Area | Testing depth |
|---|---|
| Scoring, stars, gates, unlocks | High: wrong results break trust and progression |
| Sync merges and migrations | High: bugs lose player progress |
| Input judging | High: the core of the game |
| Adaptive engine, telemetry metrics | Medium: wrong outputs degrade practice quality |
| Content generation and validation | Medium: blocklist and key-set rules must hold |
| React screens | Light: key flows and states |
| Rendering, effects, audio | Evidence-based (screenshots, recordings, playtests), not unit tests |

## Test kinds

### Logic tests (Vitest, Node)

- Live next to the code as `*.test.ts`.
- Run on every commit in CI and in the pre-push hook.
- Must not touch the DOM, network, or real time.

### Property-based tests (fast-check)

For rules that must hold for any input:

| Domain | Example properties |
|---|---|
| Scoring | Stars never exceed 3; higher accuracy and speed never earn fewer stars |
| Progress | Recording a run never lowers stars, medals, or bests |
| Sync merge | Merging never loses earned items; merging is the same regardless of which device syncs first |
| Migrations | Every valid older document migrates to a valid latest document with no earned items lost |
| Content generation | Generated text uses only allowed keys and never contains blocklisted words |
| Key priority | Weaker or staler keys never get lower priority than stronger, fresher ones (all else equal) |

Failing cases are shrunk to the smallest input and the seed is printed so the failure can be reproduced.

### Component tests (Vitest browser mode)

- For game components with real behavior: `IntegrityVelocityRings` thresholds, `KeyboardHeatmap` coloring, `TypedText` states, settings forms.
- Rendered in a real browser so layout and focus behave as in the game.

### End-to-end tests (Playwright)

A small set of critical flows:

1. First run: title → onboarding → level 0.1 → level 1.1 → results with stars.
2. Returning player: hub → zone map → level → results → progress saved after reload.
3. Pause and resume a level.
4. Sign-in and sync with a faked cloud adapter.
5. Second tab takes over from the first.

Playwright's fake clock steps the game loop deterministically; typing is driven by `keyboard.type` with delays.

### Added later, when needed

| Kind | Add when |
|---|---|
| Golden replays (recorded run logs replayed headlessly) | Gameplay logic is stable enough that unintended changes become a real risk |
| Bot playthroughs (a bot types through levels at set speed and accuracy) | Star bars and pacing need tuning across many levels |
| Visual regression (screenshot baselines) | Components or screens regress visually more than once |
| Performance benchmarks in CI | Frame-time regressions are observed |

## Visual and game-feel changes

Every pull request that changes rendering, effects, animation, audio, or layout includes:

1. Screenshots or a short recording captured by the agent from an automated browser run.
2. A filled playtest checklist (below).
3. Karim plays the change before merging when it affects feel (pacing, effects intensity, audio, input response).

### Playtest checklist

- [ ] The active character is always the clearest thing on screen.
- [ ] No effect covers the active character or the next two characters.
- [ ] Keystroke response feels immediate (no visible delay).
- [ ] Frame rate stays smooth during peaks (no visible stutter).
- [ ] Errors are clear but not punishing.
- [ ] Audio fits the zone and never clips.
- [ ] Pausing, losing focus, and resuming work.
- [ ] The change matches the relevant vertical doc (cite section).

## Dev workflow

### From idea to merge

1. **Explore (optional):** `/opsx:explore` to shape the idea.
2. **Propose:** `/opsx:propose <change>` creates the proposal, delta specs, design, and tasks. The proposal cites principles and docs (constitution C2).
3. **Approve:** Karim reviews and approves the proposal.
4. **Apply:** `/opsx:apply` on branch `change/<name>`. Logic tasks are test-first.
5. **Verify locally:** `pnpm check` passes; visual changes have captures and a checklist.
6. **Independent review:** for non-trivial changes, a fresh-context agent that didn't write the code reviews the diff and tests against the spec and docs (constitution C10).
7. **Pull request:** with the template filled (Repo Setup horizontal).
8. **Review:** CI green, then Karim reviews; feel changes are played.
9. **Merge:** squash merge.
10. **Archive:** `/opsx:archive` merges spec deltas into `openspec/specs/`.

### Definition of done

A change is done when:

- its OpenSpec tasks are complete and checked off;
- every spec scenario has a passing test, or visual evidence for visual scenarios;
- `pnpm check` passes in CI;
- code, tests, config, comments, docs, and specs all match (constitution C9);
- non-trivial changes have had an independent review, with every finding fixed or answered (constitution C10);
- the pull request is approved and merged;
- the change is archived.

### Working habits for agents

- Keep changes small: one capability per change; split anything that touches more than one layer heavily.
- Read the relevant vertical, horizontal, and decision records before proposing.
- When a test is hard to write, treat it as a design signal: the code probably needs a port or a smaller function.
- When a bug is found, first write a test that reproduces it, then fix it.
- Never weaken or delete a failing test to make CI pass without explaining why in the pull request.

## Sources

- [Vitest 4 browser mode (InfoQ)](https://www.infoq.com/news/2025/12/vitest-4-browser-mode)
- [Vitest visual testing (Argos)](https://argos-ci.com/blog/vitest-visual-testing)
- [Canvas and WebGL testing with Playwright](https://github.com/testdino-hq/playwright-skill/blob/main/core/canvas-and-webgl.md)
- [Playwright clock](https://qaskills.sh/blog/playwright-clock-install-fakers-guide)
- [Property-based testing with fast-check (PkgPulse)](https://www.pkgpulse.com/guides/property-based-testing-fast-check-javascript-2026) and [@fast-check/vitest](https://npmjs.com/package/@fast-check/vitest)
