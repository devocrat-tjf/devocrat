/* ==========================================================================
   FUTURISTIC — "Tomorrow's tech, today"
   Section map (one signature per section, so effects never overlap):
     Entry ....... PIXEL DISSOLVE (W3): the universe breaks into squares that
                   rebuild as the world
     Hero ........ AURORA (A5): northern-light bands wave behind the headline
     Dive ........ ZOOM-THROUGH (S5): new section; the camera dives into the
                   words "INTO THE FUTURE" until a letter fills the screen
     Headings .... GLITCH RGB SPLIT (T11): titles glitch in with red/cyan copies,
                   and again on hover
     Services .... BENTO GRID (L6, Futuristic version): a HUD of tiles that
                   materialise from wireframes, with a live clock and a radar
     Offers ...... SPOTLIGHT / TORCH (C5): the section is dark; the pointer is a
                   torch that finds hidden messages
     Prototypes +
     About ....... 3D TILT WITH GLARE (H1): cards tilt toward the pointer with a
                   light reflection
     Hyperspace .. TUNNEL (D7, Futuristic version): new section; a starfield
                   jump — scroll faster to go faster
     Discuss ..... RGB-SPLIT IMAGE (D3): team photos split into colour layers on
                   hover and when you scroll fast
     Sound ....... CLICK AND HOVER SOUNDS (N2, Futuristic version): synth bleeps
     Theme ....... LIGHT AND DARK (P4): a day version, following the visitor's
                   device setting, with a switch
   Text for the new sections lives in content.js → FUTURE_COPY.
   ========================================================================== */
DevoMotion.world('future', api => {
  const { view, gsap, q, inOut, tl, afterDialog, finePointer, reduce, loop, own, ScrollTrigger } = api;
  const offs = [];
  const CYAN = '#00e5ff', MAG = '#ff2bd6', NIGHT = '#05060f';
  const C = window.FUTURE_COPY || (typeof FUTURE_COPY !== 'undefined' ? FUTURE_COPY : {});
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const CLICKABLE = 'a,button,select,summary,[role=button],[onclick],.project';

  /* ---------- SOUND: synth bleeps (N2, Futuristic version) ---------- */
  const sfx = (() => {
    let ac = null, on = true, unlocked = false;
    try { on = localStorage.getItem('devo-future-sfx') !== 'off'; } catch (_) {}
    const ctx = () => { if (!ac) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return null; ac = new A(); } if (ac.state === 'suspended') ac.resume(); return ac; };
    const ok = () => on && unlocked && !reduce && ctx();
    const tone = (a, t, type, f1, f2, dur, vol) => {
      const o = a.createOscillator(), g = a.createGain(); o.type = type;
      o.frequency.setValueAtTime(f1, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
    };
    return {
      get on() { return on; }, set(v) { on = v; try { localStorage.setItem('devo-future-sfx', v ? 'on' : 'off'); } catch (_) {} },
      unlock() { unlocked = true; ctx(); },
      blip() { const a = ok(); if (a) tone(a, a.currentTime, 'sine', 1500, 1900, 0.05, 0.03); },
      click() { const a = ok(); if (!a) return; const t = a.currentTime; tone(a, t, 'square', 880, 0, 0.04, 0.025); tone(a, t + 0.05, 'square', 1320, 0, 0.05, 0.025); },
      glitch() { const a = ok(); if (!a) return; const t = a.currentTime; for (let i = 0; i < 3; i++) tone(a, t + i * 0.03, 'sawtooth', rnd(200, 1200), rnd(100, 2000), 0.025, 0.015); },
      sweep() { const a = ok(); if (a) tone(a, a.currentTime, 'sine', 120, 1800, 0.9, 0.04); },
      close() { if (ac) { try { ac.close(); } catch (_) {} ac = null; } },
    };
  })();
  offs.push(() => sfx.close());

  /* ---------- THEME: light and dark (P4) ---------- */
  const mq = matchMedia('(prefers-color-scheme: light)');
  let saved = null; try { saved = localStorage.getItem('devo-future-theme'); } catch (_) {}
  let day = saved ? saved === 'day' : mq.matches;
  const hud = own(document.createElement('div'), view); hud.className = 'm-hud';
  hud.innerHTML = '<button type="button" class="m-hud-theme" data-v3decorated="1"></button><button type="button" class="m-hud-sfx" data-v3decorated="1"></button>';
  const tBtn = hud.querySelector('.m-hud-theme'), sBtn = hud.querySelector('.m-hud-sfx');
  const applyTheme = () => {
    view.classList.toggle('m-day', day);
    tBtn.textContent = day ? '◐ DAY MODE' : '◑ NIGHT MODE'; tBtn.setAttribute('aria-pressed', String(day));
    tBtn.title = 'Switch between day and night (follows your device setting until you choose)';
  };
  const paintSfx = () => { sBtn.textContent = sfx.on ? '♪ SFX ON' : '♪ SFX OFF'; sBtn.setAttribute('aria-pressed', String(sfx.on)); };
  applyTheme(); paintSfx();
  tBtn.addEventListener('click', () => { day = !day; try { localStorage.setItem('devo-future-theme', day ? 'day' : 'night'); } catch (_) {} applyTheme(); flash(); });
  sBtn.addEventListener('click', () => { sfx.unlock(); sfx.set(!sfx.on); paintSfx(); sfx.click(); });
  const onScheme = e => { let s = null; try { s = localStorage.getItem('devo-future-theme'); } catch (_) {} if (!s) { day = e.matches; applyTheme(); } };
  mq.addEventListener('change', onScheme);
  offs.push(() => { mq.removeEventListener('change', onScheme); view.classList.remove('m-day'); });
  const flash = () => { const f = document.createElement('div'); f.className = 'm-flash'; document.body.appendChild(f); gsap.fromTo(f, { opacity: 0.7 }, { opacity: 0, duration: 0.5, onComplete: () => f.remove() }); sfx.sweep(); };
  // sounds on hover and click
  let lastEl = null, lastT = 0;
  const onOver = e => { const el = e.target.closest && e.target.closest(CLICKABLE); if (!el || el === lastEl) { if (!el) lastEl = null; return; } lastEl = el; const n = performance.now(); if (n - lastT > 70) { lastT = n; sfx.blip(); } };
  const onDown = () => sfx.unlock();
  const onClick = e => { if (!e.target.closest('.m-hud') && e.target.closest(CLICKABLE)) sfx.click(); };
  view.addEventListener('pointerover', onOver); view.addEventListener('pointerdown', onDown, true); view.addEventListener('keydown', onDown, true); view.addEventListener('click', onClick);
  offs.push(() => { view.removeEventListener('pointerover', onOver); view.removeEventListener('pointerdown', onDown, true); view.removeEventListener('keydown', onDown, true); view.removeEventListener('click', onClick); });

  /* ---------- ENTRY: pixel dissolve (W3) ---------- */
  (() => {
    const cv = own(document.createElement('canvas')); cv.className = 'm-pixels'; cv.setAttribute('aria-hidden', 'true');
    const W = innerWidth, H = innerHeight, dpr = Math.min(2, devicePixelRatio || 1), S = W < 700 ? 22 : 30;
    cv.width = W * dpr; cv.height = H * dpr; const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cols = Math.ceil(W / S), rows = Math.ceil(H / S), cells = [];
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) cells.push({ x, y, r: Math.random() * 0.7 + (y / rows) * 0.3 });
    const inO = [...cells].sort((a, b) => a.r - b.r), outO = [...cells].sort((a, b) => (b.y - a.y) + (Math.random() - 0.5) * 6);
    const colour = () => { const r = Math.random(); return r < 0.06 ? CYAN : r < 0.1 ? MAG : r < 0.3 ? '#0b1022' : NIGHT; };
    const p = { a: 0, b: 0 }; let ia = 0, ib = 0;
    const paint = () => {
      const na = Math.floor(p.a * inO.length); for (; ia < na; ia++) { const c = inO[ia]; g.fillStyle = colour(); g.fillRect(c.x * S, c.y * S, S - 1, S - 1); }
      const nb = Math.floor(p.b * outO.length); for (; ib < nb; ib++) { const c = outO[ib]; g.clearRect(c.x * S - 1, c.y * S - 1, S + 1, S + 1); if (Math.random() < 0.08) { g.fillStyle = CYAN; g.globalAlpha = 0.4; g.fillRect(c.x * S, c.y * S, S - 1, S - 1); g.globalAlpha = 1; } }
    };
    view.style.visibility = 'hidden';
    gsap.timeline({ onComplete: () => cv.remove() })
      .to(p, { a: 1, duration: 0.55, ease: 'power1.in', onUpdate: paint })
      .add(() => { view.style.visibility = ''; g.fillStyle = NIGHT; g.fillRect(0, 0, W, H); })
      .to(p, { b: 1, duration: 0.8, ease: 'power1.out', onUpdate: paint }, '+=0.1')
      .to(cv, { opacity: 0, duration: 0.15 });
    offs.push(() => { view.style.visibility = ''; });
  })();

  /* ---------- HERO: aurora (A5) ---------- */
  const hero = view.querySelector('.whero');
  if (hero) {
    const k = hero.querySelector('.kicker'), h = hero.querySelector('h1'), lead = hero.querySelector('.lead'), obj = hero.querySelector('.hero-object');
    const intro = afterDialog(gsap.timeline({ delay: 1.3 }));
    if (k) intro.from(k, { opacity: 0, duration: 0.3, repeat: 2, yoyo: true, ease: 'steps(1)' }, 0);
    if (h) intro.from(h, { opacity: 0, y: 30, filter: 'blur(12px)', duration: 0.9, ease: 'power3.out', clearProps: 'filter' }, 0.15);
    if (lead) intro.from(lead, { opacity: 0, y: 14, duration: 0.7 }, 0.5);
    if (obj) intro.from(obj, { opacity: 0, scale: 0.85, duration: 1.2, ease: 'power3.out' }, 0.2);
    if (!reduce) {
      const cv = document.createElement('canvas'); cv.className = 'm-aurora'; cv.setAttribute('aria-hidden', 'true'); hero.prepend(cv);
      const g = cv.getContext('2d');
      const size = () => { cv.width = Math.max(1, Math.round(cv.clientWidth / 4)); cv.height = Math.max(1, Math.round(cv.clientHeight / 4)); };
      size(); addEventListener('resize', size); offs.push(() => removeEventListener('resize', size));
      const BANDS = [[CYAN, 0.25, 0.0, 0.9], ['#22ffa8', 0.38, 1.7, 0.7], [MAG, 0.5, 3.1, 0.6], ['#6a5bff', 0.32, 4.4, 0.5]];
      offs.push(loop((dt, now) => {
        const r = hero.getBoundingClientRect(); if (r.bottom < 0) return;
        const W = cv.width, H = cv.height, t = now / 1000;
        g.clearRect(0, 0, W, H); g.globalCompositeOperation = 'lighter';
        BANDS.forEach(([col, yb, ph, a]) => {
          const grad = g.createLinearGradient(0, 0, 0, H); grad.addColorStop(0, 'transparent'); grad.addColorStop(yb, col); grad.addColorStop(Math.min(1, yb + 0.35), 'transparent');
          g.fillStyle = grad; g.globalAlpha = a * (0.6 + 0.4 * Math.sin(t * 0.5 + ph));
          g.beginPath(); g.moveTo(0, H);
          for (let x = 0; x <= W; x += 4) { const y = H * yb + Math.sin(x / W * 6 + t * 0.6 + ph) * H * 0.08 + Math.sin(x / W * 13 - t * 0.9 + ph) * H * 0.04; g.lineTo(x, y); }
          g.lineTo(W, H); g.closePath(); g.fill();
        });
        g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
      }));
    }
  }

  /* ---------- DIVE: zoom-through (S5) ---------- */
  const services = view.querySelector('#services');
  if (services && C.dive) {
    const sec = document.createElement('section'); sec.className = 'wsection m-dive'; sec.id = 'dive'; sec.setAttribute('aria-label', C.dive.word);
    sec.innerHTML = `<div class="m-dive-stick"><div class="m-dive-bg"></div>
      <svg class="m-dive-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><mask id="m-dive-mask" maskUnits="userSpaceOnUse" x="-90000" y="-90000" width="180000" height="180000"><rect x="-90000" y="-90000" width="180000" height="180000" fill="#fff"/><text x="800" y="500" text-anchor="middle" font-family="Orbitron, sans-serif" font-weight="800" font-size="150" textLength="1440" lengthAdjust="spacingAndGlyphs" fill="#000">${C.dive.word}</text></mask></defs>
        <g class="m-dive-g"><rect x="-90000" y="-90000" width="180000" height="180000" class="m-dive-cover" mask="url(#m-dive-mask)"/></g></svg>
      <p class="m-dive-hint">${C.dive.hint} ↓</p></div>`;
    services.before(sec);
    const g = sec.querySelector('.m-dive-g'), bg = sec.querySelector('.m-dive-bg'), hint = sec.querySelector('.m-dive-hint');
    // Dive into the middle of the first letter's stroke. The word is drawn the same way on a
    // hidden canvas, and the first solid run of pixels across the middle line is the target.
    const findTarget = () => {
      const c = document.createElement('canvas'); c.width = 1600; c.height = 900; const x = c.getContext('2d');
      x.font = '800 150px Orbitron, sans-serif'; const w = x.measureText(C.dive.word).width || 1440;
      x.translate(800, 0); x.scale(1440 / w, 1); x.textAlign = 'center'; x.fillText(C.dive.word, 0, 500);
      const y = 445, row = x.getImageData(0, y, 1600, 1).data;
      let s = -1;
      for (let i = 0; i < 1600; i++) { const on = row[i * 4 + 3] > 128; if (on && s < 0) s = i; if (!on && s >= 0) return [(s + i) / 2, y]; }
      return [800, 450];
    };
    const build = () => {
      const [ox, oy] = findTarget();
      gsap.timeline({ scrollTrigger: { trigger: sec, scroller: view, start: 'top top', end: 'bottom bottom', scrub: 0.6 } })
        .to(hint, { opacity: 0, duration: 0.1 }, 0)
        .fromTo(g, { scale: 1, svgOrigin: `${ox} ${oy}` }, { scale: 160, svgOrigin: `${ox} ${oy}`, duration: 0.8, ease: 'power3.in' }, 0)
        // slide the target letter to the centre of the screen while zooming
        .fromTo(g, { x: 0, y: 0 }, { x: 800 - ox, y: 450 - oy, duration: 0.45, ease: 'power2.inOut' }, 0)
        .to(bg, { opacity: 0, duration: 0.2 }, 0.8);
    };
    // wait for the Orbitron font so the measurement matches; this runs later, so it gets its own cleanup
    let diveCtx = null, diveAlive = true;
    const start = () => { if (diveAlive && !diveCtx) diveCtx = gsap.context(build, view); };
    (document.fonts && document.fonts.load ? document.fonts.load('800 150px Orbitron') : Promise.resolve()).then(start, start);
    offs.push(() => { diveAlive = false; if (diveCtx) diveCtx.revert(); });
  }

  /* ---------- HEADINGS: glitch RGB split (T11) ---------- */
  const glitchers = [];
  q('.wsection h2').forEach(h2 => {
    h2.classList.add('m-glitch'); h2.dataset.text = h2.textContent.trim();
    const kick = (ms = 650) => { h2.classList.remove('m-glitching'); void h2.offsetWidth; h2.classList.add('m-glitching'); clearTimeout(h2._gt); h2._gt = setTimeout(() => h2.classList.remove('m-glitching'), ms); sfx.glitch(); };
    glitchers.push(h2);
    inOut(h2, tl().from(h2, { opacity: 0, duration: 0.4, ease: 'steps(4)', onStart: () => kick() }), 'top 88%', 'bottom 6%');
    h2.addEventListener('pointerenter', () => kick(400));
  });
  // now and then a visible title glitches by itself
  let idleT = 0;
  const idle = () => { const vis = glitchers.filter(h => { const r = h.getBoundingClientRect(); return r.top > 60 && r.bottom < innerHeight; }); if (vis.length) { const h = vis[Math.floor(Math.random() * vis.length)]; h.classList.add('m-glitching'); setTimeout(() => h.classList.remove('m-glitching'), 300); } idleT = setTimeout(idle, rnd(5000, 9000)); };
  idleT = setTimeout(idle, 6000); offs.push(() => { clearTimeout(idleT); glitchers.forEach(h => clearTimeout(h._gt)); });
  q('.wsection > .kicker, .wsection .labhead .kicker, .aboutgrid .kicker, .contactgrid .kicker, .wsection .wsub, .about-lead, .labnote, .formnote').forEach(el => inOut(el, tl().from(el, { opacity: 0, x: -16, duration: 0.5, ease: 'power2.out' })));

  /* ---------- SERVICES: HUD bento grid (L6, Futuristic version) ---------- */
  const grid = view.querySelector('#services .servicegrid');
  if (grid && C.bento) {
    grid.classList.add('m-hud-bento');
    const svcs = [...grid.querySelectorAll('.service')];
    const B = C.bento;
    const deco = (cls, html) => { const d = document.createElement('div'); d.className = 'service m-deco ' + cls; d.setAttribute('aria-hidden', cls === 'm-deco-tag' ? 'false' : 'true'); d.innerHTML = html; return d; };
    const clock = deco('m-deco-clock', `<small>${B.clock}</small><b class="m-clock">--:--:--</b><span class="m-clock-bar"><i></i></span>`);
    const radar = deco('m-deco-radar', `<small>${B.radar}</small><div class="m-radar"><i class="m-sweep"></i><b style="--x:30%;--y:40%"></b><b style="--x:65%;--y:62%"></b><b style="--x:52%;--y:24%"></b></div>`);
    const tag = deco('m-deco-tag', `<small>/// SYSTEM</small><h3>${B.tag}</h3><p>${B.tagText}</p>`);
    // order: big service, wide service, clock, radar, service, wide service, tagline
    const order = [svcs[0], svcs[1], clock, radar, svcs[2], svcs[3], tag].filter(Boolean);
    order.forEach((el, i) => { el.classList.add('m-b' + i); grid.appendChild(el); });
    const tick = () => { const d = new Date(); clock.querySelector('.m-clock').textContent = d.toTimeString().slice(0, 8); clock.querySelector('.m-clock-bar i').style.width = (d.getSeconds() / 59 * 100).toFixed(1) + '%'; };
    tick(); const clockT = setInterval(tick, 1000); offs.push(() => clearInterval(clockT));
    const tiles = [...grid.children];
    tiles.forEach(t => { t.dataset.mTamed = '1'; });
    const shuffled = [...tiles].sort(() => Math.random() - 0.5);
    const t = tl()
      .fromTo(shuffled, { clipPath: 'polygon(50% 50%,50% 50%,50% 50%,50% 50%)', opacity: 0.3 }, { clipPath: 'polygon(0 0,calc(100% - 18px) 0,100% 18px,100% 100%,18px 100%,0 calc(100% - 18px))', opacity: 1, duration: 0.55, stagger: 0.08, ease: 'power3.out' })
      .from(shuffled.map(e => [...e.children]).flat(), { opacity: 0, y: 8, duration: 0.3, stagger: 0.02 }, 0.3);
    inOut(grid, t, 'top 82%');
  }

  /* ---------- OFFERS: torch (C5) ---------- */
  const offers = view.querySelector('#offers');
  if (offers && C.torch) {
    offers.classList.add('m-torch');
    const T = C.torch;
    const spots = [[12, 30], [70, 22], [40, 70], [84, 66], [22, 84]];
    const layer = document.createElement('div'); layer.className = 'm-torch-layer'; layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML = T.secrets.map((s, i) => `<span class="m-secret" style="left:${spots[i % spots.length][0]}%;top:${spots[i % spots.length][1]}%">${s}</span>`).join('') + '<div class="m-torch-dark"></div>';
    offers.appendChild(layer);
    const hint = document.createElement('p'); hint.className = 'm-torch-hint wsub'; hint.textContent = T.hint; offers.appendChild(hint);
    const pos = { x: 0.5, y: 0.5 }, aim = { x: 0.5, y: 0.5 }; let user = false, userT = 0;
    const onMove = e => { const r = offers.getBoundingClientRect(); aim.x = (e.clientX - r.left) / r.width; aim.y = (e.clientY - r.top) / r.height; user = true; userT = performance.now(); };
    offers.addEventListener('pointermove', onMove); offers.addEventListener('pointerdown', onMove);
    offs.push(() => { offers.removeEventListener('pointermove', onMove); offers.removeEventListener('pointerdown', onMove); });
    offs.push(loop((dt, now) => {
      const r = offers.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      if (!user || now - userT > 3000) { user = false; const t = now / 1000; aim.x = 0.5 + Math.sin(t * 0.5) * 0.38; aim.y = 0.5 + Math.sin(t * 0.8) * 0.3; }
      pos.x += (aim.x - pos.x) * 0.12; pos.y += (aim.y - pos.y) * 0.12;
      offers.style.setProperty('--tx', (pos.x * 100).toFixed(2) + '%'); offers.style.setProperty('--ty', (pos.y * 100).toFixed(2) + '%');
    }));
  }

  /* ---------- PROTOTYPES + ABOUT: 3D tilt with glare (H1) ---------- */
  const tilt = sel => {
    const els = gsap.utils.toArray(q(sel)); if (!els.length) return;
    els.forEach(el => {
      el.classList.add('m-tilt', 'm-pop'); el.dataset.mTamed = '1';
      if (!finePointer) return;
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        gsap.to(el, { '--rx': ((0.5 - y) * 14).toFixed(2) + 'deg', '--ry': ((x - 0.5) * 16).toFixed(2) + 'deg', '--gx': (x * 100).toFixed(1) + '%', '--gy': (y * 100).toFixed(1) + '%', '--ga': 1, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
      });
      el.addEventListener('pointerleave', () => gsap.to(el, { '--rx': '0deg', '--ry': '0deg', '--ga': 0, duration: 0.6, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' }));
    });
    inOut(els[0].parentElement, tl().fromTo(els, { opacity: 0, '--pop-y': '40px' }, { opacity: 1, '--pop-y': '0px', duration: 0.6, stagger: 0.08, ease: 'power3.out' }), 'top 84%');
  };
  tilt('.picker .project'); tilt('.highlights .service');
  q('.devices, .contact-card.enquiry, .offer-soon').forEach(el => inOut(el, tl().from(el, { opacity: 0, y: 30, duration: 0.7, ease: 'power3.out' })));

  /* ---------- HYPERSPACE: starfield jump (D7, Futuristic version) ---------- */
  const about = view.querySelector('#about');
  if (about && C.warp) {
    const sec = document.createElement('section'); sec.className = 'wsection m-warp'; sec.id = 'warp';
    sec.innerHTML = `<div class="m-warp-stick"><canvas aria-hidden="true"></canvas><div class="m-warp-text"><div class="kicker">${C.warp.kicker}</div><h2>${C.warp.title}</h2><p class="wsub">${C.warp.text}</p></div><div class="m-warp-read" aria-hidden="true">WARP <b>1.0</b></div><div class="m-warp-flash"></div></div>`;
    about.before(sec);
    const cv = sec.querySelector('canvas'), g = cv.getContext('2d'), read = sec.querySelector('.m-warp-read b'), wflash = sec.querySelector('.m-warp-flash');
    const h2 = sec.querySelector('h2'); h2.classList.add('m-glitch'); h2.dataset.text = h2.textContent;
    let W = 0, H = 0; const dpr = Math.min(2, devicePixelRatio || 1);
    const size = () => { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener('resize', size); offs.push(() => removeEventListener('resize', size));
    const stars = Array.from({ length: 420 }, () => ({ x: rnd(-1, 1), y: rnd(-1, 1), z: rnd(0.05, 1), c: Math.random() < 0.15 ? MAG : Math.random() < 0.4 ? CYAN : '#ffffff' }));
    let speed = 0.002, prog = 0, jumped = false;
    ScrollTrigger.create({ trigger: sec, scroller: view, start: 'top top', end: 'bottom bottom', onUpdate: s => {
      prog = s.progress;
      if (prog > 0.82 && !jumped) { jumped = true; gsap.fromTo(wflash, { opacity: 0.9 }, { opacity: 0, duration: 0.9 }); sfx.sweep(); }
      if (prog < 0.6) jumped = false;
    } });
    offs.push(loop(dt => {
      const r = sec.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      const v = Math.abs((api.lenis && api.lenis.velocity) || 0);
      const target = 0.0015 + v * 0.0009 + prog * 0.01;
      speed += (target - speed) * 0.06;
      read.textContent = (1 + speed * 600).toFixed(1);
      g.fillStyle = 'rgba(5,6,15,0.55)'; g.fillRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2, F = Math.max(W, H) * 0.6;
      g.lineCap = 'round';
      stars.forEach(s => {
        const pz = s.z; s.z -= speed * dt * 0.06;
        if (s.z <= 0.02) { s.x = rnd(-1, 1); s.y = rnd(-1, 1); s.z = 1; return; }
        const x1 = cx + (s.x / pz) * F * 0.25, y1 = cy + (s.y / pz) * F * 0.25, x2 = cx + (s.x / s.z) * F * 0.25, y2 = cy + (s.y / s.z) * F * 0.25;
        g.strokeStyle = s.c; g.globalAlpha = clamp(1.2 - s.z); g.lineWidth = Math.max(0.6, (1 - s.z) * 2.6);
        g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
      });
      g.globalAlpha = 1;
    }));
  }

  /* ---------- DISCUSS: RGB-split team photos (D3) ---------- */
  const imgs = [...q('.team .tm-frame img')];
  if (imgs.length && !reduce) {
    const defs = own(document.createElementNS('http://www.w3.org/2000/svg', 'svg'), view); defs.setAttribute('class', 'm-svg-defs'); defs.setAttribute('aria-hidden', 'true');
    defs.innerHTML = `<filter id="m-rgb" x="-5%" y="0" width="110%" height="100%" color-interpolation-filters="sRGB">
      <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r"/><feOffset in="r" class="m-rgb-r" dx="0" result="ro"/>
      <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g"/>
      <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b"/><feOffset in="b" class="m-rgb-b" dx="0" result="bo"/>
      <feBlend mode="screen" in="ro" in2="g" result="rg"/><feBlend mode="screen" in="rg" in2="bo"/></filter>`;
    const offR = defs.querySelector('.m-rgb-r'), offB = defs.querySelector('.m-rgb-b');
    const split = { k: 0, hover: 0 };
    let active = new Set();
    imgs.forEach(img => {
      const fr = img.closest('.tm-frame');
      fr.addEventListener('pointerenter', () => { active.add(img); gsap.to(split, { hover: 1, duration: 0.3 }); });
      fr.addEventListener('pointerleave', () => { active.delete(img); if (!active.size) gsap.to(split, { hover: 0, duration: 0.4 }); });
    });
    offs.push(loop(() => {
      const v = Math.abs((api.lenis && api.lenis.velocity) || 0);
      const target = Math.max(split.hover * (6 + Math.random() * 4), Math.min(14, v * 0.6));
      split.k += (target - split.k) * 0.25;
      const k = split.k < 0.3 ? 0 : split.k;
      offR.setAttribute('dx', (-k).toFixed(2)); offB.setAttribute('dx', k.toFixed(2));
      imgs.forEach(img => { const on = k > 0 && (active.has(img) || v > 2); if (img._mRgb !== on) { img._mRgb = on; img.style.filter = on ? 'url(#m-rgb)' : ''; } });
    }));
  }

  return () => offs.forEach(f => f());
}, { customEnter: true });
