import type { LoadResult, SaveResult } from "../storage/document-store";

export type StorageKey =
	| "profile"
	| "settings"
	| "progress"
	| "run-index"
	| `run:${string}`;

export interface Storage {
	load(key: StorageKey): Promise<LoadResult<unknown>>;
	save(key: StorageKey, value: unknown): Promise<SaveResult>;
}
