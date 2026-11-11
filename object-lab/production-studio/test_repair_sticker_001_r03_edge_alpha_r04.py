import io
import tempfile
import unittest
from pathlib import Path
from PIL import Image
from repair_sticker_001_r03_edge_alpha_r04 import (
    BACKGROUND, EXPECTED_SIZE, inspect_source, repair, build
)

class StickerEdgeFixTests(unittest.TestCase):
    def fixture(self, w=8, h=6):
        im=Image.new("RGBA",(w,h),BACKGROUND)
        p=im.load()
        for y in range(h):
            p[0,y]=(16,17,14,178)
            p[w-1,y]=(16,17,14,178)
        p[4,2]=(248,242,231,255)
        return im

    def test_repair_exact_inside(self):
        im=self.fixture()
        fixed,result=repair(im,False)
        self.assertEqual(result["changed_pixels"],12)
        self.assertEqual(result["interior_pixels_exact"],36)
        self.assertEqual(fixed.getchannel("A").getextrema(),(255,255))
        self.assertEqual(fixed.getpixel((4,2)),(248,242,231,255))
        for y in range(6):
            self.assertEqual(fixed.getpixel((0,y)),BACKGROUND)
            self.assertEqual(fixed.getpixel((7,y)),BACKGROUND)
        self.assertEqual(im.getpixel((0,0))[3],178)

    def test_unexpected_inner_alpha_must_abort(self):
        im=self.fixture()
        im.putpixel((3,2),(248,242,231,200))
        with self.assertRaisesRegex(ValueError,"inner pixels"):
            repair(im,False)

    def test_source_size_guard(self):
        with self.assertRaisesRegex(ValueError,"dimensions"):
            inspect_source(self.fixture())

    def test_edge_count_guard(self):
        im=Image.new("RGBA",EXPECTED_SIZE,BACKGROUND)
        with self.assertRaisesRegex(ValueError,"edge-alpha"):
            inspect_source(im)

    def test_refuse_modified_art_or_input_overwrite(self):
        with tempfile.TemporaryDirectory() as td:
            root=Path(td)
            src=root/"changed.png"
            self.fixture().save(src)
            with self.assertRaisesRegex(ValueError,"SHA changed"):
                build(src,root/"out.png",root/"qa.json")

    def test_alpha_path_not_legal_vendor_approval(self):
        _,result=repair(self.fixture(),False)
        self.assertFalse(result["style_or_original_glyph_changed"])

if __name__=="__main__":
    unittest.main(verbosity=2)
