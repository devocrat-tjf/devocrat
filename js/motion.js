/* ==========================================================================
   DEVOCRAT motion core
   Shared by every world:
   - Smooth scrolling inside the world panel (Lenis)
   - The dot + ring cursor (worlds can restyle or replace it)
   - A toolkit of reveal helpers (split text, enter/leave timelines, …)

   Each world's own effects live in js/worlds/<world>.js and register with
       DevoMotion.world('<id>', api => { …; return cleanup })
   A world's code runs only while that world is open, inside its own GSAP
   context, so effects in one world never touch another. Worlds with no file
   get smooth scroll and the cursor only.
   ========================================================================== */
(() => {
  const view = document.getElementById('worldView');
  if (!view || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const CURSOR_COLORS = { landing: '#d4ad35', modern: '#5b4ff5', elegant: '#b89458', hospital: '#0b95a6', salon: '#d4607c', illus: '#e76f51', mandala: '#c8391f', interior: '#66765a', arch: '#8bbcff', funny: '#ff5d8f', kids: '#ff7a1a', auto: '#e10600', future: '#00e5ff' };

  const WORLDS = {};
  let lenis = null, ctx = null, tick = null, cleanup = null, current = null;

  /* ------------------------------------------------------------------
     Toolkit
     ------------------------------------------------------------------ */
  const q = s => view.querySelectorAll(s);
  const isClipText = el => {
    const cs = getComputedStyle(el);
    return (cs.webkitBackgroundClip || cs.backgroundClip) === 'text';
  };

  // Wrap every word of `el` in spans, keeping inner elements (em, strong, gradient spans …).
  // mode 'mask' → <span.m-w><span.m-wi>word</span></span>; mode 'light' → <span.m-wl>word</span>
  function splitWords(el, mode = 'mask') {
    if (el._mWords) return el._mWords;
    const words = [];
    const make = content => {
      if (mode === 'light') {
        const s = document.createElement('span'); s.className = 'm-wl';
        typeof content === 'string' ? (s.textContent = content) : s.appendChild(content);
        words.push(s); return s;
      }
      const o = document.createElement('span'), i = document.createElement('span');
      o.className = 'm-w'; i.className = 'm-wi';
      typeof content === 'string' ? (i.textContent = content) : i.appendChild(content);
      o.appendChild(i); words.push(i); return o;
    };
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(p => {
            if (!p) return;
            frag.appendChild(/^\s+$/.test(p) ? document.createTextNode(p) : make(p));
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') {
          if (isClipText(n) || n.matches('svg,img,i,.v3-button-mark')) {
            const ph = document.createComment(''); n.replaceWith(ph); ph.replaceWith(make(n));
          } else walk(n);
        }
      });
    };
    walk(el);
    el._mWords = words;
    return words;
  }

  // Play a timeline when `trigger` scrolls in; rewind it (faster) when it scrolls out, top or bottom.
  function inOut(trigger, tl, start = 'top 86%', end = 'bottom 10%', outSpeed = 1.8) {
    ScrollTrigger.create({
      trigger, scroller: view, start, end,
      onEnter: () => tl.timeScale(1).play(),
      onEnterBack: () => tl.timeScale(1).play(),
      onLeave: () => tl.timeScale(outSpeed).reverse(),
      onLeaveBack: () => tl.timeScale(outSpeed).reverse(),
    });
    return tl;
  }
  const tl = () => gsap.timeline({ paused: true });

  // Intro timelines wait while the language question is on screen, so they're actually seen.
  function afterDialog(t) {
    if (!document.querySelector('.lang-dialog')) return t;
    t.pause(0);
    const mo = new MutationObserver(() => {
      if (document.querySelector('.lang-dialog')) return;
      mo.disconnect(); t.restart(true);
    });
    mo.observe(document.body, { childList: true });
    return t;
  }

  const drawPath = (t, el, at, dur = 0.7, ease = 'power2.inOut') => {
    const len = el.getTotalLength ? el.getTotalLength() : 300;
    gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
    t.to(el, { strokeDashoffset: 0, duration: dur, ease }, at);
  };

  // GSAP owns the movement of anything it animates. A CSS `transition` on transform (cards and
  // buttons have one for hover) makes ScrollTrigger's re-measure read a half-finished position and
  // store it as "home", so things end up stuck off-position. Drop transform-type properties from
  // the element's own CSS transition; colour and border transitions keep working.
  const MOVE_PROPS = /^(all|transform|translate|scale|rotate)$/;
  function tame(els) {
    gsap.utils.toArray(els).forEach(el => {
      if (!el || el.nodeType !== 1 || el.dataset.mTamed) return;
      el.dataset.mTamed = '1';
      const cs = getComputedStyle(el);
      const props = cs.transitionProperty.split(',').map(s => s.trim());
      if (!props.some(p => MOVE_PROPS.test(p))) return;
      const durs = cs.transitionDuration.split(','), eases = cs.transitionTimingFunction.split(/,(?![^(]*\))/), dels = cs.transitionDelay.split(',');
      const keep = [];
      props.forEach((p, i) => {
        const tail = ` ${durs[i % durs.length].trim()} ${eases[i % eases.length].trim()} ${dels[i % dels.length].trim()}`;
        if (p === 'all') ['color', 'background-color', 'border-color', 'box-shadow'].forEach(x => keep.push(x + tail));
        else if (!MOVE_PROPS.test(p)) keep.push(p + tail);
      });
      el.style.transition = keep.length ? keep.join(', ') : 'none';
    });
    return els;
  }

  // Smooth-scroll to an element (used by header links and section rails).
  function go(target) {
    if (lenis) lenis.scrollTo(target, { offset: -84, duration: 1.4 });
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }

  // A requestAnimationFrame loop that stops when the world closes or the tab is hidden.
  function loop(fn) {
    let raf = 0, alive = true, last = performance.now();
    const step = now => { if (!alive) return; const dt = Math.min(64, now - last); last = now; if (!document.hidden) fn(dt, now); raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => { alive = false; cancelAnimationFrame(raf); };
  }

  // Elements added to <body> by a world (overlays, canvases) are removed when it closes.
  function own(el, parent = document.body) { parent.appendChild(el); api._owned.push(el); return el; }

  const api = {
    view, gsap, ScrollTrigger, q, reduce, finePointer,
    splitWords, isClipText, inOut, tl, afterDialog, drawPath, tame, go, loop, own,
    get lenis() { return lenis; },
    cursor: null, // filled in below on mouse devices
    _owned: [],
  };

  /* ------------------------------------------------------------------
     Registry + lifecycle
     ------------------------------------------------------------------ */
  window.DevoMotion = {
    world(id, setup, opts = {}) { WORLDS[id] = { setup, opts }; },
    api,
  };

  function stop() {
    if (typeof cleanup === 'function') { try { cleanup(); } catch (_) {} }
    cleanup = null;
    if (ctx) { ctx.revert(); ctx = null; }
    api._owned.splice(0).forEach(el => el.remove());
    if (lenis) { lenis.destroy(); lenis = null; }
    if (tick) { gsap.ticker.remove(tick); tick = null; }
    document.body.removeAttribute('data-m-world');
    current = null;
  }

  // If the section links don't fit in the header (e.g. long Tamil labels), use the Menu button instead,
  // so nothing is pushed off the right edge of the screen.
  function fitNav() {
    const nav = view.querySelector('.worldnav'); if (!nav) return;
    nav.classList.remove('m-compact');
    if (nav.scrollWidth > nav.clientWidth + 2) nav.classList.add('m-compact');
  }
  addEventListener('resize', () => { if (current) fitNav(); });

  function start(id) {
    stop();
    current = id;
    document.body.dataset.mWorld = id;
    // measure now, after the language labels are set, and once the fonts have loaded
    fitNav(); [400, 1500].forEach(ms => setTimeout(() => current === id && fitNav(), ms));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => current === id && fitNav());
    const w = WORLDS[id];
    // some worlds replace the default "circle" entry with their own transition
    if (w && w.opts.customEnter && !reduce) view.classList.add('m-custom-enter');
    if (reduce) return;
    if (window.Lenis) {
      lenis = new Lenis({
        wrapper: view, content: view, lerp: 0.09, smoothWheel: true,
        prevent: n => !!(n.closest && n.closest('.family-panel, textarea, select, iframe, .menu, [data-lenis-prevent]')),
      });
      lenis.on('scroll', ScrollTrigger.update);
      tick = t => lenis && lenis.raf(t * 1000);
      gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0);
    }
    if (!w) return;
    ctx = gsap.context(() => { cleanup = w.setup(api); }, view);
    tame([...view.querySelectorAll('*')].filter(el => el._gsap && !(el instanceof SVGElement)));
    setTimeout(() => current === id && ScrollTrigger.refresh(), 700);
  }

  // Section links in the world header use the smooth scroller.
  view.addEventListener('click', e => {
    const a = e.target.closest('[data-go]'); if (!a || !lenis) return;
    const t = document.getElementById(a.dataset.go); if (!t) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (typeof toggleMenu === 'function') toggleMenu(false);
    go(t);
  }, true);

  addEventListener('devocrat:world', e => {
    const d = e.detail || {};
    setCursorColor(d.open ? d.id : 'landing');
    if (d.open) start(d.id); else { view.classList.remove('m-custom-enter'); stop(); }
  });

  /* ------------------------------------------------------------------
     Cursor: dot follows the mouse exactly, ring trails behind.
     Worlds can change its look with CSS (body[data-m-world="…"]) or
     call api.cursor.hide() and draw their own.
     ------------------------------------------------------------------ */
  function setCursorColor(id) { document.documentElement.style.setProperty('--m-cursor', CURSOR_COLORS[id] || CURSOR_COLORS.landing); }
  setCursorColor('landing');

  if (finePointer) {
    const dot = document.createElement('div'), ring = document.createElement('div'), label = document.createElement('b');
    dot.className = 'm-cursor-dot'; ring.className = 'm-cursor-ring'; ring.appendChild(label);
    dot.setAttribute('aria-hidden', 'true'); ring.setAttribute('aria-hidden', 'true');
    document.body.append(dot, ring);
    const pos = { x: -100, y: -100 }, rp = { x: -100, y: -100 }, vel = { x: 0, y: 0 };
    let scale = 1, scaleTo = 1;
    const body = document.body;
    const listeners = new Set();
    const move = (x, y) => { pos.x = x; pos.y = y; body.classList.add('m-cursor-on'); };
    addEventListener('pointermove', e => { if (e.pointerType === 'mouse') move(e.clientX, e.clientY); }, { passive: true });
    document.addEventListener('pointerleave', () => body.classList.remove('m-cursor-on'));
    addEventListener('blur', () => body.classList.remove('m-cursor-on'));
    addEventListener('pointerdown', () => (scaleTo = 0.78));
    addEventListener('pointerup', () => (scaleTo = 1));
    const follow = reduce ? 1 : 0.17;
    gsap.ticker.add(() => {
      const px = rp.x, py = rp.y;
      rp.x += (pos.x - rp.x) * follow; rp.y += (pos.y - rp.y) * follow;
      vel.x = rp.x - px; vel.y = rp.y - py;
      scale += (scaleTo - scale) * 0.25;
      dot.style.transform = `translate3d(${pos.x}px,${pos.y}px,0) translate(-50%,-50%)`;
      ring.style.transform = `translate3d(${rp.x}px,${rp.y}px,0) translate(-50%,-50%) scale(${scale.toFixed(3)})`;
      listeners.forEach(fn => fn(pos, rp, vel));
    });

    const CLICK = 'a,button,select,label,summary,[role=button],[onclick],.world,.project';
    const TEXT = 'input:not([type=checkbox]):not([type=radio]):not([type=submit]):not([type=button]),textarea';
    const labelFor = el => {
      if (el.dataset.cursor) return el.dataset.cursor;
      if (el.matches('.project')) return 'Try it';
      if (el.matches('a[href^="tel:"]')) return 'Call';
      if (el.matches('a[href^="mailto:"]')) return 'Email';
      if (el.matches('button[type=submit]')) return 'Send';
      return '';
    };
    const setState = target => {
      const t = target && target.closest ? target : null;
      const text = t && t.closest(TEXT), click = !text && t && t.closest(CLICK);
      const lab = click ? labelFor(click) : '';
      body.classList.toggle('m-text', !!text);
      body.classList.toggle('m-hover', !!click && !lab);
      body.classList.toggle('m-label', !!lab);
      if (lab) label.textContent = lab;
    };
    document.addEventListener('pointerover', e => setState(e.target));

    api.cursor = {
      dot, ring, pos, ringPos: rp, vel,
      onMove(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    };

    // The live prototypes run in iframes: keep the cursor moving over them too.
    const origHook = window.hookFrame;
    window.hookFrame = function (f) {
      if (typeof origHook === 'function') origHook(f);
      try {
        const d = f.contentDocument; if (!d || d.__mCursor) return; d.__mCursor = 1;
        d.addEventListener('pointermove', e => {
          if (e.pointerType !== 'mouse') return;
          const r = f.getBoundingClientRect(); move(r.left + e.clientX, r.top + e.clientY);
        }, { passive: true });
        d.addEventListener('pointerover', e => setState(e.target));
      } catch (_) {}
    };
  }
})();
