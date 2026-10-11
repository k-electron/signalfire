# Vertical 03: Level Design

How individual levels are built: their shape, pacing, difficulty controls, and the specific design of every level and boss in the campaign.

## Design rules

1. **One new thing per level.** A level may debut new keys or a new mechanic, never both. The exception is Shift, where the key and its mechanic are the same thing.
2. **Clean opening.** The first 10 seconds of every level are easy and readable, so the player settles in before anything is asked of them.
3. **Breathe after peaks.** Every intensity peak is followed by a short, easier stretch.
4. **Celebratory finish.** The last seconds of a level are a payoff moment: a final volley, a big explosion, the station lighting up.
5. **Short.** No main level runs longer than 4 minutes. Most run 2–3.
6. **No game over mid-level.** A level always plays to the end. Poor play lowers the score; it never cuts practice short.
7. **Readable first.** The next target is always the clearest thing on screen. Effects never cover it.

## Pacing model: player-paced with pressure

Typing speed varies too much between players for fixed tempos to work. Levels are **player-paced**: new targets arrive to keep a small queue ahead of the player, so a slow typist is never flooded and a fast typist is never starved. **Pressure** comes from how quickly targets approach and how much the level asks at once.

- **Queue depth:** how many targets are visible and waiting. Low (1–2) for intro levels, higher (4–6) at peaks.
- **Approach speed:** how quickly targets move toward the hit line or the player's ship. Measured in seconds from spawn to arrival.
- **Arrival effect:** what happens when a target arrives unhit. In early levels, targets wait at the line. Later, they pass through (a miss) or hit the ship (damage).

The player's WPM is measured from their own typing, not from the level's tempo.

## Level anatomy

Every level follows a five-phase shape. Durations are typical for a 2.5-minute level.

| Phase | Duration | Purpose |
|---|---|---|
| **Arrival** | 10–15 s | New keys or mechanic shown in isolation. Low queue, slow approach. |
| **Build** | 40–50 s | Mix in known material. Pressure rises gradually. |
| **Peak** | 25–35 s | Highest pressure of the level. Bonus targets appear. |
| **Breather** | 10–15 s | Pressure drops; a moment to recover and feel good. |
| **Finale** | 20–30 s | A last rise, then a payoff moment and the results screen. |

Bosses use their own phase structure (see Bosses).

## Difficulty controls

The controls a level designer uses to tune a level. All are set per phase.

| Control | Range | Notes |
|---|---|---|
| Content mix | % new keys / recent keys / review | Set by the curriculum's level type |
| Unit size | single keys → patterns → words → phrases → sentences | |
| Word length | min and max characters | |
| Queue depth | 1–6 targets | |
| Approach speed | 6 s (slow) to 1.5 s (fast) | |
| Arrival effect | wait / pass / damage | |
| Static share | 0–20% of targets are Static (must not be pressed) | Introduced in Zone 2 |
| Bonus targets | 0–3 stranded beacons per level | |
| Mechanic mix | which mechanics are active | See Core Mechanics vertical |
| Visual load | background motion, particle density | Kept low in intro levels |

### Difficulty curve within a zone

Levels within a zone follow a sawtooth: each new-key level drops pressure back down, then the following words or mix level raises it. The boss is the highest point in the zone. The first level of the next zone drops back to near-intro pressure.

```
pressure
  ▲                                  boss
  │                    ╱╲       ╱╲   ╱
  │          ╱╲       ╱  ╲     ╱  ╲ ╱
  │    ╱╲   ╱  ╲     ╱    ╲   ╱
  │   ╱  ╲ ╱    ╲   ╱      ╲ ╱
  └──────────────────────────────────▶ levels in zone
```

## Medals

Each level offers three medals from this catalog. Medals are skill challenges that unlock harder tiers of the level.

| Medal | Condition | Teaches |
|---|---|---|
| **Flawless** | 100% accuracy (99% in Zones 6–9) | Precision |
| **Full Clear** | No target reaches the line or the ship unhit | Keeping up |
| **Beacon Rescue** | Every stranded beacon typed | Reading ahead |
| **Steady Hand** | Rhythm consistency above the zone's bar | Even pacing |
| **Unbroken** | Combo never drops below its starting tier after first reaching max | Sustained focus |
| **Lightning** | Average pace 20% above the 3-star WPM | Speed |
| **Clean Reach** | No errors on the level's focus keys | Mastering the new keys |
| **Twin Discipline** | Every capital uses the opposite-hand Shift | Shift habit (Zone 5+) |

Each level's three medals are chosen to fit what the level teaches. Intro levels never offer Lightning.

## Difficulty tiers

Earning all three medals on a level unlocks its next tier.

| Tier | Changes | Unlock |
|---|---|---|
| **Cadet** | Standard level | Available on reaching the level |
| **Veteran** | Star bars +25% WPM and +1% accuracy; faster approach; more Static | All three Cadet medals |
| **Ace** | Star bars +50% WPM and +2% accuracy; queue depth +2; extra Static and bonus targets | All three Veteran medals |

Tiers keep experienced typists engaged and give every level replay value.

## Zone map

Each zone is a map of connected nodes, displayed as a path through the sector.

```
 [gate] ── 1 ── 2 ── 3 ── 4 ── 5 ── 6 ── 7 ── [BOSS] ── [barrier]
                │              │         │
              (side)        (repair)  (codex)
```

- **Main path:** the curriculum levels in order.
- **Side nodes:** optional levels that unlock with the main path. They award stars toward the zone gate.
- **Repair node:** always present; opens a practice mission targeting the player's weakest keys.
- **Codex node:** story extras unlocked by progress.
- **Barrier:** the zone gate; shows stars needed and stars held.

## Mechanic debut schedule

| Level | Debut |
|---|---|
| 0.1 | Lanes with notes that wait at the hit line; Space pulse |
| 1.5 | Flowing lanes (notes pass if unhit); Signal lock (combo) |
| 1.7 | Word convoys (a word as a sequence of notes) |
| 2.2 | Overdrive |
| 2.4 | Static notes |
| 2.6 | Decode (story) mode |
| 2.7 | Stranded beacons |
| 3.2 | Word enemies (shooter mode) |
| 3.4 | Waves and formations |
| 4.3 | Divers (enemies that accelerate) |
| 4.7 | Splitters and armored enemies |
| 5.1 | Twin targets (Shift chords) |
| 6.2 | Convergence (lanes and shooter at once) |
| 7.1 | Coordinate locks (number sequences) |
| 8.1 | Glyph seals (symbol sequences) |
| 9.1 | Cracks and repair (Backspace) |
| 9.3 | Launch volley (Enter) |
| 9.4 | Mode switch (Tab) |

## Levels

Each entry lists the mechanics in play, the signature moment that makes the level memorable, and its three medals.

### Zone 0: Home Row Station

| ID | Level | Mechanics | Signature moment | Medals |
|---|---|---|---|---|
| 0.1 | Twin Beacons | Lanes (wait), Space pulse | The two beacons light up as the player finds F and J by touch; the hangar door opens on Space | None (tutorial) |
| 0.2 | Eight Docks | Lanes (wait) | Each docking arm lights as its finger presses its key; the whole station ring glows at the end | None (tutorial) |

### Zone 1: The Drift

| ID | Level | Mechanics | Signature moment | Medals |
|---|---|---|---|---|
| 1.1 | First Light | Lanes (wait) | First real flight out of the hangar into the Drift | Flawless, Full Clear, Clean Reach |
| 1.2 | Middle Reach | Lanes (wait) | Debris fields part as the middle fingers join | Flawless, Full Clear, Clean Reach |
| 1.3 | Ring Steady | Lanes (wait) | First Keyling rescue animation | Flawless, Full Clear, Clean Reach |
| 1.4 | Pinky Anchors | Lanes (wait) | The pinky lanes are "anchors" that stabilize the Skiff in a current | Flawless, Full Clear, Clean Reach |
| 1.5 | Full Home | Flowing lanes, Signal lock | First combo climb; the lane rails glow brighter with each tier | Flawless, Full Clear, Steady Hand |
| 1.6 | Inward Steps | Flowing lanes | G and H appear as narrow lanes between the index lanes | Flawless, Full Clear, Clean Reach |
| 1.7 | First Words | Word convoys | Dash reads each completed word aloud in its broken voice | Flawless, Full Clear, Steady Hand |
| 1.8 | Boss: The Peeker | See Bosses | | Flawless, Full Clear, Steady Hand |

### Zone 2: Ember Reach

| ID | Level | Mechanics | Signature moment | Medals |
|---|---|---|---|---|
| 2.1 | Up and Back | Flowing lanes | The Dart's first flight; upper lanes unfold above the home lanes, and each reach note "snaps back" visually | Flawless, Full Clear, Clean Reach |
| 2.2 | Ember Words | Word convoys, Overdrive | First Overdrive: the screen floods with orange light | Flawless, Steady Hand, Unbroken |
| 2.3 | Index Climb | Flowing lanes | R and U lanes climb like ladders | Flawless, Full Clear, Clean Reach |
| 2.4 | Reach Words | Word convoys, Static notes | First Static notes: gray, glitching, and best left alone | Flawless, Full Clear, Steady Hand |
| 2.5 | Long Reach | Flowing lanes | T and Y debut; Dash types "the" for the first time | Flawless, Full Clear, Clean Reach |
| 2.6 | Ember Message | Decode | The first message from Ember Reach assembles as the player types it | Flawless, Steady Hand, Unbroken |
| 2.7 | Reach Review | Convoys, Static, Stranded beacons | First stranded beacons drift by; typing them pulls them to safety | Flawless, Beacon Rescue, Unbroken |
| 2.8 | Boss: Rushfang | See Bosses | | Flawless, Full Clear, Steady Hand |

### Zone 3: The High Spires

| ID | Level | Mechanics | Signature moment | Medals |
|---|---|---|---|---|
| 3.1 | Ring Rise | Flowing lanes | The Dart climbs into the spires; the lanes stretch higher | Flawless, Full Clear, Clean Reach |
| 3.2 | Spire Words | Word enemies | Shooter mode debuts: words float down from the spires and the Dart shoots them letter by letter | Flawless, Full Clear, Steady Hand |
| 3.3 | Pinky Peaks | Flowing lanes | Q and P sit at the tips of the tallest spires | Flawless, Full Clear, Clean Reach |
| 3.4 | Full Top | Word enemies, Waves | First formation: enemies arrive in a V and peel off one at a time | Flawless, Full Clear, Unbroken |
| 3.5 | Spire Message | Decode | A distress call from the spires reveals the Drifter | Flawless, Steady Hand, Beacon Rescue |
| 3.6 | Boss: The Drifter | See Bosses | | Flawless, Full Clear, Steady Hand |

### Zone 4: The Undertow

| ID | Level | Mechanics | Signature moment | Medals |
|---|---|---|---|---|
| 4.1 | Down Under | Flowing lanes | Lower lanes open beneath the home lanes; the camera tilts downward | Flawless, Full Clear, Clean Reach |
| 4.2 | Index Dive | Flowing lanes | N and B appear; Dash gains a huge burst of new words | Flawless, Full Clear, Clean Reach |
| 4.3 | Deep Words | Word enemies, Divers | Divers accelerate toward the ship once targeted | Flawless, Full Clear, Steady Hand |
| 4.4 | Middle Dive | Flowing lanes | C restored; Dash can finally say "static" | Flawless, Full Clear, Clean Reach |
| 4.5 | Ring Dive | Flowing lanes | The period debuts as a "full stop" that halts a convoy | Flawless, Full Clear, Clean Reach |
| 4.6 | Pinky Dive | Flowing lanes | Z, the last letter, is rescued; the Keyling celebration is the biggest yet | Flawless, Full Clear, Clean Reach |
| 4.7 | Full Bottom | Word enemies, Splitters, Armored | Splitters break into two shorter words; armored enemies end in punctuation | Flawless, Full Clear, Unbroken |
| 4.8 | Every Letter | Convoys, Word enemies, Waves | A sentence using every letter; all 26 Keylings light at once | Flawless, Beacon Rescue, Steady Hand |
| 4.9 | Boss: The Undertow | See Bosses | | Flawless, Full Clear, Steady Hand |

### Zone 5: Twin Suns

| ID | Level | Mechanics | Signature moment | Medals |
|---|---|---|---|---|
| 5.1 | Right Sun | Twin targets | The right sun flares each time Right Shift fires a left-hand capital | Flawless, Twin Discipline, Clean Reach |
| 5.2 | Left Sun | Twin targets | The left sun answers; the two suns orbit faster with each correct capital | Flawless, Twin Discipline, Clean Reach |
| 5.3 | Proper Names | Word enemies, Twin targets | Enemies named after Keylings and station crew | Flawless, Twin Discipline, Full Clear |
| 5.4 | First Sentences | Word enemies, Twin targets | Each sentence is a formation that breaks on its period | Flawless, Twin Discipline, Steady Hand |
| 5.5 | Questions and Owners | Word enemies | Questions arrive from Ember Reach; answering them reconnects another world | Flawless, Clean Reach, Beacon Rescue |
| 5.6 | Boss: The Twin Tyrant | See Bosses | | Flawless, Twin Discipline, Full Clear |

### Zone 6: The Riverlight

| ID | Level | Mechanics | Signature moment | Medals |
|---|---|---|---|---|
| 6.1 | Common Pairs | Flowing lanes | The river's current speeds up when bigrams are typed smoothly | Flawless, Steady Hand, Unbroken |
| 6.2 | Crossfire | Convergence | Lanes run along the bottom while enemies attack above; alternating hands fire alternating cannons | Flawless, Steady Hand, Full Clear |
| 6.3 | The Hundred | Word enemies, Waves | A hundred-word gauntlet; every word cleared adds light to the river | Flawless, Full Clear, Lightning |
| 6.4 | Endings | Word enemies, Splitters | Splitters break off their suffix ("-ing") as a second target | Flawless, Full Clear, Steady Hand |
| 6.5 | Same-Finger Trouble | Flowing lanes | Same-finger pairs are marked; smooth runs leave a glowing trail | Flawless, Clean Reach, Steady Hand |
| 6.6 | River Message | Decode, Convergence | A courier race: the message must arrive before the Static catches up | Flawless, Lightning, Beacon Rescue |
| 6.7 | Boss: The Stammer | See Bosses | | Flawless, Steady Hand, Unbroken |

### Zone 7: The Counting Stars

| ID | Level | Mechanics | Signature moment | Medals |
|---|---|---|---|---|
| 7.1 | Index Stars | Coordinate locks | Stars named with numbers wink on as the index fingers find them | Flawless, Full Clear, Clean Reach |
| 7.2 | Middle Stars | Coordinate locks | | Flawless, Full Clear, Clean Reach |
| 7.3 | Ring Stars | Coordinate locks | | Flawless, Full Clear, Clean Reach |
| 7.4 | Pinky Stars | Coordinate locks | The full number row lights like a constellation | Flawless, Full Clear, Clean Reach |
| 7.5 | Star Charts | Word enemies, Coordinate locks | Enemies carry dates, times, and scores ("3:45", "1999", "12 to 7") | Flawless, Full Clear, Beacon Rescue |
| 7.6 | Boss: The Tally | See Bosses | | Flawless, Full Clear, Steady Hand |

### Zone 8: The Glyph Wastes

| ID | Level | Mechanics | Signature moment | Medals |
|---|---|---|---|---|
| 8.1 | Dash and Colon | Glyph seals | Ruins covered in hyphens and colons glow as their seals are broken | Flawless, Full Clear, Clean Reach |
| 8.2 | Loud and Quoted | Glyph seals, Word enemies | Enemies shout their words with exclamation marks | Flawless, Full Clear, Clean Reach |
| 8.3 | Brackets | Glyph seals | Bracketed enemies: the shell "(" must be typed before the core, then ")" seals it | Flawless, Full Clear, Clean Reach |
| 8.4 | Glyph Bank | Glyph seals | An ancient vault opens symbol by symbol | Flawless, Full Clear, Clean Reach |
| 8.5 | Glyph Message | Decode | Translating the ruins reveals the Archivist's history | Flawless, Steady Hand, Beacon Rescue |
| 8.6 | Boss: Glyphmaw | See Bosses | | Flawless, Full Clear, Steady Hand |

### Zone 9: The Silent Core

| ID | Level | Mechanics | Signature moment | Medals |
|---|---|---|---|---|
| 9.1 | Repair | Cracks and repair | Static plants wrong letters into messages; Backspace shatters them | Flawless, Clean Reach, Full Clear |
| 9.2 | Fix as You Go | Free typing, Word enemies | The player's own mistakes become cracks they must repair | Clean Reach, Full Clear, Steady Hand |
| 9.3 | Launch | Launch volley | Stacked shots fire all at once on Enter | Flawless, Full Clear, Clean Reach |
| 9.4 | Switch | Mode switch | Tab swaps between lanes and shooter mid-level | Flawless, Full Clear, Clean Reach |
| 9.5 | Full Transmission | All | A full message to the whole galaxy, typed as the Signal comes back | Flawless, Steady Hand, Beacon Rescue |
| 9.6 | Boss: The Hush | See Bosses | | Steady Hand, Full Clear, Unbroken |

The Hush offers no Flawless medal: the final lesson is that mistakes can be fixed.

## Bosses

Every boss has three phases, a clear weak point, and a habit it tests. Bosses run 3–4 minutes.

### The Peeker (Zone 1)

- **Arena:** a debris field in the Drift. The Peeker is a cluster of floating eyes around a glitching core.
- **Habit tested:** looking down.
- **Phase 1:** standard flowing lanes; the Peeker watches.
- **Phase 2:** the Peeker blinks, and lane labels flicker out for a second at a time. The player must rely on finger memory.
- **Phase 3:** labels disappear entirely for stretches; only the twin beacons remain lit. Each correct note closes one of the Peeker's eyes.
- **Finish:** the last eye closes; the Peeker dissolves into Keylings.

### Rushfang (Zone 2)

- **Arena:** Ember Reach's outer ring. Rushfang is a lean, fast, glitching beast.
- **Habit tested:** rushing.
- **Phase 1:** steady convoys.
- **Phase 2:** Rushfang charges, sending fast bursts of notes salted with Static. Hitting Static recharges its armor.
- **Phase 3:** alternating fast and slow stretches. Rushfang only takes damage while the player's accuracy over the last 20 keys is above 95%.
- **Finish:** Rushfang exhausts itself and lies down; the orange nebula returns.

### The Drifter (Zone 3)

- **Arena:** between the spires. The Drifter is a wisp that tugs at the Dart.
- **Habit tested:** hands drifting off home position.
- **Phase 1:** word enemies drawn from top-row-heavy words.
- **Phase 2:** the Drifter pulls targets to the far top corners (q, p, w, o heavy).
- **Phase 3:** alternating top-row and home-row words in rapid sequence; each home-row word pins the Drifter in place for a hit.
- **Finish:** pinned by the twin beacons, the Drifter fades.

### The Undertow (Zone 4)

- **Arena:** deep currents. The Undertow is a huge, slow eel of Static.
- **Habit tested:** weak bottom-row reaches.
- **Phase 1:** divers and splitters from bottom-row words.
- **Phase 2:** the Undertow drags the camera down; long chains of bottom-row letters (z x c v b n m , . /).
- **Phase 3:** full sentences with commas and periods; each period lands a harpoon.
- **Finish:** the eel is pulled up into the light and becomes a current of Signal.

### The Twin Tyrant (Zone 5)

- **Arena:** between the twin suns. A two-headed figure, one head per side.
- **Habit tested:** using the wrong Shift.
- **Phase 1:** left head takes damage only from capitals typed with Right Shift.
- **Phase 2:** right head takes damage only from capitals typed with Left Shift.
- **Phase 3:** both heads at once with mixed-capital sentences; same-hand Shift heals the Tyrant.
- **Finish:** the heads turn on each other and collapse into the suns.

### The Stammer (Zone 6)

- **Arena:** the Riverlight. The Stammer is a stuttering shape that breaks the river's flow.
- **Habit tested:** uneven rhythm.
- **Phase 1:** the Stammer's shield is visible as a pulsing ring.
- **Phase 2:** the shield only drops when the player's last ten keystrokes are evenly spaced (low variation in time between keys).
- **Phase 3:** the Stammer injects sudden hard words; the shield stays down only if the player slows down slightly to keep rhythm, rather than speeding up and stalling.
- **Finish:** the river runs smooth again.

### The Tally (Zone 7)

- **Arena:** a clockwork observatory among the Counting Stars.
- **Habit tested:** guessing at the number row.
- **Phase 1:** coordinate locks with single numbers.
- **Phase 2:** dates and times (12/04, 3:45).
- **Phase 3:** long codes (4-digit, then 6-digit) that wind the clock backward; each correct code stops a gear.
- **Finish:** the clock stops at zero and opens.

### Glyphmaw (Zone 8)

- **Arena:** the deepest ruin of the Glyph Wastes. A mouth full of symbols.
- **Habit tested:** fear of symbols.
- **Phase 1:** glyph seals with single symbols.
- **Phase 2:** Glyphmaw demands pairs and brackets: "(", ")", quotes.
- **Phase 3:** mixed sentences with punctuation; every exact sequence "feeds" Glyphmaw until it is full and falls asleep.
- **Finish:** Glyphmaw falls asleep, and its symbols scatter back into the ruins as light.

### The Hush (Zone 9)

- **Arena:** the Silent Core. No color, no music. The only sound is the player's keystrokes.
- **Habit tested:** fear of mistakes.
- **Phase 1:** the Hush sends perfect sentences. The player types them, and inevitably makes small errors that become cracks.
- **Phase 2:** the Hush grows stronger with every unrepaired crack. Repairing cracks with Backspace weakens it and brings back color.
- **Phase 3:** the player types a final message to the Hush. Mistakes are expected, and the music returns note by note as each one is fixed.
- **Finish:** the Hush becomes the Archivist. Full color and the full soundtrack return at once.

## Side levels

Optional levels on zone maps. They award stars toward zone gates.

| Type | Zones | Description |
|---|---|---|
| **Blackout** | 1–9 | No key labels on screen at all; pure touch typing |
| **Mirror** | 2–4 | Each target is followed by its mirrored-finger pair (e then i, r then u) |
| **Echo** | 3–9 | A word flashes, then disappears; type it from memory |
| **Keyling Rescue** | 1–5 | A long chain of one Keyling's key in many words; rescues a rare Keyling variant |
| **Glyph Vaults** | 8 | Rare symbols: ` ~ ^ * _ = + [ ] { } \ \| < > |
| **Courier Sprint** | 6–9 | A short race against the clock on prose |

## Templates for generated levels

Practice missions and systems checks are generated, not hand-made. They use the same anatomy at a shorter length.

| Template | Length | Shape |
|---|---|---|
| Repair run | 60–90 s | Arrival on the weak keys, build with mixed content, short peak |
| Systems check | 2–5 min | One short segment per zone reached, in order; segment lengths set by the adaptive engine |
| Boss rematch | Boss length | Same boss at the player's chosen tier |

## Open questions

- Should the Peeker's label flicker be adjustable for players who find it frustrating, or is the frustration the lesson?
- Should Convergence (lanes plus shooter) arrive earlier than Zone 6 for players who find the lane-only zones too simple?
- Exact spawn patterns for formations should be prototyped and tuned rather than specified up front.
