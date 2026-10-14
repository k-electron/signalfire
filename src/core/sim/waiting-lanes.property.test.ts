import { fc, test } from "@fast-check/vitest";
import { expect } from "vitest";
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
import { createOutbox } from "../ports/outbox";
import { createWaitingLanesRun, replayWaitingLanes } from "./waiting-lanes";

const level01 = acceptLevel(level01File);
const level11 = acceptLevel(level11File);
const tuning = acceptTuning(tuningFile);
const zone0 = acceptZone(zone0File);
const zone1 = acceptZone(zone1File);
const levels = [level01, level11];

function zoneFor(levelId: string) {
	if (levelId === level01.id) {
		return zone0;
	}
	return zone1;
}

const otherScalars = [65, 97, 98, 99];

const inputs = fc
	.array(
		fc.record({
			delta: fc.integer({ min: 0, max: 400 }),
			character: fc.oneof(
				fc.constantFrom(32, 102, 106),
				fc.constantFrom(...otherScalars),
			),
			flags: fc.integer({ min: 0, max: 7 }),
		}),
		{ maxLength: 16 },
	)
	.map((rows) => {
		let step = 0;
		return rows.map((row) => {
			step = Math.min(5999, step + row.delta);
			return { step, character: row.character, flags: row.flags };
		});
	});

function identity(levelId: string) {
	return {
		runId: "01AFQCG20004HMASW9NF6YY41J",
		levelId,
		tier: "cadet" as const,
		mode: "campaign" as const,
		contentVersion: "demo",
		startedAt: "2026-10-12T20:00:00.000Z",
		updatedAt: "2026-10-12T20:00:00.000Z",
		rev: 0,
	};
}

function phaseStarts(level: (typeof levels)[number]): number[] {
	const starts: number[] = [];
	let cursor = 0;
	for (const phase of level.phases) {
		starts.push(cursor);
		cursor += phase.durationSeconds * 120;
	}
	return starts;
}

test.prop([fc.constantFrom(...levels), fc.string({ maxLength: 40 }), inputs])(
	"an arbitrary seed and input list replay",
	(level, seed, list) => {
		const recorded = createOutbox();
		const run = createWaitingLanesRun(
			level,
			zoneFor(level.id),
			tuning,
			seed,
			identity(level.id),
		);
		for (const input of list) {
			run.advance(input.step, recorded);
			run.apply(input.character, input.flags, recorded);
		}
		const finished = run.finish(recorded);
		const played = recorded.drain();
		const replayed = createOutbox();
		const result = replayWaitingLanes(
			level,
			zoneFor(level.id),
			tuning,
			finished.log,
			replayed,
		);
		expect(result.events).toEqual(played);
		expect(replayed.drain()).toEqual(result.events);
		expect(result.summary).toEqual(finished.log.summary);
		expect(result.missed).toEqual(finished.missed);
	},
);

test.prop([fc.constantFrom(...levels), fc.string({ maxLength: 40 })])(
	"generated notes stay on f, j, and space",
	(level, seed) => {
		const allowed = new Set(
			level.allowedKeys.map((key) => {
				const code = key.codePointAt(0);
				if (code === undefined) {
					throw new RangeError("The allowed key is empty.");
				}
				return code;
			}),
		);
		for (const start of phaseStarts(level)) {
			const outbox = createOutbox();
			const run = createWaitingLanesRun(
				level,
				zoneFor(level.id),
				tuning,
				seed,
				identity(level.id),
			);
			run.advance(start, outbox);
			for (let hit = 0; hit < 16; hit += 1) {
				const note = run.activeNote();
				if (note === null) {
					throw new RangeError("The queue is empty.");
				}
				expect(allowed.has(note.character)).toBe(true);
				run.apply(note.character, 0, outbox);
			}
		}
	},
);
