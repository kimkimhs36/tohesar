"""Compatibility entrypoint: render verified editorial-news records.

The single source of truth and all safety checks live in news_pipeline.py.
External RSS headlines are never promoted to Korean editorial articles here.
"""
from news_pipeline import ROOT, render_pages, validate

if __name__ == "__main__":
    items = validate(ROOT)
    changed = render_pages(ROOT, items, check=False)
    print(f"Rendered {len(items)} verified news records; {changed} page(s) changed.")
