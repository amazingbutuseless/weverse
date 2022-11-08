import playwright from 'playwright-core';

export class WeverseAccountHelper {
  static async login(page: playwright.Page) {
    await page.locator('input[name="email"]').fill(process.env.WEVERSE_EMAIL);
    await page.locator('button[type="submit"]').click();

    await page.waitForNavigation({ waitUntil: 'networkidle' });

    const passwordField = await page.locator('input[name="password"]');
    await passwordField.fill(process.env.WEVERSE_PASSWORD);
    await page.locator('button[type="submit"]').click();
  }
}
