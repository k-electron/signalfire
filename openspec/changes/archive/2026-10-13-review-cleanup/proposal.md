# Proposal

## Why

Stage 1's review left behavior and checks that do not match the docs or decision 0001: scene easing is a label while the stylesheet hardcodes a curve, keyboard selection is not visible and keys follow focus, a level's Escape leaves the level, tests restate constants, CI asserts absence and keeps a second Node pin, and three specs are still written as prohibitions.

## What Changes

- `tokens.ts` holds every easing the stylesheet emits. Scene easing is the expo cubic-bezier `1, 0, 0, 1`. The generator copies those values and does not invent them.
- The selected hub and results item is visibly marked with the focus token. A mapped key works when focus is outside the shell. Escape on the level opens a pause stand-in; Space or Escape there returns to the level.
- Tests cover transitions, key mapping, and generated easing output. The token tests that repeat constants are removed. The `WithOptionalInput` helper is removed; callers pass `input` explicitly, including `undefined` for a first run.
- CI permissions are the minimum each job needs. The inline Node-path and Chromium-directory steps are removed. pnpm is installed with `pnpm/action-setup@v4` unless that action fails for a reason recorded in `design.md`. The Tests job's browser cache is fixed if its log is a miss. `.node-version` is derived from the lockfile's `devEngines` runtime; docs and the hosting spec stop repeating the version number.
- `ci-pipeline`, `test-harness`, and `layer-boundaries` state what the command does. `verzod` is removed from `layer-boundaries`. The last sentence of decision 0001 is removed.
- `src/AGENTS.md` uses constitution C4's split: logic-domain scenarios map to tests; tooling, CI, and docs are a green command.
- End-to-end color conversion uses `@types/culori` 4.0.1. The hand-written `e2e/culori.d.ts` is removed.
- The README play line is `https://signalfire.k-electron.workers.dev/`. The status line matches the roadmap as it stands in this change (Stage 0 done, Stage 1 not started).

Out of this change: the full pause menu (restart, calm mode, settings, quit), Stage 1 exit, and storage-safety.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `design-tokens`: easing values come from the theme constants, and scene easing is the expo curve.
- `app-flow`: selection is visible, keys do not depend on focus, and Escape on the level opens pause.
- `ci-pipeline`: least privilege, no inline absence checks, pnpm from `pnpm/action-setup` when it works, one Node source, positive job scenarios.
- `test-harness`: requirements state what each command runs.
- `layer-boundaries`: requirements state what the check allows; `verzod` is not part of the spec.
- `static-hosting`: the build uses the lockfile's Node runtime rather than a second copy of the version number.
- `contribution-intake`: the README play section is the live URL.

## Impact

- `src/core/theme/tokens.ts`, `tools/tokens/generate.mjs`, `src/app/theme/tokens.css`, `src/app/machines/app-flow.ts`, `src/app/app.tsx`, `src/app/screens/hub.tsx`, `src/app/screens/results.tsx`, a pause screen.
- `.github/workflows/ci.yml`, `.github/actions/pnpm/` (removed if action-setup works), `.node-version`, `package.json` dev dependency `@types/culori`.
- `src/AGENTS.md`, `README.md`, `docs/decisions/0001-prove-the-command.md`, `docs/horizontals/10-ci-cd-and-hosting.md`, `docs/horizontals/07-design-system.md` only if a sentence still says the curve lives outside `tokens.ts`.
- Deleted: `e2e/culori.d.ts`, `src/core/theme/tokens.test.ts` constant restatements, `tools/layer-boundaries/fixtures/fail/core-verzod/` if nothing else references it.

## Principles served

- **P9.** Scene motion uses a real expo curve from the one token source.
- **P13.** This is review cleanup of what Stage 1 already built, not a new system.
- P1–P8 and P10–P12 are not served.

## Docs implemented

- `docs/horizontals/07-design-system.md`: motion tokens. Scene easing stays expo in-out; the constants file is the source of the curve the CSS emits.
- `docs/verticals/11-ui-ux-and-onboarding.md`: keyboard first, and the pause screen. This change ships the stand-in (heading Pause, resume on Space or Escape), not the five-item menu.
- `docs/horizontals/10-ci-cd-and-hosting.md`: Node comes from `devEngines.runtime`; `.node-version` is that lockfile entry written out for the Workers image. The literal `26.11.1` is removed from the prose.
- `docs/decisions/0001-prove-the-command.md`: drop "Specs already shipped stay as they are."
- `src/AGENTS.md`: the core test bullet matches C4.
- `README.md`: the live URL, and a status line that matches the roadmap.

## Departures

- Vertical 11's pause screen lists Resume, Restart, Calm mode, Settings, and Quit. This change opens a stand-in that only resumes. The five actions stay in the vertical for the later screen. The same change says the stand-in is what Stage 1 shows.
- Constitution C6 says an accepted decision is not edited. Karim directed this change to remove one sentence from decision 0001. The rest of that record stays. No new decision.
- The archived CI design rejected `pnpm/action-setup` because it was believed to run `pnpm runtime set -g`. Action-setup v4's readme does not do that, and it does not install Node. Apply uses v4. If the Tests or Install log shows it does not run this repo's `pnpm install --frozen-lockfile` on the lockfile runtime, `design.md` records that failure and the workflow keeps a local pnpm install. `actions/setup-node` stays unused.

## Assumptions

- Scene easing in `tokens.ts` is the four numbers `1, 0, 0, 1`, already emitted as `cubic-bezier(1, 0, 0, 1)`. Micro easing stays the CSS keyword `ease-out`, stored on the token. Standard motion stays a spring and has no CSS easing keyword.
- `@types/culori` 4.0.1 (MIT, published 2025-09-02) types `culori` 4.0.1. This repo has `culori` 4.0.2. The e2e converter call typechecks against 4.0.1. If it does not, apply drops the `culori` import from `e2e/theme.spec.ts` and compares the computed sRGB channels without that package, and removes `culori` from devDependencies only if nothing else imports it. The token generator imports `culori`, so the package stays unless the e2e file was its only extra use. The hand-written `d.ts` goes in either case.
- `pnpm/action-setup@v4` is pinned by commit SHA in the workflow once apply reads the v4 tag's commit. `run_install` is false. Its own `cache` input stays false; this repo keeps `actions/cache` for `.pnpm-store` and the browser directory.
- Jobs that restore or save a cache get `contents: read` and `actions: write`. The title job gets `contents: read` only. Workflow-level permissions are `contents: read`.
- The browser cache is restored after `pnpm install`, because an install that recreates `node_modules` drops a directory restored earlier. Apply confirms against the Tests job log and keeps this order if the log is a miss for that reason.
- `.node-version` is rewritten from the lockfile's single `node@runtime:` version by the same command that checks tokens, so a lockfile change that forgets the file fails `pnpm lint`. `package.json` `devEngines.runtime` remains the range the lockfile resolves. Docs name those two fields and do not repeat the digits.
- The README status in this change does not say Stage 1 is done. Stage 1 close-out updates it after the roadmap moves.
- No new runtime dependency. `@types/culori` is a development dependency, types only.

## Constitution check

- **C1.** One change, as named. It edits the existing specs whose requirements change. Not a C1 exemption: selection, pause, and CI behavior change.
- **C2.** Principles, docs, and departures are stated above.
- **C3.** Karim approves this proposal before apply. The agent does not merge it and does not push to `main`.
- **C4.** App-flow transitions and key mapping are not a C4 logic domain; they already have tests and the new scenarios get tests. Token generation and CI are checked by running the command. The constant-restating token tests are removed because they are not that evidence. Visual selection is also checked with the playtest checklist.
- **C5.** Strict TypeScript. `@types/culori` replaces the hand-written module declaration. No `any`. No `@ts-ignore`.
- **C6.** Decision 0001 loses the sentence Karim named. The record is otherwise unchanged. No new decision.
- **C7.** No new runtime dependency. `@types/culori` 4.0.1 is a development dependency: MIT, DefinitelyTyped, current for culori 4. The hand-written `d.ts` is the thing being replaced.
- **C8.** `src/AGENTS.md` is edited to match C4. Root `AGENTS.md` stays as it is unless a command sentence is now false; that fix belongs to stage close-out if it is a Stage 0 or Stage 1 claim.
- **C9.** Code, tests, workflow, docs, the decision sentence, the deltas, and `tasks.md` land together.
- **C10.** Non-trivial. The fresh-context review is a task.
