"""Editorial Radar 037: never promote unverified publisher headlines to articles."""
import copy
from datetime import datetime, timedelta, timezone
import tempfile
from pathlib import Path
import unittest

import news_candidates as radar


NOW = datetime(2026, 11, 4, 10, 0, tzinfo=timezone.utc)


def entry(source_id="porsche", title="Porsche reveals new GT concept design",
          path="/en/2026/products/new-gt-design-1.html", age_hours=2, **changes):
    source = radar.SOURCES[source_id]
    host = sorted(source["hosts"])[0]
    data = {
        "id": f"{source_id}-abc123",
        "title": title,
        "source": source["name"],
        "source_id": source_id,
        "url": f"https://{host}{path}",
        "published_at": (NOW - timedelta(hours=age_hours)).isoformat(),
        "category": "design",
        "classification": "headline-keywords",
        "language": "en",
        "collected_at": NOW.isoformat(),
        "fact_checked": False,
        "kind": "publisher-headline",
    }
    data.update(changes)
    return data


def feed(items, status="live", generated_at=None):
    return {
        "status": status,
        "generated_at": generated_at or NOW.isoformat(),
        "items": items,
    }


def journal(items=None):
    return {"schema_version": 1, "items": items if items is not None else []}


class RadarTests(unittest.TestCase):
    def choose(self, items, curated=None, **opts):
        return radar.report(feed(items), journal(curated), now=NOW, **opts)

    def test_relevant_design_candidate_is_unverified_and_not_an_article(self):
        result = self.choose([entry()])
        self.assertEqual(len(result["candidates"]), 1)
        item = result["candidates"][0]
        self.assertFalse(item["fact_checked"])
        self.assertFalse(result["publication_permitted"])
        self.assertEqual(item["status"], "needs-independent-source-review")
        self.assertNotIn("summary", item)
        self.assertNotIn("body", item)
        self.assertEqual(len(item["required_checks"]), 5)

    def test_exact_already_published_source_is_removed(self):
        source = entry()
        existing = [{"id": "porsche-story", "source_title": "Other",
                     "url": source["url"] + "?utm_campaign=abc", "status": "published"}]
        result = self.choose([source], existing)
        self.assertEqual(result["counts"]["previously_covered"], 1)
        self.assertFalse(result["candidates"])

    def test_draft_source_is_reserved_against_duplicate_pr(self):
        source = entry()
        existing = [{"id": "draft", "url": source["url"], "status": "review"}]
        self.assertFalse(self.choose([source], existing)["candidates"])

    def test_already_covered_english_source_title_is_filtered(self):
        source = entry()
        existing = [{"id": "old", "source_title": source["title"], "url": "https://other.example.com/old"}]
        self.assertFalse(self.choose([source], existing)["candidates"])

    def test_duplicate_wire_entries_are_filtered(self):
        one = entry()
        two = entry(path="/en/2026/products/new-gt-design-2.html")
        self.assertEqual(len(self.choose([one, two])["candidates"]), 1)

    def test_drops_items_that_claim_being_verified_or_missing_source(self):
        invalid = [
            entry(fact_checked=True),
            entry(source="Untrusted Site", title="Porsche new design"),
            dict(entry(title="Another new concept"), source_id="unknown"),
            entry(language="xx", title="Design model debut"),
        ]
        self.assertEqual(len(self.choose(invalid)["candidates"]), 0)

    def test_rejects_untrusted_host_and_http_source(self):
        self.assertEqual(
            len(self.choose([
                entry(url="https://newsroom.porsche.com@evil.test/article"),
                entry(url="http://newsroom.porsche.com/new-gt"),
            ])["candidates"]), 0
        )

    def test_stale_snapshot_does_not_claim_freshness(self):
        stale = (NOW - timedelta(hours=6)).isoformat()
        result = radar.report(feed([entry()], generated_at=stale), journal(), now=NOW)
        self.assertEqual(len(result["candidates"]), 0)
        self.assertIn("stale", result["warnings"][0].lower())

    def test_failed_refresh_is_review_empty_even_with_cached_items(self):
        result = radar.report(feed([entry()], status="unavailable"), journal(), now=NOW)
        self.assertFalse(result["candidates"])
        self.assertIn("not confirmed", result["warnings"][0])

    def test_old_and_future_items_do_not_appear(self):
        self.assertEqual(len(self.choose([
            entry(age_hours=72),
            entry(path="/future", title="Future concept car", age_hours=-2),
        ])["candidates"]), 0)

    def test_source_balance_retains_another_manufacturer(self):
        candidates = [
            entry(path=f"/porsche-design-{i}", title=f"Porsche introduces design concept {i}")
            for i in range(5)
        ]
        candidates += [entry("bmw", "BMW new design language", path="/global/article")]
        result = self.choose(candidates, limit=4)
        self.assertEqual(len(result["candidates"]), 3)
        self.assertIn("bmw", {c["source_id"] for c in result["candidates"]})
        self.assertEqual(sum(c["source_id"] == "porsche" for c in result["candidates"]), 2)

    def test_ranking_values_design_over_industry_if_time_same(self):
        design = entry("porsche", "Porsche reveals design study", path="/design")
        industry = entry("porsche", "Porsche quarterly earnings and shares", path="/earnings",
                         category="industry")
        result = self.choose([industry, design])
        self.assertEqual(result["candidates"][0]["headline"], design["title"])

    def test_irrelevant_job_cuts_are_excluded_even_if_recent(self):
        story = entry("motor1", "BMW Is Reportedly Cutting 1,800 Jobs In China",
                      path="/news/bmw-jobs-in-china", category="new-cars")
        output = self.choose([story])
        self.assertEqual(output["candidates"], [])
        self.assertEqual(output["counts"]["low_priority"], 1)

    def test_headline_heuristics_cannot_reclassify_layoffs_as_new_cars(self):
        story = entry("motor1", "Nissan layoffs impact global workforce",
                      path="/news/nissan-workforce-2026", category="new-cars")
        result = self.choose([story], min_priority=0)
        self.assertFalse(result["candidates"])
        self.assertEqual(result["counts"]["low_priority"], 1)

    def test_low_priority_cutoff_can_be_tuned_for_review_only(self):
        story = entry("porsche", "Porsche factory update",
                      path="/en/industry/factory", category="industry")
        strict = self.choose([story], min_priority=50)
        open_review = self.choose([story], min_priority=0)
        self.assertEqual(strict["candidates"], [])
        self.assertEqual(len(open_review["candidates"]), 1)
        self.assertFalse(open_review["publication_permitted"])

    def test_repeat_runs_are_deterministic_with_fixed_now(self):
        items = [entry(path="/a", title="Porsche new design A"),
                 entry("bmw", "BMW concept vehicle", path="/b")]
        first = self.choose(items)
        second = self.choose(copy.deepcopy(items))
        self.assertEqual(first, second)

    def test_rejects_invalid_bounds_and_naive_time(self):
        with self.assertRaises(ValueError):
            radar.report(feed([]), journal(), now=NOW.replace(tzinfo=None))
        with self.assertRaises(ValueError):
            self.choose([], limit=100)

    def test_non_json_input_is_safely_empty(self):
        result = radar.report({"status": "live", "generated_at": NOW.isoformat(), "items": "bad"},
                              journal(), now=NOW)
        self.assertFalse(result["candidates"])
        self.assertTrue(result["warnings"])


if __name__ == "__main__":
    unittest.main()
