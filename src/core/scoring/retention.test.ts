import { expect, test } from "vitest";
import { runIndex } from "../schemas/run-index";
import { type RetainLog, retainRuns } from "./retention";

function id(n: number): string {
	return String(n).padStart(26, "0");
}

function at(minute: number): string {
	return `2026-10-12T20:${String(minute).padStart(2, "0")}:00.000Z`;
}

function log(
	n: number,
	score: number,
	minute: number,
	overrides: Partial<RetainLog> = {},
): RetainLog {
	return {
		runId: id(n),
		levelId: "level:1.1",
		tier: "cadet",
		mode: "campaign",
		startedAt: at(minute),
		score,
		...overrides,
	};
}

function kept(entry: RetainLog, kind: "best" | "recent") {
	return {
		runId: entry.runId,
		levelId: entry.levelId,
		tier: entry.tier,
		mode: entry.mode,
		kind,
	};
}

const oldBest = [100, 10, 20, 30, 40].map((score, minute) =>
	log(minute, score, minute),
);

test("an old best is kept with the three newest", () => {
	const result = retainRuns(oldBest);
	expect(result.kept).toEqual([
		kept(log(0, 100, 0), "best"),
		kept(log(2, 20, 2), "recent"),
		kept(log(3, 30, 3), "recent"),
		kept(log(4, 40, 4), "recent"),
	]);
	expect(result.dropped).toEqual([id(1)]);
	expect(
		runIndex.parse({
			v: 1,
			updatedAt: at(0),
			rev: 0,
			kept: result.kept,
		}),
	).toMatchObject({ status: "ok" });
});

test("a best inside the last 3 is kept once", () => {
	const result = retainRuns(
		[1, 2, 3, 4, 50].map((score, minute) => log(minute, score, minute)),
	);
	expect(result.kept).toEqual([
		kept(log(2, 3, 2), "recent"),
		kept(log(3, 4, 3), "recent"),
		kept(log(4, 50, 4), "best"),
	]);
	expect(result.dropped).toEqual([id(0), id(1)]);
});

test("the later tie is the best", () => {
	const result = retainRuns([log(0, 50, 0), log(1, 50, 1)]);
	expect(result.kept).toEqual([
		kept(log(0, 50, 0), "recent"),
		kept(log(1, 50, 1), "best"),
	]);
});

test("the same start keeps the greater run id", () => {
	const result = retainRuns([1, 2, 3, 9].map((score, n) => log(n, score, 0)));
	expect(result.dropped).toEqual([id(0)]);
	expect(result.kept).toEqual([
		kept(log(1, 2, 0), "recent"),
		kept(log(2, 3, 0), "recent"),
		kept(log(3, 9, 0), "best"),
	]);
});

test("another level keeps its own logs", () => {
	const result = retainRuns([
		...oldBest,
		log(5, 1, 0, { levelId: "level:0.1" }),
	]);
	expect(result.kept).toEqual([
		kept(log(5, 1, 0, { levelId: "level:0.1" }), "best"),
		kept(log(0, 100, 0), "best"),
		kept(log(2, 20, 2), "recent"),
		kept(log(3, 30, 3), "recent"),
		kept(log(4, 40, 4), "recent"),
	]);
	expect(result.dropped).toEqual([id(1)]);
});

test("another tier keeps its own logs", () => {
	const cadet = log(0, 10, 0);
	const veteran = log(1, 10, 0, { tier: "veteran" });
	expect(retainRuns([cadet, veteran]).kept).toEqual([
		kept(cadet, "best"),
		kept(veteran, "best"),
	]);
});

test("one run is the best", () => {
	const only = log(0, 10, 0);
	expect(retainRuns([only])).toEqual({
		kept: [kept(only, "best")],
		dropped: [],
	});
});

test("Courier shares the Cadet group", () => {
	const logs = oldBest.map((entry) =>
		entry.runId === id(1) ? { ...entry, mode: "courier" as const } : entry,
	);
	const result = retainRuns(logs);
	expect(result.dropped).toEqual([id(1)]);
	expect(result.kept.map((entry) => entry.runId)).toEqual([
		id(0),
		id(2),
		id(3),
		id(4),
	]);
});

test("a duplicate run id is refused", () => {
	expect(() => retainRuns([log(0, 1, 0), log(0, 2, 1)])).toThrow(RangeError);
});
