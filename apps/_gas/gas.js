/* ==========================================================================
   DevoGAS — runs an app's own Google Apps Script (Code.gs) inside the browser
   for the DEVOCRAT website demos.

   The app still talks to "its Google Script" exactly as in production, but the
   requests are answered here, by the same Code.gs, working on a pretend
   spreadsheet that is saved in the visitor's browser (localStorage).
   Nothing is sent to Google, and every visitor gets their own private copy.

   Use (in the demo copy of an app, before the app's own scripts):
     <script src="../_gas/gas.js"></script>
     <script src="backend.js"></script>          // Code.gs wrapped by the build step
     <script>DevoGAS.install({ url, key, seed, badge })</script>
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------ bytes, SHA-256, HMAC, base64 */
  const enc = new TextEncoder(), dec = new TextDecoder();
  const toU8 = v => v instanceof Uint8Array ? v : Array.isArray(v) ? Uint8Array.from(v, b => b & 255) : enc.encode(String(v == null ? '' : v));
  const signed = u8 => Array.from(u8, b => (b > 127 ? b - 256 : b));   // Apps Script returns Java (signed) bytes

  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]);
  function sha256(data) {
    const m = toU8(data), l = m.length, n = ((l + 9 + 63) >> 6) << 6, b = new Uint8Array(n);
    b.set(m); b[l] = 0x80; const bits = l * 8, dv = new DataView(b.buffer);
    dv.setUint32(n - 8, Math.floor(bits / 2 ** 32)); dv.setUint32(n - 4, bits >>> 0);
    const H = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]), W = new Uint32Array(64);
    const r = (x, k) => (x >>> k) | (x << (32 - k));
    for (let o = 0; o < n; o += 64) {
      for (let i = 0; i < 16; i++) W[i] = dv.getUint32(o + i * 4);
      for (let i = 16; i < 64; i++) { const s0 = r(W[i - 15], 7) ^ r(W[i - 15], 18) ^ (W[i - 15] >>> 3), s1 = r(W[i - 2], 17) ^ r(W[i - 2], 19) ^ (W[i - 2] >>> 10); W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0; }
      let [a, bb, c, d, e, f, g, h] = H;
      for (let i = 0; i < 64; i++) {
        const t1 = (h + (r(e, 6) ^ r(e, 11) ^ r(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + W[i]) >>> 0, t2 = ((r(a, 2) ^ r(a, 13) ^ r(a, 22)) + ((a & bb) ^ (a & c) ^ (bb & c))) >>> 0;
        h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = bb; bb = a; a = (t1 + t2) >>> 0;
      }
      H[0] += a; H[1] += bb; H[2] += c; H[3] += d; H[4] += e; H[5] += f; H[6] += g; H[7] += h;
    }
    const out = new Uint8Array(32), ov = new DataView(out.buffer); H.forEach((v, i) => ov.setUint32(i * 4, v)); return out;
  }
  function hmac256(value, key) {
    let k = toU8(key); if (k.length > 64) k = sha256(k);
    const kp = new Uint8Array(64); kp.set(k);
    const ip = kp.map(x => x ^ 0x36), op = kp.map(x => x ^ 0x5c), v = toU8(value);
    const inner = new Uint8Array(64 + v.length); inner.set(ip); inner.set(v, 64);
    const outer = new Uint8Array(64 + 32); outer.set(op); outer.set(sha256(inner), 64);
    return sha256(outer);
  }
  const b64 = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
  const unb64 = s => { const bin = atob(String(s).replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '')); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; };
  const webSafe = s => s.replace(/\+/g, '-').replace(/\//g, '_');

  /* ------------------------------------------------------------ "anything goes" stand-ins */
  // Formatting calls (setBackground, setFontWeight, menus, validation builders…) don't matter in a demo:
  // any method we don't implement simply returns the object again, so call chains keep working.
  function loose(target) {
    return new Proxy(target, {
      get(t, p, recv) {
        if (p in t) return t[p];
        if (typeof p === 'symbol' || p === 'then' || p === 'toJSON') return undefined;
        return function () { return recv; };
      },
    });
  }

  /* ------------------------------------------------------------ dates */
  const TZ = 'Asia/Kolkata';
  function formatDate(date, tz, pattern) {
    const d = date instanceof Date ? date : new Date(date);
    let zone = tz || TZ;
    const m = /^(?:GMT|UTC)([+-])(\d{1,2}):?(\d{2})?$/.exec(zone);
    let parts;
    if (m) {
      const off = (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] || 0));
      const s = new Date(d.getTime() + off * 60000);
      parts = { y: s.getUTCFullYear(), M: s.getUTCMonth() + 1, d: s.getUTCDate(), H: s.getUTCHours(), m: s.getUTCMinutes(), s: s.getUTCSeconds(), w: s.getUTCDay() };
    } else {
      try {
        const f = new Intl.DateTimeFormat('en-US', { timeZone: zone, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', weekday: 'short', hourCycle: 'h23' });
        const o = {}; f.formatToParts(d).forEach(x => { o[x.type] = x.value; });
        parts = { y: +o.year, M: +o.month, d: +o.day, H: +o.hour % 24, m: +o.minute, s: +o.second, w: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday) };
      } catch (e) { zone = TZ; return formatDate(d, TZ, pattern); }
    }
    const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const p2 = v => String(v).padStart(2, '0'), h12 = parts.H % 12 || 12;
    return String(pattern).replace(/'([^']*)'|yyyy|yy|MMMM|MMM|MM|M|dd|d|EEEE|EEE|E|HH|H|hh|h|mm|m|ss|s|SSS|a|Z|XXX/g, (t, lit) => {
      if (lit !== undefined) return lit;
      switch (t) {
        case 'yyyy': return String(parts.y); case 'yy': return String(parts.y).slice(-2);
        case 'MMMM': return MON[parts.M - 1]; case 'MMM': return MON[parts.M - 1].slice(0, 3); case 'MM': return p2(parts.M); case 'M': return String(parts.M);
        case 'dd': return p2(parts.d); case 'd': return String(parts.d);
        case 'EEEE': return DAY[parts.w]; case 'EEE': case 'E': return DAY[parts.w].slice(0, 3);
        case 'HH': return p2(parts.H); case 'H': return String(parts.H); case 'hh': return p2(h12); case 'h': return String(h12);
        case 'mm': return p2(parts.m); case 'm': return String(parts.m); case 'ss': return p2(parts.s); case 's': return String(parts.s);
        case 'SSS': return '000'; case 'a': return parts.H < 12 ? 'AM' : 'PM'; case 'Z': return '+0530'; case 'XXX': return '+05:30';
      }
      return t;
    });
  }

  /* ------------------------------------------------------------ state (the pretend spreadsheet, settings, files) */
  let S = null, cfg = null;
  const pack = v => v instanceof Date ? { __d: v.getTime() } : v;
  const unpack = v => (v && typeof v === 'object' && '__d' in v) ? new Date(v.__d) : v;
  function emptyState() { return { sheets: [], props: {}, files: {}, folders: {}, seq: 1 }; }
  function load() {
    try {
      const raw = localStorage.getItem(cfg.key);
      if (!raw) return null;
      const s = JSON.parse(raw);
      s.sheets.forEach(sh => { sh.rows = sh.rows.map(r => r.map(unpack)); });
      return s;
    } catch (e) { console.warn('[demo] could not read saved data', e); return null; }
  }
  function save() {
    try {
      const out = Object.assign({}, S, { sheets: S.sheets.map(sh => Object.assign({}, sh, { rows: sh.rows.map(r => r.map(pack)) })) });
      localStorage.setItem(cfg.key, JSON.stringify(out));
    } catch (e) { console.warn('[demo] could not save (browser storage full?)', e); }
  }
  const newId = p => (p || 'id') + '_' + (S.seq++).toString(36) + Math.random().toString(36).slice(2, 8);

  /* ------------------------------------------------------------ SpreadsheetApp */
  const colNum = s => { let n = 0; for (const ch of s.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64); return n; };
  const colName = n => { let s = ''; while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; };
  const blank = v => v === '' || v == null;

  function cleanIn(v) {
    if (typeof v === 'string' && v.charAt(0) === "'") return v.slice(1);     // a leading ' forces text in Sheets and isn't stored
    if (v === undefined || v === null) return '';
    return v;
  }
  const cleanOut = v => (v instanceof Date ? new Date(v.getTime()) : v);

  function makeSheet(data) {
    const lastRow = () => { let n = data.rows.length; while (n > 0 && (data.rows[n - 1] || []).every(blank)) n--; return n; };
    const lastCol = () => data.rows.reduce((m, r) => { r = r || []; let n = r.length; while (n > 0 && blank(r[n - 1])) n--; return Math.max(m, n); }, 0);
    const cell = (r, c) => { const row = data.rows[r - 1]; return row && c - 1 < row.length ? row[c - 1] : ''; };
    const put = (r, c, v) => { while (data.rows.length < r) data.rows.push([]); const row = data.rows[r - 1]; while (row.length < c) row.push(''); row[c - 1] = cleanIn(v); };

    function range(r1, c1, nr, nc) {
      nr = Math.max(1, nr || 1); nc = Math.max(1, nc || 1);
      const rg = {
        getRow: () => r1, getColumn: () => c1, getNumRows: () => nr, getNumColumns: () => nc, getLastRow: () => r1 + nr - 1, getLastColumn: () => c1 + nc - 1,
        getSheet: () => sheet, getA1Notation: () => colName(c1) + r1 + (nr > 1 || nc > 1 ? ':' + colName(c1 + nc - 1) + (r1 + nr - 1) : ''),
        getValues() { const out = []; for (let i = 0; i < nr; i++) { const row = []; for (let j = 0; j < nc; j++) row.push(cleanOut(cell(r1 + i, c1 + j))); out.push(row); } return out; },
        getDisplayValues() { return rg.getValues().map(r => r.map(v => v instanceof Date ? formatDate(v, TZ, 'M/d/yyyy H:mm:ss') : String(v))); },
        getValue: () => cleanOut(cell(r1, c1)), getDisplayValue: () => String(cell(r1, c1)),
        setValues(vals) { for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) put(r1 + i, c1 + j, vals[i] ? vals[i][j] : ''); return proxy; },
        setValue(v) { for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) put(r1 + i, c1 + j, v); return proxy; },
        setFormula(f) { return rg.setValue(f); },
        clearContent() { for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) if (data.rows[r1 + i - 1]) put(r1 + i, c1 + j, ''); return proxy; },
        clearContents() { return rg.clearContent(); }, clear() { return rg.clearContent(); },
        createTextFinder(text) {
          let whole = false, caseOn = false, done = false;
          const hits = () => { const out = []; const want = String(text); for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) {
            let v = cell(r1 + i, c1 + j); if (blank(v)) continue; v = String(v);
            const a = caseOn ? v : v.toLowerCase(), b = caseOn ? want : want.toLowerCase();
            if (whole ? a === b : a.indexOf(b) >= 0) out.push(range(r1 + i, c1 + j, 1, 1));
          } return out; };
          const tf = { matchEntireCell(x) { whole = x !== false; return tf; }, matchCase(x) { caseOn = x !== false; return tf; }, useRegularExpression() { return tf; }, ignoreDiacritics() { return tf; },
            findNext() { if (done) return null; done = true; return hits()[0] || null; }, findAll: () => hits() };
          return tf;
        },
      };
      const proxy = loose(rg);
      return proxy;
    }
    function a1(ref) {
      const m = /^([A-Z]+)?(\d+)?(?::([A-Z]+)?(\d+)?)?$/i.exec(String(ref).replace(/\$/g, '').replace(/^.*!/, ''));
      if (!m) throw new Error('Demo: range "' + ref + '" is not supported');
      const c1 = m[1] ? colNum(m[1]) : 1, r1 = m[2] ? Number(m[2]) : 1;
      const c2 = m[3] ? colNum(m[3]) : (m[1] && !m[2] ? c1 : (m[3] === undefined && m[4] === undefined ? c1 : Math.max(lastCol(), c1)));
      const r2 = m[4] ? Number(m[4]) : (m[2] && m[3] === undefined && m[4] === undefined ? r1 : Math.max(lastRow(), r1));
      return range(r1, c1, r2 - r1 + 1, c2 - c1 + 1);
    }
    const sh = {
      getName: () => data.name, setName(n) { data.name = n; return sheet; }, getSheetName: () => data.name, getSheetId: () => data.id,
      getLastRow: lastRow, getLastColumn: lastCol, getMaxRows: () => Math.max(1000, data.rows.length), getMaxColumns: () => Math.max(26, lastCol()),
      getRange(a, b, c, d) { return typeof a === 'string' ? a1(a) : range(a, b, c, d); },
      getDataRange: () => range(1, 1, Math.max(1, lastRow()), Math.max(1, lastCol())),
      appendRow(vals) { const r = lastRow() + 1; if (!vals.length) put(r, 1, ''); vals.forEach((v, i) => put(r, i + 1, v)); return sheet; },
      deleteRow(r) { data.rows.splice(r - 1, 1); return sheet; },
      deleteRows(r, n) { data.rows.splice(r - 1, n || 1); return sheet; },
      insertRowBefore(r) { data.rows.splice(r - 1, 0, []); return sheet; }, insertRowAfter(r) { data.rows.splice(r, 0, []); return sheet; },
      insertRowsBefore(r, n) { for (let i = 0; i < n; i++) data.rows.splice(r - 1, 0, []); return sheet; },
      clear() { data.rows = []; return sheet; }, clearContents() { data.rows = []; return sheet; },
      hideSheet() { data.hidden = true; return sheet; }, showSheet() { data.hidden = false; return sheet; }, isSheetHidden: () => !!data.hidden,
      getFrozenRows: () => data.frozen || 0, setFrozenRows(n) { data.frozen = n; return sheet; },
      getParent: () => ss, activate: () => sheet, getConditionalFormatRules: () => [], getDataValidations: () => [],
    };
    const sheet = loose(sh);
    return sheet;
  }
  const sheetCache = new Map();
  const sheetObj = d => { let o = sheetCache.get(d); if (!o) { o = makeSheet(d); sheetCache.set(d, o); } return o; };
  const ssBase = {
    getSheetByName: n => { const d = S.sheets.find(s => s.name === n); return d ? sheetObj(d) : null; },
    getSheets: () => S.sheets.map(sheetObj),
    insertSheet(name, idx) {
      if (typeof name === 'number') { idx = name; name = null; }
      name = name || 'Sheet' + (S.sheets.length + 1);
      if (S.sheets.some(s => s.name === name)) throw new Error('A sheet with the name "' + name + '" already exists.');
      const d = { name, id: S.seq++, rows: [] };
      if (typeof idx === 'number') S.sheets.splice(idx, 0, d); else S.sheets.push(d);
      return sheetObj(d);
    },
    deleteSheet(sh) { const n = sh.getName(); S.sheets = S.sheets.filter(s => s.name !== n); },
    getActiveSheet: () => sheetObj(S.sheets[0] || ssBase.insertSheet('Sheet1')),
    setActiveSheet: s => s, getUrl: () => '', getId: () => 'demo-spreadsheet',   // no real sheet to open in the demo
    getName: () => (cfg && cfg.name) || 'Demo sheet', getSpreadsheetTimeZone: () => TZ, toast() {},
  };
  const ss = loose(ssBase);
  const ui = loose({
    alert: () => 'OK', prompt: () => loose({ getSelectedButton: () => 'CANCEL', getResponseText: () => '' }),
    Button: { OK: 'OK', CANCEL: 'CANCEL', YES: 'YES', NO: 'NO', CLOSE: 'CLOSE' },
    ButtonSet: { OK: 'OK', OK_CANCEL: 'OK_CANCEL', YES_NO: 'YES_NO', YES_NO_CANCEL: 'YES_NO_CANCEL' },
  });
  const SpreadsheetApp = loose({ getActive: () => ss, getActiveSpreadsheet: () => ss, openById: () => ss, openByUrl: () => ss, getUi: () => ui, flush() {} });

  /* ------------------------------------------------------------ Properties, Cache, Lock */
  const props = loose({
    getProperty: k => (k in S.props ? S.props[k] : null), setProperty(k, v) { S.props[k] = String(v); return props; },
    getProperties: () => Object.assign({}, S.props), setProperties(o, wipe) { if (wipe) S.props = {}; Object.keys(o || {}).forEach(k => { S.props[k] = String(o[k]); }); return props; },
    deleteProperty(k) { delete S.props[k]; return props; }, deleteAllProperties() { S.props = {}; return props; }, getKeys: () => Object.keys(S.props),
  });
  const PropertiesService = loose({ getScriptProperties: () => props, getUserProperties: () => props, getDocumentProperties: () => props });
  const mem = new Map();
  const cache = loose({
    get(k) { const e = mem.get(k); if (!e) return null; if (e.t < Date.now()) { mem.delete(k); return null; } return e.v; },
    put(k, v, sec) { mem.set(k, { v: String(v), t: Date.now() + (sec || 600) * 1000 }); },
    putAll(o, sec) { Object.keys(o || {}).forEach(k => cache.put(k, o[k], sec)); },
    getAll(keys) { const o = {}; (keys || []).forEach(k => { const v = cache.get(k); if (v !== null) o[k] = v; }); return o; },
    remove(k) { mem.delete(k); }, removeAll(keys) { (keys || []).forEach(k => mem.delete(k)); },
  });
  const CacheService = loose({ getScriptCache: () => cache, getUserCache: () => cache, getDocumentCache: () => cache });
  const lock = loose({ waitLock() {}, tryLock: () => true, releaseLock() {}, hasLock: () => true });
  const LockService = loose({ getScriptLock: () => lock, getUserLock: () => lock, getDocumentLock: () => lock });

  /* ------------------------------------------------------------ Utilities */
  function blob(bytes, type, name) {
    let u8 = toU8(bytes == null ? '' : bytes), ct = type || 'application/octet-stream', nm = name || 'file';
    const bl = loose({
      getBytes: () => signed(u8), getDataAsString: () => dec.decode(u8), getContentType: () => ct, getName: () => nm,
      setName(n) { nm = n; return bl; }, setContentType(t) { ct = t; return bl; }, setBytes(b) { u8 = toU8(b); return bl; }, copyBlob: () => blob(u8, ct, nm),
      getAs: () => bl, isGoogleType: () => false, _u8: () => u8,
    });
    return bl;
  }
  const Utilities = loose({
    getUuid: () => (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); })),
    sleep() {}, formatDate,
    formatString(fmt) { const a = [].slice.call(arguments, 1); let i = 0; return String(fmt).replace(/%[sd]/g, () => String(a[i++])); },
    computeDigest: (alg, v) => signed(sha256(v)),
    computeHmacSha256Signature: (v, k) => signed(hmac256(v, k)),
    computeHmacSignature: (alg, v, k) => signed(hmac256(v, k)),
    computeRsaSha256Signature() { throw new Error('This feature is not available in the website demo.'); },
    base64Encode: v => b64(toU8(v)), base64EncodeWebSafe: v => webSafe(b64(toU8(v))),
    base64Decode: s => signed(unb64(s)), base64DecodeWebSafe: s => signed(unb64(s)),
    newBlob: (b, t, n) => blob(b, t, n),
    parseCsv: s => String(s).split(/\r?\n/).filter(Boolean).map(l => l.split(',')),
    jsonStringify: o => JSON.stringify(o), jsonParse: s => JSON.parse(s),
    DigestAlgorithm: { SHA_256: 'SHA_256', SHA_1: 'SHA_1', MD5: 'MD5', SHA_512: 'SHA_512' },
    MacAlgorithm: { HMAC_SHA_256: 'HMAC_SHA_256' }, Charset: { UTF_8: 'UTF_8', US_ASCII: 'US_ASCII' },
  });

  /* ------------------------------------------------------------ ContentService, HtmlService, Session, Logger */
  const textOut = s => { let c = String(s == null ? '' : s), mime = 'text/plain'; const o = loose({ getContent: () => c, setContent(v) { c = String(v); return o; }, append(v) { c += v; return o; }, setMimeType(m) { mime = m; return o; }, getMimeType: () => mime }); return o; };
  const ContentService = loose({ createTextOutput: textOut, MimeType: { JSON: 'application/json', TEXT: 'text/plain', JAVASCRIPT: 'application/javascript', CSV: 'text/csv', XML: 'text/xml' } });
  const HtmlService = loose({ createHtmlOutput: textOut, createTemplate: s => loose({ evaluate: () => textOut(s) }), XFrameOptionsMode: { ALLOWALL: 'ALLOWALL', DEFAULT: 'DEFAULT' } });
  const user = loose({ getEmail: () => 'demo@devocrat.in' });
  const Session = loose({ getScriptTimeZone: () => TZ, getActiveUser: () => user, getEffectiveUser: () => user, getTemporaryActiveUserKey: () => 'demo' });
  const Logger = loose({ log() { console.log.apply(console, ['[demo script]'].concat([].slice.call(arguments))); } });

  /* ------------------------------------------------------------ DriveApp (uploaded photos and files) */
  function fileObj(id) {
    const f = S.files[id]; if (!f) throw new Error('File not found.');
    const o = loose({
      getId: () => id, getName: () => f.name, setName(n) { f.name = n; return o; }, getMimeType: () => f.mime, getSize: () => Math.floor(f.b64.length * 0.75),
      getBlob: () => blob(unb64(f.b64), f.mime, f.name), getAs: () => blob(unb64(f.b64), f.mime, f.name),
      getUrl: () => dataUrl(id), getDownloadUrl: () => dataUrl(id), setTrashed(t) { if (t) delete S.files[id]; return o; }, isTrashed: () => !S.files[id],
      getDateCreated: () => new Date(f.at || Date.now()), getLastUpdated: () => new Date(f.at || Date.now()),
    });
    return o;
  }
  const dataUrl = id => { const f = S.files[id]; return f ? 'data:' + f.mime + ';base64,' + f.b64 : ''; };
  function folderObj(id) {
    const o = loose({
      getId: () => id, getName: () => S.folders[id],
      createFile(b, content, mime) {
        const bl = typeof b === 'string' ? blob(content, mime, b) : b, fid = newId('file');
        S.files[fid] = { name: bl.getName(), mime: bl.getContentType(), b64: b64(bl._u8 ? bl._u8() : toU8(bl.getBytes())), folder: id, at: Date.now() };
        return fileObj(fid);
      },
      createFolder: n => driveCreateFolder(n),
      getFilesByName: n => iter(Object.keys(S.files).filter(k => S.files[k].folder === id && S.files[k].name === n).map(fileObj)),
      getFiles: () => iter(Object.keys(S.files).filter(k => S.files[k].folder === id).map(fileObj)),
    });
    return o;
  }
  const iter = list => { let i = 0; return loose({ hasNext: () => i < list.length, next: () => list[i++] }); };
  function driveCreateFolder(name) { const id = newId('folder'); S.folders[id] = name; return folderObj(id); }
  const DriveApp = loose({
    createFolder: driveCreateFolder,
    getFolderById: id => { if (!(id in S.folders)) throw new Error('Folder not found.'); return folderObj(id); },
    getFoldersByName: n => iter(Object.keys(S.folders).filter(k => S.folders[k] === n).map(folderObj)),
    getFileById: fileObj, getRootFolder: () => folderObj(Object.keys(S.folders)[0] || driveCreateFolder('My Drive').getId()),
    createFile(b) { return DriveApp.getRootFolder().createFile(b); },
    Access: { ANYONE: 'ANYONE', ANYONE_WITH_LINK: 'ANYONE_WITH_LINK', PRIVATE: 'PRIVATE', DOMAIN: 'DOMAIN' },
    Permission: { VIEW: 'VIEW', EDIT: 'EDIT', COMMENT: 'COMMENT', NONE: 'NONE' },
  });

  /* ------------------------------------------------------------ services that need the internet: not in the demo */
  const offline = name => loose({ fetch() { throw new Error(name + ' is not available in the website demo.'); }, fetchAll() { throw new Error(name + ' is not available in the website demo.'); } });
  const UrlFetchApp = offline('Connecting to other services');
  const MailApp = loose({ sendEmail() {}, getRemainingDailyQuota: () => 100 });
  const ScriptApp = loose({ getOAuthToken: () => 'demo-token', getService: () => loose({ getUrl: () => location.href }), newTrigger: () => loose({}), getProjectTriggers: () => [] });

  const SERVICES = { SpreadsheetApp, PropertiesService, CacheService, LockService, Utilities, ContentService, HtmlService, DriveApp, Session, MailApp, GmailApp: MailApp, UrlFetchApp, ScriptApp, Logger };

  /* ------------------------------------------------------------ running the script */
  let backend = null;
  function boot() {
    const make = window.__GAS_BACKEND;
    if (typeof make !== 'function') throw new Error('Demo: backend.js (the wrapped Code.gs) is missing.');
    backend = make(SpreadsheetApp, PropertiesService, CacheService, LockService, Utilities, ContentService, HtmlService, DriveApp, Session, MailApp, MailApp, UrlFetchApp, ScriptApp, Logger);
  }
  const fn = name => { try { return backend(name); } catch (e) { return undefined; } };

  // Drive photo links point at Google; in the demo they are swapped for the saved image itself.
  function rewriteLinks(text) {
    if (!text || !S.files || !Object.keys(S.files).length) return text;
    return text.replace(/https:\/\/(?:lh3\.googleusercontent\.com\/d\/|drive\.google\.com\/(?:uc|thumbnail|file\/d\/)[^"'\s]*?(?:[?&]id=)?)([A-Za-z0-9_-]+)[^"'\s\\]*/g,
      (all, id) => (S.files[id] ? dataUrl(id) : all));
  }

  function run(method, url, body, type) {
    S = load() || S;                                  // another frame (desktop/phone) may have saved changes
    sheetCache.clear();
    const u = new URL(url, location.href), parameter = {}, parameters = {};
    u.searchParams.forEach((v, k) => { if (!(k in parameter)) parameter[k] = v; (parameters[k] = parameters[k] || []).push(v); });
    const e = { parameter, parameters, queryString: u.search.slice(1), contextPath: '', contentLength: body ? body.length : -1 };
    if (method === 'POST') e.postData = { contents: body || '', type: type || 'text/plain', length: (body || '').length, name: 'postData' };
    const handler = fn(method === 'POST' ? 'doPost' : 'doGet');
    if (typeof handler !== 'function') throw new Error('Demo: the script has no ' + (method === 'POST' ? 'doPost' : 'doGet'));
    let out;
    try { out = handler(e); } finally { save(); }
    const text = out && typeof out.getContent === 'function' ? out.getContent() : String(out == null ? '' : out);
    return rewriteLinks(text);
  }

  async function readBody(input, init) {
    if (init && init.body != null) {
      const b = init.body;
      if (typeof b === 'string') return b;
      if (b instanceof URLSearchParams) return b.toString();
      if (b instanceof Blob) return await b.text();
      if (b instanceof FormData) { const p = new URLSearchParams(); b.forEach((v, k) => p.append(k, v)); return p.toString(); }
      return String(b);
    }
    if (input instanceof Request) return await input.clone().text();
    return '';
  }

  let ready = null;
  function install(options) {
    cfg = Object.assign({ delay: 220 }, options);
    boot();
    const fresh = !load();
    S = load() || emptyState();
    ready = (async () => {
      if (fresh && cfg.seed) {
        await cfg.seed({ fn, ss, props: PropertiesService.getScriptProperties(), state: S, run: name => fn(name)() });
        save();
      }
    })().catch(e => console.error('[demo] could not prepare the sample data', e));

    const realFetch = window.fetch.bind(window);
    window.fetch = async function (input, init) {
      const url = typeof input === 'string' ? input : (input && input.url) || String(input);
      if (url.indexOf(cfg.url) !== 0) return realFetch(input, init);
      await ready;
      const method = String((init && init.method) || (input instanceof Request ? input.method : 'GET')).toUpperCase();
      const body = method === 'POST' ? await readBody(input, init) : '';
      const type = init && init.headers ? (new Headers(init.headers).get('Content-Type') || '') : '';
      await new Promise(r => setTimeout(r, cfg.delay * (0.6 + Math.random() * 0.8)));   // feels like a real server
      try {
        const text = run(method, url, body, type);
        return new Response(text, { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
      } catch (err) {
        console.error('[demo script]', err);
        return new Response(JSON.stringify({ ok: false, error: String((err && err.message) || err) }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
    };
    if (cfg.badge !== false) addBadge(cfg.badge || {});
    return ready;
  }

  function reset() { try { localStorage.removeItem(cfg.key); (cfg.alsoClear || []).forEach(k => localStorage.removeItem(k)); } catch (e) {} location.reload(); }

  function addBadge(b) {
    const put = () => {
      const el = document.createElement('div');
      el.className = 'devo-demo-tag'; el.setAttribute('role', 'note');
      el.innerHTML = '<span>Demo · sample data' + (b.text ? ' · ' + b.text : '') + '</span><button type="button" title="Start again with fresh sample data">Reset</button>';
      el.querySelector('button').addEventListener('click', () => { if (confirm('Start the demo again with fresh sample data?')) reset(); });
      const st = document.createElement('style');
      const where = b.side === 'center' ? 'left:50%;transform:translateX(-50%)' : (b.side === 'right' ? 'right' : 'left') + ':8px';
      st.textContent = '.devo-demo-tag{position:fixed;' + where + ';bottom:8px;z-index:2147483000;display:flex;align-items:center;gap:8px;padding:4px 4px 4px 10px;border-radius:999px;background:#1f2937e6;color:#fff;font:600 11px/1.2 system-ui,sans-serif;letter-spacing:.02em;box-shadow:0 2px 8px #0003}.devo-demo-tag b{font-weight:800}.devo-demo-tag button{all:unset;cursor:pointer;padding:3px 9px;border-radius:999px;background:#ffffff26;font-weight:700}.devo-demo-tag button:hover{background:#ffffff40}';
      document.head.appendChild(st); document.body.appendChild(el);
    };
    if (document.body) put(); else document.addEventListener('DOMContentLoaded', put);
  }

  window.DevoGAS = { install, reset, formatDate, sha256, hmac256, get ready() { return ready; }, fn: n => fn(n), save: () => save() };
})();
