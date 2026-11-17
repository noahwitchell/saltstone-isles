/* ---------- your co-pilot: pick the animal, its colours, the noise it makes and its name ----------
   Biscuit the golden dog is the default. The companion keeps the same rig (head with two ears and a tongue, and a
   chest, haunches and tail for the cockpit seat); each species swaps the shapes, so every animation still works.
   Chosen in the Hangar; saved in settings.pet. Anywhere the game says "Biscuit", it says your companion's name. */
const PET_SPECIES={
  dog:{label:'Dog',name:'Biscuit',snd:'woof',cols:[['Golden','#e8a850','#f4e4c8','#a8743e'],['Chocolate','#7a4a2e','#c8a080','#4e2e1c'],['Black','#3a3036','#c88a50','#221c22'],['Grey','#8a8a92','#d8d8dc','#5a5a62'],['Snowy','#f2eee6','#ffffff','#b8b0a8']]},
  cat:{label:'Cat',name:'Pepper',snd:'meow',cols:[['Ginger','#e88a3a','#f8dcb8','#b8622a'],['Black','#2e2a32','#4a4450','#16141a'],['Tabby','#8e8a90','#d8d2cc','#5e5a62'],['White','#f4f0ea','#ffffff','#e8a8b0'],['Cream','#e8d2a8','#fff4e0','#b89a70']]},
  frog:{label:'Frog',name:'Lily',snd:'ribbit',cols:[['Green','#5fae4a','#c8e07a','#3a7a30'],['Blue','#3f8fd0','#a8d8f0','#24548a'],['Red','#e2503a','#f0a060','#2c2833'],['Yellow','#f0cc3a','#fff0a0','#a8802a']]},
  bird:{label:'Bird',name:'Captain',snd:'tweet',cols:[['Green','#4ca850','#f0e070','#2f7a3a'],['Blue','#3f7fd0','#f0c83a','#2a5a9a'],['Scarlet','#d83a2e','#f2c040','#2a5ab0'],['Cockatiel','#b8b4b0','#f4e06a','#8a8682']]},
  axolotl:{label:'Axolotl',name:'Noodle',snd:'bloop',cols:[['Pink','#f4b4c4','#fbe0e6','#e2607e'],['Gold','#f0c86a','#fbe8b0','#e8865a'],['Wild','#6a7a54','#a8b48a','#8a4a5e'],['Blue','#8ab0cc','#cfe2ee','#5a74b0'],['Black','#3a3640','#5a5462','#7a4a6a']]},
  bunny:{label:'Bunny',name:'Clover',snd:'squeak',cols:[['White','#f4f0ea','#ffffff','#f0b8c0'],['Brown','#9a6a48','#e8d4b8','#6a4a30'],['Grey','#9a96a0','#e0dce2','#6a666e'],['Black','#3a3438','#ece6e0','#241e22']]},
};
const PET_SOUNDS={bloop:['Bloop','BLOOP!'],woof:['Woof','WOOF!'],meow:['Meow','MEOW!'],ribbit:['Ribbit','RIBBIT!'],tweet:['Tweet','TWEET!'],squeak:['Squeak','SQUEAK!'],quack:['Quack','QUACK!']};
if(!settings.pet||!PET_SPECIES[settings.pet.sp])settings.pet={sp:'dog',col:0,snd:'woof',name:'Biscuit'};
const petName=()=>settings.pet.name||PET_SPECIES[settings.pet.sp].name;
const hx=s=>parseInt(s.slice(1),16);
/* shapes per species. Head faces -z. Ears pivot where they join the head. Empty parts get a speck */
const SPECK=[{geo:BOX(.001,.001,.001),m:M([0,0,0]),color:0}];
function petParts(sp,f,l,d){const dk=0x2c2833,pink=0xe86a7a;
  if(sp==='dog')return {head:[{geo:BOX(.34,.3,.4),m:M([0,0,0]),color:f},{geo:BOX(.22,.17,.24),m:M([0,-.05,-.28]),color:l},{geo:BOX(.1,.08,.06),m:M([0,.02,-.41]),color:dk},{geo:BOX(.06,.06,.02),m:M([-.09,.07,-.205]),color:dk},{geo:BOX(.06,.06,.02),m:M([.09,.07,-.205]),color:dk},{geo:BOX(.2,.1,.12),m:M([0,.16,.02]),color:l},{geo:BOX(.3,.24,.3),m:M([-.06,-.1,.28]),color:f}],
    ear:[{geo:BOX(.07,.26,.16).translate(0,-.13,0),m:M([0,0,0]),color:d}],earR:null,tongue:true,
    chest:[{geo:BOX(.3,.44,.3),m:M([0,-.3,.12]),color:f},{geo:BOX(.2,.3,.04),m:M([0,-.33,-.04]),color:l}],
    rest:[{geo:BOX(.34,.32,.5),m:M([0,-.55,.42],[-.35,0,0]),color:f},{geo:BOX(.42,.32,.36),m:M([0,-.68,.62]),color:f},...[-1,1].map(e=>({geo:BOX(.09,.38,.09),m:M([e*.09,-.62,-.02]),color:f})),...[-1,1].map(e=>({geo:BOX(.11,.07,.15),m:M([e*.09,-.82,-.07]),color:l})),...[-1,1].map(e=>({geo:BOX(.12,.14,.24),m:M([e*.2,-.78,.55]),color:f}))],
    tail:[{geo:BOX(.07,.07,.3).translate(0,0,.15),m:M([0,0,0]),color:f},{geo:BOX(.08,.08,.08),m:M([0,0,.32]),color:l}],earY:.12};
  if(sp==='cat')return {head:[{geo:BOX(.32,.27,.3),m:M([0,0,0]),color:f},{geo:BOX(.16,.09,.08),m:M([0,-.07,-.17]),color:l},{geo:BOX(.05,.04,.03),m:M([0,-.03,-.215]),color:pink},{geo:BOX(.07,.05,.02),m:M([-.08,.04,-.155]),color:0x6ac850},{geo:BOX(.07,.05,.02),m:M([.08,.04,-.155]),color:0x6ac850},{geo:BOX(.02,.04,.021),m:M([-.08,.04,-.157]),color:dk},{geo:BOX(.02,.04,.021),m:M([.08,.04,-.157]),color:dk},{geo:BOX(.26,.2,.24),m:M([0,-.06,.24]),color:f}],
    ear:[{geo:new THREE.ConeGeometry(.075,.15,4).translate(0,.075,0),m:M([0,0,0],[0,Math.PI/4,0]),color:f},{geo:new THREE.ConeGeometry(.04,.09,4).translate(0,.05,-.02),m:M([0,0,0],[0,Math.PI/4,0]),color:l}],earR:null,tongue:false,
    chest:[{geo:BOX(.26,.4,.26),m:M([0,-.28,.12]),color:f},{geo:BOX(.16,.26,.04),m:M([0,-.3,-.02]),color:l}],
    rest:[{geo:BOX(.3,.3,.46),m:M([0,-.55,.4],[-.3,0,0]),color:f},{geo:BOX(.36,.28,.32),m:M([0,-.66,.6]),color:f},...[-1,1].map(e=>({geo:BOX(.07,.36,.07),m:M([e*.08,-.6,-.02]),color:f})),...[-1,1].map(e=>({geo:BOX(.09,.06,.12),m:M([e*.08,-.8,-.06]),color:l}))],
    tail:[{geo:BOX(.05,.05,.3).translate(0,0,.15),m:M([0,0,0]),color:f},{geo:BOX(.05,.05,.26).translate(0,0,.13),m:M([0,.12,.28],[-1,0,0]),color:d}],earY:.13,earX:.1,stiff:true};
  if(sp==='frog')return {head:[{geo:BOX(.44,.2,.36),m:M([0,-.03,0]),color:f},{geo:BOX(.4,.06,.3),m:M([0,-.12,-.02]),color:l},{geo:BOX(.36,.015,.02),m:M([0,-.08,-.18]),color:dk},{geo:BOX(.03,.02,.02),m:M([-.06,.0,-.185]),color:dk},{geo:BOX(.03,.02,.02),m:M([.06,.0,-.185]),color:dk},{geo:BOX(.36,.2,.26),m:M([0,-.08,.26]),color:f}],
    ear:[{geo:new THREE.SphereGeometry(.085,8,6).translate(0,.04,0),m:M([0,0,0]),color:f},{geo:new THREE.SphereGeometry(.06,8,6).translate(0,.06,-.05),m:M([0,0,0]),color:0xf4f0e0},{geo:BOX(.05,.04,.02),m:M([0,.065,-.105]),color:dk}],earR:null,tongue:'frog',
    chest:[{geo:BOX(.34,.34,.32),m:M([0,-.24,.12]),color:f},{geo:BOX(.26,.26,.04),m:M([0,-.26,-.04]),color:l}],
    rest:[{geo:BOX(.42,.26,.46),m:M([0,-.5,.34]),color:f},...[-1,1].map(e=>({geo:BOX(.1,.14,.4),m:M([e*.25,-.56,.4]),color:d})),...[-1,1].map(e=>({geo:BOX(.14,.04,.14),m:M([e*.13,-.64,-.04]),color:l}))],
    tail:SPECK,earY:.07,earX:.13,stiff:true};
  if(sp==='bird')return {head:[{geo:BOX(.26,.27,.27),m:M([0,0,0]),color:f},{geo:BOX(.2,.14,.06),m:M([0,-.03,-.13]),color:l},{geo:new THREE.ConeGeometry(.07,.16,4).rotateX(-Math.PI/2).translate(0,-.03,-.22),m:M([0,0,0],[0,0,Math.PI/4]),color:0xf0c040},{geo:BOX(.05,.05,.02),m:M([-.08,.05,-.145]),color:dk},{geo:BOX(.05,.05,.02),m:M([.08,.05,-.145]),color:dk},{geo:BOX(.22,.22,.22),m:M([0,-.06,.2]),color:f}],
    ear:[{geo:BOX(.04,.16,.09).translate(0,.08,0),m:M([0,0,0],[-.4,0,0]),color:d},{geo:BOX(.035,.12,.07).translate(0,.06,.06),m:M([0,0,0],[-.7,0,0]),color:l}],earR:SPECK,tongue:false,
    chest:[{geo:BOX(.26,.42,.26),m:M([0,-.28,.12]),color:f},{geo:BOX(.18,.3,.04),m:M([0,-.3,-.02]),color:l},...[-1,1].map(e=>({geo:BOX(.05,.34,.24),m:M([e*.15,-.32,.18]),color:d}))],
    rest:[{geo:BOX(.24,.24,.28),m:M([0,-.54,.24]),color:f},...[-1,1].map(e=>({geo:BOX(.04,.14,.04),m:M([e*.06,-.7,.14]),color:0x8a8890}))],
    tail:[{geo:BOX(.12,.04,.4).translate(0,0,.2),m:M([0,0,0]),color:d},{geo:BOX(.06,.03,.3).translate(0,0,.15),m:M([0,.02,.05]),color:f}],earY:.13,earX:0,stiff:true};
  if(sp==='axolotl')return {head:[{geo:BOX(.42,.22,.34),m:M([0,-.02,0]),color:f},{geo:BOX(.38,.06,.3),m:M([0,-.12,-.01]),color:l},{geo:BOX(.3,.015,.02),m:M([0,-.07,-.175]),color:dk},{geo:BOX(.04,.025,.02),m:M([-.14,-.06,-.172]),color:dk},{geo:BOX(.04,.025,.02),m:M([.14,-.06,-.172]),color:dk},
      {geo:BOX(.045,.045,.02),m:M([-.12,.04,-.172]),color:dk},{geo:BOX(.045,.045,.02),m:M([.12,.04,-.172]),color:dk},{geo:BOX(.36,.2,.26),m:M([0,-.06,.26]),color:f}],
    ear:[0,1,2].map(k=>({geo:BOX(.03,.2,.05).translate(0,.1,0),m:M([0,-.02+k*.035,.06-k*.06],[-.5-k*.35,0,0]),color:d})).concat([0,1,2].map(k=>({geo:BOX(.034,.06,.06),m:M([0,.16-k*.02,-.02-k*.1],[-.5-k*.35,0,0]),color:d}))),earR:null,tongue:false,
    chest:[{geo:BOX(.3,.36,.3),m:M([0,-.26,.12]),color:f},{geo:BOX(.2,.26,.04),m:M([0,-.28,-.03]),color:l}],
    rest:[{geo:BOX(.32,.26,.5),m:M([0,-.52,.36]),color:f},...[-1,1].map(e=>({geo:BOX(.08,.2,.08),m:M([e*.17,-.62,.0]),color:f})),...[-1,1].map(e=>({geo:BOX(.08,.18,.08),m:M([e*.17,-.62,.5]),color:f}))],
    tail:[{geo:BOX(.08,.2,.5).translate(0,0,.25),m:M([0,0,0]),color:f},{geo:BOX(.03,.32,.46).translate(0,0,.25),m:M([0,0,.04]),color:l}],earY:.0,earX:.2,stiff:true};
  /* bunny */
  return {head:[{geo:BOX(.3,.27,.32),m:M([0,0,0]),color:f},{geo:BOX(.16,.1,.08),m:M([0,-.07,-.17]),color:l},{geo:BOX(.05,.04,.03),m:M([0,-.03,-.215]),color:pink},{geo:BOX(.05,.06,.02),m:M([-.08,.04,-.165]),color:dk},{geo:BOX(.05,.06,.02),m:M([.08,.04,-.165]),color:dk},{geo:BOX(.26,.22,.24),m:M([0,-.06,.24]),color:f}],
    ear:[{geo:BOX(.075,.38,.05).translate(0,.19,0),m:M([0,0,0]),color:f},{geo:BOX(.04,.3,.02).translate(0,.17,-.026),m:M([0,0,0]),color:d}],earR:null,tongue:false,
    chest:[{geo:BOX(.28,.38,.28),m:M([0,-.27,.12]),color:f},{geo:BOX(.18,.26,.04),m:M([0,-.29,-.02]),color:l}],
    rest:[{geo:BOX(.36,.32,.42),m:M([0,-.56,.4]),color:f},...[-1,1].map(e=>({geo:BOX(.12,.08,.3),m:M([e*.14,-.7,.3]),color:f})),...[-1,1].map(e=>({geo:BOX(.07,.2,.07),m:M([e*.07,-.6,0]),color:f}))],
    tail:[{geo:new THREE.IcosahedronGeometry(.09,0),m:M([0,0,.06]),color:l}],earY:.13,earX:.07,stiff:true};}
const _petDef={};
function applyPet(){const P=settings.pet,S=PET_SPECIES[P.sp],c=S.cols[P.col]||S.cols[0],f=hx(c[1]),l=hx(c[2]),d=hx(c[3]);const parts=petParts(P.sp,f,l,d);
  const set=(mesh,items)=>{mesh.geometry.dispose();mesh.geometry=merge(items);};
  set(dog.g.children[0],parts.head);set(dog.eL,parts.ear);set(dog.eR,parts.earR||parts.ear);
  const ex=parts.earX??.18,ey=parts.earY??.12;dog.eL.position.set(-ex,ey,.03);dog.eR.position.set(ex,ey,.03);
  dog.chest.geometry.dispose();dog.chest.geometry=merge([...parts.chest,{geo:BOX(.33,.07,.33),m:M([0,-.14,.12]),color:0xd2493c},{geo:BOX(.07,.07,.03),m:M([0,-.22,-.05]),color:0xf1c84a}]);
  const rest=dog.body.children.find(o=>o!==dog.chest&&o!==dog.tail);if(rest){rest.geometry.dispose();rest.geometry=merge(parts.rest);}
  set(dog.tail.children[0],parts.tail);
  _petDef.tongue=parts.tongue;_petDef.stiff=!!parts.stiff;dog.tongue.visible=parts.tongue===true;
  if(parts.tongue==='frog'){dog.tongue.material.color.setHex(0xf07a90);}
  const pic=petPic();for(const im of document.querySelectorAll('#dogBtn img,#dogpop img'))im.src=pic;
  const pb_=$('dogpop');if(pb_)pb_.querySelector('b').textContent=PET_SOUNDS[P.snd][1];const bt=$('dogBtn');if(bt)bt.setAttribute('aria-label','Ask '+petName()+' for a clue');}
/* little per-frame tweaks on top of the shared animation: stiff ears don't flop like a dog's, the frog's tongue only
   shoots out when it calls */
function updPet(t){if(!dog.root.visible)return;if(_petDef.stiff){dog.eL.rotation.x*=.35;dog.eR.rotation.x*=.35;dog.eL.rotation.z*=.4;dog.eR.rotation.z*=.4;}
  if(_petDef.tongue==='frog'){dog.tongue.visible=dog.bark>0;dog.tongue.scale.set(1,1+Math.abs(Math.sin(t*10))*2.5,1);}}
/* the noises: synthesised, short and silly */
snd.petCall=function(kind){if(!this.ctx||!settings.sound)return;kind=kind||settings.pet.snd;if(kind==='woof')return snd._woof();const c=this.ctx,t0=c.currentTime+.01;
  const voice=(t,f0,f1,dur,type,vol,lp,vib)=>{const o=c.createOscillator(),g=c.createGain(),fl=c.createBiquadFilter();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);
    if(vib){const l=c.createOscillator(),lg=c.createGain();l.frequency.value=vib[0];lg.gain.value=vib[1];l.connect(lg);lg.connect(o.frequency);l.start(t);l.stop(t+dur+.05);}
    fl.type='lowpass';fl.frequency.value=lp;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.02);g.gain.setValueAtTime(vol,t+dur*.7);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(fl);fl.connect(g);g.connect(this.master);o.start(t);o.stop(t+dur+.05);};
  if(kind==='meow'){voice(t0,520,760,.18,'sawtooth',.18,1800,[6,20]);voice(t0+.17,760,420,.32,'sawtooth',.18,1500,[6,25]);}
  else if(kind==='ribbit'){for(const k of [0,.2])voice(t0+k,160,120,.14,'square',.16,900,[45,60]);}
  else if(kind==='tweet'){for(const k of [0,.13,.26])voice(t0+k,2400,3600,.09,'sine',.14,6000,[30,200]);}
  else if(kind==='squeak'){voice(t0,1300,1900,.08,'triangle',.18,4000);voice(t0+.12,1500,2100,.08,'triangle',.16,4000);}
  else if(kind==='bloop'){for(const k of [0,.11,.2])voice(t0+k,300+k*900,900+k*1200,.07,'sine',.2,3000);}
  else if(kind==='quack'){for(const k of [0,.24])voice(t0+k,420,300,.17,'sawtooth',.2,1200,[28,40]);}};
if(!snd._woof)snd._woof=snd.woof;snd.woof=function(){snd.petCall();};
/* the pixel portrait for the clue button and the pop-up */
function petPic(){const P=settings.pet,S=PET_SPECIES[P.sp],c=S.cols[P.col]||S.cols[0],f=c[1],l=c[2],d=c[3];const cv=document.createElement('canvas');cv.width=cv.height=32;const x=cv.getContext('2d'),R=(col,a,b,w=1,h=1)=>{x.fillStyle=col;x.fillRect(a,b,w,h);},K='#2a2230';
  R('#9cc3e6',0,0,32,32);R('#86b0d8',0,24,32,8);
  if(P.sp==='dog'){R(f,8,9,16,15);R(f,9,8,14,1);R(f,7,11,1,10);R(f,24,11,1,10);R(d,4,8,5,11);R(d,23,8,5,11);R(d,5,19,3,3);R(d,24,19,3,3);R(l,14,8,4,8);R(l,11,17,10,7);R(K,14,17,4,3);R(K,11,13,2,2);R(K,19,13,2,2);R('#fff',11,13,1,1);R('#fff',19,13,1,1);R(K,13,22,6,1);R('#e86a7a',16,23,3,4);}
  else if(P.sp==='cat'){R(f,8,10,16,14);R(f,9,9,14,1);R(f,8,4,4,6);R(f,20,4,4,6);R(f,9,3,2,1);R(f,21,3,2,1);R(d,9,6,2,3);R(d,21,6,2,3);R(l,12,17,8,6);R('#6ac850',11,13,3,3);R('#6ac850',18,13,3,3);R(K,12,13,1,3);R(K,19,13,1,3);R('#e86a7a',15,18,2,2);R(K,14,20,4,1);R('#e8e0d8',5,18,6,1);R('#e8e0d8',21,18,6,1);}
  else if(P.sp==='frog'){R(f,5,12,22,12);R(f,7,11,18,1);R(f,6,6,7,7);R(f,19,6,7,7);R('#f4f0e0',7,7,5,5);R('#f4f0e0',20,7,5,5);R(K,9,8,2,3);R(K,22,8,2,3);R(l,8,18,16,6);R(K,8,17,16,1);R('#e86a7a',7,15,2,1);R('#e86a7a',23,15,2,1);}
  else if(P.sp==='bird'){R(f,9,8,14,16);R(f,10,7,12,1);R(d,13,3,3,5);R(d,16,4,2,4);R(l,10,15,12,9);R('#f0c040',13,15,6,3);R('#f0c040',14,18,4,2);R('#c08a20',15,19,2,2);R('#fff',10,11,4,4);R('#fff',18,11,4,4);R(K,11,12,2,2);R(K,19,12,2,2);R(d,6,16,3,8);R(d,23,16,3,8);}
  else if(P.sp==='axolotl'){R(f,6,11,20,13);R(f,7,10,18,1);for(const [a,b] of [[2,7],[1,11],[2,15],[27,7],[28,11],[27,15]])R(d,a,b,4,2);R(d,3,9,2,1);R(d,27,9,2,1);R(l,9,18,14,6);R(K,10,13,2,2);R(K,20,13,2,2);R('#fff',10,13,1,1);R('#fff',20,13,1,1);R(K,11,19,10,1);R(K,10,18,1,1);R(K,21,18,1,1);R('#f08aa0',9,17,2,1);R('#f08aa0',21,17,2,1);}
  else {R(f,8,11,16,13);R(f,9,10,14,1);R(f,10,1,4,10);R(f,18,1,4,10);R(d,11,2,2,8);R(d,19,2,2,8);R(l,12,17,8,6);R(K,11,14,2,2);R(K,19,14,2,2);R('#fff',11,14,1,1);R('#fff',19,14,1,1);R('#e86a7a',15,18,2,2);R(K,15,20,2,1);R('#fff',14,21,2,2);R('#fff',16,21,2,2);}
  R('#c2453a',9,25,14,2);R('#ffd36b',15,26,2,2);return cv.toDataURL();}
/* the companion section at the top of the Hangar */
function petPanel(){const P=settings.pet,S=PET_SPECIES[P.sp];
  const lum=c=>{const v=hx(c);return ((v>>16)*.3+((v>>8)&255)*.59+(v&255)*.11)/255;};
  const btn=(on,attr,label,bg)=>`<button ${attr} style="${bg?`background:${bg};color:${lum(bg)<.45?'#fff8ec':'#241c2e'};`:''}min-width:44px;padding:6px 10px;font-size:14px;${on?'outline:3px solid #241c2e;outline-offset:1px;':''}">${label}</button>`;
  return `<h3>YOUR CO-PILOT</h3><div class="who" style="margin:4px 0 8px"><img src="${petPic()}" alt="" style="width:64px;height:64px"><div><input id="petName" value="${petName().replace(/"/g,'&quot;')}" maxlength="14" aria-label="Your co-pilot's name" style="font:inherit;font-size:20px;padding:4px 8px;border:2px solid #241c2e;background:#fff8ec;color:var(--ink);width:170px;-webkit-user-select:text;user-select:text"><span>${S.label.toUpperCase()} · ${(S.cols[P.col]||S.cols[0])[0].toUpperCase()} · SAYS ${PET_SOUNDS[P.snd][0].toUpperCase()}</span></div></div>
    <div class="btns" style="margin:4px 0">${Object.entries(PET_SPECIES).map(([k,s])=>btn(k===P.sp,`data-psp="${k}"`,s.label)).join('')}</div>
    <div class="btns" style="margin:4px 0">${S.cols.map((c,i)=>btn(i===P.col,`data-pcol="${i}" aria-label="${c[0]}"`,c[0],c[1])).join('')}</div>
    <div class="btns" style="margin:4px 0 10px">${Object.entries(PET_SOUNDS).map(([k,s])=>btn(k===P.snd,`data-psnd="${k}"`,s[0])).join('')}</div>`;}
function wirePetPanel(){const B=$('cardBody'),P=settings.pet;
  B.querySelectorAll('[data-psp]').forEach(b=>b.addEventListener('click',()=>{const sp=b.dataset.psp,S=PET_SPECIES[sp],wasDefaultName=petName()===PET_SPECIES[P.sp].name;P.sp=sp;P.col=0;P.snd=S.snd;if(wasDefaultName)P.name=S.name;saveS();applyPet();snd.petCall();hangarCard();}));
  B.querySelectorAll('[data-pcol]').forEach(b=>b.addEventListener('click',()=>{P.col=+b.dataset.pcol;saveS();applyPet();hangarCard();}));
  B.querySelectorAll('[data-psnd]').forEach(b=>b.addEventListener('click',()=>{P.snd=b.dataset.psnd;saveS();applyPet();snd.petCall();hangarCard();}));
  const n=$('petName');if(n){n.addEventListener('keydown',e=>e.stopPropagation());n.addEventListener('change',()=>{P.name=n.value.trim().slice(0,14)||PET_SPECIES[P.sp].name;saveS();applyPet();});}}
applyPet();
