# Spec Delta: test-harness

## ADDED Requirements

### Requirement: End-to-end tests support remote preview URLs

When `PLAYWRIGHT_BASE_URL` is set, Playwright SHALL execute tests against that URL without launching a local preview web server.

#### Scenario: Playwright runs against a deployed preview URL

- **WHEN** a test command runs with `PLAYWRIGHT_BASE_URL` pointing to a deployed preview URL
- **THEN** Playwright executes tests directly against that URL without starting a local web server
