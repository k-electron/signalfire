import type { DomainEvent } from "../ports/domain-event";

export function scoreEvents(events: readonly DomainEvent[]): number {
	let score = 0;
	let finished = false;
	for (const event of events) {
		if (event.type === "Hit") {
			score += 10;
		} else if (event.type === "LevelEnded" && !finished) {
			score += 250;
			finished = true;
		}
	}
	return score;
}
