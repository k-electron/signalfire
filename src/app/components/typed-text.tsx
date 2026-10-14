import type { CSSProperties } from "react";
import "./typed-text.css";

type Finger =
	| "l-pinky"
	| "l-ring"
	| "l-middle"
	| "l-index"
	| "r-index"
	| "r-middle"
	| "r-ring"
	| "r-pinky"
	| "thumb";

type TypedChar =
	| { text: string; state: "upcoming" | "active" | "error" }
	| { text: string; state: "typed" | "prefilled"; finger: Finger };

const fingerVariable = {
	"l-pinky": "--finger-l-pinky",
	"l-ring": "--finger-l-ring",
	"l-middle": "--finger-l-middle",
	"l-index": "--finger-l-index",
	"r-index": "--finger-r-index",
	"r-middle": "--finger-r-middle",
	"r-ring": "--finger-r-ring",
	"r-pinky": "--finger-r-pinky",
	thumb: "--finger-thumb",
} as const satisfies Record<Finger, string>;

function glyphColor(finger: Finger) {
	return `color-mix(in oklch, var(${fingerVariable[finger]}) 40%, transparent)`;
}

function characterClass(char: TypedChar) {
	switch (char.state) {
		case "upcoming":
			return "text-foreground";
		case "active":
			return "text-text-active underline [text-shadow:var(--glow-sm)]";
		case "error":
			return "text-static typed-text-error";
		case "typed":
		case "prefilled":
			return undefined;
	}
}

function characterStyle(char: TypedChar): CSSProperties | undefined {
	if (char.state !== "typed" && char.state !== "prefilled") {
		return undefined;
	}
	const color = glyphColor(char.finger);
	if (char.state === "typed") {
		return { color };
	}
	return {
		color,
		outline: `var(--glass-border-width) dotted var(${fingerVariable[char.finger]})`,
	};
}

export function TypedText({
	chars,
	step,
}: {
	chars: readonly TypedChar[];
	step: "target" | "prose";
}) {
	const typeStep = step === "target" ? "text-type-target" : "text-type-prose";
	return (
		<span className={`whitespace-pre font-mono ${typeStep}`}>
			{chars.map((char, index) => (
				<span
					// biome-ignore lint/suspicious/noArrayIndexKey: the same glyph can repeat
					key={index}
					data-state={char.state}
					className={characterClass(char)}
					style={characterStyle(char)}
				>
					{char.text}
				</span>
			))}
		</span>
	);
}
