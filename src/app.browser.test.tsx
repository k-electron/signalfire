/** Harness smoke test. Proves the browser project runs. Not game logic. */
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { App } from "./app";

test("harness smoke: heading is visible", async () => {
	const container = document.createElement("div");
	document.body.append(container);
	const root = createRoot(container);
	root.render(<App />);
	await expect
		.element(page.getByRole("heading", { name: "Signalfire" }))
		.toBeVisible();
	root.unmount();
});
