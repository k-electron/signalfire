# Spec Delta

## MODIFIED Requirements

### Requirement: Jobs request the permissions they use

The workflow SHALL request `contents: read`. Every job SHALL run with that permission, including the title job and each job that restores or saves the pnpm store or the browser directory.

#### Scenario: The workflow permissions match the jobs

- **WHEN** the workflow file is read
- **THEN** the workflow requests contents read, and the title job and each job that restores or saves a cache run with contents read
