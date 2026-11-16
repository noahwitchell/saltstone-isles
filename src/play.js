/* ---------- score, fly-through gaps, errands, and Biscuit the dog ---------- */
if(log.score==null)log.score=0;if(!log.gates)log.gates={};if(!log.errands)log.errands={};if(!log.gateHint)log.gateHint={};
if(settings.dog==null)settings.dog=true;
function updScore(){const e=$('score');if(e)e.textContent='★ '+log.score.toLocaleString();}
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
  buoys:{giver:'ollie',set:'buoys',what:'orange buoys',one:'an orange buoy',ask:"Dad's lobster-pot buoys broke loose in the storm. Six orange ones with little flags, all round the cay somewhere. Can you spot them for me?",thanks:"You found them! I'm going to row out with Dad and get every one. You're officially strip crew now."},
  nests:{giver:'ada',set:'nests',what:'osprey nests',one:'an osprey nest',ask:"The ospreys are back on Tallpine. Big stick nests on dead trees, six of them if they all came home. Count them for me from up there?",thanks:"All of them came home. I'll write it in the book in my best handwriting."},
  kites:{giver:'hattie',set:'kites',what:'kites',one:'a kite',ask:"The school kite day got away from us. Six kites stuck in the orchard trees, flapping about. Find them so I can send the children up ladders?",thanks:"Every one! The children will be thrilled. The trees less so."},
  goats:{giver:'tam',set:'goats',what:'goats',one:'a goat',ask:"Five of my goats went over the bridge and down the canyon ledges. White ones. Spot them and I'll go and talk them home.",thanks:"Five goats! They'll pretend they weren't lost. Goats are like that."},
  cairns:{giver:'kit',set:'cairns',what:'trail cairns',one:'a cairn',ask:"I've built six cairns with orange flags to mark the high trail. I need to know they're all still standing after the wind. Have a look?",thanks:"All six standing. That's the trail open for summer, then."},
  lanterns:{giver:'lu',set:'lanterns',what:'paper lanterns',one:'a lantern',ask:"Seven festival lanterns floated off last night. They're still up there, glowing, drifting round the key. Find them all and I'll light you one of your own.",thanks:"Seven! Every lantern came home. This one is yours, pilot. Hang it in your cockpit."},
  sheep:{giver:'agnes',set:'sheep',what:'red sheep',one:'a red sheep',ask:"My ewes are marked red so I can find them. Six have wandered off along the ridge. You'll see them better than I will.",thanks:"That's my six. I'll take the dog out. Not your dog. Mine's less clever."},
  heart:{giver:'lio',sight:'heart',what:'the heart-shaped island',ask:"Sailors talk about an island shaped like a heart, somewhere between Ferrow and Applecross. I'd love to paint it. Find it and come and tell me?",thanks:"A heart! Just as they said. I'll paint it from your description. Then I'll paint it again."},
  meteor:{giver:'odile',sight:'meteor',what:'the fallen star',ask:"Desmond on the Saltpans says a star fell there once. A real meteorite would be wonderful. Find it and report back?",thanks:"A ring of scorched stone and a black heart in the middle. That's a meteorite. I'm writing to three universities."},
  wreck:{giver:'wren',sight:'wreck',what:'the wreck on Tern Bars',ask:"There's an old wreck out on the sandbars to the east, past Lantern Key. I've only heard about it. Find it and tell me what it's called?",thanks:"The Merrow! My grandfather sailed on her. Thank you for finding her."},
};
const errState=id=>log.errands[id]||(log.errands[id]={st:'new',found:[]});
function errCount(id){const e=ERRANDS[id],s=errState(id);return e.set?{n:s.found.length,of:FINDS[e.set].length}:{n:log.sights[e.sight]?1:0,of:1};}
function errLine(id){const e=ERRANDS[id],c=errCount(id);return e.set?`${c.n} of ${c.of} ${e.what}`:(c.n?`Found ${e.what}`:`Looking for ${e.what}`);}
function activeErrands(){return Object.keys(ERRANDS).filter(k=>errState(k).st==='active');}
function updErrandUI(){const b=$('errand');if(!b)return;const a=activeErrands();if(!a.length){b.hidden=true;return;}b.hidden=false;b.textContent=a.map(k=>{const c=errCount(k),g=CHARS[ERRANDS[k].giver];return `${g.name.split(' ')[0].toUpperCase()}: ${ERRANDS[k].set?c.n+'/'+c.of:(c.n?'FOUND':'?')}`;}).join(' · ');}
let findT=0;
function checkFinds(dt){findT+=dt;if(findT<.3)return;findT=0;
  for(const id of activeErrands()){const e=ERRANDS[id],s=errState(id);
    if(e.set){FINDS[e.set].forEach((p,i)=>{if(s.found.includes(i))return;if(Math.hypot(ac.pos.x-p.x,ac.pos.z-p.z)<140&&ac.pos.y-p.y<300){s.found.push(i);addScore(50);snd.beep(1320);
        const c=errCount(id),g=CHARS[e.giver];toast(c.n<c.of?`Found ${e.one}! ${c.n} of ${c.of} · +50`:`That's all ${c.of} ${e.what}! · +50\nFly back to ${g.name.split(' ')[0]} at ${stripById(g.home).name} to report.`,c.n<c.of?2.2:4);updErrandUI();}});}
    else if(log.sights[e.sight]&&!s.told){s.told=1;saveL();const g=CHARS[e.giver];toast(`That's ${e.what}! Fly back to ${g.name.split(' ')[0]} at ${stripById(g.home).name} to tell them.`,4);updErrandUI();}}}
/* buttons for a landing card: report back, or a new favour from someone who lives here */
function errandBtns(s){const out=[];
  for(const id of activeErrands()){const e=ERRANDS[id];if(CHARS[e.giver].home!==s.id)continue;const c=errCount(id);out.push([`Report to ${CHARS[e.giver].name.split(' ')[0]} (${e.set?c.n+'/'+c.of:c.n?'found':'not yet'})`,()=>reportErrand(id,s)]);}
  if(!out.length&&mode!=='title'){const id=Object.keys(ERRANDS).find(k=>{const e=ERRANDS[k];return CHARS[e.giver].home===s.id&&errState(k).st==='new'&&(!e.sight||!log.sights[e.sight]);});
    if(id)out.push([`${CHARS[ERRANDS[id].giver].name.split(' ')[0]} has a favour to ask`,()=>offerErrand(id,s)]);}
  return out;}
const afterBtns=s=>[['Take off',()=>spawnField(s),true],['Look around first',()=>{hideModal();mode='fly';}]];
function offerErrand(id,s){const e=ERRANDS[id],c=CHARS[e.giver],meet=!log.met[e.giver];if(meet){log.met[e.giver]=1;saveL();}
  showCard(`<div class="who"><img src="${portrait(e.giver)}" alt=""><div><b>${c.name}</b><span>${c.role}</span></div></div>${meet?`<p class="say">“${MEET[e.giver]}”</p>`:''}<p class="say">“${e.ask}”</p>`,
    [['I\'ll keep an eye out',()=>{errState(id).st='active';saveL();updErrandUI();toast(`Errand: ${errLine(id)}. Biscuit will help sniff them out.`,3);showCard(`<h2>Errand accepted</h2><p>${e.set?`Find all ${FINDS[e.set].length} ${e.what}`:`Find ${e.what}`}, then land back here and report to ${c.name.split(' ')[0]}. Fly low and slow near them; Biscuit barks when one is close.</p>`,afterBtns(s));},true],
     ['Maybe later',()=>showCard(`<p class="say">“No hurry. It'll keep.”</p>`,afterBtns(s))]]);}
function reportErrand(id,s){const e=ERRANDS[id],c=CHARS[e.giver],n=errCount(id);
  if(n.n<n.of){showCard(`<div class="who"><img src="${portrait(e.giver)}" alt=""><div><b>${c.name}</b><span>${c.role}</span></div></div><p class="say">“${e.set?`${n.n} of ${n.of} so far? Keep looking, they're out there.`:`Not found it yet? It's out there somewhere.`}”</p>`,afterBtns(s));return;}
  const st=errState(id);st.st='done';const pts=e.set?200+n.of*30:300;addScore(pts);stamp(2);saveL();updErrandUI();
  if(Object.keys(ERRANDS).every(k=>errState(k).st==='done'))goal('errands',true);goal('errand',true);
  showCard(`<div class="who"><img src="${portrait(e.giver)}" alt=""><div><b>${c.name}</b><span>${c.role}</span></div></div><p class="say">“${e.thanks}”</p><div class="got">ERRAND DONE · +${pts} · +2 STAMPS</div>`,afterBtns(s));}

/* Biscuit: a scruffy golden dog with his head out of the right window */
const dog=(()=>{const g=new THREE.Group(),fur=0xe8a850,lt=0xf4e4c8,dk=0x2c2833;
  g.add(new THREE.Mesh(merge([{geo:BOX(.34,.3,.4),m:M([0,0,0]),color:fur},{geo:BOX(.22,.17,.24),m:M([0,-.05,-.28]),color:lt},{geo:BOX(.1,.08,.06),m:M([0,.02,-.41]),color:dk},
    {geo:BOX(.06,.06,.02),m:M([-.09,.07,-.205]),color:dk},{geo:BOX(.06,.06,.02),m:M([.09,.07,-.205]),color:dk},{geo:BOX(.2,.1,.12),m:M([0,.16,.02]),color:lt},{geo:BOX(.3,.24,.3),m:M([-.06,-.1,.28]),color:fur}]),litify(toon({},false))));
  const ear=s=>{const e=new THREE.Mesh(merge([{geo:BOX(.07,.26,.16).translate(0,-.13,0),m:M([0,0,0]),color:0xa8743e}]),litify(toon({},false)));e.position.set(s*.18,.12,.03);g.add(e);return e;};
  const eL=ear(-1),eR=ear(1),tongue=new THREE.Mesh(BOX(.08,.14,.03).translate(0,-.07,0),new THREE.MeshToonMaterial({color:0xe86a7a,gradientMap:gradTex}));tongue.position.set(.03,-.14,-.34);g.add(tongue);
  g.position.set(.8,.6,-1.5);g.scale.setScalar(1.8);plane.add(g);return {g,eL,eR,tongue,bark:0,yaw:0};})();
snd.woof=function(){if(!this.ctx||!settings.sound)return;const c=this.ctx,t0=c.currentTime;
  for(const [dt,f0] of [[0,520],[.2,480]]){const t=t0+dt,o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter(),n=c.createBufferSource();o.type='sawtooth';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f0*.42,t+.13);
    f.type='bandpass';f.frequency.value=900;f.Q.value=1.2;n.buffer=this.buf;const ng=c.createGain();ng.gain.value=.5;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.32,t+.012);g.gain.exponentialRampToValueAtTime(.001,t+.16);
    o.connect(f);n.connect(ng);ng.connect(f);f.connect(g);g.connect(this.master);o.start(t);o.stop(t+.2);n.start(t,Math.random());n.stop(t+.2);}};
const barked={};let barkCD=8,barkT=0,dogTarget=null;
function dogBark(dt){barkCD-=dt;barkT+=dt;if(barkT<1)return;barkT=0;if(!settings.dog||ac.ground||barkCD>0)return;
  const cand=[],P=ac.pos,near=(x,z,r)=>Math.hypot(P.x-x,P.z-z)<r;
  for(const [k,v] of Object.entries(sights))if(!log.sights[k]&&near(v.x,v.z,1150)&&P.y-v.y<900)cand.push({key:'s'+k,x:v.x,z:v.z,y:v.y,say:'something down there worth a look'});
  for(const g of FLYGATES)if(!log.gates[g.id]&&near(g.x,g.z,1000))cand.push({key:'g'+g.id,x:g.x,z:g.z,y:(g.y0+g.y1)/2,say:'a gap you could fly through'});
  for(const id of activeErrands()){const e=ERRANDS[id];if(!e.set)continue;FINDS[e.set].forEach((p,i)=>{if(!errState(id).found.includes(i)&&near(p.x,p.z,900))cand.push({key:'f'+id+i,x:p.x,z:p.z,y:p.y,say:e.one,hot:1});});}
  let best=null,bd=1e9;for(const c of cand){if(simT-(barked[c.key]||-1e9)<(c.hot?45:150))continue;const d=Math.hypot(P.x-c.x,P.z-c.z)-(c.hot?400:0);if(d<bd){bd=d;best=c;}}
  if(!best)return;barked[best.key]=simT;barkCD=best.hot?10:22;dogTarget=best;dog.bark=1.6;snd.woof();
  axes();const hdg=Math.atan2(_f.x,-_f.z),brg=Math.atan2(best.x-P.x,-(best.z-P.z));let rel=((brg-hdg)/DEG+540)%360-180;
  const dir=Math.abs(rel)<25?'dead ahead':Math.abs(rel)>150?'behind you':rel<0?(rel<-70?'off to the left':'ahead and to the left'):(rel>70?'off to the right':'ahead and to the right');
  const km=Math.hypot(P.x-best.x,P.z-best.z);tip('dog','That\'s Biscuit. He barks when he smells something worth seeing. Follow his nose.',4);
  toast(`Woof! Biscuit's nose points ${dir}${km<350?', right below':''}: ${best.say}.`,2.8);}
function updDog(dt,t){const U=plane.userData;dog.g.visible=U.bodyM.visible;if(!dog.g.visible)return;const sp=Math.min(ac.ias/45,1.3);
  dog.bark=Math.max(0,dog.bark-dt);const b=dog.bark>0?1:0;
  dog.eL.rotation.x=dog.eR.rotation.x=-sp*1.1+Math.sin(t*22)*.18*sp;dog.eL.rotation.z=-.3*sp-Math.sin(t*17)*.12*sp;dog.eR.rotation.z=.3*sp+Math.sin(t*19)*.12*sp;
  dog.tongue.rotation.x=-sp*.9+Math.sin(t*25)*.2;
  let yaw=0;if(b&&dogTarget){const lp=plane.worldToLocal(_c1.set(dogTarget.x,ac.pos.y,dogTarget.z));yaw=clamp(Math.atan2(-lp.x,-lp.z),-.8,.8);}
  dog.yaw=lerp(dog.yaw,yaw,1-Math.exp(-dt*6));dog.g.rotation.set(Math.sin(t*3)*.05-(b?Math.abs(Math.sin(t*14))*.25:0),dog.yaw,Math.sin(t*2.1)*.06);
  dog.g.position.x=.8+(b?.12:0)+Math.sin(t*1.3)*.02;dog.g.position.y=.6+(b?.06:0);}
function playChecks(dt){checkGates();checkFinds(dt);dogBark(dt);dogPopTick(dt);}
/* Biscuit's pixel portrait pops up beside the message when he barks */
const dogPic=(()=>{const c=document.createElement('canvas');c.width=c.height=32;const x=c.getContext('2d'),P=(col,a,b,w=1,h=1)=>{x.fillStyle=col;x.fillRect(a,b,w,h);};
  P('#9cc3e6',0,0,32,32);P('#86b0d8',0,24,32,8);const fur='#e8a850',dk='#b87a38',lt='#f6e6c8';
  P(fur,8,9,16,15);P(fur,9,8,14,1);P(fur,7,11,1,10);P(fur,24,11,1,10);P(dk,4,8,5,11);P(dk,23,8,5,11);P(dk,5,19,3,3);P(dk,24,19,3,3);
  P(lt,14,8,4,8);P(lt,11,17,10,7);P('#2a2230',14,17,4,3);P('#2a2230',11,13,2,2);P('#2a2230',19,13,2,2);P('#ffffff',11,13,1,1);P('#ffffff',19,13,1,1);
  P('#2a2230',13,22,6,1);P('#e86a7a',16,23,3,4);P('#c84a5a',17,26,1,1);P('#c2453a',9,25,14,2);P('#ffd36b',15,26,2,2);return c.toDataURL();})();
(function(){const d=document.createElement('div');d.id='dogpop';d.hidden=true;d.innerHTML=`<img src="${dogPic}" alt=""><b>WOOF!</b>`;$('flightUI').appendChild(d);
  const st=document.createElement('style');st.textContent='#dogpop{position:fixed;right:calc(var(--sr) + 8px);bottom:calc(var(--sb) + 150px);display:flex;align-items:center;gap:6px;background:var(--paper);color:var(--ink);padding:4px 10px 4px 4px;box-shadow:4px 4px 0 #0008;font-family:var(--mono);font-size:20px;pointer-events:none;animation:pop .4s}#dogpop img{width:44px;height:44px;image-rendering:pixelated}';document.head.appendChild(st);})();
let dogPopT=0;
function dogPopTick(dt){if(dog.bark>1.5&&dogPopT<=0){dogPopT=2.2;$('dogpop').hidden=false;}if(dogPopT>0){dogPopT-=dt;if(dogPopT<=0)$('dogpop').hidden=true;}}
