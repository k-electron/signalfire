# Vertical 04: Core Mechanics and Game Feel

The moment-to-moment game: what's on screen, what each keystroke does, and how every action feels.

## Core idea

There is always exactly **one active character**: the next thing the player should type. Every mode is a different way of presenting that stream of characters and turning correct keystrokes into spectacle. This keeps the game honest to typing (P1): the player is always typing a sequence of characters, never doing something else that looks like typing.

## Input model

### What counts as a keystroke

- A key press is read from its **character** (what was typed) and its **physical key** (where it is on the keyboard).
- Held-key auto-repeat is ignored. Only the first press counts.
- Key release is recorded too, so the game can measure rollover (pressing the next key before releasing the previous one).
- Modifier keys alone (Shift, Ctrl, Alt, Meta) are not keystrokes. Shift is recorded as part of the character it modifies, including which Shift key (left or right) was held.
- Keys the game uses (Space, Tab, Backspace, apostrophe, slash, Enter) must never trigger browser behavior such as scrolling, focus changes, or quick-find while a level is running.
- Dead keys and input-method composition are ignored. A warning is shown if the game detects a non-US layout producing unexpected characters.

### Judging a keystroke

| Situation | Result |
|---|---|
| Pressed key matches the active character | **Hit**: progress, feedback, points |
| Pressed key doesn't match | **Error**: feedback, combo penalty, counted in accuracy |
| A capital typed with the same-hand Shift (Zone 5 levels) | **Error** |
| A Static target's key pressed during its window | **Static hit**: error, Static gains strength |
| Window or tab loses focus | Level pauses; resumes with a 3-2-1 countdown |

### No timing grades

There are no "perfect / great / good" timing judgments. Timing grades reward waiting for a note to reach a line, which works against speed. A hit is a hit. Rhythm is measured separately as consistency (see Signal lock and Overdrive).

## Presentation modes

### Lanes

The core mode for learning new keys.

- **Nine lanes:** four for each hand's fingers and one for the thumb (Space).
- **View:** flat lanes with a slight tilt for depth.
- Each lane is colored by finger. Left-hand lanes share one color family, right-hand lanes another.
- A note shows its character. Its vertical offset inside the lane shows its row: home-row notes sit centered, top-row notes ride high, bottom-row notes ride low. This shows the reach before the player makes it.
- Notes travel toward a **hit line**. The active note glows; the player can hit it at any point before it reaches the line.
- The machine's console sits below the hit line and shows exactly the keys the current machine has. Pressed keys flash.

Two variants:

| Variant | Behavior | Used |
|---|---|---|
| **Waiting lanes** | Notes stop at the hit line and wait to be hit. No misses possible. | Zones 0–1, intro levels |
| **Flowing lanes** | Unhit notes pass the line and count as misses. | From 1.5 onward |

### Word convoys

A word is a cluster of notes traveling together, bracketed by a soft glow. Space between words is a thumb-lane note. Completing a word bursts the bracket and adds a bonus.

### Word enemies (shooter)

Enemies descend from the top of the screen, each carrying a word. The player's ship sits at the bottom.

- **Targeting:** typing the first letter of a word locks onto the nearest enemy whose word starts with that letter. Lock stays until the word is finished. The spawner avoids having two visible enemies whose words start with the same letter.
- **Firing:** each correct character fires a shot at the locked enemy and strips the letter from its word.
- **Errors:** the cursor stays on the current character until the correct key is pressed.
- **Destroy:** the final character destroys the enemy. Longer words make bigger explosions.
- **Space:** not required between enemies. (Space is practiced in lanes, convoys, decode, and convergence, where text is continuous.)
- **Arrival:** an enemy that reaches the ship damages its shield and is removed.

### Decode

A story mode. A garbled line of dialogue appears; as the player types each character, it un-scrambles into the real text and the scene plays. This looks like classic typing practice, dressed as a transmission being decoded.

### Convergence

From Zone 6. Continuous prose travels through the lanes at the bottom of the screen while enemies attack from above. Each completed word fires a volley at the nearest enemy. The player is doing real, continuous typing with spaces; the shooter is the consequence.

## Targets and enemies

| Target | Appearance | Rule | Debut |
|---|---|---|---|
| **Note** | Glowing letter in a lane | Hit before it passes the line | 0.1 |
| **Static note** | Gray, glitching note | Do not press its key while it sits on the line (about 0.6 s); it then dissolves | 2.4 |
| **Stranded beacon** | Small, slow, golden target | Optional; typing it rescues it | 2.7 |
| **Glider** | Basic enemy | Glides down slowly | 3.2 |
| **Formation** | Group of gliders | Arrives in a pattern, peels off one at a time | 3.4 |
| **Diver** | Sharp, angular enemy | Accelerates toward the ship once locked | 4.3 |
| **Splitter** | Enemy with a seam | Splits into two shorter words when hit | 4.7 |
| **Armored** | Enemy with a punctuation shell | Word ends in punctuation that must be typed | 4.7 |
| **Twin target** | Capital letter with a linked Shift marker on the opposite side | Must hold the opposite-hand Shift | 5.1 |
| **Static enemy** | Gray word enemy | Decoy; locking onto it feeds the Static | 4.7 |
| **Coordinate lock** | Target ringed by digits | Type the number sequence to lock guns | 7.1 |
| **Glyph seal** | Enemy sealed by symbols | Type the symbol sequence to break the seal, then the word | 8.1 |
| **Crack** | Gray, broken, glitching character | Must be removed with Backspace | 9.1 |

## Signal lock (combo)

The longer the clean streak, the stronger the multiplier.

| Tier | Consecutive hits | Multiplier |
|---|---|---|
| 1 | 0 | ×1 |
| 2 | 10 | ×2 |
| 3 | 25 | ×4 |
| 4 | 50 | ×6 |
| 5 | 100 | ×8 |

- **On error, Zones 1–3:** drop one tier. Gentle while the player is learning.
- **On error, Zone 4 onward:** reset to ×1. Accuracy matters more as skill grows.
- Each tier-up has a visible burst, a sound layer, and a brighter lane or ship glow.

## Overdrive

A surge of pure Signal earned by steady, clean typing.

- **Fills** from correct keystrokes, faster when the time between keystrokes is even. Erratic bursts fill it slowly.
- **Activates automatically** when full. No dedicated key, so it never interrupts typing.
- **Lasts** about 8 seconds: double multiplier, full music, maximum visual intensity.
- **Ends** early on an error.

## Shield

The ship's shield represents accuracy under pressure.

- Errors, Static hits, and arrivals drain the shield.
- Clean streaks regenerate it.
- At zero, the ship sputters: visuals dim, and the multiplier is capped at ×2 until the shield recovers. The level continues; there is no game over.

## Editing mechanics (Zone 9)

### Cracks and repair

- In free-typing levels, a wrong character is inserted as a crack instead of being rejected.
- The player can keep typing, but a word containing cracks cannot complete. Pressing Space on a cracked word makes it bounce back.
- Backspace removes the last character with a satisfying shatter effect.
- Cracks left unrepaired feed the Static.

### Launch volley (Enter)

- Shots charge silently while the player types a line.
- Enter releases the whole volley at once. A clean line fires a perfect volley.

### Mode switch (Tab)

- Tab switches the active stream between two targets (for example, lanes and a shooter target) mid-level.
- Teaches Tab as a reach, not as a menu key.

## Game feel

### Response

| Moment | Target |
|---|---|
| Keystroke to visual response | Within one frame (about 16 ms at 60 fps) |
| Keystroke to sound | As low as the platform allows; target under 30 ms |
| Frame rate | 60 fps sustained during peaks |

### Feedback per action

| Action | Visual | Sound | Other |
|---|---|---|---|
| Hit | Note bursts into particles in the finger's color; the console key flashes | A note from the current scale (see Audio) | Small squash on the target |
| Word complete | Bracket or enemy explodes; size scales with word length | Chord or explosion | 30–50 ms hit-stop |
| Error | Brief Static glitch flicker on the active character and the pressed console key | Short Static crackle | No screen shake; errors should be clear, not punishing |
| Static hit | Static ripples across the lanes | Louder crackle | Static enemy grows |
| Combo tier up | Ring burst from the hit line | Music layer added | |
| Combo break | Lane glow fades down | Music layer drops | |
| Overdrive start | Screen floods with zone color; camera pushes in | Key change and full mix | |
| Boss phase change | Big flash, slow-motion beat | Stinger | 80–120 ms hit-stop |
| Star earned (results) | Star core flies into the meter | Rising chime | |

### Effect budgets

- Screen shake only for explosions and boss events, never for errors, and at most 4 px.
- Particles fade within 300 ms near the active target so they never cover the next character.
- Intensity scales with combo and Overdrive, so spectacle is earned by typing well.

## Mechanics by zone

| Zone | Active mechanics |
|---|---|
| 0 | Waiting lanes |
| 1 | Waiting and flowing lanes, convoys, combo |
| 2 | Lanes, convoys, Overdrive, Static notes, decode, beacons |
| 3 | Lanes, shooter, formations, decode |
| 4 | Lanes, shooter, divers, splitters, armored, Static enemies |
| 5 | Shooter, twin targets |
| 6 | All above, plus convergence |
| 7 | Coordinate locks, shooter |
| 8 | Glyph seals, shooter, decode |
| 9 | Cracks, launch volley, mode switch, everything else |

## Open questions

- Does the shooter mode need Space between enemies after all? Requiring it keeps typing realistic but slows the shooter's pace. Prototype both.
- How long should a Static note sit on the line? 0.6 s is a starting guess.
