import { expect, test } from "vitest";
import {
	acceptLevel,
	acceptTuning,
	contentVersionOf,
	loadBundledContent,
} from "./load";

const space = " ";

function phases(
	units: readonly (readonly string[])[] = [["f"], ["f"], ["f"], ["f"], ["fj"]],
) {
	const names = ["arrival", "build", "peak", "breather", "finale"] as const;
	const durations = [8, 12, 12, 8, 10];
	return names.map((name, index) => ({
		name,
		durationSeconds: durations[index],
		units: units[index] ?? ["f"],
	}));
}

function level(overrides: Record<string, unknown> = {}) {
	return {
		id: "level:0.1",
		name: "Twin Beacons",
		zoneId: "zone:0",
		type: "intro",
		tuningId: "tuning:waiting-lanes",
		allowedKeys: ["f", "j", space],
		focusKeys: ["f", "j"],
		mechanics: ["lanes-wait"],
		medals: [],
		phases: phases(),
		...overrides,
	};
}

const bars = {
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

function zone(overrides: Record<string, unknown> = {}) {
	return {
		id: "zone:0",
		name: "Home Row Station",
		machine: "machine:skiff",
		keys: ["f", "j", space],
		...overrides,
	};
}

function bundle(
	extra: readonly { path: string; value: unknown }[] = [],
	levelValue: unknown = level(),
) {
	return [
		{ path: "zones/0-home-row-station.json", value: zone() },
		{ path: "tuning/waiting-lanes.json", value: tuning() },
		{ path: "levels/0-1-twin-beacons.json", value: levelValue },
		...extra,
	];
}

test("zone 0 includes bars", () => {
	const result = loadBundledContent(
		bundle([], level()).map((file) =>
			file.path.startsWith("zones/")
				? { ...file, value: zone({ starBars: bars }) }
				: file,
		),
	);
	expect(result.ok).toBe(false);
});

test("another zone omits bars", () => {
	const result = loadBundledContent([
		{
			path: "zones/1-the-drift.json",
			value: zone({ id: "zone:1", name: "The Drift" }),
		},
		{ path: "tuning/waiting-lanes.json", value: tuning() },
		{
			path: "levels/1-1-first-light.json",
			value: level({
				id: "level:1.1",
				name: "First Light",
				zoneId: "zone:1",
				type: "drill",
			}),
		},
	]);
	expect(result.ok).toBe(false);
});

test("keys come back sorted", () => {
	const accepted = acceptLevel(level({ allowedKeys: [space, "j", "f"] }));
	expect(accepted.allowedKeys).toEqual([space, "f", "j"]);
});

test("key list order does not change the version", () => {
	const forward = acceptLevel(level({ allowedKeys: ["f", "j", space] }));
	const backward = acceptLevel(level({ allowedKeys: [space, "j", "f"] }));
	const lanes = acceptTuning(tuning());
	expect(contentVersionOf(forward, null, lanes)).toBe(
		contentVersionOf(backward, null, lanes),
	);
});

test("unit order changes the version", () => {
	const lanes = acceptTuning(tuning());
	const first = acceptLevel(level());
	const swapped = acceptLevel(
		level({
			phases: phases([["fj"], ["f"], ["f"], ["f"], ["f"]]),
		}),
	);
	expect(contentVersionOf(first, null, lanes)).not.toBe(
		contentVersionOf(swapped, null, lanes),
	);
});

test("a level names a missing zone", () => {
	const result = loadBundledContent(bundle([], level({ zoneId: "zone:9" })));
	expect(result.ok).toBe(false);
});

test("a level names a missing tuning id", () => {
	const result = loadBundledContent(
		bundle([], level({ tuningId: "tuning:missing" })),
	);
	expect(result.ok).toBe(false);
});

test("two levels share an id", () => {
	const result = loadBundledContent(
		bundle([
			{
				path: "levels/0-1-also-beacons.json",
				value: level({ name: "Also Beacons" }),
			},
		]),
	);
	expect(result.ok).toBe(false);
});

test("the file name disagrees with the id", () => {
	const result = loadBundledContent(bundle([], level({ id: "level:1.1" })));
	expect(result.ok).toBe(false);
	if (!result.ok) {
		expect(
			result.errors.some(
				(error) =>
					error.path.includes("0-1-twin-beacons.json") &&
					error.message.includes("file name"),
			),
		).toBe(true);
	}
});

test("a slug with a leading zero or an empty word", () => {
	const leadingZero = loadBundledContent([
		{
			path: "zones/01-station.json",
			value: zone({ id: "zone:1", name: "The Drift", starBars: bars }),
		},
		{ path: "tuning/waiting-lanes.json", value: tuning() },
		{
			path: "levels/1-1-first-light.json",
			value: level({ id: "level:1.1", zoneId: "zone:1", type: "drill" }),
		},
	]);
	const emptyWord = loadBundledContent([
		{ path: "zones/0-.json", value: zone() },
		{ path: "tuning/waiting-lanes.json", value: tuning() },
		{ path: "levels/0-1-twin-beacons.json", value: level() },
	]);
	expect(leadingZero.ok).toBe(false);
	if (!leadingZero.ok) {
		expect(
			leadingZero.errors.some(
				(error) =>
					error.path.includes("01-station.json") &&
					error.message.includes("file name"),
			),
		).toBe(true);
	}
	expect(emptyWord.ok).toBe(false);
});

test("a markdown file beside the zones", () => {
	const result = loadBundledContent(
		bundle([{ path: "zones/readme.md", value: null }]),
	);
	expect(result.ok).toBe(true);
	if (result.ok) {
		expect(result.content.zones["zone:0"]?.name).toBe("Home Row Station");
	}
});

test("an allowed key leaves the zone", () => {
	const result = loadBundledContent(
		bundle([], level({ allowedKeys: ["f", "j", space, "a"] })),
	);
	expect(result.ok).toBe(false);
});

test("the same inputs repeat", () => {
	const accepted = acceptLevel(level());
	const lanes = acceptTuning(tuning());
	const first = contentVersionOf(accepted, bars, lanes);
	const second = contentVersionOf(accepted, bars, lanes);
	expect(first).toBe(second);
	expect(first).toMatch(/^[0-9a-f]{64}$/);
});

test("a unit edit changes the version", () => {
	const lanes = acceptTuning(tuning());
	const before = contentVersionOf(acceptLevel(level()), null, lanes);
	const after = contentVersionOf(
		acceptLevel(
			level({ phases: phases([["j"], ["f"], ["f"], ["f"], ["fj"]]) }),
		),
		null,
		lanes,
	);
	expect(before).not.toBe(after);
});

test("a star-bar edit changes the version", () => {
	const accepted = acceptLevel(level());
	const lanes = acceptTuning(tuning());
	const edited = {
		...bars,
		one: { accuracyPercent: 92, wpm: 7 },
	};
	expect(contentVersionOf(accepted, bars, lanes)).not.toBe(
		contentVersionOf(accepted, edited, lanes),
	);
});

test("a tuning edit changes the version", () => {
	const accepted = acceptLevel(level());
	const before = contentVersionOf(accepted, null, acceptTuning(tuning()));
	const after = contentVersionOf(
		accepted,
		null,
		acceptTuning(tuning({ queueDepth: 2 })),
	);
	expect(before).not.toBe(after);
});

test("the sector name leaves the version unchanged", () => {
	const renamed = loadBundledContent(
		bundle().map((file) =>
			file.path.startsWith("zones/")
				? { ...file, value: zone({ name: "Launch Bay" }) }
				: file,
		),
	);
	const original = loadBundledContent(bundle());
	expect(original.ok).toBe(true);
	expect(renamed.ok).toBe(true);
	if (original.ok && renamed.ok) {
		expect(original.content.levels["level:0.1"]?.contentVersion).toBe(
			renamed.content.levels["level:0.1"]?.contentVersion,
		);
	}
});

test("zone 0 hashes null bars", () => {
	const result = loadBundledContent(bundle());
	expect(result.ok).toBe(true);
	if (!result.ok) {
		return;
	}
	const loaded = result.content.levels["level:0.1"];
	expect(loaded).toBeDefined();
	if (loaded === undefined) {
		return;
	}
	const { contentVersion, ...accepted } = loaded;
	const lanes = result.content.tuning["tuning:waiting-lanes"];
	expect(lanes).toBeDefined();
	if (lanes === undefined) {
		return;
	}
	expect(contentVersion).toBe(contentVersionOf(accepted, null, lanes));
});
