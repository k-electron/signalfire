# Proposal

## Why

C7 lets any development dependency in without a reason, and it does not say what kind of library to prefer. verzod was the case this rule is for: a thin migration helper whose peer was Zod 3 while this repo uses Zod 4. The chain was hand-rolled. The constitution should say that before Stage 2 adds more libraries.

## What Changes

- Amend C7. Prefer libraries with wide adoption, a long release history, and active maintenance, including support for the current major of their peers. A thin or stale library needs a stated reason in the proposal; otherwise hand-roll the small thing. The rule applies to development dependencies as well as runtime dependencies.
- Keep the existing runtime justification (purpose, size, license, alternatives) and the permissive-license preference.
- Remove the sentence that development dependencies may be added without proposal justification.
- Bump the constitution from 1.3.0 to 1.4.0, dated 2026-10-13.
- Add decision 0006. Do not edit decisions 0001 through 0005.

Out of this change: adding or removing a dependency, and rewriting proposals that already landed.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- None. The constitution is the rule. `openspec/specs/` does not restate C7, and this change does not invent a spec for it.

## Impact

- `docs/horizontals/01-constitution.md` (article C7, the version line, and the copy of the article inside the OpenSpec configuration sample if that sample repeats the old dev-dependency sentence).
- `docs/decisions/0006-dependency-preference.md` and `docs/decisions/README.md`.
- `openspec/config.yaml` only if its proposal rules still tell agents that development dependencies need no justification. Today those rules say "Name and justify any new runtime dependency (C7)." That sentence stays true. No config edit unless apply finds a contradicting line.

## Principles served

- **P12.** Dependency choice follows a stated standard instead of an unexamined package.
- **P13.** The rule is in place before later stages add libraries.
- P1–P11 are not served.

## Docs implemented

- `docs/horizontals/01-constitution.md`, Amendments: an article that is materially expanded is a minor version. C7 is expanded, not removed. Version 1.4.0.
- `docs/AGENTS.md`: accepted decisions are not edited; 0006 is a new record.

## Departures

- No departure. The amendment is the constitution change the Amendments section describes.

## Assumptions

- Minor version 1.4.0, not major 2.0.0. C7 still exists, still requires a runtime justification, and still prefers permissive licenses. The expansion is the preference rule and its application to development dependencies. The removed sentence is the exemption that expansion replaces.
- "Stated reason" for a thin or stale library is a paragraph in that change's proposal: what it is, why a widely used library or a few lines of our own code will not do, and the peer majors it supports.
- A development dependency that meets the preference (wide adoption, long history, active maintenance, current peer majors) does not need the runtime essay (size impact and alternatives). It still needs a permissive license, which the existing license bullet already requires.
- Decision number 0006 assumes storage-safety has taken 0005. If 0005 is still free when this change is applied, use the next free number and say so in the pull request.
- No new runtime or development dependency.

## Constitution check

- **C1.** One change. No capability delta: the constitution is not an OpenSpec spec. `skip_specs: true`. Not a C1 exemption: this is an amendment, not a typo.
- **C2.** Principles, docs, and departures are stated above.
- **C3.** Karim approves this proposal before apply, and Karim ratifies the amendment by merging it. The agent does not merge it and does not push to `main`.
- **C4.** Docs are checked by reading the constitution and decision 0006. No new test.
- **C5.** No code.
- **C6.** New decision 0006. No accepted record is edited.
- **C7.** No new dependency. This change is the amendment of C7.
- **C8.** No `AGENTS.md` edit. The constitution remains the source those files point at.
- **C9.** Constitution, decision record, decision index, and `tasks.md` land together.
- **C10.** The amendment is short. The fresh-context review is a task because it changes a rule every later change must follow.
