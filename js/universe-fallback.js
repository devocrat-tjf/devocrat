/* Plain world buttons when the 3D universe cannot start. */
/* If the 3D engine can't load (offline / blocked CDN), offer the worlds as plain buttons. */
const PLANET_ACCENT={modern:'#8f86f0',elegant:'#c9a24a',hospital:'#0b95a6',salon:'#d98aa8',illus:'#e76f51',mandala:'#f2a516',interior:'#b08560',arch:'#8bbcff',funny:'#ff5d8f',kids:'#ffb347',auto:'#e10600',future:'#00e5ff'};
function showUniverseFallback(){
 if(window.devocratUniverseReady)return;document.getElementById('uniLoading')?.remove();const fb=document.getElementById('uniFallback');if(!fb||!fb.hidden)return;
 const grid=document.getElementById('fbGrid');
 WORLDS.forEach(w=>{const b=document.createElement('button');b.style.setProperty('--pc',PLANET_ACCENT[w.id]);b.textContent=w.name;b.addEventListener('click',e=>openWorld(w.id,e));grid.appendChild(b)});
 document.querySelector('#universe .intro')?.remove();fb.hidden=false;
}
// any failure before the universe draws its first frame (no WebGL, old browser, blocked CDN) → plain world buttons
addEventListener('error',()=>{if(!window.devocratUniverseReady)showUniverseFallback()});
addEventListener('unhandledrejection',()=>{if(!window.devocratUniverseReady)showUniverseFallback()});
setTimeout(showUniverseFallback,15000);
