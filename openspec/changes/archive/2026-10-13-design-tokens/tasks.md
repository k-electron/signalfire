# Tasks

## 1. Theme constants

- [x] 1.1 Branch `change/design-tokens` from current `main`. Add `src/core/theme/tokens.test.ts` that imports `tokens` from `./tokens` and asserts every constants scenario in `specs/design-tokens/spec.md`: semantic colors (including card alpha 0.72 and radius 14), finger colors, meaning colors (`text-active` pairs `#FFFFFF` with `glow-sm`), the ten zone colors (zone 5 has second accent `#FB7185`; zone 9 accent is `#9CA3AF`), the ten zone names from horizontal 07's zone table, the three font families and the eight type steps, glass, the three glows, focus, the four motion tokens, the five layer indexes, the icon stroke and sizes, and a hex integer for every documented hex (`background` is `0x0B1026`). Run `pnpm test:unit` and verify this file fails because `./tokens` is missing.
- [x] 1.2 Add `src/core/theme/tokens.ts` as the `tokens` object from design.md. No imports. Hex strings stay uppercase. Run `pnpm test:unit` and verify `tokens.test.ts` passes. Verify the file contains no `import`.

## 2. Generator and commands

- [x] 2.1 Read `culori`'s license. Stop if it is not MIT, Apache-2.0, BSD, or ISC. Add `culori`, `tailwindcss`, and `@tailwindcss/vite` as devDependencies with exact versions. Run `pnpm install` and verify the lockfile pins those three and they are not in `dependencies`.
- [x] 2.2 Add `tools/tokens/generate.mjs` from design.md. It imports `../../src/core/theme/tokens.ts` and `culori`, writes `src/app/theme/tokens.css` only when the bytes differ, and `--check` compares without writing. Exclude that CSS file in `biome.jsonc` `files.includes`. Set `tokens`, `dev`, and `build` in `package.json` as design.md specifies, and append `node tools/tokens/generate.mjs --check` to `lint`. Verify `pnpm tokens` prints `wrote src/app/theme/tokens.css`, a second `pnpm tokens` prints `fresh src/app/theme/tokens.css`, and `git diff -- src/app/theme/tokens.css` is empty after the second run.
- [x] 2.3 Run `pnpm tokens --check` and verify it exits 0 and does not change the file. Change one byte of `src/app/theme/tokens.css`, run `pnpm lint`, and verify it fails. Restore the file with `pnpm tokens` and verify `pnpm lint` passes. Verify `git status` is clean for that CSS file.
- [x] 2.4 Update the command tables in `AGENTS.md`, `docs/horizontals/02-repo-setup.md`, and `docs/horizontals/10-ci-cd-and-hosting.md`: add `pnpm tokens`, and add the token check as the step after the layer-boundary proof in the lint row. Remove `tokens` from the "arrive with later tasks" sentences. Verify `AGENTS.md` is under 200 lines. Do not edit the GitHub workflow or `docs/ROADMAP.md`.

## 3. Page

- [x] 3.1 Add `e2e/theme.spec.ts` using `e2e/fixtures.ts`. On `/`, expect `html` background color `rgb(11, 16, 38)`, `html` text color `rgb(230, 234, 245)`, the heading Signalfire, `--zone-accent` different for `data-zone` `0` and `5`, and `--zone-accent-2` empty on zone 0 and non-empty on zone 5. Run `pnpm test:e2e e2e/theme.spec.ts` and verify it fails on the background color.
- [x] 3.2 Register `@tailwindcss/vite` in `vite.config.ts`. Add `src/app/theme/app.css` from design.md and import it from `src/main.tsx`. Set `data-zone="0"` on `<html>` in `index.html`, remove the `base.css` link, and delete `src/base.css`. Leave the heading text Signalfire. Do not set `font-family` on `html` or `body`. Run `pnpm build` and verify the emitted CSS contains `oklch(` and does not contain the literal `@theme`, and the build log prints the tokens line before Vite builds.
- [x] 3.3 Run `pnpm test:e2e e2e/theme.spec.ts` and verify it passes. Run `pnpm test` and verify the harness heading smoke still passes.
- [x] 3.4 Run `pnpm dev`. Verify the tokens line prints before the dev server is ready, then open the page. Confirm the background is the dark token color, the text is the light token color, and the only visible text is Signalfire. Stop the server. Attach a screenshot. Fill the playtest checklist from `docs/horizontals/08-testing-and-dev-practices.md`: the active-character, effect, keystroke, frame-rate, error, audio, and pause items are N/A because this change only recolors the empty page; the doc item cites horizontal 07's `background` and `foreground` tokens. Feel is unchanged, so the checklist does not ask Karim to play it for feel.

## 4. Integration

- [x] 4.1 Run `pnpm check`. Verify typecheck, lint (including the token check), both Vitest projects, and build pass. Verify `docs/ROADMAP.md` still says Stage 1 is "Not started". Verify `index.html` has no `<style` and no link to `base.css`.
- [x] 4.2 Ask a fresh-context agent that did not write the code to review the diff against this change, horizontal 07 (Decisions, Token pipeline, the token tables, Rules), horizontal 03 (Tailwind), and the constitution. The review reports correctness and requirement gaps only. Verify each finding is fixed or answered in the pull request.
- [ ] 4.3 Open the pull request from `change/design-tokens` with title `feat(theme): generate the theme stylesheet from core tokens`. Fill the template: OpenSpec link, constitution check, test evidence (`pnpm check` and `pnpm test:e2e`), the screenshot and playtest checklist, docs updated (AGENTS.md, horizontals 02 and 10), and the assumptions from the proposal. Do not merge.

## Workflow follow-up

- Archive this change (`/opsx:archive`) on the branch after Karim's review requirements are satisfied and before the squash-merge, so the delta lands in `openspec/specs/`.
- Leave `docs/ROADMAP.md` status "Not started".
