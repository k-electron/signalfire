import { test as base, expect } from "@playwright/test";

const epoch = new Date("2026-01-01T00:00:00.000Z");

// No @types/node in this repo. The test:e2e script also sets this before the process starts.
const runtime = globalThis as {
	process?: { env: Record<string, string | undefined> };
};
if (runtime.process) {
	runtime.process.env.PLAYWRIGHT_BROWSERS_PATH = "0";
}

export const test = base.extend({
	page: async ({ page }, use) => {
		await page.clock.install({ time: epoch });
		await use(page);
	},
});

export { expect };
