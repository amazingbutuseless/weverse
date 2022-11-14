import chromium from 'chrome-aws-lambda';
import playwright from 'playwright-core';

export const PlaywrightSettings = (() => {
  let browser: playwright.Browser;
  let page: playwright.Page;

  async function init() {
    const options = {
      args: [...chromium.args, '--lang=ko-KR'],
      executablePath:
        (await chromium.executablePath) ||
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: chromium.headless,
    };
    browser = await playwright.chromium.launch(options);

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
