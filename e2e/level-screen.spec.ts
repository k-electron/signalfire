import { expect, seedProfile, test } from "./fixtures";

test.describe("Level screen lifecycle", () => {
	test("plays level 1.1 from briefing through countdown to results with stars", async ({
		page,
	}) => {
		await seedProfile(page);
		await page.goto("/");
		await expect(
			page.getByRole("heading", { name: "Signalfire" }),
		).toBeVisible();

		// Flow to Level: Title -> Hub -> Galaxy map -> Zone map -> Level
		await page.keyboard.press("Space");
		await expect(page.getByRole("heading", { name: "Hub" })).toBeVisible();

		await page.keyboard.press("Space");
		await expect(
			page.getByRole("heading", { name: "Galaxy map" }),
		).toBeVisible();

		await page.keyboard.press("Space");
		await expect(page.getByRole("heading", { name: "Zone map" })).toBeVisible();

		await page.keyboard.press("Space");
		await expect(page.getByRole("heading", { name: "Level" })).toBeVisible();

		// 1. Briefing card verification
		await expect(page.getByTestId("briefing-card")).toBeVisible();
		await expect(
			page.getByRole("heading", { name: "First Light" }),
		).toBeVisible();
		await expect(page.getByText("Focus Keys:")).toBeVisible();
		await expect(page.getByText("F, J")).toBeVisible();
		await expect(page.getByText("★ 1 Star Bar:")).toBeVisible();
		await expect(page.getByRole("button", { name: /Launch/ })).toBeVisible();

		// 2. Launch countdown with Space
		await page.keyboard.press("Space");
		await expect(page.getByTestId("countdown-overlay")).toBeVisible();

		// 3. Countdown finishes and gameplay starts
		await expect(page.getByTestId("countdown-overlay")).not.toBeVisible({
			timeout: 5000,
		});
		await expect(page.getByTestId("in-level-hud")).toBeVisible();
		await expect(page.getByTestId("hud-score")).toContainText("0");
		await expect(page.getByTestId("hud-combo")).toContainText("0");

		// Type initial notes to verify live HUD interaction and build stars metrics
		await page.keyboard.press("f");
		await expect(page.getByTestId("hud-score")).toContainText("10");
		await expect(page.getByTestId("hud-combo")).toContainText("1");

		await page.keyboard.press("f");
		await page.keyboard.press("f");
		await expect(page.getByTestId("hud-score")).toContainText("30");
		await expect(page.getByTestId("hud-combo")).toContainText("3");

		// Advance simulation naturally to the end of the level (6000 steps)
		for (let i = 0; i < 200; i++) {
			await page.clock.fastForward(250);
		}

		// 4. Results screen verification
		await expect(page.getByRole("heading", { name: "Results" })).toBeVisible();
		await expect(page.getByTestId("results-stars")).toBeVisible();
		await expect(page.getByTestId("results-score")).toBeVisible();
		await expect(page.getByTestId("results-integrity")).toBeVisible();
		await expect(page.getByTestId("results-velocity")).toBeVisible();

		// 5. Continue returns to Zone map
		await page.getByRole("button", { name: "Continue" }).click();
		await expect(page.getByRole("heading", { name: "Zone map" })).toBeVisible();
	});

	test("pauses mid-level on Escape, verifies pause overlay, and resumes through countdown", async ({
		page,
	}) => {
		await seedProfile(page);
		await page.goto("/");
		await expect(
			page.getByRole("heading", { name: "Signalfire" }),
		).toBeVisible();

		// Flow to Level: Title -> Hub -> Galaxy map -> Zone map -> Level
		await page.keyboard.press("Space");
		await expect(page.getByRole("heading", { name: "Hub" })).toBeVisible();

		await page.keyboard.press("Space");
		await expect(
			page.getByRole("heading", { name: "Galaxy map" }),
		).toBeVisible();

		await page.keyboard.press("Space");
		await expect(page.getByRole("heading", { name: "Zone map" })).toBeVisible();

		await page.keyboard.press("Space");
		await expect(page.getByRole("heading", { name: "Level" })).toBeVisible();

		// Launch countdown from briefing
		await page.getByTestId("launch-button").click();
		await expect(page.getByTestId("countdown-overlay")).toBeVisible();

		// Wait for gameplay to begin
		await expect(page.getByTestId("countdown-overlay")).not.toBeVisible({
			timeout: 5000,
		});
		await expect(page.getByTestId("in-level-hud")).toBeVisible();

		// 1. Pause on Escape
		await page.keyboard.press("Escape");
		await expect(page.getByTestId("pause-overlay")).toBeVisible();
		await expect(page.getByRole("heading", { name: "Pause" })).toBeVisible();
		await expect(page.getByRole("button", { name: /Resume/ })).toBeVisible();
		await expect(page.getByRole("button", { name: /Quit/ })).toBeVisible();

		// 2. Resume through countdown
		await page.getByRole("button", { name: /Resume/ }).click();
		await expect(page.getByTestId("countdown-overlay")).toBeVisible();

		// Wait for gameplay resumption
		await expect(page.getByTestId("countdown-overlay")).not.toBeVisible({
			timeout: 5000,
		});
		await expect(page.getByTestId("in-level-hud")).toBeVisible();

		// 3. Pause again and Quit to zone map
		await page.keyboard.press("Escape");
		await expect(page.getByTestId("pause-overlay")).toBeVisible();
		await page.getByRole("button", { name: /Quit/ }).click();
		await expect(page.getByRole("heading", { name: "Zone map" })).toBeVisible();
	});
});
