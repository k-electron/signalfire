import { createStore, get, promisifyRequest, type UseStore } from "idb-keyval";
import type { Storage } from "../../core/ports/storage";
import type { Change, LocalStore } from "../../core/storage/document-store";
import { createGameStorage } from "../../core/storage/game-storage";
import { LockBusyError, type WriteLock } from "../../core/storage/write-lock";

const WRITE_LOCK_WAIT_MS = 1000;

export function createLocalStorage(): Storage {
	const { store, lock } = createSignalfireLocalStore();
	return createGameStorage(store, lock);
}

export function createSignalfireLocalStore(): {
	readonly store: LocalStore;
	readonly lock: WriteLock;
} {
	const lock = createWebWriteLock();
	const store = createIndexedDbStore(createStore("signalfire", "documents"));
	return { store, lock };
}

function createWebWriteLock(): WriteLock {
	return {
		exclusive(run) {
			return navigator.locks
				.request(
					"signalfire-write",
					{ signal: AbortSignal.timeout(WRITE_LOCK_WAIT_MS) },
					() => run(),
				)
				.catch((error: unknown) => {
					if (
						error instanceof DOMException &&
						(error.name === "AbortError" || error.name === "TimeoutError")
					) {
						throw new LockBusyError();
					}
					throw error;
				});
		},
	};
}

function createIndexedDbStore(customStore: UseStore): LocalStore {
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
	};
}
