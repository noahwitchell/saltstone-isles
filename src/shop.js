/* ---------- coins and Gus's garage ----------
   Delivering mail, air drops, errands, new landmarks and good landings pay a few coins. Spend them at Gus's garage
   (land at Harbor Field) on new planes, parts that change how the plane flies (and how it looks), paint and smoke. */
if(log.coins==null)log.coins=0;
if(!log.shop)log.shop={};const SH=log.shop;
for(const k of ['wind','up','quick','engine','speed','ceiling','wings','pod','guard'])if(SH[k]==null)SH[k]=0;
if(!SH.plane)SH.plane={owned:['cub'],sel:'cub'};
const AC0=Object.assign({},AC);
if(!SH.paint)SH.paint={owned:['classic'],sel:'classic'};if(!SH.smoke)SH.smoke={owned:['white'],sel:'white'};
const COIN_IMG=(()=>{const c=document.createElement('canvas');c.width=c.height=8;const x=c.getContext('2d'),P=(col,a,b,w=1,h=1)=>{x.fillStyle=col;x.fillRect(a,b,w,h);};
  P('#8a5a18',2,0,4,8);P('#8a5a18',0,2,8,4);P('#8a5a18',1,1,6,6);P('#f1c84a',2,1,4,6);P('#f1c84a',1,2,6,4);P('#fff2b0',2,2,2,2);P('#c8902e',4,5,2,1);return c.toDataURL();})();
function coinTag(n){return `<img src="${COIN_IMG}" alt="coins" style="width:12px;height:12px;image-rendering:pixelated;vertical-align:-1px;margin-right:2px">${n.toLocaleString()}`;}
function addCoins(n){if(!n)return;log.coins+=n;saveL();updScore();const e=$('score');if(e){e.classList.remove('pop');void e.offsetWidth;e.classList.add('pop');}}
const UPG=[
  {id:'engine',name:'Engine tune-up',desc:'More power: faster climbs and a little more speed.',max:3,cost:[100,180,280]},
  {id:'speed',name:'Streamlining',desc:'Smoother skin, a finer-pitch prop and wheel spats: a higher top speed.',max:3,cost:[90,170,260]},
  {id:'ceiling',name:'Supercharger',desc:'Keeps the engine breathing in thin air, so you can climb higher.',max:3,cost:[80,160,240],note:()=>`Ceiling now ${Math.round(CEIL*3.28084/100)*100} ft.`},
  {id:'wings',name:'Long wings',desc:'Longer wings: more lift, slower landings, a better climb. You\'ll see them.',max:2,cost:[120,220]},
  {id:'pod',name:'Cargo pod',desc:'A belly pod: one more parcel on every air-drop run.',max:2,cost:[70,150]},
  {id:'guard',name:'Terrain guard',desc:'Watches the ground ahead and pulls you clear before a crash. Level 2 also steers you round rock spires and arches.',max:2,cost:[120,220]},
  {id:'wind',name:'Bigger tailwind tank',desc:'One more tailwind charge.',max:2,cost:[60,140]},
  {id:'up',name:'Bigger updraft tank',desc:'One more updraft charge.',max:2,cost:[50,120]},
  {id:'quick',name:'Quick refill',desc:'Tailwinds and updrafts come back faster.',max:2,cost:[80,160]},
];
/* planes: stats multiply the Puddle Jumper's. pips = speed, climb, agility, gentle landings (1-5) */
const PLANES=[
  {id:'cub',name:'Puddle Jumper',cost:0,desc:'The old faithful. Steady, forgiving, good at everything.',T:1,cd:1,S:1,vp:0,roll:1,pitch:1,mass:1,parcels:0,pips:[3,3,3,4]},
  {id:'bi',name:'Bluebird',cost:250,desc:'A biplane. Slow and floaty, and it rolls and loops like nothing else.',T:.95,cd:1.3,S:1.3,vp:-6,roll:1.6,pitch:1.35,mass:.95,parcels:0,pips:[2,3,5,5]},
  {id:'float',name:'Pelican',cost:350,desc:'A big floatplane. Lands on any calm water and carries two extra parcels for air drops. Gus swears there are sea caves only a floatplane can get into.',T:1.18,cd:1.2,S:1.3,vp:-2,roll:.85,pitch:.9,mass:1.12,parcels:2,floats:true,pips:[2,3,2,4]},
  {id:'racer',name:'Gannet',cost:450,desc:'A low-wing racer. Fast and slippery. It lands hot, so mind your speed.',T:1.3,cd:.68,S:.85,vp:20,roll:1.35,pitch:1.05,mass:1,parcels:0,pips:[5,4,4,2]},
];

const PAINTS=[['classic','Classic',0xf3e7cf,0xd2493c,0],['sky','Sky blue',0xdcecf6,0x2f6fb0,40],['forest','Forest',0xe8e4c8,0x2f6a3a,40],['sunset','Sunset',0xffe2b8,0xe2703f,40],
  ['bumble','Bumblebee',0xf6d24a,0x2c2833,60],['midnight','Midnight',0x2e3550,0xf1c84a,60],['seafoam','Seafoam',0xd4f0e4,0x3f8f8a,40],['rose','Rose',0xf8dce0,0xc2456a,40]];
const SMOKES=[['white','White',[.96,.95,.94],0],['pink','Pink',[1,.72,.82],30],['sky','Sky blue',[.62,.82,1],30],['gold','Gold',[1,.86,.45],30],['mint','Mint',[.66,.95,.8],30],['lilac','Lilac',[.82,.72,1],30]];
const PARK0={body:0xf3e7cf,trim:0xd2493c};
function applyUpgrades(){
  const PL=PLANES.find(p=>p.id===SH.plane.sel)||PLANES[0];
  WIND_N=5+SH.wind;UP_N=5+SH.up;WIND_CD=[5,3.8,2.8][SH.quick];UP_CD=[6,4.6,3.4][SH.quick];windCharges=Math.min(windCharges,WIND_N);if(windWait>WIND_CD)windWait=WIND_CD;upCharges=Math.min(upCharges,UP_N);
  AC.Tmax=AC0.Tmax*PL.T*(1+.09*SH.engine);AC.CD0=AC0.CD0*PL.cd*(1-.08*SH.speed);AC.Vp=AC0.Vp+PL.vp+5*SH.speed;
  AC.S=AC0.S*PL.S*(1+.08*SH.wings);AC.span=AC0.span*(1+.12*SH.wings);AC.Kr=AC0.Kr*PL.roll;AC.Ke=AC0.Ke*PL.pitch;AC.mass=AC0.mass*PL.mass;
  CEIL=[1500,2300,3200,4500][SH.ceiling];PARCEL_SPARE=2+(PL.parcels||0)+SH.pod;PLANE_FLOATS=!!PL.floats;if(!PLANE_FLOATS&&typeof floatsOn!=='undefined'&&floatsOn&&ac.ground)setFloats(false);
  const P=PAINTS.find(p=>p[0]===SH.paint.sel)||PAINTS[0],np=buildPlane({body:P[2],trim:P[3]},{model:PL.id,wingK:1+.12*SH.wings,spats:SH.speed>=1&&PL.id!=='float',pod:SH.pod>0}),U=plane.userData,N_=np.userData;
  U.bodyM.geometry.dispose();U.bodyM.geometry=N_.bodyM.geometry;U.wingM.geometry.dispose();U.wingM.geometry=N_.wingM.geometry;U.blades.position.copy(N_.blades.position);U.disc.position.copy(N_.disc.position);
  const S=SMOKES.find(s=>s[0]===SH.smoke.sel)||SMOKES[0];smokeMat.uniforms.uSmokeC.value.setRGB(...S[2]);
  if(typeof updWindUI==='function')updWindUI();if(typeof updUpUI==='function')updUpUI();if(typeof updFunUI==='function')updFunUI();}
/* terrain guard: looks ahead along your path; if the ground, the sea (without floats), a tree line or (level 2) a rock
   spire is coming, it levels the wings and pulls the nose up. It keeps out of the way when you're lined up to land. */
let guardT=0;
function stepGuard(dt){if(!SH.guard||ac.ground||mode!=='fly')return;const sp=ac.vel.length();if(sp<12)return;
  const agl=ac.pos.y-AC.gearH-surfH(ac.pos.x,ac.pos.z);
  const st=stripAt(ac.pos.x,ac.pos.z,40);if((st||(ac.floats>.9&&groundH(ac.pos.x,ac.pos.z)<.3))&&ac.flaps>=1&&agl<60)return;
  if(dest&&ac.flaps>=1&&Math.hypot(dest.x-ac.pos.x,dest.z-ac.pos.z)<2200&&glide(dest).active)return;
  const T=SH.guard>=2?3.6:2.6;let hit=0,rock=false;
  for(let t=.4;t<=T;t+=.4){const x=ac.pos.x+ac.vel.x*t,y=ac.pos.y+ac.vel.y*t,z=ac.pos.z+ac.vel.z*t;
    if(y-surfH(x,z)<9){hit=t;break;}if(SH.guard>=2&&propHit(x,y,z,6)){hit=t;rock=true;break;}}
  if(!hit){guardT=Math.max(0,guardT-dt);return;}
  const k=Math.min(1,(T-hit+.4)/T)*(SH.guard>=2?1.5:1.1);
  const right=_gR.set(1,0,0).applyQuaternion(ac.q),fwd=_gF.set(0,0,-1).applyQuaternion(ac.q);
  // level the wings, then nose up (or, round a rock, bank away from it)
  let roll=-right.y*2.2;
  if(rock){const side=propHit(ac.pos.x+right.x*25+ac.vel.x,ac.pos.y,ac.pos.z+right.z*25+ac.vel.z,6)?-1:1;roll=side*.7-right.y*1.2;}
  _gQ.setFromAxisAngle(_gA.set(0,0,1),roll*k*dt);ac.q.multiply(_gQ);
  if(!rock||fwd.y<.15){_gQ.setFromAxisAngle(_gA.set(1,0,0),.9*k*dt);ac.q.multiply(_gQ);}
  ac.q.normalize();ac.vel.y+=6*k*dt;
  if(guardT<=0){toast('TERRAIN GUARD: PULL UP',1.2);snd.beep(880);setTimeout(()=>snd.beep(880),140);}guardT=2;}
const _gR=new THREE.Vector3(),_gF=new THREE.Vector3(),_gA=new THREE.Vector3(),_gQ=new THREE.Quaternion();
/* the thin-air nudge: a hint the first time you reach the ceiling on a flight */
let ceilWarn=false;anims.push(()=>{if(mode!=='fly')return;if(ac.pos.y>CEIL+60&&!ceilWarn){ceilWarn=true;toast(SH.ceiling<3?'The air\'s too thin up here for the engine.\nGus\'s supercharger would take you higher.':'Thin air. This is as high as she goes.',2.6);}if(ac.pos.y<CEIL-300)ceilWarn=false;});
/* little 16px pixel pictures of each part and plane, so the shop reads like a parts counter */
const PART_IMG=(()=>{const out={},I='#241c2e';
  const draw=(k,fn)=>{const c=document.createElement('canvas');c.width=c.height=16;const x=c.getContext('2d'),P=(col,a,b,w=1,h=1)=>{x.fillStyle=col;x.fillRect(a,b,w,h);};
    const disc=(cx,cy,r,col)=>{for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++)if(i*i+j*j<=r*r+r*.6)P(col,cx+i,cy+j);};fn(P,disc);out[k]=c.toDataURL();};
  // engine: a finned cylinder head with a spark plug
  draw('engine',(P,d)=>{P(I,3,4,10,10);P('#8a9098',4,5,8,8);for(let y=6;y<12;y+=2)P('#5a6068',4,y,8,1);P(I,6,1,4,3);P('#e8e4d8',7,2,2,1);P('#d2493c',7,0,2,1);P('#c8ccd2',4,5,8,1);P(I,1,8,2,3);P(I,13,8,2,3);});
  // streamlining: a wheel in a teardrop spat
  draw('speed',(P,d)=>{d(8,8,6,I);d(8,8,5,'#d2493c');P('#f08a6a',4,5,5,1);P('#f08a6a',3,6,2,2);P(I,5,12,6,3);d(8,13,2,'#3a3440');P('#8a9098',8,13);P('#ffffff',1,3,3,1);P('#ffffff',0,5,2,1);P('#ffffff',1,10,2,1);});
  // supercharger: a blower housing with an impeller
  draw('ceiling',(P,d)=>{d(8,9,6,I);d(8,9,5,'#8a9098');d(8,9,3,'#5a6068');P('#c8ccd2',8,6,1,3);P('#c8ccd2',9,9,3,1);P('#c8ccd2',5,9,3,1);P('#c8ccd2',8,10,1,3);d(8,9,1,I);P(I,12,1,3,6);P('#8a9098',13,2,1,4);P('#7fb8e8',13,0,1,1);});
  // long wings: a wing seen from above, with an aileron
  draw('wings',(P,d)=>{P(I,0,6,16,5);P('#f3e7cf',1,7,14,3);P('#d2493c',1,7,2,3);P('#d2493c',13,7,2,3);P('#c8b898',4,9,8,1);P(I,6,4,4,9);P('#d2493c',7,5,2,7);});
  // cargo pod: a parcel with string, slung under a belly
  draw('pod',(P,d)=>{P(I,1,1,14,3);P('#f3e7cf',2,2,12,1);P(I,5,4,1,2);P(I,10,4,1,2);P(I,3,6,10,9);P('#c8904a',4,7,8,7);P('#e8b868',4,7,8,1);P('#8a5a28',7,7,2,7);P('#8a5a28',4,10,8,1);});
  // terrain guard: a shield with a mountain and an up arrow
  draw('guard',(P,d)=>{P(I,2,1,12,9);P(I,3,10,10,2);P(I,5,12,6,2);P(I,7,14,2,1);P('#3f8f4a',3,2,10,8);P('#3f8f4a',4,10,8,2);P('#3f8f4a',6,12,4,2);P('#2a6a34',4,9,8,1);P('#2a6a34',6,8,4,1);P('#2a6a34',7,7,2,1);P('#ffffff',7,3,2,4);P('#ffffff',6,4,4,1);P('#ffffff',5,5,1,1);P('#ffffff',10,5,1,1);});
  // tailwind tank: a tank with swirling wind
  draw('wind',(P,d)=>{P(I,4,2,8,13);P('#7fb8e8',5,3,6,11);P('#b8dcf4',5,3,1,11);P(I,6,0,4,2);P('#ffffff',6,6,4,1);P('#ffffff',9,7,1,1);P('#ffffff',7,9,4,1);P('#ffffff',6,10,1,1);P('#ffffff',6,12,3,1);});
  // updraft tank: a tank with an up arrow
  draw('up',(P,d)=>{P(I,4,2,8,13);P('#f1c84a',5,3,6,11);P('#fff2b0',5,3,1,11);P(I,6,0,4,2);P('#ffffff',7,6,2,7);P('#ffffff',6,7,4,1);P('#ffffff',5,8,1,1);P('#ffffff',10,8,1,1);});
  // quick refill: a stopwatch
  draw('quick',(P,d)=>{d(8,9,6,I);d(8,9,5,'#f3e7cf');P(I,7,0,2,2);P(I,6,0,4,1);P(I,13,3,2,2);P(I,8,5,1,5);P(I,8,9,3,1);P('#d2493c',3,6,1,1);P('#d2493c',4,13,1,1);P('#d2493c',12,13,1,1);P('#d2493c',13,6,1,1);});
  // planes, side on
  const side=(k,body,trim,fn)=>draw(k,(P,d)=>{fn(P,d,body,trim);});
  side('cub','#f3e7cf','#d2493c',(P,d,b,t)=>{P(I,1,7,13,4);P(b,2,8,11,2);P(t,2,9,11,1);P(I,3,5,7,2);P(t,3,5,7,1);P('#7fb8e8',9,7,2,1);P(I,0,5,2,4);P(t,0,5,1,3);P(I,14,6,1,6);P('#8a9098',15,7,1,4);P(I,4,11,1,3);P(I,10,11,1,3);P(I,3,13,3,2);P(I,9,13,3,2);});
  side('bi','#dcecf6','#2f6fb0',(P,d,b,t)=>{P(I,2,2,10,2);P(t,2,2,10,1);P(I,2,10,10,2);P(t,2,11,10,1);P(I,4,4,1,6);P(I,9,4,1,6);P(I,1,6,13,4);P(b,2,7,11,2);P('#7fb8e8',8,6,2,1);P(I,0,4,2,4);P(t,0,4,1,3);P(I,14,5,1,6);P('#8a9098',15,6,1,4);P(I,5,12,1,2);P(I,4,13,3,2);});
  side('float','#e8e4c8','#2f6a3a',(P,d,b,t)=>{P(I,1,5,13,4);P(b,2,6,11,2);P(t,2,7,11,1);P(I,3,3,8,2);P(t,3,3,8,1);P('#7fb8e8',9,5,2,1);P(I,0,2,2,5);P(t,0,2,1,4);P(I,14,4,1,6);P('#8a9098',15,5,1,4);P(I,5,9,1,3);P(I,10,9,1,3);P(I,2,12,12,3);P('#f3e7cf',3,12,10,1);P('#4a90b8',0,15,16,1);});
  side('racer','#ffe2b8','#e2703f',(P,d,b,t)=>{P(I,0,6,15,3);P(b,1,7,13,1);P(t,1,8,12,1);P(I,7,5,4,1);P('#7fb8e8',8,5,2,1);P(I,0,3,2,4);P(t,0,3,1,3);P(I,4,9,7,2);P(t,4,9,7,1);P(I,15,5,1,5);P(I,6,11,1,2);P(I,5,12,3,2);});
  return out;})();
const partImg=k=>PART_IMG[k]?`<img src="${PART_IMG[k]}" alt="" style="width:44px;height:44px;image-rendering:pixelated;flex:none;background:#fff8ec;border:2px solid #241c2e;border-radius:4px;padding:2px">`:'';
function shopCard(s,onBack){const meet=!log.met.gus;if(meet){log.met.gus=1;saveL();}
  const row=(name,desc,btn,img)=>`<div class="tog">${img?partImg(img):''}<div style="flex:1"><b>${name}</b><span>${desc}</span></div>${btn}</div>`;
  const buy=(attr,cost,label)=>`<button ${attr} ${log.coins<cost?'disabled style="opacity:.45"':''}>${label||'BUY'} · ${coinTag(cost)}</button>`;
  const ups=UPG.map(u=>{const lv=SH[u.id];return row(`${u.name} <span style="display:inline;font-family:var(--mono);font-size:13px;color:var(--ink2)">${'■'.repeat(lv)+'□'.repeat(u.max-lv)}</span>`,u.desc+(u.note?' '+u.note():''),lv>=u.max?'<button disabled style="opacity:.55">MAXED</button>':buy(`data-up="${u.id}"`,u.cost[lv]),u.id);}).join('');
  const pip=n=>'■'.repeat(n)+'□'.repeat(5-n);
  const planes=PLANES.map(p=>{const own=SH.plane.owned.includes(p.id),sel=SH.plane.sel===p.id;
    const stats=`<span style="display:block;font-family:var(--mono);font-size:13px;color:var(--ink2);line-height:1.3">SPEED ${pip(p.pips[0])} &nbsp;CLIMB ${pip(p.pips[1])}<br>AGILITY ${pip(p.pips[2])} &nbsp;LANDING ${pip(p.pips[3])}</span>`;
    return row(p.name+(sel?' <span style="display:inline;font-size:13px;color:#3f8f4a">FLYING</span>':''),p.desc+stats,sel?'<button disabled style="opacity:.55">IN USE</button>':(own?`<button data-plane="${p.id}">FLY IT</button>`:buy(`data-plane="${p.id}"`,p.cost)),p.id);}).join('');
  const sw=(list,kind)=>list.map(([id,name,a,b,cost])=>{const own=SH[kind].owned.includes(id),sel=SH[kind].sel===id,bg=kind==='paint'?`linear-gradient(135deg,#${a.toString(16).padStart(6,'0')} 55%,#${b.toString(16).padStart(6,'0')} 55%)`:`rgb(${a.map(v=>Math.round(v*255)).join(',')})`,price=kind==='paint'?cost:b;
    return `<button data-${kind}="${id}" style="background:${bg};min-width:96px;padding:6px 8px;font-size:13px;${sel?'outline:3px solid #241c2e;outline-offset:1px;':''}${!own&&log.coins<price?'opacity:.5;':''}"><span style="background:#fff8ecdd;padding:1px 4px">${name}${own?'':' · '+price}</span></button>`;}).join('');
  showCard(`<div class="who"><img src="${portrait('gus')}" alt=""><div><b>Gus's garage</b><span>GUS AMARI · MECHANIC · HARBOR FIELD</span></div></div>
    ${meet?`<p class="say">“${MEET.gus}”</p>`:''}<p class="say">“${['What are we fixing today?','Bring the plane round the back and I\'ll have a look.','Coins in the jar, upgrades on the plane. Simple.'][(log.flights||0)%3]}”</p>
    <div class="sub" style="font-size:16px">YOU HAVE ${coinTag(log.coins)} COINS</div>
    <h3>PLANES</h3>${planes}<h3>PARTS AND UPGRADES</h3>${ups}<h3>PAINT</h3><div class="btns">${sw(PAINTS,'paint')}</div><h3>SMOKE COLOR</h3><div class="btns">${sw(SMOKES,'smoke')}</div>
    <p style="font-size:13px;color:var(--ink2)">Coins come from delivering mail, air drops, errands, new landmarks and good landings.</p>`,
    [['Back',()=>{if(onBack)onBack();else if(s)showCard(`<h2>${s.name}</h2><p>All fixed up.</p>`,[['Take off',()=>spawnField(s),true],['Look around first',()=>{hideModal();mode='fly';}]]);else back();},true]]);
  const B=$('cardBody'),pay=c=>{if(log.coins<c){toast('Not enough coins yet.',1.4);return false;}log.coins-=c;saveL();updScore();snd.beep(1320);setTimeout(()=>snd.beep(1760),90);return true;};
  B.querySelectorAll('[data-up]').forEach(b=>b.addEventListener('click',()=>{const u=UPG.find(q=>q.id===b.dataset.up),lv=SH[u.id];if(lv>=u.max||!pay(u.cost[lv]))return;SH[u.id]++;saveL();applyUpgrades();
    if(u.id==='wind')windCharges=WIND_N;if(u.id==='up')upCharges=UP_N;toast(`${u.name}: fitted.`,1.6);shopCard(s,onBack);}));
  B.querySelectorAll('[data-plane]').forEach(b=>b.addEventListener('click',()=>{const p=PLANES.find(q=>q.id===b.dataset.plane);if(!SH.plane.owned.includes(p.id)){if(!pay(p.cost))return;SH.plane.owned.push(p.id);toast(`The ${p.name} is yours!`,1.8);}
    SH.plane.sel=p.id;saveL();applyUpgrades();snd.click();shopCard(s,onBack);}));
  for(const [kind,list] of [['paint',PAINTS],['smoke',SMOKES]])B.querySelectorAll(`[data-${kind}]`).forEach(b=>b.addEventListener('click',()=>{const it=list.find(q=>q[0]===b.dataset[kind]),own=SH[kind].owned.includes(it[0]),price=kind==='paint'?it[4]:it[3];
    if(!own){if(!pay(price))return;SH[kind].owned.push(it[0]);}SH[kind].sel=it[0];saveL();applyUpgrades();snd.click();shopCard(s,onBack);}));}
applyUpgrades();window.__shopReady=true;updScore();
