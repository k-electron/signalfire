import { test as base, expect, type Page } from "@playwright/test";

const epoch = new Date("2026-01-01T00:00:00.000Z");

export async function seedProfile(page: Page) {
	await page.addInitScript(() => {
		const request = indexedDB.open("signalfire");
		request.onupgradeneeded = () => {
			request.result.createObjectStore("documents");
		};
		request.onsuccess = () => {
			const db = request.result;
			const tx = db.transaction("documents", "readwrite");
			tx.objectStore("documents").put(
				{
					v: 1,
					updatedAt: "2026-01-01T00:00:00.000Z",
					createdAt: "2026-01-01T00:00:00.000Z",
					rev: 1,
					callSign: "Cadet Nova",
					onboardingComplete: true,
					preferredThumb: "either",
				},
				"profile",
			);
		};
	});
}

export const test = base.extend({
	page: async ({ page }, use) => {
		await page.clock.install({ time: epoch });
		await use(page);
	},
});

export { expect };
