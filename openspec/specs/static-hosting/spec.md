# static-hosting Specification

## Purpose

Cloudflare Workers serves the built app from `main`, gives each pull request a preview URL, and sends the security and cache headers.

## Requirements

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

### Requirement: The document is revalidated and locked to the site

The HTML document SHALL be served with a Content Security Policy whose script, style, and connection sources are the site itself, with `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, a Permissions-Policy that disables camera, microphone, and geolocation, and a cache policy that revalidates before use.

#### Scenario: The preview document is requested

- **WHEN** the preview URL `/` is requested
- **THEN** the response `Content-Security-Policy` includes `default-src 'self'`, `script-src 'self'`, `style-src 'self'`, and `connect-src 'self'`, and the response includes `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, a `Permissions-Policy` that disables camera, microphone, and geolocation, and `Cache-Control: no-cache`

### Requirement: Hashed assets are cached for a year

A built file under `/assets/` SHALL be cached for one year and marked immutable.

#### Scenario: A hashed asset is requested

- **WHEN** a file under the preview URL `/assets/` is requested
- **THEN** the response `Cache-Control` is `public, max-age=31536000, immutable`

### Requirement: The build uses the pinned pnpm and Node

A Cloudflare build SHALL run on pnpm 12.11.2 and Node 26.11.1.

#### Scenario: A preview build runs

- **WHEN** a preview build runs
- **THEN** the build log shows pnpm 12.11.2 and Node 26.11.1
