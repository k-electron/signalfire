import { createGameStorage } from "../storage/game-storage";
import { createMemoryLocalStore } from "../storage/memory-store";
import type { AudioOut } from "./audio-out";
import type { Clock } from "./clock";
import type { CloudSync } from "./cloud-sync";
import type { DomainEvent } from "./domain-event";
import type { RenderOut } from "./render-out";
import type { Storage } from "./storage";

export interface FakeClock extends Clock {
	setStep(step: number): void;
	advance(steps: number): void;
}

export interface FakeRenderOut extends RenderOut {
	batches(): readonly (readonly DomainEvent[])[];
}

export interface FakeAudioOut extends AudioOut {
	batches(): readonly (readonly DomainEvent[])[];
}

export function createFakeClock(step = 0): FakeClock {
	assertStep(step);
	let current = step;
	return {
		step() {
			return current;
		},
		setStep(next) {
			assertStep(next);
			current = next;
		},
		advance(steps) {
			if (!Number.isSafeInteger(steps) || steps < 0) {
				throw new RangeError(
					"The advance must be a non-negative safe integer.",
				);
			}
			const next = current + steps;
			if (!Number.isSafeInteger(next)) {
				throw new RangeError("The step must stay a safe integer.");
			}
			current = next;
		},
	};
}

export function createFakeStorage(): Storage {
	return createGameStorage(createMemoryLocalStore(), {
		async exclusive(run) {
			return run();
		},
	});
}

export function createFakeCloudSync(): CloudSync {
	return createMemoryKeyValue();
}

export function createFakeRenderOut(): FakeRenderOut {
	return createEventSink();
}

export function createFakeAudioOut(): FakeAudioOut {
	return createEventSink();
}

function createMemoryKeyValue(): CloudSync {
	const entries = new Map<string, unknown>();
	return {
		async get(key) {
			if (!entries.has(key)) {
				return undefined;
			}
			return structuredClone(entries.get(key));
		},
		async set(key, value) {
			entries.set(key, structuredClone(value));
		},
		async delete(key) {
			entries.delete(key);
		},
	};
}

function createEventSink(): FakeRenderOut {
	const recorded: DomainEvent[][] = [];
	return {
		publish(events) {
			recorded.push(events.map((event) => ({ ...event })));
		},
		batches() {
			return recorded;
		},
	};
}

function assertStep(step: number): void {
	if (!Number.isSafeInteger(step) || step < 0) {
		throw new RangeError("The step must be a non-negative safe integer.");
	}
}
