# Vertical 11: UI/UX and Onboarding

The screens, flows, and first-time experience that wrap the gameplay.

## Principles

- **Keyboard first.** Everything can be done from the keyboard, since the player's hands are already there. The mouse also works everywhere.
- **Two steps to play.** From opening the game to typing in a level takes at most two actions.
- **Space is go.** Space is the primary action on every screen (the thumb is always home). Escape is back. Arrow keys move. Number keys pick menu items.
- **Show, don't explain.** Mechanics are taught by doing, with one-line prompts. No walls of text.
- **Short and skippable.** Every scene, reveal, and celebration can be skipped with any key.

## Screen map

```
Boot ──▶ Title ──▶ (first run) Onboarding ──▶ Hub
                                              │
        ┌──────────┬──────────┬─────────┬─────┼──────────┬──────────┐
        ▼          ▼          ▼         ▼     ▼          ▼          ▼
   Galaxy map   Dossier    Hangar   Dispatches Codex   Settings   Account
        │
        ▼
    Zone map ──▶ Briefing ──▶ Level (HUD) ──▶ Results ──▶ Zone map / next level
        │                         │
        ▼                         ▼
   Gate screen                  Pause
```

Modal moments that can appear over the hub: systems check offer, daily goal complete, Keyling rescued, mod earned, rank up.

## Screens

### Title

- Game logo over a slowly drifting starfield.
- "Press Space to start."
- Small sync status in a corner ("Saved on this device" or "Synced").

### Hub (Home Row Station)

The home screen. The station is the centerpiece and visibly grows with progress.

| Area | Content |
|---|---|
| Center | The station, with the player's current machine docked |
| Left panel | **Today's flight plan** (3–5 suggested items); the top item is pre-selected so Space starts it |
| Right panel | Dash with a one-line message; dispatches with progress |
| Bottom bar | Galaxy map, Dossier, Hangar, Codex, Settings (numbered 1–5) |
| Top bar | Call sign, rank, total stars, sync status |

### Galaxy map

- All ten sectors arranged along a curving path from Home Row Station to the Silent Core.
- Cleared sectors in full color, current sector glowing, locked sectors gray behind Static barriers.
- Arrow keys move between sectors; Space opens the zone map.

### Zone map

- The zone's level nodes along a path (see Level Design), with side, repair, and codex nodes branching off.
- Each node shows stars earned, medals earned, and tier unlocked.
- The current node is pre-selected.
- The barrier at the end shows stars held and needed.

### Briefing

A single card over the zone map, shown for about two seconds or until a key is pressed:

- Level name and one-line briefing from a character.
- New keys highlighted on a small keyboard (only the current machine's keys).
- The three medals and the star bars.
- "Space to launch."

### In-level HUD

Layout for lane levels:

```
┌────────────────────────────────────────────────────────────┐
│ ×4 SIGNAL LOCK          ◯ Integrity  ◯ Velocity    12,450   │
│                                                             │
│                     (lanes and notes)                       │
│                                                             │
│ ───────────────────────── hit line ──────────────────────── │
│           [ machine console: current keys only ]            │
│ ▓▓▓▓▓▓▓▓▓░░░░░░ OVERDRIVE                  shield ▓▓▓▓▓░    │
└────────────────────────────────────────────────────────────┘
```

Shooter levels move the console under the ship and keep the same top bar.

- **Top-left:** Signal lock tier and multiplier.
- **Top-center:** Integrity and Velocity rings with star notches.
- **Top-right:** score.
- **Bottom:** Overdrive meter and shield.
- **Nothing else.** Pause is Escape; no on-screen buttons during play.

### Pause

Opens on Escape or when the window loses focus.

1. Resume (Space, with a 3-2-1 countdown)
2. Restart
3. Calm mode (when unlocked)
4. Settings
5. Quit to zone map

### Results

Covered in Scoring and Progression. Layout: stars and rings at the top, medals in the middle, "what changed" below, and three actions at the bottom (Continue pre-selected).

### Gate screen

- The barrier as a large, cracking wall.
- Stars held vs. needed.
- The three nearest stars from the adaptive engine, each launchable directly.

### Pilot dossier

Covered in Telemetry. Tabs: Overview, Keyboard, Fingers, Progress, Flow, Bests, Journey.

### Hangar

- Every machine flown, with its story.
- Earned mods on the current machine; locked mods show how to earn them.
- Cosmetics: ship paints, trails, Dash accessories, hub decorations.

### Codex

Story entries grouped by Sectors, Characters, Keylings, Wardens, and Machines. Locked entries show a silhouette and where they unlock.

### Settings

| Section | Options |
|---|---|
| Audio | Master, music, effects, voices |
| Visuals | Effects intensity (low, medium, high) for performance |
| Typing | Preferred thumb for Space (guidance only); keyboard check (type a test line to confirm a US layout) |
| Account | Sign in or out, sync status, last synced time |
| Data | Download my data, delete my data, export bug report, anonymous usage counts on/off |
| About | Credits and attributions |

### Account and sync

- Signing in is optional and offered from Settings and once after the first gate is broken ("Want to keep your progress safe across devices?").
- When signed in, cloud progress is loaded at start and saved at checkpoints.
- If this device has local progress and the account already has cloud progress, the cloud copy is used. The player is told before it happens: "Your account already has progress (Zone 4, 52 stars). It will replace this device's progress (Zone 2, 18 stars)." with options to continue or cancel sign-in.
- If the account has no cloud progress, local progress is uploaded.
- Sync status always visible in the top bar: "Saved on this device," "Synced 2 min ago," "Sync paused (offline)."

### Desktop warning

Shown when the browser looks like a phone or tablet:

> **Signalfire is built for a physical keyboard.**
> It's designed for desktop and laptop computers with a US QWERTY keyboard. You can continue, but it may not work well here.
>
> [Continue anyway]

## Onboarding: the first five minutes

| Time | What happens |
|---|---|
| 0:00 | Title screen. "Press Space to start." The first keystroke unlocks audio. |
| 0:05 | Short arrival scene: the cadet's shuttle docks at Home Row Station. Commander Okafor: "Welcome to Home Row, cadet." Any key skips. |
| 0:20 | **Call sign:** choose from a generated list (arrow keys, Space to pick), with an option to type a custom one later in Settings. |
| 0:35 | **Posture check:** three animated prompts, each confirmed with Space: sit tall, wrists floating, eyes on the screen. |
| 0:55 | **Find the beacons:** "Rest your fingers on the keys. Feel the two raised bumps? Those are your beacons." The F and J lanes glow. The player presses F, then J. |
| 1:15 | Dash boots up. Glitching, delighted: "dash! dash! ah! dash glad." |
| 1:30 | **Level 0.1 Twin Beacons** begins. Waiting lanes: F, J, Space. No fail state. |
| 2:45 | Level 0.1 complete. The hangar door opens. |
| 3:00 | **Level 0.2 Eight Docks:** each finger presses its home key; the station's arms light up one by one. |
| 4:15 | Station fully lit. The Skiff is rolled out. Pim: "She's small, but she's yours." |
| 4:30 | **Level 1.1 First Light** briefing; Space to launch. First real level, first stars. |

Rules for onboarding:

- No menus until after the first level of Zone 1.
- Each new UI element (map, dossier, hangar) is introduced the first time it becomes useful, with one line from a character and a glow on the element.

## Feature introduction schedule

| Feature | Introduced |
|---|---|
| Stars and results | After 1.1 |
| Zone map | After 1.1 |
| Medals | After 1.2 |
| Repair runs | First time a weak key is detected (usually Zone 1) |
| Dossier | After 1.5 |
| Gate screen and barrier | Zone 1 boss |
| Account sign-in offer | After the first gate |
| Dispatches | Day 2 |
| Hangar and mods | First mod earned |
| Difficulty tiers | First time all three medals are earned on a level |
| Codex | First codex entry unlocked |
| Systems check | First return after 3+ days |

## Session flow

- **Opening:** hub with today's flight plan; the top item is ready to launch with Space.
- **During:** after each level, Continue goes to the next plan item.
- **Daily goal complete:** a short card. Dash: "Great flying today. See you tomorrow?" Shows tomorrow's first item. Options: keep playing or close. Play is never blocked.

## Copy and tone

- Short sentences, plain words.
- Characters speak in their own voices; system text is neutral and friendly.
- Mistakes are described with what to try, never with judgment.

| Situation | Example |
|---|---|
| Missed 1 star | "So close: 91% Integrity, needed 92%. Most misses were on G." |
| New best | "New best on Middle Reach: 14 WPM!" |
| Sync failed | "Couldn't sync just now. Your progress is safe on this device; we'll try again." |
| Returning after a break | "Welcome back, cadet. Want a quick systems check to warm up?" |

## Notifications

Non-blocking toasts in the hub, one at a time, auto-dismiss after 4 seconds:

- Keyling rescued or brightened
- Mod earned
- Rank up (this one is a short full-screen moment instead)
- Dispatch complete

## Screen and window

- Desktop only. Minimum supported window 1280 × 720; scales up cleanly to 4K.
- Resizing the window mid-level pauses the game.
- Full-screen toggle in Settings.

## Open questions

- Should mouse use in menus be discouraged to build keyboard habits, or left fully equal?
