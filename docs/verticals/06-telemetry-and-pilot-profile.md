# Vertical 06: Telemetry and Pilot Profile

What the game measures about the player's typing, how it summarizes it, and how the player sees it.

## Purpose

1. **Honest mirror (P10):** show players exactly how they type, in a form they enjoy reading.
2. **Fuel the adaptive engine:** weak keys, confusions, and stale keys drive practice missions and systems checks.
3. **Drive game systems:** stars, medals, mods, and Keyling brightness all read from this data.

## What is captured during a run

Every keystroke in a level is recorded as an event. Events live only for the duration of the run; they are summarized at the end (see Aggregation).

| Field | Meaning |
|---|---|
| Time pressed | High-resolution timestamp of key down |
| Time released | Timestamp of key up |
| Expected character | The active character at the moment of the press |
| Typed character | What the key produced |
| Physical key | Which key on the keyboard, including left or right Shift |
| Shift side | For capitals and shifted symbols: left, right, or none |
| First attempt | Whether this was the first try at this character |
| Correct | Whether it matched |
| Previous character | For bigram analysis |
| Mode | Lanes, shooter, decode, convergence, free typing |
| Combo tier | At the moment of the press |

Run-level context: level ID, tier, start time, active time, pauses, completion.

## Metrics

### Speed and accuracy

| Metric | Definition |
|---|---|
| **Accuracy (Integrity)** | Correct first attempts ÷ total first attempts |
| **Net WPM (Velocity)** | (Correct characters ÷ 5) ÷ active minutes |
| **Raw WPM** | (All characters typed ÷ 5) ÷ active minutes; shows speed before accuracy |
| **Active time** | Time from first keystroke to last, minus pauses over 3 s |
| **Burst WPM** | Fastest 10-second window in the run |

### Per key

| Metric | Definition |
|---|---|
| Attempts | First attempts at this character |
| Accuracy | Correct ÷ attempts |
| Time-to-press | Time from the previous keystroke to this key's press, when the previous keystroke was correct; median and smoothed average |
| Confusions | Which characters the player typed instead of this one, with counts |
| Last practiced | Date of most recent attempt |
| Mastery state | New, learning, solid, or mastered (defined in Curriculum) |

### Per finger

Per-key metrics rolled up by the curriculum's finger map: accuracy and median time-to-press for each of the eight fingers and the thumb.

### Flow

| Metric | Definition | Why it matters |
|---|---|---|
| **Rhythm** | 100 × (1 − coefficient of variation of time between keystrokes), floored at 0. Pauses over 2 s excluded | Even rhythm marks automatic typing |
| **Rollover** | % of keystrokes pressed before the previous key was released | Common in fast typists (Dhakal et al. 2018) |
| **Hesitations** | Keystrokes taking over 2.5× the player's median time for that key | Points to keys the player still has to think about |
| **Bigram speed** | Median time for each letter pair | Finds slow transitions |
| **Pair classes** | Median bigram time for same finger, same hand (different finger), and alternating hands | Alternation should become fastest as skill grows |

### Habits

| Metric | Definition |
|---|---|
| **Shift discipline** | % of capitals and shifted symbols typed with the opposite-hand Shift |
| **Correction rate** | Zone 9+: % of errors corrected with Backspace before the word was completed |
| **Over-deletion** | Zone 9+: average characters deleted per error (1 is ideal) |

### Practice

| Metric | Definition |
|---|---|
| Days practiced | Distinct days with at least one completed level |
| Time practiced | Total active typing time |
| Sessions | Groups of play separated by more than 30 minutes |
| Runs | Completed levels, practice missions, and systems checks |

## Aggregation

Raw events are summarized at the end of each run (the checkpoint) and then discarded.

| Summary | Contents | Kept |
|---|---|---|
| **Run summary** | Level, tier, accuracy, net and raw WPM, burst WPM, rhythm, rollover, score, stars, medals, combo max, errors by key | Last 10 runs per level, plus best run |
| **Key record** | Lifetime attempts and errors, smoothed time-to-press, recent window of the last 100 attempts (correct and time), top 5 confusions, last practiced, mastery state | One per key |
| **Bigram record** | Attempts, smoothed time, errors | Top 300 bigrams by attempts |
| **Daily summary** | Date, active time, runs, average and best net WPM, accuracy, rhythm | One per day played |
| **Lifetime totals** | Characters typed, active time, days practiced, stars, medals, personal bests | One record |

Smoothed values use an exponentially weighted average so recent performance counts more than old performance, without discarding history.

## Pilot dossier (player-facing profile)

The Commander's file on the cadet. Designed to be fun to browse.

### 1. Overview card

- Call sign, rank, rank badge, and progress to next rank.
- **Current speed:** best net WPM over the last 7 days of play.
- **Current accuracy:** average accuracy over the last 7 days of play.
- Days practiced, total time, total stars, total medals.

### 2. Keyboard heatmap

- The full keyboard, each key colored by mastery state, with Keylings shown on keys that have them.
- Toggle between **accuracy** and **speed** coloring.
- Selecting a key opens its card: accuracy, speed, trend sparkline, most common confusion ("You often type R when you mean T"), last practiced, and a "Repair run" button.

### 3. Finger chart

- An eight-point radar chart, one point per finger, showing speed and accuracy as two overlaid shapes.
- A balanced shape means even skill across fingers. A dent shows the finger to work on.

### 4. Progress over time

- Net WPM and accuracy by day, with markers where zones were completed.
- The chart only plots days played, so breaks leave no gaps or drops (P6).

### 5. Flow

- Rhythm trend.
- Rollover percentage with a short explanation ("Fast typists start the next key before letting go of the last one").
- Bar chart of the three pair classes: same finger, same hand, alternating hands.
- Slowest five bigrams, each with a practice button.

### 6. Insights

Plain-language observations generated from the data. At most three shown at once, refreshed after each session.

| Rule | Example message |
|---|---|
| A key's accuracy is 5+ points below the player's average | "G is your trickiest key right now. A repair run can help." |
| A confusion pair accounts for over 30% of a key's errors | "When you miss T, you usually hit R. They're neighbors, both on your left index finger." |
| A key's speed improved 20%+ over the last week | "Your P got 25% faster this week!" |
| Alternating-hand pairs are slower than same-hand pairs past Zone 4 | "Try letting your hands take turns; alternating pairs should be your fastest." |
| Shift discipline under 80% | "Most of your capitals use the same-hand Shift. Try the opposite one." |
| Rhythm improved 10+ points | "Your rhythm is smoother than ever." |
| Accuracy dropped as speed rose in recent runs | "You're getting faster, but accuracy dipped. Ease off a little and it'll come back." |

### 7. Personal bests

Fastest run, best accuracy on a full level, longest Signal lock, most Flawless medals in a day, fastest boss clear, and best burst WPM.

### 8. Journey

Zone-by-zone progress: stars per zone, medals, bosses defeated, machines flown.

## Run detail

From the results screen or the dossier, any recent run can be opened to see:

- A speed-over-time line for the run, with tick marks where errors happened.
- Keys used in the run, colored by accuracy in that run.
- The run's three slowest bigrams.

## Language guidelines

- Describe what happened and what to try. Never judge the player.
- Lead with improvements before problems.
- Use plain words: "trickiest key," not "lowest-confidence key."
- Numbers are always paired with meaning ("95% accuracy: about one mistake every 4 words").

## Privacy

- Telemetry is about the player's own typing and stays with the player.
- It is stored locally and, if the player logs in, synced to their own cloud storage.
- Keystroke data is never sent to third-party analytics.
- The player can download and delete their data.

## Open questions

- Is 300 bigrams enough? Check how many distinct bigrams typical players accumulate.
