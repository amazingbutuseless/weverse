import puppeteer from 'puppeteer-core';

import { WeverseHelper } from './weverse-helper';

class WeverseArtistPostScreenshotHelpers {
  static async changeModalToBeScrollable(page: puppeteer.Page) {
    await page.$eval('.ReactModal__Overlay', (modal: HTMLDivElement) => {
      modal.style.position = 'absolute';
      modal.style.bottom = 'auto';
    });
    await page.$eval(
      'div[class^="PostModalView_container"]',
      (container: HTMLDivElement) => (container.style.height = 'auto')
    );
    await page.$eval(
      '.BaseModalViewContent',
      (content: HTMLDivElement) => (content.style.maxHeight = 'max-content')
    );
    await page.$eval('body', (body: HTMLBodyElement) => {
      body.style.overflowY = 'auto';
    });
  }

  static async loadAttachedImages(page: puppeteer.Page) {
    await page.$eval(
      'div[class^="PostModalView_post_wrap"]',
      async (postBody) => {
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
      }
    );
  }
}

export class WeverseArtistPostHelper {
  readonly TIMEOUT = 15 * 1000;

  protected service: WeverseHelper;
  protected postUrl: string;

  constructor(
    protected page: puppeteer.Page,
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

    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await page.waitForSelector('div#modal');
  }

  async screenshot() {
    const page = this.page;

    if (this.fullPage) {
      await WeverseArtistPostScreenshotHelpers.changeModalToBeScrollable(page);
      await WeverseArtistPostScreenshotHelpers.loadAttachedImages(page);
    }

    const postDimension = await page.$eval(
      'div[class^="PostModalView_post_wrap"]',
      (post) => {
        const { x, y, width, height } = post.getBoundingClientRect();
        return JSON.stringify({
          x,
          y: y + window.scrollY,
          width: Math.floor(width),
          height: Math.floor(height),
        });
      }
    );

    return page.screenshot({
      type: 'png',
      clip: JSON.parse(postDimension),
    });
  }
}
