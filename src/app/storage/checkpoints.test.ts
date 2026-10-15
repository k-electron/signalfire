import { describe, expect, it, vi } from "vitest";
import { createFakeStorage } from "../../core/ports/fakes";
import type { RunSummary } from "../../core/sim/waiting-lanes";
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

	it("saves level completion checkpoint with progress and run log", async () => {
		const storage = createFakeStorage();
		const summary: RunSummary = {
			accuracy: 0.95,
			netWpm: 8,
			score: 250,
			stars: 1,
			medals: [],
		};

		const result = await saveLevelCompletionCheckpoint(storage, {
			levelId: "level:1.1",
			summary,
			zoneHasStarBars: true,
		});

		expect(result.firstStarEarned).toBe(true);
		expect(result.progress.levels["level:1.1"]?.cadet?.stars).toBe(1);

		const loadedProgress = await storage.load("progress");
		expect(loadedProgress.status).toBe("ok");
		if (loadedProgress.status === "ok") {
			expect(loadedProgress.document.levels["level:1.1"]?.cadet?.stars).toBe(1);
			expect(
				loadedProgress.document.levels["level:1.1"]?.cadet?.bestScore,
			).toBe(250);
		}

		const loadedIndex = await storage.load("run-index");
		expect(loadedIndex.status).toBe("ok");
		if (loadedIndex.status === "ok") {
			expect(loadedIndex.document.kept.length).toBeGreaterThan(0);
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
