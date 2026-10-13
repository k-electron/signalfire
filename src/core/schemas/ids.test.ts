import { expect, test } from "vitest";
import type { ZodType } from "zod";
import {
	achievementId,
	characterId,
	codexId,
	cosmeticId,
	dispatchId,
	levelId,
	machineId,
	medalId,
	modId,
	sideId,
	tierId,
	zoneId,
} from "./ids";

const accepted: readonly (readonly [ZodType, string])[] = [
	[zoneId, "zone:0"],
	[zoneId, "zone:2"],
	[levelId, "level:0.1"],
	[levelId, "level:2.4"],
	[sideId, "side:3.blackout"],
	[tierId, "cadet"],
	[tierId, "veteran"],
	[tierId, "ace"],
	[characterId, "char:e"],
	[characterId, "char:?"],
	[medalId, "medal:flawless"],
	[machineId, "machine:dart"],
	[modId, "mod:reach-boosters"],
	[achievementId, "achievement:first-light"],
	[dispatchId, "dispatch:earn-medals"],
	[codexId, "codex:the-hush"],
	[cosmeticId, "cosmetic:trail.river"],
];

const rejected: readonly (readonly [ZodType, string])[] = [
	[zoneId, "zone:02"],
	[zoneId, "zone:two"],
	[levelId, "level:2"],
	[levelId, "level:01.1"],
	[levelId, "level:1.01"],
	[sideId, "side:3.Blackout"],
	[tierId, "tier:cadet"],
	[characterId, "char:ee"],
	[characterId, "char:"],
	[medalId, "medal:Flawless"],
	[modId, "mod:reach--boosters"],
	[cosmeticId, "cosmetic:trail"],
	[cosmeticId, "cosmetic:Trail.river"],
];

test("documented IDs are accepted", () => {
	for (const [schema, value] of accepted) {
		expect(schema.safeParse(value).success, value).toBe(true);
	}
});

test("lookalike IDs are rejected", () => {
	for (const [schema, value] of rejected) {
		expect(schema.safeParse(value).success, value).toBe(false);
	}
});
