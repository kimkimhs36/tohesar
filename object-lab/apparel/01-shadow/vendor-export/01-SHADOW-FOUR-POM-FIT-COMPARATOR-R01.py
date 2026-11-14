#!/usr/bin/env python3
"""Offline garment-to-garment fit screening; never approves a purchase size."""
import argparse
import json

# MARPPLE SKU 8178 public size chart observed 2026-11-10, centimeters.
# Fields: garment length, shoulder width, flat chest width, sleeve length.
CHART = {'S':(68.5,52,55,21),'M':(71,54,58,21),'L':(73.5,56,61,22),
         'XL':(76,58,64,23),'2XL':(78.5,61,67,24),'3XL':(81,64,70,25)}
FIELDS = ('length','shoulder','chest_flat','sleeve')

def compare(reference, limits):
    if (len(reference)!=4 or len(limits)!=4 or
        any(not 0<x<200 for x in reference) or
        any(not 0<=x<100 for x in limits)):
        raise ValueError('Four positive garment dimensions and four nonnegative tolerances in cm required')
    results=[]
    for size,dims in CHART.items():
        delta=[round(v-r,2) for v,r in zip(dims,reference)]
        nominal=all(abs(d)<=lim for d,lim in zip(delta,limits))
        # Seller's 1-3cm variation is NOT certified per-POM tolerance.
        # +/-3cm per POM is a conservative screening assumption, not measurement.
        robust=all(abs(d)+3<=lim for d,lim in zip(delta,limits))
        possible=all(max(0,abs(d)-3)<=lim for d,lim in zip(delta,limits))
        verdict=('ROBUST_SCREEN' if robust else
                 'CONDITIONAL_MEASURE' if possible else 'EXCLUDE_SCREEN')
        results.append({'size':size,'seller_cm':dict(zip(FIELDS,dims)),
                        'delta_from_reference_cm':dict(zip(FIELDS,delta)),
                        'nominal_within_preferences':nominal,'screen':verdict})
    return results

def main():
    p=argparse.ArgumentParser(description='Private offline fit comparison; no network or file writes.')
    for f in FIELDS:
        p.add_argument('--'+f.replace('_','-'),type=float,required=True)
    p.add_argument('--tolerances',nargs=4,type=float,default=[3,3,3,3],
                   metavar=('LENGTH','SHOULDER','CHEST','SLEEVE'))
    a=p.parse_args()
    print(json.dumps({'sku':8178,'seller_chart_date':'2026-11-10',
                      'status':'SCREENING_ONLY_NOT_SIZE_APPROVAL',
                      'results':compare([getattr(a,f) for f in FIELDS],a.tolerances)},
                     ensure_ascii=False,indent=2))

if __name__=='__main__':
    main()
