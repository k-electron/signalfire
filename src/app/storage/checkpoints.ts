import type { Storage } from "../../core/ports/storage";
import { formatRunId } from "../../core/schemas/run-id";
import {
	type ProgressDocument,
	recordCadetRun,
} from "../../core/scoring/record-run";
import type { RunSummary } from "../../core/sim/waiting-lanes";
import { createLocalStorage } from "../../platform/storage/indexed-db";

export type ProfileDocument = {
	readonly v: 1;
	readonly updatedAt: string;
	readonly createdAt: string;
	readonly rev: number;
	readonly callSign: string;
	readonly onboardingComplete: boolean;
	readonly preferredThumb: "left" | "right" | "either";
};

export type BootData = {
	readonly isFirstRun: boolean;
	readonly profile: ProfileDocument | null;
	readonly progress: ProgressDocument | null;
};

export async function loadBootData(storage?: Storage): Promise<BootData> {
	const store = storage ?? createLocalStorage();

	const profileResult = await store.load("profile");
	const progressResult = await store.load("progress");

	const profile =
		profileResult.status === "ok"
			? (profileResult.document as ProfileDocument)
			: null;
	const progress =
		progressResult.status === "ok"
			? (progressResult.document as ProgressDocument)
			: null;

	const isFirstRun = profile === null || !profile.onboardingComplete;

	return {
		isFirstRun,
		profile,
		progress,
	};
}

export async function saveOnboardingProfileCheckpoint(
	storage: Storage,
	input: {
		callSign: string;
		preferredThumb?: "left" | "right" | "either";
	},
): Promise<ProfileDocument> {
	const now = new Date().toISOString();
	const existingResult = await storage.load("profile");
	const previousRev =
		existingResult.status === "ok" ? existingResult.document.rev : -1;
	const createdAt =
		existingResult.status === "ok" ? existingResult.document.createdAt : now;

	const profileDoc: ProfileDocument = {
		v: 1,
		updatedAt: now,
		createdAt,
		rev: previousRev + 1,
		callSign: input.callSign,
		onboardingComplete: true,
		preferredThumb: input.preferredThumb ?? "either",
	};

	const saveResult = await storage.save("profile", profileDoc);
	if (saveResult.status !== "saved") {
		throw new Error(
			`Failed to save profile checkpoint: status ${saveResult.status}`,
		);
	}

	return profileDoc;
}

export async function saveLevelCompletionCheckpoint(
	storage: Storage,
	input: {
		levelId: string;
		summary: RunSummary;
		zoneHasStarBars: boolean;
	},
): Promise<{
	readonly progress: ProgressDocument;
	readonly firstStarEarned: boolean;
}> {
	const now = new Date().toISOString();
	const progressResult = await storage.load("progress");
	const existingProgress: ProgressDocument =
		progressResult.status === "ok"
			? (progressResult.document as ProgressDocument)
			: {
					v: 1,
					updatedAt: now,
					rev: 0,
					levels: {},
				};

	const updatedProgressBase = recordCadetRun(
		existingProgress,
		{
			levelId: input.levelId,
			tier: "cadet",
			stars: input.summary.stars,
			score: input.summary.score,
			accuracy: input.summary.accuracy,
			netWpm: input.summary.netWpm,
		},
		input.zoneHasStarBars,
		now,
	);

	const updatedProgress: ProgressDocument = {
		...updatedProgressBase,
		rev: existingProgress.rev + 1,
	};

	await storage.save("progress", updatedProgress);

	// Persist run log
	const runId = generateRunId();
	const runLogDoc = {
		v: 1 as const,
		updatedAt: now,
		rev: 0,
		runId,
		levelId: input.levelId,
		tier: "cadet" as const,
		mode: "campaign" as const,
		seed: "signalfire",
		contentVersion: "demo",
		engineVersion: "0.1.0",
		startedAt: now,
		inputs: [] as readonly (readonly [number, number, number])[],
		summary: {
			accuracy: input.summary.accuracy,
			netWpm: input.summary.netWpm,
			score: input.summary.score,
			stars: input.summary.stars,
			medals: [] as readonly string[],
		},
	};
	await storage.save(`run:${runId}`, runLogDoc);

	// Persist run index
	const indexResult = await storage.load("run-index");
	const existingIndex =
		indexResult.status === "ok"
			? indexResult.document
			: {
					v: 1 as const,
					updatedAt: now,
					rev: 0,
					kept: [] as readonly {
						runId: string;
						levelId: string;
						tier: "cadet" | "veteran" | "ace";
						mode:
							| "campaign"
							| "repair"
							| "systems-check"
							| "courier"
							| "daily-signal"
							| "deep-archive";
						kind: "best" | "recent";
					}[],
				};

	const updatedIndex = {
		...existingIndex,
		updatedAt: now,
		rev: existingIndex.rev + 1,
		kept: [
			...existingIndex.kept,
			{
				runId,
				levelId: input.levelId,
				tier: "cadet" as const,
				mode: "campaign" as const,
				kind: "best" as const,
			},
		],
	};
	await storage.save("run-index", updatedIndex);

	const firstStarEarned = input.summary.stars >= 1;
	if (firstStarEarned) {
		await requestStoragePersistence();
	}

	return {
		progress: updatedProgress,
		firstStarEarned,
	};
}

export async function requestStoragePersistence(): Promise<boolean> {
	if (
		typeof navigator !== "undefined" &&
		"storage" in navigator &&
		typeof navigator.storage?.persist === "function"
	) {
		try {
			return await navigator.storage.persist();
		} catch {
			return false;
		}
	}
	return false;
}

function generateRunId(): string {
	const entropy = new Uint8Array(10);
	if (typeof crypto !== "undefined" && crypto.getRandomValues) {
		crypto.getRandomValues(entropy);
	} else {
		for (let i = 0; i < 10; i++) {
			entropy[i] = Math.floor(Math.random() * 256);
		}
	}
	return formatRunId(Date.now(), entropy);
}
