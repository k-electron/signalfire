import { createRoot } from "react-dom/client";
import { describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import "../theme/app.css";
import { Onboarding } from "./onboarding";

describe("Onboarding screen component", () => {
	test("navigates call sign, completes posture checks, and finds beacons", async () => {
		const onComplete = vi.fn();
		const container = document.createElement("div");
		document.body.appendChild(container);
		const root = createRoot(container);

		root.render(<Onboarding onComplete={onComplete} />);

		// 1. Heading verification
		await expect
			.element(page.getByRole("heading", { name: "Onboarding" }))
			.toBeVisible();

		// 2. Step 1: Call Sign Selection
		await expect
			.element(page.getByTestId("onboarding-step-call-sign"))
			.toBeVisible();
		await expect.element(page.getByText(/Cadet Nova/)).toBeVisible();

		// Arrow down changes selection to Beacon Leader
		await userEvent.keyboard("{ArrowDown}");
		await expect
			.element(page.getByRole("button", { name: /▶ Beacon Leader/ }))
			.toBeVisible();

		// Space confirms call sign selection
		await userEvent.keyboard(" ");

		// 3. Step 2: Posture Check
		await expect
			.element(page.getByTestId("onboarding-step-posture"))
			.toBeVisible();
		await expect.element(page.getByText(/Sit tall/i)).toBeVisible();

		// Space advances to wrists floating
		await userEvent.keyboard(" ");
		await expect.element(page.getByText(/Wrists floating/i)).toBeVisible();

		// Space advances to eyes on screen
		await userEvent.keyboard(" ");
		await expect.element(page.getByText(/Eyes on the screen/i)).toBeVisible();

		// Space confirms posture and moves to beacons
		await userEvent.keyboard(" ");

		// 4. Step 3: Find the Beacons
		await expect
			.element(page.getByTestId("onboarding-step-beacons"))
			.toBeVisible();
		await expect.element(page.getByTestId("beacon-f")).toBeVisible();
		await expect.element(page.getByTestId("beacon-j")).toBeVisible();

		// Pressing 'f' registers F beacon
		await userEvent.keyboard("f");
		await expect
			.element(page.getByTestId("beacon-f"))
			.toHaveAttribute("data-found", "true");

		// Pressing 'j' registers J beacon and completes onboarding
		await userEvent.keyboard("j");

		await expect.poll(() => onComplete).toHaveBeenCalledTimes(1);
		expect(onComplete).toHaveBeenCalledWith(
			expect.objectContaining({
				callSign: "Beacon Leader",
			}),
		);

		root.unmount();
		container.remove();
	});
});
