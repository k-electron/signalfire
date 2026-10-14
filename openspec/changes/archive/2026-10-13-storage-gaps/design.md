# Design

## Context

See proposal.md. `saveDocument` returns before writing only when the live parse is `newer`. A `failed` parse is not `invalid`, so the save takes the rotate branch and can drop `backup:<key>:2`. `Storage.load` returns `LoadResult<unknown>`. `tokens.motion.scene.easing` is `[1, 0, 0, 1]`. `tools/tokens/generate.mjs` already copies that tuple into `--ease-scene`. Six jobs in `.github/workflows/ci.yml` add `actions: write` on top of the workflow `contents: read`.

## Goals / Non-Goals

**Goals:**

- Refuse a save whose live migration cannot finish, before the candidate is judged, and leave every stored key unchanged.
- Make an ok load of a shipped key that key's document type, with no `as` on the document.
- Store the easings.net expo in-out control points and regenerate the stylesheet from them.
- Leave every job on the workflow `contents: read` permission.

**Non-Goals:**

- Changing the load path for a failed migration, the invalid-data quarantine, or the three-slot ring.
- Typing `save`'s input. It stays `unknown`.
- Replacing the cubic-bezier with a `linear()` sampling, or setting `cache-mode`.

## Decisions

1. **Refuse `failed` where `newer` is refused.** In `saveDocument`, when the live parse status is `failed`, return `{ status: "failed" }` and do not read or write backup or quarantine slots. This sits next to the `newer` return, before `chain.parse(value)`. `SaveResult` gains that status.
   Alternative: quarantine the live value. Rejected. A failed migration is not invalid, and horizontal 05 already forbids quarantine and delete. Alternative: rotate it because it is not invalid. Rejected. That is the bug: the oldest real backup leaves the ring.

2. **The chain's parse type is the load type.** `loadDocument` becomes generic over the chain's document. `createDocumentStore` takes a const type parameter for the chains object and for the optional run chain. Callers see overloads: an exact key returns that chain's document; a `run:` key returns the run chain's document. The implementation signature may return `LoadResult<unknown>`. That signature is not visible to callers and is not an `as`. Do not assert the document.
   `Storage` names the five shipped overloads. Each document type is inferred from that schema's `parse` (`profile`, `settings`, `progress`, `runIndex`, `runLog`), not from a second hand-written type. `createGameStorage` returns `Storage`, so a swapped chain fails typecheck.
   Alternative: one `as Storage` at the boundary. Rejected. It would hide a swapped chain. Alternative: a hand-written map of key to type. Rejected. It can drift from the schemas.
   `documents.test.ts` may keep a wide `Record<string, DocumentChain<unknown>>`. Those loads stay `unknown`. The shipped path is `createGameStorage` and `createFakeStorage`.

3. **Easing is the published cubic, copied as today.** Set `motion.scene.easing` to `[0.87, 0, 0.13, 1]`. Run `pnpm tokens`. Do not change the generator. The stylesheet test already expects `--ease-scene` to be the cubic-bezier formatted from the constant. No screen reads `--ease-scene`, so there is no playtest.
   Alternative: sample the Penner exponential into CSS `linear()`. Rejected. The token is four control points shared with CSS and Motion, and the proposal keeps that shape.

4. **Drop the job permission blocks.** Delete the `permissions` block under Install, Types, Lint, Tests, Build, and End-to-end. The workflow `permissions: contents: read` remains and is what every job inherits, including the title job, which already has no block. Do not add `cache-mode`. `push` and `pull_request` already receive cache write when `cache-mode` is omitted.
   Alternative: keep job blocks that say only `contents: read`. Rejected. That repeats the workflow key and is how `actions: write` was bolted on.

5. **Docs state the refusal.** Horizontal 05 gains a sentence: a save during a failed migration reports failed and leaves every key unchanged. Horizontal 06 gains a sentence: that save does not run, and the live value is not rotated. The `src/AGENTS.md` platform bullet says a previous value is rotated only when it is not invalid and its migration can finish, and that a failed migration refuses the save.

## Risks / Trade-offs

- [The inferred store type is not assignable to `Storage`] → The overloads on `Storage` are the contract. Adjust the generic until `createGameStorage` returns `Storage` with no assertion. Do not add `as`.
- [A type test that infers both sides from `storage.load` stays green if the chain is wrong] → The expected type comes from the schema `parse`. The actual type comes from `storage.load`. Compare them with `expectTypeOf`.
- [Removing a job `permissions` block drops `contents: read`] → The workflow key still sets it. The title job already inherits that key.
- [`0.87, 0, 0.13, 1` is a cubic approximation of the exponential] → Accepted in the proposal. The spec names those points.

## Migration Plan

No saved document is rewritten. A backup ring an older build already rotated is left as it is. Rollback is reverting the change. Deploy does not migrate IndexedDB.
