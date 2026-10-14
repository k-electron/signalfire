import { afterEach, expect, test } from "vitest";
import profileFixture from "../../core/schemas/fixtures/profile/v1.json" with {
	type: "json",
};
import { createDocumentStore } from "../../core/storage/document-store";
import { createLocalStorage, createSignalfireLocalStore } from "./indexed-db";
import { latestStars, starChain } from "./star-chain.fixture";

const older = { v: 1, stars: 2 };

afterEach(async () => {
	const { clear, createStore } = await import("idb-keyval");
	await clear(createStore("signalfire", "documents"));
});

async function readIndexedValue(key: string): Promise<unknown> {
	const db = await new Promise<IDBDatabase>((resolve, reject) => {
		const request = indexedDB.open("signalfire");
		request.onerror = () => {
			reject(request.error);
		};
		request.onsuccess = () => {
			resolve(request.result);
		};
	});
	try {
		return await new Promise((resolve, reject) => {
			const request = db
				.transaction("documents", "readonly")
				.objectStore("documents")
				.get(key);
			request.onerror = () => {
				reject(request.error);
			};
			request.onsuccess = () => {
				resolve(request.result);
			};
		});
	} finally {
		db.close();
	}
}

async function holdWriteLock(): Promise<() => void> {
	let release!: () => void;
	await new Promise<void>((resolve) => {
		navigator.locks.request("signalfire-write", () => {
			resolve();
			return new Promise<void>((done) => {
				release = done;
			});
		});
	});
	return release;
}

async function expectBlockedOnWriteLock(
	start: () => Promise<unknown>,
): Promise<void> {
	const release = await holdWriteLock();
	try {
		let finished = false;
		const pending = start().then((value) => {
			finished = true;
			return value;
		});
		let requested = false;
		for (let attempt = 0; attempt < 20; attempt += 1) {
			const snapshot = await navigator.locks.query();
			requested =
				snapshot.pending?.some((lock) => lock.name === "signalfire-write") ??
				false;
			if (requested) {
				break;
			}
			await new Promise<void>((resolve) => {
				queueMicrotask(resolve);
			});
		}
		expect(requested).toBe(true);
		expect(finished).toBe(false);
		release();
		await pending;
		expect(finished).toBe(true);
	} finally {
		release();
	}
}

test("a stored profile is in signalfire", async () => {
	const storage = createLocalStorage();
	await storage.save("profile", profileFixture);
	expect(await readIndexedValue("profile")).toEqual(profileFixture);
});

test("two openings share a key", async () => {
	const first = createLocalStorage();
	const second = createLocalStorage();
	await first.save("profile", profileFixture);
	expect(await second.load("profile")).toEqual({
		status: "ok",
		migrated: false,
		restored: false,
		document: profileFixture,
	});
});

test("a saved document round-trips as a copy", async () => {
	const storage = createLocalStorage();
	const stored = structuredClone(profileFixture);
	await storage.save("profile", stored);
	stored.callSign = "changed";
	const loaded = await storage.load("profile");
	expect(loaded).toMatchObject({
		status: "ok",
		document: profileFixture,
	});
	if (loaded.status === "ok" && isRecord(loaded.document)) {
		loaded.document.callSign = "later";
	}
	expect(await storage.load("profile")).toMatchObject({
		document: profileFixture,
	});
});

test("an older IndexedDB document migrates, saves, and restores", async () => {
	const { store, lock } = createSignalfireLocalStore();
	const documents = createDocumentStore(store, lock, { progress: starChain });
	await store.apply([{ type: "set", key: "progress", value: older }]);
	expect(await documents.load("progress")).toEqual({
		status: "ok",
		migrated: true,
		restored: false,
		document: latestStars(2),
	});
	expect(await documents.save("progress", latestStars(2))).toEqual({
		status: "saved",
	});
	expect(await store.get("progress")).toEqual(latestStars(2));
	expect(await store.get("backup:progress:0")).toEqual(older);
	await store.apply([{ type: "set", key: "progress", value: { v: 1 } }]);
	expect(await documents.load("progress")).toEqual({
		status: "ok",
		migrated: true,
		restored: true,
		document: latestStars(2),
	});
	expect(await store.get("quarantine:progress:0")).toEqual({ v: 1 });
	expect(await store.get("progress")).toEqual(older);
});

test("a save waits while the lock is held", async () => {
	const storage = createLocalStorage();
	await expectBlockedOnWriteLock(() => storage.save("profile", profileFixture));
	expect(await readIndexedValue("profile")).toEqual(profileFixture);
});

test("a load that writes a backup waits while the lock is held", async () => {
	const { store, lock } = createSignalfireLocalStore();
	const documents = createDocumentStore(store, lock, { progress: starChain });
	await store.apply([{ type: "set", key: "progress", value: older }]);
	await expectBlockedOnWriteLock(() => documents.load("progress"));
	expect(await store.get("backup:progress:0")).toEqual(older);
});

test("a save finishes busy when the lock stays held", async () => {
	const storage = createLocalStorage();
	const release = await holdWriteLock();
	try {
		expect(await storage.save("profile", profileFixture)).toEqual({
			status: "busy",
		});
		expect(await readIndexedValue("profile")).toBeUndefined();
	} finally {
		release();
	}
});

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}
