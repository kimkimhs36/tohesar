from pathlib import Path
import xml.etree.ElementTree as ET,hashlib,io,json
import resvg_py
from PIL import Image
root=Path.home()/'Documents'/'TOHESAR-FIRST-DROP-ATELIER'
out=root/'06_SIGNATURE_R02'
out.mkdir(exist_ok=True)
raw=(root/'BRAND-ORIGINAL.svg').read_bytes()
sha=hashlib.sha1(b'blob '+str(len(raw)).encode()+bytes([0])+raw).hexdigest()
assert sha=='e9b299f8d797625b3704103c08ea1aede5c5ea05'
NS='{http://www.w3.org/2000/svg}'
base=ET.fromstring(raw)
paths=list(base.iter(NS+'path'))
assert len(paths)==1 and base.get('viewBox')=='0 0 1109 255'
original_d=paths[0].get('d')
def logo(x,y,w,ink):
 return '<svg x="'+str(x)+'" y="'+str(y)+'" width="'+str(w)+'" height="'+str(w*255/1109)+'" viewBox="0 0 1109 255"><path fill="'+ink+'" fill-rule="evenodd" d="'+original_d+'"/></svg>'
styles=[
 dict(id='A',name='MONOLITH / TONAL',upper='#343936',lower='#252e2a',edge='#8a998d',ink='#e7e5d9',note='Same tone, engineered seam, logo quietly placed',priority='DESIGN PREFERENCE'),
 dict(id='B',name='PETROL / INTERRUPTION',upper='#353b37',lower='#1a3330',edge='#a1b4a6',ink='#e9e5da',note='Deep-petrol panel, tonal blackened upper jersey',priority='COLOR STUDY')
]
cut='M 470 243 L 389 259 L 188 441 L 274 558 L 352 499 L 352 1213 L 1048 1213 L 1048 499 L 1126 558 L 1212 441 L 1011 259 L 930 243 L 832 275 Q 700 405 568 275 Z'
seam='M 352 791 C 545 770 818 655 1048 571'
def svg(style,side):
 lower=style['lower']; upper=style['upper'];edge=style['edge']
 front=side=='front'
 art=''
 if front:
  art='<g clip-path="url(#clip)"><path d="M 352 791 C 545 770 818 655 1048 571 L 1048 1240 L 352 1240 Z" fill="'+lower+'"/>'
  art+='<path d="'+seam+'" fill="none" stroke="'+edge+'" stroke-width="9" opacity=".84"/>'
  art+='<path d="M 352 803 C 545 782 818 667 1048 583" fill="none" stroke="#101b16" stroke-width="4"/>'
  art+='<path d="M 352 1200 H 1048" fill="none" stroke="'+edge+'" stroke-width="3" opacity=".5"/></g>'
  art+=logo(430,1012,144,style['ink'])
  art+='<rect x="1043" y="944" width="32" height="88" rx="2" fill="#d9d6c9"/><text x="1047" y="981" font-family="Arial" font-size="19" fill="#152820">04</text>'
 else:
  art='<path d="M 352 1200 H 1048" fill="none" stroke="'+edge+'" stroke-width="3" opacity=".55"/>'
 return '<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1600" viewBox="0 0 1400 1600"><defs><clipPath id="clip"><path d="'+cut+'"/></clipPath><linearGradient id="shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".07"/><stop offset=".42" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient></defs><rect width="1400" height="1600" fill="#ddd9d1"/><path d="'+cut+'" fill="'+upper+'" stroke="#657069" stroke-width="3"/>'+art+'<path d="'+cut+'" fill="url(#shade)"/><path d="M568 275 Q700 410 832 275" fill="none" stroke="#a2b3a5" stroke-width="19" opacity=".7"/><path d="M580 277 Q700 395 820 277" fill="none" stroke="#18251f" stroke-width="6"/><path d="M356 1195 H 1044" fill="none" stroke="#788a7c" stroke-width="2" opacity=".6"/><text x="85" y="99" font-family="Arial" font-size="24" fill="#42584c" letter-spacing="5">OBJECT LAB  /  04.R02</text><text x="85" y="157" font-family="Arial" font-size="47" fill="#1d3328">'+style['name']+'</text><line x1="85" y1="186" x2="1315" y2="186" stroke="#aab5a9" stroke-width="2"/><text x="85" y="1450" font-family="Arial" font-size="26" fill="#435e4b">'+side.upper()+' / PROPOSED GARMENT FORM</text><text x="85" y="1497" font-family="Arial" font-size="19" fill="#8b7768">SCHEMATIC STUDY  /  NOT A GARMENT PHOTO  /  NOT A CUTTABLE PATTERN</text></svg>'
for s in styles:
 for side in ['front','back']:
  text=svg(s,side)
  f=out/('04R02-'+s['id']+'-'+side.upper()+'.svg')
  f.write_text(text,encoding='utf8')
  tree=ET.parse(f).getroot()
  matches=[p for p in tree.iter(NS+'path') if p.get('d')==original_d]
  assert len(matches)==(1 if side=='front' else 0)
  img=Image.open(io.BytesIO(resvg_py.svg_to_bytes(svg_string=text))).convert('RGB')
  img.save(f.with_suffix('.png'),optimize=True)
detail='<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="930" viewBox="0 0 1400 930"><rect width="1400" height="930" fill="#e5e2d9"/><text x="90" y="96" font-family="Arial" font-size="31" letter-spacing="4" fill="#506357">CONSTRUCTION STUDIES / 04.R02</text><text x="90" y="159" font-family="Arial" font-size="58" fill="#152b21">THE SEAM IS THE SIGNATURE.</text><rect x="90" y="233" width="580" height="550" rx="9" fill="#343a36"/><path d="M115 677 C300 643 476 490 643 398" fill="none" stroke="#92a597" stroke-width="15"/><path d="M115 691 C300 657 476 504 643 412" fill="none" stroke="#121e18" stroke-width="7"/><text x="115" y="729" font-family="Arial" font-size="28" fill="#d7e0d6">DIAGONAL JOIN</text><rect x="730" y="233" width="580" height="550" rx="9" fill="#1c332f"/>'+logo(850,433,334,'#e7e4d5')+'<text x="761" y="729" font-family="Arial" font-size="28" fill="#d7e0d6">UNMODIFIED WORDMARK</text><text x="90" y="856" font-family="Arial" font-size="22" fill="#956758">MOCKUP / FABRIC, PRINT LOCATION AND MACHINE STITCH TO BE VERIFIED</text></svg>'
detailf=out/'04R02-DETAIL-STUDIES.svg'
detailf.write_text(detail,encoding='utf8')
assert sum(1 for p in ET.parse(detailf).getroot().iter(NS+'path') if p.get('d')==original_d)==1
Image.open(io.BytesIO(resvg_py.svg_to_bytes(svg_string=detail))).convert('RGB').save(detailf.with_suffix('.png'))
(out/'04R02-DESIGN-RECORD.json').write_text(json.dumps({
 'revision':'04.R02','purpose':'real creative variation of construction, no previous sample manufactured',
 'styles':styles,'source_blob_sha1':sha,'exact_brand_vector':True,
 'development':'diagonal front seam; clean back; original 1-color low-front wordmark; woven tab',
 'risks':['factory pattern approval','fabric body compatibility','strain and puckering on diagonal seam','sewing allowance / size grading','wash/shrink before releasing'],
 'no_order':True,'real_prototype':False},ensure_ascii=False,indent=2),encoding='utf8')
print('R02_DESIGNS_READY',len(styles),len(list(out.glob('*.png'))),sha)