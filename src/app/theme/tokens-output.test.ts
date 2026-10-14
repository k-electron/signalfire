import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";
import { tokens } from "../../core/theme/tokens";

function easingValue(easing: string | readonly number[]) {
	if (typeof easing === "string") {
		return easing;
	}
	return `cubic-bezier(${easing.join(", ")})`;
}

const css = readFileSync(
	join(dirname(fileURLToPath(import.meta.url)), "tokens.css"),
	"utf8",
);

test("the stylesheet copies the easing", () => {
	expect(css).toContain(
		`--ease-micro: ${easingValue(tokens.motion.micro.easing)};`,
	);
	expect(css).toContain(
		`--ease-scene: ${easingValue(tokens.motion.scene.easing)};`,
	);
});
