import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [tailwindcss(), react()],
	optimizeDeps: {
		include: ["@xstate/react", "xstate"],
	},
	test: {
		projects: [
			{
				test: {
					name: "unit",
					environment: "node",
					include: ["src/**/*.test.ts"],
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
