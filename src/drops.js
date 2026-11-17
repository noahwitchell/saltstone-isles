
/* ---------- air drops: parcels on little parachutes, onto bullseyes at remote camps ----------
   You carry three parcels and get three more every time you land at a field. Each drop target is a painted
   bullseye with orange smoke going up (so it's easy to spot from altitude) and someone waiting by a tent.
   LOOK DOWN points the camera straight down under the plane, with a crosshair and a dotted ring where the parcel
   would land if you let go now (it falls, the chute opens, then it drifts with the wind). */
const PARCELS=3;let parcelsLeft=PARCELS,lookDown=false;const airParcels=[];log.drops=log.drops||{};
const DROPS=[];const cMesh=(geo,color,o)=>new THREE.Mesh(merge([{geo,m:M([0,0,0]),color}]),toon(o||{}));
(function dropSites(){
  let ds=4242;const r=()=>{ds=(Math.imul(ds,1664525)+1013904223)>>>0;return ds/4294967296;};
  const WHO=[['Shepherd\'s hut','Old Tam the shepherd','Feed for the flock! The ewes thank you, in their way.'],
    ['Birdwatchers\' camp','The birdwatchers','Biscuits and spare batteries. Bless you. Don\'t scare the terns.'],
    ['Painter\'s camp','Ines, painting','Fresh paints! I was down to brown. Everything was turning out brown.'],
    ['Weather post','The weather post','Barometer parts, just in time. Rain by Thursday, probably.'],
    ['Hermit\'s hollow','The hermit','...Thank you. Please don\'t land.'],
    ['Beach camp','The campers','Marshmallows! We were rationing them. It was getting tense.'],
    ['Survey tent','The surveyors','Spare pencils, finally. We\'d been measuring with string.'],
    ['Fishing shack','Old Morag','Line and hooks. Supper is saved.'],
    ['Picnic spot','The picnic party','The cake! We forgot the cake and you brought the cake!'],
    ['Lookout post','The lookout','A flask of tea and yesterday\'s paper. A very good drop.'],
    ['Goat pen','The goatherd','Salt licks. The goats are beside themselves.'],
    ['Stone circle','The archaeologists','A new trowel! Gently, gently, it\'s all very old round here.'],
    ['Bee hives','The beekeeper','New frames for the hives. Mind, they\'re a bit buzzy today.'],
    ['Ranger\'s tent','The ranger','First-aid kit restocked. Not that anyone ever needs it out here.']];
  const keys=Object.keys(ISLES).filter(k=>k!=='ferrow');let wi=0;
  for(const k of keys){const I=ISLES[k],R=Math.min(I.r||700,1200);let best=null;
    for(let n=0;n<400;n++){const a=r()*TAU,rr=Math.sqrt(r())*R*.8,x=I.x+Math.cos(a)*rr,z=I.z+Math.sin(a)*rr,h=groundH(x,z);if(h<5||isleAt(x,z)!==k&&I.r)continue;
      let ok=true,flat=0;for(let q=0;q<10&&ok;q++){const b=q/10*TAU,hh=groundH(x+Math.cos(b)*36,z+Math.sin(b)*36);if(hh<3)ok=false;flat=Math.max(flat,Math.abs(hh-h));}if(!ok||flat>4)continue;
      const ds_=Math.min(...STRIPS.map(s=>Math.hypot(s.x-x,s.z-z)));if(ds_<650)continue;
      if(Object.values(sights).some(s=>Math.hypot(s.x-x,s.z-z)<220))continue;if(FLYGATES.some(g=>Math.hypot(g.x-x,g.z-z)<200))continue;
      const score=ds_-flat*60;if(!best||score>best.score)best={x,z,y:h,score};}
    if(!best)continue;const W=WHO[wi++%WHO.length];DROPS.push({id:'d_'+k,isle:k,x:best.x,z:best.z,y:best.y,name:`${W[0]}, ${I.name}`,who:W[1],line:W[2]});}

  /* bullseye rings draped over the ground, a tent, someone waving, and a column of orange smoke */
  const rings=[],props=[],extras=[];
  const BANDS=[[22,30,0xf6f1e4],[14,22,0xd8463a],[7,14,0xf6f1e4],[.01,7,0xd8463a]];
  const smokeM=new THREE.MeshBasicMaterial({color:0xff7424,transparent:true,opacity:.6,depthWrite:false,fog:false});
  const smokeG=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,0),smokeM,DROPS.length*7);smokeG.renderOrder=3;smokeG.frustumCulled=false;scene.add(smokeG);
  for(const d of DROPS){
    for(const [a,b,c] of BANDS){const g=new THREE.RingGeometry(a,b,28,3).rotateX(-Math.PI/2),p=g.attributes.position;
      for(let i=0;i<p.count;i++){const x=d.x+p.getX(i),z=d.z+p.getZ(i);p.setXYZ(i,x,groundH(x,z)+.35,z);}g.computeVertexNormals();rings.push({geo:g,m:M([0,0,0]),color:c});}
    const items=props,tp=fromA(d,38,.6),th=groundH(tp.x,tp.z);
    items.push({geo:new THREE.ConeGeometry(4,4.4,4),m:M([tp.x,th+2.2,tp.z],[0,.6,0]),color:[0x3f8f8a,0xe2703f,0x8a5a3a,0x5c7fb0][DROPS.indexOf(d)%4]});
    const pp=fromA(d,32,1.1),ph=groundH(pp.x,pp.z);items.push({geo:BOX(.7,1.2,.45),m:M([pp.x,ph+1,pp.z]),color:0x2f4f7a},{geo:BOX(.5,.5,.5),m:M([pp.x,ph+1.9,pp.z]),color:0xf0c7a4});
    for(const s of [-1,1]){const q=fromA(d,31,1.1+s*.2);items.push({geo:BOX(.35,2.6,.35),m:M([q.x,ph+.3,q.z]),color:0x6b4a36});}
    const pole=fromA(d,30,.2),plh=groundH(pole.x,pole.z);items.push({geo:BOX(.3,9,.3),m:M([pole.x,plh+4.5,pole.z]),color:0xf4f0e6});
    d.arm=cMesh(BOX(.25,1.1,.25).translate(0,.5,0),0xf0c7a4);d.arm.position.set(pp.x+.5,ph+1.8,pp.z);extras.push(d.arm);scene.add(d.arm);
    d.flag=cMesh(BOX(2.6,1.5,.12).translate(1.3,0,0),0xd8463a);d.flag.position.set(pole.x,plh+8.1,pole.z);extras.push(d.flag);scene.add(d.flag);
    d.si=DROPS.indexOf(d)*7;}
  const rm=new THREE.Mesh(merge(rings),new THREE.MeshBasicMaterial({vertexColors:true,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));rm.renderOrder=1;scene.add(rm);
  scene.add(shadowy(new THREE.Mesh(merge(props),toon())));
  const _sm=new THREE.Matrix4(),_sq=new THREE.Quaternion(),_ss=new V3(),_sp=new V3();
  anims.push(t=>{const P=camera.position;for(const d of DROPS){const done=!!log.drops[d.id],dd=Math.hypot(P.x-d.x,P.z-d.z),far=dd>9000;
    for(let i=0;i<7;i++){const u=(t*.09+i/7)%1;if(done||far)_ss.setScalar(0);else _ss.setScalar(2+u*9);_sp.set(d.x+Math.sin(t*.4+u*5)*3+u*24*WIND.x/3,d.y+2+u*70,d.z+Math.cos(t*.3+u*4)*3+u*24*WIND.z/3);
      _sq.setFromAxisAngle(_wy,i*1.3+u);smokeG.setMatrixAt(d.si+i,_sm.compose(_sp,_sq,_ss));}
    const near=dd<2500;d.arm.visible=d.flag.visible=near;if(near){d.arm.rotation.z=Math.sin(t*6+d.x)*.7-.4;d.flag.rotation.y=Math.sin(t*2.3+d.z)*.25;}}
    smokeG.instanceMatrix.needsUpdate=true;
    });
  function fromA(d,dist,ang){return {x:d.x+Math.cos(ang)*dist,z:d.z+Math.sin(ang)*dist};}
})();

/* ---- parcels in the air ---- */
const parcelGeo=(()=>{const crate=new THREE.Mesh(merge([{geo:BOX(1,1,1),m:M([0,0,0]),color:0xb07a48},{geo:BOX(1.04,.16,1.04),m:M([0,0,0]),color:0xf4e4c8},{geo:BOX(.16,1.04,1.04),m:M([0,0,0]),color:0xf4e4c8}]),toon());
  const chute=new THREE.Group(),seg=8;for(let i=0;i<seg;i++){const g=new THREE.SphereGeometry(4,2,3,i/seg*TAU,TAU/seg,0,Math.PI/2.2);chute.add(cMesh(g,i%2?0xf6f1e4:0xd8463a,{side:THREE.DoubleSide}));}
  const lines=new THREE.BufferGeometry().setFromPoints([0,1,2,3].flatMap(k=>{const a=k/4*TAU+.4;return [new V3(0,-5.4,0),new V3(Math.cos(a)*3.6,-.8,Math.sin(a)*3.6)];}));
  chute.add(new THREE.LineSegments(lines,new THREE.LineBasicMaterial({color:0x3a3030})));return {crate,chute};})();
function stepParcel(o,dt){o.age+=dt;const v=o.vel;
  if(o.age<.9){v.y-=9.8*dt;v.multiplyScalar(1-.05*dt);}
  else{const k=1-Math.exp(-dt/1.1),kv=1-Math.exp(-dt/.5);v.x+=(WIND.x-v.x)*k;v.z+=(WIND.z-v.z)*k;v.y+=(-6-v.y)*kv;}
  o.pos.addScaledVector(v,dt);}
const _pr={pos:new V3(),vel:new V3(),age:0};
function predictDrop(){_pr.pos.copy(ac.pos).y-=1.2;_pr.vel.copy(ac.vel);_pr.age=0;for(let i=0;i<900;i++){stepParcel(_pr,.06);if(_pr.pos.y<420){const g=Math.max(0,groundH(_pr.pos.x,_pr.pos.z));if(_pr.pos.y<=g+.4){_pr.pos.y=g;return _pr.pos;}}}return _pr.pos;}
function updParcelUI(){const b=$('dropBtn');if(!b)return;b.innerHTML=`DROP<br>${'●'.repeat(parcelsLeft)+'○'.repeat(PARCELS-parcelsLeft)}`;b.classList.toggle('empty',!parcelsLeft);$('lookBtn').classList.toggle('on',lookDown);}
function refillParcels(){if(parcelsLeft<PARCELS){parcelsLeft=PARCELS;updParcelUI();}}
function toggleLook(){if(mode!=='fly')return;if(ac.ground&&!lookDown){toast('Look down works once you\'re in the air.',1.6);return;}lookDown=!lookDown;snapCam=true;if(lookDown){predP.copy(predictDrop());predT=.05;}snd.click();updParcelUI();
  if(lookDown)tip('lookdown','Looking straight down. Up on the screen is the way you\'re flying. The dotted ring is where a parcel would land if you let go now: put it on the bullseye and tap DROP.');}
function doDrop(){if(mode!=='fly')return;if(ac.ground){toast('Get airborne first. Parcels go out of the door in flight.',2);return;}
  if(!parcelsLeft){toast('Out of parcels. Land at any field and Mabel loads three more.',2.4);return;}
  parcelsLeft--;updParcelUI();snd.click();snd.thump(.4);
  const o={pos:ac.pos.clone(),vel:ac.vel.clone(),age:0,crate:parcelGeo.crate.clone(),chute:parcelGeo.chute.clone(),open:0,landed:-1};o.pos.y-=1.2;
  o.chute.scale.setScalar(.01);scene.add(o.crate);scene.add(o.chute);airParcels.push(o);}
function nearestDrop(x,z){let b=null,bd=1e9;for(const d of DROPS){const q=Math.hypot(d.x-x,d.z-z);if(q<bd){bd=q;b=d;}}return {d:b,dist:bd};}
function parcelDown(o,water){const {d,dist}=nearestDrop(o.pos.x,o.pos.z);
  if(water){toast(dist<600?`Splash! ${Math.round(dist)} m off. That one's for the fish.`:'Splash! One parcel for the fish.',2.4);return;}
  if(!d||dist>45){toast(dist<600?`Missed by ${Math.round(dist)} m. Biscuit gives you a look.`:'The parcel lands in the middle of nowhere. A lucky sheep, maybe.',2.4);return;}
  const tier=dist<5?[500,'BULLSEYE!']:dist<12?[300,'Right on the mark!']:dist<24?[150,'On target!']:[60,'Just about in the field.'];
  const st=log.drops[d.id],first=!st;log.drops[d.id]={n:(st?st.n:0)+1,best:Math.min(st?st.best:1e9,dist)};
  let pts=tier[0];if(first){pts+=200;stamp(1);}addScore(pts);saveL();snd.beep(1175);setTimeout(()=>snd.beep(1568),110);if(dist<12)celebrate({x:d.x,y:d.y,z:d.z});
  goal('drop1',true);if(dist<5)goal('bullseye',true);if(DROPS.every(q=>log.drops[q.id]))goal('drops');
  toast(`${tier[0]===500?'BULLSEYE! ':tier[1]+' '}${Math.round(dist)} m · +${pts}${first?' · +1 STAMP':''}\n${first?`${d.who}: "${d.line}"`:d.name}`,first?4:2.6);}
function updDrops(dt){const run=mode==='fly'||mode==='crashed';
  const ui=$('dropUI');if(ui){const show=mode==='fly'&&!ac.ground;if(ui.hidden===show)ui.hidden=!show;}
  if(lookDown&&(ac.ground||mode!=='fly'&&mode!=='paused')){lookDown=false;snapCam=true;updParcelUI();}
  if(mode==='fly'&&!ac.ground){const {d,dist}=nearestDrop(ac.pos.x,ac.pos.z);if(d&&dist<1600)tip('drops',`A drop target! ${d.name}. Fly over it, tap LOOK DOWN (right side) to see below, and DROP when the dotted ring sits on the bullseye. You get three more parcels at every landing.`);}
  if(lookDown){predT-=dt;if(predT<=0){predT=.05;predP.copy(predictDrop());}}else lookSnap=true;
  for(let i=airParcels.length-1;i>=0;i--){const o=airParcels[i];
    if(o.landed<0&&run){const n=Math.max(1,Math.ceil(dt/.02));for(let k=0;k<n;k++){stepParcel(o,dt/n);const g=groundH(o.pos.x,o.pos.z),gy=Math.max(0,g);if(o.pos.y<=gy+.5){o.pos.y=gy+.5;o.landed=0;o.water=g<0;parcelDown(o,o.water);break;}}}
    o.open=lerp(o.open,o.age>.9?1:0,1-Math.exp(-dt*5));o.crate.position.copy(o.pos);o.crate.rotation.y+=dt*(o.landed<0?.8:0);
    if(o.landed<0){o.chute.position.copy(o.pos).y+=5.4*o.open+.5;o.chute.scale.setScalar(Math.max(.01,o.open));o.chute.rotation.z=Math.sin(o.age*2)*.08*o.open;}
    else{o.landed+=dt;if(o.water)o.crate.position.y=-o.landed*.4;o.chute.position.lerp(_c1.set(o.pos.x+WIND.x*2,o.pos.y,o.pos.z+WIND.z*2),1-Math.exp(-dt*1.5));o.chute.scale.y=Math.max(.12,o.chute.scale.y-dt*.8);
      if(o.water)o.chute.position.y=Math.max(-2,o.chute.position.y-dt*.3);
      if(o.landed>45){scene.remove(o.crate);scene.remove(o.chute);airParcels.splice(i,1);}}}}
/* the look-down camera: just under the belly, straight down, with the direction of flight at the top of the screen */
/* it aims at where a parcel let go right now would come down, so the crosshair in the middle of the screen IS the landing spot */
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
  const agl=Math.round(Math.max(0,(ac.pos.y-surfH(ac.pos.x,ac.pos.z))*FT));
  txt('LOOKING DOWN',cx,4,C.tick);txt(`CROSSHAIR IS WHERE IT LANDS - ${agl} FT UP`,cx,12,C.dim);
  const nd=nearestDrop(ac.pos.x,ac.pos.z);
  if(nd.d){const [tx,ty,tv]=scr(nd.d.x,nd.d.y,nd.d.z),inside=tv&&tx>4&&tx<LW-4&&ty>4&&ty<LH-4;
    if(!inside&&nd.dist<6000){const a=Math.atan2(nd.d.x-ac.pos.x,-(nd.d.z-ac.pos.z))-Math.atan2(_f.x,-_f.z),ex=cx+Math.sin(a)*(LW*.42),ey=cy-Math.cos(a)*(LH*.4);
      pb.disc(Math.round(ex),Math.round(ey),3,K);pb.disc(Math.round(ex),Math.round(ey),2,C.orange);txt(nd.dist<1000?Math.round(nd.dist/10)*10+' M':(nd.dist/1000).toFixed(1)+' KM',Math.round(ex),Math.round(ey)+5,C.orange);}
    txt(on?'ON TARGET - DROP NOW':d&&dist<45?`${Math.round(dist)} M OFF`:`TARGET ${nd.dist<1000?Math.round(nd.dist/10)*10+' M':(nd.dist/1000).toFixed(1)+' KM'}`,cx,LH-18,on?C.green:C.tick);}
  txt(`PARCELS ${parcelsLeft}`,cx,LH-10,parcelsLeft?C.tick:C.orange);}
