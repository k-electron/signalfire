# Spec Delta

## MODIFIED Requirements

### Requirement: The build uses the pinned pnpm and Node

A Cloudflare build SHALL run on the pnpm version in `packageManager` and the Node version the lockfile records for `devEngines.runtime`.

#### Scenario: A preview build runs

- **WHEN** a preview build runs
- **THEN** the build log shows that pnpm version and that Node version
