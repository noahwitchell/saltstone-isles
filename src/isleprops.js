/* ---------------- far archipelago props, fly-through gaps and errand finds ---------------- */
const SOLIDS=[];   // simple collision shapes for rock spires, arches and bridges: c = tapered cylinder, s = sphere
const FLYGATES=[]; // natural gaps worth flying through: a vertical window with a normal (nx,nz) and half-width w
const FINDS={};    // errand items: set id -> [{x,y,z}]
const solidCyl=(x,z,y0,y1,r0,r1)=>SOLIDS.push({k:'c',x,z,y0,y1,r0,r1});
const solidSph=(x,y,z,r)=>SOLIDS.push({k:'s',x,y,z,r});
function propHit(x,y,z,pad=1.2){for(const o of SOLIDS){if(o.k==='c'){if(y<o.y0||y>o.y1)continue;const r=lerp(o.r0,o.r1,(y-o.y0)/(o.y1-o.y0))+pad;if((x-o.x)**2+(z-o.z)**2<r*r)return true;}
  else if((x-o.x)**2+(y-o.y)**2+(z-o.z)**2<(o.r+pad)**2)return true;}return false;}
function flyGate(id,name,x,z,y0,y1,yaw,w,desc){FLYGATES.push({id,name,x,z,y0,y1,nx:Math.cos(yaw),nz:Math.sin(yaw),w,desc});}
const onIsle=(id,ok,score,n=500)=>{const I=ISLES[id];return findSpot(I.x,I.z,I.r,(x,z,h)=>isleAt(x,z)===id&&ok(x,z,h),score,n);};
const isleYaw=(id,du=0)=>ISLES[id].rot+du;
/* a weathered rock spire: stacked, slightly wandering drums, with a white seabird cap */
function spireAt(it,x,z,y0,top,r0,r1,seed){const n=7;let px=x,pz=z;
  for(let k=0;k<n;k++){const a=k/n,b=(k+1)/n,ya=lerp(y0,top,a),yb=lerp(y0,top,b),ra=lerp(r0,r1,a),rb=lerp(r0,r1,b);
    it.push({geo:new THREE.CylinderGeometry(rb,ra*1.04,yb-ya+.6,7),m:M([px,(ya+yb)/2,pz],[0,hash2(k,seed,3)*3,0]),color:rockC[(k+seed)%4]});
    px+=(hash2(k,seed,5)-.5)*r1*.3;pz+=(hash2(k,seed,6)-.5)*r1*.3;}
  it.push({geo:new THREE.CylinderGeometry(r1*.8,r1,2,7),m:M([px,top+.6,pz]),color:0xf4f0e6});
  solidCyl(x,z,y0,top+2,r0*.9,r1*.9);}
(function isleProps(){const it=[],rf=[],lit=[];
  const dir=(id,u,v)=>{const I=ISLES[id],c=Math.cos(I.rot),s=Math.sin(I.rot);return [u*c-v*s,u*s+v*c];};
  /* ---- Twin Sisters: two rock spires off the east tip, a 70 m gap between them ---- */
  {const I=ISLES.sisters,g=fromUV(I,930,40),[lx,lz]=dir('sisters',0,1),[nx,nz]=dir('sisters',1,0);
   spireAt(it,g.x-lx*66,g.z-lz*66,-12,150,30,10,1);spireAt(it,g.x+lx*66,g.z+lz*66,-12,124,27,9,2);
   for(const [a,b,s] of [[-1.6,.8,8],[1.8,-.6,6],[-.6,-1.3,5]])it.push({geo:new THREE.DodecahedronGeometry(1,0),m:M([g.x+lx*66*a+nx*30*b,1,g.z+lz*66*a+nz*30*b],[1,2,0],[s*1.4,s,s*1.2]),color:rockC[1]});
   flyGate('sisters','The Sisters\' Gap',g.x,g.z,-2,108,Math.atan2(nz,nx),26,'Straight between the Twin Sisters.');
   mark('sisters',g.x,g.z,0,'The Twin Sisters','Two spires of rock, a wingspan or seven apart. Wren has climbed them both.');
   const S=stripOf('sisters'),h=toWorld(S,-S.len/2+70,S.wid/2+26);hutAt(it,rf,h.x,h.z,-S.hdg*DEG,6,5,3,0xe8d8c0,0x3f8f8a,2);}
  /* ---- Puffin Rock: a sea arch you can fly under ---- */
  {const I=ISLES.puffin,c=fromUV(I,0,340),[ux,uz]=dir('puffin',1,0),[vx,vz]=dir('puffin',0,1),half=38,rise=58,th=11;
   for(const e of [-1,1]){const lx=c.x+ux*e*(half+th*.6),lz=c.z+uz*e*(half+th*.6);it.push({geo:new THREE.CylinderGeometry(th*1.05,th*1.5,rise+12,8),m:M([lx,rise/2-12+6,lz]),color:rockC[2]});solidCyl(lx,lz,-12,rise,th*1.4,th);}
   for(let k=0;k<=12;k++){const a=k/12*Math.PI,lat=Math.cos(a)*(half+th*.6),y=rise-4+Math.sin(a)*16,s=th*(1.05+.25*Math.sin(a*3));
     it.push({geo:new THREE.DodecahedronGeometry(1,0),m:M([c.x+ux*lat,y,c.z+uz*lat],[k,k*.7,0],[s*1.1,s*.95,s*1.3]),color:rockC[k%4]});solidSph(c.x+ux*lat,y,c.z+uz*lat,s*.9);}
   for(let k=0;k<7;k++){const a=k/6*Math.PI,lat=Math.cos(a)*(half+th*.4);it.push({geo:BOX(4,1.4,4),m:M([c.x+ux*lat,rise+10+Math.sin(a)*15,c.z+uz*lat],[0,k,0]),color:0xf4f0e6});}
   flyGate('arch','Under Puffin Arch',c.x,c.z,-2,rise-14,Math.atan2(vz,vx),24,'Right under the sea arch at Puffin Rock.');
   const p=onIsle('puffin',(x,z,h)=>h>30,(x,z,h)=>h);if(p){for(let k=0;k<60;k++){const x=p.x+(rnd()-.5)*90,z=p.z+(rnd()-.5)*70,h=groundH(x,z);if(h<25)continue;
       it.push({geo:BOX(.9,1.3,.9),m:M([x,h+.6,z],[0,rnd()*3,0]),color:k%3?0x2c2833:0xf4f0e6});}
     mark('puffins',p.x,p.z,p.h,'Puffin Rock','Two thousand puffins and one very patient warden\'s hut.');}}
  /* ---- Cleft Isle: the canyon, its rope bridge, and the goats ---- */
  {const I=ISLES.cleft,cl=u=>85*Math.sin(u/310+.4)+30*Math.sin(u/130),[ux,uz]=dir('cleft',1,0);
   const at=u=>fromUV(I,u,cl(u)),yawAt=u=>{const a=at(u-5),b=at(u+5);return Math.atan2(b.z-a.z,b.x-a.x);};
   const e0=at(-930),e1=at(930);flyGate('cleft_in','Into the Cleft',e0.x,e0.z,-4,115,yawAt(-930),46,'The west mouth of the canyon on Cleft Isle.');
   flyGate('cleft_out','Out of the Cleft',e1.x,e1.z,-4,115,yawAt(930),46,'The east mouth of the canyon on Cleft Isle.');
   const b=at(40),by=Math.min(groundH(fromUV(I,40,cl(40)-75).x,fromUV(I,40,cl(40)-75).z),groundH(fromUV(I,40,cl(40)+75).x,fromUV(I,40,cl(40)+75).z))-2,yw=yawAt(40),px=-Math.sin(yw),pz=Math.cos(yw);
   for(let k=-34;k<=34;k++){const t=k*2.2,sag=10*(1-(k/34)**2),y=by-sag;it.push({geo:BOX(2.4,.25,3.6),m:M([b.x+px*t,y,b.z+pz*t],[0,-yw,0]),color:k%2?0x8a6a4a:0x7a5a3e});
     if(k%3===0)solidSph(b.x+px*t,y,b.z+pz*t,2.2);}
   for(const e of [-1,1])for(const t of [-76,76]){const sx=b.x+px*t+Math.cos(yw)*e*1.6,sz=b.z+pz*t+Math.sin(yw)*e*1.6;it.push({geo:BOX(.5,5,.5),m:M([sx,by+1.5,sz]),color:0x6e5240});}
   flyGate('bridge','Under the Rope Bridge',b.x,b.z,-4,by-14,yw,40,'Beneath the rope bridge across the Cleft.');
   mark('bridge',b.x,b.z,by-40,'The Cleft Bridge','Seventy-six planks and a lot of rope. Tam crosses it twice a day with a goat under each arm.');
   FINDS.goats=[];for(let k=0;k<5;k++){const u=-700+k*330+(rnd()-.5)*80,side=k%2?1:-1;let best=null;for(let d=70;d<200;d+=8){const p=fromUV(I,u,cl(u)+side*d),h=groundH(p.x,p.z);if(slopeAt(p.x,p.z)<.6&&h>60){best={x:p.x,z:p.z,h};break;}}
     if(!best)continue;const ry=rnd()*6;const gm=new THREE.Mesh(merge([{geo:BOX(1.2,1.1,2.2),m:M([0,2.4,0],[0,0,0],[3.2,3.2,3.2]),color:0xffffff},{geo:BOX(.8,.9,1),m:M([0,5,3.6],[0,0,0],[3.2,3.2,3.2]),color:0x2c2833},
       ...[[-1,-1],[1,-1],[-1,1],[1,1]].map(([a,b])=>({geo:BOX(.7,2.2,.7),m:M([a*1.3,.6,b*2.6]),color:0xf4efe4}))]),toon({},false));gm.position.set(best.x,best.h,best.z);gm.rotation.y=ry;scene.add(gm);
     FINDS.goats.push({x:best.x,y:best.h,z:best.z,obj:gm,kind:'hop'});}
   const S=stripOf('cleft'),h=toWorld(S,-S.len/2+90,-(S.wid/2+24));hutAt(it,rf,h.x,h.z,-S.hdg*DEG,7,5,3.2,0xd8c4a8,0xb8704a,2);}
  /* ---- Kettle Rock: dive through the crater (below the rim) ---- */
  {const k=ISLES.kettle,rim=kettleCone(KET.cr,0),fl=rim-KET.depth;flyGate('crater','Through the Crater',k.x,k.z,fl+12,rim-8,0,KET.cr*.55,'Through Kettle Crater, below the rim.');}
  /* ---- Gull stacks: squeeze between the two big ones (the stacks get collision too) ---- */
  {const st=sights.stacks;if(st){const bx=st.x,bz=st.z;for(const [dx,dz,hh,r] of [[0,0,46,9],[34,22,32,7],[-30,30,24,6],[12,-34,18,5]])solidCyl(bx+dx,bz+dz,-6,hh-5,r,r*.7);
     const L=Math.hypot(34,22);flyGate('stacks','The Stack Squeeze',bx+17,bz+11,-1,24,Math.atan2(34/L,-22/L),7,'Between the two tallest Gull Stacks.');}}
  /* ---- Applecross: village, cider barn, kites ---- */
  {const S=stripOf('apple'),yaw=-S.hdg*DEG;
   for(let k=0;k<11;k++){const u=-230+k*44+(rnd()-.5)*12,t=S.wid/2+60+rnd()*70;const p=toWorld(S,u,t);if(groundH(p.x,p.z)<5)continue;
     hutAt(it,rf,p.x,p.z,yaw+(rnd()<.5?0:Math.PI/2),7+rnd()*2,6,4,[0xf1e4c8,0xe8c8a8,0xf4ece0][k%3],[0xc2553f,0x8a5a3a,0x5b6e86][k%3],2);}
   const c=onIsle('apple',(x,z,h)=>h>20&&slopeAt(x,z)<.15&&clearOf(x,z,90),(x,z,h)=>-Math.hypot(x-S.x,z-S.z)*.2+h*.5);
   if(c){const y=c.h;it.push({geo:BOX(22,9,14),m:M([c.x,y+3.5,c.z],[0,.3,0]),color:0xb8443a});rf.push({geo:new THREE.CylinderGeometry(9,9,23,4,1).rotateZ(Math.PI/2),m:M([c.x,y+9,c.z],[0,.3,0],[1,.55,1]),color:0x6a5040});
     for(let k=0;k<4;k++)it.push({geo:new THREE.CylinderGeometry(1.8,1.8,2.6,8).rotateZ(Math.PI/2),m:M([c.x+Math.cos(.3)*(-14),y+1.3,c.z-Math.sin(.3)*(-14)+(k-1.5)*3.2],[0,.3,0]),color:0x8a6a4a});
     lit.push([c.x,y+5,c.z,0xffc25a]);mark('cider',c.x,c.z,y,'The Cider Barn','Red barn, four barrels outside, and a smell you can follow from the air in autumn.');}
   FINDS.kites=[];const kc=[0xd2493c,0x3f8fc0,0xe8a33a,0x7a4ab8,0x3f8f5a,0xff7a2e,0xf2c84a,0xc2456a];for(let k=0;k<8;k++){const p=onIsle('apple',(x,z,h)=>orchardAt(x,z)&&clearOf(x,z,60),()=>rnd());if(!p)continue;
     const g=new THREE.Group(),y=p.h+28+rnd()*12;g.scale.setScalar(2.4);g.add(new THREE.Mesh(merge([{geo:BOX(3.4,4.6,.15),m:M([0,0,0],[0,0,Math.PI/4],[1,1,1]),color:kc[k]},{geo:BOX(.12,7,.12),m:M([0,-5.5,0]),color:0xf4efe2},
       ...[0,1,2].map(i=>({geo:BOX(.9,.5,.1),m:M([0,-3.5-i*1.8,0],[0,0,.6]),color:kc[(k+2)%6]}))]),toon({},false)));g.position.set(p.x,y,p.z);scene.add(g);
     const ph=rnd()*6;const fo={x:p.x,y,z:p.z,obj:g,kind:'loop',busy:0};anims.push(t=>{if(fo.busy)return;g.rotation.y=t*.2+ph;g.rotation.z=Math.sin(t*1.3+ph)*.25;g.position.y=y+Math.sin(t*.9+ph)*1.5;});FINDS.kites.push(fo);}}
  /* ---- the Saltpans: salt heaps, a windpump, and a meteorite ---- */
  {const S=stripOf('salt');for(let k=0;k<14;k++){const p=toWorld(S,-S.len/2+40+k*30,-(S.wid/2+40+(k%2)*14));const h=Math.max(groundH(p.x,p.z),.5);it.push({geo:new THREE.ConeGeometry(6+rnd()*2,5+rnd()*2,7),m:M([p.x,h+2.4,p.z]),color:0xf8f4ee});}
   const wp=toWorld(S,S.len/2+40,S.wid/2+30),wy=groundH(wp.x,wp.z);for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]])beam(it,new V3(wp.x+a*2.4,wy,wp.z+b*2.4),new V3(wp.x+a*.5,wy+14,wp.z+b*.5),.2,0x8a8a92);
   const pump=new THREE.Mesh(merge([...Array(12)].map((_,i)=>({geo:BOX(.5,3.4,.08),m:M([Math.cos(i/12*TAU)*2,Math.sin(i/12*TAU)*2,0],[0,0,i/12*TAU]),color:0xe8e4dc}))),toon({},false));pump.position.set(wp.x,wy+14.5,wp.z);scene.add(pump);anims.push(t=>{pump.rotation.z=t*1.6;});
   const p=onIsle('salt',(x,z,h)=>h>1.5&&clearOf(x,z,120)&&saltPan(x,z)<0,(x,z,h)=>Math.hypot(x-S.x,z-S.z));
   if(p){for(let k=0;k<14;k++){const a=k/14*TAU;it.push({geo:new THREE.DodecahedronGeometry(1,0),m:M([p.x+Math.cos(a)*16,p.h,p.z+Math.sin(a)*16],[k,k,0],[3.4,2,3]),color:k%2?0xff7a2e:0xd2493c});}
     it.push({geo:new THREE.DodecahedronGeometry(4,0),m:M([p.x,p.h+2,p.z],[.4,.2,0]),color:0x2c2833});lit.push([p.x,p.h+5,p.z,0xff7a2e]);mark('meteor',p.x,p.z,p.h,'The Fallen Star','A black stone in a ring of scorched earth. It came down the night Desmond was born.');}}
  /* ---- Looking-Glass Isle: the lake, the painter's cottage, a rowboat ---- */
  {const I=ISLES.mirror,lx=I.x-180,lz=I.z+40;const ph=scanTo(lx,lz,1,0,h=>h>1.2,500,6);if(ph)hutAt(it,rf,ph.x+16,ph.z,0,7,6,3.6,0xf4ece0,0x6a8ab8,2);
   const boat=new THREE.Mesh(merge([{geo:BOX(1.6,.7,4.2),m:M([0,.25,0]),color:0xd2493c},{geo:BOX(1.7,.25,4.3),m:M([0,-.1,0]),color:0xf4efe4}]),toon());scene.add(boat);
   anims.push(t=>{const a=t*.02;boat.position.set(lx+Math.cos(a)*110,Math.sin(t*1.1)*.08,lz+Math.sin(a)*90);boat.rotation.y=-a;});
   sights.lake={x:lx,z:lz,y:0,name:'Looking-Glass Lake',desc:'So still you can see the clouds in it. Lio has painted it four hundred times.'};farmSpots.push({x:lx,z:lz,r:380});}
  /* ---- Sweetheart Islet ---- */
  {const I=ISLES.heart;mark('heart',I.x,I.z,4,'Sweetheart Islet','A little island shaped like a heart. You can only tell from up here.');}
  /* ---- Starwatch Mesa: the radio dish and two small domes ---- */
  {const S=stripOf('mesa');const p=onIsle('mesa',(x,z,h)=>h>250&&slopeAt(x,z)<.12&&clearOf(x,z,90),(x,z,h)=>-Math.abs(Math.hypot(x-S.x,z-S.z)-320));
   if(p){const y=p.h,g=new THREE.Group();g.add(new THREE.Mesh(merge([{geo:new THREE.SphereGeometry(26,16,6,0,TAU,0,.75),m:M([0,0,0],[Math.PI,0,0]),color:0xeeeae4},{geo:new THREE.CylinderGeometry(.5,.5,20,5),m:M([0,8,0]),color:0x9a9aa2},
       {geo:BOX(2.6,2.6,2.6),m:M([0,18,0]),color:0x8a8a92}]),toon({side:THREE.DoubleSide},false)));g.position.set(p.x,y+26,p.z);
     it.push({geo:new THREE.CylinderGeometry(3,5,22,8),m:M([p.x,y+10,p.z]),color:0xd8d4cc});it.push({geo:BOX(18,6,18),m:M([p.x,y+2,p.z]),color:0xc8c4bc});scene.add(g);
     anims.push(t=>{g.rotation.set(-.5+Math.sin(t*.02)*.15,t*.03,0,'YXZ');});solidCyl(p.x,p.z,y-2,y+24,6,4);solidSph(p.x,y+28,p.z,22);
     for(const [dx,dz] of [[40,10],[34,-28]]){const hy=groundH(p.x+dx,p.z+dz);it.push({geo:new THREE.CylinderGeometry(5,5.4,6,10),m:M([p.x+dx,hy+2,p.z+dz]),color:0xeeeae2});it.push({geo:new THREE.SphereGeometry(5.2,10,5,0,TAU,0,Math.PI/2),m:M([p.x+dx,hy+5,p.z+dz]),color:0xc8ccd2});lit.push([p.x+dx,hy+3,p.z+dz,0xffc25a]);}
     mark('dish',p.x,p.z,y,'The Starwatch Dish','A radio telescope listening for whatever is out there. Odile says it mostly hears the sun.');}}
  /* ---- Cascade Isle: a waterfall down the cliff, the warden's hut, trail cairns ---- */
  {const I=ISLES.cascade,gv=u=>60+u*.08;let lip=null,foot=null;
   for(let u=180;u>-420;u-=6){const p=fromUV(I,u,gv(u)),h=groundH(p.x,p.z),q=fromUV(I,u-12,gv(u-12)),h2=groundH(q.x,q.z);if(!lip&&h-h2>5)lip={u,h};if(lip&&!foot&&h-h2<.6&&u<lip.u-40){foot={u,h};break;}}
   if(lip&&foot){const P=[],C=[],UV=[],N=24,w=15;for(let k=0;k<=N;k++){const u=lerp(lip.u+6,foot.u,k/N),p=fromUV(I,u,gv(u)),h=Math.max(groundH(p.x,p.z),.3)+2.2+(k===0?1.5:0),[px,pz]=dir('cascade',0,1);
       P.push(p.x-px*w,h,p.z-pz*w,p.x+px*w,h,p.z+pz*w);UV.push(0,k/N*6,1,k/N*6);}
     const idx=[];for(let k=0;k<N;k++){const a=k*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}
     const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));g.setIndex(idx);
     const wm=new THREE.ShaderMaterial({uniforms:{uTime:{value:0}},side:THREE.DoubleSide,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
       fragmentShader:'uniform float uTime;varying vec2 vUv;void main(){float s=fract(vUv.y*5.-uTime*1.6+sin(vUv.x*23.)*.35+sin(vUv.x*7.+1.)*.2);float e=smoothstep(0.,.25,vUv.x)*smoothstep(1.,.75,vUv.x);vec3 c=mix(vec3(.78,.9,.95),vec3(.98,.99,1.),step(.35,s));gl_FragColor=vec4(c,.95*e);}',transparent:true});
     scene.add(new THREE.Mesh(g,wm));anims.push(t=>{wm.uniforms.uTime.value=t;});
     const fp=fromUV(I,foot.u-30,gv(foot.u-30));it.push({geo:new THREE.CylinderGeometry(26,26,.6,14),m:M([fp.x,Math.max(groundH(fp.x,fp.z),0)+.5,fp.z]),color:0x5fb8d0});
     const N2=10,pm=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),new THREE.MeshToonMaterial({color:0xf4f8fa,gradientMap:gradTex,flatShading:true}),N2);scene.add(pm);const mm=new THREE.Matrix4(),q=new Q(),bp=fromUV(I,foot.u+8,gv(foot.u+8)),by=foot.h+2;
     anims.push(t=>{for(let i=0;i<N2;i++){const ph=(t*.25+i/N2)%1,s=(2+ph*6)*(ph>.7?(1-ph)/.3:1);mm.compose(new V3(bp.x+Math.cos(i*2.4)*ph*14,by+ph*14,bp.z+Math.sin(i*2.4)*ph*14),q,new V3(s,s,s));pm.setMatrixAt(i,mm);}pm.instanceMatrix.needsUpdate=true;});
     const top=fromUV(I,lip.u,gv(lip.u));mark('falls',top.x,top.z,foot.h,'Cascade Falls','Two hundred metres of white water. Kit says the hut shakes when it rains.');}
   const S=stripOf('cascade'),h=toWorld(S,-S.len/2+80,S.wid/2+26);hutAt(it,rf,h.x,h.z,-S.hdg*DEG,7,6,3.4,0x8a6a4a,0x3f6b3a,2);
   FINDS.cairns=[];for(let k=0;k<4;k++){const p=onIsle('cascade',(x,z,h)=>h>200&&slopeAt(x,z)<.3&&clearOf(x,z,30),()=>rnd());if(!p)continue;
     for(let j=0;j<5;j++)it.push({geo:new THREE.DodecahedronGeometry(1,0),m:M([p.x,p.h+j*3+1,p.z],[j,j*2,0],[5.2-j*.8,2,4.8-j*.7]),color:j%2?0xd8d4cc:0xf4f0e8});
     it.push({geo:BOX(.5,13,.5),m:M([p.x,p.h+20,p.z]),color:0x2c2833});const fl=new THREE.Mesh(BOX(6,3.4,.2).translate(3,0,0),toon({vertexColors:false,color:0xff6a1e},false));fl.position.set(p.x,p.h+19,p.z);scene.add(fl);
     FINDS.cairns.push({x:p.x,y:p.h,z:p.z,obj:fl,kind:'flag'});}}
  /* ---- Lantern Key: houses on stilts round the shore, strings of lanterns, and lanterns adrift ---- */
  {const I=ISLES.lantern,lc=[0xff9a3a,0xffd36b,0xd2493c,0xff7a8a];let prev=null;
   for(let k=0;k<20;k++){const a=k/20*TAU,ux=Math.cos(a),uz=Math.sin(a);const sh=scanTo(I.x,I.z,ux,uz,h=>h<0,1200,6);if(!sh)continue;const x=sh.x+ux*9,z=sh.z+uz*9;if(nearStrip(x,z,40)){prev=null;continue;}
     const ry=-a+Math.PI/2;for(const [p,q] of [[-2.5,-2],[2.5,-2],[-2.5,2],[2.5,2]])it.push({geo:BOX(.35,6,.35),m:M([x+p*Math.cos(ry)+q*Math.sin(ry),.5,z-p*Math.sin(ry)+q*Math.cos(ry)]),color:0x5a4a3e});
     it.push({geo:BOX(7,.4,6),m:M([x,3.5,z],[0,ry,0]),color:0x8a6a4a});it.push({geo:BOX(5.6,3.4,4.6),m:M([x,5.4,z],[0,ry,0]),color:[0xf4ece0,0x9ad0d8,0xf0c8a0,0xe8e0f0][k%4]});
     rf.push({geo:new THREE.ConeGeometry(4.6,2.6,4).rotateY(Math.PI/4),m:M([x,8.4,z],[0,ry,0],[1,1,.85]),color:[0xc2553f,0x3f6f8f,0x8a5a3a][k%3]});lit.push([x+ux*2.4,5.6,z+uz*2.4,0xffc25a]);farmSpots.push({x,z,r:8});
     if(prev){for(let j=1;j<6;j++){const t=j/6;lit.push([lerp(prev.x,x,t),7.6-Math.sin(t*Math.PI)*1.6,lerp(prev.z,z,t),lc[(j+k)%4]]);}}prev={x,z};}
   const T=onIsle('lantern',(x,z,h)=>h>4&&clearOf(x,z,60),(x,z,h)=>-Math.hypot(x-I.x,z-I.z));
   if(T){const y=T.h;for(let j=0;j<5;j++)it.push({geo:new THREE.CylinderGeometry(3.2-j*.4,3.4-j*.4,3.4,8),m:M([T.x,y+1.7+j*3.6,T.z]),color:j%2?0xd2493c:0xf4e4c0});lit.push([T.x,y+17,T.z,0xffb05a]);
     mark('lanterntower',T.x,T.z,y,'The Lantern Tower','Five paper storeys. Lit every night for the boats, and on festival night for everyone.');}
   FINDS.lanterns=[];const lm=new THREE.MeshBasicMaterial({color:0xffb050,fog:false});for(let k=0;k<7;k++){const a=k/7*TAU+.3,r=700+rnd()*500,cx=I.x+Math.cos(a)*r,cz=I.z+Math.sin(a)*r,cy=50+rnd()*70;
     const m=new THREE.Mesh(new THREE.BoxGeometry(5.5,7,5.5),lm);scene.add(m);const o={x:cx,y:cy,z:cz};const ph=rnd()*6;
     anims.push(t=>{o.x=cx+Math.sin(t*.03+ph)*60;o.z=cz+Math.cos(t*.025+ph)*60;o.y=(o.base?o.base.cy:cy)+Math.sin(t*.2+ph)*4;m.position.set(o.x,o.y,o.z);m.rotation.y=t*.3;});o.obj=m;o.kind='rise';o.base={cy};FINDS.lanterns.push(o);}}
  /* ---- Greystone: a crane over the terraced pit, and the stone sheds ---- */
  {const I=ISLES.quarry,c=fromUV(I,120,-40),rimP=fromUV(I,120,-40+250),ry=groundH(rimP.x,rimP.z);
   const top=new V3(rimP.x,ry+38,rimP.z);beam(it,new V3(rimP.x,ry,rimP.z),top,1.2,0xe8a33a);beam(it,top,new V3(lerp(rimP.x,c.x,.45),ry+34,lerp(rimP.z,c.z,.45)),.8,0xe8a33a);
   beam(it,new V3(lerp(rimP.x,c.x,.45),ry+33,lerp(rimP.z,c.z,.45)),new V3(lerp(rimP.x,c.x,.45),ry+8,lerp(rimP.z,c.z,.45)),.1,0x2c2833);
   for(let k=0;k<3;k++){const p=fromUV(I,120+(k-1)*30,-40+300);hutAt(it,rf,p.x,p.z,I.rot,12,8,5,0xb8b4ac,0x5b6e86,1);}
   for(let k=0;k<10;k++){const p=fromUV(I,60+k*6,-40+282),h=groundH(p.x,p.z);it.push({geo:BOX(4,2.4,3),m:M([p.x,h+1.2+(k%3)*2.4,p.z],[0,I.rot,0]),color:0xd8d4cc});}
   mark('pit',c.x,c.z,groundH(c.x,c.z),'Greystone Pit','Stone for every harbour wall in the islands came out of this hole, one terrace at a time.');}
  /* ---- Windward: a row of old mills along the ridge ---- */
  {const I=ISLES.windward,[nx,nz]=dir('windward',0,-1),yw=Math.atan2(nx,nz);const mills=[];
   for(let k=0;k<7;k++){const p=fromUV(I,-690+k*230,-70),h=groundH(p.x,p.z);it.push({geo:new THREE.CylinderGeometry(5,7,28,8),m:M([p.x,h+13,p.z]),color:0xf1ece2});
     rf.push({geo:new THREE.ConeGeometry(6.2,8,8),m:M([p.x,h+31,p.z]),color:0x5b4a3e});solidCyl(p.x,p.z,h-2,h+34,7.5,6);
     const s=new THREE.Mesh(merge([0,1,2,3].map(i=>({geo:BOX(2.6,19,.3).translate(0,10.4,0),m:M([0,0,0],[0,0,i*Math.PI/2]),color:0xe8dcc4}))),toon({},false));
     s.position.set(p.x+nx*7,h+26,p.z+nz*7);s.rotation.y=yw;scene.add(s);mills.push(s);solidSph(p.x+nx*7,h+26,p.z+nz*7,17);}
   anims.push(t=>{mills.forEach((s,i)=>{s.rotation.z=t*.9+i;});});
   const c=fromUV(I,0,-70);mark('mills',c.x,c.z,groundH(c.x,c.z),'The Seven Mills','They grind flour for half the islands. Agnes knows each one by its creak.');
   FINDS.sheep=[];for(let k=0;k<3;k++){const p=onIsle('windward',(x,z,h)=>h>8&&slopeAt(x,z)<.3&&clearOf(x,z,40),()=>rnd());if(!p)continue;const ry=rnd()*6;
     const sm=new THREE.Mesh(merge([{geo:BOX(2.2,1.8,3.2),m:M([0,3,0],[0,0,0],[2.6,2.6,2.6]),color:0xff3a2a},{geo:BOX(1,1,1.2),m:M([0,4.6,5],[0,0,0],[2.6,2.6,2.6]),color:0x2c2833},...[[-1,-1],[1,-1],[-1,1],[1,1]].map(([a,c])=>({geo:BOX(.8,2,.8),m:M([a*1.8,.6,c*2.8]),color:0x2c2833}))]),toon({},false));
     sm.position.set(p.x,p.h,p.z);sm.rotation.y=ry;scene.add(sm);FINDS.sheep.push({x:p.x,y:p.h,z:p.z,obj:sm,kind:'hop'});}}
  /* ---- Bell Rock ---- */
  {const I=ISLES.bell,y=groundH(I.x,I.z);it.push({geo:BOX(5,16,5),m:M([I.x,y+7,I.z]),color:0xe8e2d6});for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]])it.push({geo:BOX(.8,4,.8),m:M([I.x+a*2.1,y+17,I.z+b*2.1]),color:0xe8e2d6});
   it.push({geo:new THREE.ConeGeometry(4,4,4).rotateY(Math.PI/4),m:M([I.x,y+21,I.z]),color:0x3f6f8f});it.push({geo:new THREE.CylinderGeometry(.6,1.3,1.6,8),m:M([I.x,y+16.4,I.z]),color:0xd8a040});solidCyl(I.x,I.z,y-2,y+23,4,3);
   mark('bell',I.x,I.z,y,'Bell Rock','A bell tower on a rock in the fog lane. It rings by itself when the swell is up.');}
  /* ---- Tern Bars: a wreck and some seals ---- */
  {const I=ISLES.tern,w=fromUV(I,60,10),y=.6;const W=new THREE.Mesh(merge([{geo:BOX(7,4,26),m:M([0,1,0]),color:0xc2553f},{geo:BOX(7.2,1,26.2),m:M([0,-1,0]),color:0x2c2833},{geo:BOX(4,3,6),m:M([0,4,-4]),color:0xf4efe4},
     {geo:new THREE.CylinderGeometry(.35,.4,11,5),m:M([0,8,3],[0,0,.3]),color:0x6e5240}]),toon());W.position.set(w.x,y,w.z);W.rotation.set(.05,.8,.22);scene.add(W);
   mark('wreck',w.x,w.z,0,'The Wreck of the Merrow','A coaster that ran onto the bars in a storm. The terns moved in the next morning.');
   for(const [du,dv] of TERN)for(let k=0;k<3;k++){const p=fromUV(I,du+(rnd()-.5)*80,dv+(rnd()-.5)*20),h=groundH(p.x,p.z);if(h<.3)continue;it.push({geo:new THREE.SphereGeometry(1,6,4),m:M([p.x,h+.4,p.z],[0,rnd()*3,0],[1,.6,2]),color:0x8a8890});}}
  /* ---- Marram: Ollie's dad's lobster-pot buoys, scattered by the storm ---- */
  {const I=ISLES.marram;FINDS.buoys=[];for(let k=0;k<4;k++){const a=k/4*TAU+.4,r=1100+rnd()*700,x=I.x+Math.cos(a)*r,z=I.z+Math.sin(a)*r;if(groundH(x,z)>-1)continue;
     const m=new THREE.Mesh(merge([{geo:new THREE.SphereGeometry(4,10,7),m:M([0,0,0]),color:0xff6a1e},{geo:BOX(4.2,1.2,4.2),m:M([0,0,0]),color:0xffffff},{geo:BOX(.4,12,.4),m:M([0,7,0]),color:0x2c2833},{geo:BOX(5,3,.2),m:M([2.5,11.5,0]),color:0xffd34a}]),toon({},false));
     m.position.set(x,0,z);scene.add(m);const ph=rnd()*6;const fo={x,y:0,z,obj:m,kind:'ring',ring:0};anims.push(t=>{m.position.y=Math.sin(t*1.3+ph)*.3+fo.ring*Math.abs(Math.sin(t*9))*1.6;m.rotation.z=Math.sin(t+ph)*.15+fo.ring*Math.sin(t*16)*.45;});FINDS.buoys.push(fo);}}
  /* ---- Tallpine: osprey nests on dead snags ---- */
  {FINDS.nests=[];for(let k=0;k<3;k++){const p=findSpot(1100,-200,1500,(x,z,h)=>isleAt(x,z)==='tall'&&h>60&&h<380&&slopeAt(x,z)<.35&&clearOf(x,z,40),()=>rnd());if(!p)continue;
     beam(it,new V3(p.x,p.h-1,p.z),new V3(p.x+.6,p.h+36,p.z+.3),1.4,0xf4efe4);for(const a of [0,2.2,4.1])beam(it,new V3(p.x+.4,p.h+24+a,p.z+.2),new V3(p.x+Math.cos(a)*7,p.h+30+a,p.z+Math.sin(a)*7),.5,0xf4efe4);
     it.push({geo:new THREE.CylinderGeometry(6,3.5,3.2,9),m:M([p.x+.6,p.h+37.4,p.z+.3]),color:0xf0c050});const os=new THREE.Group(),om=toon({},false);os.add(new THREE.Mesh(merge([{geo:BOX(2.4,2.4,4),m:M([0,0,0]),color:0xffffff},{geo:BOX(1.2,1.2,1.4),m:M([0,1,-2.4]),color:0xffffff},{geo:BOX(.5,.4,.8),m:M([0,.8,-3.4]),color:0xffc040},{geo:BOX(1.3,.3,1.6),m:M([0,1.1,-2.3]),color:0x2c2833},{geo:BOX(2,.3,2),m:M([0,0,2.6]),color:0x5a4030}]),om));
     const wL=new THREE.Group(),wR=new THREE.Group();wL.add(new THREE.Mesh(merge([{geo:BOX(6,.3,2.4),m:M([-3.2,0,0]),color:0x5a4030},{geo:BOX(2,.32,2.4),m:M([-1.4,.02,0]),color:0xffffff}]),om));wR.add(new THREE.Mesh(merge([{geo:BOX(6,.3,2.4),m:M([3.2,0,0]),color:0x5a4030},{geo:BOX(2,.32,2.4),m:M([1.4,.02,0]),color:0xffffff}]),om));
     wL.position.set(-1.1,.6,0);wR.position.set(1.1,.6,0);wL.rotation.z=-1.2;wR.rotation.z=1.2;os.add(wL,wR);os.position.set(p.x+.6,p.h+40,p.z+.3);scene.add(os);
     FINDS.nests.push({x:p.x,y:p.h+30,z:p.z,obj:os,wL,wR,kind:'fly',home:new V3(p.x+.6,p.h+40,p.z+.3)});}}
  /* a hut and windsock-side shed for each new airstrip */
  for(const s of ARCH_STRIPS){if(['sisters','cleft','cascade'].includes(s.id))continue;const S=stripOf(s.id),p=toWorld(S,S.len/2-60,-(S.wid/2+22));if(groundH(p.x,p.z)<2)continue;hutAt(it,rf,p.x,p.z,-S.hdg*DEG,6,5,3,0xe8dcc8,0x3f6f8f,1);}
  scene.add(shadowy(new THREE.Mesh(merge(it),toon())));scene.add(shadowy(new THREE.Mesh(merge(rf),toon())));for(const [x,y,z,c] of lit)addLight(x,y,z,c);
})();
/* trees for the new islands: [island, how many, rule] — a rule returns a tree or null */
const _orch=new Set();
const ARCH_TREES=[
  ['sisters',260,(x,z,h)=>h>6&&!nearStrip(x,z,50)&&slopeAt(x,z)<.4&&rnd()<.6?{x,z,h,pine:rnd()<.4,s:.6+rnd()*.5}:null],
  ['cleft',380,(x,z,h)=>h>80&&!nearStrip(x,z,50)&&slopeAt(x,z)<.35?{x,z,h,pine:rnd()<.7,s:.45+rnd()*.45}:null],
  ['apple',1300,(x,z,h)=>{if(h<6||nearStrip(x,z,55))return null;
    if(orchardAt(x,z)){const I=ISLES.apple,[u,v]=locUV(I,x,z),uu=Math.round(u/13),vv=Math.round(v/10),key=uu+','+vv;if(_orch.has(key))return null;_orch.add(key);const p=fromUV(I,uu*13,vv*10);
      return {x:p.x,z:p.z,h:groundH(p.x,p.z),pine:false,s:.5+rnd()*.12,col:rnd()<.35?0xe8a8b8:rnd()<.5?0x7ba746:0x6a9a42};}
    return rnd()<.25?{x,z,h,pine:rnd()<.2,s:.7+rnd()*.5}:null;}],
  ['mirror',480,(x,z,h)=>h>3&&!nearStrip(x,z,50)&&slopeAt(x,z)<.45&&fbm(x*.004,z*.004,2,259)>-.1?{x,z,h,pine:rnd()<.3,s:.6+rnd()*.5,col:rnd()<.25?0xf0b8c8:0}:null],
  ['mesa',140,(x,z,h)=>h>3&&h<40&&!nearStrip(x,z,40)?{x,z,h,pine:false,s:.4+rnd()*.3}:null],
  ['cascade',1700,(x,z,h)=>h>8&&!nearStrip(x,z,55)&&slopeAt(x,z)<.55?{x,z,h,pine:rnd()<.75,s:.8+rnd()*.7,col:rnd()<.5?0x2f5534:0x3a6a3a}:null],
  ['lantern',260,(x,z,h)=>h>1.5&&!nearStrip(x,z,30)?{x,z,h,palm:true,pine:false,s:.7+rnd()*.5}:null],
  ['quarry',260,(x,z,h)=>{const [u,v]=locUV(ISLES.quarry,x,z);return h>6&&Math.hypot(u-120,v+40)>290&&!nearStrip(x,z,50)&&slopeAt(x,z)<.45?{x,z,h,pine:rnd()<.8,s:.6+rnd()*.5}:null;}],
  ['windward',140,(x,z,h)=>h>4&&h<50&&!nearStrip(x,z,50)?{x,z,h,pine:false,s:.6+rnd()*.5}:null],
  ['heart',30,(x,z,h)=>h>1.5?{x,z,h,pine:false,s:.5+rnd()*.3,col:0xf0a8c0}:null],
];
