/* ==========================================================================
   MODERN — "01 / Clean & Clear"
   Section map (one signature per section, so effects never overlap):
     Hero ........ masked headline rise, blur-in lead, mock-up assembles itself
     Services .... BENTO grid (L6): tiles of different sizes flip up into place
     Offers ...... plain fade
     Prototypes .. tilt cards, live previews grow in
     About ....... words light up as you read
     Contact ..... SUCCESS TICK (H10) after sending
     Everywhere .. ROLLING TEXT (H3) on buttons and links, progress rail,
                   magnetic buttons, dot + ring cursor
   ========================================================================== */
DevoMotion.world('modern', api => {
  const { view, gsap, q, inOut, tl, splitWords, isClipText, afterDialog, drawPath, finePointer, reduce } = api;
  const offs = [];

  /* ---------- reveal helpers (Modern's own style) ---------- */
  const MASK_BLOCK = { clipPath: 'inset(0% 0% 100% 0%)', y: 70, duration: 1.1, ease: 'power4.out', clearProps: 'clipPath' };
  const lines = el => isClipText(el)
    ? inOut(el, tl().from(el, MASK_BLOCK))
    : inOut(el, tl().from(splitWords(el), { yPercent: 115, rotate: 4, duration: 1, stagger: 0.045, ease: 'power4.out' }));
  const blurIn = el => inOut(el, tl().from(el, { opacity: 0, y: 26, filter: 'blur(10px)', duration: 1, ease: 'power3.out', clearProps: 'filter' }));
  const kicker = el => inOut(el, tl().from(el, { opacity: 0, x: -28, letterSpacing: '0.5em', duration: 0.9, ease: 'power3.out' }));
  const stagger = (items, from, start = 'top 82%') => {
    items = gsap.utils.toArray(items); if (!items.length) return;
    inOut(items[0].parentElement, tl().from(items, Object.assign({ opacity: 0, y: 60, scale: 0.96, duration: 0.9, stagger: 0.1, ease: 'power3.out' }, from)), start);
  };

  /* ---------- HERO ---------- */
  const hero = view.querySelector('.whero');
  if (hero) {
    const k = hero.querySelector('.kicker'), h = hero.querySelector('h1'), lead = hero.querySelector('.lead');
    const intro = afterDialog(gsap.timeline({ delay: 0.35 }));
    if (k) intro.from(k, { opacity: 0, x: -30, duration: 0.8, ease: 'power3.out' }, 0);
    if (h) {
      if (isClipText(h)) intro.from(h, Object.assign({}, MASK_BLOCK, { duration: 1.3 }), 0.1);
      else intro.from(splitWords(h), { yPercent: 115, rotate: 5, duration: 1.15, stagger: 0.07, ease: 'power4.out' }, 0.1);
    }
    if (lead) intro.from(lead, { opacity: 0, y: 24, filter: 'blur(10px)', duration: 1, ease: 'power3.out', clearProps: 'filter' }, 0.55);
    const st = { trigger: hero, scroller: view, start: 'top top', end: 'bottom top', scrub: true };
    const txt = hero.querySelector('.herotext'), obj = hero.querySelector('.hero-object');
    if (txt) gsap.to(txt, { y: -110, opacity: 0, ease: 'none', scrollTrigger: st });
    if (obj) gsap.to(obj, { y: -50, scale: 0.9, opacity: 0.25, ease: 'none', scrollTrigger: Object.assign({}, st) });

    // the laptop window, phone and tick card build themselves from their parts
    const svg = hero.querySelector('.hart');
    if (svg) {
      const b = afterDialog(gsap.timeline({ delay: 0.5 }));
      b.from(svg.querySelectorAll(':scope > circle'), { scale: 0, transformOrigin: '50% 50%', opacity: 0, duration: 1.2, stagger: 0.15, ease: 'expo.out' }, 0);
      ['.f1', '.f2', '.f3'].forEach((sel, gi) => {
        const g = svg.querySelector(sel); if (!g) return;
        let t = 0.15 + gi * 0.45;
        [...g.children].forEach((el, i) => {
          const tag = el.tagName.toLowerCase(), hh = +el.getAttribute('height') || 0, ww = +el.getAttribute('width') || 0;
          if (tag === 'path' && el.getAttribute('fill') === 'none') drawPath(b, el, t + 0.15, 0.8);
          else if (tag === 'rect' && hh && hh <= 16 && ww > hh * 3) b.from(el, { scaleX: 0, transformOrigin: '0% 50%', duration: 0.6, ease: 'power3.out' }, t);
          else if (i === 0) b.from(el, { scale: 0.82, opacity: 0, transformOrigin: '50% 50%', duration: 0.8, ease: 'expo.out' }, t);
          else b.from(el, { scale: 0, opacity: 0, transformOrigin: '50% 50%', duration: 0.55, ease: 'back.out(2.2)' }, t);
          t += 0.045;
        });
      });
    }
  }

  /* ---------- section headings + copy ---------- */
  q('.wsection').forEach(sec => {
    sec.querySelectorAll('.kicker').forEach(kicker);
    sec.querySelectorAll('h2').forEach(lines);
    sec.querySelectorAll('.wsub, .labnote, .formnote').forEach(blurIn);
  });

  /* ---------- SERVICES: bento grid (L6) ---------- */
  const grid = view.querySelector('#services .servicegrid');
  if (grid) {
    grid.classList.add('m-bento');
    // two extra tiles so the mosaic has rhythm; both are links into the page
    const tile = (cls, html, go) => {
      const a = document.createElement('a'); a.className = 'service m-tile ' + cls; a.href = '#' + go; a.dataset.go = go; a.innerHTML = html; grid.appendChild(a); return a;
    };
    tile('m-tile-lab', '<span class="m-big">4</span><h3>live prototypes</h3><p>Try them on a desktop and a phone, side by side.</p><span class="m-arrow" aria-hidden="true">→</span>', 'lab');
    tile('m-tile-team', '<span class="m-pair" aria-hidden="true"><span class="m-chip">Design</span><b>+</b><span class="m-chip">Code</span></span><h3>One roof</h3><p>Lucky designs it, Venky builds it. Nothing gets lost between the two.</p>', 'about');
    const tiles = [...grid.children];
    gsap.set(tiles, { transformPerspective: 900, transformOrigin: '50% 100%' });
    // each tile arrives from its own direction, then settles flat
    const from = [{ rotationX: -55, y: 50 }, { rotationY: 40, x: 60 }, { rotationX: 45, y: -40 }, { rotationY: -40, x: -60 }, { scale: 0.6 }, { rotationX: -55, y: 60 }];
    const t = tl();
    tiles.forEach((el, i) => t.from(el, Object.assign({ opacity: 0, duration: 1, ease: 'power3.out' }, from[i % from.length]), i * 0.1));
    inOut(grid, t, 'top 82%');
  }

  /* ---------- the rest of the cards ---------- */
  stagger(q('.highlights .service'), { x: 50, y: 0 });
  stagger(q('.picker .project'), { y: 40 });
  q('.devices').forEach(el => inOut(el, tl().from(el, { opacity: 0, scale: 0.9, y: 40, duration: 1.1, ease: 'power3.out' })));
  stagger(q('.team .tm'), { y: 70, rotate: -2 });
  q('.contact-card.enquiry').forEach(el => inOut(el, tl().from(el, { opacity: 0, y: 60, duration: 0.9, ease: 'power3.out' })));
  q('.footer').forEach(el => inOut(el, tl().from(el, { opacity: 0, y: 20, duration: 0.9 }), 'top 98%'));

  /* ---------- ABOUT: words light up ---------- */
  q('.about-lead').forEach(el => gsap.fromTo(splitWords(el, 'light'), { opacity: 0.14 }, {
    opacity: 1, ease: 'none', stagger: 0.05,
    scrollTrigger: { trigger: el, scroller: view, start: 'top 82%', end: 'bottom 45%', scrub: 0.6 },
  }));

  /* ---------- progress bar + section rail ---------- */
  const secs = [...q('section.wsection[id]')];
  if (secs.length) {
    const bar = document.createElement('div'); bar.className = 'm-progress';
    const rail = document.createElement('nav'); rail.className = 'm-rail'; rail.setAttribute('aria-label', 'Section progress');
    secs.forEach((s, i) => {
      const name = (s.querySelector('.kicker')?.textContent || s.id).trim().toLowerCase();
      const b = document.createElement('button');
      b.type = 'button'; b.setAttribute('aria-label', 'Go to ' + name); b.dataset.v3decorated = '1';
      b.innerHTML = `<span class="m-lab">${name}</span><span>${String(i + 1).padStart(2, '0')}</span><span class="m-tick"></span>`;
      b.addEventListener('click', () => api.go(s));
      rail.appendChild(b);
      api.ScrollTrigger.create({ trigger: s, scroller: view, start: 'top 55%', end: 'bottom 55%', onToggle: e => b.classList.toggle('on', e.isActive) });
    });
    view.append(bar, rail);
    gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { scroller: view, start: 0, end: 'max', scrub: 0.3 } });
  }

  /* ---------- ROLLING TEXT (H3) ---------- */
  // Buttons that already swap between your language and English roll the swap vertically (CSS).
  // Plain-text buttons and links get two stacked copies of their label that roll on hover.
  view.classList.add('m-rolling');
  const rollify = (el, hoverHost) => {
    if (el.dataset.mRoll || el.querySelector('.swap, .m-roll')) return;
    const textNodes = [...el.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim());
    if (textNodes.length !== 1) return;
    const n = textNodes[0], txt = n.textContent.trim();
    const wrap = document.createElement('span'); wrap.className = 'm-roll';
    wrap.innerHTML = `<span class="m-roll-a"></span><span class="m-roll-b" aria-hidden="true"></span>`;
    wrap.firstChild.textContent = txt; wrap.lastChild.textContent = txt;
    n.replaceWith(wrap);
    el.dataset.mRoll = '1';
    if (hoverHost) hoverHost.classList.add('m-roll-host');
  };
  q('.cta, .ghostbtn, .wlinks a, .formnote a').forEach(el => rollify(el));
  q('.servicegrid .service h3').forEach(h => rollify(h, h.closest('.service')));
  q('.picker .project strong').forEach(s => rollify(s, s.closest('.project')));

  /* ---------- CONTACT: success tick (H10) ---------- */
  const form = view.querySelector('form.enquiry');
  if (form) {
    form.classList.add('m-has-tick');
    const panel = document.createElement('div'); panel.className = 'm-tick-panel'; panel.setAttribute('role', 'status'); panel.hidden = true;
    panel.innerHTML = `<svg viewBox="0 0 120 120" aria-hidden="true"><circle class="m-tick-ring" cx="60" cy="60" r="50" pathLength="1"/><path class="m-tick-mark" d="M38 62 l15 15 l30 -32" pathLength="1"/></svg><strong></strong><span></span>`;
    form.appendChild(panel);
    form.addEventListener('submit', e => {
      const viaEmail = (e.submitter && e.submitter.value) === 'email';
      panel.querySelector('strong').textContent = 'Your message is ready';
      panel.querySelector('span').textContent = viaEmail ? 'Opening your email app…' : 'Opening WhatsApp…';
      panel.hidden = false;
      const ring = panel.querySelector('.m-tick-ring'), mark = panel.querySelector('.m-tick-mark');
      gsap.timeline({ onComplete: () => { panel.hidden = true; } })
        .fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 0.25 })
        .fromTo(ring, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.inOut' }, 0.05)
        .fromTo(mark, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.4, ease: 'power3.out' }, 0.5)
        .fromTo(panel.querySelector('svg'), { scale: 0.8 }, { scale: 1, duration: 0.6, ease: 'back.out(2)' }, 0.5)
        .from(panel.querySelectorAll('strong, span'), { opacity: 0, y: 10, stagger: 0.08, duration: 0.4 }, 0.6)
        .to(panel, { opacity: 0, duration: 0.4 }, 3.2);
    });
  }

  /* ---------- mouse-only: magnetic buttons, tilting cards ---------- */
  if (finePointer && !reduce) {
    q('.cta, .ghostbtn, .wlinks a').forEach(el => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3.out' });
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.3); yTo((e.clientY - r.top - r.height / 2) * 0.4);
      });
      el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1,0.4)' }));
    });
    q('.picker .project').forEach(el => {
      gsap.set(el, { transformPerspective: 800 });
      const rx = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3.out' });
      const ry = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3.out' });
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        rx(((e.clientY - r.top) / r.height - 0.5) * -10); ry(((e.clientX - r.left) / r.width - 0.5) * 12);
      });
      el.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });
  }

  return () => { view.classList.remove('m-rolling'); offs.forEach(f => f()); };
});
