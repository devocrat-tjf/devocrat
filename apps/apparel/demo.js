/* E-COMcrat — website demo set-up.
   First visit: create the Products and Orders tabs (the script's own setup), load the 1,000 sample
   products, set the admin password and add a few sample orders. Everything stays on this device. */
DevoGAS.install({
  url: 'https://script.google.com/macros/s/DEVOCRAT-WEBSITE-DEMO-apparel/exec',
  key: 'devo-demo-apparel',
  alsoClear: ['devo-cart', 'devo-wish', 'devo-orders', 'devo-tok', 'devo-sheet'],
  name: 'E-COMcrat — demo',
  badge: { text: 'demo · no password needed' },
  async seed({ fn, ss, props }) {
    fn('setup')();
    props.setProperty('ADMIN_PASSWORD', 'demo1234');
    const products = await (await fetch('products.json')).json();
    const toRow = fn('productToRow_'), sheet = ss.getSheetByName('Products');
    sheet.getRange(2, 1, products.length, toRow(products[0]).length).setValues(products.map(toRow));

    // a few orders, so the admin panel has something to manage
    const inStock = products.filter(p => !p.hidden && Object.keys(p.s).some(k => p.s[k] > 2));
    const pick = i => { const p = inStock[i * 37 % inStock.length]; const size = Object.keys(p.s).find(k => p.s[k] > 2); return { id: p.id, size, qty: 1 + (i % 2) }; };
    const people = [
      ['Priya Raman', '9840012345', '12, 2nd Cross Street, T. Nagar', 'Chennai', 'Tamil Nadu', '600017', 'Delivered'],
      ['Arjun Mehta', '9811122334', '45 MG Road, Indiranagar', 'Bengaluru', 'Karnataka', '560038', 'Shipped'],
      ['Fathima Noor', '9746655443', '7 Marine Drive, Ernakulam', 'Kochi', 'Kerala', '682031', 'Confirmed'],
      ['Rahul Verma', '9988776655', '18 Lajpat Nagar II', 'New Delhi', 'Delhi', '110024', 'Placed'],
    ];
    const place = fn('placeOrder_'), setStatus = fn('setStatus_');
    people.forEach((x, i) => {
      const r = place({ addr: { name: x[0], phone: x[1], line: x[2], city: x[3], state: x[4], pin: x[5] }, items: [pick(i * 2), pick(i * 2 + 1)] });
      if (x[6] !== 'Placed') setStatus(r.order.oid, x[6]);
    });
  },
});

/* Website demo: no password. When the store admin sign-in appears, it signs itself in. */
new MutationObserver(() => {
  const f = document.getElementById('lgf');
  if (!f || f.dataset.auto) return;
  f.dataset.auto = '1'; f.password.value = 'demo1234';
  f.style.visibility = 'hidden';
  const n = f.parentElement.querySelector('.note'); if (n) n.textContent = 'Opening the store admin (demo, no password needed)…';
  setTimeout(() => f.requestSubmit(), 150);
}).observe(document.documentElement, { childList: true, subtree: true });
