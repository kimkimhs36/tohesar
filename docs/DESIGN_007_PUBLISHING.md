# Static publishing — Design Atlas

`journal/data/content-index.json` is the source for editorial / visual / graphic metadata. It does not rewrite the preserved articles. `news_source` points to the existing news source of truth: `journal/data/news.json`.

Only `published` entries are rendered. Required fields include unique ID, real URL, type, title, summary, form IDs, keywords, publication date, nullable model/manufacturer/year, image with provenance, and related IDs. Dates for artwork are publication dates, not model launch dates. Image rights must be checked before publication.

Run `python3 scripts/build_design_atlas.py` after editing metadata. It joins existing news records (with distinct News labels and original source links) and renders static linked results plus a compact embedded JSON index into the marked Atlas region. Search does not depend on a network fetch. The same metadata generates related links on the new editorial; existing article prose remains untouched. Commit both source data and rendered HTML. No runtime dependencies or external search service.

Check real destinations, new article sources and photo permissions. Regenerate navigation with `python3 scripts/build_journal_navigation.py` when adding a page to that helper's list. Review at narrow phone and desktop sizes before deploying.

`news_forms` is an optional ID → form list annotation. Only a specific verified connection gets a form classification; a news item with topic `design` is not automatically classified as a new design language. News without form annotations remains discoverable in All stories and text search.

Browser verification: `node scripts/verify_design_007.cjs`. Set `WEBKIT_EXECUTABLE_PATH` only if the host requires a custom launcher for local browser libraries. Playwright is a development tool supplied by the environment, not a website dependency. The cloud host required locally extracted Debian WebKit libraries outside this repository.
