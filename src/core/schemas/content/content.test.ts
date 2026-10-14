import { expect, test } from "vitest";
import type { ZodType } from "zod";
import { levelSchema } from "./level";
import { tuningSchema } from "./tuning";
import { zoneSchema } from "./zone";

const space = " ";

function phase(
	name: string,
	durationSeconds: number,
	units: readonly string[] = ["f"],
) {
	return { name, durationSeconds, units };
}

function fivePhases(
	durations: readonly number[],
	units: readonly (readonly string[])[] = durations.map(() => ["f"]),
) {
	const names = ["arrival", "build", "peak", "breather", "finale"] as const;
	return names.map((name, index) =>
		phase(name, durations[index] ?? 1, units[index] ?? ["f"]),
	);
}

function level(overrides: Record<string, unknown> = {}) {
	return {
		id: "level:0.1",
		name: "Twin Beacons",
		zoneId: "zone:0",
		type: "intro",
		tuningId: "tuning:waiting-lanes",
		allowedKeys: ["f", "j", space],
		focusKeys: ["f", "j", space],
		mechanics: ["lanes-wait", "space-pulse"],
		medals: [],
		phases: fivePhases([8, 12, 12, 8, 10]),
		...overrides,
	};
}

function zone(overrides: Record<string, unknown> = {}) {
	return {
		id: "zone:0",
		name: "Home Row Station",
		machine: "machine:skiff",
		keys: ["f", "j", space],
		...overrides,
	};
}

const curriculumBars = {
	one: { accuracyPercent: 92, wpm: 6 },
	two: { accuracyPercent: 95, wpm: 9 },
	three: { accuracyPercent: 97, wpm: 12 },
};

function tuning(overrides: Record<string, unknown> = {}) {
	return {
		id: "tuning:waiting-lanes",
		approachSeconds: 6,
		queueDepth: 1,
		...overrides,
	};
}

function accept(schema: ZodType, value: unknown) {
	expect(schema.safeParse(value).success).toBe(true);
}

function reject(schema: ZodType, value: unknown) {
	expect(schema.safeParse(value).success).toBe(false);
}

test("Home Row Station's shape", () => {
	accept(zoneSchema, zone());
});

test("a zone identity is unusable", () => {
	reject(zoneSchema, zone({ id: "zone:00" }));
	reject(zoneSchema, zone({ name: "" }));
	reject(zoneSchema, zone({ machine: "skiff" }));
	reject(zoneSchema, zone({ keys: ["fj"] }));
	reject(zoneSchema, zone({ keys: ["f", "f"] }));
});

test("an extra field", () => {
	reject(zoneSchema, zone({ gate: 1 }));
	reject(levelSchema, level({ script: "no" }));
	reject(tuningSchema, tuning({ volume: 1 }));
});

test("the zone 1 curriculum bars", () => {
	accept(zoneSchema, zone({ id: "zone:1", starBars: curriculumBars }));
});

test("bars that fail the order or the floor", () => {
	reject(
		zoneSchema,
		zone({
			starBars: {
				one: { accuracyPercent: 95, wpm: 6 },
				two: { accuracyPercent: 95, wpm: 9 },
				three: { accuracyPercent: 97, wpm: 12 },
			},
		}),
	);
	reject(
		zoneSchema,
		zone({
			starBars: {
				one: { accuracyPercent: 92, wpm: 12 },
				two: { accuracyPercent: 95, wpm: 9 },
				three: { accuracyPercent: 97, wpm: 6 },
			},
		}),
	);
	reject(
		zoneSchema,
		zone({
			starBars: {
				one: { accuracyPercent: 90, wpm: 6 },
				two: { accuracyPercent: 95, wpm: 9 },
				three: { accuracyPercent: 97, wpm: 12 },
			},
		}),
	);
	reject(
		zoneSchema,
		zone({
			starBars: {
				one: { accuracyPercent: 92, wpm: 6 },
				two: { accuracyPercent: 95, wpm: 9 },
				three: { accuracyPercent: 100, wpm: 12 },
			},
		}),
	);
});

test("the bounds are inclusive", () => {
	accept(
		zoneSchema,
		zone({
			starBars: {
				one: { accuracyPercent: 91, wpm: 1 },
				two: { accuracyPercent: 92, wpm: 2 },
				three: { accuracyPercent: 99, wpm: 3 },
			},
		}),
	);
});

test("Twin Beacons' shape", () => {
	accept(levelSchema, level());
});

test("First Light's shape", () => {
	const parsed = levelSchema.safeParse(
		level({
			id: "level:1.1",
			name: "First Light",
			zoneId: "zone:1",
			type: "drill",
			mechanics: ["lanes-wait"],
			focusKeys: ["f", "j"],
			medals: ["medal:flawless", "medal:full-clear", "medal:clean-reach"],
		}),
	);
	expect(parsed.success).toBe(true);
	if (parsed.success) {
		expect(parsed.data.medals).toEqual([
			"medal:flawless",
			"medal:full-clear",
			"medal:clean-reach",
		]);
	}
});

test("a level identity is unusable", () => {
	reject(levelSchema, level({ id: "level:1" }));
	reject(levelSchema, level({ type: "words" }));
	reject(levelSchema, level({ mechanics: ["space-pulse"] }));
	reject(levelSchema, level({ mechanics: ["lanes-wait", "static"] }));
	reject(levelSchema, level({ focusKeys: [] }));
	reject(levelSchema, level({ medals: ["medal:flawless", "medal:flawless"] }));
});

test("five short phases", () => {
	accept(levelSchema, level({ phases: fivePhases([8, 12, 12, 8, 10]) }));
});

test("a phase list is unusable", () => {
	reject(
		levelSchema,
		level({ phases: fivePhases([8, 12, 12, 8]).slice(0, 4) }),
	);
	const swapped = fivePhases([8, 12, 12, 8, 10]);
	const arrival = swapped[0];
	const build = swapped[1];
	if (arrival === undefined || build === undefined) {
		throw new Error("expected two phases");
	}
	swapped[0] = build;
	swapped[1] = arrival;
	reject(levelSchema, level({ phases: swapped }));
	reject(levelSchema, level({ phases: fivePhases([0, 12, 12, 8, 10]) }));
	reject(levelSchema, level({ phases: fivePhases([8.5, 12, 12, 8, 10]) }));
	reject(
		levelSchema,
		level({
			phases: fivePhases(
				[8, 12, 12, 8, 10],
				[["f"], ["f"], ["f"], ["f"], [""]],
			),
		}),
	);
	reject(levelSchema, level({ phases: fivePhases([49, 48, 48, 48, 48]) }));
});

test("a full four minutes is accepted", () => {
	accept(levelSchema, level({ phases: fivePhases([48, 48, 48, 48, 48]) }));
});

test("a unit uses an unlearned key", () => {
	reject(
		levelSchema,
		level({
			phases: fivePhases(
				[8, 12, 12, 8, 10],
				[["f"], ["f"], ["k"], ["f"], ["f"]],
			),
		}),
	);
});

test("a focus key leaves the allowed set", () => {
	reject(
		levelSchema,
		level({ focusKeys: ["d"], allowedKeys: ["f", "j", space] }),
	);
});

test("a drill unit misses the focus keys", () => {
	reject(
		levelSchema,
		level({
			id: "level:1.1",
			type: "drill",
			focusKeys: ["f", "j"],
			mechanics: ["lanes-wait"],
			phases: fivePhases(
				[8, 12, 12, 8, 10],
				[["f"], ["j"], [space], ["f"], ["fj"]],
			),
		}),
	);
});

test("an intro unit without a focus key is accepted", () => {
	accept(
		levelSchema,
		level({
			focusKeys: ["f"],
			allowedKeys: ["f", space],
			phases: fivePhases(
				[8, 12, 12, 8, 10],
				[["f"], ["f"], ["f"], ["f"], [space]],
			),
		}),
	);
});

test("waiting-lane tuning", () => {
	accept(tuningSchema, tuning());
});

test("the approach bounds are inclusive", () => {
	accept(tuningSchema, tuning({ approachSeconds: 1.5, queueDepth: 6 }));
	accept(tuningSchema, tuning({ approachSeconds: 6, queueDepth: 1 }));
});

test("tuning is out of range", () => {
	reject(tuningSchema, tuning({ approachSeconds: 1.4 }));
	reject(tuningSchema, tuning({ approachSeconds: 6.1 }));
	reject(tuningSchema, tuning({ queueDepth: 0 }));
	reject(tuningSchema, tuning({ queueDepth: 7 }));
	reject(tuningSchema, tuning({ queueDepth: 1.5 }));
});
