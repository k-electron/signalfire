/** Harness smoke test. Proves the Node project runs. Not game logic. */
import { expect, test } from "vitest";

test("harness smoke: node runner executes", () => {
	expect(1 + 1).toBe(2);
});
