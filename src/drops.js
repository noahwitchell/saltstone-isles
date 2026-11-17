/* ---------- air drops: parcels on little parachutes, onto bullseyes at remote camps ----------
   Drops are part of the day's mail. When you load the bag, Mabel hands over one to three air-drop parcels for folk
   camped far from any runway. Each camp is put down at a random flat spot on a random outer island, so you get told
   which island and have to keep a lookout for the orange smoke. A camp is only there until its parcel lands or the day ends.
   LOOK DOWN points the camera at where a parcel let go now would come down (crosshair = landing spot).
   The moment a parcel leaves the door you're told whether it's on its way to the rings or going wide; the chute opens
   low, so it's down within a few seconds. A delivered camp cheers, hops, then packs itself away. */
const PARCEL_SPARE=2;let parcelsLeft=0,lookDown=false;const airParcels=[];
if(!log.dropStats)log.dropStats={n:0,bull:0,best:1e9};if(!mail.drops)mail.drops=[];
const DROP_WHO=[['Shepherd\'s hut','Old Tam the shepherd','Sack of sheep feed','Feed for the flock! The ewes thank you, in their way.'],
  ['Birdwatchers\' camp','The birdwatchers','Biscuits and batteries','Biscuits and spare batteries. Bless you. Don\'t scare the terns.'],
  ['Painter\'s camp','Ines, painting','Box of paints','Fresh paints! I was down to brown. Everything was turning out brown.'],
  ['Weather post','The weather post','Barometer parts','Barometer parts, just in time. Rain by Thursday, probably.'],
  ['Hermit\'s hollow','The hermit','Tinned peaches','...Thank you. Please don\'t land.'],
  ['Beach camp','The campers','Marshmallows','Marshmallows! We were rationing them. It was getting tense.'],
  ['Survey tent','The surveyors','Pencils','Spare pencils, finally. We\'d been measuring with string.'],
  ['Fishing shack','Old Morag','Line and hooks','Line and hooks. Supper is saved.'],
  ['Picnic spot','The picnic party','A cake','The cake! We forgot the cake and you brought the cake!'],
  ['Lookout post','The lookout','Tea and a paper','A flask of tea and yesterday\'s paper. A very good drop.'],
  ['Goat pen','The goatherd','Salt licks','Salt licks. The goats are beside themselves.'],
  ['Dig site','The archaeologists','A new trowel','A new trowel! Gently, gently, it\'s all very old round here.'],
  ['Bee hives','The beekeeper','Hive frames','New frames for the hives. Mind, they\'re a bit buzzy today.'],
  ['Ranger\'s tent','The ranger','First-aid kit','First-aid kit restocked. Not that anyone ever needs it out here.'],
  ['Kite camp','The kite club','Spools of string','String! Miles of it! Watch the sky this afternoon.'],
  ['Stargazers\' camp','The stargazers','Star charts','New charts. We\'d been naming the stars ourselves. Badly.']];
const DROP_ISLES=Object.keys(ISLES).filter(k=>k!=='ferrow');
function findDropSpot(k){const I=ISLES[k],R=Math.min(I.r||700,1200);let best=null;
  for(let n=0;n<300;n++){const a=Math.random()*TAU,rr=Math.sqrt(Math.random())*R*.8,x=I.x+Math.cos(a)*rr,z=I.z+Math.sin(a)*rr,h=groundH(x,z);if(h<5||isleAt(x,z)!==k&&I.r)continue;
    let ok=true,flat=0;for(let q=0;q<10&&ok;q++){const b=q/10*TAU,hh=groundH(x+Math.cos(b)*36,z+Math.sin(b)*36);if(hh<3)ok=false;flat=Math.max(flat,Math.abs(hh-h));}if(!ok||flat>4)continue;
    const ds=Math.min(...STRIPS.map(s=>Math.hypot(s.x-x,s.z-z)));if(ds<650)continue;
    if(Object.values(sights).some(s=>Math.hypot(s.x-x,s.z-z)<220))continue;if(FLYGATES.some(g=>Math.hypot(g.x-x,g.z-z)<200))continue;
    const score=Math.min(ds,1500)-flat*60+Math.random()*300;if(!best||score>best.score)best={x,z,y:h,score};}
  return best;}
/* new drops for the day: 1 to 3, each on a different island, each at a fresh random spot */
function spawnDrops(){const n=1+(Math.random()<.55?1:0)+(Math.random()<.3?1:0),isles=DROP_ISLES.slice().sort(()=>Math.random()-.5),who=DROP_WHO.slice().sort(()=>Math.random()-.5),out=[];
  for(const k of isles){if(out.length>=n)break;const p=findDropSpot(k);if(!p)continue;const W=who[out.length];
    const ha=Math.random()*TAU,hr=150+Math.random()*250;
    out.push({isle:k,x:Math.round(p.x),z:Math.round(p.z),y:p.y,place:W[0],who:W[1],item:W[2],line:W[3],hx:Math.round(p.x+Math.cos(ha)*hr),hz:Math.round(p.z+Math.sin(ha)*hr),seen:false,done:false});}
  mail.drops=out;saveL();syncSites();parcelsLeft=parcelCap();updParcelUI();return out;}
function clearDrops(){mail.drops=[];syncSites();parcelsLeft=0;updParcelUI();}
const activeDrops=()=>mail.active?mail.drops.filter(d=>!d.done):[];
const parcelCap=()=>activeDrops().length?activeDrops().length+PARCEL_SPARE:0;
function dropLine(){if(!mail.drops.length)return '';return `<p class="say">“And ${['','one','two','three'][mail.drops.length]} for the air: folk camped out where there's no runway. They go out of the door on a parachute. Look for orange smoke.”</p><p>`+
  mail.drops.map(d=>`<b>${d.item}</b> for ${d.who}, somewhere on ${ISLES[d.isle].name}`).join('<br>')+'</p>';}

/* ---- camp meshes, built when a drop is handed out and removed once it's delivered ---- */
const SITES=new Map();const cMesh=(geo,color,o)=>new THREE.Mesh(merge([{geo,m:M([0,0,0]),color}]),toon(o||{}));
const smokeM=new THREE.MeshBasicMaterial({color:0xff7424,transparent:true,opacity:.6,depthWrite:false,fog:false}),smokeGeo=new THREE.DodecahedronGeometry(1,0);
const ringMat=new THREE.MeshBasicMaterial({vertexColors:true,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
function buildSite(d){const g=new THREE.Group();g.position.set(d.x,d.y,d.z);const rings=[],props=[],L=(x,z)=>groundH(d.x+x,d.z+z)-d.y;
  for(const [a,b,c] of [[22,30,0xf6f1e4],[14,22,0xd8463a],[7,14,0xf6f1e4],[.01,7,0xd8463a]]){const gg=new THREE.RingGeometry(a,b,28,3).rotateX(-Math.PI/2),p=gg.attributes.position;
    for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,L(x,z)+.35);}gg.computeVertexNormals();rings.push({geo:gg,m:M([0,0,0]),color:c});}
  const at=(dist,ang)=>{const x=Math.cos(ang)*dist,z=Math.sin(ang)*dist;return {x,z,y:L(x,z)};},k=(d.x*7+d.z*3)&3;
  const tp=at(38,.6);props.push({geo:new THREE.ConeGeometry(4,4.4,4),m:M([tp.x,tp.y+2.2,tp.z],[0,.6,0]),color:[0x3f8f8a,0xe2703f,0x8a5a3a,0x5c7fb0][k]});
  for(const s of [-1,1]){const q=at(31,1.1+s*.2);props.push({geo:BOX(.35,2.6,.35),m:M([q.x,q.y+.3,q.z]),color:0x6b4a36});}
  const pole=at(30,.2);props.push({geo:BOX(.3,9,.3),m:M([pole.x,pole.y+4.5,pole.z]),color:0xf4f0e6});
  const rm=new THREE.Mesh(merge(rings),ringMat);rm.renderOrder=1;g.add(rm);g.add(shadowy(new THREE.Mesh(merge(props),toon())));
  const pp=at(32,1.1),man=new THREE.Group();man.position.set(pp.x,pp.y,pp.z);
  man.add(new THREE.Mesh(merge([{geo:BOX(.7,1.2,.45),m:M([0,1,0]),color:0x2f4f7a},{geo:BOX(.5,.5,.5),m:M([0,1.9,0]),color:0xf0c7a4},{geo:BOX(.22,.7,.22),m:M([-.18,.2,0]),color:0x3a3040},{geo:BOX(.22,.7,.22),m:M([.18,.2,0]),color:0x3a3040}]),toon()));
  const arm=cMesh(BOX(.25,1.1,.25).translate(0,.5,0),0xf0c7a4);arm.position.set(.5,1.5,0);man.add(arm);g.add(man);
  const flag=cMesh(BOX(2.6,1.5,.12).translate(1.3,0,0),0xd8463a);flag.position.set(pole.x,pole.y+8.1,pole.z);g.add(flag);
  const smoke=new THREE.InstancedMesh(smokeGeo,smokeM,7);smoke.renderOrder=3;smoke.frustumCulled=false;g.add(smoke);
  scene.add(g);return {g,man,arm,flag,smoke,react:-1,ring:rm,y0:pp.y};}
function syncSites(){const want=new Set(activeDrops());for(const [d,s] of SITES){if(!want.has(d)&&s.react<0){scene.remove(s.g);SITES.delete(d);}}
  for(const d of want)if(!SITES.has(d))SITES.set(d,buildSite(d));}
const _sm=new THREE.Matrix4(),_sq=new THREE.Quaternion(),_ss=new V3(),_sp=new V3();
function animSites(t,dt){const P=camera.position;
  for(const [d,s] of SITES){const dd=Math.hypot(P.x-d.x,P.z-d.z),near=dd<2500;let puff=1;
    if(s.react>=0){s.react+=dt;const r=s.react,w=Math.max(0,1-r/2);puff=Math.max(0,1-r/1.2);
      s.man.position.y=s.y0+(r<2?Math.abs(Math.sin(r*9))*1.3:0);s.arm.rotation.z=Math.sin(r*22)*1.1-.6;s.flag.rotation.y+=dt*8;
      s.ring.scale.set(1+.14*Math.sin(r*9)*w,1,1+.14*Math.sin(r*9)*w);
      if(r>2&&!s.popped){s.popped=1;celebrate({x:d.x,y:d.y,z:d.z});snd.beep(1568);}
      const u=clamp((r-2)/.55,0,1);s.g.scale.setScalar(Math.max(.001,1+.25*Math.sin(u*Math.PI)-u));
      if(r>2.6){scene.remove(s.g);SITES.delete(d);continue;}}
    else if(near){s.arm.rotation.z=Math.sin(t*6+d.x)*.7-.4;s.flag.rotation.y=Math.sin(t*2.3+d.z)*.25;}
    for(let i=0;i<7;i++){const u=(t*.09+i/7)%1;_ss.setScalar(dd>9000?0:(2+u*9)*puff);_sp.set(Math.sin(t*.4+u*5)*3+u*24*WIND.x/3,2+u*70,Math.cos(t*.3+u*4)*3+u*24*WIND.z/3);
      _sq.setFromAxisAngle(_wy,i*1.3+u);s.smoke.setMatrixAt(i,_sm.compose(_sp,_sq,_ss));}
    s.smoke.instanceMatrix.needsUpdate=true;
    if(!d.seen&&!d.done&&dd<1500&&mode==='fly'){d.seen=true;saveL();updJob();snd.beep(990);toast(`Orange smoke! ${d.place}: ${d.item} for ${d.who}.`,2.6);}}}

/* ---- parcels in the air ---- */
const parcelGeo=(()=>{const crate=new THREE.Mesh(merge([{geo:BOX(1,1,1),m:M([0,0,0]),color:0xb07a48},{geo:BOX(1.04,.16,1.04),m:M([0,0,0]),color:0xf4e4c8},{geo:BOX(.16,1.04,1.04),m:M([0,0,0]),color:0xf4e4c8}]),toon());
  const chute=new THREE.Group(),seg=8;for(let i=0;i<seg;i++){const g=new THREE.SphereGeometry(4,2,3,i/seg*TAU,TAU/seg,0,Math.PI/2.2);chute.add(cMesh(g,i%2?0xf6f1e4:0xd8463a,{side:THREE.DoubleSide}));}
  const lines=new THREE.BufferGeometry().setFromPoints([0,1,2,3].flatMap(k=>{const a=k/4*TAU+.4;return [new V3(0,-5.4,0),new V3(Math.cos(a)*3.6,-.8,Math.sin(a)*3.6)];}));
  chute.add(new THREE.LineSegments(lines,new THREE.LineBasicMaterial({color:0x3a3030})));return {crate,chute};})();
/* falls free (a little air drag) until it's about 40 m off the ground, then the chute pops and it drifts with the wind */
const CHUTE_AGL=40;
function stepParcel(o,dt){o.age+=dt;const v=o.vel;
  if(!o.chuteOn&&o.age>.6&&o.pos.y-Math.max(0,groundH(o.pos.x,o.pos.z))<CHUTE_AGL)o.chuteOn=true;
  if(!o.chuteOn){v.y-=9.8*dt;const dr=Math.exp(-.35*dt);v.x*=dr;v.z*=dr;v.y*=Math.exp(-.18*dt);}
  else{const k=1-Math.exp(-dt/1.1),kv=1-Math.exp(-dt/.4);v.x+=(WIND.x-v.x)*k;v.z+=(WIND.z-v.z)*k;v.y+=(-7-v.y)*kv;}
  o.pos.addScaledVector(v,dt);}
const _pr={pos:new V3(),vel:new V3(),age:0,chuteOn:false};
function predictDrop(){_pr.pos.copy(ac.pos).y-=1.2;_pr.vel.copy(ac.vel);_pr.age=0;_pr.chuteOn=false;for(let i=0;i<1500;i++){stepParcel(_pr,.04);const g=Math.max(0,groundH(_pr.pos.x,_pr.pos.z));if(_pr.pos.y<=g+.5){_pr.pos.y=g;return _pr.pos;}}return _pr.pos;}
function updParcelUI(){const b=$('dropBtn');if(!b)return;const cap=Math.max(parcelCap(),parcelsLeft);b.innerHTML=`DROP<br>${'●'.repeat(parcelsLeft)+'○'.repeat(Math.max(0,cap-parcelsLeft))}`;b.classList.toggle('empty',!parcelsLeft);$('lookBtn').classList.toggle('on',lookDown);}
function refillParcels(){const c=parcelCap();if(parcelsLeft<c){parcelsLeft=c;updParcelUI();}}
function toggleLook(){if(mode!=='fly')return;if(ac.ground&&!lookDown){toast('Look down works once you\'re in the air.',1.6);return;}lookDown=!lookDown;snapCam=true;if(lookDown){predP.copy(predictDrop());predT=.05;}snd.click();updParcelUI();
  if(lookDown)tip('lookdown','Looking straight down. Up on the screen is the way you\'re flying. The crosshair is where a parcel would land if you let go now: put it on the bullseye and tap DROP.');}
function nearestDrop(x,z){let b=null,bd=1e9;for(const d of activeDrops()){const q=Math.hypot(d.x-x,d.z-z);if(q<bd){bd=q;b=d;}}return {d:b,dist:bd};}
/* where it's going, said the moment it leaves the door, in the pilot's terms (long/short, left/right) */
function dropVerdict(p){const {d,dist}=nearestDrop(p.x,p.z);if(!d||dist>1200)return null;
  const f=_c1.copy(_f);f.y=0;f.normalize();const ox=p.x-d.x,oz=p.z-d.z,along=ox*f.x+oz*f.z,lat=ox*-f.z+oz*f.x;
  if(dist<45)return {good:true,d,dist,txt:dist<8?'Ooh, that looks dead on...':'Looking good. It\'s heading for the rings.'};
  const parts=[];if(Math.abs(along)>20)parts.push(`${Math.round(Math.abs(along)/10)*10} m ${along>0?'long':'short'}`);if(Math.abs(lat)>20)parts.push(`${Math.round(Math.abs(lat)/10)*10} m ${lat>0?'right':'left'}`);
  return {good:false,d,dist,txt:`Going wide: about ${parts.join(' and ')||Math.round(dist)+' m off'}. Circle round for another go.`};}
function doDrop(){if(mode!=='fly')return;if(ac.ground){toast('Get airborne first. Parcels go out of the door in flight.',2);return;}
  if(!activeDrops().length){toast('No air drops in the bag right now.',2);return;}
  if(!parcelsLeft){toast('Out of parcels. Land at any field and they\'ll load more.',2.4);return;}
  parcelsLeft--;updParcelUI();snd.click();snd.thump(.4);
  const o={pos:ac.pos.clone(),vel:ac.vel.clone(),age:0,chuteOn:false,crate:parcelGeo.crate.clone(),chute:parcelGeo.chute.clone(),open:0,landed:-1};o.pos.y-=1.2;
  o.pred=predictDrop().clone();const v=dropVerdict(o.pred);o.verdict=v;if(v)toast(v.txt,v.good?2.2:3.2);
  o.chute.scale.setScalar(.01);scene.add(o.crate);scene.add(o.chute);airParcels.push(o);}
function parcelDown(o,water){const {d,dist}=nearestDrop(o.pos.x,o.pos.z);
  if(water){toast(dist<600?`Splash! ${Math.round(dist)} m off. That one's for the fish.`:'Splash! One parcel for the fish.',2.4);return;}
  if(!d||dist>45){toast(dist<600?`Missed by ${Math.round(dist)} m. Biscuit gives you a look.`:'The parcel lands in the middle of nowhere. A lucky sheep, maybe.',2.4);return;}
  const tier=dist<5?[500,'BULLSEYE!']:dist<12?[300,'Right on the mark!']:dist<24?[150,'On target!']:[60,'Just about in the field.'];
  d.done=true;const S=log.dropStats;S.n++;if(dist<5)S.bull++;S.best=Math.min(S.best,dist);
  const pts=tier[0]+200,coins=dist<5?40:dist<12?30:dist<24?20:10;stamp(1);addScore(pts);addCoins(coins);saveL();snd.beep(1175);setTimeout(()=>snd.beep(1568),110);
  const s=SITES.get(d);if(s)s.react=0;
  goal('drop1',true);if(dist<5)goal('bullseye',true);if(S.n>=10)goal('drops');updJob();
  const left=activeDrops().length;
  toast(`${tier[1]} ${Math.round(dist)} m · +${pts} · +1 STAMP · +${coins} COINS\n${d.who}: "${d.line}"${left?`\n${left} more drop${left>1?'s':''} to go.`:''}`,4);}
function updDrops(dt){const run=mode==='fly'||mode==='crashed';animSites(performance.now()/1000,dt);
  if(lookDown&&(ac.ground||mode!=='fly'&&mode!=='paused')){lookDown=false;snapCam=true;updParcelUI();}
  if(mode==='fly'&&!ac.ground){const {d,dist}=nearestDrop(ac.pos.x,ac.pos.z);if(d&&dist<1600)tip('drops',`There's the smoke! Tap the target button on the left for LOOK DOWN and DROP. Let go when the crosshair sits on the rings, and you'll hear straight away if it's on its way.`);}
  if(lookDown){predT-=dt;if(predT<=0){predT=.05;predP.copy(predictDrop());}}else lookSnap=true;
  for(let i=airParcels.length-1;i>=0;i--){const o=airParcels[i];
    if(o.landed<0&&run){const n=Math.max(1,Math.ceil(dt/.02));for(let k=0;k<n;k++){stepParcel(o,dt/n);const g=groundH(o.pos.x,o.pos.z),gy=Math.max(0,g);if(o.pos.y<=gy+.5){o.pos.y=gy+.5;o.landed=0;o.water=g<0;parcelDown(o,o.water);break;}}}
    o.open=lerp(o.open,o.chuteOn?1:0,1-Math.exp(-dt*7));o.crate.position.copy(o.pos);o.crate.rotation.y+=dt*(o.landed<0?.8:0);
    if(o.landed<0){o.chute.position.copy(o.pos).y+=5.4*o.open+.5;o.chute.scale.setScalar(Math.max(.01,o.open));o.chute.rotation.z=Math.sin(o.age*2)*.08*o.open;}
    else{o.landed+=dt;if(o.water)o.crate.position.y=-o.landed*.4;o.chute.position.lerp(_c1.set(o.pos.x+WIND.x*2,o.pos.y,o.pos.z+WIND.z*2),1-Math.exp(-dt*1.5));o.chute.scale.y=Math.max(.12,o.chute.scale.y-dt*.8);
      if(o.water)o.chute.position.y=Math.max(-2,o.chute.position.y-dt*.3);
      if(o.landed>30){scene.remove(o.crate);scene.remove(o.chute);airParcels.splice(i,1);}}}}
/* the look-down camera: just under the belly, aimed at where a parcel let go now would come down, flight direction up */
const lookAim=new V3();let lookSnap=true;
function lookDownCam(){const f=_c1.copy(_f);f.y=0;if(f.lengthSq()<1e-4)f.set(0,0,-1);f.normalize();
  camera.position.copy(ac.pos).y-=1.6;if(lookSnap||snapCam){lookAim.copy(predP);lookSnap=false;snapCam=false;}else lookAim.lerp(predP,.25);
  camera.up.copy(f);camera.lookAt(lookAim);}
const _pv=new V3();let predT=0;const predP=new V3();
function scr(x,y,z){_pv.set(x,y,z).project(camera);return [(_pv.x+1)/2*LW,(1-_pv.y)/2*LH,_pv.z<1];}

function drawDropSight(dt){const K=rgba(0x241c2e),cx=Math.round(LW/2),cy=Math.round(LH/2),txt=(t,x,y,c)=>{pb.text(t,x+1,y+1,K,1,true);pb.text(t,x,y,c,1,true);};
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){for(let k=6;k<13;k++){pb.px(cx+dx*k+1,cy+dy*k+1,K);pb.px(cx+dx*k,cy+dy*k,C.tick);}}
  const {d,dist}=nearestDrop(predP.x,predP.z),on=d&&dist<12,[px,py,vis]=scr(lookAim.x,lookAim.y,lookAim.z);
  if(vis){const rr=Math.max(3,Math.round(LH*.028)),col=on?C.green:C.cyan;for(let a=0;a<32;a++){if(a%4===3)continue;const t=a/32*TAU,x=px+Math.cos(t)*rr,y=py+Math.sin(t)*rr;pb.px(x+1,y+1,K);pb.px(x,y,col);}pb.rect(Math.round(px),Math.round(py),1,1,col);}
  /* parcels already falling: an X where each one will land, green if it's going onto the rings */
  for(const o of airParcels){if(o.landed>=0||!o.pred)continue;const [qx,qy,qv]=scr(o.pred.x,o.pred.y,o.pred.z);if(!qv)continue;const c=o.verdict&&o.verdict.good?C.green:C.orange;
    for(let k=-2;k<=2;k++){pb.px(qx+k+1,qy+k+1,K);pb.px(qx+k,qy+k,c);pb.px(qx+k+1,qy-k+1,K);pb.px(qx+k,qy-k,c);}}
  const agl=Math.round(Math.max(0,(ac.pos.y-surfH(ac.pos.x,ac.pos.z))*FT));
  txt('LOOKING DOWN',cx,4,C.tick);txt(`CROSSHAIR IS WHERE IT LANDS - ${agl} FT UP`,cx,12,C.dim);
  const nd=nearestDrop(ac.pos.x,ac.pos.z);
  if(nd.d){const [tx,ty,tv]=scr(nd.d.x,nd.d.y,nd.d.z),inside=tv&&tx>4&&tx<LW-4&&ty>4&&ty<LH-4;
    if(!inside&&nd.dist<6000&&nd.d.seen){const a=Math.atan2(nd.d.x-ac.pos.x,-(nd.d.z-ac.pos.z))-Math.atan2(_f.x,-_f.z),ex=cx+Math.sin(a)*(LW*.42),ey=cy-Math.cos(a)*(LH*.4);
      pb.disc(Math.round(ex),Math.round(ey),3,K);pb.disc(Math.round(ex),Math.round(ey),2,C.orange);txt(nd.dist<1000?Math.round(nd.dist/10)*10+' M':(nd.dist/1000).toFixed(1)+' KM',Math.round(ex),Math.round(ey)+5,C.orange);}
    txt(on?'ON TARGET - DROP NOW':d&&dist<45?`${Math.round(dist)} M OFF`:nd.d.seen?`TARGET ${nd.dist<1000?Math.round(nd.dist/10)*10+' M':(nd.dist/1000).toFixed(1)+' KM'}`:'LOOK FOR THE ORANGE SMOKE',cx,LH-18,on?C.green:C.tick);}
  txt(`PARCELS ${parcelsLeft}`,cx,LH-10,parcelsLeft?C.tick:C.orange);}
/* map marks: a dashed "somewhere round here" circle until you've spotted the smoke, then the exact rings.
   P maps world x,z to map pixels; s is how big one map pixel is in the canvas's own units */
function dropMarks(x,P,s){for(const d of activeDrops()){if(d.seen){const [a,b]=P(d.x,d.z);x.setLineDash([]);x.strokeStyle='#241c2e';x.lineWidth=3*s;x.beginPath();x.arc(a,b,4*s,0,TAU);x.stroke();x.strokeStyle='#ff7424';x.lineWidth=1.5*s;x.beginPath();x.arc(a,b,4*s,0,TAU);x.stroke();x.fillStyle='#ff7424';x.fillRect(a-s,b-s,2*s,2*s);}
  else{const [a,b]=P(d.hx,d.hz),[c]=P(d.hx+650,d.hz);x.strokeStyle='#ff7424';x.lineWidth=1.3*s;x.setLineDash([3*s,3*s]);x.beginPath();x.arc(a,b,Math.max(5*s,Math.abs(c-a)),0,TAU);x.stroke();x.setLineDash([]);}}}
syncSites();parcelsLeft=parcelCap();
