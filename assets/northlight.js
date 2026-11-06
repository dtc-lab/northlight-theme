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

    // Mobile checkout bar: appears once the main CTA has scrolled above the viewport,
    // mirrors the selected bundle and links to the same checkout URL.
    var sticky = root.querySelector('[data-nl-sticky]');
    var packs = root.querySelector('[data-nl-packs]');
    if (sticky && cta) {
      sticky.hidden = false;
      var ticking = false;
      var check = function () {
        ticking = false;
        sticky.classList.toggle('is-visible', cta.getBoundingClientRect().bottom < 0);
      };
      window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; window.requestAnimationFrame(check); }
      }, { passive: true });
      check();
      var toPacks = function (ev) {
        if (ev) ev.preventDefault();
        if (packs) packs.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
      var picker = sticky.querySelector('[data-nl-sticky-packs]');
      if (picker) picker.addEventListener('click', toPacks);
      var link = sticky.querySelector('[data-nl-sticky-link]');
      if (link) link.addEventListener('click', function (ev) {
        if (cta.getAttribute('aria-disabled') === 'true') toPacks(ev);
      });
    }

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
      var per = root.querySelector('[data-nl-sum-per]');
      if (per) {
        per.textContent = (mode === 'sub' ? pack.dataset.perSub : pack.dataset.perOnce) || '';
        var cmp = root.querySelector('[data-nl-sum-cmp]');
        if (cmp) cmp.textContent = (mode === 'sub' ? pack.dataset.cmpSub : pack.dataset.cmpOnce) || '';
        var save = root.querySelector('[data-nl-sum-save]');
        if (save) { save.textContent = pack.dataset.save || ''; save.hidden = !pack.dataset.save; }
      }
      root.querySelectorAll('[data-nl-bonus-for]').forEach(function (el) {
        el.hidden = el.dataset.nlBonusFor !== pack.value;
      });
      root.querySelectorAll('[data-nl-mode-set]').forEach(function (b) {
        b.setAttribute('aria-pressed', b.dataset.nlModeSet === mode ? 'true' : 'false');
      });
      if (sticky) {
        var sl = sticky.querySelector('[data-nl-sticky-label]');
        var lab = pack.closest('.nl-pack') && pack.closest('.nl-pack').querySelector('.nl-pack__label');
        if (sl && lab) sl.textContent = lab.textContent.trim();
        var sp = sticky.querySelector('[data-nl-sticky-price]');
        if (sp) sp.textContent = (mode === 'sub' ? pack.dataset.priceSub : pack.dataset.priceOnce) || '';
        var sc = sticky.querySelector('[data-nl-sticky-cmp]');
        if (sc) sc.textContent = (mode === 'sub' ? pack.dataset.cmpSub : pack.dataset.cmpOnce) || '';
        var sk = sticky.querySelector('[data-nl-sticky-link]');
        if (sk) sk.setAttribute('href', cta.getAttribute('href'));
      }
      var pill = root.querySelector('[data-nl-cta-price]');
      if (pill) pill.textContent = (mode === 'sub' ? pack.dataset.priceSub : pack.dataset.priceOnce) || '';
    }

    root.addEventListener('change', update);
    root.querySelectorAll('[data-nl-mode-set]').forEach(function (b) {
      b.addEventListener('click', function () {
        var box = root.querySelector('input[data-nl-mode]');
        if (!box) return;
        box.checked = b.dataset.nlModeSet === 'sub';
        update();
      });
    });
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

  // Formula dial: prev/next buttons step through the bearing radios.
  function initDial(root) {
    if (!root || root.dataset.nlReady) return;
    root.dataset.nlReady = '1';
    var radios = Array.prototype.slice.call(root.querySelectorAll('[data-nl-dial-radio]'));
    if (!radios.length) return;
    root.querySelectorAll('[data-nl-dial-step]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var step = parseInt(btn.dataset.nlDialStep, 10) || 1;
        var cur = radios.findIndex(function (r) { return r.checked; });
        var next = radios[(cur + step + radios.length) % radios.length];
        next.checked = true;
        next.dispatchEvent(new Event('change', { bubbles: true }));
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
    (scope || document).querySelectorAll('[data-nl-ship]').forEach(initShip);
    (scope || document).querySelectorAll('[data-nl-dial]').forEach(initDial);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initAll(); });
  } else {
    initAll();
  }
  // Theme editor: re-init a section after it is re-rendered
  document.addEventListener('shopify:section:load', function (e) { initAll(e.target); });
})();
