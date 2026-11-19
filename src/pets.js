/* ---------- your co-pilot: pick the animal, its colors, the noise it makes and its name ----------
   Biscuit the golden dog is the default. The companion keeps the same rig (head with two ears and a tongue, and a
   chest, haunches and tail for the cockpit seat); each species swaps the shapes, so every animation still works.
   Chosen in the Hangar; saved in settings.pet. Anywhere the game says "Biscuit", it says your companion's name. */
const PET_SPECIES={
  dog:{label:'Dog',name:'Biscuit',snd:'woof',look:'nose points',idle:'sniffs about and wags.',cols:[['Golden','#e8a850','#f4e4c8','#a8743e'],['Chocolate','#7a4a2e','#c8a080','#4e2e1c'],['Black','#3a3036','#c88a50','#221c22'],['Grey','#8a8a92','#d8d8dc','#5a5a62'],['Snowy','#f2eee6','#ffffff','#b8b0a8']]},
  cat:{label:'Cat',name:'Pepper',snd:'meow',look:'ears swivel',idle:'stretches, yawns and settles back down.',cols:[['Ginger','#e88a3a','#f8dcb8','#b8622a'],['Black','#2e2a32','#4a4450','#16141a'],['Tabby','#8e8a90','#d8d2cc','#5e5a62'],['White','#f4f0ea','#ffffff','#e8a8b0'],['Cream','#e8d2a8','#fff4e0','#b89a70']]},
  frog:{label:'Frog',name:'Lily',snd:'ribbit',look:'eyes swivel',idle:'blinks slowly. Very slowly.',cols:[['Green','#5fae4a','#c8e07a','#3a7a30'],['Blue','#3f8fd0','#a8d8f0','#24548a'],['Red','#e2503a','#f0a060','#2c2833'],['Yellow','#f0cc3a','#fff0a0','#a8802a']]},
  bird:{label:'Bird',name:'Captain',snd:'tweet',look:'beak points',idle:'fluffs up and has a preen.',cols:[['Green','#4ca850','#f0e070','#2f7a3a'],['Blue','#3f7fd0','#f0c83a','#2a5a9a'],['Scarlet','#d83a2e','#f2c040','#2a5ab0'],['Cockatiel','#b8b4b0','#f4e06a','#8a8682']]},
  axolotl:{label:'Axolotl',name:'Noodle',snd:'bloop',look:'frills twitch',idle:'blows a bubble and smiles.',cols:[['Pink','#f4b4c4','#fbe0e6','#e2607e'],['Gold','#f0c86a','#fbe8b0','#e8865a'],['Wild','#6a7a54','#a8b48a','#8a4a5e'],['Blue','#8ab0cc','#cfe2ee','#5a74b0'],['Black','#3a3640','#5a5462','#7a4a6a']]},
  bunny:{label:'Bunny',name:'Clover',snd:'squeak',look:'ears point',idle:'twitches a nose and flops back down.',cols:[['White','#f4f0ea','#ffffff','#f0b8c0'],['Brown','#9a6a48','#e8d4b8','#6a4a30'],['Grey','#9a96a0','#e0dce2','#6a666e'],['Black','#3a3438','#ece6e0','#241e22']]},
};
const PET_SOUNDS={bloop:['Bloop','BLOOP!'],woof:['Woof','WOOF!'],meow:['Meow','MEOW!'],ribbit:['Ribbit','RIBBIT!'],tweet:['Tweet','TWEET!'],squeak:['Squeak','SQUEAK!'],quack:['Quack','QUACK!']};
if(!settings.pet||!PET_SPECIES[settings.pet.sp])settings.pet={sp:'dog',col:0,snd:'woof',name:'Biscuit'};
/* a cat still called Biscuit (from before names followed the animal) gets its own name */
{const P=settings.pet,own=PET_SPECIES[P.sp].name;if(P.name&&P.name!==own&&Object.values(PET_SPECIES).some(q=>q.name===P.name))P.name=own;}
const petName=()=>settings.pet.name||PET_SPECIES[settings.pet.sp].name;
/* the sound comes with the animal: a cat meows, a dog woofs. Messages use the same */
const petSnd=()=>PET_SPECIES[settings.pet.sp].snd;
const petCry=()=>PET_SOUNDS[petSnd()][0]+'!';
const petLook=()=>petName()+"'s "+PET_SPECIES[settings.pet.sp].look;
const petIdle=()=>petName()+' '+PET_SPECIES[settings.pet.sp].idle;
const hx=s=>parseInt(s.slice(1),16);
/* shapes per species. Head faces -z. Ears pivot where they join the head. Empty parts get a speck.
   Built from smooth rounded forms (ellipsoids and tapered limbs) so each reads as its animal, not a stack of boxes.
   foot = the lowest point (sits it on the seat); collar = [radius, y, z] or none; scarf = [y, z, scale] on the head */
const SPECK=[{geo:BOX(.001,.001,.001),m:M([0,0,0]),color:0}];
const _SG=new THREE.SphereGeometry(1,14,10),_UP=new V3(0,1,0);
const PE=(p,s,color,r)=>({geo:_SG,m:M(p,r||[0,0,0],s),color});
/* a tapered limb from a to b, rounded at both ends (r0 at a, r1 at b) */
function PL(a,b,r0,r1,color,caps=true){const A=new V3(...a),B=new V3(...b),d=B.clone().sub(A),len=d.length();
  const m=new THREE.Matrix4().compose(A.clone().add(B).multiplyScalar(.5),new Q().setFromUnitVectors(_UP,d.normalize()),new V3(1,1,1));
  const out=[{geo:new THREE.CylinderGeometry(r1,r0,len,12,1,true),m,color}];if(caps)out.push(PE(a,[r0,r0,r0],color),PE(b,[r1,r1,r1],color));return out;}
/* a shiny eye: dark ball with a little white glint */
const PEYE=(x,y,z,r,col)=>[PE([x,y,z],[r,r*1.1,r*.8],col||0x241c2a),PE([x+(x<0?-.25:.25)*r*.2-r*.25,y+r*.45,z-r*.7],[r*.32,r*.32,r*.2],0xffffff)];
const sym=f=>[-1,1].flatMap(f);
function petParts(sp,f,l,d){const dk=0x2c2833,pink=0xe88a9a;
  if(sp==='dog')return {   // a golden pup sitting up: round head, proper muzzle, floppy ears, sitting haunches
    head:[PE([0,.02,.03],[.165,.15,.17],f),PE([0,-.06,-.15],[.095,.075,.12],l),PE([0,-.02,-.12],[.08,.06,.1],f),...sym(e=>[PE([e*.075,-.07,-.12],[.065,.055,.07],l)]),
      PE([0,-.025,-.265],[.04,.03,.028],dk),PE([0,-.115,-.18],[.055,.025,.06],l),...sym(e=>PEYE(e*.075,.035,-.115,.026)),...sym(e=>[PE([e*.072,.075,-.11],[.03,.01,.012],d)])],
    ear:[PE([0,-.1,.0],[.035,.12,.075],d,[0,0,.15]),PE([0,-.02,0],[.04,.04,.07],d)],earR:null,earX:.14,earY:.07,tongue:true,tonguePos:[.015,-.12,-.2],
    chest:[...PL([0,-.06,.04],[0,-.22,.06],.12,.13,f),PE([0,-.3,.06],[.15,.2,.15],f),PE([0,-.28,-.035],[.1,.15,.08],l)],
    rest:[PE([0,-.44,.2],[.155,.18,.24],f,[.75,0,0]),PE([0,-.56,.34],[.18,.16,.17],f),...sym(e=>[PE([e*.12,-.58,.3],[.08,.13,.17],f,[.3,0,0]),PE([e*.12,-.715,.18],[.06,.04,.11],l)]),
      ...sym(e=>[PE([e*.08,-.36,.02],[.075,.13,.1],f),...PL([e*.08,-.4,-.0],[e*.075,-.68,-.03],.058,.046,f),PE([e*.075,-.705,-.075],[.055,.037,.07],l)])],
    tail:[...PL([0,0,0],[0,.04,.2],.045,.04,f),...PL([0,.04,.2],[0,.1,.33],.04,.03,f),PE([0,.11,.35],[.04,.04,.05],l)],tailPos:[0,-.62,.47],tailRx:.6,
    foot:-.745,collar:[.125,-.15,.05],scarf:[-.17,.07,.85]};
  if(sp==='cat')return {   // slim and upright, tall pointed ears, short muzzle, tail curled round the feet
    head:[PE([0,0,0],[.15,.125,.13],f),...sym(e=>[PE([e*.06,-.045,-.07],[.075,.06,.065],l)]),PE([0,-.04,-.115],[.045,.035,.03],l),PE([0,-.02,-.135],[.02,.013,.01],pink),
      PE([0,-.075,-.1],[.03,.018,.02],l),...sym(e=>[PE([e*.062,.015,-.112],[.033,.03,.015],0x9ad04a),PE([e*.062,.015,-.124],[.009,.026,.006],dk),PE([e*.056,.03,-.127],[.007,.007,.004],0xffffff)]),
      ...sym(e=>[-.1,.1].map(r=>({geo:BOX(.15,.006,.006),m:M([e*.12,-.05,-.11],[0,0,e*r]),color:0xf4f0ea})))],
    ear:[{geo:new THREE.ConeGeometry(.06,.14,10).translate(0,.06,0),m:M([0,0,0],[0,0,0],[1,1,.55]),color:f},{geo:new THREE.ConeGeometry(.035,.09,10).translate(0,.05,0),m:M([0,0,-.016],[0,0,0],[1,1,.4]),color:pink}],earR:null,earX:.085,earY:.085,tongue:false,
    chest:[...PL([0,-.06,.03],[0,-.2,.05],.075,.085,f),PE([0,-.32,.04],[.1,.17,.1],f),PE([0,-.29,-.035],[.06,.12,.05],l)],
    rest:[PE([0,-.44,.12],[.11,.15,.15],f,[.6,0,0]),PE([0,-.57,.18],[.14,.14,.16],f),...sym(e=>[PE([e*.09,-.6,.17],[.06,.11,.13],f,[.3,0,0]),PE([e*.095,-.715,.07],[.04,.022,.08],l)]),
      ...sym(e=>[PE([e*.05,-.37,.02],[.05,.1,.065],f),...PL([e*.048,-.4,-.0],[e*.045,-.7,-.03],.036,.029,f),PE([e*.045,-.715,-.06],[.034,.022,.045],l)])],
    tail:[...PL([0,0,0],[.06,0,.14],.032,.03,f),...PL([.06,0,.14],[.2,0,.12],.03,.028,f),...PL([.2,0,.12],[.26,0,0],.028,.025,f),PE([.26,0,-.02],[.027,.027,.035],d)],tailPos:[0,-.71,.28],tailRx:0,
    stiff:true,foot:-.737,collar:[.08,-.13,.04],scarf:[-.13,.035,.6]};
  if(sp==='frog')return {   // squat and wide: flat head straight into the body, big eyes on top, folded back legs
    head:[PE([0,0,0],[.21,.1,.17],f),PE([0,-.045,-.01],[.19,.06,.15],l),PE([0,-.025,-.004],[.212,.009,.172],dk),...sym(e=>[PE([e*.035,.03,-.16],[.01,.008,.008],dk)]),
      ...sym(e=>[PE([e*.15,-.035,-.1],[.035,.02,.025],pink)])],
    ear:[PE([0,.035,0],[.07,.065,.07],f),PE([0,.05,-.025],[.052,.05,.045],0xf6f2e2),PE([0,.055,-.066],[.036,.016,.01],dk),PE([-.012,.066,-.07],[.009,.006,.004],0xffffff)],earR:null,earX:.11,earY:.05,tongue:'frog',tonguePos:[0,-.06,-.16],
    chest:[PE([0,-.11,-.04],[.15,.07,.11],l)],
    rest:[PE([0,-.18,.12],[.2,.13,.22],f,[-.2,0,0]),PE([0,-.21,.1],[.15,.08,.16],l),...[[-.07,.2],[.08,.14],[.02,.28]].map(([x,z])=>PE([x,-.07,z],[.035,.012,.03],d)),
      ...sym(e=>[...PL([e*.14,-.17,-.06],[e*.2,-.32,-.1],.042,.03,f),PE([e*.205,-.34,-.125],[.042,.013,.036],l)]),
      ...sym(e=>[PE([e*.18,-.24,.22],[.08,.09,.16],f,[.2,0,0]),PE([e*.24,-.3,.15],[.045,.045,.13],f),PE([e*.25,-.345,.03],[.048,.013,.085],l)])],
    tail:SPECK,stiff:true,foot:-.36,collar:null,scarf:[-.09,.04,1.05]};
  if(sp==='bird'){const beak=0xe8dcc0,leg=0x8a8890,wood=0x8a6a48,wood2=0x6a4a30;return {   // a parrot on a perch: round head, hooked beak, folded wings, long tail
    head:[PE([0,0,0],[.12,.12,.12],f),...sym(e=>[PE([e*.06,-.015,-.06],[.06,.065,.06],l)]),PE([0,-.02,-.115],[.04,.05,.045],beak),PE([0,-.065,-.13],[.022,.035,.022],beak,[.5,0,0]),PE([0,-.06,-.1],[.03,.022,.028],dk),
      ...sym(e=>[PE([e*.085,.025,-.06],[.03,.032,.024],0xfafaf0),...PEYE(e*.09,.025,-.075,.018)])],
    ear:[...PL([0,0,0],[0,.08,.07],.022,.01,d),...PL([0,0,.03],[0,.06,.1],.018,.008,l)],earR:SPECK,earX:0,earY:.1,tongue:false,
    chest:[PE([0,-.25,.04],[.125,.2,.13],f,[.2,0,0]),PE([0,-.28,-.035],[.09,.15,.08],l,[.2,0,0])],
    rest:[...sym(e=>[PE([e*.105,-.3,.1],[.04,.19,.095],d,[.42,0,-e*.06])]),
      ...sym(e=>[...PL([e*.045,-.42,.04],[e*.045,-.5,.02],.018,.014,leg),PE([e*.045,-.515,-.005],[.022,.016,.04],leg),PE([e*.045,-.515,.05],[.018,.014,.025],leg)]),
      ...PL([-.3,-.545,.02],[.3,-.545,.02],.028,.028,wood),...sym(e=>PL([e*.26,-.56,.02],[e*.26,-.83,.02],.024,.024,wood2,false)),PE([0,-.84,.02],[.33,.025,.09],wood2)],
    tail:[PE([0,0,.2],[.055,.016,.22],d),PE([0,.012,.17],[.035,.012,.18],l)],tailPos:[0,-.43,.15],tailRx:1.05,stiff:true,k:.85,foot:-.865,collar:null,scarf:[-.12,.03,.7]};}
  if(sp==='axolotl')return {   // peeking out of its jar: wide flat smiley head, beady eyes, feathery gills
    head:[PE([0,0,0],[.18,.105,.15],f),PE([0,-.04,-.01],[.165,.06,.13],l),PE([0,-.03,-.004],[.181,.008,.152],d),...sym(e=>PEYE(e*.115,.025,-.11,.02)),...sym(e=>[PE([e*.13,-.035,-.1],[.03,.018,.02],pink)])],
    ear:[0,1,2].flatMap(k=>{const a=.35+k*.45,tip=[0,Math.cos(a)*.15,Math.sin(a)*.15];return [...PL([0,0,0],tip,.018,.012,d),PE([0,tip[1]*.55,tip[2]*.55],[.022,.03,.03],d),PE([0,tip[1]*.85,tip[2]*.85],[.02,.025,.025],d)];}),earR:null,earX:.16,earY:0,tongue:false,
    chest:[PE([0,-.16,.06],[.12,.09,.13],f)],
    rest:[PE([0,-.33,.1],[.1,.2,.11],f,[.25,0,0]),PE([0,-.33,.05],[.07,.15,.07],l,[.25,0,0]),...sym(e=>[...PL([e*.09,-.2,-.03],[e*.13,-.15,-.17],.028,.022,f),PE([e*.135,-.14,-.19],[.03,.014,.03],f)]),
      {geo:new THREE.TorusGeometry(.31,.03,6,24).rotateX(Math.PI/2),m:M([0,-.14,.08]),color:0xd8eef4},{geo:new THREE.CylinderGeometry(.3,.29,.06,20),m:M([0,-.81,.08]),color:0xc8b898},
      ...[[-.15,0,0x8a8a92],[.12,.15,0x6a7a6a],[.02,.22,0x9a8a7a],[.18,-.05,0x7a7a82],[-.08,.2,0x8a9a8a]].map(([x,z,c])=>PE([x,-.77,.08+z],[.05,.03,.045],c)),
      ...PL([-.16,-.78,.18],[-.2,-.5,.2],.012,.008,0x4a9a5a,false),PE([-.19,-.58,.2],[.02,.07,.01],0x5aaa6a,[0,0,.4]),PE([-.17,-.68,.2],[.02,.06,.01],0x4a9a5a,[0,0,-.5]),
      {geo:new THREE.CylinderGeometry(.33,.33,.05,20),m:M([0,-.88,.08]),color:0x6a5a52}],
    tail:[PE([0,0,.12],[.04,.06,.14],f),PE([0,0,.13],[.01,.1,.16],l)],tailPos:[0,-.5,.07],tailRx:.55,stiff:true,jar:true,foot:-.905,collar:null,scarf:[-.11,.04,.9]};
  /* bunny: a round loaf with long ears, puffy cheeks, big hind feet and a cotton tail */
  return {head:[PE([0,0,0],[.13,.125,.14],f),...sym(e=>[PE([e*.06,-.05,-.07],[.07,.06,.07],f)]),PE([0,-.04,-.12],[.045,.035,.035],l),PE([0,-.02,-.148],[.017,.012,.008],pink),
      PE([0,-.085,-.12],[.018,.018,.008],0xffffff),...sym(e=>PEYE(e*.08,.025,-.095,.028))],
    ear:[PE([0,.15,0],[.042,.16,.024],f,[0,0,0]),PE([0,.15,-.014],[.024,.12,.012],d)],earR:null,earX:.05,earY:.09,tongue:false,
    chest:[PE([0,-.16,.02],[.13,.12,.12],f),PE([0,-.2,-.06],[.08,.09,.06],l)],
    rest:[PE([0,-.4,.15],[.21,.26,.26],f),...sym(e=>[PE([e*.13,-.48,.21],[.1,.17,.19],f),PE([e*.12,-.645,.05],[.055,.035,.15],l)]),PE([0,-.36,-.05],[.12,.14,.08],l),
      ...sym(e=>[...PL([e*.065,-.5,-.1],[e*.065,-.63,-.13],.042,.036,f),PE([e*.065,-.645,-.15],[.04,.026,.045],l)])],
    tail:[PE([0,0,0],[.075,.075,.075],l)],tailPos:[0,-.47,.4],tailRx:0,stiff:true,foot:-.68,collar:[.11,-.12,.01],scarf:[-.13,.01,.75]};}
/* the axolotl's jar: see-through glass and water (keeps the sea marker in alpha, like the foam) */
const petJar=(()=>{const m=new THREE.MeshBasicMaterial({color:0xbfe6f2,transparent:true,opacity:.3,depthWrite:false,blending:THREE.CustomBlending,blendSrc:THREE.SrcAlphaFactor,blendDst:THREE.OneMinusSrcAlphaFactor,blendSrcAlpha:THREE.ZeroFactor,blendDstAlpha:THREE.OneFactor});
  const j=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.66,16).translate(0,-.47,.08),m);j.renderOrder=6;j.visible=false;dog.body.add(j);return j;})();
const _petDef={};
function applyPet(){const P=settings.pet,S=PET_SPECIES[P.sp],c=S.cols[P.col]||S.cols[0],f=hx(c[1]),l=hx(c[2]),d=hx(c[3]);const parts=petParts(P.sp,f,l,d);
  const set=(mesh,items)=>{mesh.geometry.dispose();mesh.geometry=merge(items);};
  set(dog.g.children[0],parts.head);set(dog.eL,parts.ear);set(dog.eR,parts.earR||parts.ear);
  const ex=parts.earX??.18,ey=parts.earY??.12;dog.eL.position.set(-ex,ey,.03);dog.eR.position.set(ex,ey,.03);
  const cl=parts.collar;   // a round collar with a gold tag: [radius, height, depth], or none
  set(dog.chest,[...parts.chest,...(cl?[{geo:new THREE.TorusGeometry(cl[0],.022,6,20).rotateX(Math.PI/2),m:M([0,cl[1],cl[2]]),color:0xd2493c},PE([0,cl[1]-.04,cl[2]-cl[0]-.015],[.026,.026,.012],0xf1c84a)]:[])]);
  const rest=dog.body.children.find(o=>o!==dog.chest&&o!==dog.tail);if(rest)set(rest,parts.rest);
  set(dog.tail.children[0],parts.tail);dog.tail.position.set(...(parts.tailPos||[0,-.62,.8]));dog.tail.rotation.x=parts.tailRx??.7;
  dog.k=parts.k||1;dog.dy=-.85-(parts.foot??-.85);petJar.visible=!!parts.jar;dog.tongue.position.set(...(parts.tonguePos||[.03,-.14,-.34]));
  if(typeof DM!=='undefined'&&DM.scarf){const [y,z,k]=parts.scarf||[-.17,.07,.85],r=.17*k,red=0xd2493c;   // a knitted wrap with one end hanging down the front
    set(DM.scarf,[{geo:new THREE.TorusGeometry(r,.032*k,8,22).rotateX(Math.PI/2),m:M([0,y,z]),color:red},{geo:new THREE.TorusGeometry(r*1.02,.02*k,6,22).rotateX(Math.PI/2),m:M([0,y+.03*k,z]),color:0xf4f0e6},
      ...PL([r*.5,y-.02*k,z-r*.85],[r*.62,y-.2*k,z-r*.95],.04*k,.035*k,red),PE([r*.62,y-.22*k,z-r*.95],[.045*k,.02*k,.03*k],0xf4f0e6)]);}
  _petDef.tongue=parts.tongue;_petDef.stiff=!!parts.stiff;dog.tongue.visible=parts.tongue===true;
  if(!dog.tongue.userData.round){dog.tongue.geometry.dispose();dog.tongue.geometry=new THREE.SphereGeometry(1,10,6).scale(.038,.05,.012).translate(0,-.035,0);dog.tongue.userData.round=1;}
  dog.tongue.material.color.setHex(parts.tongue==='frog'?0xf07a90:0xe86a7a);
  const pic=petPic();for(const im of document.querySelectorAll('#dogBtn img,#dogpop img'))im.src=pic;
  const pb_=$('dogpop');if(pb_)pb_.querySelector('b').textContent=PET_SOUNDS[S.snd][1];const bt=$('dogBtn');if(bt)bt.setAttribute('aria-label','Ask '+petName()+' for a clue');}
/* little per-frame tweaks on top of the shared animation: stiff ears don't flop like a dog's, the frog's tongue only
   shoots out when it calls */
function updPet(t){if(!dog.root.visible)return;if(_petDef.stiff){dog.eL.rotation.x*=.35;dog.eR.rotation.x*=.35;dog.eL.rotation.z*=.4;dog.eR.rotation.z*=.4;}
  if(_petDef.tongue==='frog'){dog.tongue.visible=dog.bark>0;dog.tongue.scale.set(1,1+Math.abs(Math.sin(t*10))*2.5,1);}}
/* the noises: synthesised, short and silly */
snd.petCall=function(kind){if(!this.ctx||!settings.sound)return;kind=kind||petSnd();if(kind==='woof')return snd._woof();const c=this.ctx,t0=c.currentTime+.01;
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
  return `<h3>YOUR CO-PILOT</h3><div class="who" style="margin:4px 0 8px"><img src="${petPic()}" alt="" style="width:64px;height:64px"><div><input id="petName" value="${petName().replace(/"/g,'&quot;')}" maxlength="14" aria-label="Your co-pilot's name" style="font:inherit;font-size:20px;padding:4px 8px;border:2px solid #241c2e;background:#fff8ec;color:var(--ink);width:170px;-webkit-user-select:text;user-select:text"><span>${S.label.toUpperCase()} · ${(S.cols[P.col]||S.cols[0])[0].toUpperCase()} · SAYS ${PET_SOUNDS[S.snd][0].toUpperCase()}</span></div></div>
    <div class="btns" style="margin:4px 0">${Object.entries(PET_SPECIES).map(([k,s])=>btn(k===P.sp,`data-psp="${k}"`,s.label)).join('')}</div>
    <div class="btns" style="margin:4px 0">${S.cols.map((c,i)=>btn(i===P.col,`data-pcol="${i}" aria-label="${c[0]}"`,c[0],c[1])).join('')}</div>
    <div style="margin-bottom:10px"></div>`;}
function wirePetPanel(){const B=$('cardBody'),P=settings.pet;
  B.querySelectorAll('[data-psp]').forEach(b=>b.addEventListener('click',()=>{const sp=b.dataset.psp,S=PET_SPECIES[sp],wasDefaultName=Object.values(PET_SPECIES).some(q=>q.name===petName());P.sp=sp;P.col=0;if(wasDefaultName)P.name=S.name;saveS();applyPet();snd.petCall();hangarCard();}));
  B.querySelectorAll('[data-pcol]').forEach(b=>b.addEventListener('click',()=>{P.col=+b.dataset.pcol;saveS();applyPet();hangarCard();}));
  const n=$('petName');if(n){n.addEventListener('keydown',e=>e.stopPropagation());n.addEventListener('change',()=>{P.name=n.value.trim().slice(0,14)||PET_SPECIES[P.sp].name;saveS();applyPet();});}}
applyPet();
