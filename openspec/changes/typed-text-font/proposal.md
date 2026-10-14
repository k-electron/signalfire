# Proposal

## Why

Stage 2 needs the typed-text face before a level shows a target. The theme already names Atkinson Hyperlegible Mono, and the page still has no font file, so text falls back to a generic monospace. The roadmap says to confirm that font's license file before shipping it.

## What Changes

- Self-host Atkinson Hyperlegible Mono from `@fontsource/atkinson-hyperlegible-mono` 5.3.0, latin, weight 400, normal. The page requests that file from its own origin.
- Add `TypedText`, with upcoming, active, typed, error, and pre-filled character states, in the mono face at the type-target or type-prose step.
- Add `THIRD_PARTY_NOTICES.md` with the copyright notice and the license text from that package's `LICENSE`. Point the README at the file.
- Leave `public/_headers` unchanged, including `font-src 'self'`.

Out of this change: shadcn components, Ladle, Space Grotesk, Inter, mounting `TypedText` on a screen, the finger map, and the credits screen.

## Capabilities

### New Capabilities

- `typed-text`: The page loads Atkinson Hyperlegible Mono from its own origin, and `TypedText` shows the five character states in that face.

### Modified Capabilities

- None. `design-tokens` still owns the family names and the type steps. `static-hosting` still serves the title screen and the current content security policy. This change does not edit that policy.

## Impact

- New runtime dependency: `@fontsource/atkinson-hyperlegible-mono` 5.3.0. See Dependencies.
- New: `src/app/components/typed-text.tsx`, a browser test of its states, an end-to-end check that the font request stays on the page origin, and `THIRD_PARTY_NOTICES.md`.
- Edited: `package.json`, `pnpm-lock.yaml`, `src/app/theme/app.css`, `README.md`, and the notices list in `docs/horizontals/02-repo-setup.md`.
- Unchanged: `public/_headers`, theme constants, title-screen copy, and roadmap status. Stage 2 stays "Not started".

## Dependencies

`@fontsource/atkinson-hyperlegible-mono` 5.3.0 is a runtime dependency. The app imports its CSS, and Vite emits the font files the CSS points at.

- **Purpose.** Self-host the typed-text face horizontal 07 names, with no request to a third-party font server.
- **Size.** Import `latin-400.css` only. In the 5.3.0 tarball that file references `atkinson-hyperlegible-mono-latin-400-normal.woff2` (10056 bytes) and the matching `.woff` (12760 bytes). The package unpacks to about 596KB across every weight and subset. The bundle includes the files that imported CSS references.
- **License.** `package.json` says `OFL-1.1`. The package `LICENSE` file is the SIL Open Font License, Version 1.1, with copyright 2020-2024 The Atkinson Hyperlegible Mono Project Authors. Confirmed 2026-10-14 by reading that file from the 5.3.0 tarball, not from the package description. The file does not name a Reserved Font Name.
- **Alternatives.** A font CDN is out: horizontal 07 forbids third-party font servers, and `font-src 'self'` would block the request. Copying the woff files into the repo by hand repeats the subset CSS the package already ships. `@fontsource-variable/atkinson-hyperlegible-mono` is a different package; one static weight covers the type scale.

OFL-1.1 is not on constitution C7's preferred code-license list. Horizontal 07 requires this face and OFL, and the roadmap requires the license file to be confirmed before the font ships. OFL allows bundling when each copy carries the copyright notice and the license. `THIRD_PARTY_NOTICES.md` carries both, copied from the package `LICENSE`.

## Principles served

- **P9.** Targets, decode lines, and prose use a face built so l, 1, I and O, 0 stay distinct.
- **P13.** The face and the character component land before a level paints targets.
- P1–P8 and P10–P12 are not served. Scoring, saves, and network destinations stay as they are.

## Docs implemented

- `docs/ROADMAP.md` Stage 2, the license-file bullet. Sequence only. Status stays "Not started".
- `docs/horizontals/07-design-system.md`: typed-text font, self-hosting through Fontsource, the `TypedText` row, and the rule that typed text uses the Mono font and those states. shadcn and Ladle stay decisions for later changes.
- `docs/horizontals/02-repo-setup.md`: Licensing. The notices list gains this font. SCOWL and LDNOOBW stay on the list for when those files are bundled; this change does not invent their notices.
- `src/AGENTS.md`: typed text uses `TypedText` and the Mono font. Already matches. Cited, not edited.
- `docs/verticals/10-art-direction-and-vfx.md`: Typography and the typed-text state table. Cited, not edited.
- `docs/horizontals/08-testing-and-dev-practices.md`: a browser test for `TypedText` states. Cited, not edited.
- `docs/horizontals/04-architecture.md`: `app/components`. Cited, not edited.

## Departures

- Horizontal 07 and `src/AGENTS.md` say every game component has Ladle stories, and horizontal 07 builds on shadcn. This change adds `TypedText` without Ladle and without a shadcn primitive. Those decisions stay. No doc edit.
- Horizontal 07 also names Space Grotesk and Inter, self-hosted. No element applies `font-display` or `font-ui`. The title uses the size utilities only. Those two faces stay unloaded. No doc edit.
- Horizontal 02 says the same attributions appear on the in-game credits screen. That screen does not exist. This change adds the notices file. The credits screen stays later. No doc edit.
- Vertical 10 says the active character is slightly larger and gives no measure. This change does not scale it. See Assumptions.

## Assumptions

- The 5.3.0 `LICENSE` file stays the license of the installed package. Apply reads that file again after install and stops if it is missing or is not the SIL Open Font License.
- Latin, weight 400, normal is the only face this change loads. US QWERTY characters sit in that file's coverage. The package CSS sets `font-display: swap`. This change does not override it.
- `TypedText` is not mounted on a screen. The title stays a heading Signalfire and the text "Press Space to start."
- The caller passes each character's state and, for typed and pre-filled, the finger. This change does not add a finger map.
- Upcoming uses the foreground color at full opacity. Active uses `text-active`, `glow-sm`, and an underline, at the same size as its siblings. Typed uses that finger's color at 40% opacity, the figure in vertical 10. Error uses the static color and one flicker of `motion-micro`, and stays in error until the caller sets it back to active. Pre-filled uses the typed treatment plus a dotted outline at the glass border width (1px) in the finger color. The static treatment here is that color and flicker.
- Tailwind `opacity-40` is that 40%.
- Vite preview does not send `public/_headers`. The end-to-end check proves the font request uses the page origin. The pull request records that the preview response still includes `font-src 'self'`.

## Constitution check

- **C1.** One capability, `typed-text`. Apply waits for approval.
- **C2.** Principles, docs, and departures are stated. Horizontal 02's notices list is the doc edit. The other docs stay as written.
- **C3.** Karim approves this proposal before apply. The agent does not merge and does not push to `main`.
- **C4.** `TypedText` is not a logic domain on the constitution list. Horizontal 08 asks for a browser test of its states. The font request is an end-to-end scenario. Visual evidence is screenshots of the five states and the playtest checklist.
- **C5.** Strict TypeScript. No `any`.
- **C6.** No decision record. The face, Fontsource, and OFL are already in horizontal 07. The unmeasured "slightly larger" stays an assumption in this proposal.
- **C7.** One new runtime dependency, justified above. No new dev dependency.
- **C8.** No instruction-file edit. `CLAUDE.md` stays `@AGENTS.md`.
- **C9.** The font import, component, tests, notices, README, horizontal 02, and tasks land together. Roadmap status stays "Not started" because stage 2's exit is still the first-run flow. Archive copies the delta into `openspec/specs/`.
- **C10.** Non-trivial. Fresh-context review is a task.
