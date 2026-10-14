export type StorageKey =
	| "profile"
	| "settings"
	| "progress"
	| "run-index"
	| `run:${string}`;

// The document type is the chain createGameStorage passes in. A separate
// overload list is not checked against that object, so this alias is the port.
export type Storage = ReturnType<
	typeof import("../storage/game-storage").createGameStorage
>;
