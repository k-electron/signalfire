# Vertical 05: Scoring, Stars, Medals, and Progression

How performance is measured, rewarded, and turned into forward progress.

## Principles applied

- **One currency of progress: typing.** Every number the player sees comes from their typing (P1, P5).
- **Stars measure skill.** A star is awarded only for meeting accuracy and speed bars in a single run.
- **Gates are real but passable many ways** (P4).
- **Nothing is ever taken away** (P6).

## Decision: no in-game currency

There is no collectible currency. A currency would create a second economy that players can optimize separately from typing, which is the split P1 forbids. Instead:

- Upgrades (machine mods) come from key and skill mastery.
- Cosmetics come from stars, medals, ranks, and achievements.

## What's measured in a run

| Measure | In-world name | Definition |
|---|---|---|
| Accuracy | **Integrity** | Correct first attempts ÷ total first attempts |
| Speed | **Velocity** | WPM: (correct characters ÷ 5) ÷ active minutes |
| Points | **Score** | Sum of typing events (below) |
| Streak | **Signal lock** | Current combo tier |
| Consistency | **Rhythm** | How even the time between keystrokes is (used by medals and Overdrive) |

Integrity and Velocity are shown live during play as two thin rings around the HUD, with notches at the 1-, 2-, and 3-star bars. The player can see their stars forming as they type.

## Score

Score is a points total for personal bests and replays. It never decides stars.

| Event | Points |
|---|---|
| Hit | 10 × combo multiplier |
| Hit during Overdrive | 20 × combo multiplier |
| Word completed | 5 × word length × combo multiplier |
| Stranded beacon rescued | 100 |
| Boss phase cleared | 500 |
| Level completed | 250 |

- No negative points. Errors cost through lost combo, lost Overdrive, and lost shield.
- Machine mods can raise score (longer Overdrive, bigger beacon bonus) but never affect stars.

## Stars

### Earning stars

A level awards 1, 2, or 3 stars when a single complete run meets both bars for that star count. Bars are set per zone in [Curriculum: Standards per zone](02-curriculum.md#standards-per-zone).

Zone 0 is a tutorial and awards no stars.

### Rules

- A level's star count is the best it has ever achieved. It never decreases.
- Stars require finishing the level. Quitting mid-level awards nothing.
- If a run misses the 1-star bar, the results screen shows exactly which bar was missed and by how much ("Integrity 90%, needed 92%").

## Medals

Three per level, defined in Level Design. Medals:

- persist forever once earned, independent of any single run's star count;
- unlock difficulty tiers (all three Cadet medals unlock Veteran; all three Veteran medals unlock Ace);
- feed achievements and cosmetics.

## Difficulty tiers

Each tier is a separate star track for the same level.

| Tier | Star bars | Max stars |
|---|---|---|
| Cadet | Zone bars | 3 |
| Veteran | Zone bars +25% WPM, +1% accuracy | 3 |
| Ace | Zone bars +50% WPM, +2% accuracy | 3 |

Accuracy bars cap at 99%.

## Unlocking

| Unlocks | Requirement |
|---|---|
| Next main level | 1 star on the current main level |
| Side levels in a zone | Unlock alongside specific main levels (shown on the map) |
| Boss | 1 star on every other main level in the zone |
| Next zone | Break the Static barrier (zone gate) |

## Zone gates (Static barriers)

To break a barrier, the player needs:

1. 1 star on the zone's boss, and
2. a total number of star cores from that zone.

The requirement is about two-thirds of the stars available from the zone's main levels at Cadet tier.

| Zone | Main levels | Max Cadet stars | Required |
|---|---|---|---|
| 1 | 8 | 24 | 16 |
| 2 | 8 | 24 | 16 |
| 3 | 6 | 18 | 12 |
| 4 | 9 | 27 | 18 |
| 5 | 6 | 18 | 12 |
| 6 | 7 | 21 | 14 |
| 7 | 6 | 18 | 12 |
| 8 | 6 | 18 | 12 |
| 9 | 6 | 18 | Final zone; no barrier |

Clearing every main level at 1 star gives one-third of the stars, so the player must earn a second star on about half of them, or find stars elsewhere.

### Every way to earn star cores for a zone

| Source | Stars | Limit |
|---|---|---|
| Main levels, Cadet tier | Up to 3 each | |
| Main levels, Veteran and Ace tiers | Up to 3 each per tier | |
| Side levels | Up to 3 each | |
| Repair runs (practice missions) on that zone's keys | 1 per qualifying run | 3 per zone |

A repair run qualifies when it is completed at the zone's 2-star accuracy bar and improves the player's measured speed on its focus key. This is the path through a gate for a stuck player, and it is also the practice they need.

### Gate screen

- Shows stars held and stars needed, as a filling barrier.
- Lists the three nearest stars, ranked as in [Adaptive Engine: Gate assistance](07-adaptive-engine.md#gate-assistance) (for example "Inward Steps: 0.8 WPM from 2 stars").
- Offers a one-tap repair run.

## Machine mods

Upgrades earned through mastery. They change the machine's look, forgiveness, and points; never star bars.

| Mod | Earned by | Effect |
|---|---|---|
| Beacon Lights | F and J mastered | Twin beacons glow on the ship; cosmetic |
| Pinky Anchors | A and ; mastered | Shield +10% |
| Index Cannons | All index-finger keys of the current machine solid | Extra shot visual; word explosions larger |
| Reach Boosters | All top-row letters solid | Overdrive +1 s |
| Undertow Fins | All bottom-row letters solid | Shield regenerates 15% faster |
| Twin Reactors | Opposite-hand Shift on 95% of the last 100 capitals | Twin targets give bonus points |
| Rhythm Core | Steady Hand medal on 10 levels | Overdrive fills 10% faster |
| Star Charts | Number row solid | Coordinate locks fire a bonus volley |
| Glyph Lens | Zone 8 symbols solid | Glyph seals shatter with a bigger effect |
| Repair Drones | Zone 9 cleared | Cracks repaired with a drone animation; cosmetic |
| Signal Crown | Every letter mastered | Ship gains a crown of light; cosmetic |

"Solid" and "mastered" are key mastery states defined by the curriculum. Mods are permanent once earned.

## Pilot rank

Total stars across the whole game set the pilot's rank.

| Rank | Stars |
|---|---|
| Cadet | 0 |
| Ensign | 15 |
| Pilot | 40 |
| Lieutenant | 75 |
| Commander | 115 |
| Captain | 160 |
| Signal Ace | 220 |

Ranks give a title, a hub change (the cadet's quarters grow), and a cosmetic.

## Results screen

Order of reveal, about 6 seconds total, skippable with any key:

1. **Integrity** and **Velocity** count up.
2. **Stars** fly in one at a time, each with a chime.
3. **Medals** earned this run stamp in.
4. **Score**, with "new best" if it is.
5. **What changed**: a Keyling brightened, a mod earned, a key got faster.
6. **Next actions**: Continue, Replay, Repair run (if a weak key was detected).

If the run missed 1 star, the screen leads with how close it was and a single specific tip ("Most errors were on G: try keeping your index finger anchored on F").

## Anti-exploit rules

- Only real key presses count. Pasted text, held keys, and auto-repeat are ignored.
- Random key mashing tanks Integrity; no star is reachable without accuracy.
- Pauses longer than 3 seconds are excluded from Velocity, and a run with more than 50% excluded time does not award stars.
- Stars require finishing the level.

## Open questions

- Are the gate requirements (two-thirds of main-level stars) right? Test whether average players feel pushed to replay, not blocked.
- Should Veteran and Ace stars count toward rank at the same weight as Cadet stars?
