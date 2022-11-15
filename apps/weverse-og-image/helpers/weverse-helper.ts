import puppeteer from 'puppeteer-core';

import { WeverseAccountHelper } from './weverse-account-helper';

export class WeverseHelper {
  static readonly WEVERSE_DOMAIN = 'https://weverse.io';

  static generateUrl(path: string) {
    return new URL(path, WeverseHelper.WEVERSE_DOMAIN).toString();
  }

  constructor(private page: puppeteer.Page) {}

  async login() {
    const page = this.page;

    const loginConfirm = await page.waitForSelector('div#modal');

    await loginConfirm.$$eval(
      'button[class^="ModalButtonView_button"]',
      (buttons) => {
        buttons.forEach((button: HTMLButtonElement) => {
          if (button.textContent === '로그인') {
            button.click();
          }
        });
      }
    );

    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    await WeverseAccountHelper.login(page);
  }
}
