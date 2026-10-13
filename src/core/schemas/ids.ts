import { z } from "zod";

const number = String.raw`(?:0|[1-9]\d*)`;
const slug = "[a-z0-9]+(?:-[a-z0-9]+)*";

function id(source: string) {
	return z.string().regex(new RegExp(`^${source}$`));
}

export const zoneId = id(`zone:${number}`);
export const levelId = id(`level:${number}\\.${number}`);
export const sideId = id(`side:${number}\\.${slug}`);
export const tierId = z.enum(["cadet", "veteran", "ace"]);
export const characterId = z.string().refine((value) => {
	const suffix = value.slice("char:".length);
	return value.startsWith("char:") && [...suffix].length === 1;
});
export const medalId = id(`medal:${slug}`);
export const machineId = id(`machine:${slug}`);
export const modId = id(`mod:${slug}`);
export const achievementId = id(`achievement:${slug}`);
export const dispatchId = id(`dispatch:${slug}`);
export const codexId = id(`codex:${slug}`);
export const cosmeticId = id(`cosmetic:${slug}\\.${slug}`);

export const levelOrSideId = z.union([levelId, sideId]);
