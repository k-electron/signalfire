/** TypedText states, font, and type steps. */
import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import "../theme/app.css";
import { TypedText } from "./typed-text";

const fingers = [
	"l-pinky",
	"l-ring",
	"l-middle",
	"l-index",
	"r-index",
	"r-middle",
	"r-ring",
	"r-pinky",
	"thumb",
] as const;

async function mount(node: ReactNode) {
	const container = document.createElement("div");
	document.body.append(container);
	const root = createRoot(container);
	await act(async () => {
		root.render(node);
	});
	return {
		container,
		async rerender(next: ReactNode) {
			await act(async () => {
				root.render(next);
			});
		},
		unmount() {
			root.unmount();
			container.remove();
		},
	};
}

function used(
	property: "color" | "textShadow" | "outlineColor",
	value: string,
) {
	const probe = document.createElement("span");
	probe.style[property] = value;
	document.body.append(probe);
	const computed = getComputedStyle(probe)[property];
	probe.remove();
	return computed;
}

function fingerVariable(finger: (typeof fingers)[number]) {
	return `--finger-${finger}`;
}

function mix(finger: (typeof fingers)[number]) {
	return `color-mix(in oklch, var(${fingerVariable(finger)}) 40%, transparent)`;
}

test("target and prose steps use the mono face and the type steps", async () => {
	const view = await mount(
		<>
			<TypedText step="target" chars={[{ text: "a", state: "upcoming" }]} />
			<TypedText step="prose" chars={[{ text: "b", state: "upcoming" }]} />
		</>,
	);
	const [target, prose] = [...view.container.querySelectorAll(":scope > span")];
	const targetChar = target?.querySelector("span");
	const proseChar = prose?.querySelector("span");
	expect(targetChar).toBeTruthy();
	expect(proseChar).toBeTruthy();
	if (targetChar == null || proseChar == null) {
		view.unmount();
		return;
	}
	expect(getComputedStyle(targetChar).fontFamily).toContain(
		"Atkinson Hyperlegible Mono",
	);
	expect(getComputedStyle(targetChar).fontSize).toBe("40px");
	expect(getComputedStyle(targetChar).lineHeight).toBe("48px");
	expect(getComputedStyle(proseChar).fontFamily).toContain(
		"Atkinson Hyperlegible Mono",
	);
	expect(getComputedStyle(proseChar).fontSize).toBe("26px");
	expect(getComputedStyle(proseChar).lineHeight).toBe("38px");
	view.unmount();
});

test("an upcoming character is the foreground color at full opacity", async () => {
	const view = await mount(
		<TypedText step="target" chars={[{ text: "a", state: "upcoming" }]} />,
	);
	const character = view.container.querySelector("span span");
	expect(character).toBeTruthy();
	if (character === null) {
		view.unmount();
		return;
	}
	expect(getComputedStyle(character).color).toBe(
		used("color", "var(--foreground)"),
	);
	expect(getComputedStyle(character).opacity).toBe("1");
	view.unmount();
});

test("the active character is white, underlined, and glowing, at the same size", async () => {
	const view = await mount(
		<TypedText
			step="target"
			chars={[
				{ text: "a", state: "upcoming" },
				{ text: "b", state: "active" },
			]}
		/>,
	);
	const upcoming = view.container.querySelector('[data-state="upcoming"]');
	const active = view.container.querySelector('[data-state="active"]');
	expect(upcoming).toBeTruthy();
	expect(active).toBeTruthy();
	if (upcoming === null || active === null) {
		view.unmount();
		return;
	}
	expect(getComputedStyle(active).color).toBe(
		used("color", "var(--text-active)"),
	);
	expect(getComputedStyle(active).textDecorationLine).toContain("underline");
	expect(getComputedStyle(active).fontSize).toBe(
		getComputedStyle(upcoming).fontSize,
	);
	expect(getComputedStyle(active).textShadow).toBe(
		used("textShadow", "var(--glow-sm)"),
	);
	view.unmount();
});

test("each typed character uses its finger color at 40% opacity", async () => {
	const view = await mount(
		<TypedText
			step="target"
			chars={fingers.map((finger) => ({
				text: "x",
				state: "typed" as const,
				finger,
			}))}
		/>,
	);
	const typed = [...view.container.querySelectorAll('[data-state="typed"]')];
	expect(typed).toHaveLength(fingers.length);
	for (const [index, finger] of fingers.entries()) {
		const character = typed[index];
		expect(character).toBeTruthy();
		if (character === undefined) {
			continue;
		}
		expect(getComputedStyle(character).color).toBe(used("color", mix(finger)));
	}
	view.unmount();
});

test("an error character flickers once in the static color, then the caller can mark it active", async () => {
	const view = await mount(
		<TypedText
			step="target"
			chars={[
				{ text: "a", state: "upcoming" },
				{ text: "b", state: "error" },
			]}
		/>,
	);
	const error = view.container.querySelector('[data-state="error"]');
	expect(error).toBeTruthy();
	if (error === null) {
		view.unmount();
		return;
	}
	const style = getComputedStyle(error);
	expect(style.color).toBe(used("color", "var(--static)"));
	expect(["100ms", "0.1s"]).toContain(style.animationDuration);
	expect(style.animationIterationCount).toBe("1");
	expect(error.getAttribute("data-state")).toBe("error");

	await view.rerender(
		<TypedText
			step="target"
			chars={[
				{ text: "a", state: "upcoming" },
				{ text: "b", state: "active" },
			]}
		/>,
	);
	const active = view.container.querySelector('[data-state="active"]');
	expect(active).toBeTruthy();
	if (active === null) {
		view.unmount();
		return;
	}
	expect(getComputedStyle(active).color).toBe(
		used("color", "var(--text-active)"),
	);
	expect(getComputedStyle(active).textDecorationLine).toContain("underline");
	expect(getComputedStyle(active).fontSize).toBe("40px");
	expect(getComputedStyle(active).animationName).toBe("none");
	view.unmount();
});

test("a pre-filled left index character is typed, with a dotted outline", async () => {
	const view = await mount(
		<TypedText
			step="target"
			chars={[{ text: "f", state: "prefilled", finger: "l-index" }]}
		/>,
	);
	const character = view.container.querySelector('[data-state="prefilled"]');
	expect(character).toBeTruthy();
	if (character === null) {
		view.unmount();
		return;
	}
	const style = getComputedStyle(character);
	expect(style.color).toBe(used("color", mix("l-index")));
	expect(style.outlineWidth).toBe("1px");
	expect(style.outlineStyle).toBe("dotted");
	expect(style.outlineColor).toBe(
		used("outlineColor", "var(--finger-l-index)"),
	);
	view.unmount();
});

test("a space stays in the line", async () => {
	const view = await mount(
		<TypedText
			step="target"
			chars={[
				{ text: "f", state: "upcoming" },
				{ text: " ", state: "upcoming" },
				{ text: "j", state: "upcoming" },
			]}
		/>,
	);
	const line = view.container.querySelector(":scope > span");
	expect(line?.textContent).toBe("f j");
	view.unmount();
});
