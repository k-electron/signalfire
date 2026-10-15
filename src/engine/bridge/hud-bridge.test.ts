import { describe, expect, test, vi } from "vitest";
import { createHudBridge, type HudSnapshot } from "./hud-bridge";

describe("createHudBridge", () => {
	test("emits first snapshot immediately", () => {
		const onSnapshot = vi.fn();
		const time = 1000;
		const bridge = createHudBridge({
			onSnapshot,
			now: () => time,
			minIntervalMs: 50,
		});

		const snapshot1: HudSnapshot = {
			score: 10,
			combo: 1,
			activeCharacter: 102,
			accuracy: 1,
		};

		bridge.update(snapshot1);
		expect(onSnapshot).toHaveBeenCalledTimes(1);
		expect(onSnapshot).toHaveBeenCalledWith(snapshot1);
	});

	test("throttles rapid updates within 50 ms window", () => {
		const onSnapshot = vi.fn();
		let time = 1000;
		const bridge = createHudBridge({
			onSnapshot,
			now: () => time,
			minIntervalMs: 50,
		});

		const snapshot1: HudSnapshot = {
			score: 10,
			combo: 1,
			activeCharacter: 102,
			accuracy: 1,
		};
		const snapshot2: HudSnapshot = {
			score: 20,
			combo: 2,
			activeCharacter: 106,
			accuracy: 1,
		};
		const snapshot3: HudSnapshot = {
			score: 30,
			combo: 3,
			activeCharacter: 32,
			accuracy: 1,
		};

		// First update at 1000 ms emits immediately
		bridge.update(snapshot1);
		expect(onSnapshot).toHaveBeenCalledTimes(1);
		expect(onSnapshot).toHaveBeenLastCalledWith(snapshot1);

		// Second update at 1020 ms (< 50 ms gap) is throttled
		time = 1020;
		bridge.update(snapshot2);
		expect(onSnapshot).toHaveBeenCalledTimes(1);

		// Third update at 1040 ms (< 50 ms gap from last emit) is throttled
		time = 1040;
		bridge.update(snapshot3);
		expect(onSnapshot).toHaveBeenCalledTimes(1);

		// Time advances to 1051 ms (> 50 ms from 1000 ms) and next update or tick emits the latest
		time = 1051;
		bridge.update(snapshot3);
		expect(onSnapshot).toHaveBeenCalledTimes(2);
		expect(onSnapshot).toHaveBeenLastCalledWith(snapshot3);
	});

	test("flush immediately dispatches pending throttled snapshot", () => {
		const onSnapshot = vi.fn();
		let time = 1000;
		const bridge = createHudBridge({
			onSnapshot,
			now: () => time,
			minIntervalMs: 50,
		});

		bridge.update({
			score: 10,
			combo: 1,
			activeCharacter: 102,
			accuracy: 1,
		});
		expect(onSnapshot).toHaveBeenCalledTimes(1);

		time = 1010;
		const pending: HudSnapshot = {
			score: 20,
			combo: 2,
			activeCharacter: 106,
			accuracy: 1,
		};
		bridge.update(pending);
		expect(onSnapshot).toHaveBeenCalledTimes(1);

		bridge.flush();
		expect(onSnapshot).toHaveBeenCalledTimes(2);
		expect(onSnapshot).toHaveBeenLastCalledWith(pending);
	});

	test("trailing timer flushes pending snapshot after minIntervalMs", () => {
		vi.useFakeTimers();
		try {
			const onSnapshot = vi.fn();
			let time = 1000;
			const bridge = createHudBridge({
				onSnapshot,
				now: () => time,
				minIntervalMs: 50,
			});

			bridge.update({
				score: 10,
				combo: 1,
				activeCharacter: 102,
				accuracy: 1,
			});
			expect(onSnapshot).toHaveBeenCalledTimes(1);

			time = 1020;
			const pending: HudSnapshot = {
				score: 20,
				combo: 2,
				activeCharacter: 106,
				accuracy: 1,
			};
			bridge.update(pending);
			expect(onSnapshot).toHaveBeenCalledTimes(1);

			// Advance fake timers by 30 ms (completing the 50 ms window)
			time = 1050;
			vi.advanceTimersByTime(30);

			expect(onSnapshot).toHaveBeenCalledTimes(2);
			expect(onSnapshot).toHaveBeenLastCalledWith(pending);
			bridge.destroy();
		} finally {
			vi.useRealTimers();
		}
	});

	test("forwards velocity alongside accuracy and score", () => {
		const onSnapshot = vi.fn();
		const bridge = createHudBridge({
			onSnapshot,
			now: () => 1000,
		});

		const snapshot: HudSnapshot = {
			score: 50,
			combo: 5,
			activeCharacter: 102,
			accuracy: 0.95,
			velocity: 24,
		};

		bridge.update(snapshot);
		expect(onSnapshot).toHaveBeenCalledWith(snapshot);
	});
});
