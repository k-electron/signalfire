import { expect, test } from "vitest";
import { type Actor, createActor } from "xstate";
import {
	type LevelLifecycleEvent,
	levelLifecycleMachine,
} from "./level-lifecycle";

type LifecycleActor = Actor<typeof levelLifecycleMachine>;

function start(input?: { levelId?: string; seed?: string }) {
	const actor = createActor(levelLifecycleMachine, { input });
	actor.start();
	return actor;
}

function send(actor: LifecycleActor, ...events: LevelLifecycleEvent[]) {
	for (const event of events) {
		actor.send(event);
	}
	return actor.getSnapshot();
}

test("Initial state is loading", () => {
	const actor = start();
	expect(actor.getSnapshot().value).toBe("loading");
});

test("LOADED transitions loading to briefing", () => {
	const actor = start();
	expect(send(actor, { type: "LOADED" }).value).toBe("briefing");
});

test("FAIL transitions loading to error", () => {
	const actor = start();
	const snapshot = send(actor, {
		type: "FAIL",
		error: "Level definition not found",
	});
	expect(snapshot.value).toBe("error");
	expect(snapshot.context.error).toBe("Level definition not found");
});

test("LAUNCH transitions briefing to countdown", () => {
	const actor = start();
	const snapshot = send(actor, { type: "LOADED" }, { type: "LAUNCH" });
	expect(snapshot.value).toBe("countdown");
	expect(snapshot.context.countdownValue).toBe(3);
});

test("TICK in countdown counts down 3, 2, 1 then enters playing", () => {
	const actor = start();
	send(actor, { type: "LOADED" }, { type: "LAUNCH" });

	expect(actor.getSnapshot().context.countdownValue).toBe(3);
	send(actor, { type: "TICK" });
	expect(actor.getSnapshot().context.countdownValue).toBe(2);
	send(actor, { type: "TICK" });
	expect(actor.getSnapshot().context.countdownValue).toBe(1);
	send(actor, { type: "TICK" });
	expect(actor.getSnapshot().value).toBe("playing");
});

test("SKIP in countdown transitions immediately to playing", () => {
	const actor = start();
	const snapshot = send(
		actor,
		{ type: "LOADED" },
		{ type: "LAUNCH" },
		{ type: "SKIP" },
	);
	expect(snapshot.value).toBe("playing");
});

test("PAUSE in playing transitions to paused", () => {
	const actor = start();
	const snapshot = send(
		actor,
		{ type: "LOADED" },
		{ type: "LAUNCH" },
		{ type: "SKIP" },
		{ type: "PAUSE" },
	);
	expect(snapshot.value).toBe("paused");
});

test("RESUME in paused returns to countdown with reset count", () => {
	const actor = start();
	const snapshot = send(
		actor,
		{ type: "LOADED" },
		{ type: "LAUNCH" },
		{ type: "SKIP" },
		{ type: "PAUSE" },
		{ type: "RESUME" },
	);
	expect(snapshot.value).toBe("countdown");
	expect(snapshot.context.countdownValue).toBe(3);
});

test("QUIT in paused transitions to quit", () => {
	const actor = start();
	const snapshot = send(
		actor,
		{ type: "LOADED" },
		{ type: "LAUNCH" },
		{ type: "SKIP" },
		{ type: "PAUSE" },
		{ type: "QUIT" },
	);
	expect(snapshot.value).toBe("quit");
});

test("FINISH in playing moves to finishing then results with summary", () => {
	const actor = start();
	const summary = {
		accuracy: 0.95,
		netWpm: 15,
		score: 500,
		stars: 2,
		medals: [],
	};
	const missed = [
		{
			kind: "integrity" as const,
			measuredPercent: 95,
			neededPercent: 98,
			shortfallPercent: 3,
		},
	];
	const snapshot = send(
		actor,
		{ type: "LOADED" },
		{ type: "LAUNCH" },
		{ type: "SKIP" },
		{ type: "FINISH", summary, missed },
	);
	expect(snapshot.value).toBe("results");
	expect(snapshot.context.runSummary).toEqual(summary);
	expect(snapshot.context.missedBars).toEqual(missed);
});

test("CONTINUE on results transitions to continued", () => {
	const actor = start();
	const snapshot = send(
		actor,
		{ type: "LOADED" },
		{ type: "LAUNCH" },
		{ type: "SKIP" },
		{
			type: "FINISH",
			summary: { accuracy: 1, netWpm: 10, score: 300, stars: 1, medals: [] },
			missed: [],
		},
		{ type: "CONTINUE" },
	);
	expect(snapshot.value).toBe("continued");
});

test("TO_HUB on results transitions to hub", () => {
	const actor = start();
	const snapshot = send(
		actor,
		{ type: "LOADED" },
		{ type: "LAUNCH" },
		{ type: "SKIP" },
		{
			type: "FINISH",
			summary: { accuracy: 1, netWpm: 10, score: 300, stars: 1, medals: [] },
			missed: [],
		},
		{ type: "TO_HUB" },
	);
	expect(snapshot.value).toBe("hub");
});

test("ERROR in playing transitions to error", () => {
	const actor = start();
	const snapshot = send(
		actor,
		{ type: "LOADED" },
		{ type: "LAUNCH" },
		{ type: "SKIP" },
		{ type: "ERROR", error: "WebGL context lost" },
	);
	expect(snapshot.value).toBe("error");
	expect(snapshot.context.error).toBe("WebGL context lost");
});
