import { z } from "zod";

const slug = "[a-z0-9]+(?:-[a-z0-9]+)*";

export const tuningId = z.string().regex(new RegExp(`^tuning:${slug}$`));

export const tuningSchema = z.strictObject({
	id: tuningId,
	approachSeconds: z.number().min(1.5).max(6),
	queueDepth: z.int().min(1).max(6),
});
