import type { DomainEvent } from "./domain-event";

export interface AudioOut {
	publish(events: readonly DomainEvent[]): void;
}
