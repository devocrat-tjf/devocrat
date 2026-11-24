/* =====================================================================
   DEVOCRAT — Back-button steps.
   Every step a visitor takes (open a world, the family panel, a panel in Drive or Studio, the garage, a map…) is one entry
   in the browser history, so the phone / browser Back button closes the latest step instead of leaving the site.
   Worlds also get their own link: …/devocrat/#hospital opens the Hospital world directly.

   Drive (drive.html) and Studio (studio.html) run inside the main page; they use the main page's DVCNav, so every
   step lives in one history. Opened on their own, they use their own copy of this file.

   API for pages:  DVCNav.open(key, closeFn, hash)   a step just opened   (same group on top → the step is swapped, not stacked)
                   DVCNav.closed(key)                the page closed a step itself (its close button, Escape…)
   ===================================================================== */
(function(){
 // Changing an inner frame's address adds a hidden history entry (Back would step inside the frame instead of closing the step),
 // so app previews swap in a fresh frame instead: a new frame's first page never adds an entry.
 window.dvcFrame=function(f,o){if(!f)return f;const n=f.cloneNode(false);n.removeAttribute('src');n.removeAttribute('srcdoc');
  if(o&&o.srcdoc!=null)n.setAttribute('srcdoc',o.srcdoc);else if(o&&o.src)n.setAttribute('src',o.src);f.replaceWith(n);return n};
 try{if(window.parent!==window&&window.parent.DVCNav){window.DVCNav=window.parent.DVCNav;return}}catch(e){}
 if(window.DVCNav)return;
 const N={stack:[],busy:false,pend:0,skip:0,timer:0,world:null};
 const state=()=>({dvc:N.stack.length,world:N.world});
 const grp=k=>k.split(':')[0];
 N.hash=sub=>'#'+(N.world?N.world+(sub?'/'+sub:''):sub||'');
 N.open=function(key,close,hash){
  const L={key,close},top=N.stack[N.stack.length-1],url=hash||location.href;
  if(N.busy){N.stack.push(L);return}                                   // re-opening while the visitor steps forward
  if(top&&(top.key===key||(grp(top.key)===grp(key)&&grp(key)!=='world'))){N.stack[N.stack.length-1]=L;history.replaceState(state(),'',url);return}
  N.stack.push(L);
  if(N.pend>0){N.pend--;history.replaceState(state(),'',url)}          // a step closed a moment ago: reuse its history entry
  else history.pushState(state(),'',url)};
 N.closed=function(key){
  if(N.busy)return;
  let i=-1;for(let j=N.stack.length-1;j>=0;j--)if(N.stack[j].key===key){i=j;break}
  if(i<0)return;
  const gone=N.stack.splice(i);N.busy=true;try{gone.slice(1).reverse().forEach(l=>{try{l.close()}catch(e){}})}finally{N.busy=false}
  N.pend+=gone.length;clearTimeout(N.timer);N.timer=setTimeout(()=>{const n=N.pend;N.pend=0;if(n>0){N.skip++;history.go(-n)}},0)};
 addEventListener('popstate',e=>{
  if(N.skip>0){N.skip--;return}
  const s=e.state||{},d=s.dvc||0;
  N.busy=true;try{
   while(N.stack.length>d){const l=N.stack.pop();try{l.close()}catch(err){}}
   if(d>N.stack.length&&s.world&&N.reopenWorld)N.reopenWorld(s.world)  // Forward button: open that world again
  }finally{N.busy=false}});
 if(!history.state||history.state.dvc==null)history.replaceState({dvc:0,world:null},'',location.href);
 window.DVCNav=N;

 /* ---- main site: worlds and the family panel ---- */
 if(typeof window.openWorld!=='function'||typeof window.closeWorld!=='function')return;
 const ids=()=>(typeof WORLDS!=='undefined'?WORLDS.map(w=>w.id):[]);
 const rawOpen=window.openWorld,rawClose=window.closeWorld;
 const closeW=()=>{N.world=null;rawClose()};
 window.openWorld=function(id){const r=rawOpen.apply(this,arguments);N.world=id;N.open('world',closeW,'#'+id);return r};
 window.closeWorld=function(){const on=N.stack.some(l=>l.key==='world');if(N.busy||!on){N.world=null;return rawClose.apply(this,arguments)}
  rawClose.apply(this,arguments);N.world=null;N.closed('world')};
 N.reopenWorld=id=>{if(ids().includes(id)){rawOpen(id);N.world=id;N.stack.push({key:'world',close:closeW})}};
 if(typeof window.toggleFamily==='function'){const rawFam=window.toggleFamily;
  window.toggleFamily=function(force){const p=document.getElementById('familyPanel'),was=!!(p&&p.classList.contains('open'));const r=rawFam.apply(this,arguments);const now=!!(p&&p.classList.contains('open'));
   if(!N.busy){if(now&&!was)N.open('family',()=>rawFam(false),N.hash('family'));else if(was&&!now)N.closed('family')}return r}}
 // a link to a world (…/#hospital or …/#auto/garage) opens that world
 const first=(location.hash||'').slice(1).split('/')[0];
 if(first&&ids().includes(first)){history.replaceState({dvc:0,world:null},'',location.pathname+location.search);
  const go=()=>setTimeout(()=>window.openWorld(first),300);document.readyState==='complete'?go():addEventListener('load',go,{once:true})}
})();
