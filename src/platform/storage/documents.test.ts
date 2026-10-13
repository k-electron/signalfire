import { expect, test } from "vitest";
import profileFixture from "../../core/schemas/fixtures/profile/v1.json" with {
	type: "json",
};
import { profile } from "../../core/schemas/profile";
import { createDocumentStore, type LocalStore } from "./document-store";
import { createMemoryLocalStore } from "./memory-store";
import { latestStars, starChain } from "./star-chain";
import { createImmediateWriteLock } from "./write-lock";

const older = { v: 1, stars: 2 };

function setup() {
	const store = createMemoryLocalStore();
	const documents = createDocumentStore(store, createImmediateWriteLock());
	return { store, documents };
}

async function setRaw(
	store: LocalStore,
	key: string,
	value: unknown,
): Promise<void> {
	await store.apply([{ type: "set", key, value }]);
}

test("nothing was saved", async () => {
	const { documents } = setup();
	expect(await documents.load("profile", profile)).toEqual({
		status: "absent",
	});
	expect(await documents.load("profile", profile)).toEqual({
		status: "absent",
	});
});

test("a run id key is accepted", async () => {
	const { documents } = setup();
	const document = latestStars(1);
	const key = "run:01AFQCG20004HMASW9NF6YY41J";
	expect(await documents.save(key, starChain, document)).toEqual({
		status: "saved",
	});
	expect(await documents.load(key, starChain)).toEqual({
		status: "ok",
		migrated: false,
		restored: false,
		document,
	});
});

test("an empty or reserved key is rejected", async () => {
	const { store, documents } = setup();
	const document = latestStars(1);
	for (const key of ["", "backup:profile:0", "quarantine:profile"]) {
		await expect(documents.save(key, starChain, document)).rejects.toThrow(
			RangeError,
		);
		expect(await store.get(key)).toBeUndefined();
	}
});

test("the shipped profile round-trips", async () => {
	const { documents } = setup();
	expect(await documents.save("profile", profile, profileFixture)).toEqual({
		status: "saved",
	});
	expect(await documents.load("profile", profile)).toEqual({
		status: "ok",
		migrated: false,
		restored: false,
		document: profileFixture,
	});
});

test("loading the latest version stores no backup", async () => {
	const { store, documents } = setup();
	await setRaw(store, "profile", profileFixture);
	await documents.load("profile", profile);
	expect(await store.get("backup:profile:0")).toBeUndefined();
	expect(await store.get("backup:profile:1")).toBeUndefined();
	expect(await store.get("backup:profile:2")).toBeUndefined();
	expect(await store.get("quarantine:profile")).toBeUndefined();
	expect(await store.get("profile")).toEqual(profileFixture);
});

test("version 1 migrates to version 2 and keeps stars", async () => {
	const { store, documents } = setup();
	await setRaw(store, "progress", older);
	expect(await documents.load("progress", starChain)).toEqual({
		status: "ok",
		migrated: true,
		restored: false,
		document: latestStars(2),
	});
	expect(await store.get("progress")).toEqual(older);
	expect(await store.get("backup:progress:0")).toEqual(older);
	expect(await store.get("backup:progress:1")).toBeUndefined();
	expect(await store.get("backup:progress:2")).toBeUndefined();
});

test("a second load does not store a second copy", async () => {
	const { store, documents } = setup();
	await setRaw(store, "progress", older);
	await setRaw(store, "backup:progress:0", older);
	await documents.load("progress", starChain);
	expect(await store.get("backup:progress:0")).toEqual(older);
	expect(await store.get("backup:progress:1")).toBeUndefined();
});

test("the first save stores no backup", async () => {
	const { store, documents } = setup();
	const document = latestStars(1);
	expect(await documents.save("progress", starChain, document)).toEqual({
		status: "saved",
	});
	expect(await store.get("progress")).toEqual(document);
	expect(await store.get("backup:progress:0")).toBeUndefined();
});

test("the migrated document is saved and the older value stays the newest backup", async () => {
	const { store, documents } = setup();
	await setRaw(store, "progress", older);
	const loaded = await documents.load("progress", starChain);
	expect(loaded.status).toBe("ok");
	if (loaded.status !== "ok") {
		throw new Error("expected a migrated document");
	}
	expect(await documents.save("progress", starChain, loaded.document)).toEqual({
		status: "saved",
	});
	expect(await store.get("progress")).toEqual(latestStars(2));
	expect(await store.get("backup:progress:0")).toEqual(older);
	expect(await store.get("backup:progress:1")).toBeUndefined();
});

test("the fourth previous value is dropped", async () => {
	const { store, documents } = setup();
	for (const stars of [1, 2, 3, 4]) {
		expect(
			await documents.save("progress", starChain, latestStars(stars)),
		).toEqual({ status: "saved" });
	}
	expect(await store.get("progress")).toEqual(latestStars(4));
	expect(await store.get("backup:progress:0")).toEqual(latestStars(3));
	expect(await store.get("backup:progress:1")).toEqual(latestStars(2));
	expect(await store.get("backup:progress:2")).toEqual(latestStars(1));
});

test("a value that is not the latest version is refused", async () => {
	const { store, documents } = setup();
	const current = latestStars(2);
	await setRaw(store, "progress", current);
	expect(await documents.save("progress", starChain, older)).toEqual({
		status: "invalid",
	});
	expect(await store.get("progress")).toEqual(current);
	expect(await store.get("backup:progress:0")).toBeUndefined();
});

test("a future value loads as newer", async () => {
	const { store, documents } = setup();
	const future = { v: 3, stars: 9 };
	await setRaw(store, "progress", future);
	expect(await documents.load("progress", starChain)).toEqual({
		status: "newer",
		version: 3,
	});
	expect(await store.get("progress")).toEqual(future);
	expect(await store.get("backup:progress:0")).toBeUndefined();
	expect(await store.get("quarantine:progress")).toBeUndefined();
});

test("a non-latest save reports the stored newer version", async () => {
	const { store, documents } = setup();
	const future = { v: 3, stars: 9 };
	await setRaw(store, "progress", future);
	expect(await documents.save("progress", starChain, older)).toEqual({
		status: "newer",
		version: 3,
	});
	expect(await store.get("progress")).toEqual(future);
	expect(await store.get("backup:progress:0")).toBeUndefined();
});

test("a save leaves the newer value in place", async () => {
	const { store, documents } = setup();
	const future = { v: 3, stars: 9 };
	await setRaw(store, "progress", future);
	expect(await documents.save("progress", starChain, latestStars(1))).toEqual({
		status: "newer",
		version: 3,
	});
	expect(await store.get("progress")).toEqual(future);
	expect(await store.get("backup:progress:0")).toBeUndefined();
});

test("an invalid newer backup is skipped", async () => {
	const { store, documents } = setup();
	await setRaw(store, "progress", { v: 2 });
	await setRaw(store, "backup:progress:0", { v: 1 });
	await setRaw(store, "backup:progress:1", older);
	expect(await documents.load("progress", starChain)).toEqual({
		status: "ok",
		migrated: true,
		restored: true,
		document: latestStars(2),
	});
	expect(await store.get("quarantine:progress")).toEqual({ v: 2 });
	expect(await store.get("progress")).toEqual(older);
	expect(await store.get("backup:progress:0")).toEqual({ v: 1 });
	expect(await store.get("backup:progress:1")).toEqual(older);
});

test("no valid backup removes the live value", async () => {
	const { store, documents } = setup();
	await setRaw(store, "progress", { v: 1 });
	expect(await documents.load("progress", starChain)).toEqual({
		status: "invalid",
	});
	expect(await store.get("quarantine:progress")).toEqual({ v: 1 });
	expect(await store.get("progress")).toBeUndefined();
});

test("a later invalid value replaces the quarantine", async () => {
	const { store, documents } = setup();
	await setRaw(store, "quarantine:progress", { v: 1 });
	await setRaw(store, "progress", { v: 2 });
	expect(await documents.load("progress", starChain)).toEqual({
		status: "invalid",
	});
	expect(await store.get("quarantine:progress")).toEqual({ v: 2 });
});
