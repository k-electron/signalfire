/** Harness smoke test. Proves end-to-end runs against the production build. Not game logic. */
import { expect, test } from "./fixtures";

const pausedAt = Date.parse("2026-01-01T00:00:01.000Z");
const steppedTo = Date.parse("2026-01-01T00:00:02.000Z");

test("harness smoke: production page shows Signalfire", async ({ page }) => {
	await page.goto("/");
	await expect(page.getByRole("heading", { name: "Signalfire" })).toBeVisible();
	await page.clock.pauseAt(new Date(pausedAt));
	await page.clock.runFor(1000);
	const now = await page.evaluate(() => Date.now());
	expect(now).toBe(steppedTo);
});
