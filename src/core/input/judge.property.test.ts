import { fc, test } from "@fast-check/vitest";
import { expect } from "vitest";
import {
	applyKeystroke,
	integrityPercent,
	type Keystroke,
	startJudge,
	velocityWpm,
} from "./judge";

const codePoint = fc.integer({ min: 32, max: 126 });
const shiftSide = fc.constantFrom(
	"left" as const,
	"right" as const,
	"none" as const,
);
const phase = fc.constantFrom("down" as const, "up" as const);
const physicalKey = fc.constantFrom("KeyF", "KeyJ", "Space");

const sequence = fc.array(codePoint, { maxLength: 12 });

const keystrokes = fc
	.array(
		fc.record({
			delta: fc.integer({ min: 0, max: 400 }),
			character: codePoint,
			physicalKey,
			shiftSide,
			phase,
		}),
		{ maxLength: 24 },
	)
	.map((rows) => {
		let step = 0;
		return rows.map((row) => {
			step += row.delta;
			return {
				step,
				character: row.character,
				physicalKey: row.physicalKey,
				shiftSide: row.shiftSide,
				phase: row.phase,
			} satisfies Keystroke;
		});
	});

test.prop([sequence, keystrokes])(
	"generated keystrokes stay in range",
	(characters, keys) => {
		let state = startJudge(characters);
		for (const key of keys) {
			state = applyKeystroke(state, key).state;
		}
		const integrity = integrityPercent(state);
		expect(integrity).toBeGreaterThanOrEqual(0);
		expect(integrity).toBeLessThanOrEqual(100);
		const velocity = velocityWpm(state);
		expect(Number.isFinite(velocity)).toBe(true);
		expect(velocity).toBeGreaterThanOrEqual(0);
	},
);

const correctRun = fc
	.array(
		fc.record({
			character: codePoint,
			delta: fc.integer({ min: 0, max: 400 }),
			keyUp: fc.boolean(),
			keyUpFirst: fc.boolean(),
		}),
		{ maxLength: 12 },
	)
	.map((rows) => {
		let step = 0;
		const characters: number[] = [];
		const keys: Keystroke[] = [];
		for (const row of rows) {
			step += row.delta;
			characters.push(row.character);
			const press: Keystroke = {
				step,
				character: row.character,
				physicalKey: "KeyF",
				shiftSide: "none",
				phase: "down",
			};
			const release: Keystroke = { ...press, phase: "up" };
			if (row.keyUp && row.keyUpFirst) {
				keys.push(release);
			}
			keys.push(press);
			if (row.keyUp && !row.keyUpFirst) {
				keys.push(release);
			}
		}
		return { characters, keys };
	});

test.prop([correctRun])(
	"a generated run of only correct keys scores 100",
	({ characters, keys }) => {
		let state = startJudge(characters);
		for (const key of keys) {
			state = applyKeystroke(state, key).state;
		}
		expect(integrityPercent(state)).toBe(100);
	},
);
