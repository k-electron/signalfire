export type HudSnapshot = {
	readonly score: number;
	readonly combo: number;
	readonly activeCharacter: number | null;
	readonly accuracy: number;
	readonly netWpm: number;
};

export type HudBridgeOptions = {
	readonly onSnapshot: (snapshot: HudSnapshot) => void;
	readonly minIntervalMs?: number;
	readonly now?: () => number;
};

export type HudBridge = {
	update(snapshot: HudSnapshot): void;
	flush(): void;
	destroy(): void;
};

export function createHudBridge(options: HudBridgeOptions): HudBridge {
	const minIntervalMs = options.minIntervalMs ?? 50;
	const now =
		options.now ??
		(() => (typeof performance !== "undefined" ? performance.now() : 0));

	let lastEmittedTime = -Infinity;
	let pendingSnapshot: HudSnapshot | null = null;
	let timer: ReturnType<typeof setTimeout> | null = null;

	function flush(): void {
		if (timer !== null) {
			clearTimeout(timer);
			timer = null;
		}
		if (pendingSnapshot !== null) {
			const snapshot = pendingSnapshot;
			pendingSnapshot = null;
			lastEmittedTime = now();
			options.onSnapshot(snapshot);
		}
	}

	return {
		update(snapshot: HudSnapshot) {
			const currentTime = now();
			if (currentTime - lastEmittedTime >= minIntervalMs) {
				if (timer !== null) {
					clearTimeout(timer);
					timer = null;
				}
				lastEmittedTime = currentTime;
				pendingSnapshot = null;
				options.onSnapshot(snapshot);
			} else {
				pendingSnapshot = snapshot;
				if (timer === null && typeof setTimeout !== "undefined") {
					const delay = Math.max(
						0,
						minIntervalMs - (currentTime - lastEmittedTime),
					);
					timer = setTimeout(flush, delay);
				}
			}
		},
		flush,
		destroy() {
			if (timer !== null) {
				clearTimeout(timer);
				timer = null;
			}
			pendingSnapshot = null;
		},
	};
}
