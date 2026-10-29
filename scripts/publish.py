#!/usr/bin/env python3
"""Small, explicit editorial CLI. Builds never change draft/review/published."""
from pathlib import Path
from datetime import date
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import argparse,copy,json,re,subprocess,sys
from issue_model import ROOT,load,validate,destination

def write(path,data):(ROOT/path).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
def check():
    issues,content=validate()
    for i in content.values():
        assert i['status'] in ['draft','review','published'],i['id']
        if i['status']!='published':continue
        for k in ['title','url','summary','published_at','image','image_source','image_credit','image_licence']:assert i.get(k),f'{i["id"]}: missing {k}'
        date.fromisoformat(i['published_at'])
        assert destination(i['url']).is_file(),i['url']
        assert destination(i['image']).is_file(),i['image']
        assert all(r in content for r in i['related']),i['id']+' related'
    news=load('journal/data/news.json')['items'];ids=set();urls=set();titles=set()
    for n in news:
        assert n['id'] not in ids,'Duplicate news ID';ids.add(n['id'])
        # Canonical URLs catch tracking-query and terminal slash duplicates.
        u=urlsplit(n.get('url',''));canonical=(u.netloc.lower(),unquote(u.path).rstrip('/'))
        title=re.sub(r'\W','',n.get('title','')).casefold()
        if n.get('url'):
            assert u.scheme=='https' and u.netloc,'News needs HTTPS source'
            assert canonical not in urls,'Duplicate news URL';urls.add(canonical)
        if title:
            assert title not in titles,'Duplicate news title';titles.add(title)
        assert n['status'] in ['draft','review','published'],'News status'
        assert n.get('fact_check_status') in ['pending','verified','rejected'],'Fact check state'
        date.fromisoformat(n['registered_at'])
        if n.get('published_at'):date.fromisoformat(n['published_at'])
        if n['status']=='published':
            for k in ['title','manufacturer','topic','published_at','source','source_title','url','summary','image_usage','verification','verified_at']:assert n.get(k),f'News missing {k}'
            assert n['fact_check_status']=='verified','Unverified news cannot publish'
            assert date.fromisoformat(n['published_at'])<=date.today(),'Future news announcement'
            assert n['topic'] in ['design','culture','industry'],'News topic'
            if n.get('image'):assert n.get('image_source') and n.get('image_licence'),'Image rights missing'
    print(f'CHECK PASS: {len(issues)} editions, {len(content)} stories, {len(news)} news records. No status changed.')

def links():
    class Parser(HTMLParser):
        def __init__(self):super().__init__();self.refs=[];self.ids=set()
        def handle_starttag(self,tag,attrs):
            d=dict(attrs)
            if d.get('id'):self.ids.add(d['id'])
            for key in ['href','src']:
                if d.get(key):self.refs.append(d[key])
            if d.get('srcset'):
                self.refs.extend(x.strip().split()[0] for x in d['srcset'].split(','))
    active=['journal/index.html','journal/911/index.html','journal/f40/index.html','journal/news/index.html','journal/visual/index.html','journal/miniatures/index.html','journal/design/index.html','journal/design/type-01/index.html','journal/design/giulia/index.html','journal/issues/index.html']
    active +=[str(p.relative_to(ROOT)) for p in (ROOT/'journal/issues').glob('*/index.html')]
    cache={};count=0
    for page in active:
        p=ROOT/page;parser=Parser();parser.feed(p.read_text())
        for url in parser.refs:
            u=urlsplit(url)
            if u.scheme or u.netloc or not url or url.startswith('data:'):continue
            target=destination(u.path) if u.path.startswith('/') else ((p.parent/u.path) if u.path else p)
            if target.is_dir():target=target/'index.html'
            assert target.is_file(),f'{page}: missing {url}'
            if u.fragment and target.suffix=='.html':
                if target not in cache:
                    parsed=Parser();parsed.feed(target.read_text());cache[target]=parsed.ids
                assert unquote(u.fragment) in cache[target],f'{page}: missing anchor {url}'
            count+=1
    print(f'LINK PASS: {count} local destinations/anchors across {len(active)} pages')

def build():
    # Body-file entries are authored once; public routes are generated only after explicit publication.
    from build_issues import shell
    for item in load('journal/data/content-index.json')['items']:
        if not item.get('body_file'):continue
        assert item['body_file'].startswith('journal/drafts/') and '..' not in item['body_file'],'Unsafe body path'
        if item['status']!='published':continue
        for k in ['title','summary','image','image_source','image_credit','image_licence']:assert item.get(k),f'Complete story field: {k}'
        p=destination(item['url']);p.parent.mkdir(parents=True,exist_ok=True)
        body=destination('/'+item['body_file']).read_text()
        p.write_text(shell(item['title'],item['summary'],f'<div class="authored-story">{body}</div>'))
    check()
    for script in ['build_giulia.py','build_journal_news.py','build_issues.py','build_design_atlas.py','build_journal_navigation.py']:
        subprocess.run([sys.executable,str(ROOT/'scripts'/script)],cwd=ROOT,check=True)
    links()

def new_issue(number,title):
    assert re.fullmatch(r'\d{3}',number),'Use three digits, e.g. 002'
    d=load('journal/data/issues.json');assert not any(i['number']==number for i in d['issues']),'Issue already exists'
    template=copy.deepcopy(d['issues'][0]);template.update(id='issue-'+number,number=number,title=title,subtitle='편집 주제를 작성하세요',intro='호의 소개문을 작성하세요',editor_note='편집자 노트 초안',editorial='호의 편집 의도를 작성하세요',published_at=date.today().isoformat(),status='draft',url=f'/journal/issues/{number}/')
    d['issues'].append(template);write('journal/data/issues.json',d)
    print(f'Created draft {number}. Edit journal/data/issues.json. Nothing published; no public route generated.')

def new_news(id):
    assert re.fullmatch('[a-z0-9-]+',id),'Use a lowercase slug'
    d=load('journal/data/news.json');assert not any(n['id']==id for n in d['items']),'ID exists'
    d['items'].append(dict(id=id,title='',manufacturer='',topic='design',published_at=None,registered_at=date.today().isoformat(),source='',source_title='',url='',summary='',image=None,image_usage='외부 이미지 사용하지 않음 / 사용 시 권리 검토 필요',status='draft',fact_check_status='pending',verified_at=None,verification=''))
    write('journal/data/news.json',d);print('Created pending draft. Verify official source and rights before setting published.')

def new_story(slug,title):
    assert re.fullmatch('[a-z0-9-]+',slug),'Use a lowercase slug'
    d=load('journal/data/content-index.json');assert not any(n['id']==slug for n in d['items']),'ID exists'
    url=f'/journal/design/{slug}/';p=destination(url);assert not p.exists(),'Route exists'
    d['items'].append(dict(id=slug,title=title,url=url,kind='design-essay',manufacturer=None,model=None,published_at=date.today().isoformat(),vehicle_year=None,forms=[],summary='',image='',image_alt='',image_source='',image_credit='',image_licence='',related=[],keywords=[],status='draft',body_file=f'journal/drafts/{slug}.html'))
    write('journal/data/content-index.json',d)
    # Drafts live outside public routes until the editor prepares and explicitly publishes them.
    p=ROOT/'journal/drafts'/f'{slug}.html';p.parent.mkdir(exist_ok=True)
    from html import escape
    p.write_text(f'<article lang="ko"><h1>{escape(title)}</h1><p>초안: 도입, 관찰, 근거, 결론을 작성하세요.</p><section id="sources"><h2>공식 자료와 이미지 이용 조건</h2><p>출처·연식·트림·권리를 확인하세요.</p></section></article>')
    print(f'Created draft metadata and {p.relative_to(ROOT)}. Edit the body and metadata; after source review, explicitly set status to published and run build.')

def main():
    p=argparse.ArgumentParser(description=__doc__);sub=p.add_subparsers(dest='command',required=True)
    for cmd in ['check','build','links']:sub.add_parser(cmd)
    n=sub.add_parser('new-issue');n.add_argument('number');n.add_argument('--title',default='UNTITLED EDITION')
    n=sub.add_parser('new-news');n.add_argument('id')
    n=sub.add_parser('new-story');n.add_argument('slug');n.add_argument('--title',required=True)
    n=sub.add_parser('preview');n.add_argument('--port',type=int,default=8000)
    a=p.parse_args()
    try:
        if a.command=='check':check()
        elif a.command=='build':build()
        elif a.command=='links':links()
        elif a.command=='new-issue':new_issue(a.number,a.title)
        elif a.command=='new-news':new_news(a.id)
        elif a.command=='new-story':new_story(a.slug,a.title)
        else:subprocess.run([sys.executable,'-m','http.server',str(a.port),'--bind','127.0.0.1','--directory',str(ROOT)],check=True)
    except (AssertionError,ValueError,KeyError) as error:p.exit(1,f'Publication blocked: {error}\n')
if __name__=='__main__':main()
