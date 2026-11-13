from pathlib import Path
from playwright.sync_api import sync_playwright
import json,time,io,os
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1]
base='http://127.0.0.1:8787'
checks=[]
def check(value,name):
 assert value,name
 checks.append(name)

def main():
 with sync_playwright() as pw:
  engine=os.environ.get('VISION_TEST_ENGINE','chromium')
  browser=pw.webkit.launch() if engine=='webkit' else pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for name,w,h in ([] if os.environ.get('VISION_MOCK_ONLY') else [('desktop',1440,1000),('ipad-landscape',1194,834),('ipad-compact',1024,768),('ipad-portrait',820,1180),('mobile',390,844),('small-mobile',320,740),('phone-landscape',844,390)]):
   page=browser.new_page(viewport={'width':w,'height':h},has_touch=True)
   errors=[];network=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:network.append(r.url))
   page.goto(base+'/simulator/');page.evaluate('document.fonts.ready');page.wait_for_timeout(100)
   check(page.evaluate('document.documentElement.scrollWidth<=innerWidth'),name+' simulation no horizontal overflow')
   page.screenshot(path=str(ROOT/'screenshots'/f'{engine}-{name}.png'),full_page=True)
   if w>=1024:
    check(page.locator('#stop').bounding_box()['y']+page.locator('#stop').bounding_box()['height']<=h,name+' STOP visible without scrolling')
   page.locator('#arm').click();page.keyboard.down('w');page.wait_for_timeout(30)
   check(page.locator('#left-output').inner_text()=='85',name+' keyboard forward')
   page.keyboard.up('w');check(page.locator('#left-output').inner_text()=='0',name+' release neutral')
   page.keyboard.press('Space');check(not page.locator('body').get_attribute('class') or 'armed' not in page.locator('body').get_attribute('class'),name+' SPACE locks while button focused')
   page.locator('#arm').click();page.locator('#led').click();check(page.locator('#led').get_attribute('aria-pressed')=='true',name+' light command')
   if w<900:
    rect=page.locator('#stop').bounding_box();check(rect['y']+rect['height']<=h+1,name+' floating STOP')
   page.locator('#stop').click();check(page.locator('#led').get_attribute('aria-pressed')=='false',name+' STOP light off')
   check(not errors,name+' no browser errors');check(not any('192.168.' in u or '/api/' in u for u in network),name+' simulation sends no robot requests')
   for path in ['/','/guide/','/setup/']:
    page.goto(base+path);page.wait_for_timeout(50);check(page.evaluate('document.documentElement.scrollWidth<=innerWidth'),name+' '+path+' no horizontal overflow')
   page.close()
  # Real UI with explicit fake HTTP robot. It does not exercise ESP32 or physical hardware.
  page=browser.new_page(viewport={'width':1194,'height':834})
  state={'token':0,'seq':0,'left':0,'right':0,'led':False,'slow':False,'arm_delay':False,'camera':True,'calls':[]}
  image=Image.new('RGB',(320,240),(60,76,50));ImageDraw.Draw(image).text((35,110),'MOCK CAMERA / NOT HARDWARE',fill='white');out=io.BytesIO();image.save(out,format='JPEG');jpeg=out.getvalue()
  def route(r):
   url=r.request.url
   if ':81/capture' in url:
    if state['camera']:r.fulfill(status=200,body=jpeg,content_type='image/jpeg',headers={'Access-Control-Allow-Origin':'http://192.168.4.1'})
    else:r.fulfill(status=503,body='failure')
    return
   path=url.split('192.168.4.1',1)[1].split('?')[0] or '/'
   if path.startswith('/api/'):
    data=r.request.post_data_json if r.request.method=='POST' else {}
    state['calls'].append((path,data))
    if path=='/api/status':body={'product':'VISION DRIVE','version':'4.0.0','camera':True,'armed':bool(state['token'])}
    elif path=='/api/arm':
     state['token']=101;state['seq']=0;body={'token':101}
     if state['arm_delay']:time.sleep(.15)
    elif path=='/api/stop':state.update(token=0,left=0,right=0,led=False);body={'ok':True}
    else:
     if state['slow']:time.sleep(.4)
     if not state['token'] or data['token']!=state['token'] or data['seq']<=state['seq']:r.fulfill(status=409,body='locked');return
     state.update(seq=data['seq'],left=data['left'],right=data['right'],led=bool(data['led']));body={'ok':True}
    try:r.fulfill(status=200,content_type='application/json',body=json.dumps(body))
    except Exception:pass
    return
   file=ROOT/'web/drive'/('index.html' if path=='/' else path.lstrip('/'))
   if file.exists():r.fulfill(path=str(file))
   else:r.fulfill(status=404)
  page.route('http://192.168.4.1/**',route);page.route('http://192.168.4.1:81/**',route)
  page.goto('http://192.168.4.1/');page.locator('#arm').wait_for(state='visible');page.wait_for_timeout(150)
  check(page.locator('#camera').is_visible(),'mock robot decoded JPEG')
  page.screenshot(path=str(ROOT/f'screenshots/{engine}-mock-robot.png'),full_page=True)
  page.locator('#arm').click();page.wait_for_function("document.body.classList.contains('armed')");page.keyboard.down('w');page.wait_for_timeout(180)
  check(state['left']==85 and state['right']==85,'mock HTTP independent PWM forward '+json.dumps(state)+page.locator('#safety-note').inner_text())
  check(page.locator('[data-power="170"]').is_disabled(),'output settings disabled while armed')
  page.keyboard.up('w');page.wait_for_timeout(110);check(state['left']==0 and state['right']==0,'mock HTTP release sends neutral')
  rect=page.locator('#joystick').bounding_box();page.mouse.move(rect['x']+rect['width']/2,rect['y']+20);page.mouse.down();page.wait_for_timeout(110);check(state['left']>0,'pointer joystick sends drive')
  page.mouse.move(10,10);page.mouse.up();page.wait_for_timeout(110);check(state['left']==0 and state['right']==0,'pointer release outside joystick stops')
  page.keyboard.down('d');page.wait_for_timeout(110);page.keyboard.press('Escape');page.keyboard.up('d');page.wait_for_timeout(80)
  check(state['token']==0 and state['left']==0,'ESC revokes robot session')
  page.locator('#arm').click();page.wait_for_timeout(90);state['camera']=False;page.wait_for_timeout(200);check('armed' not in (page.locator('body').get_attribute('class') or ''),'camera error locks UI')
  state['camera']=True;page.wait_for_timeout(800);page.locator('#arm').click();state['slow']=True;page.keyboard.down('w');page.wait_for_timeout(750);page.keyboard.up('w');check('armed' not in (page.locator('body').get_attribute('class') or ''),'control response timeout locks UI')
  state['slow']=False;page.wait_for_timeout(200);state['arm_delay']=True
  page.locator('#arm').click(no_wait_after=True);page.locator('#stop').click();page.wait_for_timeout(400);check('armed' not in (page.locator('body').get_attribute('class') or ''),'delayed arm cannot undo STOP')
  check(state['token']==0,'delayed arm revoked on device mock')
  # New non-motion diagnostics and offline report: still a mock HTTP device.
  state['arm_delay']=False
  page.locator('#help').click();page.locator('#diagnostics-tab').click()
  before=len([c for c in state['calls'] if c[0]=='/api/control'])
  page.locator('#run-diagnostics').click();page.wait_for_function("document.getElementById('diagnostic-result').textContent.includes('중앙값')")
  check(len(page.locator('#diagnostic-plot i').all())==20,'diagnostic collects 20 HTTP samples')
  check(len([c for c in state['calls'] if c[0]=='/api/control'])==before,'diagnostic sends no motion commands')
  page.locator('#report-tab').click();page.locator('#notes').fill('<script>alert(1)</script> observed wheels lifted')
  with page.expect_download() as download:page.locator('#save-report').click()
  report=download.value.path().read_text()
  check('&lt;script&gt;' in report and '<script>alert(1)</script>' not in report,'report escapes observer input')
  check('실제 모터 움직임' in report,'report distinguishes commands from physical motion')
  page.close();browser.close()
 (ROOT/f'release/{engine}-browser-results.json').write_text(json.dumps({'browser':engine,'checks':checks,'passed':len(checks),'hardware':False},ensure_ascii=False,indent=2))
 print('PASS:',len(checks),'browser checks')
if __name__=='__main__':main()