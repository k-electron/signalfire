import { createRoot } from "react-dom/client";
import { expect, onTestFinished, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { App } from "./app";
import "./theme/app.css";

const gate = vi.hoisted(() => ({ fail: false }));

vi.mock("./screens/settings", async (importOriginal) => {
	const actual = await importOriginal<typeof import("./screens/settings")>();
	return {
		...actual,
		Settings() {
			if (gate.fail) {
				throw new Error("settings failed");
			}
			return actual.Settings();
		},
	};
});

function mount() {
	const container = document.createElement("div");
	document.body.append(container);
	const root = createRoot(container);
	root.render(<App />);
	onTestFinished(() => {
		root.unmount();
		container.remove();
		gate.fail = false;
	});
}

async function heading(name: string) {
	await expect
		.element(page.getByRole("heading", { name, exact: true }))
		.toBeVisible();
}

async function press(key: string) {
	await userEvent.keyboard(key);
}

async function toOnboarding() {
	mount();
	await heading("Signalfire");
	await press(" ");
	await heading("Onboarding");
}

async function toHub() {
	await toOnboarding();
	await press(" ");
	await heading("Hub");
}

async function toGalaxy() {
	await toHub();
	await press(" ");
	await heading("Galaxy map");
}

async function toZoneFromGalaxy() {
	await toGalaxy();
	await press(" ");
	await heading("Zone map");
}

async function toLevel() {
	await toZoneFromGalaxy();
	await press(" ");
	await heading("Level");
}

async function toResults() {
	await toLevel();
	await press(" ");
	await heading("Results");
}

function selected(name: string) {
	return page.getByRole("button", { name, exact: true });
}

test("The title shows the name and the prompt", async () => {
	mount();
	await heading("Signalfire");
	await expect.element(page.getByText("Press Space to start.")).toBeVisible();
});

test("Onboarding shows its name", async () => {
	await toOnboarding();
	expect(document.body.textContent?.includes("Signalfire")).toBe(false);
});

test("The hub shows its name", async () => {
	await toHub();
});

test("The galaxy map shows its name", async () => {
	await toGalaxy();
});

test("The zone map shows its name", async () => {
	await toZoneFromGalaxy();
});

test("The dossier shows its name", async () => {
	await toHub();
	await press("2");
	await heading("Dossier");
});

test("The hangar shows its name", async () => {
	await toHub();
	await press("3");
	await heading("Hangar");
});

test("The codex shows its name", async () => {
	await toHub();
	await press("4");
	await heading("Codex");
});

test("Settings shows its name", async () => {
	await toHub();
	await press("5");
	await heading("Settings");
});

test("The level shows its name", async () => {
	await toLevel();
});

test("Results shows its name", async () => {
	await toResults();
});

test("Space on the title begins a first run", async () => {
	await toOnboarding();
});

test("Space on onboarding opens the hub", async () => {
	await toHub();
});

test("Space on a fresh hub opens the galaxy map", async () => {
	await toGalaxy();
});

test("Space on the selected zone map item opens the zone map", async () => {
	await toHub();
	for (let step = 0; step < 5; step += 1) {
		await press("{ArrowDown}");
	}
	await expect
		.element(selected("Zone map"))
		.toHaveAttribute("aria-current", "true");
	await press(" ");
	await heading("Zone map");
});

test("Space on the galaxy map opens the zone map", async () => {
	await toZoneFromGalaxy();
});

test("Space on the zone map opens the level", async () => {
	await toLevel();
});

test("Space on the level opens results", async () => {
	await toResults();
});

test("Space on results opens the zone map", async () => {
	await toResults();
	await press(" ");
	await heading("Zone map");
});

test("Space on settings stays on settings", async () => {
	await toHub();
	await press("5");
	await heading("Settings");
	await press(" ");
	await heading("Settings");
});

test("Escape on onboarding returns to the title", async () => {
	await toOnboarding();
	await press("{Escape}");
	await heading("Signalfire");
});

test("Escape on the title stays on the title", async () => {
	mount();
	await heading("Signalfire");
	await press("{Escape}");
	await heading("Signalfire");
});

test("Escape on the hub returns to onboarding after a first run", async () => {
	await toHub();
	await press("{Escape}");
	await heading("Onboarding");
});

test("Escape on settings returns to the hub", async () => {
	await toHub();
	await press("5");
	await heading("Settings");
	await press("{Escape}");
	await heading("Hub");
});

test("Escape on results returns to the zone map", async () => {
	await toResults();
	await press("{Escape}");
	await heading("Zone map");
});

test("1 on the hub opens the galaxy map", async () => {
	await toHub();
	await press("1");
	await heading("Galaxy map");
});

test("2 on the hub opens the dossier", async () => {
	await toHub();
	await press("2");
	await heading("Dossier");
});

test("3 on the hub opens the hangar", async () => {
	await toHub();
	await press("3");
	await heading("Hangar");
});

test("4 on the hub opens the codex", async () => {
	await toHub();
	await press("4");
	await heading("Codex");
});

test("5 on the hub opens settings", async () => {
	await toHub();
	await press("5");
	await heading("Settings");
});

test("1 on results opens the zone map", async () => {
	await toResults();
	await press("1");
	await heading("Zone map");
});

test("2 on results opens the hub", async () => {
	await toResults();
	await press("2");
	await heading("Hub");
});

test("1 on the title stays on the title", async () => {
	mount();
	await heading("Signalfire");
	await press("1");
	await heading("Signalfire");
});

test("ArrowDown on the hub selects the dossier", async () => {
	await toHub();
	await press("{ArrowDown}");
	await expect
		.element(selected("Dossier"))
		.toHaveAttribute("aria-current", "true");
	await heading("Hub");
});

test("ArrowUp on the first hub item stays there", async () => {
	await toHub();
	await press("{ArrowUp}");
	await expect
		.element(selected("Galaxy map"))
		.toHaveAttribute("aria-current", "true");
});

test("ArrowDown on the last hub item stays there", async () => {
	await toHub();
	for (let step = 0; step < 5; step += 1) {
		await press("{ArrowDown}");
	}
	await expect
		.element(selected("Zone map"))
		.toHaveAttribute("aria-current", "true");
	await press("{ArrowDown}");
	await expect
		.element(selected("Zone map"))
		.toHaveAttribute("aria-current", "true");
});

test("ArrowRight matches ArrowDown on the hub", async () => {
	await toHub();
	await press("{ArrowRight}");
	await expect
		.element(selected("Dossier"))
		.toHaveAttribute("aria-current", "true");
});

test("ArrowDown on results selects Hub", async () => {
	await toResults();
	await press("{ArrowDown}");
	await expect.element(selected("Hub")).toHaveAttribute("aria-current", "true");
	await heading("Results");
});

test("Space after that arrow opens the hub", async () => {
	await toResults();
	await press("{ArrowDown}");
	await press(" ");
	await heading("Hub");
});

test("ArrowDown on the galaxy map stays on the galaxy map", async () => {
	await toGalaxy();
	await press("{ArrowDown}");
	await heading("Galaxy map");
});

test("Browser Back from the title stays on the title", async () => {
	mount();
	await heading("Signalfire");
	const path = location.pathname;
	history.back();
	await heading("Signalfire");
	expect(location.pathname).toBe(path);
});

test("Browser Back from results opens the zone map", async () => {
	await toResults();
	history.back();
	await heading("Zone map");
});

test("Clicking Settings on the hub opens settings", async () => {
	await toHub();
	await page.getByRole("button", { name: "Settings" }).click();
	await heading("Settings");
});

test("Clicking Continue on results opens the zone map", async () => {
	await toResults();
	await page.getByRole("button", { name: "Continue" }).click();
	await heading("Zone map");
});

test("Space works on the title without a click", async () => {
	mount();
	await heading("Signalfire");
	const focused = document.activeElement;
	expect(focused).toBeInstanceOf(HTMLElement);
	expect(getComputedStyle(focused as HTMLElement).boxShadow).not.toBe("none");
	await press(" ");
	await heading("Onboarding");
});

test("Escape works after a click opens settings", async () => {
	await toHub();
	await page.getByRole("button", { name: "Settings" }).click();
	await heading("Settings");
	const focused = document.activeElement;
	expect(focused).toBeInstanceOf(HTMLElement);
	expect(getComputedStyle(focused as HTMLElement).boxShadow).not.toBe("none");
	await press("{Escape}");
	await heading("Hub");
});

test("A failed settings screen shows the message", async () => {
	gate.fail = true;
	await toHub();
	await press("5");
	await expect.element(page.getByText("Something went wrong.")).toBeVisible();
	await expect
		.element(page.getByRole("button", { name: "Back" }))
		.toBeVisible();
	expect(document.querySelector("[data-screen='settings']")).not.toBeNull();
});

test("Back leaves the failed screen", async () => {
	gate.fail = true;
	await toHub();
	await press("5");
	await expect.element(page.getByText("Something went wrong.")).toBeVisible();
	await page.getByRole("button", { name: "Back" }).click();
	await heading("Hub");
	expect(document.body.textContent?.includes("Something went wrong.")).toBe(
		false,
	);
});
