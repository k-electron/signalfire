import type { Clock } from "../../core/ports/clock";

// 120 ticks per millisecond makes 1/120 s an exact 1000 ticks. A float step
// of 1000/120 ms does not, and a coarser grid moves 8.3 ms across a boundary.
const TICKS_PER_MS = 120;
const TICKS_PER_STEP = 1000;
const MAX_GAP_MS = 250;

export type FixedStepLoop = {
	readonly clock: Clock;
	frame(timeMs: number): void;
	input(timeMs: number): void;
	pause(): void;
	resume(timeMs: number): void;
	interpolation(): number;
};

export function createFixedStepLoop(
	onStep: (step: number) => void,
): FixedStepLoop {
	let ticks = 0;
	let stepIndex = 0;
	let cursor: number | null = null;
	let paused = false;

	const clock: Clock = {
		step() {
			return stepIndex;
		},
	};

	function sample(timeMs: number): void {
		assertTimestamp(timeMs);
		if (paused) {
			return;
		}
		if (cursor === null) {
			cursor = timeMs;
			return;
		}
		if (timeMs < cursor) {
			return;
		}
		const gap = timeMs - cursor;
		const clamped = gap > MAX_GAP_MS ? MAX_GAP_MS : gap;
		const added = Math.round(clamped * TICKS_PER_MS);
		const next = ticks + added;
		const nextStep = Math.floor(next / TICKS_PER_STEP);
		for (let step = stepIndex + 1; step <= nextStep; step += 1) {
			stepIndex = step;
			onStep(step);
		}
		ticks = next;
		cursor = timeMs;
	}

	return {
		clock,
		frame(timeMs) {
			sample(timeMs);
		},
		input(timeMs) {
			sample(timeMs);
		},
		pause() {
			paused = true;
		},
		resume(timeMs) {
			assertTimestamp(timeMs);
			if (!paused) {
				return;
			}
			cursor = timeMs;
			paused = false;
		},
		interpolation() {
			return (ticks % TICKS_PER_STEP) / TICKS_PER_STEP;
		},
	};
}

export function startAnimationFrames(
	loop: FixedStepLoop,
	schedule: (callback: (timeMs: number) => void) => number,
	cancel: (handle: number) => void,
): { stop(): void } {
	let stopped = false;
	let handle = 0;
	const tick = (timeMs: number): void => {
		if (stopped) {
			return;
		}
		loop.frame(timeMs);
		if (stopped) {
			return;
		}
		handle = schedule(tick);
	};
	handle = schedule(tick);
	return {
		stop() {
			if (stopped) {
				return;
			}
			stopped = true;
			cancel(handle);
		},
	};
}

function assertTimestamp(timeMs: number): void {
	if (!Number.isFinite(timeMs) || timeMs < 0) {
		throw new RangeError(
			"The timestamp must be a finite number of milliseconds, zero or greater.",
		);
	}
}
