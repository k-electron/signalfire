function color(hex: string, alpha?: number) {
	const int = Number.parseInt(hex.slice(1), 16);
	if (alpha === undefined) {
		return { hex, int };
	}
	return { hex, int, alpha };
}

function zone(
	id: string,
	name: string,
	background: string,
	accent: string,
	accent2?: string,
) {
	return {
		id,
		name,
		background: color(background),
		accent: color(accent),
		accent2: accent2 === undefined ? undefined : color(accent2),
	};
}

export const tokens = {
	color: {
		background: color("#0B1026"),
		foreground: color("#E6EAF5"),
		card: color("#121A3A", 0.72),
		cardForeground: color("#E6EAF5"),
		muted: color("#1A2347"),
		mutedForeground: color("#8B95B8"),
		border: color("#2A3566"),
		primary: color("#FCD34D"),
		primaryForeground: color("#1A1405"),
		destructive: color("#F43F5E"),
		accent: { source: "zone" },
		ring: { source: "zone" },
	},
	radiusPx: 14,
	finger: {
		lPinky: color("#8B5CF6"),
		lRing: color("#3B82F6"),
		lMiddle: color("#22D3EE"),
		lIndex: color("#2DD4BF"),
		rIndex: color("#FACC15"),
		rMiddle: color("#FB923C"),
		rRing: color("#FB7185"),
		rPinky: color("#E879F9"),
		thumb: color("#E2E8F0"),
	},
	meaning: {
		textActive: { ...color("#FFFFFF"), glow: "sm" },
		beacon: color("#FCD34D"),
		shield: color("#A5D8FF"),
		static: color("#9CA3AF"),
	},
	zone: [
		zone("0", "Home Row Station", "#1E1B4B", "#F5C46B"),
		zone("1", "The Drift", "#0B1A33", "#7DD3FC"),
		zone("2", "Ember Reach", "#2A1030", "#FB923C"),
		zone("3", "The High Spires", "#062A30", "#BAE6FD"),
		zone("4", "The Undertow", "#04202A", "#5EEAD4"),
		zone("5", "Twin Suns", "#1F0F3D", "#FBBF24", "#FB7185"),
		zone("6", "The Riverlight", "#0A1E4A", "#22D3EE"),
		zone("7", "The Counting Stars", "#0B1533", "#D4A373"),
		zone("8", "The Glyph Wastes", "#2A1A0E", "#F59E0B"),
		zone("9", "The Silent Core", "#1F2124", "#9CA3AF"),
	],
	font: {
		mono: "Atkinson Hyperlegible Mono",
		display: "Space Grotesk",
		ui: "Inter",
	},
	type: {
		target: { family: "mono", sizePx: 40, lineHeightPx: 48 },
		prose: { family: "mono", sizePx: 26, lineHeightPx: 38 },
		displayXl: { family: "display", sizePx: 64, lineHeightPx: 68 },
		displayLg: { family: "display", sizePx: 40, lineHeightPx: 44 },
		displayMd: { family: "display", sizePx: 28, lineHeightPx: 32 },
		uiLg: { family: "ui", sizePx: 18, lineHeightPx: 26 },
		uiMd: { family: "ui", sizePx: 15, lineHeightPx: 22 },
		uiSm: { family: "ui", sizePx: 13, lineHeightPx: 18 },
	},
	surface: {
		glass: {
			background: "card",
			blurPx: 16,
			borderPx: 1,
			borderAlpha: 0.6,
		},
		glowSm: { x: 0, y: 0, blurPx: 8, alpha: 0.4 },
		glowMd: { x: 0, y: 0, blurPx: 18, alpha: 0.45 },
		glowLg: { x: 0, y: 0, blurPx: 36, alpha: 0.5 },
		focus: { ringPx: 2, glow: "sm" },
	},
	motion: {
		micro: { durationMs: 100, easing: "ease-out" },
		standard: { durationMs: 240, stiffness: 380, damping: 30 },
		scene: { durationMs: 650, easing: [0.87, 0, 0.13, 1] },
		celebrate: { minMs: 1200, maxMs: 2000 },
	},
	layer: {
		canvas: 0,
		hud: 10,
		overlay: 20,
		modal: 30,
		toast: 40,
	},
	icon: {
		strokeWidth: 1.75,
		sizesPx: [16, 20, 24],
	},
};
