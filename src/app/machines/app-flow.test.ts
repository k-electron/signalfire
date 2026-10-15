import { expect, test } from "vitest";
import { type Actor, createActor } from "xstate";
import { type AppFlowEvent, appFlowMachine, keyToEvent } from "./app-flow";

type Flow = Actor<typeof appFlowMachine>;

function start(input?: { firstRun: boolean }) {
	const flow = createActor(appFlowMachine, { input });
	flow.start();
	return flow;
}

function send(flow: Flow, ...events: AppFlowEvent[]) {
	for (const event of events) {
		flow.send(event);
	}
	return flow.getSnapshot();
}

const firstRun = { firstRun: true } as const;
const returning = { firstRun: false } as const;

test("A new flow is boot", () => {
	expect(start(firstRun).getSnapshot().value).toBe("boot");
});

test("Ready leaves boot for the title", () => {
	expect(send(start(firstRun), { type: "ready" }).value).toBe("title");
});

test("Going back from boot stays at boot", () => {
	expect(send(start(firstRun), { type: "back" }).value).toBe("boot");
});

test("A first run opens onboarding", () => {
	expect(
		send(start(firstRun), { type: "ready" }, { type: "begin" }).value,
	).toBe("onboarding");
});

test("A returning visit opens the hub", () => {
	expect(
		send(start(returning), { type: "ready" }, { type: "begin" }).value,
	).toBe("hub");
});

test("An untold visit is a first run", () => {
	expect(send(start(), { type: "ready" }, { type: "begin" }).value).toBe(
		"onboarding",
	);
});

test("Back from the title stays on the title", () => {
	expect(send(start(firstRun), { type: "ready" }, { type: "back" }).value).toBe(
		"title",
	);
});

test("Continue starts level 0.1 on first run", () => {
	const snapshot = send(
		start(firstRun),
		{ type: "ready" },
		{ type: "begin" },
		{ type: "continue" },
	);
	expect(snapshot.value).toBe("level");
	expect(snapshot.context.levelId).toBe("level:0.1");
});

test("Continue opens the hub when returning", () => {
	const flow = start(returning);
	send(flow, { type: "ready" }, { type: "begin" }, { type: "openOnboarding" });
	const snapshot = send(flow, { type: "continue" });
	expect(snapshot.value).toBe("hub");
});

test("First run flow advances from level 0.1 through level 1.1 to results and zone map", () => {
	const flow = start(firstRun);
	send(flow, { type: "ready" }, { type: "begin" }, { type: "continue" });
	expect(flow.getSnapshot().value).toBe("level");
	expect(flow.getSnapshot().context.levelId).toBe("level:0.1");

	// Finishing level 0.1 advances to level 1.1
	send(flow, { type: "finish" });
	expect(flow.getSnapshot().value).toBe("level");
	expect(flow.getSnapshot().context.levelId).toBe("level:1.1");

	// Finishing level 1.1 advances to results
	send(flow, { type: "finish" });
	expect(flow.getSnapshot().value).toBe("results");

	// Results continue opens the zone map
	send(flow, { type: "toZoneMap" });
	expect(flow.getSnapshot().value).toBe("zoneMap");
});

test("Back returns to the title", () => {
	expect(
		send(
			start(firstRun),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "back" },
		).value,
	).toBe("title");
});

test("The hub opens the galaxy map", () => {
	expect(
		send(
			start(returning),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "openGalaxy" },
		).value,
	).toBe("galaxyMap");
});

test("The hub opens the zone map", () => {
	expect(
		send(
			start(returning),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "openZone" },
		).value,
	).toBe("zoneMap");
});

test("The hub opens the dossier", () => {
	expect(
		send(
			start(returning),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "openDossier" },
		).value,
	).toBe("dossier");
});

test("The hub opens the hangar", () => {
	expect(
		send(
			start(returning),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "openHangar" },
		).value,
	).toBe("hangar");
});

test("The hub opens the codex", () => {
	expect(
		send(
			start(returning),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "openCodex" },
		).value,
	).toBe("codex");
});

test("The hub opens settings", () => {
	expect(
		send(
			start(returning),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "openSettings" },
		).value,
	).toBe("settings");
});

test("The hub selects the galaxy map first", () => {
	expect(
		send(start(returning), { type: "ready" }, { type: "begin" }).context
			.hubIndex,
	).toBe(0);
});

test("Back from the galaxy map returns to the hub", () => {
	expect(
		send(
			start(returning),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "openGalaxy" },
			{ type: "back" },
		).value,
	).toBe("hub");
});

test("Back from the dossier returns to the hub", () => {
	expect(
		send(
			start(returning),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "openDossier" },
			{ type: "back" },
		).value,
	).toBe("hub");
});

test("Back from the hangar returns to the hub", () => {
	expect(
		send(
			start(returning),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "openHangar" },
			{ type: "back" },
		).value,
	).toBe("hub");
});

test("Back from the codex returns to the hub", () => {
	expect(
		send(
			start(returning),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "openCodex" },
			{ type: "back" },
		).value,
	).toBe("hub");
});

test("Back from settings returns to the hub", () => {
	expect(
		send(
			start(returning),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "openSettings" },
			{ type: "back" },
		).value,
	).toBe("hub");
});

test("The galaxy map opens the zone map", () => {
	expect(
		send(
			start(returning),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "openGalaxy" },
			{ type: "openZone" },
		).value,
	).toBe("zoneMap");
});

test("Back returns to the galaxy map", () => {
	expect(
		send(
			start(returning),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "openGalaxy" },
			{ type: "openZone" },
			{ type: "back" },
		).value,
	).toBe("galaxyMap");
});

test("Back returns to the hub", () => {
	expect(
		send(
			start(returning),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "openZone" },
			{ type: "back" },
		).value,
	).toBe("hub");
});

test("The zone map opens the level", () => {
	expect(
		send(
			start(returning),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "openZone" },
			{ type: "startLevel" },
		).value,
	).toBe("level");
});

test("toZoneMap from the level returns to the zone map", () => {
	expect(
		send(
			start(returning),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "openZone" },
			{ type: "startLevel" },
			{ type: "toZoneMap" },
		).value,
	).toBe("zoneMap");
});

test("Back from the level opens pause", () => {
	expect(
		send(
			start(returning),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "openZone" },
			{ type: "startLevel" },
			{ type: "back" },
		).value,
	).toBe("pause");
});

test("Space and Escape on pause return to the level", () => {
	const flow = start(returning);
	const level = send(
		flow,
		{ type: "ready" },
		{ type: "begin" },
		{ type: "openZone" },
		{ type: "startLevel" },
	);
	expect(keyToEvent(level, "Escape")).toEqual({ type: "back" });
	const paused = send(flow, { type: "back" });
	expect(paused.value).toBe("pause");
	expect(keyToEvent(paused, " ")).toEqual({ type: "resume" });
	expect(send(flow, { type: "resume" }).value).toBe("level");
	const pausedAgain = send(flow, { type: "back" });
	expect(keyToEvent(pausedAgain, "Escape")).toEqual({ type: "back" });
	expect(send(flow, { type: "back" }).value).toBe("level");
});

test("Finish opens results", () => {
	const snapshot = send(
		start(returning),
		{ type: "ready" },
		{ type: "begin" },
		{ type: "openZone" },
		{ type: "startLevel" },
		{ type: "finish" },
	);
	expect(snapshot.value).toBe("results");
	expect(snapshot.context.resultsIndex).toBe(0);
});

test("Back from results opens the zone map", () => {
	expect(
		send(
			start(returning),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "openZone" },
			{ type: "startLevel" },
			{ type: "finish" },
			{ type: "back" },
		).value,
	).toBe("zoneMap");
});

test("Return to the zone map opens the zone map", () => {
	expect(
		send(
			start(returning),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "openZone" },
			{ type: "startLevel" },
			{ type: "finish" },
			{ type: "toZoneMap" },
		).value,
	).toBe("zoneMap");
});

test("Return to the hub opens the hub", () => {
	expect(
		send(
			start(returning),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "openZone" },
			{ type: "startLevel" },
			{ type: "finish" },
			{ type: "toHub" },
		).value,
	).toBe("hub");
});

test("Back returns to onboarding", () => {
	const flow = start(returning);
	send(
		flow,
		{ type: "ready" },
		{ type: "begin" },
		{ type: "openOnboarding" },
		{ type: "continue" },
	);
	expect(send(flow, { type: "back" }).value).toBe("onboarding");
});

test("Back returns to the title", () => {
	expect(
		send(
			start(returning),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "back" },
		).value,
	).toBe("title");
});

test("Starting a level from the title stays on the title", () => {
	expect(
		send(start(firstRun), { type: "ready" }, { type: "startLevel" }).value,
	).toBe("title");
});

test("Finishing from the hub stays on the hub", () => {
	expect(
		send(
			start(returning),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "finish" },
		).value,
	).toBe("hub");
});

test("Beginning again from the level stays on the level", () => {
	expect(
		send(
			start(returning),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "openZone" },
			{ type: "startLevel" },
			{ type: "begin" },
		).value,
	).toBe("level");
});
