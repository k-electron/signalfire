import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { thirdPartyNotices } from "./tools/notices/plugin.mjs";

export default defineConfig({
	plugins: [tailwindcss(), react(), thirdPartyNotices()],
});
