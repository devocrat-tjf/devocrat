/* HMScrat — website demo set-up.
   First visit: run the hospital script's own setup (License tab + the sample hospital), and mark the
   licence as a long-running website demo so it never locks. Everything stays on this device.
   Staff password for every desk: demo123 · patients: mobile 9876501001–9876501007 (code shown on screen). */
DevoGAS.install({
  url: 'https://script.google.com/macros/s/DEVOCRAT-WEBSITE-DEMO-hospital/exec',
  key: 'devo-demo-hospital',
  alsoClear: ['dmh_token', 'dmh_api'],
  name: 'HMScrat — demo',
  badge: { text: 'staff password <b>demo123</b>', side: 'center' },
  seed({ fn }) {
    fn('setup')();
    const setLic = fn('setLic_'), until = new Date(Date.now() + 3650 * 864e5);
    setLic('licensed to', 'DEVOCRAT website demo');
    setLic('plan', 'Demo');
    setLic('expiry date', until);
    setLic('status', 'Active');
  },
});
