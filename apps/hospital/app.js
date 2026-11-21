/* Devocrat Multi-Speciality Hospital — web app (runs on phones, tablets and desktops). */
(() => {
'use strict';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ls = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } };
const IC = { user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>', cal: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>', bed: '<path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="2"/>', flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M7.5 14h9"/>', scan: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M7 12h10"/>', pill: '<rect x="2.5" y="8.5" width="19" height="7" rx="3.5" transform="rotate(-45 12 12)"/><path d="M8.5 8.5l7 7"/>', rupee: '<path d="M7 4h11M7 9h11M10 4c4.5 0 5 5 0 5H7l8 11"/>', chart: '<path d="M4 20V11M10 20V5M16 20v-6M2 20h20"/>', heart: '<path d="M3 12h4l2-5 4 10 2-5h6"/>', seal: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.6 2.6L16 9.6"/>', shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>', desk: '<path d="M3 11h18v9H3zM8 11V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4"/>', steth: '<path d="M6 3v6a4 4 0 0 0 8 0V3M10 13v3a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="12" r="2"/>', search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>', list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>', box: '<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>', file: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>', home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>', plus: '<path d="M12 5v14M5 12h14"/>', alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>', out: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>', moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>', key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3"/>', eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>', bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>', amb: '<path d="M3 17V8h11l3 4h4v5"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M8 10v4M6 12h4"/>', baby: '<circle cx="12" cy="8" r="4"/><path d="M8 21v-4a4 4 0 0 1 8 0v4"/>', bone: '<path d="M7 17l10-10M5 15a2 2 0 1 0 2 4 2 2 0 1 0 2-2M19 9a2 2 0 1 0-2-4 2 2 0 1 0-2 2"/>' };
const ic = (k, s) => `<svg class="i" viewBox="0 0 24 24" ${s ? `style="width:${s}px;height:${s}px"` : ''} aria-hidden="true">${IC[k] || ''}</svg>`;
const MARK = '<svg width="24" height="24" viewBox="0 0 22 22" aria-hidden="true"><path d="M8 1h6v7h7v6h-7v7H8v-7H1V8h7z" fill="#e53935"/></svg>';
const ECGP = 'M0 24H90l8-10 8 10h20l6 6 10-28 10 34 7-12H250l8-10 8 10h20l6 6 10-28 10 34 7-12H420l8-10 8 10h20l6 6 10-28 10 34 7-12H600';
const ECG = `<svg class="ecg" viewBox="0 0 600 40" preserveAspectRatio="none" aria-hidden="true"><path class="base" d="${ECGP}"/><path class="beat" d="${ECGP}"/></svg>`;
const ROLES = {
  reception: { t: 'Reception', ic: 'desk', nav: [['rdash', 'Front desk', 'home'], ['register', 'Register', 'user'], ['book', 'OPD token', 'cal'], ['admit', 'Admission', 'bed'], ['billing', 'Billing', 'rupee'], ['patients', 'Patients', 'list']] },
  doctor: { t: 'Doctor', ic: 'steth', nav: [['queue', 'My OPD queue', 'cal'], ['ipdlist', 'My IPD patients', 'bed'], ['patients', 'Patients', 'list']] },
  nurse: { t: 'Nurse / IPD', ic: 'heart', nav: [['beds', 'Bed board', 'bed'], ['ipdlist', 'Admitted', 'heart'], ['nlab', 'Samples', 'flask'], ['patients', 'Patients', 'list']] },
  lab: { t: 'Laboratory', ic: 'flask', nav: [['lab', 'Test orders', 'flask'], ['labdone', 'Released', 'file']] },
  img: { t: 'X-ray & Scan', ic: 'scan', nav: [['img', 'Scan orders', 'scan'], ['imgdone', 'Released', 'file']] },
  pharmacy: { t: 'Pharmacy', ic: 'pill', nav: [['rxq', 'Prescriptions', 'pill'], ['meds', 'Medicine list', 'list'], ['stock', 'Stock & batches', 'box']] },
  admin: { t: 'Admin', ic: 'shield', nav: [['dash', 'Dashboard', 'chart'], ['users', 'Staff & logins', 'user'], ['audit', 'Audit log', 'file'], ['patients', 'Patients', 'list']] },
  patient: { t: 'Patient', ic: 'user', nav: [['me', 'My health', 'home'], ['myreports', 'Reports', 'file'], ['myrx', 'Medicines', 'pill'], ['mybills', 'Bills', 'rupee'], ['mybook', 'Book visit', 'cal']] }
};
const DEMO_UID = { reception: 'recep01', doctor: 'dr.mehta', nurse: 'nurse01', lab: 'lab01', img: 'rad01', pharmacy: 'pharm01', admin: 'admin' };
const CODE_COL = { 'Code Blue': '#1565c0', 'Code Red': '#c62828', 'Code Pink': '#c2185b', 'Code Yellow': '#a87400', 'Rapid Response': '#6a1b9a' };

let T = ls('dmh_token'), S = null, U = null, V = '', X = {}, PUB = null, pending = false, lastView = '', seenAlerts = new Set();
let LG = { tab: 'staff', desk: null, step: 1, mobile: '', choose: null, demoOtp: '' };
const theme = t => { document.documentElement.dataset.theme = t; ls('dmh_theme', t); const m = $('meta[name=theme-color]'); if (m) m.content = t === 'dark' ? '#03252c' : '#035e6b'; };
theme(ls('dmh_theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

// ---------- data helpers ----------
const TODAY = () => S.today;
const C = () => S.catalog;
const fd = s => s ? new Date(s.slice(0, 10) + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
const inr = n => '₹' + (Math.round(n * 100) / 100).toLocaleString('en-IN');
const P = id => S.patients.find(p => p.id === id) || { name: '—', id, age: '', sex: '', mobile: '', blood: '' };
const D = id => S.doctors.find(d => d.id === id) || { name: '—', dept: '', fee: 0 };
const dname = id => D(id).name;
const MED = id => S.meds.find(m => m.id === id) || { name: '—', price: 0, generic: '' };
const okStock = mid => S.stock.filter(s => s.mid === mid && s.exp >= TODAY() && s.qty > 0).sort((a, b) => a.exp.localeCompare(b.exp));
const avail = mid => okStock(mid).reduce((a, x) => a + x.qty, 0);
const tot = b => b.items.reduce((s, i) => s + i.a, 0);
const last = o => o.trail[o.trail.length - 1];
const flag = (v, lo, hi) => v < lo ? 'Low' : v > hi ? 'High' : '';
const rng = (lo, hi) => lo === 0 ? '< ' + hi : lo + ' – ' + hi;
const ini = n => String(n).replace(/^(Dr\.|Nurse|Receptionist|Lab Tech|Radiographer|Pharmacist|Admin)\s*/, '').split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();
const day = n => { const d = new Date(TODAY() + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const mstat = m => { const q = S.stock.filter(s => s.mid === m.id && s.exp >= TODAY()).reduce((a, x) => a + x.qty, 0); return !m.active ? 'Inactive' : !q ? 'Out of stock' : q < m.reorder ? 'Low stock' : 'OK'; };
const bstat = x => x.exp < TODAY() ? 'Expired' : x.exp <= day(90) ? 'Expiring soon' : 'OK';
function allergyClash(p, m) { const a = (p.allergy || '').toLowerCase(); if (!a || !m.generic) return false; if (a.includes(m.generic.toLowerCase())) return true; return Object.entries(C().ALLERGY).some(([k, g]) => a.includes(k) && g.includes(m.generic)); }
function labSummary(o) { const t = C().LABT[o.test]; if (!t || !o.results) return ''; const f = t.p.map((p, i) => [p, o.results[i]]).filter(([p, v]) => flag(v, p[2], p[3])); return f.length ? `<span class="hl">${f.map(([p, v]) => `${p[0]} ${v} (${flag(v, p[2], p[3])})`).join(', ')}</span>` : '<span class="mut">All values within range</span>'; }

// ---------- UI atoms ----------
const ST = { Waiting: 'w', Ordered: 'w', Pending: 'w', Unpaid: 'w', Booked: '', Done: 'ok', Approved: 'ok', Ready: 'ok', Dispensed: 'ok', Paid: 'ok', Discharged: 'ok', Expired: 'r', 'Expiring soon': 'w', 'Low stock': 'w', 'Out of stock': 'r', OK: 'ok', Active: 'ok', Disabled: 'r', Inactive: 'r', 'In progress': 'w' };
const st = s => `<span class="st ${ST[s] ?? ''}">${esc(s)}</span>`;
const stamp = (s, pre) => s ? `<span class="stamp" style="--c:var(--${esc(s.role)})">${ic('seal')}<span>${pre ? esc(pre) + ' · ' : ''}Monitored by <b>${esc(s.by)}</b>${s.t ? ' · ' + esc(s.t) : ''}</span></span>` : '';
const head = (t, sub, acts) => `<div class="vh"><div><h1>${t}</h1>${sub ? `<p class="mut" style="margin:0">${sub}</p>` : ''}</div>${acts ? `<div class="acts">${acts}</div>` : ''}</div>`;
const kpiLen = (n, fmt) => String(typeof n === 'number' && fmt === 'inr' ? inr(n) : n).length;
const kpi = (n, l, k, c, fmt) => `<div class="card kpi" style="--c:var(--${c || 'pri'})"><span class="ico">${ic(k || 'chart')}</span><div><div class="n ${kpiLen(n, fmt) >= 10 ? 'xl' : kpiLen(n, fmt) >= 7 ? 'long' : ''}" title="${esc(typeof n === 'number' && fmt === 'inr' ? inr(n) : n)}" ${typeof n === 'number' ? `data-v="${n}" data-f="${fmt || ''}"` : ''}>${typeof n === 'number' ? (fmt === 'inr' ? inr(n) : n) : n}</div><div class="l">${l}</div></div></div>`;
const btn = (a, id, label, cls, k) => `<button class="btn sm ${cls || ''}" data-a="${a}" data-id="${esc(id)}">${k ? ic(k) : ''}${label}</button>`;
const empty = m => `<p class="mut" style="padding:14px 0;margin:0">${m}</p>`;
const popts = sel => S.patients.map(p => `<option value="${p.id}" ${p.id === sel ? 'selected' : ''}>${esc(p.name)} · ${p.id} · ${p.mobile}</option>`).join('');
const dopts = sel => S.doctors.map(d => `<option value="${d.id}" ${d.id === sel ? 'selected' : ''}>${esc(d.name)} · ${esc(d.dept)} · ${inr(d.fee)}</option>`).join('');

let tt; function toast(m, err) { const t = $('#toast'); t.innerHTML = (err ? ic('alert') : ic('seal')) + `<span>${esc(m)}</span>`; t.className = 'toast on' + (err ? ' err' : ''); clearTimeout(tt); tt = setTimeout(() => t.className = 'toast' + (err ? ' err' : ''), 4800); }
function modal(h) { $('#mbody').innerHTML = h; $('#modal').classList.add('on'); $('#modal .mbox').scrollTop = 0; const f = $('#mbody input:not([type=hidden]),#mbody select'); if (f && matchMedia('(min-width:841px)').matches) f.focus(); }
function closeM() { $('#modal').classList.remove('on'); if (pending) applyPending(); }

// ---------- server (Google Sheets via Apps Script) ----------
const API_URL = () => String(window.HMS_API || ls('dmh_api') || '').trim();
let LIC = null, busyN = 0, pollT = null;
function busy(d) { busyN = Math.max(0, busyN + d); document.documentElement.classList.toggle('busy', busyN > 0); }
async function call(op, body, quietBusy) {
  if (!API_URL()) throw new Error('This app is not connected to its Google Sheet yet');
  if (!quietBusy) busy(1);
  let j;
  try {
    const r = await fetch(API_URL(), { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ op, token: T }, body || {})), redirect: 'follow' });
    j = await r.json();
  } catch (e) { throw new Error(navigator.onLine ? 'Could not reach the hospital server. Please try again.' : 'You are offline.'); }
  finally { if (!quietBusy) busy(-1); }
  if (j.license) LIC = j.license;
  if (!j.ok) {
    if (j.error === 'LICENSE') { LIC = j.license; renderLocked(); throw new Error('LICENSE'); }
    if (j.status === 401 && T) signOut(true);
    throw new Error(j.error || 'Request failed');
  }
  return j;
}
async function act(name, payload, opt = {}) {
  const b = opt.btn; if (b) b.disabled = true;
  try {
    const j = await call('action', { name, payload: payload || {} });
    if (j.state) { S = j.state; pending = false; }
    if (!opt.quiet) render();
    if (j.toast) toast(j.toast, j.warn);
    return j;
  } catch (e) { if (e.message !== 'LICENSE') toast(e.message, 1); return null; } finally { if (b) b.disabled = false; }
}
async function refresh(quietBusy) {
  try { S = (await call('state', null, quietBusy)).state; } catch (e) { return; }
  const dirty = $('main form[data-dirty]') || $('#modal.on');
  if (dirty) { pending = true; renderAlerts(); const p = $('#pend'); if (p) p.hidden = false; return; }
  render();
}
function applyPending() { pending = false; render(); }
const soonRefresh = () => refresh();
// Other desks' changes arrive by checking the Sheet's version every 10 seconds.
function connect() { clearInterval(pollT); if (T) pollT = setInterval(poll, 10000); }
async function poll() {
  if (document.hidden || !T || !S || !API_URL()) return;
  try {
    const j = await call('ping', null, true);
    if (S && j.ver !== S.ver) {
      const before = new Set((S.alerts || []).map(a => a.id));
      await refresh(true);
      if ((S.alerts || []).some(a => !before.has(a.id))) { beep(); try { navigator.vibrate && navigator.vibrate([300, 150, 300]); } catch (x) {} }
    }
  } catch (e) {}
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) poll(); });
async function loadImages() { for (const im of $$('#mbody img[data-file]')) { try { const j = await call('file', { id: im.dataset.file }, true); im.src = j.data; } catch (e) { im.alt = 'Image could not be loaded'; } } }
function beep() { try { const a = new (window.AudioContext || window.webkitAudioContext)(); [0, .35, .7].forEach((t, i) => { const o = a.createOscillator(), g = a.createGain(); o.frequency.value = i % 2 ? 660 : 880; o.connect(g); g.connect(a.destination); g.gain.setValueAtTime(.18, a.currentTime + t); g.gain.exponentialRampToValueAtTime(.001, a.currentTime + t + .3); o.start(a.currentTime + t); o.stop(a.currentTime + t + .32); }); } catch (e) {} }
function signOut(silent) { T = null; S = null; U = null; ls('dmh_token', null); clearInterval(pollT); LG = { tab: LG.tab, desk: null, step: 1 }; closeM(); renderLogin(); if (!silent) toast('Signed out'); }

// ---------- patient file, reports, invoices ----------
function pHead(p) { return `<div class="phead"><div class="av">${esc(ini(p.name))}</div><div><h2 style="margin:0">${esc(p.name)}</h2><div class="facts"><span>${p.id}</span><span>${p.age} y · ${p.sex === 'M' ? 'Male' : 'Female'}</span><span>Blood ${esc(p.blood)}</span><span>${esc(p.mobile)}</span></div></div></div>${p.allergy ? `<div class="alert">${ic('alert', 18)} Allergy: ${esc(p.allergy)}</div>` : ''}`; }
function chartHTML(pid) {
  const p = P(pid), items = [];
  S.visits.filter(v => v.pid === pid && v.status === 'Done').forEach(v => items.push({ d: v.date, c: 'doctor', t: 'OPD visit · ' + esc(dname(v.did)), b: `${esc(v.complaint)}${v.diagnosis ? `<div><b>Diagnosis:</b> ${esc(v.diagnosis)}</div>` : ''}${v.vitals ? `<div class="mut">${esc(v.vitals)}</div>` : ''}${v.notes ? `<div><b>Advice:</b> ${esc(v.notes)}</div>` : ''}${stamp(v.s)}` }));
  S.orders.filter(o => o.pid === pid && o.status === 'Approved').forEach(o => items.push({ d: o.date, c: o.kind, t: esc(o.test) + ' report', b: `<div>${o.kind === 'lab' ? labSummary(o) : esc(o.impression)}</div>${stamp(last(o), 'Approved')}<div><button class="btn g sm" data-a="rep" data-id="${o.id}">${ic('file')}View report</button></div>` }));
  S.orders.filter(o => o.pid === pid && o.status !== 'Approved').forEach(o => items.push({ d: o.date, c: o.kind, t: esc(o.test) + ' · in progress', b: `${st(o.status)}<br>${U.role === 'patient' ? '' : stamp(last(o), o.status)}` }));
  S.rx.filter(r => r.pid === pid).forEach(r => items.push({ d: r.date, c: 'pharmacy', t: 'Prescription · ' + esc(dname(r.did)), b: r.items.map(i => `${esc(i.med)} · ${esc(i.dose)} · ${i.days} days · qty ${i.qty}`).join('<br>') + `<br>${stamp(r.s, 'Prescribed')}${r.ds ? '<br>' + stamp(r.ds, 'Dispensed') : ''}` }));
  S.adm.filter(a => a.pid === pid).forEach(a => items.push({ d: a.date, c: 'nurse', t: `Admitted · bed ${a.bed} · ${esc(dname(a.did))}`, b: `${esc(a.reason)} ${st(a.status)}<br>${stamp(a.s, 'Admitted')}${a.dis ? '<br>' + stamp(a.dis, 'Discharged') : ''}${a.vitals.length ? `<div><button class="btn g sm" data-a="vit" data-id="${a.id}">${ic('heart')}Vitals & notes (${a.vitals.length})</button></div>` : ''}` }));
  items.sort((a, b) => b.d.localeCompare(a.d));
  return pHead(p) + `<h3>Medical history</h3>` + (items.length ? `<div class="tl">${items.map(i => `<div class="tli" style="--c:var(--${i.c})"><div class="d">${fd(i.d)}</div><div class="t">${i.t}</div><div>${i.b}</div></div>`).join('')}</div>` : empty('No history yet — first visit.')) + (U.role !== 'patient' ? `<p class="tiny" style="margin-top:6px">${stamp(p.s, 'Registered')}</p>` : '');
}
function reportHTML(oid) {
  const o = S.orders.find(o => o.id === oid), p = P(o.pid), lab = o.kind === 'lab', t = C().LABT[o.test];
  let body = '';
  if (lab) body = `<div class="scroll"><table><thead><tr><th>Test</th><th class="n">Result</th><th>Unit</th><th>Reference range</th></tr></thead><tbody>${t.p.map((q, i) => { const v = o.results ? o.results[i] : null, f = v != null ? flag(v, q[2], q[3]) : ''; return `<tr><td>${q[0]}</td><td class="n ${f ? 'hl' : ''}">${v ?? '—'} ${f ? `(${f})` : ''}</td><td>${q[1]}</td><td>${rng(q[2], q[3])}</td></tr>`; }).join('')}</tbody></table></div>`;
  else body = `${o.img ? `<img class="scan" data-file="${esc(o.img)}" alt="${esc(o.test)} image" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" style="min-height:200px">` : `<div class="scan" style="height:160px;display:grid;place-items:center;color:#9ab">No image uploaded</div>`}<h3>Findings</h3><p>${esc(o.findings) || '—'}</p><h3>Impression</h3><p><b>${esc(o.impression) || '—'}</b></p>`;
  return `${o.status !== 'Approved' ? '<div class="draft">Draft — not yet released to the patient</div>' : ''}<div class="lh"><div class="hn"><span class="mark">${MARK}</span>${esc(S.hospital)}</div><div style="text-align:right"><b>${lab ? 'Department of Pathology' : 'Department of Radiology'}</b><div class="tiny">Report ${o.id}</div></div></div>
  <div class="pinfo"><div><b>Patient</b>${esc(p.name)}</div><div><b>UHID</b>${p.id}</div><div><b>Age / Sex</b>${p.age} y / ${p.sex}</div><div><b>Referred by</b>${esc(dname(o.did))}</div><div><b>Ordered</b>${fd(o.date)}</div><div><b>Test</b>${esc(o.test)}</div></div>
  ${body}<h3>Chain of custody</h3><div class="trail">${o.trail.map(x => stamp(x, x.s)).join('')}</div><p class="acts" style="margin-top:14px"><button class="btn g sm" data-a="print" data-id="">${ic('file')}Print / save PDF</button></p>`;
}
function invoiceHTML(bid) {
  const b = S.bills.find(b => b.id === bid), p = P(b.pid);
  return `<div class="lh"><div class="hn"><span class="mark">${MARK}</span>${esc(S.hospital)}</div><div style="text-align:right"><b>Invoice ${b.id}</b><div class="tiny">${fd(b.date)}</div></div></div><div class="pinfo"><div><b>Patient</b>${esc(p.name)}</div><div><b>UHID</b>${p.id}</div><div><b>Mobile</b>${p.mobile}</div><div><b>Status</b>${b.paid ? `Paid · ${esc(b.mode)}` : 'Unpaid'}</div></div><div class="scroll"><table><thead><tr><th>Item</th><th>Department</th><th class="n">Amount</th></tr></thead><tbody>${b.items.map(i => `<tr><td>${esc(i.d)}${i.s && U.role !== 'patient' ? `<br>${stamp(i.s)}` : ''}</td><td>${esc(i.c)}</td><td class="n">${inr(i.a)}</td></tr>`).join('')}<tr><td><b>Total</b></td><td></td><td class="n"><b class="sora" style="font-size:18px">${inr(tot(b))}</b></td></tr></tbody></table></div>${b.paid ? stamp(b.ps, 'Payment received') : ''}
  ${!b.paid && U.role === 'reception' ? `<form data-f="pay" style="margin-top:16px"><input type="hidden" name="id" value="${b.id}"><h3>Payment mode</h3><div class="chips">${['Cash', 'UPI', 'Card', 'Insurance / TPA'].map((m, i) => `<label class="chip"><input type="radio" name="mode" value="${m}" ${i ? '' : 'checked'}>${m}</label>`).join('')}</div><p></p><button class="btn ok">${ic('rupee')}Collect ${inr(tot(b))}</button></form>` : ''}<p class="acts" style="margin-top:14px"><button class="btn g sm" data-a="print" data-id="">${ic('file')}Print / save PDF</button></p>`;
}
function medRow() { return `<div class="medrow"><select name="med" aria-label="Medicine"><option value="">Select medicine…</option>${S.meds.filter(m => m.active).sort((a, b) => a.name.localeCompare(b.name)).map(m => `<option value="${m.id}">${esc(m.name)} · ${esc(m.form)} (${avail(m.id)} in stock)</option>`).join('')}</select><select name="dose" aria-label="Dose">${C().DOSES.map(d => `<option>${d}</option>`).join('')}</select><input name="days" type="number" min="1" value="5" aria-label="Days"><button type="button" class="x2" data-a="rmmed" data-id="" aria-label="Remove">×</button></div>`; }
function vitalsHTML(aid) {
  const a = S.adm.find(a => a.id === aid), p = P(a.pid), can = a.status === 'Admitted' && (U.role === 'nurse' || U.role === 'doctor');
  return pHead(p) + `<p class="small"><b>${a.id}</b> · Bed ${a.bed} · ${esc(dname(a.did))} · admitted ${fd(a.date)} · ${st(a.status)}</p><p>${esc(a.reason)}</p>
  ${can ? `<form data-f="vitals" class="card" style="box-shadow:none;background:var(--bg)"><input type="hidden" name="id" value="${a.id}"><h3 style="margin-top:0">Record vitals</h3><div class="g5"><label>BP<input name="bp" placeholder="120/80" required></label><label>Pulse<input name="pulse" type="number" required></label><label>Temp °F<input name="temp" type="number" step="0.1" required></label><label>SpO₂ %<input name="spo2" type="number" required></label></div><label>${U.role === 'doctor' ? 'Doctor’s note' : 'Nursing note'}<input name="note" placeholder="${U.role === 'doctor' ? 'e.g. Reviewed, continue IV antibiotics' : 'e.g. IV antibiotics given at 2 pm'}"></label><p class="tiny">This entry will be stamped “Monitored by ${esc(U.name)}”.</p><button class="btn">${ic('heart')}Save vitals</button></form>` : ''}
  <h3>Vitals & notes</h3>${a.vitals.length ? `<div class="tl">${a.vitals.slice().reverse().map(v => `<div class="tli" style="--c:var(--${v.s.role})"><div class="t">BP ${esc(v.bp)} · Pulse <span class="${v.pulse > 100 ? 'hl' : ''}">${v.pulse}</span> · Temp <span class="${v.temp >= 100.4 ? 'hl' : ''}">${v.temp}°F</span> · SpO₂ <span class="${v.spo2 < 94 ? 'hl' : ''}">${v.spo2}%</span></div>${v.note ? `<div>${esc(v.note)}</div>` : ''}${stamp(v.s)}</div>`).join('')}</div>` : empty('No vitals yet.')}`;
}
const bars = (obj, money) => { const e = Object.entries(obj).sort((a, b) => b[1] - a[1]), m = Math.max(1, ...e.map(x => x[1])); return e.length ? e.map(([k, v]) => `<div class="brow"><span>${esc(k)}</span><div class="track"><div class="fill" style="width:${v / m * 100}%"></div></div><b>${money ? inr(v) : v}</b></div>`).join('') : empty('Nothing yet today.'); };
const logTable = L => `<table class="stack"><thead><tr><th>Time</th><th>Who</th><th>What</th></tr></thead><tbody>${L.map(l => `<tr><td style="white-space:nowrap">${esc(l.t)}</td><td><b style="color:var(--${esc(l.role || 'admin')})">${esc(l.who)}</b></td><td>${esc(l.what)}</td></tr>`).join('')}</tbody></table>`;

// ---------- desk screens ----------
const VIEWS = {
  rdash() {
    const tv = S.visits.filter(v => v.date === TODAY()).sort((a, b) => a.did.localeCompare(b.did) || a.token - b.token), ub = S.bills.filter(b => !b.paid), adv = S.visits.filter(v => v.admit && !v.admitted);
    return head('Front desk', fd(TODAY()), `<button class="btn" data-a="go" data-id="register">${ic('plus')}Register patient</button><button class="btn g" data-a="go" data-id="book">${ic('cal')}Book OPD token</button>`) +
      `<div class="kpis">${kpi(tv.length, 'OPD tokens today', 'cal', 'reception')}${kpi(tv.filter(v => v.status === 'Waiting').length, 'Waiting now', 'user', 'patient')}${kpi(S.beds.filter(b => b.pid).length + ' / ' + S.beds.length, 'Beds occupied', 'bed', 'nurse')}${kpi(ub.reduce((s, b) => s + tot(b), 0), ub.length + ' unpaid bills', 'rupee', 'img', 'inr')}</div>
      ${adv.length ? `<div class="card mb" style="border-color:var(--nurse)"><h2>${ic('bed')} Admission advised by doctor</h2>${adv.map(v => `<p>${esc(P(v.pid).name)} · ${esc(v.diagnosis)} ${btn('admitp', v.id, 'Admit', '', 'bed')}<br>${stamp(v.s)}</p>`).join('')}</div>` : ''}
      <div class="card"><h2>Today’s OPD queue</h2><table class="stack"><thead><tr><th>Token</th><th>Patient</th><th>Doctor</th><th>Complaint</th><th>Status</th></tr></thead><tbody>${tv.map(v => `<tr><td><b class="sora" style="font-size:20px;color:var(--pri)">${v.token}</b></td><td>${esc(P(v.pid).name)}<div class="tiny">${v.pid}</div></td><td>${esc(dname(v.did))}<div class="tiny">${esc(D(v.did).dept)}</div></td><td>${esc(v.complaint)}</td><td>${st(v.status)}</td></tr>`).join('') || `<tr><td colspan="5">${empty('No tokens yet today.')}</td></tr>`}</tbody></table></div>`;
  },
  register() { return head('Register new patient', 'A unique hospital ID (UHID) is created and a welcome message appears in the patient app.') + `<form class="card" data-f="reg" style="max-width:800px"><div class="g2"><label>Full name<input name="name" required autocomplete="off"></label><label>Mobile number<input name="mobile" required inputmode="numeric" pattern="[6-9][0-9]{9}" maxlength="10" placeholder="10 digits"></label><label>Age<input name="age" type="number" min="0" max="130" required></label><label>Blood group<select name="blood">${['Unknown', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => `<option>${b}</option>`).join('')}</select></label></div><h3>Sex</h3><div class="chips"><label class="chip"><input type="radio" name="sex" value="M" checked>Male</label><label class="chip"><input type="radio" name="sex" value="F">Female</label></div><p></p><label>Known allergies<input name="allergy" placeholder="e.g. Penicillin — leave blank if none"></label><label>Address<input name="addr"></label><p class="tiny">Stamped “Monitored by ${esc(U.name)}”.</p><button class="btn">${ic('plus')}Register & continue to token</button></form>`; },
  book() { return head('Book OPD token') + `<form class="card" data-f="book" style="max-width:800px"><label>Patient<select name="pid">${popts(X.pid)}</select></label><div class="g2"><label>Doctor<select name="did">${dopts()}</select></label><label>Date<input name="date" type="date" value="${TODAY()}" min="${TODAY()}"></label></div><label>Chief complaint<input name="complaint" placeholder="e.g. fever for 2 days"></label><button class="btn">${ic('cal')}Book token & add consultation fee</button></form>`; },
  admit() {
    const free = S.beds.filter(b => !b.pid), act_ = S.adm.filter(a => a.status === 'Admitted');
    return head('IPD admission') + `<div class="c2"><form class="card" data-f="admit"><h2>Admit a patient</h2><input type="hidden" name="vid" value="${esc(X.vid || '')}"><label>Patient<select name="pid">${popts(X.pid)}</select></label><label>Consultant<select name="did">${dopts(X.did)}</select></label><label>Bed<select name="bed">${C().WARDS.map(([k, n, , r]) => `<optgroup label="${n} · ${inr(r)}/day">${free.filter(b => b.ward === k).map(b => `<option>${b.id}</option>`).join('')}</optgroup>`).join('')}</select></label><label>Reason for admission<input name="reason" required value="${esc(X.reason || '')}"></label><button class="btn">${ic('bed')}Admit</button></form>
    <div class="card"><h2>Currently admitted</h2>${act_.length ? `<table class="stack"><thead><tr><th>Patient</th><th>Bed</th><th>Since</th><th></th></tr></thead><tbody>${act_.map(a => `<tr><td>${esc(P(a.pid).name)}<div class="tiny">${a.id}</div></td><td><b>${a.bed}</b></td><td>${fd(a.date)}</td><td>${btn('discharge', a.id, 'Discharge', 'g')}</td></tr>`).join('')}</tbody></table>` : empty('No admitted patients.')}</div></div>`;
  },
  billing() {
    const un = S.bills.filter(b => !b.paid), pd = S.bills.filter(b => b.paid && b.pdate === TODAY());
    const row = b => `<tr><td><b>${b.id}</b><div class="tiny">${fd(b.date)}</div></td><td>${esc(P(b.pid).name)}</td><td>${b.items.map(i => esc(i.d)).join(', ')}${b.paid ? '<br>' + stamp(b.ps, 'Paid') : ''}</td><td class="n"><b>${inr(tot(b))}</b></td><td>${btn('inv', b.id, b.paid ? 'View' : 'Collect', b.paid ? 'g' : 'ok', b.paid ? 'file' : 'rupee')}</td></tr>`;
    const th = '<thead><tr><th>Bill</th><th>Patient</th><th>Items</th><th class="n">Total</th><th></th></tr></thead>';
    return head('Billing', 'OPD, lab, scan, pharmacy and IPD charges collect into one bill per patient.') + `<div class="kpis">${kpi(un.reduce((s, b) => s + tot(b), 0), 'Outstanding', 'rupee', 'patient', 'inr')}${kpi(pd.reduce((s, b) => s + tot(b), 0), 'Collected today', 'rupee', 'pharmacy', 'inr')}</div><div class="card mb"><h2>Unpaid</h2>${un.length ? `<table class="stack">${th}<tbody>${un.map(row).join('')}</tbody></table>` : empty('All bills settled.')}</div><div class="card"><h2>Paid today</h2>${pd.length ? `<table class="stack">${th}<tbody>${pd.map(row).join('')}</tbody></table>` : empty('No payments yet today.')}</div>`;
  },
  patients() { return head('Patients', S.patients.length + ' registered') + `<div class="card"><label>Search by name, UHID or mobile<input data-in="psearch" placeholder="Type to search…"></label><table class="stack" id="ptab"><thead><tr><th>UHID</th><th>Name</th><th>Age / Sex</th><th>Mobile</th><th>Blood</th><th></th></tr></thead><tbody>${S.patients.slice().reverse().map(p => `<tr data-s="${esc((p.name + ' ' + p.id + ' ' + p.mobile).toLowerCase())}"><td>${p.id}</td><td><b>${esc(p.name)}</b>${p.allergy ? `<div class="small hl">Allergy: ${esc(p.allergy)}</div>` : ''}</td><td>${p.age} / ${p.sex}</td><td>${p.mobile}</td><td>${esc(p.blood)}</td><td>${btn('file', p.id, 'Open file', 'g', 'file')}</td></tr>`).join('')}</tbody></table></div>`; },
  queue() {
    const q = S.visits.filter(v => v.did === U.did && v.date === TODAY()).sort((a, b) => a.token - b.token), d = D(U.did), nxt = q.find(v => v.status !== 'Done');
    return head('My OPD queue', `${esc(d.name)} · ${esc(d.dept)} · ${fd(TODAY())}`, nxt ? btn('consult', nxt.id, `Call next · token ${nxt.token}`, '', 'steth') : '') + `<div class="kpis">${kpi(q.length, 'Patients today', 'user', 'doctor')}${kpi(q.filter(v => v.status !== 'Done').length, 'Still to see', 'cal', 'patient')}${kpi(S.orders.filter(o => o.did === U.did && o.status !== 'Approved').length, 'Reports awaited', 'flask', 'lab')}${kpi(S.adm.filter(a => a.did === U.did && a.status === 'Admitted').length, 'My IPD patients', 'bed', 'nurse')}</div><div class="card"><table class="stack"><thead><tr><th>Token</th><th>Patient</th><th>Complaint</th><th>Status</th><th></th></tr></thead><tbody>${q.map(v => { const p = P(v.pid); return `<tr><td><b class="sora" style="font-size:20px;color:var(--pri)">${v.token}</b></td><td>${esc(p.name)}<div class="tiny">${p.age} y · ${p.sex}${p.allergy ? ` · <span class="hl">Allergy</span>` : ''}</div></td><td>${esc(v.complaint)}${v.s ? '<br>' + stamp(v.s) : ''}</td><td>${st(v.status)}</td><td>${v.status === 'Done' ? btn('file', v.pid, 'View file', 'g', 'file') : btn('consult', v.id, v.status === 'In consultation' ? 'Continue' : 'Consult', '', 'steth')}</td></tr>`; }).join('') || `<tr><td colspan="5">${empty('No patients booked today.')}</td></tr>`}</tbody></table></div>`;
  },
  consult() {
    const v = S.visits.find(v => v.id === X.vid); if (!v) return empty('Select a patient from the queue.'); const p = P(v.pid);
    if (v.status === 'Done') return head('Consultation saved', esc(p.name), `<button class="btn g" data-a="go" data-id="queue">Back to queue</button>`) + `<div class="card">${chartHTML(p.id)}</div>`;
    return head(`Consultation · token ${v.token}`, esc(p.name), `<button class="btn g" data-a="go" data-id="queue">Back to queue</button>`) + `<div class="cols"><div class="card">${chartHTML(p.id)}</div><form class="card" data-f="consult"><input type="hidden" name="vid" value="${v.id}"><h2>Vitals</h2><div class="g5"><label>BP<input name="bp" placeholder="120/80"></label><label>Pulse<input name="pulse" type="number"></label><label>Temp °F<input name="temp" type="number" step="0.1"></label><label>Weight kg<input name="wt" type="number" step="0.1"></label><label>SpO₂ %<input name="spo2" type="number"></label></div>
    <label>Complaint<textarea name="complaint">${esc(v.complaint)}</textarea></label><label>Diagnosis<input name="diagnosis" required placeholder="e.g. Acute pharyngitis"></label><label>Advice / notes<textarea name="notes" placeholder="Diet, rest, warning signs…"></textarea></label>
    <h3>Medicines</h3><div class="tiny" style="margin-bottom:6px">Medicine · dose (morning-noon-night) · days</div><div id="meds">${medRow()}</div><button type="button" class="btn g sm" data-a="addmed" data-id="">${ic('plus')}Add medicine</button>
    <h3>Lab tests</h3><div class="chips">${Object.entries(C().LABT).map(([k, t]) => `<label class="chip"><input type="checkbox" name="lab" value="${esc(k)}">${esc(k)} <span class="mut">${inr(t.price)}</span></label>`).join('')}</div>
    <h3>X-ray & scans</h3><div class="chips">${Object.entries(C().IMGT).map(([k, pr]) => `<label class="chip"><input type="checkbox" name="img" value="${esc(k)}">${esc(k)} <span class="mut">${inr(pr)}</span></label>`).join('')}</div>
    <h3>Next steps</h3><label class="ck"><input type="checkbox" name="admit">Advise admission (reception is notified)</label><label>Follow-up date<input name="fu" type="date" min="${day(1)}"></label>
    <p class="tiny">Everything you save is stamped “Monitored by ${esc(U.name)}”.</p><button class="btn">${ic('seal')}Save & send orders</button></form></div>`;
  },
  ipdlist() {
    const a = S.adm.filter(a => a.status === 'Admitted' && (U.role !== 'doctor' || a.did === U.did));
    return head(U.role === 'doctor' ? 'My IPD patients' : 'Admitted patients', a.length + ' admitted') + `<div class="card">${a.length ? `<table class="stack"><thead><tr><th>Patient</th><th>Bed</th><th>Consultant</th><th>Latest vitals</th><th></th></tr></thead><tbody>${a.map(x => { const l = x.vitals[x.vitals.length - 1]; return `<tr><td><b>${esc(P(x.pid).name)}</b><div class="tiny">${x.id} · since ${fd(x.date)}</div></td><td><b>${x.bed}</b></td><td>${esc(dname(x.did))}</td><td>${l ? `BP ${esc(l.bp)} · P ${l.pulse} · T ${l.temp} · SpO₂ <span class="${l.spo2 < 94 ? 'hl' : ''}">${l.spo2}</span><br>${stamp(l.s)}` : '—'}</td><td><div class="acts">${btn('vit', x.id, 'Vitals', '', 'heart')}${btn('file', x.pid, 'File', 'g')}${U.role === 'doctor' ? btn('discharge', x.id, 'Discharge', 'g') : ''}</div></td></tr>`; }).join('')}</tbody></table>` : empty('No admitted patients.')}</div>`;
  },
  beds() {
    const occ = S.beds.filter(b => b.pid).length;
    return head('Bed board', `${occ} of ${S.beds.length} beds occupied · tap an occupied bed to record vitals`) + `<div class="kpis">${C().WARDS.map(([k, n]) => { const bs = S.beds.filter(b => b.ward === k); return kpi(bs.filter(b => !b.pid).length, `free in ${n} (${bs.length})`, 'bed', 'nurse'); }).join('')}</div>` +
      C().WARDS.map(([k, n, , r]) => `<section class="card mb"><h2>${n} <span class="tiny">· ${inr(r)}/day</span></h2><div class="beds">${S.beds.filter(b => b.ward === k).map(b => { const p = b.pid && P(b.pid), a = p && S.adm.find(a => a.bed === b.id && a.status === 'Admitted'), l = a && a.vitals[a.vitals.length - 1], al = l && (l.spo2 < 94 || l.temp >= 101 || l.pulse > 110); return `<button class="bed ${p ? 'occ' : ''} ${al ? 'al' : ''}" data-a="bed" data-id="${b.id}"><span class="bi">${ic('bed', 26)}</span><b>${b.id}</b><span>${p ? esc(p.name) : 'Free'}</span>${l ? `<small>SpO₂ ${l.spo2}% · ${esc(l.s.by)}</small>` : ''}</button>`; }).join('')}</div></section>`).join('');
  },
  nlab() { return deskList('lab', true); },
  lab() { return deskList('lab'); }, labdone() { return doneList('lab'); }, img() { return deskList('img'); }, imgdone() { return doneList('img'); },
  rxq() {
    const pend = S.rx.filter(r => r.status === 'Pending'), done = S.rx.filter(r => r.status === 'Dispensed' && r.dd === TODAY());
    return head('Prescriptions', pend.length + ' waiting · change any quantity before dispensing') + (pend.map(rxCard).join('') || `<div class="card mb">${empty('No prescriptions waiting.')}</div>`) + (done.length ? '<h2 style="margin-top:24px">Dispensed today</h2>' + done.map(rxCard).join('') : '');
  },
  meds() {
    const L = S.meds.slice().sort((a, b) => a.name.localeCompare(b.name));
    return head('Medicine list', 'Managed by the pharmacy in-charge. Doctors can prescribe only active medicines.', `<button class="btn" data-a="medform" data-id="">${ic('plus')}Add medicine</button>`) + `<div class="kpis">${kpi(S.meds.filter(m => m.active).length, 'Active medicines', 'pill', 'pharmacy')}${kpi(S.meds.filter(m => mstat(m) === 'Low stock').length, 'Below reorder level', 'alert', 'img')}${kpi(S.meds.filter(m => mstat(m) === 'Out of stock').length, 'Out of stock', 'box', 'patient')}</div>
    <div class="card"><label>Search medicines<input data-in="msearch" placeholder="Name, generic or category…"></label><table class="stack" id="mtab"><thead><tr><th>Medicine</th><th>Form</th><th>Category</th><th class="n">Price / unit</th><th class="n">In stock</th><th class="n">Reorder at</th><th>Status</th><th></th></tr></thead><tbody>${L.map(m => `<tr data-s="${esc((m.name + ' ' + m.generic + ' ' + m.cat).toLowerCase())}"><td><b>${esc(m.name)}</b><div class="tiny">${esc(m.generic)}</div>${stamp(m.upd, 'Last updated')}</td><td>${esc(m.form)}</td><td>${esc(m.cat)}</td><td class="n">${inr(m.price)}</td><td class="n">${avail(m.id)}</td><td class="n">${m.reorder}</td><td>${st(mstat(m))}</td><td>${btn('medform', m.id, 'Edit', 'g', 'edit')}</td></tr>`).join('')}</tbody></table></div>`;
  },
  stock() {
    const L = S.stock.slice().sort((a, b) => a.exp.localeCompare(b.exp));
    return head('Stock & batches', 'First-expiry-first-out: dispensing always uses the batch that expires soonest.', `<button class="btn" data-a="batchform" data-id="">${ic('plus')}Add batch (purchase)</button>`) + `<div class="kpis">${kpi(S.stock.length, 'Batches', 'box', 'pharmacy')}${kpi(S.stock.filter(x => bstat(x) === 'Expiring soon').length, 'Expiring in 90 days', 'alert', 'img')}${kpi(S.stock.filter(x => bstat(x) === 'Expired').length, 'Expired — remove', 'alert', 'patient')}</div>
    <div class="card"><table class="stack"><thead><tr><th>Medicine</th><th>Batch</th><th>Expiry</th><th class="n">Qty</th><th>Status</th><th></th></tr></thead><tbody>${L.map(x => `<tr><td><b>${esc(MED(x.mid).name)}</b><br>${stamp(x.upd, x.note || 'Last updated')}</td><td>${esc(x.batch)}</td><td>${fd(x.exp)}</td><td class="n"><b>${x.qty}</b></td><td>${st(bstat(x))}</td><td>${btn('batchform', x.id, 'Edit', 'g', 'edit')}</td></tr>`).join('')}</tbody></table></div>`;
  },
  dash() {
    const tv = S.visits.filter(v => v.date === TODAY()), cat = {}, doc = {};
    S.bills.forEach(b => b.items.forEach(i => { if (i.dt === TODAY()) cat[i.c] = (cat[i.c] || 0) + i.a; }));
    tv.forEach(v => { const d = D(v.did); const n = d.dept || d.name; doc[n] = (doc[n] || 0) + 1; });
    const billed = Object.values(cat).reduce((a, b) => a + b, 0), coll = S.bills.filter(b => b.paid && b.pdate === TODAY()).reduce((s, b) => s + tot(b), 0);
    return head('Hospital dashboard', fd(TODAY())) + `<div class="kpis k3">${kpi(tv.length, 'OPD patients today', 'user', 'reception')}${kpi(S.beds.filter(b => b.pid).length + ' / ' + S.beds.length, 'Beds occupied', 'bed', 'nurse')}${kpi(S.orders.filter(o => o.status !== 'Approved').length, 'Reports pending', 'flask', 'lab')}${kpi(billed, 'Billed today', 'chart', 'doctor', 'inr')}${kpi(coll, 'Collected today', 'rupee', 'pharmacy', 'inr')}${kpi(S.meds.filter(m => ['Low stock', 'Out of stock'].includes(mstat(m))).length, 'Medicines to reorder', 'pill', 'patient')}</div>
    <div class="c2"><div class="card"><h2>Billed today by department</h2>${bars(cat, 1)}</div><div class="card"><h2>OPD patients by speciality</h2>${bars(doc)}</div></div>
    <div class="card" style="margin-top:16px"><div class="vh" style="margin-bottom:8px"><h2 style="margin:0">Recent activity</h2>${btn('go', 'audit', 'Full audit log', 'g', 'file')}</div>${logTable(S.log.slice(0, 8))}</div>`;
  },
  users() {
    const desks = Object.entries(ROLES).filter(([k]) => k !== 'patient');
    return head('Staff & logins', 'Each person signs in with their own ID; every entry they make carries their name.') + `<div class="card mb"><table class="stack"><thead><tr><th>Name</th><th>Desk</th><th>User ID</th><th>Status</th><th></th></tr></thead><tbody>${S.staff.map(s => `<tr><td><b>${esc(s.name)}</b>${s.did ? `<div class="tiny">${esc(D(s.did).dept)}</div>` : ''}</td><td><span class="st" style="background:color-mix(in srgb,var(--${s.role}) 12%,transparent);color:var(--${s.role})">${ROLES[s.role].t}</span></td><td>${esc(s.uid)}</td><td>${st(s.active ? 'Active' : 'Disabled')}</td><td><div class="acts">${s.uid === U.uid ? '' : btn('tog', s.uid, s.active ? 'Disable' : 'Enable', 'g')}${btn('pwreset', s.uid, 'Reset password', 'g', 'key')}</div></td></tr>`).join('')}</tbody></table></div>
    <form class="card" data-f="staff"><h2>Add staff member</h2><div class="g2"><label>Display name<input name="name" required placeholder="e.g. Nurse Leela or Dr. Kiran Shah"></label><label>Desk<select name="role">${desks.map(([k, r]) => `<option value="${k}">${r.t}</option>`).join('')}</select></label><label>User ID<input name="uid" required autocomplete="off"></label><label>First password<input name="password" type="text" minlength="8" required autocomplete="off"></label><label>Speciality (doctors)<input name="dept" placeholder="e.g. Neurology"></label><label>Consultation fee ₹ (doctors)<input name="fee" type="number" min="0" value="500"></label></div><button class="btn">${ic('plus')}Add staff</button></form>`;
  },
  audit() { return head('Audit log', 'Every sign-in, view and change, with the person’s name.') + `<div class="card"><label>Filter<input data-in="asearch" placeholder="Name, patient or action…"></label><div id="atab">${logTable(S.log)}</div></div>`; },
  me() {
    const p = P(U.pid), up = S.visits.filter(v => v.date >= TODAY() && v.status !== 'Done'), ready = S.orders.filter(o => o.status === 'Approved'), due = S.bills.filter(b => !b.paid);
    return `<div class="card welcome mb"><h2 style="font-size:24px;margin:0">Hello, ${esc(p.name.split(' ')[0])}</h2><p style="margin:4px 0 0;opacity:.9">${esc(S.hospital)} · UHID ${p.id}</p>${ECG}</div>
    <div class="kpis">${kpi(up.length, 'Upcoming visits', 'cal', 'reception')}${kpi(ready.length, 'Reports ready', 'file', 'lab')}${kpi(due.reduce((s, b) => s + tot(b), 0), 'Amount due', 'rupee', 'patient', 'inr')}</div>
    <div class="cols"><div><div class="card mb"><h2>Upcoming appointments</h2>${up.length ? up.map(v => `<p><b>${fd(v.date)}</b> · token <b>${v.token}</b> · ${esc(dname(v.did))} ${st(v.status)}</p>`).join('') : empty('None booked.')}<button class="btn sm" data-a="go" data-id="mybook">${ic('cal')}Book a visit</button></div><div class="card"><h2>${ic('bell')} Messages</h2>${S.notes.length ? S.notes.slice(0, 8).map(x => `<p><span class="tiny">${esc(x.t)}</span><br>${esc(x.msg)}</p>`).join('') : empty('No messages.')}</div></div><div class="card">${chartHTML(p.id)}</div></div>`;
  },
  myreports() { return head('My reports', 'Reports appear here as soon as the lab or radiology releases them.') + `<div class="card"><table class="stack"><thead><tr><th>Date</th><th>Test</th><th>Department</th><th>Status</th><th></th></tr></thead><tbody>${S.orders.slice().reverse().map(x => `<tr><td>${fd(x.date)}</td><td><b>${esc(x.test)}</b></td><td>${x.kind === 'lab' ? 'Laboratory' : 'Radiology'}</td><td>${st(x.status === 'Approved' ? 'Ready' : 'In progress')}</td><td>${x.status === 'Approved' ? btn('rep', x.id, 'View', '', 'file') : ''}</td></tr>`).join('') || `<tr><td colspan="5">${empty('No reports yet.')}</td></tr>`}</tbody></table></div>`; },
  myrx() { return head('My medicines') + (S.rx.slice().reverse().map(x => `<div class="card mb"><h2>${fd(x.date)} · ${esc(dname(x.did))}</h2><table class="stack"><thead><tr><th>Medicine</th><th>Dose</th><th>Days</th><th class="n">Qty</th></tr></thead><tbody>${x.items.map(i => `<tr><td><b>${esc(i.med)}</b></td><td>${esc(i.dose)}</td><td>${i.days}</td><td class="n">${i.qty}</td></tr>`).join('')}</tbody></table>${stamp(x.s, 'Prescribed')} ${x.ds ? stamp(x.ds, 'Dispensed') : ''}</div>`).join('') || `<div class="card">${empty('No prescriptions yet.')}</div>`); },
  mybills() { return head('My bills') + `<div class="card"><table class="stack"><thead><tr><th>Bill</th><th>Date</th><th class="n">Amount</th><th>Status</th><th></th></tr></thead><tbody>${S.bills.slice().reverse().map(x => `<tr><td><b>${x.id}</b></td><td>${fd(x.date)}</td><td class="n">${inr(tot(x))}</td><td>${st(x.paid ? 'Paid' : 'Unpaid')}</td><td><div class="acts">${btn('inv', x.id, 'View', 'g')}${x.paid || !S.demo ? '' : btn('upi', x.id, 'Pay by UPI', 'ok', 'rupee')}</div></td></tr>`).join('') || `<tr><td colspan="5">${empty('No bills.')}</td></tr>`}</tbody></table>${S.demo ? '' : '<p class="tiny" style="margin-top:10px">Pay at the reception desk by cash, UPI or card.</p>'}</div>`; },
  mybook() { return head('Book a visit') + `<form class="card" data-f="pbook" style="max-width:660px"><label>Doctor<select name="did">${dopts()}</select></label><label>Date<input name="date" type="date" value="${TODAY()}" min="${TODAY()}"></label><label>What is the problem?<input name="complaint" required></label><button class="btn">${ic('cal')}Book & get token</button></form>`; }
};
function rxCard(r) {
  const p = P(r.pid), pend = r.status === 'Pending'; let total = 0;
  const rows = r.items.map((i, k) => { const m = MED(i.mid), q = avail(i.mid), amt = m.price * i.qty; total += amt; return `<tr class="${i.edit ? 'edited' : ''}"><td><b>${esc(i.med)}</b><div class="tiny">${esc(i.dose)} · ${i.days} days · prescribed ${i.pq}</div>${i.edit ? stamp(i.edit, `Qty changed ${i.edit.from} → ${i.edit.to}`) : ''}</td><td class="n">${pend ? `<input class="qin" type="number" min="0" value="${i.qty}" data-rx="${r.id}" data-k="${k}" aria-label="Quantity of ${esc(i.med)}">` : i.qty}</td><td class="n ${q < i.qty && pend ? 'hl' : ''}">${q}</td><td class="n">${inr(m.price)}</td><td class="n"><b>${inr(amt)}</b></td></tr>`; }).join('');
  return `<div class="card mb"><div class="vh" style="margin-bottom:8px;align-items:center"><div><h2 style="margin:0">${esc(p.name)} <span class="tiny">${p.id}</span></h2><div class="tiny">${r.id} · ${esc(dname(r.did))} · ${fd(r.date)}${p.allergy ? ` · <span class="hl">Allergy: ${esc(p.allergy)}</span>` : ''}</div></div>${pend ? btn('disp', r.id, 'Dispense ' + inr(total), 'ok', 'pill') : st('Dispensed')}</div><div class="scroll"><table><thead><tr><th>Medicine</th><th class="n">Qty to give</th><th class="n">In stock</th><th class="n">Rate</th><th class="n">Amount</th></tr></thead><tbody>${rows}</tbody></table></div>${stamp(r.s, 'Prescribed')} ${r.ds ? stamp(r.ds, 'Dispensed') : ''}</div>`;
}
function deskList(kind, nurse) {
  const L = S.orders.filter(o => o.kind === kind && o.status !== 'Approved' && (!nurse || o.status === 'Ordered'));
  const nx = kind === 'lab' ? { Ordered: ['labCollect', 'Collect sample'], 'Sample collected': nurse ? null : ['labres', 'Enter results'], 'Result entered': ['release', 'Approve & release'] } : { Ordered: ['imgScan', 'Mark scanned'], Scanned: ['imgrep', 'Upload image & report'], Reported: ['release', 'Approve & release'] };
  return head(nurse ? 'Samples to collect' : kind === 'lab' ? 'Lab test orders' : 'X-ray & scan orders', L.length + ' in progress · orders arrive the moment the doctor saves') + `<div class="card">${L.length ? `<table class="stack"><thead><tr><th>Order</th><th>Patient</th><th>Test</th><th>Status</th><th></th></tr></thead><tbody>${L.map(o => { const a = nx[o.status]; const bed = S.adm.find(x => x.pid === o.pid && x.status === 'Admitted'); return `<tr><td><b>${o.id}</b><div class="tiny">${fd(o.date)}</div></td><td>${esc(P(o.pid).name)}<div class="tiny">${o.pid}${bed ? ' · bed ' + bed.bed : ''}</div></td><td><b>${esc(o.test)}</b><br>${stamp(last(o), o.status)}</td><td>${st(o.status)}</td><td><div class="acts">${a ? btn(a[0], o.id, a[1], a[0] === 'release' ? 'ok' : '') : ''}${o.status === 'Result entered' || o.status === 'Reported' ? btn('rep', o.id, 'Preview', 'g') : ''}</div></td></tr>`; }).join('')}</tbody></table>` : empty('No pending orders. All caught up.')}</div>`;
}
function doneList(kind) { const L = S.orders.filter(o => o.kind === kind && o.status === 'Approved').reverse(); return head('Released reports', 'Visible to the doctor and the patient') + `<div class="card"><table class="stack"><thead><tr><th>Report</th><th>Patient</th><th>Test</th><th>Released</th><th></th></tr></thead><tbody>${L.map(o => `<tr><td>${o.id}</td><td>${esc(P(o.pid).name)}</td><td>${esc(o.test)}</td><td>${stamp(last(o))}</td><td>${btn('rep', o.id, 'View', 'g', 'file')}</td></tr>`).join('') || `<tr><td colspan="5">${empty('Nothing released yet.')}</td></tr>`}</tbody></table></div>`; }

// ---------- login ----------
function renderLogin() {
  const demo = PUB && PUB.demo, deps = (PUB && PUB.departments.length ? PUB.departments : ['General medicine']).concat(['Pathology', 'Radiology', 'Pharmacy', 'ICU']);
  const dIc = { Cardiology: 'heart', Orthopaedics: 'bone', Paediatrics: 'baby', Pathology: 'flask', Radiology: 'scan', Pharmacy: 'pill', ICU: 'bed' };
  let body;
  if (LG.tab === 'staff') body = `${demo ? `<div class="desks">${Object.entries(DEMO_UID).map(([k]) => `<button type="button" class="desk ${LG.desk === k ? 'on' : ''}" style="--c:var(--${k})" data-a="desk" data-id="${k}"><span class="ico">${ic(ROLES[k].ic, 18)}</span>${ROLES[k].t.replace(' / IPD', '')}</button>`).join('')}</div><div class="demo">Demo: tap a desk to fill its login · password demo123</div>` : ''}
    <form data-f="login"><label>User ID<input name="uid" autocomplete="username" required value="${esc(LG.desk ? DEMO_UID[LG.desk] : '')}" autocapitalize="off"></label><label>Password<span style="position:relative;display:block"><input name="pw" type="password" autocomplete="current-password" required value="${demo && LG.desk ? 'demo123' : ''}"><button type="button" data-a="peek" data-id="" aria-label="Show password" style="position:absolute;right:6px;top:11px;border:0;background:none;cursor:pointer;color:var(--mut);padding:8px">${ic('eye')}</button></span></label><button class="btn" style="width:100%">${ic('shield')}Sign in securely</button></form>`;
  else if (LG.choose) body = `<p>This mobile number is shared by family members. Who is logging in?</p><div style="display:grid;gap:8px">${LG.choose.map(c => `<button class="btn g" data-a="pickpt" data-id="${c.id}">${esc(c.name)} · ${c.age} y</button>`).join('')}</div>`;
  else if (LG.step === 1) body = `<form data-f="otp1"><label>Registered mobile number<input name="mobile" inputmode="numeric" maxlength="10" autocomplete="tel" required value="${esc(LG.mobile || (demo ? '9876501001' : ''))}"></label>${demo ? '<div class="demo">Demo patients: 9876501001 to 9876501007</div>' : ''}<button class="btn" style="width:100%">Send login code</button></form>`;
  else body = `<form data-f="otp2"><p>Enter the 6-digit login code for <b>${esc(LG.mobile)}</b>.</p><input name="otp" class="otp" inputmode="numeric" maxlength="6" autocomplete="one-time-code" required aria-label="Login code">${LG.demoOtp ? `<div class="demo" style="margin-top:10px">Trial version (no SMS): your code is <b>${LG.demoOtp}</b></div>` : ''}<p></p><button class="btn" style="width:100%">Verify & open my records</button><p style="margin-top:10px"><button type="button" class="btn g sm" data-a="otpback" data-id="">Change number</button></p></form>`;
  const fl = [['plus', 6, 12, 90], ['heart', 70, 8, 70], ['pill', 18, 72, 60], ['flask', 82, 64, 80], ['plus', 45, 86, 50], ['steth', 30, 30, 64], ['plus', 92, 30, 44]];
  $('#root').innerHTML = `<div class="login"><div class="floaters" aria-hidden="true">${fl.map(([k, x, y, s], i) => `<span style="left:${x}%;top:${y}%;width:${s}px;height:${s}px;animation-delay:-${i * 2.3}s"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">${IC[k]}</svg></span>`).join('')}</div>
  <section class="hero"><div class="logo"><span class="mark">${MARK}</span><span>Hospital management<br><span style="opacity:.75;font-weight:600">Reception to bedside, one record</span></span></div>
  <h1>${esc((LIC && LIC.hospital) || 'Devocrat Multi-Speciality Hospital').replace('Multi-Speciality', '<em>Multi-Speciality</em>')}</h1><p class="lead">Reception, doctors, nurses, laboratory, X-ray & scan, pharmacy and patients — connected live on phone, tablet and desktop.</p>${ECG}
  <div class="spec">${deps.map(d => `<span>${ic(dIc[d] || 'steth')}${esc(d)}</span>`).join('')}</div><div class="er"><b>${MARK.replace('#e53935', '#fff')}</b>24×7 Emergency & ICU</div></section>
  <section class="pane"><div class="glass"><h2 style="font-size:22px;margin:0">Welcome back</h2><p class="mut" style="margin:2px 0 0">Sign in to your desk or your health records.</p><div class="tabs" role="tablist"><button class="${LG.tab === 'staff' ? 'on' : ''}" data-a="tab" data-id="staff" role="tab">Hospital staff</button><button class="${LG.tab === 'patient' ? 'on' : ''}" data-a="tab" data-id="patient" role="tab">Patient</button></div>${body}${LIC && LIC.expiry ? `<div class="demo" style="margin:16px 0 0;text-align:center;background:var(--pri2);color:var(--pri)">${esc(LIC.plan || 'Trial')} version${LIC.licensedTo ? ' · ' + esc(LIC.licensedTo) : ''} · valid until ${fd(LIC.expiry)} (${LIC.daysLeft} day${LIC.daysLeft === 1 ? '' : 's'} left)</div>` : ''}<p class="tiny" style="margin:12px 0 0;text-align:center">${ic('shield', 14)} Secure sign-in · every action is recorded with your name</p></div></section></div>`;
}

// ---------- licence lock, setup, offline ----------
function shell(inner) { return `<div class="login"><div class="hero"><div class="logo"><span class="mark">${MARK}</span><span>${esc((LIC && LIC.hospital) || 'Devocrat Multi-Speciality Hospital')}<br><span style="opacity:.75;font-weight:600">Hospital management</span></span></div>${ECG}</div><section class="pane"><div class="glass">${inner}</div></section></div>`; }
function renderLocked() {
  clearInterval(pollT); closeM();
  const L = LIC || {}, sus = L.reason === 'suspended';
  $('#root').innerHTML = shell(`<div class="ico" style="--c:var(--red);width:56px;height:56px">${ic('shield', 28)}</div><h1 style="margin-top:12px">${sus ? 'Access paused' : 'Trial period ended'}</h1><p class="mut">${sus ? 'This app has been paused by the provider.' : `The trial${L.licensedTo ? ' for <b>' + esc(L.licensedTo) + '</b>' : ''} ended${L.expiry ? ' on <b>' + fd(L.expiry) + '</b>' : ''}.`}</p><p>${esc(L.message || '')}</p>${L.phone ? `<p>${ic('bell', 16)} <b>${esc(L.phone)}</b></p>` : ''}${L.email ? `<p>${ic('file', 16)} <b>${esc(L.email)}</b></p>` : ''}<p class="tiny">Your hospital data is safe and will be available again when the licence is renewed.</p><div class="acts"><button class="btn" data-a="recheck" data-id="">Check again</button>${T ? '<button class="btn g" data-a="logout" data-id="">Sign out</button>' : ''}</div>`);
}
function renderSetup() {
  $('#root').innerHTML = shell(`<h1>Connect your Google Sheet</h1><p class="mut">Paste the <b>Web app URL</b> from Apps Script (Deploy → Manage deployments). It ends with <code>/exec</code>.</p><form data-f="apiurl"><label>Web app URL<input name="url" required placeholder="https://script.google.com/macros/s/…/exec" value="${esc(ls('dmh_api') || '')}"></label><button class="btn" style="width:100%">Connect</button></form><p class="tiny" style="margin-top:12px">To set it for everyone, put the URL in <code>public/config.js</code> and push to GitHub — Netlify redeploys automatically.</p>`);
}
function renderOffline(msg) {
  $('#root').innerHTML = shell(`<h1>Can’t reach the hospital server</h1><p class="mut">${esc(msg)}</p><div class="acts"><button class="btn" data-a="recheck" data-id="">Try again</button><button class="btn g" data-a="resetapi" data-id="">Change server URL</button></div>`);
}
function trialNote() {
  const L = (S && S.license) || LIC; if (!L || !L.expiry) return '';
  if (L.daysLeft > 7 && !(U && U.role === 'admin')) return '';
  return `<div class="trial">${ic('shield', 16)} ${esc(L.plan || 'Trial')} version · ${L.daysLeft === 0 ? 'ends today' : `ends in ${L.daysLeft} day${L.daysLeft === 1 ? '' : 's'}`} (${fd(L.expiry)})${L.licensedTo ? ' · licensed to ' + esc(L.licensedTo) : ''}</div>`;
}

// ---------- app shell ----------
function render() {
  if (!S) return renderLogin();
  U = S.me; const R = ROLES[U.role]; document.title = S.hospital;
  if (!VIEWS[V] || (V !== 'consult' && !R.nav.some(n => n[0] === V) && !(U.role === 'admin' && V === 'audit'))) V = R.nav[0][0];
  const badge = { rxq: S.rx.filter(r => r.status === 'Pending').length, lab: S.orders.filter(o => o.kind === 'lab' && o.status !== 'Approved').length, nlab: S.orders.filter(o => o.kind === 'lab' && o.status === 'Ordered').length, img: S.orders.filter(o => o.kind === 'img' && o.status !== 'Approved').length, queue: U.did ? S.visits.filter(v => v.did === U.did && v.date === TODAY() && v.status !== 'Done').length : 0, billing: S.bills.filter(b => !b.paid).length, meds: S.meds.filter(m => ['Low stock', 'Out of stock'].includes(mstat(m))).length, myreports: U.role === 'patient' ? S.orders.filter(o => o.status === 'Approved').length : 0 };
  const h = new Date().getHours(), greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening', staff = U.role !== 'patient';
  const scrollY = window.scrollY, same = lastView === V;
  $('#root').innerHTML = `<div class="app"><aside class="side"><div class="logo"><span class="mark">${MARK}</span><span>${esc(S.hospital.split(' ')[0])}<br><span style="font-weight:600;opacity:.8">${esc(S.hospital.split(' ').slice(1).join(' '))}</span></span></div>${ECG}<div class="who" style="--c:var(--${U.role})"><div class="av">${esc(ini(U.name))}</div><div><b>${esc(U.name)}</b><span class="duty">${R.t}${staff ? ' · on duty' : ''}</span></div></div>
  ${R.nav.map(([k, t, i]) => `<button class="nav ${V === k || (V === 'consult' && k === 'queue') ? 'on' : ''}" data-a="go" data-id="${k}">${ic(i)}<span>${t}</span>${badge[k] ? `<em>${badge[k]}</em>` : ''}</button>`).join('')}
  <div class="sfoot"><button data-a="theme" data-id="">${ic(document.documentElement.dataset.theme === 'dark' ? 'sun' : 'moon', 16)}Theme</button><button data-a="logout" data-id="">${ic('out', 16)}Sign out</button></div></aside>
  <div><div id="alerts"></div>${trialNote()}${navigator.onLine ? '' : '<div class="offline">You are offline — showing the last saved data. Changes need a connection.</div>'}
  <header class="top"><div class="hello"><b class="sora">${greet}, ${esc(U.name.replace(/^(Receptionist|Lab Tech|Radiographer|Pharmacist|Admin) /, ''))}</b><div class="clk" id="clk"></div></div><span class="grow"></span>
  <button class="pending" id="pend" data-a="applypend" data-id="" ${pending ? '' : 'hidden'}>New updates · refresh</button>
  ${staff ? `<div class="gs">${ic('search', 18)}<input data-in="gsearch" list="pall" placeholder="Find patient — name, UHID, mobile" aria-label="Find patient"><datalist id="pall">${S.patients.map(p => `<option value="${esc(p.name)} · ${p.id}">`).join('')}</datalist></div><button class="sos" data-a="sos" data-id="" title="Raise an emergency code"><b>${ic('bolt', 16)}</b><span>Emergency</span></button>` : ''}
  <button class="ib" data-a="menu" data-id="" aria-label="Account menu"><span class="av" style="width:36px;height:36px;font-size:13px;--c:var(--${U.role})">${esc(ini(U.name))}</span></button></header>
  <main class="wrap ${same ? '' : 'enter'}">${VIEWS[V]()}</main></div></div>${fabHTML()}`;
  renderAlerts(); tick(); fitKpis();
  if (!same) { lastView = V; countUp(); window.scrollTo(0, 0); } else window.scrollTo(0, scrollY);
  try { sessionStorage.setItem('dmh_view', V); } catch (e) {}
}
function renderAlerts() {
  const box = $('#alerts'); if (!box || !S) return;
  box.innerHTML = (S.alerts || []).map(a => { const mine = a.acks.some(x => x.uid === U.uid); return `<div class="code" style="--cc:${CODE_COL[a.code] || '#c62828'}">${ic('bolt', 22)}<b class="cn">${esc(a.code)}</b><span>${esc(a.location)}${a.note ? ' · ' + esc(a.note) : ''} · raised by ${esc(a.s.by)} · ${esc(a.s.t)}</span><span class="grow"></span><span>${a.acks.length} responding</span>${mine ? '' : btn('ack', a.id, 'I’m responding', '', 'seal')}${['reception', 'doctor', 'nurse', 'admin'].includes(U.role) ? btn('closecode', a.id, 'Close', 'g') : ''}${btn('codeinfo', a.id, 'Details', 'g')}</div>`; }).join('');
  (S.alerts || []).forEach(a => { if (!seenAlerts.has(a.id)) { seenAlerts.add(a.id); } });
}
function fabHTML() {
  const F = { reception: [['go:register', 'Register patient', 'user'], ['go:book', 'Book OPD token', 'cal'], ['go:admit', 'Admit patient', 'bed'], ['go:billing', 'Collect payment', 'rupee']], doctor: [['next', 'Call next patient', 'steth'], ['go:ipdlist', 'IPD rounds', 'bed']], nurse: [['go:beds', 'Record vitals', 'heart'], ['go:nlab', 'Collect samples', 'flask']], pharmacy: [['go:rxq', 'Dispense', 'pill'], ['medform:', 'Add medicine', 'plus'], ['batchform:', 'Add stock batch', 'box']], lab: [['go:lab', 'Test orders', 'flask']], img: [['go:img', 'Scan orders', 'scan']], admin: [['go:users', 'Add staff', 'user'], ['go:audit', 'Audit log', 'file']], patient: [['go:mybook', 'Book a visit', 'cal'], ['go:myreports', 'My reports', 'file']] }[U.role] || [];
  return `<div class="fab" id="fab"><div class="fi">${F.map(([a, l, i]) => { const [n, id] = a.split(':'); return `<button data-a="${n}" data-id="${id || ''}">${ic(i)}${l}</button>`; }).join('')}</div><button data-a="fab" data-id="" aria-label="Quick actions">${ic('plus')}</button></div>`;
}
function fitKpis() {
  $$('.kpi .n').forEach(el => { el.style.fontSize = ''; let s = parseFloat(getComputedStyle(el).fontSize), n = 0; while (el.scrollWidth > el.clientWidth + 1 && s > 13 && n++ < 20) { s -= 1; el.style.fontSize = s + 'px'; } });
}
window.addEventListener('resize', () => { clearTimeout(window.__fk); window.__fk = setTimeout(fitKpis, 120); });
function countUp() {
  $$('.kpi .n[data-v]').forEach(el => { const v = +el.dataset.v, f = el.dataset.f; if (!v) return; const t0 = performance.now(), d = 700; const step = t => { const k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 3), x = v * e; el.textContent = f === 'inr' ? inr(Math.round(x)) : Math.round(x); if (k < 1) requestAnimationFrame(step); else { el.textContent = f === 'inr' ? inr(v) : v; fitKpis(); } }; requestAnimationFrame(step); });
  fitKpis();
}
function tick() { const c = $('#clk'); if (c) c.textContent = new Date().toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }); }
setInterval(tick, 20000);
const go = v => { V = v; X = {}; $('#fab')?.classList.remove('open'); render(); };

// ---------- clicks ----------
const A = {
  tab: id => { LG.tab = id; LG.step = 1; LG.choose = null; renderLogin(); },
  desk: id => { LG.desk = id; renderLogin(); const b = $('form[data-f=login] .btn'); if (b) b.focus(); },
  peek: (id, b) => { const i = b.parentElement.querySelector('input'); i.type = i.type === 'password' ? 'text' : 'password'; },
  otpback: () => { LG.step = 1; renderLogin(); },
  pickpt: async id => { try { const j = await call('otpVerify', { mobile: LG.mobile, otp: LG.otp, pid: id }); start(j.token); } catch (e) { toast(e.message, 1); } },
  go: id => go(id),
  logout: () => signOut(),
  theme: () => { theme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'); render(); },
  menu: () => { const m = $('.menu'); if (m) return m.remove(); const d = document.createElement('div'); d.className = 'menu'; d.innerHTML = `<div style="padding:10px 12px"><b>${esc(U.name)}</b><div class="tiny">${ROLES[U.role].t}${U.uid && U.role !== 'patient' ? ' · ' + esc(U.uid) : ''}</div></div>${U.role !== 'patient' ? `<button data-a="pwchange" data-id="">${ic('key')}Change password</button>` : ''}<button data-a="theme" data-id="">${ic('moon')}Light / dark theme</button><button data-a="install" data-id="">${ic('plus')}Install app</button><button data-a="logout" data-id="">${ic('out')}Sign out</button>`; document.body.appendChild(d); },
  fab: () => $('#fab').classList.toggle('open'),
  applypend: () => applyPending(),
  close: closeM,
  print: () => { const w = window.open('', '_blank'); if (!w) return toast('Allow pop-ups to print', 1); w.document.write(`<!DOCTYPE html><html><head><title>${esc(S.hospital)}</title><link rel="stylesheet" href="${new URL('app.css', location.href).href}"><style>body{background:#fff;padding:24px}.btn,.acts{display:none!important}</style></head><body>${$('#mbody').innerHTML}</body></html>`); w.document.close(); setTimeout(() => w.print(), 500); },
  install: async () => { $('.menu')?.remove(); if (deferredInstall) { deferredInstall.prompt(); deferredInstall = null; } else modal(`<h2>Install the app</h2><p><b>Android (Chrome):</b> menu ⋮ → <i>Add to Home screen</i>.</p><p><b>iPhone / iPad (Safari):</b> Share button → <i>Add to Home Screen</i>.</p><p><b>Desktop (Chrome / Edge):</b> the install icon at the right of the address bar.</p>`); },
  file: id => { act('viewFile', { id }, { quiet: true }); modal(chartHTML(id)); },
  rep: id => { modal(reportHTML(id)); loadImages(); },
  inv: id => modal(invoiceHTML(id)),
  addmed: () => $('#meds').insertAdjacentHTML('beforeend', medRow()),
  rmmed: (id, b) => { const rows = $$('#meds .medrow'); if (rows.length > 1) b.closest('.medrow').remove(); else { b.closest('.medrow').querySelector('select').value = ''; } },
  consult: async (id, b) => { const j = await act('startConsult', { id }, { quiet: true, btn: b }); if (j) { X = { vid: id }; V = 'consult'; render(); } },
  next: () => { const n = S.visits.filter(v => v.did === U.did && v.date === TODAY() && v.status !== 'Done').sort((a, b) => a.token - b.token)[0]; if (!n) return toast('No one waiting — queue is clear'); A.consult(n.id); },
  admitp: id => { const v = S.visits.find(v => v.id === id); V = 'admit'; X = { pid: v.pid, did: v.did, reason: v.diagnosis, vid: id }; render(); },
  discharge: (id, b) => confirmBox(`Discharge ${esc(P(S.adm.find(a => a.id === id).pid).name)}?`, 'The bed will be freed and the patient notified.', 'Discharge', () => act('discharge', { id }, { btn: b })),
  labCollect: (id, b) => act('labCollect', { id }, { btn: b }),
  labres: id => { const o = S.orders.find(o => o.id === id), t = C().LABT[o.test]; modal(`<h2>Enter results · ${esc(o.test)}</h2><p class="mut">${esc(P(o.pid).name)} · ${o.id}</p><form data-f="labres"><input type="hidden" name="id" value="${o.id}">${t.p.map((q, i) => `<label>${q[0]} <span class="mut">(${q[1]}, normal ${rng(q[2], q[3])})</span><input name="r${i}" type="number" step="any" required value="${o.results ? o.results[i] : ''}"></label>`).join('')}<p class="tiny">Stamped “Monitored by ${esc(U.name)}”.</p><button class="btn">${ic('seal')}Save results</button></form>`); },
  imgScan: (id, b) => act('imgScan', { id }, { btn: b }),
  imgrep: id => { const o = S.orders.find(o => o.id === id); modal(`<h2>Upload image & report · ${esc(o.test)}</h2><p class="mut">${esc(P(o.pid).name)} · ${o.id}</p><form data-f="imgrep"><input type="hidden" name="id" value="${o.id}"><label>Scan image (JPG / PNG — on a phone you can take a photo)<input name="file" type="file" accept="image/*" capture="environment"></label><label>Findings<textarea name="findings" required>${esc(o.findings)}</textarea></label><label>Impression<input name="impression" required value="${esc(o.impression)}"></label><button class="btn">${ic('seal')}Save report</button></form>`); },
  release: (id, b) => act('release', { id }, { btn: b }).then(j => j && closeM()),
  disp: (id, b) => act('dispense', { id }, { btn: b }),
  vit: id => modal(vitalsHTML(id)),
  bed: id => { const b = S.beds.find(b => b.id === id); if (!b.pid) return toast(`${id} is free${U.role === 'reception' ? '' : ' — admit from the Reception desk'}`); const a = S.adm.find(a => a.bed === id && a.status === 'Admitted'); if (a) modal(vitalsHTML(a.id)); },
  tog: (id, b) => act('staffToggle', { id }, { btn: b }),
  pwreset: id => modal(`<h2>Reset password</h2><p>${esc(S.staff.find(s => s.uid === id).name)} (${esc(id)})</p><form data-f="pwreset"><input type="hidden" name="id" value="${esc(id)}"><label>New password (8+ characters)<input name="password" type="text" minlength="8" required autocomplete="off"></label><button class="btn">${ic('key')}Reset password</button></form>`),
  pwchange: () => { $('.menu')?.remove(); modal(`<h2>Change your password</h2><form data-f="pwchange"><label>Current password<input name="old" type="password" required autocomplete="current-password"></label><label>New password (8+ characters)<input name="pw" type="password" minlength="8" required autocomplete="new-password"></label><button class="btn">${ic('key')}Change password</button></form>`); },
  upi: id => modal(`<h2>Pay by UPI</h2><p>This hospital is in demo mode — the real app opens Google Pay, PhonePe or Paytm through the hospital’s payment gateway.</p><button class="btn ok" data-a="upipay" data-id="${id}">${ic('rupee')}Simulate successful payment</button>`),
  upipay: async (id, b) => { if (await act('payOnline', { id }, { btn: b })) closeM(); },
  medform: id => { const m = id ? S.meds.find(m => m.id === id) : { name: '', generic: '', form: 'Tablet', cat: '', price: '', reorder: 50, active: true }; if (V !== 'meds' && !id) { V = 'meds'; render(); } modal(`<h2>${id ? 'Edit medicine' : 'Add medicine'}</h2><form data-f="med"><input type="hidden" name="id" value="${id || ''}"><div class="g2"><label>Brand / display name<input name="name" required value="${esc(m.name)}" placeholder="e.g. Paracetamol 650"></label><label>Generic name<input name="generic" required value="${esc(m.generic)}"></label><label>Form<select name="form">${C().FORMS.map(f => `<option ${f === m.form ? 'selected' : ''}>${f}</option>`).join('')}</select></label><label>Category<input name="cat" value="${esc(m.cat)}" placeholder="e.g. Antibiotic"></label><label>Price per unit (₹)<input name="price" type="number" min="0" step="0.5" required value="${m.price}"></label><label>Reorder level<input name="reorder" type="number" min="0" required value="${m.reorder}"></label></div><label class="ck"><input type="checkbox" name="active" ${m.active ? 'checked' : ''}>Active — doctors can prescribe it</label>${id ? `<p>${stamp(m.upd, 'Last updated')}</p>` : ''}<p class="tiny">Saving stamps this medicine “Monitored by ${esc(U.name)}”.</p><button class="btn">${ic('seal')}Save medicine</button></form>`); },
  batchform: id => { const x = id ? S.stock.find(s => s.id === id) : { mid: '', batch: '', exp: '', qty: '' }; if (V !== 'stock' && !id) { V = 'stock'; render(); } modal(`<h2>${id ? 'Edit batch' : 'Add batch (purchase entry)'}</h2><form data-f="batch"><input type="hidden" name="id" value="${id || ''}">${id ? `<p><b>${esc(MED(x.mid).name)}</b></p>` : `<label>Medicine<select name="mid">${S.meds.slice().sort((a, b) => a.name.localeCompare(b.name)).map(m => `<option value="${m.id}">${esc(m.name)}</option>`).join('')}</select></label>`}<div class="g2"><label>Batch no.<input name="batch" required value="${esc(x.batch)}"></label><label>Expiry<input name="exp" type="date" required value="${x.exp}"></label><label>Quantity<input name="qty" type="number" min="0" required value="${x.qty}"></label><label>Reason<select name="reason">${(id ? ['Stock count correction', 'Damaged / broken', 'Returned to supplier', 'Expired — removed', 'Purchase received'] : ['Purchase received', 'Opening stock']).map(r => `<option>${r}</option>`).join('')}</select></label></div>${id ? `<p>${stamp(x.upd, x.note || 'Last updated')}</p>` : ''}<button class="btn">${ic('seal')}Save batch</button></form>`); },
  sos: () => modal(`<h2 style="color:var(--red)">${ic('bolt')} Raise an emergency code</h2><p class="mut">All signed-in staff see and hear this immediately.</p><form data-f="sos"><div style="display:grid;gap:8px">${Object.entries(C().CODES).map(([k, d], i) => `<label class="chip" style="justify-content:flex-start;border-radius:14px;padding:12px 14px"><input type="radio" name="code" value="${esc(k)}" ${i ? '' : 'checked'}><span style="width:14px;height:14px;border-radius:50%;background:${CODE_COL[k]};flex:none"></span><b>${esc(k)}</b><span class="mut" style="font-weight:600">${esc(d)}</span></label>`).join('')}</div><p></p><div class="g2"><label>Location<input name="location" required placeholder="e.g. ICU bed 3, OPD room 2"></label><label>Note (optional)<input name="note"></label></div><button class="btn d" style="width:100%">${ic('bolt')}Broadcast to all staff</button></form>`),
  ack: (id, b) => act('alertAck', { id }, { btn: b }),
  closecode: (id, b) => confirmBox('Close this emergency code?', 'It disappears from everyone’s screen.', 'Close code', () => act('alertClose', { id }, { btn: b })),
  codeinfo: id => { const a = S.alerts.find(a => a.id === id); modal(`<h2 style="color:${CODE_COL[a.code]}">${esc(a.code)} · ${esc(a.location)}</h2><p>${esc(C().CODES[a.code])}${a.note ? ' — ' + esc(a.note) : ''}</p>${stamp(a.s, 'Raised')}<h3>Responding (${a.acks.length})</h3><div class="trail">${a.acks.map(x => stamp(x, 'Responding')).join('') || empty('No one yet.')}</div>`); },
  recheck: () => location.reload(),
  resetapi: () => { ls('dmh_api', null); renderSetup(); },
  yes: () => { const f = confirmFn; confirmFn = null; closeM(); f && f(); }
};
let confirmFn = null;
function confirmBox(title, text, label, fn) { confirmFn = fn; modal(`<h2>${title}</h2><p class="mut">${text}</p><div class="acts"><button class="btn" data-a="yes" data-id="">${label}</button><button class="btn g" data-a="close" data-id="">Cancel</button></div>`); }

// ---------- forms ----------
const vals = f => Object.fromEntries(new FormData(f).entries());
const F = {
  apiurl: (f, d) => { const u = d.url.trim(); if (!/^https:\/\/script\.google(usercontent)?\.com\/.+/.test(u)) return toast('That does not look like an Apps Script web app URL', 1); ls('dmh_api', u); location.reload(); },
  login: async (f, d, b) => { b.disabled = true; try { const j = await call('login', { uid: d.uid, pw: d.pw }); start(j.token); } catch (e) { toast(e.message, 1); } finally { b.disabled = false; } },
  otp1: async (f, d, b) => { b.disabled = true; try { const j = await call('otp', { mobile: d.mobile.trim() }); LG.mobile = d.mobile.trim(); LG.step = 2; LG.demoOtp = j.trialOtp || ''; renderLogin(); $('.otp')?.focus(); toast('Login code ready'); } catch (e) { toast(e.message, 1); } finally { b.disabled = false; } },
  otp2: async (f, d, b) => { b.disabled = true; try { const j = await call('otpVerify', { mobile: LG.mobile, otp: d.otp.trim() }); if (j.choose) { LG.choose = j.choose; LG.otp = d.otp.trim(); renderLogin(); } else start(j.token); } catch (e) { toast(e.message, 1); } finally { b.disabled = false; } },
  reg: async (f, d, b) => { const j = await act('reg', d, { btn: b, quiet: true }); if (j) { V = 'book'; X = { pid: j.id }; render(); } },
  book: async (f, d, b) => { const j = await act('book', d, { btn: b, quiet: true }); if (j) { V = 'rdash'; X = {}; render(); modal(`<div style="text-align:center"><p class="mut" style="margin:0">OPD token</p><div class="token">${j.token}</div><h2>${esc(j.patient)}</h2><p>${esc(j.doctor)} · ${esc(j.dept)}<br>${fd(j.date)}</p><p class="tiny">Consultation fee ${inr(j.fee)} added to the bill · token shown in the patient app.</p><div class="acts" style="justify-content:center"><button class="btn" data-a="close" data-id="">Done</button><button class="btn g" data-a="print" data-id="">Print token</button></div></div>`); } },
  admit: async (f, d, b) => { if (await act('admit', d, { btn: b, quiet: true })) { X = {}; render(); } },
  pay: async (f, d, b) => { if (await act('pay', d, { btn: b })) closeM(); },
  pbook: async (f, d, b) => { if (await act('pbook', d, { btn: b, quiet: true })) { V = 'me'; render(); } },
  consult: async (f, d, b) => {
    const fdata = new FormData(f);
    const meds = $$('#meds .medrow').map(r => ({ mid: r.querySelector('[name=med]').value, dose: r.querySelector('[name=dose]').value, days: r.querySelector('[name=days]').value })).filter(i => i.mid);
    const body = { ...d, admit: !!d.admit, labs: fdata.getAll('lab'), imgs: fdata.getAll('img'), meds };
    delete body.lab; delete body.img; delete body.med; delete body.dose; delete body.days;
    const j = await act('consult', body, { btn: b, quiet: true }); if (j) { V = 'queue'; X = {}; render(); }
  },
  labres: async (f, d, b) => { const t = C().LABT[S.orders.find(o => o.id === d.id).test]; if (await act('labResult', { id: d.id, results: t.p.map((q, i) => d['r' + i]) }, { btn: b })) closeM(); },
  imgrep: async (f, d, b) => {
    const file = f.querySelector('[name=file]').files[0]; let image = null;
    if (file) { b.disabled = true; try { image = await shrink(file, 1800); } catch (e) { b.disabled = false; return toast('Could not read that image', 1); } }
    if (await act('imgReport', { id: d.id, findings: d.findings, impression: d.impression, image }, { btn: b })) closeM();
  },
  vitals: async (f, d, b) => { if (await act('vitals', d, { btn: b })) modal(vitalsHTML(d.id)); },
  med: async (f, d, b) => { if (await act('medSave', { ...d, active: !!d.active }, { btn: b })) closeM(); },
  batch: async (f, d, b) => { if (await act('batchSave', d, { btn: b })) closeM(); },
  staff: async (f, d, b) => { if (await act('staffAdd', d, { btn: b })) f.reset(); },
  pwreset: async (f, d, b) => { if (await act('staffReset', d, { btn: b })) closeM(); },
  pwchange: async (f, d, b) => { if (await act('changePw', d, { btn: b })) closeM(); },
  sos: async (f, d, b) => { if (await act('alertRaise', d, { btn: b })) { closeM(); beep(); } }
};
function shrink(file, max) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', .85)); }; im.onerror = rej; im.src = r.result; }; r.onerror = rej; r.readAsDataURL(file); }); }

// ---------- events ----------
document.addEventListener('pointerdown', e => {
  const b = e.target.closest('.btn,.nav,.chip,.desk,.bed,.sos,.fab>button'); if (!b) return;
  const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height), sp = document.createElement('span');
  sp.className = 'rip'; sp.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
  if (getComputedStyle(b).position === 'static') b.style.position = 'relative';
  b.style.overflow = 'hidden'; b.appendChild(sp); setTimeout(() => sp.remove(), 650);
});
document.addEventListener('click', e => {
  if (e.target.id === 'modal') return closeM();
  if (!e.target.closest('.menu,[data-a=menu]')) $('.menu')?.remove();
  if (!e.target.closest('#fab')) $('#fab')?.classList.remove('open');
  const b = e.target.closest('[data-a]'); if (!b) return;
  const f = A[b.dataset.a]; if (f) { e.preventDefault(); if (b.closest('.menu')) $('.menu')?.remove(); f(b.dataset.id, b); }
});
document.addEventListener('submit', e => { const f = e.target, h = F[f.dataset.f]; if (!h) return; e.preventDefault(); h(f, vals(f), f.querySelector('button:not([type=button])') || document.createElement('button')); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeM(); $('.menu')?.remove(); } });
document.addEventListener('input', e => {
  const t = e.target, k = t.dataset.in, form = t.closest('main form'); if (form) form.dataset.dirty = '1';
  if (k === 'psearch' || k === 'msearch') { const q = t.value.toLowerCase().trim(); $$((k === 'psearch' ? '#ptab' : '#mtab') + ' tbody tr').forEach(r => r.style.display = r.dataset.s.includes(q) ? '' : 'none'); }
  if (k === 'asearch') { const q = t.value.toLowerCase().trim(); $$('#atab tbody tr').forEach(r => r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none'); }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.in === 'gsearch') { const m = t.value.match(/SH-\d+/); if (m && S.patients.some(p => p.id === m[0])) { A.file(m[0]); t.value = ''; t.blur(); } return; }
  if (t.classList.contains('qin')) { act('rxQty', { id: t.dataset.rx, k: t.dataset.k, qty: t.value }); return; }
  if (t.name === 'med' && V === 'consult') { const v = S.visits.find(v => v.id === X.vid); if (!v || !t.value) return; const p = P(v.pid), m = MED(t.value), bad = allergyClash(p, m); t.closest('.medrow').classList.toggle('bad', bad); if (bad) toast(`Allergy alert: ${p.name} is allergic to ${p.allergy} — ${m.name} clashes.`, 1); }
});
window.addEventListener('online', () => { soonRefresh(); connect(); });
window.addEventListener('offline', () => S && render());
let deferredInstall = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; });
// keep the stacked-table labels for phones
new MutationObserver(() => { for (const c of document.querySelectorAll('.stack td:not([data-l])')) { let i = 0, p = c; while ((p = p.previousElementSibling)) i += p.colSpan; c.dataset.l = c.closest('table').rows[0].cells[i]?.textContent || ''; } }).observe(document.body, { childList: true, subtree: true });

// ---------- start ----------
async function start(token) {
  T = token; ls('dmh_token', T);
  try { S = (await call('state')).state; } catch (e) { if (e.message !== 'LICENSE') { toast(e.message, 1); signOut(true); } return; }
  try { V = sessionStorage.getItem('dmh_view') || ''; } catch (e) { V = ''; }
  lastView = ''; render(); connect();
}
(async () => {
  if (!API_URL()) return renderSetup();
  try { PUB = await call('public'); LIC = PUB.license; } catch (e) { return renderOffline(e.message); }
  if (LIC && !LIC.valid) return renderLocked();
  if (T) start(T); else renderLogin();
})();
/* Website demo: no offline cache, so visitors always get the current demo. */
})();
