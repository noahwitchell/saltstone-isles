/* ---------- the fun switches: things you flick that change the world around you ----------
   MIC          pilot-controlled runway lights, like real quiet airfields: key the mic 3 times fast for low, 5 for medium,
                7 for bright. The nearest field's edge lights come on, running down the runway, for 5 minutes.
   SMOKE        airshow smoke: a white trail that hangs in the air and drifts with the wind, so you can draw in the sky.
   SEARCHLIGHT  a narrow sBeam under the nose that swings into your turns (and drifts gently side to side),
                so banking paints it across the ground.
   FLOATS       a red pull handle. Two inflatable floats pop out like a life raft and you can land on the water. */

/* ---- runway lights ---- */
const RWY={};
for(const s of STRIPS){const L=RWY_L[s.id];if(!L)continue;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(L.p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(L.c,3));
  const m=new THREE.Points(g,new THREE.PointsMaterial({size:2,sizeAttenuation:false,vertexColors:true,fog:false}));m.frustumCulled=false;m.visible=false;g.setDrawRange(0,0);scene.add(m);
  RWY[s.id]={m,n:L.p.length/3,on:0,until:0,level:0};}
const RWY_ON=300,LEVELS=['','LOW','MEDIUM','HIGH'];
function rwyLit(s){const r=s&&RWY[s.id];return !!r&&r.level>0;}
function lightStrip(s,level,quiet){const r=RWY[s.id];if(!r)return;const was=r.level;r.level=Math.max(level,1);r.until=simT+RWY_ON;if(!was)r.on=0;
  r.m.material.size=r.level>=3?3:2;r.m.material.color.setScalar(1);if(!quiet){snd.clunk();toast(`${s.name}: runway lights ${LEVELS[r.level]}. They stay on for 5 minutes.`,2.6);}}
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
/* who answers the mic: a field you're right by (2.5 km), else the one you're headed for if it's in radio range, else the closest */
function micTarget(){const dd=s=>Math.hypot(s.x-ac.pos.x,s.z-ac.pos.z),near=STRIPS.reduce((a,s)=>dd(s)<dd(a)?s:a);return dd(near)>2500&&dest&&RWY[dest.id]&&dd(dest)<9000?dest:near;}
function keyMic(){if(mode!=='fly'||micBusy)return;
  const near=micTarget(),far=Math.hypot(near.x-ac.pos.x,near.z-ac.pos.z)>12000;
  const r=RWY[near.id],lvl=r?r.level:0,next=Math.min(3,lvl+1);
  micBusy=true;updMicUI();const c=snd.ctx;
  const ask=['lights please, over','could we have the lights a touch brighter','one more notch on the lights, please'][Math.min(lvl,2)];
  toast(`You: "${near.name}, ${lvl>=3?'lights check, over':ask}."`,2);
  if(c){const t=c.currentTime+.05;radioTalk(t,1+Math.random()*.4,105+Math.random()*15,.6);if(!far)radioTalk(t+1.85,1.1+Math.random()*.5,150+Math.random()*25,1.4);}
  setTimeout(()=>{if(far){micBusy=false;updMicUI();toast('Only static comes back. No airfield in radio range.',2.2);return;}},1700);
  if(far)return;
  setTimeout(()=>{toast(`${near.name}: "${lvl>=3?'They\'re all the way up already. Good flying.':['Lights coming on now.','Brighter it is.','Full bright. Enjoy the view.'][next-1]}"`,2.4);},1900);
  setTimeout(()=>{micBusy=false;lightStrip(near,next,true);snd.clunk();updMicUI(near);
},3400);}
function updMicUI(){const b=$('micBtn');if(!b)return;const near=micTarget(),r=RWY[near.id],l=r?r.level:0;
  b.querySelector('em').textContent=micBusy?'...':'●'.repeat(l)+'○'.repeat(3-l);b.classList.toggle('talk',micBusy);}
let micUiT=0;
function updRunwayLights(dt){const dark=TOD[tod].lights>0;
  /* keep the MIC dots honest: they show the field that would answer right now, and drop when its lights time out */
  micUiT-=dt;if(micUiT<=0&&!micBusy){micUiT=.5;updMicUI();}
  for(const s of STRIPS){const r=RWY[s.id];if(!r)continue;if(r.level&&simT>r.until)r.level=0;
    const want=!!r.level;   /* once they're switched on you see them in any light, not just after sunset */ r.on=want?Math.min(1,r.on+dt/.8):0;r.m.visible=want;if(want)r.m.geometry.setDrawRange(0,Math.ceil(r.n*r.on));}
  if(dark&&mode==='fly'&&!ac.ground&&dest&&!rwyLit(dest)&&Math.hypot(dest.x-ac.pos.x,dest.z-ac.pos.z)<5000)
    tip('pcl','Dark runway? Little airfields have pilot-controlled lights. Tap MIC (top right) to call the field you\'re headed for and they\'ll switch the runway lights on. Call again for brighter.');}

/* ---- smoke trail ---- */
const SMOKE_N=1600,SMOKE_LIFE=120,SMOKE_EVERY=.075;let smokeOn=false,smokeAcc=0,smokeI=0;
/* light, soft smoke: nearly see-through right behind the plane (so it never blocks your view), thickening to
   solid white with distance, so you see what you've drawn when you turn round and look back */
const smokeMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,
  uniforms:{uSun:{value:sunDir},uTint:{value:1},uSmokeC:{value:new THREE.Color(.96,.95,.94)},fogColor:{value:scene.fog.color},fogNear:{value:700},fogFar:{value:5600}},
  vertexShader:`varying float vSh;varying float vD;uniform vec3 uSun;
    void main(){vec4 w=modelMatrix*instanceMatrix*vec4(position,1.);vec3 n=normalize(mat3(modelMatrix*instanceMatrix)*normal);
      vSh=.84+.16*max(dot(n,normalize(uSun)),0.)+.06*n.y;vec4 mv=viewMatrix*w;vD=-mv.z;gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`varying float vSh;varying float vD;uniform float uTint,fogNear,fogFar;uniform vec3 fogColor,uSmokeC;
    void main(){float a=mix(.1,.98,smoothstep(14.,130.,vD));vec3 c=uSmokeC*vSh*uTint;c=mix(c,fogColor,smoothstep(fogNear,fogFar,vD));gl_FragColor=vec4(c,a);}`});
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
  smokeTrail.visible=any;if(any)smokeTrail.instanceMatrix.needsUpdate=true;
  const T=TOD[tod],U=smokeMat.uniforms;U.uTint.value=clamp(T.sunI*.55+T.hemiI*.55,.3,1.05);U.fogNear.value=scene.fog.near;U.fogFar.value=scene.fog.far;}

/* ---- searchlight ----
   A pool of daylight on the ground a little way ahead of the nose: whatever's inside the circle is lit as if it
   were midday. It points the way you're heading, a fixed angle down, so you aim it just by flying: turn to sweep it,
   fly lower to bring it closer and make it tighter. Done in the post pass, so it lights land and water alike. */
let searchOn=false,spotK=0;
const sBeam=new THREE.Mesh(new THREE.ConeGeometry(1,1,16,1,true).translate(0,-.5,0),new THREE.MeshBasicMaterial({color:0xfff4d8,transparent:true,opacity:.06,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));sBeam.visible=false;sBeam.renderOrder=5;scene.add(sBeam);
const SPOT_DOWN=26*DEG,_sd=new V3(),_sh=new V3(),_down=new V3(0,-1,0),_so=new V3(),spotP=new V3();let spotR=40;
const DAYNESS={dawn:.9,noon:1,golden:.85,sunset:.55,dusk:.3,night:0};
function updSearch(dt){const on=searchOn&&mode!=='title';spotK=lerp(spotK,on?1:0,1-Math.exp(-dt*6));if(spotK<.01){sBeam.visible=false;return;}
  axes();_sh.set(_f.x,0,_f.z);if(_sh.lengthSq()<1e-4)_sh.set(0,0,-1);_sh.normalize();
  _sd.copy(_sh).multiplyScalar(Math.cos(SPOT_DOWN)).addScaledVector(_down,Math.sin(SPOT_DOWN));
  const o=_so.copy(ac.pos);o.y-=.8;let L=2200;for(let d=10;d<2200;d+=d<200?8:20){const x=o.x+_sd.x*d,y=o.y+_sd.y*d,z=o.z+_sd.z*d;if(y<surfH(x,z)){L=d;break;}}
  spotP.copy(o).addScaledVector(_sd,L);spotP.y=surfH(spotP.x,spotP.z);spotR=lerp(spotR,clamp(18+L*.07,22,110),1-Math.exp(-dt*4));
  const dn=DAYNESS[tod]??1;sBeam.visible=dn<.6;sBeam.position.copy(o);sBeam.quaternion.setFromUnitVectors(_down,_sd);const w=spotR*.8;sBeam.scale.set(w,L,w);sBeam.material.opacity=.07*(1-dn)*spotK;}
/* called right before each frame is drawn, so the circle uses the very camera that frame is drawn with */
function spotUniforms(){const U=postMat.uniforms;U.uSpotOn.value=spotK;if(spotK<.01)return;const dn=DAYNESS[tod]??1;
  U.uSpot.value.copy(spotP);U.uSpotR.value=spotR;U.uSpotK.value.set(1.12+1.7*(1-dn),1.1+1.6*(1-dn),1.06+1.15*(1-dn));
  U.uInvProj.value.copy(camera.projectionMatrixInverse);U.uCamW.value.copy(camera.matrixWorld);}

/* ---- inflatable floats ---- */
ac.floats=0;let floatsOn=false,PLANE_FLOATS=false;
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
function updFloats(dt){if(PLANE_FLOATS){floatsOn=true;ac.floats=1;floatG.visible=false;return;}const tgt=floatsOn?1:0;if(floatsOn)ac.floats=Math.min(1,ac.floats+dt/.7);else ac.floats=Math.max(0,ac.floats-dt/1.8);
  floatG.visible=ac.floats>.01;if(floatG.visible){const u=ac.floats,v=u-1,s=floatsOn?1+2.7*v*v*v+1.7*v*v:u;floatG.scale.set(Math.max(.05,s),Math.max(.05,s),.3+.7*Math.min(1,u*1.5));}}

/* ---- the panel ---- */
function updFunUI(){$('swSearch').classList.toggle('on',searchOn);$('swSmoke').classList.toggle('on',smokeOn);$('swFloat').classList.toggle('on',floatsOn);updMicUI();}
$('swSearch').addEventListener('click',()=>{searchOn=!searchOn;snd.flick();updFunUI();if(searchOn)tip('search','Searchlight on. It lights up a circle of ground ahead of you, as bright as midday. Turn to sweep it around; fly lower to bring it closer. Best after dark.');});
$('swSmoke').addEventListener('click',()=>{smokeOn=!smokeOn;snd.flick();if(smokeOn)snd.hiss(.5);updFunUI();if(smokeOn)tip('smoke','Smoke on! It hangs in the air for a while, so you can draw loops and letters in the sky.');});
$('swFloat').addEventListener('click',()=>{if(PLANE_FLOATS){toast('The Pelican\'s floats are built in.',1.4);return;}setFloats(!floatsOn);});
$('micBtn').addEventListener('pointerdown',e=>{e.preventDefault();keyMic();});
/* ---- the horn: a little double honk. Folk in town, at drop camps, and the errand goats and sheep nearby jump and
   turn to look up at you; Biscuit joins in ---- */
let honkT=-1;const honkers=[];
function honk(){if(mode!=='fly'||(honkT>=0&&honkT<1))return;snd.honk();honkT=0;honkers.length=0;const P=ac.pos,b=$('hornBtn');b.classList.add('honk');setTimeout(()=>b.classList.remove('honk'),550);
  const near=(x,y,z)=>Math.hypot(x-P.x,z-P.z)<420&&P.y-y<320;
  for(const o of (window.FOLK||[])){o.updateMatrixWorld();const w=o.getWorldPosition(_so);if(near(w.x,w.y,w.z))honkers.push({o,mv:true,ph:Math.random()*.35});}
  for(const set of ['goats','sheep'])for(const f of (FINDS[set]||[]))if(f.obj&&near(f.x,f.y,f.z))honkers.push({o:f.obj,mv:false,y0:f.obj.position.y,ph:Math.random()*.35});
  for(const [d,s] of SITES)if(s.react<0&&near(d.x,d.y,d.z))honkers.push({o:s.man,mv:false,y0:s.man.position.y,ph:.1});
  const people=honkers.length;let sheep=0,flocks=0;
  const SH=window.SHEEP;if(SH)SH.list.forEach((sp,i)=>{if(near(sp.x,sp.h,sp.z)){honkers.push({sheep:i,ph:Math.random()*.4});sheep++;}});
  let boats=0,fishers=0;
  for(const e of SCARE)if(Math.hypot(e.x-P.x,e.z-P.z)<(e.kind==='flock'?520:600)&&P.y-e.y<350){e.at=animNow+Math.random()*.15;if(e.kind==='flock')flocks++;else{boats++;if(e.kind==='boat')fishers++;}}
  if(fishers)setTimeout(()=>snd.toot(),900);
  const who=[people&&(people===1?'someone':people+' people'),sheep&&(sheep===1?'a sheep':sheep+' sheep')].filter(Boolean),n=people+sheep;
  const ground=who.length?who.join(' and ')+(n===1?' jumps':' jump'):'',air=flocks?(flocks===1?'a flock of birds scatters':flocks+' flocks of birds scatter'):'';
  const sea=boats?(fishers?(boats===1?'a boat toots back':boats+' boats rock and toot back'):(boats===1?'a sailboat rocks':boats+' sailboats rock')):'';
  const line=[ground,air,sea].filter(Boolean).join(', and ');if(line)toast('Honk honk! '+line[0].toUpperCase()+line.slice(1)+'.',2.2);
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

/* ---- updraft: like the tailwind but straight up. Three charges; tap again while one is lifting you to stack them.
   Holding BRAKE in the air calls it off, same as the tailwind ---- */
const UP_T=3,UP_V=26,UP_STACK=[0,1,1.6,2.1,2.5,2.85,3.15,3.4];let UP_N=5,UP_CD=6;let upCharges=UP_N,upCD=0,upUiT=0;
function useUpdraft(){if(mode!=='fly')return;if(ac.ground){toast('Updrafts work once you\'re flying.',1.6);return;}
  if(upCharges<=0){toast(`The next updraft is gathering. ${Math.ceil(upCD)} s.`,1.3);return;}
  if(!ac.ups)ac.ups=[];ac.ups.push(UP_T);upCharges--;upCD=UP_CD;const n=ac.ups.length;snd.beep(660+n*120);setTimeout(()=>snd.beep(990+n*160),80);
  toast(n>1?`Updraft ×${n}!`:'Updraft!',1.1);if(n===3)goal('updraft3',true);tip('updraft','Updraft! It lifts you straight up for a few seconds. Climb high for loops and barrel rolls: they score points. Hold BRAKE to stop it early.',.6);updUpUI();}
function stepUp(dt){if(!ac.ups)ac.ups=[];if(ac.ground)ac.ups.length=0;
  if(ac.brakeHeld&&ac.ups.length){ac.ups.length=0;toast('Updraft off.',1);}
  for(let i=ac.ups.length-1;i>=0;i--){ac.ups[i]-=dt;if(ac.ups[i]<=0)ac.ups.splice(i,1);}
  const tgt=UP_STACK[ac.ups.length];ac.ust=lerp(ac.ust||0,tgt,1-Math.exp(-dt*(tgt>(ac.ust||0)?3:2)));
  if(ac.ust>.005){ac.pos.y+=UP_V*ac.ust*dt;if(ac.vel.y<0)ac.vel.y*=1-Math.min(1,dt*3*ac.ust);}
  trickTick(dt);}
function updUpUI(){const b=$('updraft');if(!b)return;const n=(ac.ups||[]).length;b.innerHTML=`<img src="${RICON.up}" alt="Updraft">${n>1?'×'+n:''}<span>${'●'.repeat(upCharges)+'○'.repeat(UP_N-upCharges)}</span>`;
  b.classList.toggle('on',n>0);b.classList.toggle('off',ac.ground||mode!=='fly');b.style.setProperty('--w',upCharges<UP_N&&!n?Math.round((1-upCD/UP_CD)*100)+'%':'0%');}
function updUpdraft(dt){if(!(ac.ups&&ac.ups.length)&&upCharges<UP_N){upCD-=dt;if(upCD<=0){upCharges++;upCD=UP_CD;}}upUiT-=dt;if(upUiT<=0){upUiT=.1;updUpUI();}}
RICON.up=railIcon(['................','.......aa.......','......aaaa......','.....aaaaaa.....','....aa.aa.aa....','.......aa.......','.......aa.......','..b....aa....b..','.bbb...aa...bbb.','bbbbb..aa..bbbbb','..b....aa....b..','..b..........b..','..b..........b..','................','................','................'],{a:'#2a6a9a',b:'#7a4a1a'});
$('updraft').addEventListener('click',e=>{e.stopPropagation();useUpdraft();});

/* ---- stunts: a full barrel roll or a full loop scores, with a logbook entry the first time ---- */
const TR={roll:0,pitch:0,rq:0,pq:0,cd:0};
function trickTick(dt){if(ac.ground||mode!=='fly'){TR.roll=TR.pitch=0;return;}TR.cd-=dt;
  const rr=ac.w.z,pr=ac.w.x;
  TR.roll+=rr*dt;if(Math.abs(rr)<.5)TR.rq+=dt;else TR.rq=0;if(TR.rq>.7||Math.sign(rr)!==Math.sign(TR.roll)&&Math.abs(rr)>.3)TR.roll=0;
  TR.pitch+=pr*dt;if(Math.abs(pr)<.08)TR.pq+=dt;else TR.pq=0;if(TR.pq>2.5||Math.sign(pr)!==Math.sign(TR.pitch)&&Math.abs(pr)>.15)TR.pitch=0;
  if(Math.abs(TR.roll)>=TAU*.95){TR.roll=0;stunt('roll');}
  if(Math.abs(TR.pitch)>=TAU*.92){TR.pitch=0;TR.roll=0;stunt('loop');}}
function stunt(k){if(TR.cd>0&&k==='roll')return;TR.cd=1;const S={roll:['Barrel roll!',250],loop:['Loop the loop!',400]}[k];
  const first=goal(k,true);addScore(S[1]+(first?100:0));if(first)stamp(1);snd.beep(1320);setTimeout(()=>snd.beep(1760),100);setTimeout(()=>snd.beep(2093),200);
  toast(`${S[0]} +${S[1]+(first?100:0)}${first?' · +1 STAMP':''}`,1.8);}
