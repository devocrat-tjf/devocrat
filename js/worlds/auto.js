/* ==========================================================================
   AUTOMOTIVE — "Engineered for speed"
   Section map (one signature per section, so effects never overlap):
     Entry ....... LOADER WITH COUNTER (W6): a rev counter climbs 0 → 100, then
                   five start lights go out and the world launches
     Headings .... SPLIT-FLAP BOARD (T10): titles clatter in like a departure board
     Sections .... CURTAIN AND WIPE REVEALS (S7): a racing-stripe panel wipes off
                   each section as it arrives
     Services .... DASHBOARD COCKPIT (L8): services become gauges; the chosen one
                   revs and its details show on the centre display
     360° view ... IMAGE SEQUENCE SCRUB (S3): new section; 48 rendered frames of a
                   car on a turntable play forward and back with the scroll
     Tunnel ...... TUNNEL (D7, Automotive version): new section; drive through a
                   lit night tunnel — scroll faster to go faster
     Buttons ..... ENGINE-REV BUTTON (H11): the button shakes and its little
                   needle revs to the red line
     Pointer ..... TYRE MARKS (C13): fast pointer moves leave fading skid marks
     Phones ...... PHONE VIBRATION (N3, Automotive version): engine-rev buzzes
   Text for the new sections lives in content.js → AUTO_COPY.
   ========================================================================== */
DevoMotion.world('auto', api => {
  const { view, gsap, q, inOut, tl, afterDialog, finePointer, reduce, loop, own, ScrollTrigger } = api;
  const offs = [];
  const RED = '#e10600', AMBER = '#ffb400', INK = '#0e0e10', STEEL = '#f2f2f2';
  const C = window.AUTO_COPY || (typeof AUTO_COPY !== 'undefined' ? AUTO_COPY : {});
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const coarse = matchMedia('(pointer:coarse)').matches;
  const timers = new Set();
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };
  offs.push(() => timers.forEach(clearTimeout));

  /* ---------- PHONES: engine-rev haptics (N3, Automotive version) ---------- */
  const canBuzz = 'vibrate' in navigator && coarse;
  let buzzOn = true; try { buzzOn = localStorage.getItem('devo-auto-buzz') !== 'off'; } catch (_) {}
  const buzz = p => { if (canBuzz && buzzOn) try { navigator.vibrate(p); } catch (_) {} };
  const REV = [8, 16, 8, 16, 26], RUMBLE = [30, 18, 30, 18, 30, 18, 70];
  if (canBuzz) {
    const chip = own(document.createElement('button'), view); chip.type = 'button'; chip.className = 'm-haptics'; chip.dataset.v3decorated = '1';
    const paint = () => { chip.textContent = buzzOn ? 'HAPTICS · ON' : 'HAPTICS · OFF'; chip.setAttribute('aria-pressed', String(buzzOn)); };
    paint();
    chip.addEventListener('click', () => { buzzOn = !buzzOn; try { localStorage.setItem('devo-auto-buzz', buzzOn ? 'on' : 'off'); } catch (_) {} paint(); buzz(REV); });
    const onTap = e => { if (e.pointerType !== 'mouse' && e.target.closest('a,button,[role=button],.project') && !e.target.closest('.m-haptics,.m-gauge')) buzz(REV); };
    view.addEventListener('pointerdown', onTap); offs.push(() => view.removeEventListener('pointerdown', onTap));
  }

  /* ---------- ENTRY: rev counter loader + start lights (W6) ---------- */
  (() => {
    const ov = own(document.createElement('div')); ov.className = 'm-revload'; ov.setAttribute('aria-hidden', 'true');
    const ticks = Array.from({ length: 11 }, (_, i) => { const a = (-225 + i * 27) * Math.PI / 180; const r1 = 104, r2 = i % 2 ? 94 : 88; return `<line x1="${(150 + r1 * Math.cos(a)).toFixed(1)}" y1="${(150 + r1 * Math.sin(a)).toFixed(1)}" x2="${(150 + r2 * Math.cos(a)).toFixed(1)}" y2="${(150 + r2 * Math.sin(a)).toFixed(1)}" stroke="${i >= 8 ? RED : STEEL}" stroke-width="${i % 2 ? 2 : 4}"/><text x="${(150 + 74 * Math.cos(a)).toFixed(1)}" y="${(155 + 74 * Math.sin(a)).toFixed(1)}" text-anchor="middle">${i}</text>`; }).join('');
    ov.innerHTML = `<div class="m-revload-in"><svg viewBox="0 0 300 300"><circle cx="150" cy="150" r="118" fill="#141416" stroke="#34343a" stroke-width="4"/>
      <path d="M${(150 + 110 * Math.cos(-225 * Math.PI / 180 + 8 * 27 * Math.PI / 180)).toFixed(1)} ${(150 + 110 * Math.sin(-225 * Math.PI / 180 + 8 * 27 * Math.PI / 180)).toFixed(1)} A110 110 0 0 1 ${(150 + 110 * Math.cos(45 * Math.PI / 180)).toFixed(1)} ${(150 + 110 * Math.sin(45 * Math.PI / 180)).toFixed(1)}" fill="none" stroke="${RED}" stroke-width="7"/>
      <g font-family="Oswald" font-size="15" fill="${STEEL}">${ticks}</g>
      <g class="m-rl-needle"><path d="M150 150 L150 50" stroke="${RED}" stroke-width="4" stroke-linecap="round"/></g><circle cx="150" cy="150" r="12" fill="${INK}" stroke="${STEEL}" stroke-width="3"/>
      <text class="m-rl-num" x="150" y="214" text-anchor="middle">000</text><text x="150" y="234" text-anchor="middle" class="m-rl-unit">RPM ×100 · LOADING</text></svg>
      <div class="m-lights">${'<i></i>'.repeat(5)}</div><p class="m-go">GO!</p></div>`;
    const needle = ov.querySelector('.m-rl-needle'), num = ov.querySelector('.m-rl-num'), lights = ov.querySelectorAll('.m-lights i'), go = ov.querySelector('.m-go');
    view.style.visibility = 'hidden';
    const c = { v: 0 };
    gsap.set(needle, { rotation: -135, svgOrigin: '150 150' });
    // waits for the language question (if shown), so the countdown is actually seen
    const t = afterDialog(gsap.timeline({ onComplete: () => ov.remove() }));
    t.from(ov.querySelector('.m-revload-in'), { scale: 0.8, opacity: 0, duration: 0.3 })
      .to(c, { v: 100, duration: 1.3, ease: 'power2.in', onUpdate: () => { num.textContent = String(Math.round(c.v)).padStart(3, '0'); gsap.set(needle, { rotation: -135 + c.v * 2.7 + (c.v > 85 ? Math.random() * 4 - 2 : 0) }); } })
      .to(lights, { backgroundColor: RED, boxShadow: `0 0 24px ${RED}`, duration: 0.05, stagger: 0.14 }, '-=0.6')
      .to(lights, { backgroundColor: '#2a2a2e', boxShadow: '0 0 0 transparent', duration: 0.05 }, '+=0.25')
      .fromTo(go, { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25, ease: 'back.out(3)' }, '<')
      .add(() => { view.style.visibility = ''; buzz(RUMBLE); })
      .to(ov, { xPercent: 110, skewX: -14, duration: 0.55, ease: 'power3.in' }, '+=0.15');
    offs.push(() => { view.style.visibility = ''; });
  })();

  /* ---------- HERO intro ---------- */
  const hero = view.querySelector('.whero');
  if (hero) {
    const k = hero.querySelector('.kicker'), h = hero.querySelector('h1'), lead = hero.querySelector('.lead'), obj = hero.querySelector('.hero-object');
    const intro = afterDialog(gsap.timeline({ delay: 2.7 }));
    if (k) intro.from(k, { x: -60, opacity: 0, duration: 0.5, ease: 'power3.out' }, 0);
    if (h) intro.from(h, { x: -120, skewX: -20, opacity: 0, duration: 0.7, ease: 'power4.out' }, 0.05);
    if (lead) intro.from(lead, { x: -40, opacity: 0, duration: 0.6 }, 0.3);
    if (obj) intro.from(obj, { x: 300, opacity: 0, duration: 0.9, ease: 'power4.out' }, 0.1);
  }

  /* ---------- HEADINGS: split-flap board (T10) ---------- */
  const CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  q('.wsection h2').forEach(h2 => {
    const label = h2.textContent.trim(); h2.setAttribute('aria-label', label); h2.classList.add('m-board');
    const tiles = [];
    const walk = n => [...n.childNodes].forEach(c => {
      if (c.nodeType !== 3) return walk(c);
      const frag = document.createDocumentFragment();
      c.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
        const w = document.createElement('span'); w.className = 'm-word'; w.setAttribute('aria-hidden', 'true');
        [...part.toUpperCase()].forEach(ch => { const s = document.createElement('span'); s.className = 'm-flap'; s.dataset.c = ch; s.textContent = ' '; w.appendChild(s); tiles.push(s); });
        frag.appendChild(w);
      });
      c.replaceWith(frag);
    });
    walk(h2);
    let run = [];
    const stop = () => { run.forEach(clearTimeout); run.forEach(t => timers.delete(t)); run = []; };
    const flip = (s, ch) => { s.textContent = ch; s.classList.remove('m-flipping'); void s.offsetWidth; s.classList.add('m-flipping'); };
    const play = () => {
      stop();
      tiles.forEach((s, i) => {
        const n = reduce ? 0 : 3 + ((i * 7) % 5);
        for (let k = 0; k < n; k++) run.push(later(() => flip(s, CH[Math.floor(Math.random() * CH.length)]), i * 35 + k * 60));
        run.push(later(() => flip(s, s.dataset.c), i * 35 + n * 60));
      });
    };
    const blank = () => { stop(); tiles.forEach(s => { s.textContent = ' '; s.classList.remove('m-flipping'); }); };
    ScrollTrigger.create({ trigger: h2, scroller: view, start: 'top 88%', onEnter: play, onEnterBack: play, onLeaveBack: blank });
  });
  q('.wsection > .kicker, .wsection .labhead .kicker, .aboutgrid .kicker, .contactgrid .kicker, .wsection .wsub, .about-lead, .labnote, .formnote').forEach(el => inOut(el, tl().from(el, { x: -40, opacity: 0, duration: 0.5, ease: 'power3.out' })));

  /* ---------- SECTIONS: racing-stripe wipe reveals (S7) ---------- */
  ['#services', '#offers', '#lab', '#about', '#contact'].forEach((sel, i) => {
    const sec = view.querySelector(sel); if (!sec) return;
    sec.classList.add('m-wipe-host');
    const p = document.createElement('div'); p.className = 'm-wipe-panel' + (i % 2 ? ' m-wipe-r' : ''); p.setAttribute('aria-hidden', 'true');
    p.innerHTML = '<i></i><i></i>';
    sec.appendChild(p);
    inOut(sec, tl().fromTo(p, { xPercent: 0 }, { xPercent: i % 2 ? -125 : 125, duration: 0.9, ease: 'power3.inOut' }), 'top 82%', 'bottom -40%', 2.4);
  });
  const slide = sel => {
    const els = gsap.utils.toArray(q(sel)); if (!els.length) return;
    els.forEach(el => { el.classList.add('m-pop'); el.dataset.mTamed = '1'; });
    inOut(els[0].parentElement, tl().fromTo(els, { opacity: 0, '--pop-x': '-80px' }, { opacity: 1, '--pop-x': '0px', duration: 0.6, stagger: 0.07, ease: 'power3.out' }), 'top 80%');
  };
  slide('.highlights .service'); slide('.picker .project'); slide('.team .tm');

  /* ---------- SERVICES: dashboard cockpit (L8) ---------- */
  const grid = view.querySelector('#services .servicegrid');
  if (grid) {
    const svcs = [...grid.querySelectorAll('.service')].map(s => ({ icon: s.querySelector('i')?.textContent || '', title: s.querySelector('h3')?.textContent || '', text: s.querySelector('p')?.textContent || '' }));
    grid.classList.add('m-sr-only');
    const gauge = (s, i) => {
      const ticks = Array.from({ length: 21 }, (_, k) => { const a = (-225 + k * 13.5) * Math.PI / 180, r2 = k % 5 ? 76 : 70; return `<line x1="${(100 + 82 * Math.cos(a)).toFixed(1)}" y1="${(100 + 82 * Math.sin(a)).toFixed(1)}" x2="${(100 + r2 * Math.cos(a)).toFixed(1)}" y2="${(100 + r2 * Math.sin(a)).toFixed(1)}" stroke="${k >= 16 ? RED : '#bdbdc4'}" stroke-width="${k % 5 ? 1.5 : 3}"/>`; }).join('');
      return `<button type="button" class="m-gauge" data-i="${i}" aria-label="${s.title}" data-v3decorated="1"><svg viewBox="0 0 200 200" aria-hidden="true">
        <circle cx="100" cy="100" r="94" fill="#111113" stroke="#3a3a40" stroke-width="5"/><circle cx="100" cy="100" r="88" fill="none" stroke="#1f1f23" stroke-width="2"/>${ticks}
        <text x="100" y="62" text-anchor="middle" class="m-g-icon">${s.icon}</text><text x="100" y="146" text-anchor="middle" class="m-g-num">0${i + 1}</text>
        <g class="m-g-needle"><path d="M100 100 L100 30" stroke="${RED}" stroke-width="3.5" stroke-linecap="round"/><path d="M100 100 L100 112" stroke="${RED}" stroke-width="6" stroke-linecap="round"/></g>
        <circle cx="100" cy="100" r="9" fill="${INK}" stroke="#bdbdc4" stroke-width="2.5"/></svg><span class="m-g-label">${s.title}</span></button>`;
    };
    const dash = document.createElement('div'); dash.className = 'm-dash';
    dash.innerHTML = `<div class="m-dash-gauges">${svcs.map(gauge).join('')}</div>
      <div class="m-mfd" aria-live="polite"><div class="m-mfd-top"><span>DEVOCRAT DRIVE · MODE</span><span class="m-mfd-n"></span></div><h3></h3><p></p><div class="m-mfd-bars">${'<i></i>'.repeat(12)}</div></div>`;
    grid.after(dash);
    const gauges = [...dash.querySelectorAll('.m-gauge')], needles = gauges.map(g => g.querySelector('.m-g-needle'));
    const mfd = dash.querySelector('.m-mfd'), mH = mfd.querySelector('h3'), mP = mfd.querySelector('p'), mN = mfd.querySelector('.m-mfd-n'), bars = mfd.querySelectorAll('.m-mfd-bars i');
    needles.forEach(n => gsap.set(n, { rotation: -135, svgOrigin: '100 100' }));
    let sel = -1, idle = null;
    const select = (i, silent) => {
      if (i === sel) return; sel = i;
      gauges.forEach((g, k) => g.classList.toggle('m-on', k === i));
      needles.forEach((n, k) => gsap.to(n, { rotation: k === i ? 100 : -95, duration: k === i ? 0.5 : 0.8, ease: k === i ? 'back.out(2.5)' : 'power2.out', overwrite: true }));
      if (idle) idle.kill();
      idle = gsap.to(needles[i], { rotation: '+=6', duration: 0.09, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 0.5 });
      mN.textContent = `0${i + 1} / 0${svcs.length}`; mH.textContent = svcs[i].title; mP.textContent = svcs[i].text;
      gsap.fromTo([mH, mP], { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.35, stagger: 0.05 });
      gsap.fromTo(bars, { scaleY: 0.1 }, { scaleY: (k) => 0.3 + ((k * 7 + i * 3) % 10) / 12, duration: 0.4, stagger: 0.02, ease: 'power2.out', transformOrigin: '50% 100%' });
      if (!silent) buzz(RUMBLE);
    };
    gauges.forEach((g, i) => { g.addEventListener('pointerenter', () => select(i)); g.addEventListener('focus', () => select(i)); g.addEventListener('click', () => select(i)); });
    offs.push(() => idle && idle.kill());
    // ignition: every needle sweeps to the top and back, then the first service is chosen
    const ign = tl().from(dash, { opacity: 0, y: 40, duration: 0.6, ease: 'power3.out' })
      .to(needles, { rotation: 135, duration: 0.55, ease: 'power2.inOut', stagger: 0.05 }, 0.3)
      .to(needles, { rotation: -95, duration: 0.6, ease: 'power2.inOut', stagger: 0.05 }, 0.95)
      .add(() => { sel = -1; select(0, true); }, 1.7);
    inOut(dash, ign, 'top 80%', 'bottom 10%');
  }

  /* ---------- 360° VIEW: image sequence scrub (S3) ---------- */
  const services = view.querySelector('#services');
  if (services && C.turntable) {
    const T = C.turntable, N = 48;
    const sec = document.createElement('section'); sec.className = 'wsection m-turn'; sec.id = 'turntable';
    sec.innerHTML = `<div class="m-turn-stick"><div class="m-turn-text"><div class="kicker">${T.kicker}</div><h2>${T.title}</h2><p class="wsub">${T.text}</p>
        <div class="m-callout" aria-live="polite"><b></b><span></span></div></div>
      <div class="m-turn-stage"><canvas role="img" aria-label="A red car turning on a turntable"></canvas><p class="m-turn-status">RENDERING FRAMES…</p>
        <div class="m-strip" aria-hidden="true">${'<i></i>'.repeat(N)}</div><span class="m-turn-frame">FRAME 01 / ${N}</span></div></div>`;
    services.after(sec);
    const cv = sec.querySelector('canvas'), g = cv.getContext('2d'), status = sec.querySelector('.m-turn-status'), strip = [...sec.querySelectorAll('.m-strip i')], fLabel = sec.querySelector('.m-turn-frame');
    const callB = sec.querySelector('.m-callout b'), callS = sec.querySelector('.m-callout span');
    const frames = []; const urls = [];
    const prog = { p: 0, f: 0, shown: -1, call: -1 };
    ScrollTrigger.create({ trigger: sec, scroller: view, start: 'top top', end: 'bottom bottom', onUpdate: s => { prog.p = s.progress; }, onRefresh: s => { prog.p = s.progress; } });
    const size = () => { const dpr = Math.min(2, devicePixelRatio || 1); cv.width = cv.clientWidth * dpr; cv.height = cv.clientHeight * dpr; prog.shown = -1; };
    size(); addEventListener('resize', size); offs.push(() => removeEventListener('resize', size));
    let alive = true; offs.push(() => { alive = false; urls.forEach(u => URL.revokeObjectURL(u)); });
    const drawFrame = i => {
      const img = frames[i]; if (!img || !img.complete) return false;
      const W = cv.width, H = cv.height, s = Math.min(W / img.naturalWidth, H / img.naturalHeight);
      g.clearRect(0, 0, W, H); g.drawImage(img, (W - img.naturalWidth * s) / 2, (H - img.naturalHeight * s) / 2, img.naturalWidth * s, img.naturalHeight * s);
      return true;
    };
    offs.push(loop(() => {
      if (!frames.length) return;
      const target = prog.p * (N - 1);
      prog.f += (target - prog.f) * 0.2;
      const i = Math.round(prog.f);
      if (i !== prog.shown && drawFrame(i)) {
        prog.shown = i; fLabel.textContent = `FRAME ${String(i + 1).padStart(2, '0')} / ${N}`;
        strip.forEach((t, k) => t.classList.toggle('on', k === i));
      }
      const c = Math.min(T.callouts.length - 1, Math.floor(prog.p * T.callouts.length * 0.999));
      if (c !== prog.call) { prog.call = c; callB.textContent = T.callouts[c][0]; callS.textContent = T.callouts[c][1]; gsap.fromTo(sec.querySelector('.m-callout'), { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.35 }); }
    }));
    // Render the frames once with three.js, then play them back like a film.
    import('three').then(async THREE => {
      if (!alive) return;
      const FW = 960, FH = 540;
      const r = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
      r.setPixelRatio(1); r.setSize(FW, FH, false);
      const scene = new THREE.Scene(); scene.background = new THREE.Color(0x121214);
      const cam = new THREE.PerspectiveCamera(30, FW / FH, 0.1, 100); cam.position.set(0, 3.3, 10.5); cam.lookAt(0, 0.75, 0);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x202024, 1.3));
      const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(5, 8, 6); scene.add(key);
      const rim = new THREE.DirectionalLight(0xffb400, 1.4); rim.position.set(-6, 3, -5); scene.add(rim);
      const table = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.4, 0.14, 72), new THREE.MeshStandardMaterial({ color: 0x1c1c20, metalness: 0.4, roughness: 0.6 })); table.position.y = 0.07; scene.add(table);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(3.32, 0.03, 8, 96), new THREE.MeshBasicMaterial({ color: 0xe10600 })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.15; scene.add(ring);
      const car = new THREE.Group(); car.position.y = 0.14; scene.add(car);
      const side = new THREE.Shape();
      side.moveTo(-2.2, 0.3); side.lineTo(-2.25, 0.75); side.quadraticCurveTo(-2.1, 0.95, -1.6, 0.98); side.lineTo(-1.05, 1.35);
      side.quadraticCurveTo(-0.6, 1.5, 0.2, 1.48); side.lineTo(1.0, 1.0); side.quadraticCurveTo(2.1, 0.9, 2.25, 0.62); side.lineTo(2.3, 0.3); side.lineTo(-2.2, 0.3);
      const bodyG = new THREE.ExtrudeGeometry(side, { depth: 1.7, bevelEnabled: true, bevelSize: 0.07, bevelThickness: 0.07, bevelSegments: 3, curveSegments: 16 }); bodyG.translate(0, 0, -0.85);
      car.add(new THREE.Mesh(bodyG, new THREE.MeshStandardMaterial({ color: 0xe10600, metalness: 0.55, roughness: 0.3 })));
      const win = new THREE.Shape(); win.moveTo(-1.0, 1.0); win.lineTo(-0.95, 1.3); win.quadraticCurveTo(-0.55, 1.43, 0.15, 1.42); win.lineTo(0.88, 1.02); win.lineTo(-1.0, 1.0);
      const winG = new THREE.ExtrudeGeometry(win, { depth: 1.9, bevelEnabled: false }); winG.translate(0, 0.02, -0.95);
      car.add(new THREE.Mesh(winG, new THREE.MeshStandardMaterial({ color: 0x0b0d12, metalness: 0.9, roughness: 0.15 })));
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.02, 0.32), new THREE.MeshStandardMaterial({ color: 0xf2f2f2 })); stripe.position.set(0.1, 1.0, 0); stripe.scale.set(0.98, 1, 1); car.add(stripe);
      const tyreM = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.9 }), rimM = new THREE.MeshStandardMaterial({ color: 0xbfc3c9, metalness: 0.9, roughness: 0.25 });
      [[1.35, 0.86], [1.35, -0.86], [-1.35, 0.86], [-1.35, -0.86]].forEach(([x, z]) => {
        const tyre = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.3, 28), tyreM); tyre.rotation.x = Math.PI / 2; tyre.position.set(x, 0.38, z); car.add(tyre);
        const rimMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.32, 20), rimM); rimMesh.rotation.x = Math.PI / 2; rimMesh.position.set(x, 0.38, z); car.add(rimMesh);
      });
      const lamp = (x, y, z, c) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.42), new THREE.MeshBasicMaterial({ color: c })); m.position.set(x, y, z); car.add(m); };
      lamp(2.3, 0.62, 0.55, 0xfff4cc); lamp(2.3, 0.62, -0.55, 0xfff4cc); lamp(-2.27, 0.78, 0.6, 0xff2a1a); lamp(-2.27, 0.78, -0.6, 0xff2a1a);
      for (let i = 0; i < N && alive; i++) {
        car.rotation.y = (i / N) * Math.PI * 2 + 0.6;
        r.render(scene, cam);
        const blob = await new Promise(res => r.domElement.toBlob(res, 'image/jpeg', 0.86));
        const url = URL.createObjectURL(blob); urls.push(url);
        const img = new Image(); img.src = url; frames.push(img);
        status.textContent = `RENDERING FRAMES ${i + 1}/${N}`;
        if (i % 6 === 5) await new Promise(res => setTimeout(res, 0));
      }
      scene.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
      r.dispose();
      if (!alive) return;
      status.hidden = true; prog.shown = -1;
      frames[0].decode?.().then(() => { prog.shown = -1; }).catch(() => {});
    }).catch(() => { status.textContent = 'The 360° view needs a newer browser.'; });
  }

  /* ---------- TUNNEL: drive through a lit night tunnel (D7, Automotive) ---------- */
  const about = view.querySelector('#about');
  if (about && C.warp) {
    const sec = document.createElement('section'); sec.className = 'wsection m-tunnel'; sec.id = 'tunnel';
    sec.innerHTML = `<div class="m-tunnel-stick"><canvas aria-hidden="true"></canvas><div class="m-tunnel-text"><div class="kicker">${C.warp.kicker}</div><h2>${C.warp.title}</h2><p class="wsub">${C.warp.text}</p></div><div class="m-speedo" aria-hidden="true"><b>000</b><span>KM/H</span></div></div>`;
    about.before(sec);
    const cv = sec.querySelector('canvas'), g = cv.getContext('2d'), speedo = sec.querySelector('.m-speedo b');
    let W = 0, H = 0; const dpr = Math.min(2, devicePixelRatio || 1);
    const size = () => { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener('resize', size); offs.push(() => removeEventListener('resize', size));
    let z = 0, speed = 0.4;
    offs.push(loop(dt => {
      const r = sec.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      const v = Math.abs((api.lenis && api.lenis.velocity) || 0);
      speed += (0.35 + Math.min(4, v * 0.12) - speed) * 0.06;
      z += speed * dt * 0.01;
      speedo.textContent = String(Math.round(speed * 80)).padStart(3, '0');
      const cx = W / 2, cy = H * 0.52, F = Math.min(W, H) * 0.9;
      g.fillStyle = '#060607'; g.fillRect(0, 0, W, H);
      const glow = g.createRadialGradient(cx, cy, 0, cx, cy, F * 0.35); glow.addColorStop(0, '#ffb40044'); glow.addColorStop(1, '#0000'); g.fillStyle = glow; g.fillRect(0, 0, W, H);
      const STEP = 1, NUM = 26, off = z % STEP;
      for (let k = NUM; k >= 1; k--) {
        const d = k * STEP - off; if (d <= 0.05) continue;
        const s = F / d, hw = 1.9 * s, hh = 1.2 * s, a = Math.min(1, 6 / d) * 0.9;
        // tunnel rib
        g.strokeStyle = `rgba(70,70,78,${(a * 0.6).toFixed(3)})`; g.lineWidth = Math.max(1, s * 0.03);
        g.beginPath(); g.moveTo(cx - hw, cy + hh); g.lineTo(cx - hw, cy - hh * 0.4); g.quadraticCurveTo(cx - hw, cy - hh * 1.1, cx, cy - hh * 1.1); g.quadraticCurveTo(cx + hw, cy - hh * 1.1, cx + hw, cy - hh * 0.4); g.lineTo(cx + hw, cy + hh); g.stroke();
        // amber lights on both walls, with streaks when fast
        const ly = cy - hh * 0.55, len = Math.min(s * 0.5, speed * s * 0.12);
        g.strokeStyle = `rgba(255,180,0,${a.toFixed(3)})`; g.lineWidth = Math.max(1.5, s * 0.05); g.lineCap = 'round';
        g.beginPath(); g.moveTo(cx - hw * 0.98, ly); g.lineTo(cx - hw * 0.98 - len * 0.6, ly + len * 0.15); g.stroke();
        g.beginPath(); g.moveTo(cx + hw * 0.98, ly); g.lineTo(cx + hw * 0.98 + len * 0.6, ly + len * 0.15); g.stroke();
        // road centre dashes
        if (k % 2 === 0) { const s2 = F / Math.max(0.05, d - STEP * 0.5); g.strokeStyle = `rgba(242,242,242,${(a * 0.8).toFixed(3)})`; g.lineWidth = Math.max(1, s * 0.04); g.beginPath(); g.moveTo(cx, cy + hh); g.lineTo(cx, cy + 1.2 * s2); g.stroke(); }
        // red tail-light stripe at the kerbs
        g.fillStyle = `rgba(225,6,0,${(a * 0.5).toFixed(3)})`; g.fillRect(cx - hw, cy + hh - s * 0.03, hw * 2 * 0.04, s * 0.03); g.fillRect(cx + hw * 0.92, cy + hh - s * 0.03, hw * 2 * 0.04, s * 0.03);
      }
    }));
  }

  /* ---------- BUTTONS: engine-rev (H11) ---------- */
  q('.cta, .ghostbtn').forEach(btn => {
    if (btn.closest('.device') || btn.closest('.worldnav')) return;
    btn.classList.add('m-rev-btn');
    const tach = document.createElement('span'); tach.className = 'm-tach'; tach.setAttribute('aria-hidden', 'true');
    tach.innerHTML = `<svg viewBox="0 0 30 18"><path d="M3 16a12 12 0 0 1 24 0" fill="none" stroke="currentColor" stroke-opacity=".45" stroke-width="2"/><path d="M21.5 6.5A12 12 0 0 1 27 16" fill="none" stroke="${AMBER}" stroke-width="2.5"/><g class="m-tach-n"><path d="M15 16 L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></g></svg>`;
    btn.prepend(tach);
    const n = tach.querySelector('.m-tach-n'); gsap.set(n, { rotation: -80, svgOrigin: '15 16' });
    let shake = null, jit = null;
    btn.addEventListener('pointerenter', () => {
      gsap.to(n, { rotation: 72, duration: 0.35, ease: 'power2.in', overwrite: true });
      jit = gsap.to(n, { rotation: '+=8', duration: 0.05, yoyo: true, repeat: -1, delay: 0.35 });
      shake = gsap.fromTo(btn, { '--rx': '0px' }, { '--rx': '1.2px', duration: 0.04, yoyo: true, repeat: -1, ease: 'none' });
    });
    btn.addEventListener('pointerleave', () => {
      if (jit) jit.kill(); if (shake) shake.kill(); gsap.set(btn, { '--rx': '0px' });
      gsap.to(n, { rotation: -80, duration: 0.6, ease: 'bounce.out', overwrite: true });
    });
  });

  /* ---------- POINTER: tyre marks (C13) ---------- */
  if (finePointer && !reduce) {
    const cv = own(document.createElement('canvas'), view); cv.className = 'm-skid'; cv.setAttribute('aria-hidden', 'true');
    const g = cv.getContext('2d'); const dpr = Math.min(2, devicePixelRatio || 1);
    let W = 0, H = 0;
    const size = () => { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener('resize', size); offs.push(() => removeEventListener('resize', size));
    const segs = []; let last = null; const LIFE = 1600;
    const onMove = e => {
      if (e.pointerType !== 'mouse') return;
      const now = performance.now(), p = { x: e.clientX, y: e.clientY, t: now };
      if (last) {
        const dx = p.x - last.x, dy = p.y - last.y, d = Math.hypot(dx, dy), sp = d / Math.max(1, now - last.t);
        if (sp > 1.1 && d > 2) { const nx = -dy / d * 7, ny = dx / d * 7, k = Math.min(1, (sp - 1.1) / 1.5); segs.push({ a: last, b: p, nx, ny, t: now, k }); if (segs.length > 260) segs.shift(); }
      }
      last = p;
    };
    view.addEventListener('pointermove', onMove, { passive: true }); offs.push(() => view.removeEventListener('pointermove', onMove));
    offs.push(loop(() => {
      const now = performance.now();
      while (segs.length && now - segs[0].t > LIFE) segs.shift();
      g.clearRect(0, 0, W, H); if (!segs.length) return;
      g.lineCap = 'round'; g.setLineDash([3, 2]);
      segs.forEach(s => {
        const a = (1 - (now - s.t) / LIFE) * (0.25 + 0.35 * s.k);
        g.strokeStyle = `rgba(210,210,215,${a.toFixed(3)})`; g.lineWidth = 5;
        [1, -1].forEach(sd => { g.beginPath(); g.moveTo(s.a.x + s.nx * sd, s.a.y + s.ny * sd); g.lineTo(s.b.x + s.nx * sd, s.b.y + s.ny * sd); g.stroke(); });
      });
      g.setLineDash([]);
    }));
  }

  return () => offs.forEach(f => f());
}, { customEnter: true });
