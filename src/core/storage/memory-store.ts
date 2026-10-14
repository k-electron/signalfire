import type { LocalStore } from "./document-store";

export function createMemoryLocalStore(): LocalStore {
	const entries = new Map<string, unknown>();
	return {
		async get(key) {
			if (!entries.has(key)) {
				return undefined;
			}
			return structuredClone(entries.get(key));
		},
		async apply(changes) {
			const next = new Map(entries);
			for (const change of changes) {
				if (change.type === "delete") {
					next.delete(change.key);
				} else {
					next.set(change.key, structuredClone(change.value));
				}
			}
			entries.clear();
			for (const [key, value] of next) {
				entries.set(key, value);
			}
		},
	};
}
