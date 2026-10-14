import { expect, test } from "vitest";
import zone0File from "../../../content/zones/0-home-row-station.json" with {
	type: "json",
};
import zone1File from "../../../content/zones/1-the-drift.json" with {
	type: "json",
};
import { acceptZone } from "../content/load";
import { awardStars, type StarBars } from "./stars";

const zone0 = acceptZone(zone0File);
const zone1 = acceptZone(zone1File);

const bars: StarBars = {
	one: { accuracyPercent: 92, wpm: 6 },
	two: { accuracyPercent: 95, wpm: 9 },
	three: { accuracyPercent: 97, wpm: 12 },
};

function award(
	correctFirstAttempts: number,
	firstAttempts: number,
	netWpm: number,
	options: {
		readonly finished?: boolean;
		readonly starBars?: StarBars | null;
	} = {},
) {
	return awardStars({
		finished: options.finished ?? true,
		correctFirstAttempts,
		firstAttempts,
		netWpm,
		starBars: options.starBars === undefined ? bars : options.starBars,
	});
}

test("the shipped zone 1 bars", () => {
	expect(zone1.starBars).toEqual(bars);
});

test("both 1-star bars earn one star", () => {
	expect(award(92, 100, 6).stars).toBe(1);
});

test("both 2-star bars earn two stars", () => {
	expect(award(95, 100, 9).stars).toBe(2);
});

test("both 3-star bars earn three stars", () => {
	expect(award(97, 100, 12).stars).toBe(3);
});

test("past the top bar stays at three", () => {
	expect(award(100, 100, 1000).stars).toBe(3);
});

test("speed without accuracy earns nothing", () => {
	expect(award(91, 100, 12).stars).toBe(0);
});

test("accuracy without speed earns nothing", () => {
	expect(award(92, 100, 5.9).stars).toBe(0);
});

test("a higher accuracy bar without its speed stays lower", () => {
	expect(award(95, 100, 6).stars).toBe(1);
});

test("no first attempt is full Integrity", () => {
	expect(award(0, 0, 12).stars).toBe(3);
});

test("the 1-star speed boundary is exact", () => {
	expect(award(92, 100, 6).stars).toBe(1);
	expect(award(92, 100, 5.9).stars).toBe(0);
});

test("the shipped zone 0 has no bars", () => {
	expect(zone0.starBars).toBeUndefined();
});

test("a perfect run without bars earns nothing", () => {
	expect(award(100, 100, 1000, { starBars: null }).stars).toBe(0);
});

test("a passing run that did not end earns nothing", () => {
	expect(award(100, 100, 1000, { finished: false }).stars).toBe(0);
});

test("only Integrity is short", () => {
	expect(award(1, 2, 12)).toEqual({
		stars: 0,
		missed: [
			{
				kind: "integrity",
				measuredPercent: 50,
				neededPercent: 92,
				shortfallPercent: 42,
			},
		],
	});
});

test("only Velocity is short", () => {
	expect(award(100, 100, 0)).toEqual({
		stars: 0,
		missed: [
			{
				kind: "velocity",
				measuredWpm: 0,
				neededWpm: 6,
				shortfallWpm: 6,
			},
		],
	});
});

test("both 1-star bars are short", () => {
	expect(award(9, 10, 4)).toEqual({
		stars: 0,
		missed: [
			{
				kind: "integrity",
				measuredPercent: 90,
				neededPercent: 92,
				shortfallPercent: 2,
			},
			{
				kind: "velocity",
				measuredWpm: 4,
				neededWpm: 6,
				shortfallWpm: 2,
			},
		],
	});
});

test("one earned star reports nothing", () => {
	expect(award(95, 100, 6)).toEqual({ stars: 1, missed: [] });
});

test("zone 0 reports nothing", () => {
	expect(award(0, 1, 0, { starBars: null })).toEqual({
		stars: 0,
		missed: [],
	});
});

test("an unfinished run reports nothing", () => {
	expect(award(0, 1, 0, { finished: false })).toEqual({
		stars: 0,
		missed: [],
	});
});
