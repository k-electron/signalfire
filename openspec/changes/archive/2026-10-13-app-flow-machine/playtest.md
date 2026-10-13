# Playtest

Dev server `http://127.0.0.1:5188/` (5173 and 5174 were already in use). Tokens printed before Vite was ready. Walk: Space, Space, 5, Escape.

- [x] Keystroke response feels immediate. Space opened onboarding, Space opened the hub, 5 opened settings, and Escape returned to the hub, with no visible delay.
- [x] The change matches vertical 11's screen map and keyboard controls on these placeholders: Space is the primary action, Escape is back, and number keys pick hub items. Arrows and the browser Back button are covered by the browser and end-to-end tests.
- [x] The active character is always the clearest thing on screen. N/A: no level and no active character.
- [x] No effect covers the active character or the next two characters. N/A: no level.
- [x] Frame rate stays smooth during peaks. N/A: no gameplay.
- [x] Errors are clear but not punishing. N/A in this walk. The browser test covers "Something went wrong." and Back.
- [x] Audio fits the zone and never clips. N/A: no audio.
- [x] Pausing, losing focus, and resuming work. N/A: pause is the level-lifecycle machine, not this skeleton.

Feel is unchanged. This checklist does not ask Karim to play it for feel.

Screenshots: `title.png`, `hub.png`, `settings.png`.
