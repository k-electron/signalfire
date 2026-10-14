import { z } from "zod";
import { machineId, zoneId } from "../ids.ts";

const key = z.string().refine((value) => [...value].length === 1);

function unique(values: readonly string[]): boolean {
	return new Set(values).size === values.length;
}

export const keySet = z.array(key).min(1).refine(unique);

const bar = z.strictObject({
	accuracyPercent: z.int().min(91).max(99),
	wpm: z.int().min(1),
});

const starBars = z
	.strictObject({
		one: bar,
		two: bar,
		three: bar,
	})
	.refine(
		(bars) =>
			bars.one.accuracyPercent < bars.two.accuracyPercent &&
			bars.two.accuracyPercent < bars.three.accuracyPercent &&
			bars.one.wpm < bars.two.wpm &&
			bars.two.wpm < bars.three.wpm,
	);

export const zoneSchema = z.strictObject({
	id: zoneId,
	name: z.string().min(1),
	machine: machineId,
	keys: keySet,
	starBars: starBars.optional(),
});
