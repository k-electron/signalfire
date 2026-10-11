# Philosophy

The principles every decision in this project traces back to. When a spec, epic, or pull request conflicts with this document, either the work changes or this document changes, deliberately and with a recorded reason.

## Vision

A browser game that turns anyone into a fluent touch typist through about a month of short daily play. Players should feel they are playing an arcade game, not doing lessons, and come out the other side typing without looking.

## Who it's for

People who want to learn how to type.

## Principles

Each principle has an ID so specs and epics can cite it.

### P1. The learning is the game

There is one score. Every game mechanic is a typing measurement: damage is correct keystrokes, combos are accuracy streaks, power meters fill from steady rhythm, enemy pacing is the target speed. If a player can succeed at the game without typing well, the design is wrong.

### P2. Accuracy before speed

Clean typing is rewarded before fast typing. Speed targets rise only after accuracy holds. At 90% accuracy, roughly every other word has a mistake; that is not a passing grade here.

### P3. Simpler machines, not training wheels

Players never use a complex machine with aids bolted on that later get removed. They start on a simple machine that is complete in itself (a craft controlled only by the home row) and graduate to more complex machines as they learn more keys. What a machine shows on screen is part of the machine, not a crutch.

### P4. A ramp, never a wall

Each level adds one small new thing. Progress has real gates (a minimum star rating per level, a star total per zone), but every gate has several ways through, and the way past a sticking point is the practice the player needs.

### P5. Earned, not bought

Stars, unlocks, and upgrades come only from typing performance. Nothing can be bought or grinded past a skill gate. A player's ship loadout reflects their typing ability.

### P6. Never punish absence

Stars and upgrades are never taken away. Returning players are offered an optional warm-up that refreshes everything learned so far, weighted toward what is most likely to have faded.

### P7. Short and daily

The game is designed around 15–20 minute daily sessions. Short, frequent practice outperforms long, infrequent practice, so the session structure should feel complete at that length.

### P8. Words over letters

Skilled typists plan whole words, not individual keystrokes. New keys appear inside real words as soon as possible. Content uses only learned keys where practical, and bends that rule when real words matter more.

### P9. Spectacle is a requirement

Big visual payoff, smooth transitions, and satisfying feedback are core features, not polish for later. The experience leads with visuals. Audio is generated procedurally and responds to the player's typing, so flow sounds good and mistakes sound broken.

### P10. An honest mirror

Detailed performance data is collected and shown to the player in a form they enjoy reading. The same data drives what the game asks them to practice next.

### P11. Local first, cloud optional

The full game works with no account. Logging in only adds cloud sync. When logged in, the cloud copy is the source of truth on load, and progress is pushed at natural checkpoints.

### P12. Evidence over dogma

The curriculum follows the established consensus of typing instruction and the available research. Inspiration games are spiritual guides: we take what serves the learning and leave the rest.

### P13. Thin, then deep

Build a thin end-to-end path through every part of the game before deepening any one part. Game feel is the biggest risk, so prove it first.

## Inspirations

Described by what they contribute.

- **Classic adaptive typing tutor:** a structured course from finger placement to full keyboard, with drills that adapt to each key's speed and accuracy.
- **Lane-based rhythm game:** notes travel down lanes toward a hit line; streaks, combo multipliers, and a power-up meter reward sustained accuracy.
- **Rhythm game with motion controls:** targets arrive color-coded by hand, with hazards you must not hit and obstacles to avoid; scoring rewards clean form, not just contact.
- **Arcade space shooter with formations:** enemy waves arrive in patterns, dive at the player, and culminate in boss stages.
- **Vertical-scrolling shooter with upgrades:** collected currency upgrades the ship, and each stage has medals for specific challenges (clear every enemy, take no damage, rescue everyone) that unlock harder versions of the stage.
- **Puzzle game with star ratings:** one star to progress, three stars for mastery, and a reason to replay.

## What success looks like

After about a month of daily play, a player:

- touch types the full keyboard, including capitals, punctuation, numbers, and editing keys, without looking;
- types at 95% accuracy or better;
- reaches roughly 20–25 words per minute;
- can keep improving to 50 WPM and beyond, because the game stays playable and replayable after the campaign.

## Not now

Out of scope until this document says otherwise:

- Accessibility modes (reduced motion, dyslexia-friendly fonts, colorblind palettes)
- Non-desktop devices and non-US-QWERTY layouts (non-desktop visitors see a warning)
- Teacher or parent dashboards
- Multiple player profiles in one browser
- Placement testing
- Voice-over and support for early readers

## Using this document

Before committing to a design or implementation decision, ask:

1. Which principles does this serve?
2. Which principles does it strain, and is that trade-off worth it?
3. Would a player notice a gap between "the game" and "the learning" here (P1)?
4. Could a player get stuck here with no path forward (P4)?
5. Is this building depth before the thin path exists (P13)?
