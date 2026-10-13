import { fc, test } from "@fast-check/vitest";
import { expect } from "vitest";
import { createFixedStepLoop } from "./fixed-step-loop";

const gaps = fc.array(fc.integer({ min: 0, max: 1000 }), { maxLength: 20 });

test.prop([gaps])("integer gaps match the clamped tick total", (list) => {
	const loop = createFixedStepLoop(() => {});
	loop.frame(0);
	let time = 0;
	let ticks = 0;
	for (const gap of list) {
		time += gap;
		loop.frame(time);
		ticks += Math.round(Math.min(gap, 250) * 120);
	}
	expect(loop.clock.step()).toBe(Math.floor(ticks / 1000));
	expect(loop.interpolation()).toBe((ticks % 1000) / 1000);
});
