import { expect, test } from "vitest";
import { createFixedStepLoop, startAnimationFrames } from "./fixed-step-loop";

function start() {
	const steps: number[] = [];
	const clocks: number[] = [];
	const loop = createFixedStepLoop((step) => {
		steps.push(step);
		clocks.push(loop.clock.step());
	});
	return { loop, steps, clocks };
}

test("an opening frame does not step", () => {
	const { loop, steps } = start();
	loop.frame(10000);
	expect(loop.clock.step()).toBe(0);
	expect(loop.interpolation()).toBe(0);
	expect(steps).toEqual([]);
});

test("an opening input does not step", () => {
	const { loop, steps } = start();
	loop.input(40);
	expect(loop.clock.step()).toBe(0);
	expect(loop.interpolation()).toBe(0);
	expect(steps).toEqual([]);
	loop.frame(50);
	expect(loop.clock.step()).toBe(1);
	expect(loop.interpolation()).toBe(1 / 5);
});

test("uneven frames keep a leftover fraction", () => {
	const { loop } = start();
	loop.frame(0);
	loop.frame(10);
	expect(loop.clock.step()).toBe(1);
	expect(loop.interpolation()).toBe(1 / 5);
	loop.frame(20);
	expect(loop.clock.step()).toBe(2);
	expect(loop.interpolation()).toBe(2 / 5);
	loop.frame(27);
	expect(loop.clock.step()).toBe(3);
	expect(loop.interpolation()).toBe(6 / 25);
});

test("a frame shorter than one step takes no step", () => {
	const { loop, steps } = start();
	loop.frame(0);
	loop.frame(8);
	expect(loop.clock.step()).toBe(0);
	expect(loop.interpolation()).toBe(24 / 25);
	expect(steps).toEqual([]);
});

test("an exact step boundary leaves no leftover", () => {
	const { loop, steps } = start();
	loop.frame(0);
	loop.frame(1000 / 120);
	expect(loop.clock.step()).toBe(1);
	expect(loop.interpolation()).toBe(0);
	expect(steps).toEqual([1]);
});

test("a half-tick gap rounds up", () => {
	const { loop, steps } = start();
	loop.frame(0);
	loop.frame(1 / 240);
	expect(loop.clock.step()).toBe(0);
	expect(loop.interpolation()).toBe(1 / 1000);
	expect(steps).toEqual([]);
});

test("a repeated timestamp adds nothing", () => {
	const { loop } = start();
	loop.frame(0);
	loop.frame(10);
	loop.frame(10);
	expect(loop.clock.step()).toBe(1);
	expect(loop.interpolation()).toBe(1 / 5);
});

test("a one-second stall adds 250 ms", () => {
	const { loop } = start();
	loop.frame(0);
	loop.frame(1000);
	expect(loop.clock.step()).toBe(30);
	expect(loop.interpolation()).toBe(0);
	loop.frame(1016);
	expect(loop.clock.step()).toBe(31);
	expect(loop.interpolation()).toBe(23 / 25);
});

test("three steps in one frame report 1, then 2, then 3", () => {
	const { loop, steps, clocks } = start();
	loop.frame(0);
	loop.frame(25);
	expect(steps).toEqual([1, 2, 3]);
	expect(clocks).toEqual([1, 2, 3]);
});

test("later steps continue the index", () => {
	const { loop, steps, clocks } = start();
	loop.frame(0);
	loop.frame(16);
	loop.frame(41);
	expect(steps).toEqual([1, 2, 3, 4]);
	expect(clocks).toEqual([1, 2, 3, 4]);
});

test("ten milliseconds lands on step 1", () => {
	const { loop, steps } = start();
	loop.frame(0);
	loop.input(10);
	expect(steps).toEqual([1]);
	expect(loop.clock.step()).toBe(1);
	expect(loop.interpolation()).toBe(1 / 5);
});

test("eight milliseconds stays on step 0", () => {
	const { loop, steps } = start();
	loop.frame(0);
	loop.input(8);
	expect(loop.clock.step()).toBe(0);
	expect(loop.interpolation()).toBe(24 / 25);
	expect(steps).toEqual([]);
});

test("fifty milliseconds crosses six steps", () => {
	const { loop, steps } = start();
	loop.frame(0);
	loop.input(50);
	expect(steps).toEqual([1, 2, 3, 4, 5, 6]);
	expect(loop.clock.step()).toBe(6);
	expect(loop.interpolation()).toBe(0);
});

test("a frame and a later input share one timeline", () => {
	const { loop } = start();
	loop.frame(0);
	loop.frame(16);
	loop.input(20);
	expect(loop.clock.step()).toBe(2);
	expect(loop.interpolation()).toBe(2 / 5);
});

test("a long input gap clamps, and the next frame does not refill it", () => {
	const { loop } = start();
	loop.frame(0);
	loop.input(1000);
	expect(loop.clock.step()).toBe(30);
	expect(loop.interpolation()).toBe(0);
	loop.frame(1016);
	expect(loop.clock.step()).toBe(31);
	expect(loop.interpolation()).toBe(23 / 25);
});

test("a late input and an earlier frame do not move the cursor", () => {
	const { loop } = start();
	loop.frame(0);
	loop.frame(32);
	loop.input(20);
	loop.frame(30);
	expect(loop.clock.step()).toBe(3);
	expect(loop.interpolation()).toBe(21 / 25);
	loop.frame(48);
	expect(loop.clock.step()).toBe(5);
	expect(loop.interpolation()).toBe(19 / 25);
});

test("a paused gap is dropped", () => {
	const { loop } = start();
	loop.frame(0);
	loop.frame(16);
	loop.pause();
	loop.pause();
	loop.frame(5000);
	loop.input(5100);
	expect(loop.clock.step()).toBe(1);
	expect(loop.interpolation()).toBe(23 / 25);
});

test("resume measures the next gap from the resume timestamp", () => {
	const { loop } = start();
	loop.frame(0);
	loop.frame(16);
	loop.pause();
	loop.resume(5100);
	loop.frame(5116);
	expect(loop.clock.step()).toBe(3);
	expect(loop.interpolation()).toBe(21 / 25);
});

test("resume while running does not move the cursor", () => {
	const { loop } = start();
	loop.frame(0);
	loop.frame(16);
	loop.resume(1000);
	loop.frame(32);
	expect(loop.clock.step()).toBe(3);
	expect(loop.interpolation()).toBe(21 / 25);
});

test("resume before any sample sets the cursor", () => {
	const { loop, steps } = start();
	loop.pause();
	loop.resume(5100);
	loop.frame(5116);
	expect(loop.clock.step()).toBe(1);
	expect(loop.interpolation()).toBe(23 / 25);
	expect(steps).toEqual([1]);
});

test("delivered frames match the stepper", () => {
	const { loop } = start();
	let callback: ((timeMs: number) => void) | undefined;
	let requested = 0;
	const schedule = (next: (timeMs: number) => void) => {
		callback = next;
		requested += 1;
		return requested;
	};
	startAnimationFrames(loop, schedule, () => {});
	expect(requested).toBe(1);
	callback?.(0);
	expect(requested).toBe(2);
	callback?.(16);
	expect(requested).toBe(3);
	expect(loop.clock.step()).toBe(1);
	expect(loop.interpolation()).toBe(23 / 25);
});

test("stop cancels the pending frame", () => {
	const { loop } = start();
	let callback: ((timeMs: number) => void) | undefined;
	let requested = 0;
	const cancelled: number[] = [];
	const schedule = (next: (timeMs: number) => void) => {
		callback = next;
		requested += 1;
		return requested;
	};
	const running = startAnimationFrames(loop, schedule, (handle) => {
		cancelled.push(handle);
	});
	callback?.(0);
	running.stop();
	callback?.(16);
	expect(cancelled).toEqual([2]);
	expect(loop.clock.step()).toBe(0);
	expect(loop.interpolation()).toBe(0);
});

test("NaN and a negative frame leave the cursor", () => {
	const { loop } = start();
	loop.frame(0);
	loop.frame(10);
	expect(() => loop.frame(Number.NaN)).toThrow(RangeError);
	expect(loop.clock.step()).toBe(1);
	expect(loop.interpolation()).toBe(1 / 5);
	expect(() => loop.frame(Number.POSITIVE_INFINITY)).toThrow(RangeError);
	expect(loop.clock.step()).toBe(1);
	expect(loop.interpolation()).toBe(1 / 5);
	expect(() => loop.frame(-1)).toThrow(RangeError);
	expect(loop.clock.step()).toBe(1);
	expect(loop.interpolation()).toBe(1 / 5);
	loop.frame(26);
	expect(loop.clock.step()).toBe(3);
	expect(loop.interpolation()).toBe(3 / 25);
});

test("a bad input leaves the cursor", () => {
	const { loop } = start();
	loop.frame(0);
	loop.frame(10);
	expect(() => loop.input(Number.NaN)).toThrow(RangeError);
	expect(loop.clock.step()).toBe(1);
	expect(loop.interpolation()).toBe(1 / 5);
	expect(() => loop.input(-1)).toThrow(RangeError);
	expect(loop.clock.step()).toBe(1);
	expect(loop.interpolation()).toBe(1 / 5);
	loop.frame(26);
	expect(loop.clock.step()).toBe(3);
	expect(loop.interpolation()).toBe(3 / 25);
});

test("a bad resume leaves the cursor", () => {
	const { loop } = start();
	loop.frame(0);
	loop.frame(10);
	loop.pause();
	expect(() => loop.resume(Number.POSITIVE_INFINITY)).toThrow(RangeError);
	expect(loop.clock.step()).toBe(1);
	expect(loop.interpolation()).toBe(1 / 5);
	expect(() => loop.resume(-1)).toThrow(RangeError);
	expect(loop.clock.step()).toBe(1);
	expect(loop.interpolation()).toBe(1 / 5);
	loop.frame(18);
	expect(loop.clock.step()).toBe(1);
	expect(loop.interpolation()).toBe(1 / 5);
	loop.resume(10);
	loop.frame(18);
	expect(loop.clock.step()).toBe(2);
	expect(loop.interpolation()).toBe(4 / 25);
});
