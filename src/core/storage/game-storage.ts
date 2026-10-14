import { profile } from "../schemas/profile";
import { progress } from "../schemas/progress";
import { runIndex } from "../schemas/run-index";
import { runLog } from "../schemas/run-log";
import { settings } from "../schemas/settings";
import { createDocumentStore, type LocalStore } from "./document-store";
import type { WriteLock } from "./write-lock";

export function createGameStorage(store: LocalStore, lock: WriteLock) {
	return createDocumentStore(
		store,
		lock,
		{
			profile,
			settings,
			progress,
			"run-index": runIndex,
		},
		runLog,
	);
}
