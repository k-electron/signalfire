# 0001. Prove the command, not the absence

Status: accepted
Date: 2026-10-12

## Context

C4 said every OpenSpec scenario maps to a test. Specs then grew requirements whose only check was that some job, file, or directory was missing. Agents treated those as work to falsify, with scratch commits and scans of the machine. The toolchain stays inside the repo. That does not require an inventory of the machine.

## Decision

Logic-domain scenarios map to tests. Tooling, CI, and docs are checked by running the command once. A green run is enough. Out of scope stays in the proposal. A spec does not add a requirement whose only check is that something is missing. A hermetic check confirms the path the script wrote. It does not scan the home directory, global caches, or PATH.

## Consequences

C4, the testing definition of done, the OpenSpec spec rules, and the hermetic sentence in `AGENTS.md` and repo setup say this.
