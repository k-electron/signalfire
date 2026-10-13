import { fc, test } from "@fast-check/vitest";
import { expect } from "vitest";
import { formatRunId, runId } from "./run-id";

const maxTime = 281474976710655;
const mixedEntropy = Uint8Array.from([
	0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef, 0x10, 0x32,
]);

test("zero time and zero entropy", () => {
	expect(formatRunId(0, new Uint8Array(10))).toBe("00000000000000000000000000");
});

test("the largest ULID", () => {
	expect(formatRunId(maxTime, new Uint8Array(10).fill(255))).toBe(
		"7ZZZZZZZZZZZZZZZZZZZZZZZZZ",
	);
});

test("a mixed timestamp and entropy", () => {
	const id = formatRunId(1460000000000, mixedEntropy);
	expect(id).toBe("01AFQCG20004HMASW9NF6YY41J");
	expect(runId.safeParse(id).success).toBe(true);
});

test.prop([
	fc.uint8Array({ minLength: 10, maxLength: 10 }),
	fc.uint8Array({ minLength: 10, maxLength: 10 }),
])("an earlier timestamp sorts first", (earlierEntropy, laterEntropy) => {
	const earlier = formatRunId(1000, earlierEntropy);
	const later = formatRunId(2000, laterEntropy);
	expect(earlier < later).toBe(true);
});

test.prop([
	fc.integer({ min: 0, max: maxTime }),
	fc.uint8Array({ minLength: 10, maxLength: 10 }),
])("the same inputs repeat", (timestamp, entropy) => {
	expect(formatRunId(timestamp, entropy)).toBe(formatRunId(timestamp, entropy));
});

test("time or entropy is unusable", () => {
	const entropy = new Uint8Array(10);
	expect(() => formatRunId(-1, entropy)).toThrow(RangeError);
	expect(() => formatRunId(maxTime + 1, entropy)).toThrow(RangeError);
	expect(() => formatRunId(1.5, entropy)).toThrow(RangeError);
	expect(() => formatRunId(0, new Uint8Array(9))).toThrow(RangeError);
	expect(() => formatRunId(0, new Uint8Array(11))).toThrow(RangeError);
});

test("a non-canonical string is rejected", () => {
	for (const value of [
		"01afqcg20004hmasw9nf6yy41j",
		"80000000000000000000000000",
		"0000000000000000000000000I",
	]) {
		expect(runId.safeParse(value).success, value).toBe(false);
	}
});
