/* =========================================================
   LOS AMIGOS - motor de animacion a mano (vanilla, offline)
   Solo transform/opacity. 60fps. Respeta reduced-motion.
   ========================================================= */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement, body;
  root.classList.add('js');

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var lerp = function (a, b, t) { return a + (b - a) * t; };

  /* Failsafe: si algo falla, nada queda invisible */
  setTimeout(function () {
    doc.querySelectorAll('[data-reveal]:not(.is-in)').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-in');
    });
  }, 1800);

  doc.addEventListener('DOMContentLoaded', init);

  function init() {
    body = doc.body;
    preloader();
    header();
    mobileMenu();
    kinetic();
    reveals();
    counters();
    parallax();
    cursor();
    magnetic();
    tilt();
    carousels();
    showcase();
    dust();
    lightbox();
    todayRow();
    yearStamp();
  }

  /* ---------- Preloader (solo primera vista de la sesion) ---------- */
  function preloader() {
    var pl = doc.getElementById('preloader');
    if (!pl) return;
    var seen = false;
    try { seen = sessionStorage.getItem('la-intro') === '1'; } catch (e) {}
    if (reduced || seen) { pl.classList.add('is-gone'); startHero(); return; }
    try { sessionStorage.setItem('la-intro', '1'); } catch (e) {}

    var word = pl.querySelector('.preloader__word');
    var text = word.textContent; word.textContent = '';
    var frag = doc.createDocumentFragment();
    for (var i = 0; i < text.length; i++) {
      var s = doc.createElement('span');
      s.textContent = text[i] === ' ' ? '\u00A0' : text[i];
      s.style.animationDelay = (0.12 + i * 0.045) + 's';
      frag.appendChild(s);
    }
    word.appendChild(frag);
    body.style.overflow = 'hidden';
    setTimeout(function () {
      pl.classList.add('is-done');
      body.style.overflow = '';
      startHero();
      setTimeout(function () { pl.classList.add('is-gone'); }, 1100);
    }, 1550);
  }

  function startHero() {
    var h = doc.querySelector('.kinetic');
    if (h) h.classList.add('is-in');
    doc.querySelectorAll('[data-hero-reveal]').forEach(function (el, i) {
      el.style.setProperty('--d', (0.25 + i * 0.12) + 's');
      el.classList.add('is-in');
    });
  }

  /* ---------- Header: se oculta al bajar, aparece al subir ---------- */
  function header() {
    var el = doc.querySelector('.header');
    if (!el) return;
    var last = 0, ticking = false;
    function onScroll() {
      var y = window.scrollY;
      el.classList.toggle('is-scrolled', y > 30);
      if (y > last && y > 220 && !body.classList.contains('menu-open')) el.classList.add('is-hidden');
      else el.classList.remove('is-hidden');
      last = y; ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
    onScroll();
  }

  /* ---------- Menu movil ---------- */
  function mobileMenu() {
    var btn = doc.querySelector('.burger');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var open = body.classList.toggle('menu-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    doc.querySelectorAll('.mnav a').forEach(function (a) {
      a.addEventListener('click', function () { body.classList.remove('menu-open'); });
    });
  }

  /* ---------- Titular cinetico: palabra a palabra ---------- */
  function kinetic() {
    doc.querySelectorAll('.kinetic').forEach(function (h) {
      var words = h.textContent.trim().split(/\s+/);
      h.textContent = '';
      words.forEach(function (w, i) {
        var wrap = doc.createElement('span'); wrap.className = 'w';
        var inner = doc.createElement('span');
        inner.textContent = w; inner.style.setProperty('--i', i);
        wrap.appendChild(inner); h.appendChild(wrap);
        h.appendChild(doc.createTextNode(' '));
      });
      if (reduced) h.classList.add('is-in');
    });
  }

  /* ---------- Scroll reveals con stagger ---------- */
  function reveals() {
    var els = doc.querySelectorAll('[data-reveal]');
    if (!els.length) return;
    if (reduced || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, parent = el.parentElement;
        if (el.hasAttribute('data-stagger-item') && parent) {
          var sibs = Array.prototype.filter.call(parent.children, function (c) { return c.hasAttribute('data-stagger-item'); });
          el.style.setProperty('--d', (sibs.indexOf(el) * 0.07) + 's');
        }
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Contadores ---------- */
  function counters() {
    var els = doc.querySelectorAll('[data-count]');
    if (!els.length) return;
    var run = function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var dec = (el.getAttribute('data-count').split('.')[1] || '').length;
      var dur = 1400, t0 = null;
      var ease = function (t) { return 1 - Math.pow(1 - t, 4); };
      function frame(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        el.textContent = (target * ease(p)).toFixed(dec).replace('.', ',');
        if (p < 1) requestAnimationFrame(frame);
      }
      if (reduced) { el.textContent = target.toFixed(dec).replace('.', ','); return; }
      requestAnimationFrame(frame);
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          run(e.target);
          e.target.closest('.stat') && e.target.closest('.stat').classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Parallax por capas (rAF + lerp) ---------- */
  function parallax() {
    if (reduced) return;
    var els = doc.querySelectorAll('[data-parallax]');
    if (!els.length) return;
    var items = Array.prototype.map.call(els, function (el) {
      return { el: el, speed: parseFloat(el.getAttribute('data-parallax')) || 0.12, cur: 0 };
    });
    function tick() {
      var vh = window.innerHeight;
      items.forEach(function (it) {
        var r = it.el.getBoundingClientRect();
        var center = r.top + r.height / 2 - vh / 2;
        var target = -center * it.speed;
        it.cur = lerp(it.cur, target, 0.09);
        it.el.style.transform = 'translate3d(0,' + it.cur.toFixed(2) + 'px,0)';
      });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Cursor propio con fisica ---------- */
  function cursor() {
    if (!finePointer || reduced) return;
    root.classList.add('has-cursor');
    var dot = doc.createElement('div'); dot.className = 'cursor';
    var ring = doc.createElement('div'); ring.className = 'cursor-ring';
    body.appendChild(dot); body.appendChild(ring);
    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    doc.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
    (function tick() {
      rx = lerp(rx, mx, 0.16); ry = lerp(ry, my, 0.16);
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
      ring.style.transform = 'translate(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px) translate(-50%,-50%)';
      requestAnimationFrame(tick);
    })();
    doc.addEventListener('mouseover', function (e) {
      ring.classList.toggle('is-hover', !!e.target.closest('a,button,.shot,[data-cursor]'));
    }, { passive: true });
  }

  /* ---------- Botones magneticos ---------- */
  function magnetic() {
    if (!finePointer || reduced) return;
    doc.querySelectorAll('.btn,.cbtn').forEach(function (el) {
      var tx = 0, ty = 0, cx = 0, cy = 0, raf = null, on = false;
      function tick() {
        cx = lerp(cx, tx, 0.18); cy = lerp(cy, ty, 0.18);
        el.style.transform = 'translate(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px)';
        if (on || Math.abs(cx) > 0.1 || Math.abs(cy) > 0.1) raf = requestAnimationFrame(tick);
        else { el.style.transform = ''; raf = null; }
      }
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        tx = (e.clientX - r.left - r.width / 2) * 0.28;
        ty = (e.clientY - r.top - r.height / 2) * 0.34;
        on = true; if (!raf) raf = requestAnimationFrame(tick);
      });
      el.addEventListener('mouseleave', function () { tx = 0; ty = 0; on = false; });
    });
  }

  /* ---------- Tarjetas con tilt 3D + destello ---------- */
  function tilt() {
    if (!finePointer || reduced) return;
    doc.querySelectorAll('.tcard').forEach(function (card) {
      var inner = card.querySelector('.tcard__in');
      var glare = card.querySelector('.tcard__glare');
      var rx = 0, ry = 0, crx = 0, cry = 0, raf = null, on = false;
      function tick() {
        crx = lerp(crx, rx, 0.12); cry = lerp(cry, ry, 0.12);
        inner.style.transform = 'perspective(800px) rotateX(' + crx.toFixed(2) + 'deg) rotateY(' + cry.toFixed(2) + 'deg)';
        if (on || Math.abs(crx) > 0.05 || Math.abs(cry) > 0.05) raf = requestAnimationFrame(tick);
        else { inner.style.transform = ''; raf = null; }
      }
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        ry = (px - 0.5) * 10; rx = (0.5 - py) * 8;
        if (glare) {
          glare.style.setProperty('--gx', ((px - 0.5) * 60) + '%');
          glare.style.setProperty('--gy', ((py - 0.5) * 60) + '%');
        }
        on = true; if (!raf) raf = requestAnimationFrame(tick);
      });
      card.addEventListener('mouseleave', function () { rx = 0; ry = 0; on = false; });
    });
  }

  /* ---------- Carruseles: flechas + arrastre + snap ---------- */
  function carousels() {
    doc.querySelectorAll('.carousel').forEach(function (c) {
      var track = c.querySelector('.carousel__track');
      var prev = c.querySelector('[data-prev]');
      var next = c.querySelector('[data-next]');
      if (!track) return;
      var items = Array.prototype.slice.call(track.children);
      if (!items.length) return;

      /* indice de la tarjeta mas cercana a la posicion actual de scroll */
      function currentIndex() {
        var pos = track.scrollLeft, best = 0, bestDist = Infinity;
        items.forEach(function (it, i) {
          var d = Math.abs(it.offsetLeft - pos);
          if (d < bestDist) { bestDist = d; best = i; }
        });
        return best;
      }
      /* mueve exactamente a la tarjeta [i], alineada a su borde izquierdo real */
      function goTo(i) {
        i = Math.max(0, Math.min(items.length - 1, i));
        track.scrollTo({ left: items[i].offsetLeft, behavior: reduced ? 'auto' : 'smooth' });
      }
      function update() {
        var i = currentIndex();
        if (prev) prev.disabled = i <= 0;
        if (next) next.disabled = i >= items.length - 1;
      }

      prev && prev.addEventListener('click', function () { goTo(currentIndex() - 1); });
      next && next.addEventListener('click', function () { goTo(currentIndex() + 1); });
      track.addEventListener('scroll', function () { requestAnimationFrame(update); }, { passive: true });

      /* arrastre con puntero fino */
      var down = false, startX = 0, startL = 0, moved = false;
      track.addEventListener('pointerdown', function (e) {
        if (e.pointerType !== 'mouse') return;
        down = true; moved = false; startX = e.clientX; startL = track.scrollLeft;
        track.classList.add('is-drag'); track.setPointerCapture(e.pointerId);
      });
      track.addEventListener('pointermove', function (e) {
        if (!down) return;
        var dx = e.clientX - startX;
        if (Math.abs(dx) > 4) moved = true;
        track.scrollLeft = startL - dx;
      });
      ['pointerup', 'pointercancel'].forEach(function (ev) {
        track.addEventListener(ev, function () {
          down = false; track.classList.remove('is-drag');
          if (moved) goTo(currentIndex());
        });
      });
      track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);

      /* corrige cualquier desalineacion inicial (fuentes cargando, scroll anchoring...) */
      function settle() { track.scrollLeft = items[0].offsetLeft; update(); }
      settle();
      if (doc.fonts && doc.fonts.ready) { doc.fonts.ready.then(settle); }
      requestAnimationFrame(settle);
      window.addEventListener('resize', function () { goTo(currentIndex()); });
    });
  }

  /* ---------- Showcase: la imagen cambia con el scroll ---------- */
  function showcase() {
    var sc = doc.querySelector('[data-showcase]');
    if (!sc) return;
    var imgs = sc.querySelectorAll('.showcase__viewport img');
    var items = sc.querySelectorAll('.showcase__item');
    var count = sc.querySelector('.showcase__count b');
    var idx = 0;
    function set(i) {
      if (i === idx || !imgs[i]) return;
      idx = i;
      imgs.forEach(function (im, k) { im.classList.toggle('is-on', k === i); });
      items.forEach(function (it, k) { it.classList.toggle('is-on', k === i); });
      if (count) count.textContent = '0' + (i + 1);
      var mob = window.matchMedia('(max-width:820px)').matches;
      if (mob && items[i] && items[i].parentElement) {
        items[i].parentElement.scrollTo({ left: items[i].offsetLeft - 12, behavior: reduced ? 'auto' : 'smooth' });
      }
    }
    items.forEach(function (it, i) { it.addEventListener('click', function () { set(i); }); });

    if (!reduced && 'IntersectionObserver' in window) {
      var ticking = false;
      window.addEventListener('scroll', function () {
        if (ticking) return; ticking = true;
        requestAnimationFrame(function () {
          var r = sc.getBoundingClientRect();
          var vh = window.innerHeight;
          if (r.top < vh && r.bottom > 0) {
            var p = Math.min(Math.max((vh * 0.6 - r.top) / (r.height * 0.9), 0), 0.999);
            set(Math.floor(p * imgs.length));
          }
          ticking = false;
        });
      }, { passive: true });
    }
  }

  /* ---------- Particulas del heroe ---------- */
  function dust() {
    if (reduced) return;
    var host = doc.querySelector('.hero__dust');
    if (!host) return;
    for (var i = 0; i < 16; i++) {
      var d = doc.createElement('i');
      d.style.left = (Math.random() * 100) + '%';
      d.style.animationDuration = (7 + Math.random() * 9) + 's';
      d.style.animationDelay = (Math.random() * 9) + 's';
      d.style.width = d.style.height = (2 + Math.random() * 2.4) + 'px';
      host.appendChild(d);
    }
  }

  /* ---------- Lightbox galeria ---------- */
  function lightbox() {
    var shots = doc.querySelectorAll('[data-zoom]');
    if (!shots.length) return;
    var lb = doc.createElement('div'); lb.className = 'lightbox';
    lb.innerHTML = '<img alt=""><button class="cbtn lightbox__close" aria-label="Cerrar">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button>';
    body.appendChild(lb);
    var img = lb.querySelector('img');
    function close() { lb.classList.remove('is-open'); body.style.overflow = ''; }
    shots.forEach(function (s) {
      s.addEventListener('click', function () {
        var src = s.querySelector('img');
        img.src = src.currentSrc || src.src;
        img.alt = src.alt || '';
        lb.classList.add('is-open'); body.style.overflow = 'hidden';
      });
    });
    lb.addEventListener('click', function (e) { if (e.target !== img) close(); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  /* ---------- Horario: resaltar el dia de hoy ---------- */
  function todayRow() {
    var rows = doc.querySelectorAll('[data-day]');
    if (!rows.length) return;
    var d = new Date().getDay(); /* 0=domingo */
    rows.forEach(function (r) {
      if (parseInt(r.getAttribute('data-day'), 10) === d) {
        r.classList.add('is-today');
        var td = r.querySelector('td');
        if (td) td.insertAdjacentHTML('afterbegin', '<span class="today-dot" aria-hidden="true"></span>');
      }
    });
  }

  function yearStamp() {
    var y = doc.querySelector('[data-year]');
    if (y) y.textContent = new Date().getFullYear();
  }
})();
