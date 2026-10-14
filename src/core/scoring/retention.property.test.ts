import { fc, test } from "@fast-check/vitest";
import { expect } from "vitest";
import { type RetainLog, retainRuns } from "./retention";

const levelId = fc.constantFrom("level:0.1", "level:1.1");
const tier = fc.constantFrom(
	"cadet" as const,
	"veteran" as const,
	"ace" as const,
);
const mode = fc.constantFrom(
	"campaign" as const,
	"repair" as const,
	"systems-check" as const,
	"courier" as const,
	"daily-signal" as const,
	"deep-archive" as const,
);

const logs = fc
	.array(
		fc.record({
			levelId,
			tier,
			mode,
			score: fc.integer({ min: 0, max: 500 }),
			minute: fc.integer({ min: 0, max: 59 }),
		}),
		{ maxLength: 8 },
	)
	.map((rows) =>
		rows.map(
			(row, index): RetainLog => ({
				runId: String(index).padStart(26, "0"),
				levelId: row.levelId,
				tier: row.tier,
				mode: row.mode,
				score: row.score,
				startedAt: `2026-10-12T20:${String(row.minute).padStart(2, "0")}:00.000Z`,
			}),
		),
	);

function later(left: RetainLog, right: RetainLog): number {
	if (left.startedAt !== right.startedAt) {
		return left.startedAt < right.startedAt ? 1 : -1;
	}
	if (left.runId !== right.runId) {
		return left.runId < right.runId ? 1 : -1;
	}
	return 0;
}

function expected(rows: readonly RetainLog[]) {
	const groups = new Map<string, RetainLog[]>();
	for (const row of rows) {
		const key = `${row.levelId}\0${row.tier}`;
		const group = groups.get(key);
		if (group === undefined) {
			groups.set(key, [row]);
		} else {
			group.push(row);
		}
	}
	const kept = new Map<string, "best" | "recent">();
	for (const group of groups.values()) {
		const best = [...group].sort((left, right) => {
			if (left.score !== right.score) {
				return right.score - left.score;
			}
			return later(left, right);
		})[0];
		if (best === undefined) {
			continue;
		}
		const recent = [...group].sort(later).slice(0, 3);
		for (const row of recent) {
			kept.set(row.runId, "recent");
		}
		kept.set(best.runId, "best");
	}
	return kept;
}

test.prop([logs])("any logs keep only that union", (rows) => {
	const result = retainRuns(rows);
	const wanted = expected(rows);
	expect(result.kept).toHaveLength(wanted.size);
	for (const entry of result.kept) {
		expect(wanted.get(entry.runId)).toBe(entry.kind);
	}
	const dropped = new Set(result.dropped);
	expect(dropped.size).toBe(rows.length - wanted.size);
	for (const row of rows) {
		expect(dropped.has(row.runId)).toBe(!wanted.has(row.runId));
	}
});
