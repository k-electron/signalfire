import { sha256Hex } from "./sha256.ts";

export { sha256Hex };

function normalizeString(value: string): string {
	return value.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
}

function normalize(value: unknown): unknown {
	if (typeof value === "string") {
		return normalizeString(value);
	}
	if (Array.isArray(value)) {
		return value.map((item) => normalize(item));
	}
	if (value !== null && typeof value === "object") {
		const source = value as Record<string, unknown>;
		const sorted: Record<string, unknown> = {};
		for (const key of Object.keys(source).sort()) {
			sorted[normalizeString(key)] = normalize(source[key]);
		}
		return sorted;
	}
	return value;
}

function encode(value: unknown): string {
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
		return `[${value.map((item) => encode(item)).join(",")}]`;
	}
	if (typeof value === "object") {
		const record = value as Record<string, unknown>;
		const body = Object.keys(record)
			.map((key) => `${JSON.stringify(key)}:${encode(record[key])}`)
			.join(",");
		return `{${body}}`;
	}
	throw new TypeError("content canonical value");
}

export function canonicalize(value: unknown): string {
	return encode(normalize(value));
}

export function digestUtf8(text: string): string {
	return sha256Hex(new TextEncoder().encode(text));
}

export function digestCanonical(value: unknown): string {
	return digestUtf8(canonicalize(value));
}
