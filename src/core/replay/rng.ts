/** mulberry32: one 32-bit state word, not a cryptographic generator. */
const MULBERRY_INCREMENT = 0x6d2b79f5;
const FNV_OFFSET = 2166136261;
const FNV_PRIME = 16777619;
const UINT32_SPAN = 2 ** 32;

export interface Rng {
	nextUint32(): number;
	int(min: number, max: number): number;
	pick<T>(items: readonly T[]): T;
	weighted<T>(items: readonly T[], weights: readonly number[]): T;
	shuffle<T>(items: readonly T[]): T[];
	chance(numerator: number, denominator: number): boolean;
	fork(label: string): Rng;
}

export function createRng(seed: string): Rng {
	let state = mixSeed(seed);
	const nextUint32 = (): number => {
		state |= 0;
		state = (state + MULBERRY_INCREMENT) | 0;
		let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
		mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
		return (mixed ^ (mixed >>> 14)) >>> 0;
	};
	return {
		nextUint32,
		int(min, max) {
			return drawInt(nextUint32, min, max);
		},
		pick(items) {
			if (items.length === 0) {
				throw new RangeError("Cannot pick from an empty list.");
			}
			return itemAt(items, drawInt(nextUint32, 0, items.length - 1));
		},
		weighted(items, weights) {
			return drawWeighted(nextUint32, items, weights);
		},
		shuffle(items) {
			return drawShuffle(nextUint32, items);
		},
		chance(numerator, denominator) {
			return drawChance(nextUint32, numerator, denominator);
		},
		fork(label) {
			return createRng(derivedSeed(seed, label));
		},
	};
}

function mixSeed(seed: string): number {
	let hash = FNV_OFFSET;
	for (let index = 0; index < seed.length; index++) {
		const code = seed.charCodeAt(index);
		hash = Math.imul(hash ^ code, FNV_PRIME);
	}
	return hash >>> 0;
}

function derivedSeed(seed: string, label: string): string {
	return `${seed.length.toString(16)}#${seed}${label.length.toString(16)}#${label}`;
}

function drawInt(nextUint32: () => number, min: number, max: number): number {
	if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || min > max) {
		throw new RangeError("Bounds must be safe integers with min <= max.");
	}
	const span = max - min + 1;
	if (span > UINT32_SPAN) {
		throw new RangeError("The integer range is wider than 4294967296.");
	}
	const limit = Math.floor(UINT32_SPAN / span) * span;
	let value = nextUint32();
	while (value >= limit) {
		value = nextUint32();
	}
	return min + (value % span);
}

function drawWeighted<T>(
	nextUint32: () => number,
	items: readonly T[],
	weights: readonly number[],
): T {
	if (items.length === 0 || items.length !== weights.length) {
		throw new RangeError("Weights must match a non-empty item list.");
	}
	let sum = 0;
	for (const weight of weights) {
		if (!Number.isSafeInteger(weight) || weight < 0) {
			throw new RangeError("Weights must be non-negative safe integers.");
		}
		sum += weight;
	}
	if (sum === 0 || sum > UINT32_SPAN) {
		throw new RangeError("The weight sum must be from 1 through 4294967296.");
	}
	const ticket = drawInt(nextUint32, 0, sum - 1);
	let covered = 0;
	for (let index = 0; index < items.length; index++) {
		covered += weightAt(weights, index);
		if (ticket < covered) {
			return itemAt(items, index);
		}
	}
	throw new RangeError("The weight walk missed every item.");
}

function drawShuffle<T>(nextUint32: () => number, items: readonly T[]): T[] {
	const copy = items.slice();
	for (let index = copy.length - 1; index > 0; index--) {
		const swapIndex = drawInt(nextUint32, 0, index);
		const current = itemAt(copy, index);
		copy[index] = itemAt(copy, swapIndex);
		copy[swapIndex] = current;
	}
	return copy;
}

function drawChance(
	nextUint32: () => number,
	numerator: number,
	denominator: number,
): boolean {
	if (
		!Number.isSafeInteger(numerator) ||
		!Number.isSafeInteger(denominator) ||
		denominator < 1 ||
		numerator < 0 ||
		numerator > denominator
	) {
		throw new RangeError(
			"Chance needs a positive denominator and a numerator from 0 through it.",
		);
	}
	return drawInt(nextUint32, 0, denominator - 1) < numerator;
}

function itemAt<T>(items: readonly T[], index: number): T {
	if (!Object.hasOwn(items, index)) {
		throw new RangeError("The draw index was outside the list.");
	}
	return items[index] as T;
}

function weightAt(weights: readonly number[], index: number): number {
	const weight = weights[index];
	if (weight === undefined) {
		throw new RangeError("The weight index was outside the list.");
	}
	return weight;
}
