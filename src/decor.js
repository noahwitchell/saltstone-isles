/* ---------- keepsakes: little things the islanders give you, to hang on or paint onto the plane ----------
   Finishing an errand earns that islander's keepsake. It goes straight on the plane, and the Hangar (pause menu)
   lets you take any of them off or put them back. */
const DECOR=[
  {id:'lantern',from:'lanterns',name:"Auntie Lu's lantern",desc:'A paper lantern with a little plane painted on it. It hangs under the left wing and glows after dark.'},
  {id:'buoy',from:'buoys',name:"Ollie's lucky buoy",desc:'A little orange lobster-pot buoy with its flag. It hangs under the right wing.'},
  {id:'ribbons',from:'kites',name:"Hattie's kite tails",desc:'Kite tails tied to both wingtips. They stream out behind you.'},
  {id:'pennant',from:'wreck',name:"The Merrow's pennant",desc:"Wren's grandfather's ship pennant, streaming from the top of the tail."},
  {id:'feather',from:'nests',name:"Ada's osprey feather",desc:'Tucked into the top of the tail fin.'},
  {id:'bell',from:'goats',name:"Tam's goat bell",desc:'A brass bell under the nose. It swings when you turn.'},
  {id:'flag',from:'cairns',name:"Kit's trail flag",desc:'One of the orange cairn flags, on a whip aerial behind the cockpit.'},
  {id:'hearts',from:'heart',name:"Lio's painted hearts",desc:'A pink heart painted on each side of the plane.'},
  {id:'star',from:'meteor',name:"Odile's gold star",desc:'Painted on the tail fin. She swears the gold came off the meteorite.'},
  {id:'scarf',from:'sheep',name:"Agnes's knitted scarf",desc:'Red wool, for Biscuit. He pretends not to like it.'},
];
if(!settings.decor)settings.decor={};
const decorEarned=d=>log.errands&&log.errands[d.from]&&log.errands[d.from].st==='done';
const decorOn=d=>decorEarned(d)&&settings.decor[d.id]!==false;
const DM={};
(function buildDecor(){const add=(id,o,parent=plane)=>{o.visible=false;parent.add(o);DM[id]=o;return o;};
  const mesh=(items)=>new THREE.Mesh(merge(items),litify(toon({},false)));
  /* lantern: paper drum on a string, swings like a pendulum */
  {const piv=new THREE.Group();piv.position.set(-3.1,.68,-.45);
   piv.add(new THREE.Mesh(BOX(.02,.75,.02).translate(0,-.37,0),new THREE.MeshBasicMaterial({color:0x2c2833})));
   const paper=new THREE.MeshBasicMaterial({color:0xd85a34});const body=new THREE.Mesh(new THREE.CylinderGeometry(.24,.24,.42,10).translate(0,-.98,0),paper);piv.add(body);
   piv.add(mesh([{geo:new THREE.CylinderGeometry(.16,.16,.06,10),m:M([0,-.75,0]),color:0x2c2833},{geo:new THREE.CylinderGeometry(.16,.16,.06,10),m:M([0,-1.21,0]),color:0x2c2833},{geo:BOX(.04,.16,.04),m:M([0,-1.32,0]),color:0xf1c84a}]));
   const glow=new THREE.PointLight(0xffb060,0,14,2);glow.position.set(-3.1,-.35,-.45);plane.add(glow);   // stays in the scene even when the lantern is off, so switching it never makes the shaders rebuild
  piv.userData={paper,glow};add('lantern',piv);}
  /* buoy */
  {const piv=new THREE.Group();piv.position.set(3.1,.68,-.45);piv.add(new THREE.Mesh(BOX(.02,.6,.02).translate(0,-.3,0),new THREE.MeshBasicMaterial({color:0x2c2833})));
   piv.add(mesh([{geo:new THREE.SphereGeometry(.22,10,7),m:M([0,-.8,0]),color:0xff6a1e},{geo:new THREE.CylinderGeometry(.225,.225,.08,10),m:M([0,-.8,0]),color:0xffffff},{geo:BOX(.03,.4,.03),m:M([0,-.45,0]),color:0x2c2833},{geo:BOX(.02,.14,.2),m:M([0,-.32,.1]),color:0xffd34a}]));add('buoy',piv);}
  /* streamers: a chain of short segments that wave behind */
  const streamer=(cols,n,len,w)=>{const root=new THREE.Group();let prev=root;const segs=[];for(let k=0;k<n;k++){const s=new THREE.Group();s.position.z=k?len:0;
      s.add(new THREE.Mesh(BOX(w,.02,len).translate(0,0,len/2),new THREE.MeshBasicMaterial({color:cols[k%cols.length],side:THREE.DoubleSide})));prev.add(s);segs.push(s);prev=s;}root.userData.segs=segs;return root;};
  {const g=new THREE.Group();for(const sx of [-1,1]){const r=streamer([0xe2703f,0xffd34a,0x3f8fc0,0xd2493c],7,.42,.14);r.position.set(sx*5.22,.78,.15);g.add(r);g.userData[sx]=r;}add('ribbons',g);}
  {const r=streamer([0x2f5f9a,0xf4f0e6],8,.5,.3);r.position.set(0,1.62,4.45);add('pennant',r);}
  /* osprey feather in the fin */
  add('feather',mesh([{geo:BOX(.03,.62,.14),m:M([0,1.95,4.55],[-.5,0,0]),color:0x6b4a36},{geo:BOX(.035,.2,.15),m:M([0,2.15,4.68],[-.5,0,0]),color:0xf4f0e6}]));
  /* goat bell under the nose */
  {const piv=new THREE.Group();piv.position.set(0,-.5,-2.55);piv.add(mesh([{geo:BOX(.02,.18,.02),m:M([0,-.09,0]),color:0x2c2833},{geo:new THREE.CylinderGeometry(.06,.14,.2,8),m:M([0,-.28,0]),color:0xd8a43a},{geo:new THREE.SphereGeometry(.04,6,4),m:M([0,-.4,0]),color:0x8a5a18}]));add('bell',piv);}
  /* whip aerial with an orange flag */
  {const g=new THREE.Group();g.position.set(0,.68,.5);g.rotation.x=.35;g.add(mesh([{geo:BOX(.03,1.3,.03),m:M([0,.65,0]),color:0x3a3440}]));const fl=new THREE.Mesh(BOX(.02,.22,.34).translate(0,0,.17),new THREE.MeshBasicMaterial({color:0xff7a2e,side:THREE.DoubleSide}));fl.position.y=1.2;g.add(fl);g.userData.flag=fl;add('flag',g);}
  /* painted hearts and star */
  const heartG=(()=>{const s=new THREE.Shape();s.moveTo(0,-.3);s.bezierCurveTo(-.05,-.2,-.32,-.08,-.32,.08);s.bezierCurveTo(-.32,.24,-.1,.3,0,.15);s.bezierCurveTo(.1,.3,.32,.24,.32,.08);s.bezierCurveTo(.32,-.08,.05,-.2,0,-.3);return new THREE.ShapeGeometry(s);})();
  {const g=new THREE.Group();for(const sx of [-1,1]){const h=new THREE.Mesh(heartG,new THREE.MeshBasicMaterial({color:0xf07aa0,side:THREE.DoubleSide}));h.position.set(sx*.585,.12,.95);h.rotation.y=sx*Math.PI/2;g.add(h);}add('hearts',g);}
  const starG=(()=>{const s=new THREE.Shape();for(let k=0;k<10;k++){const a=k/10*TAU-Math.PI/2,r=k%2?.11:.26;const x=Math.cos(a)*r,y=-Math.sin(a)*r;k?s.lineTo(x,y):s.moveTo(x,y);}return new THREE.ShapeGeometry(s);})();
  {const g=new THREE.Group();for(const sx of [-1,1]){const h=new THREE.Mesh(starG,new THREE.MeshBasicMaterial({color:0xffd34a,side:THREE.DoubleSide}));h.position.set(sx*.055,1.12,4.12);h.rotation.y=sx*Math.PI/2;g.add(h);}add('star',g);}
  /* Biscuit's scarf: on his head group, so it shows with his head out of the window too */
  {const head=dog.root.children[0];add('scarf',mesh([{geo:BOX(.32,.08,.34),m:M([0,-.17,.1]),color:0xd2493c},{geo:BOX(.33,.03,.35),m:M([0,-.15,.1]),color:0xf4f0e6},{geo:BOX(.09,.22,.05),m:M([.12,-.3,-.07],[.2,0,0]),color:0xd2493c}]),head);}
})();
function applyDecor(){for(const d of DECOR)if(DM[d.id])DM[d.id].visible=decorOn(d);}
const _dv=new V3();
function updDecor(dt,t){if(!DM.lantern)return;axes();const bank=ac.ground?0:Math.atan2(-_r.y,_u.y),spd=Math.min(1,(ac.ias||0)/40),blow=spd*.5+(ac.bst||0)*.15;
  for(const id of ['lantern','buoy','bell']){const p=DM[id];if(!p.visible)continue;p.rotation.z=lerp(p.rotation.z,-bank*.5+Math.sin(t*2.3+id.length)*.07,1-Math.exp(-dt*3));p.rotation.x=lerp(p.rotation.x,blow*.6+Math.sin(t*1.7)*.05,1-Math.exp(-dt*3));}
  const L=DM.lantern;if(L.visible){const night=TOD[tod].lights>0;L.userData.paper.color.setHex(night?0xffb15a:0xd85a34);L.userData.glow.intensity=night?1.6:0;}else if(DM.lantern.userData.glow.intensity)DM.lantern.userData.glow.intensity=0;
  const wave=(r,amp,f)=>{r.userData.segs.forEach((s,k)=>{s.rotation.y=Math.sin(t*f-k*.9)*amp*(.3+k*.12);s.rotation.x=Math.sin(t*f*.7-k*.7)*amp*.4*(1-spd*.5)-(k?0:.15*(1-spd));});};
  if(DM.ribbons.visible){wave(DM.ribbons.userData[-1],.35,9);wave(DM.ribbons.userData[1],.35,9.4);}
  if(DM.pennant.visible)wave(DM.pennant,.3,8);
  if(DM.flag.visible)DM.flag.userData.flag.rotation.y=Math.sin(t*12)*.35;}
/* the line on the errand-done card */
function giftLine(id){const d=DECOR.find(q=>q.from===id);if(!d)return '';settings.decor[d.id]=true;saveS();applyDecor();
  return `<div class="got">KEEPSAKE: ${d.name.toUpperCase()}. IT'S ON YOUR PLANE. CHANGE IT IN THE HANGAR.</div>`;}
function hangarCard(){const rows=DECOR.map(d=>{const e=decorEarned(d);
    return e?`<div class="tog"><div><b>${d.name}</b><span>${d.desc}</span></div><button data-dec="${d.id}" class="${decorOn(d)?'on':''}">${decorOn(d)?'ON':'OFF'}</button></div>`
      :`<div class="tog"><div><b style="opacity:.55">???</b><span>Finish ${CHARS[ERRANDS[d.from].giver].name.split(' ')[0]}'s errand to earn this one.</span></div><button disabled style="opacity:.35">-</button></div>`;}).join('');
  const n=DECOR.filter(decorEarned).length;
  showCard(`<h2>The hangar</h2><div class="sub">${n} OF ${DECOR.length} KEEPSAKES · GIFTS FROM THE ISLANDERS</div>${n?'':'<p>Nothing here yet. Islanders give you a keepsake when you finish an errand for them, and you can hang it on the plane.</p>'}${rows}`,[['Back',back,true]]);
  $('cardBody').querySelectorAll('[data-dec]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.dec,d=DECOR.find(q=>q.id===id);settings.decor[id]=!decorOn(d);saveS();applyDecor();b.classList.toggle('on',decorOn(d));b.textContent=decorOn(d)?'ON':'OFF';snd.click();}));}
applyDecor();
