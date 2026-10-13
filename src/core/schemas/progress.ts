import { z } from "zod";
import { levelOrSideId, medalId } from "./ids";
import { defineDocument } from "./parse";

const tierRecord = z.strictObject({
	stars: z.int().min(0).max(3),
	medals: z
		.array(medalId)
		.refine((medals) => new Set(medals).size === medals.length),
	bestScore: z.int().nonnegative(),
	bestNetWpm: z.number().min(0),
	bestAccuracy: z.number().min(0).max(1),
	attempts: z.int().nonnegative(),
	failedSinceLastStar: z.int().nonnegative(),
	calmUnlocked: z.boolean(),
});

const levelEntry = z
	.strictObject({
		cadet: tierRecord.optional(),
		veteran: tierRecord.optional(),
		ace: tierRecord.optional(),
	})
	.refine(
		(entry) =>
			entry.cadet !== undefined ||
			entry.veteran !== undefined ||
			entry.ace !== undefined,
	);

const progressSchema = z.strictObject({
	v: z.literal(1),
	updatedAt: z.iso.datetime({ offset: true }),
	rev: z.int().nonnegative(),
	levels: z
		.record(z.string(), levelEntry)
		.refine((levels) =>
			Object.keys(levels).every((key) => levelOrSideId.safeParse(key).success),
		),
});

export const progress = defineDocument<z.infer<typeof progressSchema>>({
	latest: 1,
	versions: {
		1: { initial: true, schema: progressSchema },
	},
});
