import { fc, test } from "@fast-check/vitest";
import { expect } from "vitest";
import {
	type ProgressDocument,
	recordCadetRun,
	type TierRecord,
} from "./record-run";

const fraction = fc.integer({ min: 0, max: 100 }).map((value) => value / 100);

const tier = fc.record({
	stars: fc.integer({ min: 0, max: 3 }),
	medals: fc.constant(["medal:flawless"]),
	bestScore: fc.integer({ min: 0, max: 5000 }),
	bestNetWpm: fc.integer({ min: 0, max: 200 }),
	bestAccuracy: fraction,
	attempts: fc.integer({ min: 0, max: 5 }),
	failedSinceLastStar: fc.integer({ min: 0, max: 5 }),
	calmUnlocked: fc.boolean(),
});

const sample = fc.record({
	stars: fc.integer({ min: 0, max: 3 }),
	score: fc.integer({ min: 0, max: 5000 }),
	accuracy: fraction,
	netWpm: fc.integer({ min: 0, max: 200 }),
	hasBars: fc.boolean(),
});

test.prop([tier, fc.array(sample, { maxLength: 8 })])(
	"any later Cadet run keeps stars, bests, and medals",
	(start, runs) => {
		let document: ProgressDocument = {
			v: 1,
			updatedAt: "2026-10-12T20:00:00.000Z",
			rev: 0,
			levels: { "level:1.1": { cadet: start } },
		};
		let previous: TierRecord = start;
		for (const [index, next] of runs.entries()) {
			document = recordCadetRun(
				document,
				{
					levelId: "level:1.1",
					tier: "cadet",
					stars: next.stars,
					score: next.score,
					accuracy: next.accuracy,
					netWpm: next.netWpm,
				},
				next.hasBars,
				`2026-10-12T21:${String(index).padStart(2, "0")}:00.000Z`,
			);
			const cadet = document.levels["level:1.1"]?.cadet;
			expect(cadet).toBeDefined();
			if (cadet === undefined) {
				return;
			}
			expect(cadet.stars).toBeGreaterThanOrEqual(previous.stars);
			expect(cadet.stars).toBeLessThanOrEqual(3);
			expect(Number.isInteger(cadet.stars)).toBe(true);
			expect(cadet.bestScore).toBeGreaterThanOrEqual(previous.bestScore);
			expect(cadet.bestNetWpm).toBeGreaterThanOrEqual(previous.bestNetWpm);
			expect(cadet.bestAccuracy).toBeGreaterThanOrEqual(previous.bestAccuracy);
			expect(cadet.attempts).toBe(previous.attempts + 1);
			expect(cadet.medals).toEqual(["medal:flawless"]);
			previous = cadet;
		}
	},
);
