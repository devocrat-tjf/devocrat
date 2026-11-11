/* ==========================================================================
   FUNNY — "Serious tech, silly fun"
   Section map (one signature per section, so effects never overlap):
     Hero ........ VARIABLE-WEIGHT WAVE (T5): the headline letters thicken and
                   thin in a wave, and swell up under the pointer
     Headings .... 3D FLIPPING LETTERS (T13, Funny version): every letter
                   somersaults into place with a pink flash
     Whole page .. SPEED-REACTIVE SKEW (S12): content leans and stretches the
                   faster you scroll, then wobbles back
     Services .... SHAKE TO SHUFFLE (E5): shake your phone (or press the dice
                   button) and the cards jump into a new order
     Discuss ..... SHAKE ON ERROR (H9): missing fields shake and say what's missing
     Pointer ..... STRETCHY BLOB (C9): a googly-eyed blob that stretches as you
                   move and squashes when you click
     Phones ...... PHONE VIBRATION (N3, Funny version): little buzzes on taps,
                   a "ha-ha" buzz on shuffle, a grumpy buzz on errors
   ========================================================================== */
DevoMotion.world('funny', api => {
  const { view, gsap, q, inOut, tl, afterDialog, finePointer, reduce, loop, own } = api;
  const offs = [];
  const INK = '#2b1b3d', PINK = '#ff5d8f', CYAN = '#3ec6e0', SUN = '#ffe45e', LIME = '#7ac943';
  const coarse = matchMedia('(pointer:coarse)').matches;

  /* ---------- PHONES: vibration (N3, Funny version) ---------- */
  const canBuzz = 'vibrate' in navigator && coarse;
  let buzzOn = true; try { buzzOn = localStorage.getItem('devo-funny-buzz') !== 'off'; } catch (_) {}
  const buzz = p => { if (canBuzz && buzzOn) try { navigator.vibrate(p); } catch (_) {} };
  const BUZZ = { tap: 12, haha: [30, 50, 30, 50, 70], grumpy: [60, 40, 60], yay: [20, 30, 20, 30, 120] };
  if (canBuzz) {
    const chip = own(document.createElement('button'), view); chip.type = 'button'; chip.className = 'm-buzz'; chip.dataset.v3decorated = '1';
    const paint = () => { chip.textContent = buzzOn ? '📳 Buzz: on' : '📴 Buzz: off'; chip.setAttribute('aria-pressed', String(buzzOn)); };
    paint();
    chip.addEventListener('click', () => { buzzOn = !buzzOn; try { localStorage.setItem('devo-funny-buzz', buzzOn ? 'on' : 'off'); } catch (_) {} paint(); buzz(BUZZ.tap); });
    const onTap = e => { if (e.pointerType !== 'mouse' && e.target.closest('a,button,select,[role=button],.project,label') && !e.target.closest('.m-buzz')) buzz(BUZZ.tap); };
    view.addEventListener('pointerdown', onTap); offs.push(() => view.removeEventListener('pointerdown', onTap));
  }

  /* ---------- HERO: variable-weight wave (T5) ---------- */
  const hero = view.querySelector('.whero');
  if (hero) {
    const k = hero.querySelector('.kicker'), h = hero.querySelector('h1'), lead = hero.querySelector('.lead'), obj = hero.querySelector('.hero-object');
    const letters = [];
    if (h) {
      h.setAttribute('aria-label', h.textContent.trim());
      const walk = n => [...n.childNodes].forEach(c => {
        if (c.nodeType !== 3) return walk(c);
        const frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const w = document.createElement('span'); w.className = 'm-word'; w.setAttribute('aria-hidden', 'true');
          [...part].forEach(ch => { const s = document.createElement('span'); s.className = 'm-wv'; s.textContent = ch; w.appendChild(s); letters.push(s); });
          frag.appendChild(w);
        });
        c.replaceWith(frag);
      });
      walk(h);
    }
    const intro = afterDialog(gsap.timeline({ delay: 0.3 }));
    if (k) intro.from(k, { scale: 0, rotation: -30, duration: 0.6, ease: 'back.out(3)' }, 0);
    if (letters.length) intro.from(letters, { y: -80, opacity: 0, duration: 0.7, stagger: 0.03, ease: 'bounce.out' }, 0.1);
    if (lead) intro.from(lead, { opacity: 0, y: 20, duration: 0.6, ease: 'back.out(2)' }, 0.8);
    if (obj) intro.from(obj, { scale: 0, rotation: 20, duration: 0.9, ease: 'elastic.out(1, 0.5)' }, 0.3);
    if (letters.length && !reduce) {
      let centers = [];
      const measure = () => { const hr = h.getBoundingClientRect(); centers = letters.map(l => { const r = l.getBoundingClientRect(); return [r.left - hr.left + r.width / 2, r.top - hr.top + r.height / 2]; }); };
      setTimeout(measure, 1500); addEventListener('resize', measure); offs.push(() => removeEventListener('resize', measure));
      const m = { x: -9999, y: -9999 };
      const onMove = e => { m.x = e.clientX; m.y = e.clientY; };
      hero.addEventListener('pointermove', onMove); hero.addEventListener('pointerleave', () => { m.x = m.y = -9999; });
      offs.push(() => hero.removeEventListener('pointermove', onMove));
      const prox = letters.map(() => 0);
      offs.push(loop((dt, now) => {
        const hr = h.getBoundingClientRect(); if (hr.bottom < 0 || hr.top > innerHeight || !centers.length) return;
        const t = now / 1000;
        letters.forEach((l, i) => {
          const c = centers[i]; if (!c) return;
          const dx = m.x - (hr.left + c[0]), dy = m.y - (hr.top + c[1]);
          const target = Math.exp(-(dx * dx + dy * dy) / (90 * 90));
          prox[i] += (target - prox[i]) * 0.2;
          const wave = 0.5 + 0.5 * Math.sin(t * 2.6 - i * 0.42);
          l.style.setProperty('--wt', (wave * 1.6 + prox[i] * 4).toFixed(2) + 'px');
          l.style.setProperty('--ws', (1 + prox[i] * 0.28 + wave * 0.03).toFixed(3));
        });
      }));
    }
  }

  /* ---------- HEADINGS: 3D flipping letters (T13, Funny version) ---------- */
  q('.wsection h2').forEach(h2 => {
    const label = h2.textContent.trim(); h2.setAttribute('aria-label', label);
    const chars = [];
    const walk = n => [...n.childNodes].forEach(c => {
      if (c.nodeType !== 3) return walk(c);
      const frag = document.createDocumentFragment();
      c.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        const w = document.createElement('span'); w.className = 'm-word'; w.setAttribute('aria-hidden', 'true');
        [...part].forEach(ch => { const s = document.createElement('span'); s.className = 'm-flip'; s.textContent = ch; w.appendChild(s); chars.push(s); });
        frag.appendChild(w);
      });
      c.replaceWith(frag);
    });
    walk(h2);
    const t = tl();
    chars.forEach((c, i) => {
      const axis = i % 3 === 0 ? 'rotationY' : 'rotationX', turns = (i % 2 ? 1 : -1) * (360 + (i % 4) * 180);
      t.fromTo(c, { [axis]: turns, opacity: 0, y: -24, color: PINK, transformPerspective: 500 }, { [axis]: 0, opacity: 1, y: 0, color: INK, duration: 0.75, ease: 'back.out(2.2)', clearProps: 'color' }, i * 0.035);
    });
    inOut(h2, t, 'top 88%', 'bottom 6%');
  });
  q('.wsection > .kicker, .wsection .labhead .kicker, .aboutgrid .kicker, .contactgrid .kicker').forEach(el => inOut(el, tl().from(el, { scale: 0, rotation: -40, duration: 0.5, ease: 'back.out(3)' })));
  q('.wsection .wsub, .about-lead, .labnote, .formnote').forEach(p => inOut(p, tl().from(p, { opacity: 0, y: 16, duration: 0.6, ease: 'back.out(2)' })));

  /* ---------- cards: boing in (uses separate translate/scale so the wobble hover still works) ---------- */
  const boing = (sel, start = 'top 84%') => {
    const els = gsap.utils.toArray(q(sel)); if (!els.length) return;
    els.forEach(el => { el.classList.add('m-pop'); el.dataset.mTamed = '1'; });
    inOut(els[0].parentElement, tl().fromTo(els, { opacity: 0, '--pop-s': 0.3, '--pop-y': '60px' }, { opacity: 1, '--pop-s': 1, '--pop-y': '0px', duration: 0.8, stagger: 0.08, ease: 'elastic.out(1, 0.55)' }), start);
  };
  boing('.servicegrid .service'); boing('.highlights .service'); boing('.picker .project'); boing('.team .tm');
  q('.devices, .contact-card.enquiry, .offer-soon').forEach(el => inOut(el, tl().from(el, { opacity: 0, duration: 0.6 })));

  /* ---------- WHOLE PAGE: speed-reactive skew (S12) ---------- */
  // One CSS variable on the world drives the lean; CSS applies it to the content blocks.
  if (!reduce) {
    let sk = 0, st = 1;
    offs.push(loop(() => {
      const v = (api.lenis && api.lenis.velocity) || 0;
      const tSk = Math.max(-7, Math.min(7, -v * 0.3)), tSt = 1 + Math.min(0.12, Math.abs(v) * 0.004);
      sk += (tSk - sk) * 0.18; st += (tSt - st) * 0.18;
      if (Math.abs(sk) < 0.01 && Math.abs(tSk) < 0.01) sk = 0;
      view.style.setProperty('--m-sk', sk.toFixed(2) + 'deg'); view.style.setProperty('--m-st', st.toFixed(3));
    }));
    offs.push(() => { view.style.removeProperty('--m-sk'); view.style.removeProperty('--m-st'); });
  }

  /* ---------- SERVICES: shake to shuffle (E5) ---------- */
  const sGrid = view.querySelector('#services .servicegrid');
  if (sGrid) {
    const bar = document.createElement('div'); bar.className = 'm-shuffle-bar';
    bar.innerHTML = `<button type="button" class="m-shuffle" data-v3decorated="1">🎲 Shuffle the cards</button><span class="m-shake-hint">${coarse ? 'Or just shake your phone! 📳' : 'On a phone? Shake it! 📳'}</span>`;
    sGrid.before(bar);
    const toast = document.createElement('p'); toast.className = 'm-toast'; toast.setAttribute('role', 'status'); bar.appendChild(toast);
    const LINES = ['Shuffled! 🎲', 'Wheee! 🌀', 'New order, same great stuff! ✨', 'Boing! 🤸', 'Again? Again! 🔁'];
    let n = 0, busy = false;
    const shuffle = () => {
      if (busy) return; busy = true;
      const cards = [...sGrid.children];
      const before = new Map(cards.map(c => [c, c.getBoundingClientRect()]));
      let order = [...cards];
      for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
      if (order.every((c, i) => c === cards[i])) order.push(order.shift());
      order.forEach(c => sGrid.appendChild(c));
      order.forEach((c, i) => {
        const a = before.get(c), b = c.getBoundingClientRect();
        gsap.fromTo(c, { '--pop-x': (a.left - b.left) + 'px', '--pop-y': (a.top - b.top) + 'px', '--pop-s': 1 }, {
          keyframes: [{ '--pop-s': 1.15, duration: 0.18 }, { '--pop-x': '0px', '--pop-y': '0px', '--pop-s': 1, duration: 0.7, ease: 'elastic.out(1, 0.6)' }],
          delay: i * 0.05, onComplete: () => { if (i === order.length - 1) busy = false; } });
      });
      toast.textContent = LINES[n++ % LINES.length];
      gsap.fromTo(toast, { scale: 0, rotation: -20, opacity: 1 }, { scale: 1, rotation: -4, duration: 0.5, ease: 'back.out(3)' });
      gsap.to(toast, { opacity: 0, delay: 1.8, duration: 0.4 });
      buzz(BUZZ.haha);
    };
    let asked = false;
    const askMotion = () => {
      if (asked) return; asked = true;
      const D = window.DeviceMotionEvent;
      if (D && typeof D.requestPermission === 'function') D.requestPermission().catch(() => {});
    };
    bar.querySelector('.m-shuffle').addEventListener('click', () => { askMotion(); shuffle(); });
    // shake detection: two big jolts within 700ms
    let last = null, jolts = [], lastShake = 0;
    const onMotion = e => {
      const a = e.accelerationIncludingGravity; if (!a || a.x == null) return;
      if (last) {
        const d = Math.abs(a.x - last.x) + Math.abs(a.y - last.y) + Math.abs(a.z - last.z), now = performance.now();
        if (d > 28) { jolts = jolts.filter(t => now - t < 700); jolts.push(now); if (jolts.length >= 2 && now - lastShake > 1400) { lastShake = now; jolts = []; const r = sGrid.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight) shuffle(); } }
      }
      last = { x: a.x, y: a.y, z: a.z };
    };
    if (coarse) { addEventListener('devicemotion', onMotion); offs.push(() => removeEventListener('devicemotion', onMotion)); }
  }

  /* ---------- DISCUSS: shake on error (H9) ---------- */
  const form = view.querySelector('form.enquiry');
  if (form) {
    const SAY = { name: 'Psst… we need your name! 🙃', phone: 'How do we call you back? ☎️', msg: 'Tell us your idea — even a tiny one! 💡' };
    let round = 0, shownRound = -1;
    const onInvalid = e => {
      e.preventDefault();
      const f = e.target, lab = f.closest('label') || f;
      f.classList.add('m-oops');
      gsap.fromTo(lab, { x: 0 }, { keyframes: { x: [-12, 12, -9, 9, -5, 5, 0] }, duration: 0.5, ease: 'none', delay: 0.05 });
      if (shownRound !== round) {
        shownRound = round;
        let tip = lab.querySelector('.m-oops-tip');
        if (!tip) { tip = document.createElement('span'); tip.className = 'm-oops-tip'; tip.setAttribute('role', 'alert'); lab.appendChild(tip); }
        tip.textContent = SAY[f.name] || 'Oops, this one is missing! 🙈';
        gsap.fromTo(tip, { scale: 0, rotation: -12 }, { scale: 1, rotation: -2, duration: 0.45, ease: 'back.out(3)' });
        f.focus({ preventScroll: false });
        buzz(BUZZ.grumpy);
      }
    };
    const onSubmitClick = e => { if (e.target.closest('button[type=submit]')) round++; };
    const onInput = e => { const f = e.target; if (f.checkValidity && f.checkValidity()) { f.classList.remove('m-oops'); const tip = f.closest('label')?.querySelector('.m-oops-tip'); if (tip) gsap.to(tip, { scale: 0, duration: 0.2, onComplete: () => tip.remove() }); } };
    const onSubmit = () => buzz(BUZZ.yay);
    form.addEventListener('invalid', onInvalid, true); form.addEventListener('click', onSubmitClick, true); form.addEventListener('input', onInput); form.addEventListener('submit', onSubmit);
  }

  /* ---------- POINTER: stretchy googly blob (C9) ---------- */
  if (finePointer && api.cursor) {
    const blob = own(document.createElement('div')); blob.className = 'm-blob'; blob.setAttribute('aria-hidden', 'true');
    blob.innerHTML = '<div class="m-blob-body"><i class="m-eye"><b></b></i><i class="m-eye"><b></b></i><span class="m-blob-label"></span></div>';
    const body = blob.querySelector('.m-blob-body'), pupils = blob.querySelectorAll('.m-eye b'), label = blob.querySelector('.m-blob-label');
    const ringLabel = api.cursor.ring.querySelector('b');
    const p = { x: innerWidth / 2, y: innerHeight / 2 }, v = { x: 0, y: 0 };
    let squash = 0, size = 34;
    const onDown = e => { if (e.pointerType === 'mouse') squash = 1; };
    addEventListener('pointerdown', onDown); offs.push(() => removeEventListener('pointerdown', onDown));
    offs.push(api.cursor.onMove(pos => {
      // spring towards the pointer: wobbly, but never far behind
      v.x = (v.x + (pos.x - p.x) * 0.22) * 0.62; v.y = (v.y + (pos.y - p.y) * 0.22) * 0.62;
      p.x += v.x; p.y += v.y;
      const speed = Math.hypot(v.x, v.y), ang = Math.atan2(v.y, v.x) * 57.2958;
      const stretch = 1 + Math.min(0.9, speed * 0.035);
      squash *= 0.86;
      const cls = document.body.classList, hover = cls.contains('m-hover'), lab = cls.contains('m-label');
      const want = lab ? 84 : hover ? 56 : 34; size += (want - size) * 0.2;
      const sx = stretch * (1 + squash * 0.35), sy = (1 / stretch) * (1 - squash * 0.3);
      blob.style.transform = `translate3d(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px,0) rotate(${ang.toFixed(1)}deg) scale(${sx.toFixed(3)},${sy.toFixed(3)})`;
      body.style.width = body.style.height = size.toFixed(1) + 'px'; body.style.margin = (-size / 2).toFixed(1) + 'px';
      body.style.transform = `rotate(${(-ang).toFixed(1)}deg)`;
      const lx = Math.max(-3, Math.min(3, (pos.x - p.x) * 0.3 + v.x * 0.5)), ly = Math.max(-3, Math.min(3, (pos.y - p.y) * 0.3 + v.y * 0.5));
      pupils.forEach(b => { b.style.transform = `translate(${lx.toFixed(1)}px,${ly.toFixed(1)}px)`; });
      blob.classList.toggle('m-blob-hover', hover || lab);
      const txt = lab ? ringLabel.textContent : '';
      if (label.textContent !== txt) label.textContent = txt;
    }));
  }

  return () => offs.forEach(f => f());
});
