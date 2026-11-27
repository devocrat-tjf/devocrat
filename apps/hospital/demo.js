/* HMScrat — website demo set-up.
   First visit: run the hospital script's own setup (License tab + the sample hospital), and mark the
   licence as a long-running website demo so it never locks. Everything stays on this device.
   Staff password for every desk: demo123 · patients: mobile 9876501001–9876501007 (code shown on screen). */
DevoGAS.install({
  url: 'https://script.google.com/macros/s/DEVOCRAT-WEBSITE-DEMO-hospital/exec',
  key: 'devo-demo-hospital',
  alsoClear: ['dmh_token', 'dmh_api'],
  name: 'HMScrat — demo',
  badge: { text: 'no password needed · tap a desk', side: 'center' },
  seed({ fn }) {
    fn('setup')();
    const setLic = fn('setLic_'), until = new Date(Date.now() + 3650 * 864e5);
    setLic('licensed to', 'DEVOCRAT website demo');
    setLic('plan', 'Demo');
    setLic('expiry date', until);
    setLic('status', 'Active');
  },
});

/* Website demo: no passwords. Tapping a staff desk signs straight in (the demo login is filled for it),
   and a patient's on-screen login code fills itself in. */
(function () {
  document.addEventListener('click', e => {
    if (!e.target.closest('[data-a=desk]')) return;
    setTimeout(() => { const f = document.querySelector('form[data-f=login]'); if (f && f.uid.value) { f.pw.value = 'demo123'; f.requestSubmit(); } }, 80);
  }, true);
  new MutationObserver(() => {
    document.querySelectorAll('.demo').forEach(d => { if (/password demo123/.test(d.textContent)) d.textContent = 'Demo: tap a desk to go straight in, no password needed'; });
    const f = document.querySelector('form[data-f=otp2]');
    if (f && !f.dataset.auto) { const m = f.textContent.match(/code is (\d{6})/); if (m) { f.dataset.auto = '1'; f.otp.value = m[1]; setTimeout(() => f.requestSubmit(), 250); } }
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
