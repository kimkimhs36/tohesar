interface SearchEntry {
  slug: string;
  text: string;
  subjects: string[];
  content_type: string;
}
const form = document.querySelector<HTMLFormElement>('.search-form')!;
const input = document.querySelector<HTMLInputElement>('#query')!;
const subject = document.querySelector<HTMLSelectElement>('#search-subject')!;
const format = document.querySelector<HTMLSelectElement>('#search-format')!;
const searchStatus = document.querySelector<HTMLElement>('.search-status')!;
const rows = [...document.querySelectorAll<HTMLElement>('[data-search-story]')];
const empty = document.querySelector<HTMLElement>('[data-search-empty]')!;
const normal = (value: string) =>
  value.normalize('NFKC').toLocaleLowerCase('ko').replace(/\s+/g, ' ').trim();
async function setup() {
  try {
    const response = await fetch('/search-index.json');
    if (!response.ok) throw new Error('index');
    const index: SearchEntry[] = await response.json();
    document.querySelector<HTMLElement>('[data-search-filters]')!.hidden = false;
    const params = new URLSearchParams(location.search);
    input.value = (params.get('q') || '').slice(0, 200);
    subject.value = params.get('subject') || '';
    format.value = params.get('format') || '';
    function search(updateURL = false) {
      const query = normal(input.value);
      const terms = query.split(' ').filter(Boolean);
      const hits = new Set(
        index
          .filter(
            (a) =>
              terms.every((t) => normal(a.text).includes(t)) &&
              (!subject.value || a.subjects.includes(subject.value)) &&
              (!format.value || a.content_type === format.value),
          )
          .map((a) => a.slug),
      );
      rows.forEach((el) => (el.hidden = !hits.has(el.dataset.searchStory!)));
      empty.hidden = hits.size > 0;
      searchStatus.textContent = query
        ? `“${input.value.trim()}” 검색 결과 ${hits.size}편`
        : `전체 ${hits.size}편`;
      if (updateURL) {
        const p = new URLSearchParams();
        if (input.value.trim()) p.set('q', input.value.trim());
        if (subject.value) p.set('subject', subject.value);
        if (format.value) p.set('format', format.value);
        history.replaceState(null, '', `/search/${p.size ? '?' + p.toString() : ''}`);
      }
    }
    let timer: ReturnType<typeof setTimeout>;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => search(true), 140);
    });
    subject.addEventListener('change', () => search(true));
    format.addEventListener('change', () => search(true));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      search(true);
    });
    addEventListener('popstate', () => {
      const p = new URLSearchParams(location.search);
      input.value = (p.get('q') || '').slice(0, 200);
      subject.value = p.get('subject') || '';
      format.value = p.get('format') || '';
      search();
    });
    search();
  } catch {
    searchStatus.textContent =
      '검색 색인을 불러오지 못했습니다. 전체 글 목록을 이용하거나 다시 시도해 주세요.';
  }
}
setup();

export {};
