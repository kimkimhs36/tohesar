import { test, expect } from '@playwright/test';

for(const width of [375,390,430,768,834,1194,1440]){
  test('cinematic first-screen without horizontal overflow '+width+'px',async({page})=>{
    await page.setViewportSize({width,height:width < 700 ? 844 : 1024});
    const response=await page.goto('/first-impression-002/');
    expect(response?.status()).toBe(200);
    await expect(page.locator('#fi2-hero-title')).toBeVisible();
    await expect(page.locator('.fi2-front-car img')).toBeVisible();
    await expect(page.locator('.fi2-curated-story')).toHaveCount(2);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    const image=await page.locator('.fi2-front-car img').evaluate((el:HTMLImageElement)=>({complete:el.complete,width:el.naturalWidth}));
    expect(image.complete&&image.width>0).toBeTruthy();
    await expect(page.locator('.fi2-photo-credit')).toContainText('CC BY-SA 4.0');
  });
}

test('iPhone hero shows photography in first viewport, not text-only opening',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/first-impression-002/');
  const rect=await page.locator('.fi2-hero-media').boundingBox();
  expect(rect).not.toBeNull();
  expect(rect!.y).toBeLessThan(200);
  expect(rect!.width).toBeGreaterThan(370);
  await page.locator('.fi2-menu summary').click();
  await expect(page.getByRole('link',{name:/실시간 자동차 뉴스/})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.fi2-menu')).not.toHaveAttribute('open');
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content','noindex,nofollow');
});

test('live feed loads only when explicitly expanded and shows only grounded original titles',async({page})=>{
  let requests=0;
  await page.route('**/api/radar',async(route)=>{
    requests++;
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
      sources:[{source:'Porsche Newsroom',status:'ok'}],
      articles:[{title:'Original Porsche Headline',url:'https://newsroom.porsche.com/en/2026/products/example.html',source:'Porsche Newsroom',published_at:'2026-10-15T12:00:00.000Z'}]
    })});
  });
  await page.goto('/first-impression-002/');
  expect(requests).toBe(0);
  await expect(page.locator('.fi2-curated-story')).toHaveCount(2);
  await page.locator('#fi2-wire summary').click();
  await expect(page.locator('#fi2-live-list li')).toHaveCount(1);
  await expect(page.locator('#fi2-live-list li')).toContainText('Original Porsche Headline');
  expect(requests).toBe(1);
  await page.locator('#fi2-wire summary').click();
  await page.locator('#fi2-wire summary').click();
  expect(requests).toBe(1);
});

test('motion sensitivity honored and official sources properly labeled',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/first-impression-002/');
  await expect(page.locator('.fi2-light-peach')).toHaveCSS('animation-name','none');
  await expect(page.locator('.fi2-curated-story').first()).toContainText('10월 15일');
  await expect(page.locator('.fi2-curated-story').last()).toContainText('10월 12일');
});
