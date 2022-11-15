import puppeteer from 'puppeteer-core';

export class WeverseAccountHelper {
  static async login(page: puppeteer.Page) {
    const emailField = await page.$('input[name="email"]');
    await emailField.type(process.env.WEVERSE_EMAIL);
    await emailField.press('Enter');

    await page.waitForSelector('input[name="password"]');

    await page.click('input[name="password"]');
    await page.keyboard.type(process.env.WEVERSE_PASSWORD);
    await page.keyboard.press('Enter');
  }
}
