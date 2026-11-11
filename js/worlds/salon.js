/* ==========================================================================
   SALON — "Every style finds its expression"
   Section map (one signature per section, so effects never overlap):
     Hero ........ the navy style card swings in like a mirror on a hinge
     Whole page .. SHAPE MORPH BETWEEN SECTIONS (S9): one soft shape behind
                   the page turns into the next as you scroll:
                   mirror → serum drop → heart → sparkle → arch mirror → bloom
     Services .... TREATMENT MENU (L10): the services become a salon menu card
                   that unfolds; pointing at a treatment shows its details in
                   an arched mirror beside the list
     Pointer ..... OBJECT CURSOR (C10): a pair of scissors; they snip when over
                   something clickable and drop a few clippings on click
   ========================================================================== */
DevoMotion.world('salon', api => {
  const { view, gsap, q, inOut, tl, afterDialog, finePointer, reduce, loop, own, splitWords } = api;
  const offs = [];
  const NAVY = '#1f2a44', BRASS = '#c9a24a', BLUSH = '#d4607c', ROSE = '#f3c9d6';
  const NS = 'http://www.w3.org/2000/svg';

  /* ---------- HERO: the style card swings in like a mirror ---------- */
  const hero = view.querySelector('.whero');
  if (hero) {
    const card = hero.querySelector('.herotext'), k = hero.querySelector('.kicker'), h = hero.querySelector('h1'),
      lead = hero.querySelector('.lead'), art = hero.querySelector('.hero-object');
    const words = h ? splitWords(h, 'mask') : [];
    const intro = afterDialog(gsap.timeline({ delay: 0.3 }));
    if (card) intro.from(card, { rotationY: -38, transformPerspective: 1400, transformOrigin: '100% 50%', opacity: 0, duration: 1.3, ease: 'power3.out' }, 0);
    if (k) intro.from(k, { opacity: 0, letterSpacing: '0.6em', duration: 1, ease: 'power2.out', clearProps: 'letterSpacing' }, 0.45);
    if (words.length) intro.from(words, { yPercent: 110, rotation: 4, duration: 0.9, stagger: 0.06, ease: 'power3.out' }, 0.55);
    if (lead) intro.from(lead, { opacity: 0, y: 14, duration: 0.9, ease: 'power2.out' }, 1.0);
    if (art) intro.from(art, { opacity: 0, scale: 0.9, rotation: -4, duration: 1.4, ease: 'power3.out' }, 0.2);
    // fromTo + immediateRender:false so this scroll fade does not fight the intro above
    if (card) gsap.fromTo(card, { y: 0, opacity: 1 }, { y: -60, opacity: 0, ease: 'none', immediateRender: false, scrollTrigger: { trigger: hero, scroller: view, start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ---------- HEADINGS + TEXT: a silk curtain lifts off each heading ---------- */
  q('.wsection h2').forEach(h2 => inOut(h2, tl().fromTo(h2, { clipPath: 'inset(0 0 100% 0)', y: 18 }, { clipPath: 'inset(0 0 -20% 0)', y: 0, duration: 0.9, ease: 'power3.out' }), 'top 88%', 'bottom 6%'));
  q('.wsection > .kicker, .wsection .labhead .kicker, .aboutgrid .kicker, .contactgrid .kicker').forEach(el => inOut(el, tl().from(el, { opacity: 0, x: -14, duration: 0.7, ease: 'power2.out' })));
  q('.wsection .wsub, .about-lead, .labnote, .formnote').forEach(p => inOut(p, tl().from(p, { opacity: 0, y: 14, duration: 0.9, ease: 'power2.out' })));

  /* ---------- other cards rise like arched mirrors ---------- */
  const archRise = sel => {
    const els = gsap.utils.toArray(q(sel)); if (!els.length) return;
    inOut(els[0].parentElement, tl().from(els, { opacity: 0, y: 40, scaleY: 0.9, transformOrigin: '50% 100%', duration: 0.9, stagger: 0.1, ease: 'power3.out' }), 'top 84%');
  };
  archRise('.highlights .service'); archRise('.picker .project'); archRise('.team .tm');
  q('.devices, .contact-card.enquiry, .offer-soon').forEach(el => inOut(el, tl().from(el, { opacity: 0, y: 36, duration: 1, ease: 'power3.out' })));

  /* ---------- SERVICES: treatment menu (L10) ---------- */
  const grid = view.querySelector('#services .servicegrid');
  if (grid) {
    const rows = [...grid.querySelectorAll('.service')];
    const menu = document.createElement('div'); menu.className = 'm-menu';
    grid.before(menu); menu.append(grid);
    grid.insertAdjacentHTML('afterbegin', '<header class="m-menu-head" aria-hidden="true"><i>✦</i><b>The Menu</b><i>✦</i></header>');
    const detail = document.createElement('aside'); detail.className = 'm-menu-detail'; detail.setAttribute('aria-live', 'polite');
    detail.innerHTML = '<div class="m-md-mirror"><span class="m-md-icon"></span></div><div class="m-md-body"><small class="m-md-n"></small><h3></h3><p></p><span class="m-md-note">Designed by Lucky · built by Venky</span></div>';
    menu.append(detail);
    const dIcon = detail.querySelector('.m-md-icon'), dN = detail.querySelector('.m-md-n'), dH = detail.querySelector('h3'), dP = detail.querySelector('p'), dBody = detail.querySelector('.m-md-body');
    let cur = -1, swap = null;
    const fill = i => {
      const r = rows[i];
      dIcon.textContent = r.querySelector('i')?.textContent || '';
      dN.textContent = `Treatment ${i + 1} of ${rows.length}`;
      dH.textContent = r.querySelector('h3')?.textContent || '';
      dP.textContent = r.querySelector('p')?.textContent || '';
    };
    const show = (i, instant) => {
      if (i === cur) return; cur = i;
      rows.forEach((r, k) => r.classList.toggle('m-on', k === i));
      if (instant) { fill(i); return; }
      if (swap) swap.kill();
      swap = gsap.timeline()
        .to([dBody, dIcon], { opacity: 0, y: -8, duration: 0.16, ease: 'power1.in' })
        .add(() => fill(i))
        .fromTo(dIcon, { opacity: 0, y: 0, scale: 0.6, rotation: -20 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.45, ease: 'back.out(2.2)' })
        .fromTo(dBody, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, '<0.05');
    };
    rows.forEach((r, i) => {
      r.tabIndex = 0;
      r.addEventListener('pointerenter', () => show(i));
      r.addEventListener('focus', () => show(i));
    });
    show(0, true);
    // the card unfolds from its top edge, rows write in with their dotted leaders
    rows.forEach(r => r.style.setProperty('--lead', 1));
    const t = tl()
      .from(grid, { rotationX: -70, transformPerspective: 1600, transformOrigin: '50% 0%', opacity: 0, duration: 1, ease: 'power3.out' })
      .from(grid.querySelector('.m-menu-head'), { opacity: 0, letterSpacing: '0.8em', duration: 0.7, ease: 'power2.out', clearProps: 'letterSpacing' }, 0.35)
      .from(rows, { opacity: 0, x: -18, duration: 0.55, stagger: 0.08, ease: 'power2.out' }, 0.4)
      .fromTo(rows, { '--lead': 0 }, { '--lead': 1, duration: 0.6, stagger: 0.08, ease: 'power2.inOut' }, 0.55)
      .fromTo(detail, { clipPath: 'inset(100% 0% 0% 0% round 999px 999px 24px 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 999px 999px 24px 24px)', duration: 1, ease: 'power3.inOut' }, 0.3);
    inOut(menu, t, 'top 82%', 'bottom 12%');
  }

  /* ---------- WHOLE PAGE: shape morph between sections (S9) ---------- */
  // Shapes are drawn in a 200×200 box. Each is resampled to the same number of points,
  // so any shape can melt smoothly into any other.
  const SHAPES = [
    ['hero', 'M100 18 A82 82 0 1 1 99.9 18 Z', ROSE],                                                    // hand mirror
    ['services', 'M100 14 C118 50 164 92 164 128 A64 64 0 0 1 36 128 C36 92 82 50 100 14 Z', '#e9b7a2'],   // serum drop
    ['offers', 'M100 54 C112 30 132 22 150 26 C176 32 186 60 176 86 C164 116 130 140 100 176 C70 140 36 116 24 86 C14 60 24 32 50 26 C68 22 88 30 100 54 Z', '#f0a3bd'], // heart
    ['lab', 'M100 10 Q114 86 190 100 Q114 114 100 190 Q86 114 10 100 Q86 86 100 10 Z', '#e2c27a'],         // sparkle
    ['about', 'M42 186 L42 96 A58 58 0 0 1 158 96 L158 186 Z', ROSE],                                       // arched mirror
    ['contact', null, '#f0a3bd'],                                                                            // bloom (generated)
  ];
  // a five-petal bloom, generated as a polar curve
  SHAPES[5][1] = (() => { let d = ''; for (let i = 0; i <= 200; i++) { const a = (i / 200) * Math.PI * 2 - Math.PI / 2, r = 62 + 26 * Math.cos(5 * (a + Math.PI / 2)); d += (i ? 'L' : 'M') + (100 + r * Math.cos(a)).toFixed(2) + ' ' + (100 + r * Math.sin(a)).toFixed(2); } return d + 'Z'; })();

  const N = 120;
  const morph = own(document.createElement('div'), view); morph.className = 'm-morph'; morph.setAttribute('aria-hidden', 'true');
  morph.innerHTML = `<svg viewBox="-10 -10 220 220"><defs><linearGradient id="m-morph-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" class="m-morph-stop" stop-color="${ROSE}"/></linearGradient></defs><path class="m-morph-fill" fill="url(#m-morph-g)"/><path class="m-morph-line"/></svg><span class="m-morph-name"></span>`;
  const mSvg = morph.querySelector('svg'), mFill = morph.querySelector('.m-morph-fill'), mLine = morph.querySelector('.m-morph-line'),
    mStop = morph.querySelector('.m-morph-stop'), mName = morph.querySelector('.m-morph-name');
  const NAMES = ['Mirror', 'Serum', 'Love', 'Sparkle', 'Arch', 'Bloom'];
  const sample = d => {
    const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); mSvg.appendChild(p);
    const L = p.getTotalLength(); let pts = [];
    for (let i = 0; i < N; i++) { const pt = p.getPointAtLength((L * i) / N); pts.push([pt.x, pt.y]); }
    p.remove();
    // same direction for every shape (clockwise on screen)
    let area = 0; pts.forEach((a, i) => { const b = pts[(i + 1) % N]; area += a[0] * b[1] - b[0] * a[1]; });
    if (area < 0) pts.reverse();
    // start every shape at its top-centre point, so points travel the shortest way
    const cx = pts.reduce((s, p) => s + p[0], 0) / N, cy = pts.reduce((s, p) => s + p[1], 0) / N;
    let best = 0, bd = 9;
    pts.forEach((p, i) => { let d = Math.atan2(p[1] - cy, p[0] - cx) + Math.PI / 2; d = Math.abs(Math.atan2(Math.sin(d), Math.cos(d))); if (d < bd) { bd = d; best = i; } });
    return pts.slice(best).concat(pts.slice(0, best));
  };
  const shapes = SHAPES.map(s => sample(s[1]));
  const colors = SHAPES.map(s => s[2]);
  const sections = SHAPES.map(s => s[0] === 'hero' ? hero : view.querySelector('#' + s[0]));
  const smooth = x => x * x * (3 - 2 * x);
  const draw = f => {
    const i = Math.min(shapes.length - 1, Math.floor(f)), j = Math.min(shapes.length - 1, i + 1), t = smooth(f - i);
    const A = shapes[i], B = shapes[j];
    let d = '';
    for (let k = 0; k < N; k++) d += (k ? 'L' : 'M') + (A[k][0] + (B[k][0] - A[k][0]) * t).toFixed(1) + ' ' + (A[k][1] + (B[k][1] - A[k][1]) * t).toFixed(1);
    d += 'Z';
    mFill.setAttribute('d', d); mLine.setAttribute('d', d);
    mStop.setAttribute('stop-color', gsap.utils.interpolate(colors[i], colors[j], t));
    mSvg.style.transform = `rotate(${(f * 24 - 12).toFixed(2)}deg)`;
    const n = Math.round(f); if (mName.dataset.n !== String(n)) { mName.dataset.n = n; mName.textContent = NAMES[n] || ''; }
  };
  // where we are: a float "section index" (2.4 = 40% of the way from offers to lab)
  const target = () => {
    const vh = view.clientHeight, y = view.scrollTop + vh * 0.5, band = vh * 0.4;
    const tops = sections.map(s => (s ? s.offsetTop : Infinity));
    let i = 0; for (let k = 0; k < tops.length; k++) if (tops[k] <= y) i = k;
    const next = tops[i + 1];
    if (next === undefined || next === Infinity) return i;
    return i + Math.max(0, Math.min(1, (y - (next - band)) / band));
  };
  let fNow = 0, drawn = -1;
  draw(0);
  offs.push(loop(dt => {
    const goal = target();
    fNow += (goal - fNow) * Math.min(1, dt * 0.007);
    if (Math.abs(goal - fNow) < 0.0005) fNow = goal;
    if (Math.abs(fNow - drawn) > 0.0004) { drawn = fNow; draw(fNow); }
  }));
  afterDialog(gsap.timeline({ delay: 0.9 })).from(morph, { opacity: 0, scale: 0.6, duration: 1.2, ease: 'back.out(1.6)' });

  /* ---------- POINTER: scissors (C10) ---------- */
  if (finePointer && api.cursor) {
    const sc = own(document.createElement('div')); sc.className = 'm-scissors'; sc.setAttribute('aria-hidden', 'true');
    sc.innerHTML = `<svg viewBox="0 0 40 64" width="40" height="64">
      <g class="m-sc-a"><path class="m-sc-blade" d="M20 27 L18.4 2.6 Q20 .2 21.4 2.8 L23.4 26.4 Z"/><path class="m-sc-arm" d="M21.2 28.4 L25.6 39.6"/><circle class="m-sc-ring" cx="28" cy="46.5" r="7"/></g>
      <g class="m-sc-b"><path class="m-sc-blade" d="M20 27 L21.6 2.6 Q20 .2 18.6 2.8 L16.6 26.4 Z"/><path class="m-sc-arm" d="M18.8 28.4 L14.4 39.6"/><circle class="m-sc-ring" cx="12" cy="46.5" r="7"/></g>
      <circle class="m-sc-pin" cx="20" cy="27" r="1.9"/></svg>`;
    const tag = own(document.createElement('b')); tag.className = 'm-sc-tag'; tag.setAttribute('aria-hidden', 'true');
    const A = sc.querySelector('.m-sc-a'), B = sc.querySelector('.m-sc-b');
    const ringLabel = api.cursor.ring.querySelector('b');
    const body = document.body;
    let open = 12, tilt = -26, pressed = false, overRow = false;
    const onOver = e => { overRow = !!(e.target.closest && e.target.closest('.m-menu .service')); };
    view.addEventListener('pointerover', onOver);
    // a snip leaves a few clippings that drift down
    const clip = (x, y) => {
      for (let i = 0; i < 7; i++) {
        const s = document.createElement('i'); s.className = 'm-clip';
        s.style.background = [BLUSH, BRASS, NAVY, ROSE][i % 4];
        document.body.appendChild(s);
        gsap.fromTo(s, { x: x - 4, y: y + 2, rotation: gsap.utils.random(0, 180), opacity: 1 },
          { x: x + gsap.utils.random(-46, 46), y: y + gsap.utils.random(50, 110), rotation: '+=' + gsap.utils.random(120, 360), opacity: 0,
            duration: gsap.utils.random(0.8, 1.3), ease: 'power1.in', onComplete: () => s.remove() });
      }
    };
    const onDown = e => { if (e.pointerType !== 'mouse') return; pressed = true; clip(e.clientX, e.clientY); };
    const onUp = () => { pressed = false; };
    addEventListener('pointerdown', onDown); addEventListener('pointerup', onUp);
    offs.push(() => { view.removeEventListener('pointerover', onOver); removeEventListener('pointerdown', onDown); removeEventListener('pointerup', onUp); document.querySelectorAll('.m-clip').forEach(n => n.remove()); });
    offs.push(api.cursor.onMove((pos, rp, vel) => {
      const now = performance.now();
      const busy = body.classList.contains('m-hover') || body.classList.contains('m-label') || overRow;
      const goal = pressed ? 0 : busy ? 3 + 13 * Math.abs(Math.sin(now * 0.011)) : 12;
      open += (goal - open) * (pressed ? 0.6 : 0.25);
      tilt += (-26 + Math.max(-16, Math.min(16, vel.x * 1.4)) - tilt) * 0.15;
      A.setAttribute('transform', `rotate(${(-open).toFixed(2)} 20 27)`);
      B.setAttribute('transform', `rotate(${open.toFixed(2)} 20 27)`);
      sc.style.transform = `translate3d(${pos.x}px,${pos.y}px,0) rotate(${tilt.toFixed(2)}deg) translate(-20px,-1px)`;
      const lab = body.classList.contains('m-label') ? ringLabel.textContent : '';
      if (tag.textContent !== lab) tag.textContent = lab;
      tag.style.transform = `translate3d(${pos.x + 26}px,${pos.y + 34}px,0)`;
    }));
  }

  return () => offs.forEach(f => f());
});
