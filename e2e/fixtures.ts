import { test as base, expect } from "@playwright/test";

const epoch = new Date("2026-01-01T00:00:00.000Z");

export const test = base.extend({
	page: async ({ page }, use) => {
		await page.clock.install({ time: epoch });
		await use(page);
	},
});

export { expect };
