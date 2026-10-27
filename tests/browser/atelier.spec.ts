import { expect, test } from '@playwright/test';

test.describe('TOHEŞAR art direction atelier', () => {
  test('four distinct, accessible art directions can be compared', async ({ page }) => {
    await page.goto('/atelier/');
    await expect(page).toHaveTitle(/ATELIER 04/);
    await expect(page.getByRole('tabpanel')).toHaveCount(4);
    const tabs = page.getByRole('tab');
    await expect(tabs).toHaveCount(4);
    const names = ['THE PRESS', 'THE FRAME', 'THE ARCHIVE', 'THE EDITION'];
    for (let i = 0; i < 4; i++) {
      await tabs.nth(i).click();
      await expect(tabs.nth(i)).toHaveAttribute('aria-selected', 'true');
      await expect(page.locator('#panel-' + ['a', 'b', 'c', 'd'][i])).toBeVisible();
      await expect(page.getByRole('tabpanel').filter({ visible: true })).toHaveCount(1);
      await expect(page).toHaveURL(new RegExp('#view-' + ['a', 'b', 'c', 'd'][i] + '$'));
      await expect(page.getByText(names[i], { exact: true }).first()).toBeVisible();
    }
    await page.reload();
    await expect(page.locator('#panel-d')).toBeVisible();
    await page.getByRole('button', { name: /다음 시안 살펴보기/ }).click();
    await expect(page.locator('#panel-a')).toBeVisible();
  });

  test('keyboard switching, links and mobile widths', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/atelier/');
    await expect(page.locator('#panel-a a[href="/articles/f40/"]').first()).toBeVisible();
    await page.locator('#tab-a').focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#tab-b')).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('End');
    await expect(page.locator('#tab-d')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('body')).not.toHaveCSS('overflow-x', 'scroll');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
    await expect(page.getByText('DESIGN STUDY · NOT PUBLISHED')).not.toBeVisible();
    await expect(page.locator('meta[name=robots]')).toHaveAttribute('content','noindex, nofollow');
  });
});