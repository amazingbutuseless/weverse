import chromium from 'chrome-aws-lambda';
import { NextApiRequest, NextApiResponse } from 'next';
import playwright from 'playwright-core';

async function login(page: playwright.Page, url: string) {
  const loginButton = await page.locator('button:has-text("로그인")');
  await loginButton.click();

  await page.waitForNavigation({ waitUntil: 'networkidle' });

  await page.locator('input[name="email"]').fill(process.env.WEVERSE_EMAIL);
  await page.locator('button[type="submit"]').click();

  await page.waitForNavigation({ waitUntil: 'networkidle' });

  await page
    .locator('input[name="password"]')
    .fill(process.env.WEVERSE_PASSWORD);
  await page.locator('button[type="submit"]').click();

  await page.waitForNavigation({ url, waitUntil: 'networkidle' });
}

async function changeModalToBeScrollable(page: playwright.Page) {
  await page.waitForSelector('div#modal');

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

async function loadAttachedImages(post: playwright.Locator) {
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

export default async function ThumbnailApi(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await chromium.font(
    'https://fonts.gstatic.com/s/notosanskr/v15/Pby6FmXiEBPT4ITbgNA5CgmOsn7uwpY.woff2'
  );
  await chromium.font(
    'https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf'
  );

  const browser = await playwright.chromium.launch({
    args: [...chromium.args, '--lang=ko-KR'],
    executablePath:
      (await chromium.executablePath) ||
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: chromium.headless,
  });

  const page = await browser.newPage({ viewport: { width: 768, height: 403 } });

  const urlParser = new URL(`https://weverse.io${req.url.replace('.png', '')}`);

  await page.goto(urlParser.toString(), {
    timeout: 15 * 1000,
  });

  const loginConfirm = await page.$$('text="로그인하시겠습니까?"');

  if (loginConfirm) {
    await login(page, urlParser.toString());
  }

  const post = await page.locator('div[class^="PostModalView_post_wrap"]');

  await changeModalToBeScrollable(page);
  await loadAttachedImages(post);

  const data = await post.screenshot({ type: 'png', scale: 'device' });

  await browser.close();

  res.setHeader('cache-control', 's-maxage=31536000, stale-while-revalidate');
  res.setHeader('content-type', 'image/png');
  res.end(data);
}
