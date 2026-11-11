/* ==========================================================================
   ARCHITECT — "Built on precision"
   Section map (one signature per section, so effects never overlap):
     Entry ....... SHUTTER BLINDS (W2): vertical blinds close over the universe,
                   then turn open onto the world
     Hero ........ BENDING GRID (A6): the blueprint grid bulges away from the pointer
     Structure ... 3D MODEL ON SCROLL (D1): new section; a 3D building turns and
                   opens floor by floor (Foundation, Data, Logic, Interface).
                   Text in content.js → ARCH_COPY
     About ....... SPLIT-SCREEN OPPOSITE SCROLL (S11): the text column scrolls
                   up while the drawing sheets scroll down
     Buttons ..... FILL WIPE (H2, Architect version): hatching is drawn in from
                   the side the pointer enters, and a dimension line shows the
                   button's width
     Pointer ..... CROSSHAIR WITH COORDINATES (C8): drafting crosshair with live
                   X/Y; the corner brackets snap around whatever you can click
   ========================================================================== */
DevoMotion.world('arch', api => {
  const { view, gsap, q, inOut, tl, afterDialog, finePointer, reduce, loop, own, ScrollTrigger } = api;
  const offs = [];
  const NAVY = '#0d3b6e', SKY = '#8bbcff', ICE = '#e8f1ff';
  const C = window.ARCH_COPY || (typeof ARCH_COPY !== 'undefined' ? ARCH_COPY : {});
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const smooth = x => x * x * (3 - 2 * x);

  /* ---------- ENTRY: shutter blinds (W2) ---------- */
  (() => {
    const N = innerWidth < 700 ? 8 : 14;
    const ov = own(document.createElement('div')); ov.className = 'm-blinds'; ov.setAttribute('aria-hidden', 'true');
    ov.innerHTML = Array.from({ length: N }, () => '<i></i>').join('');
    const slats = ov.querySelectorAll('i');
    view.style.visibility = 'hidden';
    gsap.timeline({ onComplete: () => ov.remove() })
      .fromTo(slats, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 0.42, stagger: 0.025, ease: 'power2.in' })
      .add(() => { view.style.visibility = ''; }, '+=0.08')
      .to(slats, { rotationY: 88, transformPerspective: 900, opacity: 0.2, duration: 0.7, stagger: { each: 0.03, from: 'center' }, ease: 'power2.inOut' })
      .to(ov, { opacity: 0, duration: 0.2 }, '-=0.2');
    offs.push(() => { view.style.visibility = ''; });
  })();

  /* ---------- HERO: bending grid (A6) ---------- */
  const hero = view.querySelector('.whero');
  if (hero) {
    const k = hero.querySelector('.kicker'), h = hero.querySelector('h1'), lead = hero.querySelector('.lead'), obj = hero.querySelector('.hero-object');
    const intro = afterDialog(gsap.timeline({ delay: 0.9 }));
    if (k) intro.from(k, { opacity: 0, x: -20, duration: 0.6, ease: 'power2.out' }, 0);
    if (h) intro.fromTo(h, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.1, ease: 'power3.inOut' }, 0.1);
    if (lead) intro.from(lead, { opacity: 0, y: 12, duration: 0.7 }, 0.7);
    if (obj) intro.from(obj, { opacity: 0, duration: 1 }, 0.2);
    if (!reduce) {
      const cv = document.createElement('canvas'); cv.className = 'm-bendgrid'; cv.setAttribute('aria-hidden', 'true'); hero.prepend(cv);
      const g = cv.getContext('2d'), dpr = Math.min(2, devicePixelRatio || 1);
      let W = 0, H = 0;
      const size = () => { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); dirty = true; };
      let dirty = true;
      const m = { x: -999, y: -999, s: 0 }, aim = { x: -999, y: -999, s: 0 };
      const onMove = e => { const r = cv.getBoundingClientRect(); aim.x = e.clientX - r.left; aim.y = e.clientY - r.top; aim.s = 1; if (m.s < 0.01) { m.x = aim.x; m.y = aim.y; } };
      const onLeave = () => { aim.s = 0; };
      hero.addEventListener('pointermove', onMove); hero.addEventListener('pointerleave', onLeave);
      offs.push(() => { hero.removeEventListener('pointermove', onMove); hero.removeEventListener('pointerleave', onLeave); });
      size(); addEventListener('resize', size); offs.push(() => removeEventListener('resize', size));
      const R = 170, PUSH = 46, STEP = 24;
      const warp = (x, y) => {
        const dx = x - m.x, dy = y - m.y, d2 = dx * dx + dy * dy, f = Math.exp(-d2 / (R * R)) * m.s;
        const d = Math.sqrt(d2) || 1;
        return [x + (dx / d) * PUSH * f, y + (dy / d) * PUSH * f];
      };
      const draw = () => {
        g.clearRect(0, 0, W, H);
        g.fillStyle = NAVY; g.fillRect(0, 0, W, H);
        for (let pass = 0; pass < 2; pass++) {
          const major = pass === 1;
          g.strokeStyle = major ? '#ffffff38' : '#ffffff1c'; g.lineWidth = 1;
          g.beginPath();
          for (let y = 0; y <= H + STEP; y += STEP) {
            if ((Math.round(y / STEP) % 5 === 0) !== major) continue;
            for (let x = 0; x <= W + 12; x += 12) { const [px, py] = warp(x, y); x ? g.lineTo(px, py) : g.moveTo(px, py); }
          }
          for (let x = 0; x <= W + STEP; x += STEP) {
            if ((Math.round(x / STEP) % 5 === 0) !== major) continue;
            for (let y = 0; y <= H + 12; y += 12) { const [px, py] = warp(x, y); y ? g.lineTo(px, py) : g.moveTo(px, py); }
          }
          g.stroke();
        }
        if (m.s > 0.02) { g.strokeStyle = `rgba(139,188,255,${(0.5 * m.s).toFixed(2)})`; g.setLineDash([4, 6]); g.beginPath(); g.arc(m.x, m.y, R * 0.55, 0, 7); g.stroke(); g.setLineDash([]); }
      };
      offs.push(loop(() => {
        const r = hero.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
        const before = m.x + m.y + m.s;
        m.x += (aim.x - m.x) * 0.18; m.y += (aim.y - m.y) * 0.18; m.s += (aim.s - m.s) * 0.08;
        if (dirty || Math.abs(m.x + m.y + m.s - before) > 0.01) { dirty = false; draw(); }
      }));
    }
  }

  /* ---------- general reveals: lines drawn, then content ---------- */
  q('.wsection h2').forEach(h2 => inOut(h2, tl().fromTo(h2, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 -2% 0 0)', duration: 0.8, ease: 'power3.inOut' }), 'top 88%', 'bottom 6%'));
  q('.wsection > .kicker, .wsection .labhead .kicker, .contactgrid .kicker, .wsection .wsub, .labnote, .formnote').forEach(el => inOut(el, tl().from(el, { opacity: 0, x: -14, duration: 0.6, ease: 'power2.out' })));
  const draft = sel => {
    const els = gsap.utils.toArray(q(sel)); if (!els.length) return;
    els.forEach(el => { el.classList.add('m-pop'); el.dataset.mTamed = '1'; });
    inOut(els[0].parentElement, tl().fromTo(els, { opacity: 0, clipPath: 'inset(0 0 100% 0)' }, { opacity: 1, clipPath: 'inset(0 0 0% 0)', duration: 0.7, stagger: 0.08, ease: 'power2.out', clearProps: 'clipPath' }), 'top 84%');
  };
  draft('.servicegrid .service'); draft('.picker .project'); draft('.team .tm');
  q('.devices, .contact-card.enquiry, .offer-soon').forEach(el => inOut(el, tl().from(el, { opacity: 0, y: 26, duration: 0.8, ease: 'power3.out' })));

  /* ---------- STRUCTURE: 3D model on scroll (D1) ---------- */
  const services = view.querySelector('#services');
  if (services && C.model) {
    const M = C.model, F = M.floors || [];
    const sec = document.createElement('section'); sec.className = 'wsection m-model'; sec.id = 'model';
    sec.innerHTML = `<div class="m-model-stick"><div class="m-model-text"><div class="kicker">${M.kicker}</div><h2>${M.title}</h2><p class="wsub">${M.text}</p>
        <ol class="m-model-legend">${F.map((f, i) => `<li data-i="${i}"><b>L0${i + 1}</b><span>${f[0]}</span><small>${f[1]}</small></li>`).reverse().join('')}</ol></div>
      <div class="m-model-stage"><canvas aria-label="A 3D building that opens floor by floor" role="img"></canvas><div class="m-model-labels" aria-hidden="true">${F.map((f, i) => `<span data-i="${i}"><b>L0${i + 1}</b> ${f[0]}</span>`).join('')}</div>
        <p class="m-model-fallback">The 3D view needs a newer browser — here are the layers instead.</p><span class="m-model-scale" aria-hidden="true">SCALE 1:200 · DRAG-FREE · SCROLL TO ROTATE</span></div></div>`;
    services.after(sec);
    const stage = sec.querySelector('.m-model-stage'), canvas = stage.querySelector('canvas');
    const labels = [...stage.querySelectorAll('.m-model-labels span')], legend = [...sec.querySelectorAll('.m-model-legend li')];
    const prog = { p: 0, s: 0 };
    ScrollTrigger.create({ trigger: sec, scroller: view, start: 'top top', end: 'bottom bottom', onUpdate: s => { prog.p = s.progress; }, onRefresh: s => { prog.p = s.progress; } });
    let alive = true;
    offs.push(() => { alive = false; });
    import('three').then(THREE => {
      if (!alive) return;
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
      camera.position.set(16, 11.5, 19); camera.lookAt(0, 4.4, 0);
      const grid = new THREE.GridHelper(26, 26, 0x8bbcff, 0x2a5f99); grid.material.transparent = true; grid.material.opacity = 0.55; scene.add(grid);
      const building = new THREE.Group(); scene.add(building);
      const box = (w, h, d, color, op, edge = 0xe8f1ff) => {
        const g = new THREE.Group(), geo = new THREE.BoxGeometry(w, h, d);
        g.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op, depthWrite: false })));
        g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: edge, transparent: true, opacity: 0.9 })));
        return g;
      };
      const floors = F.map((f, i) => {
        const fl = new THREE.Group();
        if (i === 0) { const plinth = box(6.6, 0.5, 4.8, 0x8bbcff, 0.22); plinth.position.y = 0.25; fl.add(plinth); }
        const slab = box(5.8, 0.16, 4, 0xcfe3ff, 0.25); slab.position.y = i === 0 ? 0.58 : 0.08; fl.add(slab);
        const glass = box(5.3, 0.92, 3.5, 0x8bbcff, 0.1, 0x8bbcff); glass.position.y = (i === 0 ? 0.58 : 0.08) + 0.54; fl.add(glass);
        [[-2.6, -1.7], [2.6, -1.7], [-2.6, 1.7], [2.6, 1.7], [0, -1.7], [0, 1.7]].forEach(([x, z]) => { const c = box(0.14, 0.92, 0.14, 0xe8f1ff, 0.6); c.position.set(x, (i === 0 ? 0.58 : 0.08) + 0.54, z); fl.add(c); });
        if (i === F.length - 1) {
          const roof = box(5.8, 0.16, 4, 0xcfe3ff, 0.25); roof.position.y = 1.16; fl.add(roof);
          const tower = box(1.6, 0.7, 1.2, 0x8bbcff, 0.18); tower.position.set(-1.4, 1.6, -0.6); fl.add(tower);
        }
        fl.userData.base = i === 0 ? 0 : 0.58 + i * 1.08;
        building.add(fl); return fl;
      });
      const v = new THREE.Vector3();
      const resize = () => { const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); prog.s = -1; };
      resize(); addEventListener('resize', resize);
      const stopLoop = loop(() => {
        if (Math.abs(prog.p - prog.s) < 0.0004) return;
        prog.s += (prog.p - prog.s) * 0.14; if (Math.abs(prog.p - prog.s) < 0.0004) prog.s = prog.p;
        const p = prog.s;
        const e = smooth(clamp((p - 0.3) / 0.4));               // explode amount
        building.rotation.y = -0.75 + p * 1.9;
        floors.forEach((fl, i) => {
          const drop = smooth(clamp(p * 6 - i * 0.35));          // floors stack in at the start
          fl.position.y = fl.userData.base + e * i * 1.25 + (1 - drop) * 7;
          fl.visible = drop > 0.01;
        });
        renderer.render(scene, camera);
        const W = stage.clientWidth, H = stage.clientHeight;
        labels.forEach((lb, i) => {
          const fl = floors[i]; v.set(3.1, 0.7, 0); fl.localToWorld(v); v.project(camera);
          lb.style.transform = `translate(${((v.x + 1) / 2 * W).toFixed(1)}px,${((1 - v.y) / 2 * H).toFixed(1)}px)`;
          lb.style.opacity = e.toFixed(2);
        });
        const act = e > 0.5 ? Math.min(F.length - 1, Math.floor(clamp((p - 0.55) / 0.4) * F.length)) : -1;
        legend.forEach(li => li.classList.toggle('on', +li.dataset.i === act));
      });
      offs.push(() => {
        stopLoop(); removeEventListener('resize', resize);
        scene.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
        renderer.dispose();
      });
    }).catch(() => stage.classList.add('m-no3d'));
  }

  /* ---------- ABOUT: split-screen opposite scroll (S11) ---------- */
  const about = view.querySelector('#about'), grid = about && about.querySelector('.aboutgrid');
  if (grid && innerWidth >= 900 && C.sheets) {
    const [left, right] = grid.children;
    left.appendChild(right); left.classList.add('m-split-l');
    const sheet = ([code, name, note], i) => {
      const drawings = [
        `<rect x="40" y="40" width="320" height="200"/><path d="M200 40v120M200 196v44M40 150h100M176 150h24M260 40v80M260 156v84"/><path d="M140 150a36 36 0 0 1 36 -36M200 160a36 36 0 0 0 36 36" stroke-dasharray="3 3"/><path d="M40 262h320M40 256v12M360 256v12"/><text x="200" y="278" text-anchor="middle">12.00</text>`,
        `<path d="M30 250h340"/><rect x="80" y="70" width="240" height="180"/><path d="M80 70l20 -26h200l20 26"/>${Array.from({ length: 3 }, (_, r) => Array.from({ length: 5 }, (_, c) => `<rect x="${98 + c * 44}" y="${88 + r * 52}" width="28" height="36"/>`).join('')).join('')}<path d="M182 250v-40h36v40"/><path d="M350 70v180M344 70h12M344 250h12"/><text x="362" y="164">9.60</text>`,
        `<path d="M30 250h340M60 250V60h280v190"/><path d="M60 120h280M60 185h280" stroke-width="3"/><path d="M90 250l0 -20h24v-20h24v-20h24v-20h24v-20" /><path d="M60 60l140 -30 140 30"/>${Array.from({ length: 12 }, (_, k) => `<path d="M${40 + k * 4} 250 l-14 14" stroke-width=".8"/>`).join('')}<text x="350" y="124">+3.20</text><text x="350" y="189">±0.00</text>`,
      ];
      return `<figure class="m-sheet"><figcaption><b>${code}</b> ${name}<small>${note}</small></figcaption><svg viewBox="0 0 400 300" aria-hidden="true"><g fill="none" stroke="${ICE}" stroke-width="1.6">${drawings[i]}</g></svg><span class="m-sheet-block">DEVOCRAT · ${code} · 1:100</span></figure>`;
    };
    const col = document.createElement('div'); col.className = 'm-split-r';
    col.innerHTML = C.sheets.map(sheet).reverse().join('');
    grid.appendChild(col);
    about.classList.add('m-split');
    // the svg <text> elements must not be drawn as dashes
    const paths = [...col.querySelectorAll('svg path, svg rect')];
    paths.forEach(p => { const L = p.getTotalLength(); p.style.strokeDasharray = `${L} ${L}`; p.style.strokeDashoffset = L; });
    const layout = () => {
      const nav = 80, stickH = view.clientHeight - nav - 20;
      grid.style.height = stickH + 'px';
      const tL = Math.max(160, left.scrollHeight - stickH + 60), tR = Math.max(160, col.scrollHeight - stickH + 60);
      about.style.height = (stickH + Math.max(tL, tR) + nav + 120) + 'px';
      return { tL, tR };
    };
    let tr = layout();
    const t = gsap.timeline({ scrollTrigger: { trigger: about, scroller: view, start: 'top top', end: 'bottom bottom', scrub: 0.5, invalidateOnRefresh: true } });
    t.fromTo(left, { y: 0 }, { y: () => -tr.tL, ease: 'none', duration: 1 }, 0)
      .fromTo(col, { y: () => -tr.tR }, { y: 0, ease: 'none', duration: 1 }, 0)
      .to(paths, { strokeDashoffset: 0, ease: 'none', duration: 0.3, stagger: 0.7 / paths.length }, 0);
    const onResize = () => { tr = layout(); };
    addEventListener('resize', onResize); offs.push(() => removeEventListener('resize', onResize));
  } else {
    q('.aboutgrid .kicker, .about-lead, .aboutgrid .wsub').forEach(el => inOut(el, tl().from(el, { opacity: 0, x: -14, duration: 0.6 })));
    draft('.highlights .service');
  }

  /* ---------- BUTTONS: hatch fill from the entry side + width dimension (H2, Architect) ---------- */
  const dim = own(document.createElement('div'), view); dim.className = 'm-dimline'; dim.setAttribute('aria-hidden', 'true'); dim.innerHTML = '<i></i><b></b><i></i>';
  const dimText = dim.querySelector('b');
  q('.cta, .ghostbtn').forEach(btn => {
    if (btn.closest('.device') || btn.closest('.worldnav')) return;
    btn.classList.add('m-hatch-btn');
    const fill = document.createElement('span'); fill.className = 'm-hatch'; fill.setAttribute('aria-hidden', 'true'); btn.prepend(fill);
    const clipFor = s => ({ left: 'inset(0 100% 0 0)', right: 'inset(0 0 0 100%)', top: 'inset(0 0 100% 0)', bottom: 'inset(100% 0 0 0)' })[s];
    gsap.set(fill, { clipPath: clipFor('left') });
    const side = e => { const r = btn.getBoundingClientRect(); const d = { left: e.clientX - r.left, right: r.right - e.clientX, top: e.clientY - r.top, bottom: r.bottom - e.clientY }; return Object.keys(d).reduce((a, b) => (d[a] < d[b] ? a : b)); };
    btn.addEventListener('pointerenter', e => {
      gsap.fromTo(fill, { clipPath: clipFor(side(e)) }, { clipPath: 'inset(0 0% 0 0%)', duration: 0.4, ease: 'power3.out', overwrite: true });
      const r = btn.getBoundingClientRect();
      dimText.textContent = Math.round(r.width) + ' px';
      gsap.set(dim, { left: r.left, top: r.bottom + 8, width: r.width });
      gsap.fromTo(dim, { opacity: 0, scaleX: 0.2 }, { opacity: 1, scaleX: 1, duration: 0.35, ease: 'power3.out', overwrite: true });
    });
    btn.addEventListener('pointerleave', e => {
      gsap.to(fill, { clipPath: clipFor(side(e)), duration: 0.35, ease: 'power3.in', overwrite: true });
      gsap.to(dim, { opacity: 0, duration: 0.2, overwrite: true });
    });
  });
  const hideDim = () => gsap.set(dim, { opacity: 0 });
  view.addEventListener('scroll', hideDim, { passive: true }); offs.push(() => view.removeEventListener('scroll', hideDim));

  /* ---------- POINTER: crosshair with coordinates (C8) ---------- */
  if (finePointer && api.cursor) {
    const xh = own(document.createElement('div')); xh.className = 'm-xh'; xh.setAttribute('aria-hidden', 'true');
    xh.innerHTML = '<i class="m-xh-h"></i><i class="m-xh-v"></i><span class="m-xh-box"><i></i><i></i><i></i><i></i></span><span class="m-xh-read"></span>';
    const hL = xh.querySelector('.m-xh-h'), vL = xh.querySelector('.m-xh-v'), boxEl = xh.querySelector('.m-xh-box'), read = xh.querySelector('.m-xh-read');
    const CLICK = 'a,button,select,summary,[role=button],[onclick],.project,label,input,textarea';
    let target = null;
    const onOver = e => { target = e.target.closest ? e.target.closest(CLICK) : null; };
    document.addEventListener('pointerover', onOver); offs.push(() => document.removeEventListener('pointerover', onOver));
    const b = { x: 0, y: 0, w: 22, h: 22 };
    const pad = n => String(Math.max(0, Math.round(n))).padStart(4, '0');
    offs.push(api.cursor.onMove(pos => {
      hL.style.transform = `translate3d(0,${pos.y}px,0)`; vL.style.transform = `translate3d(${pos.x}px,0,0)`;
      let tx = pos.x - 11, ty = pos.y - 11, tw = 22, th = 22;
      if (target && target.isConnected) { const r = target.getBoundingClientRect(); if (r.width && r.width < innerWidth * 0.8) { tx = r.left - 6; ty = r.top - 6; tw = r.width + 12; th = r.height + 12; } }
      b.x += (tx - b.x) * 0.25; b.y += (ty - b.y) * 0.25; b.w += (tw - b.w) * 0.25; b.h += (th - b.h) * 0.25;
      boxEl.style.transform = `translate3d(${b.x.toFixed(1)}px,${b.y.toFixed(1)}px,0)`; boxEl.style.width = b.w.toFixed(1) + 'px'; boxEl.style.height = b.h.toFixed(1) + 'px';
      read.textContent = `X ${pad(pos.x)}  Y ${pad(pos.y + view.scrollTop)}`;
      const flipX = pos.x > innerWidth - 150, flipY = pos.y > innerHeight - 50;
      read.style.transform = `translate3d(${pos.x + (flipX ? -142 : 14)}px,${pos.y + (flipY ? -30 : 14)}px,0)`;
    }));
  }

  return () => offs.forEach(f => f());
}, { customEnter: true });
