/** Typed-text font loads from this origin, with the font notice served beside it. */
import { expect, test } from "./fixtures";

test("the typed-text font loads from the page origin", async ({ page }) => {
	const fontUrls: string[] = [];
	page.on("request", (request) => {
		const url = request.url();
		if (url.includes(".woff")) {
			fontUrls.push(url);
		}
	});

	await page.goto("/");
	const origin = new URL(page.url()).origin;
	await page.evaluate(async () => {
		await document.fonts.load('40px "Atkinson Hyperlegible Mono"');
		await document.fonts.ready;
	});
	const loaded = await page.evaluate(() =>
		document.fonts.check('40px "Atkinson Hyperlegible Mono"'),
	);

	expect(fontUrls.length).toBeGreaterThan(0);
	for (const url of fontUrls) {
		expect(new URL(url).origin).toBe(origin);
	}
	expect(loaded).toBe(true);

	const notices = await page.request.get("/THIRD_PARTY_NOTICES.md");
	expect(notices.ok()).toBe(true);
	const body = await notices.text();
	expect(body).toContain(
		"This Font Software is licensed under the SIL Open Font License, Version 1.1.",
	);
	expect(body).toContain(
		"Copyright 2020-2024 The Atkinson Hyperlegible Mono Project Authors",
	);
});
