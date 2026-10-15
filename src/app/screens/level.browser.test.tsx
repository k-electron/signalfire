import { createRoot } from "react-dom/client";
import { describe, expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { Level } from "./level";
import { Results } from "./results";
import "../theme/app.css";

describe("Level screen", () => {
	test("typing into a running level scores hits and errors, and Space does not scroll", async () => {
		document.body.style.minHeight = "2000px";
		window.scrollTo(0, 0);

		const container = document.createElement("div");
		document.body.appendChild(container);
		const root = createRoot(container);
		root.render(
			<Level
				levelId="level:1.1"
				seed="signalfire"
				skipBriefing
				countdownIntervalMs={10}
			/>,
		);

		await expect
			.element(page.getByRole("heading", { name: "Level" }))
			.toBeVisible();
		await expect
			.element(page.getByTestId("level-canvas-container"))
			.toBeVisible();
		await expect.element(page.getByTestId("in-level-hud")).toBeVisible();

		// Wait until gameplay starts
		await expect
			.element(page.getByTestId("level-screen"))
			.toHaveAttribute("data-state", "playing");

		// Verify canvas exists inside the container
		await expect.poll(() => container.querySelector("canvas")).toBeTruthy();

		// 1. Verify Space, Tab, and Backspace do not trigger browser actions
		const spaceEvent = new KeyboardEvent("keydown", {
			key: " ",
			code: "Space",
			bubbles: true,
			cancelable: true,
		});
		window.dispatchEvent(spaceEvent);
		expect(spaceEvent.defaultPrevented).toBe(true);
		expect(window.scrollY).toBe(0);

		const tabEvent = new KeyboardEvent("keydown", {
			key: "Tab",
			code: "Tab",
			bubbles: true,
			cancelable: true,
		});
		window.dispatchEvent(tabEvent);
		expect(tabEvent.defaultPrevented).toBe(true);

		const backspaceEvent = new KeyboardEvent("keydown", {
			key: "Backspace",
			code: "Backspace",
			bubbles: true,
			cancelable: true,
		});
		window.dispatchEvent(backspaceEvent);
		expect(backspaceEvent.defaultPrevented).toBe(true);

		// 2. Typing into running level:
		// First character of Level 1.1 with seed 'signalfire' is 'f'.
		window.dispatchEvent(
			new KeyboardEvent("keydown", {
				key: "f",
				code: "KeyF",
				bubbles: true,
				cancelable: true,
			}),
		);

		// Hit on 'f': Score becomes 10, combo becomes 1
		await expect.element(page.getByText("Score: 10")).toBeVisible();
		await expect.element(page.getByText("Combo: 1")).toBeVisible();

		// Wrong key 'j' against 'f' causes an Error: combo resets to 0
		window.dispatchEvent(
			new KeyboardEvent("keydown", {
				key: "j",
				code: "KeyJ",
				bubbles: true,
				cancelable: true,
			}),
		);

		await expect.element(page.getByText("Combo: 0")).toBeVisible();
		await expect.element(page.getByText("Score: 10")).toBeVisible();

		// Next correct key 'f' hits: Score becomes 20, combo becomes 1
		window.dispatchEvent(
			new KeyboardEvent("keydown", {
				key: "f",
				code: "KeyF",
				bubbles: true,
				cancelable: true,
			}),
		);

		await expect.element(page.getByText("Score: 20")).toBeVisible();
		await expect.element(page.getByText("Combo: 1")).toBeVisible();

		// Third 'f' hits: Score becomes 30, combo becomes 2
		window.dispatchEvent(
			new KeyboardEvent("keydown", {
				key: "f",
				code: "KeyF",
				bubbles: true,
				cancelable: true,
			}),
		);

		await expect.element(page.getByText("Score: 30")).toBeVisible();
		await expect.element(page.getByText("Combo: 2")).toBeVisible();

		root.unmount();
		container.remove();
		document.body.style.minHeight = "";
	});

	test("briefing card displays details and Space launches countdown", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);
		const root = createRoot(container);

		root.render(
			<Level levelId="level:1.1" seed="signalfire" countdownIntervalMs={500} />,
		);

		// Briefing card should be visible with title, character line, star bars
		await expect.element(page.getByTestId("briefing-card")).toBeVisible();
		await expect
			.element(page.getByRole("heading", { name: "First Light" }))
			.toBeVisible();
		await expect.element(page.getByText("Focus Keys:")).toBeVisible();
		await expect.element(page.getByText("F, J")).toBeVisible();
		await expect.element(page.getByText("★ 1 Star Bar:")).toBeVisible();

		// Press Space to launch countdown
		window.dispatchEvent(
			new KeyboardEvent("keydown", {
				key: " ",
				code: "Space",
				bubbles: true,
				cancelable: true,
			}),
		);

		// Countdown overlay appears
		await expect.element(page.getByTestId("countdown-overlay")).toBeVisible();

		root.unmount();
		container.remove();
	});

	test("pause overlay opens on Escape, blur pauses, and Resume returns with countdown", async () => {
		const onExit = vi.fn();
		const container = document.createElement("div");
		document.body.appendChild(container);
		const root = createRoot(container);

		root.render(
			<Level
				levelId="level:1.1"
				seed="signalfire"
				skipBriefing
				countdownIntervalMs={10}
				onExit={onExit}
			/>,
		);

		// Wait until gameplay starts
		await expect
			.element(page.getByTestId("level-screen"))
			.toHaveAttribute("data-state", "playing");

		// Press Escape to pause
		window.dispatchEvent(
			new KeyboardEvent("keydown", {
				key: "Escape",
				code: "Escape",
				bubbles: true,
				cancelable: true,
			}),
		);

		await expect
			.element(page.getByTestId("level-screen"))
			.toHaveAttribute("data-state", "paused");
		await expect
			.element(page.getByRole("heading", { name: "Pause" }))
			.toBeVisible();
		await expect
			.element(page.getByRole("button", { name: /Resume/ }))
			.toBeVisible();
		await expect
			.element(page.getByRole("button", { name: /Quit/ }))
			.toBeVisible();

		// Resume button clicks and enters countdown
		await page.getByRole("button", { name: /Resume/ }).click();
		await expect
			.element(page.getByTestId("level-screen"))
			.toHaveAttribute("data-state", "countdown");

		// Wait for countdown to finish and gameplay to resume
		await expect
			.element(page.getByTestId("level-screen"))
			.toHaveAttribute("data-state", "playing");

		// Trigger window blur event
		window.dispatchEvent(new Event("blur"));
		await expect
			.element(page.getByTestId("level-screen"))
			.toHaveAttribute("data-state", "paused");

		// Click Quit
		await page.getByRole("button", { name: /Quit/ }).click();
		expect(onExit).toHaveBeenCalled();

		root.unmount();
		container.remove();
	});

	test("results screen presents 0 stars and missed bar shortfall when bars are missed", async () => {
		const onContinue = vi.fn();
		const container = document.createElement("div");
		document.body.appendChild(container);
		const root = createRoot(container);

		root.render(
			<Results
				stars={0}
				score={150}
				integrity={0.85}
				velocity={5}
				missed={[
					{
						kind: "integrity",
						measuredPercent: 85,
						neededPercent: 92,
						shortfallPercent: 7,
					},
					{
						kind: "velocity",
						measuredWpm: 5,
						neededWpm: 6,
						shortfallWpm: 1,
					},
				]}
				onContinue={onContinue}
			/>,
		);

		await expect.element(page.getByTestId("results-screen")).toBeVisible();
		await expect
			.element(page.getByRole("heading", { name: "Results" }))
			.toBeVisible();
		await expect.element(page.getByText("☆☆☆ (0 Stars)")).toBeVisible();
		await expect.element(page.getByText("Score: 150")).toBeVisible();
		await expect.element(page.getByText("Integrity: 85%")).toBeVisible();
		await expect.element(page.getByText("Velocity: 5 WPM")).toBeVisible();

		// Missed bar guidance
		await expect.element(page.getByTestId("missed-integrity")).toBeVisible();
		await expect
			.element(page.getByText("Integrity 85%, needed 92%"))
			.toBeVisible();
		await expect.element(page.getByTestId("missed-velocity")).toBeVisible();
		await expect
			.element(page.getByText("Velocity 5 WPM, needed 6 WPM"))
			.toBeVisible();

		// Continue button
		await page.getByRole("button", { name: "Continue" }).click();
		expect(onContinue).toHaveBeenCalled();

		root.unmount();
		container.remove();
	});

	test("results screen presents 1 star without shortfall when bars are met", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);
		const root = createRoot(container);

		root.render(
			<Results
				stars={1}
				score={420}
				integrity={0.93}
				velocity={8.5}
				missed={[]}
			/>,
		);

		await expect.element(page.getByTestId("results-screen")).toBeVisible();
		await expect.element(page.getByText("★☆☆ (1 Star)")).toBeVisible();
		await expect.element(page.getByText("Score: 420")).toBeVisible();
		await expect
			.element(page.getByTestId("missed-bars-report"))
			.not.toBeInTheDocument();

		root.unmount();
		container.remove();
	});

	test("an invalid levelId enters error state and displays error message", async () => {
		const onExit = vi.fn();
		const container = document.createElement("div");
		document.body.appendChild(container);
		const root = createRoot(container);

		root.render(<Level levelId="invalid:level" onExit={onExit} />);

		await expect
			.element(page.getByRole("heading", { name: "Error" }))
			.toBeVisible();
		await expect
			.element(page.getByText("Failed to load level content or configuration"))
			.toBeVisible();

		await page.getByRole("button", { name: "Return to zone map" }).click();
		expect(onExit).toHaveBeenCalled();

		root.unmount();
		container.remove();
	});
});
