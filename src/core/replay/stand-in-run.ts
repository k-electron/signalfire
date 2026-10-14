import type { DomainEvent } from "../ports/domain-event";
import { createOutbox, type Outbox } from "../ports/outbox";
import { runLog } from "../schemas/run-log";
import { createRng, type Rng } from "./rng";

/**
 * Stand-in rules for the Stage 1 replay kernel.
 * Judging and scoring replace this match, horizon, target list, and summary.
 */
export const STAND_IN_ENGINE_VERSION = "0.0.0";

const TARGETS = [97, 98, 99] as const;

export type StandInInput = {
	readonly step: number;
	readonly character: number;
	readonly flags: number;
};

export type StandInIdentity = {
	readonly runId: string;
	readonly levelId: string;
	readonly tier: "cadet" | "veteran" | "ace";
	readonly mode:
		| "campaign"
		| "repair"
		| "systems-check"
		| "courier"
		| "daily-signal"
		| "deep-archive";
	readonly contentVersion: string;
	readonly startedAt: string;
	readonly updatedAt: string;
	readonly rev: number;
};

export type StandInSummary = {
	readonly accuracy: number;
	readonly netWpm: number;
	readonly score: number;
	readonly stars: number;
	readonly medals: readonly string[];
};

export type StandInRun = {
	step(): number;
	advance(toStep: number, outbox: Outbox): void;
	apply(character: number, flags: number, outbox: Outbox): void;
	finish(outbox: Outbox): StandInSummary;
};

type RunLogDocument = Extract<
	ReturnType<typeof runLog.parse>,
	{ status: "ok" }
>["document"];

type State = {
	step: number;
	horizon: number;
	rng: Rng;
	target: number;
	hits: number;
	errors: number;
	inputs: StandInInput[];
	finished: boolean;
};

const placeholderSummary: StandInSummary = {
	accuracy: 1,
	netWpm: 0,
	score: 0,
	stars: 0,
	medals: [],
};

export function createStandInRun(seed: string): StandInRun {
	const rng = createRng(seed).fork("stand-in");
	const state: State = {
		step: 0,
		horizon: 1 + rng.int(0, 7),
		rng,
		target: rng.pick(TARGETS),
		hits: 0,
		errors: 0,
		inputs: [],
		finished: false,
	};
	return {
		step() {
			return state.step;
		},
		advance(toStep, outbox) {
			advance(state, toStep, outbox);
		},
		apply(character, flags, outbox) {
			apply(state, character, flags, outbox);
		},
		finish(outbox) {
			return finish(state, outbox);
		},
	};
}

export function recordStandInRun(
	seed: string,
	inputs: readonly StandInInput[],
	identity: StandInIdentity,
	outbox: Outbox,
): RunLogDocument {
	const encoded = encode(inputs);
	if (
		runLog.parse(document(seed, encoded, identity, placeholderSummary))
			.status !== "ok"
	) {
		throw new RangeError("The run log is invalid.");
	}
	const privateOutbox = createOutbox();
	const summary = play(seed, inputs, privateOutbox);
	const parsed = runLog.parse(document(seed, encoded, identity, summary));
	if (parsed.status !== "ok") {
		throw new RangeError("The run log is invalid.");
	}
	publish(privateOutbox, outbox);
	return parsed.document;
}

export function replayStandInRun(
	log: RunLogDocument,
	outbox: Outbox,
): { events: readonly DomainEvent[]; summary: StandInSummary } {
	const major = majorOf(log.engineVersion);
	if (major !== 0) {
		throw new RangeError("The engine version does not match.");
	}
	const inputs = expand(log.inputs);
	const privateOutbox = createOutbox();
	const summary = play(log.seed, inputs, privateOutbox);
	const events = privateOutbox.drain();
	for (const event of events) {
		outbox.emit(event);
	}
	return { events, summary };
}

function play(
	seed: string,
	inputs: readonly StandInInput[],
	outbox: Outbox,
): StandInSummary {
	const run = createStandInRun(seed);
	for (const input of inputs) {
		run.advance(input.step, outbox);
		run.apply(input.character, input.flags, outbox);
	}
	return run.finish(outbox);
}

function advance(state: State, toStep: number, _outbox: Outbox): void {
	assertPlaying(state);
	if (!Number.isSafeInteger(toStep) || toStep < 0) {
		throw new RangeError("The step must be a non-negative safe integer.");
	}
	if (toStep < state.step) {
		throw new RangeError("The step cannot move backward.");
	}
	while (state.step < toStep) {
		enterNext(state);
	}
}

function apply(
	state: State,
	character: number,
	flags: number,
	outbox: Outbox,
): void {
	assertPlaying(state);
	assertStorable(character, flags);
	state.inputs.push({ step: state.step, character, flags });
	// Bit 0 is key-up, from decision 0003. Shift bits are stored and ignored.
	if ((flags & 1) === 1) {
		return;
	}
	if (character === state.target) {
		state.hits += 1;
		outbox.emit({ type: "Hit", step: state.step });
		return;
	}
	state.errors += 1;
	outbox.emit({ type: "Error", step: state.step });
}

function finish(state: State, outbox: Outbox): StandInSummary {
	assertPlaying(state);
	const lastInputStep =
		state.inputs.length === 0
			? -1
			: inputAt(state.inputs, state.inputs.length - 1).step;
	const lastStep = Math.max(state.horizon, lastInputStep + 1) - 1;
	if (state.step > lastStep) {
		throw new RangeError("The run has advanced past its end.");
	}
	while (state.step < lastStep) {
		enterNext(state);
	}
	outbox.emit({ type: "LevelEnded", step: state.step });
	state.finished = true;
	return summaryOf(state);
}

function enterNext(state: State): void {
	state.step += 1;
	state.target = state.rng.pick(TARGETS);
}

function summaryOf(state: State): StandInSummary {
	const judgments = state.hits + state.errors;
	return {
		accuracy: judgments === 0 ? 1 : state.hits / judgments,
		netWpm: 0,
		score: state.hits,
		stars: 0,
		medals: [],
	};
}

function encode(inputs: readonly StandInInput[]): [number, number, number][] {
	let previous = 0;
	return inputs.map((input) => {
		const delta = input.step - previous;
		previous = input.step;
		return [delta, input.character, input.flags];
	});
}

function majorOf(version: string): number {
	const match = /^(0|[1-9]\d*)\./.exec(version);
	if (match === null) {
		throw new RangeError("The engine version does not match.");
	}
	return Number(match[1]);
}

function expand(inputs: RunLogDocument["inputs"]): StandInInput[] {
	let step = 0;
	return inputs.map(([delta, character, flags]) => {
		if (!Number.isSafeInteger(delta) || delta < 0) {
			throw new RangeError("The step delta cannot be stored.");
		}
		step += delta;
		if (!Number.isSafeInteger(step)) {
			throw new RangeError("The step must stay a safe integer.");
		}
		return { step, character, flags };
	});
}

function document(
	seed: string,
	inputs: [number, number, number][],
	identity: StandInIdentity,
	summary: StandInSummary,
) {
	return {
		v: 1 as const,
		updatedAt: identity.updatedAt,
		rev: identity.rev,
		runId: identity.runId,
		levelId: identity.levelId,
		tier: identity.tier,
		mode: identity.mode,
		seed,
		contentVersion: identity.contentVersion,
		engineVersion: STAND_IN_ENGINE_VERSION,
		startedAt: identity.startedAt,
		inputs,
		summary,
	};
}

function publish(source: Outbox, target: Outbox): void {
	for (const event of source.drain()) {
		target.emit(event);
	}
}

function assertPlaying(state: State): void {
	if (state.finished) {
		throw new RangeError("The run is finished.");
	}
}

function assertStorable(character: number, flags: number): void {
	if (!Number.isSafeInteger(flags) || flags < 0 || flags > 7) {
		throw new RangeError("Flags must be an integer from 0 through 7.");
	}
	if (
		!Number.isSafeInteger(character) ||
		character < 0 ||
		character > 0x10ffff ||
		(character >= 0xd800 && character <= 0xdfff)
	) {
		throw new RangeError("The character must be a Unicode code point.");
	}
}

function inputAt(inputs: readonly StandInInput[], index: number): StandInInput {
	const input = inputs[index];
	if (input === undefined) {
		throw new RangeError("The input index was outside the list.");
	}
	return input;
}
