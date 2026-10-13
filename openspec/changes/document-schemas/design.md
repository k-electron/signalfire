# Design

## Context

See proposal.md for why. `zod` is not installed. The boundary check still allows `verzod` in `src/core`; this change removes that. Requirements are in `specs/document-schemas/spec.md` and `specs/layer-boundaries/spec.md`.

## Goals / Non-Goals

**Goals:**

- One Zod pin, and a chain small enough to read: versioned schemas, one `up` per step, one parse result.
- Fixtures for the shipped examples, and a two-version proof that is not a saved document.

**Non-Goals:**

- A verzod-shaped API (`is`, `isLatest`, `entityReference`, `safeParseUpToVersion`).
- A pnpm peer override.
- Storage, quarantine, backups, merge, or `syncState`.
- Builders for new documents. Callers pass plain values; parse accepts or rejects them.

## Decisions

### Zod only

`pnpm add zod@4.6.6`. It is a `dependency`, not a dev dependency. Do not add verzod.

Rejected: Zod 4.6.7. Published 2026-10-12T16:29:37Z, inside `minimumReleaseAge: 1440`. Rejected: allowing verzod's Zod 3 peer against Zod 4. The `up` step does not need a library.

### The chain

`src/core/schemas/parse.ts` exports `defineDocument` and the result type:

```ts
type ParseResult<T> =
  | { status: "ok"; migrated: boolean; document: T }
  | { status: "newer"; version: number }
  | { status: "invalid" };
```

A version is either `{ initial: true, schema }` or `{ initial: false, schema, up }`. `up` takes the previous schema's output and returns the next value. `defineDocument({ latest, versions })` returns `{ parse }`.

`parse`:

1. If `v` is an integer greater than `latest`, return `newer` with that version. Do not validate the body.
2. If `v` is not an integer `>= 1`, or that version is missing, return `invalid`.
3. `safeParse` with that version's schema. Failure is `invalid`.
4. For each step from `v + 1` through `latest`: a missing step, or a step marked `initial`, is `invalid`. Call `up` with the previous output, then `safeParse` the result. Failure is `invalid`.
5. If no step ran, return `ok` with `migrated: false`. Otherwise `ok` with `migrated: true`.

`up` is called only with data that already parsed. The chain does not read the clock or a random source.

The two-version proof calls `defineDocument` inside the test. Version 1 is `{ v, stars }`. Version 2 copies `stars`, sets `v` to 2, and adds `note: "kept"`. A second document, versions 1 and 3 with no version 2, covers the missing step. Neither is a saved document, and neither has a fixture file.

### One module per document

| Module | Export |
|---|---|
| `src/core/schemas/ids.ts` | One Zod schema per stable ID kind except run ids |
| `src/core/schemas/run-id.ts` | `formatRunId`, `runId` schema |
| `src/core/schemas/parse.ts` | `defineDocument` |
| `src/core/schemas/profile.ts` | `profile`, version 1 |
| `src/core/schemas/settings.ts` | `settings`, version 1 |
| `src/core/schemas/progress.ts` | `progress`, version 1 |
| `src/core/schemas/run-log.ts` | `runLog`, version 1 |
| `src/core/schemas/run-index.ts` | `runIndex`, version 1 |

No barrel file. Each version 1 schema is `z.strictObject`, so an unknown key fails. `updatedAt` and the other instants are `z.iso.datetime({ offset: true })`. `rev` and the other integers are `z.int()` (safe integers). `rev` is `z.int().nonnegative()`. `v` is `z.literal(1)`.

Each saved document is one `defineDocument` call with `latest: 1` and a single initial version.

### ID patterns

A zone or level number is `0` or a non-zero digit followed by digits. A slug is `[a-z0-9]+` groups separated by a single `-`.

| Kind | Pattern |
|---|---|
| Zone | `zone:` + number |
| Level | `level:` + number + `.` + number |
| Side | `side:` + number + `.` + slug |
| Tier | `cadet`, `veteran`, or `ace` |
| Character | `char:` plus exactly one Unicode code point |
| Medal, machine, mod, achievement, dispatch, codex | that prefix plus `:` plus a slug |
| Cosmetic | `cosmetic:` + slug + `.` + slug |

`ids.ts` exports those schemas. Tests call `safeParse`.

### Run id

`formatRunId(timestampMs: number, entropy: Uint8Array): string`.

Throw `RangeError` unless `timestampMs` is an integer from 0 through 281474976710655 and `entropy.length` is 10. Each byte is 0 through 255, which a `Uint8Array` already guarantees.

Crockford alphabet `0123456789ABCDEFGHJKMNPQRSTVWXYZ`. Build the 128-bit value as the timestamp in the high 48 bits and the 10 bytes in the low 80. Emit 26 characters from the top, 5 bits each. The first character only has room for 3 bits, so a valid id starts with `0` through `7`.

The `runId` schema is `^[0-7][0-9A-HJKMNP-TV-Z]{25}$`. Lowercase and the letters I, L, O, and U fail.

The known answers are the spec scenarios. They were checked against the ULID spec's maximum string `7ZZZZZZZZZZZZZZZZZZZZZZZZZ` on 2026-10-12.

No monotonic generator. The caller supplies a new entropy for each id.

### Document fields the spec does not spell as a regex

Call sign: 1 to 24 Unicode code points, no leading or trailing U+0020, no code point below U+0020, and not U+007F. `Ada` passes. Empty, ` Ada`, and 25 code points fail.

Volumes: finite numbers from 0 through 1, inclusive. Effects intensity: `low`, `medium`, `high`.

Progress `levels` is a record. Keys match a level id or a side id. Each value is a strict object with at least one of `cadet`, `veteran`, `ace`. A tier record:

| Field | Rule |
|---|---|
| `stars` | integer 0 through 3 |
| `medals` | array of medal ids, no duplicates |
| `bestScore` | integer `>= 0` |
| `bestNetWpm` | finite number `>= 0` |
| `bestAccuracy` | finite number from 0 through 1 |
| `attempts`, `failedSinceLastStar` | integers `>= 0` |
| `calmUnlocked` | boolean |

An empty `levels` object is valid. A level key with no tier records is not.

Run log `mode`: `campaign`, `repair`, `systems-check`, `courier`, `daily-signal`, `deep-archive`. `seed` is any string, including empty. `contentVersion` and `engineVersion` are non-empty strings.

`inputs` is an array of `[stepDelta, character, flags]`. `stepDelta` is an integer `>= 0`. `character` is an integer code point from 0 through 1114111, excluding 55296 through 57343. `flags` is an integer from 0 through 7:

| Bit | Value | Meaning |
|---|---|---|
| 0 | 1 | key up (clear means key down) |
| 1 | 2 | ShiftLeft held |
| 2 | 4 | ShiftRight held |

Summary: `accuracy` as best accuracy, `netWpm` as best net WPM, `score` as best score, `stars`, `medals`.

Run index `kept` entries: `runId`, `levelId` (level or side), `tier`, `mode`, `kind` of `best` or `recent`. Run ids in one index are unique.

### Fixtures

`src/core/schemas/fixtures/<document>/v1.json` for `profile`, `settings`, `progress`, `run-log`, and `run-index`. Each file is the shipped example in the spec. The progress fixture is the cadet `level:1.1` record, not the empty document. The empty document and the invalid cases are inline in the tests.

Import the JSON from the test. If `tsc` rejects that import, set `resolveJsonModule: true` in `tsconfig.json`. Do not read fixtures with `node:fs`: core tests cannot import Node builtins.

One test loads every `v1.json`, parses it with that document, and expects `status: "ok"`, `migrated: false`, and `v` 1.

### Allowlist

In `biome.jsonc`, delete `!verzod` and `!verzod/**` from the core, core-test, and core-browser-test groups. Messages become "core may import only core and zod." and "core tests may import zod, vitest, fast-check, and @fast-check/vitest." The browser-test message does not name verzod; leave it.

`tools/layer-boundaries/fixtures/pass/src/core/tokens.ts` drops the verzod import. Add `tools/layer-boundaries/fixtures/fail/core-verzod/src/core/bad.ts` that imports `verzod`.

Horizontal 04: the core "May import" cell and the dependency-rule row say only `core` and Zod. Replace the sentence after the layer table with: the migration chain lives in `core`. verzod is not a dependency.

Horizontal 05: the Migrations row, the `v` row, and the Migrations section name the hand-rolled chain (versioned Zod schemas, one-step `up`, parse). Replace the Risk paragraph: verzod 0.5.1 is not adopted; the chain is in `src/core/schemas`.

Horizontal 06, the local-storage validation sentence: Zod validation and the core migration chain.

`docs/horizontals/README.md` index cell for 05: "schema migrations", not "verzod migrations".

Root `AGENTS.md` and the first paragraph of `src/AGENTS.md`: core imports only itself and Zod. The schemas bullet and the platform validation bullet name the chain, not verzod.

### Decision record

`docs/decisions/0003-run-log-encoding.md`, status accepted, date the day it is written. Context: a saved run id and a saved input tuple cannot change shape later without a migration. Decision: canonical ULID from a caller-supplied timestamp and 10 entropy bytes, and the three flag bits in this design. Consequences: changing either needs a new record and a new run-log version. Add the row to `docs/decisions/README.md`.

## Risks / Trade-offs

- [Version 1 omits fields horizontal 05 lists] → Adding them later is a new version and an `up`. Do not put empty maps on version 1 to avoid that.
- [An unknown field on version 1 is invalid, not stripped] → A later field has to bump `v`. That is what keeps an old build from dropping data it does not know.
- [Two runs in one millisecond can share an id if the caller reuses entropy] → Core does not read a random source. The caller passes 10 new bytes.
- [The ULID bit order is easy to get wrong] → The spec's three known strings fail the test if the encoder drifts.

## Migration Plan

No saved player data exists. Rollback is reverting the change.
