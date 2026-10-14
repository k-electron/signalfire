import { expect, test } from "vitest";
import type { DomainEvent } from "../ports/domain-event";
import { scoreEvents } from "./score";

function event(type: DomainEvent["type"]): DomainEvent {
	return { type, step: 0 };
}

const hit = event("Hit");
const error = event("Error");
const ended = event("LevelEnded");
const word = event("WordComplete");

test("three hits and a finish", () => {
	expect(scoreEvents([hit, hit, hit, ended])).toBe(280);
});

test("ten hits stay at 10 points each", () => {
	expect(scoreEvents([...Array.from({ length: 10 }, () => hit), ended])).toBe(
		350,
	);
});

test("an error adds nothing", () => {
	expect(scoreEvents([hit, error, ended])).toBe(260);
});

test("finishing with no hits scores 250", () => {
	expect(scoreEvents([ended])).toBe(250);
});

test("an unfinished hit scores 10", () => {
	expect(scoreEvents([hit])).toBe(10);
});

test("a second finish adds nothing", () => {
	expect(scoreEvents([ended, ended])).toBe(250);
});

test("a completed word adds nothing", () => {
	expect(scoreEvents([word, ended])).toBe(250);
});
