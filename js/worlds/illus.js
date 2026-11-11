/* ==========================================================================
   ILLUSTRATIVE — "Think it. Sketch it. Build it."
   Section map (one signature per section, so effects never overlap):
     Entry ....... PAINT SPLASH (W4, Illustrative version): yellow, coral and
                   teal paint splat over the universe, then the paper shows
     Hero ........ SKETCH TO COLOUR (S20): the drawing pencils itself in, then
                   fills with colour as you scroll
     Headings .... TYPEWRITER (T3): every section title types itself with a
                   caret and un-types when you scroll back past it
     Services .... sticky notes slap onto the page
     Offers ...... DRAW ON THE PAGE (E6): a doodle pad, just for fun
     About ....... SKETCHBOOK PAGES (L9): a spiral sketchbook that opens, with
                   tape, doodles and margin notes
     Pointer ..... PAINT TRAIL (C7): a fading brush stroke follows the mouse
     Sound ....... CLICK AND HOVER SOUNDS (N2): pencil scratch, pen click and a
                   camera shutter (on/off switch bottom-left)
   ========================================================================== */
DevoMotion.world('illus', api => {
  const { view, gsap, q, inOut, tl, afterDialog, finePointer, reduce, loop, own } = api;
  const offs = [];
  const INK = '#243b4a', CORAL = '#e76f51', TEAL = '#2a9d8f', SUN = '#ffd166', PAPER = '#fdf6e3';
  const CLICKABLE = 'a,button,select,summary,[role=button],[onclick],.project,label';

  /* ---------- SOUND (N2): made in the browser, no audio files ---------- */
  const sound = (() => {
    let ac = null, on = true, unlocked = false, noiseBuf = null;
    try { on = localStorage.getItem('devo-illus-sound') !== 'off'; } catch (_) {}
    const ctx = () => {
      if (!ac) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ac = new C(); }
      if (ac.state === 'suspended') ac.resume();
      return ac;
    };
    const noise = a => {
      if (noiseBuf) return noiseBuf;
      noiseBuf = a.createBuffer(1, a.sampleRate * 0.5, a.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      return noiseBuf;
    };
    const burst = (a, t, dur, type, freq, q, vol, sweepTo) => {
      const src = a.createBufferSource(); src.buffer = noise(a); src.playbackRate.value = 0.8 + Math.random() * 0.4;
      const f = a.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
      if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
      const g = a.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.02, dur / 3)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(f).connect(g).connect(a.destination); src.start(t, Math.random() * 0.3); src.stop(t + dur + 0.02);
    };
    const ok = () => on && unlocked && !reduce && ctx();
    return {
      get on() { return on; },
      set(v) { on = v; try { localStorage.setItem('devo-illus-sound', v ? 'on' : 'off'); } catch (_) {} },
      unlock() { if (!unlocked) { unlocked = true; ctx(); } },
      scratch(vol = 0.05) { const a = ok(); if (a) burst(a, a.currentTime, 0.12, 'bandpass', 2600 + Math.random() * 1600, 1.1, vol); },
      click() {
        const a = ok(); if (!a) return; const t = a.currentTime;
        const o = a.createOscillator(), g = a.createGain(); o.type = 'triangle';
        o.frequency.setValueAtTime(1300, t); o.frequency.exponentialRampToValueAtTime(420, t + 0.05);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
        o.connect(g).connect(a.destination); o.start(t); o.stop(t + 0.1);
      },
      shutter() { const a = ok(); if (!a) return; const t = a.currentTime; burst(a, t, 0.05, 'highpass', 1800, 0.7, 0.14); burst(a, t + 0.09, 0.07, 'highpass', 1400, 0.7, 0.12); },
      swoosh() { const a = ok(); if (a) burst(a, a.currentTime, 0.45, 'lowpass', 500, 0.9, 0.06, 2600); },
    };
  })();
  const btn = own(document.createElement('button'), view);
  btn.className = 'm-sound'; btn.type = 'button'; btn.dataset.v3decorated = '1';
  const paintBtn = () => { btn.textContent = sound.on ? '♪ Sound on' : '♪ Sound off'; btn.setAttribute('aria-pressed', String(sound.on)); btn.classList.toggle('m-off', !sound.on); };
  paintBtn();
  btn.addEventListener('click', () => { sound.unlock(); sound.set(!sound.on); paintBtn(); sound.click(); });
  let lastHover = null, lastHoverT = 0;
  const onOver = e => {
    const el = e.target.closest && e.target.closest(CLICKABLE);
    if (!el || el === lastHover || el === btn) { if (!el) lastHover = null; return; }
    lastHover = el; const now = performance.now(); if (now - lastHoverT < 90) return; lastHoverT = now;
    sound.scratch(0.035);
  };
  const onDownSnd = () => sound.unlock();
  const onClickSnd = e => {
    if (e.target.closest('.m-sound')) return;
    if (e.target.closest('.picker .project')) sound.shutter();
    else if (e.target.closest(CLICKABLE)) sound.click();
  };
  view.addEventListener('pointerover', onOver); view.addEventListener('pointerdown', onDownSnd, true); view.addEventListener('keydown', onDownSnd, true); view.addEventListener('click', onClickSnd);
  offs.push(() => { view.removeEventListener('pointerover', onOver); view.removeEventListener('pointerdown', onDownSnd, true); view.removeEventListener('keydown', onDownSnd, true); view.removeEventListener('click', onClickSnd); });

  /* ---------- ENTRY: paint splash (W4, Illustrative version) ---------- */
  // Three splats of paint land on top of each other; the last one is paper colour,
  // so when the world appears underneath, the change is seamless.
  const splat = seed => {
    let s = seed; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    const n = 28, pts = [];
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, r = 82 + rnd() * 18 + (i % 3 === 0 ? rnd() * 34 : 0); pts.push([r * Math.cos(a), r * Math.sin(a)]); }
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    let d = `M${mid(pts[n - 1], pts[0]).map(v => v.toFixed(1)).join(' ')}`;
    pts.forEach((p, i) => { const m = mid(p, pts[(i + 1) % n]); d += `Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`; });
    let drops = '';
    for (let i = 0; i < 6; i++) { const a = rnd() * Math.PI * 2, r = 128 + rnd() * 40; drops += `<circle cx="${(r * Math.cos(a)).toFixed(1)}" cy="${(r * Math.sin(a)).toFixed(1)}" r="${(4 + rnd() * 9).toFixed(1)}"/>`; }
    return `<path d="${d}Z"/>${drops}`;
  };
  (() => {
    const cx = parseFloat(view.style.getPropertyValue('--cx')) || innerWidth / 2;
    const cy = parseFloat(view.style.getPropertyValue('--cy')) || innerHeight / 2;
    const cover = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
    const ov = own(document.createElement('div')); ov.className = 'm-splash'; ov.setAttribute('aria-hidden', 'true');
    const cols = [SUN, CORAL, TEAL, PAPER];
    ov.innerHTML = `<svg width="100%" height="100%"><g transform="translate(${cx} ${cy})">${cols.map((c, i) => `<g class="m-splat" fill="${c}">${splat(17 + i * 31)}</g>`).join('')}</g></svg>`;
    const splats = ov.querySelectorAll('.m-splat');
    view.style.visibility = 'hidden';
    const t = gsap.timeline({ onComplete: () => ov.remove() });
    splats.forEach((g, i) => t.fromTo(g, { scale: 0.02, rotation: gsap.utils.random(-40, 40), svgOrigin: '0 0' }, { scale: (cover / 78) * (i === 3 ? 1.1 : 1), rotation: '+=' + gsap.utils.random(-20, 20), duration: 0.62, ease: 'power3.in' }, i * 0.16));
    t.add(() => { view.style.visibility = ''; }).to(ov, { opacity: 0, duration: 0.5, ease: 'power1.out' }, '+=0.05');
    offs.push(() => { view.style.visibility = ''; });
  })();

  /* ---------- HERO: sketch to colour (S20) ---------- */
  const hero = view.querySelector('.whero');
  if (hero) {
    const k = hero.querySelector('.kicker'), h = hero.querySelector('h1'), lead = hero.querySelector('.lead');
    const obj = hero.querySelector('.hero-object'), art = obj && obj.querySelector('svg'), root = art && art.querySelector(':scope > g');
    const intro = afterDialog(gsap.timeline({ delay: 0.9 }));
    if (k) intro.from(k, { opacity: 0, y: 10, duration: 0.6, ease: 'power2.out' }, 0);
    // the h1 is an inline highlight, so reveal it word by word, like it's being written
    if (h) intro.from(api.splitWords(h, 'light'), { opacity: 0, y: 12, rotation: -4, duration: 0.5, stagger: 0.12, ease: 'back.out(2)' }, 0.1);
    if (lead) intro.from(lead, { opacity: 0, y: 14, duration: 0.8, ease: 'power2.out' }, 0.9);
    if (art && root) {
      // pencil stage: paper-coloured fills and grey pencil lines
      const filled = [...art.querySelectorAll('[fill]')].filter(el => el !== root && el.getAttribute('fill') !== 'none');
      filled.forEach(el => { el.dataset.mFill = el.getAttribute('fill'); });
      gsap.set(filled, { fill: PAPER });
      gsap.set(root, { stroke: '#a3abb4' });
      const lines = [...art.querySelectorAll('path')].filter(p => !p.closest('.draw') && !p.classList.contains('draw'));
      lines.forEach(p => { const L = p.getTotalLength ? p.getTotalLength() : 0; p.dataset.mLen = L; gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
      intro.to(lines, { strokeDashoffset: 0, duration: 0.7, stagger: 0.035, ease: 'power1.inOut', onComplete() { gsap.set(lines, { clearProps: 'strokeDasharray,strokeDashoffset' }); } }, 0.2);
      const hint = document.createElement('span'); hint.className = 'm-colour-hint'; hint.textContent = 'scroll to colour me in ↓'; obj.appendChild(hint);
      intro.from(hint, { opacity: 0, y: 8, duration: 0.6 }, 1.8);
      // colour stage: scrubbed by scroll, each piece washes in one after another
      const wash = gsap.timeline({ scrollTrigger: { trigger: hero, scroller: view, start: 'top top', end: '+=35%', scrub: 0.6 } });
      wash.to(root, { stroke: INK, duration: 1, ease: 'none' }, 0).to(hint, { opacity: 0, duration: 0.3 }, 0);
      filled.forEach((el, i) => wash.to(el, { fill: el.dataset.mFill, duration: 0.8, ease: 'none' }, 0.1 + i * 0.12));
    }
  }

  /* ---------- HEADINGS: typewriter (T3) ---------- */
  q('.wsection h2').forEach(h2 => {
    const label = h2.textContent.trim(); h2.setAttribute('aria-label', label);
    const chars = [];
    const walk = n => [...n.childNodes].forEach(c => {
      if (c.nodeType === 3) {
        const frag = document.createDocumentFragment();
        [...c.textContent].forEach(ch => { const s = document.createElement('span'); s.className = 'm-ch'; s.setAttribute('aria-hidden', 'true'); s.textContent = ch; frag.appendChild(s); chars.push(s); });
        c.replaceWith(frag);
      } else walk(c);
    });
    walk(h2);
    if (!chars.length) return;
    const caret = document.createElement('span'); caret.className = 'm-caret'; caret.setAttribute('aria-hidden', 'true');
    let shown = -1;
    const render = n => {
      if (n === shown) return; shown = n;
      chars.forEach((c, i) => { c.style.visibility = i < n ? '' : 'hidden'; });
      (n ? chars[n - 1] : chars[0]).after(caret);
      if (!n) chars[0].before(caret);
      h2.classList.toggle('m-typed', n === chars.length);
    };
    render(0);
    const st = { n: 0 };
    const t = tl().to(st, { n: chars.length, duration: Math.min(1.8, chars.length * 0.055), ease: 'none', onUpdate: () => render(Math.round(st.n)) });
    inOut(h2, t, 'top 88%', 'bottom 6%');
  });
  q('.wsection > .kicker, .wsection .labhead .kicker, .contactgrid .kicker').forEach(el => inOut(el, tl().from(el, { opacity: 0, rotation: -3, duration: 0.5, ease: 'back.out(2)' })));
  q('.wsection .wsub, .labnote, .formnote').forEach(p => inOut(p, tl().from(p, { opacity: 0, y: 12, duration: 0.7, ease: 'power2.out' })));

  /* ---------- cards: sticky notes slap on ---------- */
  // These cards keep their own hand-drawn tilt and hover, so the animation uses
  // separate scale/translate properties (CSS variables) and leaves "transform" alone.
  const slap = (sel, start = 'top 84%') => {
    const els = gsap.utils.toArray(q(sel)); if (!els.length) return;
    els.forEach(el => { el.classList.add('m-pop'); el.dataset.mTamed = '1'; });
    inOut(els[0].parentElement, tl().fromTo(els, { opacity: 0, '--pop-s': 1.35, '--pop-y': '-40px' }, { opacity: 1, '--pop-s': 1, '--pop-y': '0px', duration: 0.5, stagger: 0.09, ease: 'back.out(1.8)' }), start);
  };
  slap('.servicegrid .service'); slap('.picker .project'); slap('.team .tm');
  q('.devices, .contact-card.enquiry, .offer-soon').forEach(el => inOut(el, tl().from(el, { opacity: 0, y: 30, duration: 0.8, ease: 'power2.out' })));

  /* ---------- OFFERS: doodle pad (E6) ---------- */
  const offers = view.querySelector('#offers');
  if (offers) {
    const pad = document.createElement('div'); pad.className = 'm-pad'; pad.setAttribute('data-lenis-prevent', '');
    const COLS = [[INK, 'Ink'], [CORAL, 'Coral'], [TEAL, 'Teal'], [SUN, 'Highlighter']];
    pad.innerHTML = `<div class="m-pad-top"><span class="m-pad-title">While you wait, doodle something ✎</span>
      <div class="m-pad-tools">${COLS.map(([c, n], i) => `<button type="button" data-c="${c}" aria-label="${n}" aria-pressed="${i === 0}" style="--c:${c}" data-v3decorated="1"></button>`).join('')}<button type="button" class="m-pad-clear" data-v3decorated="1">Clear</button></div></div>
      <div class="m-pad-sheet"><canvas aria-label="Doodle pad" role="img"></canvas><span class="m-pad-empty" aria-hidden="true">draw here</span></div>`;
    offers.appendChild(pad);
    const cv = pad.querySelector('canvas'), c2 = cv.getContext('2d'), empty = pad.querySelector('.m-pad-empty');
    const dpr = Math.min(2, devicePixelRatio || 1);
    let col = INK, drawing = false, last = null, lastSnd = 0;
    const size = () => {
      const w = cv.clientWidth, h = cv.clientHeight; if (!w) return;
      const keep = cv.width ? c2.getImageData(0, 0, cv.width, cv.height) : null;
      cv.width = w * dpr; cv.height = h * dpr; c2.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (keep) c2.putImageData(keep, 0, 0);
    };
    size(); addEventListener('resize', size); offs.push(() => removeEventListener('resize', size));
    const at = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    cv.addEventListener('pointerdown', e => {
      drawing = true; last = at(e); cv.setPointerCapture(e.pointerId); empty.classList.add('m-gone'); sound.unlock();
      c2.fillStyle = col; c2.globalAlpha = col === SUN ? 0.55 : 1; c2.beginPath(); c2.arc(last[0], last[1], col === SUN ? 6 : 2, 0, 7); c2.fill();
    });
    cv.addEventListener('pointermove', e => {
      if (!drawing) return; const p = at(e);
      c2.strokeStyle = col; c2.globalAlpha = col === SUN ? 0.5 : 1; c2.lineWidth = col === SUN ? 14 : 3.5; c2.lineCap = c2.lineJoin = 'round';
      c2.beginPath(); c2.moveTo(last[0], last[1]); c2.lineTo(p[0], p[1]); c2.stroke(); last = p;
      const now = performance.now(); if (now - lastSnd > 110) { lastSnd = now; sound.scratch(0.03); }
    });
    const end = () => { drawing = false; };
    cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
    pad.querySelectorAll('[data-c]').forEach(b => b.addEventListener('click', () => {
      col = b.dataset.c; pad.querySelectorAll('[data-c]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    }));
    pad.querySelector('.m-pad-clear').addEventListener('click', () => {
      gsap.to(cv, { opacity: 0, duration: 0.25, onComplete() { c2.clearRect(0, 0, cv.width, cv.height); empty.classList.remove('m-gone'); gsap.to(cv, { opacity: 1, duration: 0.2 }); } });
    });
    inOut(pad, tl().from(pad, { opacity: 0, y: 30, rotation: -1.5, duration: 0.7, ease: 'back.out(1.6)' }), 'top 88%');
  }

  /* ---------- ABOUT: sketchbook pages (L9) ---------- */
  const book = view.querySelector('#about .aboutgrid');
  if (book && book.children.length >= 2) {
    book.classList.add('m-book');
    const [left, right] = book.children;
    left.classList.add('m-page', 'm-page-l'); right.classList.add('m-page', 'm-page-r');
    left.insertAdjacentHTML('beforeend', `<span class="m-note m-note-a" aria-hidden="true">← that's us!</span>
      <svg class="m-doodle m-doodle-star" viewBox="0 0 60 60" aria-hidden="true"><path d="M30 6l6 16 17 1-13 11 4 17-14-9-14 9 4-17L7 23l17-1z"/></svg>`);
    right.insertAdjacentHTML('beforeend', `<span class="m-note m-note-b" aria-hidden="true">we mean it ✓</span>
      <svg class="m-doodle m-doodle-arrow" viewBox="0 0 120 70" aria-hidden="true"><path d="M8 58C30 20 70 8 104 20"/><path d="M92 10l13 10-15 8"/></svg>`);
    const cards = [...right.querySelectorAll('.service')];
    cards.forEach(el => { el.classList.add('m-pop'); el.dataset.mTamed = '1'; });
    const doodles = [...book.querySelectorAll('.m-doodle path')];
    doodles.forEach(p => { const L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L }); p.dataset.mLen = L; });
    const t = tl()
      .add(() => sound.swoosh())
      .from(left, { opacity: 0, x: 30, duration: 0.6, ease: 'power2.out' }, 0)
      .from(right, { rotationY: -100, transformPerspective: 1800, transformOrigin: '0% 50%', opacity: 0, duration: 1.1, ease: 'power3.out' }, 0.1)
      .fromTo(cards, { opacity: 0, '--pop-s': 1.3, '--pop-y': '-30px' }, { opacity: 1, '--pop-s': 1, '--pop-y': '0px', duration: 0.45, stagger: 0.12, ease: 'back.out(1.8)' }, 0.8)
      .fromTo(book.querySelectorAll('.m-note'), { clipPath: 'inset(-20% 100% -20% 0)' }, { clipPath: 'inset(-20% -5% -20% 0)', duration: 0.7, stagger: 0.3, ease: 'power1.inOut' }, 1.0)
      .fromTo(doodles, { strokeDashoffset: (i, el) => el.dataset.mLen }, { strokeDashoffset: 0, duration: 0.6, stagger: 0.15, ease: 'power1.inOut' }, 1.2);
    inOut(book, t, 'top 78%', 'bottom 12%');
  }

  /* ---------- POINTER: paint trail (C7) ---------- */
  if (finePointer && !reduce) {
    const cv = own(document.createElement('canvas'), view); cv.className = 'm-trail'; cv.setAttribute('aria-hidden', 'true');
    const c2 = cv.getContext('2d'); const dpr = Math.min(2, devicePixelRatio || 1);
    let W = 0, H = 0;
    const size = () => { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; c2.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener('resize', size); offs.push(() => removeEventListener('resize', size));
    const LIFE = 700, PAL = [CORAL, SUN, TEAL];
    const pts = []; let travelled = 0, lp = null;
    const colourAt = d => { const f = (d / 420) % PAL.length, i = Math.floor(f); return gsap.utils.interpolate(PAL[i], PAL[(i + 1) % PAL.length], f - i); };
    const onMove = e => {
      if (e.pointerType !== 'mouse') return;
      if (e.target.closest && e.target.closest('.m-pad, input, textarea, select')) { lp = null; return; }
      const p = { x: e.clientX, y: e.clientY, t: performance.now() };
      if (lp) {
        const d = Math.hypot(p.x - lp.x, p.y - lp.y); if (d < 3) return;
        travelled += d; const speed = d / Math.max(8, p.t - lp.t) * 16;
        p.w = Math.max(3, Math.min(16, 17 - speed * 0.35));
      } else p.w = 8;
      p.c = colourAt(travelled); pts.push(p); lp = p; if (pts.length > 90) pts.shift();
    };
    view.addEventListener('pointermove', onMove, { passive: true });
    offs.push(() => view.removeEventListener('pointermove', onMove));
    offs.push(loop(() => {
      const now = performance.now();
      while (pts.length && now - pts[0].t > LIFE) pts.shift();
      c2.clearRect(0, 0, W, H);
      if (pts.length < 3) return;
      c2.lineCap = c2.lineJoin = 'round';
      for (let i = 1; i < pts.length - 1; i++) {
        const a = pts[i - 1], b = pts[i], c = pts[i + 1], life = 1 - (now - b.t) / LIFE;
        c2.globalAlpha = Math.max(0, life) * 0.55; c2.strokeStyle = b.c; c2.lineWidth = b.w * (0.35 + 0.65 * life);
        c2.beginPath(); c2.moveTo((a.x + b.x) / 2, (a.y + b.y) / 2); c2.quadraticCurveTo(b.x, b.y, (b.x + c.x) / 2, (b.y + c.y) / 2); c2.stroke();
      }
      c2.globalAlpha = 1;
    }));
  }

  return () => offs.forEach(f => f());
}, { customEnter: true });
