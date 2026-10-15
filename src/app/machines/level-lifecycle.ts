import { assign, type SnapshotFrom, setup } from "xstate";
import type { MissedBar } from "../../core/scoring/stars";
import type { RunSummary } from "../../core/sim/waiting-lanes";

export type LevelLifecycleEvent =
	| { type: "loaded" }
	| { type: "launch" }
	| { type: "tick" }
	| { type: "pause" }
	| { type: "resume" }
	| { type: "quit" }
	| { type: "finish"; summary: RunSummary; missed: readonly MissedBar[] }
	| { type: "continue" }
	| { type: "back" }
	| { type: "error"; message: string };

export type LevelLifecycleContext = {
	readonly levelId: string;
	readonly seed: string;
	readonly countdown: number;
	readonly summary: RunSummary | null;
	readonly missed: readonly MissedBar[];
	readonly error: string | null;
};

export type LevelLifecycleInput = {
	readonly levelId?: string;
	readonly seed?: string;
};

const builtLevelLifecycleMachine = setup({
	types: {
		context: {} as LevelLifecycleContext,
		events: {} as LevelLifecycleEvent,
		input: {} as LevelLifecycleInput | undefined,
	},
	actions: {
		resetCountdown: assign({ countdown: 3 }),
		decrementCountdown: assign({
			countdown: ({ context }) => Math.max(0, context.countdown - 1),
		}),
		assignResults: assign({
			summary: ({ event }) => (event.type === "finish" ? event.summary : null),
			missed: ({ event }) => (event.type === "finish" ? event.missed : []),
		}),
		assignError: assign({
			error: ({ event }) =>
				event.type === "error" ? event.message : "An error occurred",
		}),
	},
	guards: {
		isCountdownComplete: ({ context }) => context.countdown <= 1,
	},
}).createMachine({
	id: "levelLifecycle",
	initial: "loading",
	context: ({ input }) => ({
		levelId: input?.levelId ?? "level:1.1",
		seed: input?.seed ?? "signalfire",
		countdown: 3,
		summary: null,
		missed: [],
		error: null,
	}),
	states: {
		loading: {
			on: {
				loaded: "briefing",
				error: { target: "error", actions: "assignError" },
			},
		},
		briefing: {
			on: {
				launch: { target: "countdown", actions: "resetCountdown" },
			},
		},
		countdown: {
			on: {
				tick: [
					{ guard: "isCountdownComplete", target: "playing" },
					{ actions: "decrementCountdown" },
				],
			},
		},
		playing: {
			on: {
				pause: "paused",
				finish: { target: "finishing", actions: "assignResults" },
				error: { target: "error", actions: "assignError" },
			},
		},
		paused: {
			on: {
				resume: { target: "countdown", actions: "resetCountdown" },
				quit: "quit",
			},
		},
		finishing: {
			always: "results",
		},
		results: {
			on: {
				continue: "complete",
			},
		},
		error: {
			on: {
				back: "quit",
			},
		},
		quit: {
			type: "final",
		},
		complete: {
			type: "final",
		},
	},
});

export const levelLifecycleMachine = builtLevelLifecycleMachine;

export type LevelLifecycleSnapshot = SnapshotFrom<typeof levelLifecycleMachine>;

export function levelKeyToEvent(
	snapshot: LevelLifecycleSnapshot,
	key: string,
): LevelLifecycleEvent | null {
	const state = snapshot.value;
	switch (state) {
		case "briefing":
			if (key === " ") {
				return { type: "launch" };
			}
			return null;
		case "playing":
			if (key === "Escape") {
				return { type: "pause" };
			}
			return null;
		case "paused":
			if (key === " ") {
				return { type: "resume" };
			}
			if (key === "Escape") {
				return { type: "quit" };
			}
			return null;
		case "results":
			if (key === " " || key === "Escape" || key === "Enter") {
				return { type: "continue" };
			}
			return null;
		case "error":
			if (key === "Escape" || key === " " || key === "Enter") {
				return { type: "back" };
			}
			return null;
		default:
			return null;
	}
}
