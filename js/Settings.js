/* FPP v2 — 모바일 설정 페이지 */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var state = { view: 'blank', notices: [], noticeDetail: null, user: null, userDoc: null, favoriteTab: 'char', toastTimer: null, deferredInstall: null };
  var NOTIFY_ROWS = [
    ['patch', '패치노트 알림', '새로운 패치노트가 등록되면 알려드립니다.'],
    ['fav', '즐겨찾기 알림', '즐겨찾기한 캐릭터의 밸런스 패치를 알려드립니다.'],
    ['comment', '댓글 알림', '댓글과 대댓글이 달리면 알려드립니다.'],
    ['event', '이벤트 알림', '새로운 이벤트와 종료 임박 소식을 알려드립니다.']
  ];
  var PROFILE_ICON_FILES = [
    'ace.png', 'akainu.png', 'bigmom.png', 'bonney.png', 'brook.png',
    'buggy.png', 'carrot.png', 'chopper.png', 'crocodile.png', 'dendenmushi.png',
    'doflamingo.png',
    'dragon.png', 'franky.png', 'garp.png', 'hancock.png', 'jinbe.png',
    'kaido.png', 'katakuri.png', 'kid.png', 'kizaru.png', 'koby.png',
    'kuma.png', 'law.png', 'luffy.png', 'mihawk.png', 'nami.png',
    'nika.png', 'robin.png', 'roger.png', 'sabo.png', 'sanji.png',
    'shanks.png', 'smoker.png', 'teach.png', 'usopp.png', 'vivi.png',
    'whitebeard.png', 'yamato.png', 'zoro.png'
  ];

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function avatarOf(icon) {
    var index = parseInt(icon, 10);
    if (isNaN(index)) index = 0;
    index = Math.abs(index) % PROFILE_ICON_FILES.length;
    return 'img/avatars/' + PROFILE_ICON_FILES[index];
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
        '<a class="settings-mobile-login" href="ko/Login.html">' +
        '<span>로그인 해주세요</span><span class="settings-mobile-login-icon ic-v2-control-arrow-right-line" aria-hidden="true"></span></a>';
      return;
    }
    var nickname = (state.userDoc && state.userDoc.nickname) || state.user.displayName || '선원';
    userBox.innerHTML =
      '<span class="settings-mobile-profile settings-mobile-profile--image" aria-hidden="true">' +
      '<img src="' + esc(avatarOf(state.userDoc && state.userDoc.profileIcon)) + '" alt="내 프로필"></span>' +
      '<span class="settings-mobile-login">' + esc(nickname) + '</span>';
  }

  function dashboardCounts() {
    return (state.userDoc && state.userDoc.counts) || {};
  }

  function renderDashboardFavorites() {
    var body = $('dashboardFavoriteBody');
    if (!body) return;
    var settings = state.userDoc || {};
    var key = state.favoriteTab === 'support' ? 'favSupports' : 'favChars';
    var ids = Array.isArray(settings[key]) ? settings[key] : [];
    var page = state.favoriteTab === 'support' ? 'Main.html#characters?tab=support' : 'Main.html#characters';
    if (!ids.length) {
      body.innerHTML =
        '<div class="settings-favorite-empty">' +
        '<strong>즐겨찾기한 ' + (state.favoriteTab === 'support' ? '서폿 캐릭터' : '캐릭터') + ' 없음</strong>' +
        '<span>추가해보세요</span>' +
        '<a class="settings-favorite-button" href="ko/' + page + '">캐릭터 페이지로</a>' +
        '</div>';
      return;
    }
    var itemPage = state.favoriteTab === 'support' ? 'Main.html#characters?tab=support&' : 'Main.html#characters?';
    body.innerHTML = '<div class="settings-favorite-grid">' + ids.slice(0, 16).map(function (id) {
      return '<a class="settings-favorite-item" href="ko/' + itemPage + 'fav=1&char=' + encodeURIComponent(id) + '">' +
        '<span class="settings-favorite-item-icon ic-v2-community-star-fill" aria-hidden="true"></span><strong>캐릭터 ' + esc(id) + '</strong></a>';
    }).join('') + '</div>';
  }

  function renderDashboard() {
    var counts = dashboardCounts();
    if ($('dashboardPosts')) $('dashboardPosts').textContent = counts.posts || 0;
    if ($('dashboardComments')) $('dashboardComments').textContent = counts.comments || 0;
    if ($('dashboardLikes')) $('dashboardLikes').textContent = counts.likes || 0;
    renderDashboardFavorites();
  }

  function closeSettings() {
    location.href = 'ko/Main.html#home';
  }

  function setProgress(view) {
    $('settingsProgress').style.width = (view === 'blank' ? 0 : view === 'main' ? 25 : 100) + '%';
  }

  function setHeaderSelection(view) {
    var settings = $('settingsMobileSettings');
    var notify = $('settingsMobileNotify');
    var back = $('settingsMobileBack');
    var title = $('settingsMobileTitle');
    var user = $('settingsMobileUser');
    if (!settings || !notify || !back || !title || !user) return;
    var inSettings = view !== 'blank';
    var headerTitles = {
      main: '설정',
      myInfo: '내 정보',
      notice: '공지사항',
      notify: '알림',
      theme: '테마',
      appIcon: '앱 아이콘 변경'
    };
    back.hidden = !inSettings;
    title.hidden = !inSettings;
    title.textContent = headerTitles[view] || '설정';
    user.hidden = inSettings;
    var settingsSelected = view !== 'blank' && view !== 'notify';
    var hideTopActions = view === 'main';
    settings.hidden = hideTopActions;
    notify.hidden = hideTopActions;
    settings.setAttribute('aria-hidden', String(hideTopActions));
    notify.setAttribute('aria-hidden', String(hideTopActions));
    settings.toggleAttribute('aria-current', settingsSelected);
    if (settingsSelected) settings.setAttribute('aria-current', 'page');
    notify.toggleAttribute('aria-current', view === 'notify');
    if (view === 'notify') notify.setAttribute('aria-current', 'page');
  }

  function showView(view, addHistory) {
    if (!document.getElementById('settings-' + view)) view = 'main';
    if (view === state.view) return;
    document.querySelectorAll('.settings-view').forEach(function (section) {
      var active = section.getAttribute('data-view') === view;
      section.classList.toggle('is-active', active);
      section.setAttribute('aria-hidden', String(!active));
    });
    state.view = view;
    setProgress(view);
    setHeaderSelection(view);
    if (addHistory) history.pushState({ settingsView: view }, '', view === 'main' ? '#setting' : '#settings-' + view);
    if (view === 'notice') loadNotices();
    if (view === 'notify') renderNotifications();
    if (view === 'myInfo') renderMyInfo();
    if (view === 'theme') applyTheme(readTheme());
    if (view === 'appIcon') renderAppIcons();
    if (view === 'blank') renderDashboard();
    window.scrollTo(0, 0);
  }

  function goToSettingsMain() {
    state.noticeDetail = null;
    if ($('noticeDetail')) $('noticeDetail').hidden = true;
    if ($('noticeList')) $('noticeList').hidden = false;
    if (state.view === 'main') {
      location.href = 'ko/Settings.html';
      return;
    }
    history.replaceState({ settingsView: 'main' }, '', '#setting');
    showView('main', false);
  }

  function setFavoriteTab(button) {
    state.favoriteTab = button.getAttribute('data-favorite-tab') === 'support' ? 'support' : 'char';
    document.querySelectorAll('[data-favorite-tab]').forEach(function (tab) {
      var selected = tab === button;
      tab.classList.toggle('is-on', selected);
      tab.setAttribute('aria-selected', String(selected));
    });
    renderDashboardFavorites();
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
    else location.href = 'ko/Main.html#home';
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

  function renderMyInfo() {
    var login = $('infoLogin');
    var card = $('infoCard');
    if (!login || !card) return;
    if (!state.user) {
      login.hidden = false;
      card.hidden = true;
      return;
    }
    login.hidden = true;
    card.hidden = false;
    var profile = state.userDoc || {};
    var nickname = profile.nickname || state.user.displayName || '선원';
    var email = state.user.email || '이메일 없음';
    var memberId = profile.memberNumber || profile.memberId || state.user.uid || '확인 불가';
    card.innerHTML =
      '<div class="settings-info-row"><span>닉네임</span><strong>' + esc(nickname) + '</strong></div>' +
      '<div class="settings-info-row"><span>이메일</span><strong>' + esc(email) + '</strong></div>' +
      '<div class="settings-info-row"><span>회원번호</span><strong>' + esc(memberId) + '</strong></div>';
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

  function isMobileLayout() {
    return window.matchMedia
      ? window.matchMedia('(max-width: 767px)').matches
      : window.innerWidth <= 767;
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
          renderDashboard();
           if (state.view === 'notify') renderNotifications();
           if (state.view === 'myInfo') renderMyInfo();
          if (state.view === 'appIcon') renderAppIcons();
        }).catch(function () {
          state.userDoc = {};
          renderDashboard();
           if (state.view === 'notify') renderNotifications();
           if (state.view === 'myInfo') renderMyInfo();
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    /* HTML의 조기 리다이렉트가 막히는 환경을 위한 2차 방어 */
    if (!isMobileLayout()) {
      location.replace('ko/Main.html#home');
      return;
    }
    applyTheme(readTheme());
    $('settingsMobileBack').addEventListener('click', goToSettingsMain);
    $('settingsMobileSettings').addEventListener('click', function () {
      showView('main', true);
    });
    $('settingsMobileNotify').addEventListener('click', function () {
      if (!state.user) {
        location.href = 'ko/Login.html';
        return;
      }
      showView('notify', true);
    });
    $('settingsMobileClose').addEventListener('click', closeSettings);
    $('noticeDetailBack').addEventListener('click', goBack);
    document.querySelectorAll('[data-open]').forEach(function (button) {
      button.addEventListener('click', function () { showView(button.dataset.open, true); });
    });
    document.querySelectorAll('[data-favorite-tab]').forEach(function (button) {
      button.addEventListener('click', function () { setFavoriteTab(button); });
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
    renderDashboard();
    var initial = location.hash === '#setting' ? 'main' : location.hash.replace(/^#settings-/, '');
    if (['blank', 'main', 'myInfo', 'notice', 'notify', 'theme', 'appIcon'].indexOf(initial) > -1) {
      if (initial === 'main' && location.hash === '#settings-main') {
        history.replaceState({ settingsView: 'main' }, '', '#setting');
      }
      if (initial !== state.view) showView(initial, false);
      else setHeaderSelection(initial);
    } else {
      setHeaderSelection('blank');
    }
  });
})();