# Vertical 07: Adaptive Engine

The system that decides what each player should practice next: personalized review inside levels, repair runs, systems checks, the daily plan, and help for players who are stuck.

## Guardrails

The adaptive engine changes **what** a player practices and **how much pressure** they face. It never changes the standards.

- Never lowers star bars.
- Never removes stars, medals, mods, or mastery from inactivity (P6).
- Never forces a mission. Everything it offers can be declined.
- Always explains itself: every generated mission shows a one-line "why" ("Your G and H are slower than your other keys").

## Inputs

All from telemetry:

- Key records: recent accuracy, smoothed time-to-press, confusions, last practiced, mastery state.
- Bigram records: smoothed time and errors.
- Curriculum position: unlocked keys, current zone, levels and stars.
- Run history: recent runs per level, failed attempts.
- Daily summaries: days since last session.

## Key priority model

Each unlocked key gets a priority score that decides how much practice it receives.

### Confidence

```
target time      = 60 ÷ (zone 3-star WPM × 5)          seconds per character
speed confidence = min(1, target time ÷ median time-to-press)
confidence       = speed confidence × recent accuracy (last 100 attempts)
weakness         = 1 − confidence
```

A fast but inaccurate key has low confidence. So does an accurate but slow key. This follows the approach used by adaptive typing trainers such as keybr's open-source engine.

### Review urgency

Keys not practiced recently become more urgent, following the spacing effect. Urgency shapes selection only; it never affects mastery or stars.

| Days since last practiced | Urgency (learning or solid keys) | Urgency (mastered keys) |
|---|---|---|
| 0–1 | 0 | 0 |
| 2–3 | 0.3 | 0.15 |
| 4–6 | 0.6 | 0.3 |
| 7+ | 1.0 | 0.5 |

### Priority

```
priority = 0.6 × weakness + 0.25 × urgency + 0.15 × confusion boost
```

- **Confusion boost:** 1 if the key appears in one of the player's top three confusion pairs, else 0.
- Weights are starting values, to be tuned with playtest data.
- Priorities are multiplied by the key's frequency in English, normalized, so a weak E (very common) outranks a weak Q (rare).

The same model ranks bigrams, using bigram time and errors.

## Personalized review inside levels

Hand-designed levels have two kinds of content:

- **Fixed portion:** the new keys and patterns the level exists to teach. Designed, not adaptive.
- **Review portion:** the share of content drawn from previously learned keys. Weighted by priority, so each player reviews the keys they need most.

Pressure (queue depth, approach speed) is not adaptive in normal play, so star runs are comparable.

## Repair runs

Short generated practice missions targeting weak keys. Available from every zone map, the dossier, and the results screen.

### Choosing the focus

1. Take the highest-priority key. If its top confusion accounts for over 30% of its errors, focus on the pair (for example, R and T).
2. Otherwise, take the top two keys by priority if they share a finger or a row; else take the top key alone.
3. If no key is below "solid," focus on the slowest bigram instead.

### Building the mission

| Aspect | Rule |
|---|---|
| Length | 60–90 seconds |
| Content | 40% focus keys or pair, 60% other unlocked keys weighted by priority |
| Confusion pairs | Include discrimination drills: alternating the two keys, then words that contain both (for R/T: "tr", "rt", "start", "tree", "trust") |
| Mechanic | Lanes for single keys and pairs; the shooter or convergence for words once the player has reached those mechanics |
| Pressure | Starts at intro level and builds to the player's current zone's build-phase level |
| Stars | Qualifying runs award 1 star toward the zone gate, capped at 3 per zone (see Scoring) |

### After the run

The results show the focus key's speed and accuracy before and after ("G: 1.9 s → 1.4 s"), and the Keyling brightens if mastery improved.

## Systems check (refresh-to-now)

An optional warm-up that runs through everything the player has learned, weighted toward what has faded.

### When it's offered

- Automatically offered once on return after **3 or more days** away.
- Available any time from the hub.
- Declining is one keystroke and never asked again that session.

### Length

| Days away | Length |
|---|---|
| Hub, any time | 2 minutes |
| 3–6 | 2 minutes |
| 7–13 | 3 minutes |
| 14–29 | 4 minutes |
| 30+ | 5 minutes |

### Composition

- One segment per zone the player has reached, in curriculum order, like a highlight reel of the journey.
- Each segment uses that zone's signature mechanic and its keys.
- Segment length is proportional to the total priority of that zone's keys, with a minimum of 10 seconds.
- Within each segment, content is weighted by key priority.
- Pressure stays at build-phase level; this is a warm-up, not a test.

### Ending

- A readout of keys that are **sharp** (performed at or above their previous level) and keys that are **warming up** (below their previous level).
- Up to two suggested repair runs for warming-up keys.
- **Reward:** the next mission starts with Overdrive half charged.
- No stars are awarded or removed.

## Today's flight plan

When the player opens the game, the hub shows a short suggested plan for a 15–20 minute session.

| Order | Item | Included when |
|---|---|---|
| 1 | Systems check | Back after 3+ days |
| 2 | Next new level(s) | Always, if any are unlocked; one or two depending on the curriculum's day plan |
| 3 | Nearest star | A replay of the level closest to its next star bar |
| 4 | Repair run | A key's weakness is above 0.3 |
| 5 | Dispatch | A daily quest that fits the plan (see Meta-game) |

- The plan is a suggestion. The player can play anything unlocked.
- When the plan is complete, or after about 20 minutes of active play, Dash suggests stopping for the day and previews tomorrow. Play is never blocked.

## Help for stuck players

A main level needs 1 star to unlock the next one. When a player can't reach it:

| Trigger | Help offered |
|---|---|
| 1 failed attempt | Results screen shows the missed bar and one specific tip |
| 3 failed attempts | Offers a repair run built from the level's focus keys; unlocks **Calm mode** for the level |
| 5 failed attempts | Dash suggests a break or a different level ("Come back fresh; it often clicks tomorrow") |

### Calm mode

A lower-pressure version of the same level.

- Same content and the **same star bars**.
- Lower pressure: waiting lanes instead of flowing, smaller queue, slower approach, no Static.
- Stars earned in Calm mode count fully.
- Medals are not available in Calm mode.

Calm mode removes game pressure as a barrier while keeping the skill standard intact, so the requirement for baseline proficiency holds.

## Gate assistance

At a Static barrier, the engine ranks every way to earn the missing stars by how close the player is:

1. Levels where the best run was closest to its next star bar.
2. Side levels not yet attempted.
3. Repair runs that would qualify for a repair star.

The top three appear on the gate screen.

## Parameters

| Parameter | Default |
|---|---|
| Priority weights (weakness, urgency, confusion) | 0.6, 0.25, 0.15 |
| Confusion-pair threshold | 30% of a key's errors |
| Systems check offer threshold | 3 days |
| Repair run focus share | 40% |
| Repair suggestion threshold | Weakness above 0.3 |
| Stuck thresholds | 1, 3, 5 failed attempts |
| Daily soft stop | Plan complete or ~20 min active |

All are starting values to be tuned with playtest data.

## Open questions

- Should the review portion of hand-designed levels be capped so that two players' runs of the same level stay roughly comparable in difficulty?
- Should Calm mode be offered from the start for players who ask for it, rather than after three failures?
