# Horizontal 02: Repo Setup and Conventions

How the repository is hosted, laid out, licensed, and worked in.

## Decisions

| Topic | Decision |
|---|---|
| Hosting | GitHub, public |
| License | MIT for code and creative content |
| Contributions | Issues open now (bug report, idea, typing-content report). Discussions stay off until that GitHub setting is on. Pull requests from outside contributors open after the walking skeleton |
| Shape | Single app package with clear internal folders |
| Package manager | pnpm, version pinned |
| Lint and format | Biome |
| Type checking | `tsc --noEmit`, strict (constitution C5) |
| Git hooks | Lefthook |
| Commits | Conventional Commits |
| Branches | One per OpenSpec change; squash merge to `main` |

## Licensing

- `LICENSE`: MIT, covering code and creative content (lore, story text, level data, docs).
- `THIRD_PARTY_NOTICES.md` holds required notices for bundled third-party data:
  - **SCOWL** word lists: copyright and permission notice.
  - **LDNOOBW** blocklist: CC BY 4.0 attribution.
- The same attributions appear on the in-game credits screen.
- MIT does not grant rights to the project's name. The codename "Signalfire" and any final name are not covered by the license.

## Contributions

- **Now:** Issues are open: bug report, idea, and typing-content report. `CONTRIBUTING.md` explains that outside pull requests are not yet accepted and why, and how to open each issue type. Discussions stay off until the GitHub setting is turned on. Until then, ideas use the idea issue.
- **After the walking skeleton:** pull requests open to outside contributors, who follow the same OpenSpec propose → apply flow and the constitution.
- Issue templates: bug report, idea, typing-content report (for an offensive or wrong word in a list).

## Top-level layout

```
/
├── AGENTS.md                 Agent instructions (under 200 lines)
├── CLAUDE.md                 Imports AGENTS.md
├── README.md
├── LICENSE
├── THIRD_PARTY_NOTICES.md
├── CONTRIBUTING.md
├── docs/
│   ├── PHILOSOPHY.md
│   ├── verticals/
│   ├── horizontals/
│   └── decisions/            MADR-minimal decision records
├── openspec/
│   ├── config.yaml
│   ├── specs/
│   └── changes/
├── src/                      App source (internal layout defined in Architecture)
├── content/                  Game data: levels, curated word lists, story text
├── tools/                    Build-time scripts: word-list builder, content validators
├── public/                   Static files served as-is
├── e2e/                      End-to-end tests (unit tests sit next to the code)
├── .github/                  Workflows, issue templates, pull request template
├── .agents/                  OpenSpec skills and workflows; .openspec-target names the owner
├── .claude/                  Claude Code slash commands and OpenSpec skills
├── .cursor/                  Cursor slash commands and OpenSpec skills
├── .gitignore
├── index.html
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tsconfig.json
├── vite.config.ts
├── biome.jsonc
├── lefthook.yml
```

`content/` is separate from `src/` so game data can be validated, reviewed, and edited without touching code.

## Toolchain pins

- **Node:** Node 26, pinned with `devEngines.runtime` in `package.json` (`onFail: download`), so pnpm downloads that runtime for the project. The [Node.js release schedule](https://github.com/nodejs/Release/blob/main/README.md) starts Active LTS for Node 26 on 2026-10-28.
- **pnpm:** pinned with the `packageManager` field in `package.json`.
- Dependency versions are locked by `pnpm-lock.yaml`; CI installs with a frozen lockfile.
- Project tooling (build, lint, test, dev servers, browsers) is installed in this repo and run through pnpm scripts or `pnpm exec`. Do not install it globally. The OpenSpec CLI is the exception: it is installed globally, outside this repo, and is not a `package.json` dependency.
  - Use `pnpm`, not `npm` or `npx`. npm refuses to run in this repo because `devEngines` is set.
  - Run tests and browsers through the pnpm scripts (`pnpm test`, `pnpm test:e2e`, `pnpm browsers:install`). They set `PLAYWRIGHT_BROWSERS_PATH=0` so Chromium installs inside `node_modules`. Do not run `playwright` or `vitest` directly through `pnpm exec` for browser work.
  - Hermetic is a guideline, not an audit. Install through pnpm into this repo and don't install tools globally. Checking the path the script wrote is enough. Don't scan or inventory the home directory, global caches, or PATH.

## Scripts

Agents and humans use the same commands. `AGENTS.md` lists them. Browser tests and end-to-end need `pnpm browsers:install` after `pnpm install`. `content:words`, `content:hash`, and `ladle` arrive with later tasks.

| Script | Does |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm preview` | Serve the production build locally |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | Biome check, then the layer-boundary fixture proof, then the token check, then the node-version check |
| `pnpm tokens` | Regenerate theme CSS from `src/core/theme/tokens.ts` |
| `pnpm format` | Biome format and safe fixes |
| `pnpm test` | Vitest Node and browser projects |
| `pnpm test:unit` | Vitest Node project (pre-push) |
| `pnpm test <pattern>` | Run matching tests only |
| `pnpm browsers:install` | Install Chromium inside the repo |
| `pnpm test:e2e` | Playwright against the production build |
| `pnpm content:check` | Validate zones, levels, and tuning |
| `pnpm check` | Typecheck, lint, content check, test, and build |

## TypeScript settings

Beyond `strict`:

| Option | Why |
|---|---|
| `noUncheckedIndexedAccess` | Array and map lookups may be undefined; catches a common bug class in game loops and lookups |
| `noImplicitOverride` | Makes class overrides explicit |
| `noFallthroughCasesInSwitch` | Prevents accidental fall-through in state machines |
| `verbatimModuleSyntax` | Keeps type-only imports explicit |

## Biome settings

- Recommended rule set (`preset` set to `recommended`), with `noExplicitAny` as an error (constitution C5).
- Biome's default formatting (no custom style debates).
- Import sorting on.

## Naming conventions

| Thing | Convention | Example |
|---|---|---|
| Files and folders | kebab-case | `star-rating.ts` |
| React components | PascalCase export | `export function ResultsScreen` |
| Types and interfaces | PascalCase | `KeyRecord` |
| Functions and variables | camelCase | `computeConfidence` |
| Constants | camelCase, or SCREAMING_SNAKE for fixed tuning values | `MAX_COMBO_TIER` |
| Unit and property tests | Next to the code, `*.test.ts` | `star-rating.test.ts` |
| Component tests | Next to the component, `*.browser.test.tsx` | `app.browser.test.tsx` |
| End-to-end tests | `e2e/*.spec.ts` | `e2e/harness-smoke.spec.ts` |
| Content files | kebab-case, ID-prefixed where ordered | `content/levels/2-4-reach-words.json` |

## Git workflow

### Branches

- `main` is protected: no direct pushes, pull requests only, CI must pass.
- `change/<openspec-change-name>` for every OpenSpec change.
- `fix/<short-slug>` for exempt changes (constitution C1: typos, formatting, patch updates).

### Commits

Conventional Commits: `type(scope): summary`.

- **Types:** `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `content`.
- **Scope:** the area touched (`scoring`, `lanes`, `sync`, `audio`, `content`, `docs`).
- Examples:
  - `feat(scoring): award stars from integrity and velocity bars`
  - `content(words): add curated home-row list`

### Pull requests

- Squash merge. The pull request title becomes the commit message and must follow Conventional Commits.
- The pull request template asks for:
  - a link to the OpenSpec change;
  - the constitution check;
  - test evidence for logic changes;
  - screenshots or a recording for visual and feel changes;
  - docs updated;
  - assumptions made.

### Hooks (Lefthook)

| Hook | Runs |
|---|---|
| `pre-commit` | Biome check with safe fixes on staged files, then typecheck |
| `commit-msg` | Conventional Commits format check |
| `pre-push` | Node unit tests (`pnpm test:unit`) |

Hooks are a fast local safety net. CI is the authority.

## Agent files

Instructions work for any coding agent (constitution C8).

| File | Contents |
|---|---|
| `AGENTS.md` (root) | Working principles, doc map, OpenSpec workflow, when to ask, commands, definition of done, code and test rules, writing style, commit format, gotchas |
| `src/AGENTS.md` | One section per layer: `core` purity and migrations, `engine` frame and effect budgets, `platform` storage and sync, `app` machines, stores, and keyboard-first UI |
| `content/AGENTS.md` | Validation, permanent IDs, key-set rule, word-list sources, original text only |
| `docs/AGENTS.md` | Governing files, decision record template, doc review tests |
| `CLAUDE.md` (next to each) | `@AGENTS.md` only |

`.agents/`, `.claude/`, and `.cursor/` hold the skills and slash commands OpenSpec installs. `.agents/skills/.openspec-target` is `codex`, the owner of the shared skill tree. The Claude Code formatting hook arrives with Dev Tooling, in `.claude/settings.json`. Other agents get the same workflows through their own tool folders when those tools are selected.

## README

Short and public-facing:

- What the game is, with a screenshot or GIF once one exists.
- Where to play (link to the hosted game) and the project status.
- How the project is built (docs, OpenSpec, AI agents), with links.
- How to run locally (`pnpm install`, `pnpm dev`).
- How to contribute and report bugs, linking `CONTRIBUTING.md`.
- A short privacy note. Until analytics is counting, it says typing data stays on the device. Once counting exists, it links the event list in horizontal 10.
- License, and third-party notices once `THIRD_PARTY_NOTICES.md` exists.

## Sources

- [pnpm vs Bun vs npm (PkgPulse)](https://www.pkgpulse.com/guides/pnpm-vs-bun-vs-npm-2026)
- [Biome vs ESLint (Better Stack)](https://betterstack.com/community/guides/scaling-nodejs/biome-eslint/)
- [Biome vs ESLint vs Oxlint (PkgPulse)](https://www.pkgpulse.com/guides/biome-vs-eslint-vs-oxlint-2026)
- [Husky vs Lefthook vs lint-staged (PkgPulse)](https://www.pkgpulse.com/guides/husky-vs-lefthook-vs-lint-staged-git-hooks-nodejs-2026)
- [Claude Code memory docs (AGENTS.md import)](https://code.claude.com/docs/en/memory)
- [AGENTS.md format](https://agents.md/)
