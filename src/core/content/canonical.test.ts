import { expect, test } from "vitest";
import { canonicalize, digestUtf8, sha256Hex } from "./canonical";

test("object keys sort", () => {
	const value: Record<string, unknown> = {};
	value.b = 1;
	value.a = "x";
	expect(canonicalize(value)).toBe('{"a":"x","b":1}');
});

test("a carriage return inside a string", () => {
	expect(canonicalize(`f\r\nj`)).toBe(String.raw`"f\nj"`);
});

test("SHA-256 of the sorted object", () => {
	expect(digestUtf8('{"a":"x","b":1}')).toBe(
		"cdab067e9f3beb32d1252cfd63e492592fecbf591b0d08cadb24bb17f3864246",
	);
});

test("SHA-256 of the empty input", () => {
	expect(sha256Hex(new Uint8Array())).toBe(
		"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
	);
});
