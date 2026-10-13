import { expect, test } from "vitest";
import { tokens } from "./tokens";

type HexColor = { hex: string; int: number; alpha?: number };

function expectColor(color: HexColor, hex: string, alpha?: number) {
	expect(color.hex).toBe(hex);
	expect(color.int).toBe(Number.parseInt(hex.slice(1), 16));
	if (alpha === undefined) {
		expect(color.alpha).toBeUndefined();
	} else {
		expect(color.alpha).toBe(alpha);
	}
}

test("semantic colors", () => {
	expectColor(tokens.color.background, "#0B1026");
	expect(tokens.color.background.int).toBe(0x0b1026);
	expectColor(tokens.color.foreground, "#E6EAF5");
	expectColor(tokens.color.card, "#121A3A", 0.72);
	expectColor(tokens.color.cardForeground, "#E6EAF5");
	expectColor(tokens.color.muted, "#1A2347");
	expectColor(tokens.color.mutedForeground, "#8B95B8");
	expectColor(tokens.color.border, "#2A3566");
	expectColor(tokens.color.primary, "#FCD34D");
	expectColor(tokens.color.primaryForeground, "#1A1405");
	expectColor(tokens.color.destructive, "#F43F5E");
	expect(tokens.color.accent).toEqual({ source: "zone" });
	expect(tokens.color.ring).toEqual({ source: "zone" });
	expect(tokens.radiusPx).toBe(14);
});

test("finger colors", () => {
	expectColor(tokens.finger.lPinky, "#8B5CF6");
	expectColor(tokens.finger.lRing, "#3B82F6");
	expectColor(tokens.finger.lMiddle, "#22D3EE");
	expectColor(tokens.finger.lIndex, "#2DD4BF");
	expectColor(tokens.finger.rIndex, "#FACC15");
	expectColor(tokens.finger.rMiddle, "#FB923C");
	expectColor(tokens.finger.rRing, "#FB7185");
	expectColor(tokens.finger.rPinky, "#E879F9");
	expectColor(tokens.finger.thumb, "#E2E8F0");
});

test("meaning colors", () => {
	expectColor(tokens.meaning.textActive, "#FFFFFF");
	expect(tokens.meaning.textActive.glow).toBe("sm");
	expectColor(tokens.meaning.beacon, "#FCD34D");
	expectColor(tokens.meaning.shield, "#A5D8FF");
	expectColor(tokens.meaning.static, "#9CA3AF");
});

test("zone colors", () => {
	expect(tokens.zone.map((zone) => zone.name)).toEqual([
		"Home Row Station",
		"The Drift",
		"Ember Reach",
		"The High Spires",
		"The Undertow",
		"Twin Suns",
		"The Riverlight",
		"The Counting Stars",
		"The Glyph Wastes",
		"The Silent Core",
	]);
	const pairs: readonly (readonly [string, string, string?])[] = [
		["#1E1B4B", "#F5C46B"],
		["#0B1A33", "#7DD3FC"],
		["#2A1030", "#FB923C"],
		["#062A30", "#BAE6FD"],
		["#04202A", "#5EEAD4"],
		["#1F0F3D", "#FBBF24", "#FB7185"],
		["#0A1E4A", "#22D3EE"],
		["#0B1533", "#D4A373"],
		["#2A1A0E", "#F59E0B"],
		["#1F2124", "#9CA3AF"],
	];
	expect(tokens.zone).toHaveLength(pairs.length);
	for (const [index, zone] of tokens.zone.entries()) {
		const pair = pairs[index];
		expect(pair).toBeDefined();
		if (pair === undefined) {
			continue;
		}
		const [background, accent, accent2] = pair;
		expect(zone.id).toBe(String(index));
		expectColor(zone.background, background);
		expectColor(zone.accent, accent);
		if (accent2 === undefined) {
			expect(zone.accent2).toBeUndefined();
		} else {
			expect(zone.accent2).toBeDefined();
			if (zone.accent2 !== undefined) {
				expectColor(zone.accent2, accent2);
			}
		}
	}
});

test("type scale", () => {
	expect(tokens.font).toEqual({
		mono: "Atkinson Hyperlegible Mono",
		display: "Space Grotesk",
		ui: "Inter",
	});
	expect(tokens.type.target).toEqual({
		family: "mono",
		sizePx: 40,
		lineHeightPx: 48,
	});
	expect(tokens.type.prose).toEqual({
		family: "mono",
		sizePx: 26,
		lineHeightPx: 38,
	});
	expect(tokens.type.displayXl).toEqual({
		family: "display",
		sizePx: 64,
		lineHeightPx: 68,
	});
	expect(tokens.type.displayLg).toEqual({
		family: "display",
		sizePx: 40,
		lineHeightPx: 44,
	});
	expect(tokens.type.displayMd).toEqual({
		family: "display",
		sizePx: 28,
		lineHeightPx: 32,
	});
	expect(tokens.type.uiLg).toEqual({
		family: "ui",
		sizePx: 18,
		lineHeightPx: 26,
	});
	expect(tokens.type.uiMd).toEqual({
		family: "ui",
		sizePx: 15,
		lineHeightPx: 22,
	});
	expect(tokens.type.uiSm).toEqual({
		family: "ui",
		sizePx: 13,
		lineHeightPx: 18,
	});
});

test("surfaces", () => {
	expect(tokens.surface.glass).toEqual({
		background: "card",
		blurPx: 16,
		borderPx: 1,
		borderAlpha: 0.6,
	});
	expect(tokens.surface.glowSm).toEqual({
		x: 0,
		y: 0,
		blurPx: 8,
		alpha: 0.4,
	});
	expect(tokens.surface.glowMd).toEqual({
		x: 0,
		y: 0,
		blurPx: 18,
		alpha: 0.45,
	});
	expect(tokens.surface.glowLg).toEqual({
		x: 0,
		y: 0,
		blurPx: 36,
		alpha: 0.5,
	});
	expect(tokens.surface.focus).toEqual({ ringPx: 2, glow: "sm" });
});

test("motion", () => {
	expect(tokens.motion.micro).toEqual({ durationMs: 100, easing: "ease-out" });
	expect(tokens.motion.standard).toEqual({
		durationMs: 240,
		stiffness: 380,
		damping: 30,
	});
	expect(tokens.motion.scene).toEqual({
		durationMs: 650,
		easing: "ease-in-out-expo",
	});
	expect(tokens.motion.celebrate).toEqual({ minMs: 1200, maxMs: 2000 });
});

test("stacking layers", () => {
	expect(tokens.layer).toEqual({
		canvas: 0,
		hud: 10,
		overlay: 20,
		modal: 30,
		toast: 40,
	});
});

test("icon metrics", () => {
	expect(tokens.icon).toEqual({ strokeWidth: 1.75, sizesPx: [16, 20, 24] });
});
