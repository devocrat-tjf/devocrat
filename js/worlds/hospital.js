/* ==========================================================================
   HOSPITAL — "Calm, trustworthy and human-centred"
   Section map (one signature per section, so effects never overlap):
     Hero ........ BREATHING HERO (A11): the shield and its glow expand and
                   settle in a slow 4s-in / 6s-out rhythm
     Headings .... HIGHLIGHTER SWIPE (T8): one key word per heading gets a
                   mint marker stroke when it scrolls in
     Bottom edge . LINE THAT DRAWS ITSELF (S8): a heart-monitor trace draws as
                   you scroll, beating once at each section (it is the progress bar)
     How we work . STICKY STEPS (L7): new section, steps pinned on the left,
                   details scroll on the right (text in content.js → HOSPITAL_PROCESS)
     Contact ..... SUCCESS TICK (H10, Hospital version): a heartbeat whose last
                   beat turns into a tick
     Pointer ..... RIPPLE ON THE SURFACE (C12): soft rings where the pointer moves
   ========================================================================== */
DevoMotion.world('hospital', api => {
  const { view, gsap, q, inOut, tl, afterDialog, finePointer, reduce, loop, own, ScrollTrigger } = api;
  const offs = [];
  const TEAL = '#0b95a6', BLUE = '#2f7de1', MINT = '#bff0e6';

  /* ---------- HOW WE WORK: build the new section (L7) ---------- */
  const P = window.HOSPITAL_PROCESS || (typeof HOSPITAL_PROCESS !== 'undefined' ? HOSPITAL_PROCESS : null);
  const services = view.querySelector('#services');
  if (P && services) {
    const sec = document.createElement('section');
    sec.className = 'wsection m-steps'; sec.id = 'process';
    sec.innerHTML = `<div class="kicker">${P.kicker}</div><h2>${P.title}</h2>
      <div class="m-steps-grid">
        <ol class="m-steps-list" aria-hidden="true"><span class="m-steps-rail"><i></i></span>${P.steps.map((s, i) => `<li data-i="${i}"><b>${String(i + 1).padStart(2, '0')}</b><span>${s[0]}</span></li>`).join('')}</ol>
        <div class="m-steps-cards">${P.steps.map((s, i) => `<article class="m-step" data-i="${i}"><span class="m-step-n">Step ${i + 1} of ${P.steps.length}</span><h3>${s[0]}</h3><p>${s[1]}</p></article>`).join('')}</div>
      </div>`;
    services.after(sec);
    const items = [...sec.querySelectorAll('.m-steps-list li')];
    const cards = [...sec.querySelectorAll('.m-step')];
    cards.forEach((c, i) => {
      ScrollTrigger.create({ trigger: c, scroller: view, start: 'top 60%', end: 'bottom 60%',
        onToggle: e => { if (e.isActive) items.forEach((li, k) => { li.classList.toggle('on', k === i); li.classList.toggle('done', k < i); }); } });
      inOut(c, tl().from(c, { opacity: 0, y: 40, duration: 0.9, ease: 'sine.out' }), 'top 85%', 'bottom 15%');
    });
    gsap.fromTo(sec.querySelector('.m-steps-rail i'), { scaleY: 0 }, { scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: sec.querySelector('.m-steps-cards'), scroller: view, start: 'top 60%', end: 'bottom 60%', scrub: 0.4 } });
  }

  /* ---------- HERO: intro, then breathing (A11) ---------- */
  const hero = view.querySelector('.whero');
  if (hero) {
    const k = hero.querySelector('.kicker'), h = hero.querySelector('h1'), lead = hero.querySelector('.lead'), obj = hero.querySelector('.hero-object');
    const intro = afterDialog(gsap.timeline({ delay: 0.35 }));
    if (k) intro.from(k, { opacity: 0, y: 10, duration: 0.8, ease: 'sine.out' }, 0);
    if (h) intro.from(h, { opacity: 0, y: 24, duration: 1.1, ease: 'sine.out' }, 0.1);
    if (lead) intro.from(lead, { opacity: 0, y: 16, duration: 1, ease: 'sine.out' }, 0.35);
    if (obj) intro.from(obj, { opacity: 0, scale: 0.94, duration: 1.4, ease: 'sine.out' }, 0.2);
    // breathing: in for 4s, out for 6s, forever (calm resting rhythm)
    if (obj && !reduce) {
      const svg = obj.querySelector('svg');
      const glows = svg ? [...svg.querySelectorAll(':scope > circle')] : [];
      const halo = document.createElement('span'); halo.className = 'm-breath-halo'; halo.setAttribute('aria-hidden', 'true'); obj.prepend(halo);
      const breath = afterDialog(gsap.timeline({ repeat: -1, delay: 2.4 }));
      breath.to(obj, { scale: 1.035, duration: 4, ease: 'sine.inOut' }, 0)
        .to(glows, { scale: 1.14, transformOrigin: '50% 50%', duration: 4, ease: 'sine.inOut' }, 0)
        .to(halo, { scale: 1.18, opacity: 0.9, duration: 4, ease: 'sine.inOut' }, 0)
        .to(obj, { scale: 1, duration: 6, ease: 'sine.inOut' }, 4)
        .to(glows, { scale: 1, duration: 6, ease: 'sine.inOut' }, 4)
        .to(halo, { scale: 1, opacity: 0.45, duration: 6, ease: 'sine.inOut' }, 4);
    }
    const ht = hero.querySelector('.herotext');
    if (ht) gsap.to(ht, { opacity: 0, y: -50, ease: 'none', scrollTrigger: { trigger: hero, scroller: view, start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ---------- HEADINGS: highlighter swipe (T8) ---------- */
  // Wrap the last word of each heading in a marker span; its stroke sweeps in from the left.
  const markLastWord = el => {
    const texts = []; const walk = n => n.childNodes.forEach(c => c.nodeType === 3 ? texts.push(c) : walk(c)); walk(el);
    const t = texts.reverse().find(n => n.textContent.trim()); if (!t) return null;
    const m = t.textContent.match(/^([\s\S]*?)(\S+)(\s*)$/); if (!m) return null;
    const span = document.createElement('span'); span.className = 'm-hl'; span.textContent = m[2];
    t.replaceWith(document.createTextNode(m[1]), span, document.createTextNode(m[3]));
    return span;
  };
  // For section headings, mark the most meaningful word: the longest one that isn't a filler word.
  const FILLER = /^(the|a|an|and|or|of|to|for|from|in|on|our|we|we're|you|your|who|that|with|is|are|it|its)$/i;
  const markKeyWord = el => {
    const texts = []; const walk = n => n.childNodes.forEach(c => c.nodeType === 3 ? texts.push(c) : walk(c)); walk(el);
    let best = null;
    texts.forEach(node => {
      const re = /\S+/g; let m;
      while ((m = re.exec(node.textContent))) {
        const word = m[0].replace(/[.,!?;:]+$/, '');
        if (FILLER.test(word.replace(/[’']/g, "'"))) continue;
        if (!best || word.length >= best.word.length) best = { node, index: m.index, raw: m[0], word };
      }
    });
    if (!best) return markLastWord(el);
    const s = best.node.textContent, span = document.createElement('span');
    span.className = 'm-hl'; span.textContent = best.raw;
    best.node.replaceWith(document.createTextNode(s.slice(0, best.index)), span, document.createTextNode(s.slice(best.index + best.raw.length)));
    return span;
  };
  const heroMark = hero && hero.querySelector('h1') ? markLastWord(hero.querySelector('h1')) : null;
  if (heroMark) afterDialog(gsap.timeline({ delay: 1.2 })).fromTo(heroMark, { backgroundSize: '0% 42%' }, { backgroundSize: '100% 42%', duration: 0.8, ease: 'power2.out' });
  q('.wsection h2').forEach(h => {
    const mk = markKeyWord(h);
    const t = tl().from(h, { opacity: 0, y: 20, duration: 0.8, ease: 'sine.out' });
    if (mk) t.fromTo(mk, { backgroundSize: '0% 42%' }, { backgroundSize: '100% 42%', duration: 0.7, ease: 'power2.out' }, 0.45);
    inOut(h, t, 'top 86%', 'bottom 8%');
  });
  q('.wsection > .kicker, .wsection .labhead .kicker, .aboutgrid .kicker, .contactgrid .kicker').forEach(k => inOut(k, tl().from(k, { opacity: 0, duration: 0.8 })));
  q('.wsection .wsub, .about-lead, .labnote, .formnote').forEach(p => inOut(p, tl().from(p, { opacity: 0, y: 14, duration: 1, ease: 'sine.out' })));

  /* ---------- cards: soft, calm rise ---------- */
  const rise = (sel, start = 'top 82%') => {
    const els = gsap.utils.toArray(q(sel)); if (!els.length) return;
    inOut(els[0].parentElement, tl().from(els, { opacity: 0, y: 30, scale: 0.98, duration: 1.1, stagger: 0.12, ease: 'sine.out' }), start);
  };
  rise('.servicegrid .service'); rise('.highlights .service'); rise('.picker .project'); rise('.team .tm');
  q('.devices, .contact-card.enquiry, .offer-soon').forEach(el => inOut(el, tl().from(el, { opacity: 0, y: 30, duration: 1.1, ease: 'sine.out' })));

  /* ---------- BOTTOM EDGE: heart-monitor progress line (S8) ---------- */
  const mon = own(document.createElement('div'), view); mon.className = 'm-monitor'; mon.setAttribute('aria-hidden', 'true');
  mon.innerHTML = `<svg><path class="m-ecg-bg"/><path class="m-ecg"/><circle class="m-ecg-dot" r="4"/></svg><span class="m-ecg-read"><i>♥</i><b>72</b> <em></em></span>`;
  const ecgPath = mon.querySelector('.m-ecg'), ecgBg = mon.querySelector('.m-ecg-bg'), dot = mon.querySelector('.m-ecg-dot');
  const readSec = mon.querySelector('em'), readBpm = mon.querySelector('b');
  let len = 1, beats = [];
  const build = () => {
    const W = mon.clientWidth, Hh = 34, base = 22, max = view.scrollHeight - view.clientHeight || 1;
    const secs = [...q('section.wsection[id]')];
    beats = secs.map(s => ({ x: Math.max(30, Math.min(W - 60, (s.offsetTop / max) * W)), name: (s.querySelector('.kicker')?.textContent || s.id).trim() }));
    let d = `M0 ${base}`;
    beats.forEach(b => { const x = b.x; d += ` L${x - 22} ${base} q4 -5 8 0 L${x - 6} ${base} L${x - 3} ${base + 5} L${x} ${base - 18} L${x + 4} ${base + 9} L${x + 7} ${base} L${x + 14} ${base} q6 -7 12 0`; });
    d += ` L${W} ${base}`;
    ecgPath.setAttribute('d', d); ecgBg.setAttribute('d', d);
    mon.querySelector('svg').setAttribute('viewBox', `0 0 ${W} ${Hh}`);
    len = ecgPath.getTotalLength();
    gsap.set(ecgPath, { strokeDasharray: len, strokeDashoffset: len });
  };
  const paint = p => {
    const at = len * p;
    gsap.set(ecgPath, { strokeDashoffset: len - at });
    const pt = ecgPath.getPointAtLength(Math.max(0.01, at)); dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y);
    let cur = null;
    beats.forEach(b => { if (pt.x >= b.x - 30) cur = b; });
    readSec.textContent = cur ? cur.name : '';
  };
  build();
  const st = ScrollTrigger.create({ scroller: view, start: 0, end: 'max', onUpdate: s => paint(s.progress), onRefresh: s => { build(); paint(s.progress); } });
  paint(0);
  // the readout's heart rate drifts gently between 68 and 76
  const bpmTimer = setInterval(() => { readBpm.textContent = 68 + Math.round(Math.random() * 8); }, 2400);
  offs.push(() => clearInterval(bpmTimer));
  addEventListener('resize', build); offs.push(() => removeEventListener('resize', build));

  /* ---------- CONTACT: heartbeat → tick (H10, Hospital version) ---------- */
  const form = view.querySelector('form.enquiry');
  if (form) {
    form.classList.add('m-has-tick');
    const panel = document.createElement('div'); panel.className = 'm-tick-panel m-hosp-tick'; panel.setAttribute('role', 'status'); panel.hidden = true;
    panel.innerHTML = `<svg viewBox="0 0 160 100" aria-hidden="true"><circle class="m-ht-glow" cx="118" cy="52" r="30"/><path class="m-ht-line" d="M6 60 H38 L46 48 L54 74 L62 22 L70 60 H92 L110 76 L146 34"/></svg><strong></strong><span></span>`;
    form.appendChild(panel);
    form.addEventListener('submit', e => {
      const viaEmail = (e.submitter && e.submitter.value) === 'email';
      panel.querySelector('strong').textContent = 'Your message is ready';
      panel.querySelector('span').textContent = viaEmail ? 'Opening your email app…' : 'Opening WhatsApp…';
      panel.hidden = false;
      const line = panel.querySelector('.m-ht-line'), glow = panel.querySelector('.m-ht-glow');
      const L = line.getTotalLength();
      gsap.timeline({ onComplete: () => { panel.hidden = true; } })
        .fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 0.25 })
        .fromTo(line, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 1.1, ease: 'power1.inOut' }, 0.1)
        .fromTo(glow, { scale: 0, opacity: 0, transformOrigin: '50% 50%' }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' }, 0.95)
        .to(glow, { scale: 1.25, opacity: 0, duration: 0.8, ease: 'sine.out' }, 1.45)
        .from(panel.querySelectorAll('strong, span'), { opacity: 0, y: 10, stagger: 0.08, duration: 0.4 }, 1.0)
        .to(panel, { opacity: 0, duration: 0.4 }, 3.6);
    });
  }

  /* ---------- POINTER: ripples on the surface (C12) ---------- */
  if (finePointer && !reduce) {
    const cv = own(document.createElement('canvas'), view); cv.className = 'm-ripples'; cv.setAttribute('aria-hidden', 'true');
    const c2 = cv.getContext('2d'); const dpr = Math.min(2, devicePixelRatio || 1);
    let W = 0, H = 0;
    const size = () => { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; c2.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener('resize', size); offs.push(() => removeEventListener('resize', size));
    const rings = []; let lx = -999, ly = -999;
    const add = (x, y, big) => { rings.push({ x, y, r: big ? 6 : 2, max: big ? 110 : 54, a: big ? 0.55 : 0.32, w: big ? 2 : 1.2 }); if (rings.length > 40) rings.shift(); };
    const onMove = e => { if (e.pointerType !== 'mouse') return; const dx = e.clientX - lx, dy = e.clientY - ly; if (dx * dx + dy * dy > 1600) { add(e.clientX, e.clientY); lx = e.clientX; ly = e.clientY; } };
    const onDown = e => { if (e.pointerType === 'mouse') { add(e.clientX, e.clientY, true); setTimeout(() => add(e.clientX, e.clientY, true), 140); } };
    view.addEventListener('pointermove', onMove, { passive: true }); view.addEventListener('pointerdown', onDown);
    offs.push(() => { view.removeEventListener('pointermove', onMove); view.removeEventListener('pointerdown', onDown); });
    offs.push(loop(dt => {
      c2.clearRect(0, 0, W, H);
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i]; r.r += dt * 0.06 * (r.max / 54); const t = r.r / r.max;
        if (t >= 1) { rings.splice(i, 1); continue; }
        c2.strokeStyle = `rgba(11,149,166,${(r.a * (1 - t)).toFixed(3)})`; c2.lineWidth = r.w;
        c2.beginPath(); c2.ellipse(r.x, r.y, r.r, r.r * 0.72, 0, 0, 6.283); c2.stroke();
      }
    }));
  }

  return () => offs.forEach(f => f());
});
