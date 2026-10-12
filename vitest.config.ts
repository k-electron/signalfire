import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

// No @types/node in this repo. The pnpm scripts also set this before the process starts.
const runtime = globalThis as {
	process?: { env: Record<string, string | undefined> };
};
if (runtime.process) {
	runtime.process.env.PLAYWRIGHT_BROWSERS_PATH = "0";
}

export default defineConfig({
	plugins: [react()],
	test: {
		projects: [
			{
				test: {
					name: "unit",
					environment: "node",
					include: ["src/**/*.test.ts"],
					exclude: ["src/**/*.browser.test.ts"],
				},
			},
			{
				test: {
					name: "browser",
					include: ["src/**/*.browser.test.tsx"],
					browser: {
						enabled: true,
						headless: true,
						provider: playwright(),
						instances: [{ browser: "chromium" }],
					},
				},
			},
		],
	},
});
