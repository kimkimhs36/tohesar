/* TOHEŞAR OWNER STORIES — minimal client-only participation helper.
   No form data is sent to a server, saved locally, or submitted automatically.
   The user must manually send the email from their own mail app. */
(() => {
  'use strict';
  const form = document.querySelector('[data-owner-form]');
  if (!form) return;
  const status = document.querySelector('[data-owner-status]');
  const email = 'tohesar@gmail.com';
  const MAX_DETAIL = 700;
  const setStatus = (message) => {
    if (status) status.textContent = message;
  };
  const getDraft = () => {
    const model = form.elements.namedItem('model').value.trim().slice(0, 120);
    const story = form.elements.namedItem('story').value.trim().slice(0, MAX_DETAIL);
    const theme = form.elements.namedItem('theme').value;
    if (!model || !story) {
      form.reportValidity();
      setStatus('차종과 이야기를 먼저 적어주세요.');
      return null;
    }
    const lines = [
      'TOHEŞAR OWNER STORIES 참여 제안',
      '',
      '차량 / 연식: ' + model,
      '원하는 이야기: ' + theme,
      '차에 관한 짧은 이야기:',
      story,
      '',
      '사진은 우선 첨부하지 않아도 됩니다. 게재 여부와 사용 허락은 따로 협의하겠습니다.',
      '※ 이 메일의 발송은 화보 게재 동의가 아닙니다.'
    ];
    return {subject:'[TOHEŞAR] OWNER STORIES 참여 제안 — ' + model,body:lines.join('\n')};
  };
  const toMailto = ({subject, body}) =>
    'mailto:' + email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const draft = getDraft();
    if (!draft) return;
    setStatus('메일 앱이 열리면 직접 ‘보내기’를 눌러야 제안이 접수돼요. 열리지 않으면 아래 복사 버튼을 사용해 주세요.');
    window.location.href = toMailto(draft);
  });
  const copyButton = document.querySelector('[data-owner-copy]');
  if (copyButton) copyButton.addEventListener('click', async () => {
    const draft = getDraft();
    if (!draft) return;
    const content = '받는 사람: ' + email + '\n제목: ' + draft.subject + '\n\n' + draft.body;
    try {
      await navigator.clipboard.writeText(content);
      setStatus('제안 내용이 복사됐어요. 메일 앱에서 tohesar@gmail.com으로 직접 보내주세요.');
    } catch (_) {
      setStatus('복사가 제한됐어요. 메일 앱 버튼을 이용하거나 직접 내용을 선택해 복사해 주세요.');
    }
  });
  const shareButton = document.querySelector('[data-owner-share]');
  if (shareButton) shareButton.addEventListener('click', async () => {
    const url = new URL('/owner-stories/', window.location.origin);
    url.searchParams.set('utm_source','owner_story');
    url.searchParams.set('utm_medium','share');
    url.searchParams.set('utm_campaign','owner_stories_001');
    try {
      if (navigator.share) {
        await navigator.share({title:'TOHEŞAR OWNER STORIES',text:'자동차에 담긴 당신의 이야기를 TOHEŞAR와 나눠보세요.',url:url.href});
        return;
      }
      await navigator.clipboard.writeText(url.href);
      setStatus('참여 페이지 주소가 복사됐어요.');
    } catch (error) {
      if (error && error.name === 'AbortError') return;
      setStatus('공유 기능을 사용할 수 없어요. 주소창의 링크를 복사해 주세요.');
    }
  });
})();
