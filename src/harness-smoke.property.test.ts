/** Harness smoke test. Proves fast-check runs. Not game logic. */
import { fc, test } from "@fast-check/vitest";
import { expect } from "vitest";

test.prop([fc.integer()])(
	"harness smoke: an integer equals itself",
	(value) => {
		expect(value).toBe(value);
	},
);
