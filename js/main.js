/* Анастасия Ельешевич — лендинг. Без зависимостей, ES5-совместимый синтаксис для старых Android/iOS. */
(function () {
  'use strict';

  var doc = document;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var hasIO = 'IntersectionObserver' in window;
  var fmt = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽'; };

  /* ---------- шапка + плавающая кнопка ---------- */
  var header = $('.header');
  var floatCta = $('.float-cta');
  var hero = $('.hero');
  var ticking = false;
  function onScroll() {
    var y = window.pageYOffset || doc.documentElement.scrollTop;
    header.classList.toggle('is-scrolled', y > 20);
    if (floatCta && hero) floatCta.classList.toggle('is-visible', y > hero.offsetHeight * 0.8);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- бургер-меню ---------- */
  var burger = $('.burger');
  var nav = $('#nav');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    nav.classList.toggle('is-open', open);
    doc.body.classList.toggle('is-locked', open);
  }
  burger.addEventListener('click', function () {
    setMenu(burger.getAttribute('aria-expanded') !== 'true');
  });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  doc.addEventListener('keydown', function (e) {
    if ((e.key === 'Escape' || e.keyCode === 27) && nav.classList.contains('is-open')) { setMenu(false); burger.focus(); }
  });
  window.addEventListener('resize', function () { if (window.innerWidth > 960) setMenu(false); });

  /* ---------- калькулятор Долями ---------- */
  var calc = $('[data-calc]');
  if (calc) {
    var parts = $$('[data-part]', calc);
    var total = $('[data-total]', calc);
    var update = function () {
      var checked = $('input[name="svc"]:checked', calc);
      var sum = checked ? parseInt(checked.value, 10) : 10000;
      parts.forEach(function (el) { el.textContent = fmt(sum / 4); });
      total.textContent = fmt(sum);
    };
    $$('input[name="svc"]', calc).forEach(function (i) { i.addEventListener('change', update); });
    update();
  }

  /* ---------- видео: играем только в зоне видимости ---------- */
  var videos = $$('.js-video');
  if (hasIO) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) {
          if (v.preload === 'none') { v.preload = 'auto'; }
          var p = v.play(); if (p && p.catch) p.catch(function () {});
        } else { v.pause(); }
      });
    }, { threshold: 0.35 });
    videos.forEach(function (v) { vio.observe(v); });
  } else {
    videos.forEach(function (v) { v.setAttribute('controls', ''); });
  }
  $$('.tile__sound').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var v = btn.parentNode.querySelector('video');
      var on = v.muted;
      videos.forEach(function (o) { o.muted = true; });
      $$('.tile__sound').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', 'Включить звук'); });
      v.muted = !on;
      if (on) {
        btn.setAttribute('aria-pressed', 'true'); btn.setAttribute('aria-label', 'Выключить звук');
        var p = v.play(); if (p && p.catch) p.catch(function () {});
      }
    });
  });

  /* ---------- сертификат ---------- */
  var certAmount = $('[data-cert-amount]');
  $$('.chip[data-amount]').forEach(function (chip, _, all) {
    chip.addEventListener('click', function () {
      all.forEach(function (c) { c.classList.remove('is-active'); c.setAttribute('aria-pressed', 'false'); });
      chip.classList.add('is-active'); chip.setAttribute('aria-pressed', 'true');
      certAmount.textContent = chip.getAttribute('data-amount');
    });
  });

  /* ---------- слайдер отзывов (нативный scroll-snap + кнопки + точки) ---------- */
  var slider = $('[data-slider]');
  if (slider) {
    var track = $('.slider__track', slider);
    var slides = $$('.review', track);
    var dotsBox = $('[data-dots]', slider);
    var prev = $('[data-prev]');
    var next = $('[data-next]');
    var dots = [];

    var step = function () {
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 16;
      return slides[0].getBoundingClientRect().width + gap;
    };
    var perView = function () { return Math.max(1, Math.round(track.clientWidth / step())); };
    var pages = function () { return Math.max(1, slides.length - perView() + 1); };
    var current = function () { return Math.round(track.scrollLeft / step()); };
    var goTo = function (i) {
      i = Math.max(0, Math.min(i, pages() - 1));
      track.scrollTo({ left: i * step(), behavior: 'smooth' });
    };

    var buildDots = function () {
      dotsBox.innerHTML = ''; dots = [];
      for (var i = 0; i < pages(); i++) {
        var b = doc.createElement('button');
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-label', 'Отзыв ' + (i + 1));
        (function (idx) { b.addEventListener('click', function () { goTo(idx); }); })(i);
        dotsBox.appendChild(b); dots.push(b);
      }
      sync();
    };
    var sync = function () {
      var c = current();
      dots.forEach(function (d, i) { d.setAttribute('aria-selected', i === c ? 'true' : 'false'); });
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    };

    if (prev) prev.addEventListener('click', function () { goTo(current() - 1); });
    if (next) next.addEventListener('click', function () { goTo(current() + 1); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current() - 1); }
    });
    var st;
    track.addEventListener('scroll', function () { clearTimeout(st); st = setTimeout(sync, 60); }, { passive: true });
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(buildDots, 150); });
    buildDots();
  }

  /* ---------- карта: грузим iframe, только когда блок рядом ---------- */
  var map = $('[data-map]');
  if (map) {
    var loadMap = function () {
      if (map.getAttribute('data-loaded')) return;
      map.setAttribute('data-loaded', '1');
      var f = doc.createElement('iframe');
      f.src = map.getAttribute('data-src');
      f.title = 'Карта: Шелехов, 8-й квартал, 16, офис 218';
      f.loading = 'lazy';
      f.setAttribute('allowfullscreen', '');
      map.innerHTML = '';
      map.appendChild(f);
    };
    $('.map__load', map).addEventListener('click', loadMap);
    if (hasIO) {
      var mio = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { loadMap(); mio.disconnect(); }
      }, { rootMargin: '300px 0px' });
      mio.observe(map);
    }
  }

  /* ---------- год в подвале ---------- */
  var y = $('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();
