import { createRoot } from "react-dom/client";
import { afterEach, expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { Level } from "./level";
import { Results } from "./results";
import "../theme/app.css";

afterEach(() => {
	document.body.replaceChildren();
});

test("briefing card displays level title, star bars, and launches countdown on Space", async () => {
	const container = document.createElement("div");
	document.body.appendChild(container);
	const root = createRoot(container);
	root.render(
		<Level levelId="level:1.1" seed="signalfire" countdownIntervalMs={50} />,
	);

	await expect
		.element(page.getByRole("heading", { name: "First Light" }))
		.toBeVisible();
	await expect.element(page.getByText("Space to launch")).toBeVisible();
	await expect.element(page.getByText(/Star Bars/i)).toBeVisible();

	// Press Space to advance to countdown
	window.dispatchEvent(
		new KeyboardEvent("keydown", {
			key: " ",
			code: "Space",
			bubbles: true,
			cancelable: true,
		}),
	);

	await expect.element(page.getByTestId("countdown-display")).toBeVisible();

	root.unmount();
});

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
			skipBriefing={true}
			skipCountdown={true}
		/>,
	);

	await expect
		.element(page.getByTestId("level-canvas-container"))
		.toBeVisible();

	// Verify canvas exists inside the container
	await expect.poll(() => container.querySelector("canvas")).toBeTruthy();

	// Verify HUD has Integrity and Velocity
	await expect.element(page.getByText(/Integrity:/i)).toBeVisible();
	await expect.element(page.getByText(/Velocity:/i)).toBeVisible();

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
	// Shipped level 1.1 with seed 'signalfire' starts with arrival unit 'fff'.
	// First character is 'f'.
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

	root.unmount();
	document.body.style.minHeight = "";
});

test("Escape key and window blur pause playing level, and Resume restarts countdown", async () => {
	const container = document.createElement("div");
	document.body.appendChild(container);
	const root = createRoot(container);
	root.render(
		<Level
			levelId="level:1.1"
			seed="signalfire"
			skipBriefing={true}
			countdownIntervalMs={50}
		/>,
	);

	await expect
		.element(page.getByTestId("level-canvas-container"))
		.toBeVisible();

	// Wait for initial countdown to complete and enter playing state
	await expect
		.element(page.getByTestId("countdown-display"))
		.not.toBeInTheDocument();

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
		.element(page.getByRole("heading", { name: "Pause" }))
		.toBeVisible();
	await expect
		.element(page.getByRole("button", { name: /Resume/i }))
		.toBeVisible();
	await expect
		.element(page.getByRole("button", { name: /Quit/i }))
		.toBeVisible();

	// Click Resume
	const resumeBtn = page.getByRole("button", { name: /Resume/i });
	await resumeBtn.click();

	// Countdown appears on resume
	await expect.element(page.getByTestId("countdown-display")).toBeVisible();

	root.unmount();
});

test("Quit from pause overlay triggers onQuit", async () => {
	const onQuit = vi.fn();
	const container = document.createElement("div");
	document.body.appendChild(container);
	const root = createRoot(container);
	root.render(
		<Level
			levelId="level:1.1"
			seed="signalfire"
			skipBriefing={true}
			skipCountdown={true}
			onQuit={onQuit}
		/>,
	);

	await expect
		.element(page.getByTestId("level-canvas-container"))
		.toBeVisible();

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
		.element(page.getByRole("heading", { name: "Pause" }))
		.toBeVisible();

	const quitBtn = page.getByRole("button", { name: /Quit/i });
	await quitBtn.click();
	expect(onQuit).toHaveBeenCalledTimes(1);

	root.unmount();
});

test("Results screen displays stars, score, velocity, and missed bar", async () => {
	const onContinue = vi.fn();
	const onToHub = vi.fn();
	const container = document.createElement("div");
	document.body.appendChild(container);
	const root = createRoot(container);
	root.render(
		<Results
			stars={2}
			score={500}
			accuracy={0.95}
			netWpm={15}
			missedMessage="Integrity 95%, needed 98%"
			onContinue={onContinue}
			onToHub={onToHub}
		/>,
	);

	await expect
		.element(page.getByRole("heading", { name: "Results" }))
		.toBeVisible();
	await expect.element(page.getByTestId("results-stars")).toBeVisible();
	await expect
		.element(page.getByTestId("results-score"))
		.toHaveTextContent("Score: 500");
	await expect
		.element(page.getByTestId("results-integrity"))
		.toHaveTextContent("Integrity: 95%");
	await expect
		.element(page.getByTestId("results-velocity"))
		.toHaveTextContent("Velocity: 15 WPM");
	await expect
		.element(page.getByTestId("missed-bar-message"))
		.toHaveTextContent("Integrity 95%, needed 98%");

	const continueBtn = page.getByRole("button", { name: "Continue" });
	await continueBtn.click();
	expect(onContinue).toHaveBeenCalledTimes(1);

	const hubBtn = page.getByRole("button", { name: "Hub" });
	await hubBtn.click();
	expect(onToHub).toHaveBeenCalledTimes(1);

	root.unmount();
});
