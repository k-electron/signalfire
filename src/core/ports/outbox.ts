import type { DomainEvent } from "./domain-event";

export interface Outbox {
	emit(event: DomainEvent): void;
	drain(): readonly DomainEvent[];
}

export function createOutbox(): Outbox {
	let pending: DomainEvent[] = [];
	return {
		emit(event) {
			pending.push({ ...event });
		},
		drain() {
			const batch = pending;
			pending = [];
			return batch;
		},
	};
}
