# Signalfire

*Codename. The final name is still to be chosen.*

A browser game that teaches touch typing through arcade play. Restore a galaxy's broken Signal by mastering the keyboard one key at a time, from the home row to symbols and Backspace. About a month of 15–20 minute daily sessions takes a beginner to fluent typing, and the game stays replayable for anyone pushing past 50 WPM.

- Lanes, word-shooting waves, bosses, and procedural music that's generated from your typing
- A 64-level campaign built on established typing curricula
- Stars, medals, upgrades, and a detailed profile of how you type
- Works without an account; optional cloud sync through a Puter account

Built for desktop and laptop computers with a US QWERTY keyboard.

## Play

Not deployed yet. The game will be hosted on Cloudflare Pages; the link will appear here.

## Status

Pre-alpha. The design docs are written; development of a walking skeleton is next.

## How this project is built

Code is written almost entirely by AI coding agents using [OpenSpec](https://github.com/Fission-AI/OpenSpec) spec-driven development. A human approves every proposal and reviews every merge.

| Where | What |
|---|---|
| [`docs/PHILOSOPHY.md`](docs/PHILOSOPHY.md) | What we're building and why: the principles everything traces back to |
| [`docs/verticals/`](docs/verticals/README.md) | What the game is: lore, curriculum, levels, mechanics, scoring, audio, art, UI |
| [`docs/horizontals/`](docs/horizontals/README.md) | How it's built: constitution, architecture, data, sync, testing, CI |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | The order we build in, from scaffold to launch |
| [`docs/decisions/`](docs/decisions/) | Decision records |
| `openspec/` | Specs for what's built, and changes in progress |
| [`AGENTS.md`](AGENTS.md) | Instructions for coding agents |

Start with the philosophy, then the [constitution](docs/horizontals/01-constitution.md).

## Run locally

Requires Node (pinned by `devEngines.runtime` in `package.json`) and pnpm (pinned by `packageManager` in `package.json`).

```
pnpm install
pnpm dev
```

`pnpm check` runs typecheck, lint, and build. Later tasks add tests, content checks, and end-to-end tests. The full command list is in [`AGENTS.md`](AGENTS.md#commands).

## Contributing

- **Issues and Discussions are open:** bug reports, ideas, and reports of a wrong or offensive word in a typing list.
- **Pull requests from outside contributors** open once the walking skeleton is in place. They'll follow the same OpenSpec process as everything else.
- To report a bug, use Settings → Data → Export bug report in the game and attach the file to an issue.

## Privacy

Your typing data stays on your device, or in your own Puter account if you sign in. The game counts a few anonymous events (such as levels completed) without cookies; you can turn this off in Settings. The full list is in [CI/CD and Hosting](docs/horizontals/10-ci-cd-and-hosting.md#analytics).

## License

[MIT](LICENSE), covering code and game content. Third-party notices are in [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md). The license doesn't grant rights to the project's name.
