"""Deterministic feed integrity tests; never require network."""
import unittest,tempfile,json
from pathlib import Path
from datetime import datetime,timezone
from unittest.mock import patch
import refresh_news as news

class FeedTests(unittest.TestCase):
    def setUp(self):self.now=datetime(2026,10,28,tzinfo=timezone.utc);self.source=news.FEEDS[0]
    def test_dates(self):
        self.assertIsNotNone(news.parse_date('Tue, 27 Oct 2026 09:00:00 GMT',self.now))
        for value in ['not a date','2025-01-01T00:00:00Z','2026-11-01T00:00:00Z']:
            self.assertIsNone(news.parse_date(value,self.now))
    def test_url_boundary(self):
        for url in ['http://newsroom.porsche.com/test','https://evil.test/a','https://newsroom.porsche.com@evil.test/']:
            self.assertIsNone(news.safe_url(url,self.source))
        self.assertEqual(news.safe_url('https://newsroom.porsche.com/a?utm_source=x&id=1',self.source),'https://newsroom.porsche.com/a?id=1')
    def test_atom_and_provenance(self):
        data=b'<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>Porsche new design</title><link href="https://newsroom.porsche.com/a"/><published>2026-10-27T09:00:00Z</published></entry></feed>'
        item=news.parse_feed(data,self.source,self.now)[0]
        self.assertFalse(item['fact_checked']);self.assertEqual(item['brands'],['Porsche']);self.assertIn('collected_at',item)
    def test_all_feeds_fail_keep_snapshot_timestamp(self):
        with tempfile.TemporaryDirectory() as d:
            out=Path(d)/'news.json';out.write_text(json.dumps({'generated_at':'2026-10-15T00:00:00Z','items':[{'title':'Previous record'}]}))
            with patch.object(news,'read_source',side_effect=OSError('offline')):self.assertEqual(news.refresh(out),0)
            result=json.loads(out.read_text());self.assertEqual(result['generated_at'],'2026-10-15T00:00:00Z');self.assertEqual(len(result['items']),1);self.assertEqual(result['status'],'unavailable')
    def test_headline_topic_inference_is_labelled_not_fact_checked(self):
        examples = {
            'Porsche design concept unveiled': 'design',
            'MotoGP motorcycle racing update': 'motorcycles',
            'Le Mans racecar history': 'motorsport',
            'New electric battery manufacturing line': 'technology',
            'Automaker earnings and market outlook': 'industry',
            'New two-door sports car announced': 'new-cars',
        }
        for title, expected in examples.items():
            self.assertEqual(news.infer_topic(title), expected, title)
        data=b'<rss><channel><item><title>Porsche new design concept</title><link>https://newsroom.porsche.com/en/a</link><pubDate>Tue, 27 Oct 2026 09:00:00 GMT</pubDate></item></channel></rss>'
        entry=news.parse_feed(data,self.source,self.now)[0]
        self.assertEqual(entry['category'],'design')
        self.assertEqual(entry['classification'],'headline-keywords')
        self.assertFalse(entry['fact_checked'])
    def test_no_snapshot_and_no_network_fails(self):
        with tempfile.TemporaryDirectory() as d,patch.object(news,'read_source',side_effect=OSError('offline')):
            self.assertEqual(news.refresh(Path(d)/'missing.json'),1)
if __name__=='__main__':unittest.main()
