import { z } from "zod";
import { levelOrSideId, tierId } from "./ids";
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

const keptEntry = z.strictObject({
	runId,
	levelId: levelOrSideId,
	tier: tierId,
	mode,
	kind: z.enum(["best", "recent"]),
});

const runIndexSchema = z.strictObject({
	v: z.literal(1),
	updatedAt: z.iso.datetime({ offset: true }),
	rev: z.int().nonnegative(),
	kept: z
		.array(keptEntry)
		.refine(
			(kept) => new Set(kept.map((entry) => entry.runId)).size === kept.length,
		),
});

export const runIndex = defineDocument<z.infer<typeof runIndexSchema>>({
	latest: 1,
	versions: {
		1: { initial: true, schema: runIndexSchema },
	},
});
