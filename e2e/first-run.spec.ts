import { expect, test } from "./fixtures";

test.describe("First run and boot restore (Stage 2 walking skeleton)", () => {
	test("Flow 1: first run from title through onboarding, level 0.1, level 1.1 to results with stars and zone map", async ({
		page,
	}) => {
		await page.goto("/");

		// 1. Title screen
		await expect(
			page.getByRole("heading", { name: "Signalfire" }),
		).toBeVisible();
		await page.keyboard.press("Space");

		// 2. Onboarding: Call sign selection
		await expect(
			page.getByRole("heading", { name: "Onboarding" }),
		).toBeVisible();
		await expect(page.getByTestId("onboarding-step-call-sign")).toBeVisible();
		await page.keyboard.press("ArrowDown");
		await expect(
			page.getByRole("button", { name: /▶ Beacon Leader/ }),
		).toBeVisible();
		await page.keyboard.press("Space");

		// Posture check: 3 prompts
		await expect(page.getByTestId("onboarding-step-posture")).toBeVisible();
		await expect(page.getByText(/Sit tall/i)).toBeVisible();
		await page.keyboard.press("Space");
		await expect(page.getByText(/Wrists floating/i)).toBeVisible();
		await page.keyboard.press("Space");
		await expect(page.getByText(/Eyes on the screen/i)).toBeVisible();
		await page.keyboard.press("Space");

		// Find the beacons: F and J
		await expect(page.getByTestId("onboarding-step-beacons")).toBeVisible();
		await page.keyboard.press("f");
		await expect(page.getByTestId("beacon-f")).toHaveAttribute(
			"data-found",
			"true",
		);
		await page.keyboard.press("j");

		// 3. Level 0.1 (Twin Beacons) starts automatically
		await expect(page.getByRole("heading", { name: "Level" })).toBeVisible();

		// Launch level 0.1
		await page.keyboard.press("Space");
		await expect(page.getByTestId("in-level-hud")).toBeVisible({
			timeout: 6000,
		});

		// Advance level 0.1 through its duration to complete
		for (let i = 0; i < 220; i++) {
			await page.clock.fastForward(250);
		}

		// 4. Level 1.1 (First Light) briefing appears
		await expect(page.getByTestId("briefing-card")).toBeVisible({
			timeout: 6000,
		});
		await expect(
			page.getByRole("heading", { name: "First Light" }),
		).toBeVisible();

		// Launch level 1.1 with Space
		await page.keyboard.press("Space");
		await expect(page.getByTestId("in-level-hud")).toBeVisible({
			timeout: 6000,
		});

		// Play notes dynamically using active character to achieve 100% accuracy and > 6 WPM
		for (let i = 0; i < 40; i++) {
			const char = await page
				.getByTestId("in-level-hud")
				.getAttribute("data-active-char");
			const key =
				char && char.length > 0 ? (char === " " ? "Space" : char) : "f";
			await page.keyboard.press(key);
			await page.clock.fastForward(350);
		}

		// Advance remaining simulation through the end of level 1.1
		for (let i = 0; i < 160; i++) {
			await page.clock.fastForward(250);
		}

		// 5. Results screen
		await expect(page.getByRole("heading", { name: "Results" })).toBeVisible({
			timeout: 6000,
		});
		await expect(page.getByTestId("results-stars")).toBeVisible();

		// Continue to Zone Map
		await page.keyboard.press("Space");

		// 6. Zone map showing earned stars
		await expect(page.getByRole("heading", { name: "Zone map" })).toBeVisible();
		await expect(page.getByText("First Light")).toBeVisible();
		await expect(page.getByTestId("node-stars-level:1.1")).toContainText("★");
	});

	test("Flow 2: reload restores saved progress and skips onboarding directly to hub", async ({
		page,
	}) => {
		// Complete onboarding and level 1.1 first to establish saved state
		await page.goto("/");
		await expect(
			page.getByRole("heading", { name: "Signalfire" }),
		).toBeVisible();
		await page.keyboard.press("Space");

		// Onboarding
		await expect(
			page.getByRole("heading", { name: "Onboarding" }),
		).toBeVisible();
		await page.keyboard.press("Space"); // call sign
		await page.keyboard.press("Space"); // posture 1
		await page.keyboard.press("Space"); // posture 2
		await page.keyboard.press("Space"); // posture 3
		await page.keyboard.press("f");
		await page.keyboard.press("j");

		// Level 0.1
		await expect(page.getByRole("heading", { name: "Level" })).toBeVisible();
		await page.keyboard.press("Space");
		await expect(page.getByTestId("in-level-hud")).toBeVisible({
			timeout: 6000,
		});
		for (let i = 0; i < 220; i++) {
			await page.clock.fastForward(250);
		}

		// Level 1.1
		await expect(page.getByTestId("briefing-card")).toBeVisible({
			timeout: 6000,
		});
		await page.keyboard.press("Space");
		await expect(page.getByTestId("in-level-hud")).toBeVisible({
			timeout: 6000,
		});
		// Play notes dynamically using active character to achieve 100% accuracy and > 6 WPM
		for (let i = 0; i < 40; i++) {
			const char = await page
				.getByTestId("in-level-hud")
				.getAttribute("data-active-char");
			const key =
				char && char.length > 0 ? (char === " " ? "Space" : char) : "f";
			await page.keyboard.press(key);
			await page.clock.fastForward(350);
		}
		for (let i = 0; i < 160; i++) {
			await page.clock.fastForward(250);
		}

		// Results -> Zone map
		await expect(page.getByRole("heading", { name: "Results" })).toBeVisible({
			timeout: 6000,
		});
		await page.keyboard.press("Space");
		await expect(page.getByRole("heading", { name: "Zone map" })).toBeVisible();

		// RELOAD the page
		await page.reload();

		// Restored Title screen
		await expect(
			page.getByRole("heading", { name: "Signalfire" }),
		).toBeVisible();

		// Space on Title skips onboarding and opens Hub for returning player
		await page.keyboard.press("Space");
		await expect(page.getByRole("heading", { name: "Hub" })).toBeVisible();

		// Open Zone Map from Hub (via Galaxy map or Space navigation)
		await page.keyboard.press("Space"); // opens Galaxy map
		await expect(
			page.getByRole("heading", { name: "Galaxy map" }),
		).toBeVisible();
		await page.keyboard.press("Space"); // opens Zone map
		await expect(page.getByRole("heading", { name: "Zone map" })).toBeVisible();
		await expect(page.getByTestId("node-stars-level:1.1")).toContainText("★");
	});
});
