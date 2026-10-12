# Spec Delta

## Purpose

GitHub shows the pull request fields and the three issue forms, and the public pages say how to report and that outside pull requests wait until the walking skeleton.

## ADDED Requirements

### Requirement: A new pull request asks for the contribution fields

The pull request body SHALL ask for an OpenSpec change link or `none` for a constitution C1 exemption, the constitution check, test evidence, visual evidence, docs updated, and assumptions.

#### Scenario: A collaborator opens a pull request

- **WHEN** a collaborator opens a new pull request after this template is on the default branch
- **THEN** the body asks for the OpenSpec change link, the constitution check, test evidence, screenshots or a recording, the docs updated, and the assumptions

### Requirement: A bug report collects a written report

Choosing Bug report SHALL open a form that requires what happened, what was expected, and the steps, asks for the browser, and can be submitted with no file attached.

#### Scenario: Someone chooses Bug report

- **WHEN** a person opens a new issue and chooses Bug report
- **THEN** the form requires what happened, what they expected, and the steps to reproduce, asks which browser they used, and can be submitted with no file attached

### Requirement: An idea collects the idea

Choosing Idea SHALL open a form that requires the idea and can be submitted with no other field filled.

#### Scenario: Someone chooses Idea

- **WHEN** a person opens a new issue and chooses Idea
- **THEN** the form requires a description of the idea and can be submitted with no other field filled

### Requirement: A typing-content report collects the word

Choosing Typing-content report SHALL open a form that requires the word or phrase and whether it is offensive, wrong, or both, and asks where it appeared.

#### Scenario: Someone chooses Typing-content report

- **WHEN** a person opens a new issue and chooses Typing-content report
- **THEN** the form requires the word or phrase and a choice of offensive, wrong, or both, and asks where it appeared

### Requirement: CONTRIBUTING tells outsiders how to report

`CONTRIBUTING.md` SHALL say that outside pull requests are not accepted until the walking skeleton stage exits, why, and how to open a bug report, an idea, and a typing-content report.

#### Scenario: An outside contributor reads CONTRIBUTING

- **WHEN** someone outside the project reads `CONTRIBUTING.md`
- **THEN** it says outside pull requests are not accepted until Roadmap stage 2 exits, because the walking skeleton is not in place and that is when the OpenSpec flow opens to them, and it tells them to use the bug report, idea, and typing-content report issues

### Requirement: The README says what the game is

The README SHALL describe the game as a browser game that teaches touch typing.

#### Scenario: A visitor reads the opening

- **WHEN** a visitor reads the start of the README
- **THEN** it describes a browser game that teaches touch typing

### Requirement: The README says the game is not deployed

The README play section SHALL say the game is not deployed yet.

#### Scenario: A visitor looks for where to play

- **WHEN** a visitor reads the README play section
- **THEN** it says the game is not deployed yet

### Requirement: The README states Stage 0

The README status section SHALL say the project is pre-alpha and that Stage 0 has not exited.

#### Scenario: A visitor reads the status

- **WHEN** a visitor reads the README status section
- **THEN** it says pre-alpha and that Stage 0 has not exited

### Requirement: The README says how the project is built

The README SHALL say the code is written by AI agents using OpenSpec, and SHALL link the philosophy and the design docs.

#### Scenario: A visitor reads how the project is built

- **WHEN** a visitor reads that README section
- **THEN** it names AI agents and OpenSpec, and links the philosophy and the design docs

### Requirement: The README says how to run locally

The README SHALL give `pnpm install` and `pnpm dev` as the local run commands.

#### Scenario: A visitor runs the project locally

- **WHEN** a visitor follows the README run section
- **THEN** the commands are `pnpm install` and `pnpm dev`

### Requirement: The README says how to contribute

The README contributing section SHALL name bug, idea, and typing-content issues, say that outside pull requests are not accepted yet, and link `CONTRIBUTING.md`.

#### Scenario: A visitor looks for how to contribute

- **WHEN** a visitor reads the README contributing section
- **THEN** it names those three issue types, says outside pull requests are not accepted yet, and links `CONTRIBUTING.md`

### Requirement: The README privacy note matches the device

The README privacy note SHALL say typing data stays on the device.

#### Scenario: A visitor reads the privacy note

- **WHEN** a visitor reads the README privacy note
- **THEN** it says typing data stays on the device

### Requirement: The README states the license

The README license section SHALL say the project is MIT, covering code and game content, and that the license does not grant rights to the project name.

#### Scenario: A visitor reads the license

- **WHEN** a visitor reads the README license section
- **THEN** it says MIT, covering code and game content, and that the project name is not covered
