/* DEVOCRAT Salon — DEVOCRAT WEBSITE DEMO: sample salon data.
   Runs before the app starts. On the first visit it fills this device with a sample salon (stylists, staff
   logins, customers, today's appointments, the last three weeks of bills and attendance). The app's own
   service menu, products and membership plans are used as they are. Nothing leaves the device.
   Logins:  admin / admin@123 · reception / demo123 · manager / demo123 · stylists kavya, arjun, meera, sana / demo123 */
(function () {
  var P = 'devocrat_data_v3_', MARK = 'devocrat_demo_seeded_v1';
  var LOGINS = 'admin / <b>admin@123</b> · reception / <b>demo123</b>';

  function addBadge() {
    var put = function () {
      var el = document.createElement('div');
      el.className = 'devo-demo-tag'; el.setAttribute('role', 'note');
      el.innerHTML = '<span>Demo · ' + LOGINS + '</span><button type="button" title="Start again with fresh sample data">Reset</button>';
      el.querySelector('button').addEventListener('click', function () {
        if (!confirm('Start the demo again with fresh sample data?')) return;
        try { Object.keys(localStorage).forEach(function (k) { if (k.indexOf(P) === 0 || k === MARK) localStorage.removeItem(k); }); } catch (e) {}
        location.reload();
      });
      var st = document.createElement('style');
      st.textContent = '.devo-demo-tag{position:fixed;left:50%;transform:translateX(-50%);top:6px;z-index:2147483000;display:flex;align-items:center;gap:8px;padding:3px 3px 3px 10px;border-radius:999px;background:#0b1327e6;color:#fde68a;font:600 10.5px/1.2 system-ui,sans-serif;letter-spacing:.02em;box-shadow:0 2px 8px #0005;white-space:nowrap;max-width:calc(100vw - 16px)}.devo-demo-tag span{overflow:hidden;text-overflow:ellipsis}.devo-demo-tag b{color:#fff}.devo-demo-tag button{all:unset;cursor:pointer;padding:3px 9px;border-radius:999px;background:#ffffff26;color:#fff;font-weight:700}';
      document.head.appendChild(st); document.body.appendChild(el);
    };
    if (document.body) put(); else document.addEventListener('DOMContentLoaded', put);
  }

  try { if (localStorage.getItem(MARK)) { addBadge(); return; } } catch (e) { return; }

  /* ---------- helpers ---------- */
  var seed = 7;
  var rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  var pick = function (a) { return a[Math.floor(rnd() * a.length)]; };
  var p2 = function (n) { return (n < 10 ? '0' : '') + n; };
  var day = function (off) { var d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + off); return d; };
  var ymd = function (d) { return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); };
  var hm = function (mins) { return p2(Math.floor(mins / 60)) + ':' + p2(mins % 60); };
  var iso = function (d, mins) { var x = new Date(d); x.setHours(Math.floor(mins / 60), mins % 60, 0, 0); return x.toISOString(); };
  var avatar = function (name) {
    var ini = name.split(/\s+/).slice(0, 2).map(function (p) { return p[0].toUpperCase(); }).join('');
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#0B1327"/><text x="50" y="50" dy=".35em" text-anchor="middle" font-family="Arial,sans-serif" font-size="40" font-weight="700" fill="#F59E0B">' + ini + '</text></svg>';
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  };
  var todayD = day(0), today = ymd(todayD), wd = todayD.getDay();

  /* ---------- services (the app's own menu) ---------- */
  var SV = {
    'srv-basic-haircut': [550, 30, 10], 'srv-advanced-haircut': [950, 45, 15], 'srv-beard-sculpt': [450, 30, 10], 'srv-hair-spa': [2200, 60, 15],
    'srv-keratin': [4800, 150, 20], 'srv-color-style': [3800, 120, 20], 'srv-cleanup': [1200, 40, 10], 'srv-signature-facial': [2800, 75, 15],
    'srv-hydrafacial': [3600, 80, 15], 'srv-dtan-pack': [850, 30, 10], 'srv-gel-nails': [1600, 55, 15], 'srv-royal-pedicure': [1800, 60, 15],
    'srv-body-massage': [3200, 60, 15], 'srv-head-shoulder': [850, 35, 10],
  };
  var SVNAME = {
    'srv-basic-haircut': 'Basic Haircut (Unisex Classic Trim & Wash)', 'srv-advanced-haircut': 'Advanced Haircut & Precision Texture Styling',
    'srv-beard-sculpt': 'Beard Sculpting, Fade & Hot Towel Shave', 'srv-hair-spa': 'Nourishing Royal Hair Spa & Scalp Detox',
    'srv-keratin': 'Keratin Protein Smoothing & Anti-Frizz Shield', 'srv-color-style': 'Balayage / Global Ammonia-Free Colour & Gloss',
    'srv-cleanup': 'Express Herbal Cleanup & Blackhead Extraction', 'srv-signature-facial': 'Signature DEVOCRAT 24K Gold Luxury Facial',
    'srv-hydrafacial': 'Advanced Hydrafacial Medical Glow Treatment', 'srv-dtan-pack': 'Organic D-Tan Sun Damage Reversal Pack',
    'srv-gel-nails': 'Deluxe Gel Manicure with Cuticle Care', 'srv-royal-pedicure': 'Royal Unisex Spa Pedicure & Reflexology',
    'srv-body-massage': 'Aromatherapy Stress-Relief Full Body Massage (60m)', 'srv-head-shoulder': 'Champi Indian Head, Neck & Shoulder Acupressure',
  };

  /* ---------- stylists + staff logins ---------- */
  var off = function (n) { return (wd + n) % 7; };   // weekly offs never fall on today
  var ST = [
    { id: 'stylist-kavya', name: 'Kavya Rao', role: 'Senior Hair Artist', user: 'kavya', skills: ['Basic haircut', 'Advanced haircut', 'Colour & style', 'Keratin', 'Hair spa'], services: ['srv-advanced-haircut', 'srv-color-style', 'srv-keratin', 'srv-hair-spa', 'srv-basic-haircut'], weeklyOff: off(2), pay: 32000 },
    { id: 'stylist-arjun', name: 'Arjun Das', role: 'Barber & Fade Specialist', user: 'arjun', skills: ['Basic haircut', 'Advanced haircut', 'Fade sculpting', 'Hair spa'], services: ['srv-beard-sculpt', 'srv-basic-haircut', 'srv-advanced-haircut', 'srv-hair-spa'], weeklyOff: off(3), pay: 26000 },
    { id: 'stylist-meera', name: 'Meera Iyer', role: 'Skin & Facial Expert', user: 'meera', skills: ['Deep cleanup', 'Signature facial', 'Hydrafacial', 'D-Tan'], services: ['srv-signature-facial', 'srv-hydrafacial', 'srv-cleanup', 'srv-dtan-pack'], weeklyOff: off(4), pay: 28000 },
    { id: 'stylist-sana', name: 'Sana Sheikh', role: 'Nail & Spa Therapist', user: 'sana', skills: ['Gel nails', 'Pedicure', 'Spa', 'Wellness'], services: ['srv-gel-nails', 'srv-royal-pedicure', 'srv-body-massage', 'srv-head-shoulder'], weeklyOff: off(5), pay: 24000 },
  ];
  var stylists = ST.map(function (s, i) {
    return { id: s.id, name: s.name, role: s.role, skills: s.skills, avatar: avatar(s.name), workingHours: '10:00 - 20:00', onShift: true,
      bookableCapacityHours: 8, chairNumber: i + 1, phone: '+91 98450 1' + (1201 + i * 37), weeklyOff: s.weeklyOff, leaveDays: [] };
  });
  var hr = function (pay, offDay, comm) { return { monthlySalary: pay, commissionPercent: comm, weeklyOff: offDay, shiftStart: '10:00', shiftEnd: '20:00', joiningDate: '2025-06-01', casualLeavesPerYear: 12, sickLeavesPerYear: 6 }; };
  var created = '2026-01-01T00:00:00.000Z';
  var users = [
    { id: 'usr-admin-01', username: 'admin', password: 'admin@123', role: 'admin', name: 'Salon Admin', email: 'admin@devocrat.com', phone: '+91 98765 43210', status: 'active', createdAt: created },
    { id: 'usr-man-demo', username: 'manager', password: 'demo123', role: 'manager', name: 'Rohan Kapoor', email: 'rohan@devocrat.com', phone: '+91 98450 20450', status: 'active', createdAt: created, hr: hr(40000, off(6), 0) },
    { id: 'usr-rec-demo', username: 'reception', password: 'demo123', role: 'receptionist', name: 'Divya Menon', email: 'frontdesk@devocrat.com', phone: '+91 98450 30330', status: 'active', createdAt: created, hr: hr(22000, off(1), 0) },
  ].concat(ST.map(function (s) {
    return { id: 'usr-sty-' + s.user, username: s.user, password: 'demo123', role: 'stylist', name: s.name, email: s.user + '@devocrat.com', phone: '+91 98450 4' + (1000 + s.user.length * 113),
      status: 'active', createdAt: created, stylistId: s.id, avatar: avatar(s.name), hr: hr(s.pay, s.weeklyOff, 10) };
  }));

  /* ---------- customers ---------- */
  var CU = [
    ['Ananya Krishnan', 'F', 'Gold', 'stylist-kavya', ['Ammonia'], 'Inoa 6.3 + 20 vol, 35 min'], ['Rahul Sharma', 'M', 'None', 'stylist-arjun', [], ''],
    ['Priya Venkatesh', 'F', 'VIP', 'stylist-meera', [], ''], ['Vikram Singh', 'M', 'Silver', 'stylist-arjun', [], ''],
    ['Neha Gupta', 'F', 'None', 'stylist-sana', ['Fragrance'], ''], ['Aditya Reddy', 'M', 'Gold', 'stylist-kavya', [], 'Global 5.0 natural brown'],
    ['Lakshmi Nair', 'F', 'Silver', 'stylist-meera', [], ''], ['Karan Malhotra', 'M', 'None', 'stylist-arjun', [], ''],
    ['Sneha Pillai', 'F', 'VIP', 'stylist-sana', [], ''], ['Imran Khan', 'M', 'None', 'stylist-kavya', [], ''],
    ['Pooja Desai', 'F', 'Gold', 'stylist-meera', ['Sensitive skin'], ''], ['Farhan Ali', 'M', 'Silver', 'stylist-arjun', [], ''],
  ];
  var customers = CU.map(function (c, i) {
    return { id: 'cust-demo-' + (i + 1), name: c[0], phone: '98' + (40012345 + i * 7311), email: c[0].split(' ')[0].toLowerCase() + '@example.com',
      preferredBranch: 'branch-indiranagar', preferredStylistId: c[3], visitFrequencyDays: 28, lastVisitDate: '', nextSuggestedDate: '',
      allergies: c[4], sensitiveNotes: c[4].length ? 'Patch test before chemical services.' : '', colorFormulas: c[5], loyaltyPoints: 0,
      membershipTier: c[2], membershipExpiry: c[2] === 'None' ? undefined : ymd(day(120)), whatsappConsent: true, totalVisits: 2 + (i % 5),
      lifetimeSpend: 3000 + i * 850, gender: c[1], password: 'demo123' };
  });
  var DISC = { None: 0, Silver: 5, Gold: 10, VIP: 15 };

  /* ---------- appointments + bills ---------- */
  var appts = [], invoices = [], aSeq = 0, nextFree = {};
  var addAppt = function (dOff, cust, sty, srv, start, status, source) {
    var info = SV[srv], d = day(dOff);
    var a = { id: 'apt-demo-' + (++aSeq), customerId: cust.id, stylistId: sty.id, serviceId: srv, date: ymd(d), startTime: hm(start), durationMinutes: info[1],
      bufferMinutes: info[2], status: status, source: source || 'front_desk', roomOrChair: 'Chair ' + (ST.indexOf(sty) + 1), groupId: 'grp-demo-' + aSeq };
    if (status === 'arrived' || status === 'in_service' || status === 'completed') a.checkedInAt = hm(start - 5);
    if (status === 'in_service' || status === 'completed') a.startedAt = hm(start);
    if (status === 'completed') a.completedAt = hm(start + info[1]);
    if (status === 'confirmed' && dOff >= 0) { a.reminderSent = dOff === 0; if (a.reminderSent) { a.reminderChannel = 'WhatsApp'; a.reminderSentAt = iso(d, 9 * 60); } }
    appts.push(a);
    if (status === 'completed') bill(a, cust, sty, d, start + info[1] + 5);
    return a;
  };
  var bill = function (a, cust, sty, d, at) {
    var price = SV[a.serviceId][0], memberDisc = Math.round(price * DISC[cust.membershipTier] / 100), taxable = price - memberDisc, gst = Math.round(taxable * 0.18);
    var inv = { id: 'inv-demo-' + a.id.slice(9), invoiceNumber: 'INV-2026-' + (4100 + invoices.length), appointmentId: a.id, appointmentIds: [a.id], customerId: cust.id,
      customerName: cust.name, items: [{ id: 'li-' + a.id, type: 'service', name: SVNAME[a.serviceId], quantity: 1, unitPrice: price, total: price, discount: 0, stylistId: sty.id, appointmentId: a.id }],
      subtotal: price, memberDiscount: memberDisc, customDiscount: 0, loyaltyPointsRedeemed: 0, loyaltyDiscountValue: 0, taxGst: gst, finalTotal: taxable + gst,
      payments: [{ method: pick(['upi', 'upi', 'card', 'cash']), amount: taxable + gst }], status: 'paid', createdAt: iso(d, at), cashierName: 'Divya Menon' };
    if (inv.payments[0].method !== 'cash') inv.payments[0].referenceId = (inv.payments[0].method === 'upi' ? 'UPI' : 'CARD') + Math.floor(1e8 + rnd() * 9e8);
    invoices.push(inv); a.invoiceId = inv.id;
    cust.lastVisitDate = a.date; cust.nextSuggestedDate = ymd(new Date(d.getTime() + cust.visitFrequencyDays * 864e5));
    cust.totalVisits += 1; cust.lifetimeSpend += inv.finalTotal; cust.loyaltyPoints += Math.floor(taxable / 100);
  };
  // the last three weeks: two or three finished visits per stylist on working days
  for (var dOff = -21; dOff <= -1; dOff++) {
    var dd = day(dOff).getDay();
    ST.forEach(function (s) {
      if (dd === s.weeklyOff) return;
      var n = 2 + Math.floor(rnd() * 2), t = 10 * 60 + Math.floor(rnd() * 4) * 15;
      for (var k = 0; k < n; k++) {
        var srv = pick(s.services), cust = rnd() < 0.6 ? customers.filter(function (c) { return c.preferredStylistId === s.id; })[k % 3] || pick(customers) : pick(customers);
        addAppt(dOff, cust, s, srv, t, rnd() < 0.06 ? 'no_show' : 'completed', pick(['front_desk', 'phone', 'walk_in', 'online']));
        t += SV[srv][1] + SV[srv][2] + 30 + Math.floor(rnd() * 4) * 15;
      }
    });
  }
  // today, around the current time: finished, in the chair, waiting, coming later
  var nowM = new Date().getHours() * 60 + new Date().getMinutes(), base = Math.min(Math.max(nowM, 11 * 60 + 30), 17 * 60);
  var C = function (i) { return customers[i]; };
  addAppt(0, C(0), ST[0], 'srv-advanced-haircut', base - 150, 'completed');
  addAppt(0, C(3), ST[1], 'srv-beard-sculpt', base - 120, 'completed', 'walk_in');
  addAppt(0, C(2), ST[2], 'srv-signature-facial', base - 30, 'in_service');
  addAppt(0, C(8), ST[3], 'srv-gel-nails', base - 10, 'arrived');
  addAppt(0, C(5), ST[0], 'srv-color-style', base + 30, 'confirmed', 'phone');
  addAppt(0, C(7), ST[1], 'srv-basic-haircut', base + 45, 'confirmed');
  addAppt(0, C(10), ST[2], 'srv-hydrafacial', base + 90, 'confirmed', 'online');
  addAppt(0, C(4), ST[3], 'srv-royal-pedicure', base + 75, 'requested', 'online');
  // the next few days
  addAppt(1, C(1), ST[1], 'srv-advanced-haircut', 11 * 60, 'confirmed', 'phone');
  addAppt(1, C(6), ST[2], 'srv-cleanup', 14 * 60, 'confirmed');
  addAppt(1, C(11), ST[1], 'srv-beard-sculpt', 17 * 60, 'requested', 'online');
  addAppt(2, C(9), ST[0], 'srv-keratin', 12 * 60, 'confirmed', 'phone');
  addAppt(3, C(0), ST[3], 'srv-body-massage', 16 * 60, 'confirmed', 'online');
  // weekly offs fall on other days, so future bookings must avoid them
  appts = appts.filter(function (a) { var st = ST.find(function (s) { return s.id === a.stylistId; }); return new Date(a.date + 'T12:00:00').getDay() !== st.weeklyOff || a.date < today; });

  /* ---------- attendance: the last two weeks + today's check-ins ---------- */
  var att = [];
  users.filter(function (u) { return u.hr; }).forEach(function (u, ui) {
    for (var o = -14; o <= 0; o++) {
      var d = day(o), id = u.id + '_' + ymd(d);
      if (d.getDay() === u.hr.weeklyOff) { att.push({ id: id, userId: u.id, date: ymd(d), status: 'week_off' }); continue; }
      var late = rnd() < 0.12, inM = 10 * 60 - 10 + Math.floor(rnd() * 12) + (late ? 25 : 0);
      var rec = { id: id, userId: u.id, date: ymd(d), checkIn: hm(inM) };
      if (o < 0) rec.checkOut = hm(20 * 60 + Math.floor(rnd() * 20));
      att.push(rec);
    }
  });
  var leave = [{ id: 'leave-demo-1', userId: 'usr-sty-arjun', userName: 'Arjun Das', type: 'casual', from: ymd(day(9)), to: ymd(day(10)), days: 2,
    reason: 'Sister\'s wedding in Mysuru', status: 'pending', appliedAt: new Date(Date.now() - 3 * 3600e3).toISOString() }];

  /* ---------- save ---------- */
  var set = function (k, v) { localStorage.setItem(P + k, JSON.stringify(v)); };
  try {
    set('user_accounts', users); set('stylists', stylists); set('customers', customers);
    set('appointments', appts); set('invoices', invoices.reverse()); set('attendance', att); set('leave_requests', leave);
    localStorage.setItem(MARK, '1');
  } catch (e) { console.warn('[demo] could not save the sample salon', e); }
  addBadge();
})();
