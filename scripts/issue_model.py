"""Shared, dependency-free publication validation. No status is promoted by a build."""
from pathlib import Path
from datetime import date
import json,re
ROOT=Path(__file__).resolve().parents[1]
def load(path):return json.loads((ROOT/path).read_text())
def destination(url):
    path=url.split('#')[0].split('?')[0]
    assert path.startswith('/') and '..' not in path, f'Unsafe local URL: {url}'
    p=ROOT/path.lstrip('/')
    return p/'index.html' if path.endswith('/') else p

def validate():
    content=load('journal/data/content-index.json')['items'];issues=load('journal/data/issues.json')['issues']
    ids=[x['id'] for x in content];assert len(ids)==len(set(ids)), 'Duplicate content ID'
    by_id={i['id']:i for i in content}
    seen=set();numbers=set();urls=set()
    for i in issues:
        for k in ['id','number','title','subtitle','published_at','status','visual','image_source','image_credit','image_licence','chapters','url','intro']:assert i.get(k),f'Issue missing {k}'
        assert i['id'] not in seen and i['number'] not in numbers and i['url'] not in urls,'Duplicate issue'
        seen.add(i['id']);numbers.add(i['number']);urls.add(i['url'])
        assert re.fullmatch(r'\d{3}',i['number']) and i['url']==f'/journal/issues/{i["number"]}/','Issue number/URL mismatch'
        assert i['status'] in ['draft','review','published'],'Invalid status'
        date.fromisoformat(i['published_at'])
        linked=set()
        for c in i['chapters']:
            assert c['content_id'] in by_id,f'Unknown content: {c["content_id"]}'
            assert c['content_id'] not in linked,'Repeated chapter';linked.add(c['content_id'])
            assert c['layout'] in ['curve','edge','proportion','language','small'],'Unknown layout'
            for key in ['title','heading','note','transition']:assert c.get(key),f'Missing chapter {key}'
            item=by_id[c['content_id']]
            if i['status']=='published':
                assert item['status']=='published','Published issue references unpublished content'
                assert destination(item['url']).is_file(),f'Missing story: {item["url"]}'
        if i['status']=='published':
            assert date.fromisoformat(i['published_at'])<=date.today(),'Future issue cannot publish'
            assert destination(i['visual']).is_file(),'Missing issue image'
    return issues,by_id
if __name__=='__main__':
    issues,content=validate();print(f'Valid: {len(issues)} issues, {len(content)} editorial records')
