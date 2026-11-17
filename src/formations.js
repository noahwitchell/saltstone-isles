/* ---------------- sea formations: strange rocks out on the crossings, to fly through and play with ----------------
   Each one sits in open water on a line between two airfields, turned so the way through faces along the route.
   Every opening is a fly-through gap (FLYGATES, points + a stamp the first time) and every rock has collision (SOLIDS). */
const FORMS=[];
(function formations(){
  let fs=90210;const fr=()=>{fs=(Math.imul(fs,1664525)+1013904223)>>>0;return fs/4294967296;};
  const it=[],grass=[],foamIt=[];
  const GR=[0x6c9c45,0x7aa64c,0x5f8f3e];
  /* ---- finding spots: open water on the crossings, clear of land, landmarks, gaps and each other ---- */
  const open=(x,z,r)=>{if(groundH(x,z)>-10)return false;for(let k=0;k<14;k++){const a=k/14*TAU;if(groundH(x+Math.cos(a)*r,z+Math.sin(a)*r)>-4)return false;if(groundH(x+Math.cos(a)*r*.5,z+Math.sin(a)*r*.5)>-6)return false;}return true;};
  const clear=(x,z)=>!Object.values(sights).some(s=>Math.hypot(s.x-x,s.z-z)<650)&&!FLYGATES.some(g=>Math.hypot(g.x-x,g.z-z)<650)&&!FORMS.some(f=>Math.hypot(f.x-x,f.z-z)<900)&&!STRIPS.some(s=>Math.hypot(s.x-x,s.z-z)<900);
  const routes=[];for(let i=0;i<STRIPS.length;i++)for(let j=i+1;j<STRIPS.length;j++){const a=STRIPS[i],b=STRIPS[j],d=Math.hypot(a.x-b.x,a.z-b.z);if(d>1600&&d<7500)routes.push([a,b,d]);}
  routes.sort((p,q)=>p[2]-q[2]);
  function spot(R){for(let n=0;n<500;n++){const [a,b]=routes[(fr()*Math.min(routes.length,40))|0],t=.3+fr()*.4,dx=b.x-a.x,dz=b.z-a.z,L=Math.hypot(dx,dz),off=(fr()-.5)*500;
      const x=a.x+dx*t-dz/L*off,z=a.z+dz*t+dx/L*off;if(!clear(x,z)||!open(x,z,R+90))continue;const yaw=Math.atan2(dz,dx);return {x,z,yaw};}return null;}
  /* ---- building blocks, in each formation's own frame: a = along the way through, b = across it, y = up ---- */
  let F;const P=(a,b)=>({x:F.x+Math.cos(F.yaw)*a-Math.sin(F.yaw)*b,z:F.z+Math.sin(F.yaw)*a+Math.cos(F.yaw)*b});
  const col=()=>rockC[(fr()*4)|0];
  function rock(a,b,y,s,sy=s,solid=true,c=col()){const p=P(a,b);it.push({geo:new THREE.DodecahedronGeometry(1,0),m:M([p.x,y,p.z],[fr()*3,fr()*3,fr()*3],[s*(.9+fr()*.3),sy,s*(.9+fr()*.3)]),color:c});if(solid)solidSph(p.x,y,p.z,Math.min(s,sy)*.92);}
  function column(a,b,y0,y1,r0,r1){const p=P(a,b),n=Math.max(3,Math.round((y1-y0)/12));let px=p.x,pz=p.z;
    for(let k=0;k<n;k++){const ya=lerp(y0,y1,k/n),yb=lerp(y0,y1,(k+1)/n),ra=lerp(r0,r1,k/n),rb=lerp(r0,r1,(k+1)/n);
      it.push({geo:new THREE.CylinderGeometry(rb,ra*1.05,yb-ya+.8,7),m:M([px,(ya+yb)/2,pz],[0,fr()*3,0]),color:col()});px+=(fr()-.5)*r1*.18;pz+=(fr()-.5)*r1*.18;}
    solidCyl(p.x,p.z,y0,y1,Math.max(r0,r1)*.95,Math.min(r0,r1)*.95);foam(a,b,r0);}
  function foam(a,b,r){const p=P(a,b);foamIt.push({geo:new THREE.CircleGeometry(r*1.5+2,12).rotateX(-Math.PI/2),m:M([p.x,.22,p.z]),color:0xffffff});}
  function cap(a,b,y,s){const p=P(a,b);grass.push({geo:new THREE.DodecahedronGeometry(1,0),m:M([p.x,y,p.z],[0,fr()*3,0],[s,s*.32,s]),color:GR[(fr()*3)|0]});
    for(let k=0;k<4;k++){const q=P(a+(fr()-.5)*s,b+(fr()-.5)*s);it.push({geo:BOX(1.1,1.4,1.1),m:M([q.x,y+s*.3+.6,q.z],[0,fr()*3,0]),color:k%2?0xf4f0e6:0x2c2833});}}
  /* a ring (or part of one) of rocks round the opening, centred b0/cy, half-sizes rw (across) and rh (up), turned by roll */
  function ring(a,b0,cy,rw,rh,roll,th,from=0,to=TAU,solid=true){const per=(rw+rh)*.5*(to-from),n=Math.max(4,Math.ceil(per/(th*1.05)));
    const pts=[];for(let k=0;k<=n;k++){if(to-from>=TAU-1e-6&&k===n)break;const t=from+(to-from)*k/n,u=Math.cos(t)*rw,v=Math.sin(t)*rh,b=b0+u*Math.cos(roll)-v*Math.sin(roll),y=cy+u*Math.sin(roll)+v*Math.cos(roll);
      const s=th*(.95+fr()*.3);rock(a+(fr()-.5)*th*.4,b,y,s,s*.95,solid);pts.push({b,y});}return pts;}
  function shoal(R){for(let k=0;k<7;k++){const a=(fr()-.5)*R*2.2,b=(fr()-.5)*R*2.2,s=2+fr()*5;rock(a,b,-s*.35,s,s*.8,false);foam(a,b,s*.8);}}
  const gate=(id,name,a,b,y0,y1,w,desc)=>{const p=P(a,b);flyGate(id,name,p.x,p.z,y0,y1,F.yaw,w,desc);};
  const place=(R,id,name)=>{F=spot(R);if(!F){console.warn('no spot for',id);return false;}F.R=R;F.id=id;F.name=name;FORMS.push(F);return true;};

  /* 1. three ordinary sea arches of different sizes */
  const ARCHES=[['f_cormorant','Cormorant Arch',34,30,9,'A wide old arch the cormorants dry their wings on.'],['f_seal','Seal Arch',24,16,8,'A low, snug arch. The seals underneath will not move for you.'],
    ['f_kitti','Kittiwake Arch',30,58,8,'A tall thin arch, loud with kittiwakes.']];
  for(const [id,name,R,rise,th,desc] of ARCHES){if(!place(R+20,id,name))continue;
    for(const e of [-1,1])column(0,e*R,-12,rise,th*1.5,th*1.05);const pts=ring(0,0,rise,R,R*.62,0,th,0,Math.PI);cap(0,0,rise+R*.62+th*.6,th*1.7);shoal(R);
    gate(id,'Under '+name,0,0,-1,rise+R*.62-th*1.1,R-th*1.2,desc);}
  /* 2. The Corkscrew: four slot-shaped rings, each turned further, so you have to roll through them */
  if(place(150,'f_cork','The Corkscrew')){[0,1,2,3].forEach(k=>{const a=-105+k*70,roll=k*Math.PI/6,cy=58;
      const pts=ring(a,0,cy,34,18,roll,7);let lo=pts[0];for(const p of pts)if(p.y<lo.y)lo=p;column(a,lo.b,-12,lo.y-3,8,5.5);
      const hi=pts.reduce((m,p)=>p.y>m.y?p:m,pts[0]);cap(a,hi.b,hi.y+5,9);});
    gate('f_cork','Out of the Corkscrew',105,0,58-24,58+24,10,'Four twisted slots of rock, each rolled a bit further. Roll with them.');shoal(140);}
  /* 3. The Long Hole: a tunnel of rock you fly the length of */
  if(place(90,'f_tunnel','The Long Hole')){const R=22,rise=10,th=8;for(let a=-54;a<=54;a+=9){ring(a,0,rise,R+fr()*2,R*.8,0,th,0,Math.PI);for(const e of [-1,1])rock(a,e*R,rise*.5-4,th*1.2,rise*.9);}
    for(const e of [-1,1])for(const a of [-54,0,54])foam(a,e*R,th*1.2);for(let k=0;k<5;k++)cap(-40+k*20,(fr()-.5)*10,rise+R*.8+th*.8,9);
    gate('f_tunnel','Through the Long Hole',0,0,-1,rise+R*.8-th*1.15,R-th*1.25,'A hundred metres of tunnel. Keep the wings level and do not breathe.');shoal(90);}
  /* 4. The Needle's Eye: two slabs leaning in until they touch */
  if(place(70,'f_eye','The Needle\'s Eye')){for(const e of [-1,1])for(let k=0;k<=11;k++){const t=k/11,b=e*lerp(34,6,t),y=lerp(-8,108,t),s=lerp(10,6,t);rock(-4,b,y,s,s*1.2);rock(5,b,y+4,s*.9,s*1.1);}
    rock(0,0,116,10,8);cap(0,0,124,8);for(const e of [-1,1])foam(0,e*34,10);
    gate('f_eye','Through the Needle\'s Eye',0,0,-1,46,12,'Two leaning slabs of rock. The gap gets narrower the higher you go.');shoal(60);}
  /* 5. The Breaker: a rock wave curling over; fly under the lip */
  if(place(90,'f_breaker','The Breaker')){for(let a=-60;a<=60;a+=10){const k=1-Math.abs(a)/75,R=38*k+10,cy=10+22*k;column(a,R,-12,cy,8,7);ring(a,0,cy,R,R*.95,0,8,0,Math.PI*1.18);}
    cap(0,10,10+22+38*.95+9,12);gate('f_breaker','Under the Breaker',0,4,-1,40,20,'A wave of stone frozen just before it breaks. Go under while it is still holding.');shoal(90);}
  /* 6. Toadstool Avenue: two rows of mushroom rocks, a narrow street between them */
  if(place(150,'f_toad','Toadstool Avenue')){let low=1e9;for(let k=0;k<7;k++)for(const e of [-1,1]){const a=-150+k*50+(fr()-.5)*14,b=e*(27+fr()*6),h=34+fr()*44,cr=10+fr()*4;low=Math.min(low,h-3);
      column(a,b,-10,h,6,4);const p=P(a,b);it.push({geo:new THREE.DodecahedronGeometry(1,0),m:M([p.x,h+2,p.z],[0,fr()*3,0],[cr,4,cr]),color:col()});solidCyl(p.x,p.z,h-2,h+6,cr,cr*.8);cap(a,b,h+6,cr*.7);}
    gate('f_toad','Down Toadstool Avenue',0,0,-1,low-2,10,'Seven pairs of rock toadstools. The street between is not wide.');shoal(140);}
  /* 7. The Slalom: four pairs of spires, each pair stepped sideways from the last */
  if(place(200,'f_slalom','The Slalom')){[0,1,2,3].forEach(k=>{const a=-165+k*110,b0=(k%2?1:-1)*42;for(const e of [-1,1])spireAt(it,P(a,b0+e*19).x,P(a,b0+e*19).z,-12,70+fr()*25,8,4.5,k*2+(e>0?1:0));
      for(const e of [-1,1])foam(a,b0+e*19,8);gate('f_slalom'+(k+1),`The Slalom, gate ${k+1}`,a,b0,-1,60,12,'Four pairs of spires, stepped left and right. Zigzag through all of them.');});shoal(180);}
  /* 8. The Keyhole: a wall of rock with one round hole through the middle */
  if(place(60,'f_key','The Keyhole')){const cy=44,hr=14,th=7;ring(0,0,cy,hr+th*.6,hr+th*.6,0,th);
    for(let b=-36;b<=36;b+=10)for(let y=-6;y<=96;y+=10){const r=Math.hypot(b/38,(y-44)/54);if(r>1)continue;if(Math.hypot(b,y-cy)<hr+th*1.4)continue;rock((fr()-.5)*4,b+(fr()-.5)*3,y,7.5,7);}
    cap(0,0,cy+54,14);foam(0,0,30);gate('f_key','Through the Keyhole',0,0,cy-hr+4,cy+hr-4,hr-4,'One round hole through a wall of rock. Line it up from a long way out.');shoal(50);}
  /* 9. The Hanging Stone: a boulder jammed between two spires, high up */
  if(place(70,'f_hang','The Hanging Stone')){for(const e of [-1,1])spireAt(it,P(0,e*30).x,P(0,e*30).z,-12,98,11,7,e>0?11:12);for(const e of [-1,1])foam(0,e*30,11);
    rock(0,0,82,27,15);cap(0,0,97,11);gate('f_hang','Under the Hanging Stone',0,0,-1,60,17,'It has been stuck up there since the ice. Probably it will stay.');shoal(60);}
  /* 10. The Jaws: an arch with teeth, top and bottom */
  if(place(70,'f_jaws','The Jaws')){const R=36,rise=16,th=9;for(const e of [-1,1])column(0,e*R,-12,rise,th*1.5,th*1.1);const pts=ring(0,0,rise,R,R*.7,0,th,0,Math.PI);
    for(const p of pts.slice(1,-1)){const dy=rise-p.y,db=-p.b,L=Math.hypot(db,dy)||1,q=P(0,p.b+db/L*8);it.push({geo:new THREE.ConeGeometry(2.6,11,5),m:M([q.x,p.y+dy/L*8,q.z],[0,0,0]).multiply(new THREE.Matrix4().makeRotationFromQuaternion(new Q().setFromUnitVectors(new V3(0,1,0),new V3(-Math.sin(F.yaw)*db/L,dy/L,Math.cos(F.yaw)*db/L)))),color:0xf4f0e6});}
    for(const b of [-30,-22,22,30]){const q=P(0,b);it.push({geo:new THREE.ConeGeometry(3.4,14,5),m:M([q.x,4,q.z]),color:0xf4f0e6});solidCyl(q.x,q.z,-2,10,3,1);}
    cap(0,0,rise+R*.7+th*.6,12);gate('f_jaws','Through the Jaws',0,0,-1,15,14,'Rock teeth above and below. It has never bitten anyone. Yet.');shoal(70);}
  /* 11. Granny, Mum and Little Lil: three arches in a row, each smaller than the last */
  if(place(150,'f_steps','Granny, Mum and Little Lil')){[[42,34,'Granny'],[28,22,'Mum'],[18,12,'Little Lil']].forEach(([R,rise,who],k)=>{const a=-110+k*110,th=k?7:9;
      for(const e of [-1,1])column(a,e*R,-12,rise,th*1.5,th*1.05);ring(a,0,rise,R,R*.62,0,th,0,Math.PI);cap(a,0,rise+R*.62+th*.6,th*1.6);
      gate('f_steps'+(k+1),`Under ${who}`,a,0,-1,rise+R*.62-th*1.1,R-th*1.2,'Three arches in a row, Granny, Mum and Little Lil. Can you thread all three in one go?');});shoal(140);}

  scene.add(shadowy(new THREE.Mesh(merge(it),toon())));if(grass.length)scene.add(shadowy(new THREE.Mesh(merge(grass),toon())));
  if(foamIt.length){const fm=new THREE.Mesh(merge(foamIt),new THREE.MeshBasicMaterial({color:0xf6f1e4,transparent:true,opacity:.55,depthWrite:false}));fm.renderOrder=2;scene.add(fm);
    anims.push(t=>{fm.material.opacity=.42+Math.sin(t*1.7)*.13;});}
})();
