import type { DomainEvent } from "../ports/domain-event";

const STEPS_PER_SECOND = 120;
// A gap longer than 360 steps is more than 3 seconds at 1/120 s. Verticals 02,
// 05, and 06 exclude that pause from Velocity. Active minutes are the remaining
// span in minutes. That reading is an assumption in
// openspec/changes/archive/2026-10-14-input-judging/design.md.
const PAUSE_STEPS = 3 * STEPS_PER_SECOND;

const SHIFT_SIDES = ["left", "right", "none"] as const;

export type ShiftSide = (typeof SHIFT_SIDES)[number];
export type KeyPhase = "down" | "up";

export type Keystroke = {
	readonly step: number;
	readonly character: number;
	readonly physicalKey: string;
	readonly shiftSide: ShiftSide;
	readonly phase: KeyPhase;
};

export type JudgeState = {
	readonly sequence: readonly number[];
	readonly index: number;
	readonly attempted: boolean;
	readonly correctFirstAttempts: number;
	readonly firstAttempts: number;
	readonly correctCharacters: number;
	readonly firstStep: number | null;
	readonly lastStep: number | null;
	readonly excludedSteps: number;
	readonly previousStep: number | null;
};

export type AttemptCounts = {
	readonly correctFirstAttempts: number;
	readonly firstAttempts: number;
};

export function startJudge(sequence: readonly number[]): JudgeState {
	return {
		sequence: [...sequence],
		index: 0,
		attempted: false,
		correctFirstAttempts: 0,
		firstAttempts: 0,
		correctCharacters: 0,
		firstStep: null,
		lastStep: null,
		excludedSteps: 0,
		previousStep: null,
	};
}

export function applyKeystroke(
	state: JudgeState,
	keystroke: Keystroke,
): { readonly state: JudgeState; readonly event: DomainEvent | null } {
	assertKeystroke(keystroke, state.previousStep);
	const stepped = { ...state, previousStep: keystroke.step };
	if (keystroke.phase === "up" || activeCharacter(state) === null) {
		return { state: stepped, event: null };
	}
	const clock = noteJudged(state, keystroke.step);
	if (keystroke.character === activeCharacter(state)) {
		return {
			state: {
				...stepped,
				...firstAttempt(state, true),
				...clock,
				index: state.index + 1,
				attempted: false,
				correctCharacters: state.correctCharacters + 1,
			},
			event: { type: "Hit", step: keystroke.step },
		};
	}
	return {
		state: {
			...stepped,
			...firstAttempt(state, false),
			...clock,
			attempted: true,
		},
		event: { type: "Error", step: keystroke.step },
	};
}

export function activeCharacter(state: JudgeState): number | null {
	const character = state.sequence[state.index];
	return character === undefined ? null : character;
}

export function attemptCounts(state: JudgeState): AttemptCounts {
	return {
		correctFirstAttempts: state.correctFirstAttempts,
		firstAttempts: state.firstAttempts,
	};
}

export function integrityPercent(state: JudgeState): number {
	if (state.firstAttempts === 0) {
		return 100;
	}
	return (100 * state.correctFirstAttempts) / state.firstAttempts;
}

export function velocityWpm(state: JudgeState): number {
	if (state.firstStep === null || state.lastStep === null) {
		return 0;
	}
	const activeSteps = state.lastStep - state.firstStep - state.excludedSteps;
	if (activeSteps === 0) {
		return 0;
	}
	return (state.correctCharacters * 1440) / activeSteps;
}

function firstAttempt(state: JudgeState, correct: boolean): AttemptCounts {
	if (state.attempted) {
		return attemptCounts(state);
	}
	return {
		correctFirstAttempts: state.correctFirstAttempts + (correct ? 1 : 0),
		firstAttempts: state.firstAttempts + 1,
	};
}

function noteJudged(
	state: JudgeState,
	step: number,
): Pick<JudgeState, "firstStep" | "lastStep" | "excludedSteps"> {
	if (state.firstStep === null || state.lastStep === null) {
		return {
			firstStep: step,
			lastStep: step,
			excludedSteps: state.excludedSteps,
		};
	}
	const gap = step - state.lastStep;
	return {
		firstStep: state.firstStep,
		lastStep: step,
		excludedSteps:
			gap > PAUSE_STEPS ? state.excludedSteps + gap : state.excludedSteps,
	};
}

function assertKeystroke(
	keystroke: Keystroke,
	previousStep: number | null,
): void {
	if (!Number.isSafeInteger(keystroke.step) || keystroke.step < 0) {
		throw new RangeError("The step must be a non-negative safe integer.");
	}
	if (previousStep !== null && keystroke.step < previousStep) {
		throw new RangeError("The step cannot move backward.");
	}
	if (
		!Number.isSafeInteger(keystroke.character) ||
		keystroke.character < 0 ||
		keystroke.character > 0x10ffff ||
		(keystroke.character >= 0xd800 && keystroke.character <= 0xdfff)
	) {
		throw new RangeError("The character must be a Unicode code point.");
	}
	if (keystroke.physicalKey.length === 0) {
		throw new RangeError("The physical key must be a non-empty string.");
	}
	assertShiftSide(keystroke.shiftSide);
}

function assertShiftSide(side: string): void {
	if (side !== "left" && side !== "right" && side !== "none") {
		throw new RangeError("The Shift side must be left, right, or none.");
	}
}
