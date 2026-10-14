export type TierRecord = {
	readonly stars: number;
	readonly medals: readonly string[];
	readonly bestScore: number;
	readonly bestNetWpm: number;
	readonly bestAccuracy: number;
	readonly attempts: number;
	readonly failedSinceLastStar: number;
	readonly calmUnlocked: boolean;
};

export type LevelProgress = {
	readonly cadet?: TierRecord;
	readonly veteran?: TierRecord;
	readonly ace?: TierRecord;
};

export type ProgressDocument = {
	readonly v: 1;
	readonly updatedAt: string;
	readonly rev: number;
	readonly levels: Readonly<Record<string, LevelProgress>>;
};

export type CadetRun = {
	readonly levelId: string;
	readonly tier: "cadet" | "veteran" | "ace";
	readonly stars: number;
	readonly score: number;
	readonly accuracy: number;
	readonly netWpm: number;
};

export function recordCadetRun(
	document: ProgressDocument,
	run: CadetRun,
	zoneHasStarBars: boolean,
	updatedAt: string,
): ProgressDocument {
	if (run.tier !== "cadet") {
		throw new RangeError("Only a Cadet run can be recorded.");
	}
	const current = document.levels[run.levelId];
	const previous = current?.cadet;
	const cadet = previous
		? {
				stars: Math.max(previous.stars, run.stars),
				medals: [...previous.medals],
				bestScore: Math.max(previous.bestScore, run.score),
				bestNetWpm: Math.max(previous.bestNetWpm, run.netWpm),
				bestAccuracy: Math.max(previous.bestAccuracy, run.accuracy),
				attempts: previous.attempts + 1,
				failedSinceLastStar: failuresSince(
					previous.failedSinceLastStar,
					run.stars,
					zoneHasStarBars,
				),
				calmUnlocked: previous.calmUnlocked,
			}
		: {
				stars: run.stars,
				medals: [],
				bestScore: run.score,
				bestNetWpm: run.netWpm,
				bestAccuracy: run.accuracy,
				attempts: 1,
				failedSinceLastStar: failuresSince(0, run.stars, zoneHasStarBars),
				calmUnlocked: false,
			};
	return {
		v: 1,
		updatedAt,
		rev: document.rev + 1,
		levels: {
			...document.levels,
			[run.levelId]: { ...current, cadet },
		},
	};
}

function failuresSince(
	previous: number,
	stars: number,
	zoneHasStarBars: boolean,
): number {
	if (!zoneHasStarBars) {
		return previous;
	}
	if (stars >= 1) {
		return 0;
	}
	return previous + 1;
}
