import { create } from "zustand";
import type { HudSnapshot } from "../../engine/bridge/hud-bridge";

export type HudState = {
	score: number;
	combo: number;
	activeCharacter: number | null;
	accuracy: number;
	velocity: number;
	setSnapshot(snapshot: HudSnapshot): void;
	reset(): void;
};

export const useHudStore = create<HudState>((set) => ({
	score: 0,
	combo: 0,
	activeCharacter: null,
	accuracy: 1,
	velocity: 0,
	setSnapshot: (snapshot) =>
		set({
			score: snapshot.score,
			combo: snapshot.combo,
			activeCharacter: snapshot.activeCharacter,
			accuracy: snapshot.accuracy,
			velocity: snapshot.velocity ?? 0,
		}),
	reset: () =>
		set({
			score: 0,
			combo: 0,
			activeCharacter: null,
			accuracy: 1,
			velocity: 0,
		}),
}));
