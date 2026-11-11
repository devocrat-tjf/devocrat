/* ==========================================================================
   KIDS — "Happy places for little learners"
   Section map (one signature per section, so effects never overlap):
     Hero ........ FLOATING 3D OBJECTS (D5): toy blocks (A, B, C), a ball and a
                   star float in 3D and dodge the pointer
     Headings .... 3D FLIPPING LETTERS (T13, Kids version): every letter flips
                   over like a coloured toy tile, then turns back into the title
     Left edge ... SOMETHING THAT GROWS (S19): a beanstalk grows up the page as
                   you scroll, with a leaf for each section and a flower at the top
     Offers ...... MINI GAME (E4): "Catch the stars" — mouse, finger or arrow keys
     Buttons ..... GOOEY BUTTONS (H5): buttons wobble like jelly and drip blobs
     Everywhere .. HIDDEN CHARACTERS (E3): five little friends peek from corners;
                   find them all for a surprise
     Corner ...... EYES THAT FOLLOW (C11): Bolt the robot watches the pointer
     Keyboard .... SECRET KEY CODE (E2): type DEVOCRAT (or tap Bolt 5 times)
                   for a balloon party
   ========================================================================== */
DevoMotion.world('kids', api => {
  const { view, gsap, q, inOut, tl, afterDialog, finePointer, reduce, loop, own } = api;
  const offs = [];
  const NAVY = '#1d3b63', ORANGE = '#ff7a1a', RAINBOW = ['#ff4d4d', '#ff9f1c', '#ffd23f', '#7ac943', '#4d9dff', '#b36bff'];
  const rnd = (a, b) => a + Math.random() * (b - a);
  const ptr = { x: -999, y: -999 };
  const onPtr = e => { ptr.x = e.clientX; ptr.y = e.clientY; };
  addEventListener('pointermove', onPtr, { passive: true }); offs.push(() => removeEventListener('pointermove', onPtr));

  /* ---------- CORNER: Bolt the robot, eyes follow the pointer (C11) ---------- */
  const bolt = own(document.createElement('div'), view); bolt.className = 'm-bolt';
  bolt.innerHTML = `<div class="m-bolt-bubble" role="status" aria-live="polite"></div>
    <button type="button" class="m-bolt-btn" aria-label="Bolt the robot — tap me" data-v3decorated="1"><svg viewBox="0 0 120 132" aria-hidden="true">
      <line x1="60" y1="10" x2="60" y2="28" stroke="${NAVY}" stroke-width="4"/><circle class="m-bolt-light" cx="60" cy="9" r="7" fill="#ff4d4d" stroke="${NAVY}" stroke-width="3"/>
      <rect x="8" y="46" width="12" height="26" rx="5" fill="#ffd23f" stroke="${NAVY}" stroke-width="3"/><rect x="100" y="46" width="12" height="26" rx="5" fill="#ffd23f" stroke="${NAVY}" stroke-width="3"/>
      <rect x="18" y="26" width="84" height="66" rx="20" fill="#4d9dff" stroke="${NAVY}" stroke-width="4"/>
      <rect x="28" y="38" width="64" height="42" rx="13" fill="#e8f6ff" stroke="${NAVY}" stroke-width="3"/>
      <g class="m-bolt-eyes"><circle cx="46" cy="56" r="10" fill="#fff" stroke="${NAVY}" stroke-width="3"/><circle cx="74" cy="56" r="10" fill="#fff" stroke="${NAVY}" stroke-width="3"/>
        <circle class="m-bolt-pupil" cx="46" cy="56" r="5" fill="${NAVY}"/><circle class="m-bolt-pupil" cx="74" cy="56" r="5" fill="${NAVY}"/></g>
      <path d="M50 70 q10 8 20 0" fill="none" stroke="${NAVY}" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="34" cy="70" r="4" fill="#ff9fb2" opacity=".8"/><circle cx="86" cy="70" r="4" fill="#ff9fb2" opacity=".8"/>
      <rect x="32" y="94" width="56" height="44" rx="14" fill="${ORANGE}" stroke="${NAVY}" stroke-width="4"/><circle cx="60" cy="112" r="7" fill="#ffd23f" stroke="${NAVY}" stroke-width="3"/>
      <g class="m-bolt-arm"><path d="M88 104 q18 -6 20 -24" fill="none" stroke="${NAVY}" stroke-width="7" stroke-linecap="round"/><circle cx="108" cy="78" r="7" fill="#ffd23f" stroke="${NAVY}" stroke-width="3"/></g>
    </svg></button>`;
  const bubble = bolt.querySelector('.m-bolt-bubble'), pupils = [...bolt.querySelectorAll('.m-bolt-pupil')], eyes = bolt.querySelector('.m-bolt-eyes'), arm = bolt.querySelector('.m-bolt-arm');
  let bubbleT = 0;
  const say = (txt, ms = 2600) => {
    bubble.textContent = txt; clearTimeout(bubbleT);
    gsap.fromTo(bubble, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(3)', overwrite: true });
    bubbleT = setTimeout(() => gsap.to(bubble, { scale: 0, opacity: 0, duration: 0.25 }), ms);
  };
  offs.push(() => clearTimeout(bubbleT));
  const wave = () => gsap.fromTo(arm, { rotation: 0, svgOrigin: '88 104' }, { keyframes: { rotation: [-30, 10, -30, 0] }, duration: 0.9, ease: 'sine.inOut' });
  gsap.from(bolt, { y: 160, duration: 0.9, delay: 1.6, ease: 'back.out(1.8)', onComplete: () => { wave(); say('Hi! I’m Bolt 🤖'); } });
  // eyes follow the pointer anywhere on the screen
  offs.push(loop(() => {
    const r = bolt.getBoundingClientRect(); const s = r.width / 120;
    pupils.forEach((p, i) => {
      const ex = r.left + (i ? 74 : 46) * s, ey = r.top + 56 * s, dx = ptr.x - ex, dy = ptr.y - ey, d = Math.hypot(dx, dy) || 1, k = Math.min(5, d / 30);
      p.setAttribute('cx', ((i ? 74 : 46) + (dx / d) * k).toFixed(2)); p.setAttribute('cy', (56 + (dy / d) * k).toFixed(2));
    });
  }));
  // blink now and then
  let blinkT = 0;
  const blink = () => { gsap.to(eyes, { scaleY: 0.1, svgOrigin: '60 56', duration: 0.08, yoyo: true, repeat: 1 }); blinkT = setTimeout(blink, rnd(2500, 5500)); };
  blinkT = setTimeout(blink, 3000); offs.push(() => clearTimeout(blinkT));

  /* ---------- SECRET: balloon party (E2) — type DEVOCRAT or tap Bolt 5 times ---------- */
  const party = msg => {
    say(msg || 'You found the secret! 🎉', 3600); wave();
    gsap.fromTo(bolt, { y: 0 }, { y: -30, duration: 0.25, yoyo: true, repeat: 3, ease: 'power1.out' });
    for (let i = 0; i < 12; i++) {
      const b = document.createElement('div'); b.className = 'm-balloon'; b.setAttribute('aria-hidden', 'true');
      const c = RAINBOW[i % RAINBOW.length];
      b.innerHTML = `<svg viewBox="0 0 60 110"><path d="M30 2c16 0 28 13 28 30 0 20-16 36-28 38C18 68 2 52 2 32 2 15 14 2 30 2z" fill="${c}"/><path d="M26 70h8l-4 6z" fill="${c}"/><path d="M30 76c-6 10 6 18 0 32" fill="none" stroke="${NAVY}" stroke-width="1.5"/><ellipse cx="20" cy="22" rx="5" ry="9" fill="#fff" opacity=".45"/></svg>`;
      document.body.appendChild(b);
      const x = rnd(0, innerWidth - 60);
      gsap.fromTo(b, { x, y: innerHeight + 40 }, { y: -200, x: x + rnd(-80, 80), rotation: rnd(-15, 15), duration: rnd(3.2, 5), delay: i * 0.12, ease: 'sine.in', onComplete: () => b.remove() });
    }
  };
  offs.push(() => document.querySelectorAll('.m-balloon').forEach(n => n.remove()));
  const SECRET = 'DEVOCRAT'; let typed = '';
  const onKey = e => {
    if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
    if (e.key.length !== 1) return;
    typed = (typed + e.key.toUpperCase()).slice(-SECRET.length);
    if (typed === SECRET) { typed = ''; party('You typed the secret word! 🎉'); }
  };
  document.addEventListener('keydown', onKey); offs.push(() => document.removeEventListener('keydown', onKey));
  let taps = 0, tapT = 0;
  const HELLO = ['Beep boop! 🤖', 'Hee hee, that tickles!', 'Keep going…', 'One more!'];
  bolt.querySelector('.m-bolt-btn').addEventListener('click', () => {
    taps++; clearTimeout(tapT); tapT = setTimeout(() => { taps = 0; }, 2000);
    gsap.fromTo(bolt.querySelector('svg'), { rotation: 0 }, { keyframes: { rotation: [-8, 8, -5, 0] }, duration: 0.4, transformOrigin: '50% 100%' });
    if (taps >= 5) { taps = 0; party('Five taps! Party time! 🎈'); } else say(HELLO[(taps - 1) % HELLO.length], 1400);
  });

  /* ---------- HERO: floating 3D toys (D5) ---------- */
  const hero = view.querySelector('.whero');
  if (hero) {
    const k = hero.querySelector('.kicker'), h = hero.querySelector('h1'), lead = hero.querySelector('.lead'), ht = hero.querySelector('.herotext'), obj = hero.querySelector('.hero-object');
    const intro = afterDialog(gsap.timeline({ delay: 0.3 }));
    if (ht) intro.from(ht, { scale: 0.6, opacity: 0, duration: 0.8, ease: 'back.out(2)' }, 0);
    if (k) intro.from(k, { y: -30, opacity: 0, duration: 0.5, ease: 'bounce.out' }, 0.3);
    if (h) intro.from(h, { y: 30, opacity: 0, duration: 0.7, ease: 'back.out(2)' }, 0.4);
    if (lead) intro.from(lead, { opacity: 0, y: 14, duration: 0.6 }, 0.7);
    if (obj) intro.from(obj, { y: 60, opacity: 0, duration: 1, ease: 'back.out(1.5)' }, 0.2);
    const cube = (letters, cols) => `<div class="m-cube">${['f', 'b', 'r', 'l', 't', 'd'].map((s, i) => `<span class="m-cf m-cf-${s}" style="--c:${cols[i % cols.length]}">${letters[i % letters.length]}</span>`).join('')}</div>`;
    const toys = [
      { html: cube(['A', '1', 'B', '★', 'C', '2'], ['#ff4d4d', '#ff9f1c', '#ff4d4d']), x: 9, y: 20, d: 1 },
      { html: cube(['B', '3', 'C', '♥', 'A', '4'], ['#4d9dff', '#7ac943', '#4d9dff']), x: 90, y: 22, d: 0.7 },
      { html: cube(['C', '5', 'A', '☺', 'B', '6'], ['#7ac943', '#ffd23f', '#7ac943']), x: 7, y: 74, d: 0.85 },
      { html: '<div class="m-ball"></div>', x: 84, y: 82, d: 0.6 },
      { html: `<svg class="m-star3d" viewBox="0 0 60 60"><path d="M30 3l8 18 19 2-14 13 4 19-17-10-17 10 4-19L3 23l19-2z" fill="#ffd23f" stroke="${NAVY}" stroke-width="3" stroke-linejoin="round"/></svg>`, x: 94, y: 56, d: 0.9 },
    ];
    const layer = document.createElement('div'); layer.className = 'm-toys'; layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML = toys.map((t, i) => `<div class="m-toy" style="left:${t.x}%;top:${t.y}%" data-i="${i}">${t.html}</div>`).join('');
    hero.appendChild(layer);
    const els = [...layer.querySelectorAll('.m-toy')].map((el, i) => ({ el, inner: el.firstElementChild, d: toys[i].d, ox: 0, oy: 0, vx: 0, vy: 0, seed: i * 1.9, rx: rnd(-30, 30), ry: rnd(0, 360) }));
    intro.from(els.map(e => e.el), { scale: 0, duration: 0.7, stagger: 0.1, ease: 'back.out(3)' }, 0.5);
    if (!reduce) offs.push(loop((dt, now) => {
      const hr = hero.getBoundingClientRect(); if (hr.bottom < 0) return;
      const t = now / 1000;
      els.forEach(e => {
        const r = e.el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const dx = cx - ptr.x, dy = cy - ptr.y, dist = Math.hypot(dx, dy) || 1, near = Math.max(0, 1 - dist / 180);
        // pushed away from the pointer, pulled gently home
        e.vx += (dx / dist) * near * 1.6 - e.ox * 0.04; e.vy += (dy / dist) * near * 1.6 - e.oy * 0.04;
        e.vx *= 0.86; e.vy *= 0.86; e.ox += e.vx; e.oy += e.vy;
        const fy = Math.sin(t * 1.2 + e.seed) * 12 * e.d;
        e.rx += dt * 0.02 * e.d + e.vy * 0.4; e.ry += dt * 0.03 * e.d + e.vx * 0.4;
        e.el.style.transform = `translate3d(${e.ox.toFixed(1)}px,${(e.oy + fy).toFixed(1)}px,0) scale(${(0.8 + e.d * 0.35).toFixed(2)})`;
        e.inner.style.transform = `rotateX(${e.rx.toFixed(1)}deg) rotateY(${e.ry.toFixed(1)}deg)`;
      });
    }));
  }

  /* ---------- HEADINGS: flipping toy tiles (T13, Kids version) ---------- */
  q('.wsection h2').forEach(h2 => {
    h2.setAttribute('aria-label', h2.textContent.trim());
    const chars = [];
    const walk = n => [...n.childNodes].forEach(c => {
      if (c.nodeType !== 3) return walk(c);
      const frag = document.createDocumentFragment();
      c.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        const w = document.createElement('span'); w.className = 'm-word'; w.setAttribute('aria-hidden', 'true');
        [...part].forEach(ch => { const s = document.createElement('span'); s.className = 'm-tile'; s.textContent = ch; w.appendChild(s); chars.push(s); });
        frag.appendChild(w);
      });
      c.replaceWith(frag);
    });
    walk(h2);
    const t = tl();
    chars.forEach((c, i) => {
      t.fromTo(c, { rotationY: -180, y: 10, '--tile': 1, '--tc': RAINBOW[i % RAINBOW.length], transformPerspective: 600 },
        { rotationY: 0, y: 0, duration: 0.6, ease: 'back.out(1.8)' }, i * 0.045)
        .to(c, { '--tile': 0, duration: 0.35, ease: 'power1.out' }, i * 0.045 + 0.55);
    });
    inOut(h2, t, 'top 88%', 'bottom 6%');
  });
  q('.wsection > .kicker, .wsection .labhead .kicker, .aboutgrid .kicker, .contactgrid .kicker').forEach(el => inOut(el, tl().from(el, { scale: 0, duration: 0.5, ease: 'back.out(3)' })));
  q('.wsection .wsub, .about-lead, .labnote, .formnote').forEach(p => inOut(p, tl().from(p, { opacity: 0, y: 14, duration: 0.6, ease: 'back.out(2)' })));
  const bounceIn = sel => {
    const els = gsap.utils.toArray(q(sel)); if (!els.length) return;
    els.forEach(el => { el.classList.add('m-pop'); el.dataset.mTamed = '1'; });
    inOut(els[0].parentElement, tl().fromTo(els, { opacity: 0, '--pop-s': 0.4, '--pop-y': '-80px' }, { opacity: 1, '--pop-s': 1, '--pop-y': '0px', duration: 0.9, stagger: 0.09, ease: 'bounce.out' }), 'top 84%');
  };
  bounceIn('.servicegrid .service'); bounceIn('.highlights .service'); bounceIn('.picker .project'); bounceIn('.team .tm');
  q('.devices, .contact-card.enquiry, .offer-soon').forEach(el => inOut(el, tl().from(el, { opacity: 0, y: 30, duration: 0.8, ease: 'back.out(1.6)' })));

  /* ---------- LEFT EDGE: a beanstalk that grows with the page (S19) ---------- */
  if (innerWidth >= 900 && !reduce) {
    const vine = own(document.createElement('div'), view); vine.className = 'm-vine'; vine.setAttribute('aria-hidden', 'true');
    vine.innerHTML = `<svg><path class="m-vine-stem"/><g class="m-vine-leaves"></g><g class="m-vine-flower"></g><g class="m-vine-bug"><ellipse rx="7" ry="6" fill="#ff4d4d" stroke="${NAVY}" stroke-width="2"/><path d="M0 -6v12" stroke="${NAVY}" stroke-width="1.5"/><circle cx="-3" cy="-1" r="1.4" fill="${NAVY}"/><circle cx="3" cy="2" r="1.4" fill="${NAVY}"/><circle cy="-7" r="3" fill="${NAVY}"/></g></svg>`;
    const svg = vine.querySelector('svg'), stem = vine.querySelector('.m-vine-stem'), leafG = vine.querySelector('.m-vine-leaves'), flower = vine.querySelector('.m-vine-flower'), bug = vine.querySelector('.m-vine-bug');
    let L = 1, leaves = [];
    const build = () => {
      const H = vine.clientHeight, W = vine.clientWidth, top = 90;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      let d = `M${W / 2} ${H + 4}`;
      for (let y = H; y > top; y -= 10) d += ` L${(W / 2 + Math.sin(y / 70) * 12).toFixed(1)} ${y.toFixed(1)}`;
      stem.setAttribute('d', d); L = stem.getTotalLength();
      stem.style.strokeDasharray = L;
      // one leaf for each section, placed where that section starts in the scroll
      const max = view.scrollHeight - view.clientHeight || 1;
      const secs = [...q('#worldView > section')].slice(1);
      leafG.innerHTML = ''; leaves = secs.map((s, i) => {
        const f = Math.min(0.95, Math.max(0.05, s.offsetTop / max)), pt = stem.getPointAtLength(L * f), side = i % 2 ? 1 : -1;
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${pt.x} ${pt.y})`);
        g.innerHTML = `<g class="m-leaf"><path d="M0 0 C${side * 10} -14 ${side * 26} -14 ${side * 30} -4 C${side * 22} 4 ${side * 8} 6 0 0Z" fill="${i % 3 === 2 ? '#ffd23f' : '#7ac943'}" stroke="${NAVY}" stroke-width="2"/></g>`;
        leafG.appendChild(g);
        const leaf = g.firstElementChild; gsap.set(leaf, { scale: 0, svgOrigin: '0 0' });
        return { f, leaf, on: false };
      });
      const tp = stem.getPointAtLength(L);
      flower.setAttribute('transform', `translate(${tp.x} ${tp.y})`);
      flower.innerHTML = `<g class="m-bloom">${Array.from({ length: 6 }, (_, i) => `<ellipse rx="7" ry="12" cy="-12" fill="${RAINBOW[i]}" stroke="${NAVY}" stroke-width="1.5" transform="rotate(${i * 60})"/>`).join('')}<circle r="7" fill="#ffd23f" stroke="${NAVY}" stroke-width="2"/></g>`;
      gsap.set(flower.firstElementChild, { scale: 0, svgOrigin: '0 0' });
      bloomOn = false; grow(true);
    };
    let bloomOn = false, shown = -1;
    const grow = force => {
      if (L <= 1) return; // not built yet
      const max = view.scrollHeight - view.clientHeight || 1, p = Math.min(1, view.scrollTop / max);
      if (!force && Math.abs(p - shown) < 0.0005) return; shown = p;
      const len = L * Math.max(0.02, p);
      stem.style.strokeDashoffset = L - len;
      const pt = stem.getPointAtLength(len); bug.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)}) rotate(${p > 0.98 ? 0 : 180})`);
      leaves.forEach(l => { const on = p >= l.f; if (on !== l.on) { l.on = on; gsap.to(l.leaf, { scale: on ? 1 : 0, duration: on ? 0.6 : 0.25, ease: on ? 'elastic.out(1, 0.5)' : 'power2.in' }); } });
      const b = p > 0.97; if (b !== bloomOn) { bloomOn = b; gsap.to(flower.firstElementChild, { scale: b ? 1 : 0, rotation: b ? 360 : 0, duration: b ? 0.9 : 0.3, ease: b ? 'back.out(2)' : 'power2.in' }); }
    };
    setTimeout(build, 900); addEventListener('resize', build); offs.push(() => removeEventListener('resize', build));
    offs.push(loop(() => grow(false)));
  }

  /* ---------- BUTTONS: gooey jelly (H5) ---------- */
  const defs = own(document.createElementNS('http://www.w3.org/2000/svg', 'svg'), view); defs.setAttribute('class', 'm-svg-defs'); defs.setAttribute('aria-hidden', 'true');
  defs.innerHTML = '<filter id="m-goo"><feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b"/><feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" result="g"/><feComposite in="SourceGraphic" in2="g" operator="atop"/></filter>';
  const gooify = btn => {
    if (btn.closest('.device') || btn.closest('.worldnav') || btn.classList.contains('m-goo-btn')) return;
    const col = getComputedStyle(btn).backgroundColor;
    btn.classList.add('m-goo-btn'); btn.style.setProperty('--goo', col);
    const goo = document.createElement('span'); goo.className = 'm-goo'; goo.setAttribute('aria-hidden', 'true');
    goo.innerHTML = '<i class="m-goo-pill"></i><i class="m-goo-dot"></i><i class="m-goo-dot"></i><i class="m-goo-dot"></i><i class="m-goo-dot"></i>';
    btn.prepend(goo);
    const dots = goo.querySelectorAll('.m-goo-dot');
    btn.addEventListener('pointerenter', () => {
      gsap.fromTo(btn, { '--jx': 1, '--jy': 1 }, { keyframes: [{ '--jx': 1.14, '--jy': 0.86, duration: 0.12 }, { '--jx': 0.94, '--jy': 1.08, duration: 0.12 }, { '--jx': 1, '--jy': 1, duration: 0.6, ease: 'elastic.out(1, 0.35)' }], overwrite: true });
      const w = btn.offsetWidth, h = btn.offsetHeight;
      dots.forEach((d, i) => {
        const side = i % 2 ? 1 : -1;
        gsap.fromTo(d, { x: 0, y: 0, scale: 1 }, { x: side * rnd(w * 0.25, w * 0.5), y: (i < 2 ? -1 : 1) * rnd(h * 0.45, h * 0.75), scale: rnd(0.6, 1), duration: 0.35, ease: 'power2.out', yoyo: true, repeat: 1, delay: i * 0.04 });
      });
    });
  };
  q('.cta').forEach(gooify);

  /* ---------- OFFERS: mini game — catch the stars (E4) ---------- */
  const offers = view.querySelector('#offers');
  if (offers) {
    const wrap = document.createElement('div'); wrap.className = 'm-game'; wrap.setAttribute('data-lenis-prevent', '');
    wrap.innerHTML = `<div class="m-game-hud"><b>⭐ <span class="m-g-score">0</span></b><b>⏱ <span class="m-g-time">30</span>s</b><b>🏆 Best <span class="m-g-best">0</span></b></div>
      <canvas aria-label="Catch the stars game" role="img"></canvas>
      <div class="m-game-cover"><h3>Catch the stars!</h3><p>Move the basket with your mouse, your finger or the ← → keys. Stars are 1 point, gems 2, hearts 3.</p><button type="button" class="cta m-game-play"><span class="m-game-play-t">▶ Play</span></button></div>`;
    offers.appendChild(wrap);
    const cv = wrap.querySelector('canvas'), g = cv.getContext('2d'), cover = wrap.querySelector('.m-game-cover'), playBtn = wrap.querySelector('.m-game-play');
    const elScore = wrap.querySelector('.m-g-score'), elTime = wrap.querySelector('.m-g-time'), elBest = wrap.querySelector('.m-g-best');
    gooify(playBtn);
    let best = 0; try { best = +localStorage.getItem('devo-kids-best') || 0; } catch (_) {}
    elBest.textContent = best;
    const dpr = Math.min(2, devicePixelRatio || 1); let W = 0, H = 0;
    const size = () => { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); draw(); };
    const G = { playing: false, score: 0, time: 30, items: [], pops: [], bx: 0, target: 0, acc: 0, keys: { l: 0, r: 0 } };
    const KINDS = [['⭐', 1, 0.75], ['💎', 2, 0.15], ['💖', 3, 0.1]];
    const draw = () => {
      const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#9fd6ff'); sky.addColorStop(1, '#e8f6ff');
      g.fillStyle = sky; g.fillRect(0, 0, W, H);
      g.fillStyle = '#7ac943'; g.fillRect(0, H - 14, W, 14);
      g.font = '28px serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      G.items.forEach(it => { g.save(); g.translate(it.x, it.y); g.rotate(it.rot); g.fillText(it.k[0], 0, 0); g.restore(); });
      // basket
      const bx = G.bx, by = H - 40;
      g.fillStyle = '#c97a2b'; g.strokeStyle = NAVY; g.lineWidth = 3;
      g.beginPath(); g.moveTo(bx - 48, by - 12); g.lineTo(bx + 48, by - 12); g.lineTo(bx + 38, by + 22); g.lineTo(bx - 38, by + 22); g.closePath(); g.fill(); g.stroke();
      g.strokeStyle = '#8a4f14'; g.lineWidth = 2; for (let i = -30; i <= 30; i += 15) { g.beginPath(); g.moveTo(bx + i, by - 10); g.lineTo(bx + i * 0.8, by + 20); g.stroke(); }
      g.fillStyle = ORANGE; g.fillRect(bx - 50, by - 16, 100, 8);
      g.font = '700 16px "Baloo 2", sans-serif';
      G.pops.forEach(p => { g.globalAlpha = Math.max(0, p.life); g.fillStyle = NAVY; g.fillText(p.t, p.x, p.y); });
      g.globalAlpha = 1;
    };
    const end = () => {
      G.playing = false; wrap.classList.remove('m-playing');
      if (G.score > best) { best = G.score; try { localStorage.setItem('devo-kids-best', best); } catch (_) {} elBest.textContent = best; }
      cover.querySelector('h3').textContent = G.score >= 25 ? `Wow! ${G.score} points! 🌟` : G.score >= 10 ? `Great job! ${G.score} points! 🎉` : `${G.score} points — try again! 💪`;
      cover.querySelector('p').textContent = `Your best is ${best}. Can you beat it?`;
      playBtn.querySelector('.m-game-play-t').textContent = '▶ Play again';
      gsap.fromTo(cover, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }); cover.hidden = false;
      if (G.score >= 25) party('Star catcher! 🌟');
    };
    const start = () => {
      Object.assign(G, { playing: true, score: 0, time: 30, items: [], pops: [], acc: 0, bx: W / 2, target: W / 2 });
      elScore.textContent = 0; elTime.textContent = 30; cover.hidden = true; wrap.classList.add('m-playing');
      say('Go go go! ⭐', 1500);
    };
    playBtn.addEventListener('click', start);
    const aim = e => { const r = cv.getBoundingClientRect(); G.target = Math.max(48, Math.min(W - 48, e.clientX - r.left)); };
    cv.addEventListener('pointermove', aim); cv.addEventListener('pointerdown', aim);
    const keyD = e => { if (!G.playing) return; if (e.key === 'ArrowLeft') { G.keys.l = 1; e.preventDefault(); } if (e.key === 'ArrowRight') { G.keys.r = 1; e.preventDefault(); } };
    const keyU = e => { if (e.key === 'ArrowLeft') G.keys.l = 0; if (e.key === 'ArrowRight') G.keys.r = 0; };
    addEventListener('keydown', keyD); addEventListener('keyup', keyU); offs.push(() => { removeEventListener('keydown', keyD); removeEventListener('keyup', keyU); });
    size(); addEventListener('resize', size); offs.push(() => removeEventListener('resize', size));
    offs.push(loop(dt => {
      if (!G.playing) return;
      G.time -= dt / 1000; elTime.textContent = Math.max(0, Math.ceil(G.time));
      if (G.time <= 0) { end(); draw(); return; }
      G.target = Math.max(48, Math.min(W - 48, G.target + (G.keys.r - G.keys.l) * dt * 0.6));
      G.bx += (G.target - G.bx) * 0.25;
      G.acc += dt; const every = 560 - (30 - G.time) * 8;
      if (G.acc > every) { G.acc = 0; const r = Math.random(); const k = r < KINDS[2][2] ? KINDS[2] : r < KINDS[2][2] + KINDS[1][2] ? KINDS[1] : KINDS[0]; G.items.push({ x: rnd(20, W - 20), y: -20, vy: rnd(0.12, 0.2) * (1 + (30 - G.time) / 45), rot: rnd(-0.4, 0.4), vr: rnd(-0.003, 0.003), k }); }
      const by = H - 52;
      G.items = G.items.filter(it => {
        it.y += it.vy * dt; it.rot += it.vr * dt;
        if (it.y > by - 6 && it.y < by + 20 && Math.abs(it.x - G.bx) < 50) { G.score += it.k[1]; elScore.textContent = G.score; G.pops.push({ x: it.x, y: by - 20, t: '+' + it.k[1], life: 1 }); return false; }
        return it.y < H + 30;
      });
      G.pops = G.pops.filter(p => { p.y -= dt * 0.05; p.life -= dt / 700; return p.life > 0; });
      draw();
    }));
    inOut(wrap, tl().from(wrap, { opacity: 0, y: 40, '--pop-s': 0.8, duration: 0.8, ease: 'back.out(1.6)' }), 'top 86%');
  }

  /* ---------- EVERYWHERE: hidden characters (E3) ---------- */
  const FRIENDS = [
    ['#services', '🐞', 'Ladybird', 'tr'], ['#offers', '🐸', 'Frog', 'bl'], ['#lab', '🐙', 'Octopus', 'tl'], ['#about', '🦊', 'Fox', 'br'], ['#contact', '🐢', 'Turtle', 'tr'],
  ];
  const found = new Set();
  FRIENDS.forEach(([sel, emo, name, corner], i) => {
    const sec = view.querySelector(sel); if (!sec) return;
    const f = document.createElement('button'); f.type = 'button'; f.className = 'm-friend m-friend-' + corner; f.dataset.v3decorated = '1';
    f.setAttribute('aria-label', `A hidden friend is peeking here — ${name}`);
    f.innerHTML = `<span>${emo}</span>`;
    sec.appendChild(f);
    f.addEventListener('click', () => {
      const first = !found.has(i); found.add(i);
      f.classList.add('m-found');
      gsap.fromTo(f.firstElementChild, { y: 0, rotation: 0 }, { keyframes: { y: [-46, 0], rotation: [0, 360] }, duration: 0.7, ease: 'power1.inOut' });
      if (first) say(found.size === FRIENDS.length ? `You found all ${FRIENDS.length} friends! 🏆` : `${emo} You found the ${name}! ${found.size}/${FRIENDS.length}`, 2400);
      if (first && found.size === FRIENDS.length) setTimeout(() => party('All friends found! 🎉'), 700);
    });
  });

  return () => offs.forEach(f => f());
});
