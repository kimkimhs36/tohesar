/* Mail drafts remain manual. Optional online intake is disabled until configured. */
(() => {
  'use strict';
  const form = document.querySelector('[data-owner-form]');
  if (!form) return;
  const status = document.querySelector('[data-owner-status]');
  const draftButton = form.querySelector('button[type=submit]');
  const copyControl = form.querySelector('[data-owner-copy]');
  if (draftButton) draftButton.disabled = false;
  if (copyControl) copyControl.disabled = false;
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
  // Sharing is manual: no contact list access or automated outreach.
  const referralLink = () => {
    const url = new URL('/owner-stories/', window.location.origin);
    url.searchParams.set('utm_source', 'owner_share');
    url.searchParams.set('utm_medium', 'direct');
    url.searchParams.set('utm_campaign', 'owner_stories_001');
    return url.href;
  };
  const copyText = async (value) => {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try { await navigator.clipboard.writeText(value); return true; } catch (_) { /* try fallback */ }
    }
    // In-app browsers may deny modern clipboard APIs.
    const field = document.createElement('textarea');
    const previous = document.activeElement;
    field.value = value;
    field.setAttribute('readonly', '');
    field.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
    document.body.appendChild(field);
    field.focus(); field.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch (_) { /* unsupported */ }
    field.remove();
    if (previous && typeof previous.focus === 'function') previous.focus({preventScroll:true});
    return copied;
  };
  const inviteButton = document.querySelector('[data-owner-invite]');
  if (inviteButton) inviteButton.addEventListener('click', async () => {
    const invitation = [
      '자동차 사진 찍는 거 좋아하면 한번 봐봐! TOHEŞAR라는 자동차 디자인 저널에서 차주 이야기를 모집한대.',
      '차값이나 튜닝 여부보다 차를 좋아하는 이유, 디자인 취향과 기억을 기록하는 프로젝트래.',
      '참여 페이지: ' + referralLink(),
      '사진이나 개인정보는 먼저 보낼 필요 없고, 게재는 별도 협의한대.'
    ].join('\n');
    const copied = await copyText(invitation);
    setStatus(copied ? '초대문과 참여 링크를 복사했어요. 원하는 차주에게 직접 보내주세요.' : '자동 복사를 사용할 수 없어요. 페이지 주소를 직접 복사해 전달해 주세요.');
  });
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
      const copied = await copyText(content);
      if (!copied) throw new Error('clipboard_unavailable');
      setStatus('제안 내용이 복사됐어요. 메일 앱에서 tohesar@gmail.com으로 직접 보내주세요.');
    } catch (_) {
      setStatus('복사가 제한됐어요. 메일 앱 버튼을 이용하거나 직접 내용을 선택해 복사해 주세요.');
    }
  });
  // An unconfigured site never loads Turnstile or transmits form data. Enabling
  // the feature requires the independent deployment and privacy gates in README.
  const settings = window.OWNER_STORIES_INTAKE || {};
  const prepare = document.querySelector('[data-owner-prepare]');
  const online = document.querySelector('[data-owner-online]');
  const send = document.querySelector('[data-owner-send]');
  const contact = form.elements.namedItem('contact');
  const consent = form.elements.namedItem('consent');
  let endpoint;
  try {
    endpoint = new URL(settings.endpoint);
    if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password || endpoint.search || endpoint.hash ||
        endpoint.pathname !== '/api/submit' || !/^[A-Za-z0-9_-]{10,100}$/.test(settings.sitekey) ||
        !window.crypto || typeof window.crypto.randomUUID !== 'function') endpoint = null;
  } catch (_) { endpoint = null; }
  if (endpoint && prepare && online && send && contact && consent) {
    prepare.hidden = false;
    let widget, token = '', busy = false, currentFingerprint = '', key = '', acceptedFingerprint = '';
    const fingerprint = () => JSON.stringify({model:form.elements.namedItem('model').value.trim(),
      story:form.elements.namedItem('story').value.trim(),theme:form.elements.namedItem('theme').value,
      contact:contact.value.trim(),consent:consent.checked});
    const refreshButton = () => { send.disabled = busy || !token || fingerprint() === acceptedFingerprint; };
    form.addEventListener('input', refreshButton);
    form.addEventListener('change', refreshButton);
    const render = () => {
      if (!window.turnstile) throw new Error('verification unavailable');
      widget = window.turnstile.render(document.querySelector('[data-owner-challenge]'), {
        sitekey:settings.sitekey, action:'owner_story',
        callback:value => { token = value; refreshButton(); },
        'expired-callback':() => { token = ''; refreshButton(); setStatus('보안 확인이 만료됐어요. 다시 확인해 주세요.'); },
        'error-callback':() => { token = ''; refreshButton(); setStatus('보안 확인을 사용할 수 없어요. 메일 앱으로 제안할 수 있습니다.'); }
      });
    };
    prepare.addEventListener('click', () => {
      prepare.hidden = true; online.hidden = false; contact.disabled = false; consent.disabled = false;
      try {
        if (window.turnstile) render();
        else {
          const script = document.createElement('script');
          script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
          script.async = true; script.onload = () => { try { render(); } catch (_) { setStatus('보안 확인을 사용할 수 없어요. 메일 앱으로 제안할 수 있습니다.'); } };
          script.onerror = () => setStatus('보안 확인을 불러오지 못했어요. 메일 앱으로 제안할 수 있습니다.');
          document.head.appendChild(script);
        }
      } catch (_) { setStatus('보안 확인을 사용할 수 없어요. 메일 앱으로 제안할 수 있습니다.'); }
      contact.focus();
    }, {once:true});
    send.addEventListener('click', async () => {
      if (busy || !token || fingerprint() === acceptedFingerprint) return;
      if (!form.reportValidity()) return;
      if (!contact.value.trim() || !consent.checked) { setStatus('답변받을 연락처와 제안 처리 동의를 확인해 주세요.'); return; }
      const snapshot = fingerprint();
      if (snapshot !== currentFingerprint) { key = window.crypto.randomUUID(); currentFingerprint = snapshot; }
      const payload = {...JSON.parse(snapshot),turnstileToken:token,website:''};
      busy = true; refreshButton(); setStatus('제안을 전달하고 있습니다.');
      const controller = new AbortController();
      const deadline = setTimeout(() => controller.abort(), 22000);
      try {
        const response = await fetch(endpoint.href,{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':key},
          body:JSON.stringify(payload),signal:controller.signal});
        let result; try { result = await response.json(); } catch (_) { result = null; }
        if (response.status === 202 && result?.ok === true && result.status === 'accepted') {
          acceptedFingerprint = snapshot;
          setStatus('제안이 메일 전달 서비스에 접수됐어요. 편집팀의 답변이나 게재를 보장하지는 않습니다.');
        } else if (result?.error === 'delivery_unconfirmed' || response.status >= 500 || response.ok) {
          setStatus('전달 여부를 확인하지 못했어요. 중복을 피하려면 내용을 바꾸거나 메일을 바로 보내지 말고, 보안 확인 후 같은 내용으로 다시 시도해 주세요.');
        } else if (result?.error === 'idempotency_conflict') {
          setStatus('같은 제안이 처리 중이거나 충돌했어요. 잠시 후 같은 내용으로 다시 시도해 주세요.');
        } else {
          setStatus('온라인 제안을 접수하지 못했어요. 입력과 보안 확인을 확인하거나 메일 앱을 이용해 주세요.');
        }
      } catch (_) {
        setStatus('전달 여부를 확인하지 못했어요. 중복을 피하려면 내용을 바꾸거나 메일을 바로 보내지 말고, 보안 확인 후 같은 내용으로 다시 시도해 주세요.');
      } finally {
        clearTimeout(deadline); token = ''; busy = false;
        try { if (window.turnstile && widget !== undefined) window.turnstile.reset(widget); } catch (_) { /* use mailto if reset fails */ }
        refreshButton();
      }
    });
  }
  const shareButton = document.querySelector('[data-owner-share]');
  if (shareButton) shareButton.addEventListener('click', async () => {
    const url = referralLink();
    try {
      if (navigator.share) {
        await navigator.share({title:'TOHEŞAR OWNER STORIES',text:'자동차에 담긴 당신의 이야기를 TOHEŞAR와 나눠보세요.',url});
        return;
      }
      const copied = await copyText(url);
      if (!copied) throw new Error('clipboard_unavailable');
      setStatus('참여 페이지 주소가 복사됐어요.');
    } catch (error) {
      if (error && error.name === 'AbortError') return;
      setStatus('공유 기능을 사용할 수 없어요. 주소창의 링크를 복사해 주세요.');
    }
  });
})();
