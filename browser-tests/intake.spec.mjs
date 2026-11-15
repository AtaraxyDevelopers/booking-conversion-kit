import { test, expect } from "@playwright/test";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
test("Intake form prepares a request without sending it", async ({ page }) => {
  await page.goto(pathToFileURL(resolve("examples/intake.html")).href);
  await page.locator('[name="name"]').fill("Example Buyer");
  await page.locator('[name="email"]').fill("buyer@example.com");
  await page.locator('[name="budget"]').fill("3000");
  await page.locator('[name="time"]').fill("2026-11-20T10:00");
  await page.locator('[name="needs"]').fill("Customer portal");
  await page.getByRole("button", { name: "Prepare request" }).click();
  await expect(page.locator("#draft")).toHaveAttribute(
    "href",
    /mailto:sales%40example.com.*Consultation/,
  );
});
