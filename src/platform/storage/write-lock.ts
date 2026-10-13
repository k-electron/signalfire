export interface WriteLock {
	exclusive<T>(run: () => Promise<T>): Promise<T>;
}

export function createImmediateWriteLock(): WriteLock {
	return {
		async exclusive(run) {
			return run();
		},
	};
}

export function createWebWriteLock(): WriteLock {
	return {
		exclusive(run) {
			return navigator.locks.request("signalfire-write", () => run());
		},
	};
}
