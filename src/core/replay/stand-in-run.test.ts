import { expect, test } from "vitest";
import { createOutbox } from "../ports/outbox";
import { runLog } from "../schemas/run-log";
import {
	createStandInRun,
	recordStandInRun,
	replayStandInRun,
} from "./stand-in-run";

const campaign = {
	runId: "01AFQCG20004HMASW9NF6YY41J",
	levelId: "level:1.1",
	tier: "cadet" as const,
	mode: "campaign" as const,
	contentVersion: "demo",
	startedAt: "2026-10-12T20:00:00.000Z",
	updatedAt: "2026-10-12T20:00:00.000Z",
	rev: 0,
};

const hitThenError = [
	{ step: 0, character: 98, flags: 0 },
	{ step: 1, character: 97, flags: 0 },
];

test("arriving at a later step emits nothing", () => {
	const outbox = createOutbox();
	const run = createStandInRun("signalfire");
	run.advance(3, outbox);
	expect(outbox.drain()).toEqual([]);
});

test("the input emits when it is applied", () => {
	const outbox = createOutbox();
	const run = createStandInRun("signalfire");
	run.advance(3, outbox);
	run.apply(97, 0, outbox);
	expect(outbox.drain()).toEqual([{ type: "Hit", step: 3 }]);
});

test("two key-downs at one step share one target", () => {
	const outbox = createOutbox();
	const run = createStandInRun("signalfire");
	run.advance(3, outbox);
	run.apply(97, 0, outbox);
	run.apply(98, 0, outbox);
	expect(outbox.drain()).toEqual([
		{ type: "Hit", step: 3 },
		{ type: "Error", step: 3 },
	]);
});

test("code point 98 at step 0 is a hit", () => {
	const outbox = createOutbox();
	const run = createStandInRun("signalfire");
	run.apply(98, 0, outbox);
	expect(outbox.drain()[0]).toEqual({ type: "Hit", step: 0 });
});

test("code point 97 at step 0 is an error", () => {
	const outbox = createOutbox();
	const run = createStandInRun("signalfire");
	run.apply(97, 0, outbox);
	expect(outbox.drain()[0]).toEqual({ type: "Error", step: 0 });
});

test("a key-up contributes no match event", () => {
	const outbox = createOutbox();
	const run = createStandInRun("signalfire");
	run.apply(98, 1, outbox);
	run.finish(outbox);
	expect(outbox.drain()).toEqual([{ type: "LevelEnded", step: 7 }]);
});

test("ShiftLeft leaves a hit unchanged", () => {
	const outbox = createOutbox();
	const run = createStandInRun("signalfire");
	run.apply(98, 2, outbox);
	expect(outbox.drain()[0]).toEqual({ type: "Hit", step: 0 });
});

test("an empty signalfire run ends at step 7", () => {
	const outbox = createOutbox();
	const run = createStandInRun("signalfire");
	run.finish(outbox);
	expect(outbox.drain()).toEqual([{ type: "LevelEnded", step: 7 }]);
});

test("an empty signalfirf run ends at step 0", () => {
	const outbox = createOutbox();
	const run = createStandInRun("signalfirf");
	run.finish(outbox);
	expect(outbox.drain()).toEqual([{ type: "LevelEnded", step: 0 }]);
});

test("step 1 of signalfire targets code point 99", () => {
	const outbox = createOutbox();
	const run = createStandInRun("signalfire");
	run.advance(1, outbox);
	run.apply(99, 0, outbox);
	expect(outbox.drain()).toEqual([{ type: "Hit", step: 1 }]);
});

test("an input after the horizon extends the run", () => {
	const outbox = createOutbox();
	const run = createStandInRun("signalfire");
	run.advance(9, outbox);
	run.apply(98, 0, outbox);
	run.finish(outbox);
	expect(outbox.drain()).toEqual([
		{ type: "Hit", step: 9 },
		{ type: "LevelEnded", step: 9 },
	]);
});

test("one hit and one error", () => {
	const outbox = createOutbox();
	const run = createStandInRun("signalfire");
	run.apply(98, 0, outbox);
	run.advance(1, outbox);
	run.apply(97, 0, outbox);
	const summary = run.finish(outbox);
	expect(outbox.drain()).toEqual([
		{ type: "Hit", step: 0 },
		{ type: "Error", step: 1 },
		{ type: "LevelEnded", step: 7 },
	]);
	expect(summary).toEqual({
		accuracy: 0.5,
		netWpm: 0,
		score: 1,
		stars: 0,
		medals: [],
	});
});

test("no key-down scores nothing", () => {
	const outbox = createOutbox();
	const run = createStandInRun("signalfire");
	const summary = run.finish(outbox);
	expect(summary).toEqual({
		accuracy: 1,
		netWpm: 0,
		score: 0,
		stars: 0,
		medals: [],
	});
});

test("a second finish is rejected", () => {
	const outbox = createOutbox();
	const run = createStandInRun("signalfire");
	run.finish(outbox);
	outbox.drain();
	expect(() => run.finish(outbox)).toThrow(RangeError);
	expect(outbox.drain()).toEqual([]);
});

test("advancing backward throws", () => {
	const outbox = createOutbox();
	const run = createStandInRun("signalfire");
	run.advance(2, outbox);
	expect(() => run.advance(1, outbox)).toThrow(RangeError);
	expect(run.step()).toBe(2);
});

test("advancing to the current step changes nothing", () => {
	const outbox = createOutbox();
	const run = createStandInRun("signalfire");
	run.advance(2, outbox);
	outbox.drain();
	run.advance(2, outbox);
	expect(run.step()).toBe(2);
	expect(outbox.drain()).toEqual([]);
});

test("the same record twice is the same log", () => {
	const first = recordStandInRun(
		"signalfire",
		hitThenError,
		campaign,
		createOutbox(),
	);
	const second = recordStandInRun(
		"signalfire",
		hitThenError,
		campaign,
		createOutbox(),
	);
	expect(first).toEqual(second);
});

test("steps are stored as deltas", () => {
	const log = recordStandInRun(
		"signalfire",
		[
			{ step: 0, character: 98, flags: 0 },
			{ step: 2, character: 98, flags: 1 },
		],
		campaign,
		createOutbox(),
	);
	expect(runLog.parse(log)).toEqual({
		status: "ok",
		migrated: false,
		document: log,
	});
	expect(log.engineVersion).toBe("0-stand-in");
	expect(log.inputs).toEqual([
		[0, 98, 0],
		[2, 98, 1],
	]);
	expect(log.summary).toEqual({
		accuracy: 1,
		netWpm: 0,
		score: 1,
		stars: 0,
		medals: [],
	});
});

test("two inputs at one step keep a zero delta", () => {
	const log = recordStandInRun(
		"signalfire",
		[
			{ step: 3, character: 97, flags: 0 },
			{ step: 3, character: 98, flags: 0 },
		],
		campaign,
		createOutbox(),
	);
	expect(log.inputs).toEqual([
		[3, 97, 0],
		[0, 98, 0],
	]);
});

test("a decreasing step throws", () => {
	const outbox = createOutbox();
	expect(() =>
		recordStandInRun(
			"signalfire",
			[
				{ step: 2, character: 97, flags: 0 },
				{ step: 1, character: 97, flags: 0 },
			],
			campaign,
			outbox,
		),
	).toThrow(RangeError);
	expect(outbox.drain()).toEqual([]);
});

test("flags above 7 throw", () => {
	const outbox = createOutbox();
	expect(() =>
		recordStandInRun(
			"signalfire",
			[{ step: 0, character: 97, flags: 8 }],
			campaign,
			outbox,
		),
	).toThrow(RangeError);
	expect(outbox.drain()).toEqual([]);
});

test("a surrogate code point throws", () => {
	const outbox = createOutbox();
	expect(() =>
		recordStandInRun(
			"signalfire",
			[{ step: 0, character: 55296, flags: 0 }],
			campaign,
			outbox,
		),
	).toThrow(RangeError);
	expect(outbox.drain()).toEqual([]);
});

test("a bad level id throws", () => {
	const outbox = createOutbox();
	expect(() =>
		recordStandInRun(
			"signalfire",
			[],
			{ ...campaign, levelId: "level:1" },
			outbox,
		),
	).toThrow(RangeError);
	expect(outbox.drain()).toEqual([]);
});

test("a recorded run replays", () => {
	const log = recordStandInRun(
		"signalfire",
		hitThenError,
		campaign,
		createOutbox(),
	);
	const outbox = createOutbox();
	const replay = replayStandInRun(log, outbox);
	expect(replay.events).toEqual([
		{ type: "Hit", step: 0 },
		{ type: "Error", step: 1 },
		{ type: "LevelEnded", step: 7 },
	]);
	expect(replay.summary).toEqual(log.summary);
	expect(outbox.drain()).toEqual(replay.events);
});

test("stepping matches the recording", () => {
	const recorded = createOutbox();
	const log = recordStandInRun("signalfire", hitThenError, campaign, recorded);
	const stepped = createOutbox();
	const run = createStandInRun("signalfire");
	run.apply(98, 0, stepped);
	run.advance(1, stepped);
	run.apply(97, 0, stepped);
	const summary = run.finish(stepped);
	expect(stepped.drain()).toEqual(recorded.drain());
	expect(summary).toEqual(log.summary);
});

test("a changed stored score does not change the replay", () => {
	const log = recordStandInRun(
		"signalfire",
		[{ step: 0, character: 98, flags: 0 }],
		campaign,
		createOutbox(),
	);
	const tampered = { ...log, summary: { ...log.summary, score: 0 } };
	const replay = replayStandInRun(tampered, createOutbox());
	expect(replay.summary.score).toBe(1);
});

test("content version is stored and not simulated", () => {
	const inputs = [{ step: 0, character: 98, flags: 0 }];
	const demo = recordStandInRun("signalfire", inputs, campaign, createOutbox());
	const other = recordStandInRun(
		"signalfire",
		inputs,
		{ ...campaign, contentVersion: "other" },
		createOutbox(),
	);
	expect(demo.contentVersion).toBe("demo");
	expect(other.contentVersion).toBe("other");
	const demoReplay = replayStandInRun(demo, createOutbox());
	const otherReplay = replayStandInRun(other, createOutbox());
	expect(demoReplay.events).toEqual(otherReplay.events);
	expect(demoReplay.summary).toEqual(otherReplay.summary);
});

test("engine version 0.0.0 is refused", () => {
	const log = recordStandInRun("signalfire", [], campaign, createOutbox());
	const outbox = createOutbox();
	expect(() =>
		replayStandInRun({ ...log, engineVersion: "0.0.0" }, outbox),
	).toThrow(RangeError);
	expect(outbox.drain()).toEqual([]);
});
