# Proposal

## Why

A save still runs when the live document's migration cannot finish. That value is not invalid, so the save rotates it into the backup ring and the oldest real backup falls out. Two other Stage 1 leftovers are the same kind of gap: a load result is `unknown`, and scene easing is the control points `1, 0, 0, 1`, which is not the published expo in-out curve.

## What Changes

- A save whose live value fails migration reports `failed` and writes nothing. The live key and the backup slots stay as they are. This is the same refusal a newer live value already gets.
- A load of a shipped key returns that key's document type. A caller reads the document's fields with no type assertion.
- `motion.scene.easing` becomes the expo in-out cubic-bezier published by [easings.net](https://github.com/ai/easings.net/blob/master/src/easings.yml): `0.87, 0, 0.13, 1`. The design-tokens spec stops requiring `1, 0, 0, 1`.
- Cache jobs drop `actions: write`. [actions/cache](https://github.com/actions/cache/blob/main/README.md) does not require that scope to restore or save. [GitHub's cache reference](https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching) grants cache access with `cache-mode` and a scoped cache token. This workflow does not delete caches, which is the case that still needs `actions: write`.

Out of this change: Stage 2 (the walking skeleton, live run recording, input judging, scoring). Also cloud sync, the active-tab lock, checkpoint scheduling, a player notice for a failed migration, `cache-mode`, and a sampled `linear()` of the exponential.

Done when `pnpm check` and `pnpm test:e2e` pass, CI is green, and this change is archived before merge.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `local-storage`: a failed migration refuses a save and stays out of the backup ring; an ok load of a shipped key is that key's document type.
- `design-tokens`: scene easing is the published expo in-out control points `0.87, 0, 0.13, 1`.
- `ci-pipeline`: every job runs with `contents: read`.

## Impact

- `src/core/storage/document-store.ts`, `src/core/ports/storage.ts`, `src/core/storage/game-storage.ts`, `src/platform/storage/documents.test.ts`, `src/core/ports/fakes.test.ts`.
- `src/core/theme/tokens.ts`, `src/app/theme/tokens.css` (regenerated).
- `.github/workflows/ci.yml`.
- `docs/horizontals/05-data-model.md`, `docs/horizontals/06-persistence-and-sync.md`, `src/AGENTS.md`.

## Principles served

- **P6.** A failed migration does not evict a real backup.
- **P9.** Scene easing is the published expo in-out curve.
- **P11.** Saves stay on the device. No new network destination.
- **P12.** The curve and the cache permission follow the current sources, not the earlier wording.
- **P13.** This closes Stage 1 leftovers. Stage 2 stays unstarted.
- P1–P5, P7, P8, and P10 are not served.

## Docs implemented

- `docs/horizontals/05-data-model.md`: Invalid data. A migration that cannot finish refuses a later save as well as a load. The store leaves every key unchanged.
- `docs/horizontals/06-persistence-and-sync.md`: Backups. A save does not run while the live migration cannot finish, and that value is not rotated.
- `docs/horizontals/07-design-system.md`: the motion table stays "expo in-out". The constants and the design-tokens spec hold the curve. The horizontal is not edited.
- `src/AGENTS.md`: the platform backup bullet matches the refused save.

## Departures

- Horizontal 06 says a previous value that is not invalid is rotated before a write. A failed migration is not invalid, so that sentence would rotate it and drop the oldest backup. This change refuses the save. The same change updates horizontals 05 and 06.
- The design-tokens spec requires control points `1, 0, 0, 1`. That wording came from the review-cleanup proposal. [easings.net `easeInOutExpo`](https://github.com/ai/easings.net/blob/master/src/easings.yml), read on 2026-10-13, publishes `cubic-bezier(0.87, 0, 0.13, 1)`. The spec is updated to those points. Horizontal 07's name "expo in-out" stays.
- No departure for CI. Horizontal 10 does not name token scopes. `actions: write` stays required only for deleting a cache through the API ([actions/cache tips](https://github.com/actions/cache/blob/main/tips-and-workarounds.md)). This workflow does not do that.

## Assumptions

- The save result is `{ status: "failed" }`, with no version. The check happens before the candidate is judged, as the newer check does. A bad candidate while the live value has failed migration still reports `failed`.
- `SaveResult` gains that status. No caller exhausts the union today.
- `save` still accepts `unknown`. Tests pass a non-latest document without a type assertion. The new type is the load result only.
- Shipped keys are `profile`, `settings`, `progress`, `run-index`, and `run:<runId>`. Each ok document is the document type of the chain bound to that key. A test store whose chain map is a wide record may still load as `unknown`.
- Scene easing stays four cubic-bezier control points, the shape CSS and Motion already share. The points are the easings.net CSS approximation of the exponential, not a `linear()` sampling of the Penner function.
- `cache-mode` stays omitted. For `push` and `pull_request`, the GitHub default is cache write. Job-level `permissions` blocks are removed so each job uses the workflow `contents: read`.
- No new runtime dependency. No new development dependency.

## Constitution check

- **C1.** One change, as named. It edits three existing specs because those requirements are already split across them. No new capability. Not a C1 exemption.
- **C2.** Principles, docs, and departures are stated above.
- **C3.** Karim approves this proposal before apply. The agent does not merge it and does not push to `main`.
- **C4.** Persistence is a logic domain. The failed-migration save scenario is a failing test first. The typed-load scenario is a typecheck of the public load result. Token generation and the workflow file are checked by the command and by reading the file.
- **C5.** Strict TypeScript. No `any`. No `@ts-ignore`. Callers do not assert the loaded document.
- **C6.** No new decision. The spec and the two horizontals record the save rule. The easing source is the spec.
- **C7.** No new runtime dependency. No new development dependency.
- **C8.** `src/AGENTS.md` changes only so the platform bullet matches the refused save. Root `AGENTS.md` stays as it is.
- **C9.** Store, port, tests, tokens, stylesheet, workflow, horizontals 05 and 06, `src/AGENTS.md`, the deltas, and `tasks.md` land together.
- **C10.** Non-trivial. The fresh-context review is a task.
