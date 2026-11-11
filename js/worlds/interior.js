/* ==========================================================================
   INTERIOR — "Spaces designed around you"
   Section map (one signature per section, so effects never overlap):
     Hero ........ DAY AND NIGHT (A10) + TIME-OF-DAY GREETING (P1), Interior
                   version: the room in the hero is lit for the visitor's clock
                   (morning sun, afternoon daylight, evening lamp, night moon),
                   with a light switch to try the others
     Services .... IMAGE PREVIEW ON HOVER (C4): a little room vignette for each
                   service follows the pointer
     The plan .... SKETCH TO COLOUR (S20, Interior version): a blueprint floor
                   plan draws itself, then turns into a coloured, furnished plan
     The room .... ROOM THAT FURNISHES ITSELF (S22): walls, floor, light,
                   furniture and details drop into place as you scroll
     Offers ...... SWATCH PICKER (H12): point at colours to restyle a room
     About ....... BEFORE AND AFTER SLIDER (L2)
     Step inside . WALK-IN ROOM (D6): scrolling walks you into a 3D room
   Text for the new sections lives in content.js → INTERIOR_COPY.
   ========================================================================== */
DevoMotion.world('interior', api => {
  const { view, gsap, q, inOut, tl, afterDialog, finePointer, reduce, loop, own, ScrollTrigger } = api;
  const offs = [];
  const C = window.INTERIOR_COPY || (typeof INTERIOR_COPY !== 'undefined' ? INTERIOR_COPY : {});
  const INK = '#38372f', SAGE = '#66765a', CLAY = '#b5643c', WOOD = '#b08560', LINEN = '#efe8dc', CREAM = '#f8f3ea';
  const NS = 'http://www.w3.org/2000/svg';
  const section = (id, cls, html) => { const s = document.createElement('section'); s.className = 'wsection ' + cls; s.id = id; s.innerHTML = html; return s; };

  /* ---------- HERO: day and night + greeting (A10 + P1) ---------- */
  const hero = view.querySelector('.whero');
  const hr = new Date().getHours();
  const autoMode = hr >= 5 && hr < 11 ? 'morning' : hr >= 11 && hr < 17 ? 'day' : hr >= 17 && hr < 20 ? 'evening' : 'night';
  if (hero) {
    const k = hero.querySelector('.kicker'), h = hero.querySelector('h1'), lead = hero.querySelector('.lead'), ht = hero.querySelector('.herotext');
    const art = hero.querySelector('.hero-object svg');
    // greeting + light switch
    const tod = document.createElement('div'); tod.className = 'm-tod';
    const MODES = [['morning', '☀', 'Morning'], ['day', '☼', 'Afternoon'], ['evening', '◐', 'Evening'], ['night', '☾', 'Night']];
    tod.innerHTML = `<p class="m-tod-greet" aria-live="polite"><b></b> <span></span></p>
      <div class="m-tod-switch" role="group" aria-label="Room lighting">${MODES.map(([m, i, n]) => `<button type="button" data-mode="${m}" data-v3decorated="1" title="${n}"><span aria-hidden="true">${i}</span><em>${n}</em></button>`).join('')}</div>`;
    if (ht) ht.prepend(tod);
    const gB = tod.querySelector('b'), gS = tod.querySelector('span');
    let setLight = () => {};
    if (art) {
      const stops = art.querySelectorAll('#isky stop');
      const alcove = 'M40 530V230a200 200 0 0 1 400 0v300z', win = 'M150 400V230a90 90 0 0 1 180 0v170z';
      const defs = art.querySelector('defs');
      defs.insertAdjacentHTML('beforeend', `<clipPath id="m-win-clip"><path d="${win}"/></clipPath><clipPath id="m-room-clip"><path d="${alcove}"/></clipPath>
        <linearGradient id="m-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3cf" stop-opacity=".55"/><stop offset="1" stop-color="#fff3cf" stop-opacity="0"/></linearGradient>`);
      const windowFrame = art.querySelector('path[fill="url(#isky)"]');
      const sky = document.createElementNS(NS, 'g'); sky.setAttribute('clip-path', 'url(#m-win-clip)');
      sky.innerHTML = `<circle class="m-sun" cx="205" cy="330" r="26" fill="#ffe08a"/>
        <g class="m-moon"><circle cx="280" cy="250" r="20" fill="#f4f1de"/><circle cx="291" cy="243" r="18" fill="#2c3566"/></g>
        <g class="m-stars" fill="#fff">${[[180, 210], [212, 260], [300, 300], [260, 200], [170, 300], [310, 230]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6"/>`).join('')}</g>`;
      windowFrame.after(sky);
      // re-draw the window bars on top of the sky
      const bars = art.querySelector('path[d^="M240 140v260"]'); if (bars) sky.after(bars);
      const lampGlow = art.querySelector('circle[fill="url(#ilamp)"]');
      const dim = document.createElementNS(NS, 'path'); dim.setAttribute('d', alcove); dim.setAttribute('fill', '#141a38'); dim.setAttribute('class', 'm-dim');
      const beam = document.createElementNS(NS, 'path'); beam.setAttribute('d', 'M150 400 L330 400 L392 528 L96 528 Z'); beam.setAttribute('fill', 'url(#m-beam)'); beam.setAttribute('clip-path', 'url(#m-room-clip)');
      lampGlow.before(beam, dim);
      const LOOK = {
        morning: { sky: ['#cfe6f5', '#fde3bd'], sun: [205, 340, 1], moon: 0, stars: 0, beam: 1, dim: 0, lamp: 0.1 },
        day: { sky: ['#a9d6f5', '#eaf5fc'], sun: [240, 236, 1], moon: 0, stars: 0, beam: 0.6, dim: 0, lamp: 0 },
        evening: { sky: ['#f39a62', '#6f4f86'], sun: [290, 380, 0.9], moon: 0, stars: 0, beam: 0, dim: 0.16, lamp: 1 },
        night: { sky: ['#121a3a', '#2c3566'], sun: [205, 420, 0], moon: 1, stars: 1, beam: 0, dim: 0.42, lamp: 1.25 },
      };
      const sun = sky.querySelector('.m-sun'), moon = sky.querySelector('.m-moon'), stars = sky.querySelector('.m-stars');
      setLight = (mode, instant) => {
        const L = LOOK[mode], d = instant ? 0 : 1.1;
        gsap.to(stops[0], { attr: { 'stop-color': L.sky[0] }, duration: d }); gsap.to(stops[1], { attr: { 'stop-color': L.sky[1] }, duration: d });
        gsap.to(sun, { attr: { cx: L.sun[0], cy: L.sun[1] }, opacity: L.sun[2], duration: d, ease: 'power2.inOut' });
        gsap.to(moon, { opacity: L.moon, y: L.moon ? 0 : 30, duration: d });
        gsap.to(stars, { opacity: L.stars, duration: d });
        gsap.to(beam, { opacity: L.beam, duration: d });
        gsap.to(dim, { opacity: L.dim, duration: d });
        gsap.to(lampGlow, { opacity: Math.min(1, L.lamp), scale: L.lamp > 1 ? 1.3 : 1, transformOrigin: '50% 50%', duration: d });
      };
    }
    const apply = (mode, instant) => {
      const g = (C.greetings || {})[mode] || ['', ''];
      gB.textContent = g[0]; gS.textContent = g[1];
      tod.querySelectorAll('[data-mode]').forEach(b => { const on = b.dataset.mode === mode; b.setAttribute('aria-pressed', String(on)); b.classList.toggle('m-auto', b.dataset.mode === autoMode); });
      hero.dataset.mLight = mode;
      setLight(mode, instant);
    };
    apply(autoMode, true);
    tod.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => {
      apply(b.dataset.mode);
      gsap.fromTo(tod.querySelector('.m-tod-greet'), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.5 });
    }));
    const intro = afterDialog(gsap.timeline({ delay: 0.35 }));
    intro.from(tod, { opacity: 0, y: -10, duration: 0.7, ease: 'power2.out' }, 0);
    if (k) intro.from(k, { opacity: 0, duration: 0.6 }, 0.1);
    if (h) intro.from(h, { opacity: 0, y: 30, duration: 1, ease: 'power3.out' }, 0.2);
    if (lead) intro.from(lead, { opacity: 0, y: 14, duration: 0.8 }, 0.5);
    const obj = hero.querySelector('.hero-object'); if (obj) intro.from(obj, { opacity: 0, y: 40, duration: 1.2, ease: 'power3.out' }, 0.15);
  }

  /* ---------- general reveals: things set down gently ---------- */
  q('.wsection h2').forEach(h2 => inOut(h2, tl().from(h2, { opacity: 0, y: 26, duration: 0.9, ease: 'power3.out' }), 'top 88%', 'bottom 6%'));
  q('.wsection > .kicker, .wsection .labhead .kicker, .aboutgrid .kicker, .contactgrid .kicker, .wsection .wsub, .about-lead, .labnote, .formnote').forEach(el => inOut(el, tl().from(el, { opacity: 0, y: 12, duration: 0.7, ease: 'power2.out' })));
  const setDown = sel => {
    const els = gsap.utils.toArray(q(sel)); if (!els.length) return;
    els.forEach(el => { el.classList.add('m-pop'); el.dataset.mTamed = '1'; });
    inOut(els[0].parentElement, tl().fromTo(els, { opacity: 0, '--pop-y': '-26px', '--pop-s': 1.03 }, { opacity: 1, '--pop-y': '0px', '--pop-s': 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }), 'top 84%');
  };
  setDown('.servicegrid .service'); setDown('.highlights .service'); setDown('.picker .project'); setDown('.team .tm');
  q('.devices, .contact-card.enquiry, .offer-soon').forEach(el => inOut(el, tl().from(el, { opacity: 0, y: 30, duration: 0.9, ease: 'power3.out' })));

  /* ---------- SERVICES: image preview on hover (C4) ---------- */
  const VIGNETTES = [
    // Websites: a framed "browser" on the wall above a console table
    `<rect width="240" height="170" fill="#e9dfcf"/><rect y="132" width="240" height="38" fill="#c8ad8a"/><rect x="62" y="22" width="116" height="74" rx="4" fill="${CREAM}" stroke="${INK}" stroke-width="3"/><rect x="62" y="22" width="116" height="12" fill="${SAGE}"/><rect x="72" y="44" width="56" height="8" fill="${CLAY}"/><rect x="72" y="58" width="90" height="5" fill="#cdbfa8"/><rect x="72" y="68" width="74" height="5" fill="#cdbfa8"/><rect x="50" y="112" width="140" height="8" fill="${WOOD}"/><path d="M58 120v30M182 120v30" stroke="${WOOD}" stroke-width="5"/><path d="M76 112c0-14 6-20 10-20s10 6 10 20z" fill="${SAGE}"/>`,
    // Web applications: a desk with a big monitor showing a dashboard
    `<rect width="240" height="170" fill="#dfe3d6"/><rect y="132" width="240" height="38" fill="#b9a284"/><rect x="58" y="30" width="124" height="74" rx="5" fill="${INK}"/><rect x="66" y="38" width="108" height="58" fill="${CREAM}"/><g fill="${SAGE}"><rect x="74" y="72" width="12" height="18"/><rect x="92" y="62" width="12" height="28"/><rect x="110" y="52" width="12" height="38" fill="${CLAY}"/><rect x="128" y="66" width="12" height="24"/></g><circle cx="158" cy="56" r="10" fill="none" stroke="${CLAY}" stroke-width="5"/><path d="M114 104v12M96 118h48" stroke="${INK}" stroke-width="4"/><rect x="30" y="118" width="180" height="8" fill="${WOOD}"/>`,
    // Mobile apps: an armchair with a glowing phone on the side table
    `<rect width="240" height="170" fill="#efe1d2"/><rect y="132" width="240" height="38" fill="#c8ad8a"/><path d="M50 140v-44c0-14 10-24 24-24h52c14 0 24 10 24 24v44z" fill="${SAGE}"/><path d="M40 140v-30c0-8 6-12 12-12s12 4 12 12v30zM136 140v-30c0-8 6-12 12-12s12 4 12 12v30z" fill="#55644a"/><rect x="176" y="104" width="40" height="6" fill="${WOOD}"/><path d="M182 110v30M210 110v30" stroke="${WOOD}" stroke-width="4"/><rect x="186" y="84" width="16" height="22" rx="3" fill="${INK}"/><rect x="188" y="87" width="12" height="15" fill="#ffe7a8"/><circle cx="194" cy="94" r="18" fill="#ffe7a8" opacity=".35"/>`,
    // Custom software: a workshop wall of shelves, boxes and a gear
    `<rect width="240" height="170" fill="#e6ddd0"/><rect y="132" width="240" height="38" fill="#a98f6f"/><path d="M30 50h180M30 92h180" stroke="${WOOD}" stroke-width="6"/><rect x="40" y="26" width="30" height="24" fill="${CLAY}"/><rect x="76" y="32" width="22" height="18" fill="${SAGE}"/><rect x="150" y="20" width="40" height="30" fill="#cdbfa8" stroke="${INK}" stroke-width="2"/><rect x="44" y="70" width="44" height="22" fill="#cdbfa8" stroke="${INK}" stroke-width="2"/><g transform="translate(150 74)"><circle r="14" fill="${INK}"/><circle r="5" fill="#e6ddd0"/>${Array.from({ length: 8 }, (_, i) => `<rect x="-3" y="-19" width="6" height="7" fill="${INK}" transform="rotate(${i * 45})"/>`).join('')}</g><rect x="40" y="112" width="160" height="10" fill="${WOOD}"/>`,
  ];
  const svcs = [...q('.servicegrid .service')];
  if (finePointer && svcs.length) {
    const peek = own(document.createElement('div'), view); peek.className = 'm-peek'; peek.setAttribute('aria-hidden', 'true');
    peek.innerHTML = '<div class="m-peek-card"><svg viewBox="0 0 240 170"></svg><small></small></div>';
    const card = peek.querySelector('.m-peek-card'), pSvg = peek.querySelector('svg'), cap = peek.querySelector('small');
    const p = { x: -400, y: -400 }, cur = { x: -400, y: -400 }; let shown = false, active = -1;
    const show = i => {
      if (active !== i) { active = i; pSvg.innerHTML = VIGNETTES[i % VIGNETTES.length]; cap.textContent = svcs[i].querySelector('h3')?.textContent || ''; }
      if (!shown) { shown = true; cur.x = p.x; cur.y = p.y; gsap.fromTo(card, { clipPath: 'inset(100% 0 0 0 round 120px 120px 10px 10px)', scale: 0.9 }, { clipPath: 'inset(0% 0 0 0 round 120px 120px 10px 10px)', scale: 1, duration: 0.45, ease: 'power3.out', overwrite: true }); }
      else gsap.fromTo(pSvg, { opacity: 0.2 }, { opacity: 1, duration: 0.3 });
    };
    const hide = () => { shown = false; gsap.to(card, { clipPath: 'inset(0% 0 100% 0 round 120px 120px 10px 10px)', duration: 0.3, ease: 'power2.in', overwrite: true }); };
    svcs.forEach((s, i) => { s.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') show(i); }); s.addEventListener('pointerleave', hide); });
    const onMove = e => { p.x = e.clientX; p.y = e.clientY; };
    view.addEventListener('pointermove', onMove, { passive: true }); offs.push(() => view.removeEventListener('pointermove', onMove));
    gsap.set(card, { clipPath: 'inset(100% 0 0 0 round 120px 120px 10px 10px)' });
    offs.push(loop(() => {
      const dx = p.x - cur.x; cur.x += dx * 0.16; cur.y += (p.y - cur.y) * 0.16;
      peek.style.transform = `translate3d(${(cur.x + 26).toFixed(1)}px,${(cur.y - 190).toFixed(1)}px,0) rotate(${Math.max(-8, Math.min(8, dx * 0.08)).toFixed(2)}deg)`;
    }));
  }

  /* ---------- THE PLAN: blueprint → coloured plan (S20, Interior version) ---------- */
  const services = view.querySelector('#services');
  let anchor = services;
  if (services && C.plan) {
    const sec = section('plan', 'm-plan', `<div class="kicker">${C.plan.kicker}</div><h2>${C.plan.title}</h2><p class="wsub">${C.plan.text}</p>
      <div class="m-plan-sheet"><svg viewBox="0 0 640 420" role="img" aria-label="A floor plan that turns from a blueprint into a coloured plan">
      <defs><pattern id="m-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#ffffff" stroke-opacity=".14" stroke-width="1"/></pattern>
        <pattern id="m-wood" width="40" height="12" patternUnits="userSpaceOnUse"><rect width="40" height="12" fill="#d2ad7e"/><path d="M0 12h40M20 0v6M6 6v6M34 6v6" stroke="#b98d5c" stroke-width="1.2"/></pattern>
        <pattern id="m-tile" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#e8e1d4"/><path d="M16 0H0V16" fill="none" stroke="#c9bda8" stroke-width="1"/></pattern></defs>
      <rect class="m-plan-bg" width="640" height="420" fill="#1d3a5f"/><rect class="m-plan-grid" width="640" height="420" fill="url(#m-grid)"/>
      <g class="m-plan-floors"><rect x="20" y="20" width="340" height="240" fill="url(#m-wood)"/><rect x="360" y="20" width="260" height="230" fill="#d9c3b0"/><rect x="20" y="260" width="180" height="140" fill="url(#m-tile)"/><rect x="200" y="250" width="420" height="150" fill="#e2cfb3"/></g>
      <g class="m-plan-furn" stroke-width="2.4">
        <rect class="ln" x="60" y="190" width="170" height="46" rx="8" fill="${SAGE}"/><rect class="ln" x="60" y="190" width="170" height="14" rx="6" fill="#55644a"/>
        <ellipse class="ln" cx="150" cy="140" rx="96" ry="44" fill="${CLAY}" fill-opacity=".55"/><rect class="ln" x="110" y="122" width="80" height="36" rx="4" fill="${WOOD}"/>
        <rect class="ln" x="268" y="60" width="54" height="54" rx="10" fill="#c8a47a"/>
        <rect class="ln" x="440" y="60" width="140" height="120" rx="6" fill="${CREAM}"/><rect class="ln" x="450" y="66" width="54" height="26" rx="5" fill="#fff"/><rect class="ln" x="516" y="66" width="54" height="26" rx="5" fill="#fff"/><rect class="ln" x="440" y="104" width="140" height="76" rx="4" fill="#9fb0c4"/>
        <rect class="ln" x="370" y="30" width="44" height="90" fill="${WOOD}"/>
        <path class="ln" d="M30 270h160v34H64v86H30z" fill="#cfc6b6"/><circle class="ln" cx="96" cy="287" r="9" fill="none"/><circle class="ln" cx="130" cy="287" r="9" fill="none"/>
        <circle class="ln" cx="410" cy="325" r="46" fill="${WOOD}"/><rect class="ln" x="398" y="258" width="24" height="18" rx="4" fill="${SAGE}"/><rect class="ln" x="398" y="374" width="24" height="18" rx="4" fill="${SAGE}"/><rect class="ln" x="338" y="313" width="18" height="24" rx="4" fill="${SAGE}"/><rect class="ln" x="464" y="313" width="18" height="24" rx="4" fill="${SAGE}"/>
        <circle class="ln" cx="580" cy="368" r="18" fill="#7d8a63"/>
      </g>
      <g class="m-plan-walls" fill="none" stroke-linecap="square">
        <rect class="ln" x="20" y="20" width="600" height="380" stroke-width="8"/>
        <path class="ln" d="M360 20V170M360 222V250H440M492 250H620M200 260V290M200 344V400M20 260H110M162 260H200" stroke-width="6"/>
        <path class="ln" d="M360 170a52 52 0 0 1 52 52M440 250a52 52 0 0 0 52 -52M200 290a54 54 0 0 1 54 54M110 260a52 52 0 0 0 52 52" stroke-width="1.6" stroke-dasharray="4 4"/>
        <path class="ln" d="M80 16v8M80 16h120M80 24h120M200 16v8M440 396v8M440 396h120M440 404h120M560 396v8" stroke-width="2"/>
      </g>
      <g class="m-plan-labels" font-family="Jost, sans-serif" font-size="13" letter-spacing="3" text-anchor="middle"><text x="190" y="90">LIVING</text><text x="490" y="215">BEDROOM</text><text x="110" y="380">KITCHEN</text><text x="530" y="300">DINING</text></g>
      </svg><span class="m-plan-stamp" aria-hidden="true">BLUEPRINT</span></div>`);
    services.after(sec); anchor = sec;
    const svg = sec.querySelector('svg'), lines = [...svg.querySelectorAll('.ln')];
    lines.forEach(l => { const L = l.getTotalLength(); l.style.strokeDasharray = L; l.style.strokeDashoffset = L; });
    gsap.set(svg.querySelectorAll('.m-plan-walls, .m-plan-furn'), { stroke: '#e8f1ff' });
    gsap.set(svg.querySelectorAll('.m-plan-furn .ln'), { fillOpacity: 0 });
    gsap.set(svg.querySelector('.m-plan-floors'), { opacity: 0 });
    gsap.set(svg.querySelector('.m-plan-labels'), { fill: '#e8f1ff', opacity: 0 });
    const stamp = sec.querySelector('.m-plan-stamp');
    const t = gsap.timeline({ scrollTrigger: { trigger: sec.querySelector('.m-plan-sheet'), scroller: view, start: 'top 80%', end: 'bottom 88%', scrub: 0.6 } });
    t.to(lines, { strokeDashoffset: 0, duration: 1.2, stagger: 0.04, ease: 'none' }, 0)
      .to(svg.querySelector('.m-plan-labels'), { opacity: 1, duration: 0.3 }, 0.8)
      .to(svg.querySelector('.m-plan-bg'), { attr: { fill: '#f3ede2' }, duration: 0.6 }, 1.6)
      .to(svg.querySelector('.m-plan-grid'), { opacity: 0, duration: 0.6 }, 1.6)
      .to(svg.querySelectorAll('.m-plan-walls, .m-plan-furn'), { stroke: INK, duration: 0.6 }, 1.6)
      .to(svg.querySelector('.m-plan-labels'), { fill: INK, duration: 0.6 }, 1.6)
      .to(stamp, { opacity: 0, rotation: -20, scale: 0.6, duration: 0.4 }, 1.6)
      .to(svg.querySelector('.m-plan-floors'), { opacity: 1, duration: 0.6 }, 2.0)
      .to(svg.querySelectorAll('.m-plan-furn .ln'), { fillOpacity: 1, duration: 0.5, stagger: 0.03 }, 2.3);
  }

  /* ---------- THE ROOM: furnishes itself as you scroll (S22) ---------- */
  if (anchor && C.room) {
    const steps = C.room.steps || [];
    const sec = section('room', 'm-room', `<div class="m-room-stick">
      <div class="m-room-text"><div class="kicker">${C.room.kicker}</div><h2>${C.room.title}</h2>
        <ol class="m-room-steps">${steps.map((s, i) => `<li data-i="${i}"><b>0${i + 1}</b>${s}</li>`).join('')}</ol></div>
      <div class="m-room-scene"><svg viewBox="0 0 800 500" role="img" aria-label="A living room being furnished">
        <defs><pattern id="m-floorboards" width="80" height="20" patternUnits="userSpaceOnUse"><rect width="80" height="20" fill="#c49a6c"/><path d="M0 20h80M40 0v10M10 10v10M66 10v10" stroke="#a57c50" stroke-width="1.4"/></pattern>
          <radialGradient id="m-pglow"><stop offset="0" stop-color="#ffe3a3" stop-opacity=".9"/><stop offset="1" stop-color="#ffe3a3" stop-opacity="0"/></radialGradient></defs>
        <rect width="800" height="500" fill="#f4efe6"/>
        <g class="r-wall"><rect width="800" height="384" fill="#e3d6c3"/><rect y="372" width="800" height="12" fill="#cdb79a"/>
          <g class="r-window"><rect x="520" y="70" width="200" height="210" rx="100" ry="100" fill="#cfe2ee" stroke="#8b6b4a" stroke-width="8"/><path d="M620 74v202M524 180h192" stroke="#8b6b4a" stroke-width="5"/></g></g>
        <rect class="r-floor" y="384" width="800" height="116" fill="url(#m-floorboards)"/>
        <g class="r-light"><path d="M330 0v120" stroke="${INK}" stroke-width="2.4"/><circle class="r-glow" cx="330" cy="150" r="120" fill="url(#m-pglow)"/><path d="M296 150c0-24 14-34 34-34s34 10 34 34z" fill="${CLAY}"/></g>
        <g class="r-rug"><ellipse cx="350" cy="452" rx="230" ry="30" fill="${SAGE}" opacity=".85"/><ellipse cx="350" cy="452" rx="196" ry="22" fill="none" stroke="${CREAM}" stroke-width="3" stroke-dasharray="10 8"/></g>
        <g class="r-sofa"><path d="M150 440v-80c0-22 16-36 38-36h244c22 0 38 14 38 36v80z" fill="#7d8a63"/><path d="M130 444v-56c0-12 9-20 20-20s20 8 20 20v56zM450 444v-56c0-12 9-20 20-20s20 8 20 20v56z" fill="${SAGE}"/><rect x="170" y="390" width="280" height="30" rx="10" fill="#8e9a73"/><rect x="196" y="350" width="60" height="44" rx="10" fill="#e2c27a"/><rect x="372" y="350" width="60" height="44" rx="10" fill="${CLAY}"/><path d="M160 444v12M460 444v12" stroke="#5c4b3b" stroke-width="6"/></g>
        <g class="r-table"><rect x="270" y="440" width="150" height="12" rx="3" fill="${WOOD}"/><path d="M286 452v20M404 452v20" stroke="#8b6b4a" stroke-width="6"/><path d="M330 440v-18h14v18" fill="${CREAM}" stroke="${INK}" stroke-width="2"/></g>
        <g class="r-plant"><path d="M60 470h56l-8 -56H68z" fill="${CLAY}"/><g class="r-leaves" fill="${SAGE}"><ellipse cx="74" cy="374" rx="12" ry="42" transform="rotate(-24 74 374)"/><ellipse cx="102" cy="368" rx="12" ry="46" transform="rotate(16 102 368)"/><ellipse cx="88" cy="352" rx="11" ry="48"/><ellipse cx="58" cy="398" rx="9" ry="30" transform="rotate(-50 58 398)"/></g></g>
        <g class="r-art"><path d="M230 60l40 -20 40 20" fill="none" stroke="${INK}" stroke-width="1.6"/><rect x="200" y="60" width="140" height="100" fill="${CREAM}" stroke="${WOOD}" stroke-width="8"/><circle cx="246" cy="100" r="18" fill="${CLAY}"/><path d="M212 150l40-34 30 22 22-14 28 26z" fill="${SAGE}"/></g>
        <g class="r-lamp"><path d="M740 470V250" stroke="${INK}" stroke-width="5"/><path d="M712 260l28 -40 28 40z" fill="${CREAM}" stroke="${INK}" stroke-width="3"/><path d="M720 470h40" stroke="${INK}" stroke-width="6"/></g>
      </svg></div></div>`);
    anchor.after(sec); anchor = sec;
    const g = s => sec.querySelector(s);
    const items = [...sec.querySelectorAll('.m-room-steps li')];
    const t = gsap.timeline({ scrollTrigger: { trigger: sec, scroller: view, start: 'top top', end: 'bottom bottom', scrub: 0.7,
      onUpdate: s => { const k = Math.min(items.length - 1, Math.floor(s.progress * items.length * 1.05)); items.forEach((li, i) => { li.classList.toggle('on', i === k && s.progress > 0.02); li.classList.toggle('done', i < k); }); } } });
    t.from(g('.r-wall'), { y: -400, duration: 1, ease: 'power2.out' }, 0)
      .from(g('.r-window'), { scale: 0, transformOrigin: '50% 50%', duration: 0.6, ease: 'back.out(1.6)' }, 0.8)
      .from(g('.r-floor'), { y: 140, duration: 0.8, ease: 'power2.out' }, 1.4)
      .from(g('.r-light'), { y: -180, duration: 0.8, ease: 'bounce.out' }, 2.2)
      .from(g('.r-glow'), { opacity: 0, duration: 0.4 }, 2.9)
      .from(g('.r-rug'), { scaleX: 0, transformOrigin: '20% 50%', duration: 0.7, ease: 'power2.out' }, 3.3)
      .from(g('.r-sofa'), { y: -520, duration: 0.9, ease: 'bounce.out' }, 3.7)
      .from(g('.r-table'), { y: -520, duration: 0.8, ease: 'bounce.out' }, 4.2)
      .from(g('.r-plant'), { x: -160, opacity: 0, duration: 0.6, ease: 'power2.out' }, 5)
      .from(g('.r-leaves'), { scaleY: 0, transformOrigin: '50% 100%', duration: 0.6, ease: 'back.out(2)' }, 5.3)
      .from(g('.r-art'), { y: -240, rotation: -12, transformOrigin: '50% 0%', duration: 0.9, ease: 'elastic.out(1, 0.5)' }, 5.6)
      .from(g('.r-lamp'), { x: 140, opacity: 0, duration: 0.6, ease: 'power2.out' }, 6.1)
      .to({}, { duration: 0.5 });
  }

  /* ---------- OFFERS: swatch picker (H12) ---------- */
  const offers = view.querySelector('#offers');
  if (offers && C.palette) {
    const SW = {
      wall: [['#e3d6c3', 'Linen'], ['#c9d3c0', 'Sage mist'], ['#ecc8b6', 'Terracotta blush'], ['#cfd8e3', 'Sky grey']],
      sofa: [['#7d8a63', 'Olive'], ['#b5643c', 'Rust'], ['#38372f', 'Charcoal'], ['#c8a47a', 'Camel']],
      accent: [['#e2c27a', 'Mustard'], ['#b5643c', 'Clay'], ['#66765a', 'Fern'], ['#8b6b9e', 'Plum']],
    };
    const box = document.createElement('div'); box.className = 'm-swatch';
    box.innerHTML = `<div class="m-swatch-room"><svg viewBox="0 0 520 300" role="img" aria-label="A room you can restyle">
        <rect class="sw-wall" width="520" height="230" fill="${SW.wall[0][0]}"/><rect y="222" width="520" height="8" fill="#0000001a"/><rect y="230" width="520" height="70" fill="#c49a6c"/>
        <rect class="sw-acc" x="70" y="40" width="110" height="80" fill="${SW.accent[0][0]}" stroke="${WOOD}" stroke-width="6"/><circle cx="110" cy="74" r="14" fill="${CREAM}" opacity=".8"/>
        <ellipse class="sw-acc" cx="260" cy="278" rx="200" ry="18" fill="${SW.accent[0][0]}" opacity=".8"/>
        <path class="sw-sofa" d="M120 270v-64c0-18 13-30 30-30h220c17 0 30 12 30 30v64z" fill="${SW.sofa[0][0]}"/>
        <path class="sw-sofa2" d="M104 272v-46c0-10 8-16 16-16s16 6 16 16v46zM384 272v-46c0-10 8-16 16-16s16 6 16 16v46z" fill="${SW.sofa[0][0]}"/>
        <rect x="138" y="226" width="246" height="24" rx="8" fill="#ffffff22"/>
        <rect class="sw-acc" x="160" y="192" width="54" height="40" rx="9" fill="${SW.accent[0][0]}"/><rect class="sw-acc" x="306" y="192" width="54" height="40" rx="9" fill="${SW.accent[0][0]}"/>
        <path d="M440 280h50l-7 -46h-36z" fill="${CLAY}"/><g fill="${SAGE}"><ellipse cx="454" cy="200" rx="9" ry="34" transform="rotate(-20 454 200)"/><ellipse cx="476" cy="196" rx="9" ry="36" transform="rotate(16 476 196)"/><ellipse cx="465" cy="186" rx="8" ry="38"/></g>
      </svg></div>
      <div class="m-swatch-panel"><h3>${C.palette.title}</h3><p class="wsub">${C.palette.text}</p>
        ${Object.entries(SW).map(([part, list]) => `<div class="m-swatch-row" data-part="${part}"><span>${{ wall: 'Walls', sofa: 'Sofa', accent: 'Accents' }[part]}</span><div>${list.map(([c, n], i) => `<button type="button" data-c="${c}" aria-label="${n}" title="${n}" aria-pressed="${i === 0}" style="--c:${c}" data-v3decorated="1"></button>`).join('')}</div><em>${list[0][1]}</em></div>`).join('')}
      </div>`;
    offers.appendChild(box);
    const svg = box.querySelector('svg');
    const targets = { wall: svg.querySelectorAll('.sw-wall'), sofa: svg.querySelectorAll('.sw-sofa, .sw-sofa2'), accent: svg.querySelectorAll('.sw-acc') };
    const kept = { wall: SW.wall[0], sofa: SW.sofa[0], accent: SW.accent[0] };
    const paint = (part, c) => gsap.to(targets[part], { fill: c, duration: 0.45, ease: 'power2.out', overwrite: true });
    box.querySelectorAll('.m-swatch-row').forEach(row => {
      const part = row.dataset.part, label = row.querySelector('em');
      row.querySelectorAll('button').forEach(b => {
        const name = b.getAttribute('aria-label');
        b.addEventListener('pointerenter', () => { paint(part, b.dataset.c); label.textContent = name; });
        b.addEventListener('focus', () => { paint(part, b.dataset.c); label.textContent = name; });
        b.addEventListener('click', () => { kept[part] = [b.dataset.c, name]; row.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); paint(part, b.dataset.c); gsap.fromTo(b, { scale: 0.8 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' }); });
      });
      const revert = () => { paint(part, kept[part][0]); label.textContent = kept[part][1]; };
      row.addEventListener('pointerleave', revert); row.addEventListener('focusout', e => { if (!row.contains(e.relatedTarget)) revert(); });
    });
    inOut(box, tl().from(box.querySelector('.m-swatch-room'), { opacity: 0, x: -30, duration: 0.8, ease: 'power3.out' }).from(box.querySelectorAll('.m-swatch-row button'), { scale: 0, duration: 0.4, stagger: 0.03, ease: 'back.out(3)' }, 0.3), 'top 84%');
  }

  /* ---------- ABOUT: before and after slider (L2) ---------- */
  const about = view.querySelector('#about');
  if (about && C.compare) {
    const scene = after => `<svg viewBox="0 0 800 420" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      ${after ? `<rect width="800" height="320" fill="#e3d6c3"/><rect y="312" width="800" height="8" fill="#cdb79a"/><rect y="320" width="800" height="100" fill="#c49a6c"/><path d="M0 340h800M0 362h800M0 386h800M120 320v20M300 340v22M520 320v20M640 362v24M200 386v34M460 386v34" stroke="#a57c50" stroke-width="1.4"/>
        <rect x="520" y="60" width="190" height="190" rx="95" fill="#cfe2ee" stroke="#8b6b4a" stroke-width="8"/><path d="M615 64v182M524 160h182" stroke="#8b6b4a" stroke-width="5"/>
        <path d="M300 0v90" stroke="${INK}" stroke-width="2"/><circle cx="300" cy="120" r="90" fill="#ffe3a3" opacity=".45"/><path d="M268 120c0-22 14-32 32-32s32 10 32 32z" fill="${CLAY}"/>
        <rect x="140" y="80" width="120" height="90" fill="${CREAM}" stroke="${WOOD}" stroke-width="7"/><circle cx="180" cy="114" r="15" fill="${CLAY}"/><path d="M150 162l36-30 26 20 20-12 22 22z" fill="${SAGE}"/>
        <ellipse cx="340" cy="384" rx="230" ry="26" fill="${SAGE}" opacity=".85"/>
        <path d="M150 380v-70c0-20 14-32 34-32h232c20 0 34 12 34 32v70z" fill="#7d8a63"/><path d="M130 384v-50c0-11 9-18 20-18s20 7 20 18v50zM430 384v-50c0-11 9-18 20-18s20 7 20 18v50z" fill="${SAGE}"/><rect x="190" y="304" width="56" height="40" rx="10" fill="#e2c27a"/><rect x="354" y="304" width="56" height="40" rx="10" fill="${CLAY}"/>
        <path d="M60 400h56l-8 -54H68z" fill="${CLAY}"/><g fill="${SAGE}"><ellipse cx="74" cy="310" rx="12" ry="40" transform="rotate(-22 74 310)"/><ellipse cx="100" cy="306" rx="12" ry="44" transform="rotate(16 100 306)"/><ellipse cx="88" cy="292" rx="11" ry="46"/></g>
        <path d="M740 400V200" stroke="${INK}" stroke-width="5"/><path d="M712 210l28 -40 28 40z" fill="${CREAM}" stroke="${INK}" stroke-width="3"/><circle cx="740" cy="210" r="60" fill="#ffe3a3" opacity=".35"/>`
      : `<rect width="800" height="320" fill="#c9c4bb"/><path d="M80 40c40 10 30 60 70 50s20 50 60 40M600 280c20-30 60-10 80-40" stroke="#b3ada2" stroke-width="18" fill="none" opacity=".6"/><rect y="320" width="800" height="100" fill="#a9a59e"/><path d="M0 320h800" stroke="#8f8b84" stroke-width="3"/><path d="M120 350l40 10M500 380l60-6M300 400l30 4" stroke="#8f8b84" stroke-width="2"/>
        <rect x="520" y="60" width="190" height="190" fill="#dfe6ea" stroke="#8a8a8a" stroke-width="8"/><path d="M615 64v182M524 160h182" stroke="#8a8a8a" stroke-width="5"/><path d="M540 80l40 40" stroke="#fff" stroke-width="3" opacity=".6"/>
        <path d="M300 0v130" stroke="#555" stroke-width="2"/><circle cx="300" cy="140" r="11" fill="#f3efc8" stroke="#777" stroke-width="2"/>
        <rect x="170" y="300" width="110" height="80" fill="#c8a777" stroke="#8c7350" stroke-width="3"/><path d="M170 318h110M225 300v18" stroke="#8c7350" stroke-width="3"/><rect x="290" y="330" width="80" height="50" fill="#b9975f" stroke="#8c7350" stroke-width="3"/><path d="M290 344h80" stroke="#8c7350" stroke-width="3"/>
        <path d="M470 380v-60h60v60M470 340h60M470 320v-50h60v50" fill="none" stroke="#6f6a63" stroke-width="6"/>`}</svg>`;
    const ba = document.createElement('div'); ba.className = 'm-ba-wrap';
    ba.innerHTML = `<h3>${C.compare.title}</h3><p class="wsub">${C.compare.text}</p>
      <div class="m-ba" data-lenis-prevent style="--p:50%"><div class="m-ba-before">${scene(false)}</div><div class="m-ba-after">${scene(true)}</div>
        <span class="m-ba-tag m-ba-tag-b" aria-hidden="true">Before</span><span class="m-ba-tag m-ba-tag-a" aria-hidden="true">After</span>
        <span class="m-ba-handle" aria-hidden="true"><i>‹ ›</i></span>
        <input type="range" min="0" max="100" value="50" aria-label="Compare before and after: slide to reveal more of the designed room"></div>`;
    about.appendChild(ba);
    const box = ba.querySelector('.m-ba'), range = ba.querySelector('input');
    const set = v => box.style.setProperty('--p', v + '%');
    range.addEventListener('input', () => set(range.value));
    // the handle sweeps once to show it can move
    const hint = { v: 50 };
    inOut(box, tl().from(box, { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out' })
      .fromTo(hint, { v: 88 }, { v: 50, duration: 1.4, ease: 'power3.inOut', onUpdate: () => { set(hint.v.toFixed(1)); range.value = Math.round(hint.v); } }, 0.4), 'top 80%');
  }

  /* ---------- STEP INSIDE: walk-in 3D room (D6) ---------- */
  const contact = view.querySelector('#contact');
  if (contact && C.walk) {
    const W = 1000, H = 600, D = 1800;
    const stand = (cls, x, z, w, h, svg) => `<div class="m-3d-item ${cls}" data-z="${z}" style="width:${w}px;height:${h}px;transform:translate3d(${x - w / 2}px,${H / 2 - h}px,${z}px)">${svg}</div>`;
    const sec = section('walk', 'm-walk', `<div class="m-walk-stage">
      <div class="m-walk-room" style="--w:${W}px;--h:${H}px;--d:${D}px">
        <div class="m-face m-floor"></div><div class="m-face m-ceil"><i></i></div><div class="m-face m-left"><span class="m-3d-frame"></span></div><div class="m-face m-right"><span class="m-3d-window"></span></div>
        <div class="m-face m-back"><div class="m-back-art"><p>${C.walk.wall}</p><button type="button" class="m-walk-cta" data-go="contact" data-v3decorated="1">${C.walk.button}</button></div></div>
        <div class="m-face m-rug3d"></div>
        ${stand('m-sofa3d', -300, -1150, 360, 170, `<svg viewBox="0 0 360 170"><path d="M30 165v-100c0-22 16-38 38-38h224c22 0 38 16 38 38v100z" fill="#7d8a63"/><path d="M0 168v-70c0-12 10-20 22-20s22 8 22 20v70zM316 168v-70c0-12 10-20 22-20s22 8 22 20v70z" fill="${SAGE}"/><rect x="50" y="98" width="260" height="34" rx="10" fill="#8e9a73"/><rect x="70" y="56" width="60" height="44" rx="10" fill="#e2c27a"/><rect x="230" y="56" width="60" height="44" rx="10" fill="${CLAY}"/></svg>`)}
        ${stand('m-plant3d', 390, -700, 120, 230, `<svg viewBox="0 0 120 230"><path d="M30 228h60l-8 -70H38z" fill="${CLAY}"/><g fill="${SAGE}"><ellipse cx="44" cy="110" rx="14" ry="56" transform="rotate(-20 44 110)"/><ellipse cx="78" cy="104" rx="14" ry="60" transform="rotate(16 78 104)"/><ellipse cx="60" cy="86" rx="13" ry="64"/></g></svg>`)}
        ${stand('m-lamp3d', 330, -1400, 90, 330, `<svg viewBox="0 0 90 330"><path d="M45 330V60" stroke="${INK}" stroke-width="6"/><path d="M10 70l35 -56 35 56z" fill="${CREAM}" stroke="${INK}" stroke-width="3"/><circle cx="45" cy="70" r="44" fill="#ffe3a3" opacity=".4"/><path d="M20 326h50" stroke="${INK}" stroke-width="8"/></svg>`)}
        ${stand('m-chair3d', -380, -500, 170, 190, `<svg viewBox="0 0 170 190"><path d="M20 186v-96c0-24 18-40 42-40h46c24 0 42 16 42 40v96z" fill="${CLAY}"/><rect x="34" y="112" width="102" height="30" rx="8" fill="#c97a52"/><path d="M30 186v8M140 186v8" stroke="#5c4b3b" stroke-width="6"/></svg>`)}
        ${stand('m-table3d', 30, -900, 200, 70, `<svg viewBox="0 0 200 70"><rect y="0" width="200" height="14" rx="4" fill="${WOOD}"/><path d="M20 14v56M180 14v56" stroke="#8b6b4a" stroke-width="8"/><rect x="80" y="-26" width="18" height="26" fill="${CREAM}" stroke="${INK}" stroke-width="2"/></svg>`)}
      </div>
      <div class="m-walk-cap"><div class="kicker">${C.walk.kicker}</div><h2>${C.walk.title}</h2><p class="m-walk-hint">Keep scrolling ↓</p></div>
      <div class="m-walk-door" aria-hidden="true"></div>
    </div>`);
    contact.before(sec);
    const room = sec.querySelector('.m-walk-room'), cap = sec.querySelector('.m-walk-cap'), door = sec.querySelector('.m-walk-door');
    const itemEls = [...sec.querySelectorAll('.m-3d-item')].map(el => ({ el, z: +el.dataset.z }));
    const state = { p: 0 };
    const render = () => {
      const p = state.p, z = -260 + p * (D - 160), ry = Math.sin(p * Math.PI) * 7, bob = Math.sin(p * Math.PI * 8) * 3;
      room.style.transform = `translate3d(0,${bob.toFixed(1)}px,${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg)`;
      itemEls.forEach(it => { const eff = z + it.z; it.el.style.opacity = eff > 520 ? 0 : eff > 300 ? (1 - (eff - 300) / 220).toFixed(2) : 1; });
      cap.style.opacity = Math.max(0, 1 - p * 6).toFixed(2);
      door.style.opacity = Math.max(0, 1 - p * 4).toFixed(2);
      door.style.transform = `scale(${(1 + p * 3).toFixed(3)})`;
    };
    render();
    const setP = gsap.quickTo(state, 'p', { duration: 0.6, ease: 'power2.out', onUpdate: render });
    ScrollTrigger.create({ trigger: sec, scroller: view, start: 'top top', end: 'bottom bottom', onUpdate: s => setP(s.progress), onRefresh: s => { state.p = s.progress; render(); } });
  }

  return () => offs.forEach(f => f());
});
