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
  let NEAR=null;   // when set, look for spots in a ring round the home islands instead of out on the long crossings
  const HOME=STRIPS.filter(s=>['harbor','light','ridge'].includes(s.id));
  function spot(R){if(NEAR)for(let n=0;n<900;n++){const an=fr()*TAU,rr=lerp(NEAR.r0,NEAR.r1,fr()),x=NEAR.x+Math.cos(an)*rr,z=NEAR.z+Math.sin(an)*rr;
      if(!clear(x,z)||!open(x,z,R+90))continue;const h=HOME.reduce((a,s)=>Math.hypot(s.x-x,s.z-z)<Math.hypot(a.x-x,a.z-z)?s:a);return {x,z,yaw:Math.atan2(h.z-z,h.x-x)+(fr()-.5)*.6};}
    if(NEAR)return null;
    for(let n=0;n<500;n++){const [a,b]=routes[(fr()*Math.min(routes.length,40))|0],t=.3+fr()*.4,dx=b.x-a.x,dz=b.z-a.z,L=Math.hypot(dx,dz),off=(fr()-.5)*500;
      const x=a.x+dx*t-dz/L*off,z=a.z+dz*t+dx/L*off;if(!clear(x,z)||!open(x,z,R+90))continue;const yaw=Math.atan2(dz,dx);return {x,z,yaw};}return null;}
  /* ---- building blocks, in each formation's own frame: a = along the way through, b = across it, y = up ---- */
  let F;const P=(a,b)=>({x:F.x+Math.cos(F.yaw)*a-Math.sin(F.yaw)*b,z:F.z+Math.sin(F.yaw)*a+Math.cos(F.yaw)*b});
  const col=()=>rockC[(fr()*4)|0];
  function rock(a,b,y,s,sy=s,solid=true,c=col()){const p=P(a,b);it.push({geo:new THREE.DodecahedronGeometry(1,0),m:M([p.x,y,p.z],[fr()*3,fr()*3,fr()*3],[s*(.9+fr()*.3),sy,s*(.9+fr()*.3)]),color:c});if(solid)solidSph(p.x,y,p.z,Math.min(s,sy)*.92);}
  function column(a,b,y0,y1,r0,r1){const p=P(a,b),n=Math.max(3,Math.round((y1-y0)/12));let px=p.x,pz=p.z;
    for(let k=0;k<n;k++){const ya=lerp(y0,y1,k/n),yb=lerp(y0,y1,(k+1)/n),ra=lerp(r0,r1,k/n),rb=lerp(r0,r1,(k+1)/n);
      it.push({geo:new THREE.CylinderGeometry(rb,ra*1.05,yb-ya+.8,7),m:M([px,(ya+yb)/2,pz],[0,fr()*3,0]),color:col()});px+=(fr()-.5)*r1*.18;pz+=(fr()-.5)*r1*.18;}
    solidCyl(p.x,p.z,y0,y1,Math.max(r0,r1)*.95,Math.min(r0,r1)*.95);foam(a,b,r0);}
  function foam(a,b,r){const p=P(a,b);foamIt.push({geo:new THREE.CircleGeometry(r*1.5+2,12).rotateX(-Math.PI/2),m:M([p.x,.3,p.z]),color:0xffffff});}
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


  /* ---------- round the home islands (Ferrow, Gull Point, Tallpine): more to play with close to Harbor Field ---------- */
  NEAR={x:-900,z:150,r0:1200,r1:4300};
  /* 12. The Crown: a ring of spires standing in the sea, with a way in on one side and out on the other */
  if(place(110,'h_crown','The Crown')){const R=78;for(let k=0;k<12;k++){const an=k/12*TAU;if(k===0||k===6)continue;const a=Math.cos(an)*R,b=Math.sin(an)*R;
      const p=P(a,b);spireAt(it,p.x,p.z,-12,58+fr()*40,9,5,40+k);foam(a,b,9);}
    rock(0,0,-2,14,8,false);cap(0,0,5,10);
    gate('h_crown1','Into the Crown',-R,0,-1,70,13,'A ring of spires with one way in and one way out. Go round inside if you like.');
    gate('h_crown2','Out of the Crown',R,0,-1,70,13,'A ring of spires with one way in and one way out. Go round inside if you like.');shoal(100);}
  /* 13. The Ladder: a tall wall of rock with three holes, one above the other */
  if(place(60,'h_ladder','The Ladder')){const holes=[[22,13],[64,12],[106,11]];
    for(let b=-34;b<=34;b+=9.5)for(let y=-6;y<=132;y+=9.5){const r=Math.hypot(b/(36-y*.08),(y-62)/72);if(r>1)continue;if(holes.some(([cy,hr])=>Math.hypot(b,y-cy)<hr+5.5))continue;rock((fr()-.5)*4,b+(fr()-.5)*3,y,7.2,6.8);}
    for(const [cy,hr] of holes)ring(0,0,cy,hr+4,hr+4,0,5.5);cap(0,0,136,12);foam(0,0,30);
    holes.forEach(([cy,hr],k)=>gate('h_ladder'+(k+1),['The Ladder, bottom rung','The Ladder, middle rung','The Ladder, top rung'][k],0,0,cy-hr+4,cy+hr-4,hr-4,'Three holes up one wall of rock. Climb the ladder: bottom, middle, top.'));shoal(50);}
  /* 14. The Wishbone: two arches side by side on a shared middle leg */
  if(place(90,'h_wish','The Wishbone')){const R=26,rise=20,th=8;for(const b of [-52,0,52])column(0,b,-12,rise,th*1.5,th*1.05);
    for(const e of [-1,1]){ring(0,e*26,rise,R,R*.7,0,th,0,Math.PI);cap(0,e*26,rise+R*.7+th*.6,th*1.5);}
    for(const e of [-1,1])gate(e<0?'h_wish1':'h_wish2',e<0?'The Wishbone, left':'The Wishbone, right',0,e*26,-1,rise+R*.7-th*1.1,R-th*1.6,'Two arches on one middle leg. Fly one, turn round, fly the other.');shoal(80);}
  /* 15. Old Man's Bridge: a very long, very low stone span */
  if(place(120,'h_bridge','Old Man\'s Bridge')){const R=92,rise=10,th=8;for(const e of [-1,1])column(0,e*R,-12,rise+4,th*2,th*1.4);ring(0,0,rise,R,15,0,th,0,Math.PI);
    for(let k=0;k<4;k++)cap(-4+fr()*8,-60+k*40,rise+15+th*.7,8);gate('h_bridge','Under Old Man\'s Bridge',0,0,-1,rise+15-th*1.15,R-th*2,'A long, low bridge of stone. Plenty of room sideways, hardly any up.');shoal(110);}
  /* 16. The Hoop: a ring of rock held up on a single stalk */
  if(place(50,'h_hoop','The Hoop')){const cy=74,R=21,th=6.5;ring(0,0,cy,R,R,0,th);column(0,0,-12,cy-R-2,10,5);foam(0,0,10);
    for(let k=0;k<3;k++)rock(0,(fr()-.5)*10,cy+R+th*.6,th,th*.7);cap(0,0,cy+R+th*1.3,7);gate('h_hoop','Through the Hoop',0,0,cy-R+th,cy+R-th,R-th-2,'A ring of rock on a stalk, like a hoop for a circus dog. Biscuit approves.');shoal(40);}
  /* 17. Ferrow Needles: three pairs of thin spires, tight and stepped */
  if(place(150,'h_needles','Ferrow Needles')){[0,1,2].forEach(k=>{const a=-110+k*110,b0=[-28,30,-24][k];for(const e of [-1,1]){const p=P(a,b0+e*15);spireAt(it,p.x,p.z,-12,58+fr()*20,7,4.6,60+k*2+(e>0?1:0));foam(a,b0+e*15,6.5);}
      gate('h_needle'+(k+1),`Ferrow Needles, ${['first','second','third'][k]} pair`,a,b0,-1,50,9,'Three pairs of needle-thin spires close to home. Tighter than the Slalom.');});shoal(130);}
  /* 18. The Ribcage: seven stone ribs over a winding channel; follow the bend all the way through */
  if(place(170,'h_ribs','The Ribcage')){const rib=k=>({a:-150+k*50,b:Math.sin(k*.75)*28});for(let k=0;k<7;k++){const {a,b}=rib(k),R=25,rise=8,th=6.5;
      for(const e of [-1,1])column(a,b+e*R,-12,rise,th*1.3,th);ring(a,b,rise,R,R*.95,0,th,0,Math.PI);}
    cap(-100,rib(1).b,8+25*.95+6,8);cap(50,rib(4).b,8+25*.95+6,8);
    gate('h_ribs1','Into the Ribcage',rib(0).a,rib(0).b,-1,8+25*.95-7.5,17,'Seven stone ribs over a winding channel. In one end, out the other, without touching.');
    gate('h_ribs2','Out of the Ribcage',rib(6).a,rib(6).b,-1,8+25*.95-7.5,17,'Seven stone ribs over a winding channel. In one end, out the other, without touching.');shoal(160);}
  /* 19. The Sea Serpent: six rock humps in a zigzag line, a head at one end; weave under every hump */
  if(place(220,'h_serpent','The Sea Serpent')){const hump=k=>({a:-140+k*52,b:(k%2?1:-1)*13,R:14+(k%2)*4});for(let k=0;k<6;k++){const {a,b,R}=hump(k);ring(a,b,0,R,R*1.15,0,5.5,0,Math.PI);}
    rock(-200,0,6,10,8);rock(-206,0,17,8,7);rock(-214,-4,22,4,3);rock(-214,4,22,4,3);for(let k=0;k<4;k++)rock(175+k*14,(k%2?1:-1)*6,1-k*.5,5-k,4-k*.6);
    gate('h_serp1','Under the Sea Serpent',hump(0).a,hump(0).b,-1,14*1.15-5.5,14-6,'A rock sea serpent, six humps long. Under every hump, head to tail.');
    gate('h_serp2','Off the Serpent\'s tail',hump(5).a,hump(5).b,-1,18*1.15-5.5,18-6,'A rock sea serpent, six humps long. Under every hump, head to tail.');shoal(190);}
  /* 20. The Spiral Stair: seven stone rings on stalks, each higher than the last, curving as they climb */
  if(place(200,'h_stair','The Spiral Stair')){const st=k=>({a:-130+k*42,b:Math.sin(k*.9)*30,cy:16+k*10});for(let k=0;k<7;k++){const {a,b,cy}=st(k);ring(a,b,cy,10.5,10.5,0,4.5);column(a,b,-12,cy-10.5,4,3);}
    gate('h_stair1','Up the Spiral Stair',st(0).a,st(0).b,16-6,16+6,5,'Seven rings, each higher than the last. Climb through every one.');
    gate('h_stair2','Top of the Spiral Stair',st(6).a,st(6).b,76-6,76+6,5,'Seven rings, each higher than the last. Climb through every one.');shoal(170);}
  /* 21. The Doorways: five stone door frames, each stepped sideways from the last */
  if(place(200,'h_doors','The Doorways')){const dr=[0,18,-14,20,-8];for(let k=0;k<5;k++){const a=-140+k*70,b=dr[k];for(const e of [-1,1])column(a,b+e*10,-12,30,4.2,3.6);for(let q=-3;q<=3;q++)rock(a,b+q*3.4,33,3.2,2.6);cap(a,b,36,6);}
    gate('h_door1','Through the first Doorway',-140,dr[0],-1,27,5.5,'Five stone doorways in a crooked row. Through every one without scraping the paint.');
    gate('h_door2','Through the last Doorway',140,dr[4],-1,27,5.5,'Five stone doorways in a crooked row. Through every one without scraping the paint.');shoal(170);}
  /* 22. The Pipe Organ: a crowd of tall columns with two narrow lanes crossing in the middle */
  if(place(150,'h_organ','The Pipe Organ')){for(let a=-96;a<=96;a+=16)for(let b=-80;b<=80;b+=16){if(Math.abs(b)<9||Math.abs(a)<9)continue;if(fr()<.25)continue;const h=28+fr()*70;column(a+(fr()-.5)*4,b+(fr()-.5)*4,-12,h,4.2,2.6);}
    gate('h_organ1','Down the Pipe Organ',-104,0,-1,26,6,'A forest of stone pipes. Two lanes cross in the middle: fly both.');
    gate('h_organ2','Across the Pipe Organ',0,-88,-1,26,6,'A forest of stone pipes. Two lanes cross in the middle: fly both.');}
  /* 23. The Big O: one stone ring, so tall you can fly a loop inside it */
  if(place(110,'h_bigo','The Big O')){const cy=72,R=62,th=9;ring(0,0,cy,R,R,0,th);for(const e of [-1,1])column(0,e*22,-12,cy-R+4,11,8);cap(0,0,cy+R+th,10);
    gate('h_bigo','Through the Big O',0,0,cy-R+th,cy+R-th,R-th-4,'A ring of rock taller than the lighthouse. Big enough to fly a loop inside, if you\'re brave.');shoal(90);}
  /* 24. The Gauntlet: eight slabs leaning in from alternate sides; zigzag between them */
  if(place(210,'h_gauntlet','The Gauntlet')){for(let k=0;k<8;k++){const a=-160+k*44,sd=k%2?1:-1;for(let q=0;q<=8;q++){const t=q/8;rock(a+(fr()-.5)*3,sd*lerp(34,6,t),lerp(-4,44,t),lerp(9,5,t),lerp(8,5,t));}}
    gate('h_gaunt1','Into the Gauntlet',-200,0,-1,30,12,'Eight leaning slabs, left, right, left. Zigzag all the way through.');
    gate('h_gaunt2','Out of the Gauntlet',190,0,-1,30,12,'Eight leaning slabs, left, right, left. Zigzag all the way through.');shoal(180);}
  NEAR=null;
  /* ---- 50 more, built from fourteen kinds of formation with their own sizes and shapes, out on the crossings ---- */
  const K=(lo,hi)=>lo+fr()*(hi-lo);
  const KIND={
    arch(id,name,desc){const R=K(16,36),rise=K(6,42),th=K(6,10);if(!place(R+24,id,name))return;for(const e of [-1,1])column(0,e*R,-12,rise,th*1.5,th*1.05);ring(0,0,rise,R,R*K(.5,.75),0,th,0,Math.PI);cap(0,0,rise+R*.62+th*.6,th*1.6);shoal(R);
      gate(id,'Under '+name,0,0,-1,rise+R*.5-th,R-th*1.2,desc);},
    skip(id,name,desc){const n=5+(fr()*3|0),R=K(14,19),sp=K(26,34);if(!place(n*sp/2+40,id,name))return;let first,last;for(let k=0;k<n;k++){const a=-(n-1)*sp/2+k*sp,b=Math.sin(k*1.1)*K(0,8),rise=K(.5,3);ring(a,b,rise,R,R*.55,0,5);if(!k)first={a,b,rise};last={a,b,rise};}
      gate(id+'1','Onto '+name,first.a,first.b,-1,first.rise+R*.55-5,R-6,desc);gate(id+'2','Off '+name,last.a,last.b,-1,last.rise+R*.55-5,R-6,desc);shoal(n*sp/2);},
    comb(id,name,desc){const half=K(55,85),gap=K(7,10);if(!place(half+30,id,name))return;for(let b=-half;b<=half;b+=K(11,15)){if(Math.abs(b)<gap+3)continue;column(0,b,-12,K(26,62),K(4,5.5),K(2.2,3.4));}
      for(let b=-half;b<=half;b+=6)rock(0,b,-2,5,3);gate(id,'Through '+name,0,0,-1,24,gap-1,desc);shoal(half);},
    fork(id,name,desc){const R=K(13,17),off=R+K(10,16),rise=K(8,20);if(!place(off+R+30,id,name))return;column(0,0,-12,rise+R*.7,K(9,12),K(6,8));cap(0,0,rise+R*.7+3,8);
      for(const e of [-1,1]){column(0,e*(off+R),-12,rise,7,5.5);ring(0,e*off,rise,R,R*.7,0,6,0,Math.PI);gate(id+(e<0?'L':'R'),(e<0?'Left':'Right')+' prong of '+name,0,e*off,-1,rise+R*.7-6,R-6,desc);}shoal(off+R);},
    stairs(id,name,desc){const n=5,R=K(17,23),sp=K(50,64),top=K(46,60);if(!place(n*sp/2+30,id,name))return;for(let k=0;k<n;k++){const a=-(n-1)*sp/2+k*sp,rise=top-k*(top-6)/(n-1),b=k*K(-4,4);for(const e of [-1,1])column(a,b+e*R,-12,rise,7.5,5.5);ring(a,b,rise,R,R*.6,0,6.5,0,Math.PI);
        if(k===0)gate(id+'1','Top of '+name,a,b,-1,rise+R*.6-6.5,R-7,desc);if(k===n-1)gate(id+'2','Bottom of '+name,a,b,-1,rise+R*.6-6.5,R-7,desc);}shoal(n*sp/2);},
    eye(id,name,desc){const Ro=K(62,80),Ri=K(24,32);if(!place(Ro+30,id,name))return;const no=12,ni=7;for(let k=0;k<no;k++){const t=k/no*TAU+.26;if(Math.abs(Math.sin(t))<.2&&Math.cos(t)<0)continue;column(Math.cos(t)*Ro,Math.sin(t)*Ro,-12,K(30,60),K(5,7),K(3,4));}
      for(let k=0;k<ni;k++){const t=k/ni*TAU;column(Math.cos(t)*Ri,Math.sin(t)*Ri,-12,K(40,75),K(4,5.5),K(2.5,3.5));}
      gate(id,'Into '+name,-Ro,0,-1,26,12,desc);gate(id+'c','Round '+name,0,(Ro+Ri)/2,-1,26,(Ro-Ri)/2-6,desc);shoal(Ro);},
    ribs(id,name,desc){const n=6,R0=K(26,32),sp=K(36,46),curve=K(-.4,.4);if(!place(n*sp/2+40,id,name))return;let first,last;for(let k=0;k<n;k++){const a=-(n-1)*sp/2+k*sp,R=R0-k*(R0-17)/(n-1),b=Math.sin(k*.6)*curve*30,rise=K(3,8);
        for(const e of [-1,1])column(a,b+e*R,-12,rise,6.5,5);ring(a,b,rise,R,R,0,6,0,Math.PI);if(!k)first={a,b,R,rise};last={a,b,R,rise};}
      rock(first.a-30,first.b,4,12,9);rock(first.a-42,first.b,7,9,7);
      gate(id+'1','Into '+name,first.a,first.b,-1,first.rise+first.R-7,first.R-7,desc);gate(id+'2','Out of '+name,last.a,last.b,-1,last.rise+last.R-7,last.R-7,desc);shoal(n*sp/2);},
    chandelier(id,name,desc){const R=K(32,40),rise=K(26,38),th=8;if(!place(R+30,id,name))return;for(const e of [-1,1])column(0,e*R,-12,rise,th*1.4,th);ring(0,0,rise,R,R*.6,0,th,0,Math.PI);cap(0,0,rise+R*.6+th*.6,10);
      const top=rise+R*.6-th*.6;for(const b of [-14,0,14]){const len=K(12,20);for(let y=top;y>top-len;y-=4.5)rock(0,b+(fr()-.5)*1.5,y,3.4,2.6);}
      gate(id+'L','Left of '+name+'’s drops',0,-7,-1,top-8,3.5,desc);gate(id+'R','Right of '+name+'’s drops',0,7,-1,top-8,3.5,desc);shoal(R);},
    goal(id,name,desc){const n=3,sp=K(60,80);if(!place(n*sp/2+30,id,name))return;for(let k=0;k<n;k++){const a=-(n-1)*sp/2+k*sp,w=K(11,15),h=38+k*K(10,16),b=K(-12,12);for(const e of [-1,1])column(a,b+e*w,-12,h,5,4);for(let q=-w;q<=w;q+=4)rock(a,b+q,h+2,3.4,2.6);
        if(k===0)gate(id+'1','Through '+name,a,b,-1,h-2,w-5,desc);if(k===n-1)gate(id+'2','Through the last of '+name,a,b,-1,h-2,w-5,desc);}shoal(n*sp/2);},
    tube(id,name,desc){const n=7,sp=K(11,14),R=K(13,16),cy=R+K(1,6);if(!place(n*sp/2+30,id,name))return;for(let k=0;k<n;k++){const a=-(n-1)*sp/2+k*sp;ring(a,Math.sin(k*.5)*3,cy,R,R,0,6);}
      for(const e of [-1,1])column(-(n-1)*sp/2,e*R*.6,-12,cy-R+2,7,6);gate(id+'1','Into '+name,-(n-1)*sp/2,0,cy-R+6,cy+R-6,R-7,desc);gate(id+'2','Out of '+name,(n-1)*sp/2,Math.sin((n-1)*.5)*3,cy-R+6,cy+R-6,R-7,desc);shoal(n*sp/2);},
    hoops(id,name,desc){const n=5,sp=K(46,58),R=K(9,12);if(!place(n*sp/2+30,id,name))return;let first,last;for(let k=0;k<n;k++){const a=-(n-1)*sp/2+k*sp,b=(k%2?1:-1)*K(14,24),cy=K(24,52);ring(a,b,cy,R,R,0,4.5);column(a,b,-12,cy-R,4,3);if(!k)first={a,b,cy};last={a,b,cy};}
      gate(id+'1','Through the first of '+name,first.a,first.b,first.cy-R+4.5,first.cy+R-4.5,R-5.5,desc);gate(id+'2','Through the last of '+name,last.a,last.b,last.cy-R+4.5,last.cy+R-4.5,R-5.5,desc);shoal(n*sp/2);},
    slalom(id,name,desc){const n=5,sp=K(48,62),w=K(9,12);if(!place(n*sp/2+30,id,name))return;let first,last;for(let k=0;k<n;k++){const a=-(n-1)*sp/2+k*sp,b=(k%2?1:-1)*K(10,22);for(const e of [-1,1])column(a,b+e*w,-12,K(40,70),K(5,6.5),K(2.5,3.5));if(!k)first={a,b};last={a,b};}
      gate(id+'1','Into '+name,first.a,first.b,-1,36,w-5,desc);gate(id+'2','Out of '+name,last.a,last.b,-1,36,w-5,desc);shoal(n*sp/2);},
    window(id,name,desc,slot){const W=K(50,70),H=K(55,75),hw=slot?K(11,14):K(9,13),hh=slot?K(3.5,4.5):hw,yc=slot?K(10,16):K(22,36);if(!place(W+30,id,name))return;
      for(let b=-W;b<=W;b+=6.5)for(let y=0;y<=H*(1-Math.pow(Math.abs(b)/W,2)*.6);y+=6.5){if(Math.abs(b)<hw+3.5&&Math.abs(y-yc)<hh+3.5)continue;rock((fr()-.5)*3,b,y,4.6,4.2);}
      gate(id,'Through '+name,0,0,yc-hh+1,yc+hh-1,hw-2,desc);shoal(W);},
    lean(id,name,desc){const half=K(26,34),top=K(70,95);if(!place(half+40,id,name))return;for(const e of [-1,1])for(let k=0;k<=12;k++){const t=k/12,b=e*lerp(half,4,t),y=lerp(-8,top,t),s=lerp(10,5,t);rock(-3,b,y,s,s*1.2);rock(4,b,y+3,s*.9,s*1.1);}
      gate(id,'Under '+name,0,0,-1,top*.45,half*.45,desc);shoal(half);},
  };
  const MORE=[
    ['arch','m_puffin','Puffin Arch','A stubby arch the puffins use as a doorstep.'],['arch','m_gannetarch','Gannet Arch','Tall and white with gannets. Mind the dive-bombers.'],['arch','m_doorstep','The Old Doorstep','An arch so worn the sea has nearly finished with it.'],
    ['arch','m_fiddler','Fiddler’s Arch','They say a fiddler played under it all one winter. Nobody says why.'],['arch','m_potarch','Lobster Pot Arch','The lobstermen’s shortcut home, if the tide is kind.'],['arch','m_shag','Shag Rock Arch','A black arch streaked white. Shags, not snow.'],
    ['skip','m_skip','The Skipping Stones','Low flat arches just above the waves, like stones skipped across the sea. Stay low.'],['skip','m_drakes','Ducks and Drakes','A row of tiny arches, skimming height. Wheels nearly wet.'],['skip','m_stepping','The Stepping Stones','Arch, arch, arch, arch. A path for a giant, or a very low plane.'],['skip','m_pebble','The Pebble Run','Little arches in a wobbly line. Thread them all without climbing.'],
    ['comb','m_comb','The Comb','A wall of thin stone teeth with one gap in the middle. Find it.'],['comb','m_gullteeth','Gull’s Teeth','Jagged teeth in a long line, and one gap just wide enough.'],['comb','m_picket','The Picket Fence','A fence of stone posts out at sea. One post is missing.'],['comb','m_rake','The Rake','Long tines of rock. Fly between the middle two.'],
    ['fork','m_fork','The Fork','One rock, two channels, an arch over each. Take both.'],['fork','m_twoways','Two Ways','Left or right? Both, eventually.'],['fork','m_tuning','The Tuning Fork','Two prongs that hum in a gale. Fly through each.'],
    ['stairs','m_bridgerun','The Bridge Run','Five arches stepping down to the sea, like stairs. Start at the top.'],['stairs','m_staircase','The Staircase','Each arch a step lower than the last. Mind the bottom step.'],['stairs','m_steps','Down the Steps','Down, down, down. A staircase for planes.'],
    ['eye','m_eye','Eye of the Storm','A ring of spires around a ring of spires. Get in, go round, get out.'],['eye','m_kings','The Ring of Kings','Twelve tall stones round seven taller ones. Circle the middle.'],['eye','m_bandstand','The Bandstand','A stone bandstand out at sea. Round and round the inner ring.'],
    ['ribs','m_whale','Whale Ribs','The bones of a whale bigger than any whale, half under the sea. Through the ribs, head to tail.'],['ribs','m_wreckribs','The Old Wreck Ribs','Stone ribs like an old ship’s timbers. In at the bow, out at the stern.'],['ribs','m_fishbone','The Fishbone','Ribs getting smaller, like the fish is swimming away.'],
    ['chandelier','m_chandelier','The Chandelier','A great arch hung with stone drops. Thread between them.'],['chandelier','m_icicles','The Icicles','Stone icicles hanging from an arch. They have not melted in ten thousand years.'],['chandelier','m_belltower','The Bell Tower','An arch with stone bells hanging inside. Ring none of them.'],
    ['goal','m_goalposts','The Goalposts','Three stone goals, each taller than the last. Score three.'],['goal','m_tallgates','The Tall Gates','Three gates of rock in a row, climbing as they go.'],['goal','m_frames','The Door Frames','Doors with nothing to open, stepping up out at sea.'],
    ['tube','m_drainpipe','The Drainpipe','A tube of rock right down at the water. Fly the length of it.'],['tube','m_longtube','The Long Tube','Seven rings of rock end to end, like a tunnel with the walls left off.'],['tube','m_smugglers','Smugglers’ Pipe','Where the smugglers hid, they say. A long rock pipe with light at the end.'],['tube','m_spyglass','The Spyglass','Look down it from one end and you can see the other. Then fly it.'],
    ['hoops','m_hooprun','The Hoop Run','Five rings on stalks, zigzagging. Through every one.'],['hoops','m_circus','The Circus Rings','Hoops of rock like a circus act. You’re the dog.'],['hoops','m_bubbles','The Bubble Rings','Rings of rock like bubbles blown by something enormous under the sea.'],['hoops','m_lifebuoys','The Lifebuoys','Stone lifebuoys on poles. Through them all for luck.'],
    ['slalom','m_longslalom','The Long Slalom','Five pairs of spires swinging left and right. Bank, bank, bank.'],['slalom','m_skerry','Skerry Slalom','The skerries make a slalom if you squint. Don’t squint while flying it.'],['slalom','m_weave','The Weave','Pairs of spires stepped side to side. Weave through.'],['slalom','m_chicane','The Chicane','A quick left-right through stone posts. Racers love it.'],
    ['window','m_porthole','The Porthole','A round hole through a wall of rock, like a ship’s porthole.',false],['window','m_letterbox','The Letterbox','A long, low slot through a wall of rock. Post yourself through it.',true],['window','m_window','The Window','A wall of rock with a window in it. Open, thankfully.',false],
    ['lean','m_tent','The Tent','Two slabs leaning on each other like a tent. In the front door, out the back.'],['lean','m_leaners','The Leaning Sisters','Two rocks leaning together, whispering. Fly between them.'],['lean','m_wigwam','The Wigwam','Rock leaning on rock, a pointed roof over the water.'],
  ];
  for(const [k,id,name,desc,extra] of MORE)KIND[k](id,name,desc,extra);

  addCells(it,toon(),2500,shadowy);if(grass.length)addCells(grass,toon(),2500,shadowy);
  if(foamIt.length){const fmM=new THREE.MeshBasicMaterial({color:0xf6f1e4,transparent:true,opacity:.55,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8,
      blending:THREE.CustomBlending,blendSrc:THREE.SrcAlphaFactor,blendDst:THREE.OneMinusSrcAlphaFactor,blendSrcAlpha:THREE.ZeroFactor,blendDstAlpha:THREE.OneFactor});addCells(foamIt,fmM,2500,m=>{m.renderOrder=2;return m;});
    anims.push(t=>{fmM.opacity=.42+Math.sin(t*1.7)*.13;});}
})();
