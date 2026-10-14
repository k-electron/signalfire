# Tasks

## 1. Dependencies Setup

- [ ] 1.1 Add `pixi.js` and `zustand` to `package.json` dependencies and verify `pnpm check` layer boundary check passes.

## 2. Keyboard Input Capture

- [ ] 2.1 Write failing unit tests in `src/engine/input/keyboard.test.ts` covering repeat key suppression, dead/IME ignoring, Shift side extraction from `event.code`, step translation from timestamp, and `preventDefault` calls for game keys.
- [ ] 2.2 Implement DOM keyboard capture in `src/engine/input/keyboard.ts` and verify all keyboard unit tests pass.

## 3. Throttled HUD Bridge

- [ ] 3.1 Write failing unit tests in `src/engine/bridge/hud-bridge.test.ts` verifying HUD snapshots are throttled to at most once per 50 ms (20 Hz).
- [ ] 3.2 Implement `src/engine/bridge/hud-bridge.ts` and the HUD store in `src/app/stores/hud.ts`, and verify all bridge unit tests pass.

## 4. PixiJS Canvas RenderOut Adapter

- [ ] 4.1 Write failing tests in `src/engine/render/pixi-render.browser.test.tsx` verifying nine colored placeholder lanes, hit line positioning, active note highlight, and reaction to `Hit` and `Error` domain events.
- [ ] 4.2 Implement `src/engine/render/pixi-render.ts` with pooled note display objects and zero per-frame allocations, and verify all render tests pass.

## 5. Level Screen Integration

- [ ] 5.1 Mount canvas, initialize engine loop, keyboard listener, render adapter, and HUD bridge in `src/app/screens/level.tsx` with clean teardown on unmount.
- [ ] 5.2 Add browser test in `src/app/screens/level.browser.test.tsx` verifying typing into a running level scores hits and errors on the correct notes and Space does not scroll the page.
- [ ] 5.3 Complete the visual and feel playtest checklist from `docs/horizontals/08-testing-and-dev-practices.md` and attach evidence.

## 6. Verification and Review

- [ ] 6.1 Run `pnpm check` and verify typecheck, lint, content check, tests, and build all pass cleanly.
- [ ] 6.2 Perform independent fresh-context verification of the full diff against constitution principles C1–C10 and OpenSpec specs.
