/// <reference types="vite/client" />
import { expect, test } from "vitest";
import profileFixture from "./fixtures/profile/v1.json" with { type: "json" };
import progressFixture from "./fixtures/progress/v1.json" with { type: "json" };
import runIndexFixture from "./fixtures/run-index/v1.json" with {
	type: "json",
};
import runLogFixture from "./fixtures/run-log/v1.json" with { type: "json" };
import settingsFixture from "./fixtures/settings/v1.json" with { type: "json" };
import type { ParseResult } from "./parse";
import { profile } from "./profile";
import { progress } from "./progress";
import { runIndex } from "./run-index";
import { runLog } from "./run-log";
import { settings } from "./settings";

const when = "2026-10-12T20:00:00.000Z";

const cadet = {
	stars: 2,
	medals: ["medal:flawless"],
	bestScore: 100,
	bestNetWpm: 12.5,
	bestAccuracy: 0.95,
	attempts: 3,
	failedSinceLastStar: 1,
	calmUnlocked: false,
};

function expectOk<T>(result: ParseResult<T>, migrated = false): T {
	expect(result.status).toBe("ok");
	if (result.status !== "ok") {
		throw new Error("expected an ok document");
	}
	expect(result.migrated).toBe(migrated);
	expect(result.document).toMatchObject({ v: 1 });
	return result.document;
}

test("an offset instant and a zero revision are accepted", () => {
	expectOk(
		profile.parse({ ...profileFixture, updatedAt: "2026-10-12T20:00:00.000Z" }),
	);
	expectOk(
		profile.parse({
			...profileFixture,
			updatedAt: "2026-10-12T16:00:00-04:00",
		}),
	);
});

test("a local time or a bad revision is invalid", () => {
	for (const patch of [
		{ updatedAt: "2026-10-12T20:00:00" },
		{ updatedAt: "2026-10-12" },
		{ rev: -1 },
		{ rev: 1.5 },
	]) {
		expect(profile.parse({ ...profileFixture, ...patch })).toEqual({
			status: "invalid",
		});
	}
});

test("the shipped profile parses", () => {
	const document = expectOk(profile.parse(profileFixture));
	expect(document).toMatchObject({
		callSign: "Ada",
		createdAt: when,
		onboardingComplete: false,
		preferredThumb: "either",
	});
});

test("the thumb is one of the three choices", () => {
	for (const preferredThumb of ["left", "right", "either"] as const) {
		expectOk(profile.parse({ ...profileFixture, preferredThumb }));
	}
});

test("a bad call sign or thumb is invalid", () => {
	for (const patch of [
		{ callSign: "" },
		{ callSign: " Ada" },
		{ callSign: "a".repeat(25) },
		{ preferredThumb: "both" },
	]) {
		expect(profile.parse({ ...profileFixture, ...patch })).toEqual({
			status: "invalid",
		});
	}
});

test("a future profile is newer", () => {
	const { callSign: _callSign, ...withoutCallSign } = profileFixture;
	expect(profile.parse({ ...withoutCallSign, v: 2 })).toEqual({
		status: "newer",
		version: 2,
	});
});

test("a known version fails its schema", () => {
	expect(profile.parse({ ...profileFixture, callSign: "" })).toEqual({
		status: "invalid",
	});
});

test("the shipped settings parse", () => {
	expectOk(settings.parse(settingsFixture));
});

test("a volume or intensity outside the set is invalid", () => {
	expect(settings.parse({ ...settingsFixture, master: -0.1 })).toEqual({
		status: "invalid",
	});
	expect(settings.parse({ ...settingsFixture, master: 1.1 })).toEqual({
		status: "invalid",
	});
	expect(
		settings.parse({ ...settingsFixture, effectsIntensity: "ultra" }),
	).toEqual({ status: "invalid" });
});

test("an empty progress document parses", () => {
	expectOk(
		progress.parse({
			v: 1,
			updatedAt: when,
			rev: 0,
			levels: {},
		}),
	);
});

test("a cadet result parses and keeps its stars", () => {
	const document = expectOk(progress.parse(progressFixture));
	expect(document.levels["level:1.1"]?.cadet?.stars).toBe(2);
});

test("a side level is a progress key", () => {
	expectOk(
		progress.parse({
			v: 1,
			updatedAt: when,
			rev: 0,
			levels: { "side:3.blackout": { cadet } },
		}),
	);
});

test("a level result outside its ranges is invalid", () => {
	const cases = [
		{ "level:1.1": { cadet: { ...cadet, stars: 4 } } },
		{ "level:1.1": { cadet: { ...cadet, bestAccuracy: 1.5 } } },
		{
			"level:1.1": {
				cadet: { ...cadet, medals: ["medal:flawless", "medal:flawless"] },
			},
		},
		{ "level:1": { cadet } },
		{ "level:1.1": {} },
	];
	for (const levels of cases) {
		expect(progress.parse({ v: 1, updatedAt: when, rev: 0, levels })).toEqual({
			status: "invalid",
		});
	}
});

test("an unknown field fails the known version", () => {
	expect(progress.parse({ ...progressFixture, mods: [] })).toEqual({
		status: "invalid",
	});
});

test("the shipped campaign log parses", () => {
	expectOk(runLog.parse(runLogFixture));
});

test("the documented modes are accepted", () => {
	for (const mode of [
		"campaign",
		"repair",
		"systems-check",
		"courier",
		"daily-signal",
		"deep-archive",
	]) {
		expectOk(runLog.parse({ ...runLogFixture, mode }));
	}
});

test("input flags use three bits", () => {
	for (const flags of [0, 1, 2, 4, 6, 7]) {
		expectOk(
			runLog.parse({
				...runLogFixture,
				inputs: [[0, 102, flags]],
			}),
		);
	}
	expectOk(runLog.parse({ ...runLogFixture, inputs: [[0, 32, 0]] }));
});

test("a bad input, mode, or summary is invalid", () => {
	const cases = [
		{ inputs: [[0, 102, 8]] },
		{ inputs: [[0, 55296, 0]] },
		{ mode: "practice" },
		{ contentVersion: "" },
		{ summary: { ...runLogFixture.summary, stars: 4 } },
	];
	for (const patch of cases) {
		expect(runLog.parse({ ...runLogFixture, ...patch })).toEqual({
			status: "invalid",
		});
	}
});

test("the shipped index parses", () => {
	expectOk(runIndex.parse(runIndexFixture));
});

test("best and recent are the kept kinds", () => {
	for (const kind of ["best", "recent"]) {
		expectOk(
			runIndex.parse({
				...runIndexFixture,
				kept: [{ ...runIndexFixture.kept[0], kind }],
			}),
		);
	}
});

test("a duplicate run or an unknown kind is invalid", () => {
	const entry = runIndexFixture.kept[0];
	expect(
		runIndex.parse({
			...runIndexFixture,
			kept: [entry, entry],
		}),
	).toEqual({ status: "invalid" });
	expect(
		runIndex.parse({
			...runIndexFixture,
			kept: [{ ...entry, kind: "ghost" }],
		}),
	).toEqual({ status: "invalid" });
});

test("the shipped examples migrate and validate", () => {
	for (const [parser, fixture] of [
		[profile, profileFixture],
		[settings, settingsFixture],
		[progress, progressFixture],
		[runLog, runLogFixture],
		[runIndex, runIndexFixture],
	] as const) {
		const result = parser.parse(fixture);
		expect(result).toMatchObject({
			status: "ok",
			migrated: false,
			document: { v: 1 },
		});
	}
});

test("a major.minor.patch engine version is accepted", () => {
	expect(
		runLog.parse({ ...runLogFixture, engineVersion: "0.0.0" }).status,
	).toBe("ok");
	expect(
		runLog.parse({ ...runLogFixture, engineVersion: "1.2.3" }).status,
	).toBe("ok");
});

test("an engine version without three parts is invalid", () => {
	for (const engineVersion of ["0-stand-in", "1", "1.2", "01.0.0"]) {
		expect(runLog.parse({ ...runLogFixture, engineVersion })).toEqual({
			status: "invalid",
		});
	}
});

test("each version file parses", () => {
	const fixtures = import.meta.glob("./fixtures/**/v*.json", {
		eager: true,
	}) as Record<string, { default: unknown }>;
	const shipped = [
		["profile", profile],
		["settings", settings],
		["progress", progress],
		["run-log", runLog],
		["run-index", runIndex],
	] as const;
	for (const [name, parser] of shipped) {
		const paths = parser.versions.map(
			(version) => `./fixtures/${name}/v${version}.json`,
		);
		expect(paths.map((path) => fixtures[path] !== undefined)).toEqual(
			paths.map(() => true),
		);
		const found = Object.keys(fixtures)
			.filter((path) => path.startsWith(`./fixtures/${name}/`))
			.sort();
		expect(found).toEqual([...paths].sort());
		for (const path of paths) {
			const file = fixtures[path];
			expect(file).toBeDefined();
			expect(parser.parse(file?.default)).toMatchObject({ status: "ok" });
		}
	}
});
