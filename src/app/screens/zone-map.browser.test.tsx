import { createRoot } from "react-dom/client";
import { describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import type { ProgressDocument } from "../../core/scoring/record-run";
import "../theme/app.css";
import { ZoneMap } from "./zone-map";

describe("ZoneMap component", () => {
	test("displays Zone 1 and level 1.1 node with earned stars", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);
		const root = createRoot(container);

		const progress: ProgressDocument = {
			v: 1,
			updatedAt: "2026-10-15T12:00:00.000Z",
			rev: 1,
			levels: {
				"level:1.1": {
					cadet: {
						stars: 1,
						medals: [],
						bestScore: 300,
						bestAccuracy: 0.94,
						bestNetWpm: 8,
						attempts: 1,
						failedSinceLastStar: 0,
						calmUnlocked: false,
					},
				},
			},
		};

		root.render(<ZoneMap progress={progress} />);

		await expect
			.element(page.getByRole("heading", { name: /Zone 1: The Drift/i }))
			.toBeVisible();
		await expect.element(page.getByText("First Light")).toBeVisible();
		await expect
			.element(page.getByTestId("node-stars-level:1.1"))
			.toHaveTextContent("★☆☆");

		root.unmount();
		container.remove();
	});

	test("displays zero stars for unplayed level node", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);
		const root = createRoot(container);

		root.render(<ZoneMap progress={null} />);

		await expect
			.element(page.getByTestId("node-stars-level:1.1"))
			.toHaveTextContent("☆☆☆");

		root.unmount();
		container.remove();
	});

	test("launches level on click and on Space key press", async () => {
		const onStartLevel = vi.fn();
		const container = document.createElement("div");
		document.body.appendChild(container);
		const root = createRoot(container);

		root.render(<ZoneMap onStartLevel={onStartLevel} />);

		const node = page.getByTestId("level-node-level:1.1");
		await expect.element(node).toBeVisible();

		// Click launches level
		await node.click();
		expect(onStartLevel).toHaveBeenCalledWith("level:1.1");

		onStartLevel.mockClear();

		// Space key launches pre-selected node
		await userEvent.keyboard(" ");
		expect(onStartLevel).toHaveBeenCalledWith("level:1.1");

		root.unmount();
		container.remove();
	});
});
