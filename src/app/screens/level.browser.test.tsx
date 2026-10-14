import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { Level } from "./level";
import "../theme/app.css";

test("typing into a running level scores hits and errors, and Space does not scroll", async () => {
	// Ensure document body is tall enough to test scrolling
	document.body.style.minHeight = "2000px";
	window.scrollTo(0, 0);

	const container = document.createElement("div");
	document.body.appendChild(container);
	const root = createRoot(container);
	root.render(<Level levelId="level:1.1" seed="signalfire" />);

	await expect
		.element(page.getByRole("heading", { name: "Level" }))
		.toBeVisible();
	await expect
		.element(page.getByTestId("level-canvas-container"))
		.toBeVisible();

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
