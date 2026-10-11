# docs

Design intent: philosophy, verticals (what the game is), horizontals (how it's built), decision records, and the roadmap (build order).

## Rules

- `PHILOSOPHY.md` and `horizontals/01-constitution.md` change only through an approved amendment (constitution, Amendments).
- Accepted decision records in `decisions/` are never edited; a new record supersedes them.
- When a change departs from a doc, update the doc in the same pull request.
- When adding or renaming a doc, update the README index in its folder.
- Don't name trademarked games or products as inspirations; describe what they contribute instead. Cited sources may be named.

## Decision records

`decisions/NNNN-short-title.md`, MADR minimal:

```
# NNNN. Title
Status: proposed | accepted | superseded by NNNN
Date: YYYY-MM-DD

## Context
## Decision
## Consequences
```

## Before submitting a doc change

Check every passage against three tests and cut what fails:

1. **Earns its place:** if it were cut, would the reader be worse off? If not, cut it.
2. **Makes sense to a fresh reader:** no references to earlier drafts, chat conversations, or removed content ("now", "previously", "as discussed").
3. **Plain words:** use "use", not "leverage"; "to", not "in order to".

Also check that numbers, names, and decisions match the other docs. Contradictions are bugs; flag them in the pull request.
