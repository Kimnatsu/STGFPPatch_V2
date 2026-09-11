/* FPP v2 — 모바일 설정 페이지 */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var state = { view: 'main', notices: [], noticeDetail: null, user: null, userDoc: null, toastTimer: null, deferredInstall: null };
  var NOTIFY_ROWS = [
    ['patch', '패치노트 알림', '새로운 패치노트가 등록되면 알려드립니다.'],
    ['fav', '즐겨찾기 알림', '즐겨찾기한 캐릭터의 밸런스 패치를 알려드립니다.'],
    ['comment', '댓글 알림', '댓글과 대댓글이 달리면 알려드립니다.'],
    ['event', '이벤트 알림', '새로운 이벤트와 종료 임박 소식을 알려드립니다.']
  ];
  var TITLES = { main: '설정', notice: '공지사항', notify: '알림 설정', theme: '테마 변경', appIcon: '앱 아이콘 변경' };

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function dateText(value) {
    if (!value) return '';
    if (value.seconds != null) return new Date(value.seconds * 1000).toLocaleDateString('ko-KR');
    var text = String(value).replace(/-/g, '.');
    return text.length > 10 ? text.slice(0, 10) : text;
  }

  function renderContent(value) {
    if (!value) return '<p class="content-empty">내용이 없습니다.</p>';
    var text = String(value);
    if (/<[a-z][\s\S]*>/i.test(text)) return text;
    return '<p>' + esc(text).replace(/\n/g, '<br>') + '</p>';
  }

  function readTheme() {
    try {
      var value = localStorage.getItem('fpp_theme');
      value = value ? JSON.parse(value) : 'dark';
      return value === 'light' ? 'light' : 'dark';
    } catch (e) { return 'dark'; }
  }

  function applyTheme(theme) {
    theme = theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('fpp_theme', JSON.stringify(theme)); } catch (e) {}
    $('themeSummary').textContent = theme === 'light' ? '라이트 모드' : '다크 모드';
    document.querySelectorAll('[data-theme-choice]').forEach(function (button) {
      var selected = button.getAttribute('data-theme-choice') === theme;
      button.classList.toggle('is-on', selected);
      button.setAttribute('aria-checked', String(selected));
    });
  }

  function showToast(message) {
    var el = $('settingsToast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(function () { el.classList.remove('is-visible'); }, 2600);
  }

  function renderMobileHeader() {
    var userBox = $('settingsMobileUser');
    if (!userBox) return;
    if (!state.user) {
      userBox.innerHTML =
        '<span class="settings-mobile-profile settings-mobile-profile-icon ic-v2-navigation-profile-fill" aria-hidden="true"></span>' +
        '<a class="settings-mobile-login" href="Login.html">' +
        '<span>로그인 해주세요</span><span class="settings-mobile-login-icon ic-v2-control-arrow-right-line" aria-hidden="true"></span></a>';
      return;
    }
    var nickname = (state.userDoc && state.userDoc.nickname) || state.user.displayName || '선원';
    userBox.innerHTML =
      '<span class="settings-mobile-profile settings-mobile-profile-icon ic-v2-navigation-profile-fill" aria-hidden="true"></span>' +
      '<span class="settings-mobile-login">' + esc(nickname) + '</span>';
  }

  function closeSettings() {
    location.href = 'Main.html#home';
  }

  function setTitle(view) {
    $('settingsTitle').textContent = TITLES[view] || TITLES.main;
    $('settingsProgress').style.width = (view === 'main' ? 25 : 100) + '%';
  }

  function showView(view, addHistory) {
    if (!document.getElementById('settings-' + view)) view = 'main';
    if (view === state.view && view !== 'main') return;
    document.querySelectorAll('.settings-view').forEach(function (section) {
      var active = section.getAttribute('data-view') === view;
      section.classList.toggle('is-active', active);
      section.setAttribute('aria-hidden', String(!active));
    });
    state.view = view;
    setTitle(view);
    if (addHistory) history.pushState({ settingsView: view }, '', '#settings-' + view);
    if (view === 'notice') loadNotices();
    if (view === 'notify') renderNotifications();
    if (view === 'theme') applyTheme(readTheme());
    if (view === 'appIcon') renderAppIcons();
    window.scrollTo(0, 0);
  }

  function goBack() {
    if (state.noticeDetail) {
      state.noticeDetail = null;
      $('noticeDetail').hidden = true;
      $('noticeList').hidden = false;
      return;
    }
    if (state.view !== 'main') {
      if (history.state && history.state.settingsView) history.back();
      else showView('main', false);
      return;
    }
    if (document.referrer && document.referrer.indexOf(location.origin) === 0 && history.length > 1) history.back();
    else location.href = 'Main.html#home';
  }

  function loadNotices() {
    var list = $('noticeList');
    if (!list || list.dataset.loaded === 'true') return;
    list.innerHTML = '<div class="settings-loading">공지사항을 불러오는 중입니다.</div>';
    if (typeof FB === 'undefined') {
      list.innerHTML = '<div class="settings-empty">공지사항을 불러올 수 없습니다.</div>';
      return;
    }
    FB.onReady().then(function () {
      return FB.ready ? FB.getNotices() : [];
    }).then(function (items) {
      state.notices = items || [];
      list.dataset.loaded = 'true';
      if (!state.notices.length) {
        list.innerHTML = '<div class="settings-empty">등록된 공지사항이 없습니다.</div>';
        return;
      }
      list.innerHTML = state.notices.map(function (notice, index) {
        return '<button class="notice-row" type="button" data-notice-index="' + index + '">' +
          '<span class="notice-row-title"><b>공지</b><span>' + esc(notice.title) + '</span></span>' +
          '<span class="notice-row-meta">' + esc(notice.author || '관리자') + ' · ' + esc(dateText(notice.date)) + '</span></button>';
      }).join('');
      list.querySelectorAll('[data-notice-index]').forEach(function (button) {
        button.addEventListener('click', function () { openNotice(Number(button.dataset.noticeIndex)); });
      });
    }).catch(function () {
      list.innerHTML = '<div class="settings-empty">공지사항을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</div>';
    });
  }

  function openNotice(index) {
    var notice = state.notices[index];
    if (!notice) return;
    state.noticeDetail = notice;
    $('noticeList').hidden = true;
    $('noticeDetail').hidden = false;
    $('noticeDetailMeta').textContent = (notice.author || '관리자') + ' · ' + dateText(notice.date);
    $('noticeDetailTitle').textContent = notice.title || '제목 없음';
    $('noticeDetailContent').innerHTML = renderContent(notice.content);
    $('settings-notice').scrollTop = 0;
  }

  function currentSettings() {
    return state.userDoc && state.userDoc.settings ? Object.assign({}, state.userDoc.settings) : {};
  }

  function renderNotifications() {
    var login = $('notifyLogin');
    var card = $('notifyCard');
    if (!state.user) {
      login.hidden = false;
      card.hidden = true;
      return;
    }
    login.hidden = true;
    card.hidden = false;
    var settings = currentSettings();
    card.innerHTML = NOTIFY_ROWS.map(function (row) {
      var on = settings[row[0]] === true;
      return '<div class="notify-row"><span class="notify-copy"><strong>' + row[1] + '</strong><small>' + row[2] + '</small></span>' +
        '<button class="notify-switch' + (on ? ' is-on' : '') + '" data-notify-key="' + row[0] + '" type="button" role="switch" aria-checked="' + on + '" aria-label="' + row[1] + '"><i></i></button></div>';
    }).join('');
    card.querySelectorAll('[data-notify-key]').forEach(function (button) {
      button.addEventListener('click', function () { toggleNotification(button); });
    });
  }

  function toggleNotification(button) {
    var key = button.dataset.notifyKey;
    var settings = currentSettings();
    var enabled = !button.classList.contains('is-on');
    settings[key] = enabled;
    button.disabled = true;
    FB.updateUserDoc(state.user.uid, { settings: settings }).then(function () {
      state.userDoc = Object.assign({}, state.userDoc, { settings: settings });
      button.classList.toggle('is-on', enabled);
      button.setAttribute('aria-checked', String(enabled));
      showToast((NOTIFY_ROWS.filter(function (row) { return row[0] === key; })[0] || [key])[1] + '이 ' + (enabled ? '켜졌습니다.' : '꺼졌습니다.'));
    }).catch(function () {
      showToast('알림 설정을 저장하지 못했습니다.');
    }).then(function () { button.disabled = false; });
  }

  function selectedIcon() {
    var settings = currentSettings();
    if (settings.appIcon === 'logo-dark' || settings.appIcon === 'logo-light') return settings.appIcon;
    try {
      var saved = localStorage.getItem('fpp_appIcon');
      if (saved === 'logo-dark' || saved === 'logo-light') return saved;
    } catch (e) {}
    return readTheme() === 'light' ? 'logo-light' : 'logo-dark';
  }

  function renderAppIcons() {
    var selected = selectedIcon();
    $('iconSummary').textContent = selected === 'logo-light' ? '라이트 로고' : '다크 로고';
    document.querySelectorAll('[data-icon-choice]').forEach(function (button) {
      var active = button.dataset.iconChoice === selected;
      button.classList.toggle('is-on', active);
      button.setAttribute('aria-checked', String(active));
    });
  }

  function chooseIcon(button) {
    var value = button.dataset.iconChoice;
    try { localStorage.setItem('fpp_appIcon', value); } catch (e) {}
    renderAppIcons();
    if (!state.user) {
      showToast('이 브라우저에 아이콘 설정을 저장했습니다.');
      return;
    }
    var settings = currentSettings();
    settings.appIcon = value;
    FB.updateUserDoc(state.user.uid, { settings: settings }).then(function () {
      state.userDoc = Object.assign({}, state.userDoc, { settings: settings });
      showToast('앱 아이콘 설정을 저장했습니다.');
    }).catch(function () { showToast('앱 아이콘 설정을 저장하지 못했습니다.'); });
  }

  function installShortcut() {
    if (state.deferredInstall) {
      state.deferredInstall.prompt();
      state.deferredInstall.userChoice.then(function (choice) {
        showToast(choice.outcome === 'accepted' ? '홈 화면에 추가했습니다.' : '홈 화면 추가를 취소했습니다.');
        state.deferredInstall = null;
      });
    } else {
      showToast('브라우저 메뉴에서 홈 화면에 추가를 선택해 주세요.');
    }
  }

  function initAuth() {
    if (typeof FB === 'undefined') return;
    FB.onReady().then(function () {
      var auth = FB.auth && FB.auth();
      if (!auth) return;
      auth.onAuthStateChanged(function (user) {
        state.user = user;
        state.userDoc = null;
        renderMobileHeader();
        if (!user) {
          renderNotifications();
          return;
        }
        FB.getUserDoc(user.uid).then(function (profile) {
          state.userDoc = profile || {};
          renderMobileHeader();
          if (state.view === 'notify') renderNotifications();
          if (state.view === 'appIcon') renderAppIcons();
        }).catch(function () {
          state.userDoc = {};
          if (state.view === 'notify') renderNotifications();
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    applyTheme(readTheme());
    $('settingsBack').addEventListener('click', goBack);
    $('settingsMobileNotify').addEventListener('click', function () { showView('notify', true); });
    $('settingsMobileClose').addEventListener('click', closeSettings);
    $('noticeDetailBack').addEventListener('click', goBack);
    document.querySelectorAll('[data-open]').forEach(function (button) {
      button.addEventListener('click', function () { showView(button.dataset.open, true); });
    });
    document.querySelectorAll('[data-theme-choice]').forEach(function (button) {
      button.addEventListener('click', function () {
        applyTheme(button.dataset.themeChoice);
        showToast('테마가 적용되었습니다.');
      });
    });
    document.querySelectorAll('[data-icon-choice]').forEach(function (button) {
      button.addEventListener('click', function () { chooseIcon(button); });
    });
    $('installShortcut').addEventListener('click', installShortcut);
    window.addEventListener('beforeinstallprompt', function (event) {
      event.preventDefault();
      state.deferredInstall = event;
    });
    window.addEventListener('popstate', function (event) {
      if (event.state && event.state.settingsView) showView(event.state.settingsView, false);
      else showView('main', false);
    });
    initAuth();
    renderMobileHeader();
    var initial = location.hash.replace(/^#settings-/, '');
    if (TITLES[initial]) showView(initial, false);
  });
})();