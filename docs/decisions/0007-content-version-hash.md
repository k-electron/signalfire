# 0007. Content version hash

Status: accepted
Date: 2026-10-14

## Context

A run log stores `contentVersion` so a later change can mark ghosts from an older level. The hash is permanent once a log stores it. Core cannot import `node:crypto`.

## Decision

A level's `contentVersion` is the lowercase hex SHA-256 (FIPS 180-4) of the UTF-8 bytes of the canonical JSON of `{ level, starBars, tuning }`. `starBars` is `null` when the zone omits them. Canonical JSON sorts object keys by UTF-16 code unit, keeps array order, and uses no insignificant whitespace. Carriage-return normalization happens before encoding: `\r\n` and then any remaining `\r` in every string become `\n`. The level in that object is the accepted level, with allowed keys and focus keys already sorted. The zone name and the zone key set are not inputs.

## Consequences

Changing the canonical form needs a new decision record. Logs that stored a hash would not match after that change. None exist yet. No new dependency.
