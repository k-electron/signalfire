import type { ZodType } from "zod";

export type ParseResult<T> =
	| { readonly status: "ok"; readonly migrated: boolean; readonly document: T }
	| { readonly status: "newer"; readonly version: number }
	| { readonly status: "invalid" };

type DocumentVersion =
	| { readonly initial: true; readonly schema: ZodType }
	| {
			readonly initial: false;
			readonly schema: ZodType;
			readonly up: (previous: unknown) => unknown;
	  };

export function defineDocument<T>(definition: {
	readonly latest: number;
	readonly versions: Readonly<Record<number, DocumentVersion>>;
}): { parse: (data: unknown) => ParseResult<T> } {
	const { latest, versions } = definition;
	return {
		parse(data: unknown): ParseResult<T> {
			const version = versionOf(data);
			if (version === null || version < 1) {
				return { status: "invalid" };
			}
			if (version > latest) {
				return { status: "newer", version };
			}
			const start = versions[version];
			if (start === undefined) {
				return { status: "invalid" };
			}
			const parsed = start.schema.safeParse(data);
			if (!parsed.success) {
				return { status: "invalid" };
			}
			let value: unknown = parsed.data;
			let migrated = false;
			for (let step = version + 1; step <= latest; step += 1) {
				const next = versions[step];
				if (next === undefined || next.initial) {
					return { status: "invalid" };
				}
				const upgraded = next.schema.safeParse(next.up(value));
				if (!upgraded.success) {
					return { status: "invalid" };
				}
				value = upgraded.data;
				migrated = true;
			}
			return { status: "ok", migrated, document: value as T };
		},
	};
}

function versionOf(data: unknown): number | null {
	if (typeof data !== "object" || data === null || !("v" in data)) {
		return null;
	}
	const version = data.v;
	if (typeof version !== "number" || !Number.isInteger(version)) {
		return null;
	}
	return version;
}
