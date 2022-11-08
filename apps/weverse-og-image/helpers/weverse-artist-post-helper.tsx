import playwright from 'playwright-core';

import { WeverseHelper } from './weverse-helper';

class WeverseArtistPostScreenshotHelpers {
  static async changeModalToBeScrollable(page: playwright.Page) {
    await page.locator('.ReactModal__Overlay').evaluate((modal) => {
      modal.style.position = 'absolute';
      modal.style.bottom = 'auto';
    });
    await page
      .locator('div[class^="PostModalView_container"]')
      .evaluate((container) => (container.style.height = 'auto'));
    await page
      .locator('.BaseModalViewContent')
      .evaluate((content) => (content.style.maxHeight = 'max-content'));
    await page.locator('body').evaluate((body) => {
      body.style.overflowY = 'auto';
    });
  }

  static async loadAttachedImages(post: playwright.Locator) {
    await post.evaluate(async (postBody) => {
      const delay = (ms: number) => {
        return new Promise((resolve) => setTimeout(resolve, ms));
      };
      for (let i = 0; i < postBody.scrollHeight; i += 100) {
        window.scrollTo(0, i);
        await delay(100);
      }
      const images = postBody.getElementsByTagName('img');
      if (!images) return;
      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return;
          return new Promise((resolve, reject) => {
            img.addEventListener('load', resolve);
            img.addEventListener('error', reject);
          });
        })
      );
    });
  }
}

export class WeverseArtistPostHelper {
  readonly TIMEOUT = 15 * 1000;

  protected service: WeverseHelper;
  protected postUrl: string;

  constructor(
    protected page: playwright.Page,
    private fullPage: boolean = false
  ) {
    this.service = new WeverseHelper(page);
  }

  async open(postPath: string) {
    const page = this.page;

    const postUrl = WeverseHelper.generateUrl(postPath);

    await page.goto(postUrl, {
      timeout: this.TIMEOUT,
    });

    await this.service.login();

    await page.waitForNavigation({ url: postUrl, waitUntil: 'networkidle' });
    await page.waitForSelector('div#modal');
  }

  async screenshot() {
    const page = this.page;

    const post = await page.locator('div[class^="PostModalView_post_wrap"]');

    if (this.fullPage) {
      await WeverseArtistPostScreenshotHelpers.changeModalToBeScrollable(page);
      await WeverseArtistPostScreenshotHelpers.loadAttachedImages(post);
    }

    return post.screenshot({ type: 'png', scale: 'device' });
  }
}
