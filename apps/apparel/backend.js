/* DEVOCRAT Apparels — its Google Apps Script (Code.gs), wrapped to run in the browser for the website demo. Generated; edit the original Code.gs. */
window.__GAS_BACKEND = function (SpreadsheetApp, PropertiesService, CacheService, LockService, Utilities, ContentService, HtmlService, DriveApp, Session, MailApp, GmailApp, UrlFetchApp, ScriptApp, Logger) {
/**
 * DEVOCRAT Apparels — Google Sheets backend (Google Apps Script web app)
 *
 * Paste this whole file into Extensions → Apps Script of the store's Google Sheet,
 * then follow README.md: set the admin password, deploy as a Web app, and copy the URL
 * into config.js on your Netlify site.
 *
 * Sheets used:
 *   Products — one row per product (you can edit it directly in Google Sheets)
 *   Orders   — one row per order (customers add rows; admins change Status)
 */

const PRODUCTS = 'Products';
const ORDERS = 'Orders';
const PHOTO_FOLDER = 'DEVOCRAT Apparels Photos';
const FREE_DELIVERY_FROM = 999;   // ₹ — orders at or above this ship free
const DELIVERY_FEE = 79;          // ₹
const TOKEN_DAYS = 7;             // admin sign-in lasts this many days

const P_HEAD = ['ID', 'Name', 'Shop For', 'Category', 'Brand', 'Price', 'MRP', 'Stock by size', 'Colour', 'Colour Hex',
  'Fabric', 'Description', 'Photos', 'New', 'Hidden', 'Rating', 'Reviews', 'Shape', 'Pattern'];
const P_KEYS = ['id', 'n', 'g', 'c', 'b', 'p', 'm', 's', 'col', 'hex', 'f', 'd', 'ph', 'nw', 'hidden', 'r', 'rc', 't', 'pat'];
const O_HEAD = ['Order ID', 'Date', 'Status', 'Customer', 'Phone', 'Address', 'City', 'State', 'PIN', 'Items',
  'Subtotal', 'Delivery', 'Total', 'Payment', 'Stock deducted', 'Items JSON'];
const STATUSES = ['Placed', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

/* ------------------------------------------------------------------ menu & setup */

function onOpen() {
  SpreadsheetApp.getUi().createMenu('DEVOCRAT Store')
    .addItem('1. Set up sheets', 'setup')
    .addItem('2. Set admin password', 'setAdminPassword')
    .addToUi();
}

/** Creates the Products and Orders tabs with headers if they are missing. Safe to run again. */
function setup() {
  const ss = SpreadsheetApp.getActive();
  [[PRODUCTS, P_HEAD], [ORDERS, O_HEAD]].forEach(([name, head]) => {
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    if (sh.getLastRow() === 0) sh.appendRow(head);
    sh.getRange(1, 1, 1, head.length).setFontWeight('bold').setBackground('#2b1b3d').setFontColor('#ffffff');
    sh.setFrozenRows(1);
  });
  ss.getSheetByName(PRODUCTS).getRange('A:A').setNumberFormat('@');
  ss.getSheetByName(PRODUCTS).getRange('H:H').setNumberFormat('@');   // keep "30:5" from turning into a time
  const o = ss.getSheetByName(ORDERS);
  o.getRange('C2:C').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).build());
  secret_();
  try { SpreadsheetApp.getUi().alert('Sheets are ready. Next: DEVOCRAT Store → Set admin password.'); } catch (e) {}
}

/** Asks for the admin password used to sign in to the store's admin panel. */
function setAdminPassword() {
  const ui = SpreadsheetApp.getUi();
  const r = ui.prompt('Admin password', 'Choose the password for the store admin panel (at least 8 characters):', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  const pw = r.getResponseText().trim();
  if (pw.length < 8) { ui.alert('Use at least 8 characters.'); return; }
  PropertiesService.getScriptProperties().setProperty('ADMIN_PASSWORD', pw);
  PropertiesService.getScriptProperties().setProperty('TOKEN_SECRET', Utilities.getUuid() + Utilities.getUuid());
  ui.alert('Admin password saved. Anyone already signed in has been signed out.');
}

/* ------------------------------------------------------------------ web app entry points */

function doGet(e) {
  const p = (e && e.parameter) || {};
  try {
    switch (p.action || 'products') {
      case 'products': return out_({ ok: true, products: readProducts_().filter(x => !x.hidden) });
      case 'order': return out_(getOrder_(p.id, p.phone));
      case 'ping': return out_({ ok: true });
    }
    return out_({ ok: false, error: 'Unknown action' });
  } catch (err) { return out_({ ok: false, error: msg_(err) }); }
}

function doPost(e) {
  let b;
  try { b = JSON.parse(e.postData.contents); } catch (x) { return out_({ ok: false, error: 'Bad request' }); }
  try {
    if (b.action === 'placeOrder') return out_(placeOrder_(b));
    if (b.action === 'login') return out_(login_(b.password));
    requireAdmin_(b.token);
    switch (b.action) {
      case 'adminProducts': return out_({ ok: true, products: readProducts_() });
      case 'saveProduct': return out_(saveProduct_(b.product));
      case 'deleteProduct': return out_(deleteProduct_(b.id));
      case 'uploadPhoto': return out_(uploadPhoto_(b));
      case 'orders': return out_({ ok: true, orders: listOrders_() });
      case 'setStatus': return out_(setStatus_(b.oid, b.status));
    }
    return out_({ ok: false, error: 'Unknown action' });
  } catch (err) { return out_({ ok: false, error: msg_(err), auth: err.auth || false }); }
}

/* ------------------------------------------------------------------ helpers */

function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function msg_(err) { return String((err && err.message) || err); }
function sheet_(name) {
  const sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh) throw new Error('The "' + name + '" tab is missing. Run DEVOCRAT Store → Set up sheets.');
  return sh;
}
function withLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return fn(); } finally { lock.releaseLock(); }
}
function bool_(v) { return v === true || /^(true|yes|y|1)$/i.test(String(v).trim()); }
function num_(v, d) { const n = Number(String(v).replace(/[₹,\s]/g, '')); return isFinite(n) && String(v).trim() !== '' ? n : d; }
function str_(v, max) { return String(v == null ? '' : v).trim().slice(0, max || 500); }

/** "S:30, M:20, L:0"  ⇄  {S:30, M:20, L:0} */
function parseStock_(t) {
  const o = {};
  String(t || '').split(/[,\n;]+/).forEach(part => {
    const m = part.match(/^\s*([^:]+?)\s*:\s*(-?\d+)\s*$/);
    if (m) o[m[1]] = Math.max(0, parseInt(m[2], 10));
  });
  return o;
}
function stockText_(o) { return Object.keys(o || {}).map(k => k + ':' + Math.max(0, parseInt(o[k], 10) || 0)).join(', '); }

function rowToProduct_(r) {
  const p = {};
  P_KEYS.forEach((k, i) => p[k] = r[i]);
  p.id = str_(p.id, 40); p.n = str_(p.n, 200); p.g = str_(p.g, 20); p.c = str_(p.c, 60); p.b = str_(p.b, 80);
  p.p = num_(p.p, 0); p.m = Math.max(num_(p.m, p.p), p.p); p.s = parseStock_(p.s);
  p.col = str_(p.col, 40); p.hex = /^#[0-9a-f]{6}$/i.test(str_(p.hex)) ? str_(p.hex) : '#888888';
  p.f = str_(p.f, 80); p.d = str_(p.d, 2000);
  p.ph = String(p.ph || '').split(/[\n,\s]+/).filter(u => /^https:\/\//i.test(u));
  p.nw = bool_(p.nw); p.hidden = bool_(p.hidden);
  p.r = num_(p.r, 0); p.rc = num_(p.rc, 0); p.t = str_(p.t, 20) || 'tee'; p.pat = str_(p.pat, 20) || 'solid';
  return p;
}
function productToRow_(p) {
  return [p.id, p.n, p.g, p.c, p.b, p.p, p.m, stockText_(p.s), p.col, p.hex, p.f, p.d,
    (p.ph || []).join('\n'), !!p.nw, !!p.hidden, p.r || '', p.rc || '', p.t || 'tee', p.pat || 'solid'];
}
function readProducts_() {
  const sh = sheet_(PRODUCTS), n = sh.getLastRow() - 1;
  if (n < 1) return [];
  return sh.getRange(2, 1, n, P_HEAD.length).getValues().filter(r => String(r[0]).trim()).map(rowToProduct_);
}
function findRow_(sh, id) {
  if (!id) return 0;
  const hit = sh.getRange('A:A').createTextFinder(String(id)).matchEntireCell(true).findNext();
  return hit && hit.getRow() > 1 ? hit.getRow() : 0;
}

/* ------------------------------------------------------------------ admin sign-in */

function secret_() {
  const props = PropertiesService.getScriptProperties();
  let s = props.getProperty('TOKEN_SECRET');
  if (!s) { s = Utilities.getUuid() + Utilities.getUuid(); props.setProperty('TOKEN_SECRET', s); }
  return s;
}
function sign_(text) {
  return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(text, secret_()));
}
function login_(password) {
  const pw = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD');
  if (!pw) throw new Error('No admin password yet. In the Google Sheet use DEVOCRAT Store → Set admin password.');
  if (String(password || '') !== pw) { Utilities.sleep(1500); throw new Error('Wrong password.'); }
  const exp = String(Date.now() + TOKEN_DAYS * 864e5);
  return { ok: true, token: exp + '.' + sign_(exp), sheetUrl: SpreadsheetApp.getActive().getUrl() };
}
function requireAdmin_(token) {
  const [exp, sig] = String(token || '').split('.');
  if (!exp || !sig || Number(exp) < Date.now() || sign_(exp) !== sig) {
    const e = new Error('Please sign in again.'); e.auth = true; throw e;
  }
}

/* ------------------------------------------------------------------ products (admin) */

function saveProduct_(p) {
  if (!p || !str_(p.id)) throw new Error('Missing product ID.');
  const clean = rowToProduct_(productToRow_(p));
  if (!clean.n || !clean.c) throw new Error('Name and category are required.');
  if (!(clean.p > 0)) throw new Error('Enter a selling price.');
  return withLock_(() => {
    const sh = sheet_(PRODUCTS), row = findRow_(sh, clean.id), vals = [productToRow_(clean)];
    if (row) sh.getRange(row, 1, 1, P_HEAD.length).setValues(vals);
    else sh.appendRow(vals[0]);
    return { ok: true, product: clean };
  });
}
function deleteProduct_(id) {
  return withLock_(() => {
    const sh = sheet_(PRODUCTS), row = findRow_(sh, id);
    if (!row) throw new Error('Product not found.');
    sh.deleteRow(row);
    return { ok: true };
  });
}
function uploadPhoto_(b) {
  const mime = String(b.mime || 'image/jpeg');
  if (!/^image\/(jpeg|png|webp)$/.test(mime)) throw new Error('Use a JPG, PNG or WebP image.');
  const bytes = Utilities.base64Decode(String(b.data || ''));
  if (bytes.length > 8 * 1024 * 1024) throw new Error('Photo is too large.');
  const it = DriveApp.getFoldersByName(PHOTO_FOLDER);
  const folder = it.hasNext() ? it.next() : DriveApp.createFolder(PHOTO_FOLDER);
  const file = folder.createFile(Utilities.newBlob(bytes, mime, str_(b.name, 100) || 'photo.jpg'));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return { ok: true, url: 'https://lh3.googleusercontent.com/d/' + file.getId() };
}

/* ------------------------------------------------------------------ orders */

function placeOrder_(b) {
  const a = b.addr || {};
  const addr = { name: str_(a.name, 80), phone: str_(a.phone, 10), line: str_(a.line, 200), city: str_(a.city, 60), state: str_(a.state, 60), pin: str_(a.pin, 6) };
  if (!addr.name || !addr.line || !addr.city || !addr.state) throw new Error('Please fill in every address field.');
  if (!/^[6-9]\d{9}$/.test(addr.phone)) throw new Error('Enter a valid 10-digit mobile number.');
  if (!/^[1-9]\d{5}$/.test(addr.pin)) throw new Error('Enter a valid 6-digit PIN code.');
  const want = (b.items || []).slice(0, 30);
  if (!want.length) throw new Error('Your bag is empty.');
  return withLock_(() => {
    const byId = {};
    readProducts_().forEach(p => byId[p.id] = p);
    const items = want.map(it => {
      const p = byId[it.id], qty = Math.max(1, Math.min(10, parseInt(it.qty, 10) || 1)), size = str_(it.size, 20);
      if (!p || p.hidden) throw new Error('A product in your bag is no longer available.');
      const have = p.s[size] || 0;
      if (qty > have) throw new Error(p.n + ' (size ' + size + ') has only ' + have + ' in stock.');
      return { id: p.id, n: p.n, size: size, qty: qty, price: p.p };   // price always taken from the sheet
    });
    const sub = items.reduce((t, i) => t + i.price * i.qty, 0);
    const ship = sub >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;
    const order = { oid: 'DV' + Date.now().toString(36).toUpperCase(), ts: Date.now(), items: items, sub: sub, ship: ship, total: sub + ship, pay: 'COD', status: 'Placed', addr: addr };
    sheet_(ORDERS).appendRow([order.oid, new Date(order.ts), 'Placed', addr.name, "'" + addr.phone, addr.line, addr.city, addr.state, "'" + addr.pin,
      items.map(i => i.n + ' (' + i.size + ') × ' + i.qty).join('\n'), sub, ship, sub + ship, 'Cash on Delivery', false, JSON.stringify(items)]);
    return { ok: true, order: order };
  });
}
function rowToOrder_(r) {
  let items = [];
  try { items = JSON.parse(r[15] || '[]'); } catch (e) {}
  return { oid: String(r[0]), ts: r[1] instanceof Date ? r[1].getTime() : Date.parse(r[1]) || 0, status: String(r[2] || 'Placed'),
    addr: { name: String(r[3]), phone: String(r[4]).replace(/^'/, ''), line: String(r[5]), city: String(r[6]), state: String(r[7]), pin: String(r[8]).replace(/^'/, '') },
    items: items, sub: num_(r[10], 0), ship: num_(r[11], 0), total: num_(r[12], 0), pay: 'COD', deducted: bool_(r[14]) };
}
function getOrder_(oid, phone) {
  const sh = sheet_(ORDERS), row = findRow_(sh, oid);
  if (!row) return { ok: false, error: 'Order not found.' };
  const o = rowToOrder_(sh.getRange(row, 1, 1, O_HEAD.length).getValues()[0]);
  if (o.addr.phone !== String(phone || '')) return { ok: false, error: 'Order not found.' };
  delete o.deducted;
  return { ok: true, order: o };
}
function listOrders_() {
  const sh = sheet_(ORDERS), n = sh.getLastRow() - 1;
  if (n < 1) return [];
  return sh.getRange(2, 1, n, O_HEAD.length).getValues().filter(r => String(r[0]).trim()).map(rowToOrder_).reverse().slice(0, 1000);
}
/** Confirmed/Shipped/Delivered take stock out once; Cancelled puts it back if it had been taken. */
function setStatus_(oid, status) {
  if (STATUSES.indexOf(status) < 0) throw new Error('Unknown status.');
  return withLock_(() => {
    const os = sheet_(ORDERS), row = findRow_(os, oid);
    if (!row) throw new Error('Order not found.');
    const o = rowToOrder_(os.getRange(row, 1, 1, O_HEAD.length).getValues()[0]);
    const take = ['Confirmed', 'Shipped', 'Delivered'].indexOf(status) >= 0 && !o.deducted;
    const giveBack = status === 'Cancelled' && o.deducted;
    if (take || giveBack) {
      const ps = sheet_(PRODUCTS);
      o.items.forEach(it => {
        const r = findRow_(ps, it.id);
        if (!r) return;
        const cell = ps.getRange(r, 8), s = parseStock_(cell.getValue());
        s[it.size] = Math.max(0, (s[it.size] || 0) + (take ? -it.qty : it.qty));
        cell.setValue(stockText_(s));
      });
    }
    os.getRange(row, 3).setValue(status);
    if (take) os.getRange(row, 15).setValue(true);
    if (giveBack) os.getRange(row, 15).setValue(false);
    return { ok: true, status: status, deducted: take ? true : giveBack ? false : o.deducted, changedStock: take || giveBack };
  });
}

;return function (__n) { return eval(__n); };
};
