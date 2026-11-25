/* HMScrat — its Google Apps Script (Code.gs), wrapped to run in the browser for the website demo. Generated; edit the original Code.gs. */
window.__GAS_BACKEND = function (SpreadsheetApp, PropertiesService, CacheService, LockService, Utilities, ContentService, HtmlService, DriveApp, Session, MailApp, GmailApp, UrlFetchApp, ScriptApp, Logger) {
/**
 * HMScrat — hospital management by DEVOCRAT · Google Sheets backend (trial edition)
 * Devocrat Multi-Speciality Hospital
 *
 * Paste this whole file into Extensions → Apps Script of the hospital Google Sheet,
 * run `setup` once, then Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone).
 * The License tab controls the trial: edit the expiry date or status there, or use the
 * "HMScrat" menu in the Sheet.
 */
var TZ = 'Asia/Kolkata';
var HOSP_DEFAULT = 'Devocrat Multi-Speciality Hospital';
var HOSP = HOSP_DEFAULT; // replaced by the License tab's hospital name on each request
var DEMO = true; // trial: shows demo logins and the patient login code on screen (no SMS)
var COLLS = ['patients', 'visits', 'orders', 'rx', 'meds', 'stock', 'beds', 'adm', 'bills', 'notes', 'staff', 'doctors', 'alerts'];
var TAB = { patients: 'Patients', visits: 'Visits', orders: 'Lab & Scan Orders', rx: 'Prescriptions', meds: 'Medicines', stock: 'Stock', beds: 'Beds', adm: 'Admissions', bills: 'Bills', notes: 'Patient Messages', staff: 'Staff', doctors: 'Doctors', alerts: 'Emergency Codes' };
var LICENSE_TAB = 'License', AUDIT_TAB = 'Audit Log';

// ---------------- time & helpers ----------------
function fmt_(d, f) { return Utilities.formatDate(d, TZ, f); }
function today() { return fmt_(new Date(), 'yyyy-MM-dd'); }
function dayOff(n) { return fmt_(new Date(Date.now() + n * 864e5), 'yyyy-MM-dd'); }
function now() { return fmt_(new Date(), 'd MMM, h:mm a'); }
function fdate(s) { return s ? fmt_(new Date(s + 'T12:00:00Z'), 'd MMM yyyy') : ''; }
function at(n, t) { return fmt_(new Date(dayOff(n) + 'T12:00:00Z'), 'd MMM') + ', ' + t; }
function inr(n) { return '₹' + (Math.round(n * 100) / 100).toLocaleString('en-IN'); }
function stampOf(u) { return { by: u.name, role: u.role, uid: u.uid, t: now(), at: new Date().toISOString() }; }
function AppError(msg, status) { this.message = msg; this.status = status || 400; this.isApp = true; }
function err(msg, status) { throw new AppError(msg, status); }
function str(v, max) { return String(v == null ? '' : v).trim().slice(0, max || 500); }
function num(v, min, max, label) {
  if (min == null) min = -1e9; if (max == null) max = 1e9;
  var n = Number(v);
  if (v === '' || v == null || !isFinite(n) || n < min || n > max) err('Invalid ' + (label || 'number'));
  return n;
}
function isDate(s) { return /^\d{4}-\d{2}-\d{2}$/.test(String(s || '')); }
function qtyOf(dose, days) {
  days = +days || 0;
  if (dose === '1 weekly') return Math.ceil(days / 7);
  if (dose === 'As needed') return days;
  return String(dose).split('-').reduce(function (a, b) { return a + (+b || 0); }, 0) * days;
}
function props_() { return PropertiesService.getScriptProperties(); }
function meta(k, v) { if (v === undefined) return props_().getProperty(k); props_().setProperty(k, String(v)); return v; }
function seq(name, start) { var cur = meta('seq_' + name), n = cur == null ? start : +cur; meta('seq_' + name, n + 1); return n; }
function sha_(s) { return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8).map(function (b) { return ('0' + (b & 255).toString(16)).slice(-2); }).join(''); }
function hashPw(pw) { var salt = Utilities.getUuid().slice(0, 12); return salt + ':' + sha_(salt + ':' + pw); }
function checkPw(pw, h) { var p = String(h || '').split(':'); return p.length === 2 && sha_(p[0] + ':' + pw) === p[1]; }

// ---------------- storage: one tab per data type ----------------
var S = null, DIRTY = {}, AUDITQ = [];
function ss_() { return SpreadsheetApp.getActiveSpreadsheet(); }
function tab_(c) {
  var name = TAB[c], sh = ss_().getSheetByName(name);
  if (!sh) {
    sh = ss_().insertSheet(name);
    sh.getRange(1, 1, 1, 4).setValues([['ID', 'Summary', 'Last saved', 'Data (managed by the app — do not edit)']]).setFontWeight('bold').setBackground('#0b4f5c').setFontColor('#ffffff');
    sh.setFrozenRows(1); sh.setColumnWidth(1, 90); sh.setColumnWidth(2, 460); sh.setColumnWidth(3, 130); sh.setColumnWidth(4, 260);
  }
  return sh;
}
function ver_() { return +(meta('ver') || '0'); }
function cacheState_(v) {
  try {
    var s = JSON.stringify(S), parts = {}, size = 30000, n = Math.ceil(s.length / size);
    for (var i = 0; i < n; i++) parts['st_' + v + '_' + i] = s.substr(i * size, size);
    parts['st_' + v] = String(n);
    CacheService.getScriptCache().putAll(parts, 21600);
  } catch (e) { /* cache is only a speed-up */ }
}
function load() {
  var v = ver_(), c = CacheService.getScriptCache(), n = c.get('st_' + v);
  if (n) {
    var keys = []; for (var i = 0; i < +n; i++) keys.push('st_' + v + '_' + i);
    var got = c.getAll(keys);
    if (Object.keys(got).length === +n) { try { S = JSON.parse(keys.map(function (k) { return got[k]; }).join('')); return; } catch (e) {} }
  }
  S = {};
  COLLS.forEach(function (k) {
    var sh = tab_(k), last = sh.getLastRow();
    S[k] = last < 2 ? [] : sh.getRange(2, 4, last - 1, 1).getValues().map(function (r) { try { return r[0] ? JSON.parse(r[0]) : null; } catch (e) { return null; } }).filter(Boolean);
  });
  cacheState_(v);
}
function put(c, o) { var a = S[c], i = a.findIndex(function (x) { return x.id === o.id; }); if (i < 0) a.push(o); else a[i] = o; DIRTY[c] = true; return o; }
function audit(u, what) { AUDITQ.push([now(), u ? u.name : 'System', u ? u.role : '', u ? u.uid : '', what]); }
function flush() {
  var stamp = now();
  Object.keys(DIRTY).forEach(function (c) {
    var sh = tab_(c), rows = S[c].map(function (o) { return [o.id, summary_(c, o), stamp, JSON.stringify(o)]; }), last = sh.getLastRow();
    if (last > 1) sh.getRange(2, 1, last - 1, 4).clearContent();
    if (rows.length) sh.getRange(2, 1, rows.length, 4).setValues(rows);
  });
  if (AUDITQ.length) { var a = auditTab_(); a.getRange(a.getLastRow() + 1, 1, AUDITQ.length, 5).setValues(AUDITQ); }
  if (Object.keys(DIRTY).length) { var v = ver_() + 1; meta('ver', v); cacheState_(v); }
  DIRTY = {}; AUDITQ = [];
}
function auditTab_() {
  var sh = ss_().getSheetByName(AUDIT_TAB);
  if (!sh) { sh = ss_().insertSheet(AUDIT_TAB); sh.getRange(1, 1, 1, 5).setValues([['Time', 'Who', 'Desk', 'User ID', 'What']]).setFontWeight('bold').setBackground('#0b4f5c').setFontColor('#ffffff'); sh.setFrozenRows(1); sh.setColumnWidth(5, 520); }
  return sh;
}
function auditRecent(n) {
  var sh = auditTab_(), last = sh.getLastRow(); if (last < 2) return [];
  var from = Math.max(2, last - n + 1);
  return sh.getRange(from, 1, last - from + 1, 5).getValues().reverse().map(function (r) { return { t: String(r[0]), who: r[1], role: r[2], what: r[4] }; });
}
function dn_(id) { var d = (S.doctors || []).find(function (x) { return x.id === id; }); return d ? d.name : id; }
function mn_(id) { var m = (S.meds || []).find(function (x) { return x.id === id; }); return m ? m.name : id; }
function pn_(id) { var p = (S.patients || []).find(function (x) { return x.id === id; }); return p ? p.name : id; }
function summary_(c, o) {
  try {
    switch (c) {
      case 'patients': return o.name + ' · ' + o.age + '/' + o.sex + ' · ' + o.mobile + (o.allergy ? ' · Allergy: ' + o.allergy : '');
      case 'visits': return o.date + ' · token ' + o.token + ' · ' + pn_(o.pid) + ' → ' + dn_(o.did) + ' · ' + o.status + (o.diagnosis ? ' · ' + o.diagnosis : '');
      case 'orders': return o.test + ' · ' + pn_(o.pid) + ' · ' + o.status;
      case 'rx': return pn_(o.pid) + ' · ' + o.items.map(function (i) { return i.med + ' × ' + i.qty; }).join(', ') + ' · ' + o.status;
      case 'meds': return o.name + ' (' + o.generic + ') · ' + inr(o.price) + ' · ' + (o.active ? 'Active' : 'Inactive');
      case 'stock': return mn_(o.mid) + ' · batch ' + o.batch + ' · exp ' + o.exp + ' · qty ' + o.qty;
      case 'beds': return o.id + ' · ' + (o.pid ? pn_(o.pid) : 'Free');
      case 'adm': return pn_(o.pid) + ' · bed ' + o.bed + ' · ' + o.status + ' · ' + o.vitals.length + ' vitals';
      case 'bills': return pn_(o.pid) + ' · ' + inr(o.items.reduce(function (t, i) { return t + i.a; }, 0)) + ' · ' + (o.paid ? 'Paid (' + o.mode + ')' : 'Unpaid');
      case 'notes': return pn_(o.pid) + ' · ' + o.msg;
      case 'staff': return o.name + ' · ' + o.role + ' · ' + o.uid + ' · ' + (o.active ? 'Active' : 'Disabled');
      case 'doctors': return o.name + ' · ' + o.dept + ' · fee ' + inr(o.fee);
      case 'alerts': return o.code + ' · ' + o.location + ' · ' + o.status;
    }
  } catch (e) {}
  return '';
}
// Patient messages: kept in the patient's inbox in the app (no SMS/WhatsApp in the trial).
function notify(patient, msg) {
  put('notes', { id: 'N' + seq('n', 3), pid: patient.id, t: now(), msg: msg });
  return 'Message to ' + patient.mobile + ': “' + msg + '”';
}

// ---------------- catalog ----------------
// Master lists. Move these into the database (and an admin screen) when the hospital
// wants to edit test prices or wards without a code change.
var LABT = {
  'CBC': { price: 350, p: [['Haemoglobin', 'g/dL', 12, 16], ['WBC count', '/µL', 4000, 11000], ['Platelets', 'lakh/µL', 1.5, 4.5]] },
  'Blood sugar (fasting)': { price: 120, p: [['Glucose, fasting', 'mg/dL', 70, 100]] },
  'Lipid profile': { price: 600, p: [['Total cholesterol', 'mg/dL', 0, 200], ['HDL', 'mg/dL', 40, 60], ['LDL', 'mg/dL', 0, 100], ['Triglycerides', 'mg/dL', 0, 150]] },
  'Thyroid (TSH)': { price: 400, p: [['TSH', 'µIU/mL', 0.4, 4]] },
  'Liver function (LFT)': { price: 700, p: [['SGOT', 'U/L', 5, 40], ['SGPT', 'U/L', 7, 56], ['Bilirubin, total', 'mg/dL', 0.1, 1.2]] },
  'Kidney function (KFT)': { price: 650, p: [['Urea', 'mg/dL', 15, 40], ['Creatinine', 'mg/dL', 0.6, 1.2]] }
};
var IMGT = { 'Chest X-ray': 450, 'X-ray knee': 400, 'USG abdomen': 1200, 'ECG': 300, 'CT brain': 3500, 'MRI knee': 6500 };
var WARDS = [['GW', 'General ward', 8, 1500], ['PR', 'Private room', 4, 3500], ['ICU', 'ICU', 4, 8000]];
// Allergy keyword -> generic names that must not be prescribed.
var ALLERGY = { 'penicillin': ['Amoxicillin'], 'sulfa': ['Sulfamethoxazole'], 'nsaid': ['Ibuprofen'] };
var DOSES = ['1-0-1', '1-0-0', '0-0-1', '1-1-1', '1 weekly', 'As needed'];
var FORMS = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Sachet', 'Ointment', 'Drops'];
var CODES = {
  'Code Blue': 'Cardiac or respiratory arrest',
  'Code Red': 'Fire or smoke',
  'Code Pink': 'Infant or child missing',
  'Code Yellow': 'Mass casualty / disaster',
  'Rapid Response': 'Patient deteriorating'
};

// ---------------- sample data ----------------
const mk = (by, role, t, uid = '') => ({ by, role, uid, t });

function seed() {
  const pw = hashPw('demo123');
  const sample = true;
  const T0 = dayOff(0);
  const staff = [['Admin Sunil', 'admin', 'admin'], ['Receptionist Kavya', 'reception', 'recep01'], ['Dr. Anil Mehta', 'doctor', 'dr.mehta', 'd1'], ['Dr. Priya Rao', 'doctor', 'dr.rao', 'd2'], ['Dr. Sameer Khan', 'doctor', 'dr.khan', 'd3'], ['Dr. Kavita Desai', 'doctor', 'dr.desai', 'd4'], ['Nurse Mary', 'nurse', 'nurse01'], ['Nurse Asha', 'nurse', 'nurse02'], ['Lab Tech Rahul', 'lab', 'lab01'], ['Radiographer Neha', 'img', 'rad01'], ['Pharmacist Imran', 'pharmacy', 'pharm01']];
  (sample ? staff : staff.slice(0, 1)).forEach(([name, role, uid, did]) => put('staff', { id: uid, uid, name, role, did: did || null, active: true, hash: pw }));
  if (sample) [{ id: 'd1', name: 'Dr. Anil Mehta', dept: 'General medicine', fee: 500 }, { id: 'd2', name: 'Dr. Priya Rao', dept: 'Orthopaedics', fee: 700 }, { id: 'd3', name: 'Dr. Sameer Khan', dept: 'Paediatrics', fee: 600 }, { id: 'd4', name: 'Dr. Kavita Desai', dept: 'Cardiology', fee: 900 }].forEach(d => put('doctors', d));
  meta('seq_d', sample ? 5 : 1);

  WARDS.forEach(([k, , n]) => { for (let i = 1; i <= n; i++) put('beds', { id: k + '-' + i, ward: k, pid: null }); });

  const IM = mk('Pharmacist Imran', 'pharmacy', at(-5, '9:30 am'), 'pharm01');
  const M = [['Paracetamol 650', 'Paracetamol', 'Tablet', 'Analgesic / fever', 2, 100], ['Amoxicillin 500', 'Amoxicillin', 'Capsule', 'Antibiotic', 8, 50], ['Pantoprazole 40', 'Pantoprazole', 'Tablet', 'Antacid', 6, 80], ['Metformin 500', 'Metformin', 'Tablet', 'Antidiabetic', 3, 150], ['Cetirizine 10', 'Cetirizine', 'Tablet', 'Antiallergic', 2, 80], ['Ibuprofen 400', 'Ibuprofen', 'Tablet', 'Analgesic', 3, 80], ['Vitamin D3 60K', 'Cholecalciferol', 'Capsule', 'Supplement', 30, 30], ['Azithromycin 500', 'Azithromycin', 'Tablet', 'Antibiotic', 22, 40], ['ORS sachet', 'Oral rehydration salts', 'Sachet', 'Rehydration', 20, 50], ['Amlodipine 5', 'Amlodipine', 'Tablet', 'Antihypertensive', 4, 100], ['Cough syrup (Dextromethorphan)', 'Dextromethorphan', 'Syrup', 'Cough', 85, 20], ['Atorvastatin 10', 'Atorvastatin', 'Tablet', 'Cholesterol', 5, 100]];
  M.forEach(([name, generic, form, cat, price, reorder], i) => put('meds', { id: 'M' + (i + 1), name, generic, form, cat, price, reorder, active: true, upd: sample ? IM : null }));
  meta('seq_m', M.length + 1);
  if (!sample) return;

  const B = [['M1', 'PCM2411', 420, 480], ['M2', 'AMX2405', 300, 36], ['M3', 'PAN2402', 55, 210], ['M4', 'MET2408', 510, 640], ['M5', 'CTZ2409', 380, 300], ['M6', 'IBU2406', 240, 150], ['M7', 'VD32407', 200, 44], ['M8', 'AZI2311', -12, 60], ['M9', 'ORS2410', 600, 120], ['M10', 'AML2409', 450, 400], ['M11', 'DXM2410', 330, 18], ['M12', 'ATV2410', 520, 260]];
  B.forEach(([mid, batch, e, qty], i) => put('stock', { id: 'BT' + (i + 1), mid, batch, exp: dayOff(e), qty, upd: IM, note: 'Purchase received' }));
  meta('seq_bt', B.length + 1);

  const K = mk('Receptionist Kavya', 'reception', at(-60, '10:05 am'), 'recep01');
  const pt = (id, name, age, sex, mobile, blood, allergy, addr) => put('patients', { id, name, age, sex, mobile, blood, allergy, addr, s: K });
  pt('SH-1001', 'Ramesh Kumar', 54, 'M', '9876501001', 'B+', '', 'Andheri East, Mumbai'); pt('SH-1002', 'Sunita Sharma', 32, 'F', '9876501002', 'O+', 'Penicillin', 'Thane West'); pt('SH-1003', 'Arjun Patil', 8, 'M', '9876501003', 'A+', '', 'Vashi, Navi Mumbai'); pt('SH-1004', 'Meena Iyer', 61, 'F', '9876501004', 'AB+', 'Sulfa drugs', 'Chembur, Mumbai'); pt('SH-1005', 'Vikram Singh', 40, 'M', '9876501005', 'O-', '', 'Powai, Mumbai'); pt('SH-1006', 'Farah Ali', 27, 'F', '9876501006', 'B-', '', 'Kurla West, Mumbai'); pt('SH-1007', 'Joseph D’Souza', 67, 'M', '9876501007', 'A-', '', 'Bandra West, Mumbai');
  meta('seq_p', 1008);

  const dm = (n, uid, t, d) => mk(n, 'doctor', at(d, t), uid);
  const KB = mk('Receptionist Kavya', 'reception', at(0, '9:10 am'), 'recep01');
  const vis = (id, pid, did, date, token, status, complaint, diagnosis, vitals, s) => put('visits', { id, pid, did, date, token, status, complaint, diagnosis: diagnosis || '', vitals: vitals || '', notes: '', s: s || null, bs: KB });
  vis('V-1', 'SH-1001', 'd1', dayOff(-20), 4, 'Done', 'Routine diabetes check-up', 'Type 2 diabetes — continue Metformin', 'BP 136/86 · Pulse 78 · Wt 81 kg', dm('Dr. Anil Mehta', 'dr.mehta', '11:20 am', -20));
  vis('V-7', 'SH-1004', 'd1', dayOff(-2), 6, 'Done', 'Breathlessness, chest tightness, fever', 'Lower respiratory tract infection — admitted', 'BP 142/90 · Pulse 104 · Temp 101.2°F · SpO₂ 92%', dm('Dr. Anil Mehta', 'dr.mehta', '4:40 pm', -2));
  vis('V-2', 'SH-1006', 'd1', T0, 1, 'Done', 'Fatigue and dizziness for 2 weeks', 'Suspected anaemia, vitamin D deficiency', 'BP 108/70 · Pulse 92 · Wt 52 kg', dm('Dr. Anil Mehta', 'dr.mehta', '9:45 am', 0));
  vis('V-3', 'SH-1005', 'd2', T0, 1, 'Done', 'Right knee pain after a fall', 'Knee sprain — rule out fracture', 'BP 124/80 · Pulse 80', dm('Dr. Priya Rao', 'dr.rao', '10:10 am', 0));
  vis('V-4', 'SH-1002', 'd1', T0, 2, 'Waiting', 'Fever and sore throat for 3 days');
  vis('V-5', 'SH-1001', 'd1', T0, 3, 'Waiting', 'Follow-up, sugar report review');
  vis('V-6', 'SH-1003', 'd3', T0, 1, 'Waiting', 'Cough and cold for 4 days');
  vis('V-8', 'SH-1007', 'd4', T0, 1, 'Waiting', 'Chest discomfort on climbing stairs');
  meta('seq_v', 9);

  const tr = a => a.map(([s, by, role, t, uid]) => ({ s, ...mk(by, role, t, uid) }));
  const ord = (id, pid, vid, did, kind, test, status, date, trail, x) => put('orders', Object.assign({ id, pid, vid, did, kind, test, status, date, results: null, findings: '', impression: '', img: '', trail: tr(trail) }, x || {}));
  const AM = ['Dr. Anil Mehta', 'doctor'], RL = ['Lab Tech Rahul', 'lab'], NH = ['Radiographer Neha', 'img'];
  ord('LB-101', 'SH-1001', 'V-1', 'd1', 'lab', 'Blood sugar (fasting)', 'Approved', dayOff(-20), [['Ordered', ...AM, at(-20, '11:20 am'), 'dr.mehta'], ['Sample collected', ...RL, at(-20, '11:40 am'), 'lab01'], ['Result entered', ...RL, at(-20, '2:05 pm'), 'lab01'], ['Approved', ...RL, at(-20, '2:30 pm'), 'lab01']], { results: [142] });
  ord('LB-102', 'SH-1001', 'V-1', 'd1', 'lab', 'Lipid profile', 'Approved', dayOff(-20), [['Ordered', ...AM, at(-20, '11:20 am'), 'dr.mehta'], ['Sample collected', ...RL, at(-20, '11:40 am'), 'lab01'], ['Result entered', ...RL, at(-20, '2:10 pm'), 'lab01'], ['Approved', ...RL, at(-20, '2:30 pm'), 'lab01']], { results: [198, 44, 128, 170] });
  ord('RD-103', 'SH-1004', 'V-7', 'd1', 'img', 'Chest X-ray', 'Approved', dayOff(-2), [['Ordered', ...AM, at(-2, '4:40 pm'), 'dr.mehta'], ['Scanned', ...NH, at(-2, '5:05 pm'), 'rad01'], ['Reported', ...NH, at(-2, '5:40 pm'), 'rad01'], ['Approved', ...NH, at(-2, '5:50 pm'), 'rad01']], { findings: 'Patchy opacity in the right lower zone. No pleural effusion. Heart size within normal limits.', impression: 'Right lower lobe pneumonia.' });
  ord('LB-104', 'SH-1004', 'V-7', 'd1', 'lab', 'CBC', 'Approved', dayOff(-2), [['Ordered', ...AM, at(-2, '4:40 pm'), 'dr.mehta'], ['Sample collected', 'Nurse Mary', 'nurse', at(-2, '5:00 pm'), 'nurse01'], ['Result entered', ...RL, at(-2, '6:20 pm'), 'lab01'], ['Approved', ...RL, at(-2, '6:30 pm'), 'lab01']], { results: [11.2, 13800, 2.4] });
  ord('LB-105', 'SH-1006', 'V-2', 'd1', 'lab', 'CBC', 'Sample collected', T0, [['Ordered', ...AM, at(0, '9:45 am'), 'dr.mehta'], ['Sample collected', ...RL, at(0, '10:02 am'), 'lab01']]);
  ord('RD-106', 'SH-1005', 'V-3', 'd2', 'img', 'X-ray knee', 'Ordered', T0, [['Ordered', 'Dr. Priya Rao', 'doctor', at(0, '10:10 am'), 'dr.rao']]);
  meta('seq_o', 107);

  const it = (mid, dose, days) => { const m = S.meds.find(x => x.id === mid); const q = qtyOf(dose, days); return { mid, med: m.name, dose, days, qty: q, pq: q }; };
  put('rx', { id: 'RX-1', pid: 'SH-1001', vid: 'V-1', did: 'd1', date: dayOff(-20), status: 'Dispensed', items: [it('M4', '1-0-1', 30)], s: dm('Dr. Anil Mehta', 'dr.mehta', '11:20 am', -20), ds: mk('Pharmacist Imran', 'pharmacy', at(-20, '11:50 am'), 'pharm01') });
  put('rx', { id: 'RX-4', pid: 'SH-1004', vid: 'V-7', did: 'd1', date: dayOff(-2), status: 'Dispensed', items: [it('M1', '1-1-1', 5)], s: dm('Dr. Anil Mehta', 'dr.mehta', '4:40 pm', -2), ds: mk('Pharmacist Imran', 'pharmacy', at(-2, '5:20 pm'), 'pharm01') });
  put('rx', { id: 'RX-2', pid: 'SH-1006', vid: 'V-2', did: 'd1', date: T0, status: 'Pending', items: [it('M7', '1 weekly', 28), it('M3', '1-0-0', 10)], s: dm('Dr. Anil Mehta', 'dr.mehta', '9:45 am', 0) });
  put('rx', { id: 'RX-3', pid: 'SH-1005', vid: 'V-3', did: 'd2', date: T0, status: 'Pending', items: [it('M6', '1-0-1', 5), it('M3', '1-0-0', 5)], s: dm('Dr. Priya Rao', 'dr.rao', '10:10 am', 0) });
  meta('seq_r', 5);

  const bed = S.beds.find(b => b.id === 'GW-2'); bed.pid = 'SH-1004'; put('beds', bed);
  put('adm', { id: 'IP-501', pid: 'SH-1004', did: 'd1', bed: 'GW-2', date: dayOff(-2), reason: 'Right lower lobe pneumonia, breathlessness', status: 'Admitted', s: mk('Receptionist Kavya', 'reception', at(-2, '5:00 pm'), 'recep01'), vitals: [
    { bp: '142/90', pulse: 104, temp: 101.2, spo2: 92, note: 'On oxygen 2 L/min, IV antibiotics started', s: mk('Nurse Mary', 'nurse', at(-2, '6:00 pm'), 'nurse01') },
    { bp: '134/86', pulse: 96, temp: 100.1, spo2: 94, note: 'Reviewed — continue antibiotics, chest physiotherapy', s: mk('Dr. Anil Mehta', 'doctor', at(-1, '10:30 am'), 'dr.mehta') },
    { bp: '130/84', pulse: 88, temp: 99.1, spo2: 96, note: 'Comfortable, eating well, oxygen stopped', s: mk('Nurse Asha', 'nurse', at(0, '8:00 am'), 'nurse02') }] });
  meta('seq_a', 502);

  const bi = (d, a, c, dt) => ({ d, a, c, dt }); const KP = t => mk('Receptionist Kavya', 'reception', t, 'recep01');
  [{ id: 'B-1060', pid: 'SH-1001', date: dayOff(-20), paid: true, mode: 'UPI', pdate: dayOff(-20), ps: KP(at(-20, '12:00 pm')), items: [bi('Consultation — Dr. Anil Mehta', 500, 'Consultation', dayOff(-20)), bi('Blood sugar (fasting)', 120, 'Laboratory', dayOff(-20)), bi('Lipid profile', 600, 'Laboratory', dayOff(-20)), bi('Metformin 500 × 60', 180, 'Pharmacy', dayOff(-20))] },
   { id: 'B-1061', pid: 'SH-1006', date: T0, paid: true, mode: 'Cash', pdate: T0, ps: KP(at(0, '9:20 am')), items: [bi('Consultation — Dr. Anil Mehta', 500, 'Consultation', T0)] },
   { id: 'B-1062', pid: 'SH-1006', date: T0, paid: false, items: [bi('CBC', 350, 'Laboratory', T0)] },
   { id: 'B-1063', pid: 'SH-1005', date: T0, paid: true, mode: 'Card', pdate: T0, ps: KP(at(0, '9:35 am')), items: [bi('Consultation — Dr. Priya Rao', 700, 'Consultation', T0)] },
   { id: 'B-1064', pid: 'SH-1005', date: T0, paid: false, items: [bi('X-ray knee', 400, 'Radiology', T0)] },
   { id: 'B-1065', pid: 'SH-1004', date: dayOff(-2), paid: false, items: [bi('Consultation — Dr. Anil Mehta', 500, 'Consultation', dayOff(-2)), bi('Chest X-ray', 450, 'Radiology', dayOff(-2)), bi('CBC', 350, 'Laboratory', dayOff(-2)), bi('Bed charges, General ward × 3 days', 4500, 'IPD', T0), bi('Paracetamol 650 × 15', 30, 'Pharmacy', dayOff(-2))] },
   { id: 'B-1066', pid: 'SH-1002', date: T0, paid: false, items: [bi('Consultation — Dr. Anil Mehta', 500, 'Consultation', T0)] },
   { id: 'B-1067', pid: 'SH-1001', date: T0, paid: false, items: [bi('Consultation — Dr. Anil Mehta', 500, 'Consultation', T0)] },
   { id: 'B-1068', pid: 'SH-1003', date: T0, paid: false, items: [bi('Consultation — Dr. Sameer Khan', 600, 'Consultation', T0)] },
   { id: 'B-1069', pid: 'SH-1007', date: T0, paid: true, mode: 'UPI', pdate: T0, ps: KP(at(0, '9:50 am')), items: [bi('Consultation — Dr. Kavita Desai', 900, 'Consultation', T0)] }].forEach(b => put('bills', b));
  meta('seq_b', 1070);
  put('notes', { id: 'N1', pid: 'SH-1001', t: at(-20, '2:30 pm'), msg: 'Your Blood sugar (fasting) and Lipid profile reports are ready.' });
  put('notes', { id: 'N2', pid: 'SH-1004', t: at(-2, '5:50 pm'), msg: 'Your Chest X-ray report is ready.' });
  meta('seq_n', 3);
}


// ---------------- actions ----------------
const P = id => S.patients.find(p => p.id === id) || err('Patient not found');
const D = id => S.doctors.find(d => d.id === id) || err('Doctor not found');
const MED = id => S.meds.find(m => m.id === id) || err('Medicine not found');
const get = (c, id, label) => S[c].find(x => x.id === id) || err((label || 'Record') + ' not found');
const okStock = mid => S.stock.filter(s => s.mid === mid && s.exp >= today() && s.qty > 0).sort((a, b) => a.exp.localeCompare(b.exp));
const avail = mid => okStock(mid).reduce((a, x) => a + x.qty, 0);
const nextToken = (did, date) => Math.max(0, ...S.visits.filter(v => v.did === did && v.date === date).map(v => v.token)) + 1;
const step = (o, s, st) => { o.status = s; o.trail.push({ s, ...st }); };
const futureDate = d => { const v = isDate(d) ? d : today(); if (v < today()) err('That date is in the past'); return v; };
function addBill(pid, d, a, c, s) {
  let b = S.bills.find(b => b.pid === pid && !b.paid);
  if (!b) b = { id: 'B-' + seq('b', 1070), pid, date: today(), items: [], paid: false };
  b.items.push({ d, a, c, dt: today(), s });
  put('bills', b); return b;
}
function allergyClash(p, med) {
  const a = (p.allergy || '').toLowerCase(); if (!a) return false;
  if (a.includes(med.generic.toLowerCase())) return true;
  return Object.entries(ALLERGY).some(([k, gens]) => a.includes(k) && gens.includes(med.generic));
}
function bookVisit(u, s, pid, did, date, complaint) {
  const p = P(pid), d = D(did); date = futureDate(date);
  const token = nextToken(d.id, date);
  const v = put('visits', { id: 'V-' + seq('v', 9), pid: p.id, did: d.id, date, token, status: date === today() ? 'Waiting' : 'Booked', complaint: str(complaint, 300), diagnosis: '', vitals: '', notes: '', s: null, bs: s });
  addBill(p.id, 'Consultation — ' + d.name, d.fee, 'Consultation', s);
  audit(u, `Booked token ${token} for ${p.name} with ${d.name} on ${fdate(date)}`);
  notify(p, `Your OPD token is ${token} with ${d.name} on ${fdate(date)}.`);
  return { v, d, p, token };
}

var A = {
  reg: { roles: ['reception'], run(b, u, s) {
    const name = str(b.name, 80), mobile = str(b.mobile, 10);
    if (!name) err('Name is required');
    if (!/^[6-9]\d{9}$/.test(mobile)) err('Enter a valid 10-digit mobile number');
    const p = put('patients', { id: 'SH-' + seq('p', 1008), name, age: num(b.age, 0, 130, 'age'), sex: b.sex === 'F' ? 'F' : 'M', mobile, blood: str(b.blood, 8) || 'Unknown', allergy: str(b.allergy, 120), addr: str(b.addr, 200), s });
    audit(u, `Registered ${name} (${p.id})`);
    return { toast: notify(p, `Welcome to ${HOSP}. Your patient ID is ${p.id}. Log in to the patient app with this mobile number.`), id: p.id };
  } },
  book: { roles: ['reception'], run(b, u, s) {
    const { d, p, token, v } = bookVisit(u, s, b.pid, b.did, b.date, b.complaint);
    return { toast: `Token ${token} booked for ${p.name}`, token, vid: v.id, doctor: d.name, dept: d.dept, fee: d.fee, date: v.date, patient: p.name };
  } },
  pbook: { roles: ['patient'], run(b, u, s) {
    if (!str(b.complaint)) err('Tell us briefly what the problem is');
    const { d, token, v } = bookVisit(u, s, u.pid, b.did, b.date, b.complaint);
    return { toast: `Booked · token ${token} with ${d.name} on ${fdate(v.date)}` };
  } },
  admit: { roles: ['reception'], run(b, u, s) {
    const p = P(b.pid), d = D(b.did), bed = S.beds.find(x => x.id === b.bed) || err('Choose a bed');
    if (bed.pid) err(`${bed.id} is already occupied`);
    if (S.adm.some(a => a.pid === p.id && a.status === 'Admitted')) err('This patient is already admitted');
    const reason = str(b.reason, 300) || err('Reason for admission is required');
    const w = WARDS.find(w => w[0] === bed.ward);
    put('adm', { id: 'IP-' + seq('a', 502), pid: p.id, did: d.id, bed: bed.id, date: today(), reason, status: 'Admitted', vitals: [], s });
    bed.pid = p.id; put('beds', bed);
    addBill(p.id, `Bed charges, ${w[1]} × 1 day`, w[3], 'IPD', s);
    if (b.vid) { const v = S.visits.find(v => v.id === b.vid); if (v) { v.admitted = true; put('visits', v); } }
    audit(u, `Admitted ${p.name} to ${bed.id} under ${d.name}`);
    return { toast: `${p.name} admitted to ${bed.id} · nurses’ bed board updated` };
  } },
  discharge: { roles: ['reception', 'doctor'], run(b, u, s) {
    const a = get('adm', b.id, 'Admission'); if (a.status !== 'Admitted') err('Already discharged');
    a.status = 'Discharged'; a.dis = s; a.ddate = today(); put('adm', a);
    const bed = S.beds.find(x => x.id === a.bed); if (bed) { bed.pid = null; put('beds', bed); }
    const p = P(a.pid); audit(u, `Discharged ${p.name} from ${a.bed}`);
    return { toast: notify(p, 'You have been discharged. Your summary and final bill are in the patient app. Get well soon!') };
  } },
  pay: { roles: ['reception'], run(b, u, s) {
    const bill = get('bills', b.id, 'Bill'); if (bill.paid) err('Bill is already paid');
    const mode = ['Cash', 'UPI', 'Card', 'Insurance / TPA'].includes(b.mode) ? b.mode : err('Choose a payment mode');
    Object.assign(bill, { paid: true, mode, pdate: today(), ps: s }); put('bills', bill);
    const total = bill.items.reduce((t, i) => t + i.a, 0), p = P(bill.pid);
    audit(u, `Received ${inr(total)} for ${bill.id} (${mode}) from ${p.name}`);
    notify(p, `Payment of ${inr(total)} received for bill ${bill.id}. Thank you.`);
    return { toast: `Payment ${inr(total)} received · receipt sent to ${p.mobile}` };
  } },
  payOnline: { roles: ['patient'], run(b, u, s) {
    const bill = get('bills', b.id, 'Bill'); if (bill.pid !== u.pid) err('Not your bill', 403);
    if (!DEMO) err('Online payment is not switched on yet. Please pay at the reception desk.');
    Object.assign(bill, { paid: true, mode: 'UPI (online, demo)', pdate: today(), ps: s }); put('bills', bill);
    audit(u, `Paid ${bill.id} online (demo)`);
    return { toast: 'Payment successful (demo)' };
  } },
  startConsult: { roles: ['doctor'], run(b, u) {
    const v = get('visits', b.id, 'Visit'); if (v.did !== u.did) err('This patient is in another doctor’s queue', 403);
    if (v.status === 'Waiting' || v.status === 'Booked') { v.status = 'In consultation'; put('visits', v); }
    audit(u, 'Opened consultation with ' + P(v.pid).name);
    return {};
  } },
  consult: { roles: ['doctor'], run(b, u, s) {
    const v = get('visits', b.vid, 'Visit'); if (v.did !== u.did) err('This patient is in another doctor’s queue', 403);
    if (v.status === 'Done') err('This consultation is already saved');
    const p = P(v.pid), diagnosis = str(b.diagnosis, 300) || err('Diagnosis is required');
    const items = (Array.isArray(b.meds) ? b.meds : []).filter(i => i && i.mid).slice(0, 20).map(i => {
      const m = MED(i.mid); if (!m.active) err(`${m.name} is no longer on the medicine list`);
      if (allergyClash(p, m)) err(`Allergy alert: ${p.name} is allergic to ${p.allergy}. Remove ${m.name}.`);
      const dose = DOSES.includes(i.dose) ? i.dose : '1-0-1', days = num(i.days, 1, 365, 'days'), q = qtyOf(dose, days);
      return { mid: m.id, med: m.name, dose, days, qty: q, pq: q };
    });
    const labs = (b.labs || []).filter(t => LABT[t]), imgs = (b.imgs || []).filter(t => IMGT[t]);
    const vt = [['bp', 'BP '], ['pulse', 'Pulse '], ['temp', 'Temp ', '°F'], ['wt', 'Wt ', ' kg'], ['spo2', 'SpO₂ ', '%']].filter(([k]) => str(b[k])).map(([k, l, x]) => l + str(b[k], 10) + (x || '')).join(' · ');
    Object.assign(v, { status: 'Done', complaint: str(b.complaint, 500), diagnosis, notes: str(b.notes, 1000), vitals: vt, admit: !!b.admit, s }); put('visits', v);
    const order = (kind, t) => put('orders', { id: (kind === 'lab' ? 'LB-' : 'RD-') + seq('o', 107), pid: p.id, vid: v.id, did: v.did, kind, test: t, status: 'Ordered', date: today(), results: null, findings: '', impression: '', img: '', trail: [{ s: 'Ordered', ...s }] });
    labs.forEach(t => { order('lab', t); addBill(p.id, t, LABT[t].price, 'Laboratory', s); });
    imgs.forEach(t => { order('img', t); addBill(p.id, t, IMGT[t], 'Radiology', s); });
    if (items.length) put('rx', { id: 'RX-' + seq('r', 5), pid: p.id, vid: v.id, did: v.did, date: today(), status: 'Pending', items, s });
    if (isDate(b.fu)) bookVisit(u, s, p.id, v.did, b.fu, 'Follow-up');
    audit(u, `Completed consultation — ${p.name}: ${diagnosis}`);
    return { toast: ['Saved', labs.length && `${labs.length} lab test(s) to Lab`, imgs.length && `${imgs.length} scan(s) to X-ray`, items.length && 'prescription to Pharmacy', v.admit && 'admission request to Reception'].filter(Boolean).join(' · ') };
  } },
  labCollect: { roles: ['lab', 'nurse'], run(b, u, s) {
    const o = get('orders', b.id, 'Order'); if (o.kind !== 'lab' || o.status !== 'Ordered') err('Sample already collected');
    step(o, 'Sample collected', s); put('orders', o); audit(u, `Collected sample for ${o.test} — ${P(o.pid).name}`);
    return { toast: 'Sample collected' };
  } },
  labResult: { roles: ['lab'], run(b, u, s) {
    const o = get('orders', b.id, 'Order'); if (o.kind !== 'lab' || !['Sample collected', 'Result entered'].includes(o.status)) err('Collect the sample first');
    o.results = LABT[o.test].p.map((q, i) => num((b.results || [])[i], -1e6, 1e7, q[0]));
    step(o, 'Result entered', s); put('orders', o); audit(u, `Entered results for ${o.test} — ${P(o.pid).name}`);
    return { toast: 'Results saved · waiting for approval' };
  } },
  imgScan: { roles: ['img'], run(b, u, s) {
    const o = get('orders', b.id, 'Order'); if (o.kind !== 'img' || o.status !== 'Ordered') err('Already scanned');
    step(o, 'Scanned', s); put('orders', o); audit(u, `Completed ${o.test} — ${P(o.pid).name}`);
    return { toast: 'Marked as scanned' };
  } },
  imgReport: { roles: ['img'], run(b, u, s) {
    const o = get('orders', b.id, 'Order'); if (o.kind !== 'img' || !['Scanned', 'Reported'].includes(o.status)) err('Mark the scan as done first');
    if (b.image) {
      const m = /^data:image\/(jpeg|png|webp);base64,(.+)$/.exec(b.image) || err('Image must be JPG, PNG or WebP');
      const bytes = Utilities.base64Decode(m[2]); if (bytes.length > 8e6) err('Image is larger than 8 MB');
      const f = scanFolder_().createFile(Utilities.newBlob(bytes, 'image/' + m[1], `${o.id}-${Date.now()}.${m[1] === 'jpeg' ? 'jpg' : m[1]}`));
      o.img = f.getId();
    }
    o.findings = str(b.findings, 3000) || err('Findings are required'); o.impression = str(b.impression, 500) || err('Impression is required');
    step(o, 'Reported', s); put('orders', o); audit(u, `Reported ${o.test} — ${P(o.pid).name}`);
    return { toast: 'Report saved · waiting for approval' };
  } },
  release: { roles: ['lab', 'img'], run(b, u, s) {
    const o = get('orders', b.id, 'Order');
    if ((u.role === 'lab') !== (o.kind === 'lab')) err('This report belongs to another department', 403);
    if (!['Result entered', 'Reported'].includes(o.status)) err('Report is not ready to release');
    step(o, 'Approved', s); put('orders', o); const p = P(o.pid);
    audit(u, `Approved and released ${o.test} report — ${p.name}`);
    return { toast: notify(p, `Your ${o.test} report is ready. Open the patient app to view it.`) };
  } },
  vitals: { roles: ['nurse', 'doctor'], run(b, u, s) {
    const a = get('adm', b.id, 'Admission'); if (a.status !== 'Admitted') err('Patient is discharged');
    const bp = str(b.bp, 9); if (!/^\d{2,3}\/\d{2,3}$/.test(bp)) err('BP should look like 120/80');
    const v = { bp, pulse: num(b.pulse, 20, 250, 'pulse'), temp: num(b.temp, 90, 110, 'temperature'), spo2: num(b.spo2, 40, 100, 'SpO₂'), note: str(b.note, 500), s };
    a.vitals.push(v); put('adm', a); const p = P(a.pid);
    audit(u, `Recorded vitals — ${p.name} (BP ${v.bp}, SpO₂ ${v.spo2}%)`);
    const bad = v.spo2 < 94 || v.temp >= 102 || v.pulse > 110;
    return { toast: bad ? `Abnormal vitals — ${D(a.did).name} alerted for ${p.name}` : 'Vitals saved', warn: bad };
  } },
  rxQty: { roles: ['pharmacy'], run(b, u, s) {
    const r = get('rx', b.id, 'Prescription'); if (r.status !== 'Pending') err('Already dispensed');
    const i = r.items[+b.k] || err('Line not found'), nv = Math.round(num(b.qty, 0, 10000, 'quantity'));
    if (nv === i.qty) return {};
    i.edit = { from: i.qty, to: nv, ...s }; audit(u, `Changed quantity of ${i.med} for ${P(r.pid).name}: ${i.qty} → ${nv}`);
    i.qty = nv; put('rx', r); return { toast: `Quantity updated to ${nv}` };
  } },
  dispense: { roles: ['pharmacy'], run(b, u, s) {
    const r = get('rx', b.id, 'Prescription'); if (r.status !== 'Pending') err('Already dispensed');
    const its = r.items.filter(i => i.qty > 0); if (!its.length) err('All quantities are 0 — nothing to dispense');
    for (const i of its) if (avail(i.mid) < i.qty) err(`Not enough ${i.med} in stock (${avail(i.mid)} available)`);
    its.forEach(i => {
      let need = i.qty;
      for (const x of okStock(i.mid)) { const t = Math.min(need, x.qty); x.qty -= t; need -= t; put('stock', x); if (!need) break; }
      addBill(r.pid, `${i.med} × ${i.qty}`, MED(i.mid).price * i.qty, 'Pharmacy', s);
    });
    r.status = 'Dispensed'; r.dd = today(); r.ds = s; put('rx', r);
    audit(u, `Dispensed ${r.id} — ${P(r.pid).name}`);
    return { toast: 'Dispensed · stock updated · added to patient bill' };
  } },
  medSave: { roles: ['pharmacy'], run(b, u, s) {
    const o = { name: str(b.name, 80) || err('Name is required'), generic: str(b.generic, 80) || err('Generic name is required'), form: FORMS.includes(b.form) ? b.form : 'Tablet', cat: str(b.cat, 60), price: num(b.price, 0, 1e6, 'price'), reorder: Math.round(num(b.reorder, 0, 1e6, 'reorder level')), active: !!b.active, upd: s };
    if (b.id) {
      const m = get('meds', b.id, 'Medicine'), ch = [];
      if (m.price !== o.price) ch.push(`price ${inr(m.price)} → ${inr(o.price)}`); if (m.name !== o.name) ch.push(`renamed from ${m.name}`); if (m.active !== o.active) ch.push(o.active ? 'activated' : 'deactivated');
      Object.assign(m, o); put('meds', m); audit(u, `Edited medicine ${o.name}${ch.length ? ' (' + ch.join(', ') + ')' : ''}`);
    } else {
      if (S.meds.some(m => m.name.toLowerCase() === o.name.toLowerCase())) err('A medicine with this name already exists');
      put('meds', { id: 'M' + seq('m', 13), ...o }); audit(u, 'Added medicine ' + o.name);
    }
    return { toast: 'Medicine saved' };
  } },
  batchSave: { roles: ['pharmacy'], run(b, u, s) {
    const batch = str(b.batch, 30) || err('Batch number is required'), exp = isDate(b.exp) ? b.exp : err('Expiry date is required'), qty = Math.round(num(b.qty, 0, 1e7, 'quantity')), reason = str(b.reason, 60) || 'Updated';
    if (b.id) {
      const x = get('stock', b.id, 'Batch'), old = x.qty;
      Object.assign(x, { batch, exp, qty, upd: s, note: reason + (old !== qty ? ` (qty ${old} → ${qty})` : '') }); put('stock', x);
      audit(u, `Edited batch ${batch} of ${MED(x.mid).name}: ${x.note}`);
    } else {
      const m = MED(b.mid); put('stock', { id: 'BT' + seq('bt', 13), mid: m.id, batch, exp, qty, upd: s, note: reason });
      audit(u, `Added batch ${batch} of ${m.name} × ${qty}`);
    }
    return { toast: 'Stock saved' };
  } },
  staffAdd: { roles: ['admin'], run(b, u) {
    const role = ['reception', 'doctor', 'nurse', 'lab', 'img', 'pharmacy', 'admin'].includes(b.role) ? b.role : err('Choose a desk');
    const name = str(b.name, 80) || err('Name is required'), uid = str(b.uid, 30).toLowerCase();
    if (!/^[a-z0-9._-]{3,30}$/.test(uid)) err('User ID: 3–30 letters, numbers, dot, dash');
    if (S.staff.some(x => x.uid === uid)) err('That user ID already exists');
    const pw = String(b.password || ''); if (pw.length < 8) err('Password must be at least 8 characters');
    let did = null;
    if (role === 'doctor') { did = 'd' + seq('d', 5); put('doctors', { id: did, name, dept: str(b.dept, 60) || 'General medicine', fee: num(b.fee || 500, 0, 1e6, 'fee') }); }
    put('staff', { id: uid, uid, name, role, did, active: true, hash: hashPw(pw) });
    audit(u, `Added staff login ${uid} (${name})`);
    return { toast: `${name} can now sign in` };
  } },
  staffToggle: { roles: ['admin'], run(b, u) {
    const x = get('staff', b.id, 'Staff'); if (x.uid === u.uid) err('You cannot disable yourself');
    x.active = !x.active; put('staff', x); audit(u, `${x.active ? 'Enabled' : 'Disabled'} login ${x.uid}`);
    return { toast: `${x.name} ${x.active ? 'enabled' : 'disabled'}` };
  } },
  staffReset: { roles: ['admin'], run(b, u) {
    const x = get('staff', b.id, 'Staff'), pw = String(b.password || ''); if (pw.length < 8) err('Password must be at least 8 characters');
    x.hash = hashPw(pw); put('staff', x); audit(u, `Reset password for ${x.uid}`);
    return { toast: `Password reset for ${x.name}` };
  } },
  changePw: { roles: ['reception', 'doctor', 'nurse', 'lab', 'img', 'pharmacy', 'admin'], run(b, u) {
    const x = get('staff', u.uid, 'Staff');
    if (!checkPw(String(b.old || ''), x.hash)) err('Current password is wrong');
    const pw = String(b.pw || ''); if (pw.length < 8) err('New password must be at least 8 characters');
    x.hash = hashPw(pw); put('staff', x); audit(u, 'Changed own password');
    return { toast: 'Password changed' };
  } },
  alertRaise: { roles: ['reception', 'doctor', 'nurse', 'lab', 'img', 'pharmacy', 'admin'], run(b, u, s) {
    const code = CODES[b.code] ? b.code : err('Choose an emergency code');
    const loc = str(b.location, 80) || err('Location is required');
    const a = put('alerts', { id: 'AL-' + seq('al', 1), code, location: loc, note: str(b.note, 200), status: 'Active', s, acks: [] });
    audit(u, `Raised ${code} at ${loc}`);
    return { toast: `${code} broadcast to all staff`, alert: a };
  } },
  alertAck: { roles: ['reception', 'doctor', 'nurse', 'lab', 'img', 'pharmacy', 'admin'], run(b, u, s) {
    const a = get('alerts', b.id, 'Alert'); if (a.acks.some(x => x.uid === u.uid)) return {};
    a.acks.push(s); put('alerts', a); audit(u, `Acknowledged ${a.code} at ${a.location}`);
    return { toast: `You acknowledged ${a.code}` };
  } },
  alertClose: { roles: ['reception', 'doctor', 'nurse', 'admin'], run(b, u, s) {
    const a = get('alerts', b.id, 'Alert'); a.status = 'Closed'; a.cs = s; put('alerts', a);
    audit(u, `Closed ${a.code} at ${a.location}`);
    return { toast: `${a.code} closed` };
  } },
  viewFile: { roles: ['reception', 'doctor', 'nurse', 'lab', 'img', 'pharmacy', 'admin'], run(b, u) {
    audit(u, 'Viewed medical file of ' + P(b.id).name); return {};
  } }
};

// ---------------- License tab ----------------
function licenseTab_() {
  var sh = ss_().getSheetByName(LICENSE_TAB);
  if (sh) return sh;
  sh = ss_().insertSheet(LICENSE_TAB, 0);
  var start = new Date(), exp = new Date(Date.now() + 14 * 864e5);
  sh.getRange('A1').setValue('HMScrat — Trial licence').setFontSize(16).setFontWeight('bold').setFontColor('#0b4f5c');
  sh.getRange('A2').setValue('Edit the Value column. Changes apply within a minute. You can also use the HMScrat menu above.').setFontColor('#58717d');
  var rows = [['Setting', 'Value', 'Notes'],
    ['Licensed to', 'Trial client', 'Client / hospital name shown on the login screen'],
    ['Plan', 'Trial', 'Shown to users, e.g. Trial, Standard'],
    ['Start date', start, ''],
    ['Expiry date', exp, 'The app locks for everyone after this date. Change it to extend the trial.'],
    ['Status', 'Active', 'Active = app works · Suspended = app locked immediately'],
    ['Hospital name', HOSP_DEFAULT, 'Name shown across the app and on reports'],
    ['Message when expired', 'Your trial period has ended. Please contact DEVOCRAT to continue using HMScrat.', 'Shown on the lock screen'],
    ['Support phone', '', 'Shown on the lock screen'],
    ['Support email', '', 'Shown on the lock screen']];
  sh.getRange(4, 1, rows.length, 3).setValues(rows);
  sh.getRange('A4:C4').setFontWeight('bold').setBackground('#0b4f5c').setFontColor('#ffffff');
  sh.getRange('A5:A13').setFontWeight('bold');
  sh.getRange('B7:B8').setNumberFormat('dd mmm yyyy').setDataValidation(SpreadsheetApp.newDataValidation().requireDate().setAllowInvalid(false).build());
  sh.getRange('B9').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Active', 'Suspended'], true).build());
  sh.getRange('B5:B13').setBackground('#fff8e1');
  var rule = SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND(ISNUMBER($B$8),$B$8<TODAY())').setBackground('#ffcdd2').setFontColor('#b71c1c').setRanges([sh.getRange('B8')]).build();
  sh.setConditionalFormatRules([rule]);
  sh.getRange('A15').setValue('Days left'); sh.getRange('B15').setFormula('=IF(ISNUMBER(B8),MAX(0,B8-TODAY()),"")'); sh.getRange('A15:B15').setFontWeight('bold');
  sh.setColumnWidth(1, 190); sh.setColumnWidth(2, 360); sh.setColumnWidth(3, 460);
  return sh;
}
function licenseState() {
  var c = CacheService.getScriptCache(), hit = c.get('lic');
  if (hit) return JSON.parse(hit);
  var m = {};
  licenseTab_().getRange(1, 1, 40, 2).getValues().forEach(function (r) { if (r[0]) m[String(r[0]).trim().toLowerCase()] = r[1]; });
  var e = m['expiry date'], exp = e instanceof Date ? fmt_(e, 'yyyy-MM-dd') : String(e || '').trim();
  var daysLeft = isDate(exp) ? Math.round((new Date(exp + 'T00:00:00Z') - new Date(today() + 'T00:00:00Z')) / 864e5) : -1;
  var status = String(m['status'] || 'Active').trim(), active = /^active$/i.test(status);
  var L = { to: String(m['licensed to'] || ''), plan: String(m['plan'] || 'Trial'), expiry: exp, daysLeft: daysLeft, status: status,
    valid: active && daysLeft >= 0, reason: !active ? 'suspended' : daysLeft < 0 ? 'expired' : '',
    hospital: String(m['hospital name'] || HOSP_DEFAULT), message: String(m['message when expired'] || 'Your trial has ended.'),
    phone: String(m['support phone'] || ''), email: String(m['support email'] || '') };
  c.put('lic', JSON.stringify(L), 60);
  return L;
}
function onEdit(e) { try { if (e && e.range && e.range.getSheet().getName() === LICENSE_TAB) CacheService.getScriptCache().remove('lic'); } catch (x) {} }
function onOpen() {
  SpreadsheetApp.getUi().createMenu('HMScrat')
    .addItem('Extend trial by 7 days', 'extend7').addItem('Extend trial by 30 days', 'extend30')
    .addSeparator().addItem('Suspend app now', 'suspendApp').addItem('Activate app', 'activateApp')
    .addSeparator().addItem('Set up / reset sample data…', 'setupConfirm').addItem('Clear app cache', 'clearCache').addToUi();
}
function setLic_(label, value) {
  var sh = licenseTab_(), vals = sh.getRange(1, 1, 40, 1).getValues();
  for (var i = 0; i < vals.length; i++) if (String(vals[i][0]).trim().toLowerCase() === label) { sh.getRange(i + 1, 2).setValue(value); break; }
  CacheService.getScriptCache().remove('lic');
}
function extend_(n) {
  var L = licenseState(), base = isDate(L.expiry) && L.expiry > today() ? new Date(L.expiry + 'T12:00:00Z') : new Date();
  var d = new Date(base.getTime() + n * 864e5); setLic_('expiry date', d); setLic_('status', 'Active');
  try { SpreadsheetApp.getUi().alert('Trial now ends on ' + fmt_(d, 'd MMM yyyy') + '.'); } catch (e) {}
}
function extend7() { extend_(7); }
function extend30() { extend_(30); }
function suspendApp() { setLic_('status', 'Suspended'); try { SpreadsheetApp.getUi().alert('App suspended. Users see the lock screen from their next action.'); } catch (e) {} }
function activateApp() { setLic_('status', 'Active'); try { SpreadsheetApp.getUi().alert('App active.'); } catch (e) {} }
function clearCache() { var c = CacheService.getScriptCache(); c.remove('lic'); meta('ver', ver_() + 1); }
function setupConfirm() {
  var ui = SpreadsheetApp.getUi();
  if (ui.alert('Reset hospital data?', 'This deletes all patients, visits, bills and the audit log, and loads the sample hospital again. The License tab is kept.', ui.ButtonSet.OK_CANCEL) !== ui.Button.OK) return;
  setup(); ui.alert('Done. Sample hospital loaded. Staff password: demo123');
}

// Run once from the Apps Script editor (select "setup" and press Run).
function setup() {
  var lock = LockService.getScriptLock(); lock.waitLock(30000);
  try {
    licenseTab_();
    var p = props_(), all = p.getProperties();
    Object.keys(all).forEach(function (k) { if (/^seq_/.test(k)) p.deleteProperty(k); });
    S = {}; COLLS.forEach(function (c) { S[c] = []; DIRTY[c] = true; });
    var a = auditTab_(); if (a.getLastRow() > 1) a.getRange(2, 1, a.getLastRow() - 1, 5).clearContent();
    seed();
    audit(null, 'Hospital set up with sample data');
    flush();
    var order = [LICENSE_TAB].concat(COLLS.map(function (c) { return TAB[c]; })).concat([AUDIT_TAB]);
    order.forEach(function (n, i) { var sh = ss_().getSheetByName(n); if (sh) { ss_().setActiveSheet(sh); ss_().moveActiveSheet(i + 1); } });
    var def = ss_().getSheetByName('Sheet1'); if (def && def.getLastRow() === 0) ss_().deleteSheet(def);
    ss_().setActiveSheet(ss_().getSheetByName(LICENSE_TAB));
    CacheService.getScriptCache().remove('lic');
  } finally { lock.releaseLock(); }
}
function scanFolder_() {
  var id = meta('scan_folder'), f = null;
  if (id) try { f = DriveApp.getFolderById(id); } catch (e) {}
  if (!f) { f = DriveApp.createFolder('HMScrat — scan images'); meta('scan_folder', f.getId()); }
  return f;
}

// ---------------- sign-in tokens ----------------
function secret_() { var s = meta('secret'); if (!s) { s = Utilities.getUuid() + Utilities.getUuid(); meta('secret', s); } return s; }
function sig_(p) { return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(p, secret_())); }
function sign_(u) {
  var body = {}; Object.keys(u).forEach(function (k) { body[k] = u[k]; });
  body.exp = Date.now() + (u.role === 'patient' ? 30 : 1) * 864e5;
  var p = Utilities.base64EncodeWebSafe(JSON.stringify(body), Utilities.Charset.UTF_8);
  return p + '.' + sig_(p);
}
function verify_(t) {
  var parts = String(t || '').split('.');
  if (parts.length !== 2 || sig_(parts[0]) !== parts[1]) err('Please sign in again', 401);
  var u = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString());
  if (!u.exp || u.exp < Date.now()) err('Session expired — please sign in again', 401);
  return u;
}
function auth_(token) {
  var u = verify_(token); load();
  if (u.role === 'patient') { if (!S.patients.some(function (p) { return p.id === u.pid; })) err('Please sign in again', 401); }
  else { var x = S.staff.find(function (s) { return s.uid === u.uid; }); if (!x || !x.active) err('Your login is disabled', 401); u.name = x.name; u.role = x.role; u.did = x.did || null; }
  return u;
}
function limited_(key) { var c = CacheService.getScriptCache(), n = +(c.get(key) || 0) + 1; c.put(key, String(n), 900); return n > 8; }

// ---------------- web app ----------------
function doGet(e) { return out_(handle_({ op: (e && e.parameter && e.parameter.op) || 'public' })); }
function doPost(e) { var b = {}; try { b = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (x) {} return out_(handle_(b)); }
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function handle_(b) {
  try {
    var L = licenseState(); HOSP = L.hospital;
    var pub = { hospital: L.hospital, licensedTo: L.to, plan: L.plan, expiry: L.expiry, daysLeft: L.daysLeft, valid: L.valid, reason: L.reason, message: L.message, phone: L.phone, email: L.email };
    if (b.op === 'public') { load(); var deps = []; S.doctors.forEach(function (d) { if (deps.indexOf(d.dept) < 0) deps.push(d.dept); }); return { ok: true, demo: DEMO, license: pub, hospital: L.hospital, departments: deps }; }
    if (!L.valid) return { ok: false, error: 'LICENSE', license: pub };
    if (b.op === 'ping') { verify_(b.token); return { ok: true, ver: ver_(), license: pub }; }
    if (b.op === 'login') return login_(b);
    if (b.op === 'otp') return otp_(b);
    if (b.op === 'otpVerify') return otpVerify_(b);
    var u = auth_(b.token);
    if (b.op === 'state') return { ok: true, state: snapshot_(u, pub) };
    if (b.op === 'file') return file_(u, b);
    if (b.op === 'action') return action_(u, b, pub);
    err('Unknown request');
  } catch (x) {
    if (x && x.isApp) return { ok: false, error: x.message, status: x.status };
    console.error(x && x.stack || x);
    return { ok: false, error: 'Server error: ' + (x && x.message || x), status: 500 };
  }
}
function publicUser_(x) { return { uid: x.uid, name: x.name, role: x.role, did: x.did || null }; }
function login_(b) {
  var uid = String(b.uid || '').trim().toLowerCase(), pw = String(b.pw || '');
  if (limited_('try_' + uid)) err('Too many attempts. Try again in 15 minutes.', 429);
  load();
  var x = S.staff.find(function (s) { return s.uid === uid; });
  if (!x || !x.active || !checkPw(pw, x.hash)) err('Wrong user ID or password', 401);
  var u = publicUser_(x); audit(u, 'Signed in'); flush();
  return { ok: true, token: sign_(u), user: u };
}
function otp_(b) {
  var mobile = String(b.mobile || '').trim();
  if (limited_('otp_try_' + mobile)) err('Too many attempts. Try again later.', 429);
  load();
  if (!S.patients.some(function (p) { return p.mobile === mobile; })) err('No patient is registered with this mobile. Please contact reception.', 404);
  var code = String(100000 + Math.floor(Math.random() * 900000));
  CacheService.getScriptCache().put('otp_' + mobile, JSON.stringify({ code: code, n: 0 }), 300);
  return { ok: true, trialOtp: code }; // trial: no SMS — the code is shown on screen
}
function otpVerify_(b) {
  var mobile = String(b.mobile || '').trim(), c = CacheService.getScriptCache(), raw = c.get('otp_' + mobile);
  if (!raw) err('Code expired. Request a new one.');
  var o = JSON.parse(raw);
  if (++o.n > 5) { c.remove('otp_' + mobile); err('Too many wrong codes. Request a new one.', 429); }
  c.put('otp_' + mobile, JSON.stringify(o), 300);
  if (String(b.otp || '').trim() !== o.code) err('Incorrect code', 401);
  load();
  var list = S.patients.filter(function (p) { return p.mobile === mobile; });
  var p = list.length === 1 ? list[0] : list.find(function (x) { return x.id === b.pid; });
  if (!p) return { ok: true, choose: list.map(function (x) { return { id: x.id, name: x.name, age: x.age }; }) };
  c.remove('otp_' + mobile);
  var u = { uid: 'pt:' + p.id, name: p.name, role: 'patient', pid: p.id };
  audit(u, 'Patient logged in'); flush();
  return { ok: true, token: sign_(u), user: u };
}
function snapshot_(u, pub) {
  var base = { ver: ver_(), license: pub, today: today(), hospital: pub.hospital, demo: DEMO, me: u, doctors: S.doctors, catalog: { LABT: LABT, IMGT: IMGT, WARDS: WARDS, ALLERGY: ALLERGY, DOSES: DOSES, FORMS: FORMS, CODES: CODES } };
  var k; 
  if (u.role === 'patient') {
    var mine = function (c) { return S[c].filter(function (x) { return x.pid === u.pid; }); };
    var r = { patients: S.patients.filter(function (p) { return p.id === u.pid; }), visits: mine('visits'),
      orders: mine('orders').map(function (o) { if (o.status === 'Approved') return o; var c = JSON.parse(JSON.stringify(o)); c.results = null; c.findings = ''; c.impression = ''; c.img = ''; return c; }),
      rx: mine('rx'), bills: mine('bills'), notes: mine('notes').reverse(), adm: mine('adm'), meds: [], stock: [], beds: [], staff: [], alerts: [], log: [] };
    for (k in r) base[k] = r[k];
    return base;
  }
  var st = { patients: S.patients, visits: S.visits, orders: S.orders, rx: S.rx, meds: S.meds, stock: S.stock, beds: S.beds, adm: S.adm, bills: S.bills, notes: [],
    staff: S.staff.map(function (x) { return { uid: x.uid, name: x.name, role: x.role, did: x.did, active: x.active }; }),
    alerts: S.alerts.filter(function (a) { return a.status === 'Active'; }), log: u.role === 'admin' ? auditRecent(200) : [] };
  for (k in st) base[k] = st[k];
  return base;
}
function action_(u, b, pub) {
  var a = A[b.name]; if (!a) err('Unknown action', 404);
  if (a.roles.indexOf(u.role) < 0) err('Your desk cannot do this', 403);
  var lock = LockService.getScriptLock(); lock.waitLock(25000);
  try {
    load(); DIRTY = {}; AUDITQ = [];
    var out = a.run(b.payload || {}, u, stampOf(u)) || {};
    flush();
    out.ok = true; out.state = snapshot_(u, pub);
    return out;
  } catch (e) { DIRTY = {}; AUDITQ = []; S = null; throw e; }
  finally { lock.releaseLock(); }
}
function file_(u, b) {
  load();
  var o = S.orders.find(function (x) { return x.img && x.img === b.id; });
  if (!o) err('Image not found', 404);
  if (u.role === 'patient' && (o.pid !== u.pid || o.status !== 'Approved')) err('Not allowed', 403);
  var blob = DriveApp.getFileById(o.img).getBlob();
  return { ok: true, data: 'data:' + blob.getContentType() + ';base64,' + Utilities.base64Encode(blob.getBytes()) };
}
;return function (__n) { return eval(__n); };
};
