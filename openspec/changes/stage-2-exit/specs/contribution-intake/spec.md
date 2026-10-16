# Spec Delta: contribution-intake

## MODIFIED Requirements

### Requirement: CONTRIBUTING tells outsiders how to report

`CONTRIBUTING.md` SHALL explain how outside contributors submit pull requests following OpenSpec (propose → apply → review) and the constitution, and SHALL explain how to open a bug report, an idea, and a typing-content report.

#### Scenario: An outside contributor reads CONTRIBUTING

- **WHEN** someone outside the project reads `CONTRIBUTING.md`
- **THEN** it explains that pull requests are accepted through OpenSpec and the constitution, and provides links and instructions for bug reports, ideas, and typing-content reports

### Requirement: The README says how to contribute

The README contributing section SHALL name bug, idea, and typing-content issues, invite outside pull requests, and link `CONTRIBUTING.md`.

#### Scenario: A visitor looks for how to contribute

- **WHEN** a visitor reads the README contributing section
- **THEN** it names those three issue types, welcomes outside pull requests, and links `CONTRIBUTING.md`

### Requirement: The README states Stages 0 and 1

The README status section SHALL say the project is pre-alpha and that Stages 0, 1, and 2 have exited.

#### Scenario: A visitor reads the status

- **WHEN** a visitor reads the README status section
- **THEN** it says pre-alpha and that Stages 0, 1, and 2 have exited
