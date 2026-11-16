'use strict';
/* =================== GAME v2 =================== */
const $=id=>document.getElementById(id);
let tod='golden';
function setTOD(k){tod=k;const T=TOD[k];
  const az=T.sunAz*DEG,el=T.sunEl*DEG;sunDir.set(Math.sin(az)*Math.cos(el),Math.sin(el),-Math.cos(az)*Math.cos(el));
  sunL.color.setHex(T.sun);sunL.intensity=T.sunI;
  hemi.color.setHex(T.sky);hemi.groundColor.setHex(T.gnd);hemi.intensity=T.hemiI;
  scene.fog.color.setHex(T.hor);scene.fog.near=T.fogN;scene.fog.far=T.fogF;
  const u=skyMat.uniforms;u.cZen.value.setHex(T.zen);u.cHigh.value.setHex(T.high);u.cHor.value.setHex(T.hor);u.cHaze.value.setHex(T.haze);u.cSun.value.setHex(T.sunc);u.uStars.value=T.stars;u.uDisc.value=T.disc;
  const w=waterMat.uniforms;w.fogColor.value.setHex(T.hor);w.fogNear.value=T.fogN;w.fogFar.value=T.fogF;w.cDeep.value.setHex(T.deep);w.cMid.value.setHex(T.mid);w.cShal.value.setHex(T.shal);w.cGlint.value.setHex(T.glint);
  const pu=postMat.uniforms;pu.con.value=T.con;pu.sat.value=T.sat;pu.vig.value=T.vig;
  lightPts.visible=T.lights>0;lightPts.material.color.setScalar(T.lights);navPts.visible=T.lights>0;
  bakeTerrainShadow(sunDir,{noon:0,golden:0,sunset:0,dusk:.6,night:.3}[k]||0);}

/* ---------- save data ---------- */
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};
const settings=Object.assign({steady:true,stallGuard:true,autoTrim:true,tips:true,invert:false,sound:true,engVol:1,shadows:true,tilt:false,pixels:'classic',light:'golden'},store.get('tac-settings',{}));
if(!TOD[settings.light])settings.light='golden';
const log=Object.assign({fields:{},sights:{},goals:{},trips:0,flights:0,tips:{},howto:false,stamps:0,met:{},mail:{day:1,bag:[],active:false}},store.get('tac-log',{}));
if(!log.mail)log.mail={day:1,bag:[],active:false};if(!log.met)log.met={};if(log.stamps==null)log.stamps=0;
const saveS=()=>store.set('tac-settings',settings), saveL=()=>store.set('tac-log',log);
const GOALS=[
  {id:'firstflight',name:'First flight',hint:'Take off from any field.'},
  {id:'land_harbor',name:'Land at Harbor Field',hint:'Come to a full stop on the paved runway.'},
  {id:'land_light',name:'Land at Lighthouse Point',hint:'The grass strip on the western headland.'},
  {id:'land_ridge',name:'Land at Ridge Strip',hint:'The short dirt strip up on the mountain.'},
  {id:'trip',name:'Make a trip',hint:'Take off from one field and land at another.'},
  {id:'butter',name:'Butter landing',hint:'Touch down on a runway at under 90 ft/min.'},
  {id:'checklist',name:'By the book',hint:'Land with the whole before-landing checklist done.'},
  {id:'ridge3',name:'Three stars on the ridge',hint:'A three-star landing at Ridge Strip.'},
  {id:'summit',name:'Over the top',hint:'Fly over the summit of the mountain.'},
  {id:'night',name:'Night mail',hint:'Land on a runway at night.'},
  {id:'instrument',name:'By the gauges',hint:'Land on a runway in Gauges view.'},
  {id:'week',name:'A full week',hint:'Finish all six days of mail.'},
];
const DESC={harbor:'Long paved runway by the village. The friendly one.',light:'Grass strip on the cliffs of the western headland.',ridge:'Short dirt strip on a mountain saddle. Slow down early.'};

/* ---------- characters & portraits ---------- */
const CHARS={
  mabel:{name:'Mabel Ostrander',role:'POSTMASTER · HARBOR FIELD',home:'harbor',sp:{bg:'#f2c6a0',skin:'#e8b896',hair:'#cfc8c0',style:'bun',glasses:true,shirt:'#3f8f8a'}},
  bea:{name:'Bea Hollis',role:'RETIRED MAIL PILOT · HARBOR FIELD',home:'harbor',sp:{bg:'#9cc3e6',skin:'#d9a07a',hair:'#f1ece4',style:'short',hat:'aviator',hatc:'#7a4a2a',shirt:'#e9dcc4',scarf:'#c2453a'}},
  gus:{name:'Gus Amari',role:'MECHANIC · HARBOR FIELD',home:'harbor',sp:{bg:'#e9d27a',skin:'#8d5a3b',hair:'#221c1c',style:'short',beard:'#221c1c',hat:'cap',hatc:'#e2703f',shirt:'#3a5a8c'}},
  tomas:{name:'Tomas Reyes',role:'LIGHTHOUSE KEEPER · LIGHTHOUSE POINT',home:'light',sp:{bg:'#c8d8e8',skin:'#c98c5e',hair:'#3a3434',style:'short',mustache:'#4a4040',hat:'beanie',hatc:'#2c3a5a',shirt:'#2c3a5a'}},
  nell:{name:'Nell Talley',role:'SHEPHERD · LIGHTHOUSE POINT',home:'light',sp:{bg:'#cfe3b0',skin:'#f0c7a4',hair:'#c0582e',style:'long',shirt:'#5b7f3a',freckles:true}},
  ada:{name:'Ada Pennick',role:'FOREST RANGER · RIDGE STRIP',home:'ridge',sp:{bg:'#b8d4a8',skin:'#6e4a33',hair:'#1c1616',style:'curly',hat:'ranger',hatc:'#a89060',shirt:'#6b7a3a'}},
  hank:{name:'Hank Oduya',role:'LOGGING CREW · RIDGE STRIP',home:'ridge',sp:{bg:'#e8c0a8',skin:'#e2a982',hair:'#6a4a30',style:'short',beard:'#6a4a30',hat:'beanie',hatc:'#c2453a',shirt:'#b8443a',plaid:true}},
};
function shade(hex,a){const n=parseInt(hex.slice(1),16);let r=n>>16,g=(n>>8)&255,b=n&255;const f=v=>clamp(Math.round(a<0?v*(1+a):v+(255-v)*a),0,255);return '#'+[f(r),f(g),f(b)].map(v=>v.toString(16).padStart(2,'0')).join('');}
const PORT={};
function portrait(id){if(PORT[id])return PORT[id];const sp=CHARS[id].sp;const c=document.createElement('canvas');c.width=c.height=32;const x=c.getContext('2d');
  const P=(col,px,py,w=1,h=1)=>{x.fillStyle=col;x.fillRect(px,py,w,h);};
  const ell=(cx,cy,rx,ry,col)=>{for(let j=-ry;j<=ry;j++)for(let i=-rx;i<=rx;i++)if((i*i)/(rx*rx)+(j*j)/(ry*ry)<=1.05)P(col,cx+i,cy+j);};
  P(sp.bg,0,0,32,32);P(shade(sp.bg,-.08),0,24,32,8);
  ell(16,33,13,9,sp.shirt);P(shade(sp.shirt,-.18),3,31,26,1);
  if(sp.plaid)for(let i=5;i<28;i+=4){P(shade(sp.shirt,-.3),i,25,1,7);P(shade(sp.shirt,-.3),4,28,24,1);}
  P(shade(sp.skin,-.15),14,21,5,4);
  if(sp.style==='long'){ell(16,10,9,7,sp.hair);P(sp.hair,7,10,3,13);P(sp.hair,22,10,3,13);P(shade(sp.hair,-.15),7,22,3,1);P(shade(sp.hair,-.15),22,22,3,1);}
  if(sp.style==='bun')ell(16,5,3,3,sp.hair);
  ell(16,14,7,8,sp.skin);P(sp.skin,8,13,1,3);P(sp.skin,24,13,1,3);P(shade(sp.skin,-.12),9,18,14,1);
  if(sp.style==='short'||sp.style==='long'||sp.style==='bun'){for(let i=-7;i<=7;i++){const hh=5-Math.round(Math.abs(i)/2.4);P(sp.hair,16+i,6,1,hh);}P(sp.hair,8,9,1,4);P(sp.hair,24,9,1,4);}
  if(sp.style==='curly'){for(let k=0;k<11;k++){const a=Math.PI*(k/10);ell(16+Math.round(Math.cos(a)*7),9-Math.round(Math.sin(a)*3),2,2,sp.hair);}}
  P('#2a2230',12,14,2,2);P('#2a2230',18,14,2,2);P('#ffffff',12,14,1,1);P('#ffffff',18,14,1,1);
  P(shade(sp.hair,-.15),11,12,3,1);P(shade(sp.hair,-.15),18,12,3,1);
  P('rgba(230,100,90,.35)',10,17,2,1);P('rgba(230,100,90,.35)',20,17,2,1);
  P(shade(sp.skin,-.18),15,16,2,2);
  if(sp.freckles){for(const [a,b] of [[10,16],[12,17],[19,16],[21,17],[11,18],[20,18]])P(shade(sp.skin,-.25),a,b);}
  if(sp.beard){for(let j=17;j<=23;j++){const w=8-Math.max(0,j-20)*2;P(sp.beard,16-w,j,w*2,1);}}
  P('#7a3a3a',14,19,4,1);
  if(sp.mustache)P(sp.mustache,13,18,6,1);
  if(sp.glasses){const g='#2a2230';for(const ox of [11,17]){P(g,ox,13,4,1);P(g,ox,16,4,1);P(g,ox,13,1,4);P(g,ox+3,13,1,4);}P(g,15,14,2,1);}
  if(sp.hat==='cap'){ell(16,7,8,4,sp.hatc);P(sp.hatc,8,8,17,2);P(shade(sp.hatc,-.2),18,9,9,2);}
  if(sp.hat==='beanie'){ell(16,8,8,5,sp.hatc);P(shade(sp.hatc,-.2),8,10,17,2);P(shade(sp.hatc,.3),15,2,3,2);}
  if(sp.hat==='ranger'){P(sp.hatc,3,9,26,2);P(sp.hatc,9,3,14,7);P(shade(sp.hatc,-.25),9,8,14,1);}
  if(sp.hat==='aviator'){ell(16,9,8,6,sp.hatc);P(sp.hatc,8,11,2,7);P(sp.hatc,22,11,2,7);P('#9ad0e0',10,7,5,2);P('#9ad0e0',17,7,5,2);P('#4a3020',15,7,2,1);}
  if(sp.scarf){P(sp.scarf,9,22,14,3);P(shade(sp.scarf,-.2),20,24,3,5);}
  PORT[id]=c.toDataURL();return PORT[id];}

/* ---------- the mail ---------- */
const DAYS=[
  {intro:"Morning, new pilot. Bea says you can land without bending anything. Let's find out. Two stops today.",
   items:[{to:'tomas',item:'Seed catalog',line:"The seed catalog! The gulls ate my lettuce again, so this year I'm growing something they hate."},
          {to:'ada',item:'Owl survey forms',line:"Survey forms, perfect. If you spot anything big and feathery up here, wag your wings at me."}],
   out:{tomas:[{to:'mabel',item:'Letter for the mainland',line:"Mainland post. It goes out on Thursday's boat. Thank you, dear."}]},
   outro:"Not one bent propeller. Bea owes me a coffee."},
  {intro:"Wool clippers and a thermos. The ridge crew has been asking about that thermos all week.",
   items:[{to:'nell',item:'Shearing blades',line:"New blades! The sheep won't thank you, but I will."},
          {to:'hank',item:'Big steel thermos',line:"Finally. The crew's been fighting over the last one since spring."}],
   out:{hank:[{to:'gus',item:'Broken saw part',line:"Ha, they snapped it again. I'll have it fixed by the end of the week."}]},
   outro:"Gus says you're the first pilot who brings him work instead of making it."},
  {intro:"A letter with a university stamp. I think Tomas has been waiting for this one.",
   items:[{to:'tomas',item:'Letter from Lucía',line:"From Lucía! She says the city is loud. Good. It makes her miss the waves."},
          {to:'ada',item:'Telescope lens',line:"Careful, careful... With this I can count owls from across the valley."}],
   out:{ada:[{to:'bea',item:'Owl sketch for Bea',line:"Ada drew me an owl. She's been asking about spotting from the air. Keep your eyes open up there."}]},
   outro:"Three days in a row. I've started a chart on the wall."},
  {intro:"Wool for Nell and Hank's saw part, good as new. Gus fixed it overnight.",
   items:[{to:'nell',item:'Knitting wool, six colors',line:"Six colors! The sheep will be so jealous of what I make from someone else's wool."},
          {to:'hank',item:'Repaired saw part',line:"Gus fixed it? Tell him the next round at the pub is on me."}],
   out:{nell:[{to:'mabel',item:'Parcel for Mabel',line:"A scarf. In teal. That woman knows me too well."}]},
   outro:"Don't tell anyone, but I'm wearing it."},
  {intro:"One official envelope today. I don't like the look of it.",
   items:[{to:'tomas',item:'Letter from the lighthouse board',line:"Automation. They're replacing me with a clock and a bulb. Well. The clock won't make tea for passing pilots."},
          {to:'ada',item:'Postcard from the bird society',line:"They want my count by spring. Two owls so far. They're shy, like me."}],
   out:{tomas:[{to:'mabel',item:'Letter to Lucía',line:"Going to the city. He pressed hard with the pen on this one."}]},
   outro:"Go easy on yourself tonight. It's been a week."},
  {intro:"Last bag of the week. Bea asked to ride along in spirit, whatever that means.",
   items:[{to:'tomas',item:'Train ticket from Lucía',line:"A ticket to visit her. I suppose the gulls can mind the light for a week."},
          {to:'ada',item:'Brass owl whistle',line:"From the society! They say three owls is a record. I counted three yesterday."},
          {to:'nell',item:'Tide table',line:"Tides! The sheep keep wandering onto the beach. Now at least I'll know when to panic."}],
   out:{},
   outro:"That's the week. Bea says there are islands past the horizon that haven't seen a mail plane in years. Get some sleep."},
];
const MEET={
  mabel:"I'm Mabel. I run the post office, which means I run this island. Your mail goes out from here every morning.",
  bea:"So you're the one flying my old girl. Read my logbook before you do anything clever. It's under the seat.",
  gus:"Gus. I fix what pilots break. Try not to keep me too busy.",
  tomas:"Tomas Reyes, keeper of the light. You'll always get tea here, pilot.",
  nell:"Nell. Mind the sheep on the strip, they think it's theirs.",
  ada:"Ada Pennick, ranger. I'm counting owls on this mountain. Very slowly.",
  hank:"Hank. Ridge crew. Anything that comes up this mountain by plane, we're grateful for.",
};
const mail=log.mail;
const bagFor=stripId=>mail.bag.filter(it=>CHARS[it.to].home===stripId);
function mailDest(){if(!mail.active)return null;const it=mail.bag[0];if(it)return stripById(CHARS[it.to].home);return STRIPS[0];}
function refreshBag(){const b=$('bag');if(!mail.active){b.hidden=true;return;}
  const n=mail.bag.length,nx=mailDest();b.hidden=false;b.textContent=n?`✉ ${n} · NEXT ${nx.name.toUpperCase()} ›`:'✉ BAG EMPTY · HOME ›';}
function mailRoute(){const stops=[];for(const it of mail.bag){const h=CHARS[it.to].home;let st=stops.find(x=>x.id===h);if(!st){st={id:h,items:[]};stops.push(st);}st.items.push(it);}return stops;}
function mailCard(){const wasFly=mode==='fly';if(wasFly)mode='paused';
  const stops=mailRoute(),day=DAYS[mail.day-1];let html='';
  stops.forEach((st,i)=>{const S=stripById(st.id),km=(Math.hypot(S.x-ac.pos.x,S.z-ac.pos.z)/1000).toFixed(1);
    html+=`<h3>${i===0?'NEXT · ':'STOP '+(i+1)+' · '}${S.name.toUpperCase()} · ${km} KM</h3><div class="list">`+st.items.map(it=>`<div class="item ${i===0?'':''}"><span style="display:flex;gap:10px;align-items:center"><img src="${portrait(it.to)}" alt="" style="width:36px;height:36px;image-rendering:pixelated"><span><b>${it.item}</b><span class="d">For ${CHARS[it.to].name}${it.from?' · from '+CHARS[it.from].name:''}</span></span></span></div>`).join('')+'</div>';});
  const H=STRIPS[0],hk=(Math.hypot(H.x-ac.pos.x,H.z-ac.pos.z)/1000).toFixed(1);
  html+=`<h3>${stops.length?'THEN':'NEXT'} · ${H.name.toUpperCase()} · ${hk} KM</h3><div class="list"><div class="item"><span><b>Back to Mabel</b><span class="d">Bring in any outgoing mail and close the day.</span></span></div></div>`;
  showCard(`<h2>Mail bag</h2><div class="sub">DAY ${mail.day} · ${mail.bag.length} ITEM${mail.bag.length===1?'':'S'} · THE CYAN MARKER IS YOUR NEXT STOP</div>${html}`,
    wasFly?[['Resume',()=>{hideModal();mode='fly';},true],["Bea's chart",()=>bigMap()],['Menu',()=>openMenu()]]:[['Back',back,true]]);}
function stamp(n=1){log.stamps+=n;saveL();}

/* ---------- extra world bits ---------- */
(function sheds(){const it=[];
  const s=STRIPS[2];const p=toWorld(s,40,-(s.wid/2+16));const y=groundH(p.x,p.z);
  it.push({geo:BOX(7,4,6),m:M([p.x,y+1.5,p.z],[0,-s.hdg*DEG,0]),color:0xe9d3b0});
  it.push({geo:new THREE.CylinderGeometry(4.4,4.4,6.6,3).rotateX(-Math.PI/2),m:M([p.x,y+4.3,p.z],[0,-s.hdg*DEG+Math.PI/2,0],[1,.55,1]),color:0xc2553f});
  addLight(p.x,y+2,p.z,0xffc25a);
  const l=STRIPS[1];const q=toWorld(l,-60,l.wid/2+18);const yy=groundH(q.x,q.z);
  it.push({geo:BOX(6,3.6,5),m:M([q.x,yy+1.3,q.z],[0,-l.hdg*DEG,0]),color:0xdfe3e6});
  it.push({geo:new THREE.CylinderGeometry(3.8,3.8,5.6,3).rotateX(-Math.PI/2),m:M([q.x,yy+3.9,q.z],[0,-l.hdg*DEG+Math.PI/2,0],[1,.55,1]),color:0x3f6f8f});
  scene.add(shadowy(new THREE.Mesh(merge(it),toon())));})();
lightPts.geometry.setAttribute('position',new THREE.Float32BufferAttribute(LIGHTP,3));lightPts.geometry.setAttribute('color',new THREE.Float32BufferAttribute(LIGHTC,3));
const PAPIS=[];
for(const s of STRIPS)for(const dir of [1,-1]){
  const g=new THREE.Group();const lights=[];
  const aimS=-dir*(s.len/2-s.len*.22);const a=toWorld(s,aimS,0);
  const dx=s.fx*dir,dz=s.fz*dir;const lx=dz,lz=-dx;
  const base=new V3(a.x+lx*(s.wid/2+9),groundH(a.x,a.z)+1,a.z+lz*(s.wid/2+9));g.position.copy(base);
  for(let j=0;j<4;j++){const m=new THREE.Mesh(new THREE.BoxGeometry(2.6,1.6,1.6),new THREE.MeshBasicMaterial({color:0xffffff,fog:false}));m.position.set(lx*j*5,0,lz*j*5);m.rotation.y=-s.hdg*DEG;g.add(m);lights.push(m);}
  scene.add(g);PAPIS.push({s,dir,g,lights,base});
}
/* approach gates: three floating frames on the 4-degree glide path, 2.0 / 1.3 / 0.7 km before the aim point */
const GATE_D=[2000,1300,700],gateGrp=new THREE.Group();scene.add(gateGrp);const gates=[];
{const mat=new THREE.MeshBasicMaterial({color:0x8ff0e8,fog:false});
  for(let i=0;i<3;i++){const fr=new THREE.Group();const W=46,Hh=30,T=2.4;
    for(const [x,y,w,h] of [[0,Hh/2,W,T],[0,-Hh/2,W,T],[-W/2,0,T,Hh],[W/2,0,T,Hh]]){const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,T),mat);b.position.set(x,y,0);fr.add(b);}
    gateGrp.add(fr);gates.push(fr);}}
let gateDir=1,gatePassed=[false,false,false],gateAlong=1e9;
function gateSide(s){const l=toLocal(s,ac.pos.x,ac.pos.z),side=l.s<0?1:-1;return approachClear(s,side)?side:(approachClear(s,-side)?-side:side);}
function gatePos(s,dir,d){const aimS=-dir*(s.len/2-s.len*.22),p=toWorld(s,aimS-dir*d,0);return new V3(p.x,s.elev+AC.gearH+Math.tan(4*DEG)*d,p.z);}
function updGates(){
  const show=dest&&!ac.ground&&(mode==='fly'||mode==='paused')&&Math.hypot(dest.x-ac.pos.x,dest.z-ac.pos.z)<7500;gateGrp.visible=!!show;if(!show){gatePassed=[false,false,false];gateAlong=1e9;return;}
  const nd=gateSide(dest);if(nd!==gateDir){gateDir=nd;gatePassed=[false,false,false];}
  const s=dest,aimS=-gateDir*(s.len/2-s.len*.22),l=toLocal(s,ac.pos.x,ac.pos.z),along=(aimS-l.s)*gateDir,lat=l.t*gateDir;
  if(gateAlong>=1e8){gatePassed=GATE_D.map(d=>d>along);gateAlong=along;}
  gates.forEach((fr,i)=>{const p=gatePos(s,gateDir,GATE_D[i]);fr.position.copy(p);fr.rotation.set(0,-(s.hdg+(gateDir<0?180:0))*DEG,0);
    const dist=p.distanceTo(camera.position);fr.scale.setScalar(clamp(dist/450,1,6));fr.visible=!gatePassed[i];
    if(!gatePassed[i]&&gateAlong>GATE_D[i]&&along<=GATE_D[i]){gatePassed[i]=true;const dy=ac.pos.y-p.y;const inside=Math.abs(lat)<34&&Math.abs(dy)<26;
      snd.beep(inside?990:440);toast(inside?`Gate ${i+1} ✓ ${i<2?'on the path':'nice. Flaps 2, power back.'}`:`Missed gate ${i+1}. ${Math.abs(dy)>=26?(dy>0?'A little high.':'A little low.'):'Off to the side.'} Line up for the next.`,2);}});
  gateAlong=along;}

/* tailwind rings: a chain of gold hoops on the way to the next stop. Fly through one for a gust that
   carries you along faster and holds your height, ending before the approach gates. */
const BOOST_V=55,BOOST_T=12,RING_R=12,RING_HIT=30;
const ringGrp=new THREE.Group();scene.add(ringGrp);const ringPool=[];
{const mat=new THREE.MeshBasicMaterial({color:0xffd36b,fog:false}),inner=new THREE.MeshBasicMaterial({color:0xfff6d8,fog:false});
  const tg=new THREE.TorusGeometry(RING_R,1.5,6,20),tg2=new THREE.TorusGeometry(RING_R-3.2,.5,4,20);
  for(let i=0;i<8;i++){const g=new THREE.Group();g.add(new THREE.Mesh(tg,mat),new THREE.Mesh(tg2,inner));
    for(let k=0;k<3;k++){const ch=new THREE.Mesh(new THREE.BoxGeometry(1.2,4,1.2),inner);ch.position.set(0,0,-6-k*7);ch.rotation.z=Math.PI/4;ch.userData.k=k;g.add(ch);}
    g.visible=false;ringGrp.add(g);ringPool.push(g);}}
let route=[],routeFor=null,routeDir=0,routeT=0,ringPrev=new V3();
const glideAlt=(s,d)=>s.elev+AC.gearH+Math.tan(4*DEG)*d;
function clearAt(x,z){let m=0;for(const [dx,dz] of [[0,0],[120,0],[-120,0],[0,120],[0,-120],[85,85],[-85,-85],[85,-85],[-85,85]])m=Math.max(m,surfH(x+dx,z+dz));return m+95;}
function buildRoute(){route=[];routeFor=dest;routeDir=gateDir;if(!dest)return;
  const E=gatePos(dest,gateDir,3300),C=gatePos(dest,gateDir,2600),P=ac.pos,dx=E.x-P.x,dz=E.z-P.z,L=Math.hypot(dx,dz);
  if(Math.hypot(C.x-P.x,C.z-P.z)<1500)return;
  const pts=[];for(let d=550;d<L-350;d+=850)pts.push([P.x+dx*d/L,P.z+dz*d/L,null]);
  if(L>500)pts.push([E.x,E.z,E.y]);pts.push([C.x,C.z,C.y]);
  let prev=new V3(P.x,P.y,P.z);
  for(const [x,z,gy] of pts){const fr=Math.hypot(x-P.x,z-P.z)/Math.max(L,1),seg=Math.hypot(x-prev.x,z-prev.z),gr=(route.length?.06:.04)*seg,y=Math.max(clearAt(x,z),clamp(gy!=null?gy+25:lerp(P.y,E.y+25,Math.min(fr,1)),prev.y-gr,prev.y+gr));const v=new V3(x,y,z);
    route.push({p:v,dir:v.clone().sub(prev).setY(0).normalize(),passed:false});prev=v;}
  for(let i=route.length-1;i>0;i--){const a=route[i-1].p,b=route[i].p,g=.085*Math.hypot(b.x-a.x,b.z-a.z);if(a.y<b.y-g)a.y=b.y-g;}
  route=route.slice(0,ringPool.length);}
function updRings(dt,t){
  const air=!ac.ground&&(mode==='fly'||mode==='paused');
  if(!air||!dest){ringGrp.visible=false;if(ac.ground){route=[];routeFor=null;}ringPrev.copy(ac.pos);return;}
  const agl=ac.pos.y-AC.gearH-surfH(ac.pos.x,ac.pos.z);
  routeT-=dt;if(routeT<=0){routeT=1.5;const nxt=route.find(r=>!r.passed),toC=Math.hypot(ac.pos.x-gatePos(dest,gateDir,2600).x,ac.pos.z-gatePos(dest,gateDir,2600).z);
    if(routeFor!==dest||routeDir!==gateDir||(agl>35&&toC>1700&&(!nxt||nxt.p.distanceTo(ac.pos)>1500)))if(agl>35||routeFor!==dest)buildRoute();}
  ringGrp.visible=true;
  route.forEach((r,i)=>{const g=ringPool[i];g.visible=!r.passed;if(r.passed)return;g.position.copy(r.p);g.rotation.set(0,Math.atan2(-r.dir.x,-r.dir.z),0);
    const dist=r.p.distanceTo(camera.position);g.scale.setScalar(clamp(dist/380,1,5));g.children[0].rotation.z=t*.8;
    g.children.forEach(c=>{if(c.userData.k!=null)c.position.z=-((t*14+c.userData.k*7)%21)-4;});
    // hit test: closest approach of this frame's motion segment to the ring centre
    const seg=_p.copy(ac.pos).sub(ringPrev),l2=seg.lengthSq(),tt=l2>0?clamp(_c1.copy(r.p).sub(ringPrev).dot(seg)/l2,0,1):0;
    const cp=_c2.copy(ringPrev).addScaledVector(seg,tt);
    if(cp.distanceTo(r.p)<RING_HIT){for(let j=0;j<=i;j++)route[j].passed=true;ac.boostT=BOOST_T;snd.beep(1320);setTimeout(()=>snd.beep(1760),90);
      const left=route.filter(q=>!q.passed).length;toast(left?`Tailwind! ${left} more ring${left>1?'s':''} to the gates.`:'Last tailwind. Ease off and look for gate 1.',2);tip('tailwind','Gold rings are tailwinds. Fly through one and the wind carries you along fast and level for a few seconds. They stop before the landing gates.',.1);}
    for(let j=0;j<i;j++)if(!route[j].passed&&route[j].p.distanceTo(ac.pos)>route[i].p.distanceTo(ac.pos)+600&&cp.distanceTo(r.p)<RING_HIT)route[j].passed=true;});
  ringPrev.copy(ac.pos);}
function stepBoost(dt){
  if(ac.boostT>0){ac.boostT-=dt;const agl=ac.pos.y-AC.gearH-surfH(ac.pos.x,ac.pos.z);
    const C=dest&&gatePos(dest,gateDir,2350);if(agl<30||ac.ground||(C&&!route.some(r=>!r.passed)&&Math.hypot(C.x-ac.pos.x,C.z-ac.pos.z)<250))ac.boostT=0;}
  ac.bst=lerp(ac.bst||0,ac.boostT>0?1:0,1-Math.exp(-dt*(ac.boostT>0?2.5:1.1)));
  if(ac.bst<.005||ac.ground)return;
  axes();const hl=Math.hypot(_f.x,_f.z);if(hl<.2)return;
  ac.pos.x+=_f.x/hl*BOOST_V*ac.bst*dt;ac.pos.z+=_f.z/hl*BOOST_V*ac.bst*dt;
  const nx=route.find(r=>!r.passed);let vyT=0;
  if(nx){const hd=Math.hypot(nx.p.x-ac.pos.x,nx.p.z-ac.pos.z),gs=Math.max(hl*ac.ias+BOOST_V*ac.bst,10);vyT=clamp((nx.p.y-ac.pos.y)/Math.max(hd/gs,2),-9,9);}
  ac.vel.y+=(vyT-ac.vel.y)*Math.min(1,dt*5*ac.bst);}

const beacon=new THREE.Mesh(new THREE.CylinderGeometry(5,5,700,10,1,true).translate(0,350,0),new THREE.MeshBasicMaterial({color:0x8ff0e8,transparent:true,opacity:.12,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
scene.add(beacon);
const blob=new THREE.Mesh(new THREE.CircleGeometry(1,14).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0x2a2238,transparent:true,opacity:.3,depthWrite:false}));
blob.renderOrder=2;scene.add(blob);
{const hp=toWorld(STRIPS[0],95,-38);parked.position.set(hp.x,groundH(hp.x,hp.z)+1.35,hp.z);parked.quaternion.setFromEuler(new THREE.Euler(0,-(STRIPS[0].hdg+200)*DEG,0,'YXZ'));}
const smokeBurst=[];{const mat=new THREE.MeshToonMaterial({color:0x6e6574,gradientMap:gradTex,flatShading:true});
  for(let i=0;i<10;i++){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(1,0),mat);m.visible=false;scene.add(m);smokeBurst.push(m);}}
const spot=new THREE.SpotLight(0xfff2d8,0,700,.32,.45,1.1);spot.position.set(0,-.4,-2.6);const spotT=new THREE.Object3D();spotT.position.set(0,-14,-80);plane.add(spot,spotT);spot.target=spotT;
const navPts=(()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([-5.3,.8,-.5,5.3,.8,-.5,0,1.7,4.5],3));g.setAttribute('color',new THREE.Float32BufferAttribute([1,.25,.2,.3,1,.4,1,1,1],3));
  const m=new THREE.Points(g,new THREE.PointsMaterial({size:2,sizeAttenuation:false,vertexColors:true,fog:false}));plane.add(m);return m;})();
const TG=new Map();for(const t of trees){const k=((t.x/60)|0)+','+((t.z/60)|0);if(!TG.has(k))TG.set(k,[]);TG.get(k).push(t);}
function treeHit(x,y,z){const cx=(x/60)|0,cz=(z/60)|0;for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const L=TG.get((cx+i)+','+(cz+j));if(!L)continue;
  for(const t of L){const r=3.6*t.s+1.5;if((t.x-x)**2+(t.z-z)**2<r*r&&y<t.h+10.5*t.s)return true;}}return false;}
let summit={x:0,z:0,h:0};{let m=-1e9,mi=0;for(let k=0;k<HGT.length;k++)if(HGT[k]>m){m=HGT[k];mi=k;}summit={x:-HALF+(mi%NV)*CELL,z:-HALF+Math.floor(mi/NV)*CELL,h:m};}
const stripAt=(x,z,m=2)=>STRIPS.find(s=>{const l=toLocal(s,x,z);return Math.abs(l.s)<s.len/2&&Math.abs(l.t)<s.wid/2+m;})||null;
const stripById=id=>STRIPS.find(s=>s.id===id);

/* ---------- flight model ---------- */
const G=9.81,RHO=1.225,KT=1.94384,FT=3.28084;
const AC={mass:650,S:16,span:10.5,CLa:5.2,CL0:.3,CD0:.031,k:.058,Tmax:3000,Vp:75,stall:15*DEG,Ka:16,Ke:4.8,Kr:6.5,Kd:1.5,Kb:6,Kru:2.5,gearH:1.35};
const FLAPS=[{dCL:0,dSt:0,dCD:0},{dCL:.35,dSt:-1*DEG,dCD:.016},{dCL:.6,dSt:-2*DEG,dCD:.06}];
const WIND=new V3(Math.sin(70*DEG),0,-Math.cos(70*DEG)).multiplyScalar(3);
const ac={pos:new V3(),vel:new V3(),q:new Q(),w:new V3(),ground:true,gYaw:0,gPitch:0,u:0,throttle:0,flaps:0,brake:0,brakeHeld:false,trim:.06,trimHold:0,
  alpha:0,beta:0,as:AC.stall,stall:false,stallWarn:false,ias:0,td:null,from:'harbor',lastField:'harbor',rpm:.25,prop:0,
  carb:false,lean:false,light:false,ice:0,rough:0,pf:1};
function CLof(a,f){const as=AC.stall+f.dSt,c0=AC.CL0+f.dCL,mx=c0+AC.CLa*as;
  if(a>as)return Math.max(mx*.5,mx-(a-as)*4)*(a>1.2?Math.max(0,(1.57-a)/.37):1);
  const an=-.2;if(a<an){const mn=c0+AC.CLa*an;return Math.min(mn*.5,mn+(an-a)*4);}
  return c0+AC.CLa*a;}
const thrust=u=>AC.Tmax*ac.throttle*ac.pf*Math.max(0,1-u/AC.Vp);
function engine(dt){
  const ft=(ac.pos.y-AC.gearH)*FT;
  if(!ac.ground&&!ac.carb&&ac.throttle<.4)ac.ice=Math.min(1,ac.ice+dt/32);
  else if(ac.carb)ac.ice=Math.max(0,ac.ice-dt/6);else ac.ice=Math.max(0,ac.ice-dt/70);
  let pf=1;if(ac.carb)pf*=.93;
  let leanRough=0;if(ac.lean){if(ft>2000)pf*=1.06;else{pf*=.86;leanRough=ac.throttle>.6?.5:.2;}}
  pf*=1-.35*ac.ice;ac.pf=pf;ac.rough=Math.max(ac.ice>.25?ac.ice:0,leanRough);
}
const _f=new V3(),_u=new V3(),_r=new V3(),_va=new V3(),_vb=new V3(),_qi=new Q(),_fo=new V3(),_d=new V3(),_l=new V3(),_dq=new Q(),_ax=new V3(),_p=new V3(),_e=new THREE.Euler();
const surfH=(x,z)=>Math.max(groundH(x,z),0);
const inp={pitch:0,roll:0,yaw:0};
let simT=0;
function axes(){_f.set(0,0,-1).applyQuaternion(ac.q);_u.set(0,1,0).applyQuaternion(ac.q);_r.set(1,0,0).applyQuaternion(ac.q);}
function stepAir(dt){
  axes();const F=_f,U=_u,R=_r;
  const va=_va.copy(ac.vel).sub(WIND),V=va.length();
  const vb=_vb.copy(va).applyQuaternion(_qi.copy(ac.q).invert());
  const u=-vb.z,alpha=Math.atan2(-vb.y,Math.max(u,.5)),beta=Math.atan2(vb.x,Math.max(Math.abs(u),2));
  const f=FLAPS[ac.flaps],as=AC.stall+f.dSt;
  const agl=ac.pos.y-AC.gearH-surfH(ac.pos.x,ac.pos.z),ge=agl<AC.span?1+.1*(1-Math.max(agl,0)/AC.span):1;
  const CL=CLof(alpha,f)*ge,qd=.5*RHO*V*V,stalled=alpha>as;
  const CD=AC.CD0+f.dCD+.014*(1-ac.throttle)+AC.k*CL*CL/(ge*ge)+(stalled?.06+(alpha-as)*.6:0);
  const force=_fo.set(0,-AC.mass*G,0);
  if(V>1){const dir=_d.copy(va).multiplyScalar(1/V);
    const ld=_l.copy(U).addScaledVector(dir,-U.dot(dir));if(ld.lengthSq()>1e-6){ld.normalize();force.addScaledVector(ld,qd*AC.S*CL);}
    force.addScaledVector(dir,-qd*AC.S*CD);force.addScaledVector(R,-qd*AC.S*.9*beta);}
  force.addScaledVector(F,thrust(Math.max(u,0)));
  ac.vel.addScaledVector(force,dt/AC.mass);ac.pos.addScaledVector(ac.vel,dt);
  const A=clamp(qd/551,0,2.2),sA=Math.sqrt(A);
  const bank=Math.atan2(-R.y,U.y),rollRate=-ac.w.z;
  let e=inp.pitch,a=inp.roll,r=inp.yaw;
  if(settings.steady){r+=clamp(beta*2.5,-1,1);if(Math.abs(inp.roll)<.05)a=clamp(-bank*1.1-rollRate*.35,-.7,.7);}
  if(settings.autoTrim){if(Math.abs(inp.pitch)<.04){if(ac.trimHold>=0&&!stalled){ac.trim=ac.trimNow!=null?ac.trimNow:alpha;ac.trimHold=-1;}}else{ac.trimHold=0;ac.trimNow=alpha;}}
  ac.trim=clamp(ac.trim,-.03,as-.07);
  if(settings.stallGuard){const lim=(as-.04-ac.trim)*AC.Ka/AC.Ke;e=Math.min(e,lim);if(alpha>as-.05)e-=(alpha-(as-.05))*25;}
  const stallRoll=stalled?vnoise(simT*.9,0,77)*8*Math.min(alpha-as+.05,.3):0;
  ac.w.x+=(A*(AC.Ke*e-AC.Ka*(alpha-ac.trim))-(5.2*sA+.6)*ac.w.x)*dt;
  ac.w.z+=(A*(-AC.Kr*a+AC.Kd*beta)+stallRoll-(5.5*sA+.6)*ac.w.z)*dt;
  ac.w.y+=(A*(-AC.Kb*beta-AC.Kru*r)-(3*sA+.6)*ac.w.y)*dt;
  const wl=ac.w.length();if(wl>1e-6){_dq.setFromAxisAngle(_ax.copy(ac.w).multiplyScalar(1/wl),wl*dt);ac.q.multiply(_dq).normalize();}
  ac.alpha=alpha;ac.beta=beta;ac.as=as;ac.stall=stalled;ac.stallWarn=alpha>as-3*DEG&&V>4;ac.ias=V*Math.cos(Math.min(Math.abs(alpha),1.2));
  airContact();
}
const GEAR=[new V3(-1.15,-1.35,.15),new V3(1.15,-1.35,.15),new V3(0,-1.35,-2.15)];
const BODY=[new V3(-5.25,.78,-.55),new V3(5.25,.78,-.55),new V3(0,-.05,-3.05),new V3(0,.4,4.4),new V3(0,1.6,4.3)];
function airContact(){
  for(const b of BODY){_p.copy(b).applyQuaternion(ac.q).add(ac.pos);if(_p.y<surfH(_p.x,_p.z)){
    const gh=groundH(_p.x,_p.z);return crash(gh<.3?'water':(ac.pos.y-surfH(ac.pos.x,ac.pos.z)>3?'terrain':(b.x!==0?'bank':'nose')));}}
  if(ac.pos.y-surfH(ac.pos.x,ac.pos.z)<25&&treeHit(ac.pos.x,ac.pos.y-AC.gearH,ac.pos.z))return crash('tree');
  let low=1e9;for(const g of GEAR){_p.copy(g).applyQuaternion(ac.q).add(ac.pos);low=Math.min(low,_p.y-surfH(_p.x,_p.z));}
  if(low<=0){if(ac.vel.y>.2){ac.pos.y-=low;return;}touchdown(low);}
}
function checklistState(){const T=TOD[tod];return {carb:ac.carb,mix:!ac.lean,flaps:ac.flaps>=1,light:T.lights>0?ac.light:true,needLight:T.lights>0};}
function touchdown(low){
  axes();const gh=groundH(ac.pos.x,ac.pos.z);
  if(gh<.3)return crash('water');
  const pitch=Math.asin(clamp(_f.y,-1,1)),bank=Math.atan2(-_r.y,_u.y),sink=-ac.vel.y;
  if(sink>4.2)return crash('hard',sink);
  if(Math.abs(bank)>14*DEG)return crash('bank');
  if(pitch<-5*DEG)return crash('nose');
  const st=stripAt(ac.pos.x,ac.pos.z);
  if(!st&&slopeAt(ac.pos.x,ac.pos.z)>.2)return crash('rough');
  if(!ac.td){const fh=new V3(_f.x,0,_f.z).normalize();
    const dirSign=st?Math.sign(fh.x*st.fx+fh.z*st.fz)||1:1;const l=st?toLocal(st,ac.pos.x,ac.pos.z):null;
    ac.td={strip:st?st.id:null,sink,kt:ac.ias*KT,bankDeg:Math.abs(bank)/DEG,s:l?l.s:0,t:l?l.t:0,dirSign,bounced:false,view:camMode,done:false,check:checklistState(),tod};}
  if(sink>2.3&&!ac.td.bounced){ac.td.bounced=true;ac.vel.y=sink*.35;ac.pos.y-=low-.05;ac.w.x*=.3;snd.thump(.8);
    toast('Bounced! Hold the nose up gently and let it settle.',3);return;}
  snd.thump(clamp(sink/2.5,.25,1));
  ac.pos.y-=low;ac.ground=true;ac.gYaw=Math.atan2(-_f.x,-_f.z);ac.gPitch=clamp(pitch,0,.21);
  const fh=new V3(-Math.sin(ac.gYaw),0,-Math.cos(ac.gYaw));ac.u=Math.max(0,ac.vel.dot(fh));ac.w.set(0,0,0);
  toast(`Touchdown · ${Math.round(ac.td.sink*196.85)} ft/min`,2.2);
}
const _fh=new V3();
function stepGround(dt){
  const st=stripAt(ac.pos.x,ac.pos.z),surf=st?st.surf:'rough';
  const fh=_fh.set(-Math.sin(ac.gYaw),0,-Math.cos(ac.gYaw));
  const ua=ac.u-WIND.dot(fh),qd=.5*RHO*ua*Math.abs(ua),f=FLAPS[ac.flaps];
  const rot=clamp((ua/23)**2,0,1.3);
  const tgt=clamp(inp.pitch*.22*rot,0,.21);ac.gPitch+=clamp(tgt-ac.gPitch,-.5*dt,.6*dt);
  const CL=CLof(ac.gPitch,f)*1.1,L=qd*AC.S*CL,N=Math.max(0,AC.mass*G-L);
  const mu={paved:.025,grass:.05,dirt:.06,rough:.09}[surf],bmu=surf==='paved'?.8:.6;
  const D=qd*AC.S*(AC.CD0+f.dCD+AC.k*CL*CL),fr=(mu+ac.brake*bmu)*N;
  let acc=(thrust(ac.u)-D)/AC.mass;
  if(ac.u>.01)acc-=fr/AC.mass;else acc=acc*AC.mass>fr?acc-fr/AC.mass:0;
  ac.u=Math.max(0,ac.u+acc*dt);
  const steer=clamp(inp.roll+inp.yaw,-1,1);ac.gYaw+=-steer*.9*smooth(0,3,ac.u)/(1+ac.u/16)*dt;
  ac.pos.addScaledVector(fh,ac.u*dt);
  const gh=groundH(ac.pos.x,ac.pos.z);ac.pos.y=Math.max(gh,0)+AC.gearH;
  ac.q.setFromEuler(_e.set(ac.gPitch,ac.gYaw,0,'YXZ'));ac.vel.copy(fh).multiplyScalar(ac.u);ac.w.set(0,0,0);
  ac.ias=Math.max(0,ua);ac.alpha=ac.gPitch;ac.stall=false;ac.stallWarn=false;ac.trim=.06;
  if(gh<.25&&ac.u>.3)return crash('water');
  if(!st&&ac.u>6&&slopeAt(ac.pos.x,ac.pos.z)>.2)return crash('rough');
  if(ac.u>3&&treeHit(ac.pos.x,gh+.5,ac.pos.z))return crash('tree');
  if(L>AC.mass*G*1.02&&ac.gPitch>.02)liftoff();
}
function liftoff(){
  const fh=new V3(-Math.sin(ac.gYaw),0,-Math.cos(ac.gYaw));ac.ground=false;ac.vel.copy(fh).multiplyScalar(ac.u);ac.vel.y=.6;ac.w.set(.05,0,0);
  ac.trim=clamp(ac.gPitch,.02,.12);
  const st=stripAt(ac.pos.x,ac.pos.z,40);if(st)ac.from=st.id;ac.td=null;
  log.flights++;goal('firstflight');saveL();tip('airborne','You\'re flying. Ease off the stick and let it climb at about 60 knots. The little map shows where you\'re headed.');
}

/* ---------- crash / spawn ---------- */
let spawnQuiet=false,mode='title',camMode='chase',crashT=0,snapCam=true,dest=STRIPS[1];
const REASONS={
  water:['Splashdown','This plane needs a runway or a flat field, not the sea.'],
  terrain:['Met the ground','The ground came up faster than expected. Watch altitude near hills, and give mountains room.'],
  hard:['Too hard a landing','Just above the runway, ease back on the stick so the plane settles instead of dropping.'],
  bank:['A wingtip touched','Keep the wings level as you touch down. Small stick moves near the ground.'],
  nose:['Nose first','Touch down on the main wheels with the nose slightly up.'],
  tree:['Into the trees','Trees are taller than they look. Stay over the runway or open ground when low.'],
  rough:['Too rough here','That ground was too steep or bumpy to land or roll on.'],
};
function crash(why,v){
  if(mode!=='fly')return;axes();const cn={kt:ac.ias*KT,fpm:Math.max(0,-ac.vel.y*196.85),bank:Math.abs(Math.atan2(-_r.y,_u.y))/DEG,pitch:Math.asin(clamp(_f.y,-1,1))/DEG};mode='crashed';crashT=0;snd.thump(1.2);snd.crash();
  smokeBurst.forEach((m,i)=>{m.visible=true;m.position.copy(ac.pos).add(new V3((hash2(i,1,1)-.5)*6,hash2(i,2,1)*3,(hash2(i,3,1)-.5)*6));m.scale.setScalar(.5);m.userData.v=1+hash2(i,4,1)*2;});
  setTimeout(()=>{const [t,b]=REASONS[why];const bad=(x,ok)=>ok?x:`<b style="color:#c2453a">${x}</b>`;
    const extra=`<div class="rows"><span class="k">SPEED</span><span>${bad(Math.round(cn.kt)+' kt',cn.kt>=45&&cn.kt<=62)}</span><span class="s">AIM 50–55</span><span class="k">DESCENT</span><span>${bad(Math.round(cn.fpm)+' ft/min',cn.fpm<500)}</span><span class="s">UNDER 300</span><span class="k">BANK</span><span>${bad(Math.round(cn.bank)+'°',cn.bank<10)}</span><span class="s">UNDER 10°</span><span class="k">NOSE</span><span>${bad((cn.pitch>=0?'up ':'down ')+Math.abs(Math.round(cn.pitch))+'°',cn.pitch>=0&&cn.pitch<12)}</span><span class="s">UP 2–8°</span></div>`;
    showCard(`<div class="who"><img src="${portrait('gus')}" alt=""><div><b>${t}</b><span>GUS PATCHES IT UP · THE MAIL IS STILL IN THE BAG</span></div></div><p>${b}</p>${extra}`,[
      ['Try that approach again',()=>spawnApproach(dest),true],['Back to '+stripById(ac.lastField).name,()=>spawnField(stripById(ac.lastField))]]);},900);
}
function resetAc(){ac.boostT=0;ac.bst=0;route=[];routeFor=null;ac.w.set(0,0,0);ac.td=null;ac.brake=0;ac.brakeHeld=false;ac.trimHold=0;ac.ice=0;smokeBurst.forEach(m=>m.visible=false);snapCam=true;}
function intoWindDir(s){return (s.fx*WIND.x+s.fz*WIND.z)<0?1:-1;}
function spawnField(s,dirSign){
  dirSign=dirSign||intoWindDir(s);resetAc();
  const p=toWorld(s,-dirSign*(s.len/2-18),0);
  ac.pos.set(p.x,groundH(p.x,p.z)+AC.gearH,p.z);ac.gYaw=-((s.hdg+(dirSign<0?180:0))*DEG);ac.gPitch=0;ac.u=0;
  ac.q.setFromEuler(_e.set(0,ac.gYaw,0,'YXZ'));ac.vel.set(0,0,0);ac.ground=true;ac.throttle=0;ac.flaps=0;ac.trim=.06;
  ac.from=s.id;ac.lastField=s.id;pickDest(s.id);if(spawnQuiet)return;startFly();
  tip('start','Slide PWR all the way up to start rolling. Push the stick sideways to steer.',1.2);
}
function approachClear(s,dir){const aimS=-dir*(s.len/2-s.len*.22),gs=Math.tan(4*DEG);for(let d=100;d<=1600;d+=50){const p=toWorld(s,aimS-dir*d,0);if(surfH(p.x,p.z)>s.elev+gs*d-Math.min(25,gs*d*.5))return false;}return true;}
function spawnApproach(s,dirSign){
  if(!dirSign){const w=intoWindDir(s);dirSign=approachClear(s,w)?w:-w;}resetAc();
  const aimS=-dirSign*(s.len/2-s.len*.22),d=1500,gs=Math.tan(4*DEG);
  const p=toWorld(s,aimS-dirSign*d,0);const hdg=(s.hdg+(dirSign<0?180:0))*DEG;
  ac.pos.set(p.x,s.elev+AC.gearH+gs*d,p.z);ac.q.setFromEuler(_e.set(-1*DEG,-hdg,0,'YXZ'));
  ac.vel.set(Math.sin(hdg),-gs,-Math.cos(hdg)).multiplyScalar(30).add(WIND);ac.ground=false;ac.throttle=.12;ac.flaps=1;ac.trim=.02;ac.carb=true;ac.lean=false;
  dest=s;ac.from='__approach';startFly();updSwitches();
  tip('approach0','You\'re on approach. Keep the runway ahead, hold about 55 knots, and follow the lights beside the runway down.',.5);
}
function pickDest(cur){const md=mailDest();if(md){dest=md;return;}const opts=STRIPS.filter(s=>s.id!==cur);opts.sort((a,b)=>((log.fields[a.id]||{}).landings||0)-((log.fields[b.id]||{}).landings||0));dest=opts[0];}
function startFly(){if(settings.tilt){if(!tilt.listening)enableTilt();recenterTilt();setTimeout(recenterTilt,600);}updTiltUI();mode='fly';hideModal();$('title').hidden=true;$('flightUI').hidden=false;snd.init();snd.setOn(settings.sound);
  try{navigator.wakeLock&&navigator.wakeLock.request('screen').catch(()=>{});}catch(e){}
  setThrottleUI();updFlaps();updSwitches();refreshBag();mapT=0;
  if(!log.howto){log.howto=true;saveL();showHowTo();}
  else if(mail.active&&!log.met.bea&&ac.lastField==='harbor')setTimeout(meetBea,400);}

/* ---------- landing grades + deliveries ---------- */
function stars(n){return '★'.repeat(n)+'☆'.repeat(3-n);}
function finishLanding(){
  const td=ac.td;td.done=true;
  if(!td.strip){toast('Off-field landing. Gentle, but find a runway next time.',3);return;}
  const s=stripById(td.strip),dist=td.s*td.dirSign+s.len/2,aim=s.len*.22,fpm=td.sink*196.85;
  let soft=fpm<180?3:fpm<360?2:1,softTxt=fpm<90?'Butter':fpm<180?'Soft':fpm<360?'Firm':'Hard';if(td.bounced){soft=1;softTxt='Bounced';}
  const off=Math.abs(td.t)/(s.wid/2),cen=off<.2?3:off<.5?2:1;
  const zd=dist-aim,zone=dist<0?1:Math.abs(zd)<Math.max(30,s.len*.08)?3:Math.abs(zd)<s.len*.25?2:1;
  const zoneTxt=dist<0?'Short of the runway':Math.abs(zd)<Math.max(30,s.len*.08)?'On the markers':zd<0?`${Math.round(-zd)} m early`:`${Math.round(zd)} m long`;
  const stopped=stripAt(ac.pos.x,ac.pos.z)===s;
  let total=Math.round((soft+cen+zone)/3);if(!stopped)total=Math.max(1,total-1);
  const F=log.fields[s.id]||(log.fields[s.id]={landings:0,best:0});F.landings++;F.best=Math.max(F.best,total);
  const fromId=ac.from,isTrip=fromId&&fromId!==s.id&&fromId!=='__approach';
  const ck=td.check,ckOk=ck.carb&&ck.mix&&ck.flaps&&ck.light;
  const news=[];const g=id=>{if(goal(id,true))news.push(GOALS.find(x=>x.id===id).name);};
  g('land_'+s.id);if(isTrip){log.trips++;g('trip');}if(fpm<90&&!td.bounced)g('butter');if(s.id==='ridge'&&total===3)g('ridge3');if(td.view==='panel')g('instrument');
  if(ckOk)g('checklist');if(td.tod==='night')g('night');
  if(ckOk&&mail.active)stamp(1);
  ac.lastField=s.id;ac.from=s.id;saveL();
  const missed=[!ck.carb&&'carb heat',!ck.mix&&'mixture rich',!ck.flaps&&'flaps',!ck.light&&'landing light'].filter(Boolean).join(', ');
  const ckRow=`<span class="k">CHECKLIST</span><span>${ckOk?'All done'+(mail.active?' · +1 stamp':''):'Missed: '+missed}</span><span class="s">${ckOk?'✓':''}</span>`;
  const here=mail.active?bagFor(s.id):[];
  const homeDone=mail.active&&s.id==='harbor'&&!mail.bag.length;
  const btns=here.length?[[`Deliver the mail (${here.length})`,()=>deliverAt(s),true]]
    :homeDone?[['Hand in the day',endDay,true]]
    :[['Take off from here',()=>spawnField(s),true],['Practice this landing',()=>spawnApproach(s,td.dirSign)],['Keep taxiing',()=>{hideModal();mode='fly';}]];
  showCard(`<h2>${stopped?'Landed at':'Rolled off'} ${s.name}</h2><div class="sub">${isTrip?'TRIP FROM '+stripById(fromId).name.toUpperCase()+' · ':''}${stars(total)}</div>
    <div class="rows"><span class="k">TOUCHDOWN</span><span>${Math.round(fpm)} ft/min at ${Math.round(td.kt)} kt · ${softTxt}</span><span class="s">${stars(soft)}</span>
    <span class="k">CENTERLINE</span><span>${off<.2?'Right down the middle':off<.5?'A little off center':'Way off center'}</span><span class="s">${stars(cen)}</span>
    <span class="k">AIM POINT</span><span>${zoneTxt}</span><span class="s">${stars(zone)}</span>${ckRow}</div>
    ${!stopped?'<p>You ran off the end. Touch down nearer the markers and hold BRAKE.</p>':''}
    ${news.length?`<p><b>New in your logbook:</b> ${news.join(', ')}</p>`:''}`,btns);
  mode='card';
}
function deliverAt(s){
  const here=bagFor(s.id);const queue=[];
  for(const it of here){if(!log.met[it.to])queue.push({kind:'meet',who:it.to});queue.push({kind:'give',it});}
  const step=()=>{const q=queue.shift();
    if(!q){mail.bag=mail.bag.filter(it=>CHARS[it.to].home!==s.id);
      const day=DAYS[mail.day-1];const pick=[];for(const it of here){const out=(day&&day.out&&day.out[it.to])||[];for(const o of out){if(!mail.bag.some(b=>b.item===o.item)){mail.bag.push({...o,from:it.to});pick.push(o);}}}
      saveL();refreshBag();const md=mailDest();if(md)dest=md;
      const homeDone=s.id==='harbor'&&!mail.bag.length;
      const nxt=mail.bag.length?`Next stop: <b>${dest.name}</b>.`:homeDone?'That\'s everything. Mabel is waiting to close the day.':'The bag is empty. Head home to Harbor Field.';
      showCard(`<h2>Mail delivered</h2><div class="sub">${log.stamps} STAMPS ON YOUR ROUTE CARD</div>${pick.length?`<p>Picked up: ${pick.map(o=>`<b>${o.item}</b> for ${CHARS[o.to].name.split(' ')[0]}`).join(', ')}.</p>`:''}<p>${nxt}</p>`,
        homeDone?[['Hand in the day',endDay,true]]:[['Take off',()=>spawnField(s),true],['Look around first',()=>{hideModal();mode='fly';}]]);return;}
    if(q.kind==='meet'){log.met[q.who]=1;saveL();const c=CHARS[q.who];
      showCard(`<div class="who"><img src="${portrait(q.who)}" alt=""><div><b>${c.name}</b><span>${c.role}</span></div></div><p class="say">“${MEET[q.who]}”</p>`,[['Nice to meet you',step,true]]);return;}
    const it=q.it,c=CHARS[it.to];stamp(1);
    showCard(`<div class="who"><img src="${portrait(it.to)}" alt=""><div><b>${c.name}</b><span>${c.role}</span></div></div><p class="say">“${it.line}”</p><div class="got">DELIVERED: ${it.item.toUpperCase()} · +1 STAMP</div>`,[['You\'re welcome',step,true]]);};
  step();
}
function offerDay(after){
  mode=mode==='fly'?'card':mode;
  const day=DAYS[mail.day-1];
  if(!day){showCard(`<div class="who"><img src="${portrait('mabel')}" alt=""><div><b>Mabel Ostrander</b><span>POSTMASTER · HARBOR FIELD</span></div></div><p class="say">“No mail today. The new islands are still waiting on their charts. Go and enjoy the sky.”</p>`,[['Go flying',after,true]]);return;}
  const meet=!log.met.mabel;if(meet)log.met.mabel=1;saveL();
  const list=day.items.map(it=>`<b>${it.item}</b> for ${CHARS[it.to].name}, ${stripById(CHARS[it.to].home).name}`).join('<br>');
  showCard(`<div class="who"><img src="${portrait('mabel')}" alt=""><div><b>Mabel Ostrander</b><span>POSTMASTER · DAY ${mail.day} OF ${DAYS.length}</span></div></div>
    ${meet?`<p class="say">“${MEET.mabel}”</p>`:''}<p class="say">“${day.intro}”</p><p>${list}</p>`,
    [['Load the bag',()=>{mail.bag=day.items.map(x=>({...x}));mail.active=true;saveL();refreshBag();after();},true],['Just flying today',()=>{mail.active=false;saveL();refreshBag();after();}]]);
}
function meetBea(){if(mode!=='fly'||log.met.bea)return;log.met.bea=1;saveL();mode='card';
  showCard(`<div class="who"><img src="${portrait('bea')}" alt=""><div><b>Bea Hollis</b><span>RETIRED MAIL PILOT · HARBOR FIELD</span></div></div><p class="say">“${MEET.bea}”</p><p>Bea's logbook is in the pause menu whenever you want it.</p>`,[['Thanks, Bea',()=>{hideModal();mode='fly';},true],['Open the logbook',()=>bea(-1)]]);}
function endDay(){const day=DAYS[mail.day-1];mail.active=false;mail.bag=[];mail.day++;stamp(2);if(mail.day>DAYS.length)goal('week',true);saveL();refreshBag();
  showCard(`<div class="who"><img src="${portrait('mabel')}" alt=""><div><b>Mabel Ostrander</b><span>END OF DAY · +2 STAMPS</span></div></div><p class="say">“${day?day.outro:'Good flying.'}”</p><div class="got">${log.stamps} STAMPS ON YOUR ROUTE CARD</div>`,
    [[mail.day<=DAYS.length?'Start the next day':'Keep flying',()=>{if(mail.day<=DAYS.length)offerDay(()=>spawnField(STRIPS[0]));else{hideModal();mode='fly';}},true],['Free flight',()=>{hideModal();mode='fly';pickDest('harbor');}]]);}
function goal(id,quiet){if(log.goals[id])return false;log.goals[id]=Date.now();saveL();if(!quiet){const g=GOALS.find(x=>x.id===id);toast('Logbook: '+g.name,2.5);}return true;}

/* ---------- tips & toast ---------- */
let toastT=0;
function toast(msg,sec=3){const t=$('toast');t.textContent=msg;fixNums(t);t.hidden=false;toastT=sec;t.classList.toggle('up',!$('stallBan').hidden);}
const tipQ=[];
function tip(id,text,delay=0){if(!settings.tips||log.tips[id]||tipQ.some(q=>q.id===id))return;tipQ.push({id,text,delay});}
function runTips(dt){if(!tipQ.length||toastT>0.5)return;const q=tipQ[0];q.delay-=dt;if(q.delay>0)return;tipQ.shift();log.tips[q.id]=1;saveL();toast(q.text,6.5);}

/* ---------- glide guidance ---------- */
function glide(s){
  const fx=-Math.sin(ac.gYaw),fz=-Math.cos(ac.gYaw);axes();const hx=ac.ground?fx:_f.x,hz=ac.ground?fz:_f.z;
  const dirSign=(hx*s.fx+hz*s.fz)>=0?1:-1,aimS=-dirSign*(s.len/2-s.len*.22),l=toLocal(s,ac.pos.x,ac.pos.z);
  const along=(aimS-l.s)*dirSign,lat=l.t*dirSign;
  return {dirSign,along,lat:Math.atan2(lat,Math.max(along,1)),v:Math.atan2(ac.pos.y-AC.gearH-s.elev,Math.max(along,1)),active:!ac.ground&&along>60&&along<7000&&Math.abs(Math.atan2(lat,Math.max(along,1)))<30*DEG};
}
const PAPI_T=[4.8,4.3,3.7,3.2];
function updPAPI(){for(const P of PAPIS){const s=P.s,l=toLocal(s,ac.pos.x,ac.pos.z),aimS=-P.dir*(s.len/2-s.len*.22),along=(aimS-l.s)*P.dir;
  const vis=along>20&&along<7000;P.g.visible=vis;if(!vis)continue;
  const dist=P.base.distanceTo(camera.position);P.g.scale.setScalar(clamp(dist*.006,1,30));
  const ang=Math.atan2(ac.pos.y-AC.gearH-s.elev,along)/DEG;P.lights.forEach((m,j)=>m.material.color.setHex(ang>PAPI_T[j]?0xfff4dc:0xff3b30));}}

/* ---------- tilt steering ---------- */
// Gravity in screen space from deviceorientation (beta/gamma are the same on iOS and Android).
// Bank = how far the phone is turned like a steering wheel. Nose = tip toward/away from you, measured from where you held it at the start (recenter).
const tilt={listening:false,ok:false,roll:0,pitch:0,p0:null,raw:null};
const orientAngle=()=>{const a=(screen.orientation&&typeof screen.orientation.angle==='number')?screen.orientation.angle:(window.orientation||0);return ((a%360)+360)%360;};
function onOrient(e){if(e.beta==null||e.gamma==null)return;const b=e.beta*DEG,gm=e.gamma*DEG;
  const ux=-Math.cos(b)*Math.sin(gm),uy=Math.sin(b),uz=Math.cos(b)*Math.cos(gm),a=orientAngle();
  let sx,sy;if(a===90){sx=-uy;sy=ux;}else if(a===270){sx=uy;sy=-ux;}else if(a===180){sx=-ux;sy=-uy;}else{sx=ux;sy=uy;}
  const roll=Math.asin(clamp(-sx,-1,1)),pit=Math.atan2(uz,sy);tilt.raw={roll,pit};tilt.ok=true;if(tilt.p0==null)tilt.p0=pit;
  const dz=(v,d)=>Math.abs(v)<d?0:v-Math.sign(v)*d;
  tilt.roll=lerp(tilt.roll,clamp(dz(roll,2*DEG)/(24*DEG),-1,1),.6);tilt.pitch=lerp(tilt.pitch,clamp(dz(pit-tilt.p0,2*DEG)/(18*DEG),-1,1),.6);}
function recenterTilt(){if(tilt.raw)tilt.p0=tilt.raw.pit;tilt.pitch=0;}
async function enableTilt(){
  try{if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function'){const r=await DeviceOrientationEvent.requestPermission();if(r!=='granted')throw new Error('denied');}
    if(!tilt.listening){addEventListener('deviceorientation',onOrient);tilt.listening=true;}
    tilt.p0=null;setTimeout(()=>{if(!tilt.ok&&settings.tilt)toast('No tilt sensor found here. The touch stick still works.',3.5);},1500);return true;}
  catch(e){settings.tilt=false;saveS();updTiltUI();toast('Tilt needs motion access. You can allow it next time you switch Tilt on.',4);return false;}}
function disableTilt(){if(tilt.listening){removeEventListener('deviceorientation',onOrient);tilt.listening=false;}tilt.ok=false;tilt.roll=tilt.pitch=0;}
function updTiltUI(){const b=$('center');if(b)b.hidden=!settings.tilt;const h=$('ringHint');if(h)h.textContent=settings.tilt?'TILT TO FLY · OR DRAG HERE':'STICK · DRAG ANYWHERE';}

/* ---------- input ---------- */
const stick={id:null,ox:0,oy:0,x:0,y:0},R_STICK=54;
const stickEl=$('stick'),ring=$('ring'),knob=$('knob');
function placeRingIdle(){const r=stickEl.getBoundingClientRect();ring.style.left=(r.width*.55)+'px';ring.style.top=(r.height*.55)+'px';ring.classList.add('idle');knob.style.transform='';}
stickEl.addEventListener('pointerdown',e=>{if(stick.id!==null)return;stick.id=e.pointerId;const r=stickEl.getBoundingClientRect();stick.ox=e.clientX;stick.oy=e.clientY;stick.x=stick.y=0;
  ring.style.left=(e.clientX-r.left)+'px';ring.style.top=(e.clientY-r.top)+'px';ring.classList.remove('idle');$('ringHint').hidden=true;try{stickEl.setPointerCapture(e.pointerId);}catch(_){}e.preventDefault();});
stickEl.addEventListener('pointermove',e=>{if(e.pointerId!==stick.id)return;let dx=(e.clientX-stick.ox)/R_STICK,dy=(e.clientY-stick.oy)/R_STICK;const L=Math.hypot(dx,dy);if(L>1){dx/=L;dy/=L;}
  stick.x=dx;stick.y=dy;knob.style.transform=`translate(${dx*R_STICK}px,${dy*R_STICK}px)`;});
const endStick=e=>{if(e.pointerId!==stick.id)return;stick.id=null;stick.x=stick.y=0;placeRingIdle();};
stickEl.addEventListener('pointerup',endStick);stickEl.addEventListener('pointercancel',endStick);
const thrEl=$('thr');let thrId=null;
function thrFromY(y){const r=thrEl.getBoundingClientRect();ac.throttle=clamp(1-(y-r.top-14)/(r.height-28),0,1);setThrottleUI();}
thrEl.addEventListener('pointerdown',e=>{thrId=e.pointerId;try{thrEl.setPointerCapture(e.pointerId);}catch(_){}thrFromY(e.clientY);e.preventDefault();});
thrEl.addEventListener('pointermove',e=>{if(e.pointerId===thrId)thrFromY(e.clientY);});
thrEl.addEventListener('pointerup',e=>{if(e.pointerId===thrId)thrId=null;});thrEl.addEventListener('pointercancel',()=>thrId=null);
function setThrottleUI(){const r=thrEl.getBoundingClientRect(),h=r.height-28;$('thrKnob').style.bottom=(14+ac.throttle*h)+'px';$('thrFill').style.height=(14+ac.throttle*h)+'px';$('thrPct').textContent=Math.round(ac.throttle*100)+'%';}
function updFlaps(){$('flaps').textContent='FLAPS '+ac.flaps;}
$('flaps').addEventListener('pointerdown',e=>{ac.flaps=(ac.flaps+1)%3;updFlaps();e.preventDefault();if(ac.flaps)tip('flaps','Flaps give more lift and more drag, so you can fly slower. 1 for takeoff and approach, 2 for landing. Bea\'s logbook has the details.');});
const brk=$('brake');const bOn=e=>{ac.brakeHeld=true;brk.classList.add('on');if(e&&e.preventDefault)e.preventDefault();},bOff=()=>{ac.brakeHeld=false;brk.classList.remove('on');};
brk.addEventListener('pointerdown',bOn);brk.addEventListener('pointerup',bOff);brk.addEventListener('pointercancel',bOff);brk.addEventListener('pointerleave',bOff);
function updSwitches(){$('swCarb').classList.toggle('on',ac.carb);$('swCarb').classList.toggle('warn',!ac.carb&&ac.ice>.25);
  $('swMix').innerHTML=ac.lean?'MIX<br>LEAN':'MIX<br>RICH';$('swMix').classList.toggle('on',!ac.lean);$('swLight').classList.toggle('on',ac.light);}
$('swCarb').addEventListener('click',()=>{ac.carb=!ac.carb;updSwitches();snd.click();});
$('swMix').addEventListener('click',()=>{ac.lean=!ac.lean;updSwitches();snd.click();if(ac.lean)tip('lean','Leaning the mixture gives a little more power up high. Below 2,000 ft, keep it RICH.');});
$('swLight').addEventListener('click',()=>{ac.light=!ac.light;updSwitches();snd.click();});
const VIEWS=['chase','cockpit','panel'],VNAME={chase:'CHASE',cockpit:'COCKPIT',panel:'GAUGES'};
function setView(v){camMode=v;$('view').textContent=VNAME[v];snapCam=true;camera.fov=v==='chase'?58:70;camera.near=v==='chase'?.4:.15;camera.updateProjectionMatrix();postMat.uniforms.cNear.value=camera.near;
  $('spd').hidden=$('alt').hidden=v==='panel';if(v==='panel')tip('panel','Gauges only. Fly by the instruments: the attitude ball shows your wings and nose. The GLIDE box steers you to the runway.');
  if(v==='cockpit')tip('cockpit','Cockpit view. Left: speed, attitude, turn, heading. Right: altitude, climb, and the GLIDE box for lining up.');}
$('view').addEventListener('click',()=>setView(VIEWS[(VIEWS.indexOf(camMode)+1)%3]));
$('pause').addEventListener('click',()=>{if(mode==='fly')openMenu();});
$('bag').addEventListener('click',()=>{if(mode==='fly'&&mail.active)mailCard();});
$('center').addEventListener('click',()=>{recenterTilt();toast('Tilt centered. Hold the phone like this to fly level.',2);});
$('dest').addEventListener('click',()=>{const i=STRIPS.indexOf(dest);dest=STRIPS[(i+1)%STRIPS.length];toast('Heading for '+dest.name,1.6);});
$('mapc').addEventListener('click',()=>{if(mode==='fly'){mode='paused';bigMap();}});
const keys={};
addEventListener('keydown',e=>{keys[e.code]=true;if(mode!=='fly')return;
  if(e.code==='KeyF')$('flaps').dispatchEvent(new Event('pointerdown'));if(e.code==='KeyV')$('view').click();if(e.code==='KeyB')bOn();if(e.code==='KeyM'){mode='paused';bigMap();}
  if(e.code==='KeyC')$('swCarb').click();if(e.code==='KeyT')recenterTilt();if(e.code==='KeyL')$('swLight').click();
  if(e.code==='Escape'||e.code==='KeyP')openMenu();if(e.code.startsWith('Arrow'))e.preventDefault();});
addEventListener('keyup',e=>{keys[e.code]=false;if(e.code==='KeyB')bOff();});
const kb={p:0,r:0};
function readInput(dt){
  const tp=(keys.ArrowDown?1:0)-(keys.ArrowUp?1:0),tr=(keys.ArrowRight?1:0)-(keys.ArrowLeft?1:0);
  kb.p+=clamp(tp-kb.p,-3*dt,3*dt);kb.r+=clamp(tr-kb.r,-3*dt,3*dt);
  if(keys.KeyW||keys.ShiftLeft){ac.throttle=clamp(ac.throttle+dt*.6,0,1);setThrottleUI();}
  if(keys.KeyS||keys.ControlLeft){ac.throttle=clamp(ac.throttle-dt*.6,0,1);setThrottleUI();}
  const ex=v=>Math.sign(v)*Math.pow(Math.abs(v),1.3);
  const useTilt=stick.id===null&&settings.tilt&&tilt.ok;const sx=stick.id!==null?stick.x:useTilt?tilt.roll:kb.r,sy=stick.id!==null?stick.y:useTilt?tilt.pitch:kb.p;
  inp.roll=ex(sx);inp.pitch=ex(sy)*(settings.invert?-1:1);inp.yaw=(keys.KeyE?1:0)-(keys.KeyQ?1:0);
  ac.brake=ac.brakeHeld?Math.min(1,ac.brake+dt*1.25):0;brk.style.setProperty('--b',Math.round(ac.brake*100)+'%');
}

/* ---------- audio ---------- */
const snd={ctx:null,
  init(){if(this.ctx)return;try{const AC_=window.AudioContext||window.webkitAudioContext;this.ctx=new AC_();}catch(e){return;}
    const c=this.ctx;this.master=c.createGain();this.master.gain.value=settings.sound?.5:0;this.master.connect(c.destination);
    this.o1=c.createOscillator();this.o1.type='triangle';this.o2=c.createOscillator();this.o2.type='sawtooth';this.dr=0;this.dv=0;
    this.lp=c.createBiquadFilter();this.lp.type='lowpass';this.lp.frequency.value=500;this.eg=c.createGain();this.eg.gain.value=0;
    const g2=c.createGain();g2.gain.value=.3;this.o1.connect(this.lp);this.o2.connect(g2);g2.connect(this.lp);this.am=c.createGain();this.am.gain.value=.8;this.lp.connect(this.am);this.am.connect(this.eg);this.eg.connect(this.master);
    this.lfo=c.createOscillator();this.lfo.type='sine';this.lfo.frequency.value=9;this.lfoG=c.createGain();this.lfoG.gain.value=.2;this.lfo.connect(this.lfoG);this.lfoG.connect(this.am.gain);this.lfo.start();this.o1.start();this.o2.start();
    const buf=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;this.buf=buf;
    this.noise=c.createBufferSource();this.noise.buffer=buf;this.noise.loop=true;this.bp=c.createBiquadFilter();this.bp.type='lowpass';this.bp.frequency.value=380;this.bp.Q.value=.3;
    this.wg=c.createGain();this.wg.gain.value=0;this.noise.connect(this.bp);this.bp.connect(this.wg);this.wg.connect(this.master);this.noise.start();
    this.ho=c.createOscillator();this.ho.type='square';this.ho.frequency.value=540;this.hg=c.createGain();this.hg.gain.value=0;this.ho.connect(this.hg);this.hg.connect(this.master);this.ho.start();},
  update(rpm,ias,stall,run,rough){if(!this.ctx)return;const t=this.ctx.currentTime;
    this.dv+=(Math.random()-.5)*.02-this.dr*.02;this.dv*=.9;this.dr+=this.dv;const irr=1+this.dr*.6+Math.sin(t*1.7)*.012+Math.sin(t*.43)*.018;
    const wob=(rough>0?1+Math.sin(t*23)*.08*rough+Math.sin(t*7.3)*.06*rough:1)*irr,f=(36+rpm*62)*wob;
    this.lfo.frequency.setTargetAtTime(f*.25*(1+this.dr),t,.08);this.lfoG.gain.setTargetAtTime(.14+Math.abs(Math.sin(t*.9))*.12,t,.2);
    this.o1.frequency.setTargetAtTime(f,t,.05);this.o2.frequency.setTargetAtTime(f*.5,t,.05);this.lp.frequency.setTargetAtTime(180+rpm*420,t,.1);
    const cut=rough>0&&Math.sin(t*11)>.6?1-.4*rough:1;
    this.eg.gain.setTargetAtTime(run?(.018+rpm*.022)*cut*settings.engVol:0,t,.04);this.bp.frequency.setTargetAtTime(220+Math.min(ias,60)*4,t,.3);this.wg.gain.setTargetAtTime(run?Math.min(.045,ias*ias/60000):0,t,.4);
    this.hg.gain.setTargetAtTime(stall&&run&&((t*4)%1<.6)?.05:0,t,.01);},
  burst(v,lp,dur){if(!this.ctx)return;const c=this.ctx,s=c.createBufferSource();s.buffer=this.buf;const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=lp;const g=c.createGain(),t=c.currentTime;
    g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f);f.connect(g);g.connect(this.master);s.start(t,Math.random());s.stop(t+dur+.05);},
  beep(f){if(!this.ctx)return;const c=this.ctx,o=c.createOscillator(),g=c.createGain(),t=c.currentTime;o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(.08,t);g.gain.exponentialRampToValueAtTime(.001,t+.18);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+.2);},
  thump(v=1){this.burst(.6*v,260,.25);},crash(){this.burst(.5,900,1.2);},click(){this.burst(.25,3000,.03);},
  setOn(v){if(this.master)this.master.gain.value=v?.5:0;if(this.ctx&&this.ctx.state==='suspended')this.ctx.resume();}};

/* ---------- maps ---------- */
const MAPW=7600,mapBase=(()=>{const N=256,c=document.createElement('canvas');c.width=c.height=N;const x=c.getContext('2d'),img=x.createImageData(N,N);
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const wx=-MAPW/2+(i+.5)*MAPW/N,wz=-MAPW/2+(j+.5)*MAPW/N,h=groundH(wx,wz);let r,g,b;
    if(h<0){const d=clamp(-h/40,0,1);r=lerp(70,30,d);g=lerp(150,72,d);b=lerp(170,120,d);}
    else if(h<4){r=226;g=205;b=150;}
    else{const t=clamp(h/600,0,1),sl=slopeAt(wx,wz);r=lerp(118,190,t*t);g=lerp(166,178,t);b=lerp(84,150,t*t);if(sl>.45){r=150;g=136;b=126;}
      if(isFarm(wx,wz,h,sl)){const fc=fieldColor(wx,wz);if(fc>=0){r=(fc>>16)&255;g=(fc>>8)&255;b=fc&255;}}
      if(((h/60)|0)!==((groundH(wx+MAPW/N,wz)/60)|0)){r*=.82;g*=.82;b*=.82;}}
    const k=(j*N+i)*4;img.data[k]=r;img.data[k+1]=g;img.data[k+2]=b;img.data[k+3]=255;}
  x.putImageData(img,0,0);return c;})();
const mctx=$('mapc').getContext('2d');
function drawStripsOn(x,k,highlight){for(const s of STRIPS){const a=toWorld(s,-s.len/2,0),b=toWorld(s,s.len/2,0);const hi=s===highlight;
  if(hi){x.save();x.fillStyle='#8ff0e8';for(const d of GATE_D){const p=gatePos(s,gateDir,d);x.fillRect(p.x-3/k,p.z-3/k,6/k,6/k);}x.strokeStyle='#8ff0e8';x.lineWidth=1.3/k;x.setLineDash([5/k,4/k]);for(const e of [-1,1]){const p0=toWorld(s,e*s.len/2,0),p1=toWorld(s,e*(s.len/2+2600),0);x.beginPath();x.moveTo(p0.x,p0.z);x.lineTo(p1.x,p1.z);x.stroke();}x.restore();}
  x.strokeStyle=hi?'#ffffff':'#f5e8cf';x.lineWidth=(hi?3:2.2)/k;x.beginPath();x.moveTo(a.x,a.z);x.lineTo(b.x,b.z);x.stroke();}}
let mapT=0;
function drawMiniMap(dt){mapT-=dt;if(mapT>0)return;mapT=.08;const W=96,x=mctx;x.imageSmoothingEnabled=false;
  axes();const hdg=ac.ground?-ac.gYaw:Math.atan2(_f.x,-_f.z);
  const near=dest?Math.hypot(dest.x-ac.pos.x,dest.z-ac.pos.z):1e9,R=near<2600?1500:2800,k=(W/2)/R,cy=W/2+14;
  x.fillStyle='#1d2a44';x.fillRect(0,0,W,W);x.save();x.translate(W/2,cy);x.rotate(-hdg);x.scale(k,k);x.translate(-ac.pos.x,-ac.pos.z);
  x.drawImage(mapBase,-MAPW/2,-MAPW/2,MAPW,MAPW);drawStripsOn(x,k,dest);
  if(!ac.ground){x.strokeStyle='#ffd36b';x.lineWidth=1.6/k;for(const r of route)if(!r.passed){x.beginPath();x.arc(r.p.x,r.p.z,4/k,0,TAU);x.stroke();}}
  if(dest){x.fillStyle='#8ff0e8';x.beginPath();x.arc(dest.x,dest.z,3.5/k,0,TAU);x.fill();}
  x.restore();
  x.fillStyle='#fff8ec';x.strokeStyle='#241c2e';x.lineWidth=1;x.beginPath();x.moveTo(W/2,cy-6);x.lineTo(W/2-4,cy+4);x.lineTo(W/2,cy+2);x.lineTo(W/2+4,cy+4);x.closePath();x.fill();x.stroke();
  const na=-hdg;x.fillStyle='#ffb02e';x.font='13px VT323, monospace';x.textAlign='center';x.textBaseline='middle';x.fillText('N',clamp(W/2+Math.sin(na)*40,6,W-6),clamp(cy-Math.cos(na)*40,6,W-6));
  if(dest&&near>R*.9){const brg=Math.atan2(dest.x-ac.pos.x,-(dest.z-ac.pos.z))-hdg;x.fillStyle='#8ff0e8';x.beginPath();x.arc(clamp(W/2+Math.sin(brg)*44,4,W-4),clamp(cy-Math.cos(brg)*44,4,W-4),3,0,TAU);x.fill();}}
function bigMap(){
  showCard(`<h2>Bea's chart</h2><div class="sub">DASHED LINES SHOW WHERE TO LINE UP FOR ${dest?dest.name.toUpperCase():'EACH RUNWAY'}</div><canvas id="bigmap" width="512" height="384"></canvas>`,[['Back to flying',()=>{hideModal();mode='fly';},true]]);
  $('cardBody').parentElement.querySelector('.card').classList.add('wide');
  const c=$('bigmap'),x=c.getContext('2d');x.imageSmoothingEnabled=false;const k=512/6400;x.save();x.translate(256,192);x.scale(k,k);
  x.drawImage(mapBase,-MAPW/2,-MAPW/2,MAPW,MAPW);drawStripsOn(x,k,dest);x.restore();
  const P=(wx,wz)=>[256+wx*k,192+wz*k];x.font='15px VT323, monospace';x.textBaseline='middle';
  const label=(t,wx,wz,col,dy=-12)=>{const [a,b]=P(wx,wz);x.textAlign='center';x.fillStyle='#241c2e';x.fillText(t,a+1,b+dy+1);x.fillStyle=col;x.fillText(t,a,b+dy);};
  for(const s of STRIPS)label(s.name.toUpperCase(),s.x,s.z,s===dest?'#8ff0e8':'#fff8ec',-14);
  for(const [k_,v] of Object.entries(sights)){if(!log.sights[k_])continue;const [a,b]=P(v.x,v.z);x.fillStyle='#ffb02e';x.fillRect(a-2,b-2,5,5);label(v.name.toUpperCase(),v.x,v.z,'#ffd890',10);}
  label('FERROW',villageC.x,villageC.z,'#f5e8cf',12);
  const [px,pz]=P(ac.pos.x,ac.pos.z);axes();const hdg=ac.ground?-ac.gYaw:Math.atan2(_f.x,-_f.z);x.save();x.translate(px,pz);x.rotate(hdg);x.fillStyle='#fff8ec';x.strokeStyle='#241c2e';x.lineWidth=1.5;x.beginPath();x.moveTo(0,-9);x.lineTo(-6,6);x.lineTo(0,3);x.lineTo(6,6);x.closePath();x.fill();x.stroke();x.restore();
  x.fillStyle='#ffb02e';x.textAlign='left';x.fillText('N ↑',10,14);
  const wd=70*DEG;x.strokeStyle='#fff8ec';x.lineWidth=2;x.beginPath();x.moveTo(478-Math.sin(wd)*12,30+Math.cos(wd)*12);x.lineTo(478+Math.sin(wd)*12,30-Math.cos(wd)*12);x.stroke();x.fillStyle='#fff8ec';x.textAlign='center';x.fillText('WIND',478,52);}

/* ---------- Bea's logbook (flight guide) ---------- */
const BEA=[
  {t:'The two thumbs',h:`<p>Left thumb is the throttle. Right thumb is the stick: touch anywhere on the right side and drag.</p><ul><li><b>Drag down</b> to raise the nose. <b>Drag up</b> to lower it.</li><li><b>Drag sideways</b> to bank. Banking is how you turn.</li><li>The rudder looks after itself while Steady Wings is on.</li></ul><p>Small moves. The plane does what you ask, just a moment later than you'd like.</p>`},
  {t:'Pitch and power',h:`<p>Here's the secret most new pilots fight: <b>the stick sets your speed, the throttle sets climb or descent.</b></p><ul><li>Nose up, slower. Nose down, faster.</li><li>Want to climb without slowing down? Add power.</li><li>Want to come down without speeding up? Take power off.</li></ul><p>Let go of the stick and the plane holds the speed you left it at. That's Auto-trim, doing what a real pilot does with the trim wheel.</p>`},
  {t:'Flaps',h:`<p>Flaps are hinged panels on the back of the wing. Lowering them makes the wing curvier: more lift, and also more drag.</p><table><tr><td>FLAPS 0</td><td><b>Cruise.</b> Clean wing, least drag. Climbing out and flying around.</td></tr><tr><td>FLAPS 1</td><td><b>Takeoff and approach.</b> A bit more lift, so you can fly a few knots slower. Good for short strips and the start of an approach.</td></tr><tr><td>FLAPS 2</td><td><b>Landing.</b> Most lift and most drag. You can come down steeply without speeding up, and touch down slow.</td></tr></table><p>Don't fly fast with flaps out: above 85 knots (the top of the white arc on the speed gauge) they're working too hard. With flaps down you need more power to hold your height.</p>`},
  {t:'The six gauges',h:`<table><tr><td>SPEED</td><td>Airspeed in knots. White arc: flap range. Green: normal. Yellow: careful, smooth air only.</td></tr><tr><td>ATTITUDE</td><td>Blue is sky, brown is ground. The orange wings are you. Shows bank and nose up or down, even when you can't see outside.</td></tr><tr><td>ALTITUDE</td><td>Height in feet above the sea. The long needle is hundreds, the short one thousands. (The readout at the top of the screen is height above the ground, which matters more for landing.)</td></tr><tr><td>TURN</td><td>The little plane tilts as you turn. The ball should sit in the middle: if it slides out, you're slipping sideways.</td></tr><tr><td>HEADING</td><td>Your compass direction. The cyan mark is the way to your next stop.</td></tr><tr><td>CLIMB</td><td>Feet per minute up or down. On approach, about 400 down is right.</td></tr></table><p>Trick: glance, don't stare. Speed, attitude, back to the window.</p>`},
  {t:'Taking off',h:`<ul><li>Flaps 0 on a long runway, 1 on a short one.</li><li>Full power. Keep straight with small sideways stick.</li><li>At about 45 knots, drag the stick gently down. The nose lifts and the plane flies itself off.</li><li>Climb at 55 to 65 knots. Let go and it holds that.</li><li>Flaps up once you're well above the trees.</li></ul>`},
  {t:'Turning',h:`<p>Bank to turn. The steeper the bank, the faster the turn, but the wing spends some of its lift turning instead of holding you up.</p><ul><li>In a turn, hold the stick a little down (back) to keep the nose up and stay level.</li><li>Gentle turns are about 20 degrees of bank. Thirty is brisk.</li><li>Let go of the stick and Steady Wings rolls you level.</li></ul>`},
  {t:'The approach',h:`<p>A good landing is made two kilometers out.</p><ul><li>On the chart, the runway you're headed for has a <b>dashed line</b> coming out of each end. Fly to that line, then turn to follow it toward the runway.</li><li>About 2 km out and a few hundred feet up: <b>flaps 1</b>, power back, <b>55 knots</b>.</li><li>Watch the <b>four lights</b> beside the runway. Two white and two red: perfect. More white: too high, take off power. More red: too low, add power.</li><li>Closer in: flaps 2, and keep the runway centered in the windshield.</li><li>Do your before-landing checklist.</li></ul>`},
  {t:'Landing numbers',h:`<p>Pin these on your knee. The speed and height readouts turn <b style="color:#3e7334">green</b>, <b style="color:#b8862a">amber</b> or <b style="color:#c2453a">red</b> on approach to tell you how you're doing.</p><table><tr><td>2 KM OUT</td><td><b>Gate 1</b>, about <b>450 ft up</b>, lined up on the dashed line, flaps 1, <b>55 knots</b>. Start heading for it from 4 or 5 km away so you have time to turn in.</td></tr><tr><td>GATES 2 AND 3</td><td>1.3 km (about 300 ft) and 0.7 km (about 160 ft). Keep the diamond in the ring on the line-up meter.</td></tr><tr><td>ON FINAL</td><td><b>50 to 60 knots.</b> Coming down about <b>400 ft/min</b>. Two white and two red lights.</td></tr><tr><td>OVER THE END</td><td>Flaps 2, power to idle, <b>about 50 knots</b>, 30 to 50 ft up.</td></tr><tr><td>FLARE</td><td>At <b>10 to 20 ft</b>, ease the nose up a little. The meter switches to FLARE: put both markers in the green, <b>nose up 2 to 8°</b> and <b>sink under 300 ft/min</b>.</td></tr><tr><td>TOUCHDOWN</td><td>Wings level (<b>under 10°</b> of bank), nose slightly up, about <b>45 to 50 knots</b>.</td></tr></table><p>The height readout is <b>feet above the ground under you</b>, not above the sea. Trees are about 30 to 45 ft tall; a house is about 20. Near the runway you'll hear little beeps at 100, 50, 30, 20 and 10 ft.</p><p>Over 800 ft/min at touchdown and Gus gets a phone call.</p>`},
  {t:'Landing and stopping',h:`<ul><li>Aim at the white markers about a quarter of the way down the runway.</li><li>Just above the runway, <b>ease the stick down (back)</b> to raise the nose a little. This is the flare: it turns a drop into a settle.</li><li>Power to idle as the wheels touch.</li><li>Hold <b>BRAKE</b>. It builds up the longer you hold: tap it for a little, hold it for a lot.</li></ul><p>Under 180 ft/min is soft. Under 90 is butter.</p>`},
  {t:'Stalls',h:`<p>A wing can only meet the air so steeply. Push past that and it stalls: it stops lifting, and the nose drops.</p><ul><li>The horn and the red STALL sign mean you're close.</li><li><b>Fix it: lower the nose.</b> Speed comes back, the wing works again. Then add power.</li><li>Slow, steep and turning is where stalls happen. On approach, watch the speed.</li></ul><p>Stall Guard stops you pulling into one. Turn it off in Settings when you want to feel it.</p>`},
  {t:'Before-landing checklist',h:`<p>I did this every single landing for forty years. Four things:</p><table><tr><td>CARB HEAT</td><td>ON. Low power on approach is when carb ice forms.</td></tr><tr><td>MIXTURE</td><td>RICH, so full power is there if you need to go around.</td></tr><tr><td>FLAPS</td><td>1 or 2.</td></tr><tr><td>LANDING LIGHT</td><td>ON at sunset, blue hour and night.</td></tr></table><p>The checklist box shows up on approach. Land with all of it done and Mabel adds a bonus stamp.</p>`},
  {t:'Carb heat and mixture',h:`<p><b>Carb ice.</b> The carburetor mixes fuel and air, and it gets cold inside, cold enough to freeze damp air. At low power it can ice up and the engine runs rough and weak. CARB HEAT warms the air going in and melts it, at the cost of a little power. Running rough on a long descent? Carb heat on.</p><p><b>Mixture.</b> Higher up the air is thinner, so the engine wants less fuel. Leaning (MIX LEAN) above 2,000 ft gives a little more power. Down low, lean means too little fuel: keep it RICH.</p>`},
  {t:'Flying by the gauges',h:`<p>In cloud or fog you can't trust your body; it will swear you're level when you're turning. Trust the attitude gauge.</p><ul><li>Keep the orange wings level on the horizon line.</li><li>The <b>GLIDE</b> box: the upright needle is the runway. If it's left of center, turn left. The flat needle is the glide path: if it's below center, you're high.</li><li>Fly toward the needles, gently, until they make a cross.</li></ul>`},
  {t:'Night flying',h:`<ul><li>Runways have edge lights at night. Amber ones mark the ends.</li><li>Turn on your landing light on approach: it lights the runway in front of you.</li><li>The approach lights work just the same at night, so trust them over your eyes.</li></ul>`},
];
function bea(i){if(mode==='fly')mode='paused';const p=BEA[i];
  if(i<0){const list=BEA.map((b,j)=>`<button class="item" data-p="${j}"><span><b>${j+1}. ${b.t}</b></span><span class="r">READ</span></button>`).join('');
    showCard(`<div class="who"><img src="${portrait('bea')}" alt=""><div><b>Bea's logbook</b><span>FORTY YEARS OF FLYING THIS ROUTE</span></div></div><div class="list">${list}</div>`,[['Back',back,true]]);
    $('cardBody').querySelectorAll('[data-p]').forEach(b=>b.addEventListener('click',()=>bea(+b.dataset.p)));return;}
  showCard(`<div class="page"><div class="sub">BEA'S LOGBOOK · PAGE ${i+1} OF ${BEA.length}</div><h2>${p.t}</h2>${p.h}</div>`,[
    ['All pages',()=>bea(-1)],...(i>0?[['Previous',()=>bea(i-1)]]:[]),...(i<BEA.length-1?[['Next page',()=>bea(i+1),true]]:[['Done',back,true]])]);}

/* ---------- handwritten pixel lettering ---------- */
// A real script font drawn small on a canvas and scaled up with square pixels. Swap SCRIPT to try another hand.
const SCRIPT={family:'Dancing Script',weight:700};const PXC={};let scriptReady=false;
function pixelText(txt,px,col,shadow){const k=[txt,px,col,shadow].join('|');if(PXC[k])return PXC[k];
  const c=document.createElement('canvas'),x=c.getContext('2d'),font=`${SCRIPT.weight} ${px}px "${SCRIPT.family}"`;x.font=font;
  c.width=Math.ceil(x.measureText(txt).width+px*.7+3);c.height=Math.ceil(px*1.55);x.font=font;x.textBaseline='middle';const y=c.height/2,x0=Math.round(px*.2);
  if(shadow){x.fillStyle=shadow;x.fillText(txt,x0+1,y+1);}x.fillStyle=col;x.fillText(txt,x0,y);
  const d=x.getImageData(0,0,c.width,c.height);for(let i=3;i<d.data.length;i+=4)d.data[i]=d.data[i]>105?255:0;x.putImageData(d,0,0);
  return PXC[k]={url:c.toDataURL(),w:c.width,h:c.height};}
function scriptify(root){if(!scriptReady)return;
  root.querySelectorAll('#title h1').forEach(el=>{if(el.dataset.px)return;const big=el.tagName==='H1',txt=el.textContent.trim();if(!txt)return;
    const r=big?pixelText(txt,26,'#f5e8cf','#241c2e'):pixelText(txt,el.tagName==='H2'?17:15,'#241c2e',null),sc=big?3:2;
    el.dataset.px=1;el.setAttribute('aria-label',txt);el.innerHTML=`<img class="px-img" src="${r.url}" alt="${txt.replace(/"/g,'&quot;')}" width="${r.w*sc}" height="${r.h*sc}" style="width:${r.w*sc}px">`;});}
document.fonts&&document.fonts.load(`${SCRIPT.weight} 26px "${SCRIPT.family}"`).then(f=>{if(f&&f.length){scriptReady=true;scriptify(document);}}).catch(()=>{});

/* numbers in running text use VT323, whose digits can't be mistaken for letters */
function fixNums(root){const tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>/\d/.test(n.nodeValue)&&!(n.parentElement&&n.parentElement.closest('.num,.k,.sub,.got,button,script,style'))?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT});
  const list=[];while(tw.nextNode())list.push(tw.currentNode);
  for(const n of list){const f=document.createDocumentFragment();let last=0;const s=n.nodeValue;s.replace(/\d+(?:[.,:]\d+)*(?:[–-]\d+(?:[.,:]\d+)*)?/g,(m,i)=>{if(i>last)f.appendChild(document.createTextNode(s.slice(last,i)));const sp=document.createElement('span');sp.className='num';sp.textContent=m;f.appendChild(sp);last=i+m.length;return m;});
    if(last<s.length)f.appendChild(document.createTextNode(s.slice(last)));n.parentNode.replaceChild(f,n);}}

/* ---------- menus ---------- */
function showCard(html,buttons){$('cardBody').innerHTML=html+'<div class="btns"></div>';$('cardBody').classList.remove('wide');const b=$('cardBody').querySelector('.btns:last-child');
  (buttons||[]).forEach(([l,fn,p])=>{const el=document.createElement('button');el.textContent=l;if(p)el.className='primary';el.addEventListener('click',fn);b.appendChild(el);});$('modal').hidden=false;$('cardBody').scrollTop=0;scriptify($('cardBody'));fixNums($('cardBody'));}
function hideModal(){$('modal').hidden=true;}
function back(){hideModal();if(mode==='title')$('title').hidden=false;else if(mode==='paused'||mode==='card')openMenu();}
function openMenu(){if(mode==='fly')mode='paused';showCard(`<h2>Paused</h2><div class="sub">${dest?'HEADING FOR '+dest.name.toUpperCase():''}${mail.active?' · '+mail.bag.length+' IN THE BAG':''} · ${log.stamps} STAMPS</div>`,[
  ['Resume',()=>{hideModal();mode='fly';},true],...(mail.active?[['Mail bag',()=>mailCard()]]:[]),["Bea's chart",()=>bigMap()],["Bea's logbook",()=>bea(-1)],['Practice a landing',()=>picker('practice')],['Start at a field',()=>picker('start')],['Your logbook',()=>logbook()],['Settings',()=>settingsCard()],['Title screen',()=>{hideModal();toTitle();}]]);}
function picker(kind){
  const items=STRIPS.map(s=>{const F=log.fields[s.id];return `<button class="item" data-id="${s.id}"><span><b>${s.name}</b><span class="d">${DESC[s.id]}</span></span><span class="r">${F&&F.best?stars(F.best):'NOT YET'}</span></button>`;}).join('');
  showCard(`<h2>${kind==='practice'?'Practice a landing':'Start at a field'}</h2><div class="sub">${kind==='practice'?'START 1.5 KM OUT, LINED UP, ON THE GLIDE PATH':'START ON THE RUNWAY, ENGINE AT IDLE'}</div><div class="list">${items}</div>`,[['Back',back]]);
  $('cardBody').querySelectorAll('.item').forEach(b=>b.addEventListener('click',()=>{const s=stripById(b.dataset.id);kind==='practice'?spawnApproach(s):spawnField(s);}));}
function logbook(){
  const f=STRIPS.map(s=>{const F=log.fields[s.id]||{};return `<div class="item ${F.landings?'done':''}"><span><b>${s.name}</b><span class="d">${F.landings?F.landings+' landing'+(F.landings>1?'s':''):'Not visited yet'}</span></span><span class="r">${F.best?stars(F.best):''}</span></div>`;}).join('');
  const ppl=Object.keys(CHARS).map(id=>log.met[id]?`<div class="item done"><span style="display:flex;gap:10px;align-items:center"><img src="${portrait(id)}" alt="" style="width:40px;height:40px;image-rendering:pixelated"><span><b>${CHARS[id].name}</b><span class="d">${CHARS[id].role}</span></span></span></div>`:`<div class="item"><span><b>???</b><span class="d">Someone you haven't met yet.</span></span></div>`).join('');
  const si=Object.entries(sights).map(([k,v])=>`<div class="item ${log.sights[k]?'done':''}"><span><b>${log.sights[k]?v.name:'???'}</b><span class="d">${log.sights[k]?'Spotted':'Something worth seeing. Fly low and look around.'}</span></span><span class="chk">${log.sights[k]?'✓':''}</span></div>`).join('');
  const go=GOALS.map(g=>`<div class="item ${log.goals[g.id]?'done':''}"><span><b>${g.name}</b><span class="d">${g.hint}</span></span><span class="chk">${log.goals[g.id]?'✓':''}</span></div>`).join('');
  const done=GOALS.filter(g=>log.goals[g.id]).length;
  showCard(`<h2>Your logbook</h2><div class="sub">${log.flights} FLIGHTS · ${log.trips} TRIPS · ${log.stamps} STAMPS · ${done}/${GOALS.length} GOALS</div><h3>PEOPLE</h3><div class="list">${ppl}</div><h3>FIELDS</h3><div class="list">${f}</div><h3>SIGHTS</h3><div class="list">${si}</div><h3>GOALS</h3><div class="list">${go}</div>`,[['Back',back,true]]);}
const SET=[['tilt','Tilt to steer','Turn the phone like a steering wheel to bank. Tip it toward you to raise the nose, away to lower it. CENTER resets the level point. The touch stick still works.'],['steady','Steady wings','Levels the wings when you let go, and handles the rudder.'],['stallGuard','Stall guard','Stops you pulling the nose up far enough to stall.'],
  ['autoTrim','Auto-trim','Holds your current speed when you let go of the stick.'],['tips','Tips','Short pointers the first time things happen.'],
  ['invert','Invert pitch','Drag up to raise the nose instead of down.'],['shadows','Shadows','Long shadows from the sun and moon. Turn off if your phone gets warm.'],['sound','Sound','Engine, wind and the stall horn.']];
function settingsCard(){
  const rows=SET.map(([k,n,d])=>`<div class="tog"><div><b>${n}</b><span>${d}</span></div><button data-k="${k}" class="${settings[k]?'on':''}">${settings[k]?'ON':'OFF'}</button></div>`).join('');
  const px=['chunky','classic','fine'].map(k=>`<button data-px="${k}" class="${settings.pixels===k?'primary':''}">${k.toUpperCase()}</button>`).join('');
  const ev=[['OFF',0],['HUSH',.5],['SOFT',1],['FULL',2]].map(([n,v])=>`<button data-ev="${v}" class="${settings.engVol==v?'primary':''}">${n}</button>`).join('');
  const lt=Object.keys(TOD).map(k=>`<button data-lt="${k}" class="${settings.light===k?'primary':''}">${TOD[k].name.toUpperCase()}</button>`).join('');
  showCard(`<h2>Settings</h2><div class="sub">ASSISTS · TURN THEM OFF ONE AT A TIME AS YOU IMPROVE</div>${rows}<h3>ENGINE VOLUME</h3><div class="btns">${ev}</div><h3>TIME OF DAY</h3><div class="btns">${lt}</div><h3>PIXELS</h3><div class="btns">${px}</div>`,[['Back',back,true]]);
  const cb=$('cardBody');
  cb.querySelectorAll('[data-k]').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.k;if(k==='tilt'){if(!settings.tilt){settings.tilt=true;saveS();enableTilt().then(()=>{updTiltUI();settingsCard();});}else{settings.tilt=false;saveS();disableTilt();updTiltUI();settingsCard();}return;}settings[k]=!settings[k];saveS();if(k==='sound')snd.setOn(settings.sound);settingsCard();}));
  cb.querySelectorAll('[data-px]').forEach(b=>b.addEventListener('click',()=>{settings.pixels=b.dataset.px;pixMode=settings.pixels;saveS();resize();settingsCard();}));
  cb.querySelectorAll('[data-ev]').forEach(b=>b.addEventListener('click',()=>{settings.engVol=+b.dataset.ev;saveS();settingsCard();}));
  cb.querySelectorAll('[data-lt]').forEach(b=>b.addEventListener('click',()=>{settings.light=b.dataset.lt;saveS();setTOD(settings.light);settingsCard();}));}
function showHowTo(){mode='card';
  showCard(`<h2>How to fly</h2><div class="sub">TWO THUMBS</div>
    <div class="rows"><span class="k">LEFT</span><span><b>Throttle (PWR).</b> Slide up for more power. Beside it: the chart (tap for a big one), three switches, flaps and brake.</span><span></span>
    <span class="k">RIGHT</span><span><b>Stick.</b> Touch anywhere on the right and drag. Drag down to raise the nose, up to lower it, sideways to bank and turn.</span><span></span>
    <span class="k">TOP</span><span>Speed on the left, <b>height above the ground</b> on the right. On approach they turn green when you're on the numbers. <b>VIEW</b> switches chase, cockpit and gauges.</span><span></span></div>
    <p>To take off: full power, roll down the runway, and at about 45 knots drag the stick down gently. Everything else is in Bea's logbook.</p>`,[['Got it',()=>{hideModal();mode='fly';if(mail.active&&!log.met.bea)setTimeout(meetBea,300);},true]]);}
function toTitle(){mode='title';spawnQuiet=true;spawnField(STRIPS[0]);spawnQuiet=false;mode='title';$('flightUI').hidden=true;$('title').hidden=false;setView('chase');}
$('tFly').addEventListener('click',()=>{$('title').hidden=true;if(mail.active)spawnField(STRIPS[0]);else offerDay(()=>spawnField(STRIPS[0]));});
$('tPractice').addEventListener('click',()=>{$('title').hidden=true;picker('practice');});
$('tStart').addEventListener('click',()=>{$('title').hidden=true;picker('start');});
$('tBea').addEventListener('click',()=>{$('title').hidden=true;bea(-1);});
$('tLog').addEventListener('click',()=>{$('title').hidden=true;logbook();});
$('tSet').addEventListener('click',()=>{$('title').hidden=true;settingsCard();});
$('rotOk').addEventListener('click',()=>{$('rotate').hidden=true;rotDismissed=true;});
let rotDismissed=false;
function checkRotate(){$('rotate').hidden=rotDismissed||innerWidth>=innerHeight;}

/* ---------- checks each frame ---------- */
let sightT=0,hdgPrev=0,turnRate=0,airT=0,swT=0;
function gameChecks(dt){
  if(ac.ground&&ac.td&&!ac.td.done&&ac.u<.6)finishLanding();
  if(!ac.ground)airT+=dt;else airT=0;
  engine(dt);swT-=dt;if(swT<0){swT=.25;updSwitches();}
  axes();const kt=ac.ias*KT,agl=ac.pos.y-AC.gearH-surfH(ac.pos.x,ac.pos.z),bank=Math.atan2(-_r.y,_u.y);
  if(ac.ground&&ac.throttle>.5&&kt>40&&!ac.td)tip('rotate','Now drag the stick down gently to lift the nose.');
  if(ac.stallWarn)tip('stall','Stall warning: the wing is running out of lift. Lower the nose to gain speed.');
  if(ac.ice>.3)tip('ice','The engine is running rough. That\'s carb ice from flying at low power. Switch CARB HEAT on to melt it.');
  if(ac.lean&&ac.rough>.3)tip('leanlow','Rough running down low with the mixture lean. Set MIX back to RICH.');
  if(!ac.ground&&Math.abs(bank)>20*DEG&&ac.vel.y<-1.5)tip('turn','In a turn, hold the stick a little down (back) to keep from sinking.');
  if(airT>45)tip('pitchpower','Good to know: the stick mostly sets your speed. Power decides whether you climb or descend.');
  let showCheck=false;
  if(dest){const gl=glide(dest);if(!ac.ground&&Math.hypot(dest.x-ac.pos.x,dest.z-ac.pos.z)<5500)tip('gates','See the cyan gates? They show the way in. Start lining up at the first one, 2 km out and about 450 ft up.');
    if(gl.active&&gl.along<3200){showCheck=true;tip('approach','Fly through the three cyan gates. Keep the diamond in the ring at the top of the screen. Flaps down, power back, about 55 knots.');
      if(gl.along<1800)tip('papi','The four lights beside the runway: two white and two red means you\'re on the glide path. All white is too high, all red too low.',3);}
    const st=stripAt(ac.pos.x,ac.pos.z,10);if(st&&!ac.ground&&agl<7&&ac.vel.y<-.5)tip('flare','Just above the runway, ease the stick down (back) to soften the touchdown.');}
  if(ac.ground&&ac.td&&ac.u>8)tip('brake','Hold BRAKE to stop. The longer you hold, the harder it brakes.');
  const ck=$('check');if(showCheck&&camMode!=='panel'){const c=checklistState();const row=(ok,t)=>`<span class="${ok?'ok':''}">${ok?'✓':'○'} ${t}</span><br>`;
    ck.innerHTML=`<b>BEFORE LANDING</b>${row(c.carb,'CARB HEAT ON')}${row(c.mix,'MIXTURE RICH')}${row(c.flaps,'FLAPS 1 OR 2')}${c.needLight?row(c.light,'LANDING LIGHT'):''}`;ck.hidden=false;tip('checklist','Before-landing checklist: tap the switches beside the chart. Bea\'s logbook explains each one.',1);}
  else ck.hidden=true;
  sightT+=dt;if(sightT>.3){sightT=0;
    for(const [k,v] of Object.entries(sights)){if(log.sights[k])continue;if(Math.hypot(ac.pos.x-v.x,ac.pos.z-v.z)<520&&ac.pos.y-v.y<380){log.sights[k]=Date.now();saveL();toast('Spotted: '+v.name,2.5);}}
    if(!ac.ground&&Math.hypot(ac.pos.x-summit.x,ac.pos.z-summit.z)<320&&ac.pos.y>summit.h+10)goal('summit');}
  const hdg=(Math.atan2(_f.x,-_f.z)/DEG+360)%360;let dh=hdg-hdgPrev;if(dh>180)dh-=360;if(dh<-180)dh+=360;hdgPrev=hdg;turnRate=lerp(turnRate,dh/Math.max(dt,1e-3),.1);
}

/* ---------- HUD ---------- */
let hudT=0,hudWasDrawn=true,lastCall=999,callT=0;
function callout(n){const c=$('callout');c.textContent=n;c.hidden=false;callT=1.1;snd.beep(n<=20?880:660);}
function drawHUD(dt){
  axes();const kt=ac.ias*KT,ft=(ac.pos.y-AC.gearH)*FT,fpm=ac.vel.y*196.85,hdg=(Math.atan2(_f.x,-_f.z)/DEG+360)%360;
  const brg=dest?(Math.atan2(dest.x-ac.pos.x,-(dest.z-ac.pos.z))/DEG+360)%360:0;
  hudT-=dt;if(hudT<=0){hudT=.1;
    const agl=Math.max(0,(ac.pos.y-AC.gearH-surfH(ac.pos.x,ac.pos.z))*FT),gl=dest?glide(dest):null,final=!ac.ground&&gl&&gl.active&&gl.along<3500;
    const sinkF=-fpm,spdC=ac.stallWarn?'warn':!final?'':kt>=50&&kt<=62?'ok':(kt>=45&&kt<=75)?'caution':'warn';
    const vC=!final?'':agl<30?(sinkF<300?'ok':sinkF<500?'caution':'bad'):(sinkF>=200&&sinkF<=600?'ok':sinkF<=800&&sinkF>=0?'caution':sinkF<0?'caution':'bad');
    const sp=$('spd');sp.innerHTML=`${Math.round(kt)}<small>KT${final?' · AIM 55':''}</small>`;sp.className='pill '+spdC;
    $('alt').innerHTML=`${agl<100?Math.round(agl):Math.round(agl/10)*10}<small>FT UP</small><span id="vsi" class="${vC}">${Math.abs(fpm)<50?'· 0':(fpm>0?'▲ ':'▼ ')+Math.round(Math.abs(fpm)/10)*10}${final?' <small>AIM ▼400</small>':''}</span>`;
    if(final||(!ac.ground&&stripAt(ac.pos.x,ac.pos.z,60))){for(const c of [100,50,30,20,10]){if(agl<c&&lastCall>c){lastCall=c;callout(c);break;}}}
    if(agl>160||ac.ground)lastCall=999;
    if(dest){const d=Math.hypot(dest.x-ac.pos.x,dest.z-ac.pos.z);$('destTxt').textContent=`${dest.name} ${d<1000?Math.round(d/10)*10+' m':(d/1000).toFixed(1)+' km'}`;$('arr').style.transform=`rotate(${brg-hdg}deg)`;}}
  $('stallBan').hidden=!(ac.stallWarn&&mode==='fly');
  if(mode==='fly')drawMiniMap(dt);
  if(camMode==='chase'||mode==='title'){pb.clear();if(mode==='fly'&&approachMeter()){pb.flush();hudWasDrawn=true;}else if(hudWasDrawn){pb.flush();hudWasDrawn=false;}return;}
  hudWasDrawn=true;const bank=Math.atan2(-_r.y,_u.y),pitch=Math.asin(clamp(_f.y,-1,1));
  const panel=camMode==='panel';
  drawCockpit({kt,bank,pitch,ft,turn:turnRate,slip:clamp(ac.beta*4,-1,1),hdg,brg,fpm,panel,extra:()=>drawExtras(panel)});
}
function approachMeter(){
  if(!dest||ac.ground||mode!=='fly'||camMode==='panel')return false;
  const gl=glide(dest),agl=(ac.pos.y-AC.gearH-surfH(ac.pos.x,ac.pos.z))*FT,over=stripAt(ac.pos.x,ac.pos.z,25);
  const w=LW,h=LH,S=Math.max(16,Math.min(Math.round(h*.12),28)),cx=Math.round(w/2),cy=Math.round(h*.3),K=rgba(0x241c2e);
  const txt=(t,x,y,c,left)=>{pb.text(t,x+1,y+1,K,1,!left);pb.text(t,x,y,c,1,!left);};
  if(agl<38&&(over||(gl.active&&gl.along<350))){
    // FLARE: nose angle and sink rate, each with a green target band
    axes();const pitch=Math.asin(clamp(_f.y,-1,1))/DEG,sink=-ac.vel.y*196.85,bw=S*3,x0=cx-Math.round(bw/2),y0=cy-8;
    const bar=(y,lo,hi,g0,g1,v,lab,ok)=>{const X=t=>x0+Math.round((t-lo)/(hi-lo)*bw);pb.rect(x0-1,y-1,bw+2,6,K);pb.rect(x0,y,bw,4,C.face);pb.rect(X(g0),y,X(g1)-X(g0),4,C.green);
      const vx=clamp(X(v),x0,x0+bw-2);pb.rect(vx-2,y-3,5,10,K);pb.rect(vx-1,y-2,3,8,ok?C.white:C.orange);txt(lab,x0-19,y,C.tick,true);};
    const pOk=pitch>=2&&pitch<=8,sOk=sink<300;
    txt(pOk&&sOk?'FLARE · GOOD':'FLARE',cx,y0-12,pOk&&sOk?C.green:C.tick);
    bar(y0,-6,16,2,8,pitch,'NOSE',pOk);bar(y0+14,0,900,0,300,sink,'SINK',sOk);return true;}
  if(!gl.active||gl.along>3600)return false;
  // LINE UP: corner brackets, a ring for "on path", and a diamond showing where the path is. Fly toward the diamond.
  const brk=(sx,sy)=>{pb.rect(cx+sx*S-(sx>0?5:0),cy+sy*S,6,1,K);pb.rect(cx+sx*S-(sx>0?5:0),cy+sy*S-1,6,1,C.tick);pb.rect(cx+sx*S,cy+sy*S-(sy>0?5:0),1,6,C.tick);};
  brk(-1,-1);brk(1,-1);brk(-1,1);brk(1,1);
  const tx=clamp(-gl.lat/(5*DEG),-1,1),ty=clamp((gl.v/DEG-4)/1.5,-1,1),on=Math.abs(tx)<.25&&Math.abs(ty)<.25,rr=Math.max(4,Math.round(S*.28));
  for(let a=0;a<48;a++){const t=a/48*TAU,px=cx+Math.cos(t)*rr,py=cy+Math.sin(t)*rr;pb.px(px+1,py+1,K);pb.px(px,py,on?C.green:C.tick);}
  const mx=Math.round(cx+tx*(S-3)),my=Math.round(cy+ty*(S-3)),dc=on?C.green:C.cyan;
  for(let d=0;d<=3;d++){pb.rect(mx-4+d,my-d-1,9-2*d,1,K);pb.rect(mx-4+d,my+d+1,9-2*d,1,K);}
  for(let d=0;d<=2;d++){pb.rect(mx-3+d,my-d,7-2*d,1,dc);pb.rect(mx-3+d,my+d,7-2*d,1,dc);}
  txt(on?'ON PATH':ty>.25?'TOO HIGH':ty<-.25?'TOO LOW':tx<0?'STEER LEFT':'STEER RIGHT',cx,cy-S-9,on?C.green:C.tick);
  txt((gl.along/1000).toFixed(1)+' KM',cx,cy+S+4,C.tick);
  return true;}
function glideBox(bx,by,hs){
  pb.rect(bx-hs-2,by-hs-2,hs*2+4,hs*2+4,C.bezel);pb.rect(bx-hs,by-hs,hs*2,hs*2,C.face);
  for(let k=-2;k<=2;k++){pb.px(bx+k*hs/2.5,by,C.dim);pb.px(bx,by+k*hs/2.5,C.dim);}
  const gl=dest?glide(dest):{active:false};
  if(gl.active){const nx=bx+clamp(-gl.lat/(5*DEG),-1,1)*(hs-2),ny=by+clamp((gl.v/DEG-4)/1.5,-1,1)*(hs-2);
    pb.rect(Math.round(nx),by-hs+1,1,hs*2-2,C.cyan);pb.rect(Math.round(nx)+1,by-hs+1,1,hs*2-2,C.cyan);
    pb.rect(bx-hs+1,Math.round(ny),hs*2-2,1,C.cyan);pb.rect(bx-hs+1,Math.round(ny)+1,hs*2-2,1,C.cyan);
    if(hs>14)pb.text((gl.along/1000).toFixed(1),bx,by-hs+3,C.tick,1,true);}
  else pb.text('--',bx,by-2,C.dim,1,true);
}
function drawExtras(panel){
  const w=LW,h=LH;
  if(panel){const L=panelLayout,lab=['SPEED','ATTITUDE','ALTITUDE','TURN','HEADING','CLIMB'];L.forEach((g,i)=>{if(g.y+g.r+9<h)pb.text(lab[i],g.x,g.y+g.r+4,C.dim,1,true);});
    const bx=Math.round(w*.88),by=Math.round(h*.56),hs=Math.round(Math.min(w*.09,h*.22));glideBox(bx,by,hs);pb.text('GLIDE',bx,by+hs+4,C.dim,1,true);
    const tx=bx-hs,ty=Math.round(h*.18);pb.text('PWR',tx,ty-7,C.dim);pb.rect(tx,ty,hs*2,4,C.bezel);pb.rect(tx,ty,Math.round(hs*2*ac.throttle),4,C.orange);
    pb.text('FLAPS '+ac.flaps,tx,ty+8,C.dim);if(ac.stallWarn)pb.text('STALL',tx,ty+16,C.red);}
  else if(glideCock){approachMeter();const g=glideCock;glideBox(g.x,g.y,g.r);
    const T=tachCock;if(T){gaugeBase(T);const rA=v=>(-135+clamp(v,0,3000)/3000*270)*DEG;band(T,rA(2100),rA(2550),C.green);ticks(T,rA(0),rA(3000),6,2,C.tick);
      const rpm=600+ac.rpm*1950;needle(T,rA(rpm),T.r-3,C.needle);if(T.r>15)pb.text('RPM',T.x,T.y+Math.round(T.r*.35),C.dim,1,true);}
    if(ac.stallWarn)pb.text('STALL',(gaugeLayout[1].x+glideCock.x)>>1,gaugeLayout[0].y-gaugeLayout[0].r-12,C.red,2,true);}
}

/* ---------- camera & visuals ---------- */
const camPos=new V3(),_c1=new V3(),_c2=new V3(),_c3=new V3(),tiltQ=new Q().setFromAxisAngle(new V3(1,0,0),-12*DEG);
function updateCam(dt,t){
  axes();
  if(mode==='title'){const a=t*.1,p=ac.pos;camera.position.set(p.x+Math.cos(a)*24,p.y+4.5,p.z+Math.sin(a)*24);camera.up.set(0,1,0);camera.lookAt(p.x,p.y+.5,p.z);return;}
  const outside=camMode==='chase'||mode==='crashed';
  if(outside){
    const bf=_c1.copy(_f);bf.y*=.4;if(bf.lengthSq()<.01)bf.set(0,0,-1);bf.normalize();
    const des=_c2.copy(ac.pos).addScaledVector(bf,-15).add(_c3.set(0,4.2,0));
    const gh=surfH(des.x,des.z)+2;if(des.y<gh)des.y=gh;
    if(snapCam){camPos.copy(des);snapCam=false;}else camPos.lerp(des,1-Math.exp(-dt*4));
    camera.position.copy(camPos);
    if(ac.ground&&ac.u>4){const st=stripAt(ac.pos.x,ac.pos.z);if(!st||st.surf!=='paved')camera.position.y+=(hash2((t*30)|0,1,9)-.5)*.06*Math.min(ac.u/15,1);}
    camera.up.set(0,1,0).lerp(_u,.22).normalize();camera.lookAt(_c3.copy(ac.pos).addScaledVector(_f,6).add(_c2.set(0,1.2,0)));
  } else {
    camera.position.copy(ac.pos).add(_c1.set(0,.5,-.85).applyQuaternion(ac.q));camera.quaternion.copy(ac.q).multiply(tiltQ);
    if((ac.stall&&!ac.ground)||ac.rough>.3){camera.position.x+=(hash2((t*40)|0,3,3)-.5)*.04;}
  }
}
const _sc=new V3(),_lr=new V3(),_lu=new V3(),_wy=new V3(0,1,0);
function snapShadow(c){_lr.crossVectors(_wy,sunDir);if(_lr.lengthSq()<1e-5)_lr.set(1,0,0);_lr.normalize();_lu.crossVectors(sunDir,_lr).normalize();
  const tx=2*SHADOW_HALF/sunL.shadow.mapSize.x,a=c.dot(_lr),b=c.dot(_lu);c.addScaledVector(_lr,Math.round(a/tx)*tx-a).addScaledVector(_lu,Math.round(b/tx)*tx-b);}
function sunBlocked(p){const hl=Math.hypot(sunDir.x,sunDir.z);if(sunDir.y<=0||hl<1e-3)return false;const ux=sunDir.x/hl,uz=sunDir.z/hl,tan=sunDir.y/hl;
  for(let k=1;k<110;k++){const d=k*30,ray=p.y+d*tan;if(ray>720)return false;if(groundH(p.x+ux*d,p.z+uz*d)>ray)return true;}return false;}
let litT=0,planeTarget=1;
function updateVisuals(dt,t){
  plane.position.copy(ac.pos);plane.quaternion.copy(ac.q);
  litT-=dt;if(litT<=0){litT=.15;planeTarget=sunBlocked(ac.pos)?0:1;}planeLit.value=lerp(planeLit.value,planeTarget,1-Math.exp(-dt*6));
  const outside=camMode==='chase'||(mode!=='fly'&&mode!=='paused');
  const U=plane.userData;U.bodyM.visible=outside;U.blades.visible=outside;
  const running=mode!=='crashed';ac.rpm=lerp(ac.rpm,running?.22+ac.throttle*ac.pf*.78+Math.min(ac.ias/60,.3):0,1-Math.exp(-dt*3));
  ac.prop+=ac.rpm*60*dt;U.blades.rotation.z=ac.prop;U.disc.material.opacity=running?.06+ac.rpm*.2:0;
  const gh=surfH(ac.pos.x,ac.pos.z),agl=ac.pos.y-AC.gearH-gh;
  blob.visible=!settings.shadows&&mode!=='crashed';blob.position.set(ac.pos.x,gh+.3,ac.pos.z);blob.rotation.y=Math.atan2(-_f.x,-_f.z);blob.scale.set(4.8,1,3.4);blob.material.opacity=.32*clamp(1-agl/70,0,1);
  if(dest){beacon.visible=mode==='fly'||mode==='paused';beacon.position.set(dest.x,dest.elev,dest.z);const d=Math.hypot(dest.x-ac.pos.x,dest.z-ac.pos.z);beacon.material.opacity=.13*smooth(500,1600,d);}
  spot.intensity=ac.light&&mode!=='title'?(TOD[tod].lights>0?2.4:.6):0;
  updPAPI();updGates();updRings(dt,t);
  {const fb=(camMode==='chase'?58:70)+(ac.bst||0)*9;if(Math.abs(camera.fov-fb)>.05){camera.fov=fb;camera.updateProjectionMatrix();}}
  sunL.castShadow=settings.shadows;const fo=mode==='title'?ac.pos:camera.position;
  axes();_sc.set(fo.x+_f.x*SHADOW_HALF*.5,surfH(fo.x,fo.z),fo.z+_f.z*SHADOW_HALF*.5);snapShadow(_sc);sunL.target.position.copy(_sc);sunL.position.copy(_sc).addScaledVector(sunDir,1500);
  if(mode==='crashed'){crashT+=dt;smokeBurst.forEach(m=>{m.position.y+=dt*m.userData.v*1.5;m.scale.setScalar(Math.min(.5+crashT*m.userData.v*1.5,6));});}
  snd.update(ac.rpm,ac.ias+(ac.bst||0)*22,ac.stallWarn,mode==='fly',ac.rough);
}

/* ---------- main loop ---------- */
let acc=0,last=performance.now();
function loop(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;const t=now/1000;
  skyMat.uniforms.uTime.value=t;waterMat.uniforms.uTime.value=t;for(const a of anims)a(t);
  cloudGroup.position.set((t*2.2)%400,0,-(t*.8)%400);
  if(mode==='fly'){readInput(dt);acc+=dt;const H_=1/120;let n=0;while(acc>=H_&&n<10){if(ac.ground)stepGround(H_);else{stepAir(H_);stepBoost(H_);}simT+=H_;acc-=H_;n++;if(mode!=='fly')break;}if(n>=10)acc=0;
    if(mode==='fly')gameChecks(dt);runTips(dt);}
  else acc=0;
  if(toastT>0){toastT-=dt;if(toastT<=0)$('toast').hidden=true;}
  if(callT>0){callT-=dt;if(callT<=0)$('callout').hidden=true;}
  updateVisuals(dt,t);updateCam(dt,t);sky.position.copy(camera.position);
  renderer.setRenderTarget(rt);renderer.render(scene,camera);renderer.setRenderTarget(null);renderer.render(postScene,postCam);
  drawHUD(dt);
  requestAnimationFrame(loop);
}
addEventListener('resize',()=>{resize();setThrottleUI();placeRingIdle();checkRotate();});
pixMode=settings.pixels;resize();setTOD(settings.light);toTitle();placeRingIdle();checkRotate();refreshBag();
const ld=$('load');if(ld)ld.hidden=true;
requestAnimationFrame(loop);
