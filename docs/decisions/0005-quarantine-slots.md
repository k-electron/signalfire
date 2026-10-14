# 0005. Quarantine slots

Status: accepted
Date: 2026-10-13

## Context

Decision 0004 keeps one quarantine key, `quarantine:<key>`. A later invalid value replaced that key. The first failed bytes, the ones a bug report needs, were gone. No player data uses these names yet.

## Decision

Quarantine keys are `quarantine:<key>:0`, then `:1`, and so on. A new invalid value is appended. An earlier slot is not overwritten. The same raw value is not stored twice. This supersedes the single quarantine key in decision 0004. The database name and the backup keys in that decision stay.

## Consequences

A reader of an old `quarantine:<key>` value will not see it in the new slots. Nothing in the game has written that key for a player. Changing the slot prefix again needs another decision record.
