#!/usr/bin/env python3
"""01 SHADOW: reference-garment fit gate. Pure stdlib, no body measurements.
Input: four flat garment dimensions in cm; results are NOT owner size approval.
"""
import argparse
import json
import math

CHART = {
    'S': (68.5, 52, 55, 21), 'M': (71, 54, 58, 21),
    'L': (73.5, 56, 61, 22), 'XL': (76, 58, 64, 23),
    '2XL': (78.5, 61, 67, 24), '3XL': (81, 64, 70, 25),
}
FIELDS = ('length', 'shoulder', 'flat_chest', 'sleeve')


def evaluate(reference, tolerance=3.0, priorities=(1, 1, 2, 0.5)):
    """Rank nominal deviations; robust bound is worst case ±t on each axis.
    Ranking is advisory; unknown factory correlation and garment fit remain unverified.
    """
    values = tuple(float(x) for x in reference)
    if len(values) != 4 or any(not math.isfinite(x) or x <= 0 for x in values):
        raise ValueError('Provide four finite positive flat garment dimensions')
    t = float(tolerance)
    weights = tuple(float(x) for x in priorities)
    if not math.isfinite(t) or t < 0 or len(weights) != 4 or any(not math.isfinite(w) or w <= 0 for w in weights):
        raise ValueError('Tolerance must be nonnegative; weights must be positive and finite')
    rows = []
    for size, nominal in CHART.items():
        delta = [n-r for n, r in zip(nominal, values)]
        score = sum(w*d*d for w, d in zip(weights, delta))
        worst = [abs(d)+t for d in delta]
        rows.append({'size': size, 'nominal_cm': dict(zip(FIELDS, nominal)),
                     'delta_cm': dict(zip(FIELDS, delta)),
                     'worst_absolute_delta_cm_under_assumption': dict(zip(FIELDS, worst)),
                     'weighted_nominal_squared_error': round(score, 5)})
    rows.sort(key=lambda r: (r['weighted_nominal_squared_error'], list(CHART).index(r['size'])))
    return {'sku': 8178, 'reference_type': 'laid-flat reference tee, NOT body dimensions',
            'reference_cm': dict(zip(FIELDS, values)), 'assumed_independent_tolerance_cm': t,
            'priority_weights': dict(zip(FIELDS, weights)), 'ranked_sizes': rows,
            'suggested_for_review_not_approved': rows[0]['size'],
            'owner_size_approved': False, 'garment_sample_tested': False,
            'vendor_logo_uploaded': False, 'vendor_image_logo_quote_verified': False,
            'caveat': 'Nominal fit comparison only. ±t is hypothetical, not a certified distribution. Reference fabric, wash and fit may differ.'}


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--reference', nargs=4, type=float, required=True,
                   metavar=('LENGTH', 'SHOULDER', 'FLAT_CHEST', 'SLEEVE'))
    p.add_argument('--tolerance', type=float, default=3.0)
    args = p.parse_args()
    print(json.dumps(evaluate(args.reference, args.tolerance), ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
