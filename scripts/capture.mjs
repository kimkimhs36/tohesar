import { chromium, webkit } from '@playwright/test';
const engine = process.env.QA_BROWSER === 'webkit' ? webkit : chromium;
const browser = await engine.launch(
  engine === chromium
    ? { executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] }
    : {},
);
for (const [name, width, height, path] of [
  ['iphone-home', 390, 844, '/'],
  ['iphone-article', 390, 844, '/articles/f40/'],
  ['ipad-home', 1024, 1366, '/'],
  ['desktop-home', 1440, 1000, '/'],
]) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto((process.env.TEST_BASE_URL || 'http://127.0.0.1:4321') + path);
  await page.evaluate(async () => {
    document.querySelectorAll('img[src]').forEach((im) => (im.loading = 'eager'));
    await document.fonts.ready;
    await Promise.all([...document.querySelectorAll('img[src]')].map((im) => im.decode()));
  });
  await page.screenshot({ path: `docs/qa/${name}.png`, fullPage: true });
  if (width === 390) await page.screenshot({ path: `docs/qa/${name}-viewport.png` });
  console.log(name, await page.locator('h1').boundingBox());
  await page.close();
}
await browser.close();
