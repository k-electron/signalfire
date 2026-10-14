import { expect, test } from "vitest";
import { contentVersionOf } from "../../core/content/load";
import { campaign } from "./campaign";

const space = " ";

function unitsOf(
	level: (typeof campaign.levels)[string] | undefined,
): string[] {
	if (level === undefined) {
		return [];
	}
	return level.phases.flatMap((phase) => [...phase.units]);
}

test("levels 0.1 and 1.1 load", () => {
	const zone0 = campaign.zones["zone:0"];
	const zone1 = campaign.zones["zone:1"];
	const level01 = campaign.levels["level:0.1"];
	const level11 = campaign.levels["level:1.1"];
	const lanes = campaign.tuning["tuning:waiting-lanes"];

	expect(zone0).toMatchObject({
		name: "Home Row Station",
		machine: "machine:skiff",
		keys: ["f", "j", space],
	});
	expect(zone0?.starBars).toBeUndefined();
	expect(zone1).toMatchObject({
		name: "The Drift",
		machine: "machine:skiff",
		keys: ["f", "j", space],
		starBars: {
			one: { accuracyPercent: 92, wpm: 6 },
			two: { accuracyPercent: 95, wpm: 9 },
			three: { accuracyPercent: 97, wpm: 12 },
		},
	});

	expect(level01).toMatchObject({
		name: "Twin Beacons",
		type: "intro",
		zoneId: "zone:0",
		mechanics: ["lanes-wait", "space-pulse"],
		medals: [],
	});
	const finale = level01?.phases[4];
	expect(finale?.name).toBe("finale");
	expect(finale?.units.some((unit) => unit.includes(space))).toBe(true);

	expect(level11).toMatchObject({
		name: "First Light",
		type: "drill",
		zoneId: "zone:1",
		mechanics: ["lanes-wait"],
		medals: ["medal:flawless", "medal:full-clear", "medal:clean-reach"],
	});

	for (const unit of [...unitsOf(level01), ...unitsOf(level11)]) {
		expect(
			[...unit].every((character) => ["f", "j", space].includes(character)),
		).toBe(true);
	}
	for (const unit of unitsOf(level11)) {
		expect(unit.includes("f") || unit.includes("j")).toBe(true);
	}

	expect(lanes).toMatchObject({ approachSeconds: 6, queueDepth: 1 });
});

test("the app matches the digest", () => {
	for (const id of ["level:0.1", "level:1.1"] as const) {
		const loaded = campaign.levels[id];
		expect(loaded).toBeDefined();
		if (loaded === undefined) {
			continue;
		}
		const zone = campaign.zones[loaded.zoneId];
		const lanes = campaign.tuning[loaded.tuningId];
		expect(zone).toBeDefined();
		expect(lanes).toBeDefined();
		if (zone === undefined || lanes === undefined) {
			continue;
		}
		const { contentVersion, ...level } = loaded;
		expect(contentVersion).toBe(
			contentVersionOf(level, zone.starBars ?? null, lanes),
		);
	}
});
