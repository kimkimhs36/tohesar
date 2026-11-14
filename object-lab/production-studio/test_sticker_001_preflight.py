#!/usr/bin/env python3
"""Negative mutation tests: STICKER 001 preflight MUST reject tampering.
Uses Python standard library only; original SVG files are never written.
"""
import tempfile
from pathlib import Path
from unittest import TestCase, main
from xml.etree import ElementTree as ET
import preflight_sticker_001 as pf

class StickerMutationTests(TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = pf.STICKER.read_bytes()
        cls.wordmark = pf.ORIGINAL.read_bytes()
        cls.bleed = pf.BLEED.read_bytes()
    def test_known_git_blob_identity(self):
        self.assertEqual(pf.blobsha(self.source), pf.EXPECTED_STICKER_BLOB)
        self.assertEqual(pf.blobsha(self.wordmark), pf.EXPECTED_ORIGINAL_BLOB)
    def test_original_path_identical(self):
        s=ET.fromstring(self.source); o=ET.fromstring(self.wordmark)
        self.assertEqual(pf.find(s,"path")[0].get("d"),pf.find(o,"path")[0].get("d"))
    def test_changed_glyph_fails_blob(self):
        changed=self.source.replace(b"#F8F2E7",b"#F8F2E8",1)
        self.assertNotEqual(pf.blobsha(changed),pf.EXPECTED_STICKER_BLOB)
    def test_changed_geometry_fails_blob(self):
        changed=self.source.replace(b'width="100mm"',b'width="101mm"',1)
        self.assertNotEqual(pf.blobsha(changed),pf.EXPECTED_STICKER_BLOB)
    def test_xml_undeclared_entity_rejected(self):
        with self.assertRaises(ET.ParseError):
            ET.fromstring(b'<svg xmlns="http://www.w3.org/2000/svg">&unresolved;</svg>')
    def test_provisional_bleed_is_not_final(self):
        root=ET.fromstring(self.bleed)
        self.assertEqual((root.get("width"),root.get("height")),("106mm","36mm"))
        self.assertIn(b"NOT APPROVED FOR PRINT",self.bleed)
    def test_no_external_image_in_original(self):
        root=ET.fromstring(self.source)
        self.assertFalse(pf.find(root,"image"))
        self.assertFalse(pf.find(root,"text"))
    def test_negative_mutation_does_not_modify_files(self):
        with tempfile.TemporaryDirectory() as d:
            scratch=Path(d)/"tampered.svg"
            scratch.write_bytes(self.source.replace(b"#10110F",b"#10110E",1))
            self.assertNotEqual(pf.blobsha(scratch.read_bytes()),pf.EXPECTED_STICKER_BLOB)
        self.assertEqual(pf.STICKER.read_bytes(),self.source)
if __name__=="__main__":
    main(verbosity=2)
