# Vertical 02: Curriculum

What the player learns, in what order, to what standard. The curriculum is the spine; level design, content, and mechanics hang off it.

## Goals

At the end of the campaign (about 30 days of 15–20 minute sessions), the player:

- touch types every letter, capitals, common punctuation, numbers, common symbols, Backspace, Enter, and Tab without looking;
- sustains 95% accuracy or better;
- reaches roughly 20–25 WPM on everyday prose;
- has the habits that lead to more speed later: consistent finger-to-key mapping, returning to home position, steady rhythm, opposite-hand Shift.

## Research basis

| Finding | Source | Curriculum consequence |
|---|---|---|
| Programs converge on home row first, then top row, bottom row, Shift, numbers, symbols | TypingClub handbook, typing.com lesson sequence, BBC Dance Mat (third-party descriptions) | Row-based zone order |
| New keys are introduced in mirrored pairs (same finger, each hand) | TypingClub, Dance Mat | Pairs per level where possible |
| Two speed bars per section: a minimum to pass and a goal | TypingClub handbook | 1-star and 3-star thresholds per zone |
| Skilled typing is planned at the word level | Crump and Logan 2010 | Real words as early as possible |
| Different-hand and different-finger letter pairs predict speed; rollover common in fast typists | Dhakal et al. 2018 | Fluency zone focuses on alternation and flow; telemetry tracks rollover |
| Consistent finger-to-key mapping, preparing the next keystroke, and minimal hand movement predict performance | Feit et al. 2016 | Habits taught explicitly; home-return emphasized |
| Shorter daily sessions beat longer, fewer sessions | Baddeley and Longman 1978 | 15–20 minute sessions; daily plan |
| Accuracy before speed | Curriculum consensus; typing.com guidance | Accuracy floor on every star |

## Finger map (US QWERTY)

| Finger | Keys |
|---|---|
| Left pinky | ` 1 Q A Z, Tab, Caps Lock, Left Shift |
| Left ring | 2 W S X |
| Left middle | 3 E D C |
| Left index | 4 5 R T F G V B |
| Right index | 6 7 Y U H J N M |
| Right middle | 8 I K , |
| Right ring | 9 O L . |
| Right pinky | 0 - = P [ ] \ ; ' / Enter, Backspace, Right Shift |
| Thumbs | Space (one consistent thumb; player's choice) |

**Decision:** 6 is assigned to the right index finger, which is the most common teaching. Some typists use the left index; the game accepts either physically (it can't detect fingers) but teaches the right.

## Habits taught alongside keys

These are introduced at specific points and reinforced throughout.

| Habit | Introduced | How it is taught |
|---|---|---|
| Posture: sit tall, wrists floating, feet flat | Zone 0 | Short animated checklist before the first level; revisited in systems check |
| Find the twin beacons (F and J bumps) without looking | Zone 0 | First interaction of the game |
| Eyes on the screen | Zone 0 | Stated once; reinforced by the Zone 1 boss |
| Every finger returns home after a reach | Zone 2 | Explained with the first top-row keys; Zone 3 boss tests it |
| One consistent thumb for Space | Zone 0 | Stated once |
| Accuracy before speed | Zone 1 | Star conditions; Zone 2 boss tests it |
| Opposite-hand Shift | Zone 5 | Enforced and measured (the browser reports which Shift key was pressed) |
| Steady rhythm over bursts | Zone 6 | Consistency is measured and rewarded; Zone 6 boss tests it |
| Fix mistakes with Backspace | Zone 9 | Editing is taught last, once accuracy habits are set |

## Error policy by stage

| Stage | Policy |
|---|---|
| Zones 0–4, single-key and lane levels | A wrong key is an error: it counts against accuracy and the note stays. In flowing lanes (1.5 onward), a note that passes the line unhit is a miss. |
| Zones 1–8, word and sentence levels | The cursor waits on the current character until the correct key is pressed. Errors are counted but don't need fixing. |
| Zone 9 onward | Free typing: wrong characters are inserted as in real typing and must be removed with Backspace before continuing. |

Accuracy always counts the first attempt at each character. A corrected error still counts as an error.

## Zones and levels

Each zone ends with a boss level that acts as the zone exam. Level IDs are `zone.level`.

Level types:

- **Intro:** first contact with new keys. Slow, guided, few targets.
- **Drill:** new keys mixed with known ones, short patterns.
- **Words:** real words built from the unlocked set.
- **Mix:** review across everything learned so far.
- **Story:** a decode level built from dialogue text.
- **Boss:** zone exam combining everything in the zone.

### Zone 0: Launch (day 1)

| ID | Level | Keys | Type | Notes |
|---|---|---|---|---|
| 0.1 | Twin Beacons | F, J, Space | Intro | Posture checklist, find the bumps, press F, J, Space |
| 0.2 | Eight Docks | full home row (identification) | Intro | Each finger presses its home key in order; no speed requirement |

Zone 0 has no stars and no gate. It always completes.

### Zone 1: Home row (days 1–3)

| ID | Level | New keys | Type |
|---|---|---|---|
| 1.1 | First Light | f j (with Space) | Drill |
| 1.2 | Middle Reach | d k | Drill |
| 1.3 | Ring Steady | s l | Drill |
| 1.4 | Pinky Anchors | a ; | Drill |
| 1.5 | Full Home | (review a s d f j k l ;) | Mix |
| 1.6 | Inward Steps | g h | Drill |
| 1.7 | First Words | (home-row words) | Words |
| 1.8 | Boss: The Peeker | all home row | Boss |

Content note: the home row supports roughly 130 words in common English (measured against a 20,000-word frequency list), many unsuitable. Level 1.7 needs a hand-curated list (all, has, had, half, ask, fall, add, glad, flag, flash, dash, salad, flask, hall, glass). Earlier levels use letter patterns (fff jjj fjf jfj).

### Zone 2: Top row I (days 4–7)

| ID | Level | New keys | Type |
|---|---|---|---|
| 2.1 | Up and Back | e i | Intro |
| 2.2 | Ember Words | (e i words) | Words |
| 2.3 | Index Climb | r u | Drill |
| 2.4 | Reach Words | (r u words) | Words |
| 2.5 | Long Reach | t y | Drill |
| 2.6 | Ember Message | (story) | Story |
| 2.7 | Reach Review | (all zone keys) | Mix |
| 2.8 | Boss: Rushfang | all zone keys | Boss |

Vocabulary grows fast here: adding e and i takes the common-word count from about 130 to 500; adding r, u, t, y takes it to about 2,300. "The" becomes typeable at 2.5.

### Zone 3: Top row II (days 8–10)

| ID | Level | New keys | Type |
|---|---|---|---|
| 3.1 | Ring Rise | w o | Drill |
| 3.2 | Spire Words | (w o words) | Words |
| 3.3 | Pinky Peaks | q p | Drill |
| 3.4 | Full Top | (top row review) | Mix |
| 3.5 | Spire Message | (story) | Story |
| 3.6 | Boss: The Drifter | home and top rows | Boss |

### Zone 4: Bottom row (days 11–15)

| ID | Level | New keys | Type |
|---|---|---|---|
| 4.1 | Down Under | v m | Drill |
| 4.2 | Index Dive | n b | Drill |
| 4.3 | Deep Words | (v m n b words) | Words |
| 4.4 | Middle Dive | c , | Drill |
| 4.5 | Ring Dive | x . | Drill |
| 4.6 | Pinky Dive | z / | Drill |
| 4.7 | Full Bottom | (bottom row review) | Mix |
| 4.8 | Every Letter | (all 26 letters) | Mix |
| 4.9 | Boss: The Undertow | all letters, comma, period | Boss |

Vocabulary note: n is the single biggest unlock in the curriculum. Adding n and b roughly doubles the typeable common words (from about 6,800 to 13,800). If early zones feel word-starved in playtesting, the fallback is to introduce n b before v m.

### Zone 5: Capitals (days 16–18)

| ID | Level | New keys | Type |
|---|---|---|---|
| 5.1 | Right Sun | Right Shift (left-hand capitals) | Drill |
| 5.2 | Left Sun | Left Shift (right-hand capitals) | Drill |
| 5.3 | Proper Names | (capitalized words and names) | Words |
| 5.4 | First Sentences | (capital + period) | Words |
| 5.5 | Questions and Owners | ' and ? | Drill |
| 5.6 | Boss: The Twin Tyrant | all capitals, ' ? | Boss |

Opposite-hand Shift is enforced in this zone: using the same-hand Shift counts as an error. After this zone it is tracked and coached but not scored as an error.

### Zone 6: Fluency (days 19–22)

| ID | Level | Focus | Type |
|---|---|---|---|
| 6.1 | Common Pairs | top bigrams: th he in er an re on at en nd | Drill |
| 6.2 | Crossfire | hand-alternating words | Words |
| 6.3 | The Hundred | the 100 most common words | Words |
| 6.4 | Endings | -ing -ed -er -tion -ly -est | Words |
| 6.5 | Same-Finger Trouble | same-finger sequences: ed de ce un ny my lo ol | Drill |
| 6.6 | River Message | (story paragraphs) | Story |
| 6.7 | Boss: The Stammer | everything; rhythm-focused | Boss |

No new keys. This zone converts key knowledge into speed and flow.

### Zone 7: Numbers (days 23–25)

| ID | Level | New keys | Type |
|---|---|---|---|
| 7.1 | Index Stars | 4 5 6 7 | Drill |
| 7.2 | Middle Stars | 3 8 | Drill |
| 7.3 | Ring Stars | 2 9 | Drill |
| 7.4 | Pinky Stars | 1 0 | Drill |
| 7.5 | Star Charts | numbers in context: dates, times, scores, coordinates | Words |
| 7.6 | Boss: The Tally | all numbers | Boss |

### Zone 8: Symbols (days 26–28)

| ID | Level | New keys | Type |
|---|---|---|---|
| 8.1 | Dash and Colon | - : | Drill |
| 8.2 | Loud and Quoted | ! " | Drill |
| 8.3 | Brackets | ( ) | Drill |
| 8.4 | Glyph Bank | @ # $ % & | Drill |
| 8.5 | Glyph Message | (mixed punctuation prose) | Story |
| 8.6 | Boss: Glyphmaw | all symbols in this zone | Boss |

Remaining symbols (` ~ ^ * _ = + [ ] { } \ | < >) are covered in optional side levels (see Level Design). They are lower priority for everyday typing.

### Zone 9: Editing (days 29–30)

| ID | Level | New keys | Type |
|---|---|---|---|
| 9.1 | Repair | Backspace | Intro |
| 9.2 | Fix as You Go | free typing with errors to correct | Words |
| 9.3 | Launch | Enter | Drill |
| 9.4 | Switch | Tab | Drill |
| 9.5 | Full Transmission | paragraphs using everything | Story |
| 9.6 | Boss: The Hush | final exam | Boss |

### Totals

| Zone | Main levels |
|---|---|
| 0 | 2 |
| 1 | 8 |
| 2 | 8 |
| 3 | 6 |
| 4 | 9 |
| 5 | 6 |
| 6 | 7 |
| 7 | 6 |
| 8 | 6 |
| 9 | 6 |
| **Total** | **64** |

Plus unlimited practice missions, refresh-to-now sessions, and optional side levels.

## Standards per zone

Star thresholds combine accuracy and speed. Both must be met.

| Zone | 1 star | 2 stars | 3 stars |
|---|---|---|---|
| 1 Home row | 92% · 6 WPM | 95% · 9 WPM | 97% · 12 WPM |
| 2 Top row I | 92% · 8 WPM | 95% · 12 WPM | 97% · 16 WPM |
| 3 Top row II | 93% · 10 WPM | 95% · 14 WPM | 97% · 18 WPM |
| 4 Bottom row | 93% · 10 WPM | 95% · 15 WPM | 97% · 20 WPM |
| 5 Capitals | 93% · 10 WPM | 95% · 15 WPM | 97% · 20 WPM |
| 6 Fluency | 94% · 15 WPM | 96% · 20 WPM | 98% · 28 WPM |
| 7 Numbers | 93% · 8 WPM | 95% · 12 WPM | 97% · 16 WPM |
| 8 Symbols | 93% · 8 WPM | 95% · 12 WPM | 97% · 16 WPM |
| 9 Editing | 94% · 16 WPM | 96% · 22 WPM | 98% · 28 WPM |

Notes:

- All values are provisional and must be tuned with playtest data.
- Number and symbol zones have lower speed bars because those keys are slower for everyone.
- Zone 9's 2-star bar sits on the month-end fluency target.
- The 1-star accuracy floor is always above 90%. At 90%, about every other word contains an error.
- Thresholds are absolute, not age-adjusted. Experienced typists will earn stars quickly, which is intended.

### Definitions

- **Characters typed:** every key press that produces or should produce a character, including Space.
- **Accuracy:** correct first attempts ÷ total first attempts.
- **WPM:** (correct characters ÷ 5) ÷ minutes of active typing. Time spent in pauses longer than 3 seconds is excluded so that a single distraction doesn't wreck a run.
- **Active typing time** starts at the first keystroke of a level, not when the level loads.

## Key mastery

Each key has a mastery state computed from recent performance. It drives Keyling brightness, practice suggestions, and refresh weighting. It does not unlock levels; levels unlock through stars.

| State | Condition |
|---|---|
| New | Fewer than 20 attempts |
| Learning | 20+ attempts, below mastered thresholds |
| Solid | ≥ 95% accuracy over the last 50 attempts and median time-to-press within 1.5× the zone's 3-star pace |
| Mastered | ≥ 97% accuracy over the last 100 attempts and median time-to-press within the zone's 3-star pace |

Mastery never decreases from inactivity. It can decrease if the player's recent attempts on a key are genuinely worse, in which case the key is flagged for practice, not punished.

## Daily plan

A typical 15–20 minute session:

1. **Warm-up** (1–2 min): a quick replay or systems check (optional).
2. **New material** (6–10 min): one or two new levels.
3. **Consolidate** (4–6 min): replay a level for more stars, or a practice mission on weak keys.
4. **Stop point:** after the daily goal, the game suggests stopping and previews tomorrow.

### Day-by-day guide

| Day | New levels | Notes |
|---|---|---|
| 1 | 0.1, 0.2, 1.1, 1.2 | Orientation day |
| 2 | 1.3, 1.4, 1.5 | |
| 3 | 1.6, 1.7, 1.8 | First boss, first gate |
| 4 | 2.1, 2.2 | |
| 5 | 2.3, 2.4 | |
| 6 | 2.5, 2.6 | |
| 7 | 2.7, 2.8 | Boss |
| 8 | 3.1, 3.2 | |
| 9 | 3.3, 3.4 | |
| 10 | 3.5, 3.6 | Boss |
| 11 | 4.1, 4.2 | |
| 12 | 4.3, 4.4 | |
| 13 | 4.5, 4.6 | |
| 14 | 4.7, 4.8 | |
| 15 | 4.9 | Boss; consolidation day |
| 16 | 5.1, 5.2 | |
| 17 | 5.3, 5.4 | |
| 18 | 5.5, 5.6 | Boss |
| 19 | 6.1, 6.2 | |
| 20 | 6.3 | Consolidation |
| 21 | 6.4, 6.5 | |
| 22 | 6.6, 6.7 | Boss |
| 23 | 7.1, 7.2 | |
| 24 | 7.3, 7.4 | |
| 25 | 7.5, 7.6 | Boss |
| 26 | 8.1, 8.2 | |
| 27 | 8.3, 8.4 | |
| 28 | 8.5, 8.6 | Boss |
| 29 | 9.1, 9.2, 9.3 | |
| 30 | 9.4, 9.5, 9.6 | Final boss |

The plan is a guide, not a lock. Players move at their own pace; the gate rules (stars) are the only hard limits.

## Content rules by level type

| Type | New-key share | Content |
|---|---|---|
| Intro | 70–80% | Single keys and short patterns (f j fj jf ff jj) |
| Drill | 50–60% | Patterns and short real words; new keys mixed with recent keys |
| Words | 40–50% | Real words from the unlocked set, focus keys in most words |
| Mix | Even across all unlocked keys | Words and phrases; weighted toward weaker keys |
| Story | Natural | Dialogue text (must use only unlocked keys where practical) |
| Boss | Even across the zone, with focus on the zone's habit | Mixed, escalating difficulty |

"Unlocked keys only" is followed where practical. When a real word or line needs one unlearned letter, it may be pre-filled (shown as already typed) instead of dropped.

## Beyond the campaign

The month ends with fluency, not mastery. The game stays playable and replayable so players can keep progressing to 50 WPM and beyond with continued practice. After the campaign:

- Speed tiers continue in endless and courier modes: 30, 40, 50, 60+ WPM.
- Veteran and Ace difficulty tiers of every level raise the bars.
- Optional side levels cover rare symbols.

## Open questions

- Is Tab worth a full level, or should it be folded into 9.3 with Enter?
- Calibrate all thresholds with playtest data from at least a few players at different ages and starting skills.

## Sources

- [TypingClub Typing Jungle Teacher Handbook](https://static.typingclub.com/m/edclubdocs/media/pdf/typing-jungle-handbook.pdf)
- [typing.com lesson sequence](https://www.typing.com/student/lesson/133991/practice-home-row-keys)
- [typing.com speed and accuracy guidance](https://support.typing.com/en/articles/9045953)
- [BBC Dance Mat stages, third-party description](https://www.kidztype.com/blog/?p=302)
- [Crump and Logan 2010, word-level control in typing](http://www.psy.vanderbilt.edu/faculty/logan/Crump%20Logan%20JEPLMC2010.pdf)
- [Dhakal et al. 2018, Observations on Typing from 136 Million Keystrokes](https://userinterfaces.aalto.fi/136Mkeystrokes/)
- [Feit et al. 2016, How We Type](https://userinterfaces.aalto.fi/how-we-type/)
- [Distributed practice, Baddeley and Longman 1978](https://en.wikipedia.org/wiki/Distributed_practice)
- [Opposite-hand Shift rule](https://www.typing-lessons.org/lesson_5.html)
- [Number row finger assignment](https://codesignal.com/learn/courses/numbers-symbols-functional-typing/lessons/mastering-the-number-row)
- Word counts per zone: computed against the top 20,000 English words in the `wordfreq` Python library.
