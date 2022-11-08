import chromium from 'chrome-aws-lambda';
import playwright from 'playwright-core';

export const PlaywrightSettings = (() => {
  let browser: playwright.Browser;
  let page: playwright.Page;

  async function init() {
    await chromium.font(
      'https://fonts.gstatic.com/s/notosanskr/v15/Pby6FmXiEBPT4ITbgNA5CgmOsn7uwpY.woff2'
    );
    await chromium.font(
      'https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf'
    );

    browser = await playwright.chromium.launch({
      args: [...chromium.args, '--lang=ko-KR'],
      executablePath:
        (await chromium.executablePath) ||
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: chromium.headless,
    });

    page = await browser.newPage({
      viewport: { width: 768, height: 403 },
    });
  }

  function terminate() {
    return browser.close();
  }

  return async () => {
    await init();

    return {
      page,
      terminate,
    };
  };
})();
