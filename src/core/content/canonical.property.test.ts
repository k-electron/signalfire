import { fc, test } from "@fast-check/vitest";
import { expect } from "vitest";
import { digestCanonical } from "./canonical";

const leaf = fc.oneof(
	fc.constant(null),
	fc.boolean(),
	fc.integer({ min: -50, max: 50 }),
	fc.string({ maxLength: 8 }),
);

const jsonValue: fc.Arbitrary<unknown> = fc.letrec((tie) => ({
	value: fc.oneof(
		{ arbitrary: leaf, weight: 4 },
		{
			arbitrary: fc.array(tie("value"), { maxLength: 3 }),
			weight: 1,
		},
		{
			arbitrary: fc.dictionary(
				fc
					.string({ minLength: 1, maxLength: 4 })
					.filter((key) => !key.includes("\r") && !key.includes("\n")),
				tie("value"),
				{ maxKeys: 3 },
			),
			weight: 1,
		},
	),
})).value;

function emitShuffled(value: unknown): string {
	if (value === null) {
		return "null";
	}
	if (typeof value === "boolean" || typeof value === "number") {
		return JSON.stringify(value);
	}
	if (typeof value === "string") {
		return JSON.stringify(value);
	}
	if (Array.isArray(value)) {
		return `[\r\n${value.map((item) => emitShuffled(item)).join(",\r\n")}\r\n]`;
	}
	const record = value as Record<string, unknown>;
	const body = Object.keys(record)
		.reverse()
		.map((key) => `${JSON.stringify(key)}:\r\n${emitShuffled(record[key])}`)
		.join(",\r\n");
	return `{\r\n${body}\r\n}`;
}

test.prop([jsonValue])(
	"token line endings do not change the digest",
	(value) => {
		const reordered = JSON.parse(emitShuffled(value)) as unknown;
		expect(digestCanonical(value)).toBe(digestCanonical(reordered));
	},
);
