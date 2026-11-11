/* ==========================================================================
   MANDALA — "Every detail. A masterpiece."
   Section map (one signature per section, so effects never overlap):
     Top strip ... FESTIVAL THEMES (P5): on festival dates a greeting strip
                   appears (Diwali lights, Pongal kolam, Holi colours,
                   Christmas lights, New Year). Test any of them with
                   ?fest=diwali / pongal / holi / christmas / newyear
     Hero ........ PARALLAX DEPTH (S4): the mandala's rings sit at different
                   depths and move at different speeds on scroll and with the mouse
     Services .... TEXT ON A CIRCLE (T6): a spinning stamp; it spins faster
                   while you scroll
     Offers ...... GENERATIVE RANGOLI (A8): a rangoli draws itself, different
                   on every visit (button to draw another)
     Prototypes .. DISSOLVE (D4): switching prototype melts the screens through
                   a rangoli-coloured tile dissolve
     Discuss ..... DIYA FLICKER (A12): a row of oil lamps; the flames flicker
                   and lean away from the pointer
     Whole page .. FALLING PETALS (A9): a few marigold and rose petals drift down
     Sound ....... AMBIENT SOUNDTRACK (N1): a soft drone with temple bells,
                   off until the visitor turns it on
   ========================================================================== */
DevoMotion.world('mandala', api => {
  const { view, gsap, q, inOut, tl, afterDialog, finePointer, reduce, loop, own, ScrollTrigger } = api;
  const offs = [];
  const INK = '#2a1f4d', RED = '#c8391f', GOLD = '#f2a516', TEAL = '#0b7a7c', ROSE = '#b3205e', CREAM = '#fff4e0';
  const PAL = [RED, GOLD, TEAL, ROSE, INK];
  const NS = 'http://www.w3.org/2000/svg';
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  /* ---------- TOP STRIP: festival themes (P5) ---------- */
  const FESTS = {
    diwali: { title: 'Happy Diwali', msg: 'May your home and your work be full of light.', icon: '🪔', cls: 'm-fest-diwali' },
    pongal: { title: 'Happy Pongal', msg: 'A sweet harvest and a bright new season to you.', icon: '🌾', cls: 'm-fest-pongal' },
    holi: { title: 'Happy Holi', msg: 'Wishing you a year as colourful as today.', icon: '🎨', cls: 'm-fest-holi' },
    christmas: { title: 'Merry Christmas', msg: 'Warm wishes from our family to yours.', icon: '🎄', cls: 'm-fest-christmas' },
    newyear: { title: 'Happy New Year', msg: 'Here’s to new ideas and new things to build.', icon: '🎉', cls: 'm-fest-newyear' },
  };
  // Dates that move every year (Diwali, Holi) are listed up to 2028.
  const MOVING = { diwali: ['2026-11-08', '2027-10-29', '2028-10-17'], holi: ['2026-03-04', '2027-03-22', '2028-03-11'] };
  const festivalFor = d => {
    const m = d.getMonth() + 1, day = d.getDate();
    const near = (list, before, after) => list.some(s => { const t = new Date(s + 'T12:00:00'); const diff = (d - t) / 864e5; return diff >= -before && diff <= after + 1; });
    if (near(MOVING.diwali, 3, 4)) return 'diwali';
    if (near(MOVING.holi, 1, 1)) return 'holi';
    if (m === 1 && day >= 13 && day <= 16) return 'pongal';
    if (m === 12 && day >= 20 && day <= 26) return 'christmas';
    if ((m === 12 && day === 31) || (m === 1 && day <= 2)) return 'newyear';
    return null;
  };
  const forced = new URLSearchParams(location.search).get('fest');
  const fest = FESTS[forced] ? forced : festivalFor(new Date());
  const hero = view.querySelector('.whero');
  if (fest && hero) {
    const f = FESTS[fest];
    const strip = document.createElement('div'); strip.className = 'm-fest ' + f.cls; strip.setAttribute('role', 'note');
    const bulbs = Array.from({ length: 26 }, (_, i) => `<i style="--d:${(i % 5) * 0.3}s;--c:${PAL[i % 4]}"></i>`).join('');
    strip.innerHTML = `<div class="m-fest-lights" aria-hidden="true">${bulbs}</div><p><span class="m-fest-icon" aria-hidden="true">${f.icon}</span><b>${f.title}</b> <span>${f.msg} — from the DEVOCRAT family</span></p><button type="button" class="m-fest-x" aria-label="Close greeting" data-v3decorated="1">×</button>`;
    hero.before(strip);
    strip.querySelector('.m-fest-x').addEventListener('click', () => gsap.to(strip, { height: 0, opacity: 0, paddingTop: 0, paddingBottom: 0, duration: 0.4, ease: 'power2.in', onComplete: () => strip.remove() }));
    afterDialog(gsap.timeline({ delay: 0.3 })).from(strip, { yPercent: -100, opacity: 0, duration: 0.7, ease: 'power3.out' })
      .from(strip.querySelectorAll('.m-fest-lights i'), { scale: 0, opacity: 0, duration: 0.3, stagger: 0.03, ease: 'back.out(3)' }, 0.3);
  }

  /* ---------- HERO: parallax depth layers (S4) ---------- */
  if (hero) {
    const k = hero.querySelector('.kicker'), h = hero.querySelector('h1'), lead = hero.querySelector('.lead'), ht = hero.querySelector('.herotext');
    const svg = hero.querySelector('.mnd');
    const intro = afterDialog(gsap.timeline({ delay: 0.35 }));
    if (k) intro.from(k, { opacity: 0, y: 10, duration: 0.6 }, 0);
    if (h) intro.from(h, { opacity: 0, y: 26, duration: 0.9, ease: 'power3.out' }, 0.1);
    if (lead) intro.from(lead, { opacity: 0, y: 16, duration: 0.8, ease: 'power2.out' }, 0.35);
    if (svg) {
      // Each ring group (s1 outer … s4 inner) goes into two wrappers: one moved by scroll, one by the mouse.
      const rings = ['s1', 's2', 's3', 's4'].map(c => svg.querySelector('.' + c)).filter(Boolean);
      const layers = rings.map((g, i) => {
        const outer = document.createElementNS(NS, 'g'), inner = document.createElementNS(NS, 'g');
        g.parentNode.insertBefore(outer, g); outer.appendChild(inner); inner.appendChild(g);
        return { outer, inner, depth: (i + 1) / rings.length };
      });
      intro.from(layers.map(l => l.outer), { opacity: 0, scale: 0.6, svgOrigin: '0 0', duration: 1.2, stagger: 0.12, ease: 'back.out(1.4)' }, 0.1);
      // scroll: inner rings rise faster than outer ones, the text slower still
      const sc = gsap.timeline({ scrollTrigger: { trigger: hero, scroller: view, start: 'top top', end: 'bottom top', scrub: 0.5 } });
      layers.forEach(l => sc.to(l.outer, { y: -40 - 150 * l.depth, rotation: 30 * l.depth, svgOrigin: '0 0', ease: 'none' }, 0));
      if (ht) sc.to(ht, { y: 70, opacity: 0.2, ease: 'none' }, 0);
      // mouse: deeper layers shift further
      if (finePointer) {
        const movers = layers.map(l => ({ x: gsap.quickTo(l.inner, 'x', { duration: 0.8, ease: 'power3.out' }), y: gsap.quickTo(l.inner, 'y', { duration: 0.8, ease: 'power3.out' }), d: l.depth }));
        const onMove = e => { const r = hero.getBoundingClientRect(); const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5; movers.forEach(m => { m.x(nx * 34 * m.d); m.y(ny * 26 * m.d); }); };
        hero.addEventListener('pointermove', onMove); offs.push(() => hero.removeEventListener('pointermove', onMove));
      }
    }
  }

  /* ---------- general reveals: petals unfolding ---------- */
  q('.wsection h2').forEach(h2 => inOut(h2, tl().from(h2, { opacity: 0, y: 22, duration: 0.8, ease: 'power3.out' }), 'top 88%', 'bottom 6%'));
  q('.wsection > .kicker, .wsection .labhead .kicker, .aboutgrid .kicker, .contactgrid .kicker, .wsection .wsub, .about-lead, .labnote, .formnote').forEach(el => inOut(el, tl().from(el, { opacity: 0, y: 12, duration: 0.7, ease: 'power2.out' })));
  const unfold = sel => {
    const els = gsap.utils.toArray(q(sel)); if (!els.length) return;
    els.forEach(el => { el.classList.add('m-pop'); el.dataset.mTamed = '1'; });
    inOut(els[0].parentElement, tl().fromTo(els, { opacity: 0, '--pop-s': 0.85, '--pop-r': '-10deg', '--pop-y': '30px' }, { opacity: 1, '--pop-s': 1, '--pop-r': '0deg', '--pop-y': '0px', duration: 0.8, stagger: 0.1, ease: 'back.out(1.6)' }), 'top 84%');
  };
  unfold('.servicegrid .service'); unfold('.highlights .service'); unfold('.picker .project'); unfold('.team .tm');
  q('.devices, .contact-card.enquiry, .offer-soon').forEach(el => inOut(el, tl().from(el, { opacity: 0, y: 30, duration: 0.9, ease: 'power3.out' })));

  /* ---------- SERVICES: text on a circle (T6) ---------- */
  const services = view.querySelector('#services');
  if (services) {
    const badge = document.createElement('div'); badge.className = 'm-badge'; badge.setAttribute('aria-hidden', 'true');
    const txt = 'EVERY DETAIL ✺ A MASTERPIECE ✺ DESIGN + CODE ✺ THE JOINT FAMILY ✺ ';
    badge.innerHTML = `<svg viewBox="-100 -100 200 200"><defs><path id="m-badge-c" d="M0 -74 A74 74 0 1 1 -0.01 -74"/></defs>
      <circle r="96" fill="${GOLD}" stroke="${INK}" stroke-width="2.5"/><circle r="88" fill="none" stroke="${INK}" stroke-width="1" stroke-dasharray="2 4"/>
      <g class="m-badge-ring"><text><textPath href="#m-badge-c" startOffset="0">${txt}</textPath></text></g>
      <circle r="52" fill="${CREAM}" stroke="${INK}" stroke-width="2"/>
      <g class="m-badge-core">${Array.from({ length: 12 }, (_, i) => `<path d="M0 -12 C7 -22 7 -34 0 -44 C-7 -34 -7 -22 0 -12Z" fill="${i % 2 ? RED : TEAL}" stroke="${INK}" stroke-width="1" transform="rotate(${i * 30})"/>`).join('')}<circle r="10" fill="${RED}" stroke="${INK}" stroke-width="1.5"/></g></svg>`;
    services.style.position = 'relative';
    services.appendChild(badge);
    const ring = badge.querySelector('.m-badge-ring'), core = badge.querySelector('.m-badge-core');
    let ang = 0;
    offs.push(loop(dt => {
      const v = Math.abs((api.lenis && api.lenis.velocity) || 0);
      ang += dt * 0.012 + Math.min(14, v * 0.35);
      ring.setAttribute('transform', `rotate(${(ang % 360).toFixed(2)})`);
      core.setAttribute('transform', `rotate(${(-ang * 0.5 % 360).toFixed(2)})`);
    }));
    inOut(badge, tl().from(badge, { scale: 0, rotation: -180, duration: 1, ease: 'back.out(1.6)' }), 'top 92%');
  }

  /* ---------- OFFERS: generative rangoli (A8) ---------- */
  const offers = view.querySelector('#offers');
  if (offers) {
    const wrap = document.createElement('div'); wrap.className = 'm-rangoli';
    wrap.innerHTML = `<svg viewBox="-200 -200 400 400" role="img" aria-label="A rangoli pattern"></svg>
      <div class="m-rangoli-cap"><small>A new rangoli on every visit</small><button type="button" class="m-rangoli-new" data-v3decorated="1">✺ Draw another</button></div>`;
    offers.appendChild(wrap);
    const svg = wrap.querySelector('svg');
    const petal = (r0, r1, w) => `M0 ${-r0} C${w} ${-r0 - (r1 - r0) * 0.25} ${w * 0.8} ${-r1 + (r1 - r0) * 0.2} 0 ${-r1} C${-w * 0.8} ${-r1 + (r1 - r0) * 0.2} ${-w} ${-r0 - (r1 - r0) * 0.25} 0 ${-r0}Z`;
    const pointy = (r0, r1, w) => `M0 ${-r0} Q${w} ${-(r0 + r1) / 2} 0 ${-r1} Q${-w} ${-(r0 + r1) / 2} 0 ${-r0}Z`;
    const build = () => {
      const n = pick([8, 10, 12, 16]), step = 360 / n;
      const cols = [...PAL].sort(() => Math.random() - 0.5);
      let out = '';
      const ring = (d, fill, stroke, offset = 0, cls = '') => { for (let i = 0; i < n; i++) out += `<path class="m-rg ${cls}" d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="2" transform="rotate(${(i * step + offset).toFixed(2)})"/>`; };
      const dots = (r, count, size, fill) => { for (let i = 0; i < count; i++) { const a = (i / count) * Math.PI * 2; out += `<circle class="m-rg-dot" cx="${(r * Math.cos(a)).toFixed(1)}" cy="${(r * Math.sin(a)).toFixed(1)}" r="${size}" fill="${fill}"/>`; } };
      // outer scalloped border
      let sc = ''; const sN = n * 2, R = 186;
      for (let i = 0; i <= sN; i++) { const a = (i / sN) * Math.PI * 2 - Math.PI / 2, b = ((i + 0.5) / sN) * Math.PI * 2 - Math.PI / 2; const p = [R * Math.cos(a), R * Math.sin(a)], c = [(R + 16) * Math.cos(b), (R + 16) * Math.sin(b)], e = [R * Math.cos(a + Math.PI * 2 / sN), R * Math.sin(a + Math.PI * 2 / sN)]; if (i < sN) sc += (i ? '' : `M${p[0].toFixed(1)} ${p[1].toFixed(1)}`) + `Q${c[0].toFixed(1)} ${c[1].toFixed(1)} ${e[0].toFixed(1)} ${e[1].toFixed(1)}`; }
      out += `<path class="m-rg" d="${sc}Z" fill="none" stroke="${INK}" stroke-width="2.4"/>`;
      ring(rnd(0, 1) > 0.5 ? petal(118, 176, rnd(18, 28)) : pointy(118, 178, rnd(20, 30)), cols[0] + '33', cols[0], step / 2);
      ring(petal(70, 140, rnd(16, 24)), cols[1] + '55', INK);
      dots(rnd(150, 160), n * 2, 3.4, cols[2]);
      ring(pointy(36, 96, rnd(10, 18)), cols[2] + '66', cols[2], step / 2);
      out += `<circle class="m-rg" r="34" fill="${cols[3]}33" stroke="${INK}" stroke-width="2"/>`;
      ring(petal(4, 30, 9), cols[4] + 'aa', INK);
      dots(60, n, 4.5, cols[0]); dots(108, n * 2, 2.6, INK);
      out += `<circle class="m-rg-dot" r="6" fill="${GOLD}" stroke="${INK}" stroke-width="1.5"/>`;
      svg.innerHTML = out;
      const paths = [...svg.querySelectorAll('.m-rg')];
      paths.forEach(p => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; p.dataset.l = L; p.style.fillOpacity = 0; });
      gsap.set(svg.querySelectorAll('.m-rg-dot'), { scale: 0, transformOrigin: '50% 50%' });
      return gsap.timeline()
        .to(paths, { strokeDashoffset: 0, duration: 0.9, stagger: { each: 0.02, from: 'end' }, ease: 'power1.inOut' })
        .to(paths, { fillOpacity: 1, duration: 0.6, stagger: { each: 0.01, from: 'end' } }, '-=0.6')
        .to(svg.querySelectorAll('.m-rg-dot'), { scale: 1, duration: 0.3, stagger: { each: 0.008, from: 'random' }, ease: 'back.out(3)' }, '-=0.9');
    };
    let draw = build(); draw.pause(0);
    // plays when the section scrolls in, un-draws when you scroll back past it
    const st = ScrollTrigger.create({ trigger: wrap, scroller: view, start: 'top 80%', end: 'bottom 10%',
      onEnter: () => draw.timeScale(1).play(), onEnterBack: () => draw.timeScale(1).play(),
      onLeave: () => draw.timeScale(2.4).reverse(), onLeaveBack: () => draw.timeScale(2.4).reverse() });
    wrap.querySelector('.m-rangoli-new').addEventListener('click', () => {
      gsap.to(svg, { rotation: 90, scale: 0.6, opacity: 0, duration: 0.35, ease: 'power2.in', onComplete() {
        draw.kill(); gsap.set(svg, { rotation: 0, scale: 1, opacity: 1 }); draw = build();
      } });
    });
    offs.push(() => st.kill());
  }

  /* ---------- PROTOTYPES: tile dissolve when switching (D4) ---------- */
  const frames = [...q('.desktopframe, .phone-screen')];
  if (frames.length) {
    const covers = frames.map(fr => {
      fr.style.position = 'relative';
      const c = document.createElement('canvas'); c.className = 'm-dissolve'; c.setAttribute('aria-hidden', 'true'); fr.appendChild(c); return c;
    });
    let running = null;
    const dissolve = () => {
      if (running) running.kill();
      const jobs = covers.map(c => {
        const w = c.clientWidth, h = c.clientHeight, dpr = Math.min(2, devicePixelRatio || 1), S = 18;
        c.width = w * dpr; c.height = h * dpr; const g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
        const cols = Math.ceil(w / S), rows = Math.ceil(h / S), cx = cols / 2, cy = rows / 2, cells = [];
        for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
          const ring = Math.floor(Math.hypot((x - cx) / cx, (y - cy) / cy) * 5);
          cells.push({ x, y, col: PAL[ring % PAL.length], r: Math.random() });
        }
        const inOrder = [...cells].sort((a, b) => a.r - b.r), outOrder = [...cells].sort(() => Math.random() - 0.5);
        return { c, g, S, inOrder, outOrder, shownIn: 0, shownOut: 0 };
      });
      const p = { a: 0, b: 0 };
      const paint = () => jobs.forEach(j => {
        const nIn = Math.floor(p.a * j.inOrder.length);
        for (; j.shownIn < nIn; j.shownIn++) { const t = j.inOrder[j.shownIn]; j.g.fillStyle = t.col; j.g.fillRect(t.x * j.S, t.y * j.S, j.S, j.S); j.g.fillStyle = CREAM; j.g.beginPath(); j.g.arc(t.x * j.S + j.S / 2, t.y * j.S + j.S / 2, 2, 0, 7); j.g.fill(); }
        const nOut = Math.floor(p.b * j.outOrder.length);
        for (; j.shownOut < nOut; j.shownOut++) { const t = j.outOrder[j.shownOut]; j.g.clearRect(t.x * j.S, t.y * j.S, j.S, j.S); }
      });
      covers.forEach(c => { c.style.opacity = 1; });
      running = gsap.timeline({ onComplete: () => covers.forEach(c => { c.style.opacity = 0; }) })
        .to(p, { a: 1, duration: 0.45, ease: 'power1.in', onUpdate: paint })
        .to(p, { b: 1, duration: 0.7, ease: 'power1.out', onUpdate: paint }, '+=0.45');
    };
    const onPick = e => { if (e.target.closest('.picker .project')) dissolve(); };
    view.addEventListener('click', onPick); offs.push(() => view.removeEventListener('click', onPick));
  }

  /* ---------- DISCUSS: diyas that flicker and lean away from the pointer (A12) ---------- */
  const contact = view.querySelector('#contact');
  if (contact) {
    const row = document.createElement('div'); row.className = 'm-diyas'; row.setAttribute('aria-hidden', 'true');
    const diya = i => `<div class="m-diya"><svg viewBox="-50 -90 100 130">
      <ellipse class="m-diya-glow" cx="0" cy="-30" rx="44" ry="50" fill="url(#m-diya-glow)"/>
      <g class="m-diya-flame"><path d="M0 -6 C-10 -14 -9 -30 0 -52 C9 -30 10 -14 0 -6Z" fill="url(#m-diya-fire)"/><path d="M0 -8 C-4 -12 -4 -22 0 -30 C4 -22 4 -12 0 -8Z" fill="#fff6c8"/></g>
      <path d="M-44 -2 C-40 26 -18 36 0 36 C18 36 40 26 44 -2 C26 4 -26 4 -44 -2Z" fill="${i % 2 ? '#a8452a' : '#b8532f'}" stroke="${INK}" stroke-width="2.4"/>
      <path d="M-44 -2 C-26 -8 26 -8 44 -2 C26 4 -26 4 -44 -2Z" fill="#7a2d1a" stroke="${INK}" stroke-width="2"/>
      <path d="M-30 14 C-15 22 15 22 30 14" fill="none" stroke="${GOLD}" stroke-width="2.4" stroke-dasharray="1 6" stroke-linecap="round"/>
      <circle cx="0" cy="22" r="3" fill="${GOLD}"/></svg></div>`;
    row.innerHTML = `<svg width="0" height="0" style="position:absolute"><defs>
      <radialGradient id="m-diya-glow"><stop offset="0" stop-color="#ffd27a" stop-opacity=".75"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
      <linearGradient id="m-diya-fire" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e2420f"/><stop offset=".45" stop-color="#f2a516"/><stop offset="1" stop-color="#ffe9a8"/></linearGradient></defs></svg>${Array.from({ length: 5 }, (_, i) => diya(i)).join('')}`;
    contact.prepend(row);
    const lamps = [...row.querySelectorAll('.m-diya')].map((el, i) => ({ el, flame: el.querySelector('.m-diya-flame'), glow: el.querySelector('.m-diya-glow'), seed: i * 1.7, lean: 0, gust: 0 }));
    let px = -9999, py = -9999, pv = 0, lx = 0, ly = 0;
    const onMove = e => { pv = Math.min(60, Math.hypot(e.clientX - lx, e.clientY - ly)); lx = px = e.clientX; ly = py = e.clientY; };
    view.addEventListener('pointermove', onMove, { passive: true }); offs.push(() => view.removeEventListener('pointermove', onMove));
    inOut(row, tl().from(lamps.map(l => l.el), { opacity: 0, y: 24, duration: 0.6, stagger: 0.1, ease: 'back.out(2)' }).from(lamps.map(l => l.flame), { scale: 0, transformOrigin: '50% 100%', duration: 0.4, stagger: 0.1, ease: 'back.out(3)' }, 0.3), 'top 90%');
    offs.push(loop((dt, now) => {
      pv *= 0.9;
      const t = now / 1000;
      lamps.forEach(l => {
        const r = l.el.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
        const cx = r.left + r.width / 2, cy = r.top + r.height * 0.3, dx = cx - px, dy = cy - py, dist = Math.hypot(dx, dy);
        const near = Math.max(0, 1 - dist / 260);
        const target = near * Math.sign(dx) * 22 * (0.5 + Math.min(1, pv / 20));   // lean away from the pointer
        l.lean += (target - l.lean) * 0.12;
        const flick = Math.sin(t * 13 + l.seed) * 0.05 + Math.sin(t * 7.3 + l.seed * 2) * 0.04 + (Math.random() - 0.5) * 0.04;
        l.flame.setAttribute('transform', `translate(0 -6) skewX(${(l.lean + Math.sin(t * 5 + l.seed) * 3).toFixed(2)}) scale(${(1 - near * 0.12 + flick * 0.6).toFixed(3)} ${(1 + flick - near * 0.15).toFixed(3)}) translate(0 6)`);
        l.glow.style.opacity = (0.75 + flick * 2.5 - near * 0.2).toFixed(3);
      });
    }));
  }

  /* ---------- WHOLE PAGE: falling petals (A9) ---------- */
  if (!reduce) {
    const cv = own(document.createElement('canvas'), view); cv.className = 'm-petals'; cv.setAttribute('aria-hidden', 'true');
    const g = cv.getContext('2d'); const dpr = Math.min(2, devicePixelRatio || 1);
    let W = 0, H = 0;
    const size = () => { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener('resize', size); offs.push(() => removeEventListener('resize', size));
    const COLS = ['#f2a516', '#f7b733', '#e8740c', '#c8391f', '#e45a8a'];
    const count = innerWidth < 700 ? 10 : 18;
    const make = top => ({ x: rnd(0, W), y: top ? rnd(-H, 0) : -20, s: rnd(5, 9), vy: rnd(0.018, 0.04), sway: rnd(0.6, 1.6), ph: rnd(0, 6.28), rot: rnd(0, 6.28), vr: rnd(-0.002, 0.002), c: pick(COLS), flip: rnd(0, 6.28) });
    const petals = Array.from({ length: count }, () => make(true));
    let lastScroll = view.scrollTop;
    offs.push(loop((dt, now) => {
      g.clearRect(0, 0, W, H);
      const ds = view.scrollTop - lastScroll; lastScroll = view.scrollTop;   // petals drift with the page a little
      petals.forEach((p, i) => {
        p.y += p.vy * dt - ds * 0.15; p.ph += dt * 0.0012; p.rot += p.vr * dt; p.flip += dt * 0.003;
        const x = p.x + Math.sin(p.ph) * 26 * p.sway;
        if (p.y > H + 20) petals[i] = make(false);
        g.save(); g.translate(x, p.y); g.rotate(p.rot); g.scale(1, Math.abs(Math.cos(p.flip)) * 0.7 + 0.3);
        g.fillStyle = p.c; g.globalAlpha = 0.8;
        g.beginPath(); g.moveTo(0, -p.s); g.quadraticCurveTo(p.s * 0.9, 0, 0, p.s); g.quadraticCurveTo(-p.s * 0.9, 0, 0, -p.s); g.fill();
        g.globalAlpha = 0.35; g.strokeStyle = '#7a2d1a'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(0, -p.s * 0.7); g.lineTo(0, p.s * 0.7); g.stroke();
        g.restore();
      });
      g.globalAlpha = 1;
    }));
  }

  /* ---------- SOUND: ambient drone + temple bells (N1), off until turned on ---------- */
  const amb = (() => {
    let ac = null, master = null, timer = 0, on = false, nodes = [];
    const bell = () => {
      if (!on) return;
      const t = ac.currentTime, f = pick([523.25, 587.33, 659.25, 783.99, 880]);
      [[1, 1, 4.5], [2.76, 0.45, 3], [5.4, 0.22, 2], [8.93, 0.1, 1.2]].forEach(([m, v, d]) => {
        const o = ac.createOscillator(), gn = ac.createGain(); o.type = 'sine'; o.frequency.value = f * m;
        gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(0.07 * v, t + 0.006); gn.gain.exponentialRampToValueAtTime(0.0001, t + d);
        o.connect(gn).connect(master); o.start(t); o.stop(t + d + 0.1);
      });
      timer = setTimeout(bell, rnd(5000, 11000));
    };
    const start = () => {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return false;
      if (!ac) {
        ac = new C(); master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
        const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.connect(master);
        const drone = ac.createGain(); drone.gain.value = 0.05; drone.connect(lp);
        [[130.81, 0], [196, 3], [261.63, -4], [65.41, 0]].forEach(([f, det]) => { const o = ac.createOscillator(); o.type = 'triangle'; o.frequency.value = f; o.detune.value = det; o.connect(drone); o.start(); nodes.push(o); });
        const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 0.08; lg.gain.value = 0.02; lfo.connect(lg).connect(drone.gain); lfo.start(); nodes.push(lfo);
      }
      ac.resume(); on = true;
      master.gain.cancelScheduledValues(ac.currentTime); master.gain.setTargetAtTime(1, ac.currentTime, 0.8);
      clearTimeout(timer); timer = setTimeout(bell, 900);
      return true;
    };
    const stop = () => { on = false; clearTimeout(timer); if (ac) { master.gain.setTargetAtTime(0, ac.currentTime, 0.3); setTimeout(() => { if (!on && ac) ac.suspend(); }, 1200); } };
    const close = () => { on = false; clearTimeout(timer); if (ac) { try { ac.close(); } catch (_) {} ac = null; } };
    return { start, stop, close, get on() { return on; } };
  })();
  const sbtn = own(document.createElement('button'), view);
  sbtn.className = 'm-amb'; sbtn.type = 'button'; sbtn.dataset.v3decorated = '1';
  const paint = () => { sbtn.innerHTML = `<span aria-hidden="true">🔔</span> Temple ambience: <b>${amb.on ? 'on' : 'off'}</b>`; sbtn.setAttribute('aria-pressed', String(amb.on)); sbtn.classList.toggle('m-on', amb.on); };
  paint();
  sbtn.addEventListener('click', () => { amb.on ? amb.stop() : amb.start(); paint(); });
  offs.push(() => amb.close());

  return () => offs.forEach(f => f());
});
