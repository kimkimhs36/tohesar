#!/usr/bin/env python3
"""TOHEŞAR GitHub Pages source desk.

Small public RSS index; no article body, photos, AI rewriting or auto-publication.
The collector is deliberately server-side in GitHub Actions, not a Pages API.
"""
from __future__ import annotations
import json
import html
import re
import os
import sys
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DEST = ROOT / "edition" / "data" / "live.json"
SOURCES = (
    {"id":"porsche","name":"Porsche Newsroom",
     "feed":"https://newsroom.porsche.com/rss/en/index.rss",
     "hosts":{"newsroom.porsche.com"}},
    {"id":"bmw","name":"BMW Group PressClub",
     "feed":"https://www.press.bmwgroup.com/global/rss",
     "hosts":{"www.press.bmwgroup.com","press.bmwgroup.com"}},
    {"id":"motor1","name":"Motor1",
     "feed":"https://www.motor1.com/rss/news/all/",
     "hosts":{"motor1.com","www.motor1.com"}},
)
NOW=datetime.now(timezone.utc)
CUTOFF=NOW-timedelta(days=45)
MAX_BYTES=1_500_000
ALLOWED_CATEGORIES={"new-cars","design","technology","motorsport","motorcycles"}
TAG_CLEAN=re.compile(r"<[^>]+>")
WHITESPACE=re.compile(r"\s+")

def text_only(value:str|None)->str:
    value=html.unescape(value or "")
    return WHITESPACE.sub(" ", TAG_CLEAN.sub("",value)).strip()

def simple_name(tag:str)->str:
    return tag.split("}",1)[-1].split(":")[-1].lower()

def content(node:ET.Element, name:str)->str:
    for element in node:
        if simple_name(element.tag)==name.lower():
            return "".join(element.itertext()).strip()
    return ""

def article_link(node:ET.Element)->str:
    # RSS <link>address</link> and Atom <link href="...">
    for element in node:
        if simple_name(element.tag)!="link":
            continue
        link=(element.attrib.get("href") or "".join(element.itertext()) or "").strip()
        if link:
            return link
    return ""

def date_value(value:str)->datetime|None:
    if not value:return None
    try:
        d=parsedate_to_datetime(value)
    except (ValueError,TypeError,IndexError):
        try:
            d=datetime.fromisoformat(value.replace("Z","+00:00"))
        except (ValueError,TypeError):return None
    if d.tzinfo is None:d=d.replace(tzinfo=timezone.utc)
    return d.astimezone(timezone.utc)

def classify(title:str)->str:
    s=title.lower()
    if re.search(r"\b(motorcycle|motorrad|superbike|ducati|two-wheel|scooter)\b",s):return "motorcycles"
    if re.search(r"\b(race|racing|rally|f1|formula|motorsport|grand prix|le mans|nascar|wrc)\b",s):return "motorsport"
    if re.search(r"\b(design|concept|prototype|heritage|history|historic|classic|styling|coachbuilt|coachbuild)\b",s):return "design"
    if re.search(r"\b(battery|electric|hybrid|charging|autonomous|software|hydrogen|engine|powertrain|plant|technology)\b",s):return "technology"
    return "new-cars"

def sanitize_href(raw:str,hosts:set[str])->str|None:
    try:
        p=urllib.parse.urlsplit(html.unescape(raw.strip()))
        if p.scheme!="https" or p.hostname not in hosts:return None
        query=urllib.parse.parse_qsl(p.query,keep_blank_values=True)
        query=[(k,v) for k,v in query if not k.lower().startswith("utm_") and k not in {"fbclid","gclid"}]
        return urllib.parse.urlunsplit((p.scheme,p.netloc,p.path,urllib.parse.urlencode(query),""))
    except(ValueError,TypeError):return None

def parse_feed(payload:bytes,source:dict)->list[dict]:
    # ET does not fetch remote DTDs. The input came from a fixed feed URL.
    root=ET.fromstring(payload)
    nodes=[el for el in root.iter() if simple_name(el.tag) in {"item","entry"}][:75]
    result=[]
    for node in nodes:
        title=text_only(content(node,"title"))[:250]
        address=sanitize_href(article_link(node),source["hosts"])
        raw_date=(content(node,"pubdate") or content(node,"published") or
                  content(node,"updated") or content(node,"date"))
        issued=date_value(raw_date)
        if not title or not address or not issued or issued<CUTOFF or issued>NOW+timedelta(days=1):
            continue
        if source["id"]=="porsche" and re.search(r"\b(tennis|golf|watch|fashion|esport)\b",title,re.I):continue
        result.append({
            "title":title,
            "url":address,
            "source":source["name"],
            "source_id":source["id"],
            "category":classify(title),
            "published_at":issued.isoformat().replace("+00:00","Z"),
            "kind":"external-source",
            "original_language":"en",
        })
    return result

def source_read(source:dict)->list[dict]:
    req=urllib.request.Request(source["feed"],headers={
        "User-Agent":"TOHESAR-Source-Desk/1.0 (public source links; no scraping)",
        "Accept":"application/rss+xml,application/atom+xml,application/xml,text/xml;q=0.8"
    })
    with urllib.request.urlopen(req,timeout=12) as reply:
        data=reply.read(MAX_BYTES+1)
    if len(data)>MAX_BYTES:raise ValueError("feed too large")
    return parse_feed(data,source)

def main()->int:
    all_items=[]
    states=[]
    for source in SOURCES:
        try:
            items=source_read(source)
            all_items.extend(items)
            states.append({"id":source["id"],"name":source["name"],"status":"ok","count":len(items)})
            print(source["id"],"ok",len(items))
        except Exception as e:
            states.append({"id":source["id"],"name":source["name"],"status":"unavailable","count":0})
            print(source["id"],"unavailable",type(e).__name__,str(e)[:120],file=sys.stderr)
    found=set()
    cleaned=[]
    for item in sorted(all_items,key=lambda x:x["published_at"],reverse=True):
        norm=item["url"].rstrip("/").lower()
        if norm not in found:
            found.add(norm)
            cleaned.append(item)
        if len(cleaned)>=70:break
    if not cleaned:
        print("No recent valid sources. Existing public JSON preserved.",file=sys.stderr)
        return 0 if DEST.exists() else 1
    payload={
        "schema_version":1,
        "status":"ok" if all(x["status"]=="ok" for x in states) else "partial",
        "fetched_at":NOW.isoformat().replace("+00:00","Z"),
        "disclaimer_ko":"발행처의 원문 제목·날짜·링크를 보여주는 외부 소식 목록입니다. TOHEŞAR 독립 검증 기사가 아닙니다.",
        "sources":states,
        "articles":cleaned,
    }
    DEST.parent.mkdir(parents=True,exist_ok=True)
    DEST.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("Saved",len(cleaned),"articles to",str(DEST))
    return 0

if __name__=="__main__":
    raise SystemExit(main())
