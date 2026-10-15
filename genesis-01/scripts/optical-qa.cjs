// Optional visual-runtime regression test. It intentionally avoids multiple
// SwiftShader screenshots; it does NOT certify physical iPhone Safari.
const { chromium } = require('@playwright/test');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({
    args: ['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']
  });
  try {
    for (const vp of [{width:390,height:844,name:'portrait'}, {width:844,height:390,name:'landscape'}]) {
      const page = await browser.newPage({viewport:vp,deviceScaleFactor:1,isMobile:true,hasTouch:true});
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));
      await page.goto('http://127.0.0.1:5173/?p=0');
      await page.waitForFunction(() => !!window.__genesis);
      const states = [];
      for (const p of [0,.05,.23,.30,.40,.43,.48]) {
        await page.evaluate(v => window.__genesis.seek(v),p);
        states.push(await page.evaluate(() => {
          const s=window.__genesis.state;
          return {
            progress:s.progress, optical:s.optical, revelation:s.revelation,
            overflow:document.documentElement.scrollWidth>innerWidth,
            skyOffset:new DOMMatrix(getComputedStyle(document.querySelector('.atmosphere-well--sky')).transform).m41,
            skyGlint:getComputedStyle(document.querySelector('.atmosphere-shape--sky'),'::before').animationName
          };
        }));
      }
      const [first,early,open,pass,lock,aligned,final]=states;
      assert.equal(first.optical.open,0);
      assert(Math.abs(early.skyOffset-first.skyOffset)>vp.width*.13,'First 5% of the scene must noticeably unfold the sky');
      assert(early.optical.open>.2,'Specular light should respond immediately');
      assert(open.optical.open>.1,'Light should open with geometry');
      assert.notDeepEqual(open.optical.sky,first.optical.sky,'Sky light should respond to scroll');
      assert(pass.optical.open>.99);
      assert(lock.revelation.geometryLocked);
      assert(aligned.revelation.geometryLocked);
      assert(aligned.revelation.alignmentError<1e-4,'43% camera-only image must close');
      assert(aligned.revelation.depthRange>3,'Anamorphosis must preserve physical depth');
      assert(final.optical.align>.99);
      assert(states.every(s=>!s.overflow),'No horizontal overflow');
      assert(first.skyGlint.includes('skyGlint'),'Curved specular highlight should animate');
      assert.deepEqual(errors,[]);
      await page.evaluate(() => {
        Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});
        document.dispatchEvent(new Event('visibilitychange'));
      });
      assert(await page.evaluate(()=>document.documentElement.classList.contains('page-hidden')));
      console.log('OPTICAL COHESION PASS',vp.name);
      await page.close();
    }
    const reduced = await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
    await reduced.goto('http://127.0.0.1:5173/?p=0');
    const animation = await reduced.evaluate(() =>
      getComputedStyle(document.querySelector('.atmosphere-shape--sky'),'::before').animationName);
    assert.equal(animation,'none','Reduced motion disables autonomous specular animation');
    await reduced.close();
    console.log('REDUCED MOTION PASS');
  } finally { await browser.close(); }
})().catch(err=>{console.error(err);process.exitCode=1;});
