import type { z } from "zod";
// Node loads this file from tools/content/check.mjs, which requires the .ts extension.
import { levelSchema } from "../schemas/content/level.ts";
import { tuningSchema } from "../schemas/content/tuning.ts";
import { zoneSchema } from "../schemas/content/zone.ts";
import { digestCanonical } from "./canonical.ts";

export type Zone = z.infer<typeof zoneSchema>;
export type Level = z.infer<typeof levelSchema>;
export type Tuning = z.infer<typeof tuningSchema>;

export type ContentFile = {
	readonly path: string;
	readonly value: unknown;
};

export type ContentError = {
	readonly path: string;
	readonly message: string;
};

export type LoadedLevel = Level & { readonly contentVersion: string };

export type LoadedContent = {
	readonly zones: Readonly<Record<string, Zone>>;
	readonly levels: Readonly<Record<string, LoadedLevel>>;
	readonly tuning: Readonly<Record<string, Tuning>>;
};

export type LoadResult =
	| { readonly ok: true; readonly content: LoadedContent }
	| { readonly ok: false; readonly errors: readonly ContentError[] };

function sorted(keys: readonly string[]): string[] {
	return [...keys].sort();
}

export function acceptZone(value: unknown): Zone {
	return zoneSchema.parse(value);
}

export function acceptLevel(value: unknown): Level {
	const level = levelSchema.parse(value);
	return {
		...level,
		allowedKeys: sorted(level.allowedKeys),
		focusKeys: sorted(level.focusKeys),
	};
}

export function acceptTuning(value: unknown): Tuning {
	return tuningSchema.parse(value);
}

export function contentVersionOf(
	level: Level,
	starBars: Zone["starBars"] | null,
	tuning: Tuning,
): string {
	return digestCanonical({
		level,
		starBars: starBars ?? null,
		tuning,
	});
}

function fileName(path: string): string {
	const parts = path.split(/[/\\]/);
	return parts[parts.length - 1] ?? path;
}

function directory(path: string): string | undefined {
	const parts = path.split(/[/\\]/);
	return parts.length >= 2 ? parts[parts.length - 2] : undefined;
}

function issueMessage(error: z.ZodError): string {
	return error.issues.map((issue) => issue.message).join("; ");
}

function matchesZoneFile(name: string, id: string): boolean {
	const match = /^(\d+)-[a-z0-9]+(?:-[a-z0-9]+)*\.json$/.exec(name);
	return match?.[1] !== undefined && id === `zone:${match[1]}`;
}

function matchesLevelFile(name: string, id: string): boolean {
	const match = /^(\d+)-(\d+)-[a-z0-9]+(?:-[a-z0-9]+)*\.json$/.exec(name);
	return (
		match?.[1] !== undefined &&
		match[2] !== undefined &&
		id === `level:${match[1]}.${match[2]}`
	);
}

function matchesTuningFile(name: string, id: string): boolean {
	const match = /^([a-z0-9]+(?:-[a-z0-9]+)*)\.json$/.exec(name);
	return match?.[1] !== undefined && id === `tuning:${match[1]}`;
}

export function loadBundledContent(files: readonly ContentFile[]): LoadResult {
	const errors: ContentError[] = [];
	const zones = new Map<string, { zone: Zone; path: string }>();
	const levels = new Map<string, { level: Level; path: string }>();
	const tuning = new Map<string, { value: Tuning; path: string }>();

	for (const file of files) {
		if (!file.path.endsWith(".json")) {
			continue;
		}
		const name = fileName(file.path);
		const folder = directory(file.path);
		if (folder === "zones") {
			const parsed = zoneSchema.safeParse(file.value);
			if (!parsed.success) {
				errors.push({ path: file.path, message: issueMessage(parsed.error) });
				continue;
			}
			if (!matchesZoneFile(name, parsed.data.id)) {
				errors.push({
					path: file.path,
					message: `file name does not carry ${parsed.data.id}`,
				});
				continue;
			}
			if (zones.has(parsed.data.id)) {
				errors.push({
					path: file.path,
					message: `duplicate id ${parsed.data.id}`,
				});
				continue;
			}
			zones.set(parsed.data.id, { zone: parsed.data, path: file.path });
			continue;
		}
		if (folder === "levels") {
			const parsed = levelSchema.safeParse(file.value);
			if (!parsed.success) {
				errors.push({ path: file.path, message: issueMessage(parsed.error) });
				continue;
			}
			const level = {
				...parsed.data,
				allowedKeys: sorted(parsed.data.allowedKeys),
				focusKeys: sorted(parsed.data.focusKeys),
			};
			if (!matchesLevelFile(name, level.id)) {
				errors.push({
					path: file.path,
					message: `file name does not carry ${level.id}`,
				});
				continue;
			}
			if (levels.has(level.id)) {
				errors.push({ path: file.path, message: `duplicate id ${level.id}` });
				continue;
			}
			levels.set(level.id, { level, path: file.path });
			continue;
		}
		if (folder === "tuning") {
			const parsed = tuningSchema.safeParse(file.value);
			if (!parsed.success) {
				errors.push({ path: file.path, message: issueMessage(parsed.error) });
				continue;
			}
			if (!matchesTuningFile(name, parsed.data.id)) {
				errors.push({
					path: file.path,
					message: `file name does not carry ${parsed.data.id}`,
				});
				continue;
			}
			if (tuning.has(parsed.data.id)) {
				errors.push({
					path: file.path,
					message: `duplicate id ${parsed.data.id}`,
				});
				continue;
			}
			tuning.set(parsed.data.id, { value: parsed.data, path: file.path });
			continue;
		}
		errors.push({
			path: file.path,
			message: "content file is outside zones, levels, and tuning",
		});
	}

	for (const { zone, path } of zones.values()) {
		if (zone.id === "zone:0" && zone.starBars !== undefined) {
			errors.push({ path, message: "zone:0 includes star bars" });
		}
		if (zone.id !== "zone:0" && zone.starBars === undefined) {
			errors.push({ path, message: `${zone.id} omits star bars` });
		}
	}

	for (const { level, path } of levels.values()) {
		const zone = zones.get(level.zoneId);
		if (zone === undefined) {
			errors.push({ path, message: `missing ${level.zoneId}` });
		} else {
			for (const key of level.allowedKeys) {
				if (!zone.zone.keys.includes(key)) {
					errors.push({
						path,
						message: `allowed key is outside ${level.zoneId}`,
					});
				}
			}
		}
		if (!tuning.has(level.tuningId)) {
			errors.push({ path, message: `missing ${level.tuningId}` });
		}
	}

	if (errors.length > 0) {
		return { ok: false, errors };
	}

	const loadedZones: Record<string, Zone> = {};
	for (const { zone } of zones.values()) {
		loadedZones[zone.id] = zone;
	}
	const loadedTuning: Record<string, Tuning> = {};
	for (const { value } of tuning.values()) {
		loadedTuning[value.id] = value;
	}
	const loadedLevels: Record<string, LoadedLevel> = {};
	for (const { level } of levels.values()) {
		const zone = zones.get(level.zoneId);
		const lanes = tuning.get(level.tuningId);
		if (zone === undefined || lanes === undefined) {
			return {
				ok: false,
				errors: [{ path: level.id, message: "missing content" }],
			};
		}
		loadedLevels[level.id] = {
			...level,
			contentVersion: contentVersionOf(
				level,
				zone.zone.starBars ?? null,
				lanes.value,
			),
		};
	}

	return {
		ok: true,
		content: {
			zones: loadedZones,
			levels: loadedLevels,
			tuning: loadedTuning,
		},
	};
}
