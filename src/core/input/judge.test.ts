import { expect, test } from "vitest";
import {
	activeCharacter,
	applyKeystroke,
	attemptCounts,
	integrityPercent,
	type Keystroke,
	startJudge,
	velocityWpm,
} from "./judge";

const F = 102;
const J = 106;
const K = 107;
const X = 120;
const CAPITAL_F = 70;
const SPACE = 32;

function down(
	step: number,
	character: number,
	shiftSide: Keystroke["shiftSide"] = "none",
	physicalKey = "KeyF",
): Keystroke {
	return { step, character, physicalKey, shiftSide, phase: "down" };
}

function up(step: number, character: number): Keystroke {
	return {
		step,
		character,
		physicalKey: "KeyF",
		shiftSide: "none",
		phase: "up",
	};
}

test("f against f is a hit", () => {
	const started = startJudge([F, J]);
	expect(activeCharacter(started)).toBe(F);
	const result = applyKeystroke(started, down(0, F));
	expect(result.event).toEqual({ type: "Hit", step: 0 });
	expect(activeCharacter(result.state)).toBe(J);
	expect(integrityPercent(result.state)).toBe(100);
	expect(velocityWpm(result.state)).toBe(0);
});

test("the last character ends the sequence", () => {
	const result = applyKeystroke(startJudge([F]), down(4, F));
	expect(result.event).toEqual({ type: "Hit", step: 4 });
	expect(activeCharacter(result.state)).toBeNull();
});

test("two matches at one step both hit", () => {
	const first = applyKeystroke(startJudge([F, J]), down(3, F));
	const second = applyKeystroke(first.state, down(3, J));
	expect([first.event, second.event]).toEqual([
		{ type: "Hit", step: 3 },
		{ type: "Hit", step: 3 },
	]);
	expect(activeCharacter(second.state)).toBeNull();
	expect(integrityPercent(second.state)).toBe(100);
});

test("space is a character", () => {
	const result = applyKeystroke(
		startJudge([SPACE]),
		down(0, SPACE, "none", "Space"),
	);
	expect(result.event).toEqual({ type: "Hit", step: 0 });
	expect(activeCharacter(result.state)).toBeNull();
});

test("j against f is an error", () => {
	const result = applyKeystroke(startJudge([F]), down(0, J));
	expect(result.event).toEqual({ type: "Error", step: 0 });
	expect(activeCharacter(result.state)).toBe(F);
	expect(integrityPercent(result.state)).toBe(0);
	expect(velocityWpm(result.state)).toBe(0);
});

test("no key-down scores 100", () => {
	const state = startJudge([F]);
	expect(integrityPercent(state)).toBe(100);
	expect(velocityWpm(state)).toBe(0);
});

test("an error then a hit stays an error", () => {
	const error = applyKeystroke(startJudge([F, J]), down(0, X));
	expect(error.event).toEqual({ type: "Error", step: 0 });
	expect(integrityPercent(error.state)).toBe(0);
	const corrected = applyKeystroke(error.state, down(120, F));
	expect(corrected.event).toEqual({ type: "Hit", step: 120 });
	expect(integrityPercent(corrected.state)).toBe(0);
	const next = applyKeystroke(corrected.state, down(240, J));
	expect(next.event).toEqual({ type: "Hit", step: 240 });
	expect(integrityPercent(next.state)).toBe(50);
	expect(velocityWpm(next.state)).toBe(12);
});

test("only correct keys score 100", () => {
	const first = applyKeystroke(startJudge([F, J, SPACE]), down(0, F));
	const second = applyKeystroke(first.state, down(120, J));
	const third = applyKeystroke(second.state, down(240, SPACE, "none", "Space"));
	expect(integrityPercent(third.state)).toBe(100);
	expect(velocityWpm(third.state)).toBe(18);
});

test("two errors then a hit", () => {
	const keys = [down(0, J), down(120, K), down(240, F)];
	const expected = [
		{ type: "Error", step: 0 },
		{ type: "Error", step: 120 },
		{ type: "Hit", step: 240 },
	] as const;
	let state = startJudge([F]);
	for (let index = 0; index < keys.length; index += 1) {
		const key = keys[index];
		if (key === undefined) {
			throw new RangeError("The key index was outside the list.");
		}
		const result = applyKeystroke(state, key);
		state = result.state;
		expect(result.event).toEqual(expected[index]);
		expect(attemptCounts(state).firstAttempts).toBe(1);
		expect(integrityPercent(state)).toBe(0);
	}
	expect(velocityWpm(state)).toBe(6);
});

test("releasing the active character does nothing", () => {
	const started = startJudge([F]);
	const result = applyKeystroke(started, up(0, F));
	expect(result.event).toBeNull();
	expect(activeCharacter(result.state)).toBe(F);
	expect(integrityPercent(result.state)).toBe(100);
	expect(velocityWpm(result.state)).toBe(0);
	expect(attemptCounts(result.state)).toEqual(attemptCounts(started));
});

test("a key-up before the first key-down does not start time", () => {
	const released = applyKeystroke(startJudge([F]), up(0, F));
	const hit = applyKeystroke(released.state, down(120, F));
	expect(released.event).toBeNull();
	expect(hit.event).toEqual({ type: "Hit", step: 120 });
	expect(velocityWpm(hit.state)).toBe(0);
});

test("a key-up after the last key-down does not extend time", () => {
	const first = applyKeystroke(startJudge([F, J]), down(0, F));
	const second = applyKeystroke(first.state, down(120, J));
	const released = applyKeystroke(second.state, up(480, J));
	expect([first.event, second.event, released.event]).toEqual([
		{ type: "Hit", step: 0 },
		{ type: "Hit", step: 120 },
		null,
	]);
	expect(velocityWpm(released.state)).toBe(24);
});

test("the same character with left Shift is a hit", () => {
	const result = applyKeystroke(startJudge([F]), down(0, F, "left", "KeyF"));
	expect(result.event).toEqual({ type: "Hit", step: 0 });
});

test("a different physical key with the same character is a hit", () => {
	const result = applyKeystroke(startJudge([F]), down(0, F, "none", "KeyJ"));
	expect(result.event).toEqual({ type: "Hit", step: 0 });
});

test("a capital does not match the lowercase character", () => {
	const result = applyKeystroke(
		startJudge([F]),
		down(0, CAPITAL_F, "right", "KeyF"),
	);
	expect(result.event).toEqual({ type: "Error", step: 0 });
	expect(activeCharacter(result.state)).toBe(F);
});

test("an extra key after the sequence", () => {
	const hit = applyKeystroke(startJudge([F]), down(0, F));
	const extra = applyKeystroke(hit.state, down(120, J));
	expect(hit.event).toEqual({ type: "Hit", step: 0 });
	expect(extra.event).toBeNull();
	expect(integrityPercent(extra.state)).toBe(100);
	expect(velocityWpm(extra.state)).toBe(0);
});

test("an empty sequence accepts no judgment", () => {
	const result = applyKeystroke(startJudge([]), down(0, F));
	expect(result.event).toBeNull();
	expect(integrityPercent(result.state)).toBe(100);
	expect(velocityWpm(result.state)).toBe(0);
});

test("five hits in four seconds score 15", () => {
	let state = startJudge([F, F, F, F, F]);
	for (const step of [0, 120, 240, 360, 480]) {
		state = applyKeystroke(state, down(step, F)).state;
	}
	expect(integrityPercent(state)).toBe(100);
	expect(velocityWpm(state)).toBe(15);
});

test("a three-second gap stays in the time", () => {
	const first = applyKeystroke(startJudge([F, J]), down(0, F));
	const second = applyKeystroke(first.state, down(360, J));
	expect(integrityPercent(second.state)).toBe(100);
	expect(velocityWpm(second.state)).toBe(8);
});

test("a longer gap is excluded and the rest of the run remains", () => {
	const first = applyKeystroke(startJudge([F, J, F]), down(0, F));
	const second = applyKeystroke(first.state, down(361, J));
	const third = applyKeystroke(second.state, down(481, F));
	expect(integrityPercent(third.state)).toBe(100);
	expect(velocityWpm(third.state)).toBe(36);
});

test("excluding the whole span scores 0", () => {
	const first = applyKeystroke(startJudge([F, J]), down(0, F));
	const second = applyKeystroke(first.state, down(361, J));
	expect(integrityPercent(second.state)).toBe(100);
	expect(velocityWpm(second.state)).toBe(0);
});

test("an earlier step throws", () => {
	const hit = applyKeystroke(startJudge([F, J]), down(2, F));
	expect(hit.event).toEqual({ type: "Hit", step: 2 });
	expect(() => applyKeystroke(hit.state, down(1, J))).toThrow(RangeError);
	expect(activeCharacter(hit.state)).toBe(J);
	expect(integrityPercent(hit.state)).toBe(100);
	expect(velocityWpm(hit.state)).toBe(0);
});

test("a surrogate code point throws", () => {
	const started = startJudge([F]);
	expect(() => applyKeystroke(started, down(0, 55296))).toThrow(RangeError);
	expect(activeCharacter(started)).toBe(F);
	expect(integrityPercent(started)).toBe(100);
	expect(velocityWpm(started)).toBe(0);
	expect(attemptCounts(started)).toEqual({
		correctFirstAttempts: 0,
		firstAttempts: 0,
	});
});

test("an unusable keystroke is rejected", () => {
	const hit = applyKeystroke(startJudge([F, J]), down(2, F));
	const rejected: Keystroke[] = [
		down(-1, J),
		down(2.5, J),
		{ ...down(2, J), physicalKey: "" },
		down(2, -1),
		down(2, 0x110000),
		{ ...down(2, J), shiftSide: "both" as Keystroke["shiftSide"] },
	];
	for (const key of rejected) {
		expect(() => applyKeystroke(hit.state, key)).toThrow(RangeError);
	}
	expect(activeCharacter(hit.state)).toBe(J);
	expect(integrityPercent(hit.state)).toBe(100);
	expect(velocityWpm(hit.state)).toBe(0);
	expect(attemptCounts(hit.state)).toEqual({
		correctFirstAttempts: 1,
		firstAttempts: 1,
	});
});
