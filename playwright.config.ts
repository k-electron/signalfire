import { defineConfig } from "@playwright/test";

// No @types/node in this repo. The test:e2e script also sets this before the process starts.
const runtime = globalThis as {
	process?: { env: Record<string, string | undefined> };
};
if (runtime.process) {
	runtime.process.env.PLAYWRIGHT_BROWSERS_PATH = "0";
}

export default defineConfig({
	testDir: "e2e",
	testMatch: "**/*.spec.ts",
	use: {
		baseURL: "http://127.0.0.1:4173",
	},
	projects: [
		{
			name: "chromium",
			use: { browserName: "chromium" },
		},
	],
	webServer: {
		command: "pnpm preview --host 127.0.0.1 --port 4173 --strictPort",
		url: "http://127.0.0.1:4173",
		reuseExistingServer: false,
	},
});
