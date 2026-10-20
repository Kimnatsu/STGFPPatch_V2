/* ============================================================
   FPP v2 — CustomerService.js
   고객센터: FAQ 검색 · 상세 · 1:1 문의 · 나의 문의
   ============================================================ */
(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }

  var S = { banners: [], loaded: false };
  var query = '';
  var myInquiriesRoutePending = false;

  /* ================= 데이터 ================= */
  function loadAll() {
    if (S.loaded) return Promise.resolve();
    if (typeof FB === 'undefined' || !FB.onReady) return Promise.reject(new Error('Firebase SDK 없음'));
    return FB.onReady().then(function (isReady) {
      if (!isReady || !FB.ready) throw new Error('Firebase SDK 없음');
      return FB.getBanners();
    }).then(function (r) {
      S.banners = r;
      S.loaded = true;
    });
  }

  /* ================= 목록 ================= */
  function filtered() {
    return [];
  }
  function rowHTML() { return ''; }
  function renderList() {
    var el = $('csGrid');
    UI.empty(el, { title: '고객센터는 1:1 문의와 자주하는 질문만 지원합니다.', desc: '공지사항은 커뮤니티 페이지를 이용해 주세요.' });
  }
  function bindRows() {}

  /* ================= 라우팅 ================= */
  function route() {
    UI.setActiveNav('cs');
    if (!S.loaded) return;
    showList();
    if (location.hash === '#my-inquiries') openMyInquiriesFromRoute();
  }
  function showList() {
    $('csDetail').hidden = true;
    $('csListSection').hidden = false;
    renderList();
  }

  function openMyInquiriesFromRoute() {
    if (UI.currentUser()) {
      myInquiriesRoutePending = false;
      openMyModal();
      return;
    }
    if (myInquiriesRoutePending) return;
    myInquiriesRoutePending = true;
    UI.onUser(function () {
      if (!myInquiriesRoutePending) return;
      myInquiriesRoutePending = false;
      if (location.hash !== '#my-inquiries') return;
      openMyModal();
    });
  }

  /* ================= 1:1 문의 ================= */
  function showInquiryLoginPrompt() {
    var m = UI.openModal({
      title: '로그인이 필요합니다',
      body:
        '<p style="font-size:13px;color:var(--text-2);margin-bottom:14px;line-height:1.7">1:1 문의는 로그인 후 접수할 수 있습니다.</p>' +
        '<button class="btn btn--gold btn--block" id="inqLoginGo" type="button">로그인하고 문의하기</button>'
    });
    m.body.querySelector('#inqLoginGo').addEventListener('click', function () {
      try { sessionStorage.setItem('fpp_login_return', 'customer-service'); } catch (e) {}
      location.href = UI.pageUrl('Login.html');
    });
  }

  function openInquiryModal() {
    var u = UI.currentUser();
    if (!u) { showInquiryLoginPrompt(); return; }

    var m = UI.openModal({
      title: '1:1 문의',
      body:
        '<p style="font-size:13px;color:var(--text-2);margin-bottom:14px;line-height:1.7">' +
        '남겨주신 문의는 관리자 고객센터에서 확인합니다.' +
        '</p>' +
        '<div class="fld"><span class="fld-lb">제목</span><input id="inqTitle" type="text" maxlength="60" placeholder="문의 제목"></div>' +
        '<div class="fld"><span class="fld-lb">내용</span><textarea id="inqBody" maxlength="1000" style="min-height:110px" placeholder="문의 내용을 자세히 남겨주세요."></textarea></div>' +
        '<div class="fld"><span class="fld-lb">회신 받을 연락처 <small style="color:var(--text-3);font-weight:700">(선택)</small></span>' +
        '<input id="inqContact" type="text" maxlength="60" placeholder="이메일 또는 닉네임" value="' + UI.esc(u.email || '') + '"></div>' +
        '<button class="btn btn--gold btn--block" id="inqSend" type="button">문의 접수하기</button>'
    });
    m.body.querySelector('#inqSend').addEventListener('click', function () {
      var title = m.body.querySelector('#inqTitle').value.trim();
      var content = m.body.querySelector('#inqBody').value.trim();
      var contact = m.body.querySelector('#inqContact').value.trim();
      var activeUser = UI.currentUser();
      if (!activeUser) { m.close(); showInquiryLoginPrompt(); return; }
      if (!title) { UI.toast('제목을 입력해 주세요.', 'err'); return; }
      if (!content) { UI.toast('문의 내용을 입력해 주세요.', 'err'); return; }
      if (!FB.ready) { UI.toast('문의 서버에 연결되지 않았습니다. 잠시 후 다시 시도해 주세요.', 'err'); return; }
      var btn = m.body.querySelector('#inqSend');
      btn.disabled = true; btn.textContent = '접수 중…';
      var profile = UI.userDoc() || {};
      var nickname = profile.nickname || activeUser.displayName ||
        (activeUser.email ? activeUser.email.split('@')[0] : '') || '선원';
      FB.addInquiry({
        title: title,
        content: content,
        contact: contact,
        nickname: nickname,
        email: activeUser.email || contact
      }, activeUser).then(function (result) {
        if (!result || result.remote !== true) {
          btn.disabled = false; btn.textContent = '문의 접수하기';
          UI.toast('문의가 서버에 저장되지 않았습니다. 연결을 확인하고 다시 시도해 주세요.', 'err');
          return;
        }
        m.close();
        UI.toast('문의가 접수되었습니다. 감사합니다!', 'ok');
      }).catch(function (e) {
        btn.disabled = false; btn.textContent = '문의 접수하기';
        UI.toast(FB.errMsg(e), 'err');
      });
    });
  }

  /* ================= 나의 문의 ================= */
  function openMyModal() {
    var u = UI.currentUser();
    if (!u) {
      UI.toast('로그인 후 확인할 수 있습니다.');
      setTimeout(function () { location.href = UI.pageUrl('Login.html'); }, 700);
      return;
    }
    var m = UI.openModal({ title: '나의 문의', body: '<div id="myInqBox"></div>' });
    var box = m.body.querySelector('#myInqBox');
    UI.skelRows(box, 3);
    FB.getMyInquiries(u).then(function (list) {
      if (!list.length) {
        box.innerHTML = '<div class="empty" style="padding:22px 8px"><p>접수한 문의가 없습니다.</p><small>1:1 문의로 궁금한 점을 남겨보세요.</small></div>';
        return;
      }
      box.innerHTML = list.map(function (q) {
        var replyHtml = q.reply
          ? '<div class="my-q-reply"><b>관리자 답변</b><p>' + UI.esc(q.reply) + '</p></div>'
          : '';
        return '<div class="my-q"><div class="my-q-top"><b>' + UI.esc(q.title || '제목 없음') + '</b>' +
          '<span class="badge badge--ing">' + UI.esc(q.status || '접수완료') + '</span></div>' +
          '<p>' + UI.esc(q.content || '') + '</p>' +
          '<time>' + UI.esc(UI.fmtDate(q.date)) + '</time>' + replyHtml + '</div>';
      }).join('');
    }).catch(function (e) {
      box.innerHTML = '';
      UI.empty(box, { title: '문의 내역을 불러오지 못했습니다.', desc: FB.errMsg(e) });
    });
  }

  /* ================= 부팅 ================= */
  function start() {
    UI.setActiveNav('cs');
    UI.skelRows($('csGrid'), 5);

    $('csSearch').addEventListener('input', function (e) {
      query = e.target.value || '';
      if (!location.hash || location.hash === '#') renderList();
      else location.hash = '';
    });
    $('csAsk').addEventListener('click', openInquiryModal);
    $('csMyBtn').addEventListener('click', openMyModal);
    $('goCsList').addEventListener('click', function () {
      if (location.hash) location.hash = '';
      else showList();
      window.scrollTo({ top: 0 });
    });

    route();
    loadAll().then(function () {
      UI.fillPageBanner($('csBannerMedia'), 'cs', S.banners);
      route();
    }).catch(function (e) {
      console.error('[FPP] 고객센터 데이터 로드 실패:', e);
      UI.toast(FB.errMsg(e) + ' — 데이터를 불러오지 못했습니다.', 'err');
      UI.empty($('csGrid'), { title: '데이터를 불러오지 못했습니다.', desc: '네트워크 또는 Firebase 연결을 확인해 주세요.' });
    });
    window.addEventListener('hashchange', route);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
