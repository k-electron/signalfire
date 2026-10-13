import { z } from "zod";
import { defineDocument } from "./parse";

const instant = z.iso.datetime({ offset: true });

const callSign = z.string().refine((value) => {
	const points = [...value];
	if (points.length < 1 || points.length > 24) {
		return false;
	}
	if (value.startsWith(" ") || value.endsWith(" ")) {
		return false;
	}
	return points.every((point) => {
		const code = point.codePointAt(0);
		return code !== undefined && code >= 0x20 && code !== 0x7f;
	});
});

const profileSchema = z.strictObject({
	v: z.literal(1),
	updatedAt: instant,
	rev: z.int().nonnegative(),
	callSign,
	createdAt: instant,
	onboardingComplete: z.boolean(),
	preferredThumb: z.enum(["left", "right", "either"]),
});

export const profile = defineDocument<z.infer<typeof profileSchema>>({
	latest: 1,
	versions: {
		1: { initial: true, schema: profileSchema },
	},
});
