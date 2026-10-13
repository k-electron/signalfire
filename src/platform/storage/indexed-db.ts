import { createStore, get, promisifyRequest, type UseStore } from "idb-keyval";
import type { Storage } from "../../core/ports/storage";
import {
	type Change,
	createDocumentStore,
	type LocalStore,
} from "./document-store";
import { createWebWriteLock, type WriteLock } from "./write-lock";

export function createLocalStorage(): {
	readonly raw: Storage;
	readonly documents: ReturnType<typeof createDocumentStore>;
} {
	const lock = createWebWriteLock();
	const store = createIndexedDbStore(
		createStore("signalfire", "documents"),
		lock,
	);
	const raw: Storage = {
		get: (key) => store.get(key),
		set: (key, value) => store.set(key, value),
		delete: (key) => store.delete(key),
	};
	return { raw, documents: createDocumentStore(store, lock) };
}

function createIndexedDbStore(
	customStore: UseStore,
	lock: WriteLock,
): Storage & LocalStore {
	async function write(changes: readonly Change[]): Promise<void> {
		if (changes.length === 0) {
			return;
		}
		await customStore("readwrite", (objectStore) => {
			for (const change of changes) {
				if (change.type === "delete") {
					objectStore.delete(change.key);
				} else {
					objectStore.put(change.value, change.key);
				}
			}
			return promisifyRequest(objectStore.transaction);
		});
	}

	return {
		apply: write,
		async get(key) {
			const value: unknown = await get(key, customStore);
			return value;
		},
		async set(key, value) {
			await lock.exclusive(() => write([{ type: "set", key, value }]));
		},
		async delete(key) {
			await lock.exclusive(() => write([{ type: "delete", key }]));
		},
	};
}
