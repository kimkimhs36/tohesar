"""04 OFFSET SHELL: paired stitch-line seam QA, not a cuttable pattern.
Input JSON: {"upper": [[x_mm,y_mm],...], "lower": [[x_mm,y_mm],...],
"notches_upper": [fraction,...], "notches_lower": [fraction,...],
"max_seam_mismatch_mm": 2.0, "max_notch_mismatch_mm": 2.0}
All coordinates must be actual measured STITCH lines, in mm, same origin.
"""
import json, math, sys

def _points(value):
    if not isinstance(value, list) or len(value)<2: raise ValueError('need >=2 stitch-line points')
    out=[]
    for p in value:
        if not isinstance(p,list) or len(p)!=2 or any(type(v) not in (int,float) or not math.isfinite(v) for v in p): raise ValueError('invalid point')
        out.append(tuple(p))
    if any(math.dist(a,b)==0 for a,b in zip(out,out[1:])): raise ValueError('zero-length segment')
    return out

def _length(points): return sum(math.dist(a,b) for a,b in zip(points,points[1:]))

def assess(data):
    if not isinstance(data,dict): raise ValueError('JSON object required')
    upper,lower=_points(data.get('upper')),_points(data.get('lower'))
    for key in ('max_seam_mismatch_mm','max_notch_mismatch_mm'):
        v=data.get(key,2.0)
        if type(v) not in (int,float) or not math.isfinite(v) or v<0: raise ValueError('invalid '+key)
    su,sl=_length(upper),_length(lower)
    nu,nl=data.get('notches_upper',[]),data.get('notches_lower',[])
    if not isinstance(nu,list) or not isinstance(nl,list) or len(nu)!=len(nl): raise ValueError('notch counts mismatch')
    for seq in (nu,nl):
        if any(type(f) not in (int,float) or not math.isfinite(f) or not 0<f<1 for f in seq): raise ValueError('invalid notch fraction')
        if seq!=sorted(seq) or len(set(seq))!=len(seq): raise ValueError('notches not strictly increasing')
    errors=[abs(a*su-b*sl) for a,b in zip(nu,nl)]
    diff=abs(su-sl)
    return {'status':'REVIEW_ONLY' if diff<=data.get('max_seam_mismatch_mm',2.0) and all(e<=data.get('max_notch_mismatch_mm',2.0) for e in errors) else 'HOLD',
            'upper_stitch_mm':round(su,4),'lower_stitch_mm':round(sl,4),'mismatch_mm':round(diff,4),
            'notch_mismatch_mm':[round(e,4) for e in errors],
            'warning':'Geometry is candidate-only: physical sewing, grainline, seam allowance, ease and patternmaker approval NOT verified.'}

if __name__=='__main__':
    if len(sys.argv)!=2: raise SystemExit('Usage: python offset_seam_pair_gate_r05.py measured-stitch-lines.json')
    with open(sys.argv[1],encoding='utf-8') as f: data=json.load(f)
    print(json.dumps(assess(data),ensure_ascii=False,indent=2))
