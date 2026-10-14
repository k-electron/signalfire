export class LockBusyError extends Error {
	constructor() {
		super("The write lock was not granted in time.");
		this.name = "LockBusyError";
	}
}

export interface WriteLock {
	exclusive<T>(run: () => Promise<T>): Promise<T>;
}
