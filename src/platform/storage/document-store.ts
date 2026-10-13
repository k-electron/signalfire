import type { ParseResult } from "../../core/schemas/parse";
import type { WriteLock } from "./write-lock";

export type Change =
	| { readonly type: "set"; readonly key: string; readonly value: unknown }
	| { readonly type: "delete"; readonly key: string };

export interface LocalStore {
	get(key: string): Promise<unknown>;
	apply(changes: readonly Change[]): Promise<void>;
}

export interface DocumentChain<T> {
	parse(data: unknown): ParseResult<T>;
}

export type LoadResult<T> =
	| { readonly status: "absent" }
	| {
			readonly status: "ok";
			readonly migrated: boolean;
			readonly restored: boolean;
			readonly document: T;
	  }
	| { readonly status: "newer"; readonly version: number }
	| { readonly status: "invalid" };

export type SaveResult =
	| { readonly status: "saved" }
	| { readonly status: "invalid" }
	| { readonly status: "newer"; readonly version: number };

export function createDocumentStore(store: LocalStore, lock: WriteLock) {
	return {
		async load<T>(
			key: string,
			chain: DocumentChain<T>,
		): Promise<LoadResult<T>> {
			assertKey(key);
			return lock.exclusive(() => loadDocument(store, key, chain));
		},
		async save<T>(
			key: string,
			chain: DocumentChain<T>,
			value: unknown,
		): Promise<SaveResult> {
			assertKey(key);
			return lock.exclusive(() => saveDocument(store, key, chain, value));
		},
	};
}

async function loadDocument<T>(
	store: LocalStore,
	key: string,
	chain: DocumentChain<T>,
): Promise<LoadResult<T>> {
	const live = await store.get(key);
	if (live === undefined) {
		return { status: "absent" };
	}
	const parsed = chain.parse(live);
	if (parsed.status === "newer") {
		return { status: "newer", version: parsed.version };
	}
	if (parsed.status === "ok" && !parsed.migrated) {
		return {
			status: "ok",
			migrated: false,
			restored: false,
			document: parsed.document,
		};
	}
	if (parsed.status === "ok") {
		await backupBeforeMigration(store, key, live);
		return {
			status: "ok",
			migrated: true,
			restored: false,
			document: parsed.document,
		};
	}
	return quarantine(store, key, chain, live);
}

async function saveDocument<T>(
	store: LocalStore,
	key: string,
	chain: DocumentChain<T>,
	value: unknown,
): Promise<SaveResult> {
	const live = await store.get(key);
	if (live !== undefined) {
		const stored = chain.parse(live);
		if (stored.status === "newer") {
			return { status: "newer", version: stored.version };
		}
	}
	const candidate = chain.parse(value);
	if (candidate.status !== "ok" || candidate.migrated) {
		return { status: "invalid" };
	}
	const changes: Change[] = [];
	if (live !== undefined) {
		const backup0 = await store.get(backupKey(key, 0));
		if (!sameValue(live, backup0)) {
			const backup1 = await store.get(backupKey(key, 1));
			changes.push(...rotate(key, live, backup0, backup1));
		}
	}
	changes.push({ type: "set", key, value: candidate.document });
	await store.apply(changes);
	return { status: "saved" };
}

async function backupBeforeMigration(
	store: LocalStore,
	key: string,
	live: unknown,
): Promise<void> {
	const backup0 = await store.get(backupKey(key, 0));
	if (sameValue(backup0, live)) {
		return;
	}
	const backup1 = await store.get(backupKey(key, 1));
	await store.apply(rotate(key, live, backup0, backup1));
}

async function quarantine<T>(
	store: LocalStore,
	key: string,
	chain: DocumentChain<T>,
	live: unknown,
): Promise<LoadResult<T>> {
	const backups = [
		await store.get(backupKey(key, 0)),
		await store.get(backupKey(key, 1)),
		await store.get(backupKey(key, 2)),
	];
	const changes: Change[] = [
		{ type: "set", key: quarantineKey(key), value: live },
	];
	for (const backup of backups) {
		if (backup === undefined) {
			continue;
		}
		const parsed = chain.parse(backup);
		if (parsed.status !== "ok") {
			continue;
		}
		changes.push({ type: "set", key, value: backup });
		await store.apply(changes);
		return {
			status: "ok",
			migrated: parsed.migrated,
			restored: true,
			document: parsed.document,
		};
	}
	changes.push({ type: "delete", key });
	await store.apply(changes);
	return { status: "invalid" };
}

function rotate(
	key: string,
	previous: unknown,
	backup0: unknown,
	backup1: unknown,
): Change[] {
	const next = [previous, backup0, backup1];
	return [0, 1, 2].map((slot) => {
		const value = next[slot];
		const slotKey = backupKey(key, slot as 0 | 1 | 2);
		if (value === undefined) {
			return { type: "delete", key: slotKey };
		}
		return { type: "set", key: slotKey, value };
	});
}

function backupKey(key: string, slot: 0 | 1 | 2): string {
	return `backup:${key}:${slot}`;
}

function quarantineKey(key: string): string {
	return `quarantine:${key}`;
}

function assertKey(key: string): void {
	if (
		key.length === 0 ||
		key.startsWith("backup:") ||
		key.startsWith("quarantine:")
	) {
		throw new RangeError(
			"The document key must not be empty or use the backup or quarantine prefix.",
		);
	}
}

function sameValue(left: unknown, right: unknown): boolean {
	if (Object.is(left, right)) {
		return true;
	}
	if (Array.isArray(left) && Array.isArray(right)) {
		return (
			left.length === right.length &&
			left.every((item, index) => sameValue(item, right[index]))
		);
	}
	if (isRecord(left) && isRecord(right)) {
		const leftKeys = Object.keys(left);
		const rightKeys = Object.keys(right);
		return (
			leftKeys.length === rightKeys.length &&
			leftKeys.every((key) => sameValue(left[key], right[key]))
		);
	}
	return false;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
