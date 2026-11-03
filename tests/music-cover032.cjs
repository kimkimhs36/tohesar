// BASE_URL=http://127.0.0.1:4173 node tests/music-cover032.cjs
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox']});
  const page = await browser.newPage({viewport:{width:390,height:844}});
  await page.route('https://embed.music.apple.com/**', route => route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>Official embed test stub</title>'}));
  await page.goto((process.env.BASE_URL || 'http://127.0.0.1:4173') + '/');
  const toggle = page.locator('.thz-music032-toggle');
  await toggle.waitFor();
  assert.equal(await toggle.getAttribute('aria-expanded'),'false');
  assert.equal(await page.locator('.thz-music032-iframe').count(),0,'No iframe or network until requested');
  await toggle.click();
  assert.equal(await toggle.getAttribute('aria-expanded'),'true');
  assert.equal(await page.locator('.thz-music032-iframe').getAttribute('src'),'https://embed.music.apple.com/us/song/617154366');
  await toggle.click();
  assert.equal(await page.locator('.thz-music032-iframe').count(),0,'Close unloads player');
  assert.equal(await toggle.getAttribute('aria-expanded'),'false');
  await browser.close();
  console.log('PASS Apple Music opt-in embed opens and closes without autoplay');
})().catch(err => {console.error(err);process.exit(1)});
