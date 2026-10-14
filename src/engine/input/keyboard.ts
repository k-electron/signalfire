import type { DomainEvent } from "../../core/ports/domain-event";
import type { Outbox } from "../../core/ports/outbox";
import type { WaitingLanesRun } from "../../core/sim/waiting-lanes";
import type { FixedStepLoop } from "../loop/fixed-step-loop";

const GAME_KEYS = new Set([" ", "Tab", "Backspace", "'", "/", "Enter"]);

const MODIFIER_KEYS = new Set(["Shift", "Control", "Alt", "Meta"]);

export type KeyboardEventLike = {
	readonly type: string;
	readonly key: string;
	readonly code: string;
	readonly repeat: boolean;
	readonly isComposing: boolean;
	readonly shiftKey: boolean;
	readonly ctrlKey: boolean;
	readonly altKey: boolean;
	readonly metaKey: boolean;
	readonly timeStamp: number;
	preventDefault(): void;
	stopPropagation(): void;
};

export type ShiftState = {
	left: boolean;
	right: boolean;
};

export type TranslatedInput = {
	readonly character: number;
	readonly flags: number;
	readonly code: string;
	readonly timeStamp: number;
};

export function isGameKey(key: string): boolean {
	return GAME_KEYS.has(key);
}

export function translateKeyboardEvent(
	event: KeyboardEventLike,
	shiftState: ShiftState,
): TranslatedInput | null {
	// Game keys must never trigger default browser actions during a level,
	// including on auto-repeat (vertical 04, horizontal 04).
	if (isGameKey(event.key)) {
		event.preventDefault();
	}

	// Auto-repeat is ignored. Only the first press counts (vertical 04).
	if (event.repeat) {
		return null;
	}

	// Dead keys and input-method composition are ignored (vertical 04).
	if (event.isComposing || event.key === "Dead") {
		return null;
	}

	// Update shift tracker on shift key events
	if (event.code === "ShiftLeft") {
		shiftState.left = event.type === "keydown";
	} else if (event.code === "ShiftRight") {
		shiftState.right = event.type === "keydown";
	}

	// Standalone modifier keys are not keystrokes (vertical 04).
	if (MODIFIER_KEYS.has(event.key)) {
		return null;
	}

	// Key combinations with Ctrl, Meta, or Alt are not game keystrokes.
	if (event.ctrlKey || event.metaKey || event.altKey) {
		return null;
	}

	// Only single character keys produce simulation characters.
	if (event.key.length !== 1) {
		return null;
	}

	const codePoint = event.key.codePointAt(0);
	if (codePoint === undefined) {
		return null;
	}

	let flags = 0;
	if (event.type === "keyup") {
		flags |= 1; // bit 0: key-up
	}

	if (event.shiftKey) {
		if (shiftState.left && !shiftState.right) {
			flags |= 2; // bit 1: ShiftLeft
		} else if (shiftState.right && !shiftState.left) {
			flags |= 4; // bit 2: ShiftRight
		}
	}

	const timeStamp =
		typeof event.timeStamp === "number" &&
		Number.isFinite(event.timeStamp) &&
		event.timeStamp > 0
			? event.timeStamp
			: typeof performance !== "undefined"
				? performance.now()
				: 0;

	return {
		character: codePoint,
		flags,
		code: event.code,
		timeStamp,
	};
}

export type KeyboardContext = {
	readonly loop: FixedStepLoop;
	readonly run: WaitingLanesRun;
	readonly outbox: Outbox;
};

export function processKeyboardEvent(
	event: KeyboardEventLike,
	context: KeyboardContext,
	shiftState: ShiftState,
): readonly DomainEvent[] {
	const translated = translateKeyboardEvent(event, shiftState);
	if (translated === null) {
		return [];
	}

	// Advance fixed-step loop to the event's high-resolution timestamp
	context.loop.input(translated.timeStamp);
	const step = context.loop.clock.step();

	// Advance simulation to the current step and judge the keystroke
	context.run.advance(step, context.outbox);
	context.run.apply(translated.character, translated.flags, context.outbox);

	return context.outbox.drain();
}

export type EventTargetLike = Pick<
	EventTarget,
	"addEventListener" | "removeEventListener"
>;

export type KeyboardCaptureOptions = {
	readonly loop: FixedStepLoop;
	readonly run: WaitingLanesRun;
	readonly outbox: Outbox;
	readonly target?: EventTargetLike;
	readonly onEvents?: (events: readonly DomainEvent[]) => void;
};

export type KeyboardCapture = {
	destroy(): void;
};

export function startKeyboardCapture(
	options: KeyboardCaptureOptions,
): KeyboardCapture {
	const target =
		options.target ?? (typeof window !== "undefined" ? window : null);
	if (target === null) {
		return { destroy() {} };
	}

	const shiftState: ShiftState = { left: false, right: false };

	const handleEvent = (domEvent: Event) => {
		const keyboardEvent = domEvent as unknown as KeyboardEventLike;
		const events = processKeyboardEvent(
			keyboardEvent,
			{
				loop: options.loop,
				run: options.run,
				outbox: options.outbox,
			},
			shiftState,
		);
		if (events.length > 0 && options.onEvents !== undefined) {
			options.onEvents(events);
		}
	};

	target.addEventListener("keydown", handleEvent as EventListener);
	target.addEventListener("keyup", handleEvent as EventListener);

	return {
		destroy() {
			target.removeEventListener("keydown", handleEvent as EventListener);
			target.removeEventListener("keyup", handleEvent as EventListener);
		},
	};
}
