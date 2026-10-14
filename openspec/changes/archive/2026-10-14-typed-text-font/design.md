# Design

## Context

See proposal.md for why. Requirements are in `specs/typed-text/spec.md`.

`src/app/theme/tokens.css` already names the three families and the type steps. `src/app/theme/app.css` imports Tailwind and that file. `src/main.tsx` imports `app.css`. No `@font-face` is loaded. The title uses `text-display-xl` and `text-ui-lg` and does not set `font-display` or `font-ui`. `public/_headers` already sends `font-src 'self'` with the rest of the site-only policy. Vite preview does not apply that file. `app/components/` does not exist yet. There is no `THIRD_PARTY_NOTICES.md`.

The 5.3.0 package `LICENSE` is the SIL Open Font License, Version 1.1. `latin-400.css` is one `@font-face` for family `Atkinson Hyperlegible Mono`, weight 400, normal, with relative `woff2` and `woff` urls. `:root` defines `--glow-sm`, `--motion-micro-duration` (100ms), `--glass-border-width` (1px), `--static`, and the finger colors. `--ease-micro` is only inside `@theme inline`, so component CSS cannot rely on `var(--ease-micro)`.

## Goals / Non-Goals

**Goals:**

- The served page can resolve Atkinson Hyperlegible Mono from its own origin.
- `TypedText` shows the five states in that face, at the target or prose step.
- The font copyright and the OFL text are in the repo and in the build output.
- `public/_headers` stays as it is.

**Non-Goals:**

- shadcn, Ladle, Space Grotesk, Inter, a finger map, a credits screen, and mounting `TypedText` on a screen.
- Scaling the active character. Vertical 10 gives no measure.

## Decisions

### Ship latin 400 normal, and re-read the license after install

Add `@fontsource/atkinson-hyperlegible-mono` at exactly `5.3.0` to `dependencies`, with no range, the same way `zod` is pinned. After install, read `node_modules/@fontsource/atkinson-hyperlegible-mono/LICENSE`. Stop if the file is missing or does not contain the sentence `This Font Software is licensed under the SIL Open Font License, Version 1.1.`

Import only this file from `src/app/theme/app.css`:

```css
@import "@fontsource/atkinson-hyperlegible-mono/latin-400.css";
```

Place it after the tokens import. Do not import `index.css`, `400.css`, or any other weight. Those files also pull latin-ext. Do not rewrite the package `@font-face`. It sets `font-display: swap` and the family name the theme token already uses.

`400.css` in that package is the weight-400 file for both subsets. `latin-400.css` is the latin subset only.

Alternative: vendor the woff files under `public/`. Rejected. Horizontal 07 names Fontsource, and the subset CSS already points at the files.

### The notices file is the OFL copy, and the build serves it

OFL condition 2 says each bundled copy carries the copyright notice and the license, in a form a reader can view. The woff bytes are compressed, so this change does not treat them as that copy.

`THIRD_PARTY_NOTICES.md` at the repo root starts with a short heading for Atkinson Hyperlegible Mono and the package version, then the package `LICENSE` text verbatim, including the copyright lines and the full SIL Open Font License 1.1. Do not rewrap or shorten the license.

A Vite plugin copies that file into the build as `THIRD_PARTY_NOTICES.md` at the output root (not under `/assets/`, so the year-long asset cache does not apply). `pnpm preview` then serves it at `/THIRD_PARTY_NOTICES.md`. One source file. No second copy in git.

`README.md` License section keeps the MIT sentence and links this file. `docs/horizontals/02-repo-setup.md` gains a bullet for this font. The SCOWL and LDNOOBW bullets gain the clause that those notices are added when those lists are bundled, so the doc stays true while the file holds only the font.

Alternative: the repo file only, and the deployed site relies on a later credits screen. Rejected. The site is a separate copy of the font files, and that screen does not exist.

### `TypedText` is an app component

`src/app/components/typed-text.tsx` exports `TypedText`. It imports `./typed-text.css` for the error flicker only. It does not import the font CSS. The page gets the face from `app.css`.

```ts
type Finger =
	| "l-pinky"
	| "l-ring"
	| "l-middle"
	| "l-index"
	| "r-index"
	| "r-middle"
	| "r-ring"
	| "r-pinky"
	| "thumb";

type TypedChar =
	| { text: string; state: "upcoming" | "active" | "error" }
	| { text: string; state: "typed" | "prefilled"; finger: Finger };

function TypedText(props: { chars: readonly TypedChar[]; step: "target" | "prose" }): JSX.Element
```

The root is a `span` with `whitespace-pre`, `font-mono`, and `text-type-target` or `text-type-prose`. Each character is a `span` whose text is `text`, with `data-state` set to the state. No timer, no effect, and no finger map. The caller passes the finger.

Classes, all from tokens:

| State | Treatment |
|---|---|
| `upcoming` | `text-foreground` |
| `active` | `text-text-active`, `underline`, and `[text-shadow:var(--glow-sm)]`. No scale. |
| `typed` | glyph color `color-mix(in oklch, var(--finger-…) 40%, transparent)` |
| `error` | `text-static` plus the flicker class |
| `prefilled` | the typed glyph color, plus `[outline:var(--glass-border-width)_dotted_var(--finger-…)]` |

Finger ids map to the existing variables `--finger-l-pinky` through `--finger-thumb`. Use `color-mix` for the 40% on the glyph, including typed characters, so a pre-filled outline stays at the full finger color. Element `opacity` would fade that outline.

`typed-text.css`:

```css
@keyframes typed-text-flicker {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0;
	}
}

.typed-text-error {
	animation-name: typed-text-flicker;
	animation-duration: var(--motion-micro-duration);
	animation-timing-function: ease-out;
	animation-iteration-count: 1;
}
```

`ease-out` is the micro easing in the theme constants. `@theme inline` does not leave `--ease-micro` on `:root`, so the stylesheet names the keyword and a comment points at that token. The dip to opacity 0 is the one flicker. The component does not change the state when the animation ends. The caller does.

Do not mount `TypedText` in `App` or on the title. The title copy stays Signalfire and "Press Space to start."

Alternative: Ladle stories for the five states. Rejected for this change. The proposal leaves Ladle out. The browser test and the playtest screenshots cover the states.

### Tests

`src/app/components/typed-text.browser.test.tsx` imports `../theme/app.css` and renders `TypedText`. Assert computed style, not class names:

- Target step: font family includes `Atkinson Hyperlegible Mono`, font size `40px`, line height `48px`. Prose step: `26px` and `38px`.
- Upcoming color is the computed foreground (`#E6EAF5`). Opacity is 1.
- Active color is `rgb(255, 255, 255)`, underline is set, font size matches a sibling, and `text-shadow` matches a probe whose text shadow is `var(--glow-sm)`.
- One typed character per finger: computed color matches a probe using that finger's `color-mix` at 40%.
- Error: computed color is the static color (`#9CA3AF`), animation duration is `100ms` or `0.1s`, iteration count is `1`, and `data-state` stays `error`. Rendering that character as `active` then shows the active color and no flicker animation.
- Pre-filled left index: glyph color matches the 40% mix of `#2DD4BF`, outline width is `1px`, outline style is `dotted`, outline color matches a probe set to `var(--finger-l-index)`.
- Characters `f`, space, `j`: the root text content is `f j`.

`e2e/typed-text-font.spec.ts` uses `e2e/fixtures.ts`. On `/`, resolve `40px "Atkinson Hyperlegible Mono"` through `document.fonts.load`, then `document.fonts.ready`. Every request whose URL contains `.woff` uses the page origin, at least one such request happens, and `document.fonts.check` for that size and family is true. Also request `/THIRD_PARTY_NOTICES.md` and expect the OFL sentence and the copyright line `Copyright 2020-2024 The Atkinson Hyperlegible Mono Project Authors`.

Do not assert the content security policy from a Vite preview response header. Vite preview does not apply `public/_headers`. The apply task checks that file still contains:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
```

The pull request records the same `font-src 'self'` on the Cloudflare preview response for `/`.

After `pnpm build`, the output contains a `woff2` asset and `THIRD_PARTY_NOTICES.md`, and it does not contain `fonts.googleapis.com`, `fonts.gstatic.com`, `fontsource.org`, `latin-ext`, or `latin-700`.

### Docs

Edit only the notices list in horizontal 02 and the README license section, as the decisions above say. Do not edit `docs/ROADMAP.md`, `AGENTS.md`, `src/AGENTS.md`, horizontal 07, or `public/_headers`.

## Risks / Trade-offs

- [The installed LICENSE differs from the 5.3.0 tarball] → Pin `5.3.0` and stop if the installed file lacks the OFL sentence.
- [A later weight or subset import pulls extra files] → Import `latin-400.css` only, and the build grep rejects `latin-ext` and `latin-700`.
- [`/` does not request the font until something resolves the family] → The end-to-end test resolves it. No hidden element on the title.
- [Vite preview omits the CSP header] → The header file stays unchanged, and the preview check is on the Cloudflare response.
- [The error dip to opacity 0 feels harsh] → It is one 100ms flicker, then the static color holds. The playtest checklist covers it. Karim can reject the assumption before apply.
- [Active text is not larger than its siblings] → Vertical 10 gives no measure. Recorded in the proposal. No new size token.

## Migration Plan

No saved data changes. The font files are hashed under `/assets/` and use the existing year-long cache. `index.html` stays `no-cache`, so a rollback deploy points the next load at the previous CSS and fonts. No schema or save migration.
