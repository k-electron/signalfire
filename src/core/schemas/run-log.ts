import { z } from "zod";
import { levelOrSideId, medalId, tierId } from "./ids";
import { defineDocument } from "./parse";
import { runId } from "./run-id";

const mode = z.enum([
	"campaign",
	"repair",
	"systems-check",
	"courier",
	"daily-signal",
	"deep-archive",
]);

const codePoint = z
	.int()
	.min(0)
	.max(0x10ffff)
	.refine((code) => code < 0xd800 || code > 0xdfff);

const runLogSchema = z.strictObject({
	v: z.literal(1),
	updatedAt: z.iso.datetime({ offset: true }),
	rev: z.int().nonnegative(),
	runId,
	levelId: levelOrSideId,
	tier: tierId,
	mode,
	seed: z.string(),
	contentVersion: z.string().min(1),
	engineVersion: z.string().regex(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/),
	startedAt: z.iso.datetime({ offset: true }),
	inputs: z.array(
		z.tuple([z.int().nonnegative(), codePoint, z.int().min(0).max(7)]),
	),
	summary: z.strictObject({
		accuracy: z.number().min(0).max(1),
		netWpm: z.number().min(0),
		score: z.int().nonnegative(),
		stars: z.int().min(0).max(3),
		medals: z.array(medalId),
	}),
});

export const runLog = defineDocument<z.infer<typeof runLogSchema>>({
	latest: 1,
	versions: {
		1: { initial: true, schema: runLogSchema },
	},
});
