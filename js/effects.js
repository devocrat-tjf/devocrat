/* Cursor glyphs, button marks and floating theme objects. */
(()=>{
 const worlds=['landing','modern','elegant','hospital','salon','illus','mandala','interior','arch','funny','kids','auto','future'];
 const palettes={landing:'#d4ad35',modern:'#72e7d4',elegant:'#d7bd83',hospital:'#65c9c2',salon:'#ff83bd',illus:'#f5a45b',mandala:'#c8391f',interior:'#8a8b67',arch:'#7db6ff',funny:'#ff6f5d',kids:'#ffcf4a',auto:'#ff5e43',future:'#6cf8ff'};
 const symbols={landing:'✦',modern:'◉',elegant:'◇',hospital:'✚',salon:'♡',illus:'✎',mandala:'✺',interior:'⌂',arch:'⌗',funny:'!',kids:'★',auto:'⚡',future:'⌁'};
 let active='landing';
 const buddy=document.getElementById('patrolBuddy');
 if(buddy){buddy.innerHTML=`<svg viewBox="0 0 100 145" aria-hidden="true"><defs><linearGradient id="robotGold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff3b5"/><stop offset=".38" stop-color="#d4ad35"/><stop offset="1" stop-color="#725018"/></linearGradient><linearGradient id="robotDark" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#3b3c47"/><stop offset="1" stop-color="#08090e"/></linearGradient><radialGradient id="robotEye"><stop stop-color="#fff"/><stop offset=".3" stop-color="#6cf8ff"/><stop offset="1" stop-color="#1684a0"/></radialGradient></defs><ellipse class="buddy-glow" cx="50" cy="137" rx="28" ry="5" fill="#d4ad35" opacity=".6"/><g class="action-orbit" fill="none" stroke="#d4ad35" opacity=".7"><ellipse cx="50" cy="62" rx="38" ry="16" stroke-width="1.4"/><ellipse cx="50" cy="62" rx="38" ry="16" stroke-width="1" transform="rotate(60 50 62)"/><circle cx="88" cy="62" r="3" fill="#6cf8ff"/></g><g><path d="M33 31 L27 17 L40 21 L50 12 L61 21 L74 17 L68 33" fill="url(#robotGold)" stroke="#fff0ae" stroke-width="1.4"/><path d="M29 28 Q50 15 71 28 L68 48 Q50 60 32 48Z" fill="url(#robotDark)" stroke="url(#robotGold)" stroke-width="2.4"/><path d="M36 36 Q50 29 64 36 L61 43 Q50 48 39 43Z" fill="#08131b" stroke="#6cf8ff" stroke-width="1"/><ellipse class="action-eye" cx="49" cy="38" rx="4" ry="3" fill="url(#robotEye)"/><ellipse cx="59" cy="38" rx="3" ry="3" fill="url(#robotEye)"/><path d="M37 54 L63 54 L72 82 L63 91 L37 91 L28 82Z" fill="url(#robotDark)" stroke="url(#robotGold)" stroke-width="2.5"/><path d="M40 60 L60 60 L64 77 L50 84 L36 77Z" fill="#111923" stroke="#6cf8ff" stroke-width="1"/><circle cx="50" cy="71" r="6" fill="url(#robotEye)"/><path d="M34 59 L21 75 L27 81 L41 70 M66 59 L79 72 L73 80 L61 70" fill="none" stroke="url(#robotGold)" stroke-width="7" stroke-linecap="round"/><path class="action-arm" d="M34 60 L21 75 L27 81 L41 70" fill="none" stroke="url(#robotGold)" stroke-width="7" stroke-linecap="round"/><path d="M39 90 L35 112 L28 130 M61 90 L65 112 L72 130" fill="none" stroke="url(#robotGold)" stroke-width="9" stroke-linecap="round"/><path d="M22 131 L31 131 M66 131 L77 131" stroke="#fff0ae" stroke-width="4" stroke-linecap="round"/><circle cx="25" cy="76" r="3" fill="#6cf8ff"/><circle cx="75" cy="76" r="3" fill="#6cf8ff"/></g></svg>`;}
 function detectWorld(){let id='landing';if(document.getElementById('worldView')?.classList.contains('open')){id=window.currentWorld||document.documentElement.dataset.world||'modern';}else if(window.scrollY>innerHeight*.7){id='landing'}active=worlds.includes(id)?id:'landing';document.body.dataset.activeWorld=active;document.body.classList.toggle('world-open',active!=='landing'&&document.getElementById('worldView')?.classList.contains('open'));}
 const originalOpen=window.openWorld;if(typeof originalOpen==='function'&&!originalOpen.__v3){const wrapped=function(id,e){const result=originalOpen.apply(this,arguments);active=id;document.body.dataset.activeWorld=id;document.documentElement.dataset.world=id;document.body.classList.add('world-open');return result};wrapped.__v3=true;window.openWorld=wrapped;}
 const originalClose=window.closeWorld;if(typeof originalClose==='function'&&!originalClose.__v3){const wrappedClose=function(){const r=originalClose.apply(this,arguments);active='landing';document.body.dataset.activeWorld='landing';document.body.classList.remove('world-open');return r};wrappedClose.__v3=true;window.closeWorld=wrappedClose;}
 // Make sure all 13 styles get their own button motif and micro-motion.
 function decorateButtons(){detectWorld();document.querySelectorAll('button,.cta,.navbtn,.ghostbtn,.project').forEach((b,i)=>{if(b.closest('iframe')||b.closest('.lang-dialog')||b.closest('#universe')||b.classList.contains('closefamily')||b.dataset.v3decorated)return;b.dataset.v3decorated='1';b.style.setProperty('--fx-color',palettes[active]||palettes.landing);if(!b.querySelector('.v3-button-mark')&&!b.classList.contains('project')){const mark=document.createElement('span');mark.className='v3-button-mark';mark.setAttribute('aria-hidden','true');mark.textContent=symbols[active]||'✦';mark.style.cssText='display:inline-block;margin-right:.45em;transition:transform .3s;';b.prepend(mark);b.addEventListener('mouseenter',()=>{mark.style.transform='rotate(45deg) scale(1.3)'});b.addEventListener('mouseleave',()=>{mark.style.transform='rotate(0) scale(1)'})}})}
 const wv=document.getElementById('worldView');if(wv){new MutationObserver(()=>{decorateButtons();detectWorld()}).observe(wv,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});}decorateButtons();detectWorld();
})();

(()=>{
 const layer=document.getElementById('themeObjects');if(!layer)return;
 const sets={
 funny:['😂','🤣','😜','🤪','😎','😹','💥','🤡','😆','🙃'],
 auto:['🏎️','🚗','🚙','🏁','🛞','⚙️','🚦','🔧'],
 hospital:['💊','💉','🧴','🩺','🩹','🧪','🫙','➕'],
 salon:['✂️','🪒','💈','💇','🪮','🧴','✨','💇‍♀️'],
 illus:['✏️','🖊️','📏','📐','🖍️','🖌️','✒️','📎'],
 mandala:['✺','❀','❋','✿','❁','❃','✥','❊'],
 interior:['🪑','🛋️','💡','🪞','🪴','🪵','🛏️','🖼️'],
 arch:['📐','📏','🏛️','🧱','🗜️','📏','🏗️','🧰'],
 kids:['🧸','🪁','🪀','🧩','🚂','🪇','🦄','⚽'],
 future:['🛸','🤖','🔋','🛰️','⚡','🧬','🔮','🦾'],
 elegant:['✧','◇','❖','✦','♢','❋','✧'],
 modern:['◈','▣','◉','✳','⌘','⟡','⬡']
 };
 const accents={funny:'#ff5d8f',auto:'#ff3d2e',hospital:'#0b95a6',salon:'#d4607c',illus:'#e76f51',mandala:'#c8391f',interior:'#66765a',arch:'#8bbcff',kids:'#ff7a1a',future:'#00e5ff',elegant:'#b89458',modern:'#5b4ff5'};
 let timer=null, lastWorld='';
 function world(){return document.getElementById('worldView')?.classList.contains('open')?(window.currentWorld||document.documentElement.dataset.world||'modern'):''}
 function safeSpot(){
   const w=innerWidth,h=innerHeight;
   // Bias particles to margins and the hero's illustration side, keeping headings/buttons legible.
   const zones=[{x:.08,y:.25},{x:.9,y:.25},{x:.88,y:.72},{x:.08,y:.78},{x:.72,y:.16},{x:.92,y:.48}];
   const z=zones[Math.floor(Math.random()*zones.length)];
   return {x:Math.max(24,Math.min(w-24,w*z.x+(Math.random()-.5)*w*.09)),y:Math.max(70,Math.min(h-40,h*z.y+(Math.random()-.5)*h*.12))};
 }
 function pop(){const id=world();if(!id){layer.innerHTML='';lastWorld='';return}if(id!==lastWorld){layer.innerHTML='';lastWorld=id}const arr=sets[id]||sets.modern;const el=document.createElement('span');el.className='theme-pop';el.textContent=arr[Math.floor(Math.random()*arr.length)];const p=safeSpot();el.style.setProperty('--x',p.x+'px');el.style.setProperty('--y',p.y+'px');el.style.setProperty('--size',(id==='mandala'?20+Math.random()*18:24+Math.random()*22)+'px');el.style.setProperty('--rot',((Math.random()-.5)*45)+'deg');el.style.setProperty('--life',(1150+Math.random()*850)+'ms');el.style.color=accents[id]||'#fff';layer.appendChild(el);setTimeout(()=>el.remove(),2200);while(layer.children.length>7)layer.firstElementChild.remove();}
 function schedule(){clearTimeout(timer);if(!world()){layer.innerHTML='';return}timer=setTimeout(()=>{pop();schedule()},450+Math.random()*650)}
 const mo=new MutationObserver(()=>schedule());mo.observe(document.body,{subtree:true,attributes:true,attributeFilter:['class','data-world']});
 document.addEventListener('click',()=>{if(world()){pop();setTimeout(pop,130)} });
 setInterval(()=>{if(world()!==lastWorld)schedule()},450);
 schedule();
})();
