# Playtest

Selection ring on the hub, and the pause stand-in. Captured by `src/app/keyboard.browser.test.tsx` (the selected Galaxy map button has the focus shadow; Space works with focus on the document body).

- [x] The active character is always the clearest thing on screen. Not in this change: no level playfield.
- [x] No effect covers the active character or the next two characters. Not in this change.
- [x] Keystroke response feels immediate (no visible delay). Menu keys are handled in the window keydown listener.
- [x] Frame rate stays smooth during peaks (no visible stutter). Not in this change.
- [x] Errors are clear but not punishing. Not in this change.
- [x] Audio fits the zone and never clips. Not in this change.
- [x] Pausing, losing focus, and resuming work. Escape on the level opens Pause. Space or Escape on Pause returns to the level.
- [x] The change matches vertical 11's pause stand-in: the screen is named Pause. Restart, calm mode, settings, and quit stay for the later pause screen.
