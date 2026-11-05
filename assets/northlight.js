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
      var modeInput = root.querySelector('input[data-nl-mode]');
      var mode = modeInput ? (modeInput.checked ? 'sub' : 'once') : (root.dataset.mode || 'once');
      root.dataset.mode = mode;

      root.querySelectorAll('.nl-pack').forEach(function (el) {
        el.classList.toggle('is-selected', !!pack && el.contains(pack));
      });
      root.querySelectorAll('.nl-subtoggle').forEach(function (el) {
        el.classList.toggle('is-selected', !!modeInput && modeInput.checked);
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
      var pill = root.querySelector('[data-nl-cta-price]');
      if (pill) pill.textContent = (mode === 'sub' ? pack.dataset.priceSub : pack.dataset.priceOnce) || '';
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

  // Delivery estimate from the visitor's "today" (server render can be cached).
  function initShip(el) {
    if (!el || el.dataset.nlReady) return;
    el.dataset.nlReady = '1';
    var out = el.querySelector('[data-nl-ship-dates]');
    var min = parseInt(el.dataset.min, 10), max = parseInt(el.dataset.max, 10);
    if (!out || isNaN(min) || isNaN(max)) return;
    function fmt(days) {
      var d = new Date();
      d.setDate(d.getDate() + days);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    out.textContent = fmt(min) + ' \u2013 ' + fmt(max);
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
    (scope || document).querySelectorAll('[data-nl-ship]').forEach(initShip);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initAll(); });
  } else {
    initAll();
  }
  // Theme editor: re-init a section after it is re-rendered
  document.addEventListener('shopify:section:load', function (e) { initAll(e.target); });
})();
