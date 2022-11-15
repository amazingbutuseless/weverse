import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

export const BrowserSettings = (() => {
  let browser: puppeteer.Browser;
  let page: puppeteer.Page;

  async function init() {
    const options = {
      args: [...chromium.args, '--lang=ko-KR'],
      executablePath:
        (await chromium.executablePath) ||
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: chromium.headless,
    };
    browser = await puppeteer.launch(options);

    page = await browser.newPage();
    await page.setViewport({ width: 768, height: 403 });
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
