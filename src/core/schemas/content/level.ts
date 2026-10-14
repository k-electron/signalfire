import { z } from "zod";
import { levelId, medalId, zoneId } from "../ids.ts";
import { tuningId } from "./tuning.ts";
import { keySet } from "./zone.ts";

const mechanic = z.enum(["lanes-wait", "space-pulse"]);

function phase(name: "arrival" | "build" | "peak" | "breather" | "finale") {
	return z.strictObject({
		name: z.literal(name),
		durationSeconds: z.int().positive(),
		units: z.array(z.string().min(1)).min(1),
	});
}

function characters(value: string): string[] {
	return [...value];
}

export const levelSchema = z
	.strictObject({
		id: levelId,
		name: z.string().min(1),
		zoneId,
		type: z.enum(["intro", "drill"]),
		tuningId,
		allowedKeys: keySet,
		focusKeys: keySet,
		mechanics: z
			.array(mechanic)
			.min(1)
			.refine((mechanics) => mechanics.includes("lanes-wait")),
		medals: z
			.array(medalId)
			.max(3)
			.refine((medals) => new Set(medals).size === medals.length),
		phases: z.tuple([
			phase("arrival"),
			phase("build"),
			phase("peak"),
			phase("breather"),
			phase("finale"),
		]),
	})
	.refine((level) => {
		const seconds = level.phases.reduce(
			(sum, item) => sum + item.durationSeconds,
			0,
		);
		if (seconds > 240) {
			return false;
		}
		if (!level.focusKeys.every((key) => level.allowedKeys.includes(key))) {
			return false;
		}
		const unitsFit = level.phases.every((item) =>
			item.units.every((unit) =>
				characters(unit).every((character) =>
					level.allowedKeys.includes(character),
				),
			),
		);
		if (!unitsFit) {
			return false;
		}
		if (level.type !== "drill") {
			return true;
		}
		return level.phases.every((item) =>
			item.units.every((unit) =>
				characters(unit).some((character) =>
					level.focusKeys.includes(character),
				),
			),
		);
	});
