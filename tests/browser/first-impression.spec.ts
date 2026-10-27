import { test, expect } from '@playwright/test';

for (const width of [375,390,430,768,834,1024,1440]) {
  test('First impression cinematic layout: ' + width + 'px', async ({ page }) => {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 1000 });
    const response=await page.goto('/first-impression/');
    expect(response?.status()).toBe(200);
    await expect(page.locator('#fi-hero-heading')).toBeVisible();
    await expect(page.locator('.fi-hero-image img, picture.fi-hero-image img').first()).toBeVisible();
    const overflow=await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    const image=await page.locator('.fi-photo-shell img').first().evaluate((el:HTMLImageElement)=>({loaded:el.complete&&el.naturalWidth>0,originalRatio:el.naturalWidth/el.naturalHeight}));
    expect(image.loaded).toBe(true);
    expect(image.originalRatio).toBeGreaterThan(1.3);
    await expect(page.locator('.fi-image-foot')).toContainText('CC BY-SA 4.0');
  });
}

test('Interactive mobile menu and genuine destinations', async ({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/first-impression/');
  await page.locator('.fi-menu summary').click();
  await expect(page.getByRole('link',{name:'지금 자동차 뉴스'})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.fi-menu')).not.toHaveAttribute('open');
  await page.getByRole('link',{name:'NEWS',exact:true}).click();
  await expect(page).toHaveURL(/\/radar\/$/);
});

test('Real-source headlines replace fallback without inventing translated titles',async({page})=>{
  await page.route('**/api/radar',async(route)=>route.fulfill({
    status:200,contentType:'application/json',
    body:JSON.stringify({articles:[
      {title:'Porsche launches a new concept',source:'Porsche Newsroom',url:'https://newsroom.porsche.com/en/2026/concept/example.html',published_at:'2026-10-27T08:00:00.000Z'},
      {title:'Automaker announces new platform',source:'BMW Group PressClub',url:'https://www.press.bmwgroup.com/global/article/example',published_at:'2026-10-27T08:00:00.000Z'}
    ]})
  }));
  await page.goto('/first-impression/');
  await expect(page.locator('.fi-headline')).toHaveCount(2);
  await expect(page.locator('.fi-headline').first()).toContainText('Porsche launches a new concept');
  await expect(page.locator('.fi-headline').first()).toHaveAttribute('target','_blank');
  await expect(page.locator('#fi-feed-status')).toContainText('2건');
});

test('Reduced motion turns off ambient gradient animation',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/first-impression/');
  await expect(page.locator('.fi-light-a')).toHaveCSS('animation-name','none');
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content','noindex, nofollow');
});
