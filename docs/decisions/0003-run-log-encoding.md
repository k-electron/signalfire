# 0003. Run log encoding

Status: accepted
Date: 2026-10-12

## Context

A saved run id and a saved input tuple cannot change shape later without a migration. Core cannot read the clock or a random source, and a run id is a ULID.

## Decision

A run id is a canonical ULID. `formatRunId` takes a millisecond timestamp and 10 entropy bytes from the caller. Inputs are `[stepDelta, character, flags]`: a step delta, a Unicode code point, and three flag bits (key up, ShiftLeft, ShiftRight).

## Consequences

Changing the ULID encoding or the flag bits needs a new decision record and a new run-log version. Logs saved under this encoding would not replay after that change. There are no such logs yet.
