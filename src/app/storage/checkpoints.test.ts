import { describe, expect, it, vi } from "vitest";
import { createFakeStorage } from "../../core/ports/fakes";
import type { RunLogDocument, RunSummary } from "../../core/sim/waiting-lanes";
import {
	loadBootData,
	requestStoragePersistence,
	saveLevelCompletionCheckpoint,
	saveOnboardingProfileCheckpoint,
} from "./checkpoints";

describe("Storage checkpoints and boot hydration", () => {
	it("loads boot data as first run when storage is empty", async () => {
		const storage = createFakeStorage();
		const boot = await loadBootData(storage);

		expect(boot.isFirstRun).toBe(true);
		expect(boot.profile).toBeNull();
		expect(boot.progress).toBeNull();
	});

	it("saves onboarding profile checkpoint and returns updated profile", async () => {
		const storage = createFakeStorage();
		const saved = await saveOnboardingProfileCheckpoint(storage, {
			callSign: "Cadet Nova",
		});

		expect(saved.callSign).toBe("Cadet Nova");
		expect(saved.onboardingComplete).toBe(true);
		expect(saved.preferredThumb).toBe("either");

		const loaded = await storage.load("profile");
		expect(loaded.status).toBe("ok");
		if (loaded.status === "ok") {
			expect(loaded.document.callSign).toBe("Cadet Nova");
			expect(loaded.document.onboardingComplete).toBe(true);
		}
	});

	it("identifies returning player when stored profile has onboarding complete", async () => {
		const storage = createFakeStorage();
		await saveOnboardingProfileCheckpoint(storage, {
			callSign: "Beacon Leader",
		});

		const boot = await loadBootData(storage);
		expect(boot.isFirstRun).toBe(false);
		expect(boot.profile?.callSign).toBe("Beacon Leader");
	});

	it("saves level completion checkpoint with progress and recorded run log", async () => {
		const storage = createFakeStorage();
		const summary = {
			accuracy: 0.95,
			netWpm: 8,
			score: 260,
			stars: 1,
			medals: [] as string[],
		};
		const runId = "01AFQCG20004HMASW9NF6YY41J";
		const runLog: RunLogDocument = {
			v: 1,
			updatedAt: "2026-10-15T20:00:00.000Z",
			rev: 0,
			runId,
			levelId: "level:1.1",
			tier: "cadet",
			mode: "campaign",
			seed: "signalfire",
			contentVersion: "sha256:test-content",
			engineVersion: "0.0.0",
			startedAt: "2026-10-15T20:00:00.000Z",
			inputs: [[0, 102, 0]],
			summary,
		};

		const result = await saveLevelCompletionCheckpoint(storage, {
			levelId: "level:1.1",
			summary,
			zoneHasStarBars: true,
			runLog,
		});

		expect(result.firstStarEarned).toBe(true);
		expect(result.progress.levels["level:1.1"]?.cadet?.stars).toBe(1);

		const loadedProgress = await storage.load("progress");
		expect(loadedProgress.status).toBe("ok");
		if (loadedProgress.status === "ok") {
			expect(loadedProgress.document.levels["level:1.1"]?.cadet?.stars).toBe(1);
			expect(
				loadedProgress.document.levels["level:1.1"]?.cadet?.bestScore,
			).toBe(260);
		}

		const loadedRun = await storage.load(`run:${runId}`);
		expect(loadedRun.status).toBe("ok");
		if (loadedRun.status === "ok") {
			expect(loadedRun.document.inputs).toEqual([[0, 102, 0]]);
			expect(loadedRun.document.contentVersion).toBe("sha256:test-content");
			expect(loadedRun.document.engineVersion).toBe("0.0.0");
		}

		const loadedIndex = await storage.load("run-index");
		expect(loadedIndex.status).toBe("ok");
		if (loadedIndex.status === "ok") {
			expect(loadedIndex.document.kept).toEqual([
				{
					runId,
					levelId: "level:1.1",
					tier: "cadet",
					mode: "campaign",
					kind: "best",
				},
			]);
		}
	});

	it("retains only the best and last 3 runs per level and tier in run-index", async () => {
		const storage = createFakeStorage();
		const runs = [
			{
				runId: "00000000000000000000000000",
				startedAt: "2026-10-15T20:00:00.000Z",
				score: 500,
			},
			{
				runId: "00000000000000000000000001",
				startedAt: "2026-10-15T20:01:00.000Z",
				score: 250,
			},
			{
				runId: "00000000000000000000000002",
				startedAt: "2026-10-15T20:02:00.000Z",
				score: 260,
			},
			{
				runId: "00000000000000000000000003",
				startedAt: "2026-10-15T20:03:00.000Z",
				score: 270,
			},
			{
				runId: "00000000000000000000000004",
				startedAt: "2026-10-15T20:04:00.000Z",
				score: 280,
			},
		];

		for (const item of runs) {
			const summary: RunSummary & { medals: string[] } = {
				accuracy: 0.95,
				netWpm: 8,
				score: item.score,
				stars: 1,
				medals: [],
			};
			await saveLevelCompletionCheckpoint(storage, {
				levelId: "level:1.1",
				summary,
				zoneHasStarBars: true,
				runLog: {
					v: 1,
					updatedAt: item.startedAt,
					rev: 0,
					runId: item.runId,
					levelId: "level:1.1",
					tier: "cadet",
					mode: "campaign",
					seed: "signalfire",
					contentVersion: "sha256:test-content",
					engineVersion: "0.0.0",
					startedAt: item.startedAt,
					inputs: [[0, 102, 0]],
					summary,
				},
			});
		}

		const loadedIndex = await storage.load("run-index");
		expect(loadedIndex.status).toBe("ok");
		if (loadedIndex.status === "ok") {
			expect(loadedIndex.document.kept).toEqual([
				{
					runId: "00000000000000000000000000",
					levelId: "level:1.1",
					tier: "cadet",
					mode: "campaign",
					kind: "best",
				},
				{
					runId: "00000000000000000000000002",
					levelId: "level:1.1",
					tier: "cadet",
					mode: "campaign",
					kind: "recent",
				},
				{
					runId: "00000000000000000000000003",
					levelId: "level:1.1",
					tier: "cadet",
					mode: "campaign",
					kind: "recent",
				},
				{
					runId: "00000000000000000000000004",
					levelId: "level:1.1",
					tier: "cadet",
					mode: "campaign",
					kind: "recent",
				},
			]);
		}
	});

	it("requests storage persistence if navigator.storage.persist is available", async () => {
		const persistMock = vi.fn().mockResolvedValue(true);
		const originalNavigator = globalThis.navigator;

		try {
			Object.defineProperty(globalThis, "navigator", {
				value: {
					storage: {
						persist: persistMock,
					},
				},
				configurable: true,
				writable: true,
			});

			const granted = await requestStoragePersistence();
			expect(granted).toBe(true);
			expect(persistMock).toHaveBeenCalledTimes(1);
		} finally {
			Object.defineProperty(globalThis, "navigator", {
				value: originalNavigator,
				configurable: true,
				writable: true,
			});
		}
	});

	it("handles missing or rejected navigator.storage.persist gracefully", async () => {
		const originalNavigator = globalThis.navigator;

		try {
			Object.defineProperty(globalThis, "navigator", {
				value: {},
				configurable: true,
				writable: true,
			});

			const granted = await requestStoragePersistence();
			expect(granted).toBe(false);
		} finally {
			Object.defineProperty(globalThis, "navigator", {
				value: originalNavigator,
				configurable: true,
				writable: true,
			});
		}
	});
});
