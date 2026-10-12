import { expect, test } from "vitest";
import { createRng } from "./rng";

test("the signalfire prefix is fixed in Chromium", () => {
	const rng = createRng("signalfire");
	expect(Array.from({ length: 8 }, () => rng.nextUint32())).toEqual([
		2167704384, 631539707, 4290395976, 3656436552, 3265773535, 4231166332,
		427553985, 1826991209,
	]);
});
