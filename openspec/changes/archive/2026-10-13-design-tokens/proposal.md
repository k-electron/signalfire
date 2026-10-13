# Proposal

## Why

Stage 1 needs one set of colors, type, surfaces, and motion that React and the engine share. The page still paints with the system colors in `src/base.css`, and nothing generates theme CSS from a core module.

## What Changes

- Add `src/core/theme/tokens.ts` with the color, type, surface, motion, layer, and icon values from horizontal 07. The module is plain constants. Colors are the documented hex values, also exported as numbers a renderer can import. No font files.
- Add `pnpm tokens`, which writes `src/app/theme/tokens.css` (OKLCH variables and the Tailwind v4 `@theme inline` map). `pnpm dev` and `pnpm build` run that command first. `pnpm tokens --check` fails when the committed CSS differs, and `pnpm lint` runs that check, so CI fails on a stale file.
- Add the Tailwind v4 Vite setup that compiles the generated CSS. Delete `src/base.css` and its link. The document uses the background and foreground tokens. Visible text stays Signalfire. The document carries `data-zone="0"`.

Out of this change: Fontsource and the Atkinson Hyperlegible Mono license check (roadmap stage 2), shadcn components, Ladle, lucide-react, and the Motion package.

## Capabilities

### New Capabilities

- `design-tokens`: Core theme constants, generated CSS that matches them, a lint failure when that CSS is stale, and a page painted with the background and foreground tokens.

### Modified Capabilities

- None. `hermetic-toolchain` and `static-hosting` still require the visible text Signalfire and `style-src 'self'`. The stylesheet stays a same-origin file. `pnpm check` still runs typecheck, lint, test, and build in that order (`test-harness`). `pnpm lint` still runs the layer-boundary proof (`layer-boundaries`, `ci-pipeline`). The token check is another step inside that same command, specified here.

## Impact

- New dev dependencies: `tailwindcss`, `@tailwindcss/vite`, and `culori`. No runtime dependency.
- New: `src/core/theme/`, `src/app/theme/`, `tools/tokens/generate.ts`, `e2e/theme.spec.ts`.
- Edited: `package.json`, `pnpm-lock.yaml`, `vite.config.ts`, `index.html`, `src/main.tsx`, `AGENTS.md`, `docs/horizontals/02-repo-setup.md`, `docs/horizontals/10-ci-cd-and-hosting.md`.
- Removed: `src/base.css`.
- Unchanged: the Signalfire heading, the GitHub Actions workflow, Cloudflare headers, roadmap status. Stage 1 stays "Not started".

## Principles served

- **P9.** Shared tokens are what later screens, the HUD, and the canvas use, so those surfaces can look like one game.
- **P13.** The token source and the pipeline land before components, fonts, and Ladle.
- P1–P8 and P10–P12 are not served. Gameplay, scoring, and saves stay as they are.

## Docs implemented

- `docs/ROADMAP.md` Stage 1, the design-tokens item. Sequence only. Status stays "Not started".
- `docs/horizontals/07-design-system.md`: token source, token pipeline, the color, type, surface, motion, layer, and icon tables, and the rules. Font hosting, shadcn, and Ladle stay decisions for later changes.
- `docs/horizontals/03-tech-stack.md`: Tailwind CSS v4 for React UI. shadcn, Motion, and lucide stay for later changes.
- `docs/horizontals/04-architecture.md`: `core/theme` holds plain constants; `app/theme` holds generated CSS and the Tailwind setup. Cited, not edited.
- `docs/horizontals/09-dev-tooling.md`: the `pnpm tokens` row. Already matches. Cited, not edited.
- `docs/horizontals/02-repo-setup.md`, `docs/horizontals/10-ci-cd-and-hosting.md`, and root `AGENTS.md`: `pnpm tokens`, and the token check inside `pnpm lint`.
- `src/AGENTS.md`: core holds the tokens; colors and durations come from `tokens.ts`. Already matches. Cited, not edited.
- `docs/verticals/10-art-direction-and-vfx.md`: motion ranges. Horizontal 07 picks the durations inside those ranges. Cited, not edited.

## Departures

- The request names an inline style in `index.html`. Static deploy already moved that block to `src/base.css`. This change deletes that file and paints from the tokens. Horizontal 07 is unchanged.
- Horizontal 07 maps tokens for Tailwind and shadcn. This change adds Tailwind and leaves shadcn, fonts, and Ladle for later. Those decisions stay; this change does not implement them.
- No decision record. The pipeline and Tailwind are already decided in horizontals 07 and 03.

## Assumptions

- The empty page uses semantic `background` and `foreground`, with `data-zone="0"` so the zone accent has a value. Zone ids on the attribute are `"0"` through `"9"`.
- `text-active` is `#FFFFFF` plus `glow-sm`. `static` is the flat color `#9CA3AF`. Zone 9 keeps the unrestored accent. Twin Suns' second accent exists only on zone 5.
- Family names are tokens. The page does not apply them, and no font package is installed.
- The standard-motion spring is stored as duration, stiffness, and damping. CSS has no spring function. The Motion package is not installed.

## Constitution check

- **C1.** One capability, `design-tokens`. Apply waits for approval.
- **C2.** Principles, docs, and departures are stated. Horizontal 07 does not need an edit.
- **C3.** Karim approves this proposal before apply. The agent does not merge and does not push to `main`.
- **C4.** Token tables are not a logic domain on the constitution list. A Node test locks the public constants, because the generator and the engine both read them. Command scenarios are one green run each. The page color is an end-to-end assertion, a screenshot, and the playtest checklist.
- **C5.** Strict TypeScript. The generator runs under Node's type stripping and uses no `any`. `core` does not import `culori`.
- **C6.** No decision record. See Departures.
- **C7.** No new runtime dependency. Dev dependencies: `tailwindcss` and `@tailwindcss/vite` (the Vite integration horizontals 03 and 07 name; they are build tools), and `culori` (hex to OKLCH in the generator only). Stop if `culori`'s license is not permissive (MIT, Apache-2.0, BSD, or ISC).
- **C8.** `AGENTS.md` gains a command row and stays under 200 lines. `CLAUDE.md` stays `@AGENTS.md`.
- **C9.** The module, generator, CSS, tests, docs, and tasks land together. Roadmap status stays "Not started" because stage 1's exit is still the replay and the migrating save. Archive copies the delta into `openspec/specs/`.
- **C10.** Non-trivial. Fresh-context review is a task.
