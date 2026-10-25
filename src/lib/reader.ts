const SAVE_KEY = 'tohesar-v3-saved';
const SIZE_KEY = 'tohesar-v3-type';
function saved(): string[] {
  try {
    const data = JSON.parse(localStorage.getItem(SAVE_KEY) || '[]');
    return Array.isArray(data) ? data.filter((v) => typeof v === 'string') : [];
  } catch {
    return [];
  }
}
const feedback = document.querySelector<HTMLElement>('.article-feedback');
function announce(message: string) {
  if (feedback) feedback.textContent = message;
}
function syncSaved() {
  const ids = saved();
  document.querySelectorAll<HTMLButtonElement>('[data-save]').forEach((b) => {
    const active = ids.includes(b.dataset.save!);
    b.setAttribute('aria-pressed', String(active));
    b.textContent = active ? '저장됨 ✓' : '나중에 읽기 ＋';
  });
  const page = document.querySelector('[data-saved-page]');
  if (page) {
    let count = 0;
    page.querySelectorAll<HTMLElement>('[data-saved-story]').forEach((el) => {
      el.hidden = !ids.includes(el.dataset.savedStory!);
      if (!el.hidden) count++;
    });
    const empty = page.querySelector<HTMLElement>('[data-saved-empty]');
    if (empty) empty.hidden = count > 0;
    const label = page.querySelector('.saved-count');
    if (label) label.textContent = `저장한 글 ${count}편`;
  }
}
document
  .querySelectorAll<HTMLElement>('[data-reader-tools],[data-share]')
  .forEach((el) => (el.hidden = false));
document.querySelectorAll<HTMLButtonElement>('[data-save]').forEach((button) =>
  button.addEventListener('click', () => {
    try {
      const ids = saved(),
        slug = button.dataset.save!;
      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify(ids.includes(slug) ? ids.filter((x) => x !== slug) : [...ids, slug]),
      );
      syncSaved();
      announce(saved().includes(slug) ? '이 브라우저에 저장했습니다.' : '저장을 해제했습니다.');
    } catch {
      announce('이 브라우저에서는 저장소를 사용할 수 없습니다.');
    }
  }),
);
syncSaved();
window.addEventListener('storage', syncSaved);
let size = 0;
try {
  size = Number(localStorage.getItem(SIZE_KEY) || 0);
  if (!Number.isInteger(size) || Math.abs(size) > 2) size = 0;
} catch {}
function applySize() {
  document.documentElement.style.setProperty(
    '--reading-size',
    `calc(${matchMedia('(max-width:767px)').matches ? 17 : 18}px + ${size * 2}px)`,
  );
  const output = document.querySelector('[data-font-size]');
  if (output) output.textContent = size === 0 ? '기본' : `${size > 0 ? '+' : ''}${size}`;
  document
    .querySelectorAll<HTMLButtonElement>('[data-font]')
    .forEach((b) => (b.disabled = Number(b.dataset.font) < 0 ? size <= -2 : size >= 2));
}
applySize();
document.querySelectorAll<HTMLButtonElement>('[data-font]').forEach((b) =>
  b.addEventListener('click', () => {
    size = Math.max(-2, Math.min(2, size + Number(b.dataset.font)));
    try {
      localStorage.setItem(SIZE_KEY, String(size));
    } catch {}
    applySize();
  }),
);
matchMedia('(max-width:767px)').addEventListener('change', applySize);
document.querySelector('[data-share]')?.addEventListener('click', async () => {
  try {
    if (navigator.share) {
      await navigator.share({ title: document.title, url: location.href });
      announce('공유를 완료했습니다.');
    } else if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(location.href);
      announce('기사 링크를 복사했습니다.');
    } else {
      announce(`기사 주소: ${location.href}`);
    }
  } catch (error) {
    if ((error as DOMException).name !== 'AbortError')
      announce('공유하지 못했습니다. 주소창의 링크를 복사해 주세요.');
  }
});
const progress = document.querySelector<HTMLElement>('.read-progress');
const article = document.querySelector<HTMLElement>('[data-article]');
if (progress && article) {
  let queued = false;
  const update = () => {
    const start = article.offsetTop;
    const end = article.offsetTop + article.offsetHeight - innerHeight;
    progress.style.width = `${Math.max(0, Math.min(100, ((scrollY - start) / Math.max(1, end - start)) * 100))}%`;
    queued = false;
  };
  addEventListener(
    'scroll',
    () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  addEventListener('resize', update);
  update();
}
const viewer = document.querySelector<HTMLDialogElement>('.photo-dialog');
if (viewer && typeof viewer.showModal === 'function') {
  let opener: HTMLAnchorElement | null = null;
  document.querySelectorAll<HTMLAnchorElement>('[data-lightbox]').forEach((link) =>
    link.addEventListener('click', (e) => {
      e.preventDefault();
      opener = link;
      const image = viewer.querySelector('img')!;
      image.src = link.href;
      image.alt = link.querySelector('img')?.alt || '';
      viewer.querySelector('p')!.textContent =
        link.closest('figure')?.querySelector('figcaption')?.textContent || '';
      viewer.showModal();
      document.body.style.overflow = 'hidden';
    }),
  );
  viewer.querySelector('[data-close-photo]')?.addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', (e) => {
    if (e.target === viewer) {
      const r = viewer.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)
        viewer.close();
    }
  });
  viewer.addEventListener('close', () => {
    document.body.style.overflow = '';
    opener?.focus();
  });
}

export {};
