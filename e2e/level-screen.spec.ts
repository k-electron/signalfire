import { expect, test } from "./fixtures";

test("pauses and resumes mid-level with countdown", async ({ page }) => {
	await page.goto("/");
	await expect(page.getByRole("heading", { name: "Signalfire" })).toBeVisible();

	// Title -> Onboarding -> Hub -> Zone Map -> Level
	await page.keyboard.press("Space");
	await expect(page.getByRole("heading", { name: "Onboarding" })).toBeVisible();
	await page.keyboard.press("Space");
	await expect(page.getByRole("heading", { name: "Hub" })).toBeVisible();
	await page.keyboard.press("6");
	await expect(page.getByRole("heading", { name: "Zone map" })).toBeVisible();
	await page.keyboard.press("Space");

	// Briefing screen
	await expect(
		page.getByRole("heading", { name: "First Light" }),
	).toBeVisible();
	await expect(page.getByText("Space to launch")).toBeVisible();

	// Launch countdown
	await page.keyboard.press("Space");
	await expect(page.getByTestId("countdown-display")).toBeVisible();

	// Fast-forward countdown into playing state
	await page.clock.runFor(3500);
	await expect(page.getByTestId("level-hud")).toBeVisible();
	await expect(page.getByTestId("level-canvas-container")).toBeVisible();

	// Pause mid-level via Escape
	await page.keyboard.press("Escape");
	await expect(page.getByRole("heading", { name: "Pause" })).toBeVisible();
	await expect(page.getByRole("button", { name: /Resume/i })).toBeVisible();
	await expect(page.getByRole("button", { name: /Quit/i })).toBeVisible();

	// Resume from pause
	await page.getByRole("button", { name: /Resume/i }).click();

	// Countdown appears on resume
	await expect(page.getByTestId("countdown-display")).toBeVisible();

	// Fast-forward resume countdown back into playing
	await page.clock.runFor(3500);
	await expect(page.getByTestId("level-hud")).toBeVisible();
});

test("plays level 1.1 to results with stars", async ({ page }) => {
	test.setTimeout(180000);
	await page.goto("/");
	await expect(page.getByRole("heading", { name: "Signalfire" })).toBeVisible();

	// Navigate to Level 1.1
	await page.keyboard.press("Space");
	await expect(page.getByRole("heading", { name: "Onboarding" })).toBeVisible();
	await page.keyboard.press("Space");
	await expect(page.getByRole("heading", { name: "Hub" })).toBeVisible();
	await page.keyboard.press("6");
	await expect(page.getByRole("heading", { name: "Zone map" })).toBeVisible();
	await page.keyboard.press("Space");

	// Briefing
	await expect(
		page.getByRole("heading", { name: "First Light" }),
	).toBeVisible();
	await page.keyboard.press("Space");

	// Countdown to playing
	await page.clock.runFor(3500);
	await expect(page.getByTestId("level-hud")).toBeVisible();

	// Type correct characters to earn accuracy and score
	for (let i = 0; i < 3; i++) {
		await page.keyboard.press("f");
		await page.clock.runFor(200);
	}

	// Advance through remaining level duration to reach LevelEnded and finish
	await page.clock.runFor(75000);

	// Verify Results screen
	await expect(page.getByRole("heading", { name: "Results" })).toBeVisible();
	await expect(page.getByTestId("results-stars")).toBeVisible();
	await expect(page.getByTestId("results-stars")).toHaveText(/★/);
	await expect(page.getByTestId("results-score")).toBeVisible();
	await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
	await expect(page.getByRole("button", { name: "Hub" })).toBeVisible();

	// Continue navigates back to zone map
	await page.getByRole("button", { name: "Continue" }).click();
	await expect(page.getByRole("heading", { name: "Zone map" })).toBeVisible();
});
