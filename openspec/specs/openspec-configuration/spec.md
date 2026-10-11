# openspec-configuration Specification

## Purpose

Makes every generated OpenSpec artifact carry the constitution's context and rules, and keeps the root agent instructions within the constitution's size limit.

## Requirements

### Requirement: Artifact instructions include project context and matching rules

When an agent requests instructions for any artifact, the response SHALL include the project context from `openspec/config.yaml` and the rules listed for that artifact.

#### Scenario: Context and matching rules are injected

- **WHEN** an agent generates any artifact
- **THEN** the project context and the matching rules from `config.yaml` are injected

#### Scenario: Artifact with no rule list

- **WHEN** an agent generates an artifact that has no rules entry in `config.yaml`
- **THEN** the project context is injected and no rules are added for that artifact

### Requirement: Root agent instructions stay short and ours

Root `AGENTS.md` SHALL stay under 200 lines and SHALL keep the project's agent instructions. Root `CLAUDE.md` SHALL contain only `@AGENTS.md`.

#### Scenario: Root AGENTS.md is read

- **WHEN** root `AGENTS.md` is read
- **THEN** it is under 200 lines and still holds our content

### Requirement: Config matches the constitution block

`openspec/config.yaml` SHALL match the YAML in the "OpenSpec configuration" block of `docs/horizontals/01-constitution.md`.

#### Scenario: Config and the constitution block are compared

- **WHEN** `config.yaml` and the constitution's block are compared
- **THEN** they match
