import { readFileSync } from "node:fs";

// The repo-root notices file is the OFL copy. Vite's public dir does not include it.
export function thirdPartyNotices() {
	return {
		name: "third-party-notices",
		generateBundle() {
			this.emitFile({
				type: "asset",
				fileName: "THIRD_PARTY_NOTICES.md",
				source: readFileSync("THIRD_PARTY_NOTICES.md", "utf8"),
			});
		},
	};
}
