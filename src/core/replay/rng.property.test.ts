import { fc, test } from "@fast-check/vitest";
import { expect } from "vitest";
import { createRng } from "./rng";

const signalfirePrefix = [
	2167704384, 631539707, 4290395976, 3656436552, 3265773535, 4231166332,
	427553985, 1826991209,
] as const;

function unsignedDraws(seed: string, count: number): number[] {
	const rng = createRng(seed);
	return Array.from({ length: count }, () => rng.nextUint32());
}

/** FNV-1a 32 from design.md, used only to skip mixes that are the same. */
function mixSeed(seed: string): number {
	let hash = 2166136261;
	for (let index = 0; index < seed.length; index++) {
		const code = seed.charCodeAt(index);
		hash = Math.imul(hash ^ code, 16777619);
	}
	return hash >>> 0;
}

function derivedSeed(seed: string, label: string): string {
	return `${seed.length.toString(16)}#${seed}${label.length.toString(16)}#${label}`;
}

test.prop([fc.string({ maxLength: 40 })])(
	"one seed matches across a mixed series",
	(seed) => {
		const run = (value: string) => {
			const rng = createRng(value);
			return {
				uints: Array.from({ length: 64 }, () => rng.nextUint32()),
				integer: rng.int(0, 8),
				pick: rng.pick(["a", "b", "c"]),
				weighted: rng.weighted(["a", "b", "c"], [1, 2, 3]),
				shuffle: rng.shuffle([0, 1, 2, 3, 4]),
				chance: rng.chance(1, 2),
			};
		};
		expect(run(seed)).toEqual(run(seed));
	},
);

test("the signalfire prefix is fixed", () => {
	expect(unsignedDraws("signalfire", 8)).toEqual([...signalfirePrefix]);
});

test("a one-character change diverges", () => {
	expect(createRng("signalfire").nextUint32()).toBe(2167704384);
	expect(createRng("signalfirf").nextUint32()).toBe(2472031719);
});

test.prop([fc.string({ maxLength: 40 }), fc.string({ maxLength: 40 })])(
	"any two different seeds diverge within 16 draws",
	(left, right) => {
		fc.pre(left !== right && mixSeed(left) !== mixSeed(right));
		expect(unsignedDraws(left, 16)).not.toEqual(unsignedDraws(right, 16));
	},
);

test.prop([
	fc.integer({
		min: Number.MIN_SAFE_INTEGER,
		max: Number.MAX_SAFE_INTEGER - 255,
	}),
	fc.integer({ min: 1, max: 256 }),
])("a draw stays inside the bounds", (min, span) => {
	const max = min + span - 1;
	const value = createRng("bounds").int(min, max);
	expect(Number.isSafeInteger(value)).toBe(true);
	expect(value).toBeGreaterThanOrEqual(min);
	expect(value).toBeLessThanOrEqual(max);
});

test("a full 32-bit range stays inside the bounds", () => {
	const value = createRng("full-span").int(0, 4294967295);
	expect(Number.isSafeInteger(value)).toBe(true);
	expect(value).toBeGreaterThanOrEqual(0);
	expect(value).toBeLessThanOrEqual(4294967295);
});

test("a reversed range is rejected", () => {
	expect(() => createRng("reversed").int(6, 3)).toThrow(RangeError);
});

test("a non-integer bound is rejected", () => {
	expect(() => createRng("fraction").int(0, 1.5)).toThrow(RangeError);
});

test("a range wider than 4294967296 is rejected", () => {
	expect(() => createRng("wide").int(0, 4294967296)).toThrow(RangeError);
});

test("the pick is one of the elements", () => {
	expect(["a", "b", "c"]).toContain(createRng("pick").pick(["a", "b", "c"]));
});

test("an empty list is rejected", () => {
	expect(() => createRng("empty").pick([])).toThrow(RangeError);
});

test("a zero weight is not chosen", () => {
	const rng = createRng("zero-weight");
	for (let count = 0; count < 32; count++) {
		expect(rng.weighted(["a", "b"], [0, 1])).toBe("b");
	}
});

test("a zero total is rejected", () => {
	expect(() => createRng("empty-weighted").weighted([], [])).toThrow(
		RangeError,
	);
	expect(() => createRng("zero-total").weighted(["a", "b"], [0, 0])).toThrow(
		RangeError,
	);
});

test("a weight sum above 4294967296 is rejected", () => {
	expect(() => createRng("huge-weight").weighted(["a"], [4294967297])).toThrow(
		RangeError,
	);
});

test("a negative weight is rejected", () => {
	expect(() => createRng("negative").weighted(["a"], [-1])).toThrow(RangeError);
});

test("a mismatched weight list is rejected", () => {
	expect(() => createRng("short").weighted(["a", "b"], [1])).toThrow(
		RangeError,
	);
});

test("five numbers are rearranged without changing the input", () => {
	const input = [0, 1, 2, 3, 4];
	const result = createRng("permute").shuffle(input);
	expect(result.toSorted((left, right) => left - right)).toEqual(input);
	expect(input).toEqual([0, 1, 2, 3, 4]);
});

test("the signalfire shuffle is fixed", () => {
	expect(createRng("signalfire").shuffle([0, 1, 2, 3, 4])).toEqual([
		1, 2, 0, 3, 4,
	]);
});

test("zero and certain chances", () => {
	expect(createRng("chance").chance(0, 5)).toBe(false);
	expect(createRng("chance").chance(5, 5)).toBe(true);
});

test("a chance consumes the same draws as one integer", () => {
	const withChance = createRng("chance-draw");
	const chance = withChance.chance(0, 5);
	const afterChance = withChance.nextUint32();
	const withInteger = createRng("chance-draw");
	withInteger.int(0, 4);
	expect(chance).toBe(false);
	expect(afterChance).toBe(withInteger.nextUint32());
});

test("an invalid chance consumes nothing", () => {
	const rng = createRng("chance-invalid");
	expect(() => rng.chance(1, 0)).toThrow(RangeError);
	expect(rng.nextUint32()).toBe(createRng("chance-invalid").nextUint32());
});

test("the content fork matches the derived seed", () => {
	const fork = createRng("signalfire").fork("content");
	const direct = createRng("a#signalfire7#content");
	expect(Array.from({ length: 8 }, () => fork.nextUint32())).toEqual(
		Array.from({ length: 8 }, () => direct.nextUint32()),
	);
});

test("earlier parent draws do not change the fork", () => {
	const drawn = createRng("parent");
	drawn.nextUint32();
	const afterDraw = drawn.fork("content");
	const beforeDraw = createRng("parent").fork("content");
	expect(Array.from({ length: 8 }, () => afterDraw.nextUint32())).toEqual(
		Array.from({ length: 8 }, () => beforeDraw.nextUint32()),
	);
});

test("fork draws do not change the parent", () => {
	const parent = createRng("parent-stable");
	const child = parent.fork("spawn");
	child.nextUint32();
	expect(parent.nextUint32()).toBe(createRng("parent-stable").nextUint32());
});

test("content and spawn labels diverge", () => {
	const rng = createRng("signalfire");
	const content = rng.fork("content");
	const spawn = rng.fork("spawn");
	expect(Array.from({ length: 8 }, () => content.nextUint32())).not.toEqual(
		Array.from({ length: 8 }, () => spawn.nextUint32()),
	);
});

test.prop([fc.string({ maxLength: 40 }), fc.string({ maxLength: 40 })])(
	"a fork matches the derived seed",
	(seed, label) => {
		const fork = createRng(seed).fork(label);
		const direct = createRng(derivedSeed(seed, label));
		expect(Array.from({ length: 8 }, () => fork.nextUint32())).toEqual(
			Array.from({ length: 8 }, () => direct.nextUint32()),
		);
	},
);

test("a hash mark and a supplementary character fork by code units", () => {
	for (const seed of ["a#b", "\u{1F600}"]) {
		const fork = createRng(seed).fork("content");
		const direct = createRng(derivedSeed(seed, "content"));
		expect(Array.from({ length: 8 }, () => fork.nextUint32())).toEqual(
			Array.from({ length: 8 }, () => direct.nextUint32()),
		);
	}
});
