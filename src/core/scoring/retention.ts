export type RunTier = "cadet" | "veteran" | "ace";

export type RunMode =
	| "campaign"
	| "repair"
	| "systems-check"
	| "courier"
	| "daily-signal"
	| "deep-archive";

export type RetainLog = {
	readonly runId: string;
	readonly levelId: string;
	readonly tier: RunTier;
	readonly mode: RunMode;
	readonly startedAt: string;
	readonly score: number;
};

export type KeptRun = {
	readonly runId: string;
	readonly levelId: string;
	readonly tier: RunTier;
	readonly mode: RunMode;
	readonly kind: "best" | "recent";
};

const tierOrder: Record<RunTier, number> = {
	cadet: 0,
	veteran: 1,
	ace: 2,
};

export function retainRuns(logs: readonly RetainLog[]): {
	readonly kept: readonly KeptRun[];
	readonly dropped: readonly string[];
} {
	const seen = new Set<string>();
	for (const log of logs) {
		if (seen.has(log.runId)) {
			throw new RangeError("The run id is already a candidate.");
		}
		seen.add(log.runId);
	}
	const groups = new Map<string, RetainLog[]>();
	for (const log of logs) {
		const key = `${log.levelId}\0${log.tier}`;
		const group = groups.get(key);
		if (group === undefined) {
			groups.set(key, [log]);
		} else {
			group.push(log);
		}
	}
	const kept: KeptRun[] = [];
	const dropped: string[] = [];
	for (const group of groups.values()) {
		const best = [...group].sort(compareBest)[0];
		if (best === undefined) {
			continue;
		}
		const recent = new Set(
			[...group]
				.sort(compareRecent)
				.slice(0, 3)
				.map((log) => log.runId),
		);
		for (const log of group) {
			if (log.runId === best.runId || recent.has(log.runId)) {
				kept.push({
					runId: log.runId,
					levelId: log.levelId,
					tier: log.tier,
					mode: log.mode,
					kind: log.runId === best.runId ? "best" : "recent",
				});
			} else {
				dropped.push(log.runId);
			}
		}
	}
	kept.sort(compareKept);
	dropped.sort();
	return { kept, dropped };
}

function compareBest(left: RetainLog, right: RetainLog): number {
	if (left.score !== right.score) {
		return right.score - left.score;
	}
	return compareRecent(left, right);
}

function compareRecent(left: RetainLog, right: RetainLog): number {
	if (left.startedAt !== right.startedAt) {
		return left.startedAt < right.startedAt ? 1 : -1;
	}
	if (left.runId !== right.runId) {
		return left.runId < right.runId ? 1 : -1;
	}
	return 0;
}

function compareKept(left: KeptRun, right: KeptRun): number {
	if (left.levelId !== right.levelId) {
		return left.levelId < right.levelId ? -1 : 1;
	}
	if (left.tier !== right.tier) {
		return tierOrder[left.tier] - tierOrder[right.tier];
	}
	if (left.runId !== right.runId) {
		return left.runId < right.runId ? -1 : 1;
	}
	return 0;
}
