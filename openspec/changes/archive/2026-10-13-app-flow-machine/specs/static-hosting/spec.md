# Spec Delta

## MODIFIED Requirements

### Requirement: Production serves the title screen

A merge to `main` SHALL deploy the production build. The served document SHALL show the title screen: a heading Signalfire and the text "Press Space to start."

#### Scenario: Main is updated

- **WHEN** `main` is updated
- **THEN** the production URL's document shows a heading Signalfire and the text "Press Space to start."

### Requirement: Each pull request gets a preview

A pull request SHALL receive a preview URL for that branch's build. The preview document SHALL show the title screen: a heading Signalfire and the text "Press Space to start."

#### Scenario: A pull request is opened

- **WHEN** a pull request is opened
- **THEN** the pull request has a preview URL whose document shows a heading Signalfire and the text "Press Space to start."

## RENAMED Requirements

- FROM: `### Requirement: Production serves the empty page`
- TO: `### Requirement: Production serves the title screen`
