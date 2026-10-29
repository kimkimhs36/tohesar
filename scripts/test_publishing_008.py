"""Publication safety tests run in a disposable checkout copy, never in the working data."""
import unittest,tempfile,shutil,subprocess,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class Publishing(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.root=Path(self.temp.name)
        shutil.copy(ROOT/'index.html',self.root/'index.html')
        for name in ['scripts','journal']:
            shutil.copytree(ROOT/name,self.root/name,ignore=shutil.ignore_patterns('__pycache__'))
        for name in ['assets','edition','creative']:(self.root/name).symlink_to(ROOT/name,target_is_directory=True)
        # 011 articles cite the public provenance/collection document. Keep the
        # isolated fixture faithful to that link; link validation stays enabled.
        review=self.root/'docs/wallpaper-011-review'
        review.mkdir(parents=True)
        shutil.copy(ROOT/'docs/wallpaper-011-review/index.html',review/'index.html')
    def tearDown(self):self.temp.cleanup()
    def runcli(self,*args,ok=True):
        r=subprocess.run(['python3','scripts/publish.py',*args],cwd=self.root,capture_output=True,text=True)
        self.assertEqual(r.returncode==0,ok,r.stdout+r.stderr);return r
    def data(self,name):return json.loads((self.root/'journal/data'/name).read_text())
    def save(self,name,d):(self.root/'journal/data'/name).write_text(json.dumps(d,ensure_ascii=False))
    def test_draft_issue_never_public_and_build_idempotent(self):
        self.runcli('new-issue','002','--title','DRAFT ONLY')
        self.runcli('build');self.assertFalse((self.root/'journal/issues/002/index.html').exists())
        archive=(self.root/'journal/issues/index.html').read_text();self.assertNotIn('DRAFT ONLY',archive)
        files=list((self.root/'journal').rglob('*.html'));before={p:p.read_bytes() for p in files}
        self.runcli('build');self.assertEqual(before,{p:p.read_bytes() for p in files})
        self.assertEqual(self.data('issues.json')['issues'][-1]['status'],'draft')
    def test_bad_content_reference_blocks(self):
        d=self.data('issues.json');d['issues'][0]['chapters'][0]['content_id']='missing';self.save('issues.json',d);self.runcli('check',ok=False)
    def test_pending_news_never_public(self):
        self.runcli('new-news','unverified-candidate');self.runcli('build')
        self.assertNotIn('unverified-candidate',(self.root/'journal/news/index.html').read_text())
        d=self.data('news.json');d['items'][-1]['status']='published';self.save('news.json',d);self.runcli('check',ok=False)
    def test_duplicate_source_blocks(self):
        d=self.data('news.json');d['items'][1]['url']=d['items'][0]['url']+'?tracking=test';self.save('news.json',d);self.runcli('check',ok=False)
    def test_unpublish_removes_generated_edition(self):
        d=self.data('issues.json');d['issues'][0]['status']='review';self.save('issues.json',d)
        self.runcli('build',ok=False);self.assertFalse((self.root/'journal/issues/001/index.html').exists())
    def test_story_draft_kept_out_of_search(self):
        self.runcli('new-story','new-design-note','--title','A new draft');self.runcli('build')
        self.assertNotIn('new-design-note',(self.root/'journal/design/index.html').read_text())
        self.assertTrue((self.root/'journal/drafts/new-design-note.html').exists())
if __name__=='__main__':unittest.main()
