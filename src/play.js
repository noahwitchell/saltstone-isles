/* ---------- score, fly-through gaps, errands, and Biscuit the dog ---------- */
if(log.score==null)log.score=0;if(!log.gates)log.gates={};if(!log.errands)log.errands={};if(!log.gateHint)log.gateHint={};
function updScore(){const e=$('score');if(!e)return;e.innerHTML='★ '+log.score.toLocaleString()+(window.__shopReady?' &nbsp;'+coinTag(log.coins):'');}
function addScore(n){log.score+=n;saveL();updScore();const e=$('score');if(e){e.classList.remove('pop');void e.offsetWidth;e.classList.add('pop');}}

/* fly-through gaps: cross the window's plane inside its width and height */
const fgSide={},fgLastT={};let canyonIn=-1e9,canyonOut=-1e9;
function checkGates(){if(ac.ground)return;for(const g of FLYGATES){const dx=ac.pos.x-g.x,dz=ac.pos.z-g.z,d=dx*g.nx+dz*g.nz,lat=-dx*g.nz+dz*g.nx;
  if(Math.abs(d)>500||Math.abs(lat)>500){fgSide[g.id]=0;continue;}
  if(!log.gateHint[g.id]&&Math.hypot(dx,dz)<650&&ac.pos.y<g.y1+250){log.gateHint[g.id]=1;saveL();toast(`${g.name}\n${g.desc} Fly through for points.`,3.5);}
  const s=d>=0?1:-1,prev=fgSide[g.id];fgSide[g.id]=s;
  if(prev&&prev!==s&&Math.abs(lat)<g.w&&ac.pos.y>g.y0&&ac.pos.y<g.y1)passGate(g);}}
function passGate(g){const now=simT;if(now-(fgLastT[g.id]||-1e9)<12)return;fgLastT[g.id]=now;
  const first=!log.gates[g.id];log.gates[g.id]=(log.gates[g.id]||0)+1;snd.beep(1175);setTimeout(()=>snd.beep(1568),110);
  let pts=first?250:50,extra='';if(first)stamp(1);
  if(g.id==='cleft_in')canyonIn=now;if(g.id==='cleft_out')canyonOut=now;
  if((g.id==='cleft_out'&&now-canyonIn<90)||(g.id==='cleft_in'&&now-canyonOut<90)){pts+=400;extra='\nThe whole canyon, end to end! +400';canyonIn=canyonOut=-1e9;goal('canyon',true);}
  addScore(pts);saveL();
  if(FLYGATES.every(q=>log.gates[q.id]))goal('threader');
  toast(`${first?'Threaded it! ':''}${g.name} · +${first?250:50}${first?' · +1 STAMP':''}${extra}`,2.6);}

/* errands: an islander asks you to find some things (or one thing) and come back and tell them */
const ERRANDS={
  buoys:{giver:'ollie',set:'buoys',what:'orange buoys',one:'an orange buoy',ask:"Dad's lobster-pot buoys broke loose in the storm. Four orange ones with little flags, all round the cay somewhere. Can you spot them for me?",thanks:"You found them! I'm going to row out with Dad and get every one. You're officially strip crew now."},
  nests:{giver:'ada',set:'nests',what:'osprey nests',one:'an osprey nest',ask:"The ospreys are back on Tallpine. Big stick nests on dead trees, three of them if they all came home. Count them for me from up there?",thanks:"All of them came home. I'll write it in the book in my best handwriting."},
  kites:{giver:'hattie',set:'kites',what:'kites',one:'a kite',ask:"The school kite day got away from us. Eight kites stuck in the orchard trees, flapping about. Find them so I can send the children up ladders?",thanks:"Every one! The children will be thrilled. The trees less so."},
  goats:{giver:'tam',set:'goats',what:'goats',one:'a goat',ask:"Five of my goats went over the bridge and down the canyon ledges. White ones. Spot them and I'll go and talk them home.",thanks:"Five goats! They'll pretend they weren't lost. Goats are like that."},
  cairns:{giver:'kit',set:'cairns',what:'trail cairns',one:'a cairn',ask:"I've built four cairns with orange flags to mark the high trail. I need to know they're all still standing after the wind. Have a look?",thanks:"All four standing. That's the trail open for summer, then."},
  lanterns:{giver:'lu',set:'lanterns',what:'paper lanterns',one:'a lantern',ask:"Seven festival lanterns floated off last night. They're still up there, glowing, drifting round the key. Find them all and I'll light you one of your own.",thanks:"Seven! Every lantern came home. This one is yours, pilot. Hang it in your cockpit."},
  sheep:{giver:'agnes',set:'sheep',what:'red sheep',one:'a red sheep',ask:"My ewes are marked red so I can find them. Three have wandered off along the ridge. You'll see them better than I will.",thanks:"That's my three. I'll take the dog out. Not your dog. Mine's less clever."},
  heart:{giver:'lio',sight:'heart',what:'the heart-shaped island',ask:"Sailors talk about an island shaped like a heart, somewhere between Ferrow and Applecross. I'd love to paint it. Find it and come and tell me?",thanks:"A heart! Just as they said. I'll paint it from your description. Then I'll paint it again."},
  meteor:{giver:'odile',sight:'meteor',what:'the fallen star',ask:"Desmond on the Saltpans says a star fell there once. A real meteorite would be wonderful. Find it and report back?",thanks:"A ring of scorched stone and a black heart in the middle. That's a meteorite. I'm writing to three universities."},
  wreck:{giver:'wren',sight:'wreck',what:'the wreck on Tern Bars',ask:"There's an old wreck out on the sandbars to the east, past Lantern Key. I've only heard about it. Find it and tell me what it's called?",thanks:"The Merrow! My grandfather sailed on her. Thank you for finding her."},
};
const errState=id=>log.errands[id]||(log.errands[id]={st:'new',found:[]});
function errCount(id){const e=ERRANDS[id],s=errState(id);return e.set?{n:Math.min(s.found.length,FINDS[e.set].length),of:FINDS[e.set].length}:{n:log.sights[e.sight]?1:0,of:1};}
function errLine(id){const e=ERRANDS[id],c=errCount(id);return e.set?`${c.n} of ${c.of} ${e.what}`:(c.n?`Found ${e.what}`:`Looking for ${e.what}`);}
function activeErrands(){return Object.keys(ERRANDS).filter(k=>errState(k).st==='active');}
function updErrandUI(){const b=$('errand');if(!b)return;const a=activeErrands();if(!a.length){b.hidden=true;return;}b.hidden=false;b.textContent=a.map(k=>{const c=errCount(k),g=CHARS[ERRANDS[k].giver];return `${g.name.split(' ')[0].toUpperCase()}: ${ERRANDS[k].set?c.n+'/'+c.of:(c.n?'FOUND':'?')}`;}).join(' · ');}
let findT=0;
function checkFinds(dt){findT+=dt;if(findT<.3)return;findT=0;
  for(const id of activeErrands()){const e=ERRANDS[id],s=errState(id);
    if(e.set){FINDS[e.set].forEach((p,i)=>{if(s.found.includes(i))return;if(Math.hypot(ac.pos.x-p.x,ac.pos.z-p.z)<140&&ac.pos.y-p.y<300){s.found.push(i);addScore(50);snd.beep(1320);celebrate(p);
        const c=errCount(id),g=CHARS[e.giver];toast(c.n<c.of?`Found ${e.one}! ${c.n} of ${c.of} · +50`:`That's all ${c.of} ${e.what}! · +50\nFly back to ${g.name.split(' ')[0]} at ${stripById(g.home).name} to report.`,c.n<c.of?2.2:4);updErrandUI();}});}
    else if(log.sights[e.sight]&&!s.told){s.told=1;saveL();const g=CHARS[e.giver];toast(`That's ${e.what}! Fly back to ${g.name.split(' ')[0]} at ${stripById(g.home).name} to tell them.`,4);updErrandUI();}}}
/* when you find an errand item it does its thing: goats and sheep hop, kites loop, the osprey takes off, lanterns rise,
   buoys ring, cairn flags run up the pole. Plus a puff of confetti so you can see it from the cockpit. */
const celebs=[],CONF=[0xff3a2a,0xffd34a,0x3fb8ff,0x7ae05a,0xf8f4ee,0xff7ae0];
function celebrate(p){const o=p.obj,c=o?o.getWorldPosition(new V3()):new V3(p.x,p.y,p.z);celebs.push({p,e:0});
  const N=70,g=new THREE.BufferGeometry(),P=new Float32Array(N*3),C=new Float32Array(N*3),Vv=[],col=new THREE.Color();
  for(let i=0;i<N;i++){P.set([c.x,c.y+4,c.z],i*3);col.setHex(CONF[i%6]);C.set([col.r,col.g,col.b],i*3);const a=Math.random()*TAU,u=Math.random();Vv.push(Math.cos(a)*(8+u*14),14+Math.random()*16,Math.sin(a)*(8+u*14));}
  g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('color',new THREE.BufferAttribute(C,3));
  const pts=new THREE.Points(g,new THREE.PointsMaterial({size:3,sizeAttenuation:false,vertexColors:true,fog:false,transparent:true}));pts.frustumCulled=false;scene.add(pts);celebs.push({pts,Vv,e:0});}
if(log.errands)for(const id of Object.keys(ERRANDS)){const e=ERRANDS[id];if(!e.set||!log.errands[id])continue;for(const i of log.errands[id].found||[]){const p=FINDS[e.set][i];if(!p)continue;if(p.kind==='fly')p.flying=1;if(p.kind==='flag')p.up=1;}}
let celT=-1;anims.push(t=>{const dt=celT<0?0:clamp(t-celT,0,.1);celT=t;
  for(const set of [FINDS.nests||[],FINDS.cairns||[]])for(const p of set){
    if(p.kind==='fly'&&p.flying){p.fa=(p.fa||0)+dt;const k=Math.min(p.fa/3,1),a=p.fa*.32+p.x,r=8+k*30;p.obj.position.set(p.home.x+Math.cos(a)*r,p.home.y+k*(18+Math.sin(p.fa*.5)*4),p.home.z+Math.sin(a)*r);
      p.obj.rotation.set(0,-a+Math.PI,k*.35);const fl=p.fa<4||Math.sin(p.fa*.4)>.6?Math.sin(p.fa*12)*.7:.12;p.wL.rotation.z=-fl;p.wR.rotation.z=fl;}
    if(p.kind==='flag'){p.fy=lerp(p.fy??(p.up?5:0),p.up?5:0,1-Math.exp(-dt*1.5));p.obj.position.y=p.y+19+p.fy;p.obj.rotation.y=Math.sin(t*(p.up?5:1.6)+p.x)*(p.up?.35:.15);}}
  for(let i=celebs.length-1;i>=0;i--){const c=celebs[i];c.e+=dt;
    if(c.pts){const P=c.pts.geometry.attributes.position.array;for(let j=0;j<c.Vv.length/3;j++){c.Vv[j*3+1]-=22*dt;for(let k=0;k<3;k++)P[j*3+k]+=c.Vv[j*3+k]*dt*(k===1?1:Math.exp(-c.e));}
      c.pts.geometry.attributes.position.needsUpdate=true;c.pts.material.opacity=Math.max(0,1-c.e/2.4);if(c.e>2.4){scene.remove(c.pts);c.pts.geometry.dispose();celebs.splice(i,1);}continue;}
    const p=c.p,o=p.obj,e=c.e;if(!o){celebs.splice(i,1);continue;}
    if(p.kind==='hop'){o.position.y=p.y+Math.abs(Math.sin(e*Math.PI*2.2))*7*Math.max(0,1-e/2.6);o.rotation.y+=dt*4*Math.max(0,1-e/2.6);if(e>2.6){o.position.y=p.y;celebs.splice(i,1);}}
    else if(p.kind==='loop'){p.busy=1;const a=Math.min(e/2.6,1)*TAU*2;o.position.y=p.y+(1-Math.cos(a))*10;o.rotation.x=a;o.rotation.z=Math.sin(e*8)*.3;if(e>2.6){o.rotation.x=0;p.busy=0;celebs.splice(i,1);}}
    else if(p.kind==='fly'){p.flying=1;celebs.splice(i,1);}
    else if(p.kind==='flag'){p.up=1;celebs.splice(i,1);}
    else if(p.kind==='rise'){const k=Math.min(e/3,1);p.base.cy+=dt*(e<3?9:0);o.scale.setScalar(1+Math.sin(e*10)*.25*(1-k));if(e>3){o.scale.setScalar(1);celebs.splice(i,1);}}
    else if(p.kind==='ring'){p.ring=Math.max(0,1-e/3);if(e>3){p.ring=0;celebs.splice(i,1);}}
    else celebs.splice(i,1);}});
/* buttons for a landing card: report back, or a new favour from someone who lives here */
function errandBtns(s){const out=[];
  for(const id of activeErrands()){const e=ERRANDS[id];if(CHARS[e.giver].home!==s.id)continue;const c=errCount(id);out.push([`Report to ${CHARS[e.giver].name.split(' ')[0]} (${e.set?c.n+'/'+c.of:c.n?'found':'not yet'})`,()=>reportErrand(id,s)]);}
  if(!out.length&&mode!=='title'){const id=Object.keys(ERRANDS).find(k=>{const e=ERRANDS[k];return CHARS[e.giver].home===s.id&&errState(k).st==='new'&&(!e.sight||!log.sights[e.sight]);});
    if(id)out.push([`${CHARS[ERRANDS[id].giver].name.split(' ')[0]} has a favour to ask`,()=>offerErrand(id,s)]);}
  return out;}
const afterBtns=s=>[['Take off',()=>spawnField(s),true],['Look around first',()=>{hideModal();mode='fly';}]];
function offerErrand(id,s){const e=ERRANDS[id],c=CHARS[e.giver],meet=!log.met[e.giver];if(meet){log.met[e.giver]=1;saveL();}
  showCard(`<div class="who"><img src="${portrait(e.giver)}" alt=""><div><b>${c.name}</b><span>${c.role}</span></div></div>${meet?`<p class="say">“${MEET[e.giver]}”</p>`:''}<p class="say">“${e.ask}”</p>`,
    [['I\'ll keep an eye out',()=>{errState(id).st='active';saveL();updErrandUI();toast(`Errand: ${errLine(id)}. Stuck? Tap Biscuit's button up top for a clue.`,3);showCard(`<h2>Errand accepted</h2><p>${e.set?`Find all ${FINDS[e.set].length} ${e.what}`:`Find ${e.what}`}, then land back here and report to ${c.name.split(' ')[0]}. Fly low and slow near them. Stuck? Tap Biscuit's button at the top of the screen and Biscuit will point the right way.</p>`,afterBtns(s));},true],
     ['Maybe later',()=>showCard(`<p class="say">“No hurry. It'll keep.”</p>`,afterBtns(s))]]);}
function reportErrand(id,s){const e=ERRANDS[id],c=CHARS[e.giver],n=errCount(id);
  if(n.n<n.of){showCard(`<div class="who"><img src="${portrait(e.giver)}" alt=""><div><b>${c.name}</b><span>${c.role}</span></div></div><p class="say">“${e.set?`${n.n} of ${n.of} so far? Keep looking, they're out there.`:`Not found it yet? It's out there somewhere.`}”</p>`,afterBtns(s));return;}
  const st=errState(id);st.st='done';const pts=e.set?200+n.of*30:300;addScore(pts);stamp(2);addCoins(50);saveL();updErrandUI();
  if(Object.keys(ERRANDS).every(k=>errState(k).st==='done'))goal('errands',true);goal('errand',true);
  showCard(`<div class="who"><img src="${portrait(e.giver)}" alt=""><div><b>${c.name}</b><span>${c.role}</span></div></div><p class="say">“${e.thanks}”</p><div class="got">ERRAND DONE · +${pts} · +2 STAMPS · +50 COINS</div>${typeof giftLine==='function'?giftLine(id):''}`,afterBtns(s));}

/* Biscuit: a scruffy golden dog with his head out of the right window */
const dog=(()=>{const g=new THREE.Group(),fur=0xe8a850,lt=0xf4e4c8,dk=0x2c2833;
  g.add(new THREE.Mesh(merge([{geo:BOX(.34,.3,.4),m:M([0,0,0]),color:fur},{geo:BOX(.22,.17,.24),m:M([0,-.05,-.28]),color:lt},{geo:BOX(.1,.08,.06),m:M([0,.02,-.41]),color:dk},
    {geo:BOX(.06,.06,.02),m:M([-.09,.07,-.205]),color:dk},{geo:BOX(.06,.06,.02),m:M([.09,.07,-.205]),color:dk},{geo:BOX(.2,.1,.12),m:M([0,.16,.02]),color:lt},{geo:BOX(.3,.24,.3),m:M([-.06,-.1,.28]),color:fur}]),litify(toon({},false))));
  const ear=s=>{const e=new THREE.Mesh(merge([{geo:BOX(.07,.26,.16).translate(0,-.13,0),m:M([0,0,0]),color:0xa8743e}]),litify(toon({},false)));e.position.set(s*.18,.12,.03);g.add(e);return e;};
  const eL=ear(-1),eR=ear(1),tongue=new THREE.Mesh(BOX(.08,.14,.03).translate(0,-.07,0),new THREE.MeshToonMaterial({color:0xe86a7a,gradientMap:gradTex}));tongue.position.set(.03,-.14,-.34);g.add(tongue);
  /* his body: only shown in the cockpit, where he sits in the right seat (in chase view just his head is out the window) */
  const root=new THREE.Group(),dm=litify(toon({},false));root.add(g);
  const body=new THREE.Group(),chest=new THREE.Mesh(merge([{geo:BOX(.3,.44,.3),m:M([0,-.3,.12]),color:fur},{geo:BOX(.2,.3,.04),m:M([0,-.33,-.04]),color:lt},
    {geo:BOX(.33,.07,.33),m:M([0,-.14,.12]),color:0xd2493c},{geo:BOX(.07,.07,.03),m:M([0,-.22,-.05]),color:0xf1c84a}]),dm);
  const rest=new THREE.Mesh(merge([{geo:BOX(.34,.32,.5),m:M([0,-.55,.42],[-.35,0,0]),color:fur},{geo:BOX(.42,.32,.36),m:M([0,-.68,.62]),color:fur},
    ...[-1,1].map(e=>({geo:BOX(.09,.38,.09),m:M([e*.09,-.62,-.02]),color:fur})),...[-1,1].map(e=>({geo:BOX(.11,.07,.15),m:M([e*.09,-.82,-.07]),color:lt})),
    ...[-1,1].map(e=>({geo:BOX(.12,.14,.24),m:M([e*.2,-.78,.55]),color:fur}))]),dm);
  const tail=new THREE.Group();tail.add(new THREE.Mesh(merge([{geo:BOX(.07,.07,.3).translate(0,0,.15),m:M([0,0,0]),color:fur},{geo:BOX(.08,.08,.08),m:M([0,0,.32]),color:lt}]),dm));
  tail.position.set(0,-.62,.8);tail.rotation.x=.7;body.add(chest,rest,tail);root.add(body);
  root.position.set(.8,.6,-1.5);root.scale.setScalar(1.8);plane.add(root);return {g,root,body,chest,tail,eL,eR,tongue,bark:0,yaw:0,glance:0,glanceT:9};})();
snd.woof=function(){if(!this.ctx||!settings.sound)return;const c=this.ctx,t0=c.currentTime;
  for(const [dt,f0] of [[0,520],[.2,480]]){const t=t0+dt,o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter(),n=c.createBufferSource();o.type='sawtooth';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f0*.42,t+.13);
    f.type='bandpass';f.frequency.value=900;f.Q.value=1.2;n.buffer=this.buf;const ng=c.createGain();ng.gain.value=.5;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.32,t+.012);g.gain.exponentialRampToValueAtTime(.001,t+.16);
    o.connect(f);n.connect(ng);ng.connect(f);f.connect(g);g.connect(this.master);o.start(t);o.stop(t+.2);n.start(t,Math.random());n.stop(t+.2);}};
let barkCD=0,dogTarget=null;
/* Biscuit only barks when asked: tap his button for a clue and he points his nose at whatever you're after.
   Errand items first, then the nearest landmark or gap you haven't found, then your next airfield. */
function dirWord(x,z){const P=ac.pos;axes();const hdg=ac.ground?-ac.gYaw:Math.atan2(_f.x,-_f.z),brg=Math.atan2(x-P.x,-(z-P.z));const rel=((brg-hdg)/DEG+540)%360-180;
  return Math.abs(rel)<20?'dead ahead':Math.abs(rel)>155?'right behind you':rel<0?(rel<-70?'off to the left':'ahead and to the left'):(rel>70?'off to the right':'ahead and to the right');}
function askBiscuit(){if(mode!=='fly'||barkCD>0)return;barkCD=1.5;const P=ac.pos,dist=(x,z)=>Math.hypot(P.x-x,P.z-z);let best=null;
  const pick=c=>{if(!best||c.d<best.d)best=c;};
  for(const id of activeErrands()){const e=ERRANDS[id],st=errState(id),g=CHARS[e.giver],home=stripById(g.home);
    if(e.set){FINDS[e.set].forEach((p,i)=>{if(!st.found.includes(i))pick({x:p.x,z:p.z,d:dist(p.x,p.z),say:e.one});});
      if(st.found.length===FINDS[e.set].length)pick({x:home.x,z:home.z,d:dist(home.x,home.z)+5000,say:`${g.name.split(' ')[0]} at ${home.name}, waiting for your report`});}
    else{const v=sights[e.sight];if(!log.sights[e.sight])pick({x:v.x,z:v.z,d:dist(v.x,v.z),say:e.what});else pick({x:home.x,z:home.z,d:dist(home.x,home.z)+5000,say:`${g.name.split(' ')[0]} at ${home.name}, waiting for your report`});}}
  if(!best){for(const [k,v] of Object.entries(sights))if(!log.sights[k]&&sightOn(v)&&dist(v.x,v.z)<3500)pick({x:v.x,z:v.z,d:dist(v.x,v.z),say:'something down there worth a look'});
    for(const g of FLYGATES)if(!log.gates[g.id]&&dist(g.x,g.z)<3500)pick({x:g.x,z:g.z,d:dist(g.x,g.z),say:`a gap to fly through: ${g.name}`});
    for(const d of activeDrops())pick({x:d.seen?d.x:d.hx,z:d.seen?d.z:d.hz,d:dist(d.x,d.z)*.8,say:d.seen?`the drop camp: ${d.place}`:`orange smoke somewhere on ${ISLES[d.isle].name}`});}
  if(!best&&dest)best={x:dest.x,z:dest.z,d:dist(dest.x,dest.z),say:`${dest.name}, your next stop`};
  dog.bark=1.6;snd.woof();if(!best){toast(petIdle()+' Nothing new around here.',2.4);dogTarget=null;return;}
  dogTarget=best;const d=dist(best.x,best.z),how=d<350?', right below':d<1000?`, about ${Math.round(d/100)*100} m`:`, about ${(d/1000).toFixed(1)} km`;
  toast(`${petCry()} ${petLook()} ${dirWord(best.x,best.z)}${how}: ${best.say}.`,3.5);}
/* he does bark on his own at landmarks and gaps you haven't found (Noah likes that), but never at errand items:
   those are what made him bark nonstop during searches. Once per thing, and at most every 30 s. */
const barked={};let autoCD=10,autoT=0;
function dogAuto(dt){autoCD-=dt;autoT+=dt;if(autoT<1)return;autoT=0;if(!settings.dog||mode!=='fly'||ac.ground||autoCD>0||dog.bark>0)return;
  const P=ac.pos,cand=[];
  for(const [k,v] of Object.entries(sights))if(!log.sights[k]&&sightOn(v)&&!barked['s'+k]&&Math.hypot(P.x-v.x,P.z-v.z)<1100&&P.y-v.y<900)cand.push({key:'s'+k,x:v.x,z:v.z,say:'something down there worth a look'});
  for(const g of FLYGATES)if(!log.gates[g.id]&&!barked['g'+g.id]&&Math.hypot(P.x-g.x,P.z-g.z)<1000)cand.push({key:'g'+g.id,x:g.x,z:g.z,say:`a gap to fly through: ${g.name}`});
  for(const d of activeDrops())if(!barked['d'+d.x]&&Math.hypot(P.x-d.x,P.z-d.z)<1300)cand.push({key:'d'+d.x,x:d.x,z:d.z,say:`orange smoke: ${d.place}`});
  if(!cand.length)return;const best=cand.reduce((a,c)=>Math.hypot(P.x-c.x,P.z-c.z)<Math.hypot(P.x-a.x,P.z-a.z)?c:a);
  barked[best.key]=1;autoCD=30;dogTarget=best;dog.bark=1.6;snd.woof();toast(`${petCry()} ${petLook()} ${dirWord(best.x,best.z)}: ${best.say}.`,3.2);}
function updDog(dt,t){if(lookDown){dog.root.visible=false;return;}const U=plane.userData,cock=!U.bodyM.visible&&mode!=='crashed';dog.bark=Math.max(0,dog.bark-dt);const b=dog.bark>0?1:0;
  let yaw=0;if(b&&dogTarget){const lp=plane.worldToLocal(_c1.set(dogTarget.x,ac.pos.y,dogTarget.z));yaw=clamp(Math.atan2(-lp.x,-lp.z),-.8,.8);}
  dog.yaw=lerp(dog.yaw,yaw,1-Math.exp(-dt*6));
  if(cock){/* in the cockpit he sits in the right seat, bottom-right of the view: head, collar and chest above the dash */
    dog.root.visible=dog.body.visible=true;
    if(dog.root.parent!==COCK)COCK.add(dog.root);   // sits in the right seat of the 3D cockpit, so it rides with the view
    dog.up=lerp(dog.up||0,b?1:0,1-Math.exp(-dt*8));const k=.4;   // on the seat bottom beside you, in front of the panel, head against the windshield
    dog.root.position.set(.52,-.535+.85*k+(dog.dy||0)*k+dog.up*.04+Math.abs(Math.sin(t*14))*b*.02,-.55);
    dog.root.scale.setScalar(k*(dog.k||1));dog.root.rotation.set(0,1.45,0);
    // now and then he turns to look at you; otherwise he watches out of the windshield
    dog.glanceT-=dt;if(dog.glanceT<=0){dog.glanceT=14+Math.random()*14;dog.glance=1.6;}dog.glance=Math.max(0,dog.glance-dt);
    const want=b?dog.yaw-1.45:dog.glance>0?1.1:-.15+Math.sin(t*.31)*.3+Math.sin(t*.13)*.2;dog.hy=lerp(dog.hy||0,want,1-Math.exp(-dt*(b?8:3)));
    dog.g.position.set(0,dog.up*.06,0);dog.g.rotation.set(.05-(b?Math.abs(Math.sin(t*14))*.22:0),dog.hy,dog.glance>0?.22:Math.sin(t*.5)*.12);
    dog.chest.scale.y=1+Math.sin(t*(b?9:3.2))*.03;dog.tail.rotation.y=Math.sin(t*(b?16:6))*(b?.8:.45);
    dog.eL.rotation.x=dog.eR.rotation.x=-.1+Math.sin(t*3)*.05;dog.eL.rotation.z=-.15;dog.eR.rotation.z=.15;dog.tongue.rotation.x=Math.sin(t*9)*.15;return;}
  if(dog.root.parent!==plane)plane.add(dog.root);dog.body.visible=false;dog.root.rotation.set(0,0,0);dog.g.position.set(0,0,0);
  dog.root.visible=U.bodyM.visible;if(!dog.root.visible)return;dog.root.scale.setScalar(1.8*(dog.k||1));const sp=Math.min(ac.ias/45,1.3);
  dog.eL.rotation.x=dog.eR.rotation.x=-sp*1.1+Math.sin(t*22)*.18*sp;dog.eL.rotation.z=-.3*sp-Math.sin(t*17)*.12*sp;dog.eR.rotation.z=.3*sp+Math.sin(t*19)*.12*sp;
  dog.tongue.rotation.x=-sp*.9+Math.sin(t*25)*.2;
  dog.g.rotation.set(Math.sin(t*3)*.05-(b?Math.abs(Math.sin(t*14))*.25:0),dog.yaw,Math.sin(t*2.1)*.06);
  dog.root.position.set(.8+(b?.12:0)+Math.sin(t*1.3)*.02,.6+(b?.06:0),-1.5);}
function playChecks(dt){checkGates();checkFinds(dt);barkCD-=dt;dogAuto(dt);dogPopTick(dt);}
/* Biscuit's pixel portrait pops up beside the message when he barks */
const dogPic=(()=>{const c=document.createElement('canvas');c.width=c.height=32;const x=c.getContext('2d'),P=(col,a,b,w=1,h=1)=>{x.fillStyle=col;x.fillRect(a,b,w,h);};
  P('#9cc3e6',0,0,32,32);P('#86b0d8',0,24,32,8);const fur='#e8a850',dk='#b87a38',lt='#f6e6c8';
  P(fur,8,9,16,15);P(fur,9,8,14,1);P(fur,7,11,1,10);P(fur,24,11,1,10);P(dk,4,8,5,11);P(dk,23,8,5,11);P(dk,5,19,3,3);P(dk,24,19,3,3);
  P(lt,14,8,4,8);P(lt,11,17,10,7);P('#2a2230',14,17,4,3);P('#2a2230',11,13,2,2);P('#2a2230',19,13,2,2);P('#ffffff',11,13,1,1);P('#ffffff',19,13,1,1);
  P('#2a2230',13,22,6,1);P('#e86a7a',16,23,3,4);P('#c84a5a',17,26,1,1);P('#c2453a',9,25,14,2);P('#ffd36b',15,26,2,2);return c.toDataURL();})();
(function(){const d=document.createElement('div');d.id='dogpop';d.hidden=true;d.innerHTML=`<img src="${dogPic}" alt=""><b>WOOF!</b>`;$('flightUI').appendChild(d);
  const bt=document.createElement('button');bt.id='dogBtn';bt.setAttribute('aria-label','Ask Biscuit for a clue');bt.innerHTML=`<img src="${dogPic}" alt="">`;$('todBtn').before(bt);
  bt.addEventListener('click',e=>{e.stopPropagation();askBiscuit();});
  const st=document.createElement('style');st.textContent='#dogBtn{pointer-events:auto;padding:3px 5px;line-height:0;background:#fff0c4;box-shadow:inset -2px -2px 0 #b8902e, 0 2px 0 #0007}#dogBtn img{width:32px;height:32px;image-rendering:pixelated;display:block}#dogpop{z-index:6;position:fixed;right:calc(var(--sr) + 56px);bottom:calc(var(--sb) + 150px);display:flex;align-items:center;gap:6px;background:var(--paper);color:var(--ink);padding:4px 10px 4px 4px;box-shadow:4px 4px 0 #0008;font-family:var(--mono);font-size:20px;pointer-events:none;animation:pop .4s}#dogpop img{width:44px;height:44px;image-rendering:pixelated}';document.head.appendChild(st);})();
let dogPopT=0;
function dogPopTick(dt){if(dog.bark>1.5&&dogPopT<=0){dogPopT=2.2;$('dogpop').hidden=false;}if(dogPopT>0){dogPopT-=dt;if(dogPopT<=0)$('dogpop').hidden=true;}}

/* time of day: a little button in the top bar that steps sunrise → noon → golden → sunset → blue hour → night → stormy → sunrise */
const TOD_ICON=(()=>{const out={},I='#241c2e';
  const draw=(k,fn)=>{const c=document.createElement('canvas');c.width=c.height=16;const x=c.getContext('2d'),P=(col,a,b,w=1,h=1)=>{x.fillStyle=col;x.fillRect(a,b,w,h);};
    const disc=(cx,cy,r,col)=>{for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++)if(i*i+j*j<=r*r+r*.6)P(col,cx+i,cy+j);};fn(P,disc);out[k]=c.toDataURL();};
  draw('dawn',(P,d)=>{for(let y=0;y<16;y++)P(y<6?'#a8c6ea':y<10?'#fbe4b0':'#ffe08a',0,y,16,1);d(8,10,4,'#fff4b0');P('#4a90b8',0,12,16,4);P('#fff8d8',3,13,10,1);P('#ffffff',2,3,3,1);P('#ffffff',10,4,4,1);});
  draw('noon',(P,d)=>{P('#7fb8e8',0,0,16,16);for(const [a,b] of [[7,0],[7,14],[0,7],[14,7],[2,2],[12,2],[2,12],[12,12]])P('#ffe07a',a,b,2,2);d(8,8,4,'#ffd34a');d(7,7,1,'#fff4c0');});
  draw('golden',(P,d)=>{for(let y=0;y<16;y++)P(y<6?'#9c94d8':y<10?'#f0a868':'#ffc48a',0,y,16,1);d(8,10,4,'#ffe07a');P('#3d7ea0',0,12,16,4);P('#a8d8e0',3,13,10,1);});
  draw('sunset',(P,d)=>{for(let y=0;y<16;y++)P(y<5?'#7d68b4':y<9?'#e2703f':'#ff9a5a',0,y,16,1);d(8,11,4,'#ffb04a');P('#283a74',0,11,16,5);P('#ffa060',4,12,8,1);P('#ffa060',6,14,4,1);});
  draw('dusk',(P,d)=>{for(let y=0;y<16;y++)P(y<7?'#3a3a78':y<11?'#6b6aa8':'#c88aa8',0,y,16,1);P('#1d3560',0,12,16,4);P('#ffffff',3,3);P('#ffffff',11,2);P('#ffc8a8',4,12,8,1);});
  draw('night',(P,d)=>{P('#151a38',0,0,16,16);d(8,7,5,'#f4ecd0');d(10,5,4,'#151a38');for(const [a,b] of [[2,2],[13,3],[3,12],[12,12],[14,8]])P('#ffffff',a,b);});
  draw('storm',(P,d)=>{P('#5a6678',0,0,16,16);d(5,6,3,'#2e3442');d(10,5,4,'#2e3442');P('#2e3442',2,7,12,3);d(5,5,2,'#454c5c');d(10,4,3,'#454c5c');P('#ffe07a',8,10,2,2);P('#ffe07a',7,12,2,1);P('#ffe07a',8,13,1,2);for(const [a,b] of [[3,11],[4,14],[12,11],[11,14],[5,12],[13,13]])P('#b8dcf4',a,b,1,2);});
  return out;})();
function updTodBtn(){const b=$('todBtn');if(!b)return;b.innerHTML=`<img src="${TOD_ICON[tod]||TOD_ICON.noon}" alt="${(TOD[tod]||{}).name||''}">`;b.title=(TOD[tod]||{}).name||'';}
$('todBtn').addEventListener('click',e=>{e.stopPropagation();const ks=Object.keys(TOD),k=ks[(ks.indexOf(tod)+1)%ks.length];settings.light=k;saveS();setTOD(k);updTodBtn();toast(TOD[k].name,1.2);});

/* twinkles: a small blinking star over every landmark you haven't found yet (gold), and over each item an active errand still needs (white).
   Only within a couple of kilometres, hidden behind hills, and gone once found. */
const spark=(()=>{const MAX=80,g=new THREE.BufferGeometry(),pos=new Float32Array(MAX*3).fill(-1e5),col=new Float32Array(MAX*3);
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
  const m=new THREE.Points(g,new THREE.PointsMaterial({size:4,sizeAttenuation:false,vertexColors:true,fog:false}));m.frustumCulled=false;scene.add(m);return {g,pos,col,MAX,list:[],t:0};})();
function updSpark(dt,t){spark.t-=dt;const P=camera.position;
  if(spark.t<=0){spark.t=.4;const L=[];const far=(x,z)=>Math.hypot(P.x-x,P.z-z)>2800;
    for(const [k,v] of Object.entries(sights)){if(log.sights[k]||!sightOn(v)||far(v.x,v.z))continue;L.push({x:v.x,y:Math.max(v.y,groundH(v.x,v.z),0)+30,z:v.z,c:[1,.82,.35],ph:hash2(k.length,k.charCodeAt(0),7)});}
    for(const id of activeErrands()){const e=ERRANDS[id];if(!e.set)continue;FINDS[e.set].forEach((p,i)=>{if(errState(id).found.includes(i))return;if(!far(p.x,p.z))L.push({o:p,dy:22,c:[.75,1,1],ph:i*.37,fast:1});});}
    spark.list=L.slice(0,spark.MAX);}
  const show=mode!=='title';
  for(let i=0;i<spark.MAX;i++){const L=spark.list[i],j=i*3;if(!L||!show){spark.pos[j+1]=-1e5;continue;}
    const ph=(t*(L.fast?1.3:.8)+L.ph)%1,on=true;const x=L.o?L.o.x:L.x,y=L.o?L.o.y+L.dy:L.y,z=L.o?L.o.z:L.z;
    spark.pos[j]=x;spark.pos[j+1]=on?y:-1e5;spark.pos[j+2]=z;const k=ph<.3?1.15-ph/.3*.3:.45;spark.col[j]=L.c[0]*k;spark.col[j+1]=L.c[1]*k;spark.col[j+2]=L.c[2]*k;}
  spark.g.attributes.position.needsUpdate=true;spark.g.attributes.color.needsUpdate=true;}
/* ---------- save and resume: where you are, so closing the app doesn't lose your flight ---------- */
const RESUME='tac-resume';
function saveResume(){if(mode==='crashed'){store.set(RESUME,null);return;}if(!['fly','card','paused'].includes(mode))return;if(!Number.isFinite(ac.pos.x+ac.pos.y+ac.vel.x+ac.q.w))return;
  store.set(RESUME,{v:1,ts:Date.now(),pos:ac.pos.toArray(),vel:ac.vel.toArray(),q:ac.q.toArray(),ground:ac.ground,gYaw:ac.gYaw,gPitch:ac.gPitch,u:ac.u,throttle:ac.throttle,flaps:ac.flaps,trim:ac.trim,light:ac.light,
    lastField:ac.lastField,from:ac.from,dest:dest&&dest.id,cam:camMode});}
let resT=0;anims.push(t=>{if(t-resT>3){resT=t;saveResume();}});
addEventListener('pagehide',saveResume);document.addEventListener('visibilitychange',()=>{if(document.hidden)saveResume();});
function resumeFlight(r){resetAc();ac.pos.fromArray(r.pos);ac.vel.fromArray(r.vel);ac.q.fromArray(r.q);ac.ground=!!r.ground;ac.gYaw=r.gYaw||0;ac.gPitch=r.gPitch||0;ac.u=r.u||0;ac.throttle=r.throttle||0;ac.flaps=r.flaps||0;ac.trim=r.trim??.06;ac.light=!!r.light;
  ac.lastField=stripById(r.lastField)?r.lastField:'harbor';ac.from=r.from==='__approach'?ac.lastField:(r.from||ac.lastField);dest=stripById(r.dest)||null;if(!dest)pickDest(ac.lastField);
  $('title').hidden=true;startFly();setView(r.cam==='cockpit'?'cockpit':camMode);snapCam=true;toast('Welcome back. Picking up right where you left off.',2.6);}
/* title screen: two buttons. With a saved flight: pick up where you left off, or start at a field.
   Without one: start the day at Harbor Field, or start at a field. Everything else lives in the pause menu. */
function titleButtons(){const r=store.get(RESUME,null),ok=!!(r&&r.pos&&Date.now()-r.ts<1000*3600*24*60);let b=$('tResume');
  if(ok&&!b){b=document.createElement('button');b.className='primary';b.id='tResume';b.textContent='Pick up where you left off';$('tFly').before(b);
    b.addEventListener('click',()=>{const r2=store.get(RESUME,null);if(r2)resumeFlight(r2);});}
  if(b)b.hidden=!ok;$('tFly').hidden=ok;}
titleButtons();
/* ---------- tailwind streaks: air streaming off the wingtips and the trailing edge while a gust is blowing ---------- */
const streaks=(()=>{const SRC=[[-5.2,.8,.3,1],[5.2,.8,.3,1],[-5.2,.95,.3,1],[5.2,.95,.3,1],[-2.8,.82,.3,.5],[2.8,.82,.3,.5],[-.9,1.6,2.2,.35],[.9,1.6,2.2,.35]],N=28;
  const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:false,uniforms:{k:{value:0}},
    vertexShader:'attribute float a;varying float vA;void main(){vA=a;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'uniform float k;varying float vA;void main(){gl_FragColor=vec4(1.,.99,.94,vA*k);}'});
  const L=SRC.map(s=>{const g=new THREE.BufferGeometry(),P=new Float32Array(N*3),A=new Float32Array(N);for(let i=0;i<N;i++)A[i]=Math.pow(1-i/(N-1),1.4)*s[3];
    g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('a',new THREE.BufferAttribute(A,1));const l=new THREE.Line(g,mat);l.frustumCulled=false;l.visible=false;scene.add(l);return {l,P,s,fresh:true};});
  const w=new V3();let k=0,last=-1;
  anims.push(t=>{const dt=last<0?0:clamp(t-last,0,.1);last=t;const on=mode==='fly'&&!ac.ground&&(ac.bst||0)>.02;k=lerp(k,on?Math.min(ac.bst*1.1,1):0,1-Math.exp(-dt*(on?6:2.5)));mat.uniforms.k.value=k;if(k>=.01)plane.updateMatrixWorld();
    for(const S of L){if(k<.01){S.l.visible=false;S.fresh=true;continue;}S.l.visible=true;w.set(S.s[0],S.s[1],S.s[2]);plane.localToWorld(w);
      if(S.fresh){for(let i=0;i<N;i++)S.P.set([w.x,w.y,w.z],i*3);S.fresh=false;}else{S.P.copyWithin(3,0,(N-1)*3);S.P[0]=w.x;S.P[1]=w.y;S.P[2]=w.z;}
      S.l.geometry.attributes.position.needsUpdate=true;}});
  // air rushing past the windshield (you can't see the wingtips from the cockpit)
  const NR=34,RP=new Float32Array(NR*6),RA=new Float32Array(NR*2),rs=[];for(let i=0;i<NR;i++){let x,y;do{x=(Math.random()-.5)*16;y=(Math.random()-.5)*9;}while(Math.hypot(x,y*1.4)<3.2);rs.push({x,y,z:-Math.random()*90,l:3+Math.random()*5});RA[i*2]=.9;RA[i*2+1]=0;}
  const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.BufferAttribute(RP,3));rg.setAttribute('a',new THREE.BufferAttribute(RA,1));const rush=new THREE.LineSegments(rg,mat);rush.frustumCulled=false;rush.visible=false;plane.add(rush);
  let rl=-1;anims.push(t=>{const rdt=rl<0?0:clamp(t-rl,0,.1);rl=t;rush.visible=k>.01&&camMode==='cockpit';if(!rush.visible)return;const v=(ac.ias+(ac.bst||0)*22)*1.1*rdt;for(let i=0;i<NR;i++){const r=rs[i];r.z+=v*(1+r.l*.1);if(r.z>4){r.z=-70-Math.random()*30;}
      RP.set([r.x,r.y,r.z,r.x,r.y,r.z-r.l*(.6+k)],i*6);}rg.attributes.position.needsUpdate=true;});
  return {L};})();

/* ---------- updates: an installed copy on the phone can sit in memory for days without reloading, so it never sees a
   new version. When the game comes back to the front (and every ten minutes), check the build number on the site; if
   it's changed, reload straight away from the title screen, or offer a one-tap update in flight (the flight is saved
   first, so "Pick up where you left off" puts you right back) */
const BUILD_ID='__BUILD__';let updOffered=false;
function checkUpdate(){if(!/^https?:/.test(location.protocol)||/claude/.test(location.hostname))return;
  fetch('version.txt?'+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.text():null).then(v=>{v=v&&v.trim();if(!v||v===BUILD_ID||v.length>12)return;
    if(mode==='title'){location.reload();return;}if(updOffered)return;updOffered=true;
    const b=document.createElement('button');b.id='updBtn';b.textContent='Update ready · tap to load it';b.style.cssText='position:fixed;left:50%;top:calc(var(--st,0px) + 46px);transform:translateX(-50%);z-index:40;font-size:15px;padding:6px 12px';
    b.addEventListener('click',()=>{if(typeof saveResume==='function')saveResume();location.reload();});document.body.appendChild(b);}).catch(()=>{});}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkUpdate();});addEventListener('pageshow',checkUpdate);setInterval(checkUpdate,10*60*1000);setTimeout(checkUpdate,4000);
