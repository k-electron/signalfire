import { create } from "zustand";
import type { HudSnapshot } from "../../engine/bridge/hud-bridge";

export type HudState = {
	score: number;
	combo: number;
	activeCharacter: number | null;
	accuracy: number;
	setSnapshot(snapshot: HudSnapshot): void;
	reset(): void;
};

export const useHudStore = create<HudState>((set) => ({
	score: 0,
	combo: 0,
	activeCharacter: null,
	accuracy: 1,
	setSnapshot: (snapshot) => set(snapshot),
	reset: () =>
		set({
			score: 0,
			combo: 0,
			activeCharacter: null,
			accuracy: 1,
		}),
}));
