import { fc, test } from "@fast-check/vitest";
import { expect } from "vitest";
import {
	createFakeAudioOut,
	createFakeClock,
	createFakeCloudSync,
	createFakeRenderOut,
	createFakeStorage,
} from "./fakes";

test("the clock starts at a chosen step", () => {
	expect(createFakeClock(4).step()).toBe(4);
});

test("the caller advances the clock", () => {
	const clock = createFakeClock(4);
	clock.advance(2);
	expect(clock.step()).toBe(6);
});

test("the caller sets the step", () => {
	const clock = createFakeClock(4);
	clock.setStep(1);
	expect(clock.step()).toBe(1);
});

test("a negative step is rejected", () => {
	const clock = createFakeClock(4);
	expect(() => clock.setStep(-1)).toThrow(RangeError);
	expect(clock.step()).toBe(4);
	expect(() => clock.advance(-1)).toThrow(RangeError);
	expect(clock.step()).toBe(4);
});

test("a non-integer step is rejected", () => {
	const clock = createFakeClock(4);
	expect(() => clock.setStep(1.5)).toThrow(RangeError);
	expect(clock.step()).toBe(4);
});

test("an advance past the safe integer range is rejected", () => {
	const clock = createFakeClock(Number.MAX_SAFE_INTEGER);
	expect(() => clock.advance(1)).toThrow(RangeError);
	expect(clock.step()).toBe(Number.MAX_SAFE_INTEGER);
});

test("a stored document is returned", async () => {
	const storage = createFakeStorage();
	await storage.set("progress", { stars: 1 });
	expect(await storage.get("progress")).toEqual({ stars: 1 });
});

test("a missing key is absent", async () => {
	expect(await createFakeStorage().get("missing")).toBeUndefined();
});

test("mutating the stored object does not change the saved value", async () => {
	const storage = createFakeStorage();
	const document = { stars: 1 };
	await storage.set("progress", document);
	document.stars = 2;
	expect(await storage.get("progress")).toEqual({ stars: 1 });
});

test("mutating the loaded object does not change the saved value", async () => {
	const storage = createFakeStorage();
	await storage.set("progress", { stars: 1 });
	const loaded = (await storage.get("progress")) as { stars: number };
	loaded.stars = 9;
	expect(await storage.get("progress")).toEqual({ stars: 1 });
});

test("delete removes the key", async () => {
	const storage = createFakeStorage();
	await storage.set("progress", { stars: 1 });
	await storage.delete("progress");
	expect(await storage.get("progress")).toBeUndefined();
});

test("delete of a missing key resolves", async () => {
	const storage = createFakeStorage();
	await expect(storage.delete("missing")).resolves.toBeUndefined();
	expect(await storage.get("missing")).toBeUndefined();
});

test("an uncloneable value is rejected", async () => {
	const storage = createFakeStorage();
	await expect(storage.set("progress", () => 1)).rejects.toThrow();
	expect(await storage.get("progress")).toBeUndefined();
});

test.prop([fc.jsonValue()])("JSON values round-trip", async (value) => {
	const storage = createFakeStorage();
	await storage.set("doc", value);
	expect(await storage.get("doc")).toEqual(value);
});

test("two storages do not share entries", async () => {
	const first = createFakeStorage();
	const second = createFakeStorage();
	await first.set("progress", { stars: 1 });
	expect(await second.get("progress")).toBeUndefined();
});

test("a local write is not in the cloud", async () => {
	const storage = createFakeStorage();
	const cloud = createFakeCloudSync();
	await storage.set("progress", { stars: 1 });
	expect(await cloud.get("progress")).toBeUndefined();
});

test("a cloud value round-trips as a copy", async () => {
	const storage = createFakeStorage();
	const cloud = createFakeCloudSync();
	const document = { rev: 1 };
	await cloud.set("progress", document);
	document.rev = 2;
	expect(await cloud.get("progress")).toEqual({ rev: 1 });
	expect(await storage.get("progress")).toBeUndefined();
});

test("cloud delete removes the key", async () => {
	const cloud = createFakeCloudSync();
	await cloud.set("progress", { rev: 1 });
	await cloud.delete("progress");
	expect(await cloud.get("progress")).toBeUndefined();
});

test("batches stay in publish order", () => {
	const render = createFakeRenderOut();
	render.publish([{ type: "Hit", step: 1 }]);
	render.publish([{ type: "LevelEnded", step: 9 }]);
	expect(render.batches()).toEqual([
		[{ type: "Hit", step: 1 }],
		[{ type: "LevelEnded", step: 9 }],
	]);
});

test("changing the published array does not change the record", () => {
	const render = createFakeRenderOut();
	const batch: { type: "Hit" | "Error"; step: number }[] = [
		{ type: "Hit", step: 1 },
	];
	render.publish(batch);
	batch.push({ type: "Error", step: 2 });
	expect(render.batches()).toEqual([[{ type: "Hit", step: 1 }]]);
});

test("an empty batch is recorded", () => {
	const render = createFakeRenderOut();
	render.publish([]);
	expect(render.batches()).toEqual([[]]);
});

test("render and audio do not share batches", () => {
	const render = createFakeRenderOut();
	const audio = createFakeAudioOut();
	render.publish([{ type: "Hit", step: 1 }]);
	expect(audio.batches()).toEqual([]);
});
