/* ============================================================
   FPP v2 — i18n.js
   URL 기반 언어 전환, 외부 언어팩 로더, 공통 UI 번역
   ============================================================ */
(function (root) {
  'use strict';

  var LANGS = ['ko', 'en', 'ja', 'zh-cn', 'zh-tw'];
  var NAMES = {
    ko: '한국어',
    en: 'English',
    ja: '日本語',
    'zh-cn': '简体中文',
    'zh-tw': '繁體中文'
  };
  var PACK = {};

  function validLanguage(code) {
    code = String(code || '').toLowerCase();
    return LANGS.indexOf(code) > -1 ? code : 'ko';
  }

  function pathInfo() {
    var m = location.pathname.match(/\/(ko|en|ja|zh-cn|zh-tw)\/([^/]+\.html)$/i);
    return {
      lang: m ? validLanguage(m[1]) : 'ko',
      file: m ? m[2] : (location.pathname.split('/').pop() || 'Main.html'),
      localized: !!m
    };
  }

  var info = pathInfo();
  var current = info.lang;
  var translating = false;

  function storedLanguage() {
    try {
      var saved = localStorage.getItem('fpp_language');
      return LANGS.indexOf(saved) > -1 ? saved : '';
    } catch (e) {
      return '';
    }
  }

  function get(key, fallback) {
    if (Object.prototype.hasOwnProperty.call(PACK, key)) return PACK[key];
    return fallback == null ? key : fallback;
  }

  function preserveWhitespace(original, value) {
    var lead = (original.match(/^\s*/) || [''])[0];
    var tail = (original.match(/\s*$/) || [''])[0];
    return lead + value + (tail && tail.length > lead.length ? tail : '');
  }

  function translateText(text) {
    if (!text || current === 'ko') return text;
    var trimmed = text.trim();
    if (!trimmed) return text;
    if (Object.prototype.hasOwnProperty.call(PACK, trimmed)) {
      return preserveWhitespace(text, PACK[trimmed]);
    }
    var result = text;
    Object.keys(PACK).sort(function (a, b) { return b.length - a.length; }).forEach(function (key) {
      if (result.indexOf(key) > -1) result = result.split(key).join(PACK[key]);
    });
    return result;
  }

  function translateElement(el) {
    if (!el || el.nodeType !== 1) return;
    if (/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/i.test(el.tagName)) return;

    var nodes = [];
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var parent = node.parentElement;
        return parent && !/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/i.test(parent.tagName) ?
          NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      var value = translateText(node.nodeValue);
      if (value !== node.nodeValue) node.nodeValue = value;
    });

    var elements = [el];
    if (el.querySelectorAll) {
      Array.prototype.push.apply(elements, el.querySelectorAll('*'));
    }
    elements.forEach(function (item) {
      ['aria-label', 'title', 'placeholder', 'alt'].forEach(function (attr) {
        if (!item.hasAttribute || !item.hasAttribute(attr)) return;
        var value = item.getAttribute(attr);
        var translated = translateText(value);
        if (translated !== value) item.setAttribute(attr, translated);
      });
    });
  }

  function localizedHref(href) {
    if (!href || /^(?:[a-z]+:|\/\/|#|data:|mailto:|tel:)/i.test(href)) return href;
    var hash = '';
    var query = '';
    var bare = href;
    var hi = bare.indexOf('#');
    if (hi > -1) { hash = bare.slice(hi); bare = bare.slice(0, hi); }
    var qi = bare.indexOf('?');
    if (qi > -1) { query = bare.slice(qi); bare = bare.slice(0, qi); }
    if (!/\.html$/i.test(bare)) return href;
    var file = bare.split('/').pop();
    if (LANGS.some(function (lang) { return bare.split('/').indexOf(lang) > -1; })) return href;

    var base = location.pathname.replace(/[^/]*$/, '');
    if (info.localized) base = base.replace(/(ko|en|ja|zh-cn|zh-tw)\/$/i, '');
    return base + current + '/' + file + query + hash;
  }

  function rewriteLinks(rootEl) {
    if (!rootEl || !rootEl.querySelectorAll) return;
    rootEl.querySelectorAll('a[href]').forEach(function (anchor) {
      var href = anchor.getAttribute('href');
      var next = localizedHref(href);
      if (next !== href) anchor.setAttribute('href', next);
    });
  }

  function apply(rootEl) {
    if (!rootEl) return;
    translating = true;
    document.documentElement.setAttribute('lang', current);
    translateElement(rootEl);
    rewriteLinks(rootEl);
    if (document.title) document.title = translateText(document.title);
    var description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute('content', translateText(description.getAttribute('content')));
    translating = false;
  }

  function languageHref(code) {
    code = validLanguage(code);
    var base = location.pathname.replace(/[^/]*$/, '');
    if (info.localized) base = base.replace(/(ko|en|ja|zh-cn|zh-tw)\/$/i, '');
    return base + code + '/' + info.file + location.search + location.hash;
  }

  function setLanguage(code) {
    code = validLanguage(code);
    try { localStorage.setItem('fpp_language', code); } catch (e) { }
    if (code === current && info.localized) return;
    location.href = languageHref(code);
  }

  function parsePack(text) {
    try {
      var parsed = JSON.parse(text);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function loadPack() {
    var url = new URL('lang/' + current + '.txt', document.baseURI).href;
    return fetch(url, { cache: 'no-store' }).then(function (response) {
      return response.ok ? response.text() : '';
    }).then(function (text) {
      PACK = parsePack(text);
      root.FPP_LANGUAGE_PACK = PACK;
      apply(document.body || document.documentElement);
      return PACK;
    }).catch(function () {
      PACK = {};
      root.FPP_LANGUAGE_PACK = PACK;
      return PACK;
    });
  }

  root.I18N = {
    langs: LANGS.slice(),
    names: NAMES,
    get: get,
    t: get,
    current: function () { return current; },
    isLocalized: function () { return info.localized; },
    translateText: translateText,
    apply: apply,
    localizedHref: localizedHref,
    languageHref: languageHref,
    setLanguage: setLanguage,
    loadPack: loadPack
  };

  function boot() {
    var saved = storedLanguage();
    if (!info.localized && saved) {
      location.replace(languageHref(saved));
      return;
    }
    apply(document.body || document.documentElement);
    loadPack();
    if (!root.MutationObserver) return;
    var observer = new MutationObserver(function (records) {
      if (translating) return;
      records.forEach(function (record) {
        record.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) apply(node);
          else if (node.nodeType === 3) {
            var value = translateText(node.nodeValue);
            if (value !== node.nodeValue) {
              translating = true;
              node.nodeValue = value;
              translating = false;
            }
          }
        });
      });
    });
    observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);