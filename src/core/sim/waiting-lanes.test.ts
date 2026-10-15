import { expect, test } from "vitest";
import level01File from "../../../content/levels/0-1-twin-beacons.json" with {
	type: "json",
};
import level11File from "../../../content/levels/1-1-first-light.json" with {
	type: "json",
};
import tuningFile from "../../../content/tuning/waiting-lanes.json" with {
	type: "json",
};
import zone0File from "../../../content/zones/0-home-row-station.json" with {
	type: "json",
};
import zone1File from "../../../content/zones/1-the-drift.json" with {
	type: "json",
};
import { acceptLevel, acceptTuning, acceptZone } from "../content/load";
import { createOutbox, type Outbox } from "../ports/outbox";
import { runLog } from "../schemas/run-log";
import {
	createWaitingLanesRun,
	replayWaitingLanes,
	type WaitingLanesRun,
} from "./waiting-lanes";

const F = 102;
const J = 106;
const SPACE = 32;

const level01 = acceptLevel(level01File);
const level11 = acceptLevel(level11File);
const tuning = acceptTuning(tuningFile);
const zone0 = acceptZone(zone0File);
const zone1 = acceptZone(zone1File);

const integrityMiss = {
	kind: "integrity" as const,
	measuredPercent: 50,
	neededPercent: 92,
	shortfallPercent: 42,
};

const velocityMiss = {
	kind: "velocity" as const,
	measuredWpm: 0,
	neededWpm: 6,
	shortfallWpm: 6,
};

function zoneFor(levelId: string) {
	if (levelId === level01.id) {
		return zone0;
	}
	if (levelId === level11.id) {
		return zone1;
	}
	throw new RangeError("The level has no shipped zone.");
}

function identity(levelId: string, contentVersion = "demo") {
	return {
		runId: "01AFQCG20004HMASW9NF6YY41J",
		levelId,
		tier: "cadet" as const,
		mode: "campaign" as const,
		contentVersion,
		startedAt: "2026-10-12T20:00:00.000Z",
		updatedAt: "2026-10-12T20:00:00.000Z",
		rev: 0,
	};
}

function open(level: typeof level11, seed: string, contentVersion = "demo") {
	return createWaitingLanesRun(
		level,
		zoneFor(level.id),
		tuning,
		seed,
		identity(level.id, contentVersion),
	);
}

function press(
	run: WaitingLanesRun,
	step: number,
	character: number,
	flags: number,
	outbox: Outbox,
) {
	run.advance(step, outbox);
	run.apply(character, flags, outbox);
}

test("seed signalfire starts level 1.1 on f", () => {
	const run = open(level11, "signalfire");
	expect(run.activeNote()?.character).toBe(F);
});

test("three hits on f open the next unit", () => {
	const outbox = createOutbox();
	const run = open(level11, "signalfire");
	run.apply(F, 0, outbox);
	run.apply(F, 0, outbox);
	run.apply(F, 0, outbox);
	expect(outbox.drain()).toEqual([
		{ type: "Hit", step: 0 },
		{ type: "Hit", step: 0 },
		{ type: "Hit", step: 0 },
	]);
	expect(run.activeNote()?.character).toBe(J);
});

test("seed a starts level 1.1 on j", () => {
	const run = open(level11, "a");
	expect(run.activeNote()?.character).toBe(J);
});

test("level 0.1's build unit starts on j", () => {
	const outbox = createOutbox();
	const run = open(level01, "signalfire");
	press(run, 960, F, 0, outbox);
	press(run, 961, F, 0, outbox);
	press(run, 962, F, 0, outbox);
	expect(run.activeNote()?.character).toBe(J);
});

test("level 1.1's build unit continues to space", () => {
	const outbox = createOutbox();
	const run = open(level11, "signalfire");
	press(run, 960, F, 0, outbox);
	press(run, 961, F, 0, outbox);
	press(run, 962, F, 0, outbox);
	press(run, 962, F, 0, outbox);
	expect(run.activeNote()?.character).toBe(SPACE);
});

test("step 719 is still approaching", () => {
	const outbox = createOutbox();
	const run = open(level11, "signalfire");
	run.advance(719, outbox);
	expect(run.activeNote()).toEqual({
		character: F,
		spawnStep: 0,
		posture: "approaching",
	});
	expect(outbox.drain()).toEqual([]);
});

test("step 720 waits on the same note", () => {
	const outbox = createOutbox();
	const run = open(level11, "signalfire");
	run.advance(720, outbox);
	expect(run.activeNote()).toEqual({
		character: F,
		spawnStep: 0,
		posture: "waiting",
	});
	expect(outbox.drain()).toEqual([]);
});

test("a hit before the line counts", () => {
	const outbox = createOutbox();
	const run = open(level11, "signalfire");
	run.apply(F, 0, outbox);
	expect(outbox.drain()[0]).toEqual({ type: "Hit", step: 0 });
});

test("a hit while waiting counts", () => {
	const outbox = createOutbox();
	const run = open(level11, "signalfire");
	run.advance(720, outbox);
	run.apply(F, 0, outbox);
	expect(outbox.drain()[0]).toEqual({ type: "Hit", step: 720 });
});

test("the shipped tuning shows one note", () => {
	const run = open(level11, "signalfire");
	expect(run.unhitCount()).toBe(1);
});

test("a hit refills the queue at that step", () => {
	const outbox = createOutbox();
	const run = open(level11, "signalfire");
	run.apply(F, 0, outbox);
	expect(run.unhitCount()).toBe(1);
	expect(run.activeNote()?.character).toBe(F);
});

test("j against f is an error", () => {
	const outbox = createOutbox();
	const run = open(level11, "signalfire");
	run.apply(J, 0, outbox);
	expect(outbox.drain()[0]).toEqual({ type: "Error", step: 0 });
	expect(run.activeNote()?.character).toBe(F);
});

test("a key-up adds no event", () => {
	const outbox = createOutbox();
	const run = open(level11, "signalfire");
	run.apply(F, 1, outbox);
	run.finish(outbox);
	expect(outbox.drain()).toEqual([{ type: "LevelEnded", step: 5999 }]);
});

test("ShiftLeft leaves a hit unchanged", () => {
	const outbox = createOutbox();
	const run = open(level11, "signalfire");
	run.apply(F, 2, outbox);
	expect(outbox.drain()[0]).toEqual({ type: "Hit", step: 0 });
});

test("an empty run ends at step 5999", () => {
	const outbox = createOutbox();
	const run = open(level11, "signalfire");
	run.finish(outbox);
	expect(outbox.drain()).toEqual([{ type: "LevelEnded", step: 5999 }]);
});

test("a hit on the last step precedes LevelEnded", () => {
	const outbox = createOutbox();
	const run = open(level11, "signalfire");
	press(run, 5999, F, 0, outbox);
	run.finish(outbox);
	expect(outbox.drain()).toEqual([
		{ type: "Hit", step: 5999 },
		{ type: "LevelEnded", step: 5999 },
	]);
});

test("advancing past the end stops on the last step", () => {
	const outbox = createOutbox();
	const run = open(level11, "signalfire");
	run.advance(6000, outbox);
	expect(run.step()).toBe(5999);
	expect(outbox.drain()).toEqual([{ type: "LevelEnded", step: 5999 }]);
});

test("a second finish is rejected", () => {
	const outbox = createOutbox();
	const run = open(level11, "signalfire");
	run.finish(outbox);
	outbox.drain();
	expect(() => run.finish(outbox)).toThrow(RangeError);
	expect(outbox.drain()).toEqual([]);
});

test("an apply after the end is rejected", () => {
	const outbox = createOutbox();
	const run = open(level11, "signalfire");
	run.finish(outbox);
	expect(() => run.apply(F, 0, outbox)).toThrow(RangeError);
	expect(run.inputs()).toEqual([]);
});

test("a wrong key on level 0.1 still completes", () => {
	const outbox = createOutbox();
	const run = open(level01, "signalfire");
	run.apply(J, 0, outbox);
	const { summary, missed } = run.finish(outbox);
	expect(outbox.drain()).toEqual([
		{ type: "Error", step: 0 },
		{ type: "LevelEnded", step: 5999 },
	]);
	expect(summary.stars).toBe(0);
	expect(summary.score).toBe(250);
	expect(missed).toEqual([]);
});

test("one hit and a later error", () => {
	const outbox = createOutbox();
	const run = open(level11, "signalfire");
	press(run, 0, F, 0, outbox);
	press(run, 120, J, 0, outbox);
	const { summary, missed } = run.finish(outbox);
	expect(outbox.drain()).toEqual([
		{ type: "Hit", step: 0 },
		{ type: "Error", step: 120 },
		{ type: "LevelEnded", step: 5999 },
	]);
	expect(summary).toEqual({
		accuracy: 0.5,
		netWpm: 12,
		score: 260,
		stars: 0,
		medals: [],
	});
	expect(missed).toEqual([integrityMiss]);
});

test("no key-down scores nothing", () => {
	const outbox = createOutbox();
	const run = open(level11, "signalfire");
	const { summary, missed } = run.finish(outbox);
	expect(summary).toEqual({
		accuracy: 1,
		netWpm: 0,
		score: 250,
		stars: 0,
		medals: [],
	});
	expect(missed).toEqual([velocityMiss]);
});

test("inputs are listed before the level ends", () => {
	const outbox = createOutbox();
	const run = open(level11, "signalfire");
	press(run, 0, F, 0, outbox);
	press(run, 2, F, 1, outbox);
	expect(run.inputs()).toEqual([
		{ step: 0, character: F, flags: 0 },
		{ step: 2, character: F, flags: 1 },
	]);
});

test("steps are stored as deltas", () => {
	const outbox = createOutbox();
	const run = open(level11, "signalfire");
	press(run, 0, F, 0, outbox);
	press(run, 2, F, 1, outbox);
	const { log } = run.finish(outbox);
	expect(runLog.parse(log)).toEqual({
		status: "ok",
		migrated: false,
		document: log,
	});
	expect(log.engineVersion).toBe("0.0.0");
	expect(log.inputs).toEqual([
		[0, F, 0],
		[2, F, 1],
	]);
	expect(log.summary).toEqual({
		accuracy: 1,
		netWpm: 0,
		score: 260,
		stars: 0,
		medals: [],
	});
});

test("two inputs at one step keep a zero delta", () => {
	const outbox = createOutbox();
	const run = createWaitingLanesRun(
		level11,
		zone1,
		tuning,
		"signalfire",
		identity("level:1.1"),
	);
	press(run, 3, F, 0, outbox);
	press(run, 3, J, 0, outbox);
	const { log } = run.finish(outbox);
	expect(log.inputs).toEqual([
		[3, F, 0],
		[0, J, 0],
	]);
});

test("the same play twice is the same log", () => {
	function played() {
		const run = open(level11, "signalfire");
		const outbox = createOutbox();
		press(run, 0, F, 0, outbox);
		press(run, 120, J, 0, outbox);
		return run.finish(outbox).log;
	}
	expect(played()).toEqual(played());
});

test("a bad level id throws", () => {
	expect(() =>
		createWaitingLanesRun(
			level11,
			zone1,
			tuning,
			"signalfire",
			identity("level:1"),
		),
	).toThrow(RangeError);
});

test("flags above 7 throw", () => {
	const run = open(level11, "signalfire");
	expect(() => run.apply(F, 8, createOutbox())).toThrow(RangeError);
	expect(run.inputs()).toEqual([]);
});

test("a surrogate code point throws", () => {
	const run = open(level11, "signalfire");
	expect(() => run.apply(55296, 0, createOutbox())).toThrow(RangeError);
	expect(run.inputs()).toEqual([]);
});

test("advancing backward throws", () => {
	const outbox = createOutbox();
	const run = open(level11, "signalfire");
	run.advance(2, outbox);
	expect(() => run.advance(1, outbox)).toThrow(RangeError);
	expect(run.step()).toBe(2);
});

test("advancing to the current step changes nothing", () => {
	const outbox = createOutbox();
	const run = open(level11, "signalfire");
	run.advance(2, outbox);
	outbox.drain();
	run.advance(2, outbox);
	expect(run.step()).toBe(2);
	expect(outbox.drain()).toEqual([]);
});

test("a negative step throws", () => {
	const run = open(level11, "signalfire");
	expect(() => run.advance(-1, createOutbox())).toThrow(RangeError);
	expect(run.step()).toBe(0);
});

test("a fractional step throws", () => {
	const run = open(level11, "signalfire");
	expect(() => run.advance(1.5, createOutbox())).toThrow(RangeError);
	expect(run.step()).toBe(0);
});

test("a scripted 1.1 run replays", () => {
	const played = createOutbox();
	const run = open(level11, "signalfire");
	press(run, 0, F, 0, played);
	press(run, 120, J, 0, played);
	const { log, missed } = run.finish(played);
	const replay = replayWaitingLanes(
		level11,
		zone1,
		tuning,
		log,
		createOutbox(),
	);
	expect(replay.events).toEqual([
		{ type: "Hit", step: 0 },
		{ type: "Error", step: 120 },
		{ type: "LevelEnded", step: 5999 },
	]);
	expect(replay.summary).toEqual(log.summary);
	expect(replay.missed).toEqual(missed);
});

test("playing matches the replay", () => {
	const played = createOutbox();
	const run = open(level11, "signalfire");
	press(run, 0, F, 0, played);
	press(run, 120, J, 0, played);
	const { summary, missed, log } = run.finish(played);
	const replay = replayWaitingLanes(
		level11,
		zone1,
		tuning,
		log,
		createOutbox(),
	);
	expect(played.drain()).toEqual(replay.events);
	expect(summary).toEqual(replay.summary);
	expect(missed).toEqual(replay.missed);
});

test("a changed stored score does not change the replay", () => {
	const run = open(level11, "signalfire");
	const outbox = createOutbox();
	run.apply(F, 0, outbox);
	const { log } = run.finish(outbox);
	const tampered = { ...log, summary: { ...log.summary, score: 9 } };
	const replay = replayWaitingLanes(
		level11,
		zone1,
		tuning,
		tampered,
		createOutbox(),
	);
	expect(replay.summary.score).toBe(260);
});

test("content version is stored and not simulated", () => {
	function played(contentVersion: string) {
		const run = open(level11, "signalfire", contentVersion);
		const outbox = createOutbox();
		run.apply(F, 0, outbox);
		const finished = run.finish(outbox);
		return {
			log: finished.log,
			events: outbox.drain(),
			summary: finished.summary,
			missed: finished.missed,
		};
	}
	const demo = played("demo");
	const other = played("other");
	expect(demo.log.contentVersion).toBe("demo");
	expect(other.log.contentVersion).toBe("other");
	const demoReplay = replayWaitingLanes(
		level11,
		zone1,
		tuning,
		demo.log,
		createOutbox(),
	);
	const otherReplay = replayWaitingLanes(
		level11,
		zone1,
		tuning,
		other.log,
		createOutbox(),
	);
	expect(demoReplay.events).toEqual(otherReplay.events);
	expect(demoReplay.summary).toEqual(otherReplay.summary);
	expect(demoReplay.missed).toEqual(otherReplay.missed);
	expect(demo.missed).toEqual(demoReplay.missed);
});

test("engine version 0.0.0 replays", () => {
	const run = open(level11, "signalfire");
	const { log } = run.finish(createOutbox());
	const outbox = createOutbox();
	const replay = replayWaitingLanes(level11, zone1, tuning, log, outbox);
	expect(replay.events.length).toBeGreaterThan(0);
	expect(log.engineVersion).toBe("0.0.0");
	expect(outbox.drain()).toEqual(replay.events);
});

test("a different major is refused", () => {
	const run = open(level11, "signalfire");
	const { log } = run.finish(createOutbox());
	const outbox = createOutbox();
	expect(() =>
		replayWaitingLanes(
			level11,
			zone1,
			tuning,
			{ ...log, engineVersion: "1.0.0" },
			outbox,
		),
	).toThrow(RangeError);
	expect(outbox.drain()).toEqual([]);
});

test("zone 0 with level 1.1 is rejected", () => {
	expect(() =>
		createWaitingLanesRun(
			level11,
			zone0,
			tuning,
			"signalfire",
			identity(level11.id),
		),
	).toThrow(RangeError);
});

test("replay with the other zone is rejected", () => {
	const { log } = open(level11, "signalfire").finish(createOutbox());
	const outbox = createOutbox();
	expect(() => replayWaitingLanes(level11, zone0, tuning, log, outbox)).toThrow(
		RangeError,
	);
	expect(outbox.drain()).toEqual([]);
});

test("run.metrics returns live integrity percent and velocity WPM", () => {
	const run = open(level11, "signalfire");
	const outbox = createOutbox();
	expect(run.metrics()).toEqual({ integrityPercent: 100, velocityWpm: 0 });

	run.apply(F, 0, outbox);
	expect(run.metrics().integrityPercent).toBe(100);

	run.advance(120, outbox);
	run.apply(J, 0, outbox);
	expect(run.metrics().integrityPercent).toBe(50);
	expect(run.metrics().velocityWpm).toBeGreaterThan(0);
});
