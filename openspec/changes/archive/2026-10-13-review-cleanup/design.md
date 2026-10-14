# Design

## Context

See proposal.md. `tokens.motion.scene.easing` is the string `ease-in-out-expo`. `tools/tokens/generate.mjs` writes `--ease-scene: cubic-bezier(1, 0, 0, 1)` itself. `App` listens for keys on `<main>`. The selected hub item sets `aria-current` and has no focus paint. Escape on the level sends `back`, which targets the zone map. `WithOptionalInput` widens the XState machine so `createActor` may omit `input`. `tokens.test.ts` repeats the hex table. CI installs pnpm from `.github/actions/pnpm`, then asserts the Node path and that the Chromium directory is non-empty. `.node-version`, the hosting doc, and the static-hosting spec each repeat `26.11.1`. `e2e/culori.d.ts` declares `culori`.

## Goals / Non-Goals

**Goals:**

- One easing source, a visible selection, keys that do not follow focus, a pause stand-in, and CI that matches decision 0001.

**Non-Goals:**

- The five-item pause menu.
- A new Node version.

## Decisions

1. **Easing.** `motion.micro.easing` stays `"ease-out"`. `motion.scene.easing` becomes the tuple `[1, 0, 0, 1]`. The generator writes `--ease-micro` and `--ease-scene` from those fields. Spring and celebrate stay as they are. `tokens.test.ts` drops the hex and size restatements. One test reads `tokens.css` and expects `--ease-scene` to be the cubic-bezier formatted from `tokens.motion.scene.easing`, and `--ease-micro` from the micro token. The numbers are not copied into the test.

2. **Input type.** Delete `WithOptionalInput`. `createActor(appFlowMachine, { input: undefined })` is the first-run call. `input?.firstRun ?? true` stays. Call sites that want a return visit pass `{ firstRun: false }`.

3. **Keys.** `window` `keydown` in `App`, same ignores (repeat, meta, ctrl, alt). `preventDefault` only when `keyToEvent` returns an event. A browser test blurs the shell, focuses `document.body`, and presses Space on the title.

4. **Pause.** State `pause`. Level `back` targets `pause`. Pause `back` and a new `resume` event target `level`. `keyToEvent`: Escape on level is `back`; Space and Escape on pause are `resume`. `Pause` renders `<h1>Pause</h1>`. No restart, calm, settings, or quit.

5. **Selection paint.** The selected hub and results button gets the focus shadow utility (`shadow-focus` / the token already generated as `--shadow-focus`). Unselected buttons do not. `aria-current` stays.

6. **pnpm/action-setup.** Replace `.github/actions/pnpm` with `pnpm/action-setup@v4`, pinned to the commit the `v4` tag points at when apply reads it. `run_install: false`. Do not set its `cache` input. Do not use `actions/setup-node`. If Install cannot run `pnpm install --frozen-lockfile` on the lockfile runtime, record the log error in this file and keep a repo-local pnpm install. Update the ci-pipeline delta in the same commit if the spec's action-setup scenario cannot hold.

7. **Permissions.** Workflow `permissions: contents: read`. Cache jobs add `actions: write`. The title job does not.

8. **Drop the inline checks.** Remove the Node `execPath` step and the Chromium directory test from `ci.yml`. `pnpm browsers:install` and `pnpm install --frozen-lockfile` are the checks.

9. **Browser cache.** Two cache steps. Restore `.pnpm-store` before `pnpm install`. Restore `node_modules/playwright-core/.local-browsers` after `pnpm install` and before `pnpm browsers:install`. Apply reads the latest Tests job log on `main` (or this pull request's first run). If the browser path is a cache miss for another reason, fix that reason and say what the log showed.

10. **One Node source.** `package.json` `devEngines.runtime` stays the range. A lint step reads the lockfile's single `node@runtime:` version and fails when `.node-version` differs. The script does not contain the digits. Docs and the static-hosting spec name the lockfile field instead of `26.11.1`. `PNPM_VERSION` stays the `packageManager` version.

11. **culori types.** Add `@types/culori` at 4.0.1. Delete `e2e/culori.d.ts`. If `converter("rgb")` does not typecheck, drop the culori import from `e2e/theme.spec.ts` and compare the computed `rgb()` strings the page already returns, and keep `culori` as a devDependency because the generator imports it.

12. **Specs and wording.** Rewrite the deltas as the proposal lists. Delete `tools/layer-boundaries/fixtures/fail/core-verzod`. Remove the last sentence of decision 0001. In `src/AGENTS.md`, replace "every OpenSpec scenario maps to a test" with C4's split: logic-domain scenarios map to tests; tooling, CI, and docs are checked by running the command.

13. **README.** Play section is the Workers URL. Status says Stage 0 has exited and Stage 1 has not, matching the roadmap until close-out.

## Risks / Trade-offs

- [action-setup v4 runs on the runner's Node 20 and pnpm 12 refuses to start] → Record that in this file and keep the local installer. Do not add `actions/setup-node`.
- [Restoring browsers after install misses the store cache] → The store cache stays before install. Only the browser path moves.
- [Pause hides the old Escape-to-map path] → Space on the level still finishes. Quit waits for the real pause menu.

## Migration Plan

No saved data. Rollback is reverting the pull request. The Workers URL is already live.

## Open Questions

None. Whether action-setup works is a task outcome, not an open product question: the fallback is specified above.
