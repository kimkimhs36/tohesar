import { test, expect } from '@playwright/test';

test('iPhone editorial navigation stays compact and all sections remain reachable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.main-nav > a:visible')).toHaveCount(3);
  await expect(page.locator('.mobile-nav-more summary')).toBeVisible();
  await expect(page.locator('.live-desk')).toBeVisible();
  await expect(page.locator('.editorial-brief')).toBeVisible();
  await expect(page.locator('.dossier-art')).toHaveCount(0);
  await page.locator('.mobile-nav-more summary').click();
  await page.getByRole('link', { name: '주제별', exact: true }).click();
  await expect(page).toHaveURL(/\/subjects\//);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
});

test('real news shows first 12 and reveals more intentionally', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const now = new Date().toISOString();
  const articles = Array.from({ length: 17 }, (_,i) => ({
    title: i === 16 ? 'Concept Design Seventeen' : 'Vehicle update '+(i+1),
    url: 'https://www.motor1.com/news/999'+String(i).padStart(3,'0')+'/test/',
    source:'Motor1',source_id:'motor1',category:i===16?'design':'new-cars',
    published_at:now,original_language:'en',kind:'external-source',
  }));
  await page.route('**/api/radar', async route => {
    await route.fulfill({ status:200, contentType:'application/json', body:JSON.stringify({
      status:'ok',fetched_at:now,
      articles,sources:[{id:'motor1',source:'Motor1',status:'ok',count:17}]
    }) });
  });
  await page.goto('/radar/');
  await expect(page.locator('#radar-list li')).toHaveCount(12);
  await expect(page.locator('#radar-count')).toHaveText('17건');
  await page.locator('#radar-more').click();
  await expect(page.locator('#radar-list li')).toHaveCount(17);
  await page.locator('[data-category="design"]').click();
  await expect(page.locator('#radar-list li')).toHaveCount(1);
  await expect(page.locator('#radar-list li').first()).toContainText('Concept Design Seventeen');
  await expect(page.locator('#radar-more')).toBeHidden();
  await expect(page.locator('.radar-notes summary')).toBeVisible();
  await expect(page.locator('body')).not.toHaveCSS('overflow-x', 'scroll');
});

test('editorial cover is explicitly typographic, not a fake automobile image', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/editorial/mission-s/');
  await expect(page.locator('.mission-cover-type')).toContainText('MISSION S');
  await expect(page.locator('.mission-art-caption')).toContainText('실제 외관 사진이나 형태를 재현한 것이 아닙니다');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
});
