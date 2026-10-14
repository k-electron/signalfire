import { fc, test } from "@fast-check/vitest";
import { expect } from "vitest";
import { awardStars, type StarBars } from "./stars";

function rising(min: number, max: number) {
	return fc
		.tuple(
			fc.integer({ min, max }),
			fc.integer({ min, max }),
			fc.integer({ min, max }),
		)
		.filter(([one, two, three]) => one < two && two < three);
}

const bars = fc.tuple(rising(91, 99), rising(1, 40)).map(
	([[oneAccuracy, twoAccuracy, threeAccuracy], [oneWpm, twoWpm, threeWpm]]) =>
		({
			one: { accuracyPercent: oneAccuracy, wpm: oneWpm },
			two: { accuracyPercent: twoAccuracy, wpm: twoWpm },
			three: { accuracyPercent: threeAccuracy, wpm: threeWpm },
		}) satisfies StarBars,
);

const measurement = fc.integer({ min: 0, max: 30 }).chain((correct) =>
	fc.record({
		correctFirstAttempts: fc.constant(correct),
		firstAttempts:
			correct === 0
				? fc.integer({ min: 0, max: 30 })
				: fc.integer({ min: correct, max: correct + 30 }),
		netWpm: fc.integer({ min: 0, max: 80 }),
	}),
);

function ratio(input: {
	readonly correctFirstAttempts: number;
	readonly firstAttempts: number;
}): number {
	if (input.firstAttempts === 0) {
		return 1;
	}
	return input.correctFirstAttempts / input.firstAttempts;
}

test.prop([bars, measurement, measurement])(
	"any cleaner and faster pair keeps the stars",
	(starBars, left, right) => {
		const first = awardStars({
			finished: true,
			starBars,
			...left,
		});
		const second = awardStars({
			finished: true,
			starBars,
			...right,
		});
		expect(first.stars).toBeGreaterThanOrEqual(0);
		expect(first.stars).toBeLessThanOrEqual(3);
		expect(Number.isInteger(first.stars)).toBe(true);
		expect(second.stars).toBeGreaterThanOrEqual(0);
		expect(second.stars).toBeLessThanOrEqual(3);
		expect(Number.isInteger(second.stars)).toBe(true);
		if (ratio(right) >= ratio(left) && right.netWpm >= left.netWpm) {
			expect(second.stars).toBeGreaterThanOrEqual(first.stars);
		}
	},
);

test.prop([fc.boolean(), fc.option(bars, { nil: null }), measurement])(
	"every award is from 0 through 3",
	(finished, starBars, sample) => {
		const award = awardStars({
			finished,
			starBars,
			...sample,
		});
		expect(award.stars).toBeGreaterThanOrEqual(0);
		expect(award.stars).toBeLessThanOrEqual(3);
		expect(Number.isInteger(award.stars)).toBe(true);
		if (starBars === null) {
			expect(award.stars).toBe(0);
		}
	},
);
