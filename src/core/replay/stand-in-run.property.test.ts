import { fc, test } from "@fast-check/vitest";
import { expect } from "vitest";
import { createOutbox } from "../ports/outbox";
import { recordStandInRun, replayStandInRun } from "./stand-in-run";

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

const codePoint = fc
	.integer({ min: 0, max: 0x10ffff })
	.filter((code) => code < 0xd800 || code > 0xdfff);

const inputs = fc
	.array(
		fc.record({
			delta: fc.integer({ min: 0, max: 4 }),
			character: codePoint,
			flags: fc.integer({ min: 0, max: 7 }),
		}),
		{ maxLength: 8 },
	)
	.map((rows) => {
		let step = 0;
		return rows.map((row) => {
			step += row.delta;
			return { step, character: row.character, flags: row.flags };
		});
	});

test.prop([fc.string({ maxLength: 40 }), inputs])(
	"an arbitrary seed and input list replay",
	(seed, list) => {
		const recorded = createOutbox();
		const log = recordStandInRun(seed, list, campaign, recorded);
		const replayed = createOutbox();
		const result = replayStandInRun(log, replayed);
		expect(result.events).toEqual(recorded.drain());
		expect(replayed.drain()).toEqual(result.events);
		expect(result.summary).toEqual(log.summary);
	},
);
