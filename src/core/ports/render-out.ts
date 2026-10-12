import type { DomainEvent } from "./domain-event";

export interface RenderOut {
	publish(events: readonly DomainEvent[]): void;
}
