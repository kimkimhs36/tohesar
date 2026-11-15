# 01 SHADOW — actual tracked binary CI gate / 2026-11-12 KST

## Distinct material step
The previous source-identity R02 script had **only synthetic tests** and was never executed against the real 2500×575 PNG. This new GitHub Actions workflow attempts to close that specific evidence gap on GitHub's runner, not another mockup or local arithmetic report.

- New workflow: `.github/workflows/object-lab-shadow-actual-png-qa.yml`, on the existing PR #38 branch, using real checked-out GitHub binary.
- Runs the existing `shadow_source_provenance_gate_r02.py --png` against the actual tracked PNG, pinned blob `899d2014d8c247fe7e7774b65b6371c6315f72f9`, and `shadow_print_raster_gate_r01.py` for actual pixels/alpha/ivory; also runs existing six raster regression tests.
- Validates explicit negative release fields and emits two JSON receipts as a temporary CI artifact (14-day retention).
- Workflow has **read-only GitHub contents permissions**, no secrets, no vendor network/upload, no seller contact, no external logo submission, no purchases.

## What is and is not proven at this checkpoint
- GitHub API **accepted and saved** the new workflow at `39513d6d0b4fdba2085e04a85ed85ac6d6fcdb13` on existing Draft PR #38. No branch created, no main merge.
- Local syntax parsed via PyYAML. **GitHub Actions run for this workflow: NOT CONFIRMED** at checkpoint; the GitHub commit workflow-runs query returned empty. Do not report source binary PASS until the actual job completes successfully and its receipt is read.
- No real-world print test, vendor import, underbase confirmation, 82mm garment placement, owner-selected size, true printed one-piece quote, wash QC, or order.
- This workflow uses `actions/checkout@v4`, `actions/setup-python@v5`, `actions/upload-artifact@v4` and Pillow installed by pip. Actual dependency availability and runtime success remain subject to CI.

## Next action
1. Recheck PR #38 live head and GitHub Actions for the actual workflow result; inspect logs and both receipts, repair a real failure rather than creating another redundant test.
2. Once binary source passes, move to a genuine manufacturing gate: owner-approved original-logo editor upload for exact 82mm location/print method/one-piece all-in quote, and sample size confirmation. **Do not upload or order without separate owner permission.**
