import { z } from "zod";

/** Crockford base32, from the ULID spec. */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const MAX_TIME = 281474976710655;

export function formatRunId(timestampMs: number, entropy: Uint8Array): string {
	if (
		!Number.isInteger(timestampMs) ||
		timestampMs < 0 ||
		timestampMs > MAX_TIME
	) {
		throw new RangeError(
			"Run id timestamp must be an integer from 0 through 2^48 - 1.",
		);
	}
	if (!(entropy instanceof Uint8Array) || entropy.length !== 10) {
		throw new RangeError("Run id entropy must be 10 bytes.");
	}
	let value = BigInt(timestampMs);
	for (const byte of entropy) {
		value = (value << 8n) | BigInt(byte);
	}
	let id = "";
	for (let place = 25; place >= 0; place -= 1) {
		const index = Number((value >> BigInt(place * 5)) & 31n);
		id += ALPHABET.charAt(index);
	}
	return id;
}

export const runId = z.string().regex(/^[0-7][0-9A-HJKMNP-TV-Z]{25}$/);
