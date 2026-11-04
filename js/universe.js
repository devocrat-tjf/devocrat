/* DEVOCRAT Universe — galaxy intro, solar system and planets (three.js). */
import * as THREE from 'three';
import {mergeGeometries,mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';

window.devocratUniverse=true;
if(!window.WebGLRenderingContext)throw new Error('WebGL unavailable');
const $=id=>document.getElementById(id);
const root=$('universe'),canvas=$('uniCanvas'),label=$('planetLabel'),hint=$('uniHint'),nav=$('planetNav'),introEl=root.querySelector('.intro');
$('uniFallback').hidden=true;

const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const touchUI=matchMedia('(hover: none), (pointer: coarse)').matches;
const small=Math.min(innerWidth,innerHeight)<700;
const V3=THREE.Vector3,Y=new V3(0,1,0),X=new V3(1,0,0);
const lerp=THREE.MathUtils.lerp,clamp=THREE.MathUtils.clamp,deg=THREE.MathUtils.degToRad;
const easeInOut=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const easeOut=t=>1-Math.pow(1-t,3);
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const R0=rng(20261031);
const gauss=(r=R0)=>{let u=0,v=0;while(!u)u=r();while(!v)v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
const pick=(r,a)=>a[Math.floor(r()*a.length)];
/* classic 3D Perlin noise, seeded */
function makeNoise(seed){
 const r=rng(seed),perm=[...Array(256).keys()];for(let i=255;i>0;i--){const j=Math.floor(r()*(i+1));[perm[i],perm[j]]=[perm[j],perm[i]]}
 const p=new Uint8Array(512);for(let i=0;i<512;i++)p[i]=perm[i&255];
 const gr=(h,x,y,z)=>{h&=15;const u=h<8?x:y,v=h<4?y:(h===12||h===14?x:z);return((h&1)?-u:u)+((h&2)?-v:v)},fd=t=>t*t*t*(t*(t*6-15)+10);
 return(x,y,z)=>{const X=Math.floor(x)&255,Y=Math.floor(y)&255,Z=Math.floor(z)&255;x-=Math.floor(x);y-=Math.floor(y);z-=Math.floor(z);const u=fd(x),v=fd(y),w=fd(z);
  const A=p[X]+Y,AA=p[A]+Z,AB=p[A+1]+Z,B=p[X+1]+Y,BA=p[B]+Z,BB=p[B+1]+Z;
  return lerp(lerp(lerp(gr(p[AA],x,y,z),gr(p[BA],x-1,y,z),u),lerp(gr(p[AB],x,y-1,z),gr(p[BB],x-1,y-1,z),u),v),lerp(lerp(gr(p[AA+1],x,y,z-1),gr(p[BA+1],x-1,y,z-1),u),lerp(gr(p[AB+1],x,y-1,z-1),gr(p[BB+1],x-1,y-1,z-1),u),v),w)}
}

/* ---------- renderer, bloom, scene, camera ---------- */
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
const PR=Math.min(devicePixelRatio,1.25);;renderer.setPixelRatio(PR);
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x010208);
const camera=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,.05,40000);scene.add(camera);
const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));
const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),small?.8:.95,.6,.8);composer.addPass(bloom);composer.addPass(new OutputPass());
const target=new V3();

function canvasTex(size,draw,w=size){const c=document.createElement('canvas');c.width=w;c.height=size;draw(c.getContext('2d'),w,size);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
function glowTex(stops){return canvasTex(128,(g)=>{const gr=g.createRadialGradient(64,64,0,64,64,64);stops.forEach(([o,col])=>gr.addColorStop(o,col));g.fillStyle=gr;g.fillRect(0,0,128,128)})}
const additive={transparent:true,depthWrite:false,blending:THREE.AdditiveBlending};

/* ---------- Milky Way: golden swirling core, tightly wound arms, dust lanes, pink star-forming knots ---------- */
const GR=1000,PITCH=3.3;
const galaxy=new THREE.Group();scene.add(galaxy);
const pointVS=`attribute float aSize;attribute vec3 aColor;uniform float uPR,uScale,uOpacity,uClear,uMaxPx;uniform vec3 uSys;varying vec3 vC;varying float vA;
 void main(){vec4 wp=modelMatrix*vec4(position,1.);vec4 mv=viewMatrix*wp;gl_Position=projectionMatrix*mv;float d=max(-mv.z,.001);
 float px=aSize*uScale/d;vA=uOpacity*clamp(px,.2,1.);gl_PointSize=clamp(px,1.,uMaxPx)*uPR;
 vA*=smoothstep(uClear*.5,uClear+.001,distance(wp.xyz,uSys));vC=aColor;}`;
const pointUniforms=(scale,max)=>({uPR:{value:PR},uScale:{value:scale},uOpacity:{value:0},uSys:{value:new V3()},uClear:{value:0},uMaxPx:{value:max}});
const galaxyMat=new THREE.ShaderMaterial({...additive,uniforms:pointUniforms(2300,3.2),vertexShader:pointVS,
 fragmentShader:`varying vec3 vC;varying float vA;void main(){vec2 c=gl_PointCoord-.5;float a=exp(-dot(c,c)*16.)*vA;if(a<.01)discard;gl_FragColor=vec4(vC,a);}`});
const dustMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.NormalBlending,uniforms:pointUniforms(4200,9),vertexShader:pointVS,
 fragmentShader:`varying vec3 vC;varying float vA;void main(){vec2 c=gl_PointCoord-.5;float a=exp(-dot(c,c)*10.)*vA*.3;if(a<.01)discard;gl_FragColor=vec4(vC,a);}`});
{
 const N=small?350000:900000,ND=small?30000:80000,DB=small?.26:.19; // DB keeps the dense field from over-exposing
 // typed arrays: millions of stars would be far too slow and memory-hungry as plain arrays
 const pos=new Float32Array(N*3),col=new Float32Array(N*3),siz=new Float32Array(N),dpos=new Float32Array(ND*3),dcol=new Float32Array(ND*3),dsiz=new Float32Array(ND);let nS=0;
 const C=h=>new THREE.Color(h),cCore=C('#ffd89a'),cCream=C('#fff1d6'),cWarm=C('#f3c98f'),cLav=C('#c4cbff'),cBlue=C('#86a2ff'),cPink=C('#ff6aa8'),cRose=C('#ff9ad0'),cIce=C('#dfe8ff'),cTeal=C('#5ff0e0'),cGold=C('#ffc95c'),cViolet=C('#b07cff'),cAqua=C('#7fd4ff'),cCoral=C('#ff8a6b'),c=new THREE.Color();
 const push=(x,y,z,cc,b,s)=>{if(nS>=N)return;b*=DB;const o=nS*3;pos[o]=x;pos[o+1]=y;pos[o+2]=z;col[o]=cc.r*b;col[o+1]=cc.g*b;col[o+2]=cc.b*b;siz[nS++]=s*.7};
 const armPt=(arm,r,spread)=>{spread*=1.45;const th=arm+Math.log(r/150)*PITCH;return [Math.cos(th)*r+gauss()*spread,Math.sin(th)*r+gauss()*spread,th]};
 const arms=[0,Math.PI,Math.PI*.5,Math.PI*1.5],armW=[1,1,.62,.62];
 for(let i=0;i<N;i++){
  const k=R0();
  if(k<.11){push(gauss()*62,gauss()*34,gauss()*62,c.copy(cCore).lerp(cCream,R0()*.7),.75+R0()*.45,.9+R0()*1.1)}
  else if(k<.25){ // inner swirl winding into the core
   const a=Math.floor(R0()*4)*Math.PI/2,r=22+Math.pow(R0(),1.1)*400,th=a+Math.log(r/22)*1.35,sp=8+r*.1;
   push(Math.cos(th)*r+gauss()*sp,gauss()*Math.max(5,18-r*.03),Math.sin(th)*r+gauss()*sp,c.copy(cCream).lerp(cWarm,R0()).lerp(cLav,Math.max(0,(r-260)/300)),.5+R0()*.4,.8+R0()*1.1)}
  else if(k<.8){
   let ai=Math.floor(R0()*4);if(R0()>armW[ai])ai=ai<2?ai:ai-2;
   const t=Math.pow(R0(),.85),r=150+t*(GR-150),[x,z]=armPt(arms[ai],r,(ai<2?1:1.35)*(10+r*.045));
   const f=Math.min(1,(r-150)/650);c.copy(cWarm).lerp(cLav,Math.min(1,f*2.6)).lerp(cBlue,Math.max(0,f*1.5-.25));
   const q=R0();let b=.4+R0()*.42,s=.7+R0()*1.1;if(q<.06){c.copy(cIce);b=1.25;s*=1.8}else if(q<.07){c.copy(cPink);b=.7}else if(q<.1){c.copy(f>.45?cTeal:cGold);b=1.5;s*=1.35}else if(q<.135){c.copy(f>.3?cAqua:cCoral);b=1.3;s*=1.15}else if(q<.155){c.copy(cViolet);b=1.5;s*=1.4}
   push(x,gauss()*(6+(1-t)*9),z,c,b,s)}
  else if(k<.826){ // pink / magenta star-forming knots sprinkled along the arms
   const ai=Math.floor(R0()*4),r=220+R0()*(GR-280),[x,z]=armPt(arms[ai],r,(10+r*.045)*.8);const n=5+Math.floor(R0()*8);
   for(let j=0;j<n&&i<N;j++,i++)push(x+gauss()*3.5,gauss()*2,z+gauss()*3.5,R0()<.6?cPink:cRose,.38+R0()*.3,.85+R0()*1)}
  else{const r=Math.abs(gauss())*GR*.5+R0()*GR*.35,th=R0()*Math.PI*2;push(Math.cos(th)*r,gauss()*20,Math.sin(th)*r,c.copy(cLav).lerp(cWarm,R0()*.5),.22+R0()*.25,.6+R0()*.6)}
 }
 // dark dust lanes hugging the inner edge of every arm, and threading the core swirl
 const cDust=C('#2a1206'),cDust2=C('#47220d');
 for(let i=0;i<ND;i++){
  let x,z,y=gauss()*3;
  if(R0()<.25){const a=Math.floor(R0()*4)*Math.PI/2,r=40+R0()*260,th=a+Math.log(r/22)*1.35-.22;x=Math.cos(th)*r+gauss()*6;z=Math.sin(th)*r+gauss()*6}
  else{const ai=Math.floor(R0()*4),r=170+Math.pow(R0(),1.1)*(GR-200),th=arms[ai]+Math.log(r/150)*PITCH-.16;const sp=6+r*.025;x=Math.cos(th)*r+gauss()*sp;z=Math.sin(th)*r+gauss()*sp}
  c.copy(cDust).lerp(cDust2,R0());dpos.set([x,y,z],i*3);dcol.set([c.r,c.g,c.b],i*3);dsiz[i]=1.2+R0()*1.9;
 }
 const mk=(p,cc,s,m)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('aColor',new THREE.Float32BufferAttribute(cc,3));g.setAttribute('aSize',new THREE.Float32BufferAttribute(s,1));return new THREE.Points(g,m)};
 galaxy.add(mk(pos,col,siz,galaxyMat));const dust=mk(dpos,dcol,dsiz,dustMat);dust.renderOrder=1;galaxy.add(dust);
}
const discGlow=new THREE.Mesh(new THREE.PlaneGeometry(GR*2.3,GR*2.3),new THREE.MeshBasicMaterial({...additive,map:glowTex([[0,'rgba(255,220,160,.8)'],[.1,'rgba(255,196,130,.4)'],[.35,'rgba(150,140,255,.1)'],[1,'rgba(0,0,0,0)']]),opacity:0}));
discGlow.rotation.x=-Math.PI/2;galaxy.add(discGlow);
const coreGlow=new THREE.Sprite(new THREE.SpriteMaterial({...additive,map:glowTex([[0,'rgba(255,248,225,1)'],[.18,'rgba(255,214,140,.65)'],[.5,'rgba(255,170,90,.1)'],[1,'rgba(0,0,0,0)']]),opacity:0}));
coreGlow.scale.set(520,520,1);galaxy.add(coreGlow);

/* far sky: twinkling stars, bright stars with diffraction spikes, distant galaxies */
const bgMat=new THREE.ShaderMaterial({...additive,uniforms:{uPR:{value:PR},uTime:{value:0},uOpacity:{value:0}},
 vertexShader:`attribute float aSize;attribute float aPh;attribute vec3 aColor;uniform float uPR,uTime,uOpacity;varying float vA;varying vec3 vC;void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_PointSize=aSize*uPR;vC=aColor;vA=uOpacity*(.5+.5*sin(uTime*(.6+aPh*.5)+aPh*6.28));}`,
 fragmentShader:`varying float vA;varying vec3 vC;void main(){vec2 c=gl_PointCoord-.5;float a=exp(-dot(c,c)*14.)*vA;if(a<.01)discard;gl_FragColor=vec4(vC,a);}`});
const skyDir=()=>new V3(gauss(),gauss(),gauss()).normalize();
{
 const n=small?2600:5200,p=[],s=[],ph=[],cc=[],cols=['#ffffff','#cfe0ff','#ffe2b8','#ffd0a0','#bcd0ff'].map(h=>new THREE.Color(h));
 for(let i=0;i<n;i++){const v=skyDir().multiplyScalar(15000);p.push(v.x,v.y,v.z);s.push(1+Math.pow(R0(),3)*2.6);ph.push(R0());const c=pick(R0,cols);cc.push(c.r,c.g,c.b)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('aSize',new THREE.Float32BufferAttribute(s,1));g.setAttribute('aPh',new THREE.Float32BufferAttribute(ph,1));g.setAttribute('aColor',new THREE.Float32BufferAttribute(cc,3));
 scene.add(new THREE.Points(g,bgMat));
}
const spikeTex=canvasTex(128,g=>{const gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.08,'rgba(255,255,255,.85)');gr.addColorStop(.25,'rgba(255,255,255,.12)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);
 for(const [w,h] of [[128,3],[3,128]]){const l=g.createLinearGradient(w>h?0:64,w>h?64:0,w>h?128:64,w>h?64:128);l.addColorStop(0,'rgba(255,255,255,0)');l.addColorStop(.5,'rgba(255,255,255,.9)');l.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=l;g.fillRect(64-w/2,64-h/2,w,h)}});
const sparkles=[];
for(let i=0;i<(small?38:70);i++){const m=new THREE.SpriteMaterial({...additive,map:spikeTex,color:pick(R0,['#ffffff','#bcd2ff','#ffd9a8','#ffc48a']),sizeAttenuation:false,opacity:0});
 const s=new THREE.Sprite(m);s.position.copy(skyDir().multiplyScalar(14000));const k=.012+Math.pow(R0(),2.2)*.03;s.scale.set(k,k,1);s.userData={k,ph:R0()*6.28};scene.add(s);sparkles.push(s)}
const miniGalTex=canvasTex(128,g=>{const gr=g.createRadialGradient(64,64,0,64,64,60);gr.addColorStop(0,'rgba(255,240,215,1)');gr.addColorStop(.15,'rgba(255,215,170,.7)');gr.addColorStop(.5,'rgba(170,170,255,.18)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);
 g.strokeStyle='rgba(200,200,255,.25)';g.lineWidth=3;for(let a=0;a<2;a++){g.beginPath();for(let t=0;t<5;t+=.05){const r=6+t*10,th=a*Math.PI+t*1.3;g.lineTo(64+Math.cos(th)*r,64+Math.sin(th)*r)}g.stroke()}});
for(let i=0;i<(small?5:9);i++){const m=new THREE.SpriteMaterial({...additive,map:miniGalTex,sizeAttenuation:false,opacity:0,rotation:R0()*Math.PI});const s=new THREE.Sprite(m);
 s.position.copy(skyDir().multiplyScalar(14500));const k=.02+R0()*.035;s.scale.set(k,k*(.35+R0()*.4),1);s.userData={k:-1};scene.add(s);sparkles.push(s)}

/* drifting space dust that travels past the camera */
const DN=small?380:700,dustPos=new Float32Array(DN*3);
for(let i=0;i<DN;i++)dustPos.set([(R0()-.5)*120,(R0()-.5)*70,-4-R0()*160],i*3);
const driftGeo=new THREE.BufferGeometry();driftGeo.setAttribute('position',new THREE.BufferAttribute(dustPos,3));
const driftMat=new THREE.ShaderMaterial({...additive,uniforms:{uPR:{value:PR},uOpacity:{value:0}},
 vertexShader:`uniform float uPR,uOpacity;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;float d=-mv.z;gl_PointSize=clamp(140./d,.8,3.2)*uPR;vA=uOpacity*smoothstep(4.,18.,d)*(1.-smoothstep(120.,164.,d));}`,
 fragmentShader:`varying float vA;void main(){vec2 c=gl_PointCoord-.5;float a=exp(-dot(c,c)*14.)*vA;if(a<.01)discard;gl_FragColor=vec4(vec3(.8,.86,1.),a);}`});
camera.add(new THREE.Points(driftGeo,driftMat));

/* ---------- DEVOCRAT system, sitting in one of the spiral arms ---------- */
const system=new THREE.Group();
{const r=600,th=Math.log(r/150)*PITCH;system.position.set(Math.cos(th)*r,0,Math.sin(th)*r)}
galaxy.add(system);
const sysWorld=new V3();

// fiery golden sun: churning surface + flame corona, bloom does the rest
const SUN_R=1.45;
const sunMat=new THREE.ShaderMaterial({uniforms:{uTime:{value:0}},
 vertexShader:`varying vec3 vP;varying vec3 vN;varying vec3 vV;void main(){vP=position;vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
 fragmentShader:`uniform float uTime;varying vec3 vP;varying vec3 vN;varying vec3 vV;
 float h(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
 float n(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
 float fbm(vec3 p){float v=0.,a=.5;for(int i=0;i<6;i++){v+=a*n(p);p*=2.07;a*=.5;}return v;}
 void main(){vec3 p=normalize(vP)*3.4;float t=uTime*.12;float f=fbm(p+vec3(t,t*.6,-t)+fbm(p*1.7-t)*1.2);float g=fbm(p*5.5+t*2.);
 vec3 c=mix(vec3(.85,.3,.02),vec3(1.,.62,.1),smoothstep(.32,.6,f));c=mix(c,vec3(1.,.93,.6),smoothstep(.58,.82,f));c*=.8+.45*g;
 c+=vec3(1.,.5,.1)*pow(1.-max(dot(vN,vV),0.),2.2)*.9;gl_FragColor=vec4(c*1.25,1.);}`});
const sun=new THREE.Mesh(new THREE.SphereGeometry(SUN_R,72,54),sunMat);system.add(sun);
const flameMat=new THREE.ShaderMaterial({...additive,side:THREE.BackSide,uniforms:{uTime:{value:0}},
 vertexShader:`varying vec3 vN;varying vec3 vV;varying vec3 vP;void main(){vP=position;vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
 fragmentShader:`uniform float uTime;varying vec3 vN;varying vec3 vV;varying vec3 vP;
 float h(vec3 p){return fract(sin(dot(p,vec3(12.9,78.2,37.7)))*43758.5);}
 float n(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
 void main(){float rim=pow(1.-abs(dot(vN,vV)),1.4);float fl=n(normalize(vP)*6.+vec3(0.,0.,uTime*.8))*.6+n(normalize(vP)*13.-uTime*1.3)*.4;
 float a=rim*smoothstep(.25,.9,fl+rim*.4);gl_FragColor=vec4(vec3(1.,.5,.1)*1.2,a*.75);}`});
const flames=new THREE.Mesh(new THREE.SphereGeometry(SUN_R*1.32,64,48),flameMat);system.add(flames);
const corona=new THREE.Sprite(new THREE.SpriteMaterial({...additive,map:glowTex([[0,'rgba(255,226,140,1)'],[.25,'rgba(255,170,60,.55)'],[.5,'rgba(255,120,20,.14)'],[1,'rgba(255,90,10,0)']])}));
corona.scale.set(SUN_R*4.6,SUN_R*4.6,1);system.add(corona);
const halo=new THREE.Sprite(new THREE.SpriteMaterial({...additive,map:corona.material.map,opacity:.1}));halo.scale.set(SUN_R*11,SUN_R*11,1);system.add(halo);
const beacon=new THREE.Sprite(new THREE.SpriteMaterial({...additive,map:glowTex([[0,'rgba(255,245,210,1)'],[.15,'rgba(255,205,90,.85)'],[.5,'rgba(255,170,40,.2)'],[1,'rgba(0,0,0,0)']]),sizeAttenuation:false,opacity:0}));
beacon.scale.set(.045,.045,1);system.add(beacon);
system.add(new THREE.PointLight(0xffe2b0,2.7,0,0));
const fill=new THREE.PointLight(0xfff4e6,1.0,0,0);camera.add(fill);
scene.add(new THREE.AmbientLight(0xc8ccdc,.42));

// two moons around the sun
const moons=[{r:SUN_R+.55,size:.2,incl:.42,w:.85,c:'#ddd6c6'},{r:SUN_R+1.0,size:.15,incl:-.55,w:-.55,c:'#c9ad6e'}].map((m,i)=>{
 const pivot=new THREE.Group();pivot.rotation.z=m.incl;system.add(pivot);
 const g=new THREE.SphereGeometry(m.size,28,20),cc=new Float32Array(g.attributes.position.count*3),base=new THREE.Color(m.c),p=g.attributes.position,N=makeNoise(40+i);
 for(let k=0;k<p.count;k++){const f=.72+.28*(N(p.getX(k)*30,p.getY(k)*30,p.getZ(k)*30)*.5+.5);cc.set([base.r*f,base.g*f,base.b*f],k*3)}
 g.setAttribute('color',new THREE.BufferAttribute(cc,3));
 const mesh=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95}));pivot.add(mesh);
 return {...m,mesh,a:i*2.4};
});

/* ---------- city building blocks (shared by all 12 themes) ---------- */
const at=(g,x=0,y=0,z=0,ry=0,rz=0,rx=0)=>{if(rx)g.rotateX(rx);if(rz)g.rotateZ(rz);if(ry)g.rotateY(ry);return g.translate(x,y,z)};
const G={
 box:(w,h,d)=>new THREE.BoxGeometry(w,h,d).translate(0,h/2,0),
 cyl:(rt,rb,h,s=10)=>new THREE.CylinderGeometry(rt,rb,h,s).translate(0,h/2,0),
 cone:(r,h,s=10)=>new THREE.ConeGeometry(r,h,s).translate(0,h/2,0),
 sph:(r,ws=10,hs=8)=>new THREE.SphereGeometry(r,ws,hs),
 dome:r=>new THREE.SphereGeometry(r,14,6,0,Math.PI*2,0,Math.PI/2),
 roof:(w,h,d)=>new THREE.CylinderGeometry(1,1,w,3,1,false,Math.PI/2).rotateZ(Math.PI/2).scale(1,h/1.5,d/1.732).translate(0,h/3,0),
 torus:(r,t,arc=Math.PI*2)=>new THREE.TorusGeometry(r,t,6,24,arc),
};
const CITY_HS=.85;
const outline=parts=>parts.concat(parts.filter(p=>!p[2]).map(p=>[p[0],null,'line']));
class City{
 constructor(R,seed,rad){this.R=R;this.rad=rad;this.rnd=rng(seed);this.solid=[];this.glow=[];this.lines=[]}
 put(parts,n,o={}){
  const q=new THREE.Quaternion().setFromUnitVectors(Y,n).multiply(new THREE.Quaternion().setFromAxisAngle(Y,o.yaw??this.rnd()*Math.PI*2));
  if(o.tilt)q.multiply(new THREE.Quaternion().setFromAxisAngle(X,o.tilt));
  const m=new THREE.Matrix4().compose(n.clone().multiplyScalar(this.rad(n)+(o.lift??-.004*this.R)),q,new V3(1,o.hs??CITY_HS,1));
  for(const [g,c,f] of parts){
   if(f==='line'){this.lines.push(new THREE.EdgesGeometry(g,25).applyMatrix4(m));continue}
   let gg=g.clone();if(gg.index)gg=gg.toNonIndexed();gg.deleteAttribute('uv');gg.applyMatrix4(m);
   const col=new THREE.Color(c),a=new Float32Array(gg.attributes.position.count*3);for(let i=0;i<a.length;i+=3){a[i]=col.r;a[i+1]=col.g;a[i+2]=col.b}
   gg.setAttribute('color',new THREE.BufferAttribute(a,3));(f==='glow'?this.glow:this.solid).push(gg);
  }
 }
 build(lineColor){
  const grp=new THREE.Group();
  if(this.solid.length)grp.add(new THREE.Mesh(mergeGeometries(this.solid),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.6,metalness:.1,flatShading:true})));
  if(this.glow.length)grp.add(new THREE.Mesh(mergeGeometries(this.glow),new THREE.MeshBasicMaterial({vertexColors:true,toneMapped:false})));
  if(this.lines.length)grp.add(new THREE.LineSegments(mergeGeometries(this.lines),new THREE.LineBasicMaterial({color:lineColor||'#243b4a',transparent:true,opacity:.9})));
  return grp;
 }
}
const THEMES={
 modern:{ground:['#e4e7fb','#c9cef2'],block(c,n,u,r){const k=r();
  if(k<.62){const w=u*(.09+r()*.08),h=u*(.22+r()*.5),p=[[G.box(w,h,w),pick(r,['#6c5ce7','#8f86f0','#f4f5ff','#2d2a4a','#5b4ff5'])]];for(let y=h*.15;y<h*.95;y+=u*.06)p.push([at(G.box(w*1.04,u*.012,w*1.04),0,y),'#9ef5e5','glow']);c.put(p,n)}
  else if(k<.84){const rr=u*(.04+r()*.035),h=u*(.28+r()*.45);c.put([[G.cyl(rr,rr*1.15,h,12),'#e3e6ff'],[at(G.cyl(rr*1.06,rr*1.06,u*.018,12),0,h*.88),'#9ef5e5','glow'],[at(G.sph(rr*.7),0,h),'#6c5ce7']],n)}
  else c.put([[G.cyl(u*.01,u*.01,u*.05,5),'#5a4a3a'],[at(G.sph(u*.05,8,6),0,u*.07),'#5fcf9b']],n)}},
 elegant:{ground:['#efe5d6','#dccbb2'],block(c,n,u,r){const k=r();
  if(k<.3){const p=[[G.box(u*.34,u*.04,u*.22),'#d9c7ad'],[at(G.box(u*.3,u*.14,u*.16),0,u*.04),'#f6efe4'],[at(G.box(u*.34,u*.02,u*.22),0,u*.18),'#d9c7ad'],[at(G.roof(u*.32,u*.07,u*.2),0,u*.2),'#f3eadb']];
   for(let i=0;i<6;i++)p.push([at(G.cyl(u*.011,u*.011,u*.14,8),-u*.14+i*u*.056,u*.04,u*.095),'#fffaf0']);p.push([at(G.sph(u*.012,6,4),0,u*.28),'#ffd58a','glow']);c.put(p,n)}
  else if(k<.55)c.put([[G.cyl(u*.08,u*.085,u*.12,16),'#f6efe4'],[at(G.dome(u*.08),0,u*.12),'#c9a24a'],[at(G.cone(u*.012,u*.06,6),0,u*.2),'#e8c66a'],[at(G.cyl(u*.081,u*.081,u*.01,16),0,u*.07),'#ffd58a','glow']],n)
  else if(k<.75)c.put([[G.box(u*.08,u*.28,u*.08),'#efe6d8'],[at(G.cone(u*.07,u*.1,4),0,u*.28,0,Math.PI/4),'#8a6a52']],n)
  else c.put([[G.cyl(u*.008,u*.008,u*.03,5),'#5a4632'],[at(G.cone(u*.028,u*.16,7),0,u*.02),'#4d5d3a']],n)}},
 hospital:{ground:['#e3f6f3','#c6ebe6'],block(c,n,u,r){const k=r();
  if(k<.45){const w=u*(.16+r()*.08),h=u*(.16+r()*.16),d=u*.14,p=[[G.box(w,h,d),'#ffffff']];for(let y=u*.04;y<h-u*.02;y+=u*.05)p.push([at(G.box(w*1.03,u*.014,d*1.03),0,y),'#0b95a6']);
   p.push([at(G.box(u*.1,u*.016,u*.03),0,h),'#e5383b'],[at(G.box(u*.03,u*.016,u*.1),0,h),'#e5383b'],[at(G.box(w*1.03,u*.01,d*1.03),0,h-u*.012),'#9ff3ff','glow']);c.put(p,n)}
  else if(k<.58)c.put([[G.cyl(u*.1,u*.1,u*.012,20),'#2f7de1'],[at(G.box(u*.012,u*.006,u*.07),-u*.025,u*.012),'#ffffff'],[at(G.box(u*.012,u*.006,u*.07),u*.025,u*.012),'#ffffff'],[at(G.box(u*.05,u*.006,u*.012),0,u*.012),'#ffffff'],[at(G.torus(u*.095,u*.004),0,u*.014,0,0,0,Math.PI/2),'#9ff3ff','glow']],n)
  else if(k<.78)c.put([[G.box(u*.12,u*.09,u*.12),'#d7eef2'],[at(G.box(u*.07,u*.012,u*.02),0,u*.09),'#e5383b'],[at(G.box(u*.02,u*.012,u*.07),0,u*.09),'#e5383b']],n)
  else c.put([[G.cyl(u*.01,u*.01,u*.04,5),'#6b4f36'],[at(G.sph(u*.05,8,6),0,u*.07),'#4caf7a']],n)}},
 salon:{ground:['#f1e3e8','#d9d3de'],block(c,n,u,r){const k=r();  // unisex: barber poles + beauty boutiques
  if(k<.24){const p=[[G.cyl(u*.03,u*.034,u*.03,10),'#c9a24a']];for(let i=0;i<7;i++)p.push([at(G.cyl(u*.019,u*.019,u*.032,10),0,u*.03+i*u*.032),['#c62828','#ffffff','#1e3a8a'][i%3]]);p.push([at(G.sph(u*.026,10,8),0,u*.27),'#ffe0a0','glow']);c.put(p,n)}
  else if(k<.48)c.put([[G.cyl(u*.09,u*.1,u*.08,16),'#f7c6d6'],[at(G.dome(u*.09),0,u*.08),'#d4607c'],[at(G.cyl(u*.092,u*.092,u*.012,16),0,u*.04),'#ffd1e0','glow'],[at(G.sph(u*.014,6,4),0,u*.17),'#c9a24a']],n)
  else if(k<.74)c.put([[G.box(u*.16,u*.12,u*.12),'#22304a'],[at(G.box(u*.17,u*.014,u*.05),0,u*.085,0,0,0),'#c62828'],[at(G.box(u*.17,u*.014,u*.05),0,u*.071),'#f5f5f5'],[at(G.box(u*.165,u*.008,u*.125),0,u*.12),'#ffd27a','glow'],[at(G.box(u*.04,u*.06,u*.005),0,0,u*.061),'#c9a24a']],n)
  else if(k<.9){const p=[[G.box(u*.08,u*.24,u*.08),'#3a3f55']];for(let y=u*.04,i=0;y<u*.23;y+=u*.045,i++)p.push([at(G.box(u*.084,u*.012,u*.084),0,y),i%2?'#8fb8ff':'#ff9ec4','glow']);c.put(p,n)}
  else c.put([[at(G.box(u*.014,u*.2,u*.024),0,0,0,0,.38),'#c0c4cc'],[at(G.box(u*.014,u*.2,u*.024),0,0,0,0,-.38),'#c0c4cc'],[at(G.torus(u*.022,u*.006),-u*.03,u*.02),'#d4607c'],[at(G.torus(u*.022,u*.006),u*.03,u*.02),'#1e3a8a']],n,{lift:.01})}},
 illus:{ground:['#fdf3dc','#f2ddb4'],lines:'#243b4a',block(c,n,u,r){const k=r(),tilt=(r()-.5)*.24;
  if(k<.68){const w=u*(.09+r()*.07),h=u*(.12+r()*.2);c.put(outline([[G.box(w,h,w),pick(r,['#ffd6a5','#caffbf','#9bf6ff','#ffadad','#bdb2ff','#fdffb6'])],[at(G.cone(w*.78,u*.09,4),0,h,0,Math.PI/4),'#e76f51'],[at(G.box(w*.3,w*.4,u*.004),0,u*.02,w/2),'#243b4a']]),n,{tilt})}
  else if(k<.84)c.put(outline([[G.cyl(u*.035,u*.035,u*.03,6),'#ff9aa2'],[at(G.cyl(u*.036,u*.036,u*.012,6),0,u*.03),'#c9c9c9'],[at(G.cyl(u*.035,u*.035,u*.24,6),0,u*.042),'#f4c430'],[at(G.cone(u*.035,u*.07,6),0,u*.282),'#f1d6a8'],[at(G.cone(u*.01,u*.02,6),0,u*.332),'#333333']]),n,{tilt})
  else c.put(outline([[G.cyl(u*.008,u*.008,u*.07,5),'#7a5230'],[at(G.sph(u*.045,7,5),0,u*.1),'#2a9d8f']]),n,{tilt})}},
 mandala:{ground:['#f6c96b','#e8a43a'],block(c,n,u,r){const k=r();
  if(k<.36){const p=[];let y=0;const cols=['#c8391f','#f2a516','#0b7a7c','#b3205e','#f2a516'];for(let t=0;t<5;t++){const s=1-t*.16;p.push([at(G.box(u*.2*s,u*.05,u*.13*s),0,y),cols[t]]);y+=u*.05}
   p.push([at(G.roof(u*.09,u*.05,u*.05),0,y),'#c8391f']);for(let i=-1;i<=1;i++)p.push([at(G.sph(u*.011,6,4),i*u*.03,y+u*.05),'#ffd34d','glow']);c.put(p,n)}
  else if(k<.6)c.put([[G.box(u*.12,u*.08,u*.12),'#fff4e0'],[at(G.dome(u*.07),0,u*.08),'#fff4e0'],[at(G.cone(u*.014,u*.05,6),0,u*.15),'#f2a516'],[at(G.box(u*.124,u*.012,u*.124),0,u*.06),'#0b7a7c']],n)
  else if(k<.8){const p=[[G.box(u*.16,u*.012,u*.16),'#c8391f']];for(const [x,z] of [[-1,-1],[1,-1],[-1,1],[1,1]])p.push([at(G.cyl(u*.008,u*.008,u*.08,6),x*u*.06,u*.012,z*u*.06),'#fff4e0']);p.push([at(G.box(u*.16,u*.014,u*.16),0,u*.09),'#0b7a7c'],[at(G.dome(u*.04),0,u*.104),'#f2a516']);c.put(p,n)}
  else c.put([[G.cyl(u*.016,u*.024,u*.018,8),'#b3205e'],[at(G.sph(u*.013,6,4),0,u*.03),'#ffb347','glow']],n)}},
 interior:{ground:['#b9bea3','#a2a986'],block(c,n,u,r){const k=r();
  if(k<.6){const w=u*(.12+r()*.06),h=u*(.09+r()*.04),d=u*.12;c.put([[G.box(w,h,d),pick(r,['#efe6d6','#e3cdb0','#d9b99b'])],[at(G.roof(w*1.12,u*.08,d*1.18),0,h),pick(r,['#8b5e3c','#66765a','#5c4b3b'])],[at(G.box(u*.025,u*.03,u*.004),-w*.25,h*.45,d/2),'#ffd27a','glow'],[at(G.box(u*.025,u*.03,u*.004),w*.25,h*.45,d/2),'#ffd27a','glow'],[at(G.box(u*.025,u*.05,u*.004),0,0,d/2),'#5c4b3b'],[at(G.box(u*.02,u*.06,u*.02),w*.3,h+u*.02),'#8a6f5a']],n)}
  else if(k<.86)c.put([[G.cyl(u*.01,u*.012,u*.05,6),'#6b4f36'],[at(G.sph(u*.05,8,6),0,u*.08),pick(r,['#66765a','#7d8a63','#8f9a6e'])]],n)
  else c.put([[G.cyl(u*.005,u*.005,u*.1,5),'#38372f'],[at(G.sph(u*.014,8,6),0,u*.105),'#ffd27a','glow']],n)}},
 arch:{ground:['#0d3b6e','#0f4580'],lines:'#d6e8ff',grid:'#8bbcff',block(c,n,u,r){const k=r();
  if(k<.6){const w=u*(.08+r()*.07),h=u*(.18+r()*.4);c.put(outline([[G.box(w,h,w),'#12406f']]),n)}
  else if(k<.82){const w=u*.15;c.put(outline([[G.box(w,u*.1,w),'#12406f'],[at(G.box(w*.6,u*.12,w*.6),0,u*.1),'#174a80']]),n)}
  else c.put([[G.box(u*.014,u*.36,u*.014),null,'line'],[at(G.box(u*.26,u*.014,u*.014),u*.07,u*.36),null,'line'],[at(G.box(u*.004,u*.1,u*.004),u*.17,u*.26),null,'line'],[at(G.box(u*.014,u*.36,u*.014),0,0),'#f5c542'],[at(G.box(u*.26,u*.012,u*.012),u*.07,u*.36),'#f5c542']],n)}},
 funny:{ground:['#ffe45e','#ffc93c'],block(c,n,u,r){const k=r(),tilt=(r()-.5)*.5,col=pick(r,['#ff5d8f','#3ec6e0','#7ac943','#ff9f1c','#a06cd5']);
  const w=u*(.1+r()*.06),h=k<.2?w*.9:u*(.14+r()*.2),eyes=[[at(G.sph(w*.17,8,6),-w*.2,h*.7,w/2),'#ffffff'],[at(G.sph(w*.17,8,6),w*.2,h*.7,w/2),'#ffffff'],[at(G.sph(w*.08,6,4),-w*.2,h*.7,w/2+w*.12),'#2b1b3d'],[at(G.sph(w*.08,6,4),w*.2,h*.7,w/2+w*.12),'#2b1b3d'],[at(G.torus(w*.16,w*.03,Math.PI),0,h*.42,w/2+w*.01,0,Math.PI),'#2b1b3d']];
  if(k<.2)c.put([[at(G.sph(w*.62,12,10).scale(1,.75,1),0,w*.42),col],...eyes.map(e=>[e[0].clone().translate(0,-h*.25,w*.1),e[1]])],n,{tilt})
  else c.put([[G.box(w,h,w),col],[at(G.sph(w*.58,10,8),0,h),pick(r,['#ffffff','#2b1b3d','#ff5d8f','#3ec6e0'])],...eyes],n,{tilt})}},
 kids:{ground:['#8fdc5e','#74c94a'],block(c,n,u,r){const k=r();
  if(k<.5){const w=u*(.1+r()*.04),col=pick(r,['#ff4d4d','#4d9dff','#ffd23f','#7ac943','#ff7a1a','#b36bff']);c.put([[G.box(w,w*.9,w),col],[at(G.cone(w*.78,w*.75,4),0,w*.9,0,Math.PI/4),pick(r,['#ff4d4d','#4d9dff','#ffd23f'])],[at(G.box(w*.3,w*.3,u*.004),0,w*.35,w/2),'#fff3b0','glow']],n)}
  else if(k<.6){const p=[[at(G.box(u*.012,u*.17,u*.012),-u*.04,0,0,0,.25),'#4d9dff'],[at(G.box(u*.012,u*.17,u*.012),u*.04,0,0,0,-.25),'#4d9dff'],[at(G.torus(u*.12,u*.008),0,u*.17),'#ff4d4d'],[at(G.sph(u*.016,8,6),0,u*.17),'#ffd23f']];
   for(let i=0;i<8;i++){const a=i/8*Math.PI*2;p.push([at(G.box(u*.006,u*.12,u*.006),0,0,0,0,a).translate(0,u*.17,0),'#ffffff'],[at(G.box(u*.03,u*.03,u*.03),Math.cos(a)*u*.12,u*.17+Math.sin(a)*u*.12),pick(r,['#ffd23f','#7ac943','#ff7a1a','#b36bff'])])}c.put(p,n,{yaw:0})}
  else if(k<.76)c.put([[G.cyl(u*.002,u*.002,u*.11,4),'#ffffff'],[at(G.sph(u*.04,10,8).scale(1,1.2,1),0,u*.14),pick(r,['#ff4d4d','#4d9dff','#ffd23f','#b36bff'])]],n)
  else if(k<.9){const p=[];for(let i=0;i<3;i++)p.push([at(G.box(u*.05,u*.05,u*.05),(r()-.5)*u*.01,i*u*.05,0,r()*.6),pick(r,['#ff4d4d','#4d9dff','#ffd23f','#7ac943'])]);c.put(p,n)}
  else c.put([[G.cyl(u*.01,u*.01,u*.04,5),'#8b5e3c'],[at(G.sph(u*.05,8,6),0,u*.07),'#3fae49']],n)}},
 auto:{ground:['#26262b','#1c1c20'],skipEquator:.2,block(c,n,u,r){const k=r();
  if(k<.38)c.put([[G.box(u*.18,u*.08,u*.12),'#1a1a1d'],[at(G.box(u*.184,u*.012,u*.124),0,u*.06),'#ff3b30','glow'],[at(G.box(u*.04,u*.05,u*.004),-u*.045,0,u*.061),'#3a3a40'],[at(G.box(u*.04,u*.05,u*.004),u*.045,0,u*.061),'#3a3a40']],n)
  else if(k<.55)c.put([[at(G.box(u*.26,u*.06,u*.09),0,0,0,0,0,-.35),'#e10600'],[at(G.box(u*.26,u*.01,u*.1),0,u*.07),'#f2f2f2']],n)
  else if(k<.72){const p=[];for(let i=0;i<4;i++)p.push([at(G.torus(u*.025,u*.012),0,u*.012+i*u*.024,0,0,0,Math.PI/2),i%2?'#e10600':'#111111']);c.put(p,n)}
  else if(k<.88)c.put([[G.box(u*.1,u*.025,u*.05),'#e10600'],[at(G.box(u*.05,u*.02,u*.04),-u*.01,u*.025),'#111111'],[at(G.box(u*.004,u*.01,u*.012),u*.05,u*.012,-u*.015),'#ffb400','glow'],[at(G.box(u*.004,u*.01,u*.012),u*.05,u*.012,u*.015),'#ffb400','glow']],n)
  else c.put([[G.cyl(u*.006,u*.008,u*.3,6),'#45454d'],[at(G.box(u*.06,u*.03,u*.02),0,u*.3),'#fff1c1','glow']],n)},
  extra(c,u,spin){ // race track around the equator
   const band=new THREE.Mesh(new THREE.CylinderGeometry(u*1.012,u*1.012,u*.14,96,1,true),new THREE.MeshStandardMaterial({color:'#34343a',roughness:.9,side:THREE.DoubleSide}));spin.add(band);
   for(let i=0;i<72;i++){const a=i/72*Math.PI*2,n=new V3(Math.cos(a),0,Math.sin(a));const col=i%2?'#ffffff':'#e10600';
    c.put([[at(G.box(u*.05,u*.012,u*.02),0,0,u*.065),col],[at(G.box(u*.05,u*.012,u*.02),0,0,-u*.065),col]],n,{yaw:Math.PI/2-a,lift:u*.008});
    if(i%2)c.put([[G.box(u*.03,u*.006,u*.006),'#fff6d0','glow']],n,{yaw:Math.PI/2-a,lift:u*.01})}}},
 future:{ground:['#0b0f22','#131c3d'],lines:'#00e5ff',grid:'#ff2bd6',block(c,n,u,r){const k=r();
  if(k<.5){const h=u*(.3+r()*.4),p=[[G.cyl(u*.012,u*.05,h,6),'#1b2340']];for(let y=h*.2;y<h*.9;y+=h*.18)p.push([at(G.cyl(u*.04*(1-y/h)+u*.014,u*.04*(1-y/h)+u*.014,u*.008,6),0,y),r()<.5?'#00e5ff':'#ff2bd6','glow']);p.push([at(G.sph(u*.014,6,4),0,h),'#ffffff','glow']);c.put(p,n)}
  else if(k<.74)c.put([[G.dome(u*.1),'#1b2340'],[at(G.torus(u*.1,u*.006),0,u*.004,0,0,0,Math.PI/2),'#00e5ff','glow'],[at(G.torus(u*.07,u*.004),0,u*.07,0,0,0,Math.PI/2),'#ff2bd6','glow']],n)
  else if(k<.9)c.put(outline([[G.cyl(u*.06,u*.06,u*.25,6),'#141b33']]),n)
  else c.put([[G.cyl(u*.004,u*.004,u*.3,4),'#9aa3c7'],[at(G.sph(u*.012,6,4),0,u*.3),'#ff2bd6','glow']],n)},
  extra(c,u,spin,holder){const ring=new THREE.Mesh(new THREE.RingGeometry(u*1.5,u*1.95,96),new THREE.MeshBasicMaterial({color:'#00e5ff',transparent:true,opacity:.32,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false}));
   ring.rotation.x=-Math.PI/2;spin.add(ring);const ring2=new THREE.Mesh(new THREE.RingGeometry(u*2.02,u*2.08,96),ring.material.clone());ring2.material.color.set('#ff2bd6');ring2.material.opacity=.5;ring2.rotation.x=-Math.PI/2;spin.add(ring2)}},
};

/* Terrain palette per world: sea, shore, lowland→highland, rock, snow, roads, lights, landmark colours */
const PAL={
 modern:{sea:['#23358f','#5e9bff'],sand:'#ecebff',land:['#d9dcfb','#a59ded'],rock:'#7b6fd6',snow:'#ffffff',road:'#c9ccee',glow:'#9ef5e5',lm:['#f4f5ff','#6c5ce7','#9ef5e5']},
 elegant:{sea:['#1f444d','#5f9ea0'],sand:'#efe3c8',land:['#d8c9a3','#a8956a'],rock:'#8a7356',snow:'#fffaf0',road:'#e9dcc2',glow:'#ffd58a',lm:['#f6efe4','#efe6d8','#ffd58a']},
 hospital:{sea:['#06606d','#5fd3dc'],sand:'#f2fbf8',land:['#cdeee3','#8fd1b8'],rock:'#78a89a',snow:'#ffffff',road:'#ffffff',glow:'#9ff3ff',lm:['#ffffff','#e9f8fa','#e5383b']},
 salon:{sea:['#222c55','#7d9be0'],sand:'#f6e3ea',land:['#efc9d7','#c98aa8'],rock:'#6e5a7a',snow:'#ffffff',road:'#3a3f55',glow:'#ffd27a',lm:['#22304a','#f7c6d6','#ffd27a']},
 illus:{sea:['#1a6f66','#7fd8cc'],sand:'#fff4d6',land:['#f7e3b0','#e9b872'],rock:'#e76f51',snow:'#ffffff',road:'#243b4a',glow:'#ffd166',lm:['#ffd6a5','#f4c430','#ffd166']},
 mandala:{sea:['#064f51','#2fae9f'],sand:'#ffe2a6',land:['#f6c96b','#e39a2f'],rock:'#c8391f',snow:'#fff4e0',road:'#b3205e',glow:'#ffb347',lm:['#c8391f','#f2a516','#ffd34d']},
 interior:{sea:['#24525e','#6fb0b8'],sand:'#e9dfc9',land:['#b6bd98','#86926a'],rock:'#8b6b4a',snow:'#f3ece0',road:'#d9c7ad',glow:'#ffd27a',lm:['#efe6d6','#b08560','#ffd27a']},
 arch:{sea:['#051b36','#1a4f8f'],sand:'#2a6bb3',land:['#164e8c','#2b6cb0'],rock:'#5c9be0',snow:'#d6e8ff',road:'#cfe3ff',glow:'#cfe3ff',lm:['#12406f','#174a80','#cfe3ff'],grid:'#8bbcff'},
 funny:{sea:['#1495b8','#7fe7ff'],sand:'#fff3a3',land:['#ffe45e','#ffb703'],rock:'#ff5d8f',snow:'#ffffff',road:'#a06cd5',glow:'#ff5d8f',lm:['#ff5d8f','#3ec6e0','#ffe45e']},
 kids:{sea:['#2a6fd0','#8fc8ff'],sand:'#fff1b8',land:['#8fdc5e','#4fae3a'],rock:'#ffb347',snow:'#ffffff',road:'#ffd23f',glow:'#fff3b0',lm:['#ff4d4d','#4d9dff','#ffd23f']},
 auto:{sea:['#101b26','#2c4a63'],sand:'#d99a5c',land:['#c2793e','#8a4b25'],rock:'#5a3420',snow:'#f2f2f2',road:'#2a2a2e',glow:'#ff3b30',lm:['#1a1a1d','#e10600','#ffb400'],amp:.05},
 future:{sea:['#04050c','#0f1530'],sand:'#1b2340',land:['#141b33','#232f5c'],rock:'#1fd6ff',snow:'#ff2bd6',road:'#00e5ff',glow:'#00e5ff',lm:['#141b33','#1b2340','#00e5ff'],grid:'#ff2bd6'},
};

/* ---------- planets: a plain textured sphere in orbit; a detailed living world on hover ---------- */
// Sizes vary like a real system: small inner worlds, giants beyond the asteroid belt
const SIZES=[.65,.72,.78,.65,.75,.83,1.24,1.12,.91,1.04,.81,.96],BELT_AFTER=5;
const ORBITS=[];{let r=SUN_R+1.35+SIZES[0];for(let i=0;i<12;i++){if(i){r+=(SIZES[i-1]+SIZES[i])*.62+.08;if(i===BELT_AFTER+1)r+=.8}ORBITS.push(r)}}
const BELT=[ORBITS[BELT_AFTER]+SIZES[BELT_AFTER]*.7,ORBITS[BELT_AFTER+1]-SIZES[BELT_AFTER+1]*.7],LAST=ORBITS[11]+SIZES[11];
const DETAIL=small?20:30;

function terrain(seed,R,pal){
 const N=makeNoise(seed),amp=pal.amp??.09,off=seed%97;
 const h=n=>{let a=0,s=0,am=1,f=1.5;for(let o=0;o<5;o++){a+=am*N(n.x*f+off,n.y*f,n.z*f);s+=am;am*=.5;f*=2.07}return a/s*1.9-.06};
 const rad=n=>{const v=h(n);return R*(1+(v>0?v*amp:v*.03))};
 const C=x=>new THREE.Color(x),sea0=C(pal.sea[0]),sea1=C(pal.sea[1]),sand=C(pal.sand),l0=C(pal.land[0]),l1=C(pal.land[1]),rock=C(pal.rock),snow=C(pal.snow);
 const color=(n,v,out)=>{
  if(v<0)out.copy(sea0).lerp(sea1,clamp(1+v*2.2,0,1));
  else if(v<.04)out.copy(sand);
  else if(v<.42)out.copy(l0).lerp(l1,(v-.04)/.38);
  else if(v<.6)out.copy(l1).lerp(rock,(v-.42)/.18);
  else out.copy(rock).lerp(snow,clamp((v-.6)/.12,0,1));
  if(Math.abs(n.y)>.9&&v>-.15)out.lerp(snow,clamp((Math.abs(n.y)-.9)*12,0,1));
  return out};
 return {h,rad,color};
}
function cloudCanvas(seed,w,h){const N=makeNoise(seed+500),c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d'),img=g.createImageData(w,h),v=new V3();
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const lon=x/w*Math.PI*2,lat=(y/h-.5)*Math.PI;v.set(Math.cos(lat)*Math.cos(lon),Math.sin(lat),Math.cos(lat)*Math.sin(lon));
  let a=0,am=1,f=2.2,s=0;for(let o=0;o<4;o++){a+=am*N(v.x*f,v.y*f*1.6,v.z*f);s+=am;am*=.5;f*=2.1}a=clamp((a/s*1.8-.32)*2.2,0,1);const i=(y*w+x)*4;img.data[i]=img.data[i+1]=img.data[i+2]=255;img.data[i+3]=a*235}
 g.putImageData(img,0,0);return c}
function surfaceTexture(t,w,hh,clouds){
 const c=document.createElement('canvas');c.width=w;c.height=hh;const g=c.getContext('2d'),img=g.createImageData(w,hh),v=new V3(),col=new THREE.Color();
 for(let y=0;y<hh;y++)for(let x=0;x<w;x++){const lon=x/w*Math.PI*2,lat=(.5-y/hh)*Math.PI;v.set(-Math.cos(lat)*Math.cos(lon),Math.sin(lat),Math.cos(lat)*Math.sin(lon));
  t.color(v,t.h(v),col).convertLinearToSRGB();const i=(y*w+x)*4;img.data[i]=col.r*255;img.data[i+1]=col.g*255;img.data[i+2]=col.b*255;img.data[i+3]=255}
 g.putImageData(img,0,0);g.globalAlpha=.55;g.drawImage(clouds,0,0,w,hh);
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;return tex}
const atmoMat=hex=>new THREE.ShaderMaterial({...additive,uniforms:{uC:{value:new THREE.Color(hex)},uI:{value:1}},
 vertexShader:`varying vec3 vN;varying vec3 vV;void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
 fragmentShader:`uniform vec3 uC;uniform float uI;varying vec3 vN;varying vec3 vV;void main(){float f=pow(1.-abs(dot(vN,vV)),2.8);gl_FragColor=vec4(uC,f*.6*uI);}`});
function gridLines(R,color,op){const pts=[];const ring=f=>{for(let i=0;i<96;i++)pts.push(f(i/96),f((i+1)/96))};
 for(let lat=-60;lat<=60;lat+=20){const y=Math.sin(deg(lat))*R,r=Math.cos(deg(lat))*R;ring(t=>new V3(Math.cos(t*6.283)*r,y,Math.sin(t*6.283)*r))}
 for(let lon=0;lon<360;lon+=20){const a=deg(lon);ring(t=>{const p=t*Math.PI-Math.PI/2;return new V3(Math.cos(p)*Math.cos(a)*R,Math.sin(p)*R,Math.cos(p)*Math.sin(a)*R)})}
 return new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color,transparent:true,opacity:op,toneMapped:false}))}
// road ribbon that follows the ground (and becomes a bridge over water)
function ribbon(path,width,rad,lift,color,glow){
 const pos=[],idx=[],t=new V3(),s=new V3();
 path.forEach((n,i)=>{const a=path[Math.max(0,i-1)],b=path[Math.min(path.length-1,i+1)];t.subVectors(b,a).normalize();s.crossVectors(n,t).normalize().multiplyScalar(width/2);
  const p=n.clone().multiplyScalar(rad(n)+lift);pos.push(p.x+s.x,p.y+s.y,p.z+s.z,p.x-s.x,p.y-s.y,p.z-s.z);if(i)idx.push(i*2-2,i*2-1,i*2,i*2-1,i*2+1,i*2)});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
 return new THREE.Mesh(g,glow?new THREE.MeshBasicMaterial({color,toneMapped:false,side:THREE.DoubleSide}):new THREE.MeshStandardMaterial({color,roughness:.8,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2}))}
function arc(a,b,steps){const out=[],om=Math.acos(clamp(a.dot(b),-1,1));for(let i=0;i<=steps;i++){const t=i/steps;out.push(om<1e-4?a.clone():a.clone().multiplyScalar(Math.sin((1-t)*om)/Math.sin(om)).add(b.clone().multiplyScalar(Math.sin(t*om)/Math.sin(om))).normalize())}return out}
function tangentJitter(c,ang,r){const a=new V3().crossVectors(c,Math.abs(c.y)<.9?Y:X).normalize(),b=new V3().crossVectors(c,a);const th=r()*Math.PI*2,d=ang*Math.sqrt(r());return c.clone().add(a.multiplyScalar(Math.cos(th)*Math.sin(d))).add(b.multiplyScalar(Math.sin(th)*Math.sin(d))).normalize()}
let shipGeo=null;
function makeShip(color){
 if(!shipGeo){const body=new THREE.ConeGeometry(.3,1.6,6).rotateX(Math.PI/2),wing=new THREE.BoxGeometry(1.4,.07,.5).translate(0,0,-.2),fin=new THREE.BoxGeometry(.07,.45,.4).translate(0,.22,-.5);shipGeo=mergeGeometries([body,wing,fin])}
 const s=new THREE.Group();s.add(new THREE.Mesh(shipGeo,new THREE.MeshStandardMaterial({color:'#e9edf5',roughness:.35,metalness:.6})));
 const e=new THREE.Mesh(new THREE.SphereGeometry(.22,10,8),new THREE.MeshBasicMaterial({color,toneMapped:false}));e.position.z=-.85;s.add(e);return s}

function buildDetail(p){
 const {R,id,t,pal}=p,th=THEMES[id],r=rng(7000+p.i*13);
 const grp=new THREE.Group(),spinPart=new THREE.Group(),still=new THREE.Group();grp.add(spinPart,still);
 // terrain with real relief
 let g=new THREE.IcosahedronGeometry(R,DETAIL);g.deleteAttribute('uv');g.deleteAttribute('normal');g=mergeVertices(g);
 const P=g.attributes.position,cols=new Float32Array(P.count*3),n=new V3(),c=new THREE.Color();
 for(let i=0;i<P.count;i++){n.fromBufferAttribute(P,i).normalize();const v=t.h(n);P.setXYZ(i,...n.clone().multiplyScalar(t.rad(n)).toArray());t.color(n,v,c);cols.set([c.r,c.g,c.b],i*3)}
 g.setAttribute('color',new THREE.BufferAttribute(cols,3));g.computeVertexNormals();
 spinPart.add(new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92})));
 spinPart.add(new THREE.Mesh(new THREE.SphereGeometry(R*1.002,64,48),new THREE.MeshStandardMaterial({color:pal.sea[1],roughness:.18,metalness:.25,transparent:true,opacity:.55})));
 if(pal.grid)spinPart.add(gridLines(R*1.012,pal.grid,.5));
 // towns on land, a capital with a landmark spire, roads between them
 const land=v=>{const x=t.h(v);return x>.05&&x<.45&&!(id==='auto'&&Math.abs(v.y)<.09)};
 const towns=[];for(let k=0;k<600&&!towns.length;k++){const v=new V3(gauss(r),gauss(r)*.4+.25,gauss(r)).normalize();if(land(v)&&Math.abs(v.y)<.6&&land(tangentJitter(v,.2,r)))towns.push(v)}
 for(let k=0;k<400&&towns.length<(small?4:6);k++){const v=new V3(gauss(r),gauss(r),gauss(r)).normalize();if(land(v)&&towns.every(o=>o.angleTo(v)>.7))towns.push(v)}
 if(!towns.length)towns.push(new V3(0,1,0));
 const u=R*.4,city=new City(R,9000+p.i,t.rad),used=[];
 const cap=towns[0],[c0,c1,c2]=pal.lm;
 city.put([[G.cyl(u*.55,u*.65,u*.16,20),c0],[at(G.cyl(u*.16,u*.26,u*1.25,12),0,u*.16),c1],[at(G.torus(u*.3,u*.025),0,u*.75,0,0,0,Math.PI/2),c2,'glow'],[at(G.torus(u*.22,u*.02),0,u*1.05,0,0,0,Math.PI/2),c2,'glow'],
  [at(G.cone(u*.14,u*.8,12),0,u*1.41),c1],[at(G.sph(u*.05,8,6),0,u*2.21),c2,'glow'],...[0,1,2,3].map(k=>[at(G.cyl(u*.07,u*.09,u*.7,8),Math.cos(k*1.571)*u*.42,u*.16,Math.sin(k*1.571)*u*.42),c1])],cap,{yaw:0,hs:.55});
 used.push(cap);
 towns.forEach((tc,ti)=>{const count=ti?(small?20:34):(small?90:150),spread=ti?.26:.5,gap=ti?.075:.062;
  for(let k=0;k<count*3&&count>0;k++){const v=tangentJitter(tc,spread,r);if(!land(v)||used.some(o=>o.angleTo(v)<gap))continue;used.push(v);const near=ti?1:1.45-.6*v.angleTo(tc)/spread;th.block(city,v,u*near,city.rnd)}});
 spinPart.add(city.build(th.lines));
 const lift=R*.006;
 towns.slice(1).forEach(tc=>spinPart.add(ribbon(arc(cap,tc,60),R*.035,v=>Math.max(t.rad(v),R*1.002),lift,pal.road,pal.glow===pal.road)));
 const ring=[];{const a=new V3().crossVectors(cap,Math.abs(cap.y)<.9?Y:X).normalize(),b=new V3().crossVectors(cap,a);for(let k=0;k<=72;k++){const th2=k/72*Math.PI*2;ring.push(cap.clone().multiplyScalar(Math.cos(.47)).add(a.clone().multiplyScalar(Math.cos(th2)*Math.sin(.47))).add(b.clone().multiplyScalar(Math.sin(th2)*Math.sin(.47))).normalize())}}
 spinPart.add(ribbon(ring,R*.03,v=>Math.max(t.rad(v),R*1.002),lift,pal.road));
 spinPart.add(ribbon(ring,R*.008,v=>Math.max(t.rad(v),R*1.002),lift*1.4,pal.glow,true));
 if(id==='auto'){const eq=[];for(let k=0;k<=160;k++){const a=k/160*Math.PI*2;eq.push(new V3(Math.cos(a),0,Math.sin(a)))}const rr=v=>Math.max(t.rad(v),R*1.002);
  spinPart.add(ribbon(eq,R*.09,rr,lift,'#2a2a2e'));spinPart.add(ribbon(eq.map(v=>v.clone().setY(.042).normalize()),R*.012,rr,lift*1.3,'#ffffff',true));spinPart.add(ribbon(eq.map(v=>v.clone().setY(-.042).normalize()),R*.012,rr,lift*1.3,'#e10600',true))}
 // clouds
 const ctex=new THREE.CanvasTexture(cloudCanvas(p.i,small?256:512,small?128:256));
 const clouds=new THREE.Mesh(new THREE.SphereGeometry(R*1.075,64,48),new THREE.MeshStandardMaterial({color:'#ffffff',alphaMap:ctex,transparent:true,opacity:id==='future'||id==='arch'?.18:.42,depthWrite:false,roughness:1}));
 spinPart.add(clouds);
 // ships on inclined orbits
 const ships=[];for(let k=0;k<(small?3:5);k++){const piv=new THREE.Group();piv.rotation.set((r()-.5)*1.4,r()*6.28,(r()-.5)*1.4);const s=makeShip(pal.glow);s.scale.setScalar(R*.055);s.position.set(R*(1.3+r()*.45),0,0);s.rotation.y=Math.PI;piv.add(s);still.add(piv);ships.push({piv,w:(.35+r()*.5)*(r()<.5?1:-1)});if(ships[ships.length-1].w<0)s.rotation.y=0}
 p.capital=cap.clone();
 return {grp,spinPart,still,clouds,ships};
}

/* Equirectangular artwork per world (2:1). The generated surface stays as a placeholder until the image loads. */
const PLANET_TEX=PLANET_IMAGES; // set in content.js
const PLANET_GLOW=glowTex([[0,'rgba(255,255,255,.9)'],[.3,'rgba(255,255,255,.55)'],[.36,'rgba(255,255,255,.32)'],[.6,'rgba(255,255,255,.08)'],[1,'rgba(255,255,255,0)']]);
const texLoader=new THREE.TextureLoader();
function shipsFor(p){const r=rng(7000+p.i*13),still=new THREE.Group(),ships=[];
 for(let k=0;k<(small?3:5);k++){const piv=new THREE.Group();piv.rotation.set((r()-.5)*1.4,r()*6.28,(r()-.5)*1.4);const s=makeShip(PLANET_ACCENT[p.id]);s.scale.setScalar(p.R*.055);s.position.set(p.R*(1.3+r()*.45),0,0);s.rotation.y=Math.PI;piv.add(s);still.add(piv);const w=(.35+r()*.5)*(r()<.5?1:-1);if(w<0)s.rotation.y=0;ships.push({piv,w})}
 return {grp:new THREE.Group(),still,ships,spinPart:new THREE.Group(),clouds:new THREE.Group()}}
const planets=WORLDS.map((w,i)=>{
 const pr=rng(101+i*17),R=SIZES[i],r=ORBITS[i],pal=PAL[w.id],t=terrain(31+i*7,R,pal);
 const pivot=new THREE.Group();pivot.rotation.set((pr()-.5)*.05,0,(pr()-.5)*.05);system.add(pivot);
 const holder=new THREE.Group();pivot.add(holder);
 const body=new THREE.Group();body.rotation.z=(pr()-.5)*.5;holder.add(body);
 const spin=new THREE.Group();body.add(spin);
 const simple=new THREE.Mesh(new THREE.SphereGeometry(R,64,40),new THREE.MeshStandardMaterial({map:surfaceTexture(t,small?256:384,small?128:192,cloudCanvas(i,128,64)),roughness:.85}));spin.add(simple);
 const atmo=new THREE.Sprite(new THREE.SpriteMaterial({...additive,map:PLANET_GLOW,color:new THREE.Color(PLANET_ACCENT[w.id]).lerp(new THREE.Color('#ffffff'),.35),opacity:.45}));atmo.scale.set(R*3.1,R*3.1,1);holder.add(atmo);
 let textured=false;
 if(PLANET_TEX[w.id])texLoader.load(PLANET_TEX[w.id],tex=>{tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());simple.material.map=tex;simple.material.roughness=.9;simple.material.needsUpdate=true;textured=true;planetObj.textured=true;if(planetObj.detail&&planetObj.detail.grp){planetObj.spin.remove(planetObj.detail.spinPart);planetObj.body.remove(planetObj.detail.still);planetObj.detail=null}planetObj.capital=new V3(1,0,0)});
 const planetObj={w,id:w.id,i,R,r,t,pal,pivot,holder,body,spin,simple,atmo,detail:null,textured:false,angle:i*2.399963+.7,omega:.34*Math.pow(r/ORBITS[0],-1.5),scale:1,hl:0,grow:1};
 return planetObj;
});
function ensureDetail(p){if(p.detail)return;p.detail=p.textured?shipsFor(p):buildDetail(p);p.detail.grp.visible=false;p.spin.add(p.detail.spinPart);p.body.add(p.detail.still);p.detail.spinPart.visible=p.detail.still.visible=false}
let buildQ=[];
function queueDetails(){buildQ=planets.filter(p=>!p.detail);const next=()=>{const p=buildQ.shift();if(!p)return;if(state.phase==='system'&&active()<0)ensureDetail(p);else buildQ.unshift(p);setTimeout(next,small?700:350)};setTimeout(next,600)}

/* ---------- asteroid belt + Kuiper belt ---------- */
function rockGeo(seed){const N=makeNoise(seed);let g=new THREE.IcosahedronGeometry(1,1);g.deleteAttribute('uv');g.deleteAttribute('normal');g=mergeVertices(g);const P=g.attributes.position,v=new V3();
 for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i);const k=1+N(v.x*1.7,v.y*1.7,v.z*1.7)*.55;P.setXYZ(i,v.x*k,v.y*k*.8,v.z*k)}const ng=g.toNonIndexed();ng.computeVertexNormals();return ng}
function belt(rIn,rOut,count,thick,sMin,sMax,cols,dustCol,dustN){
 const grp=new THREE.Group(),mat=new THREE.MeshStandardMaterial({roughness:.95,flatShading:true}),m=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),c=new THREE.Color();
 for(let k=0;k<3;k++){const geo=rockGeo(70+k);geo.computeVertexNormals();const n=Math.floor(count/3),im=new THREE.InstancedMesh(geo,mat,n);
  for(let i=0;i<n;i++){const rr=lerp(rIn,rOut,clamp(.5+gauss()*.22,0,1)),a=R0()*Math.PI*2,s=sMin+(sMax-sMin)*Math.pow(R0(),3.2);
   q.setFromEuler(e.set(R0()*6,R0()*6,R0()*6));m.compose(new V3(Math.cos(a)*rr,gauss()*thick,Math.sin(a)*rr),q,new V3(s,s*(.6+R0()*.5),s*(.7+R0()*.4)));im.setMatrixAt(i,m);im.setColorAt(i,c.set(pick(R0,cols)).multiplyScalar(.7+R0()*.5))}
  grp.add(im)}
 const p=[],cc=[],sz=[],dc=new THREE.Color(dustCol);for(let i=0;i<dustN;i++){const rr=lerp(rIn,rOut,R0()),a=R0()*Math.PI*2;p.push(Math.cos(a)*rr,gauss()*thick*1.4,Math.sin(a)*rr);const b=.3+R0()*.7;cc.push(dc.r*b,dc.g*b,dc.b*b);sz.push(.6+R0()*1.4)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('aColor',new THREE.Float32BufferAttribute(cc,3));g.setAttribute('aSize',new THREE.Float32BufferAttribute(sz,1));
 const dm=new THREE.ShaderMaterial({...additive,uniforms:{uPR:{value:PR}},vertexShader:`attribute float aSize;attribute vec3 aColor;uniform float uPR;varying vec3 vC;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(aSize*60./-mv.z,1.,3.)*uPR;vC=aColor;}`,
  fragmentShader:`varying vec3 vC;void main(){vec2 c=gl_PointCoord-.5;float a=exp(-dot(c,c)*14.);if(a<.02)discard;gl_FragColor=vec4(vC,a*.8);}`});
 grp.add(new THREE.Points(g,dm));system.add(grp);return grp}
const asteroidBelt=belt(BELT[0],BELT[1],small?600:1200,.18,.025,.13,['#8b7d6b','#6e6458','#a08c74','#5b5048'],'#c9b9a0',small?1500:3000);
const kuiperBelt=belt(LAST+1.1,LAST+4.2,small?900:1800,.45,.03,.17,['#8c96aa','#6f7891','#a9b2c6','#5d6378'],'#8f6bff',small?2500:5000);

/* ---------- views ---------- */
let portrait=false,planetBase=1;
function galaxyView(){const a=camera.aspect,vh=deg(camera.fov/2),hh=Math.atan(Math.tan(vh)*a);const D=Math.max(GR*.9/Math.tan(hh),GR*.62/Math.tan(vh));const el=deg(40);
 const pos=new V3(0,Math.sin(el)*D,Math.cos(el)*D),tg=new V3(0,-30,0);const dir=tg.clone().sub(pos).normalize();
 return {pos,target:tg,up:Y.clone().applyAxisAngle(dir,deg(portrait?0:-13))}}
const fitCam=new THREE.PerspectiveCamera(),fitPts=[];
function systemView(){
 system.getWorldPosition(sysWorld);
 const el=deg(portrait?26:33),up=portrait?new V3(1,0,0):new V3(0,1,0),dir=new V3(0,Math.sin(el),Math.cos(el));
 const ext=LAST+.3;fitPts.length=0;
 for(let i=0;i<48;i++){const a=i/48*Math.PI*2;fitPts.push(new V3(Math.cos(a)*ext,0,Math.sin(a)*ext).add(sysWorld))}
 fitPts.push(sysWorld.clone().add(new V3(0,2.2,0)));
 fitCam.fov=camera.fov;fitCam.aspect=camera.aspect;fitCam.near=camera.near;fitCam.far=camera.far;fitCam.updateProjectionMatrix();
 const tgt=sysWorld.clone(),lim=portrait?1.03:1.1,q=new V3();let d=8;
 const measure=()=>{fitCam.position.copy(tgt).addScaledVector(dir,d);fitCam.up.copy(up);fitCam.lookAt(tgt);fitCam.updateMatrixWorld();
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const p of fitPts){q.copy(p).project(fitCam);x0=Math.min(x0,q.x);x1=Math.max(x1,q.x);y0=Math.min(y0,q.y);y1=Math.max(y1,q.y)}return {x0,x1,y0,y1}};
 for(let it=0;it<140;it++){const m=measure();if((m.x1-m.x0)/2<=lim&&(m.y1-m.y0)/2<=lim)break;d*=1.03}
 for(let it=0;it<3;it++){const m=measure(),cx=(m.x0+m.x1)/2,cy=(m.y0+m.y1)/2,hv=d*Math.tan(deg(fitCam.fov/2)),hh=hv*fitCam.aspect;
  tgt.addScaledVector(new V3().setFromMatrixColumn(fitCam.matrixWorld,0),cx*hh).addScaledVector(new V3().setFromMatrixColumn(fitCam.matrixWorld,1),cy*hv)}
 return {pos:tgt.clone().addScaledVector(dir,d),target:tgt.clone(),up};
}
function applyView(v){camera.position.copy(v.pos);target.copy(v.target);camera.up.copy(v.up);camera.lookAt(target)}
function resize(){
 const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);composer.setPixelRatio(PR);composer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();if(photo.visible)layoutPhoto();
 portrait=innerHeight>innerWidth*1.1||(screen.orientation?.type||'').startsWith('portrait')&&innerHeight>innerWidth;planetBase=portrait?1.25:1;
 if(state.phase==='system')applyView(systemView());
 if(state.phase==='intro')applyView(galaxyView());
}

/* ---------- state, tweens ---------- */
const state={phase:'intro',hover:-1,sel:-1,focus:-1,speed:1,spin:.02,last:-1,near:null};
const tweens=[];
const tween=(dur,fn,ease)=>new Promise(res=>tweens.push({t:0,dur,fn,res,ease}));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const show=(el,on)=>{el.classList.toggle('in',on);el.classList.toggle('out',!on)};
const GALAXY_IMG="",GALAXY_CORE=[.54,.43],GALAXY_ASPECT=1672/941; // core position in the photo (u, v from top)
const photo=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthTest:false,depthWrite:false,toneMapped:false}));
photo.renderOrder=-10;photo.position.z=-50;photo.visible=false;camera.add(photo);
let photoMode=false,photoZoom=0;
const photoReady=GALAXY_IMG&&new Promise(res=>{texLoader.load(GALAXY_IMG,t=>{t.colorSpace=THREE.SRGBColorSpace;photo.material.map=t;photo.material.needsUpdate=true;res(true)},undefined,()=>res(false));setTimeout(()=>res(false),2500)});
function layoutPhoto(){const h=2*50*Math.tan(deg(camera.fov/2)),w=h*camera.aspect,W=Math.max(w,h*GALAXY_ASPECT),H=W/GALAXY_ASPECT,s=1+photoZoom*2.6,k=easeInOut(Math.min(1,photoZoom*1.4));
 photo.scale.set(W*s,H*s,1);photo.position.x=-(GALAXY_CORE[0]-.5)*W*s*k;photo.position.y=-(.5-GALAXY_CORE[1])*H*s*k}
let galaxyLevel=0;
const setFade=v=>{if(photoMode){photo.material.opacity=v;driftMat.uniforms.uOpacity.value=v*.55;return}galaxyLevel=v;galaxyMat.uniforms.uOpacity.value=v;dustMat.uniforms.uOpacity.value=v;bgMat.uniforms.uOpacity.value=Math.min(1,v*1.2);driftMat.uniforms.uOpacity.value=v*.55;discGlow.material.opacity=v*.42;coreGlow.material.opacity=v*.7;sparkles.forEach(s=>s.material.opacity=Math.min(1,v*1.2))};

async function intro(){
 applyView(galaxyView());beacon.material.opacity=1;
 photoMode=false;
 const T=reduce?.5:1;
 await tween(1800*T,e=>setFade(e));
 await wait(300*T);
 const hoi=$('introHoi'),wel=$('introWelcome');
 // dim the galaxy behind both greetings so the words read clearly
 introEl.classList.add('dim');tween(700*T,e=>setFade(1-.5*e));await wait(300*T);
 show(hoi,true);await wait(2000*T);show(hoi,false);await wait(900*T);
 show(wel,true);await wait(3000*T);show(wel,false);introEl.classList.remove('dim');
 tween(800*T,e=>setFade(.5+.5*e));await wait(800*T);
 await zoomIn(reduce?1400:5200);
 try{sessionStorage.setItem('devocrat-intro','1')}catch(_){}
}
async function zoomIn(dur){
 state.phase='zoom';const g0=galaxyView(),t0=g0.target.clone(),s0=state.spin,fromPhoto=photoMode;
 if(fromPhoto){photoMode=false;setFade(1)}
 const d0=g0.pos.clone().sub(t0),len0=d0.length();d0.normalize();
 await tween(dur,(p,raw)=>{
  state.spin=s0*(1-clamp(raw/.6,0,1));
  const sv=systemView(),d1=sv.pos.clone().sub(sv.target),len1=d1.length();d1.normalize();
  const tp=easeInOut(clamp(raw/.75,0,1));target.lerpVectors(t0,sv.target,tp);
  const q=new THREE.Quaternion().setFromUnitVectors(d0,d1),qi=new THREE.Quaternion().slerp(q,p);
  camera.position.copy(target).addScaledVector(d0.clone().applyQuaternion(qi),Math.exp(lerp(Math.log(len0),Math.log(len1),p)));
  camera.up.copy(g0.up).lerp(sv.up,p).normalize();camera.lookAt(target);
  galaxyMat.uniforms.uClear.value=dustMat.uniforms.uClear.value=lerp(0,120,clamp((raw-.45)/.4,0,1));
  beacon.material.opacity=1-clamp((raw-.62)/.25,0,1);
  coreGlow.material.opacity=.7-.35*p;discGlow.material.opacity=.42*(1-p*.8);
  dustMat.uniforms.uOpacity.value=1-.6*clamp((raw-.5)/.4,0,1);
  driftMat.uniforms.uOpacity.value=.55+.45*Math.sin(raw*Math.PI);
  if(fromPhoto){const f=clamp(raw/.4,0,1);photoZoom=raw*.9;layoutPhoto();photo.material.opacity=1-easeInOut(clamp(raw/.42,0,1));photo.visible=raw<.43;
   galaxyMat.uniforms.uOpacity.value=f;dustMat.uniforms.uOpacity.value*=f;bgMat.uniforms.uOpacity.value=f;sparkles.forEach(s=>s.material.opacity=f);coreGlow.material.opacity*=f;discGlow.material.opacity*=f}
 },easeInOut);
 photo.visible=false;
 arrive();
}
async function quickArrive(){ // later visits in the same session
 setFade(1);state.spin=0;galaxyMat.uniforms.uClear.value=dustMat.uniforms.uClear.value=120;dustMat.uniforms.uOpacity.value=.4;beacon.material.opacity=0;coreGlow.material.opacity=.35;discGlow.material.opacity=.08;
 const sv=systemView(),far=sv.pos.clone().sub(sv.target).multiplyScalar(2.6).add(sv.target);state.phase='zoom';
 await tween(reduce?300:1800,p=>{camera.position.lerpVectors(far,sv.pos,p);target.copy(sv.target);camera.up.copy(sv.up);camera.lookAt(target)},easeOut);
 arrive();
}
let firstArrive=true;
function arrive(){state.phase='system';applyView(systemView());hint.textContent=touchUI?'Tap a planet to pause & see its world · tap it again to enter':'Hover a planet to pause & see its world · click to enter';hint.classList.add('show');if(firstArrive){firstArrive=false;queueDetails()}}

/* ---------- picking, label, entering ---------- */
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2(),tmp=new V3();
// strict hit test against the planet as drawn on screen (no extra margin)
function onPlanet(i,x,y){const p=planets[i];p.holder.getWorldPosition(tmp);const c=tmp.clone().project(camera),cx=(c.x+1)/2*innerWidth,cy=(1-c.y)/2*innerHeight;return Math.hypot(x-cx,y-cy)<=pxRadius(p,p.scale)*1.02}
function pickAt(x,y,touch){
 ndc.set(x/innerWidth*2-1,-(y/innerHeight)*2+1);ray.setFromCamera(ndc,camera);let best=-1,bt=Infinity;
 // nearest planet to the pointer (relative to its size), not nearest to the camera
 planets.forEach((p,i)=>{p.holder.getWorldPosition(tmp);const hr=p.R*p.scale*(touch?2:1.4),d=ray.ray.distanceSqToPoint(tmp)/(hr*hr);if(d<=1&&d<bt){bt=d;best=i}});
 return best;
}
const active=()=>state.hover>=0?state.hover:state.sel>=0?state.sel:state.focus;
let shown=-1;
function pxRadius(p,scale){p.holder.getWorldPosition(tmp);const d=camera.position.distanceTo(tmp);return p.R*scale*innerHeight/(2*d*Math.tan(deg(camera.fov/2)))}
function updateLabel(){
 const i=state.phase==='system'?active():-1;
 // the cursor stays small over planets so it never hides the capital
 if(i<0){if(shown>=0){label.classList.remove('show');shown=-1}return}
 const p=planets[i];
 if(shown!==i){const w=p.w;label.style.setProperty('--pl',PLANET_ACCENT[w.id]);
  label.querySelector('small').textContent='WORLD '+String(i+1).padStart(2,'0')+' · '+w.tag.split('/')[1].trim();
  label.querySelector('strong').textContent=w.name;label.querySelector('span').textContent=w.desc;
  label.querySelector('em').textContent=state.focus===i&&state.hover<0?'Press Enter to open ↗':touchUI?'Tap again to enter ↗':'Click to enter ↗';
  label.classList.add('show');shown=i}
 p.holder.getWorldPosition(tmp);const c=tmp.clone().project(camera),cx=(c.x+1)/2*innerWidth,cy=(1-c.y)/2*innerHeight,rp=pxRadius(p,p.scale);
 const lw=label.offsetWidth,lh=label.offsetHeight;let x,y,cls;
 if(!portrait){cls='side';x=cx+rp+20;if(x+lw>innerWidth-12)x=cx-rp-20-lw;y=clamp(cy-lh/2,12,innerHeight-lh-70)}
 else{cls='';x=clamp(cx,lw/2+10,innerWidth-lw/2-10);y=cy-rp-14;if(y-lh<8){y=cy+rp+14;cls='below'}}
 label.classList.toggle('side',cls==='side');label.classList.toggle('below',cls==='below');label.style.left=x+'px';label.style.top=y+'px';
}
async function enter(i){
 if(state.phase!=='system'||i<0)return;state.phase='enter';const keep=i;state.hover=state.sel=state.focus=-1;updateLabel();hint.classList.remove('show');
 const p=planets[keep];p.lock=true;const pw=p.holder.getWorldPosition(new V3()),from=camera.position.clone(),fromT=target.clone();
 const to=pw.clone().addScaledVector(from.clone().sub(pw).normalize(),p.R*p.scale*3.2);
 state.near={pos:to.clone(),target:pw.clone(),up:camera.up.clone()};state.last=keep;
 await tween(reduce?200:1150,e=>{camera.position.lerpVectors(from,to,e);target.lerpVectors(fromT,pw,e);camera.lookAt(target)},easeInOut);
 const s=pw.clone().project(camera);
 openWorld(p.w.id,{clientX:(s.x+1)/2*innerWidth,clientY:(1-s.y)/2*innerHeight});
}
async function exitWorld(){
 state.phase='exit';root.classList.remove('away');root.inert=false;start();
 const sv=systemView(),n=state.near||{pos:sv.pos.clone().sub(sv.target).multiplyScalar(.35).add(sv.target),target:sv.target,up:sv.up};
 camera.position.copy(n.pos);target.copy(n.target);camera.up.copy(sv.up);camera.lookAt(target);
 const from=n.pos.clone(),fromT=n.target.clone();
 await tween(reduce?250:1700,e=>{camera.position.lerpVectors(from,sv.pos,e);target.lerpVectors(fromT,sv.target,e);camera.lookAt(target)},easeInOut);
 planets.forEach(p=>p.lock=false);arrive();
}
addEventListener('devocrat:world',e=>{
 if(e.detail.open){state.phase='world';setTimeout(()=>{if(state.phase==='world'){root.classList.add('away');stop()}},650)}
 else{document.documentElement.style.removeProperty('--cursor');const c=$('cursorCore');if(c){c.style.borderRadius='';c.style.width=''}exitWorld()}
});

/* pointer: mouse hovers, touch taps (first tap = pause + detailed planet, second tap = enter) */
let down=null;
canvas.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;state.hover=state.phase==='system'?pickAt(e.clientX,e.clientY):-1});
canvas.addEventListener('pointerleave',()=>{state.hover=-1});
canvas.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,type:e.pointerType}});
canvas.addEventListener('pointerup',e=>{
 if(!down||state.phase!=='system')return;const moved=Math.hypot(e.clientX-down.x,e.clientY-down.y)>12,type=down.type;down=null;if(moved)return;
 if(type==='touch'){if(state.sel>=0){if(onPlanet(state.sel,e.clientX,e.clientY))enter(state.sel);else{state.sel=-1}}else{const i=pickAt(e.clientX,e.clientY,true);if(i>=0){state.sel=i;shown=-1}}}
 else{const i=pickAt(e.clientX,e.clientY);if(i>=0)enter(i)}
});
addEventListener('keydown',e=>{if(e.key==='Escape'&&state.phase==='system'){state.sel=-1}});
WORLDS.forEach((w,i)=>{const b=document.createElement('button');b.type='button';b.textContent='Enter the '+w.name+' world — '+w.desc;
 b.addEventListener('focus',()=>{state.focus=i;shown=-1});b.addEventListener('blur',()=>{if(state.focus===i)state.focus=-1});b.addEventListener('click',()=>enter(i));nav.appendChild(b)});

/* ---------- loop ---------- */
let last=performance.now(),clock=0;
const fwd=new V3(),upNow=new V3(),upL=new V3(),qRoll=new THREE.Quaternion(),qPar=new THREE.Quaternion();
/* adaptive quality: slow devices drop the glow pass and render at 1x (?quality=high|low forces a setting) */
const forced=new URLSearchParams(location.search).get('quality');let perfN=0,perfT=0,lowPower=false;
function setLowPower(){if(lowPower)return;lowPower=true;bloom.enabled=false;renderer.setPixelRatio(1);composer.setPixelRatio(1);composer.setSize(innerWidth,innerHeight);[galaxyMat,dustMat,bgMat,driftMat].forEach(m=>m.uniforms.uPR.value=1)}
if(forced==='low')setLowPower();
function frame(now){
 const real=Math.max(0,now-last),dt=Math.min(.05,real/1000);last=now;clock+=dt;
 if(!forced&&!lowPower&&perfN<90){perfN++;if(perfN>30)perfT+=real;if(perfN===90&&perfT/60>42)setLowPower()}
 // tweens run on wall-clock time so slow devices stay in sync with the intro wording
 for(let k=tweens.length-1;k>=0;k--){const t=tweens[k];t.t+=Math.min(real,250);const raw=Math.min(1,t.t/t.dur);t.fn((t.ease||(x=>x))(raw),raw);if(raw>=1){tweens.splice(k,1);t.res()}}
 galaxy.rotation.y+=state.spin*dt;system.getWorldPosition(sysWorld);galaxyMat.uniforms.uSys.value.copy(sysWorld);dustMat.uniforms.uSys.value.copy(sysWorld);
 sunMat.uniforms.uTime.value+=dt;flameMat.uniforms.uTime.value+=dt;bgMat.uniforms.uTime.value+=dt;
 sparkles.forEach(s=>{if(s.userData.k>0){const f=1+.18*Math.sin(clock*1.3+s.userData.ph);s.scale.set(s.userData.k*f,s.userData.k*f,1)}});
 const dp=driftGeo.attributes.position.array,ds=(state.phase==='zoom'?40:5)*dt;for(let k=2;k<dp.length;k+=3){dp[k]+=ds;if(dp[k]>-4)dp[k]-=160}driftGeo.attributes.position.needsUpdate=true;
 // everything pauses while a planet is hovered / selected / focused
 const act=state.phase==='system'?active():-1,goal=act>=0||state.phase==='enter'||state.phase==='world'?0:1;
 state.speed+=(goal-state.speed)*(1-Math.exp(-Math.min(real,250)/1000*14));if(Math.abs(goal-state.speed)<.01)state.speed=goal;
 const sp=state.speed*(reduce?.45:1),k=1-Math.exp(-Math.min(real,250)/1000*9);
 if(act>=0)ensureDetail(planets[act]);
 camera.updateMatrixWorld();fwd.set(0,0,-1).applyQuaternion(camera.quaternion);upNow.setFromMatrixColumn(camera.matrixWorld,1);
 upL.copy(Y).addScaledVector(fwd,-Y.dot(fwd)).normalize();qRoll.setFromUnitVectors(upL,upNow);
 planets.forEach((p,i)=>{
  p.pivot.getWorldQuaternion(qPar);p.holder.quaternion.copy(qPar.invert().multiply(qRoll));
  p.angle+=p.omega*dt*sp;p.holder.position.set(Math.cos(p.angle)*p.r,0,-Math.sin(p.angle)*p.r);
  const on=i===act||(p.lock&&state.phase!=='system');
  if(on&&p.capital){p.drift=(p.drift||0)+dt*.07;const cl=p.body.worldToLocal(camera.position.clone());let d=Math.atan2(cl.x,cl.z)-Math.atan2(p.capital.x,p.capital.z)+p.drift-p.spin.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));p.spin.rotation.y+=d*(1-Math.exp(-Math.min(real,250)/1000*4))}
  else{p.drift=0;p.spin.rotation.y+=dt*.15*sp}
  if(on){const rp=pxRadius(p,planetBase),T=Math.min(.3*Math.min(innerWidth,innerHeight),rp*4.6);p.grow=Math.max(1.8,T/rp)}
  p.hl+=((on?1:0)-p.hl)*k;p.scale=planetBase*(1+(p.grow-1)*easeOut(p.hl));p.holder.scale.setScalar(p.scale);p.atmo.material.opacity=.45+.3*p.hl;
  const det=p.detail&&p.hl>.06;p.simple.visible=p.textured||!det;
  if(p.detail){p.detail.spinPart.visible=p.detail.still.visible=det;if(det){p.detail.clouds.rotation.y+=dt*.04;p.detail.ships.forEach(s=>s.piv.rotation.y+=s.w*dt)}}
 });
 moons.forEach(m=>{m.a+=m.w*dt*sp;m.mesh.position.set(Math.cos(m.a)*m.r,0,Math.sin(m.a)*m.r);m.mesh.rotation.y+=dt*.3});
 asteroidBelt.rotation.y+=dt*.02*sp;kuiperBelt.rotation.y+=dt*.006*sp;
 sun.rotation.y+=dt*.03;
 updateLabel();
 composer.render();
 if(!window.devocratUniverseReady){window.devocratUniverseReady=true;document.getElementById('uniLoading')?.remove()}
}
let running=false;
function start(){if(!running){running=true;last=performance.now();renderer.setAnimationLoop(frame)}}
function stop(){running=false;renderer.setAnimationLoop(null)}
addEventListener('resize',resize);addEventListener('orientationchange',()=>setTimeout(resize,250));window.visualViewport?.addEventListener('resize',resize);
resize();start();
let seen=false;try{seen=sessionStorage.getItem('devocrat-intro')==='1'}catch(_){}
if(seen){$('introHoi').remove();$('introWelcome').remove();quickArrive()}else intro();
