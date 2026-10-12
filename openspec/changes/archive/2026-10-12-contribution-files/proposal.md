# Proposal

## Why

Stage 0 needs the files a new pull request and a new issue open with. Issues are on, and there is no pull request template, no issue template, and no `CONTRIBUTING.md`. The README sends people to an in-game bug export, to GitHub Discussions, and to `THIRD_PARTY_NOTICES.md`, none of which exist.

## What Changes

- Add `.github/pull_request_template.md` with the fields horizontal 02 lists: OpenSpec change link, constitution check, test evidence, visual evidence, docs updated, assumptions.
- Add three GitHub issue forms: bug report, idea, and typing-content report (an offensive or wrong word in a list).
- Add `CONTRIBUTING.md`. It says outside pull requests are not accepted until the walking skeleton, and why. It says how to report a bug, an idea, and a typing-content problem.
- Update the README sections from horizontal 02 that are true today. Remove the export-bug-report instruction, the claim that anonymous events are counted, the claim that Discussions are open, and the link to `THIRD_PARTY_NOTICES.md`. Point contributing at `CONTRIBUTING.md`. State status as Stage 0, not exited.
- Update horizontal 02 and horizontal 10 where they currently describe Discussions, the bug export, the privacy note, or third-party notices as if they were already true.
- Out of this change: `THIRD_PARTY_NOTICES.md` (nothing third-party is bundled), turning on Discussions, opening pull requests to outside contributors (Roadmap stage 2), and the in-game Export bug report.

## Capabilities

### New Capabilities

- `contribution-intake`: After these files are on the default branch, a new pull request opens with the contribution fields, and each issue type opens with its form. `CONTRIBUTING.md` and the README tell a visitor how to report, that outside pull requests wait, and only the facts that are true now.

### Modified Capabilities

- None. `ci-pipeline` still checks pull request titles. This change does not change that requirement.

## Impact

- New: `.github/pull_request_template.md`, `.github/ISSUE_TEMPLATE/01-bug-report.yml`, `.github/ISSUE_TEMPLATE/02-idea.yml`, `.github/ISSUE_TEMPLATE/03-typing-content-report.yml`, `CONTRIBUTING.md`.
- Edited: `README.md`, `docs/horizontals/02-repo-setup.md`, `docs/horizontals/10-ci-cd-and-hosting.md`.
- Unchanged: `LICENSE`, `AGENTS.md`, `docs/ROADMAP.md` (Stage 0 stays "Not started"), source, workflows, `package.json`.
- No new runtime dependency. No new dev dependency. No GitHub API calls to change repo settings.

## Principles served

- **P13.** This is a Stage 0 file, before the game has a thin path. Outside pull requests stay closed until the walking skeleton (stage 2).
- **P11.** The README privacy note says typing data stays on the device. It does not describe a counter or a Settings switch that are not built.
- P1–P10 and P12 are not served.

## Docs implemented

- `docs/ROADMAP.md` Stage 0: the repo files for how changes and reports come in. Status stays "Not started". Opening outside pull requests stays the stage 2 exit.
- `docs/horizontals/02-repo-setup.md`: Contributions, Pull requests, README. The template fields and the three issue types are implemented as written. The Contributions decision and the README bullets are edited where they are not true yet (see Departures). The layout tree still lists `THIRD_PARTY_NOTICES.md`; this change does not add that file.
- `docs/horizontals/10-ci-cd-and-hosting.md`: Bug reports, the sentence that the player attaches an export to the bug-report template. The export itself stays a later change. The privacy-note sentence is edited (see Departures).
- `docs/horizontals/01-constitution.md`: C1 (OpenSpec link, with "none" for an exemption), C3 (constitution check on the pull request), C4 (test evidence), C9 (docs updated). Not edited.
- `docs/verticals/08-text-content.md`: the typing-content report is the intake for a word a player reports. Removal of that word is not this change. Not edited.

## Departures

- Horizontal 02 says Issues and Discussions are open now. Checked 2026-10-12: `gh repo view` reports `hasIssuesEnabled: true` and `hasDiscussionsEnabled: false`. This change does not turn Discussions on. The decision cell and the Contributions section say issues are the path for bugs, ideas, and typing-content reports, and that Discussions stay off until that GitHub setting is turned on. That is the doc update, not a decision record.
- The README tells people to use Settings → Data → Export bug report, says the game counts anonymous events with a Settings switch, and links `THIRD_PARTY_NOTICES.md`. None of those exist. `src/` has no analytics client. No notices file is added. The README keeps only sentences that are true today.
- Horizontal 10 says the privacy note links to the analytics event list. Counting is not built, so the note does not link that list yet. Horizontal 10 gains one sentence: until analytics exists, the note only says typing data stays on the device.
- Horizontal 10 says the player attaches an exported bug report. The export is not built. The bug-report form has a written report and a place to attach a file, and the file is not required. Horizontal 10 gains one sentence: until the export exists, a written report is enough. The export stays described as later work.
- Horizontal 02's README bullet includes third-party notices. The bullet gains the same timing the screenshot bullet already has: notices appear once `THIRD_PARTY_NOTICES.md` exists.
- C4 says every OpenSpec scenario maps to a test. This is not a logic domain. GitHub reads issue and pull request templates from the default branch only ([About issue and pull request templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/about-issue-and-pull-request-templates)). The scenarios are verified after the squash-merge, by opening one pull request and one issue of each type, then closing them. No Vitest test is added. This is not a constitution amendment.

## Assumptions

- One pull request template, `.github/pull_request_template.md`. Not a `PULL_REQUEST_TEMPLATE/` directory.
- Issue forms are YAML, using [GitHub's form schema](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-githubs-form-schema) (public preview, read 2026-10-12). Markdown issue templates are not used. `name` is longer than 3 characters on each form.
- Chooser order is the filename order: `01-bug-report.yml`, `02-idea.yml`, `03-typing-content-report.yml`.
- No `.github/ISSUE_TEMPLATE/config.yml`. Blank issues stay available. That is the GitHub default when `config.yml` is absent.
- Labels that already exist: bug report uses `bug`, idea uses `enhancement`. Typing-content report sets no label. No new labels, assignees, or projects.
- The bug-report file is an optional attachment on a textarea. The form does not use an `upload` field with an `accept` list, because horizontal 10 does not name the file's extension.
- A C1 exemption (typo, wording, formatting, dependency patch) fills the OpenSpec link with `none`.
- The apply pull request's body is written by hand. The template is not on `main` until after merge, so that pull request cannot be the proof.
- The game is not deployed. The README play section stays "not deployed yet."
- Repo: `k-electron/signalfire`, public, default branch `main`.

## Constitution check

- **C1.** One capability, `contribution-intake`. Not a C1 exemption. Apply waits for approval.
- **C2.** Principles, docs, and the departures are stated. Departures are resolved by editing horizontals 02 and 10 and the README.
- **C3.** Karim approves this proposal before apply. The agent does not merge and does not push to `main`.
- **C4.** Not a logic domain. See Departures. No test whose only job is to prove a file is absent.
- **C5.** No application TypeScript.
- **C6.** No decision record. Issue-form fields, labels, and the blank-issue default are implementation choices in `design.md`. The Discussions edit records the repo setting that is already off.
- **C7.** No new runtime dependency.
- **C8.** `AGENTS.md` already lists the pull request fields. It is not edited. `CONTRIBUTING.md` is for people outside the project, not a second agent instruction file.
- **C9.** Templates, `CONTRIBUTING.md`, the README, horizontals 02 and 10, the delta spec, and `tasks.md` land together. Roadmap status stays "Not started". Archive copies the delta into `openspec/specs/`.
- **C10.** Non-trivial. A fresh-context review of the diff happens before the pull request is treated as ready. The GitHub render check is after merge, because templates on other branches are not shown.
