#!/usr/bin/env python3
"""Public TOHEŞAR map must not forget published stories or participation."""
from html.parser import HTMLParser
from pathlib import Path
import unittest
ROOT=Path(__file__).resolve().parents[1]

class Links(HTMLParser):
    def __init__(self):
        super().__init__();self.links=[]
    def handle_starttag(self,tag,attrs):
        if tag=="a":
            href=dict(attrs).get("href","")
            if href.startswith("/") and not href.startswith("//"):
                self.links.append(href)

class SiteMapQA(unittest.TestCase):
    def test_discovery_destinations_exist(self):
        html=(ROOT/"sitemap/index.html").read_text(encoding="utf-8")
        p=Links();p.feed(html)
        required=(
          "/journal/","/journal/911/","/journal/f40/",
          "/journal/design/giulia/","/journal/design/type-01/",
          "/journal/field-notes/001/","/journal/issues/001/",
          "/edition/","/owner-stories/","/owner-stories/story-card/",
        )
        for route in required:
            with self.subTest(route=route):
                self.assertIn(route,p.links)
                self.assertTrue((ROOT/route.strip("/")/"index.html").is_file())
    def test_source_generator_keeps_new_content(self):
        generator=(ROOT/"scripts/build_site_map.py").read_text(encoding="utf-8")
        for fragment in ('/journal/field-notes/001/','/owner-stories/story-card/',
                         'navigation.css?v=20261108','{shortcuts}{nav}</header>'):
            with self.subTest(fragment=fragment):
                self.assertIn(fragment,generator)
    def test_button_and_accessibility(self):
        html=(ROOT/"sitemap/index.html").read_text(encoding="utf-8")
        self.assertIn('class="thz-menu-icon"',html)
        self.assertIn('class="thz-label-menu">메뉴',html)
        self.assertEqual(html.count('class="site-shortcuts"'),1)
        self.assertNotIn('사이트 메뉴">Index',html)

if __name__=="__main__":
    unittest.main()
