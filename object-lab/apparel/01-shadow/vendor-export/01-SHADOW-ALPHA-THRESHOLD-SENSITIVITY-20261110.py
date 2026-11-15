#!/usr/bin/env python3
"""Read-only TOHEŞAR 01 raster-edge sensitivity measurement. Not vendor approval."""
import argparse
import json
from PIL import Image

THRESHOLDS = (1, 16, 64, 128, 192, 250)

def analyze(path, target_mm=82.0):
    if not (0 < target_mm <= 300):
        raise ValueError('target width must be in (0, 300] mm')
    with Image.open(path) as im:
        if im.format != 'PNG' or im.mode != 'RGBA':
            raise ValueError('RGBA PNG required')
        alpha = im.getchannel('A')
        w, h = im.size
        if (w, h) != (2500, 575):
            raise ValueError('Unexpected source dimensions')
        raw = alpha.tobytes()
    rows = []
    for threshold in THRESHOLDS:
        xs = [x for x in range(w) if any(raw[y*w+x] >= threshold for y in range(h))]
        if not xs:
            raise ValueError(f'No ink at alpha threshold {threshold}')
        left, right = min(xs), max(xs)+1
        rows.append({'alphaThreshold':threshold,'leftPx':left,'rightExclusivePx':right,
                     'visibleWidthPx':right-left,'fullCanvasWidthFor82mm':round(target_mm*w/(right-left),5)})
    return {'source':str(path),'requestedVisibleWidthMm':target_mm,'thresholds':rows,
            'canvasWidthSpreadMm':round(max(x['fullCanvasWidthFor82mm'] for x in rows)-min(x['fullCanvasWidthFor82mm'] for x in rows),5),
            'vendorRasterThresholdVerified':False,'vendorPrintApproved':False}

if __name__ == '__main__':
    ap=argparse.ArgumentParser()
    ap.add_argument('png')
    ap.add_argument('--ink-mm',type=float,default=82.0)
    a=ap.parse_args()
    print(json.dumps(analyze(a.png,a.ink_mm),indent=2))
