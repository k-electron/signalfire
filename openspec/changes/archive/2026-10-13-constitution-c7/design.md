# Design

## Context

See proposal.md. C7 is version 1.3.0's dependency article. It requires a runtime justification and a permissive license, and it says development dependencies may be added without proposal justification.

## Goals / Non-Goals

**Goals:**

- C7 states the preference rule, applies it to development dependencies, and is version 1.4.0.
- Decision 0006 records the amendment.

**Non-Goals:**

- Auditing dependencies already in the repo.
- A major version bump.

## Decisions

1. **Version 1.4.0, dated 2026-10-13.** The article is expanded. It is not removed. The runtime justification and the license bullet stay.

2. **Article text.** Replace the current C7 bullets with:
   - Prefer libraries with wide adoption, a long release history, and active maintenance, including support for the current major of their peers. A thin or stale library needs a stated reason in its proposal; otherwise hand-roll the small thing. This applies to runtime and development dependencies.
   - Every new runtime dependency is named and justified in its proposal: purpose, size impact, license, and alternatives considered.
   - Prefer permissive licenses (MIT, Apache-2.0, BSD, ISC).

   The OpenSpec configuration sample in the constitution repeats the proposal rules. It does not repeat the old dev-dependency exemption. Leave that sample unless a line contradicts the new article.

3. **Decision 0006.** MADR minimal. Context: C7 exempted development dependencies and did not say what to prefer. Decision: the preference rule above, including peer majors, and a stated reason for a thin or stale library. Consequences: later proposals follow it; verzod stays out. Use number 0006 if 0005 exists; otherwise the next free number. Update `docs/decisions/README.md`.

## Risks / Trade-offs

- [A later reader treats 1.4.0 as too small for the removed exemption] → The decision states that the exemption is what the expansion replaces. The Amendments section's minor rule is the one this change follows.

## Migration Plan

Docs only. Rollback is reverting the pull request. Proposals already merged are unchanged.

## Open Questions

None.
