/* NORTHLIGHT — buy box, gallery and tabs. No dependencies. */
(function () {
  'use strict';

  // Carry the visitor's query string (UTMs, fbclid, Redtrack click id…) onto the
  // external checkout link so attribution survives the jump to Reign.
  function withTracking(url) {
    if (!url) return '';
    try {
      var out = new URL(url, window.location.origin);
      var here = new URLSearchParams(window.location.search);
      here.forEach(function (value, key) {
        if (!out.searchParams.has(key)) out.searchParams.set(key, value);
      });
      return out.toString();
    } catch (e) {
      return url;
    }
  }

  function initBuy(root) {
    if (!root || root.dataset.nlReady) return;
    root.dataset.nlReady = '1';

    var cta = root.querySelector('[data-nl-cta]');
    var cadence = root.querySelectorAll('[data-nl-cadence]');

    function update() {
      var pack = root.querySelector('input[data-nl-pack]:checked');
      var modeInput = root.querySelector('input[data-nl-mode]:checked');
      var mode = modeInput ? modeInput.value : (root.dataset.mode || 'once');
      root.dataset.mode = mode;

      root.querySelectorAll('.nl-pack').forEach(function (el) {
        el.classList.toggle('is-selected', !!pack && el.contains(pack));
      });
      root.querySelectorAll('.nl-mode').forEach(function (el) {
        el.classList.toggle('is-selected', !!modeInput && el.contains(modeInput));
      });

      if (!pack || !cta) return;
      var url = mode === 'sub' ? pack.dataset.urlSub : pack.dataset.urlOnce;
      if (url) {
        cta.setAttribute('href', withTracking(url));
        cta.removeAttribute('aria-disabled');
      } else {
        cta.setAttribute('href', '#');
        cta.setAttribute('aria-disabled', 'true');
      }
      cadence.forEach(function (el) { el.textContent = pack.dataset.cadence || ''; });
    }

    root.addEventListener('change', update);
    if (cta) {
      cta.addEventListener('click', function (e) {
        if (cta.getAttribute('aria-disabled') === 'true') e.preventDefault();
      });
    }
    update();

    // Gallery thumbnails
    var slides = root.querySelectorAll('.nl-gallery__slide');
    var thumbs = root.querySelectorAll('[data-nl-thumb]');
    thumbs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var i = btn.getAttribute('data-nl-thumb');
        slides.forEach(function (s) { s.classList.toggle('is-active', s.dataset.index === i); });
        thumbs.forEach(function (t) {
          var on = t === btn;
          t.classList.toggle('is-active', on);
          t.setAttribute('aria-current', on ? 'true' : 'false');
        });
      });
    });
  }

  function initTabs(root) {
    if (!root || root.dataset.nlReady) return;
    root.dataset.nlReady = '1';
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    function select(tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (next) { e.preventDefault(); next.focus(); select(next); }
      });
    });
  }

  function initAll(scope) {
    (scope || document).querySelectorAll('[data-nl-buy]').forEach(initBuy);
    (scope || document).querySelectorAll('[data-nl-tabs]').forEach(initTabs);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initAll(); });
  } else {
    initAll();
  }
  // Theme editor: re-init a section after it is re-rendered
  document.addEventListener('shopify:section:load', function (e) { initAll(e.target); });
})();
