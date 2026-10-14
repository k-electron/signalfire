# Horizontal 01: Constitution

**Version 1.4.0 · Amended 2026-10-13**

The rules for how this project is built. [PHILOSOPHY.md](../PHILOSOPHY.md) defines what we build and why; this document defines how. Every OpenSpec proposal, task, and pull request must comply.

## Who builds

Code is written almost entirely by AI agents using OpenSpec spec-driven development. Karim directs, approves proposals, and reviews merges. Rules are written to be checkable by agents.

## Order of authority

When documents conflict, the higher one wins:

1. `docs/PHILOSOPHY.md`
2. This constitution
3. Decision records (`docs/decisions/`)
4. Horizontal and vertical docs (`docs/horizontals/`, `docs/verticals/`)
5. OpenSpec specs (`openspec/specs/`)

**Docs are intent; specs are truth.** The docs describe the game we're aiming for. OpenSpec specs describe what is built. When a change departs from the docs, the same change updates the docs or adds a decision record explaining why.

## Articles

### C1. Every change goes through OpenSpec

- Changes follow propose → apply → archive (`/opsx:propose`, `/opsx:apply`, `/opsx:archive`).
- One capability per change. Large features are split into several changes.
- **Exempt (pull request only):** typo and wording fixes, formatting, and dependency patch updates.

### C2. Changes trace to the docs

Every proposal states:

- the philosophy principles it serves (P1–P13);
- the vertical and horizontal docs it implements;
- any departure from those docs, and how it is resolved (doc update or decision record).

### C3. Human gates

- Karim approves every proposal before `/opsx:apply`.
- Karim reviews every pull request before merge.
- Karim approves each stage exit in [`docs/ROADMAP.md`](../ROADMAP.md).
- CI must be green before review.
- Agents never merge their own pull requests and never push directly to `main`.

### C4. Test-first for logic

Logic is built test-first: tests are written and failing before the implementation.

**Logic domains:**

- input judging (hits, errors, Shift side, rollover)
- scoring, stars, medals, gates, unlocks
- telemetry metrics and aggregation
- adaptive engine (priority, repair runs, systems check, stuck help)
- text content generation and validation
- curriculum and level data validation
- data model migrations
- persistence and sync

Every scenario in a logic-domain spec maps to at least one test.

Tooling, CI, and docs are checked by running the command. A green run is the evidence. A scratch commit is for a bug under fix. Do not add a test or a scratch commit whose only job is to prove something was not done.

**Visual and game-feel work** (rendering, effects, animation, audio, layout) is verified by a playtest checklist and screenshots or recordings attached to the pull request, not by unit tests.

### C5. Strict TypeScript (enforced in CI)

- `strict` mode on.
- No `any`. Lint fails on explicit `any`.
- No `@ts-ignore`. `@ts-expect-error` only with a comment explaining why and linking an issue or decision record.

### C6. Decisions are recorded

- Decisions that are hard to reverse, or that a future contributor would question, get a decision record in `docs/decisions/NNNN-title.md`, using the MADR minimal template.
- Agents read related decision records before changing the areas they cover.
- Decision records are never edited after acceptance; a new record supersedes the old one.

### C7. Dependencies

- Prefer libraries with wide adoption, a long release history, and active maintenance, including support for the current major of their peers. A thin or stale library needs a stated reason in its proposal; otherwise hand-roll the small thing. This applies to runtime and development dependencies.
- Every new runtime dependency is named and justified in its proposal: purpose, size impact, license, and alternatives considered.
- Prefer permissive licenses (MIT, Apache-2.0, BSD, ISC).

### C8. Agent instruction files

- Instructions are tool-agnostic: any coding agent must be able to follow them.
- `AGENTS.md` at the repo root is the instruction file for all agents: under 200 lines, covering commands, conventions, and links to the docs. It does not copy the docs.
- Rules that apply to one area go in a nested `AGENTS.md` in that folder (`src`, `content`, `docs`).
- Every `AGENTS.md` has a sibling `CLAUDE.md` containing only `@AGENTS.md`, so Claude Code loads the same rules.
- Rules that must never be broken are enforced by CI or git hooks; instruction files are guidance.

### C9. Everything changes together

- Code, tests, config, comments, docs, OpenSpec specs, and tasks change in the same pull request. A change isn't done while any of them lags.
- Archiving a change merges its spec deltas into `openspec/specs/`.
- A stale doc is a bug.

### C10. Independent verification

- Non-trivial changes are reviewed in fresh context by an agent that did not write the code, against the OpenSpec change, the docs, and this constitution.
- The reviewer reports correctness and requirement gaps only. Each finding is fixed or answered in the pull request.
- Trivial changes (C1 exemptions) skip this step.

## Standards (reviewed, not CI-enforced)

Checked during proposal and pull request review:

- **Performance:** 60 fps during gameplay; keystroke-to-visual response within one frame (see vertical 04).
- **Privacy:** typing data never goes to third parties; it stays on the device or in the player's own cloud account (see vertical 06).
- **Scope:** "Not now" items in the philosophy stay out unless the philosophy changes first.

## OpenSpec configuration

`openspec/config.yaml` carries the constitution into every generated artifact:

```yaml
schema: spec-driven

context: |
  Read docs/PHILOSOPHY.md and docs/horizontals/01-constitution.md before writing any artifact.
  Docs (docs/verticals, docs/horizontals) are design intent; openspec/specs is current truth.
  TypeScript strict. Logic is test-first (constitution C4).

rules:
  proposal:
    - List the philosophy principles served (P1–P13).
    - List the vertical and horizontal docs implemented.
    - State any departure from the docs and how it is resolved.
    - Name and justify any new runtime dependency (C7).
    - Include a "Constitution check" confirming C1–C10.
  specs:
    - Requirements use SHALL; every requirement has WHEN/THEN scenarios.
    - State what the command or the player does. Out of scope stays in the proposal.
    - Do not add a SHALL NOT requirement, or a scenario whose only check is that a job, file, or directory is missing.
    - For tooling and CI, one happy-path scenario per command.
  tasks:
    - For logic domains, test tasks come before implementation tasks.
    - Visual and feel tasks end with a playtest-checklist task.
```

## Amendments

- Agents may propose amendments as an OpenSpec change touching this file, with a decision record.
- Only Karim ratifies amendments.
- Versioning:
  - **Major:** an article is removed or redefined.
  - **Minor:** an article is added or materially expanded.
  - **Patch:** wording changes only.
- The version and date at the top are updated with every amendment.

## Sources

- [OpenSpec repository](https://github.com/Fission-AI/OpenSpec) and [customization docs](https://raw.githubusercontent.com/Fission-AI/OpenSpec/main/docs/customization.md)
- [Claude Code memory docs (CLAUDE.md, AGENTS.md, scoped rules, hooks)](https://code.claude.com/docs/en/memory)
- [MADR templates](https://scriptagc.wasmer.app/https_adr_github_io/madr)
- [Spec Kit constitution concept](https://xebia.com/blog/building-software-with-spec-kit/)
