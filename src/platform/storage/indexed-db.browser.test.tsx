import { afterEach, expect, test } from "vitest";
import profileFixture from "../../core/schemas/fixtures/profile/v1.json" with {
	type: "json",
};
import { profile } from "../../core/schemas/profile";
import { createLocalStorage } from "./indexed-db";
import { latestStars, starChain } from "./star-chain";

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
	const { documents } = createLocalStorage();
	await documents.save("profile", profile, profileFixture);
	expect(await readIndexedValue("profile")).toEqual(profileFixture);
});

test("two openings share a key", async () => {
	const first = createLocalStorage();
	const second = createLocalStorage();
	await first.raw.set("progress", { stars: 1 });
	expect(await second.raw.get("progress")).toEqual({ stars: 1 });
});

test("a raw value round-trips as a copy", async () => {
	const { raw } = createLocalStorage();
	const stored = { stars: 1 };
	await raw.set("progress", stored);
	stored.stars = 2;
	const loaded = await raw.get("progress");
	expect(loaded).toEqual({ stars: 1 });
	if (loaded !== null && typeof loaded === "object" && "stars" in loaded) {
		loaded.stars = 9;
	}
	expect(await raw.get("progress")).toEqual({ stars: 1 });
});

test("a missing key is absent", async () => {
	const { raw } = createLocalStorage();
	expect(await raw.get("missing")).toBeUndefined();
});

test("delete removes the key", async () => {
	const { raw } = createLocalStorage();
	await raw.set("progress", { stars: 1 });
	await raw.delete("progress");
	expect(await raw.get("progress")).toBeUndefined();
});

test("delete of a missing key resolves", async () => {
	const { raw } = createLocalStorage();
	await raw.delete("missing");
	expect(await raw.get("missing")).toBeUndefined();
});

test("an older IndexedDB document migrates, saves, and restores", async () => {
	const { raw, documents } = createLocalStorage();
	await raw.set("progress", older);
	expect(await documents.load("progress", starChain)).toEqual({
		status: "ok",
		migrated: true,
		restored: false,
		document: latestStars(2),
	});
	expect(await documents.save("progress", starChain, latestStars(2))).toEqual({
		status: "saved",
	});
	expect(await raw.get("progress")).toEqual(latestStars(2));
	expect(await raw.get("backup:progress:0")).toEqual(older);
	await raw.set("progress", { v: 1 });
	expect(await documents.load("progress", starChain)).toEqual({
		status: "ok",
		migrated: true,
		restored: true,
		document: latestStars(2),
	});
	expect(await raw.get("quarantine:progress")).toEqual({ v: 1 });
	expect(await raw.get("progress")).toEqual(older);
});

test("a save waits while the lock is held", async () => {
	const { raw, documents } = createLocalStorage();
	await expectBlockedOnWriteLock(() =>
		documents.save("profile", profile, profileFixture),
	);
	expect(await raw.get("profile")).toEqual(profileFixture);
});

test("a raw set waits while the lock is held", async () => {
	const { raw } = createLocalStorage();
	await expectBlockedOnWriteLock(() => raw.set("progress", { stars: 1 }));
	expect(await raw.get("progress")).toEqual({ stars: 1 });
});

test("a raw delete waits while the lock is held", async () => {
	const { raw } = createLocalStorage();
	await raw.set("progress", { stars: 1 });
	await expectBlockedOnWriteLock(() => raw.delete("progress"));
	expect(await raw.get("progress")).toBeUndefined();
});

test("a load that writes a backup waits while the lock is held", async () => {
	const { raw, documents } = createLocalStorage();
	await raw.set("progress", older);
	await expectBlockedOnWriteLock(() => documents.load("progress", starChain));
	expect(await raw.get("backup:progress:0")).toEqual(older);
});

test("a get does not wait for the write lock", async () => {
	const { raw } = createLocalStorage();
	await raw.set("progress", { stars: 1 });
	const release = await holdWriteLock();
	try {
		let finished = false;
		const pending = raw.get("progress").then((value) => {
			finished = true;
			return value;
		});
		expect(await pending).toEqual({ stars: 1 });
		expect(finished).toBe(true);
	} finally {
		release();
	}
});
