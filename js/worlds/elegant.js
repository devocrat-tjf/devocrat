/* ==========================================================================
   ELEGANT — "Quiet luxury"
   Section map (one signature per section, so effects never overlap):
     Entry ....... INK SPREAD (W4): a drop of espresso ink covers the universe,
                   then lifts to reveal the world
     Hero ........ TIME-OF-DAY GREETING (P1) with a matching light tint;
                   headline LETTER SPACING CLOSES IN (T15)
     Whole page .. COLOUR SHIFT BY SECTION (S10): ivory → champagne → blush →
                   linen → espresso → ivory; FLOATING GOLD DUST (A1)
     Services .... numerals and titles settle in slowly, one by one
     Prototypes .. FILTERABLE GALLERY (L3): All / Apps / Websites / 3D
     Discuss ..... team portraits RIPPLE like water on hover (D2)
     Buttons ..... FILL WIPE (H2) from the side the pointer enters
   ========================================================================== */
DevoMotion.world('elegant', api => {
  const { view, gsap, q, inOut, tl, afterDialog, finePointer, reduce, loop, own } = api;
  const offs = [];
  const INK = '#2b211c';

  /* ---------- ENTRY: ink spread (W4) ---------- */
  // The usual circle reveal is switched off for this world (customEnter) and replaced by ink.
  (() => {
    const cx = parseFloat(view.style.getPropertyValue('--cx')) || innerWidth / 2;
    const cy = parseFloat(view.style.getPropertyValue('--cy')) || innerHeight / 2;
    const cover = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
    const ov = own(document.createElement('div')); ov.className = 'm-ink'; ov.setAttribute('aria-hidden', 'true');
    // an ink blot: one lobed body and a few satellite droplets (radius ≈ 100 units)
    ov.innerHTML = `<svg width="100%" height="100%"><g transform="translate(${cx} ${cy})"><g class="m-ink-blot">
      <path fill="${INK}" d="M0-100C32-98 46-78 70-74 98-70 108-38 98-12 90 10 112 32 96 58 80 84 50 82 30 96 6 112-24 106-44 92-66 76-96 74-104 44-112 16-90-6-96-32-102-60-78-80-52-90-34-97-20-101 0-100Z"/>
      <circle fill="${INK}" cx="118" cy="-60" r="11"/><circle fill="${INK}" cx="-120" cy="58" r="9"/><circle fill="${INK}" cx="70" cy="122" r="7"/><circle fill="${INK}" cx="-70" cy="-118" r="6"/>
    </g></g></svg>`;
    const blot = ov.querySelector('.m-ink-blot');
    view.style.visibility = 'hidden';
    gsap.timeline({ onComplete: () => ov.remove() })
      .fromTo(blot, { scale: 0.02, rotation: -20, svgOrigin: '0 0' }, { scale: cover / 70, rotation: 10, duration: 0.85, ease: 'power3.in' })
      .add(() => { view.style.visibility = ''; })
      .to(ov, { opacity: 0, duration: 0.7, ease: 'power2.out' }, '+=0.05');
    offs.push(() => { view.style.visibility = ''; });
  })();

  /* ---------- HERO: time-of-day greeting (P1) ---------- */
  const hero = view.querySelector('.whero');
  const hr = new Date().getHours();
  const tod = hr >= 5 && hr < 12 ? ['morning', 'Good morning'] : hr >= 12 && hr < 17 ? ['afternoon', 'Good afternoon'] : hr >= 17 && hr < 21 ? ['evening', 'Good evening'] : ['night', 'Good evening'];
  if (hero) {
    hero.dataset.mTod = tod[0];
    const g = document.createElement('p'); g.className = 'm-greet'; g.textContent = tod[1];
    const ht = hero.querySelector('.herotext'); ht && ht.prepend(g);
  }

  /* ---------- HERO + HEADINGS: letter spacing closes in (T15) ---------- */
  const settle = (el, dur = 1.6) => ({ opacity: 0, letterSpacing: '0.42em', duration: dur, ease: 'power3.out', clearProps: 'letterSpacing' });
  if (hero) {
    const intro = afterDialog(gsap.timeline({ delay: 1.0 }));
    const g = hero.querySelector('.m-greet'), k = hero.querySelector('.kicker'), h = hero.querySelector('h1'), lead = hero.querySelector('.lead'), art = hero.querySelector('.hero-object');
    if (g) intro.from(g, { opacity: 0, y: 8, duration: 1, ease: 'power2.out' }, 0);
    if (k) intro.from(k, { opacity: 0, duration: 1.2 }, 0.2);
    if (h) intro.from(h, settle(h, 2), 0.25);
    if (lead) intro.from(lead, { opacity: 0, y: 12, duration: 1.4, ease: 'power2.out' }, 0.9);
    if (art) intro.from(art, { opacity: 0, scale: 0.96, duration: 2, ease: 'power2.out' }, 0.4);
    const st = { trigger: hero, scroller: view, start: 'top top', end: 'bottom top', scrub: true };
    const ht = hero.querySelector('.herotext');
    if (ht) gsap.to(ht, { opacity: 0, y: -40, ease: 'none', scrollTrigger: st });
  }
  q('.wsection h2').forEach(h => inOut(h, tl().from(h, settle(h)), 'top 88%', 'bottom 6%', 2.2));
  q('.wsection .kicker').forEach(k => inOut(k, tl().from(k, { opacity: 0, duration: 1.2 }), 'top 90%'));
  q('.wsection .wsub, .about-lead, .labnote, .formnote').forEach(p => inOut(p, tl().from(p, { opacity: 0, y: 14, duration: 1.4, ease: 'power2.out' })));

  /* ---------- SERVICES: settle in slowly, one by one ---------- */
  const svc = gsap.utils.toArray(q('.servicegrid .service'));
  if (svc.length) inOut(svc[0].parentElement, tl().from(svc, { opacity: 0, y: 24, duration: 1.3, stagger: 0.22, ease: 'power2.out' }), 'top 80%');
  const hl = gsap.utils.toArray(q('.highlights .service'));
  if (hl.length) inOut(hl[0].parentElement, tl().from(hl, { opacity: 0, y: 20, duration: 1.2, stagger: 0.2, ease: 'power2.out' }), 'top 80%');
  q('.devices, .contact-card.enquiry').forEach(el => inOut(el, tl().from(el, { opacity: 0, y: 30, duration: 1.4, ease: 'power2.out' })));

  /* ---------- WHOLE PAGE: colour shift by section (S10) ---------- */
  // Each section owns a palette; the page glides to it as the section reaches mid-screen.
  const PAL = {
    hero: { '--bg': '#f6f0e6', '--fg': '#2b211c', '--surface': '#fbf7f0', '--line': '#d8c6a8' },
    services: { '--bg': '#efe4d2', '--fg': '#2b211c', '--surface': '#f7efe2', '--line': '#cdb48c' },
    offers: { '--bg': '#f3e3dc', '--fg': '#3a2620', '--surface': '#f9eee9', '--line': '#d9b7a8' },
    lab: { '--bg': '#ece6dc', '--fg': '#2b211c', '--surface': '#f6f1ea', '--line': '#cfc2ae' },
    about: { '--bg': '#231a16', '--fg': '#f1e6d4', '--surface': '#2e231d', '--line': '#5b4632' },
    contact: { '--bg': '#f6f0e6', '--fg': '#2b211c', '--surface': '#fbf7f0', '--line': '#d8c6a8' },
  };
  const paint = (key) => {
    const p = PAL[key]; if (!p) return;
    view.classList.toggle('m-dusk', key === 'about');
    gsap.to(view, Object.assign({ duration: 1.1, ease: 'power2.out', overwrite: 'auto' }, p));
  };
  gsap.set(view, PAL.hero);
  if (hero) api.ScrollTrigger.create({ trigger: hero, scroller: view, start: 'top 50%', end: 'bottom 50%', onEnterBack: () => paint('hero') });
  q('section.wsection[id]').forEach(sec => {
    api.ScrollTrigger.create({ trigger: sec, scroller: view, start: 'top 50%', end: 'bottom 50%',
      onEnter: () => paint(sec.id), onEnterBack: () => paint(sec.id) });
  });
  offs.push(() => { view.classList.remove('m-dusk'); Object.keys(PAL.hero).forEach(k => view.style.removeProperty(k)); });

  /* ---------- WHOLE PAGE: floating gold dust (A1) ---------- */
  if (!reduce) {
    const cv = own(document.createElement('canvas'), view); cv.className = 'm-dust'; cv.setAttribute('aria-hidden', 'true');
    const ctx2 = cv.getContext('2d');
    let W = 0, H = 0, dpr = Math.min(2, devicePixelRatio || 1);
    const size = () => { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx2.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener('resize', size); offs.push(() => removeEventListener('resize', size));
    const N = Math.round(Math.min(70, W * H / 22000));
    const motes = Array.from({ length: N }, () => ({ x: Math.random() * W, y: Math.random() * H, r: 0.6 + Math.random() * 1.8, v: 0.08 + Math.random() * 0.22, s: Math.random() * 6.28, tw: 0.4 + Math.random() * 0.6 }));
    offs.push(loop((dt, now) => {
      ctx2.clearRect(0, 0, W, H);
      const dark = view.classList.contains('m-dusk');
      for (const m of motes) {
        m.y -= m.v * dt * 0.06; m.s += dt * 0.0012;
        const x = m.x + Math.sin(m.s) * 14;
        if (m.y < -10) { m.y = H + 10; m.x = Math.random() * W; }
        const a = (0.25 + 0.45 * (0.5 + 0.5 * Math.sin(now * 0.002 * m.tw + m.s))) * (dark ? 1 : 0.75);
        const g = ctx2.createRadialGradient(x, m.y, 0, x, m.y, m.r * 3);
        g.addColorStop(0, `rgba(232,198,106,${a})`); g.addColorStop(1, 'rgba(232,198,106,0)');
        ctx2.fillStyle = g; ctx2.beginPath(); ctx2.arc(x, m.y, m.r * 3, 0, 6.283); ctx2.fill();
      }
    }));
  }

  /* ---------- PROTOTYPES: filterable gallery (L3) ---------- */
  const picker = view.querySelector('.picker');
  if (picker) {
    const TAGS = { guard: 'apps', salon: 'apps', interior: '3d', pica: 'sites', sahakarya: 'apps', apparel: 'sites', hospital: 'apps', restaurant: 'apps', salonpro: 'apps' };
    const bar = document.createElement('div'); bar.className = 'm-filter'; bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'Filter prototypes');
    [['all', 'All'], ['apps', 'Apps'], ['sites', 'Websites'], ['3d', '3D']].forEach(([k, label], i) => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.dataset.f = k; b.dataset.v3decorated = '1';
      b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false'); bar.appendChild(b);
    });
    picker.before(bar);
    const cards = [...picker.querySelectorAll('.project')];
    bar.addEventListener('click', e => {
      const b = e.target.closest('button[data-f]'); if (!b) return;
      bar.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
      const f = b.dataset.f;
      // FLIP: remember where everything is, change the layout, then glide from old to new
      const before = new Map(cards.map(c => [c, c.getBoundingClientRect()]));
      const show = c => f === 'all' || TAGS[c.dataset.app] === f;
      const leaving = cards.filter(c => !show(c) && !c.hidden);
      const relayout = () => {
        gsap.set(leaving, { opacity: 1, scale: 1 });
        cards.forEach(c => { c.hidden = !show(c); });
        cards.filter(c => !c.hidden).forEach(c => {
          const a = before.get(c), n = c.getBoundingClientRect();
          if (!a.width) gsap.fromTo(c, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' });
          else gsap.fromTo(c, { x: a.left - n.left, y: a.top - n.top }, { x: 0, y: 0, duration: 0.7, ease: 'power3.inOut' });
        });
      };
      if (leaving.length) gsap.to(leaving, { opacity: 0, scale: 0.92, duration: 0.25, ease: 'power2.in', onComplete: relayout });
      else relayout();
    });
    inOut(bar, tl().from(bar.children, { opacity: 0, y: 10, stagger: 0.08, duration: 0.8 }), 'top 90%');
  }

  /* ---------- DISCUSS: portraits ripple on hover (D2) ---------- */
  const imgs = gsap.utils.toArray(q('.tm-frame img'));
  if (imgs.length && !reduce) {
    const NS = 'http://www.w3.org/2000/svg';
    const defs = document.createElementNS(NS, 'svg'); defs.setAttribute('class', 'm-svg-defs'); defs.setAttribute('aria-hidden', 'true');
    defs.innerHTML = `<filter id="m-ripple" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter>`;
    view.appendChild(defs);
    const disp = defs.querySelector('feDisplacementMap'), turb = defs.querySelector('feTurbulence');
    const state = { s: 0, f: 0.012 };
    const apply = () => { disp.setAttribute('scale', state.s.toFixed(2)); turb.setAttribute('baseFrequency', `${state.f.toFixed(4)} ${(state.f * 2.5).toFixed(4)}`); };
    imgs.forEach(img => {
      const host = img.closest('.tm') || img;
      host.addEventListener('pointerenter', () => {
        imgs.forEach(i => (i.style.filter = '')); img.style.filter = 'url(#m-ripple)';
        gsap.killTweensOf(state);
        gsap.timeline()
          .to(state, { s: 22, f: 0.02, duration: 0.5, ease: 'power2.out', onUpdate: apply })
          .to(state, { s: 6, f: 0.014, duration: 1.4, ease: 'sine.inOut', onUpdate: apply });
      });
      host.addEventListener('pointerleave', () => {
        gsap.killTweensOf(state);
        gsap.to(state, { s: 0, f: 0.012, duration: 0.8, ease: 'power2.out', onUpdate: apply, onComplete: () => (img.style.filter = '') });
      });
    });
    const tms = gsap.utils.toArray(q('.team .tm'));
    if (tms.length) inOut(tms[0].parentElement, tl().from(tms, { opacity: 0, y: 30, duration: 1.4, stagger: 0.25, ease: 'power2.out' }), 'top 80%');
  }

  /* ---------- BUTTONS: fill wipe from the entry side (H2) ---------- */
  q('.cta, .ghostbtn').forEach(btn => {
    if (btn.closest('.device')) return; // preview toolbar keeps its own look
    btn.classList.add('m-wipe-btn');
    const fill = document.createElement('span'); fill.className = 'm-wipe'; fill.setAttribute('aria-hidden', 'true');
    btn.prepend(fill);
    gsap.set(fill, { scaleX: 0 });
    const side = e => {
      const r = btn.getBoundingClientRect();
      const d = { left: e.clientX - r.left, right: r.right - e.clientX, top: e.clientY - r.top, bottom: r.bottom - e.clientY };
      return Object.keys(d).reduce((a, b) => (d[a] < d[b] ? a : b));
    };
    const origin = s => ({ left: '0% 50%', right: '100% 50%', top: '50% 0%', bottom: '50% 100%' })[s];
    btn.addEventListener('pointerenter', e => {
      const s = side(e), vertical = s === 'top' || s === 'bottom';
      gsap.killTweensOf(fill);
      gsap.set(fill, { transformOrigin: origin(s), scaleX: vertical ? 1 : 0, scaleY: vertical ? 0 : 1 });
      gsap.to(fill, { scaleX: 1, scaleY: 1, duration: 0.45, ease: 'power3.out' });
      btn.classList.add('m-filled');
    });
    btn.addEventListener('pointerleave', e => {
      const s = side(e), vertical = s === 'top' || s === 'bottom';
      gsap.killTweensOf(fill);
      gsap.set(fill, { transformOrigin: origin(s) });
      gsap.to(fill, vertical ? { scaleY: 0, duration: 0.4, ease: 'power3.in' } : { scaleX: 0, duration: 0.4, ease: 'power3.in' });
      btn.classList.remove('m-filled');
    });
  });

  return () => offs.forEach(f => f());
}, { customEnter: true });
