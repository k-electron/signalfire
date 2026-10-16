import { defineConfig } from "@playwright/test";

declare const process: {
	env: Record<string, string | undefined>;
};

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:4173";

export default defineConfig({
	testDir: "e2e",
	testMatch: "**/*.spec.ts",
	use: {
		baseURL,
	},
	projects: [
		{
			name: "chromium",
			use: { browserName: "chromium" },
		},
	],
	webServer: process.env.PLAYWRIGHT_BASE_URL
		? undefined
		: {
				command: "pnpm preview --host 127.0.0.1 --port 4173 --strictPort",
				url: "http://127.0.0.1:4173",
				reuseExistingServer: false,
			},
});
