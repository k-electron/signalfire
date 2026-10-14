import { describe, expect, test, vi } from "vitest";
import level11File from "../../../content/levels/1-1-first-light.json" with {
	type: "json",
};
import tuningFile from "../../../content/tuning/waiting-lanes.json" with {
	type: "json",
};
import zone1File from "../../../content/zones/1-the-drift.json" with {
	type: "json",
};
import { acceptLevel, acceptTuning, acceptZone } from "../../core/content/load";
import { createOutbox } from "../../core/ports/outbox";
import { createWaitingLanesRun } from "../../core/sim/waiting-lanes";
import { createFixedStepLoop } from "../loop/fixed-step-loop";
import {
	type KeyboardEventLike,
	processKeyboardEvent,
	startKeyboardCapture,
	translateKeyboardEvent,
} from "./keyboard";

const level11 = acceptLevel(level11File);
const zone1 = acceptZone(zone1File);
const tuning = acceptTuning(tuningFile);

function createRun() {
	return createWaitingLanesRun(level11, zone1, tuning, "signalfire", {
		runId: "01AFQCG20004HMASW9NF6YY41J",
		levelId: level11.id,
		tier: "cadet",
		mode: "campaign",
		contentVersion: "demo",
		startedAt: "2026-10-12T20:00:00.000Z",
		updatedAt: "2026-10-12T20:00:00.000Z",
		rev: 0,
	});
}

function mockEvent(
	init: Partial<KeyboardEventLike> & {
		key: string;
		type?: "keydown" | "keyup";
	},
): KeyboardEventLike {
	return {
		type: init.type ?? "keydown",
		key: init.key,
		code: init.code ?? `Key${init.key.toUpperCase()}`,
		repeat: init.repeat ?? false,
		isComposing: init.isComposing ?? false,
		shiftKey: init.shiftKey ?? false,
		ctrlKey: init.ctrlKey ?? false,
		altKey: init.altKey ?? false,
		metaKey: init.metaKey ?? false,
		timeStamp: init.timeStamp ?? 16.6,
		preventDefault: vi.fn(),
		stopPropagation: vi.fn(),
	};
}

describe("translateKeyboardEvent", () => {
	test("extracts character and timestamp for a normal keydown", () => {
		const event = mockEvent({ key: "f", timeStamp: 16.6 });
		const shiftState = { left: false, right: false };
		const result = translateKeyboardEvent(event, shiftState);

		expect(result).not.toBeNull();
		expect(result?.character).toBe(102);
		expect(result?.flags).toBe(0); // keydown, no shift
		expect(result?.timeStamp).toBe(16.6);
	});

	test("ignores repeat keydown events", () => {
		const event = mockEvent({ key: "f", repeat: true });
		const shiftState = { left: false, right: false };
		expect(translateKeyboardEvent(event, shiftState)).toBeNull();
	});

	test("ignores dead keys and composing events", () => {
		const deadEvent = mockEvent({ key: "Dead" });
		const composingEvent = mockEvent({ key: "e", isComposing: true });
		const shiftState = { left: false, right: false };

		expect(translateKeyboardEvent(deadEvent, shiftState)).toBeNull();
		expect(translateKeyboardEvent(composingEvent, shiftState)).toBeNull();
	});

	test("ignores standalone modifier keys", () => {
		const shiftState = { left: false, right: false };
		for (const key of ["Shift", "Control", "Alt", "Meta"]) {
			const event = mockEvent({ key });
			expect(translateKeyboardEvent(event, shiftState)).toBeNull();
		}
	});

	test("extracts ShiftLeft and ShiftRight flags", () => {
		const eventLeft = mockEvent({ key: "F", shiftKey: true });
		const resultLeft = translateKeyboardEvent(eventLeft, {
			left: true,
			right: false,
		});
		expect(resultLeft?.flags).toBe(2); // bit 1 = 2 (ShiftLeft)

		const eventRight = mockEvent({ key: "F", shiftKey: true });
		const resultRight = translateKeyboardEvent(eventRight, {
			left: false,
			right: true,
		});
		expect(resultRight?.flags).toBe(4); // bit 2 = 4 (ShiftRight)

		const eventBoth = mockEvent({ key: "F", shiftKey: true });
		const resultBoth = translateKeyboardEvent(eventBoth, {
			left: true,
			right: true,
		});
		expect(resultBoth?.flags).toBe(0); // neither/both = none
	});

	test("sets bit 0 for keyup events", () => {
		const event = mockEvent({ key: "f", type: "keyup" });
		const shiftState = { left: false, right: false };
		const result = translateKeyboardEvent(event, shiftState);
		expect(result?.flags).toBe(1); // bit 0 = 1 (keyup)
	});
});

describe("preventDefault for game keys", () => {
	test("prevents default on Space, Tab, Backspace, apostrophe, slash, and Enter, even when repeating", () => {
		const gameKeys = [" ", "Tab", "Backspace", "'", "/", "Enter"];
		for (const key of gameKeys) {
			const event = mockEvent({ key, repeat: true });
			const shiftState = { left: false, right: false };
			translateKeyboardEvent(event, shiftState);
			expect(event.preventDefault).toHaveBeenCalled();
		}
	});

	test("does not prevent default on non-game keys", () => {
		const event = mockEvent({ key: "f" });
		const shiftState = { left: false, right: false };
		translateKeyboardEvent(event, shiftState);
		expect(event.preventDefault).not.toHaveBeenCalled();
	});

	test("ignores modifier key combinations with Ctrl, Meta, or Alt", () => {
		const shiftState = { left: false, right: false };
		expect(
			translateKeyboardEvent(
				mockEvent({ key: "f", ctrlKey: true }),
				shiftState,
			),
		).toBeNull();
		expect(
			translateKeyboardEvent(
				mockEvent({ key: "f", metaKey: true }),
				shiftState,
			),
		).toBeNull();
		expect(
			translateKeyboardEvent(mockEvent({ key: "f", altKey: true }), shiftState),
		).toBeNull();
	});
});

describe("processKeyboardEvent integration with loop and run", () => {
	test("advances loop to timestamp step and applies hit to run", () => {
		const loop = createFixedStepLoop(() => {});
		loop.frame(0); // origin timestamp
		const run = createRun();
		const outbox = createOutbox();
		const shiftState = { left: false, right: false };

		// Level 1.1 first note is 'f' (102).
		// Timestamp 16.7 ms advances loop to step 2.
		const event = mockEvent({ key: "f", timeStamp: 16.7 });
		const events = processKeyboardEvent(
			event,
			{ loop, run, outbox },
			shiftState,
		);

		expect(events).toEqual([{ type: "Hit", step: 2 }]);
		expect(run.step()).toBe(2);
	});

	test("applies error on non-matching key", () => {
		const loop = createFixedStepLoop(() => {});
		loop.frame(0); // origin timestamp
		const run = createRun();
		const outbox = createOutbox();
		const shiftState = { left: false, right: false };

		// Active note is 'f'. Press 'j'.
		const event = mockEvent({ key: "j", timeStamp: 16.7 });
		const events = processKeyboardEvent(
			event,
			{ loop, run, outbox },
			shiftState,
		);

		expect(events).toEqual([{ type: "Error", step: 2 }]);
	});

	test("ignores repeat keydown without advancing simulation step or adding input", () => {
		const loop = createFixedStepLoop(() => {});
		loop.frame(0);
		const run = createRun();
		const outbox = createOutbox();
		const shiftState = { left: false, right: false };

		const event = mockEvent({ key: "f", repeat: true, timeStamp: 16.7 });
		const events = processKeyboardEvent(
			event,
			{ loop, run, outbox },
			shiftState,
		);

		expect(events).toEqual([]);
		expect(run.step()).toBe(0);
		expect(run.inputs()).toHaveLength(0);
	});

	test("delivers keyup event for rollover tracking without judging an error", () => {
		const loop = createFixedStepLoop(() => {});
		loop.frame(0);
		const run = createRun();
		const outbox = createOutbox();
		const shiftState = { left: false, right: false };

		// Keydown on f at 16.7 ms (step 2)
		processKeyboardEvent(
			mockEvent({ key: "f", timeStamp: 16.7 }),
			{ loop, run, outbox },
			shiftState,
		);

		// Keyup on f at 50.0 ms (step 6)
		const keyupEvents = processKeyboardEvent(
			mockEvent({ key: "f", type: "keyup", timeStamp: 50.0 }),
			{ loop, run, outbox },
			shiftState,
		);

		// Keyup produces no judgment error
		expect(keyupEvents).toEqual([]);
		expect(run.step()).toBe(6);
		expect(run.inputs()).toEqual([
			{ step: 2, character: 102, flags: 0 },
			{ step: 6, character: 102, flags: 1 },
		]);
	});
});

describe("startKeyboardCapture", () => {
	test("attaches event listeners and tracks shift state", () => {
		const listeners = new Map<string, (e: unknown) => void>();
		const mockTarget = {
			addEventListener: vi.fn(
				(type: string, listener: (e: unknown) => void) => {
					listeners.set(type, listener);
				},
			),
			removeEventListener: vi.fn((type: string) => {
				listeners.delete(type);
			}),
		};

		const loop = createFixedStepLoop(() => {});
		loop.frame(0);
		const run = createRun();
		const outbox = createOutbox();
		const published: unknown[] = [];

		const capture = startKeyboardCapture({
			loop,
			run,
			outbox,
			target: mockTarget,
			onEvents: (events) => published.push(...events),
		});

		expect(mockTarget.addEventListener).toHaveBeenCalledWith(
			"keydown",
			expect.any(Function),
		);
		expect(mockTarget.addEventListener).toHaveBeenCalledWith(
			"keyup",
			expect.any(Function),
		);

		// Press ShiftLeft keydown
		listeners.get("keydown")?.(
			mockEvent({
				key: "Shift",
				code: "ShiftLeft",
				type: "keydown",
				timeStamp: 0,
			}),
		);

		// Press 'f'
		listeners.get("keydown")?.(
			mockEvent({
				key: "f",
				code: "KeyF",
				shiftKey: true,
				timeStamp: 8.4,
				type: "keydown",
			}),
		);

		expect(published).toEqual([{ type: "Hit", step: 1 }]);

		capture.destroy();
		expect(mockTarget.removeEventListener).toHaveBeenCalledWith(
			"keydown",
			expect.any(Function),
		);
		expect(mockTarget.removeEventListener).toHaveBeenCalledWith(
			"keyup",
			expect.any(Function),
		);
	});
});
