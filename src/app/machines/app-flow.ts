import { assign, type SnapshotFrom, setup } from "xstate";

export type AppFlowEvent =
	| { type: "ready" }
	| { type: "begin" }
	| { type: "continue" }
	| { type: "openGalaxy" }
	| { type: "openDossier" }
	| { type: "openHangar" }
	| { type: "openCodex" }
	| { type: "openSettings" }
	| { type: "openZone" }
	| { type: "startLevel" }
	| { type: "finish" }
	| { type: "toZoneMap" }
	| { type: "toHub" }
	| { type: "selectNext" }
	| { type: "selectPrevious" }
	| { type: "resume" }
	| { type: "back" };

type AppFlowContext = {
	firstRun: boolean;
	hubFrom: "onboarding" | "title" | null;
	zoneFrom: "hub" | "galaxyMap" | null;
	hubIndex: number;
	resultsIndex: number;
};

const hubLast = 5;
const resultsLast = 1;

function stepIndex(index: number, delta: number, last: number) {
	return Math.min(last, Math.max(0, index + delta));
}

export const hubItems = [
	{ label: "Galaxy map", event: { type: "openGalaxy" } },
	{ label: "Dossier", event: { type: "openDossier" } },
	{ label: "Hangar", event: { type: "openHangar" } },
	{ label: "Codex", event: { type: "openCodex" } },
	{ label: "Settings", event: { type: "openSettings" } },
	{ label: "Zone map", event: { type: "openZone" } },
] as const satisfies readonly { label: string; event: AppFlowEvent }[];

export const resultsItems = [
	{ label: "Continue", event: { type: "toZoneMap" } },
	{ label: "Hub", event: { type: "toHub" } },
] as const satisfies readonly { label: string; event: AppFlowEvent }[];

const builtAppFlowMachine = setup({
	types: {
		context: {} as AppFlowContext,
		events: {} as AppFlowEvent,
		input: {} as { firstRun?: boolean } | undefined,
	},
	actions: {
		enterHubFromTitle: assign({ hubFrom: "title" }),
		enterHubFromOnboarding: assign({ hubFrom: "onboarding" }),
		resetHubIndex: assign({ hubIndex: 0 }),
		openZoneFromHub: assign({ zoneFrom: "hub" }),
		openZoneFromGalaxy: assign({ zoneFrom: "galaxyMap" }),
		resetResults: assign({ resultsIndex: 0 }),
		selectNextHub: assign({
			hubIndex: ({ context }) => stepIndex(context.hubIndex, 1, hubLast),
		}),
		selectPreviousHub: assign({
			hubIndex: ({ context }) => stepIndex(context.hubIndex, -1, hubLast),
		}),
		selectNextResults: assign({
			resultsIndex: ({ context }) =>
				stepIndex(context.resultsIndex, 1, resultsLast),
		}),
		selectPreviousResults: assign({
			resultsIndex: ({ context }) =>
				stepIndex(context.resultsIndex, -1, resultsLast),
		}),
	},
	guards: {
		isFirstRun: ({ context }) => context.firstRun,
		hubFromOnboarding: ({ context }) => context.hubFrom === "onboarding",
		hubFromTitle: ({ context }) => context.hubFrom === "title",
		zoneFromGalaxy: ({ context }) => context.zoneFrom === "galaxyMap",
		zoneFromHub: ({ context }) => context.zoneFrom === "hub",
	},
}).createMachine({
	id: "appFlow",
	initial: "boot",
	context: ({ input }) => ({
		firstRun: input?.firstRun ?? true,
		hubFrom: null,
		zoneFrom: null,
		hubIndex: 0,
		resultsIndex: 0,
	}),
	states: {
		boot: {
			on: { ready: "title" },
		},
		title: {
			on: {
				begin: [
					{ guard: "isFirstRun", target: "onboarding" },
					{ target: "hub", actions: "enterHubFromTitle" },
				],
			},
		},
		onboarding: {
			on: {
				continue: { target: "hub", actions: "enterHubFromOnboarding" },
				back: "title",
			},
		},
		hub: {
			entry: "resetHubIndex",
			on: {
				openGalaxy: "galaxyMap",
				openDossier: "dossier",
				openHangar: "hangar",
				openCodex: "codex",
				openSettings: "settings",
				openZone: { target: "zoneMap", actions: "openZoneFromHub" },
				selectNext: { actions: "selectNextHub" },
				selectPrevious: { actions: "selectPreviousHub" },
				back: [
					{ guard: "hubFromOnboarding", target: "onboarding" },
					{ guard: "hubFromTitle", target: "title" },
				],
			},
		},
		galaxyMap: {
			on: {
				openZone: { target: "zoneMap", actions: "openZoneFromGalaxy" },
				back: { target: "hub", actions: "resetHubIndex" },
			},
		},
		zoneMap: {
			on: {
				startLevel: "level",
				back: [
					{
						guard: "zoneFromGalaxy",
						target: "galaxyMap",
					},
					{ guard: "zoneFromHub", target: "hub", actions: "resetHubIndex" },
				],
			},
		},
		dossier: {
			on: { back: { target: "hub", actions: "resetHubIndex" } },
		},
		hangar: {
			on: { back: { target: "hub", actions: "resetHubIndex" } },
		},
		codex: {
			on: { back: { target: "hub", actions: "resetHubIndex" } },
		},
		settings: {
			on: { back: { target: "hub", actions: "resetHubIndex" } },
		},
		level: {
			on: {
				finish: "results",
				toZoneMap: "zoneMap",
				toHub: { target: "hub", actions: "resetHubIndex" },
				back: "zoneMap",
			},
		},
		// Back from results opens the zone map. The level is not a parent.
		results: {
			entry: "resetResults",
			on: {
				toZoneMap: "zoneMap",
				toHub: { target: "hub", actions: "resetHubIndex" },
				back: "zoneMap",
				selectNext: { actions: "selectNextResults" },
				selectPrevious: { actions: "selectPreviousResults" },
			},
		},
	},
});

export const appFlowMachine = builtAppFlowMachine;

type AppFlowSnapshot = SnapshotFrom<typeof appFlowMachine>;

function spaceEvent(
	screen: string,
	context: AppFlowContext,
): AppFlowEvent | null {
	switch (screen) {
		case "title":
			return { type: "begin" };
		case "onboarding":
			return { type: "continue" };
		case "hub":
			return hubItems[context.hubIndex]?.event ?? null;
		case "galaxyMap":
			return { type: "openZone" };
		case "zoneMap":
			return { type: "startLevel" };
		case "results":
			return resultsItems[context.resultsIndex]?.event ?? null;
		default:
			return null;
	}
}

export function keyToEvent(
	snapshot: AppFlowSnapshot,
	key: string,
): AppFlowEvent | null {
	const screen = snapshot.value;
	if (screen === "level") {
		return null;
	}
	if (key === "Escape") {
		return { type: "back" };
	}
	if (key === " ") {
		return spaceEvent(screen, snapshot.context);
	}
	if (
		screen === "hub" &&
		key.length === 1 &&
		key >= "1" &&
		key <= String(hubItems.length)
	) {
		return hubItems[Number(key) - 1]?.event ?? null;
	}
	if (screen === "results" && key === "1") {
		return { type: "toZoneMap" };
	}
	if (screen === "results" && key === "2") {
		return { type: "toHub" };
	}
	if (screen === "hub" || screen === "results") {
		if (key === "ArrowDown" || key === "ArrowRight") {
			return { type: "selectNext" };
		}
		if (key === "ArrowUp" || key === "ArrowLeft") {
			return { type: "selectPrevious" };
		}
	}
	return null;
}
