import { test, expect } from "@playwright/test";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { mkdtempSync, readFileSync, writeFileSync, unlinkSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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

test('Documented recipient customization survives sharing both example files',async({page})=>{
  const dir=mkdtempSync(join(tmpdir(),'intake-doc-'));
  try{
    writeFileSync(join(dir,'intake.html'),readFileSync('examples/intake.html'));
    writeFileSync(join(dir,'intake.js'),readFileSync('examples/intake.js','utf8').replace('const BUSINESS_EMAIL = "sales@example.com"','const BUSINESS_EMAIL = "bookings@example.org"'));
    await page.goto(pathToFileURL(join(dir,'intake.html')).href);
    await expect(page.locator('#recipient')).toHaveText('bookings@example.org');
    for(const[key,value]of Object.entries({name:'Example buyer',email:'buyer@example.com',budget:'3000',time:'2026-11-20T10:00',needs:'Customer portal'}))await page.locator('[name="'+key+'"]').fill(value);
    await page.getByRole('button',{name:'Prepare request'}).click();
    await expect(page.locator('#draft')).toHaveAttribute('href',/mailto:bookings%40example.org/);
  }finally{await page.goto('about:blank');unlinkSync(join(dir,'intake.html'));unlinkSync(join(dir,'intake.js'));rmdirSync(dir);}
});
