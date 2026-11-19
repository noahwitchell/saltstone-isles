'use strict';
const V3 = THREE.Vector3, Q = THREE.Quaternion, DEG = Math.PI/180, TAU = Math.PI*2;
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};

/* ---------------- noise ---------------- */
function hash2(x,z,s){let h=Math.imul(x|0,374761393)^Math.imul(z|0,668265263)^Math.imul(s|0,1442695041);
  h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967296;}
function vnoise(x,z,s=1){const ix=Math.floor(x),iz=Math.floor(z);let fx=x-ix,fz=z-iz;fx=fx*fx*(3-2*fx);fz=fz*fz*(3-2*fz);
  const a=hash2(ix,iz,s),b=hash2(ix+1,iz,s),c=hash2(ix,iz+1,s),d=hash2(ix+1,iz+1,s);
  return (a+(b-a)*fx+(c-a)*fz+(a-b-c+d)*fx*fz)*2-1;}
function fbm(x,z,o=4,s=1){let t=0,a=.5,f=1,n=0;for(let i=0;i<o;i++){t+=a*vnoise(x*f,z*f,s+i*17);n+=a;a*=.5;f*=2.03;}return t/n;}
let rs=12345; const rnd=()=>{rs=(Math.imul(rs,1664525)+1013904223)>>>0;return rs/4294967296;};

/* ---------------- terrain ---------------- */
/* the world is a wide rectangle so the chart fills a phone held sideways: 46 km east-west, 22 km north-south */
const SIZEX=46000,SIZEZ=22000,CELL=40,CELLSX=SIZEX/CELL,CELLSZ=SIZEZ/CELL,HALFX=SIZEX/2,HALFZ=SIZEZ/2,NVX=CELLSX+1,NVZ=CELLSZ+1;
/* the Saltstone chain: Ferrow (home) with Gull Point and Tallpine across narrow channels, then three outer islands */
const ISLES={
  ferrow:{name:'Ferrow',x:-1050,z:560},
  gull:{name:'Gull Point',x:-2550,z:-260},
  tall:{name:'Tallpine',x:1000,z:-150},
  marram:{name:'Marram Cay',x:3800,z:5000,r:1150},
  kettle:{name:'Kettle Rock',x:5600,z:-3500,r:1700},
  farhold:{name:'Farhold',x:-6000,z:-4500,r:1700},
};
function isleAt(x,z){
  for(const k of OUTER){const I=ISLES[k];if((x-I.x)**2+(z-I.z)**2<(I.r+700)**2)return k;}
  const m=homeMasks(x,z);return m.gull>m.ferrow&&m.gull>m.tall?'gull':m.tall>m.ferrow?'tall':'ferrow';}
const ell=(x,z,cx,cz,rx,rz,rot)=>{const c=Math.cos(rot),s=Math.sin(rot),dx=x-cx,dz=z-cz,u=(dx*c+dz*s)/rx,v=(-dx*s+dz*c)/rz;return 1-u*u-v*v;};
function homeMasks(x,z){const n=fbm(x*.0009,z*.0009,4,3)*.32,n2=fbm(x*.0021,z*.0021,3,5)*.12;
  return {ferrow:ell(x,z,-1150,560,820,1300,-.3)+n+n2, gull:ell(x,z,-2870,-280,720,430,.1)+n*.8+n2,
    tall:Math.max(ell(x,z,1100,-300,1400,1300,.25),ell(x,z,2250,650,850,620,0)*.8)+n+n2};}
function landMask(x,z){if(x<-3900||x>3500||z<-2300||z>2300)return -2;const m=homeMasks(x,z);return Math.max(m.ferrow,m.gull,m.tall);}
function homeH(x,z){
  const m=landMask(x,z);
  if(m<0) return Math.max(-48,m*160);
  const t=smooth(0,.42,m);
  const fh=Math.exp(-(((x+1050)**2+(z-720)**2)/(680*680)));
  const hills=(fbm(x*.0015,z*.0015,4,7)*.5+.5)*55*t*(1-.8*fh);
  const dx=x-650,dz=z+380, rid=1-Math.abs(fbm(x*.0011,z*.0011,4,11));
  const mtn=540*Math.exp(-(dx*dx+dz*dz)/(2*720*720))*(.55+.6*rid)*t;
  const g=homeMasks(x,z).gull,cliff=g>0?30*smooth(.04,.2,g):0;
  return t*34+hills+mtn-fh*t*12+cliff;
}
/* Marram Cay: a low ring of sand round a shallow lagoon, with two gaps to the sea */
function marramH(x,z){const I=ISLES.marram,dx=x-I.x,dz=z-I.z,r=Math.hypot(dx,dz);if(r>1500)return -48;const a=Math.atan2(dz,dx);
  const R=640+fbm(Math.cos(a)*1.6+5,Math.sin(a)*1.6+5,3,81)*110;
  let ring=1-((r-R)/(130+90*smooth(-.4,-.9,Math.sin(a))))**2;
  ring-=1.3*Math.max(0,Math.cos(a-.35))**40+1.3*Math.max(0,Math.cos(a-2.6))**60;
  if(ring>0) return .6+ring*3.4+fbm(x*.012,z*.012,2,83)*1.1+smooth(.5,1,ring)*1.2;
  const lag=r<R?-2.6-3.2*smooth(R-120,R-420,r):-2-(r-R-150)*.11;
  return Math.max(-48,lag,ring*6-.6);}
/* Kettle Rock: a ridged volcanic cone with a steaming crater */
const KET={cr:235,depth:125};
function kettleCone(r,a){const gul=fbm(Math.cos(a)*3+r*.003,Math.sin(a)*3+r*.003,3,91),R0=1300+gul*110+130*Math.sin(2*a+1)+80*Math.sin(3*a+2),u=1-r/R0;
  if(u<0) return Math.max(-48,u*R0*.14-1.5);
  return 470*Math.pow(u,1.35)+(1-Math.abs(gul*2))*28*u-1.5;}
function kettleH(x,z){const I=ISLES.kettle,dx=x-I.x,dz=z-I.z,r=Math.hypot(dx,dz);if(r>1900)return -48;const a=Math.atan2(dz,dx);
  if(r>=KET.cr) return kettleCone(r,a);
  const hr=kettleCone(KET.cr,a);return hr-KET.depth*(1-(r/KET.cr)**2)+vnoise(x*.03,z*.03,93)*4;}
/* Farhold: rolling moorland and one tall hill, usually wrapped in fog */
function farholdH(x,z){const I=ISLES.farhold,ca=Math.cos(.45),sa=Math.sin(.45),lx=(x-I.x)*ca+(z-I.z)*sa,lz=-(x-I.x)*sa+(z-I.z)*ca;
  const m=1-(lx/1300)**2-(lz/880)**2+fbm(x*.0012,z*.0012,4,101)*.28;if(m<-1)return -48;
  if(m<0) return Math.max(-48,m*150);const t=smooth(0,.38,m);
  const hill=190*Math.exp(-(((x-I.x+420)**2+(z-I.z+420)**2)/(2*380*380)));
  return t*16+(fbm(x*.0019,z*.0019,4,103)*.5+.5)*60*t+hill*t;}
/*@ISLES@*/
const OUTER_H={marram:marramH,kettle:kettleH,farhold:farholdH};
function naturalH(x,z){
  let h=homeH(x,z);
  for(const k of OUTER){const I=ISLES[k];if((x-I.x)**2+(z-I.z)**2<(I.r+800)**2)h=Math.max(h,OUTER_H[k]?OUTER_H[k](x,z):I.h(x,z));}
  return h;
}
const STRIPS=[
  {id:'harbor',name:'Harbor Field',isle:'ferrow',x:-1100,z:620,hdg:70,len:720,wid:22,surf:'paved'},
  {id:'light',name:'Gull Point',isle:'gull',x:-2800,z:-260,hdg:100,len:440,wid:18,surf:'grass'},
  {id:'ridge',name:'Ridge Strip',isle:'tall',x:1350,z:-150,hdg:20,len:300,wid:14,surf:'dirt'},
  {id:'marram',name:'Marram Beach',isle:'marram',x:3800,z:4350,hdg:90,len:400,wid:18,surf:'sand'},
  {id:'kettle',name:'Crater Shelf',isle:'kettle',x:5600,z:-2890,hdg:90,len:380,wid:16,surf:'cinder'},
  {id:'farhold',name:'Farhold Field',isle:'farhold',x:-5800,z:-4330,hdg:60,len:640,wid:22,surf:'paved'},
  ...archStrips(),
];
for(const s of STRIPS){
  const h=s.hdg*DEG; s.fx=Math.sin(h); s.fz=-Math.cos(h); s.rx=Math.cos(h); s.rz=Math.sin(h);
  let sum=0,n=0; for(let i=-4;i<=4;i++){sum+=naturalH(s.x+s.fx*i*s.len/8,s.z+s.fz*i*s.len/8);n++;}
  s.elev=Math.max(4,sum/n);
}
const toLocal=(s,x,z)=>{const dx=x-s.x,dz=z-s.z;return {s:dx*s.fx+dz*s.fz,t:dx*s.rx+dz*s.rz};};
const toWorld=(s,a,t)=>({x:s.x+a*s.fx+t*s.rx,z:s.z+a*s.fz+t*s.rz});
function finalH(x,z){
  let h=naturalH(x,z);
  for(const s of STRIPS){const l=toLocal(s,x,z);
    const ds=Math.max(Math.abs(l.s)-s.len/2-45,0), dt=Math.max(Math.abs(l.t)-s.wid/2-30,0);
    const w=1-smooth(0,150,Math.hypot(ds,dt)); h=lerp(h,s.elev,w);}
  return h;
}
const HGT=new Float32Array(NVX*NVZ);
for(let j=0;j<NVZ;j++)for(let i=0;i<NVX;i++)HGT[j*NVX+i]=finalH(-HALFX+i*CELL,-HALFZ+j*CELL);
const hAt=(i,j)=>HGT[clamp(j,0,CELLSZ)*NVX+clamp(i,0,CELLSX)];
function groundH(x,z){
  const gx=(x+HALFX)/CELL,gz=(z+HALFZ)/CELL; if(gx<0||gz<0||gx>=CELLSX||gz>=CELLSZ) return -48;
  const i=Math.floor(gx),j=Math.floor(gz),fx=gx-i,fz=gz-j;
  const a=hAt(i,j),b=hAt(i+1,j),c=hAt(i,j+1),d=hAt(i+1,j+1);
  return fx+fz<1? a+(b-a)*fx+(c-a)*fz : d+(c-d)*(1-fx)+(b-d)*(1-fz);
}
function slopeAt(x,z){const e=6;return Math.hypot(groundH(x+e,z)-groundH(x-e,z),groundH(x,z+e)-groundH(x,z-e))/(2*e);}
const nearStrip=(x,z,m)=>STRIPS.some(s=>{const l=toLocal(s,x,z);return Math.abs(l.s)<s.len/2+m&&Math.abs(l.t)<s.wid/2+m;});

/* ---------------- renderer ---------------- */
/* always landscape: if the phone is upright (or rotation-locked upright) the whole page is turned 90 degrees.
   ROT says whether it's turned; VW/VH are the game's width and height; ptL() and rectL() convert screen
   coordinates (touches, element boxes) into the game's own landscape coordinates. */
let ROT=false;
function setRot(){ROT=innerHeight>innerWidth;document.documentElement.classList.toggle('rot',ROT);}
setRot();
const VW=()=>ROT?innerHeight:innerWidth,VH=()=>ROT?innerWidth:innerHeight;
const ptL=e=>ROT?{x:e.clientY,y:innerWidth-e.clientX}:{x:e.clientX,y:e.clientY};
function rectL(el){const r=el.getBoundingClientRect();if(!ROT)return r;const W=innerWidth;return {left:r.top,top:W-r.right,right:r.bottom,bottom:W-r.left,width:r.height,height:r.width};}
const glCanvas=document.getElementById('gl'), hudCanvas=document.getElementById('hud');
const renderer=new THREE.WebGLRenderer({canvas:glCanvas,antialias:false,powerPreference:'high-performance'});
renderer.setPixelRatio(1);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(58,1,.4,14000);
const hctx=hudCanvas.getContext('2d');

const gradTex=new THREE.DataTexture(new Uint8Array([78,78,78,255, 145,145,145,255, 205,205,205,255, 255,255,255,255]),4,1,THREE.RGBAFormat);
gradTex.minFilter=gradTex.magFilter=THREE.NearestFilter; gradTex.needsUpdate=true;
/* baked sun shadow (mountains, hills) applied inside the sun's lighting for every toon material, so ground, runways, trees and houses agree */
const bakeData=new Uint8Array(NVX*NVZ*4);const bakeTex=new THREE.DataTexture(bakeData,NVX,NVZ,THREE.RGBAFormat);bakeTex.minFilter=bakeTex.magFilter=THREE.LinearFilter;bakeTex.needsUpdate=true;
const SH_FADE='float shFade(float s,vec4 c){vec3 p=c.xyz/c.w;vec2 e=min(p.xy,1.0-p.xy);return mix(1.0,s,smoothstep(0.0,0.22,min(e.x,e.y)));}\n';
const fadeShadow=src=>src.replace(/getShadow\( directionalShadowMap\[ i \][^;]*?vDirectionalShadowCoord\[ i \] \)/g,m=>'shFade('+m+', vDirectionalShadowCoord[ i ])');
const BAKE_LIGHT=fadeShadow(THREE.ShaderChunk.lights_fragment_begin).replace('getDirectionalDirectLightIrradiance( directionalLight, geometry, directLight );','getDirectionalDirectLightIrradiance( directionalLight, geometry, directLight );\n\t\tdirectLight.color *= 1.0 - texture2D( bakeTex, vBakeUV ).r;');
function bakeify(m){m.onBeforeCompile=sh=>{sh.uniforms.bakeTex={value:bakeTex};
  sh.vertexShader='varying vec2 vBakeUV;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvec4 bwp=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\nbwp=instanceMatrix*bwp;\n#endif\nbwp=modelMatrix*bwp;\nvBakeUV=(bwp.xz+vec2('+HALFX.toFixed(1)+','+HALFZ.toFixed(1)+'))/vec2('+SIZEX.toFixed(1)+','+SIZEZ.toFixed(1)+')*vec2('+(CELLSX/NVX).toFixed(6)+','+(CELLSZ/NVZ).toFixed(6)+')+vec2('+(.5/NVX).toFixed(6)+','+(.5/NVZ).toFixed(6)+');');
  sh.fragmentShader='uniform sampler2D bakeTex;varying vec2 vBakeUV;\n'+SH_FADE+sh.fragmentShader.replace('#include <lights_fragment_begin>',BAKE_LIGHT);};return m;}
const planeLit={value:1};
function litify(m){m.onBeforeCompile=sh=>{sh.uniforms.uLit=planeLit;sh.fragmentShader='uniform float uLit;\n'+sh.fragmentShader.replace('#include <lights_fragment_begin>',THREE.ShaderChunk.lights_fragment_begin.replace('getDirectionalDirectLightIrradiance( directionalLight, geometry, directLight );','getDirectionalDirectLightIrradiance( directionalLight, geometry, directLight );\n\t\tdirectLight.color *= uLit;'));};return m;}
const toon=(o={},bake=true)=>{const m=new THREE.MeshToonMaterial(Object.assign({vertexColors:true,gradientMap:gradTex,flatShading:true},o));return bake?bakeify(m):m;};

/* lighting presets */
const TOD={
  dawn:{name:'Sunrise',sunAz:78,sunEl:7,sun:0xfff0b4,sunI:1.05,sky:0xb4cdea,gnd:0x8a8a5a,hemiI:.62,zen:0x5a88cc,high:0xa8c6ea,hor:0xfbe4b0,haze:0xffe08a,sunc:0xfffbe0,fogN:800,fogF:6000,
    deep:0x2a6098,mid:0x4a90b8,shal:0x7ad0c4,glint:0xfff8d8,con:1.06,sat:1.08,vig:.18,stars:0,lights:0,disc:.99935,beam:.05},
  noon:{name:'Midday',sunAz:200,sunEl:55,sun:0xfff4e2,sunI:.95,sky:0xb8d4f0,gnd:0x7c8a58,hemiI:.6,zen:0x3f7fd0,high:0x86b8ea,hor:0xd8eaf2,haze:0xf4f6ee,sunc:0xffffff,fogN:900,fogF:6500,
    deep:0x1f5f9a,mid:0x2f8fbf,shal:0x5fd2c8,glint:0xffffff,con:1.05,sat:1.05,vig:.15,stars:0,lights:0,disc:.99935,beam:0},
  golden:{name:'Golden hour',sunAz:250,sunEl:8,sun:0xffc48a,sunI:1.12,sky:0x9c94d8,gnd:0x7a6a4a,hemiI:.5,zen:0x37479a,high:0x9a98d4,hor:0xf4b892,haze:0xffa060,sunc:0xfff0c0,fogN:700,fogF:5600,
    deep:0x2c5488,mid:0x3d7ea0,shal:0x60bcb0,glint:0xfff0c4,con:1.12,sat:1.15,vig:.25,stars:0,lights:0,disc:.99935,beam:.1},
  sunset:{name:'Sunset',sunAz:256,sunEl:2.4,sun:0xff874a,sunI:1.15,sky:0x7d68b4,gnd:0x5a3e48,hemiI:.5,zen:0x262a70,high:0x7a5eaa,hor:0xff9868,haze:0xff5f36,sunc:0xffc888,fogN:600,fogF:5200,
    deep:0x283a74,mid:0x3a5a90,shal:0x5c88a0,glint:0xffa060,con:1.18,sat:1.25,vig:.32,stars:0,lights:.75,disc:.9992,beam:.2},
  dusk:{name:'Blue hour',sunAz:262,sunEl:1.2,sun:0xff9a7a,sunI:.45,sky:0x6b6aa8,gnd:0x3a3a4a,hemiI:.72,zen:0x1a1f4c,high:0x454a8a,hor:0xd88e8e,haze:0xf0906a,sunc:0xffc0a0,fogN:500,fogF:4800,
    deep:0x1d3560,mid:0x2a5580,shal:0x3f8a98,glint:0xffc8a8,con:1.1,sat:1.1,vig:.3,stars:.35,lights:1,disc:.9993,beam:.3},
  night:{name:'Night',sunAz:130,sunEl:34,sun:0x8ea4ff,sunI:.5,sky:0x34407a,gnd:0x16182a,hemiI:.6,zen:0x060918,high:0x121840,hor:0x283060,haze:0x3a4680,sunc:0xf4f0dc,fogN:450,fogF:4300,
    deep:0x0a1430,mid:0x122448,shal:0x1d3c58,glint:0xdfe6ff,con:1.1,sat:.85,vig:.35,stars:1,lights:1,disc:.99975,beam:.42},
  storm:{name:'Stormy',sunAz:200,sunEl:40,sun:0xc8ced8,sunI:.62,sky:0x7c8696,gnd:0x3a4038,hemiI:.5,zen:0x2a3240,high:0x404a5a,hor:0x6a7480,haze:0x76808a,sunc:0xa8b0b8,fogN:600,fogF:4600,
    deep:0x142c44,mid:0x1f4560,shal:0x356a70,glint:0xa8b0b8,con:1.08,sat:.9,vig:.62,stars:0,lights:1,disc:2,beam:.4},
};
const hemi=new THREE.HemisphereLight(0xffffff,0x888888,.6); scene.add(hemi);
const sunL=new THREE.DirectionalLight(0xffffff,1); scene.add(sunL); scene.add(sunL.target);
scene.fog=new THREE.Fog(0xffffff,700,5600);
sunL.castShadow=true;sunL.shadow.mapSize.set(3072,3072);const SHADOW_HALF=400;{const sc=sunL.shadow.camera;sc.left=-SHADOW_HALF;sc.right=SHADOW_HALF;sc.top=SHADOW_HALF;sc.bottom=-SHADOW_HALF;sc.near=10;sc.far=4000;}sunL.shadow.bias=-0.0004;sunL.shadow.normalBias=.35;
const sunDir=new V3();

/* sky dome */
const skyMat=new THREE.ShaderMaterial({depthWrite:false,depthTest:false,side:THREE.BackSide,
  uniforms:{sunDir:{value:sunDir},cZen:{value:new THREE.Color()},cHigh:{value:new THREE.Color()},cHor:{value:new THREE.Color()},
    cHaze:{value:new THREE.Color()},cSun:{value:new THREE.Color()},uTime:{value:0},uStars:{value:0},uDisc:{value:.99935}},
  vertexShader:`varying vec3 vDir;void main(){vDir=position;vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position=p.xyww;}`,
  fragmentShader:`uniform vec3 sunDir,cZen,cHigh,cHor,cHaze,cSun;uniform float uTime,uStars,uDisc;varying vec3 vDir;
  float h1(vec2 p){return fract(sin(dot(p,vec2(41.3,289.1)))*43758.5453);}
  float n1(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y);}
  void main(){vec3 d=normalize(vDir);float y=d.y;float sd=max(dot(d,sunDir),0.);
    vec3 c=mix(cHor,cHigh,smoothstep(0.,.22,y));c=mix(c,cZen,smoothstep(.2,.8,y));
    c=mix(c,cHaze,pow(sd,5.)*(1.-smoothstep(0.,.4,y))*.85);
    vec2 uv=d.xz/(y+.06);uv.x*=.35;
    float cl=n1(uv*3.+vec2(uTime*.004,0.))*.65+n1(uv*9.)*.35;
    cl=smoothstep(.56,.6,cl)*smoothstep(.015,.06,y)*(1.-smoothstep(.25,.5,y));
    vec3 cc=mix(mix(cHor,vec3(1.),.45),cHaze,pow(sd,3.)*.7);
    c=mix(c,cc,cl*.75);
    vec3 q=floor(d*260.);float st=fract(sin(dot(q,vec3(12.9898,78.233,37.719)))*43758.5453);c+=vec3(.95,.93,1.)*step(.9982,st)*uStars*smoothstep(.02,.2,y)*(.55+.45*sin(uTime*1.7+st*80.));
    c+=cSun*pow(sd,28.)*.55; c=mix(c,cSun,step(uDisc,sd));
    if(y<0.)c=cHor; gl_FragColor=vec4(c,1.);}`});
const sky=new THREE.Mesh(new THREE.SphereGeometry(9000,24,12),skyMat); sky.renderOrder=-10; scene.add(sky);

/* geometry merge helper */
function M(pos,rot,scl){const m=new THREE.Matrix4();m.compose(new V3(...pos),new Q().setFromEuler(new THREE.Euler(...(rot||[0,0,0]),'YXZ')),new V3(...(scl||[1,1,1])));return m;}
function merge(items){
  let total=0;const gs=items.map(it=>{const g=(it.geo.index?it.geo.toNonIndexed():it.geo.clone());g.applyMatrix4(it.m);total+=g.attributes.position.count;return {g,c:new THREE.Color(it.color)};});
  const P=new Float32Array(total*3),N=new Float32Array(total*3),C=new Float32Array(total*3);let o=0;
  for(const {g,c} of gs){const cnt=g.attributes.position.count;P.set(g.attributes.position.array,o*3);N.set(g.attributes.normal.array,o*3);
    for(let i=0;i<cnt;i++){C[(o+i)*3]=c.r;C[(o+i)*3+1]=c.g;C[(o+i)*3+2]=c.b;}o+=cnt;g.dispose();}
  const out=new THREE.BufferGeometry();out.setAttribute('position',new THREE.BufferAttribute(P,3));out.setAttribute('normal',new THREE.BufferAttribute(N,3));out.setAttribute('color',new THREE.BufferAttribute(C,3));return out;
}
const BOX=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
let terrainMesh=null,terrainVI=null,terrainBase=null;
const LIGHTP=[],LIGHTC=[];const _lc=new THREE.Color();
function addLight(x,y,z,col){LIGHTP.push(x,y,z);_lc.setHex(col);LIGHTC.push(_lc.r,_lc.g,_lc.b);}
/* runway edge lights are kept per strip: they're pilot-controlled (key the mic and they come on) */
const RWY_L={};function rwyLight(s,x,y,z,col){const L=RWY_L[s.id]||(RWY_L[s.id]={p:[],c:[]});L.p.push(x,y,z);_lc.setHex(col);L.c.push(_lc.r,_lc.g,_lc.b);}
const shadowy=(m,cast=true)=>{m.castShadow=cast;m.receiveShadow=true;return m;};
/* the terrain and trees are cut into 4 km chunks, each with its own bounds, so the camera skips chunks that are
   off screen or beyond the haze instead of drawing the whole archipelago every frame */
const CHUNK=4000,CHUNKS=[];const chunkKey=(x,z)=>Math.floor((x+HALFX)/CHUNK)+','+Math.floor((z+HALFZ)/CHUNK);
function addChunk(m,cx,cy,cz,r){m.geometry.boundingSphere=new THREE.Sphere(new V3(cx,cy,cz),r);m.frustumCulled=true;CHUNKS.push({m,x:cx,z:cz,r});return m;}
/* split a long list of static props into map cells, one mesh per cell, so a cell is skipped when it's off-screen
   (frustum culling) or far away (cullChunks), instead of the whole world's rocks being drawn every frame */
function addCells(items,mat,cell=2500,wrap=m=>m){const g=new Map();for(const it of items){const e=it.m.elements,k=Math.floor(e[12]/cell)+','+Math.floor(e[14]/cell);if(!g.has(k))g.set(k,[]);g.get(k).push(it);}
  for(const list of g.values()){const m=wrap(new THREE.Mesh(merge(list),mat));m.geometry.computeBoundingSphere();const s=m.geometry.boundingSphere;scene.add(m);addChunk(m,s.center.x,s.center.y,s.center.z,s.radius);}}
function cullChunks(p){for(const c of CHUNKS)c.m.visible=Math.hypot(c.x-p.x,c.z-p.z)<c.r+7500;if(typeof cullClouds==='function')cullClouds(p);}
function byChunk(list){const g=new Map();for(const t of list){const k=chunkKey(t.x,t.z);if(!g.has(k))g.set(k,[]);g.get(k).push(t);}return [...g.values()];}
function boundsOf(list,pad){let x=0,y=0,z=0;for(const t of list){x+=t.x;y+=t.h||0;z+=t.z;}x/=list.length;y/=list.length;z/=list.length;let r=0;for(const t of list)r=Math.max(r,Math.hypot(t.x-x,(t.h||0)-y,t.z-z));return [x,y,z,r+pad];}
let glideCock=null,tachCock=null;
/* farmland: fields on a grid rotated 20 degrees */
const FA=20*DEG,FCs=Math.cos(FA),FSn=Math.sin(FA);
const FIELDC=[0xd8c46c,0x9cc45a,0xb08a5a,0xc9d27a,0x8fb860,0xe0b45c,0x7fae4f];
function fieldUV(x,z){return [(x*FCs+z*FSn)/115,(-x*FSn+z*FC_())/85];}
function FC_(){return FCs;}
function isFarm(x,z,h,sl){return h>4&&h<150&&sl<.2&&x>-2200&&x<-150&&isleAt(x,z)==='ferrow'&&fbm(x*.0011,z*.0011,3,61)>-.05&&!nearStrip(x,z,30);}
function fieldColor(x,z){const [u,v]=fieldUV(x,z);const k=hash2(Math.floor(u),Math.floor(v),77);return k<.18?-1:FIELDC[(hash2(Math.floor(u),Math.floor(v),78)*FIELDC.length)|0];}
function beam(list,a,b,th,color){const d=new V3().subVectors(b,a),L=d.length();const m=new THREE.Matrix4();
  m.compose(new V3().addVectors(a,b).multiplyScalar(.5),new Q().setFromUnitVectors(new V3(0,0,1),d.normalize()),new V3(1,1,1));list.push({geo:BOX(th,th,L),m,color});}

/* ---------------- terrain mesh ---------------- */
const COL={sandWet:0xc8a876,sand:0xe9cf98,grassA:0x7eab4e,grassB:0x9abb58,meadow:0xc9bc62,heath:0x8f9a5a,rock:0x9c8a80,rock2:0x857672,high:0xb7a996,pale:0xd9d0c2};
const tc=new THREE.Color(),tc2=new THREE.Color();
function terrainColor(h,ny,x,z){
  const n1=vnoise(x*.004,z*.004,21),n2=vnoise(x*.018,z*.018,23),sl=1-ny,isl=isleAt(x,z);
  if(isl==='kettle'){
    if(h<-.6) tc.setHex(0x3a3438);else if(h<6+n1*3) tc.setHex(0x2f2a30);
    else if(sl>.5+n2*.08) tc.setHex(0x5a4c50).lerp(tc2.setHex(0x7a5e52),(Math.sin(h*.11+n1*4)*.5+.5)*.8);
    else if(h<150+n1*50) tc.setHex(0x6b8446).lerp(tc2.setHex(0x8a8a50),n2*.5+.5).lerp(tc2.setHex(0x4e4448),smooth(90,190,h));
    else tc.setHex(0x6e6268).lerp(tc2.setHex(0x9a8e8c),smooth(200,380,h)+n1*.2);
  } else if(isl==='marram'){
    if(h<-.6) tc.setHex(0xe8d6a8);else if(h<3.9+n1*1.5||n2<.1) tc.setHex(COL.sand).lerp(tc2.setHex(0xf4e4b8),n2*.5+.5);
    else tc.setHex(0x9fb85a).lerp(tc2.setHex(COL.sand),.35);
  } else if(ARCH_COL[isl]){ARCH_COL[isl](h,sl,n1,n2,x,z);
  } else if(h<-.6) tc.setHex(COL.sandWet);
  else if(h<3.5+n1*2.5&&sl<.32) tc.setHex(COL.sand);
  else if(sl>.42+n2*.06) {tc.setHex(COL.rock); tc.lerp(tc2.setHex(COL.rock2),(Math.sin(h*.09+n1*3)*.5+.5)*.9);}
  else if(h>500+n1*40) tc.setHex(h>590&&sl<.3?COL.pale:COL.high);
  else if(isl==='farhold'){tc.setHex(0x6f8a52).lerp(tc2.setHex(0x8a8a62),n1*.5+.5);if(n2>.4)tc.lerp(tc2.setHex(0xa08a6a),.5);}
  else if(isFarm(x,z,h,sl)&&fieldColor(x,z)>=0){tc.setHex(fieldColor(x,z));}
  else { tc.setHex(COL.grassA).lerp(tc2.setHex(COL.grassB),n1*.5+.5);
    if(n2>.45) tc.lerp(tc2.setHex(COL.meadow),.7);
    if(h>200) tc.lerp(tc2.setHex(COL.heath),smooth(200,420,h)*.75); }
  const j=1+(hash2(x|0,z|0,5)-.5)*.07; tc.r*=j;tc.g*=j;tc.b*=j; return tc;
}
(function buildTerrain(){
  const CH=new Map();let P,C;const VI=[];const a=new V3(),b=new V3(),c=new V3(),e1=new V3(),e2=new V3();
  function tri(x1,z1,x2,z2,x3,z3){
    const h1=groundH(x1,z1)??0; a.set(x1,hAtW(x1,z1),z1);b.set(x2,hAtW(x2,z2),z2);c.set(x3,hAtW(x3,z3),z3);
    e1.subVectors(b,a);e2.subVectors(c,a);const n=e1.cross(e2).normalize();
    const col=terrainColor((a.y+b.y+c.y)/3,Math.abs(n.y),(x1+x2+x3)/3,(z1+z2+z3)/3);
    P.push(a.x,a.y,a.z,b.x,b.y,b.z,c.x,c.y,c.z);for(let k=0;k<3;k++)C.push(col.r,col.g,col.b);
    for(const [vx,vz] of [[x1,z1],[x2,z2],[x3,z3]])VI.push(Math.round((vz+HALFZ)/CELL)*NVX+Math.round((vx+HALFX)/CELL));
  }
  function hAtW(x,z){return hAt(Math.round((x+HALFX)/CELL),Math.round((z+HALFZ)/CELL));}
  for(let j=0;j<CELLSZ;j++)for(let i=0;i<CELLSX;i++){
    if(Math.max(hAt(i,j),hAt(i+1,j),hAt(i,j+1),hAt(i+1,j+1))<-5) continue;
    const x0=-HALFX+i*CELL,x1=x0+CELL,z0=-HALFZ+j*CELL,z1=z0+CELL,k=chunkKey(x0,z0);
    if(!CH.has(k))CH.set(k,{P:[],C:[]});({P,C}=CH.get(k));
    tri(x0,z0,x0,z1,x1,z0); tri(x1,z0,x0,z1,x1,z1);
  }
  const mat=toon();
  for(const {P,C} of CH.values()){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.computeVertexNormals();g.computeBoundingSphere();
    const m=new THREE.Mesh(g,mat);m.receiveShadow=true;scene.add(m);const bs=g.boundingSphere;CHUNKS.push({m,x:bs.center.x,z:bs.center.z,r:bs.radius});terrainMesh=terrainMesh||m;}
})();
/* terrain shadows are baked from the heightfield for each sun position: clean, stable, and they reach for kilometers */
function bakeTerrainShadow(dir,amt){
  const S=new Float32Array(NVX*NVZ),hl=Math.hypot(dir.x,dir.z);
  if(hl>1e-3&&dir.y>0){const ux=dir.x/hl,uz=dir.z/hl,tan=dir.y/hl,st=CELL*.75;
    for(let j=0;j<NVZ;j++)for(let i=0;i<NVX;i++){const h0=HGT[j*NVX+i];if(h0<-6)continue;const x=-HALFX+i*CELL,z=-HALFZ+j*CELL;
      for(let k=1;k<140;k++){const d=k*st,ray=h0+d*tan+1.5;if(ray>720)break;if(groundH(x+ux*d,z+uz*d)>ray){S[j*NVX+i]=1;break;}}}}
  for(let j=0;j<NVZ;j++)for(let i=0;i<NVX;i++){const k=j*NVX+i;if(HGT[k]<-8){bakeData[k*4]=0;continue;}let t=0,n=0;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const ii=i+a,jj=j+b;if(ii<0||jj<0||ii>=NVX||jj>=NVZ)continue;const wgt=a||b?1:2;t+=S[jj*NVX+ii]*wgt;n+=wgt;}
    bakeData[k*4]=Math.round(t/n*255*(1-amt*.35));}
  bakeTex.needsUpdate=true;
}

/* ---------------- water ---------------- */
const hData=new Uint8Array(NVX*NVZ*4);
for(let k=0;k<NVX*NVZ;k++){const v=Math.round(clamp((HGT[k]+60)/120,0,1)*65535);hData[k*4]=v>>8;hData[k*4+1]=v&255;hData[k*4+3]=255;}
const hTex=new THREE.DataTexture(hData,NVX,NVZ,THREE.RGBAFormat);hTex.minFilter=hTex.magFilter=THREE.LinearFilter;hTex.needsUpdate=true;
const waterMat=new THREE.ShaderMaterial({
  uniforms:{hTex:{value:hTex},uTime:{value:0},uCamY:{value:100},sunDir:{value:sunDir},fogColor:{value:new THREE.Color()},fogNear:{value:700},fogFar:{value:5600},
    cDeep:{value:new THREE.Color()},cMid:{value:new THREE.Color()},cShal:{value:new THREE.Color()},cGlint:{value:new THREE.Color()}},
  vertexShader:`varying vec3 vW;varying float vD;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vec4 mv=viewMatrix*w;vD=-mv.z;gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`uniform sampler2D hTex;uniform float uTime,fogNear,fogFar,uCamY;uniform vec3 sunDir,fogColor,cDeep,cMid,cShal,cGlint;varying vec3 vW;varying float vD;
  float hs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hs(i),hs(i+vec2(1,0)),f.x),mix(hs(i+vec2(0,1)),hs(i+vec2(1,1)),f.x),f.y);}
  float caus(vec2 uv,float time){vec2 p=mod(uv*6.2831853,6.2831853)-250.,i=p;float c=1.;
    for(int n=0;n<4;n++){float t=time*(1.-3.5/float(n+1));i=p+vec2(cos(t-i.x)+sin(t+i.y),sin(t-i.y)+cos(t+i.x));c+=1./length(vec2(p.x/(sin(i.x+t)/.005),p.y/(cos(i.y+t)/.005)));}
    c/=4.;c=1.17-pow(c,1.4);return clamp(pow(abs(c),8.),0.,1.);}
  void main(){
    vec2 uv=(vW.xz+vec2(${HALFX.toFixed(1)},${HALFZ.toFixed(1)}))/vec2(${SIZEX.toFixed(1)},${SIZEZ.toFixed(1)})*vec2(${(CELLSX/NVX).toFixed(6)},${(CELLSZ/NVZ).toFixed(6)})+vec2(${(0.5/NVX).toFixed(6)},${(0.5/NVZ).toFixed(6)});
    vec4 ht=texture2D(hTex,uv);float h=(ht.r*65280.+ht.g*255.)/65535.*120.-60.;
    float dp=-h+(vn(vW.xz*.03)-.5)*1.1+(vn(vW.xz*.11+7.)-.5)*.35;
    vec3 c=mix(cShal,cMid,smoothstep(1.,8.,dp));c=mix(c,cDeep,smoothstep(9.,38.,dp));
    vec2 bp=floor(gl_FragCoord.xy);vec2 b2=mod(bp,2.),b4=mod(floor(bp*.5),2.);
    float bay=(mod(b2.x*2.+b2.y*3.,4.)*4.+mod(b4.x*2.+b4.y*3.,4.)+.5)/16.;
    // caustics: a drifting web of thin light threads (two scales), bright crisp threads with a dithered fringe
    float e=max(caus(vW.xz/70.,uTime*.35),caus(vW.xz/43.+vec2(.37,.11),uTime*.28+4.)*.8);
    float cs=mix(.34,.16,smoothstep(2.,30.,dp))*(1.-smoothstep(350.,1500.,vD))*smoothstep(-.2,.6,dp);
    float ln=step(.42,e)+step(bay,smoothstep(.12,.42,e))*.5;
    c=mix(c,mix(c,vec3(.93,1.,.97),.85),min(ln,1.)*cs);
    float fl=1.1+.45*sin(uTime*.6+vW.x*.011+vW.z*.009);
    float foam=(1.-smoothstep(fl-.25,fl+.25,dp))*smoothstep(-.4,-.1,dp);
    float wv=fract(uTime*.09-dp*.16);float band=smoothstep(.08,0.,abs(wv-.5)*(1.+dp*.05));
    float foam2=band*smoothstep(fl,fl+1.,dp)*(1.-smoothstep(5.,9.,dp))*smoothstep(.45,.7,vn(vW.xz*.05+vec2(uTime*.03,0.)));
    c=mix(c,vec3(.97,.95,.88),max(foam*.85,foam2*.45));
    // sun/moon glint: a small bright core, a pixel-dithered falloff, and a few wave sparkles further out
    vec3 nW=normalize(vec3(sin(vW.x*.09+uTime*.9+sin(vW.z*.05))*.010,1.,sin(vW.z*.075-uTime*.7)*.014));
    vec3 V=normalize(cameraPosition-vW);vec3 R=reflect(-V,nW);float g=max(dot(R,sunDir),0.);
    float core=smoothstep(.99935,.99975,g),halo=smoothstep(.9955,.9993,g);
    float sp=hs(floor(vW.xz/2.)+floor(uTime*3.));
    float spark=step(.82,sp)*smoothstep(.985,.996,g);
    c=mix(c,cGlint,max(max(core,step(bay,halo*.85)*.85),spark*.75));
    // haze by distance, plus sky reflection (Fresnel-style) that grows as the view gets flatter, so the far sea melts into the sky
    // over many pixels instead of meeting it at a hard line
    float f=smoothstep(fogNear,fogFar,vD);float gz=max(uCamY,1.)/max(vD,1.);
    f=max(f,pow(1.-clamp(gz,0.,1.),7.)*.9);
    // alpha 0 tells the post pass not to outline the sea: at low altitude every row of distant water is a big depth step,
    // which the edge finder used to read as an outline, painting a dark band along the horizon
    gl_FragColor=vec4(mix(c,fogColor,f),0.);}`});
const water=new THREE.Mesh(new THREE.PlaneGeometry(64000,40000).rotateX(-Math.PI/2),waterMat);scene.add(water);

/* ---------------- strips ---------------- */
const SURF={paved:0x5e5a66,grass:0x6c9c45,dirt:0xd6b07c,sand:0xd9c48e,cinder:0x5a5056};
(function buildStrips(){
  const P=[],C=[];
  const mk=[];
  for(const s of STRIPS){
    const n=Math.ceil(s.len/20); const base=new THREE.Color(SURF[s.surf]);
    for(let i=0;i<n;i++){
      const a0=-s.len/2+i*s.len/n,a1=a0+s.len/n;
      const col=base.clone(); if(s.surf==='grass'&&(i%2)) col.multiplyScalar(.9); if(s.surf==='dirt'||s.surf==='sand'||s.surf==='cinder') col.multiplyScalar(1+(hash2(i,3,9)-.5)*.1);
      const q=[[a0,-s.wid/2],[a0,s.wid/2],[a1,-s.wid/2],[a1,s.wid/2]].map(([u,t])=>{const w=toWorld(s,u,t);return [w.x,groundH(w.x,w.z)+.14,w.z];});
      for(const k of [0,1,2,2,1,3]){P.push(...q[k]);C.push(col.r,col.g,col.b);}
    }
    const dec=(u,t,a,b,ang,color)=>{const c=Math.cos(ang),sn=Math.sin(ang);const q=[[-a,-b],[-a,b],[a,-b],[a,b]].map(([du,dt])=>{const w=toWorld(s,u+du*c-dt*sn,t+du*sn+dt*c);return [w.x,groundH(w.x,w.z)+.17,w.z];});
      for(const k of [0,1,2,2,1,3]){P.push(...q[k]);C.push(color.r,color.g,color.b);}};
    const dc=new THREE.Color(),hw=s.wid/2,ND=Math.round(s.len*s.wid/9);
    for(let i=0;i<ND;i++){const u=(rnd()-.5)*s.len,t=(rnd()-.5)*(s.wid-1.2),k=rnd();
      if(s.surf==='paved'){dc.copy(base).multiplyScalar(k<.5?.86:1.12);dec(u,t,.4+rnd()*1.4,.3+rnd()*.9,rnd()*3,dc);}
      else if(s.surf==='grass'){dc.setHex(k<.5?0x4f7f34:k<.85?0x86b056:0xd8d06a);dec(u,t,.25+rnd()*.5,.25+rnd()*.5,rnd()*3,dc);}
      else{dc.copy(base).multiplyScalar(k<.5?.78:1.15);dec(u,t,.18+rnd()*.45,.18+rnd()*.4,rnd()*3,dc);}}
    if(s.surf==='paved'){const tz=s.len/2-s.len*.22;dc.setHex(0x3a3640);
      for(const e of [-1,1])for(let i=0;i<46;i++){const u=e*(tz-(rnd()*.9-.2)*90),t=(rnd()<.5?-1:1)*(1.2+rnd()*1.6);dec(u,t,3+rnd()*7,.22+rnd()*.12,(rnd()-.5)*.04,dc);}
      dc.setHex(0xefe8d8);for(let u=-s.len/2+4;u<s.len/2-4;u+=8)for(const e of [-1,1])dec(u,e*(hw-.8),3.6,.25,0,dc);}
    else{dc.copy(base).multiplyScalar(s.surf==='grass'?.82:.8);for(let u=-s.len/2;u<s.len/2;u+=6)for(const e of [-1,1])dec(u+3,e*1.6,3.1,.38,0,dc);
      if(s.surf==='grass'){dc.copy(base).multiplyScalar(1.08);for(let u=-s.len/2;u<s.len/2;u+=10)for(const e of [-1,1])dec(u+5,e*hw*.6,5,hw*.18,0,dc);}}
    const yaw=-s.hdg*DEG, y=s.elev+.2;
    const put=(u,t,w,h,d,color)=>{const p=toWorld(s,u,t);mk.push({geo:BOX(w,h,d),m:M([p.x,groundH(p.x,p.z)+.18+h/2,p.z],[0,yaw,0]),color});};
    if(s.surf==='paved'){
      for(let u=-s.len/2+60;u<s.len/2-60;u+=30) put(u,0,.8,.06,14,0xefe8d8);
      for(const e of [-1,1]){ for(let k=-3;k<=3;k++) if(k) put(e*(s.len/2-8),k*2.6,1.2,.06,16,0xefe8d8);
        for(const t of [-5,5]) put(e*(s.len/2-s.len*.22),t,3,.06,22,0xefe8d8); }
    } else {
      for(let u=-s.len/2;u<=s.len/2;u+=40) for(const t of [-1,1]) put(u,t*(s.wid/2+1),1.2,.6,1.2,0xf4efe2);
      for(const e of [-1,1]) for(let k=-2;k<=2;k++) put(e*(s.len/2+2),k*s.wid/5,1.4,.7,1.4,k%2?0xe8743a:0xf4efe2);
    }
    // distance boards every 100 m: count down the runway left, so you can judge your roll and your height
    for(let k=1;k*100<s.len;k++)for(const e of [-1,1]){const u=-s.len/2+k*100,t=e*(hw+(s.surf==='paved'?12:7));
      put(u,t,.2,2.6,.2,0x3a3440);put(u,t,2.2,1.4,.25,k%2?0xf4efe2:0x2c2833);put(-u,t,.2,2.6,.2,0x3a3440);put(-u,t,2.2,1.4,.25,k%2?0xf4efe2:0x2c2833);}
    for(let u=-s.len/2;u<=s.len/2+.1;u+=s.len/Math.round(s.len/30))for(const t of [-1,1]){const p=toWorld(s,u,t*(s.wid/2+1.5));rwyLight(s,p.x,groundH(p.x,p.z)+.7,p.z,Math.abs(Math.abs(u)-s.len/2)<1?0xffb347:0xfff1c8);}
    // windsock
    const wp=toWorld(s,-s.len*.3,-(s.wid/2+22)),wy=groundH(wp.x,wp.z);
    mk.push({geo:new THREE.CylinderGeometry(.12,.15,7,5),m:M([wp.x,wy+3.5,wp.z]),color:0xd8d2c8});
    const wd=70*DEG; // wind blows toward 70°
    for(let k=0;k<3;k++){const r=.55-k*.12;const off=.6+k*.85;
      mk.push({geo:new THREE.CylinderGeometry(r-.08,r,.85,7,1,true).rotateX(Math.PI/2),m:M([wp.x+Math.sin(wd)*off,wy+6.7-k*.12,wp.z-Math.cos(wd)*off],[0,-wd,0]),color:k%2?0xf4efe2:0xe8743a});}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.computeVertexNormals();
  const m=new THREE.Mesh(g,toon({polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));scene.add(m);
  scene.add(shadowy(new THREE.Mesh(merge(mk),toon())));
})();

/* ---------------- plane model ---------------- */
/* the plane. pal = {body, trim} colors; o = {model, wingK (span stretch), spats, pod}.
   Models: cub (the Puddle Jumper: high wing, struts), bi (the Bluebird: biplane, round cowling, open cockpit),
   racer (the Gannet: low tapered wing, long nose, bubble canopy), float (the Pelican: big high wing on built-in floats) */
function buildPlane(pal,o={}){
  const body=[],wing=[],model=o.model||'cub',wk=o.wingK||1;
  const cream=pal.body,red=pal.trim,dark=0x2c2833,glass=0x34465c,tire=0x29252b,metal=0x9a96a2;
  const wheels=(z0,spread,h)=>{for(const sx of [-1,1]){beam(body,new V3(sx*.5,-.55,z0),new V3(sx*spread,-h,z0),.09,dark);
      if(o.spats)body.push({geo:new THREE.SphereGeometry(.42,8,6).scale(.7,1,1.6),m:M([sx*spread,-h-.05,z0]),color:red});
      else body.push({geo:new THREE.CylinderGeometry(.33,.33,.2,10).rotateZ(Math.PI/2),m:M([sx*spread,-h-.02,z0]),color:tire});}};
  const tailGeo=(len,wx,wy)=>{const t=BOX(1.0,1.0,len);const p=t.attributes.position;for(let i=0;i<p.count;i++){if(p.getZ(i)>0){p.setX(i,p.getX(i)*wx);p.setY(i,p.getY(i)*wy+.3);}}t.computeVertexNormals();return t;};
  const finGeo=(h,d)=>{const f=BOX(.09,h,d);const p=f.attributes.position;for(let i=0;i<p.count;i++){if(p.getY(i)>0)p.setZ(i,p.getZ(i)*.6+.35);}f.computeVertexNormals();return f;};
  let propZ=-2.82,propY=-.05;
  if(model==='bi'){
    body.push({geo:new THREE.CylinderGeometry(.62,.58,.7,12).rotateX(Math.PI/2),m:M([0,0,-2.1]),color:red});
    body.push({geo:new THREE.ConeGeometry(.24,.4,8).rotateX(-Math.PI/2),m:M([0,0,-2.65]),color:metal});
    body.push({geo:BOX(1.05,1.05,2.2),m:M([0,0,-.7]),color:cream});
    body.push({geo:BOX(.9,.22,.06),m:M([0,.62,-1.2],[-.5,0,0]),color:glass});
    body.push({geo:BOX(1.0,.12,.9),m:M([0,.52,-.4]),color:dark});
    body.push({geo:tailGeo(3.2,.3,.4),m:M([0,.05,2.0]),color:cream});
    body.push({geo:BOX(3.0,.09,.8),m:M([0,.38,3.55]),color:cream});
    body.push({geo:finGeo(1.2,.9),m:M([0,.95,3.55]),color:red});
    for(const [y,span] of [[1.35,8.6],[-.42,8.0]]){wing.push({geo:BOX(span*wk,.14,1.35),m:M([0,y,-.95]),color:cream});
      for(const sx of [-1,1])wing.push({geo:BOX(.5,.15,1.36),m:M([sx*(span*wk/2-.25),y,-.95]),color:red});}
    for(const sx of [-1,1]){for(const zz of [-1.45,-.45]){beam(body,new V3(sx*3.0*wk,-.35,zz),new V3(sx*3.0*wk,1.3,zz),.06,dark);beam(body,new V3(sx*.45,.5,zz),new V3(sx*.9,1.3,zz),.05,dark);}}
    wheels(-1.2,.95,1.0);propZ=-2.5;propY=0;
  }else if(model==='racer'){
    body.push({geo:BOX(.9,.85,1.6),m:M([0,-.1,-2.5]),color:cream});
    body.push({geo:new THREE.ConeGeometry(.36,.8,10).rotateX(-Math.PI/2),m:M([0,-.1,-3.7]),color:red});
    body.push({geo:BOX(1.0,1.0,2.4),m:M([0,-.05,-.6]),color:cream});
    body.push({geo:new THREE.SphereGeometry(.5,10,6,0,TAU,0,Math.PI/2).scale(.95,1.0,2.2),m:M([0,.42,-.7]),color:glass});
    body.push({geo:tailGeo(3.8,.24,.32),m:M([0,0,2.4]),color:cream});
    body.push({geo:BOX(1.02,.12,4.6),m:M([0,-.36,-1.0]),color:red});
    body.push({geo:BOX(3.0,.08,.7),m:M([0,.3,4.2]),color:cream});
    body.push({geo:finGeo(1.25,.9),m:M([0,.9,4.15]),color:red});
    const wg=BOX(9.4*wk,.15,1.6);{const p=wg.attributes.position;for(let i=0;i<p.count;i++){const t=Math.abs(p.getX(i))/(4.7*wk);p.setZ(i,p.getZ(i)*(1-.45*t)+.2*t);}wg.computeVertexNormals();}
    wing.push({geo:wg,m:M([0,-.38,-.5]),color:cream});for(const sx of [-1,1])wing.push({geo:BOX(.45,.16,.9),m:M([sx*(4.7*wk-.2),-.38,-.3]),color:red});
    wheels(-.9,1.4,1.05);propZ=-4.15;propY=-.1;
  }else{
    const big=model==='float'?1.12:1;
    body.push({geo:BOX(1.0*big,.95*big,1.0),m:M([0,-.05,-2.2]),color:cream});
    body.push({geo:new THREE.ConeGeometry(.3,.5,8).rotateX(-Math.PI/2),m:M([0,-.05,-2.95]),color:red});
    body.push({geo:BOX(1.15*big,1.25*big,2.3*big),m:M([0,.05,-.6]),color:cream});
    body.push({geo:BOX(1.0,.55,.08),m:M([0,.42,-1.72],[-.45,0,0]),color:glass});
    for(const sx of [-1,1]) body.push({geo:BOX(.04,.5,1.4),m:M([sx*.585*big,.4,-.55]),color:glass});
    body.push({geo:tailGeo(3.6*big,.28,.38),m:M([0,.08,2.3*big]),color:cream});
    body.push({geo:BOX(1.18*big,.15,3.4),m:M([0,-.14,-1.1]),color:red});
    body.push({geo:BOX(3.4*big,.09,.85),m:M([0,.42,4.05*big]),color:cream});
    for(const sx of [-1,1]) body.push({geo:BOX(.5,.1,.86),m:M([sx*1.5*big,.42,4.05*big]),color:red});
    body.push({geo:finGeo(1.3*big,1.0),m:M([0,1.0,4.05*big]),color:red});
    const span=(model==='float'?12.4:10.5)*wk,wy=.78+(big-1)*.6;
    wing.push({geo:BOX(span,.16,1.55*big),m:M([0,wy,-.55]),color:cream});
    for(const sx of [-1,1]){wing.push({geo:BOX(.6,.17,1.56*big),m:M([sx*(span/2-.3),wy,-.55]),color:red});
      for(const zz of [-.95,-.2]) beam(body,new V3(sx*.56,-.3,zz),new V3(sx*2.7*wk,wy-.08,zz-.05),.07,dark);}
    if(model==='float'){for(const sx of [-1,1]){body.push({geo:BOX(.62,.5,5.6),m:M([sx*1.45,-1.85,-.5]),color:red});body.push({geo:new THREE.ConeGeometry(.31,.9,6).rotateX(-Math.PI/2).scale(1,.8,1),m:M([sx*1.45,-1.8,-3.7]),color:red});
        body.push({geo:BOX(.64,.08,5.62),m:M([sx*1.45,-1.58,-.5]),color:cream});for(const zz of [-1.6,.6])beam(body,new V3(sx*.5,-.5,zz),new V3(sx*1.45,-1.6,zz),.08,dark);}}
    else{wheels(.15,1.12,1.0);beam(body,new V3(0,-.5,-2.15),new V3(0,-1.05,-2.15),.08,dark);body.push({geo:new THREE.CylinderGeometry(.28,.28,.18,10).rotateZ(Math.PI/2),m:M([0,-1.07,-2.15]),color:tire});}
  }
  if(o.pod)body.push({geo:BOX(.8,.55,2.4),m:M([0,model==='racer'?-.75:-.85,-.4]),color:red},{geo:new THREE.ConeGeometry(.38,.6,8).rotateX(-Math.PI/2).scale(1,.7,1),m:M([0,model==='racer'?-.75:-.85,-1.9]),color:red});
  const g=new THREE.Group();
  const bodyM=new THREE.Mesh(merge(body),litify(toon({},false))),wingM=new THREE.Mesh(merge(wing),litify(toon({},false)));
  const blades=new THREE.Mesh(merge([{geo:BOX(.16,2.0,.05),m:M([0,0,0]),color:0x3a3438}]),toon({},false));blades.position.set(0,propY,propZ);
  const disc=new THREE.Mesh(new THREE.CircleGeometry(1.0,18),new THREE.MeshBasicMaterial({color:0xe9e0d0,transparent:true,opacity:.18,depthWrite:false}));disc.position.set(0,propY,propZ-.02);
  bodyM.castShadow=wingM.castShadow=true;g.add(bodyM,wingM,blades,disc); g.userData={bodyM,wingM,blades,disc}; return g;
}
const plane=buildPlane({body:0xf3e7cf,trim:0xd2493c}); scene.add(plane);
const parked=buildPlane({body:0xe9eef0,trim:0x3f7f8f}); scene.add(parked);

/* ---------------- props: village, lighthouse, sights ---------------- */
const anims=[];
/* things the horn startles: each flock registers a spot; honk() stamps its time and the flock's animation reads scareOf() */
const SCARE=[];let animNow=0;anims.push(t=>{animNow=t;});
function scareSpot(x,y,z,kind='flock'){const e={x,y,z,at:-1e9,kind};SCARE.push(e);return e;}
function scareOf(e,t){const s=t-e.at;if(s<0||s>6)return 0;return Math.min(1,s/.35)*(1-s/6)**2;}
var harbor={x:0,z:0}, smokeSpots=[], villageC={x:0,z:0}, farmSpots=[];
const H=STRIPS[0];
function scanTo(x,z,dx,dz,cond,max=4000,step=10){for(let d=0;d<max;d+=step){const px=x+dx*d,pz=z+dz*d;if(cond(groundH(px,pz)))return {x:px,z:pz,d};}return null;}
(function village(){
  const items=[],roofs=[];
  const vc=toWorld(H,40,260); const dir={x:H.fx,z:H.fz}, per={x:H.rx,z:H.rz};
  const yaw=-H.hdg*DEG;
  const walls=[0xf1e6d2,0xe9d3b0,0xf3d9c6,0xdfe3e6,0xf0e2a8,0xe6cfc0], rc=[0xc2553f,0xb4473d,0x3f6f8f,0x5b8f7b,0xd07a3a,0x8a5a8c];
  const street=[];
  function house(x,z,face){
    const w=8+rnd()*3,d=7+rnd()*2,hh=5+rnd()*2.2; const g=[groundH(x,z),groundH(x+4,z+4),groundH(x-4,z-4)];
    if(Math.min(...g)<1.5||Math.max(...g)-Math.min(...g)>5) return false;
    const base=Math.min(...g)-2, top=Math.max(...g)+hh, ht=top-base;
    const wc=walls[(rnd()*walls.length)|0], r=rc[(rnd()*rc.length)|0];
    const ry=yaw+face;
    items.push({geo:BOX(w,ht,d),m:M([x,base+ht/2,z],[0,ry,0]),color:wc});
    for(const sd of [-1,1]){const ox=Math.sin(ry)*(d/2+.25)*sd,oz=Math.cos(ry)*(d/2+.25)*sd;if(rnd()<.8)addLight(x+ox+Math.cos(ry)*(rnd()-.5)*w*.5,top-hh*.5,z+oz-Math.sin(ry)*(rnd()-.5)*w*.5,rnd()<.2?0xffd9a0:0xffc25a);}
    const roof=new THREE.CylinderGeometry(.01,1,1,3,1).rotateZ(0); // prism via 3-sided cylinder
    roofs.push({geo:new THREE.CylinderGeometry(w*.62,w*.62,d+.8,3,1).rotateX(-Math.PI/2),m:M([x,top+w*.1922-.3,z],[0,ry,0],[1,.62,1]),color:r});
    if(rnd()<.6){const cx=x+Math.cos(ry)*w*.25,cz=z-Math.sin(ry)*w*.25;items.push({geo:BOX(1,3,1),m:M([cx,top+2.2,cz],[0,ry,0]),color:0x8a6a5c});smokeSpots.push(new V3(cx,top+3.8,cz));}
    return true;
  }
  for(let k=-8;k<=8;k++){
    const along=k*15+(rnd()-.5)*3;
    for(const side of [-1,1]){ if(rnd()<.15) continue;
      if(Math.abs(k)<=1||Math.abs(k)===3||(Math.abs(k)===6&&k*side<0))continue; // the square and the shops (town.js)
      const x=vc.x+dir.x*along+per.x*side*14, z=vc.z+dir.z*along+per.z*side*14; house(x,z,side>0?Math.PI:0);}
    const sx=vc.x+dir.x*along,sz=vc.z+dir.z*along; street.push([sx,sz]);
  }
  // cross street down to the harbor
  const sh=scanTo(vc.x,vc.z,per.x,per.z,h=>h<-.8);
  if(sh){ for(let d=30;d<sh.d-25;d+=15){for(const side of [-1,1]){if(rnd()<.3)continue;const x=vc.x+per.x*d+dir.x*side*13,z=vc.z+per.z*d+dir.z*side*13;house(x,z,side>0?-Math.PI/2:Math.PI/2);}}
    // pier
    const L=80, px=sh.x-per.x*10, pz=sh.z-per.z*10;
    items.push({geo:BOX(4,.6,L),m:M([px+per.x*L/2,1.2,pz+per.z*L/2],[0,Math.atan2(-per.x,-per.z),0]),color:0x9b7552});
    for(let d=0;d<=L;d+=10)for(const s of [-1.8,1.8])items.push({geo:BOX(.5,4,.5),m:M([px+per.x*d+dir.x*s,0,pz+per.z*d+dir.z*s]),color:0x6e5240});
    harbor.x=px+per.x*L; harbor.z=pz+per.z*L; harbor.dir=per; harbor.side=dir;
  }
  // street surface
  const SP=[],SC=[];const sc=new THREE.Color(0xcdb58a);
  for(let i=0;i<street.length-1;i++){const [x0,z0]=street[i],[x1,z1]=street[i+1];
    const q=[[x0-per.x*4,z0-per.z*4],[x0+per.x*4,z0+per.z*4],[x1-per.x*4,z1-per.z*4],[x1+per.x*4,z1+per.z*4]].map(([x,z])=>[x,groundH(x,z)+.25,z]);
    for(const k of [0,2,1,1,2,3]){SP.push(...q[k]);SC.push(sc.r,sc.g,sc.b);}}
  const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(SP,3));sg.setAttribute('color',new THREE.Float32BufferAttribute(SC,3));sg.computeVertexNormals();
  scene.add(new THREE.Mesh(sg,toon({side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2})));
  // hangar by the runway
  const hp=toWorld(H,120,-60), hy=groundH(hp.x,hp.z);
  items.push({geo:BOX(26,8,20),m:M([hp.x,hy+3,hp.z],[0,yaw,0]),color:0xb9b2a6});
  roofs.push({geo:new THREE.CylinderGeometry(10,10,26,10,1,false,0,Math.PI).rotateZ(Math.PI/2),m:M([hp.x,hy+7,hp.z],[0,yaw,0],[1,.45,1]),color:0x7d8f9a});
  items.push({geo:BOX(12,6.5,.3),m:M([hp.x+H.rx*10.1,hy+3.2,hp.z+H.rz*10.1],[0,yaw,0]),color:0x3a3440});
  for(let i=0;i<street.length;i+=2){const [sx,sz]=street[i];addLight(sx+per.x*5,groundH(sx,sz)+4,sz+per.z*5,0xffe0a0);}
  scene.add(shadowy(new THREE.Mesh(merge(items),toon())));
  scene.add(shadowy(new THREE.Mesh(merge(roofs),toon())));
  villageC=vc;
})();
/* ---------------- farmsteads, cottages, sheep ---------------- */
(function countryside(){
  const walls=[],roofs=[];const wc=[0xf1e6d2,0xe9d3b0,0xf3d9c6,0xdfe3e6,0xf0e2a8],rcs=[0xc2553f,0x3f6f8f,0x5b8f7b,0x8a5a8c,0xd07a3a,0x6a5a52];
  const far=(x,z,d)=>farmSpots.every(f=>Math.hypot(f.x-x,f.z-z)>d);
  const house=(x,z,ry,w,d,hh,wall,roof,lights)=>{const g=[groundH(x,z),groundH(x+w/2,z+d/2),groundH(x-w/2,z-d/2)];const base=Math.min(...g)-2,top=Math.max(...g)+hh,ht=top-base;
    walls.push({geo:BOX(w,ht,d),m:M([x,base+ht/2,z],[0,ry,0]),color:wall});
    roofs.push({geo:new THREE.CylinderGeometry(w*.62,w*.62,d+.8,3,1).rotateX(-Math.PI/2),m:M([x,top+w*.1922-.3,z],[0,ry,0],[1,.62,1]),color:roof});
    for(let i=0;i<lights;i++){const sd=i%2?1:-1;addLight(x+Math.sin(ry)*(d/2+.25)*sd+Math.cos(ry)*(rnd()-.5)*w*.5,top-hh*.5,z+Math.cos(ry)*(d/2+.25)*sd-Math.sin(ry)*(rnd()-.5)*w*.5,0xffc25a);}};
  let tries=0,farmsN=0;
  while(farmsN<34&&tries<6000){tries++;const x=(rnd()-.5)*6000,z=(rnd()-.5)*4200,h=groundH(x,z);const sl=slopeAt(x,z);
    if(!isFarm(x,z,h,sl)||nearStrip(x,z,140)||Math.hypot(x-villageC.x,z-villageC.z)<320||!far(x,z,260))continue;
    const ry=-FA+(rnd()<.5?0:Math.PI/2);farmSpots.push({x,z,r:34});farmsN++;
    house(x,z,ry,9,7,5,wc[(rnd()*wc.length)|0],rcs[(rnd()*rcs.length)|0],2);
    const bx=x+Math.cos(ry)*16,bz=z-Math.sin(ry)*16;house(bx,bz,ry,11,16,7,rnd()<.7?0xa8433a:0x8a6a5a,0x4a4048,1);
    if(rnd()<.5){const sx=x-Math.cos(ry)*12+Math.sin(ry)*8,sz=z+Math.sin(ry)*12+Math.cos(ry)*8,sy=groundH(sx,sz);walls.push({geo:new THREE.CylinderGeometry(2.4,2.4,13,8),m:M([sx,sy+6,sz]),color:0xb9b2a6});roofs.push({geo:new THREE.SphereGeometry(2.45,8,4,0,TAU,0,Math.PI/2),m:M([sx,sy+12.5,sz]),color:0x7d8f9a});}
  }
  tries=0;let cot=0;
  while(cot<30&&tries<6000){tries++;const x=(rnd()-.5)*7200-250,z=(rnd()-.5)*4400,h=groundH(x,z);const sl=slopeAt(x,z);
    if(h<12||h>320||sl>.28||isFarm(x,z,h,sl)||nearStrip(x,z,120)||Math.hypot(x-villageC.x,z-villageC.z)<300||!far(x,z,180))continue;
    farmSpots.push({x,z,r:16});cot++;house(x,z,rnd()*TAU,7+rnd()*2,6,4.5,wc[(rnd()*wc.length)|0],rcs[(rnd()*rcs.length)|0],1);
  }
  scene.add(shadowy(new THREE.Mesh(merge(walls),toon())));scene.add(shadowy(new THREE.Mesh(merge(roofs),toon())));
  // sheep
  const sheep=[];const L=STRIPS[1];
  for(let t=0;t<4000&&sheep.length<90;t++){const near=sheep.length<45;const x=near?L.x+(rnd()-.5)*1100:(rnd()-.5)*6000,z=near?L.z+(rnd()-.5)*700:(rnd()-.5)*4200,h=groundH(x,z);const sl=slopeAt(x,z);
    if(h<6||h>260||sl>.25||nearStrip(x,z,20))continue;if(!near&&!(isFarm(x,z,h,sl)&&fieldColor(x,z)<0))continue;sheep.push({x,z,h,r:rnd()*TAU});}
  const body=new THREE.InstancedMesh(BOX(1.3,1,2),bakeify(new THREE.MeshToonMaterial({color:0xf2eee4,gradientMap:gradTex,flatShading:true})),sheep.length);
  const head=new THREE.InstancedMesh(BOX(.6,.6,.7),new THREE.MeshToonMaterial({color:0x2c2833,gradientMap:gradTex,flatShading:true}),sheep.length);
  const mm=new THREE.Matrix4(),q=new Q();sheep.forEach((sp,i)=>{q.setFromEuler(new THREE.Euler(0,sp.r,0));mm.compose(new V3(sp.x,sp.h+.7,sp.z),q,new V3(1,1,1));body.setMatrixAt(i,mm);
    mm.compose(new V3(sp.x-Math.sin(sp.r)*1.2,sp.h+1,sp.z-Math.cos(sp.r)*1.2),q,new V3(1,1,1));head.setMatrixAt(i,mm);});
  body.castShadow=true;scene.add(body,head);window.SHEEP={list:sheep,body,head};
})();

/* ---- sights, life, post, pixel HUD ---- */
const sights={};
/*@TOWN@*/
(function lighthouse(){
  const tip=scanTo(-3000,-290,-1,0,h=>h<2)||{x:-3500,z:-290};
  const x=tip.x+40,z=tip.z, y=groundH(x,z);
  const it=[];
  for(let k=0;k<7;k++) it.push({geo:new THREE.CylinderGeometry(3.4-k*.25,3.6-k*.25,4,10),m:M([x,y+2+k*4,z]),color:k%2?0xd2493c:0xf4efe4});
  it.push({geo:new THREE.CylinderGeometry(2.4,2.4,3.4,8),m:M([x,y+30,z]),color:0x2c2833});
  it.push({geo:new THREE.ConeGeometry(3,2.6,8),m:M([x,y+33,z]),color:0xd2493c});
  it.push({geo:BOX(8,4,6),m:M([x+9,y+1.5,z+3]),color:0xf1e6d2});
  it.push({geo:new THREE.CylinderGeometry(4.6,4.6,7,3).rotateX(-Math.PI/2).rotateY(Math.PI/2),m:M([x+9,y+4.6,z+3],[0,0,0],[1,.5,1]),color:0x5b6e86});
  scene.add(new THREE.Mesh(merge(it),toon()));
  const lamp=new THREE.Mesh(new THREE.BoxGeometry(2.2,1.6,2.2),new THREE.MeshBasicMaterial({color:0xfff2b8}));lamp.position.set(x,y+30,z);scene.add(lamp);
  const bm=new THREE.MeshBasicMaterial({color:0xfff2b8,transparent:true,opacity:.16,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
  const piv=new THREE.Group();piv.position.set(x,y+30,z);scene.add(piv);
  for(const s of [1,-1]){const c=new THREE.Mesh(new THREE.ConeGeometry(7,80,12,1,true).translate(0,-40,0).rotateZ(s*Math.PI/2),bm);piv.add(c);}
  anims.push(t=>{piv.rotation.y=t*.6;bm.opacity=TOD[tod].beam;});addLight(x,y+30,z,0xfff2b8);
  sights.lighthouse={x,z,y,name:'Gull Point Light',desc:'Tomas keeps it lit every night. For now.'};
})();
(function arch(){
  const p=scanTo(250,-600,0,-1,h=>h<-6)||{x:250,z:-2400};
  const x=p.x,z=p.z-60, it=[];
  const rock=[0x9c8a80,0x8a7a74,0xa89888];
  it.push({geo:new THREE.DodecahedronGeometry(1,0),m:M([x-16,8,z],[0,.3,0],[9,30,9]),color:rock[0]});
  it.push({geo:new THREE.DodecahedronGeometry(1,0),m:M([x+16,6,z+3],[0,1,0],[8,26,9]),color:rock[1]});
  it.push({geo:new THREE.DodecahedronGeometry(1,0),m:M([x,30,z+1],[0,.1,.08],[26,7,9]),color:rock[2]});
  for(let k=0;k<6;k++) it.push({geo:new THREE.DodecahedronGeometry(1,0),m:M([x+(rnd()-.5)*90,0,z+(rnd()-.5)*60],[rnd(),rnd(),0],[3+rnd()*6,4+rnd()*8,3+rnd()*6]),color:rock[k%3]});
  scene.add(new THREE.Mesh(merge(it),toon()));
  sights.arch={x,z,y:20,name:'Sea Arch',desc:'Big enough to fly through, if you are very brave and very level.'};
})();
(function wreck(){
  const p=scanTo(2300,650,1,0,h=>h<-2.5)||{x:3200,z:650};
  const x=p.x+70,z=p.z,it=[];
  const hull=BOX(6,4,22);{const a=hull.attributes.position;for(let i=0;i<a.count;i++){if(a.getY(i)<0)a.setX(i,a.getX(i)*.5);if(a.getZ(i)<0)a.setX(i,a.getX(i)*.35);}hull.computeVertexNormals();}
  it.push({geo:hull,m:M([x,.4,z],[.12,.9,.35]),color:0x7a4a36});
  beam(it,new V3(x,1,z),new V3(x+6,13,z-3),.5,0x5a4030);
  scene.add(new THREE.Mesh(merge(it),toon()));
  sights.wreck={x,z,y:2,name:'Shipwreck',desc:'The Marigold, run aground in a storm before the lighthouse was built.'};
})();
(function windmill(){
  let best=null;for(let k=0;k<80;k++){const a=rnd()*TAU,r=rnd()*420,x=-900+Math.cos(a)*r,z=250+Math.sin(a)*r;
    if(nearStrip(x,z,120)||slopeAt(x,z)>.3)continue;const h=groundH(x,z);if(!best||h>best.h)best={x,z,h};}
  const {x,z,h}=best;const it=[];
  it.push({geo:new THREE.CylinderGeometry(2.4,3.8,14,8),m:M([x,h+7,z]),color:0xf0e4cc});
  it.push({geo:new THREE.ConeGeometry(3,3.5,8),m:M([x,h+15.6,z]),color:0x8f4a3c});
  scene.add(new THREE.Mesh(merge(it),toon()));
  const bl=[];for(let k=0;k<4;k++){bl.push({geo:BOX(1.6,9,.2),m:M([Math.cos(k*Math.PI/2)*4.8,Math.sin(k*Math.PI/2)*4.8,0],[0,0,k*Math.PI/2-Math.PI/2]),color:0xe9dcc4});}
  const blades=new THREE.Mesh(merge(bl),toon());const piv=new THREE.Group();piv.position.set(x,h+13,z);piv.rotation.y=-70*DEG+Math.PI;scene.add(piv);
  blades.position.z=-3;piv.add(blades);anims.push(t=>blades.rotation.z=t*.5);
  sights.windmill={x,z,y:h,name:'Old Windmill',desc:'Still turning. Still grinding flour for Ferrow\'s bakery.'};
})();

/* ---------------- the outer islands: Marram Cay, Kettle Rock, Farhold ---------------- */
const stripOf=id=>STRIPS.find(q=>q.id===id);
function hutAt(list,roofs,x,z,ry,w,d,hh,wall,roof,lit,roofKind){const g=[groundH(x,z),groundH(x+w/2,z+d/2),groundH(x-w/2,z-d/2)];const base=Math.min(...g)-1.5,top=Math.max(...g)+hh,ht=top-base;
  list.push({geo:BOX(w,ht,d),m:M([x,base+ht/2,z],[0,ry,0]),color:wall});
  if(roofKind==='thatch')roofs.push({geo:new THREE.ConeGeometry(Math.max(w,d)*.82,hh*.9,4).rotateY(Math.PI/4),m:M([x,top+hh*.45-.1,z],[0,ry,0],[w/Math.max(w,d),1,d/Math.max(w,d)]),color:roof});
  else roofs.push({geo:new THREE.CylinderGeometry(w*.62,w*.62,d+.8,3,1).rotateX(-Math.PI/2),m:M([x,top+w*.1922-.3,z],[0,ry,0],[1,.62,1]),color:roof});
  for(let i=0;i<lit;i++){const sd=i%2?1:-1;addLight(x+Math.sin(ry)*(d/2+.3)*sd,top-hh*.5,z+Math.cos(ry)*(d/2+.3)*sd,0xffc25a);}
  farmSpots.push({x,z,r:Math.max(w,d)});}
(function marramProps(){const S=stripOf('marram'),I=ISLES.marram,it=[],rf=[],yaw=-S.hdg*DEG;
  // beach bar on the lagoon side, with umbrellas
  const b=toWorld(S,-70,S.wid/2+34),by=Math.max(groundH(b.x,b.z),1);
  it.push({geo:BOX(14,1,10),m:M([b.x,by+.2,b.z],[0,yaw,0]),color:0xa07a52});
  hutAt(it,rf,b.x,b.z,yaw,9,6,3.4,0xf0e2c0,0xc9a35a,3,'thatch');
  for(const [u,t,c] of [[-14,6,0xd2493c],[-8,12,0x3f8f8a],[2,12,0xe8a33a]]){const p=toWorld(S,-70+u,S.wid/2+34+t),py=Math.max(groundH(p.x,p.z),1);
    it.push({geo:new THREE.CylinderGeometry(.1,.1,3,4),m:M([p.x,py+1.5,p.z]),color:0xe9dcc4});it.push({geo:new THREE.ConeGeometry(2.4,1.1,8),m:M([p.x,py+3.2,p.z]),color:c});}
  // fishing huts round the ring
  for(const a of [.9,1.6,2.2,3.4,4.0,5.1]){let best=null;for(let r=420;r<980;r+=15){const x=I.x+Math.cos(a)*r,z=I.z+Math.sin(a)*r,h=groundH(x,z);if(h>2.2&&!nearStrip(x,z,40)&&(!best||h>best.h))best={x,z,h};}
    if(best)hutAt(it,rf,best.x,best.z,-a,5,4.5,2.6,a>3?0xdfe3e6:0xf3d9c6,0xb89a5a,1,'thatch');}
  // Ollie's flag at the east end of the strip
  const f=toWorld(S,S.len/2+10,S.wid/2+7),fy=groundH(f.x,f.z);it.push({geo:new THREE.CylinderGeometry(.12,.15,9,5),m:M([f.x,fy+4.5,f.z]),color:0xf4efe2});
  scene.add(shadowy(new THREE.Mesh(merge(it),toon())));scene.add(shadowy(new THREE.Mesh(merge(rf),toon())));
  const flag=new THREE.Mesh(BOX(3.4,2,.12).translate(1.7,0,0),toon({color:0xff7a2e,vertexColors:false},false));flag.position.set(f.x,fy+8,f.z);scene.add(flag);
  anims.push(t=>{flag.rotation.y=-70*DEG-Math.PI/2+Math.sin(t*2.3)*.25;});
  // dinghies in the lagoon
  for(const [dx,dz,c] of [[120,140,0xf4efe4],[-180,90,0xf0e2a8],[40,-160,0xdfe3e6]]){const m=new THREE.Mesh(merge([{geo:BOX(1.8,.8,4.6),m:M([0,.3,0]),color:c},{geo:BOX(1.9,.3,4.7),m:M([0,-.05,0]),color:0x3f6f8f}]),toon());
    m.position.set(I.x+dx,0,I.z+dz);m.rotation.y=dx*.01;scene.add(m);anims.push(t=>{m.position.y=Math.sin(t*1.2+dx)*.1;m.rotation.z=Math.sin(t*.9+dz)*.04;});}
  sights.lagoon={x:I.x,z:I.z+60,y:0,name:'Marram Lagoon',desc:'Warm, shallow and turquoise. Rosa swims across it every morning.'};})();
(function kettleProps(){const S=stripOf('kettle'),I=ISLES.kettle,it=[],rf=[],yaw=-S.hdg*DEG;
  // observatory on the north rim
  const a=-1.75,ox=I.x+Math.cos(a)*(KET.cr+40),oz=I.z+Math.sin(a)*(KET.cr+40),oy=groundH(ox,oz);
  it.push({geo:new THREE.CylinderGeometry(6,6.4,9,12),m:M([ox,oy+3.5,oz]),color:0xeeeae2});
  it.push({geo:new THREE.SphereGeometry(6.2,12,6,0,TAU,0,Math.PI/2),m:M([ox,oy+8,oz]),color:0xc8ccd2});
  it.push({geo:BOX(1.6,6,.6),m:M([ox,oy+11,oz-5.6],[.5,0,0]),color:0x2c2833});
  hutAt(it,rf,ox+14,oz+6,.4,7,5,3.2,0xdcd6cc,0x5b6e86,2);
  // Ines's field station beside the strip, downhill side
  const h1=toWorld(S,-90,S.wid/2+22);hutAt(it,rf,h1.x,h1.z,yaw,8,6,3.6,0xd8d0c4,0xc2553f,2);
  const h2=toWorld(S,-110,S.wid/2+26);it.push({geo:new THREE.CylinderGeometry(1.6,1.6,3,8),m:M([h2.x,groundH(h2.x,h2.z)+1.5,h2.z]),color:0x9aa4ac});
  scene.add(shadowy(new THREE.Mesh(merge(it),toon())));scene.add(shadowy(new THREE.Mesh(merge(rf),toon())));
  // steam from the crater floor
  const N=26,floor=kettleCone(KET.cr,0)-KET.depth,pm=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),new THREE.MeshToonMaterial({color:0xf0ecf2,gradientMap:gradTex,flatShading:true}),N);scene.add(pm);
  const seeds=[...Array(N)].map((_,i)=>({x:I.x+(hash2(i,1,99)-.5)*170,z:I.z+(hash2(i,2,99)-.5)*170,o:hash2(i,3,99)}));const mm=new THREE.Matrix4(),q=new Q(),sc=new V3();
  anims.push(t=>{for(let i=0;i<N;i++){const s=seeds[i],ph=(t*.035+s.o)%1,k=(6+ph*34)*(ph>.8?(1-ph)/.2:1)*(ph<.08?ph/.08:1);
    mm.compose(sc.set(s.x+ph*120*.94,floor+10+ph*260,s.z-ph*120*.34),q,new V3(k,k*.8,k));pm.setMatrixAt(i,mm);}pm.instanceMatrix.needsUpdate=true;});
  sights.crater={x:I.x,z:I.z,y:kettleCone(KET.cr,0),name:'Kettle Crater',desc:'It steams, it rumbles, it smells faintly of eggs. Dr. Varga loves it.'};})();
const fogLights=[];
(function farholdProps(){const S=stripOf('farhold'),I=ISLES.farhold,it=[],rf=[],yaw=-S.hdg*DEG;
  // a cluster of stone cottages on the south side of the field
  for(let k=0;k<9;k++){const u=-200+k*48+(rnd()-.5)*16,t=S.wid/2+70+rnd()*90;const p=toWorld(S,u,t);if(groundH(p.x,p.z)<4)continue;
    hutAt(it,rf,p.x,p.z,yaw+(rnd()<.5?0:Math.PI/2),8+rnd()*2,6,4.2,rnd()<.5?0xbcb6aa:0xa8a49c,0x4a4e5c,2);}
  const hp=toWorld(S,120,-(S.wid/2+40)),hy=groundH(hp.x,hp.z);
  it.push({geo:BOX(20,7,16),m:M([hp.x,hy+2.5,hp.z],[0,yaw,0]),color:0xa8a49c});
  rf.push({geo:new THREE.CylinderGeometry(8,8,20,10,1,false,0,Math.PI).rotateZ(Math.PI/2),m:M([hp.x,hy+6,hp.z],[0,yaw,0],[1,.45,1]),color:0x5b6e86});
  // the house with the lamp, alone on the hill
  const lx=I.x-420,lz=I.z-420+90,ly=groundH(lx,lz);hutAt(it,rf,lx,lz,.3,9,7,4.6,0xc8c0b0,0x3e4250,0);
  addLight(lx+Math.sin(.3)*3.8,ly+3,lz+Math.cos(.3)*3.8,0xffd27a);
  scene.add(shadowy(new THREE.Mesh(merge(it),toon())));scene.add(shadowy(new THREE.Mesh(merge(rf),toon())));
  const lamp=new THREE.Mesh(new THREE.BoxGeometry(1.4,1.4,1.4),new THREE.MeshBasicMaterial({color:0xffd27a,fog:false}));lamp.position.set(lx+Math.sin(.3)*4,ly+3.2,lz+Math.cos(.3)*4);scene.add(lamp);
  sights.lamp={x:lx,z:lz,y:ly,name:'Lamp in the Fog',desc:'One window on Farhold that is always lit.'};
  // approach lights: a bar every 30 m out to 330 m from each end, always lit, with a running "rabbit"
  const P=[],C=[],rab=[],poles=[];
  for(const e of [-1,1]){for(let d=30;d<=330;d+=30){const w=toWorld(S,e*(S.len/2+d),0);const y=Math.max(groundH(w.x,w.z),0)+2.5;
      for(let k=-2;k<=2;k++){const q=toWorld(S,e*(S.len/2+d),k*3.2);P.push(q.x,y,q.z);C.push(1,.93,.78);}
      poles.push({geo:BOX(.3,y+1,.3),m:M([w.x,y/2-.5,w.z]),color:0x3a3440});rab.push({e,d,x:w.x,y:y+.6,z:w.z});}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
  const pts=new THREE.Points(g,new THREE.PointsMaterial({size:2,sizeAttenuation:false,vertexColors:true,fog:false}));pts.frustumCulled=false;scene.add(pts);fogLights.push(pts);
  const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(rab.flatMap(r=>[r.x,r.y,r.z]),3));
  const rp=new THREE.Points(rg,new THREE.PointsMaterial({size:4,sizeAttenuation:false,color:0xffffff,fog:false,transparent:true}));rp.frustumCulled=false;scene.add(rp);fogLights.push(rp);
  scene.add(new THREE.Mesh(merge(poles),toon()));
  anims.push(t=>{const k=Math.floor(t*12)%14;for(let i=0;i<rab.length;i++){const j=10-Math.round((rab[i].d-30)/30);rg.attributes.position.array[i*3+1]=j===k?rab[i].y:-999;}rg.attributes.position.needsUpdate=true;});
})();
/* ---------------- landmarks to discover: one-off things worth flying over ---------------- */
function findSpot(cx,cz,r,ok,score,n=400){let best=null;for(let k=0;k<n;k++){const a=rnd()*TAU,d=Math.sqrt(rnd())*r,x=cx+Math.cos(a)*d,z=cz+Math.sin(a)*d,h=groundH(x,z);
  if(!ok(x,z,h))continue;const sc=score(x,z,h);if(!best||sc>best.sc)best={x,z,h,sc};}return best;}
const clearOf=(x,z,m)=>!nearStrip(x,z,m)&&!farmSpots.some(f=>Math.hypot(f.x-x,f.z-z)<f.r+12);
const rockC=[0x9c8a80,0x8a7a74,0xa89888,0x7e7068];
function mark(id,x,z,y,name,desc){sights[id]={x,z,y,name,desc};farmSpots.push({x,z,r:40});}
(function landmarks(){const it=[],lit=[];
  // Ferrow: standing stones on the highest open ground
  {const p=findSpot(-1150,500,1000,(x,z,h)=>h>20&&isleAt(x,z)==='ferrow'&&slopeAt(x,z)<.14&&clearOf(x,z,150)&&Math.hypot(x-villageC.x,z-villageC.z)>400,(x,z,h)=>h);
   if(p){for(let k=0;k<11;k++){const a=k/11*TAU,x=p.x+Math.cos(a)*14,z=p.z+Math.sin(a)*14,h=groundH(x,z);it.push({geo:BOX(3,7.5+hash2(k,1,31)*3,1.8),m:M([x,h+3,z],[0,-a,(hash2(k,2,31)-.5)*.12]),color:k%2?0xf0e8d4:0xe0d8c4});}
     for(const a of [0,2.1,4.2]){it.push({geo:BOX(5.4,1.1,1.5),m:M([p.x+Math.cos(a+.29)*13.8,groundH(p.x,p.z)+10.5,p.z+Math.sin(a+.29)*13.8],[0,-a-.29-Math.PI/2,0]),color:0xe0d8c4});}
     it.push({geo:BOX(3,1.2,2),m:M([p.x,p.h+.4,p.z],[0,.4,0]),color:0xd8d0bc});
     mark('stones',p.x,p.z,p.h,'The Old Stones','A ring of standing stones older than anyone on Ferrow.');}}
  // Ferrow: chapel with a spire at the top of the village street
  {const vc=villageC,dx=STRIPS[0].fx,dz=STRIPS[0].fz;let p=null;for(const d of [160,185,140,210,120]){for(const sd of [1,-1]){const x=vc.x+dx*d*sd,z=vc.z+dz*d*sd;if(groundH(x,z)>4&&slopeAt(x,z)<.2&&!nearStrip(x,z,40)&&!townSpots.some(f=>Math.hypot(f.x-x,f.z-z)<f.r+14)){p={x,z};break;}}if(p)break;}
   if(p){const y=groundH(p.x,p.z),ry=-STRIPS[0].hdg*DEG;it.push({geo:BOX(9,8,16),m:M([p.x,y+3,p.z],[0,ry,0]),color:0xf1ece2});
     it.push({geo:new THREE.CylinderGeometry(6.3,6.3,17,3,1).rotateX(-Math.PI/2),m:M([p.x,y+8.7,p.z],[0,ry,0],[1,.6,1]),color:0x5b6e86});
     const tx=p.x-Math.sin(ry)*-9,tz=p.z-Math.cos(ry)*-9;it.push({geo:BOX(5,16,5),m:M([tx,y+7,tz],[0,ry,0]),color:0xf1ece2});
     it.push({geo:new THREE.ConeGeometry(3.8,11,4).rotateY(Math.PI/4),m:M([tx,y+20.5,tz],[0,ry,0]),color:0x5b6e86});
     it.push({geo:BOX(2.4,2.4,.3),m:M([tx-Math.sin(ry)*2.6,y+12,tz-Math.cos(ry)*2.6],[0,ry,0]),color:0xffd36b});lit.push([tx,y+12,tz,0xffe0a0]);
     mark('chapel',p.x,p.z,y,'Saint Brigid\'s Chapel','The spire you can see from the harbor. The clock is always four minutes slow.');}}
  // Tallpine: fire lookout on a high shoulder
  {const R=stripOf('ridge');const p=findSpot(800,-350,1100,(x,z,h)=>h>260&&h<430&&isleAt(x,z)==='tall'&&slopeAt(x,z)<.3&&Math.hypot(x-R.x,z-R.z)>500,(x,z,h)=>-Math.abs(h-340)-slopeAt(x,z)*200);
   if(p){const y=p.h;for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]])beam(it,new V3(p.x+a*4,y-1,p.z+b*4),new V3(p.x+a*1.8,y+20,p.z+b*1.8),.5,0x6e5240);
     for(const hh of [6,12])for(const [a,b,c,d] of [[-1,-1,1,-1],[1,-1,1,1],[1,1,-1,1],[-1,1,-1,-1]]){const k=hh/21;beam(it,new V3(p.x+a*(4-2.2*k),y+hh,p.z+b*(4-2.2*k)),new V3(p.x+c*(4-2.2*k),y+hh,p.z+d*(4-2.2*k)),.25,0x6e5240);}
     it.push({geo:BOX(6,3.2,6),m:M([p.x,y+21.6,p.z]),color:0xe9d3b0});it.push({geo:BOX(6.4,1.2,6.4),m:M([p.x,y+22,p.z]),color:0x3a5a6c});
     it.push({geo:new THREE.ConeGeometry(5.2,2.6,4).rotateY(Math.PI/4),m:M([p.x,y+24.5,p.z]),color:0xc2553f});lit.push([p.x,y+22,p.z,0xffc25a]);
     mark('lookout',p.x,p.z,y,'Fire Lookout','Ada climbs it every morning with a thermos and binoculars.');}}
  // Tallpine: the Grandfather Pine
  {const p=findSpot(1100,-100,1200,(x,z,h)=>h>40&&h<180&&isleAt(x,z)==='tall'&&slopeAt(x,z)<.25&&clearOf(x,z,120),(x,z,h)=>fbm(x*.0026,z*.0026,3,41));
   if(p){const y=p.h;it.push({geo:new THREE.CylinderGeometry(2.2,3.4,22,7),m:M([p.x,y+10,p.z]),color:0x6b4f3a});
     for(let k=0;k<4;k++)it.push({geo:new THREE.ConeGeometry(15-k*3,16,7),m:M([p.x,y+20+k*10,p.z],[0,k*.4,0]),color:[0x2f5534,0x3a5f3c,0x3f6b3a,0x4b7a3d][k]});
     mark('bigpine',p.x,p.z,y,'The Grandfather Pine','Five times taller than anything around it. The owls like it best.');}}
  // Tallpine: rusted biplane in a clearing (Bea's old engine)
  {const p=findSpot(1500,300,1000,(x,z,h)=>h>30&&h<220&&isleAt(x,z)==='tall'&&slopeAt(x,z)<.18&&clearOf(x,z,150),(x,z,h)=>rnd());
   if(p){const y=p.h,ry=.7;const W=(dx,dy,dz)=>[p.x+Math.cos(ry)*dx+Math.sin(ry)*dz,y+dy,p.z-Math.sin(ry)*dx+Math.cos(ry)*dz];
     it.push({geo:BOX(1.4,1.4,7),m:M(W(0,.9,0),[.06,ry,.15]),color:0xd2493c});it.push({geo:BOX(10,.2,1.6),m:M(W(0,1.5,-1),[0,ry,.15]),color:0xf3e7cf});
     it.push({geo:BOX(6,.2,1.6),m:M(W(-1.6,3.2,-1.1),[0,ry,.4]),color:0xf3e7cf});it.push({geo:BOX(3,.2,1),m:M(W(0,1.3,3.4),[0,ry,0]),color:0xd2493c});
     it.push({geo:BOX(.2,1.4,1),m:M(W(0,2,3.5),[0,ry,0]),color:0xc2553f});
     mark('biplane',p.x,p.z,y,'Rusted Biplane','A cream-and-red wreck in the trees. The tail number matches one in Bea\'s logbook.');}}
  // Gull Point: sea stacks off the north cliffs, white with seabirds
  {const g=ISLES.gull,c=scanTo(g.x+80,g.z,0,-1,h=>h<-6)||{x:g.x,z:g.z-700};const bx=c.x,bz=c.z-120;
   for(const [dx,dz,hh,r] of [[0,0,46,9],[34,22,32,7],[-30,30,24,6],[12,-34,18,5]]){it.push({geo:new THREE.CylinderGeometry(r*.7,r,hh,6),m:M([bx+dx,hh/2-6,bz+dz],[0,dx*.1,0]),color:rockC[(hh|0)%4]});
     it.push({geo:new THREE.CylinderGeometry(r*.72,r*.72,1.2,6),m:M([bx+dx,hh-5.6,bz+dz],[0,dx*.1,0]),color:0xf4f0e6});}
   mark('stacks',bx,bz,10,'The Gull Stacks','Four rock pillars and about ten thousand very loud seabirds.');}
  // Kettle Rock: terraced hot springs on the west flank
  {const k=ISLES.kettle;let p=null;for(let r=600;r<1300;r+=10){const x=k.x-r,z=k.z+120,h=groundH(x,z);if(h<75){p={x,z,h};break;}}
   if(p){const pools=[[0,0,9],[14,6,7],[-10,12,6],[6,-14,5]];pools.forEach(([dx,dz,r],i)=>{const h=groundH(p.x+dx,p.z+dz);
       it.push({geo:new THREE.CylinderGeometry(r+1.4,r+1.8,3,10),m:M([p.x+dx,h-.6,p.z+dz]),color:0xe8e0d0});it.push({geo:new THREE.CylinderGeometry(r,r,.4,10),m:M([p.x+dx,h+.95,p.z+dz]),color:[0x5fd2c8,0x7fe0c8,0x4fb8c8,0x9fe8d0][i]});});
     const N=8,pm=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),new THREE.MeshToonMaterial({color:0xf4f0f4,gradientMap:gradTex,flatShading:true}),N);scene.add(pm);const mm=new THREE.Matrix4(),q=new Q();
     anims.push(t=>{for(let i=0;i<N;i++){const pp=pools[i%4],ph=(t*.12+i/N)%1,s=(1.5+ph*5)*(ph>.75?(1-ph)/.25:1);mm.compose(new V3(p.x+pp[0]+ph*6,groundH(p.x+pp[0],p.z+pp[2])+2+ph*22,p.z+pp[2]-ph*2),q,new V3(s,s,s));pm.setMatrixAt(i,mm);}pm.instanceMatrix.needsUpdate=true;});
     mark('springs',p.x,p.z,p.h,'Kettle Hot Springs','Warm turquoise pools. Otto swears they cure everything except burnt coffee.');}}
  // Marram Cay: whale bones on the southwest sand
  {const m=ISLES.marram;let best=null;for(let r=450;r<950;r+=10){const a=2.85,x=m.x+Math.cos(a)*r,z=m.z+Math.sin(a)*r,h=groundH(x,z);if(h>1.5&&(!best||h>best.h))best={x,z,h};}
   if(best){const p=best,ry=.4;for(let k=0;k<8;k++){const u=(k-3.5)*2.6,cx=p.x+Math.cos(ry)*u,cz=p.z-Math.sin(ry)*u,rr=5.5-Math.abs(k-3.5)*.5;
       it.push({geo:new THREE.TorusGeometry(rr,.35,4,10,Math.PI),m:M([cx,p.h-.6,cz],[0,ry+Math.PI/2,0]),color:0xf2ece0});}
     it.push({geo:BOX(.7,.7,21),m:M([p.x,p.h,p.z],[0,ry+Math.PI/2,0]),color:0xe8e0d0});it.push({geo:BOX(3,2,4),m:M([p.x+Math.cos(ry)*12.5,p.h+.3,p.z-Math.sin(ry)*12.5],[0,ry,0]),color:0xf2ece0});
     mark('whale',p.x,p.z,p.h,'Whale Bones','Washed up before Ollie was born. He has named every rib.');}}
  // Farhold: castle ruin on the eastern headland
  {const f=ISLES.farhold;let p=null;for(let r=200;r<1600;r+=10){const x=f.x+Math.cos(.55)*r,z=f.z+Math.sin(.55)*r,h=groundH(x,z);if(h<14){p={x:f.x+Math.cos(.55)*(r-70),z:f.z+Math.sin(.55)*(r-70)};break;}}
   if(p){const y=groundH(p.x,p.z),st=0xd8d0c0;for(const [dx,dz,w,d,hh] of [[0,-14,28,2.4,9],[-14,0,2.4,28,7],[14,2,2.4,22,5],[4,14,18,2.4,8]])it.push({geo:BOX(w,hh,d),m:M([p.x+dx,y+hh/2-1,p.z+dz]),color:st});
     it.push({geo:new THREE.CylinderGeometry(5,5.6,20,8),m:M([p.x-14,y+9,p.z-14]),color:0xe0d8c8});it.push({geo:BOX(.3,8,.3),m:M([p.x-14,y+25,p.z-14]),color:0x2c2833});it.push({geo:BOX(5,3,.2),m:M([p.x-11.5,y+27.5,p.z-14]),color:0xd2493c});
     for(let k=0;k<8;k++){const a=k/8*TAU;it.push({geo:BOX(1.6,1.6,1.6),m:M([p.x-14+Math.cos(a)*4.6,y+19.8,p.z-14+Math.sin(a)*4.6],[0,-a,0]),color:0xa8a49c});}
     for(let k=0;k<6;k++)it.push({geo:new THREE.DodecahedronGeometry(1,0),m:M([p.x+(rnd()-.5)*36,y,p.z+(rnd()-.5)*36],[rnd(),rnd(),0],[1+rnd()*2,.8+rnd(),1+rnd()*2]),color:st});
     mark('castle',p.x,p.z,y,'Calder Keep','A broken tower on the headland. Ivy\'s family built it, or so she says.');}}
  // open sea: Hermit's Rock, a stump of rock with one tiny house
  {const x=1300,z=2700;it.push({geo:new THREE.DodecahedronGeometry(1,1),m:M([x,4,z],[.2,.5,0],[30,18,24]),color:rockC[1]});it.push({geo:new THREE.DodecahedronGeometry(1,0),m:M([x+22,1,z+10],[1,2,0],[10,8,9]),color:rockC[0]});
   it.push({geo:BOX(6,4,5),m:M([x,21,z],[0,.4,0]),color:0xf0e2c0});it.push({geo:new THREE.CylinderGeometry(3.7,3.7,5.8,3).rotateX(-Math.PI/2),m:M([x,24.3,z],[0,.4,0],[1,.6,1]),color:0xc2553f});
   it.push({geo:BOX(.5,8,.5),m:M([x+5,24,z+2]),color:0x6e5240});lit.push([x+1,21,z+2.6,0xffc25a]);
   mark('hermit',x,z,20,'Hermit\'s Rock','One rock, one house, one man who waves at every plane. Nobody knows his name.');}
  // the lightship anchored on the way to Farhold
  {const x=-4300,z=-2450;const it2=[{geo:BOX(6,3,22),m:M([0,.6,0]),color:0xc2453a},{geo:BOX(6.2,.6,22.2),m:M([0,-.7,0]),color:0x2c2833},{geo:BOX(4,3,6),m:M([0,3.5,-3]),color:0xf4efe4},
     {geo:new THREE.CylinderGeometry(.4,.4,12,5),m:M([0,8,4]),color:0xd8d2c8},{geo:new THREE.CylinderGeometry(1.4,1.4,1.8,8),m:M([0,14.5,4]),color:0x2c2833}];
   const sh=new THREE.Mesh(merge(it2),toon());sh.position.set(x,0,z);scene.add(sh);
   const lamp=new THREE.Mesh(new THREE.BoxGeometry(1.6,1.2,1.6),new THREE.MeshBasicMaterial({color:0xfff2b8,fog:false}));lamp.position.set(0,14.5,4);sh.add(lamp);
   anims.push(t=>{sh.position.y=Math.sin(t*.9)*.25;sh.rotation.z=Math.sin(t*.7)*.04;sh.rotation.y=.3+Math.sin(t*.05)*.2;lamp.visible=(t%2)<1.2;});
   sights.lightship={x,z,y:0,name:'The Lightship',desc:'An old red light vessel, anchored halfway to Farhold to show the way.'};}
  // a hot-air balloon drifting slowly round the home islands
  {const g=new THREE.Group(),cols=[0xd2493c,0xf0e2a8,0x3f8f8a,0xe8a33a],b=[];
   for(let k=0;k<8;k++)b.push({geo:new THREE.SphereGeometry(9,8,6,k/8*TAU,TAU/8,0,Math.PI*.78),m:M([0,0,0]),color:cols[k%4]});
   b.push({geo:BOX(3,2,3),m:M([0,-13,0]),color:0x8a6a4a});for(const [a,c] of [[-1,-1],[1,-1],[-1,1],[1,1]])b.push({geo:BOX(.12,6,.12),m:M([a*1.6,-9.5,c*1.6]),color:0x3a3440});
   g.add(new THREE.Mesh(merge(b),toon({},false)));scene.add(g);sights.balloon={x:0,z:0,y:0,name:'The Balloon',desc:'Somebody on Ferrow has a hot-air balloon. Nobody will say who.'};
   anims.push(t=>{const a=t*.004;g.position.set(-700+Math.cos(a)*2600,360+Math.sin(t*.07)*25,200+Math.sin(a)*1700);g.rotation.y=t*.03;sights.balloon.x=g.position.x;sights.balloon.z=g.position.z;sights.balloon.y=g.position.y-200;});}
  scene.add(shadowy(new THREE.Mesh(merge(it),toon())));for(const [x,y,z,c] of lit)addLight(x,y,z,c);
})();
/*@ISLEPROPS@*/
/* ---------------- trees ---------------- */
const trees=[];
(function plant(){
  const pine=[0x3f6b3a,0x4b7a3d,0x557f40,0x3a5f3c,0x2f5534], round=[0x6a9a42,0x7ba746,0x5f8f3e,0x4f7f38,0xb8a042,0xc98f3e];
  const vc=villageC;const ok=(x,z)=>!nearStrip(x,z,55)&&Math.hypot(x-vc.x,z-vc.z)>230&&!farmSpots.some(f=>Math.hypot(f.x-x,f.z-z)<f.r);
  let tries=0,hedge=0;
  while(hedge<2600&&tries<80000){tries++;const x=(rnd()-.5)*6400,z=(rnd()-.5)*4600,h=groundH(x,z);if(h<4)continue;const sl=slopeAt(x,z);if(!isFarm(x,z,h,sl))continue;
    const [u,v]=fieldUV(x,z),fu=u-Math.floor(u),fv=v-Math.floor(v);if(!(fu<.07||fv<.09))continue;if(!ok(x,z))continue;
    trees.push({x,z,h,pine:false,s:.55+rnd()*.35});hedge++;}
  tries=0;let n=0;
  while(n<11000&&tries<170000){tries++;
    const x=(rnd()-.5)*7400-250,z=(rnd()-.5)*4800,h=groundH(x,z);if(h<3||h>500)continue;const sl=slopeAt(x,z);if(sl>.6)continue;
    if(isFarm(x,z,h,sl))continue;
    const f=fbm(x*.0026,z*.0026,3,41);let dens=smooth(-.12,.25,f)*(h<30?.5:1);if(x>-400&&isleAt(x,z)==='tall')dens=Math.min(1,dens*1.3+.12);if(rnd()>dens*.95+.04)continue;
    if(!ok(x,z))continue;
    trees.push({x,z,h,pine:h>130?rnd()<.85:rnd()<.3,s:.7+rnd()*.65});n++;
  }
  const isleP=(k,n,fn)=>{const I=ISLES[k];let c=0,tr=0;while(c<n&&tr<n*40){tr++;const x=I.x+(rnd()-.5)*I.r*2,z=I.z+(rnd()-.5)*I.r*2,h=groundH(x,z);
    if(farmSpots.some(f=>Math.hypot(f.x-x,f.z-z)<f.r))continue;const o=fn(x,z,h);if(o){trees.push(o);c++;}}};
  isleP('farhold',1700,(x,z,h)=>{if(h<4||nearStrip(x,z,60)||slopeAt(x,z)>.55)return null;if(rnd()>smooth(-.15,.2,fbm(x*.003,z*.003,3,107))*.9+.03)return null;return {x,z,h,pine:rnd()<.8,s:.7+rnd()*.6};});
  isleP('kettle',420,(x,z,h)=>{if(h<7||h>175||nearStrip(x,z,50)||slopeAt(x,z)>.42)return null;return {x,z,h,pine:rnd()<.35,s:.45+rnd()*.5};});
  for(const [k,n,fn] of ARCH_TREES)isleP(k,n,fn);
  isleP('marram',520,(x,z,h)=>{if(h<1.8||nearStrip(x,z,28))return null;return {x,z,h,palm:true,pine:false,s:.75+rnd()*.5};});
  const crownP=new THREE.ConeGeometry(3.2,9,6).translate(0,6.5,0), crownR=new THREE.IcosahedronGeometry(3.8,0).translate(0,5.6,0), trunk=new THREE.CylinderGeometry(.45,.6,3,5).translate(0,1.5,0);
  const ps=trees.filter(t=>t.pine&&!t.palm), rs_=trees.filter(t=>!t.pine&&!t.palm), pl=trees.filter(t=>t.palm);
  const mat=bakeify(new THREE.MeshToonMaterial({gradientMap:gradTex,flatShading:true}));
  const mk=(geo,all,cols,isTrunk)=>{const idx=new Map(all.map((t,i)=>[t,i]));for(const list of byChunk(all)){const m=new THREE.InstancedMesh(geo.clone(),mat,list.length);const mm=new THREE.Matrix4(),c=new THREE.Color();
    list.forEach((t,j)=>{const i=idx.get(t);mm.compose(new V3(t.x,t.h-.5,t.z),new Q().setFromEuler(new THREE.Euler(0,hash2(i,7,3)*6,0)),new V3(t.s,t.s*(.9+hash2(i,2,2)*.3),t.s));
      c.setHex(isTrunk?0x6b4f3a:(t.col||cols[(hash2(i,9,1)*cols.length)|0]));m.setMatrixAt(j,mm);m.setColorAt(j,c);});m.castShadow=!isTrunk;m.receiveShadow=true;scene.add(addChunk(m,...boundsOf(list,25)));}};
  mk(crownP,ps,pine);mk(trunk,ps,null,true);mk(crownR,rs_,round);mk(trunk,rs_,null,true);
  {const it=[{geo:new THREE.CylinderGeometry(.26,.42,10,5).translate(0,5,0),m:M([0,0,0],[0,0,.13]),color:0x8a6a4a}];
    for(let k=0;k<7;k++)it.push({geo:BOX(1.2,.18,5.6).translate(0,0,2.5),m:M([-1.3,9.8,0],[.42+(k%2)*.18,k/7*TAU,0]),color:k%2?0x4f8a3a:0x5f9a40});
    it.push({geo:new THREE.IcosahedronGeometry(.7,0),m:M([-1.2,9.3,.3]),color:0x7a5a2a});
    const pg=merge(it),pmat=bakeify(new THREE.MeshToonMaterial({vertexColors:true,gradientMap:gradTex,flatShading:true})),mm=new THREE.Matrix4();
    const pidx=new Map(pl.map((t,i)=>[t,i]));for(const list of byChunk(pl)){const pm=new THREE.InstancedMesh(pg.clone(),pmat,list.length);
      list.forEach((t,j)=>{const i=pidx.get(t);mm.compose(new V3(t.x,t.h-.4,t.z),new Q().setFromEuler(new THREE.Euler(0,hash2(i,4,8)*6.3,0)),new V3(t.s,t.s*(.85+hash2(i,5,8)*.35),t.s));pm.setMatrixAt(j,mm);});
      pm.castShadow=true;pm.receiveShadow=true;scene.add(addChunk(pm,...boundsOf(list,25)));}}
  // bushes and rocks: small detail, no collision
  const bush=[],rock=[];let t2=0;
  while((bush.length<4500||rock.length<1400)&&t2<120000){t2++;const x=(rnd()-.5)*7400-250,z=(rnd()-.5)*4800,h=groundH(x,z);if(h<2.5||nearStrip(x,z,30))continue;const sl=slopeAt(x,z);
    if(sl>.38||h>380){if(rock.length<1400&&rnd()<.6)rock.push({x,z,h,s:1+rnd()*3.5});continue;}
    if(isFarm(x,z,h,sl))continue;if(Math.hypot(x-vc.x,z-vc.z)<200)continue;
    if(bush.length<4500&&rnd()<.55+smooth(-.2,.2,fbm(x*.0026,z*.0026,3,41))*.4)bush.push({x,z,h,s:.35+rnd()*.3});else if(rock.length<1400&&rnd()<.08)rock.push({x,z,h,s:.8+rnd()*1.6});}
  // chunked like the trees, so far-off ones aren't drawn
  const mm=new THREE.Matrix4(),c=new THREE.Color(),bGeo=new THREE.IcosahedronGeometry(3.4,0).translate(0,2.2,0),rGeo=new THREE.DodecahedronGeometry(1,0);
  const bc=[0x5f8f3e,0x6e9c45,0x7aa64c,0x8a9c48,0xa89a50];const rc=[0x9c8a80,0x8a7a74,0xa89a90,0x7e7068];
  const inst=(all,geo,set)=>{const idx=new Map(all.map((t,i)=>[t,i]));for(const list of byChunk(all)){const m=new THREE.InstancedMesh(geo,mat,list.length);list.forEach((t,j)=>{set(m,j,t,idx.get(t));});m.castShadow=m.receiveShadow=true;scene.add(addChunk(m,...boundsOf(list,12)));}};
  inst(bush,bGeo,(m,j,b,i)=>{mm.compose(new V3(b.x,b.h-.3,b.z),new Q().setFromEuler(new THREE.Euler(0,hash2(i,5,5)*6,0)),new V3(b.s*1.2,b.s*(.7+hash2(i,6,6)*.3),b.s*1.2));m.setMatrixAt(j,mm);c.setHex(bc[(hash2(i,8,2)*bc.length)|0]);m.setColorAt(j,c);});
  inst(rock,rGeo,(m,j,r,i)=>{mm.compose(new V3(r.x,r.h,r.z),new Q().setFromEuler(new THREE.Euler(hash2(i,1,7)*3,hash2(i,2,7)*6,0)),new V3(r.s*1.3,r.s*.8,r.s));m.setMatrixAt(j,mm);c.setHex(rc[(hash2(i,3,7)*rc.length)|0]);m.setColorAt(j,c);});
})();

/* ---------------- clouds ---------------- */
const cloudGroup=new THREE.Group();scene.add(cloudGroup);const CLOUDS=[],CLOUD_CELLS=[];
(function clouds(){const it=[];
  for(let c=0;c<210;c++){const cx=(rnd()-.5)*44000,cz=(rnd()-.5)*19000,cy=620+rnd()*380;const n=5+(rnd()*5|0);const cl=CLOUDS.length;CLOUDS.push({x:cx,y:cy+10,z:cz,r:190});
    for(let k=0;k<n;k++){const s=40+rnd()*60;const y=cy+(rnd()-.3)*20;
      it.push({geo:new THREE.IcosahedronGeometry(1,1),m:M([cx+(rnd()-.5)*220,y,cz+(rnd()-.5)*120],[0,rnd()*3,0],[s,s*.55,s*.9]),color:y>cy?0xfff8f0:0xeae2f2,cl});}}
  // low cumulus: flat bases, stacked tiers of puffs that tower in the middle, and small satellite puffs round the edges
  let low=0;for(let tries=0;low<390&&tries<6000;tries++){const cx=(rnd()-.5)*44000,cz=(rnd()-.5)*19000;
    if(STRIPS.some(s=>Math.hypot(s.x-cx,s.z-cz)<1100))continue;let gh=0;for(let k=0;k<5;k++)gh=Math.max(gh,groundH(cx+(k-2)*90,cz+((k*7)%5-2)*60));
    const base=Math.max(230+rnd()*170,gh+150),R=(70+rnd()*80)*1.25,ax=rnd()*TAU,ca=Math.cos(ax),sa=Math.sin(ax),el=.55+rnd()*.35;low++;const cl=CLOUDS.length;CLOUDS.push({x:cx,y:base+R*.55,z:cz,r:R*1.3});
    const P=(u,v,y,s,sy,col)=>it.push({geo:new THREE.IcosahedronGeometry(1,1),m:M([cx+u*ca-v*sa,y,cz+u*sa+v*ca],[rnd()*.4,rnd()*3,rnd()*.4],[s*(.9+rnd()*.25),s*sy,s*(.9+rnd()*.25)]),color:col,cl});
    const nb=7+(rnd()*5|0);for(let k=0;k<nb;k++){const a=k/nb*TAU+rnd()*.5,d=R*(.35+rnd()*.6);P(Math.cos(a)*d,Math.sin(a)*d*el,base+6,R*(.32+rnd()*.18),.38,0xdcd4e6);}
    const nm=5+(rnd()*4|0);for(let k=0;k<nm;k++){const a=rnd()*TAU,d=R*rnd()*.5;const s=R*(.38+rnd()*.2);P(Math.cos(a)*d,Math.sin(a)*d*el,base+s*.55+rnd()*10,s,.78,0xf2ecf4);}
    const nt=2+(rnd()*3|0),tall=rnd();for(let k=0;k<nt;k++){const a=rnd()*TAU,d=R*rnd()*.28;const s=R*(.26+rnd()*.14)*(1+tall*.3);P(Math.cos(a)*d,Math.sin(a)*d*el,base+R*(.55+tall*.35)+k*s*.35,s,.85,0xfffaf2);}
    const ns=3+(rnd()*4|0);for(let k=0;k<ns;k++){const a=rnd()*TAU,d=R*(1+rnd()*.35);P(Math.cos(a)*d,Math.sin(a)*d*el,base+8+rnd()*14,R*(.1+rnd()*.1),.7,0xf6f0f4);}}
  /* every cloud fades out as you fly into it: each vertex carries its cloud's centre and size (cc), the opaque pass
     draws clouds you're well clear of, and a see-through pass draws the ones you're entering at their faded opacity */
  /* clouds are built in 4 km cells (see cullClouds): each cell's geometry carries every vertex's cloud centre and size (cc) */
  const cellOf=q=>{const c=CLOUDS[q.cl];return Math.floor(c.x/4000)+','+Math.floor(c.z/4000);},cells=new Map();for(const q of it){const k=cellOf(q);if(!cells.has(k))cells.set(k,[]);cells.get(k).push(q);}
  const cellGeo=list=>{const geo=merge(list),cc=new Float32Array(geo.attributes.position.count*4);let o=0;
    list.forEach(q=>{const n=q.geo.index?q.geo.index.count:q.geo.attributes.position.count,c=CLOUDS[q.cl];for(let k=0;k<n;k++,o++){cc[o*4]=c.x;cc[o*4+1]=c.y;cc[o*4+2]=c.z;cc[o*4+3]=c.r;}});
    geo.setAttribute('cc',new THREE.BufferAttribute(cc,4));geo.computeBoundingSphere();return geo;};
  /* clouds look solid until you get close, then fade out smoothly as you fly into them. Clouds you're clear of draw in
     the opaque pass; the ones you're entering draw in a see-through pass at their faded opacity. That pass still writes
     depth, so each cloud's inner puffs stay hidden behind its outer ones (without it they drew in random order and
     the cloud popped) */
  /* pass 0: solid. pass 1: fading (writes depth, so it hides its own inner puffs, and stores its opacity in the alpha
     channel so the post pass fades the outline along with it). pass 2: nearly gone (no depth, so what's behind it gets
     its own outlines back) */
  const cmat=k=>{const m=toon(k?{transparent:true,depthWrite:k===1}:{},false);if(k===1)Object.assign(m,{blending:THREE.CustomBlending,blendSrc:THREE.SrcAlphaFactor,blendDst:THREE.OneMinusSrcAlphaFactor,blendSrcAlpha:THREE.OneFactor,blendDstAlpha:THREE.ZeroFactor});m.onBeforeCompile=sh=>{
    sh.vertexShader='attribute vec4 cc;varying float vFade;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvec3 ccw=(modelMatrix*vec4(cc.xyz,1.)).xyz;vFade=smoothstep(.8,2.4,distance(cameraPosition,ccw)/cc.w);');
    const keep=['if(vFade<.999)discard;','if(vFade>=.999||vFade<.3)discard;','if(vFade>=.3||vFade<.01)discard;'][k];
    sh.fragmentShader='varying float vFade;\n'+sh.fragmentShader.replace('void main() {','void main() {\n'+keep).replace('#include <dithering_fragment>','#include <dithering_fragment>\ngl_FragColor.a*='+(k?'vFade*vFade':'1.')+';');};
    m.customProgramCacheKey=()=>'cloudFade'+k;return m;};
  const M0=cmat(0),M1=cmat(1),M2=cmat(2);
  for(const list of cells.values()){const geo=cellGeo(list),bs=geo.boundingSphere,solid=new THREE.Mesh(geo,M0),fade=[1,2].map(k=>{const sm=new THREE.Mesh(geo,k===1?M1:M2);sm.renderOrder=4+k;sm.visible=false;return sm;});
    cloudGroup.add(solid,...fade);CLOUD_CELLS.push({x:bs.center.x,z:bs.center.z,r:bs.radius,solid,fade});}
})();
/* draw only the clouds that matter: a cell's solid pass when it's within sight, its two fade passes only when you're
   close enough to be flying into one of its clouds (the shader discards everything else anyway) */
function cullClouds(p){const gx=cloudGroup.position.x,gz=cloudGroup.position.z;for(const c of CLOUD_CELLS){const d=Math.hypot(c.x+gx-p.x,c.z+gz-p.z)-c.r;c.solid.visible=d<9000;const near=d<700;c.fade[0].visible=c.fade[1].visible=near;}}
/* how deep in a cloud the camera is (0 clear .. 1 in the middle): drives a soft white-out in the post pass */
function cloudMist(p){let m=0;const gx=cloudGroup.position.x,gz=cloudGroup.position.z;for(const c of CLOUDS){const dy=p.y-c.y;if(Math.abs(dy)>c.r)continue;
  const d=Math.hypot(p.x-c.x-gx,dy,p.z-c.z-gz)/c.r;if(d<1.7)m=Math.max(m,1-smooth(.6,1.7,d));}return m;}
/* the white-out is measured the same way as the cloud's fade (distance to its centre over its size) and overlaps it:
   as the cloud thins round you the mist thickens, so flying in reads as one thing, not a fade and then fog */

/* ---------------- life: boats, birds, smoke ---------------- */
(function boats(){
  const loops=[{x:harbor.x+harbor.dir.x*300,z:harbor.z+harbor.dir.z*300,r:180,s:.05},{x:2900,z:-200,r:300,s:-.03},{x:-1200,z:-1900,r:320,s:.035}];
  for(const L of loops){ if(groundH(L.x,L.z)>-3) continue;
    const it=[{geo:BOX(3,1.4,9),m:M([0,.4,0]),color:0xf4efe4},{geo:BOX(2.2,1.6,3),m:M([0,1.6,1]),color:0x3f6f8f},{geo:BOX(3.1,.4,9.1),m:M([0,-.1,0]),color:0xc2553f}];
    const b=new THREE.Mesh(merge(it),toon());scene.add(b);
    const wk=new THREE.Mesh(new THREE.PlaneGeometry(7,26).rotateX(-Math.PI/2).translate(0,.25,17),new THREE.MeshBasicMaterial({color:0xf6f1e4,transparent:true,opacity:.5,depthWrite:false}));b.add(wk);
    const ph=rnd()*TAU;anims.push(t=>{const a=ph+t*L.s;b.position.set(L.x+Math.cos(a)*L.r,0,L.z+Math.sin(a)*L.r);b.rotation.y=-a+(L.s>0?Math.PI:0);b.rotation.z=Math.sin(t*1.3+ph)*.04;});
  }
  // moored boats
  if(harbor.dir) for(const s of [-1,1]){const b=new THREE.Mesh(merge([{geo:BOX(2.6,1.2,7),m:M([0,.4,0]),color:s>0?0xf0e2a8:0xdfe3e6},{geo:BOX(2.7,.4,7.1),m:M([0,-.1,0]),color:0x5b8f7b}]),toon());
    b.position.set(harbor.x-harbor.dir.x*20+harbor.side.x*s*6,0,harbor.z-harbor.dir.z*20+harbor.side.z*s*6);b.rotation.y=Math.atan2(-harbor.dir.x,-harbor.dir.z);scene.add(b);
    anims.push(t=>{b.position.y=Math.sin(t*1.1+s)*.12;});}
})();
(function birds(){
  const mat=new THREE.MeshBasicMaterial({color:0x2c2833,side:THREE.DoubleSide});
  const flocks=[{x:sights.lighthouse.x+60,z:sights.lighthouse.z,y:sights.lighthouse.y+40,r:70},{x:sights.arch.x,z:sights.arch.z,y:60,r:90},{x:H.x+200,z:H.z+300,y:70,r:120}];
  for(const f of flocks){const sc=scareSpot(f.x,f.y,f.z);for(let k=0;k<7;k++){
    const g=new THREE.Group();const wl=new THREE.Mesh(new THREE.PlaneGeometry(2.2,.7).translate(-1.1,0,0),mat),wr=new THREE.Mesh(new THREE.PlaneGeometry(2.2,.7).translate(1.1,0,0),mat);
    wl.rotation.x=wr.rotation.x=-Math.PI/2;const wlP=new THREE.Group(),wrP=new THREE.Group();wlP.add(wl);wrP.add(wr);g.add(wlP,wrP);scene.add(g);
    const ph=k*.9,rr=f.r*(.7+hash2(k,1,4)*.6),sp=.25+hash2(k,3,4)*.1;
    const da=k/7*TAU;anims.push(t=>{const a=ph+t*sp,s=scareOf(sc,t);g.position.set(f.x+Math.cos(a)*rr+Math.cos(da)*s*70,f.y+Math.sin(t*.7+k)*6+s*45,f.z+Math.sin(a)*rr+Math.sin(da)*s*70);g.rotation.y=-a;
      const fl=Math.sin(t*(9+16*s)+k*2)*.5;wlP.rotation.z=fl;wrP.rotation.z=-fl;});
  }}
})();
(function smoke(){
  const spots=smokeSpots.slice(0,6);const N=spots.length*6; if(!N)return;
  const m=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),new THREE.MeshToonMaterial({color:0xe9e2ea,gradientMap:gradTex,flatShading:true}),N);scene.add(m);
  const mm=new THREE.Matrix4(),q=new Q();
  anims.push(t=>{for(let i=0;i<N;i++){const s=spots[i/6|0],ph=((t*.25+(i%6)/6)%1);
    const sc=.8+ph*2.6; mm.compose(new V3(s.x+ph*14*.94,s.y+ph*16,s.z-ph*14*.34),q,new V3(sc,sc,sc).multiplyScalar(ph>.85?(1-ph)/.15:1));m.setMatrixAt(i,mm);}m.instanceMatrix.needsUpdate=true;});
})();

/* ---------------- post-process ---------------- */
let LW=320,LH=180,PS=2,rt;
const postMat=new THREE.ShaderMaterial({
  uniforms:{tColor:{value:null},tDepth:{value:null},res:{value:new THREE.Vector2()},cNear:{value:.4},cFar:{value:14000},outline:{value:1},levels:{value:14},dither:{value:1},con:{value:1},sat:{value:1},vig:{value:.2},mist:{value:0},mistC:{value:new THREE.Color(0xf2eef4)},uSpot:{value:new THREE.Vector3()},uSpotR:{value:40},uSpotK:{value:new THREE.Vector3(1,1,1)},uSpotOn:{value:0},uInvProj:{value:new THREE.Matrix4()},uCamW:{value:new THREE.Matrix4()}},
  vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
  fragmentShader:`uniform sampler2D tColor,tDepth;uniform vec2 res;uniform float cNear,cFar,outline,levels,dither,con,sat,vig,mist,uSpotR,uSpotOn;uniform vec3 mistC,uSpot,uSpotK;uniform mat4 uInvProj,uCamW;varying vec2 vUv;
  float lin(float d){float z=d*2.-1.;return 2.*cNear*cFar/(cFar+cNear-z*(cFar-cNear));}
  float b2(vec2 a){a=floor(a);return fract(a.x*.5+a.y*a.y*.75);}
  float b4(vec2 a){return b2(.5*a)*.25+b2(a);}
  void main(){vec2 px=1./res;vec4 c4=texture2D(tColor,vUv);vec3 c=c4.rgb;
    // searchlight: a soft circle on the ground ahead, where everything is lit up to daytime brightness
    if(uSpotOn>.01){float sd=texture2D(tDepth,vUv).r;if(sd<1.){vec4 vp=uInvProj*vec4(vUv*2.-1.,sd*2.-1.,1.);vp/=vp.w;vec3 wp=(uCamW*vp).xyz;
      float r=length(wp.xz-uSpot.xz),k=(1.-smoothstep(uSpotR*.72,uSpotR,r))*(1.-smoothstep(60.,140.,abs(wp.y-uSpot.y)));c=mix(c,min(c*uSpotK,vec3(1.)),k*uSpotOn);}}
    if(outline>.5){float dc=lin(texture2D(tDepth,vUv).r);
      float dn=max(max(lin(texture2D(tDepth,vUv+vec2(px.x,0.)).r),lin(texture2D(tDepth,vUv-vec2(px.x,0.)).r)),max(lin(texture2D(tDepth,vUv+vec2(0.,px.y)).r),lin(texture2D(tDepth,vUv-vec2(0.,px.y)).r)));
      float e=step(dc*.07+1.2,dn-dc)*(1.-smoothstep(250.,2600.,dc));
      c=mix(c,c*vec3(.45,.38,.52),e*.85*c4.a);}
    c=mix(c,mistC,mist*(.5+.25*smoothstep(.2,.9,vUv.y))*smoothstep(1.5,4.,lin(texture2D(tDepth,vUv).r)));   // the cockpit stays clear in a cloud
    float l=dot(c,vec3(.299,.587,.114));c=mix(vec3(l),c,sat);c=(c-.5)*con+.5;
    vec2 vv=vUv-.5;c*=1.-vig*dot(vv,vv)*1.6;
    float b=dither>.5?b4(gl_FragCoord.xy)-.5:0.;
    c=floor(c*levels+.5+b*.95)/levels;
    gl_FragColor=vec4(c,1.);}`});
const postScene=new THREE.Scene(),postCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),postMat));
const PIXT={chunky:150,classic:200,fine:280}; let pixMode='classic';
function resize(){
  const dpr=window.devicePixelRatio||1,cw=Math.max(VW(),320),ch=Math.max(VH(),180),dw=cw*dpr,dh=ch*dpr;
  PS=Math.max(1,Math.round(Math.min(dw,dh)/PIXT[pixMode]));LW=Math.ceil(dw/PS);LH=Math.ceil(dh/PS);
  for(const c of [glCanvas,hudCanvas]){c.width=LW;c.height=LH;c.style.width=(LW*PS/dpr)+'px';c.style.height=(LH*PS/dpr)+'px';}
  renderer.setSize(LW,LH,false);
  if(rt){rt.dispose();rt.depthTexture.dispose();}
  rt=new THREE.WebGLRenderTarget(LW,LH,{minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter});
  rt.depthTexture=new THREE.DepthTexture(LW,LH);rt.depthTexture.type=THREE.UnsignedIntType;
  postMat.uniforms.tColor.value=rt.texture;postMat.uniforms.tDepth.value=rt.depthTexture;postMat.uniforms.res.value.set(LW,LH);
  camera.aspect=LW/LH;camera.updateProjectionMatrix();
  pb=new PixBuf(LW,LH); buildFrame();
}

/* ---------------- pixel HUD (cockpit) ---------------- */
const rgba=(h,a=255)=>(((a&255)<<24)|((h&255)<<16)|(((h>>8)&255)<<8)|((h>>16)&255))>>>0;
class PixBuf{constructor(w,h){this.w=w;this.h=h;this.img=hctx.createImageData(w,h);this.d=new Uint32Array(this.img.data.buffer);}
  clear(){this.d.fill(0);} px(x,y,c){x|=0;y|=0;if(x>=0&&y>=0&&x<this.w&&y<this.h)this.d[y*this.w+x]=c;}
  rect(x,y,w,h,c){for(let j=Math.max(0,y|0);j<Math.min(this.h,(y+h)|0);j++)this.d.fill(c,j*this.w+Math.max(0,x|0),j*this.w+Math.min(this.w,(x+w)|0));}
  disc(cx,cy,r,c){const r2=r*r;for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++)if(x*x+y*y<=r2+r*.8)this.px(cx+x,cy+y,c);}
  line(x0,y0,x1,y1,c){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;
    for(;;){this.px(x0,y0,c);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx;}if(e2<=dx){e+=dx;y0+=sy;}}}
  text(s,x,y,c,sc=1,center){s=String(s).toUpperCase();if(center)x-=Math.floor((s.length*4-1)*sc/2);
    for(const ch of s){const g=FONT[ch];if(g)for(let r=0;r<5;r++)for(let k=0;k<3;k++)if(g[r][k]==='1')this.rect(x+k*sc,y+r*sc,sc,sc,c);x+=4*sc;}}
  flush(){hctx.putImageData(this.img,0,0);}}
const FONT={'0':['111','101','101','101','111'],'1':['010','110','010','010','111'],'2':['111','001','111','100','111'],'3':['111','001','111','001','111'],'4':['101','101','111','001','001'],
'5':['111','100','111','001','111'],'6':['111','100','111','101','111'],'7':['111','001','001','010','010'],'8':['111','101','111','101','111'],'9':['111','101','111','001','111'],
N:['101','111','111','111','101'],E:['111','100','110','100','111'],S:['011','100','010','001','110'],W:['101','101','101','111','101'],K:['101','101','110','101','101'],T:['111','010','010','010','010'],
F:['111','100','110','100','100'],A:['010','101','111','101','101'],L:['100','100','100','100','111'],P:['110','101','110','100','100'],R:['110','101','110','101','101'],M:['101','111','111','101','101'],
U:['101','101','101','101','111'],I:['111','010','010','010','111'],G:['011','100','101','101','011'],H:['101','101','111','101','101'],O:['111','101','101','101','111'],C:['011','100','100','100','011'],
D:['110','101','101','101','110'],B:['110','101','110','101','110'],V:['101','101','101','101','010'],Y:['101','101','010','010','010'],'-':['000','000','111','000','000'],'+':['000','010','111','010','000'],' ':['000','000','000','000','000']};
let pb, frameLayer=null, gaugeLayout=[], panelLayout=[];
const C={bezel:rgba(0x1b1720),face:rgba(0x2b2734),tick:rgba(0xeae2cf),dim:rgba(0x8d8597),needle:rgba(0xfff6e2),orange:rgba(0xffb02e),
  white:rgba(0xf3f0e6),green:rgba(0x5fbf5a),yellow:rgba(0xf1c84a),red:rgba(0xe5483b),sky:rgba(0x6fb2e6),gnd:rgba(0xa8743f),panel:rgba(0x3b3442),panelHi:rgba(0x5a5262),panelLo:rgba(0x27222d),post:rgba(0x2a2531),cyan:rgba(0x6fe0e0),
  gPanel:rgba(0x3b3442,46),gHi:rgba(0xd8cfe0,150),gLo:rgba(0x1b1720,70),gPost:rgba(0x2a2531,40)};
/* the pixel layer no longer draws a panel of its own: the 3D cockpit (below) has the panel, and the needles are drawn
   into its dials. buildFrame just clears the layer; layoutGauges finds where each dial is on screen */
function buildFrame(){frameLayer=new Uint32Array(LW*LH);}
/* ---------------- the cockpit: a real 3D cabin round the view ----------------
   Built in the plane's frame with the eye at the origin (the group undoes the camera's 12° look-down): the panel with
   a six-pack of dials, clock, switches, fuel gauges, radio and throttle; the glare shield with its compass; windshield
   posts; the door sill on the left; and the right-hand seat where your co-pilot sits. Toon-shaded like the world, so
   it takes the sun and shade as you turn. */
const COCK_PZ=-.78,COCK_DIALS=[{x:-.22,y:-.4,r:.08},{x:0,y:-.4,r:.08},{x:.22,y:-.4,r:.08},{x:-.22,y:-.585,r:.075},{x:0,y:-.585,r:.075},{x:.22,y:-.585,r:.075}],COCK_TACH={x:-.45,y:-.41,r:.065};
const COCK=(()=>{const g=new THREE.Group();g.rotation.x=12*DEG;g.visible=false;const PZ=COCK_PZ,it=[],HP=Math.PI/2;
  const B=(w,h,d,p,c,r)=>it.push({geo:BOX(w,h,d),m:M(p,r),color:c}),CY=(rt,rb,h,p,c,r,n=14)=>it.push({geo:new THREE.CylinderGeometry(rt,rb,h,n),m:M(p,r),color:c});
  const pan=0x4e4654,panD=0x3c3542,panL=0x5e5664,blk=0x221d27,trim=0x9a92a0,chrome=0xc8c2cc,cream=0xeee2c4,red=0xd2493c,lea=0x8a5434,leaD=0x5e3622,leaL=0xa66a44;
  // the panel: a face in two tones with a bright top seam, rivets along the top and a darker kick panel below
  B(2.6,.36,.06,[0,-.48,PZ-.03],pan);B(2.6,.5,.06,[0,-.91,PZ-.03],panD);B(2.6,.018,.064,[0,-.302,PZ-.03],panL);B(2.6,.012,.064,[0,-.662,PZ-.03],blk);
  for(let k=-14;k<=14;k++)B(.012,.012,.008,[k*.085,-.322,PZ+.002],trim);
  // a raised plate behind the six-pack, with a screw in each corner
  B(.7,.42,.012,[0,-.495,PZ+.004],panL);B(.68,.4,.014,[0,-.495,PZ+.006],0x463e4c);for(const sx of [-1,1])for(const sy of [-1,1])B(.014,.014,.01,[sx*.32,-.495+sy*.18,PZ+.014],chrome);
  // dial sockets: chrome ring, black well, four screws
  for(const d of [...COCK_DIALS,COCK_TACH]){CY(d.r*1.2,d.r*1.24,.03,[d.x,d.y,PZ+.02],chrome,[HP,0,0],18);CY(d.r*1.06,d.r*1.06,.034,[d.x,d.y,PZ+.022],blk,[HP,0,0],18);
    for(const a of [.785,2.356,3.927,5.498])B(.01,.01,.01,[d.x+Math.cos(a)*d.r*1.42,d.y+Math.sin(a)*d.r*1.42,PZ+.008],trim);}
  // a little cream placard under each dial row, and one under the six-pack
  for(const d of COCK_DIALS)B(.07,.014,.004,[d.x,d.y-d.r-.026,PZ+.012],cream);
  // the clock, top left: cream face, two hands
  {const x=.43,y=-.41;CY(.056,.058,.03,[x,y,PZ+.02],chrome,[HP,0,0],16);CY(.048,.048,.034,[x,y,PZ+.022],cream,[HP,0,0],16);B(.006,.034,.004,[x,y+.014,PZ+.04],blk);B(.026,.006,.004,[x+.011,y,PZ+.04],blk);B(.008,.008,.006,[x,y,PZ+.042],red);}
  // switches: four toggles with labels, a red master switch and the key
  for(let k=0;k<4;k++){const x=-.55+k*.065,y=-.565;B(.034,.03,.012,[x,y,PZ+.006],chrome);B(.012,.012,.05,[x,y+.008,PZ+.03],blk,[-.5,0,0]);B(.04,.012,.004,[x,y-.03,PZ+.004],cream);}
  B(.05,.05,.02,[-.32,-.565,PZ+.01],red);B(.03,.018,.03,[-.32,-.555,PZ+.03],0xf0e4d0);
  CY(.028,.03,.02,[-.45,-.665,PZ+.01],chrome,[HP,0,0],12);B(.008,.03,.03,[-.45,-.665,PZ+.03],0xd8a43a);
  // two little fuel gauges and the radio, right
  for(const x of [.4,.49]){CY(.038,.04,.02,[x,-.565,PZ+.012],chrome,[HP,0,0],14);CY(.032,.032,.024,[x,-.565,PZ+.014],cream,[HP,0,0],14);B(.004,.026,.004,[x+.006,-.56,PZ+.028],red,[0,0,-.6]);}
  B(.27,.085,.05,[.46,-.68,PZ+.022],blk);B(.25,.07,.004,[.46,-.68,PZ+.048],0x2e2834);B(.1,.026,.004,[.43,-.68,PZ+.051],0x6fe08a);for(const x of [.53,.57])CY(.014,.016,.03,[x,-.68,PZ+.06],trim,[HP,0,0],8);
  // glare shield: a padded black lip over the panel, the compass on top
  B(2.6,.035,.17,[0,-.27,PZ+.055],blk);CY(.032,.032,2.6,[0,-.29,PZ+.14],0x2a2430,[0,0,HP],8);
  B(.1,.072,.085,[0,-.215,PZ+.08],blk);B(.074,.042,.004,[0,-.212,PZ+.124],cream);B(.004,.044,.006,[0,-.212,PZ+.127],red);for(let k=-2;k<=2;k++)if(k)B(.003,.012,.006,[k*.014,-.204,PZ+.127],blk);B(.02,.04,.02,[0,-.27,PZ+.08],blk);
  // windshield posts, leaning in toward the wing, and the brace at the top
  const post=(ax,ay,bx,by,z,th)=>{const dx=bx-ax,dy=by-ay,L=Math.hypot(dx,dy);B(th,L,th,[(ax+bx)/2,(ay+by)/2,z],0x2e2834,[0,0,Math.atan2(-dx,dy)]);B(th*.4,L,th*1.02,[(ax+bx)/2+th*.3,(ay+by)/2,z],0x4a4252,[0,0,Math.atan2(-dx,dy)]);};
  post(-.8,-.26,-.6,.7,PZ+.06,.034);post(.8,-.26,.6,.7,PZ+.06,.034);
  // the door on the left: upholstered panel, a padded armrest and the door lever up front
  B(.05,.8,1.1,[-.68,-.68,-.3],panD);B(.07,.03,1.1,[-.66,-.29,-.3],0x2e2834);B(.012,.3,.78,[-.652,-.5,-.34],leaD);for(const k of [-1,0,1])B(.014,.3,.006,[-.65,-.5,-.34+k*.24],0x4a2a1a);
  B(.08,.06,.46,[-.62,-.4,-.4],lea);CY(.03,.03,.46,[-.62,-.37,-.4],leaL,[HP,0,0],8);
  CY(.02,.02,.02,[-.655,-.33,-.66],chrome,[0,0,HP],8);B(.014,.014,.11,[-.64,-.33,-.61],chrome);B(.02,.02,.03,[-.64,-.33,-.555],blk);
  // the right seat: just its bottom, running off the bottom-right corner, with your co-pilot sitting on it
  {const x=.74,z=-.34;B(.52,.1,.58,[x,-.57,z],lea);CY(.05,.05,.52,[x,-.57,z-.29],leaL,[0,0,HP],10);B(.52,.01,.01,[x,-.519,z-.25],leaD);B(.54,.06,.6,[x,-.65,z],0x2e2834);}
  const m=new THREE.Mesh(merge(it),litify(toon({},false)));g.add(m);
  const hi=new THREE.Group(),bi=new THREE.Group(),wingMat=litify(toon({vertexColors:false,color:0xf3e7cf},false));
  hi.add(new THREE.Mesh(merge([{geo:BOX(2.6,.05,.08),m:M([0,.245,PZ+.06]),color:0x2e2834},{geo:BOX(2.6,.012,.08),m:M([0,.222,PZ+.06]),color:0x4a4252}]),litify(toon({},false))));
  {const w=new THREE.Mesh(BOX(2.6,.14,.5),wingMat);w.position.set(0,.34,PZ+.2);hi.add(w);}
  for(const sx of [-1,1]){const st=new THREE.Mesh(merge([{geo:BOX(.03,1.2,.03),m:M([sx*.62,.45,PZ+.02],[0,0,-sx*.45]),color:0x2c2833}]),litify(toon({},false)));bi.add(st);}
  g.add(hi,bi);g.userData.hi=hi;g.userData.bi=bi;g.userData.wingMat=wingMat;
  // the throttle: a black knob on a chrome shaft, in and out with the power
  const th=new THREE.Group();th.add(new THREE.Mesh(merge([{geo:new THREE.CylinderGeometry(.008,.008,.16,6),m:M([0,0,.08],[HP,0,0]),color:chrome},{geo:new THREE.SphereGeometry(.028,10,8),m:M([0,0,.16]),color:blk}]),litify(toon({},false))));
  th.position.set(.3,-.66,PZ);g.add(th);g.userData.throttle=th;
  if(!camera.parent)scene.add(camera);camera.add(g);return g;})();
/* where each dial sits on screen this frame (it moves with the field of view), for the pixel needles */
const _gv=new V3(),_ge=new THREE.Euler(12*DEG,0,0);
function cockXY(x,y,z){_gv.set(x,y,z).applyEuler(_ge).applyMatrix4(camera.projectionMatrix);return [(_gv.x+1)/2*LW,(1-_gv.y)/2*LH];}
function layoutGauges(){const z=COCK_PZ+.04,one=d=>{const [x,y]=cockXY(d.x,d.y,z),[x2]=cockXY(d.x+d.r,d.y,z);return {x:Math.round(x),y:Math.round(y),r:Math.max(5,Math.round(x2-x)-2)};};
  gaugeLayout=COCK_DIALS.map(one);tachCock=one(COCK_TACH);glideCock=null;}
function gaugeBase(g){pb.disc(g.x,g.y,g.r+2,C.bezel);pb.disc(g.x,g.y,g.r,C.face);}
const pt=(g,a,rr)=>[g.x+Math.sin(a)*rr,g.y-Math.cos(a)*rr];
function ticks(g,a0,a1,n,major,c){for(let i=0;i<=n;i++){const a=lerp(a0,a1,i/n),L=i%major===0?4:2;const [x0,y0]=pt(g,a,g.r-1),[x1,y1]=pt(g,a,g.r-L);pb.line(x0,y0,x1,y1,c);}}
function needle(g,a,len,c){const [x,y]=pt(g,a,len);pb.line(g.x,g.y,x,y,c);const [x2,y2]=pt(g,a+.06,len*.7);pb.line(g.x,g.y,x2,y2,c);pb.disc(g.x,g.y,1,c);}
function band(g,a0,a1,c){for(let a=a0;a<=a1;a+=.02){const [x,y]=pt(g,a,g.r-2);pb.px(x,y,c);const [x2,y2]=pt(g,a,g.r-3);pb.px(x2,y2,c);}}
function drawCockpit(st){
  layoutGauges();pb.d.set(frameLayer);
  const [g1,g2,g3,g4,g5,g6]=gaugeLayout;
  // airspeed
  gaugeBase(g1);const asA=k=>(-150+clamp(k,0,160)/160*300)*DEG;band(g1,asA(33),asA(85),C.white);band(g1,asA(40),asA(110),C.green);band(g1,asA(110),asA(135),C.yellow);
  ticks(g1,asA(0),asA(160),16,2,C.tick);needle(g1,asA(st.kt),g1.r-3,C.needle);if(g1.r>16)pb.text(Math.round(st.kt),g1.x,g1.y+Math.round(g1.r*.35),C.tick,1,true);
  // attitude
  {const g=g2,b=st.bank,p=st.pitch,k=g.r/28;const sb=Math.sin(b),cb=Math.cos(b);
    for(let y=-g.r;y<=g.r;y++)for(let x=-g.r;x<=g.r;x++){if(x*x+y*y>g.r*g.r)continue;const pr=-x*sb-y*cb, al=x*cb-y*sb, off=-p/DEG*k;
      let c=pr>off?C.sky:C.gnd; if(Math.abs(pr-off)<.6)c=C.white;
      for(const L of [10,20]){if(Math.abs(pr-(off+L*k))<.5&&Math.abs(al)<g.r*(L===10?.35:.22))c=C.white;if(Math.abs(pr-(off-L*k))<.5&&Math.abs(al)<g.r*(L===10?.35:.22))c=C.white;}
      pb.px(g.x+x,g.y+y,c);}
    pb.rect(g.x-Math.round(g.r*.55),g.y,Math.round(g.r*.35),2,C.orange);pb.rect(g.x+Math.round(g.r*.2),g.y,Math.round(g.r*.35),2,C.orange);pb.rect(g.x-1,g.y-1,2,2,C.orange);
    pb.rect(g.x-1,g.y-g.r-2,2,3,C.orange);}
  // altimeter
  gaugeBase(g3);ticks(g3,0,TAU-TAU/50,49,5,C.tick);if(g3.r>18)for(let i=0;i<10;i++){const [x,y]=pt(g3,i*TAU/10,g3.r-8);pb.text(i,x-1,y-2,C.dim);}
  if(g3.r>22)pb.text(Math.max(0,Math.round(st.ft)),g3.x,g3.y+Math.round(g3.r*.38),C.tick,1,true);needle(g3,st.ft/10000*TAU,g3.r*.5,C.dim);needle(g3,(st.ft%1000)/1000*TAU,g3.r-3,C.needle);
  // turn coordinator
  if(g4){gaugeBase(g4);}if(g4){const a=clamp(st.turn/3*20,-40,40)*DEG,g=g4,L=g.r*.7;const [x0,y0]=[g.x-Math.cos(a)*L,g.y-Math.sin(a)*L],[x1,y1]=[g.x+Math.cos(a)*L,g.y+Math.sin(a)*L];
    pb.line(x0,y0,x1,y1,C.white);pb.line(x0,y0+1,x1,y1+1,C.white);pb.rect(g.x-1,g.y-4,2,4,C.white);
    const ty=g.y+Math.round(g.r*.55);pb.rect(g.x-Math.round(g.r*.5),ty-2,Math.round(g.r),5,C.bezel);pb.disc(g.x+Math.round(clamp(st.slip,-1,1)*g.r*.4),ty,2,C.white);
    for(const s of [-1,1])pb.line(g.x+s*Math.cos(20*DEG)*(g.r-2),g.y+Math.sin(20*DEG)*(g.r-2),g.x+s*Math.cos(20*DEG)*(g.r-6),g.y+Math.sin(20*DEG)*(g.r-6),C.tick);}
  // heading
  gaugeBase(g5);for(let d=0;d<360;d+=10){const a=(d-st.hdg)*DEG,L=d%30===0?4:2;const [x0,y0]=pt(g5,a,g5.r-1),[x1,y1]=pt(g5,a,g5.r-L);pb.line(x0,y0,x1,y1,C.tick);
    if(d%90===0&&g5.r>14){const [x,y]=pt(g5,a,g5.r-9);pb.text('NESW'[d/90],x-1,y-2,d===0?C.orange:C.tick);}}
  {const a=(st.brg-st.hdg)*DEG;const [x,y]=pt(g5,a,g5.r-1);pb.rect(x-1,y-1,3,3,C.cyan);}
  pb.line(g5.x,g5.y-g5.r+2,g5.x,g5.y-g5.r+7,C.orange);pb.rect(g5.x-3,g5.y,7,1,C.white);pb.rect(g5.x,g5.y-3,1,7,C.white);
  // vsi
  gaugeBase(g6);const vA=f=>(-90+clamp(f,-2000,2000)/2000*170)*DEG;ticks(g6,vA(-2000),vA(2000),8,2,C.tick);needle(g6,vA(st.fpm),g6.r-3,C.needle);
  if(g6.r>16){const[x,y]=pt(g6,vA(0),g6.r-8);pb.text('0',x-1,y-2,C.dim);}
  if(st.extra)st.extra();
  pb.flush();
}

/* ---------------- night lights (constant pixel size points) ---------------- */
const lightPts=(function(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(LIGHTP,3));g.setAttribute('color',new THREE.Float32BufferAttribute(LIGHTC,3));
  const m=new THREE.Points(g,new THREE.PointsMaterial({size:2,sizeAttenuation:false,vertexColors:true,fog:false}));m.frustumCulled=false;scene.add(m);return m;})();
