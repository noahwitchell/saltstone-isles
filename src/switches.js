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
/* ---- the radio call: press MIC once, you mumble a request through the static, the field mumbles back,
   and the lights come up a step (low, then medium, then bright) ---- */
let micBusy=false;
/* a voice-ish mumble: a buzzy tone through a moving formant filter, chopped into syllables, squeezed through a
   radio-sized band with a bed of static, ending in a squelch tail */
function radioTalk(t0,dur,pitch,stat){const c=snd.ctx;if(!c)return;
  const out=c.createGain();out.gain.value=0;const hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=420;const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2500;
  const sh=c.createWaveShaper(),cv=new Float32Array(256);for(let i=0;i<256;i++){const x=i/128-1;cv[i]=Math.tanh(x*2.2);}sh.curve=cv;
  hp.connect(lp);lp.connect(sh);sh.connect(out);out.connect(snd.master);
  const o=c.createOscillator();o.type='sawtooth';const f1=c.createBiquadFilter();f1.type='bandpass';f1.Q.value=5;const f2=c.createBiquadFilter();f2.type='bandpass';f2.Q.value=6;
  const vg=c.createGain();vg.gain.value=0;o.connect(f1);o.connect(f2);f1.connect(vg);f2.connect(vg);vg.connect(hp);
  const n=c.createBufferSource();n.buffer=snd.buf;n.loop=true;const nb=c.createBiquadFilter();nb.type='bandpass';nb.frequency.value=2200;nb.Q.value=.6;const ng=c.createGain();ng.gain.value=0;n.connect(nb);nb.connect(ng);ng.connect(hp);
  const end=t0+dur;out.gain.setValueAtTime(0,t0);out.gain.linearRampToValueAtTime(.55,t0+.03);out.gain.setValueAtTime(.55,end+.18);out.gain.linearRampToValueAtTime(0,end+.24);
  ng.gain.setValueAtTime(.05*stat,t0);ng.gain.setValueAtTime(.05*stat,end);ng.gain.linearRampToValueAtTime(.4,end+.02);ng.gain.setValueAtTime(.4,end+.16);ng.gain.linearRampToValueAtTime(0,end+.22);
  ng.gain.setValueAtTime(.35,t0);ng.gain.linearRampToValueAtTime(.05*stat,t0+.06);
  let t=t0+.08;while(t<end-.05){const L=.07+Math.random()*.13,amp=Math.random()<.15?.03:.22+Math.random()*.2;
    o.frequency.setValueAtTime(pitch*(.85+Math.random()*.35),t);o.frequency.linearRampToValueAtTime(pitch*(.8+Math.random()*.3),t+L);
    f1.frequency.setValueAtTime(400+Math.random()*500,t);f2.frequency.setValueAtTime(1100+Math.random()*900,t);f1.frequency.linearRampToValueAtTime(400+Math.random()*500,t+L);
    vg.gain.setValueAtTime(0,t);vg.gain.linearRampToValueAtTime(amp,t+L*.3);vg.gain.linearRampToValueAtTime(amp*.6,t+L*.75);vg.gain.linearRampToValueAtTime(0,t+L);
    if(Math.random()<.18)ng.gain.setValueAtTime(.18*stat,t+L*.5),ng.gain.setValueAtTime(.05*stat,t+L*.5+.03);
    t+=L+(Math.random()<.2?.12:.02);}
  o.start(t0);n.start(t0,Math.random());o.stop(end+.3);n.stop(end+.3);}
function keyMic(){if(mode!=='fly'||micBusy)return;
  const near=STRIPS.reduce((a,s)=>Math.hypot(s.x-ac.pos.x,s.z-ac.pos.z)<Math.hypot(a.x-ac.pos.x,a.z-ac.pos.z)?s:a),far=Math.hypot(near.x-ac.pos.x,near.z-ac.pos.z)>12000;
  const r=RWY[near.id],lvl=r?r.level:0,next=Math.min(3,lvl+1);
  micBusy=true;updMicUI();const c=snd.ctx;
  const ask=['lights please, over','could we have the lights a touch brighter','one more notch on the lights, please'][Math.min(lvl,2)];
  toast(`You: "${near.name}, ${lvl>=3?'lights check, over':ask}."`,2);
  if(c){const t=c.currentTime+.05;radioTalk(t,1+Math.random()*.4,105+Math.random()*15,.6);if(!far)radioTalk(t+1.85,1.1+Math.random()*.5,150+Math.random()*25,1.4);}
  setTimeout(()=>{if(far){micBusy=false;updMicUI();toast('Only static comes back. No airfield in radio range.',2.2);return;}},1700);
  if(far)return;
  setTimeout(()=>{toast(`${near.name}: "${lvl>=3?'They\'re all the way up already. Good flying.':['Lights coming on now.','Brighter it is.','Full bright. Enjoy the view.'][next-1]}"`,2.4);},1900);
  setTimeout(()=>{micBusy=false;lightStrip(near,next,true);snd.clunk();updMicUI(near);
    if(TOD[tod].lights<=0)tip('micday','The runway lights are on, but you\'ll only really see them from sunset on.');},3400);}
function updMicUI(){const b=$('micBtn');if(!b)return;const near=STRIPS.reduce((a,s)=>Math.hypot(s.x-ac.pos.x,s.z-ac.pos.z)<Math.hypot(a.x-ac.pos.x,a.z-ac.pos.z)?s:a),r=RWY[near.id],l=r?r.level:0;
  b.querySelector('em').textContent=micBusy?'...':'●'.repeat(l)+'○'.repeat(3-l);b.classList.toggle('talk',micBusy);}
function updRunwayLights(dt){const dark=TOD[tod].lights>0;
  for(const s of STRIPS){const r=RWY[s.id];if(!r)continue;if(r.level&&simT>r.until)r.level=0;
    const want=r.level&&dark;r.on=want?Math.min(1,r.on+dt/.8):0;r.m.visible=want;if(want)r.m.geometry.setDrawRange(0,Math.ceil(r.n*r.on));}
  if(dark&&mode==='fly'&&!ac.ground&&dest&&!rwyLit(dest)&&Math.hypot(dest.x-ac.pos.x,dest.z-ac.pos.z)<5000)
    tip('pcl','Dark runway? Little airfields have pilot-controlled lights. Tap MIC (top right) to call the nearest field and they\'ll switch the runway lights on. Call again for brighter.');}

/* ---- smoke trail ---- */
const SMOKE_N=1600,SMOKE_LIFE=120,SMOKE_EVERY=.075;let smokeOn=false,smokeAcc=0,smokeI=0;
/* light, soft smoke: nearly see-through right behind the plane (so it never blocks your view), thickening to
   solid white with distance, so you see what you've drawn when you turn round and look back */
const smokeMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,
  uniforms:{uSun:{value:sunDir},uTint:{value:1},fogColor:{value:scene.fog.color},fogNear:{value:700},fogFar:{value:5600}},
  vertexShader:`varying float vSh;varying float vD;uniform vec3 uSun;
    void main(){vec4 w=modelMatrix*instanceMatrix*vec4(position,1.);vec3 n=normalize(mat3(modelMatrix*instanceMatrix)*normal);
      vSh=.84+.16*max(dot(n,normalize(uSun)),0.)+.06*n.y;vec4 mv=viewMatrix*w;vD=-mv.z;gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`varying float vSh;varying float vD;uniform float uTint,fogNear,fogFar;uniform vec3 fogColor;
    void main(){float a=mix(.1,.98,smoothstep(14.,130.,vD));vec3 c=vec3(.96,.95,.94)*vSh*uTint;c=mix(c,fogColor,smoothstep(fogNear,fogFar,vD));gl_FragColor=vec4(c,a);}`});
const smokeTrail=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,1),smokeMat,SMOKE_N);smokeTrail.renderOrder=6;smokeTrail.frustumCulled=false;scene.add(smokeTrail);
const SMK=Array.from({length:SMOKE_N},()=>({t:-1,p:new V3(),v:new V3(),r:Math.random()*TAU}));
const _tail=new V3(),_tm=new THREE.Matrix4(),_tq=new THREE.Quaternion(),_ts=new V3();
for(let i=0;i<SMOKE_N;i++)smokeTrail.setMatrixAt(i,_tm.makeScale(0,0,0));
function updSmoke(dt){
  if(smokeOn&&mode==='fly'&&!ac.ground&&ac.ias>10){smokeAcc+=dt;while(smokeAcc>=SMOKE_EVERY){smokeAcc-=SMOKE_EVERY;const q=SMK[smokeI];smokeI=(smokeI+1)%SMOKE_N;
    q.t=0;q.p.copy(_tail.set(0,.2,4.8).applyQuaternion(ac.q).add(ac.pos)).addScaledVector(ac.vel,-smokeAcc);q.v.copy(WIND).multiplyScalar(.3);q.v.y=.12;}}
  let any=false;
  for(let i=0;i<SMOKE_N;i++){const q=SMK[i];if(q.t<0)continue;any=true;q.t+=dt;if(q.t>SMOKE_LIFE){q.t=-1;smokeTrail.setMatrixAt(i,_tm.makeScale(0,0,0));continue;}
    q.p.addScaledVector(q.v,dt);const u=q.t/SMOKE_LIFE,sc=(1.7+Math.min(Math.sqrt(q.t)*1.5,9))*(u>.88?(1-u)/.12:1);
    _tq.setFromAxisAngle(_wy,q.r+q.t*.1);smokeTrail.setMatrixAt(i,_tm.compose(q.p,_tq,_ts.setScalar(sc)));}
  if(any)smokeTrail.instanceMatrix.needsUpdate=true;
  const T=TOD[tod],U=smokeMat.uniforms;U.uTint.value=clamp(T.sunI*.55+T.hemiI*.55,.3,1.05);U.fogNear.value=scene.fog.near;U.fogFar.value=scene.fog.far;}

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
/* ---- the horn: a little double honk. Folk in town, at drop camps, and the errand goats and sheep nearby jump and
   turn to look up at you; Biscuit joins in ---- */
let honkT=-1;const honkers=[];
function honk(){if(mode!=='fly'||(honkT>=0&&honkT<.6))return;snd.honk();honkT=0;honkers.length=0;const P=ac.pos,b=$('hornBtn');b.classList.add('honk');setTimeout(()=>b.classList.remove('honk'),550);
  const near=(x,y,z)=>Math.hypot(x-P.x,z-P.z)<420&&P.y-y<320;
  for(const o of (window.FOLK||[])){o.updateMatrixWorld();const w=o.getWorldPosition(_so);if(near(w.x,w.y,w.z))honkers.push({o,mv:true,ph:Math.random()*.35});}
  for(const set of ['goats','sheep'])for(const f of (FINDS[set]||[]))if(f.obj&&near(f.x,f.y,f.z))honkers.push({o:f.obj,mv:false,y0:f.obj.position.y,ph:Math.random()*.35});
  for(const [d,s] of SITES)if(s.react<0&&near(d.x,d.y,d.z))honkers.push({o:s.man,mv:false,y0:s.man.position.y,ph:.1});
  const people=honkers.length;let sheep=0,flocks=0;
  const SH=window.SHEEP;if(SH)SH.list.forEach((sp,i)=>{if(near(sp.x,sp.h,sp.z)){honkers.push({sheep:i,ph:Math.random()*.4});sheep++;}});
  for(const e of SCARE)if(Math.hypot(e.x-P.x,e.z-P.z)<520&&P.y-e.y<350){e.at=animNow+Math.random()*.15;flocks++;}
  const who=[people&&(people===1?'someone':people+' people'),sheep&&(sheep===1?'a sheep':sheep+' sheep')].filter(Boolean),n=people+sheep;
  const ground=who.length?who.join(' and ')+(n===1?' jumps':' jump'):'',air=flocks?(flocks===1?'a flock of birds scatters':flocks+' flocks of birds scatter'):'';
  const line=[ground,air].filter(Boolean).join(', and ');if(line)toast('Honk honk! '+line[0].toUpperCase()+line.slice(1)+'.',2.2);
  setTimeout(()=>{if(mode==='fly'&&settings.dog!==false){dog.bark=1.3;snd.woof();}},520);
  if(n>=3)goal('honk',true);}
function updHonk(dt){if(honkT<0)return;honkT+=dt;
  for(const h of honkers){const t=honkT-h.ph,hop=t>0&&t<1.8?Math.abs(Math.sin(t*7.5))*1.4*(1-t/1.8):0;
    if(h.sheep!=null){sheepPose(h.sheep,hop,t>0&&t<1.8);continue;}
    if(h.mv)h.o.position.y+=hop;else h.o.position.y=h.y0+hop;
    if(t>0&&t<1.8){const w=h.o.getWorldPosition(_so);h.o.rotation.y=Math.atan2(ac.pos.x-w.x,ac.pos.z-w.z);}}
  const SH=window.SHEEP;if(SH&&honkers.some(h=>h.sheep!=null)){SH.body.instanceMatrix.needsUpdate=true;SH.head.instanceMatrix.needsUpdate=true;}
  if(honkT>2.4){for(const h of honkers){if(h.sheep!=null)sheepPose(h.sheep,0,false);else if(!h.mv)h.o.position.y=h.y0;}if(SH){SH.body.instanceMatrix.needsUpdate=true;SH.head.instanceMatrix.needsUpdate=true;}honkers.length=0;honkT=-1;}}
/* a sheep hops and swings round to look up at you, then goes back to grazing the way it was */
const _shm=new THREE.Matrix4(),_shq=new THREE.Quaternion(),_she=new THREE.Euler(),_one=new V3(1,1,1);
function sheepPose(i,hop,look){const SH=window.SHEEP,sp=SH.list[i],r=look?Math.atan2(sp.x-ac.pos.x,sp.z-ac.pos.z):sp.r;_shq.setFromEuler(_she.set(0,r,0));
  SH.body.setMatrixAt(i,_shm.compose(_so.set(sp.x,sp.h+.7+hop,sp.z),_shq,_one));SH.head.setMatrixAt(i,_shm.compose(_so.set(sp.x-Math.sin(r)*1.2,sp.h+1+hop+(look?.2:0),sp.z-Math.cos(r)*1.2),_shq,_one));}
$('hornBtn').addEventListener('pointerdown',e=>{e.preventDefault();honk();});
function resetSwitches(){smokeOn=false;floatsOn=false;ac.floats=0;floatG.visible=false;micBusy=false;updFunUI();}
function updSwitchesFx(dt){updHonk(dt);updRunwayLights(dt);updSmoke(dt);updSearch(dt);updFloats(dt);}
updFunUI();

/* ---- keep the sound alive: phones suspend the audio engine when the screen locks or the app goes to the background
   (iOS calls it "interrupted") and don't restart it. Wake it when the page comes back, and on the very next touch,
   since iOS only allows a restart from a tap. */
function wakeAudio(){const c=snd.ctx;if(!c||c.state==='running'||c.state==='closed')return;try{c.resume().catch(()=>{});}catch(e){}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden){wakeAudio();setTimeout(wakeAudio,400);}});
addEventListener('pageshow',wakeAudio);addEventListener('focus',wakeAudio);
for(const ev of ['pointerdown','touchend','keydown'])addEventListener(ev,wakeAudio,{capture:true,passive:true});
setInterval(()=>{const c=snd.ctx;if(c&&c.onstatechange==null)c.onstatechange=()=>{if(!document.hidden)wakeAudio();};},1000);
