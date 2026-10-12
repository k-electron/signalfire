# Design

## Context

See proposal.md for why. `src/core` does not exist yet. The boundary check allows a core module to import only other core modules, `zod`, and `verzod`. None of those three is installed. `test-harness` collects `src/**/*.test.ts` in Node and `src/**/*.browser.test.tsx` in headless Chromium. fast-check 4.10.2 and `@fast-check/vitest` 0.5.0 are already dev dependencies. Requirements are in `specs/core-ports-and-rng/spec.md`.

## Goals / Non-Goals

**Goals:**

- Port types and fakes a Stage 1 loop and a Stage 2 save can call, without those systems existing yet.
- A generator whose unsigned 32-bit stream is fixed by the seed string, using only operations ECMAScript defines the same way in Node and in browsers.
- Tests that fail before the implementation exists, one per spec scenario, plus the properties the spec names.

**Non-Goals:**

- Wiring the outbox to `RenderOut` or `AudioOut`. A later loop drains and publishes.
- Backup keys, `list`, Web Locks, sign-in, or revisions on the storage ports.
- A float draw, `jump()`, or a mid-run copy of generator state.
- Validating that an event's step is an integer. The outbox stores the event it is given.

## Decisions

### mulberry32, one 32-bit word

`createRng(seed: string)` in `src/core/replay/rng.ts`. No new package, and no edit to the core import allowlist. This is a small game generator. It is not a cryptographic generator.

Mix the seed with FNV-1a 32 over UTF-16 code units (`charCodeAt`, not code points). Offset basis `2166136261`, prime `16777619`. For each code unit `c`: `h = Math.imul(h xor c, 16777619)`, then `h >>> 0`. That unsigned word is the starting state. Do not switch the mix to UTF-8 or `TextEncoder`.

`nextUint32` is mulberry32. `a` is the state:

```
a = (a + 0x6d2b79f5) | 0
t = Math.imul(a ^ (a >>> 15), 1 | a)
t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
return (t ^ (t >>> 14)) >>> 0
```

`| 0` keeps the add in signed 32-bit range, which is how `Math.imul` reads it. Return the unsigned value, not a float in `[0, 1)`. A one-line comment names mulberry32. Do not paste a license.

The first eight draws for `signalfire` and `signalfirf` were computed from this procedure in Node and checked with a separate Python transcription of the same 32-bit steps on 2026-10-12. The spec lists those values.

Rejected: a generator package (core cannot import it). `Math.random` (not seeded). A 128-bit generator (more machinery than level content needs).

### Draws content and spawning need

All of these advance the same stream. `int` is the shared unbiased draw.

- `int(min, max)` inclusive. Throw `RangeError` unless both bounds are safe integers, `min <= max`, and `span = max - min + 1` is from 1 through 4294967296. Rejection sampling: `limit = floor(2^32 / span) * span`, draw `nextUint32` until the value is below `limit`, return `min + (value % span)`. For `span` of 4294967296 the limit equals 2^32, so the first draw is always kept. Both bounds are safe integers and the result lies between them, so the sum stays inside the safe range.
- `pick`: `int(0, length - 1)` and return that element. Empty list throws `RangeError` before a draw. The element is not copied.
- `weighted`: one safe integer weight per item, each `>= 0`, lengths equal (shorter or longer throws). Empty list, a zero sum, or a sum above 4294967296 throws `RangeError` before a draw. Otherwise `int(0, sum - 1)` and walk from index 0, adding weights, and return the first item whose cumulative sum is greater than the ticket.
- `shuffle`: copy the list, then Fisher-Yates from the last index down to 1. At index `i`, swap with `int(0, i)`. The input array is not mutated. The first operation on seed `signalfire` shuffles `0, 1, 2, 3, 4` into `1, 2, 0, 3, 4`.
- `chance(n, d)`: throw `RangeError` before any draw unless `d` is an integer `>= 1` and `n` is an integer from 0 through `d`. Then return `int(0, d - 1) < n`. Zero consumes a draw and is false. `n === d` consumes a draw and is true.

Rejected: a float in `[0, 1)`. Stage 1 and Stage 2 choices are lanes, lengths, list indexes, and weights. Horizontal 04 says an outcome does not depend on a float.

### Forks are derived seeds, not jumps

The instance keeps the seed string it was created with. `fork(label)` does not read or write the mulberry32 state. The child seed is:

```
${seed.length.toString(16)}#${seed}${label.length.toString(16)}#${label}
```

`length` is the UTF-16 code unit count. Hex is lowercase and unpadded, so 10 is `a` and 0 is `0`. Seed `signalfire` and label `content` produce `a#signalfire7#content`. A fork of a fork uses the child's seed string as the parent seed.

The length prefix keeps `(seed, label)` pairs apart when a seed contains `#`. Do not concatenate the raw strings.

Rejected: splitting by advancing the parent. That depends on how many values the parent has already drawn, so adding a content draw would shift spawning.

### Five ports, one outbox, fakes beside them

| Module | Exports |
|---|---|
| `src/core/ports/clock.ts` | `Clock` with `step(): number` |
| `src/core/ports/storage.ts` | `Storage`: `get`, `set`, `delete`, each returning a promise |
| `src/core/ports/cloud-sync.ts` | `CloudSync` with the same three methods |
| `src/core/ports/domain-event.ts` | `DomainEvent`: `Hit`, `Error`, `WordComplete`, `LevelEnded`, each `{ readonly type, readonly step: number }` |
| `src/core/ports/render-out.ts` | `RenderOut.publish(events: readonly DomainEvent[])` |
| `src/core/ports/audio-out.ts` | `AudioOut` with the same `publish` |
| `src/core/ports/outbox.ts` | `createOutbox()` |
| `src/core/ports/fakes.ts` | `createFakeClock`, `createFakeStorage`, `createFakeCloudSync`, `createFakeRenderOut`, `createFakeAudioOut` |

No barrel file. `Storage` and `CloudSync` are separate interfaces with the same methods, so a later sync change can add cloud operations without changing local storage.

`createFakeClock(step = 0)` also has `setStep` and `advance`. Both require a safe integer `>= 0`, and the resulting step must be a safe integer. Otherwise throw `RangeError` and leave the step unchanged. `advance(0)` is allowed.

`createFakeStorage` and `createFakeCloudSync` each call one private helper that owns a `Map`. Two calls do not share a map. `set` stores `structuredClone(value)` and `get` returns another `structuredClone`. Use `structuredClone`, not spread, so a key such as `__proto__` stays data. A clone failure rejects the promise and writes nothing. `delete` of a missing key resolves. `get` of a missing key resolves to `undefined`.

`createOutbox`: `emit` copies the event and appends it. `drain` returns a copy of the pending events and clears the pending list. `publish` on a render or audio fake copies the array and each event, and appends that batch, including an empty batch. `batches()` returns the recorded batches.

Rejected: one shared key-value interface. Rejected: `Clock.nowMs()`. Wall time, including `updatedAt`, stays an argument of later save code. Rejected: the rest of horizontal 04's event table, and a run summary on `LevelEnded`. Those fields arrive with the systems that emit them.

### Decision record

`docs/decisions/0002-seeded-generator.md`, status accepted, date the day it is written. Context: replay needs one seed to draw the same sequence in every supported runtime, and core cannot take a generator dependency. Decision: mulberry32 seeded by FNV-1a 32, and the operations in this design. Consequences: changing them needs a new record and would break logs saved under this one. There are no logs yet. Add the row to `docs/decisions/README.md`.

## Risks / Trade-offs

- [A transcription error changes the stream] → The spec's `signalfire` prefix, the `signalfirf` first draw, and the `signalfire` shuffle are known answers. A mismatch fails the test.
- [Chromium is the only browser in the harness] → The browser test checks the same prefix. Firefox and Safari are not run. The steps are `Math.imul` and unsigned shifts, which ECMAScript defines for those browsers too.
- [A 32-bit mix repeats, and the state repeats after 2^32 draws] → Level content draws far fewer values. Two strings can share a mix. The divergence property skips those pairs. `signalfire` and `signalfirf` are the locked example. If 16 draws match for two different mixes, do not weaken the assertion.
- [`fc.jsonValue()` can yield `-0`] → `structuredClone` keeps it. Compare with `toEqual`. If a sample fails only because of `-0`, exclude `-0` from the arbitrary. Do not switch the fake to `JSON.parse(JSON.stringify(...))`, which collapses `-0` and drops `undefined` in arrays.
- [The fork encoding is part of the seed] → A property over arbitrary seeds and labels checks that `fork(label)` matches `createRng` of the derived string. Bound the strings (max length 40) so the property stays fast. The formula itself has no length limit.

## Migration Plan

No saved data. Nothing reads a seed until a later change writes run logs. Rollback is reverting the change.
