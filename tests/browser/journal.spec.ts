import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const widths = [375, 390, 430, 768, 834, 1024, 1194, 1440];
for (const width of widths)
  test(`Responsive reading at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 1024 });
    for (const path of ['/', '/articles/f40/', '/subjects/', '/search/']) {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      const broken = await page
        .locator('img')
        .evaluateAll((imgs) =>
          imgs
            .filter(
              (im: any) =>
                im.getAttribute('src') &&
                im.loading !== 'lazy' &&
                (!im.complete || im.naturalWidth === 0),
            )
            .map((im: any) => im.src),
        );
      expect(broken).toEqual([]);
    }
  });
test('Home → article → save → reading room survives reload', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('.lead-heading a').click();
  await expect(page).toHaveURL(/\/articles\/f40\//);
  await expect(page.locator('.review-note')).toBeVisible();
  await page.getByRole('button', { name: '나중에 읽기' }).click();
  await expect(page.getByRole('button', { name: '저장됨' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: '본문 글자 크게' }).click();
  await expect(page.locator('[data-font-size]')).toHaveText('+1');
  await page.reload();
  await expect(page.locator('[data-font-size]')).toHaveText('+1');
  await page.goto('/saved/');
  await expect(page.locator('[data-saved-story]:visible')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('[data-saved-story]:visible')).toHaveCount(1);
});
test('Full text, query URL, filters, empty and malicious search input', async ({ page }) => {
  await page.goto('/search/?q=탐부리니');
  await expect(page.locator('.search-status')).toContainText('1편');
  await expect(page.locator('[data-search-story]:visible')).toHaveCount(1);
  await expect(page.locator('[data-search-story="ducati-916"]')).toBeVisible();
  await page.locator('#query').fill('911');
  await expect(page.locator('.search-status')).toContainText('1편');
  await expect(page).toHaveURL(/q=911/);
  await page.locator('#search-subject').selectOption('motorcycles');
  await expect(page.locator('[data-search-empty]')).toBeVisible();
  await page.locator('#search-subject').selectOption('');
  await page.locator('#query').fill('<img src=x onerror=alert(1)>');
  await expect(page.locator('[data-search-empty]')).toBeVisible();
  expect(await page.locator('#search-results img').count()).toBe(0);
  await page.reload();
  await expect(page.locator('#query')).toHaveValue('<img src=x onerror=alert(1)>');
});
test('Photo viewer closes by Escape and returns focus', async ({ page }) => {
  await page.goto('/articles/f40/');
  const link = page.locator('[data-lightbox]');
  await link.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(link).toBeFocused();
});
test('No-JS navigation, body and subject discovery remain usable', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('/');
  await page.locator('.lead-heading a').click();
  await expect(page.locator('.article-copy section').first()).toBeVisible();
  await expect(page.locator('[data-reader-tools]')).toBeHidden();
  await page.getByRole('link', { name: 'Subjects', exact: true }).click();
  await page.locator('.subject-index a').first().click();
  await expect(page.locator('.story-row')).toHaveCount(2);
  await context.close();
});
test('Empty subject and all navigation routes are real HTML pages', async ({ page }) => {
  for (const path of [
    '/latest/',
    '/features/',
    '/archive/',
    '/about/',
    '/subjects/aircraft/',
    '/saved/',
  ]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  }
  await page.goto('/subjects/aircraft/');
  await expect(page.locator('.empty-state')).toBeVisible();
});
test('WCAG A/AA automated checks on home, article, search', async ({ page }) => {
  for (const path of ['/', '/articles/f40/', '/search/']) {
    await page.goto(path);
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(result.violations).toEqual([]);
  }
});
test('Reduced motion and denied storage are safe', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() =>
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('denied', 'SecurityError');
      },
    }),
  );
  await page.goto('/articles/f40/');
  await page.getByRole('button', { name: '나중에 읽기' }).click();
  await expect(page.locator('.article-feedback')).toContainText('저장소를 사용할 수 없습니다');
  await page.getByRole('button', { name: '본문 글자 크게' }).click();
  await expect(page.locator('[data-font-size]')).toHaveText('+1');
});

test('iPhone touch context and landscape navigation', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1',
  });
  const page = await context.newPage();
  await page.goto('/');
  await page.locator('.lead-story .photo-link').tap();
  await expect(page).toHaveURL(/articles\/f40/);
  await page.setViewportSize({ width: 844, height: 390 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await context.close();
});
test('iPad portrait and landscape preserve article proportions', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 834, height: 1194 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto('/articles/porsche-911/');
  await page.evaluate(() => document.fonts.ready);
  for (const [width, height] of [
    [834, 1194],
    [1194, 834],
  ]) {
    await page.setViewportSize({ width, height });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const natural = await page
      .locator('.article-hero img')
      .evaluate((el: HTMLImageElement) => ({
        natural: el.naturalWidth / el.naturalHeight,
        rendered: el.width / el.height,
      }));
    expect(Math.abs(natural.natural - natural.rendered)).toBeLessThan(0.015);
  }
  await context.close();
});
