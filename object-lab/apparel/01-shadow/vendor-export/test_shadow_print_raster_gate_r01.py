import unittest
from PIL import Image
from shadow_print_raster_gate_r01 import inspect,IVORY

class RasterTests(unittest.TestCase):
    def sample(self):
        im=Image.new("RGBA",(12,4),(0,0,0,0))
        im.putpixel((3,2),(*IVORY,255))
        im.putpixel((4,2),(*IVORY,128))
        return im
    def test_alpha_coverage(self):
        r=inspect(self.sample(),False)
        self.assertEqual((r["visible_pixels"],r["opaque_pixels"],r["antialiased_partial_alpha_pixels"]),(2,1,1))
        self.assertEqual(r["alpha_bbox_px"],[3,2,5,3])
        self.assertFalse(r["white_underbase_verified"])
    def test_no_logo(self):
        with self.assertRaisesRegex(ValueError,"No visible"):
            inspect(Image.new("RGBA",(12,4),(0,0,0,0)),False)
    def test_opaque_background_rejected(self):
        with self.assertRaisesRegex(ValueError,"Transparent background"):
            inspect(Image.new("RGBA",(12,4),(*IVORY,255)),False)
    def test_wrong_visible_color(self):
        im=self.sample();im.putpixel((4,2),(255,255,255,255))
        with self.assertRaisesRegex(ValueError,"unexpected colors"):inspect(im,False)
    def test_dimensions(self):
        with self.assertRaisesRegex(ValueError,"Unexpected PNG size"):inspect(self.sample())
    def test_transparent_rgb_irrelevant(self):
        im=self.sample();im.putpixel((0,0),(255,0,0,0))
        self.assertEqual(inspect(im,False)["visible_rgb"],"#F8F2E7")
if __name__=="__main__":unittest.main()
