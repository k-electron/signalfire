/** Theme colors on the production page. */
import { converter } from "culori";
import { expect, test } from "./fixtures";

const toRgb = converter("rgb");

function srgb(value: string) {
	const rgb = toRgb(value);
	if (rgb === undefined) {
		throw new Error(`Unparsed color ${value}`);
	}
	const red = Math.round(rgb.r * 255);
	const green = Math.round(rgb.g * 255);
	const blue = Math.round(rgb.b * 255);
	return `rgb(${red}, ${green}, ${blue})`;
}

test("theme: the page uses the background and foreground tokens", async ({
	page,
}) => {
	await page.goto("/");
	const read = (property: "backgroundColor" | "color") =>
		page.evaluate(
			(name) => getComputedStyle(document.documentElement)[name],
			property,
		);
	expect(srgb(await read("backgroundColor"))).toBe("rgb(11, 16, 38)");
	expect(srgb(await read("color"))).toBe("rgb(230, 234, 245)");
	await expect(page.getByRole("heading", { name: "Signalfire" })).toBeVisible();

	const accent = () =>
		page.evaluate(() =>
			getComputedStyle(document.documentElement)
				.getPropertyValue("--zone-accent")
				.trim(),
		);
	const accent2 = () =>
		page.evaluate(() =>
			getComputedStyle(document.documentElement)
				.getPropertyValue("--zone-accent-2")
				.trim(),
		);

	const zone0Accent = await accent();
	const zone0Accent2 = await accent2();
	await page.evaluate(() => {
		document.documentElement.dataset.zone = "5";
	});
	const zone5Accent = await accent();
	const zone5Accent2 = await accent2();

	expect(zone0Accent).not.toBe(zone5Accent);
	expect(zone0Accent2).toBe("");
	expect(zone5Accent2).not.toBe("");
});
