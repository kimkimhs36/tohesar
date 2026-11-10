#!/usr/bin/env python3
"""01 SHADOW: rank SKU 8178 against measurements of an existing tee.
No automatic size approval, personal data storage, vendor contact or checkout.
"""
import argparse
import json
from pathlib import Path

MEASURES = ('garmentLength', 'shoulderWidth', 'chestWidthFlat', 'sleeveLength')

def compare(chart, reference, desired_delta, weights):
    target = [a + b for a, b in zip(reference, desired_delta)]
    rows = []
    for size, measurements in chart.items():
        if len(measurements) != 4:
            raise ValueError(f'{size}: expected four dimensions')
        diffs = [round(x - y, 2) for x, y in zip(measurements, target)]
        score = round(sum(w * abs(d) for w, d in zip(weights, diffs)), 3)
        rows.append({'size': size, 'sellerNominalCm': measurements,
                     'differenceFromDesiredCm': diffs, 'weightedAbsoluteDeviation': score})
    return sorted(rows, key=lambda r: (r['weightedAbsoluteDeviation'], r['size']))

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--chart', type=Path, default=Path(__file__).with_name('VERIFIED-SIZE-CHARTS-4SKU-20261110.json'))
    p.add_argument('--reference', nargs=4, type=float, required=True, metavar=('LENGTH', 'SHOULDER', 'CHEST_FLAT', 'SLEEVE'))
    p.add_argument('--delta', nargs=4, type=float, default=[0,0,0,0], metavar=('LENGTH', 'SHOULDER', 'CHEST_FLAT', 'SLEEVE'))
    p.add_argument('--weights', nargs=4, type=float, default=[1,1,1,1])
    args = p.parse_args()
    if any(w <= 0 for w in args.weights): p.error('weights must be positive')
    if any(v <= 0 for v in args.reference): p.error('reference dimensions must be positive')
    data = json.loads(args.chart.read_text(encoding='utf-8'))
    assert data['measureDefinitions'] == list(MEASURES)
    rows = compare(data['bySku']['8178']['sizes'], args.reference, args.delta, args.weights)
    print(json.dumps({'sku':8178,'sourceDate':data['checkedLocalDate'],
        'referenceCm':args.reference,'desiredChangeCm':args.delta,
        'rankedNominalCandidates':rows,'selectedSize':None,
        'sellerMeasurementToleranceNote':data['bySku']['8178']['sellerNote'],
        'fitApproved':False,'physicalSampleTested':False,
        'caveat':'Ranking is only nominal distance from a measured existing tee; no body measurement, shrinkage prediction, stock or fit guarantee.'},ensure_ascii=False,indent=2))

if __name__ == '__main__': main()
