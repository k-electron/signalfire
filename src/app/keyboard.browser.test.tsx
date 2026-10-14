import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { App } from "./app";
import "./theme/app.css";

test("Space works when focus is outside the shell", async () => {
	const container = document.createElement("div");
	document.body.append(container);
	const root = createRoot(container);
	root.render(<App />);
	await expect
		.element(page.getByRole("heading", { name: "Signalfire" }))
		.toBeVisible();
	(document.body as HTMLElement).focus();
	document.body.dispatchEvent(
		new KeyboardEvent("keydown", { key: " ", bubbles: true }),
	);
	await expect
		.element(page.getByRole("heading", { name: "Onboarding" }))
		.toBeVisible();
	root.unmount();
});

test("the selected hub item shows the focus ring", async () => {
	const container = document.createElement("div");
	document.body.append(container);
	const root = createRoot(container);
	root.render(<App firstRun={false} />);
	await expect
		.element(page.getByRole("heading", { name: "Signalfire" }))
		.toBeVisible();
	document.body.dispatchEvent(
		new KeyboardEvent("keydown", { key: " ", bubbles: true }),
	);
	await expect
		.element(page.getByRole("heading", { name: "Hub" }))
		.toBeVisible();
	const buttons = [...document.querySelectorAll("button")];
	const selected = buttons.filter((button) =>
		button.classList.contains("shadow-focus"),
	);
	expect(selected).toHaveLength(1);
	expect(selected[0]?.textContent).toBe("Galaxy map");
	const painted = getComputedStyle(selected[0] as HTMLElement).boxShadow;
	expect(painted).not.toBe("none");
	root.unmount();
});
