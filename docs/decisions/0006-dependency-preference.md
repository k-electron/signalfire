# 0006. Dependency preference

Status: accepted
Date: 2026-10-13

## Context

C7 required a justification for every runtime dependency and let development dependencies in without one. It did not say what kind of library to prefer. verzod was the case: a thin migration helper whose published peer was Zod 3, while this repo uses Zod 4. The chain was hand-rolled.

## Decision

Prefer libraries with wide adoption, a long release history, and active maintenance, including support for the current major of their peers. A thin or stale library needs a stated reason in its proposal; otherwise hand-roll the small thing. The rule applies to runtime and development dependencies. A runtime dependency still names its purpose, size impact, license, and alternatives. Permissive licenses stay preferred.

## Consequences

Constitution C7 is version 1.4.0. Later proposals follow this preference. verzod stays out. Dependencies already in the repo are not re-litigated by this record.
