import unittest
from PIL import Image
from shadow_print_raster_gate_r01 import inspect, IVORY


class RasterTests(unittest.TestCase):
    def sample(self):
        im = Image.new("RGBA", (12, 4), (0, 0, 0, 0))
        im.putpixel((3, 2), (*IVORY, 255))
        im.putpixel((4, 2), (*IVORY, 128))
        return im

    def test_alpha_coverage_and_no_vendor_claim(self):
        r = inspect(self.sample(), False)
        self.assertEqual((r["visible_pixels"], r["opaque_pixels"], r["antialiased_partial_alpha_pixels"]), (2, 1, 1))
        self.assertEqual(r["alpha_bbox_px"], [3, 2, 5, 3])
        self.assertFalse(r["white_underbase_verified"])
        self.assertFalse(r["physical_print_tested"])
        self.assertFalse(r["vendor_logo_uploaded"])

    def test_allow_realistic_partial_alpha_fringe(self):
        im = self.sample()
        im.putpixel((4, 2), (255, 255, 239, 16))
        r = inspect(im, False)
        self.assertEqual(r["partial_alpha_nonexact_ivory_pixels"], 1)
        self.assertEqual(r["partial_alpha_max_channel_delta"], 13)
        self.assertTrue(r["opaque_pixels_all_exact_ivory"])

    def test_exact_limit_accepted(self):
        im = self.sample()
        im.putpixel((4, 2), (232, 242, 231, 120))
        self.assertEqual(inspect(im, False)["partial_alpha_max_channel_delta"], 16)

    def test_partial_alpha_color_outside_limit_rejected(self):
        im = self.sample()
        im.putpixel((4, 2), (231, 242, 231, 16))
        with self.assertRaisesRegex(ValueError, "Partial-alpha"): inspect(im, False)

    def test_opaque_wrong_color_even_by_one_rejected(self):
        im = self.sample()
        im.putpixel((3, 2), (247, 242, 231, 255))
        with self.assertRaisesRegex(ValueError, "Opaque artwork"): inspect(im, False)

    def test_opaque_white_rejected(self):
        im = self.sample()
        im.putpixel((4, 2), (255, 255, 255, 255))
        with self.assertRaisesRegex(ValueError, "unexpected colors"): inspect(im, False)

    def test_transparent_nonivory_rgb_irrelevant(self):
        im = self.sample()
        im.putpixel((0, 0), (255, 0, 0, 0))
        self.assertEqual(inspect(im, False)["visible_rgb"], "#F8F2E7")

    def test_no_logo_rejected(self):
        with self.assertRaisesRegex(ValueError, "No visible"): inspect(Image.new("RGBA", (12, 4), (0, 0, 0, 0)), False)

    def test_only_partial_no_core_rejected(self):
        im = Image.new("RGBA", (12, 4), (0, 0, 0, 0))
        im.putpixel((3, 2), (*IVORY, 128))
        with self.assertRaisesRegex(ValueError, "No opaque"): inspect(im, False)

    def test_opaque_background_rejected(self):
        with self.assertRaisesRegex(ValueError, "Transparent background"): inspect(Image.new("RGBA", (12, 4), (*IVORY, 255)), False)

    def test_size_rejected(self):
        with self.assertRaisesRegex(ValueError, "Unexpected PNG size"): inspect(self.sample())


if __name__ == "__main__":
    unittest.main()
