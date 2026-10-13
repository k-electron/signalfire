import { expect, test } from "vitest";
import { type Actor, createActor } from "xstate";
import { type AppFlowEvent, appFlowMachine } from "./app-flow";

type Flow = Actor<typeof appFlowMachine>;

function start(input?: { firstRun: boolean }) {
	const flow =
		input === undefined
			? createActor(appFlowMachine)
			: createActor(appFlowMachine, { input });
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

test("Continue opens the hub", () => {
	expect(
		send(
			start(firstRun),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "continue" },
		).value,
	).toBe("hub");
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
			start(firstRun),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "continue" },
			{ type: "openGalaxy" },
		).value,
	).toBe("galaxyMap");
});

test("The hub opens the zone map", () => {
	expect(
		send(
			start(firstRun),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "continue" },
			{ type: "openZone" },
		).value,
	).toBe("zoneMap");
});

test("The hub opens the dossier", () => {
	expect(
		send(
			start(firstRun),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "continue" },
			{ type: "openDossier" },
		).value,
	).toBe("dossier");
});

test("The hub opens the hangar", () => {
	expect(
		send(
			start(firstRun),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "continue" },
			{ type: "openHangar" },
		).value,
	).toBe("hangar");
});

test("The hub opens the codex", () => {
	expect(
		send(
			start(firstRun),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "continue" },
			{ type: "openCodex" },
		).value,
	).toBe("codex");
});

test("The hub opens settings", () => {
	expect(
		send(
			start(firstRun),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "continue" },
			{ type: "openSettings" },
		).value,
	).toBe("settings");
});

test("The hub selects the galaxy map first", () => {
	expect(
		send(
			start(firstRun),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "continue" },
		).context.hubIndex,
	).toBe(0);
});

test("Back from the galaxy map returns to the hub", () => {
	expect(
		send(
			start(firstRun),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "continue" },
			{ type: "openGalaxy" },
			{ type: "back" },
		).value,
	).toBe("hub");
});

test("Back from the dossier returns to the hub", () => {
	expect(
		send(
			start(firstRun),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "continue" },
			{ type: "openDossier" },
			{ type: "back" },
		).value,
	).toBe("hub");
});

test("Back from the hangar returns to the hub", () => {
	expect(
		send(
			start(firstRun),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "continue" },
			{ type: "openHangar" },
			{ type: "back" },
		).value,
	).toBe("hub");
});

test("Back from the codex returns to the hub", () => {
	expect(
		send(
			start(firstRun),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "continue" },
			{ type: "openCodex" },
			{ type: "back" },
		).value,
	).toBe("hub");
});

test("Back from settings returns to the hub", () => {
	expect(
		send(
			start(firstRun),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "continue" },
			{ type: "openSettings" },
			{ type: "back" },
		).value,
	).toBe("hub");
});

test("The galaxy map opens the zone map", () => {
	expect(
		send(
			start(firstRun),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "continue" },
			{ type: "openGalaxy" },
			{ type: "openZone" },
		).value,
	).toBe("zoneMap");
});

test("Back returns to the galaxy map", () => {
	expect(
		send(
			start(firstRun),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "continue" },
			{ type: "openGalaxy" },
			{ type: "openZone" },
			{ type: "back" },
		).value,
	).toBe("galaxyMap");
});

test("Back returns to the hub", () => {
	expect(
		send(
			start(firstRun),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "continue" },
			{ type: "openZone" },
			{ type: "back" },
		).value,
	).toBe("hub");
});

test("The zone map opens the level", () => {
	expect(
		send(
			start(firstRun),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "continue" },
			{ type: "openZone" },
			{ type: "startLevel" },
		).value,
	).toBe("level");
});

test("Back from the level returns to the zone map", () => {
	expect(
		send(
			start(firstRun),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "continue" },
			{ type: "openZone" },
			{ type: "startLevel" },
			{ type: "back" },
		).value,
	).toBe("zoneMap");
});

test("Finish opens results", () => {
	const snapshot = send(
		start(firstRun),
		{ type: "ready" },
		{ type: "begin" },
		{ type: "continue" },
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
			start(firstRun),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "continue" },
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
			start(firstRun),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "continue" },
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
			start(firstRun),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "continue" },
			{ type: "openZone" },
			{ type: "startLevel" },
			{ type: "finish" },
			{ type: "toHub" },
		).value,
	).toBe("hub");
});

test("Back returns to onboarding", () => {
	expect(
		send(
			start(firstRun),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "continue" },
			{ type: "back" },
		).value,
	).toBe("onboarding");
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
			start(firstRun),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "continue" },
			{ type: "finish" },
		).value,
	).toBe("hub");
});

test("Beginning again from the level stays on the level", () => {
	expect(
		send(
			start(firstRun),
			{ type: "ready" },
			{ type: "begin" },
			{ type: "continue" },
			{ type: "openZone" },
			{ type: "startLevel" },
			{ type: "begin" },
		).value,
	).toBe("level");
});
