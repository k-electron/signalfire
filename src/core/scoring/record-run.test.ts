import { expect, test } from "vitest";
import { progress } from "../schemas/progress";
import {
	type CadetRun,
	type ProgressDocument,
	recordCadetRun,
} from "./record-run";

const when = "2026-10-12T20:00:00.000Z";
const later = "2026-10-12T21:00:00.000Z";

function emptyDocument(): ProgressDocument {
	return { v: 1, updatedAt: when, rev: 0, levels: {} };
}

function tier(
	overrides: Partial<ProgressDocument["levels"][string]["cadet"]> = {},
) {
	return {
		stars: 0,
		medals: [] as string[],
		bestScore: 0,
		bestNetWpm: 0,
		bestAccuracy: 0,
		attempts: 0,
		failedSinceLastStar: 0,
		calmUnlocked: false,
		...overrides,
	};
}

function run(overrides: Partial<CadetRun> = {}): CadetRun {
	return {
		levelId: "level:1.1",
		tier: "cadet",
		stars: 0,
		score: 0,
		accuracy: 0,
		netWpm: 0,
		...overrides,
	};
}

test("the first miss creates the Cadet record", () => {
	const result = recordCadetRun(
		emptyDocument(),
		run({ score: 260, accuracy: 0.5, netWpm: 12 }),
		true,
		later,
	);
	expect(progress.parse(result)).toEqual({
		status: "ok",
		migrated: false,
		document: result,
	});
	expect(result).toEqual({
		v: 1,
		updatedAt: later,
		rev: 1,
		levels: {
			"level:1.1": {
				cadet: {
					stars: 0,
					medals: [],
					bestScore: 260,
					bestNetWpm: 12,
					bestAccuracy: 0.5,
					attempts: 1,
					failedSinceLastStar: 1,
					calmUnlocked: false,
				},
			},
		},
	});
});

test("a worse run keeps stars and bests", () => {
	const start: ProgressDocument = {
		...emptyDocument(),
		levels: {
			"level:1.1": {
				cadet: tier({
					stars: 2,
					bestScore: 400,
					bestNetWpm: 12,
					bestAccuracy: 0.95,
					attempts: 1,
				}),
			},
		},
	};
	const result = recordCadetRun(
		start,
		run({ score: 100, accuracy: 0.99, netWpm: 8 }),
		true,
		later,
	);
	expect(result.levels["level:1.1"]?.cadet).toMatchObject({
		stars: 2,
		bestScore: 400,
		bestNetWpm: 12,
		bestAccuracy: 0.99,
		attempts: 2,
	});
});

test("a medal and calm unlocked stay", () => {
	const start: ProgressDocument = {
		...emptyDocument(),
		levels: {
			"level:1.1": {
				cadet: tier({
					stars: 1,
					medals: ["medal:flawless"],
					calmUnlocked: true,
				}),
			},
		},
	};
	const result = recordCadetRun(
		start,
		run({ stars: 0, score: 10, accuracy: 0.5, netWpm: 1 }),
		true,
		later,
	);
	expect(result.levels["level:1.1"]?.cadet).toMatchObject({
		medals: ["medal:flawless"],
		calmUnlocked: true,
		stars: 1,
	});
});

test("another level and Veteran stay", () => {
	const start: ProgressDocument = {
		...emptyDocument(),
		levels: {
			"level:0.1": { cadet: tier() },
			"level:1.1": { veteran: tier({ stars: 3 }) },
		},
	};
	const result = recordCadetRun(
		start,
		run({ stars: 1, score: 10, accuracy: 1, netWpm: 6 }),
		true,
		later,
	);
	expect(result.levels["level:0.1"]?.cadet?.stars).toBe(0);
	expect(result.levels["level:1.1"]?.veteran?.stars).toBe(3);
});

test("a star resets the failure count", () => {
	let document = emptyDocument();
	document = recordCadetRun(document, run({ stars: 0 }), true, later);
	expect(document.levels["level:1.1"]?.cadet?.failedSinceLastStar).toBe(1);
	document = recordCadetRun(document, run({ stars: 2 }), true, later);
	expect(document.levels["level:1.1"]?.cadet?.failedSinceLastStar).toBe(0);
	document = recordCadetRun(document, run({ stars: 0 }), true, later);
	expect(document.levels["level:1.1"]?.cadet?.failedSinceLastStar).toBe(1);
});

test("a star below the stored best still resets the count", () => {
	const start: ProgressDocument = {
		...emptyDocument(),
		levels: {
			"level:1.1": {
				cadet: tier({ stars: 2, failedSinceLastStar: 4 }),
			},
		},
	};
	const result = recordCadetRun(start, run({ stars: 1 }), true, later);
	expect(result.levels["level:1.1"]?.cadet).toMatchObject({
		stars: 2,
		failedSinceLastStar: 0,
	});
});

test("zone 0 does not count a failure", () => {
	let document = emptyDocument();
	document = recordCadetRun(
		document,
		run({ levelId: "level:0.1", stars: 0 }),
		false,
		later,
	);
	expect(document.levels["level:0.1"]?.cadet?.failedSinceLastStar).toBe(0);
	document = recordCadetRun(
		document,
		run({ levelId: "level:0.1", stars: 0 }),
		false,
		later,
	);
	expect(document.levels["level:0.1"]?.cadet?.failedSinceLastStar).toBe(0);
});

test("a Veteran run leaves progress unchanged", () => {
	const document: ProgressDocument = {
		...emptyDocument(),
		levels: { "level:1.1": { cadet: tier({ stars: 1 }) } },
	};
	const snapshot = structuredClone(document);
	expect(() =>
		recordCadetRun(document, run({ tier: "veteran" }), true, later),
	).toThrow(RangeError);
	expect(document).toEqual(snapshot);
});
