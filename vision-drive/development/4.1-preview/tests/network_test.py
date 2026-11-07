"""Synthetic network faults against the actual robot UI; no ESP32 or Wi-Fi involved."""
import asyncio, io, json, time
from pathlib import Path
from PIL import Image
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]

async def main():
    state = dict(token=0, seq=0, left=0, right=0, last=0, camera_delay=0,
                 control_delay=0, stop_fail=False, status_mode='ok', diagnostic_index=0,
                 controls=0, stops=0, active_control=0, max_control=0, expired=0)
    jpeg_io = io.BytesIO()
    Image.new('RGB', (320, 240), (50, 70, 40)).save(jpeg_io, format='JPEG')
    jpeg = jpeg_io.getvalue()
    checks = []
    def check(condition, message):
        assert condition, message
        checks.append(message)
    async def watchdog():
        while True:
            if state['token'] and time.monotonic() - state['last'] >= .350:
                state.update(token=0, left=0, right=0, expired=state['expired']+1)
            await asyncio.sleep(.005)
    async def route(r):
        request = r.request
        url = request.url
        if ':81/capture' in url:
            await asyncio.sleep(state['camera_delay'])
            try:
                await r.fulfill(status=200, body=jpeg, content_type='image/jpeg', headers={'Access-Control-Allow-Origin':'http://192.168.4.1'})
            except Exception: pass
            return
        path = url.split('192.168.4.1', 1)[1].split('?')[0] or '/'
        if not path.startswith('/api/'):
            file = ROOT/'web/drive'/('index.html' if path=='/' else path.lstrip('/'))
            await r.fulfill(path=str(file)) if file.is_file() else await r.fulfill(status=404)
            return
        data = request.post_data_json if request.method == 'POST' else {}
        if path == '/api/status':
            mode = state['status_mode']
            if mode == 'mixed':
                state['diagnostic_index'] += 1
                if state['diagnostic_index'] % 4 == 0:
                    await r.fulfill(status=503, body='offline'); return
                await asyncio.sleep(.06)
            elif mode == 'offline':
                await r.fulfill(status=503, body='offline'); return
            body = {'product':'VISION DRIVE','version':'4.0.0','camera':True,'armed':bool(state['token'])}
        elif path == '/api/stop':
            if state['stop_fail']:
                await r.fulfill(status=503, body='offline'); return
            state.update(token=0,left=0,right=0,stops=state['stops']+1)
            body = {'ok':True}
        elif path == '/api/arm':
            state.update(token=101,seq=0,last=time.monotonic())
            body = {'token':101}
        elif path == '/api/control':
            state['controls'] += 1
            state['active_control'] += 1
            state['max_control'] = max(state['max_control'], state['active_control'])
            if state['token'] and data['token']==state['token'] and data['seq']>state['seq']:
                state.update(seq=data['seq'],left=data['left'],right=data['right'],last=time.monotonic())
                body = {'ok':True}
            else:
                state['active_control'] -= 1
                await r.fulfill(status=409,body='locked'); return
            await asyncio.sleep(state['control_delay'])
            state['active_control'] -= 1
        else:
            await r.fulfill(status=404); return
        try: await r.fulfill(status=200, content_type='application/json', body=json.dumps(body))
        except Exception: pass
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        page = await browser.new_page(viewport={'width':1194,'height':834})
        errors=[]
        page.on('pageerror',lambda e: errors.append(str(e)))
        await page.route('http://192.168.4.1/**',route)
        await page.route('http://192.168.4.1:81/**',route)
        task=asyncio.create_task(watchdog())
        try:
            await page.goto('http://192.168.4.1/')
            await page.wait_for_function("!document.getElementById('arm').disabled")
            await page.locator('#arm').click()
            await page.wait_for_function("document.body.classList.contains('armed')")
            await page.keyboard.down('w')
            await page.wait_for_function("document.getElementById('left-output').textContent==='85'")
            await asyncio.sleep(.2)
            check(state['left']==85, 'normal fake control reaches moving output')
            state['stop_fail']=True
            state['control_delay']=.45
            await page.wait_for_function("!document.body.classList.contains('armed')",timeout=2000)
            check('제어 응답 없음' in await page.locator('#safety-note').inner_text(), '450 ms delayed control ACK locks UI at timeout')
            check(state['max_control']==1, 'no overlapping control requests before timeout')
            await page.keyboard.up('w')
            await asyncio.sleep(.55)
            check(state['left']==0 and state['token']==0 and state['expired']>0, 'mock 350 ms lease expires when stop request also fails')
            state['stop_fail']=False
            state['control_delay']=0
            await page.wait_for_function("!document.getElementById('arm').disabled",timeout=4000)
            await page.locator('#arm').click()
            await page.wait_for_function("document.body.classList.contains('armed')")
            await page.keyboard.down('w')
            await asyncio.sleep(.18)
            state['camera_delay']=1.5
            await page.wait_for_function("!document.body.classList.contains('armed')",timeout=2500)
            check('영상 갱신 중단' in await page.locator('#safety-note').inner_text() or '카메라 응답 없음' in await page.locator('#safety-note').inner_text(), 'stalled camera locks UI while driving')
            await page.wait_for_function("document.getElementById('arm').disabled",timeout=1000)
            check(await page.locator('#arm').is_disabled(), 'stale camera disables rearming')
            await page.keyboard.up('w')
            state['camera_delay']=0
            await page.wait_for_function("!document.getElementById('arm').disabled",timeout=5000)
            check('armed' not in (await page.locator('body').get_attribute('class') or ''), 'restored video does not automatically rearm')
            await page.locator('#help').click()
            await page.locator('#diagnostics-tab').click()
            state['status_mode']='mixed'
            before=state['controls']
            await page.locator('#run-diagnostics').click()
            await page.wait_for_function("document.getElementById('diagnostic-result').textContent.includes('중앙값')",timeout=10000)
            result=await page.locator('#diagnostic-result').inner_text()
            failures=await page.locator('#diagnostic-plot i.failed').count()
            check(await page.locator('#diagnostic-plot i').count()==20 and failures>0, 'mixed 60 ms delay and HTTP failures recorded over 20 diagnostic samples')
            check('실패 0회' not in result and 'ms' in result, 'diagnostic reports failures and RTT')
            check(state['controls']==before, 'diagnostic sends no drive commands')
            state['status_mode']='offline'
            await page.locator('#run-diagnostics').click()
            await page.wait_for_function("document.getElementById('diagnostic-result').textContent.includes('모든 요청이 실패')",timeout=7000)
            check(await page.locator('#diagnostic-plot i.failed').count()==20, 'all failed diagnostic requests reported')
            check(not errors, 'no unhandled browser errors')
            print(json.dumps({'passed':len(checks),'checks':checks,'mixed_diagnostic':result,'hardware':False,'scope':'synthetic HTTP delays and failures; not Wi-Fi performance'},ensure_ascii=False,indent=2))
        finally:
            task.cancel()
            await browser.close()

if __name__=='__main__': asyncio.run(main())