/** First-run walk from the title to settings and back. */
import { expect, test } from "./fixtures";

test("Keyboard and browser Back", async ({ page }) => {
	await page.goto("/");
	await expect(page.getByRole("heading", { name: "Signalfire" })).toBeVisible();
	await page.keyboard.press("Space");
	await expect(page.getByRole("heading", { name: "Onboarding" })).toBeVisible();
	await page.keyboard.press("Space");
	await expect(page.getByRole("heading", { name: "Hub" })).toBeVisible();
	await page.keyboard.press("5");
	await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
	await page.keyboard.press("Escape");
	await expect(page.getByRole("heading", { name: "Hub" })).toBeVisible();
	await page.keyboard.press("5");
	await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
	await page.goBack();
	await expect(page.getByRole("heading", { name: "Hub" })).toBeVisible();
	await expect(page).toHaveURL(/\/$/);
});
