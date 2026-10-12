# Design

## Context

See proposal.md for why. Specs: `specs/contribution-intake/spec.md`.

There is no pull request template, no `.github/ISSUE_TEMPLATE/`, and no `CONTRIBUTING.md`. `.github/` already has the CI workflow, Dependabot, and the pnpm action. `README.md` already has the horizontal 02 sections, and four of those sentences are false: Discussions are open, Settings → Data → Export bug report is how to report a bug, the game counts anonymous events, and `THIRD_PARTY_NOTICES.md` exists. `gh repo view` on 2026-10-12: public, default branch `main`, issues on, Discussions off. Existing labels include `bug` and `enhancement`. There is no label for a typing-content report.

GitHub shows issue templates and pull request templates only from the default branch ([About issue and pull request templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/about-issue-and-pull-request-templates)). Issue forms use [the form schema](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-githubs-form-schema). `name` must be longer than 3 characters. A textarea can take a file attachment. An `upload` field accepts a fixed set of extensions.

## Goals / Non-Goals

**Goals:**

- The pull request body and the three issue forms match the spec when opened from `main`.
- `CONTRIBUTING.md` and the README say only what is true before stage 2.
- Horizontals 02 and 10 name the same timing, so they do not contradict those pages.

**Non-Goals:**

- Choosing an export file extension, or building the export.
- A `config.yml` that hides blank issues.
- Creating GitHub labels, or turning Discussions on.

## Decisions

### One markdown pull request template

`.github/pull_request_template.md`:

```markdown
## OpenSpec change

Link the change under `openspec/changes/`. For a constitution C1 exemption (typo, wording, formatting, or a dependency patch), write `none`.

## Constitution check

## Test evidence

For a logic change, paste the test command and its result. For tooling or CI, paste the command output. Otherwise write `none`.

## Visual evidence

For a visual or feel change, add screenshots or a recording. Otherwise write `none`.

## Docs updated

List the docs, specs, and config updated with this change. Otherwise write `none`.

## Assumptions
```

Alternative considered: a `PULL_REQUEST_TEMPLATE/` directory with several templates. One template is the whole ask in horizontal 02.

### Three issue forms, filename order

Chooser order follows the filename. YAML forms, not markdown templates, because the bug report needs required text and the typing-content report needs a fixed choice.

Alternative considered: markdown templates with a checklist. They cannot require a field or offer a dropdown.

`.github/ISSUE_TEMPLATE/01-bug-report.yml`:

```yaml
name: Bug report
description: Something in the game or the repo broke.
labels: ["bug"]
body:
  - type: markdown
    attributes:
      value: |
        Say what went wrong. You can attach a file on "What happened" if you have one. The in-game export is not in the game yet.
  - type: textarea
    id: what-happened
    attributes:
      label: What happened?
      description: What did you see? You can attach a file here.
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: What did you expect?
    validations:
      required: true
  - type: textarea
    id: steps
    attributes:
      label: Steps to reproduce
    validations:
      required: true
  - type: input
    id: browser
    attributes:
      label: Browser
      description: The game is for a desktop or laptop with a US QWERTY keyboard.
      placeholder: Chrome on macOS
    validations:
      required: false
```

`.github/ISSUE_TEMPLATE/02-idea.yml`:

```yaml
name: Idea
description: A change you want in the game or the project.
labels: ["enhancement"]
body:
  - type: markdown
    attributes:
      value: |
        For something that is broken, use Bug report.
  - type: textarea
    id: idea
    attributes:
      label: What is the idea?
    validations:
      required: true
  - type: textarea
    id: why
    attributes:
      label: Why would this help?
    validations:
      required: false
```

`Why would this help?` is optional, so the form can be submitted with only the idea.

`.github/ISSUE_TEMPLATE/03-typing-content-report.yml`:

```yaml
name: Typing-content report
description: A word or phrase in a typing list that is offensive or wrong.
body:
  - type: markdown
    attributes:
      value: |
        Name the word and say whether it is offensive, wrong, or both.
  - type: input
    id: word
    attributes:
      label: Word or phrase
    validations:
      required: true
  - type: dropdown
    id: kind
    attributes:
      label: What is wrong with it?
      options:
        - Offensive
        - Wrong
        - Both
    validations:
      required: true
  - type: input
    id: where
    attributes:
      label: Where did it appear?
      description: A level id or list name, if you know it.
      placeholder: level:1.7
    validations:
      required: false
```

No `labels` key. No `title`, assignees, or projects on any form. No `config.yml`.

The bug report uses a textarea for the file, not an `upload` field. `upload` only accepts the extensions in the form schema, and horizontal 10 does not name the export's extension. A textarea attachment is optional, so the form can be submitted with no file.

Alternative considered: `upload` with `accept: ".json,.txt,.log,.zip"`. That guesses the format.

### CONTRIBUTING

`CONTRIBUTING.md`:

```markdown
# Contributing

## Pull requests

Pull requests from outside contributors are not accepted yet. They open when [Roadmap](docs/ROADMAP.md) stage 2 exits.

That stage is the walking skeleton. It is not in place. Until it exits, code changes stay inside the project and follow OpenSpec: propose, Karim approves, apply, review. After it exits, outside contributors use that same flow and the [constitution](docs/horizontals/01-constitution.md).

## Bug reports

Open a [bug report](https://github.com/k-electron/signalfire/issues/new?template=01-bug-report.yml).

Say what happened, what you expected, and the steps. Name the browser if you can. Attach a file if you have one. The in-game export (Settings → Data → Export bug report) is not in the game yet.

## Ideas

Open an [idea](https://github.com/k-electron/signalfire/issues/new?template=02-idea.yml).

GitHub Discussions are off. An idea issue is the place for a suggestion.

## Typing content

If a word or phrase in a typing list is offensive or wrong, open a [typing-content report](https://github.com/k-electron/signalfire/issues/new?template=03-typing-content-report.yml).
```

The export sentence and the Discussions sentence come out when those things exist. This change's doc edits are what make that a later edit rather than a contradiction.

### README sections that stay, and the four that change

Leave the opening, Play, How this project is built, and Run locally. They already match the spec. Play already says "Not deployed yet."

Replace Status:

```markdown
## Status

Pre-alpha. [Stage 0](docs/ROADMAP.md) (scaffold) has not exited.
```

Replace Contributing:

```markdown
## Contributing

[Bug reports](https://github.com/k-electron/signalfire/issues/new?template=01-bug-report.yml), [ideas](https://github.com/k-electron/signalfire/issues/new?template=02-idea.yml), and [typing-content reports](https://github.com/k-electron/signalfire/issues/new?template=03-typing-content-report.yml) are open. Pull requests from outside contributors are not accepted yet. See [CONTRIBUTING.md](CONTRIBUTING.md).
```

Replace Privacy:

```markdown
## Privacy

Your typing data stays on your device.
```

Replace License:

```markdown
## License

[MIT](LICENSE), covering code and game content. The license does not grant rights to the project's name.
```

### Doc edits

Horizontal 02, Contributions decision cell:

`Issues open now (bug report, idea, typing-content report). Discussions stay off until that GitHub setting is on. Pull requests from outside contributors open after the walking skeleton.`

Contributions bullets:

- **Now:** Issues are open: bug report, idea, and typing-content report. `CONTRIBUTING.md` explains that outside pull requests are not yet accepted and why, and how to open each issue type. Discussions stay off until the GitHub setting is turned on. Until then, ideas use the idea issue.
- **After the walking skeleton:** unchanged.
- Issue templates bullet: unchanged.

README bullets in that horizontal, replace the last three:

- How to contribute and report bugs, linking `CONTRIBUTING.md`.
- A short privacy note. Until analytics is counting, it says typing data stays on the device. Once counting exists, it links the event list in horizontal 10.
- License, and third-party notices once `THIRD_PARTY_NOTICES.md` exists.

Horizontal 10, replace "The privacy note links to this list." with:

`Once analytics is counting, the privacy note links to this list. Until then, the README note only says typing data stays on the device.`

Bug reports, add:

`Until Settings → Data → Export bug report exists, the bug-report template takes a written report. A file attachment is optional.`

Leave the two existing bug-report bullets. They describe the export, which is still later work.

### Proof is after merge

The apply pull request's body is written by hand. It is not the proof.

After the squash-merge to `main`:

- Open each form, without submitting: `https://github.com/k-electron/signalfire/issues/new?template=01-bug-report.yml`, the same URL with `02-idea.yml`, and the same URL with `03-typing-content-report.yml`. Confirm the required and optional fields in the spec.
- From a scratch branch off `main`, open a pull request (draft is fine) titled `docs(repo): template check`. Confirm the six headings. Close it and delete the branch.

Do not file the three issues. Seeing the form is the check.

## Risks / Trade-offs

- [Templates on the apply branch are invisible] → The proof runs after merge to `main`. The pull request says that.
- [Issue forms are in public preview] → Use only the keys in the schema page cited above. If GitHub hides a form, fix that YAML before calling the check done.
- [Required fields are enforced on public repos only] → The repo is public. If it were private, the check would be "the field is marked required," not "GitHub blocked submit."
- [Blank issues remain in the chooser] → Accepted. The three named types still open their forms.
- [`bug` or `enhancement` was deleted] → Drop that form's `labels` key rather than creating a label. The spec does not require a label.
- [The export sentence in CONTRIBUTING goes stale] → The export change deletes it. Horizontal 10 now says the written report is the path until then.

## Migration Plan

No saved data. Rollback is reverting the commit on `main`. GitHub stops showing the templates when that revert is on the default branch.
