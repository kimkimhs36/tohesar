#!/usr/bin/env python3
"""Run the REAL repository artwork through the existing preflight, then prove mutations fail.
No network, vendor upload, or modification of the master. Requires Pillow.
Usage: python object-lab/apparel/01-shadow/vendor-export/test_01_shadow_source_preflight_20261110.py
"""
import importlib.util
import json
from pathlib import Path
from tempfile import TemporaryDirectory
from PIL import Image

HERE = Path(__file__).resolve().parent
SOURCE = HERE / "01-SHADOW-82MM-IVORY-TRANSPARENT-2500PX-UNAPPROVED.png"
GATE = HERE / "01-SHADOW-PRINT-ASSET-PREFLIGHT-20261110.py"

def load_gate():
    spec = importlib.util.spec_from_file_location("shadow_preflight", GATE)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

def main():
    if not SOURCE.is_file():
        raise SystemExit("FAIL: original PNG not available; cannot substitute synthetic image")
    gate = load_gate()
    report = gate.inspect(SOURCE, 82.0)
    assert report["localPreflightPass"], json.dumps(report, indent=2)
    assert report["originalSourceIntegrityPass"] and report["opaqueIvoryPass"] and report["geometryPass"]
    assert abs(report["requiredFullCanvasWidthMm"] - 82.42863) < 0.0001
    print("PASS: actual source preflight", json.dumps({
        "sourceGitBlobSha1": report["sourceGitBlobSha1"],
        "pixelSize": report["pixelSize"],
        "alphaBBoxExclusive": report["alphaBBoxExclusive"],
        "requiredFullCanvasWidthMm": report["requiredFullCanvasWidthMm"]
    }))
    with TemporaryDirectory() as tmp:
        altered = Path(tmp) / "altered.png"
        with Image.open(SOURCE) as src:
            im = src.copy()
        # Change a near-opaque logo pixel, not a transparent pixel.
        p = im.load()
        candidate = next(((x, y) for y in range(im.height)
                          for x in range(im.width) if p[x, y][3] >= 250), None)
        assert candidate is not None
        p[candidate] = (0, 0, 0, 255)
        im.save(altered)
        bad = gate.inspect(altered, 82.0)
        assert not bad["originalSourceIntegrityPass"]
        assert not bad["opaqueIvoryPass"]
        assert not bad["localPreflightPass"]
        print("PASS: modified source rejected (identity and ivory)")
    print("NOT TESTED: vendor rasterization, real garment, print method, placement, price, wash.")

if __name__ == "__main__":
    main()
