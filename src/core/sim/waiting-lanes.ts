import type { Level, Tuning, Zone } from "../content/load";
import {
	appendCharacter,
	applyKeystroke,
	attemptCounts,
	integrityPercent,
	type JudgeState,
	type ShiftSide,
	startJudge,
	velocityWpm,
} from "../input/judge";
import type { DomainEvent } from "../ports/domain-event";
import { createOutbox, type Outbox } from "../ports/outbox";
import { createRng, type Rng } from "../replay/rng";
import { runLog } from "../schemas/run-log";
import { scoreEvents } from "../scoring/score";
import { awardStars, type MissedBar, type StarBars } from "../scoring/stars";

const ENGINE_VERSION = "0.0.0";
const STEPS_PER_SECOND = 120;

export type WaitingLanesIdentity = {
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

export type NotePosture = "approaching" | "waiting";

export type ActiveNote = {
	readonly character: number;
	readonly spawnStep: number;
	readonly posture: NotePosture;
};

export type RunSummary = {
	readonly accuracy: number;
	readonly netWpm: number;
	readonly score: number;
	readonly stars: number;
	readonly medals: readonly string[];
};

export type RunLogDocument = Extract<
	ReturnType<typeof runLog.parse>,
	{ status: "ok" }
>["document"];

export type WaitingLanesRun = {
	step(): number;
	advance(toStep: number, outbox: Outbox): void;
	apply(character: number, flags: number, outbox: Outbox): void;
	inputs(): readonly { step: number; character: number; flags: number }[];
	activeNote(): ActiveNote | null;
	unhitCount(): number;
	metrics(): {
		readonly integrityPercent: number;
		readonly velocityWpm: number;
	};
	summary(): {
		summary: RunSummary;
		missed: readonly MissedBar[];
		log: RunLogDocument;
	};
	finish(outbox: Outbox): {
		summary: RunSummary;
		missed: readonly MissedBar[];
		log: RunLogDocument;
	};
};

type Note = {
	readonly character: number;
	readonly spawnStep: number;
};

type UnitCursor = {
	codes: readonly number[];
	index: number;
};

type StoredInput = {
	readonly step: number;
	readonly character: number;
	readonly flags: number;
};

type State = {
	step: number;
	finished: boolean;
	rng: Rng;
	unit: UnitCursor | null;
	notes: Note[];
	judge: JudgeState;
	inputs: StoredInput[];
	lastStep: number;
	approachSteps: number;
	queueDepth: number;
	level: Level;
	seed: string;
	identity: WaitingLanesIdentity;
	starBars: StarBars | null;
	events: DomainEvent[];
};

const placeholderSummary: RunSummary = {
	accuracy: 1,
	netWpm: 0,
	score: 0,
	stars: 0,
	medals: [],
};

export function createWaitingLanesRun(
	level: Level,
	zone: Zone,
	tuning: Tuning,
	seed: string,
	identity: WaitingLanesIdentity,
): WaitingLanesRun {
	if (zone.id !== level.zoneId) {
		throw new RangeError("The zone does not match the level.");
	}
	const approachSteps = approachLength(tuning);
	const lastStep = lastStepOf(level);
	if (
		runLog.parse(document(seed, [], identity, placeholderSummary)).status !==
			"ok" ||
		identity.levelId !== level.id
	) {
		throw new RangeError("The run log is invalid.");
	}
	const state: State = {
		step: 0,
		finished: false,
		rng: createRng(seed).fork("waiting-lanes"),
		unit: null,
		notes: [],
		judge: startJudge([]),
		inputs: [],
		lastStep,
		approachSteps,
		queueDepth: tuning.queueDepth,
		level,
		seed,
		identity,
		starBars: zone.starBars ?? null,
		events: [],
	};
	fillQueue(state, 0);
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
		inputs() {
			return state.inputs;
		},
		activeNote() {
			return activeNote(state);
		},
		unhitCount() {
			return state.notes.length;
		},
		metrics() {
			return {
				integrityPercent: integrityPercent(state.judge),
				velocityWpm: velocityWpm(state.judge),
			};
		},
		summary() {
			return summaryOf(state);
		},
		finish(outbox) {
			return finish(state, outbox);
		},
	};
}

export function replayWaitingLanes(
	level: Level,
	zone: Zone,
	tuning: Tuning,
	log: RunLogDocument,
	outbox: Outbox,
): {
	events: readonly DomainEvent[];
	summary: RunSummary;
	missed: readonly MissedBar[];
} {
	const major = majorOf(log.engineVersion);
	if (major !== 0) {
		throw new RangeError("The engine version does not match.");
	}
	const inputs = expand(log.inputs);
	const privateOutbox = createOutbox();
	const run = createWaitingLanesRun(level, zone, tuning, log.seed, {
		runId: log.runId,
		levelId: log.levelId,
		tier: log.tier,
		mode: log.mode,
		contentVersion: log.contentVersion,
		startedAt: log.startedAt,
		updatedAt: log.updatedAt,
		rev: log.rev,
	});
	for (const input of inputs) {
		run.advance(input.step, privateOutbox);
		run.apply(input.character, input.flags, privateOutbox);
	}
	const finished = run.finish(privateOutbox);
	const events = privateOutbox.drain();
	for (const event of events) {
		outbox.emit(event);
	}
	return { events, summary: finished.summary, missed: finished.missed };
}

function approachLength(tuning: Tuning): number {
	const steps = tuning.approachSeconds * STEPS_PER_SECOND;
	// Outcomes use integer steps (horizontal 04, Determinism and replay).
	// The approach length is approachSeconds * 120, so a non-integer product is rejected.
	if (!Number.isInteger(steps)) {
		throw new RangeError(
			"The approach length must be an integer number of steps.",
		);
	}
	return steps;
}

function lastStepOf(level: Level): number {
	let total = 0;
	for (const phase of level.phases) {
		total += phase.durationSeconds * STEPS_PER_SECOND;
	}
	if (total < 1) {
		throw new RangeError("The level has no steps.");
	}
	return total - 1;
}

function fillQueue(state: State, spawnStep: number): void {
	while (state.notes.length < state.queueDepth) {
		const character = takeCharacter(state, spawnStep);
		state.judge = appendCharacter(state.judge, character);
		state.notes.push({ character, spawnStep });
	}
}

function takeCharacter(state: State, spawnStep: number): number {
	if (state.unit === null || state.unit.index >= state.unit.codes.length) {
		const phase = phaseAt(state.level, spawnStep);
		state.unit = { codes: codesOf(state.rng.pick(phase.units)), index: 0 };
	}
	const unit = state.unit;
	if (unit === null) {
		throw new RangeError("The unit is missing.");
	}
	const character = unit.codes[unit.index];
	if (character === undefined) {
		throw new RangeError("The unit is empty.");
	}
	unit.index += 1;
	return character;
}

function phaseAt(level: Level, step: number): Level["phases"][number] {
	let cursor = 0;
	for (const phase of level.phases) {
		const end = cursor + phase.durationSeconds * STEPS_PER_SECOND;
		if (step < end) {
			return phase;
		}
		cursor = end;
	}
	throw new RangeError("The spawn step is outside the level.");
}

function codesOf(unit: string): number[] {
	const codes: number[] = [];
	for (const character of unit) {
		const code = character.codePointAt(0);
		if (code === undefined) {
			throw new RangeError("The unit is empty.");
		}
		codes.push(code);
	}
	if (codes.length === 0) {
		throw new RangeError("The unit is empty.");
	}
	return codes;
}

function advance(state: State, toStep: number, outbox: Outbox): void {
	assertPlaying(state);
	if (!Number.isSafeInteger(toStep) || toStep < 0) {
		throw new RangeError("The step must be a non-negative safe integer.");
	}
	if (toStep < state.step) {
		throw new RangeError("The step cannot move backward.");
	}
	if (toStep === state.step) {
		return;
	}
	if (toStep > state.lastStep) {
		state.step = state.lastStep;
		end(state, outbox);
		return;
	}
	state.step = toStep;
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
	const judged = applyKeystroke(state.judge, {
		step: state.step,
		character,
		physicalKey: "Unidentified",
		shiftSide: shiftSide(flags),
		phase: (flags & 1) === 1 ? "up" : "down",
	});
	state.judge = judged.state;
	if (judged.event !== null) {
		emit(state, outbox, judged.event);
	}
	if (judged.event?.type === "Hit") {
		state.notes = state.notes.slice(1);
		fillQueue(state, state.step);
	}
}

function finish(
	state: State,
	outbox: Outbox,
): { summary: RunSummary; missed: readonly MissedBar[]; log: RunLogDocument } {
	assertPlaying(state);
	state.step = state.lastStep;
	end(state, outbox);
	return summaryOf(state);
}

function emit(state: State, outbox: Outbox, event: DomainEvent): void {
	state.events.push(event);
	outbox.emit(event);
}

function end(state: State, outbox: Outbox): void {
	emit(state, outbox, { type: "LevelEnded", step: state.step });
	state.finished = true;
}

function activeNote(state: State): ActiveNote | null {
	const note = state.notes[0];
	if (note === undefined) {
		return null;
	}
	const posture =
		state.step < note.spawnStep + state.approachSteps
			? "approaching"
			: "waiting";
	return { character: note.character, spawnStep: note.spawnStep, posture };
}

function summaryOf(state: State): {
	summary: RunSummary;
	missed: readonly MissedBar[];
	log: RunLogDocument;
} {
	const attempts = attemptCounts(state.judge);
	const netWpm = velocityWpm(state.judge);
	const award = awardStars({
		finished: true,
		correctFirstAttempts: attempts.correctFirstAttempts,
		firstAttempts: attempts.firstAttempts,
		netWpm,
		starBars: state.starBars,
	});
	const summary: RunSummary = {
		accuracy:
			attempts.firstAttempts === 0 ? 1 : integrityPercent(state.judge) / 100,
		netWpm,
		score: scoreEvents(state.events),
		stars: award.stars,
		medals: [],
	};
	const parsed = runLog.parse(
		document(state.seed, encode(state.inputs), state.identity, summary),
	);
	if (parsed.status !== "ok") {
		throw new RangeError("The run log is invalid.");
	}
	return {
		summary,
		missed: award.missed,
		log: parsed.document,
	};
}

function shiftSide(flags: number): ShiftSide {
	const left = (flags & 2) !== 0;
	const right = (flags & 4) !== 0;
	if (left && !right) {
		return "left";
	}
	if (right && !left) {
		return "right";
	}
	return "none";
}

function encode(inputs: readonly StoredInput[]): [number, number, number][] {
	let previous = 0;
	return inputs.map((input) => {
		const delta = input.step - previous;
		previous = input.step;
		return [delta, input.character, input.flags];
	});
}

function majorOf(version: string): number {
	const match = /^(0|[1-9]\d*)\./.exec(version);
	if (match === null || match[1] === undefined) {
		throw new RangeError("The engine version does not match.");
	}
	return Number(match[1]);
}

function expand(inputs: RunLogDocument["inputs"]): StoredInput[] {
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
	identity: WaitingLanesIdentity,
	summary: RunSummary,
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
		engineVersion: ENGINE_VERSION,
		startedAt: identity.startedAt,
		inputs,
		summary,
	};
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
