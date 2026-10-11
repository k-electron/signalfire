# Vertical 08: Text Content

Everything the player types: where it comes from, how it is filtered, and how it is generated for each level.

## Content types

| Type | Example | Used in |
|---|---|---|
| Key patterns | `fff jjj fjf jfj fj jf` | Intro and drill levels, Zones 0–4 |
| Pseudo-words | `sladf`, `hask` (pronounceable, not real) | Early drills when real words are scarce |
| Real words | `flash`, `glad`, `ridge` | Words levels, shooter enemies |
| Hero words | Hand-picked words that showcase a level's new keys | Level openings and finales |
| Phrases | `ask dad`, `a red sail` | Convoys, decode |
| Sentences | `The beacons are lit.` | Zones 5+ |
| Story lines | Dialogue from the lore | Decode levels |
| Prose passages | 40–80 word original paragraphs | Zones 6–9 |
| Numbers | `1999`, `3:45`, `12 to 7` | Zone 7 |
| Symbol strings | `cadet@homerow.station`, `(ready)`, `95%` | Zone 8 |
| Error-seeded text | Text with planted wrong letters to delete | Zone 9 |

## Vocabulary by stage

Measured against the 20,000 most frequent English words (from the `wordfreq` library), counting words of two or more letters made only from the unlocked keys. Raw counts include abbreviations, names, and unsuitable words, so usable counts are lower.

| After keys | Letters | Raw word count |
|---|---|---|
| Home row (a s d f g h j k l) | 9 | ~130 |
| + e i | 11 | ~510 |
| + r u | 13 | ~1,130 |
| + t y | 15 | ~2,300 |
| + w o | 17 | ~3,630 |
| + q p | 19 | ~4,880 |
| + v m | 21 | ~6,800 |
| + n b | 23 | ~13,750 |
| + c | 24 | ~18,800 |
| + x, z | 26 | ~19,550 |

What this means:

- **Zone 1 is word-starved.** The home row supports a small set of usable words: all, has, had, half, ask, fall, add, glad, flag, flash, dash, salad, flask, hall, glass, shall, gas, lad, alas, gala, lash, sash, flak. Levels 1.1–1.6 use key patterns and pseudo-words; 1.7 uses a hand-curated list.
- **Zone 2 opens the floodgates.** After e and i, real-word levels are comfortable. After t, "the" becomes typeable.
- **N is the single biggest unlock** (doubling the vocabulary). If early zones feel thin in playtesting, introducing n earlier is the main lever.
- The raw home-row list contains offensive words and slurs. A blocklist and human review are mandatory, not optional.

## Common letter patterns

Computed from frequency-weighted English words (letter pairs within words). These feed Zone 6 and the adaptive engine.

**Most common pairs:** th, he, in, an, er, re, on, at, nd, or, ou, to, en, ng, it, es, st, is, ar, te

**Most common same-finger pairs** (slowest to type): ed, de, ce, lo, ec, un, tr, rt, ol, fr, gr, ki, my, ny, ju

**Hand alternation:** about 52% of letter pairs within words switch hands. Alternating-hand words for level 6.2 are drawn from words with high alternation (e.g., "sign", "town", "they", "half", "make").

## Sources and licensing

| Purpose | Source | License | Notes |
|---|---|---|---|
| Word validity and commonness for shipped lists | **SCOWL** (Spell Checker Oriented Word Lists) | Permissive notice: use, modify, distribute, sell; keep the copyright and permission notice | Lists are grouped by size, which approximates commonness |
| Frequency analysis during design (never shipped) | **wordfreq** | Data: CC BY-SA 4.0 | Its share-alike terms would apply to any shipped list derived from it, so shipped lists come from SCOWL only |
| Profanity and slur blocklist | **LDNOOBW** (List of Dirty, Naughty, Obscene and Otherwise Bad Words) | CC BY 4.0 | Requires attribution |
| Sentences, story, prose | Written for the game | Owned | Never copy text from books, songs, or articles |

All licenses need a review before launch. Attribution notices go in an in-game credits screen.

## Safety and curation

Every list goes through three filters:

1. **Blocklist:** remove any word on the blocklist, plus words that contain a blocked word as a substring when the result reads badly.
2. **Category filters:** remove abbreviations, proper nouns (except curated names), brand names, slang, and words with strong violent, sexual, drug, or political associations.
3. **Human review:** every word list under 500 entries is reviewed by a person. Larger lists are spot-checked, and any word reported by a player is removed.

Pseudo-word generation also checks every output against the blocklist, since random letter strings can produce offensive words.

### Curated name list

Names used for capitals in Zone 5: the game's own characters (Dash, Rell, Okafor, Pim, the Keylings, the Wardens, the sectors) plus a diverse set of common first names and fictional place names. No real public figures.

## Generation rules

The text generator builds a sequence for a level from a recipe.

### Inputs

| Input | Example |
|---|---|
| Allowed characters | Unlocked keys for the level |
| Focus keys | `r u` |
| Focus share | 50% of characters should be focus keys |
| Unit type | Patterns, pseudo-words, words, phrases, sentences |
| Length range | 3–6 letters |
| Key weights | From the adaptive engine, for the review portion |
| Total length | In characters or units |

### Rules

- **Allowed keys only, pragmatically.** Units use only allowed characters. When a hand-written line needs one unlearned letter, that letter is pre-filled (shown as already typed and skipped by the cursor) instead of rewriting the line.
- **Focus coverage.** Every unit contains at least one focus key in Drill levels; most do in Words levels.
- **No repeats.** The same word does not appear twice within a 20-word window.
- **First-letter variety (shooter).** No two enemies on screen at once start with the same letter.
- **Length ramp.** Short units at the start of a level, longer at the peak, shorter again in the breather.
- **Hand alternation bias.** In Zone 6, level 6.2 selects words with above-average hand alternation.
- **Same-finger content.** Level 6.5 selects words containing the same-finger pairs listed above.
- **Capital balance.** Zone 5 content balances left-hand and right-hand capitals so both Shift keys get equal practice.
- **Punctuation placement.** Commas mid-sentence, periods at the end, question marks only on real questions, apostrophes only in real contractions and possessives.

### Pattern drills

Generated for intro and drill levels:

| Pattern | Example (new keys f j) |
|---|---|
| Repeat | `fff jjj` |
| Alternate | `fjfj jfjf` |
| Pair | `fj jf ff jj` |
| Mixed with known keys | `fdj kfj dkf` |
| Mirror (same finger, other hand) | `f j f j` (for e i: `e i ie ei`) |

### Pseudo-words

Generated by a letter-pair model trained on English, restricted to allowed letters. Outputs must be pronounceable (vowel spacing rules), 3–6 letters, and pass the blocklist. They are marked with a subtle style so players know they're practice strings, not misspelled words.

## Numbers (Zone 7)

| Format | Examples |
|---|---|
| Single digits and pairs | `4 5 45 54` |
| Years | `1999`, `2047` |
| Times | `3:45`, `12:30` |
| Dates | `12/04`, `7/19` |
| Scores and counts | `12 to 7`, `100 stars` |
| Coordinates | `48.2 by 17.9` |
| Codes | `4821`, `730915` |

Numbers in sentences come from lore ("Sector 7 is 1,200 light years out").

## Symbols (Zone 8)

Each symbol is practiced in a context where it's used naturally.

| Symbol | Contexts |
|---|---|
| `-` | Hyphenated words (`well-known`), ranges (`3-4`) |
| `:` | Times, lists (`Crew: Dash, Pim`) |
| `!` | Exclamations |
| `"` | Quoted speech |
| `( )` | Asides (`(ready)`) |
| `@` | Addresses (`cadet@homerow.station`) |
| `#` | Tags and numbers (`#7`, `#homerow`) |
| `$` | Prices (`$4.50`) |
| `%` | Percentages (`95%`) |
| `&` | Names (`Pim & Dash`) |

Side levels (Glyph Vaults) cover the rest with contexts like code-style strings (`[a, b]`, `{x}`, `a + b = c`).

## Editing content (Zone 9)

- **9.1 Repair:** hand-written lines with planted wrong letters, marked as cracks, for the player to delete before continuing.
- **9.2 onward:** the player's own errors become the cracks; content is ordinary prose.
- **Enter:** multi-line messages (addresses, short lists, poems written for the game).
- **Tab:** two-column content such as a ship roster (`Dash` Tab `drone`).

## Story and prose writing

- Story lines for decode levels are written alongside the lore. Each line is validated against the level's unlocked keys.
- Prose passages for Zones 6–9 are original, 40–80 words, written at an everyday reading level, and set in the game's world.
- Estimated volume: about 40 passages and 150 decode lines for the campaign; the endless mode needs a larger rotating pool (200+ passages), which can grow after launch.

## Validation tools

Automated checks run on every content change:

| Check | Fails when |
|---|---|
| Key check | A unit uses a key not unlocked at its level, without a pre-fill marker |
| Blocklist check | Any unit or generated output matches the blocklist |
| Focus coverage | A level's focus share falls below its target |
| Repeat check | A word repeats within its window |
| First-letter check | Shooter waves can produce duplicate first letters on screen |
| Length check | Units fall outside the level's length range |

## Open questions

- Should pseudo-words be used at all, or should Zone 1 rely on patterns and the small real-word list? Playtest both.
- English only for now; other languages would need their own lists, frequency data, and curriculum order.

## Sources

- [wordfreq (data CC BY-SA 4.0)](https://pypi.org/project/wordfreq/1.2)
- [SCOWL copyright notice (Debian)](https://sources.debian.org/src/scowl/6-3/debian/copyright)
- [LDNOOBW README and CC BY 4.0 notice](https://raw.githubusercontent.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words/master/README.md)
- Word counts and letter-pair statistics computed with `wordfreq` (top 20,000–30,000 English words).
