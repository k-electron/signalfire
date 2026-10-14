import { describe, expect, test } from "vitest";
import {
	LANE_FINGERS,
	type NoteDefinition,
	PixiRenderAdapter,
} from "./pixi-render";

describe("PixiRenderAdapter", () => {
	test("creates nine placeholder lanes and hit line", async () => {
		const container = document.createElement("div");
		container.style.width = "900px";
		container.style.height = "600px";
		document.body.appendChild(container);

		const notes: NoteDefinition[] = [
			{ id: 0, character: 102 }, // 'f'
			{ id: 1, character: 106 }, // 'j'
		];

		const adapter = new PixiRenderAdapter({
			width: 900,
			height: 600,
			notes,
		});

		await adapter.init(container);

		expect(adapter.getLanesCount()).toBe(9);
		for (let i = 0; i < 9; i++) {
			expect(adapter.getLaneColor(i)).toBe(LANE_FINGERS[i]?.color);
		}

		// Hit line exists and spans full width
		expect(adapter.getHitLineY()).toBe(480); // 80% of 600px

		// Active note is 'f' in lane 3 (Left Index)
		expect(adapter.getActiveNoteLane()).toBe(3);
		expect(adapter.getActiveNoteCharacter()).toBe(102);
		expect(adapter.isActiveNoteHighlighted()).toBe(true);

		adapter.destroy();
		container.remove();
	});

	test("updates visual state on Hit and Error domain events", async () => {
		const container = document.createElement("div");
		container.style.width = "900px";
		container.style.height = "600px";
		document.body.appendChild(container);

		const notes: NoteDefinition[] = [
			{ id: 0, character: 102 }, // 'f'
			{ id: 1, character: 106 }, // 'j'
		];

		const adapter = new PixiRenderAdapter({
			width: 900,
			height: 600,
			notes,
		});

		await adapter.init(container);

		// Error on active note
		adapter.publish([{ type: "Error", step: 1 }]);
		expect(adapter.getActiveNoteErrorState()).toBe(true);

		// Hit on active note advances to next note
		adapter.publish([{ type: "Hit", step: 2 }]);
		expect(adapter.getActiveNoteCharacter()).toBe(106); // 'j'
		expect(adapter.getActiveNoteLane()).toBe(5); // Right Index
		expect(adapter.getActiveNoteErrorState()).toBe(false);

		adapter.destroy();
		container.remove();
	});

	test("positions space note in center thumb lane", async () => {
		const container = document.createElement("div");
		container.style.width = "900px";
		container.style.height = "600px";
		document.body.appendChild(container);

		const notes: NoteDefinition[] = [{ id: 0, character: 32 }]; // Space

		const adapter = new PixiRenderAdapter({
			width: 900,
			height: 600,
			notes,
		});

		await adapter.init(container);

		expect(adapter.getActiveNoteLane()).toBe(4); // Thumb lane
		expect(adapter.getActiveNoteCharacter()).toBe(32);

		adapter.destroy();
		container.remove();
	});

	test("renders frames without allocating new display objects", async () => {
		const container = document.createElement("div");
		container.style.width = "900px";
		container.style.height = "600px";
		document.body.appendChild(container);

		const notes: NoteDefinition[] = [{ id: 0, character: 102 }];

		const adapter = new PixiRenderAdapter({
			width: 900,
			height: 600,
			notes,
		});

		await adapter.init(container);

		const initialDisplayObjectCount = adapter.getDisplayObjectCount();

		// Run 60 consecutive simulated frames
		for (let f = 0; f < 60; f++) {
			adapter.renderFrame(f / 60);
		}

		expect(adapter.getDisplayObjectCount()).toBe(initialDisplayObjectCount);

		adapter.destroy();
		container.remove();
	});
});
