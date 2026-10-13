import { z } from "zod";
import { defineDocument } from "./parse";

const volume = z.number().min(0).max(1);

const settingsSchema = z.strictObject({
	v: z.literal(1),
	updatedAt: z.iso.datetime({ offset: true }),
	rev: z.int().nonnegative(),
	master: volume,
	music: volume,
	effects: volume,
	voices: volume,
	effectsIntensity: z.enum(["low", "medium", "high"]),
	fullscreen: z.boolean(),
});

export const settings = defineDocument<z.infer<typeof settingsSchema>>({
	latest: 1,
	versions: {
		1: { initial: true, schema: settingsSchema },
	},
});
