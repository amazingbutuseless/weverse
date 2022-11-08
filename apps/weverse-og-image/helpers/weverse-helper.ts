import playwright from 'playwright-core';
import { WeverseAccountHelper } from './weverse-account-helper';

export class WeverseHelper {
  static readonly WEVERSE_DOMAIN = 'https://weverse.io';

  static generateUrl(path: string) {
    return new URL(path, WeverseHelper.WEVERSE_DOMAIN).toString();
  }

  constructor(private page: playwright.Page) {}

  async login() {
    const page = this.page;

    await page.waitForSelector('text="로그인하시겠습니까?"');
    const loginButton = await page.locator('button:has-text("로그인")');
    await loginButton.click();

    await page.waitForNavigation({ waitUntil: 'networkidle' });

    await WeverseAccountHelper.login(page);
  }
}
