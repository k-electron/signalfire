import { z } from "zod";
import { defineDocument } from "../../core/schemas/parse";

const version1 = z.strictObject({
	v: z.literal(1),
	stars: z.number(),
});

const version2 = z.strictObject({
	v: z.literal(2),
	stars: z.number(),
	note: z.literal("kept"),
});

export const starChain = defineDocument<z.infer<typeof version2>>({
	latest: 2,
	versions: {
		1: { initial: true, schema: version1 },
		2: {
			initial: false,
			schema: version2,
			up(previous: unknown) {
				const value = version1.parse(previous);
				return { v: 2, stars: value.stars, note: "kept" };
			},
		},
	},
});

export function latestStars(stars: number): z.infer<typeof version2> {
	return { v: 2, stars, note: "kept" };
}
