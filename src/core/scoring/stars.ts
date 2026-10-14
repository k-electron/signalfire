export type StarBar = {
	readonly accuracyPercent: number;
	readonly wpm: number;
};

export type StarBars = {
	readonly one: StarBar;
	readonly two: StarBar;
	readonly three: StarBar;
};

export type MissedBar =
	| {
			readonly kind: "integrity";
			readonly measuredPercent: number;
			readonly neededPercent: number;
			readonly shortfallPercent: number;
	  }
	| {
			readonly kind: "velocity";
			readonly measuredWpm: number;
			readonly neededWpm: number;
			readonly shortfallWpm: number;
	  };

export type StarAward = {
	readonly stars: 0 | 1 | 2 | 3;
	readonly missed: readonly MissedBar[];
};

export type StarInput = {
	readonly finished: boolean;
	readonly correctFirstAttempts: number;
	readonly firstAttempts: number;
	readonly netWpm: number;
	readonly starBars: StarBars | null;
};

export function awardStars(input: StarInput): StarAward {
	if (!input.finished || input.starBars === null) {
		return { stars: 0, missed: [] };
	}
	const stars = highestStar(input, input.starBars);
	if (stars > 0) {
		return { stars, missed: [] };
	}
	return { stars: 0, missed: missedBars(input, input.starBars.one) };
}

function highestStar(input: StarInput, bars: StarBars): 0 | 1 | 2 | 3 {
	const levels = [
		{ stars: 3 as const, bar: bars.three },
		{ stars: 2 as const, bar: bars.two },
		{ stars: 1 as const, bar: bars.one },
	];
	for (const level of levels) {
		if (meets(input, level.bar)) {
			return level.stars;
		}
	}
	return 0;
}

function meets(input: StarInput, bar: StarBar): boolean {
	return (
		meetsAccuracy(
			input.correctFirstAttempts,
			input.firstAttempts,
			bar.accuracyPercent,
		) && input.netWpm >= bar.wpm
	);
}

function meetsAccuracy(
	correct: number,
	attempts: number,
	percent: number,
): boolean {
	if (attempts === 0) {
		return true;
	}
	return correct * 100 >= percent * attempts;
}

function measuredPercent(correct: number, attempts: number): number {
	if (attempts === 0) {
		return 100;
	}
	return (100 * correct) / attempts;
}

function missedBars(input: StarInput, bar: StarBar): MissedBar[] {
	const missed: MissedBar[] = [];
	if (
		!meetsAccuracy(
			input.correctFirstAttempts,
			input.firstAttempts,
			bar.accuracyPercent,
		)
	) {
		const measured = measuredPercent(
			input.correctFirstAttempts,
			input.firstAttempts,
		);
		missed.push({
			kind: "integrity",
			measuredPercent: measured,
			neededPercent: bar.accuracyPercent,
			shortfallPercent: bar.accuracyPercent - measured,
		});
	}
	if (input.netWpm < bar.wpm) {
		missed.push({
			kind: "velocity",
			measuredWpm: input.netWpm,
			neededWpm: bar.wpm,
			shortfallWpm: bar.wpm - input.netWpm,
		});
	}
	return missed;
}
