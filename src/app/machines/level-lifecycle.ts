import { assign, setup } from "xstate";
import type { MissedBar } from "../../core/scoring/stars";
import type { RunSummary } from "../../core/sim/waiting-lanes";

export type LevelLifecycleEvent =
	| { type: "LOADED" }
	| { type: "FAIL"; error: string }
	| { type: "LAUNCH" }
	| { type: "TICK" }
	| { type: "SKIP" }
	| { type: "PAUSE" }
	| { type: "RESUME" }
	| { type: "QUIT" }
	| {
			type: "FINISH";
			summary?: RunSummary;
			missed?: readonly MissedBar[];
	  }
	| { type: "CONTINUE" }
	| { type: "TO_HUB" }
	| { type: "ERROR"; error: string };

export type LevelLifecycleContext = {
	levelId: string;
	seed: string;
	error: string | null;
	countdownValue: number;
	runSummary: RunSummary | null;
	missedBars: readonly MissedBar[];
};

export const levelLifecycleMachine = setup({
	types: {
		context: {} as LevelLifecycleContext,
		events: {} as LevelLifecycleEvent,
		input: {} as { levelId?: string; seed?: string } | undefined,
	},
	actions: {
		setError: assign({
			error: ({ event }) =>
				event.type === "FAIL" || event.type === "ERROR" ? event.error : null,
		}),
		resetCountdown: assign({
			countdownValue: 3,
		}),
		decrementCountdown: assign({
			countdownValue: ({ context }) => context.countdownValue - 1,
		}),
		setRunResults: assign({
			runSummary: ({ event }) =>
				event.type === "FINISH" ? (event.summary ?? null) : null,
			missedBars: ({ event }) =>
				event.type === "FINISH" ? (event.missed ?? []) : [],
		}),
	},
	guards: {
		countdownFinished: ({ context }) => context.countdownValue <= 1,
	},
}).createMachine({
	id: "levelLifecycle",
	initial: "loading",
	context: ({ input }) => ({
		levelId: input?.levelId ?? "level:1.1",
		seed: input?.seed ?? "signalfire",
		error: null,
		countdownValue: 3,
		runSummary: null,
		missedBars: [],
	}),
	states: {
		loading: {
			on: {
				LOADED: "briefing",
				FAIL: {
					target: "error",
					actions: "setError",
				},
			},
		},
		briefing: {
			on: {
				LAUNCH: {
					target: "countdown",
					actions: "resetCountdown",
				},
				QUIT: "quit",
			},
		},
		countdown: {
			on: {
				TICK: [
					{
						guard: "countdownFinished",
						target: "playing",
					},
					{
						actions: "decrementCountdown",
					},
				],
				SKIP: "playing",
			},
		},
		playing: {
			on: {
				PAUSE: "paused",
				FINISH: {
					target: "results",
					actions: "setRunResults",
				},
				ERROR: {
					target: "error",
					actions: "setError",
				},
			},
		},
		paused: {
			on: {
				RESUME: {
					target: "countdown",
					actions: "resetCountdown",
				},
				QUIT: "quit",
			},
		},
		results: {
			on: {
				CONTINUE: "continued",
				TO_HUB: "hub",
			},
		},
		error: {
			on: {
				QUIT: "quit",
			},
		},
		quit: {
			type: "final",
		},
		continued: {
			type: "final",
		},
		hub: {
			type: "final",
		},
	},
});
