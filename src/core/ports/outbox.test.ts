import { expect, test } from "vitest";
import { createOutbox } from "./outbox";

test("drain returns the emitted events and then is empty", () => {
	const outbox = createOutbox();
	outbox.emit({ type: "Hit", step: 2 });
	outbox.emit({ type: "Error", step: 2 });
	outbox.emit({ type: "WordComplete", step: 2 });
	outbox.emit({ type: "LevelEnded", step: 2 });
	expect(outbox.drain()).toEqual([
		{ type: "Hit", step: 2 },
		{ type: "Error", step: 2 },
		{ type: "WordComplete", step: 2 },
		{ type: "LevelEnded", step: 2 },
	]);
	expect(outbox.drain()).toEqual([]);
});

test("a later emit does not change a drained batch", () => {
	const outbox = createOutbox();
	outbox.emit({ type: "Hit", step: 3 });
	const batch = outbox.drain();
	outbox.emit({ type: "Error", step: 4 });
	expect(batch).toEqual([{ type: "Hit", step: 3 }]);
});
