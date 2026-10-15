import { describe, expect, test } from "vitest";
import { createActor } from "xstate";
import type { MissedBar } from "../../core/scoring/stars";
import type { RunSummary } from "../../core/sim/waiting-lanes";
import { levelKeyToEvent, levelLifecycleMachine } from "./level-lifecycle";

const mockSummary: RunSummary = {
	accuracy: 0.95,
	netWpm: 22,
	score: 450,
	stars: 2,
	medals: [],
};

const mockMissed: readonly MissedBar[] = [
	{
		kind: "integrity",
		measuredPercent: 90,
		neededPercent: 92,
		shortfallPercent: 2,
	},
];

function startTestActor(input?: { levelId?: string; seed?: string }) {
	const actor = createActor(levelLifecycleMachine, { input });
	actor.start();
	return actor;
}

describe("levelLifecycleMachine", () => {
	test("starts at loading and transitions to briefing on loaded", () => {
		const actor = startTestActor({ levelId: "level:1.1", seed: "signalfire" });
		expect(actor.getSnapshot().value).toBe("loading");

		actor.send({ type: "loaded" });
		expect(actor.getSnapshot().value).toBe("briefing");
	});

	test("transitions from loading to error on error event", () => {
		const actor = startTestActor({ levelId: "level:1.1" });

		actor.send({ type: "error", message: "Failed to load level" });
		expect(actor.getSnapshot().value).toBe("error");
		expect(actor.getSnapshot().context.error).toBe("Failed to load level");
	});

	test("launches countdown from briefing and counts down to playing", () => {
		const actor = startTestActor();
		actor.send({ type: "loaded" });
		expect(actor.getSnapshot().value).toBe("briefing");

		actor.send({ type: "launch" });
		expect(actor.getSnapshot().value).toBe("countdown");
		expect(actor.getSnapshot().context.countdown).toBe(3);

		actor.send({ type: "tick" });
		expect(actor.getSnapshot().value).toBe("countdown");
		expect(actor.getSnapshot().context.countdown).toBe(2);

		actor.send({ type: "tick" });
		expect(actor.getSnapshot().value).toBe("countdown");
		expect(actor.getSnapshot().context.countdown).toBe(1);

		actor.send({ type: "tick" });
		expect(actor.getSnapshot().value).toBe("playing");
	});

	test("pauses playing on pause event and resumes with countdown", () => {
		const actor = startTestActor();
		actor.send({ type: "loaded" });
		actor.send({ type: "launch" });
		actor.send({ type: "tick" });
		actor.send({ type: "tick" });
		actor.send({ type: "tick" });
		expect(actor.getSnapshot().value).toBe("playing");

		// Trigger pause (e.g. Escape or window blur)
		actor.send({ type: "pause" });
		expect(actor.getSnapshot().value).toBe("paused");

		// Trigger resume -> returns to countdown with counter reset
		actor.send({ type: "resume" });
		expect(actor.getSnapshot().value).toBe("countdown");
		expect(actor.getSnapshot().context.countdown).toBe(3);

		actor.send({ type: "tick" });
		actor.send({ type: "tick" });
		actor.send({ type: "tick" });
		expect(actor.getSnapshot().value).toBe("playing");
	});

	test("quits from paused state to quit final state", () => {
		const actor = startTestActor();
		actor.send({ type: "loaded" });
		actor.send({ type: "launch" });
		actor.send({ type: "tick" });
		actor.send({ type: "tick" });
		actor.send({ type: "tick" });
		actor.send({ type: "pause" });
		expect(actor.getSnapshot().value).toBe("paused");

		actor.send({ type: "quit" });
		expect(actor.getSnapshot().value).toBe("quit");
	});

	test("transitions through finishing to results with summary and missed bars", () => {
		const actor = startTestActor();
		actor.send({ type: "loaded" });
		actor.send({ type: "launch" });
		actor.send({ type: "tick" });
		actor.send({ type: "tick" });
		actor.send({ type: "tick" });
		expect(actor.getSnapshot().value).toBe("playing");

		actor.send({
			type: "finish",
			summary: mockSummary,
			missed: mockMissed,
		});
		expect(actor.getSnapshot().value).toBe("results");
		expect(actor.getSnapshot().context.summary).toEqual(mockSummary);
		expect(actor.getSnapshot().context.missed).toEqual(mockMissed);

		actor.send({ type: "continue" });
		expect(actor.getSnapshot().value).toBe("complete");
	});

	test("levelKeyToEvent maps keyboard shortcuts correctly per state", () => {
		const actor = startTestActor();
		actor.send({ type: "loaded" });

		// briefing
		expect(levelKeyToEvent(actor.getSnapshot(), " ")).toEqual({
			type: "launch",
		});
		expect(levelKeyToEvent(actor.getSnapshot(), "Escape")).toBeNull();

		// playing
		actor.send({ type: "launch" });
		actor.send({ type: "tick" });
		actor.send({ type: "tick" });
		actor.send({ type: "tick" });
		expect(levelKeyToEvent(actor.getSnapshot(), "Escape")).toEqual({
			type: "pause",
		});
		// In playing, Space is a typing key, not a screen shortcut
		expect(levelKeyToEvent(actor.getSnapshot(), " ")).toBeNull();

		// paused
		actor.send({ type: "pause" });
		expect(levelKeyToEvent(actor.getSnapshot(), " ")).toEqual({
			type: "resume",
		});
		expect(levelKeyToEvent(actor.getSnapshot(), "Escape")).toEqual({
			type: "quit",
		});

		// results
		actor.send({ type: "resume" });
		actor.send({ type: "tick" });
		actor.send({ type: "tick" });
		actor.send({ type: "tick" });
		actor.send({
			type: "finish",
			summary: mockSummary,
			missed: mockMissed,
		});
		expect(levelKeyToEvent(actor.getSnapshot(), " ")).toEqual({
			type: "continue",
		});
		expect(levelKeyToEvent(actor.getSnapshot(), "Escape")).toEqual({
			type: "continue",
		});
	});
});
