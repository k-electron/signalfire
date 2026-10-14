# Signalfire

*Codename. The final name is still to be chosen.*

A browser game that teaches touch typing through arcade play. Restore a galaxy's broken Signal by mastering the keyboard one key at a time, from the home row to symbols and Backspace. About a month of 15–20 minute daily sessions takes a beginner to fluent typing, and the game stays replayable for anyone pushing past 50 WPM.

- Lanes, word-shooting waves, bosses, and procedural music that's generated from your typing
- A 64-level campaign built on established typing curricula
- Stars, medals, upgrades, and a detailed profile of how you type
- Works without an account; optional cloud sync through a Puter account

Built for desktop and laptop computers with a US QWERTY keyboard.

## Play

https://signalfire.k-electron.workers.dev/

## Status

Pre-alpha. [Stage 0](docs/ROADMAP.md) (scaffold) and [Stage 1](docs/ROADMAP.md) (core foundations) have exited.

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

`pnpm check` runs typecheck, lint, tests, and build. Browser tests and end-to-end need `pnpm browsers:install` after `pnpm install`. Content checks and ladle arrive with later tasks. The full command list is in [`AGENTS.md`](AGENTS.md#commands).

## Contributing

[Bug reports](https://github.com/k-electron/signalfire/issues/new?template=01-bug-report.yml), [ideas](https://github.com/k-electron/signalfire/issues/new?template=02-idea.yml), and [typing-content reports](https://github.com/k-electron/signalfire/issues/new?template=03-typing-content-report.yml) are open. Pull requests from outside contributors are not accepted yet. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Privacy

Your typing data stays on your device.

## License

[MIT](LICENSE), covering code and game content. The license does not grant rights to the project's name.
