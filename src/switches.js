/* ---------- the fun switches: things you flick that change the world around you ----------
   MIC          pilot-controlled runway lights, like real quiet airfields: key the mic 3 times fast for low, 5 for medium,
                7 for bright. The nearest field's edge lights come on, running down the runway, for 15 minutes.
   SMOKE        airshow smoke: a white trail that hangs in the air and drifts with the wind, so you can draw in the sky.
   SEARCHLIGHT  a narrow sBeam under the nose that swings into your turns (and drifts gently side to side),
                so banking paints it across the ground.
   FLOATS       a red pull handle. Two inflatable floats pop out like a life raft and you can land on the water. */

/* ---- runway lights ---- */
const RWY={};
for(const s of STRIPS){const L=RWY_L[s.id];if(!L)continue;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(L.p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(L.c,3));
  const m=new THREE.Points(g,new THREE.PointsMaterial({size:2,sizeAttenuation:false,vertexColors:true,fog:false}));m.frustumCulled=false;m.visible=false;g.setDrawRange(0,0);scene.add(m);
  RWY[s.id]={m,n:L.p.length/3,on:0,until:0,level:0};}
const RWY_ON=900,LEVELS=['','LOW','MEDIUM','HIGH'];
function rwyLit(s){const r=s&&RWY[s.id];return !!r&&r.level>0;}
function lightStrip(s,level,quiet){const r=RWY[s.id];if(!r)return;const was=r.level;r.level=Math.max(level,1);r.until=simT+RWY_ON;if(!was)r.on=0;
  r.m.material.size=r.level>=3?3:2;r.m.material.color.setScalar(1);if(!quiet){snd.clunk();toast(`${s.name}: runway lights ${LEVELS[r.level]}. They stay on for 15 minutes.`,2.6);}}
let micN=0,micT=0;
function keyMic(){if(mode!=='fly')return;micN++;micT=1.6;snd.squelch();updMicUI();}
function micDone(){const n=micN;micN=0;updMicUI();if(n<3)return;const lvl=n>=7?3:n>=5?2:1;
  const near=STRIPS.reduce((a,s)=>Math.hypot(s.x-ac.pos.x,s.z-ac.pos.z)<Math.hypot(a.x-ac.pos.x,a.z-ac.pos.z)?s:a);
  if(Math.hypot(near.x-ac.pos.x,near.z-ac.pos.z)>12000){toast('Nothing answers. No airfield in radio range.',2);return;}
  lightStrip(near,lvl);if(TOD[tod].lights<=0)tip('micday','The runway lights are on, but you\'ll only really see them from sunset on.');}
function updMicUI(){const b=$('micBtn');if(b)b.querySelector('em').textContent=micN?'●'.repeat(Math.min(micN,7)):'×3';}
function updRunwayLights(dt){const dark=TOD[tod].lights>0;
  if(micT>0){micT-=dt;if(micT<=0)micDone();}
  for(const s of STRIPS){const r=RWY[s.id];if(!r)continue;if(r.level&&simT>r.until)r.level=0;
    const want=r.level&&dark;r.on=want?Math.min(1,r.on+dt/.8):0;r.m.visible=want;if(want)r.m.geometry.setDrawRange(0,Math.ceil(r.n*r.on));}
  if(dark&&mode==='fly'&&!ac.ground&&dest&&!rwyLit(dest)&&Math.hypot(dest.x-ac.pos.x,dest.z-ac.pos.z)<5000)
    tip('pcl','Dark runway? Little airfields have pilot-controlled lights. Tap MIC three times quickly (five for brighter, seven for brightest) and the nearest runway lights up.');}

/* ---- smoke trail ---- */
const SMOKE_N=520,SMOKE_LIFE=42,SMOKE_EVERY=.08;let smokeOn=false,smokeAcc=0,smokeI=0;
const smokeTrail=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,0),new THREE.MeshLambertMaterial({color:0xf4f0ea}),SMOKE_N);smokeTrail.frustumCulled=false;scene.add(smokeTrail);
const SMK=Array.from({length:SMOKE_N},()=>({t:-1,p:new V3(),v:new V3(),r:Math.random()*TAU}));
const _tail=new V3(),_tm=new THREE.Matrix4(),_tq=new THREE.Quaternion(),_ts=new V3();
for(let i=0;i<SMOKE_N;i++)smokeTrail.setMatrixAt(i,_tm.makeScale(0,0,0));
function updSmoke(dt){
  if(smokeOn&&mode==='fly'&&!ac.ground&&ac.ias>10){smokeAcc+=dt;while(smokeAcc>=SMOKE_EVERY){smokeAcc-=SMOKE_EVERY;const q=SMK[smokeI];smokeI=(smokeI+1)%SMOKE_N;
    q.t=0;q.p.copy(_tail.set(0,.2,4.8).applyQuaternion(ac.q).add(ac.pos)).addScaledVector(ac.vel,-smokeAcc);q.v.copy(WIND).multiplyScalar(.6);q.v.y=.25;}}
  let any=false;
  for(let i=0;i<SMOKE_N;i++){const q=SMK[i];if(q.t<0)continue;any=true;q.t+=dt;if(q.t>SMOKE_LIFE){q.t=-1;smokeTrail.setMatrixAt(i,_tm.makeScale(0,0,0));continue;}
    q.p.addScaledVector(q.v,dt);const u=q.t/SMOKE_LIFE,sc=(.9+Math.sqrt(q.t)*1.1)*(u>.85?(1-u)/.15:1);
    _tq.setFromAxisAngle(_wy,q.r+q.t*.1);smokeTrail.setMatrixAt(i,_tm.compose(q.p,_tq,_ts.setScalar(sc)));}
  if(any)smokeTrail.instanceMatrix.needsUpdate=true;}

/* ---- searchlight ---- */
let searchOn=false;
const sLight=new THREE.SpotLight(0xf4f6ff,0,1100,.075,.35,1);sLight.position.set(0,-.6,-1.5);plane.add(sLight);const sTarget=new THREE.Object3D();scene.add(sTarget);sLight.target=sTarget;
const beamGeo=new THREE.ConeGeometry(Math.tan(.075),1,14,1,true).translate(0,-.5,0);
const sBeam=new THREE.Mesh(beamGeo,new THREE.MeshBasicMaterial({color:0xe8eeff,transparent:true,opacity:.08,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));sBeam.visible=false;sBeam.renderOrder=5;scene.add(sBeam);
const _so=new V3(),_sd=new V3(),_sh=new V3(),_srt=new V3(),_down=new V3(0,-1,0);let sweepT=0;
function updSearch(dt){const on=searchOn&&mode!=='title';sLight.intensity=on?(TOD[tod].lights>0?3.2:.6):0;sBeam.visible=on&&TOD[tod].lights>0;if(!on)return;
  axes();sweepT+=dt;const bank=ac.ground?0:Math.atan2(-_r.y,_u.y);
  _sh.set(_f.x,0,_f.z);if(_sh.lengthSq()<1e-4)_sh.set(0,0,-1);_sh.normalize();_srt.set(-_sh.z,0,_sh.x);
  const side=clamp(bank*2.2,-1.3,1.3)+Math.sin(sweepT*.45)*.3;
  _sd.copy(_sh).multiplyScalar(1).addScaledVector(_down,ac.ground?.08:.75).addScaledVector(_srt,side).normalize();
  const o=_so.copy(sLight.position);plane.localToWorld(o);let L=900;for(let d=20;d<900;d+=15){const x=o.x+_sd.x*d,y=o.y+_sd.y*d,z=o.z+_sd.z*d;if(y<surfH(x,z)){L=d;break;}}
  sTarget.position.copy(o).addScaledVector(_sd,L);sTarget.updateMatrixWorld();
  sBeam.position.copy(o);sBeam.quaternion.setFromUnitVectors(_down,_sd);sBeam.scale.set(L,L,L);sBeam.material.opacity=.07*TOD[tod].lights;}

/* ---- inflatable floats ---- */
ac.floats=0;let floatsOn=false;
const floatG=new THREE.Group();floatG.visible=false;plane.add(floatG);
{const parts=[];for(const sd of [-1,1]){const x=sd*1.45;
  parts.push({geo:new THREE.CylinderGeometry(.46,.46,4.4,10).rotateX(Math.PI/2),m:M([x,0,-.3]),color:0xf0a03a},
    {geo:new THREE.SphereGeometry(.46,10,6),m:M([x,0,-2.5],[0,0,0],[1,1,1.5]),color:0xf0a03a},{geo:new THREE.SphereGeometry(.46,10,6),m:M([x,0,1.9]),color:0xf0a03a},
    {geo:new THREE.CylinderGeometry(.475,.475,.22,10).rotateX(Math.PI/2),m:M([x,0,-1.2]),color:0xf4efe2},{geo:new THREE.CylinderGeometry(.475,.475,.22,10).rotateX(Math.PI/2),m:M([x,0,.7]),color:0xf4efe2},
    {geo:BOX(.12,.5,.12),m:M([x*.86,.42,.15]),color:0x3a3440},{geo:BOX(.12,.5,.12),m:M([x*.86,.42,-1.9]),color:0x3a3440});}
  const fm=new THREE.Mesh(merge(parts),toon());fm.position.y=-1.8;floatG.add(fm);}
const FLOAT_H=.75;   // how much higher the plane sits on its floats
const floatLift=()=>FLOAT_H*ac.floats;
function setFloats(on){if(on===floatsOn)return;
  if(!on&&ac.ground&&groundH(ac.pos.x,ac.pos.z)<.3){toast('Not while you\'re floating on them!',2);updFunUI();return;}
  floatsOn=on;if(on){snd.hiss();tip('floats','Floats out! You can land on calm water now: same as a runway, gentle and wings level. They add a little drag, so you\'re a touch slower.');}else snd.squelch();updFunUI();}
function updFloats(dt){const tgt=floatsOn?1:0;if(floatsOn)ac.floats=Math.min(1,ac.floats+dt/.7);else ac.floats=Math.max(0,ac.floats-dt/1.8);
  floatG.visible=ac.floats>.01;if(floatG.visible){const u=ac.floats,v=u-1,s=floatsOn?1+2.7*v*v*v+1.7*v*v:u;floatG.scale.set(Math.max(.05,s),Math.max(.05,s),.3+.7*Math.min(1,u*1.5));}}

/* ---- the panel ---- */
function updFunUI(){$('swSearch').classList.toggle('on',searchOn);$('swSmoke').classList.toggle('on',smokeOn);$('swFloat').classList.toggle('on',floatsOn);updMicUI();}
$('swSearch').addEventListener('click',()=>{searchOn=!searchOn;snd.flick();updFunUI();if(searchOn)tip('search','Searchlight on. Bank and it swings into the turn, so you can sweep it across the ground. Best after dark.');});
$('swSmoke').addEventListener('click',()=>{smokeOn=!smokeOn;snd.flick();if(smokeOn)snd.hiss(.5);updFunUI();if(smokeOn)tip('smoke','Smoke on! It hangs in the air for a while, so you can draw loops and letters in the sky.');});
$('swFloat').addEventListener('click',()=>{setFloats(!floatsOn);});
$('micBtn').addEventListener('pointerdown',e=>{e.preventDefault();keyMic();});
function resetSwitches(){smokeOn=false;floatsOn=false;ac.floats=0;floatG.visible=false;micN=0;updFunUI();}
function updSwitchesFx(dt){updRunwayLights(dt);updSmoke(dt);updSearch(dt);updFloats(dt);}
updFunUI();
