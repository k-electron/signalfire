import { expect, test } from "vitest";
import { z } from "zod";
import { defineDocument } from "./parse";

const version1 = z.strictObject({
	v: z.literal(1),
	stars: z.number(),
});
const version2 = z.strictObject({
	v: z.literal(2),
	stars: z.number(),
	note: z.string(),
});

const chain = defineDocument<{ v: 2; stars: number; note: string }>({
	latest: 2,
	versions: {
		1: { initial: true, schema: version1 },
		2: {
			initial: false,
			schema: version2,
			up(previous) {
				const older = version1.parse(previous);
				return { v: 2 as const, stars: older.stars, note: "kept" };
			},
		},
	},
});

const brokenStep = defineDocument({
	latest: 2,
	versions: {
		1: { initial: true, schema: version1 },
		2: {
			initial: false,
			schema: version2,
			up(previous) {
				const older = version1.parse(previous);
				return { v: 2 as const, stars: older.stars };
			},
		},
	},
});

const gapped = defineDocument({
	latest: 3,
	versions: {
		1: { initial: true, schema: version1 },
		3: {
			initial: false,
			schema: z.strictObject({ v: z.literal(3), stars: z.number() }),
			up: (previous) => previous,
		},
	},
});

test("version 1 migrates to version 2 and keeps stars", () => {
	expect(chain.parse({ v: 1, stars: 2 })).toEqual({
		status: "ok",
		migrated: true,
		document: { v: 2, stars: 2, note: "kept" },
	});
});

test("the latest version is not migrated", () => {
	const document = { v: 2, stars: 2, note: "kept" };
	expect(chain.parse(document)).toEqual({
		status: "ok",
		migrated: false,
		document,
	});
});

test("the same older value migrates the same way twice", () => {
	const input = { v: 1, stars: 2 };
	expect(chain.parse(input)).toEqual(chain.parse(input));
});

test("a step that fails the next schema is invalid", () => {
	expect(brokenStep.parse({ v: 1, stars: 2 })).toEqual({ status: "invalid" });
});

test("a missing intermediate version is invalid", () => {
	expect(gapped.parse({ v: 1, stars: 2 })).toEqual({ status: "invalid" });
});

test("a future version is newer before the body is checked", () => {
	expect(chain.parse({ v: 3 })).toEqual({ status: "newer", version: 3 });
});

test("a non-integer version is invalid", () => {
	for (const value of [{ v: 1.5 }, { v: 0 }, { v: -1 }, { v: "1" }, {}]) {
		const result = chain.parse(value);
		expect(result).toEqual({ status: "invalid" });
		expect(result).not.toMatchObject({ status: "newer" });
	}
});
