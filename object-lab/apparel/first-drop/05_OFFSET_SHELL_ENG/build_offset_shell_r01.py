from pathlib import Path
import io,json,hashlib,csv
import xml.etree.ElementTree as ET
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.lib.colors import HexColor
import resvg_py

ROOT=Path.home()/'Documents'/'TOHESAR-FIRST-DROP-ATELIER'
OUT=ROOT/'05_OFFSET_SHELL_ENG'
OUT.mkdir(parents=True,exist_ok=True)
data=(ROOT/'BRAND-ORIGINAL.svg').read_bytes()
blob=hashlib.sha1(b'blob '+str(len(data)).encode()+bytes([0])+data).hexdigest()
assert blob=='e9b299f8d797625b3704103c08ea1aede5c5ea05'
NS='{http://www.w3.org/2000/svg}'
source=ET.fromstring(data)
wordmark=next(source.iter(NS+'path')).get('d')
assert source.get('viewBox')=='0 0 1109 255'
measure=[
 ('01','HPS to hem',710,10,'Measure HPS at neckline to finished hem'),
 ('02','Half chest',610,10,'2.5cm below armhole seam, laid flat'),
 ('03','Shoulder width',570,10,'Shoulder tip to shoulder tip'),
 ('04','Sleeve length',235,10,'Shoulder seam to sleeve end'),
 ('05','Sleeve opening flat',220,7,'Finished cuff, laid flat'),
 ('06','Half hem',605,10,'Finished body width at hem'),
 ('07','Neck rib depth',28,3,'Finished sewn rib depth'),
 ('08','Diagonal front join at wearer left',395,10,'HPS down to seam at side edge'),
 ('09','Diagonal front join at wearer right',270,10,'HPS down to seam at side edge'),
 ('10','Original wordmark width',78,2,'True vector art width; not typography'),
 ('11','Art from left side seam',55,5,'Check clearance from diagonal join'),
 ('12','Art above finished hem',105,5,'Lower edge of artwork to hem')
]
bom=[
 ('A','Front upper panel',1,'graphite compact cotton jersey','Front has diagonal bottom edge'),
 ('B','Front lower panel',1,'deep petrol cotton jersey','Diagonal seam + original wordmark'),
 ('C','Back body',1,'graphite compact cotton jersey','Clean back, no diagonal join'),
 ('D','Sleeves',2,'graphite jersey','Mirror pair and match color'),
 ('E','Neck rib',1,'matching cotton rib','Draft stretch ratio after trial'),
 ('F','Back neck support tape',1,'cotton twill or jersey','Optional, test neck recovery'),
 ('G','Side tab',1,'woven label target','Artwork 40x18mm, fold TBD'),
 ('H','Neck label',1,'woven label target','Artwork 60x30mm, fold TBD'),
 ('I','Care label',1,'verified composition required','Do not claim fiber/origin prematurely')
]
steps=[
 'Approve a specific prototype garment block / sample fit only',
 'Select compatible graphite and petrol fabrics, test washing shrinkage',
 'Pattern maker drafts front panels A/B, clean back, sleeves and rib',
 'Walk diagonal seam edges and check joined lengths before allowance',
 'Prototype seam allowance 10mm and hem 25mm; factory to confirm',
 'Check grainlines and mark non-crossing 78mm artwork position',
 'Join front A and B by knit-safe overlock; check seam puckering',
 'Trial topstitch 2.5mm from join for controlled surface detail',
 'Sew shoulders and optional reinforcement behind back neckline',
 'Attach sleeves, close side seams and keep logo area unobstructed',
 'Attach rib; stretch and recovery inspection with worn sample',
 'Stitch asymmetric front lower hem; attach right-side woven tab',
 'Print original 78mm vector art once actual placement measured',
 'Measure every POM and photograph front/back and wearing fit',
 'Run wash trial; compare POM, seams, color bleed and print handfeel',
 'Request itemized quote and user permission only after proof signoff'
]
# Source-locked construction engineering image: not actual sewing/cutting pattern.
svg='''<svg xmlns="http://www.w3.org/2000/svg" width="1760" height="1220" viewBox="0 0 1760 1220">
<defs>
 <clipPath id="cut"><path d="M295 175 L239 202 L90 360 L181 455 L248 393 L248 970 L652 970 L652 393 L719 455 L810 360 L661 202 L605 175 L553 192 Q450 282 347 192 Z"/></clipPath>
 <style>text{font-family:Arial,Helvetica,sans-serif}.small{font-size:19px;letter-spacing:3px;fill:#5c685e}.big{font-size:58px;font-weight:700;letter-spacing:-3px;fill:#17251f}.field{font-size:22px;font-weight:700;fill:#21372b}.light{font-size:21px;fill:#68766a}.leader{stroke:#8d9c8e;stroke-width:2;fill:none;stroke-dasharray:6,6}</style>
</defs>
<rect width="1760" height="1220" fill="#edebe4"/>
<text x="80" y="70" class="small">OBJECT LAB / GARMENT DEVELOPMENT / R01</text>
<text x="80" y="145" class="big">04 / OFFSET SHELL</text>
<text x="1680" y="140" text-anchor="end" class="small">PATTERN-MAKER BRIEF / NOT CUT FILE</text>
<line x1="80" y1="168" x2="1680" y2="168" stroke="#a9b0a6" stroke-width="2"/>
<g transform="translate(170,174) scale(.76)">
 <path d="M295 175 L239 202 L90 360 L181 455 L248 393 L248 970 L652 970 L652 393 L719 455 L810 360 L661 202 L605 175 L553 192 Q450 282 347 192 Z" fill="#333a35" stroke="#4b5c50" stroke-width="4"/>
 <g clip-path="url(#cut)"><polygon points="248,646 652,434 720,1040 200,1040" fill="#1b302d"/>
 <path d="M248 646 L652 434" stroke="#a4b6a6" stroke-width="7"/>
 <path d="M250 657 L654 445" stroke="#102621" stroke-width="4"/>
 <path d="M247 951 L652 951" stroke="#a1b4a8" stroke-width="4"/>
 <polygon points="449,961 653,976 653,992 449,973" fill="#455e51"/></g>
 <path d="M347 192 Q450 289 553 192" fill="none" stroke="#8b9c90" stroke-width="16"/>
 <rect x="648" y="720" width="27" height="72" fill="#e8e2d5"/>
 <text x="651" y="751" fill="#162d27" font-family="Arial" font-size="20">04</text>
 <svg x="312" y="809" width="112" height="26" viewBox="0 0 1109 255"><path d="__WORDMARK__" fill="#f8f2e7" fill-rule="evenodd"/></svg>
</g>
<g transform="translate(960,174) scale(.76)">
 <path d="M295 175 L239 202 L90 360 L181 455 L248 393 L248 970 L652 970 L652 393 L719 455 L810 360 L661 202 L605 175 L553 192 Q450 227 347 192 Z" fill="#333a35" stroke="#4b5c50" stroke-width="4"/>
 <path d="M347 190 Q450 243 553 190" fill="none" stroke="#8b9c90" stroke-width="16"/>
 <path d="M248 950 L652 950" stroke="#a4b6a6" stroke-width="4"/>
</g>
<text x="465" y="1004" text-anchor="middle" class="field">FRONT / 2-BODY PANEL</text>
<text x="1297" y="1004" text-anchor="middle" class="field">BACK / CLEAN BODY</text>
<path d="M352 455 L198 455 L130 413" class="leader"/>
<text x="81" y="392" class="light">01 / SHELL A</text>
<path d="M529 620 L680 690 L812 690" class="leader"/>
<text x="692" y="675" class="light">02 / DIAGONAL JOIN</text>
<path d="M500 811 L690 872 L800 872" class="leader"/>
<text x="693" y="852" class="light">03 / SHELL B</text>
<path d="M664 745 L739 781 L818 781" class="leader"/>
<text x="731" y="764" class="light">04 / SIDE TAB</text>
<text x="1280" y="1050" text-anchor="middle" class="light">NO BACK DIAGONAL / ONE CLEAN BACK PANEL</text>
<line x1="80" y1="1101" x2="1680" y2="1101" stroke="#a9b0a6" stroke-width="2"/>
<text x="80" y="1145" class="light">DESIGN REFERENCE ONLY / SAMPLE BLOCK 0 / UNMEASURED</text>
<text x="1680" y="1145" text-anchor="end" class="light">LOGO SOURCE SHA1 __SHA__</text>
</svg>'''.replace('__WORDMARK__',wordmark).replace('__SHA__',blob[:12])
svgpath=OUT/'04-FRONT-BACK-ENGINEERING-R01.svg'
svgpath.write_text(svg,encoding='utf-8')
vector=ET.parse(svgpath).getroot()
assert sum(1 for x in vector.iter(NS+'path') if x.get('d')==wordmark)==1
photo=Image.open(io.BytesIO(resvg_py.svg_to_bytes(svg_string=svg))).convert('RGB')
photo.save(OUT/'04-FRONT-BACK-ENGINEERING-R01.png',optimize=True)
assert photo.size==(1760,1220)
with open(OUT/'04-PROPOSED-POM.csv','w',encoding='utf-8-sig',newline='') as f:
    w=csv.writer(f);w.writerow(['ID','Measurement','Target mm','Proposed tolerance mm','How to measure','Actual mm','Status'])
    for a,b,c,d,e in measure:w.writerow([a,b,c,d,e,'','UNMEASURED'])
with open(OUT/'04-PROPOSED-BOM.csv','w',encoding='utf-8-sig',newline='') as f:
    w=csv.writer(f);w.writerow(['Part','Component','Quantity','Proposed material','Factory note'])
    w.writerows(bom)
with open(OUT/'04-SEWING-ORDER.csv','w',encoding='utf-8-sig',newline='') as f:
    w=csv.writer(f);w.writerow(['Sequence','Operation'])
    for i,s in enumerate(steps,1):w.writerow([i,s])
spec={
 'style':'TOHESAR OBJECT LAB / 04 OFFSET SHELL','rev':'R01',
 'status':'UNAPPROVED TECHNICAL DESIGN REFERENCE / NOT A CUTTABLE PATTERN',
 'logo_original_git_blob_sha1':blob,'logo_path_exact':True,
 'sample_block':'BLOCK 0 relaxed; no S/M/L claim before actual sample',
 'physical_material':'target compact jersey 240-260 gsm / NOT PURCHASED OR VERIFIED',
 'panel_construction':'front A upper, B lower diagonal joined; back C full',
 'color_targets':['graphite charcoal','deep-petrol charcoal'],
 'stitch_test':'proposed four-thread overlock diagonal join + 2.5mm topstitch trial',
 'allowances_test':{'side_and_panel_seam_mm':10,'hem_turn_mm':25,'right_front_hem_extension_mm':16},
 'artwork':{'source':'GitHub original vector','width_mm':78,'x_from_left_side_seam_mm':55,'above_finished_hem_mm':105,'spot_or_ink_color':'ivory reference'},
 'fit_targets_mm':{m[1]:m[2] for m in measure},
 'unknowns':['pattern maker curve lengths, sewing length and allowances','ribs and shrinkage',
             'final sample size and maker','fabric origin / fiber composition','tag folding and price',
             'apparel master signoff','price including VAT/shipping','user purchase permission'],
 'order':'NOT PLACED','sample':'NOT MADE'
}
(OUT/'04-TECH-SPEC-DRAFT.json').write_text(json.dumps(spec,ensure_ascii=False,indent=2),encoding='utf-8')
(OUT/'READ-ME-KR.txt').write_text(
 '04 OFFSET SHELL R01: 패턴 제작자와 상담하기 위한 초안입니다.\n'
 'SVG: 원본 워드마크 경로가 정확히 포함된 앞뒤 디자인 구조도\n'
 'CSV POM: 임시 기준 치수. Actual mm 칸은 실제 샘플을 측정한 뒤 입력.\n'
 'CSV BOM: 프런트 2패널, 클린 백, 소매 2개, 립, 라벨 등 구조.\n'
 'CSV SEWING: 제작·검수 순서 16단계.\n'
 '중요: 실제 재단 가능한 패턴이나 승인된 시접·그레이딩이 아닙니다.\n'
 '업체 상담, 샘플 비용과 배송 포함 총액, 실물 마스터 승인 전 제작·주문 금지.\n',
 encoding='utf8')
# ReportLab technical manufacturing discussion packet.
pdf=OUT/'04-OFFSET-SHELL-TECHPACK-R01-NO-CUTTING.pdf'
c=canvas.Canvas(str(pdf),pagesize=(595.3,841.9))
c.setTitle('TOHESAR / Offset Shell 04 / Preproduction R01')
def t(x,y,s,n=10,b=False,col='#142b22'):
    c.setFillColor(HexColor(col));c.setFont('Helvetica-Bold' if b else 'Helvetica',n);c.drawString(x,y,str(s))
def newpage(n,title,sub):
    c.setFillColor(HexColor('#efede6'));c.rect(0,0,595.3,841.9,stroke=0,fill=1)
    t(42,798,'OBJECT LAB / TECHNICAL DEVELOPMENT',10,True)
    t(42,758,title,21,True);t(42,733,sub,9)
    c.setStrokeColor(HexColor('#a9b5a7'));c.line(42,715,553,715)
    t(42,30,'DESIGN STUDY - NOT AN APPROVED PATTERN OR PRODUCTION ORDER',8,True,'#9b594d')
    t(531,30,str(n).zfill(2),8,True)
newpage(1,'04 / OFFSET SHELL','R01 / first custom-pattern development reference')
c.drawImage(ImageReader(photo),25,300,width=543,height=380,preserveAspectRatio=True)
for i,s in enumerate(['Front diagonal shell A+B / clean back C / 78mm unmodified wordmark',
                      'An asymmetric hem and side tab create an identifiable silhouette.',
                      'Pilot one physical size; validate tension, placement and wash first.']):
    t(48,245-i*29,s,10)
c.showPage()
newpage(2,'PROPOSED POINTS OF MEASURE','BLOCK 0 / relaxed / all dimensions in millimeters (not verified)')
for i,(code,name,target,tol,method) in enumerate(measure):
    y=684-i*40
    t(46,y,code+'  '+name[:37],9,True)
    t(372,y,str(target),10,True)
    t(428,y,'+/- '+str(tol),9)
    c.setStrokeColor(HexColor('#ced4c9'));c.line(45,y-11,553,y-11)
t(46,140,'Measurement sheet includes blank Actual mm and sample result fields.',9,True)
t(46,111,'Do not market this as a sized garment until fit and grading.',9)
c.showPage()
newpage(3,'BODY + TRIM BILL OF MATERIALS','Targets only. Confirm two fabric lots behave together in washing.')
for i,(code,component,count,material,note) in enumerate(bom):
    y=680-i*59
    t(46,y,code+' / '+component+'  x'+str(count),10,True)
    t(56,y-18,material,9);t(56,y-35,note[:85],8,col='#5d675e')
c.showPage()
newpage(4,'SEWING OPERATION ORDER','Maker to reconcile pattern seams and actual machinery.')
for i,operation in enumerate(steps):
    y=681-i*38
    t(46,y,str(i+1).zfill(2)+'  '+operation[:86],9)
    c.setStrokeColor(HexColor('#d6d7cc'));c.line(45,y-12,554,y-12)
c.showPage()
newpage(5,'SAMPLE APPROVAL GATES','Nothing below is verified until a physical sample exists.')
gates=[
 'Source original wordmark is exact, but final apparel master needs signoff',
 'Patternmaker agrees full seam geometry and allowances',
 'Fabric swatches match and shrink compatibly',
 'Neck rib rebound / diagonal seam puckering / stitch stretch tested',
 'Measure garment on table and compare pre/post wash',
 'Logo does not cross seam, correct scale and position',
 'Any tag / hangtag / care facts confirmed by supplier',
 'Itemized pattern, sewing, fabric, printing and shipping/VAT price',
 'Explicit user approval to order - never infer from concept work']
for i,x in enumerate(gates):
    y=674-i*65
    t(49,y,str(i+1).zfill(2)+' / '+x[:80],9,True if i==8 else False)
    c.setStrokeColor(HexColor('#d5d7cf'));c.line(46,y-18,552,y-18)
c.showPage();c.save()
assert pdf.stat().st_size>30000
print('BUILD_OK',OUT)
print('LOGO_BLOB',blob,'POM',len(measure),'PARTS',len(bom),'SEWING',len(steps),'PDF_BYTES',pdf.stat().st_size)