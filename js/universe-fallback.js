/* Plain world buttons when the 3D universe cannot start. */
/* If the 3D engine can't load (offline / blocked CDN), offer the worlds as plain buttons. */
const PLANET_ACCENT={modern:'#8f86f0',elegant:'#c9a24a',hospital:'#0b95a6',salon:'#d98aa8',illus:'#e76f51',mandala:'#f2a516',interior:'#b08560',arch:'#8bbcff',funny:'#ff5d8f',kids:'#ffb347',auto:'#e10600',future:'#00e5ff'};
function showUniverseFallback(){
 if(window.devocratUniverseReady)return;document.getElementById('uniLoading')?.remove();const fb=document.getElementById('uniFallback');if(!fb||!fb.hidden)return;
 const grid=document.getElementById('fbGrid');
 WORLDS.forEach(w=>{const b=document.createElement('button');b.style.setProperty('--pc',PLANET_ACCENT[w.id]);b.textContent=w.name;b.addEventListener('click',e=>openWorld(w.id,e));grid.appendChild(b)});
 document.querySelector('#universe .intro')?.remove();fb.hidden=false;
}
// any failure of the 3D universe before it draws its first frame (no WebGL, old browser, blocked CDN) → plain world buttons.
// Only errors from the universe / three.js count, so a problem elsewhere on the page can't switch it off.
const uniError=src=>!src||/universe|three|jsdelivr|es-module-shims/i.test(src);
addEventListener('error',e=>{if(!window.devocratUniverseReady&&uniError(e.filename))showUniverseFallback()});
addEventListener('unhandledrejection',e=>{const s=(e.reason&&e.reason.stack)||'';if(!window.devocratUniverseReady&&uniError(s))showUniverseFallback()});
// Give up after 15s without a first frame — but not while the tab is in the background, where browsers pause drawing.
function fallbackIfStuck(){
 if(window.devocratUniverseReady)return;
 if(document.hidden){document.addEventListener('visibilitychange',()=>setTimeout(fallbackIfStuck,4000),{once:true});return}
 showUniverseFallback();
}
setTimeout(fallbackIfStuck,15000);
