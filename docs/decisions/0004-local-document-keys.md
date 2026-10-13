# 0004. Local document keys

Status: accepted
Date: 2026-10-13

## Context

IndexedDB names and backup keys are part of the saved data. Renaming them after a player has saved makes those saves invisible, or drops them.

## Decision

The database is `signalfire` and the object store is `documents`. The live value is stored under the document key. Backups are `backup:<key>:0` (newest) through `backup:<key>:2`. The raw value that failed validation is kept at `quarantine:<key>`.

## Consequences

Changing any of these names needs a new decision record and a copy from the old keys. No player data uses these names yet.
