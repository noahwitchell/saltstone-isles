/* ---------- secret sea caves ----------
   Three grottos at the foot of sea cliffs, reachable only on floats. Each is a wide arch at the waterline with open
   water in front. Taxi in, and a little way inside the cave takes over: a card shows what's there, then you're set
   back down outside the mouth with the nose pointing out to sea, so there's never any turning round in the dark.
   Placement: x,z = the shore point at the cliff foot, d = the outward heading in degrees (found by a search for
   steep cliffs with clear water in front, away from runways). */
if(!log.caves)log.caves={};
const CAVES=[
  {id:'smuggler',isle:'mesa',name:"Smugglers' Grotto",x:-8522,z:-41,d:36,coins:150,kind:'chest',
    say:'Barrels gone soft with age, a rope ladder that ends at nothing, and a tin box of very old coins. Somebody meant to come back for these.'},
  {id:'glow',isle:'cleft',name:'Glowworm Cave',x:8757,z:-7117,d:183,coins:100,kind:'glow',
    say:'The ceiling is full of tiny blue-green lights. Biscuit stares up at them and forgets to bark. Someone left a jar of coins on the ledge "for the next one who finds it".'},
  {id:'bea',isle:'cascade',name:"Bea's Hideaway",x:3067,z:-7123,d:39,coins:100,kind:'cards',
    say:'"B.H. 1971" is carved into the rock above a dry ledge. A biscuit tin holds a stack of postcards Bea wrote and never sent, and a few coins for the finder.'},
];
const CW=26,CHI=15,CD=46,CWO=36,CHO=40;   // inner width/height, depth; outer half-width, height
(()=>{const hs=(a,b)=>{const s=Math.sin(a*127.1+b*311.7)*43758.5453;return s-Math.floor(s);};
  const rockC=new THREE.Color(),darkC=new THREE.Color();
  for(const C of CAVES){const a=C.d*DEG;C.nx=Math.sin(a);C.nz=Math.cos(a);
    C.mx=C.x+C.nx*(8+CD);C.mz=C.z+C.nz*(8+CD);   // the mouth, out on the water
    const g=new THREE.Group();g.position.set(C.mx,0,C.mz);g.rotation.y=Math.atan2(C.nx,C.nz);
    // arch profile: left foot under water, over the top, right foot; r scales the width and height
    const N=22,prof=(w,h,z,seed,amp)=>{const P=[];P.push([-w,-7]);for(let i=0;i<=N;i++){const th=Math.PI*(1-i/N),n=amp?(hs(i+seed,Math.round(z))-.5)*amp:0;P.push([Math.cos(th)*(w+n),Math.max(-1,Math.sin(th)*(h+n*.8))]);}P.push([w,-7]);return P;};
    const pos=[],col=[],ipos=[],icol=[];
    const quad=(A,B,Cc,D,c,arr,carr,cB)=>{for(const [p,cc] of [[A,c],[B,cB||c],[Cc,cB||c],[A,c],[Cc,cB||c],[D,c]]){arr.push(...p);carr.push(cc.r,cc.g,cc.b);}};
    // outer shell: lofted rings from just in front of the mouth to well back into the cliff
    const OZ=[4,-6,-18,-30,-42,-56,-70];let prev=null;
    for(const z of OZ){const k=z<-40?.75:1,ring=prof(CWO*k,CHO*(z<-50?.8:1),z,C.d+z,8).map(([x,y])=>[x,y,z]);
      if(prev)for(let i=0;i<ring.length-1;i++){rockC.setHSL(.065,.32,.5+hs(i,z)*.14);quad(prev[i],prev[i+1],ring[i+1],ring[i],rockC.clone(),pos,col);}
      prev=ring;}
    // front face: outer ring at z=4 down to the arch edge at z=0
    const fo=prof(CWO,CHO,4,C.d+4,8),fi=prof(CW/2,CHI,0,C.d,0);
    for(let i=0;i<fo.length-1;i++){rockC.setHSL(.065,.3,.42+hs(i,9)*.1);quad([...fo[i],4],[...fo[i+1],4],[...fi[i+1],0],[...fi[i],0],rockC.clone(),pos,col);}
    // inner tunnel: dark, darker toward the back, narrowing a little
    const IZ=[0,-10,-20,-30,-40,-CD];prev=null;let pc=null;
    for(const z of IZ){const k=1-(-z/CD)*.22,ring=prof(CW/2*k,CHI*k,z,C.d+z*3,1.6).map(([x,y])=>[x,y,z]),f=-z/CD;
      const c=new THREE.Color().setHSL(.6,.14,.15*(1-f)+.05);
      if(C.kind==='chest'||C.kind==='cards')c.lerp(new THREE.Color(0x8a5a28),smooth(.45,1,f)*.6);
      if(C.kind==='glow')c.lerp(new THREE.Color(0x1a4a50),f*.5);
      if(prev)for(let i=0;i<ring.length-1;i++)quad(prev[i],prev[i+1],ring[i+1],ring[i],pc,ipos,icol,c);
      prev=ring;pc=c;}
    // back wall of the tunnel
    for(let i=0;i<prev.length-1;i++)quad(prev[i],prev[i+1],[0,4,-CD-2],[0,4,-CD-2],pc,ipos,icol);
    const mk=(p,c,mat)=>{const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(p,3));G.setAttribute('color',new THREE.Float32BufferAttribute(c,3));G.computeVertexNormals();return new THREE.Mesh(G,mat);};
    const outer=mk(pos,col,toon({side:THREE.DoubleSide}));outer.castShadow=true;outer.receiveShadow=true;g.add(outer);
    g.add(mk(ipos,icol,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide})));
    // darken the sea inside so the cave reads as a cave, not a bright tunnel
    const wd=new THREE.Mesh(new THREE.PlaneGeometry(CW+2,CD+2).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0x0a141a,transparent:true,opacity:.82,depthWrite:false}));
    wd.position.set(0,.06,-CD/2);wd.renderOrder=2;g.add(wd);
    // what's inside, on a ledge at the back
    const ledge=new THREE.Mesh(new THREE.BoxGeometry(14,1.6,6),new THREE.MeshBasicMaterial({color:0x2a2622}));ledge.position.set(0,.8,-CD+3);g.add(ledge);
    const glowM=new THREE.MeshBasicMaterial({color:0xffc060});
    if(C.kind==='chest'){
      const box=new THREE.Mesh(new THREE.BoxGeometry(2.4,1.5,1.5),new THREE.MeshBasicMaterial({color:0x6a4020}));box.position.set(-2,2.35,-CD+3);g.add(box);
      const band=new THREE.Mesh(new THREE.BoxGeometry(2.5,.25,1.6),new THREE.MeshBasicMaterial({color:0xe0b040}));band.position.set(-2,2.6,-CD+3);g.add(band);
      for(const [x,s] of [[3,1],[4.6,.8]]){const b=new THREE.Mesh(new THREE.CylinderGeometry(.7*s,.7*s,1.8*s,8),new THREE.MeshBasicMaterial({color:0x4a3220}));b.position.set(x,1.6+.9*s,-CD+3);g.add(b);}}
    if(C.kind==='cards'){const tin=new THREE.Mesh(new THREE.CylinderGeometry(.9,.9,.7,12),new THREE.MeshBasicMaterial({color:0xb83a34}));tin.position.set(-1.5,1.95,-CD+3);g.add(tin);
      const lid=new THREE.Mesh(new THREE.CylinderGeometry(.95,.95,.12,12),new THREE.MeshBasicMaterial({color:0xe0c060}));lid.position.set(-1.5,2.35,-CD+3);g.add(lid);}
    if(C.kind!=='glow'){const lamp=new THREE.Mesh(new THREE.SphereGeometry(.45,8,6),glowM);lamp.position.set(2,2.2,-CD+3.5);g.add(lamp);
      const halo=new THREE.Mesh(new THREE.SphereGeometry(1.6,10,8),new THREE.MeshBasicMaterial({color:0xffa040,transparent:true,opacity:.18,depthWrite:false}));halo.position.copy(lamp.position);g.add(halo);}
    else{const P=[];for(let i=0;i<260;i++){const f=hs(i,1),th=Math.PI*(.12+.76*hs(i,2)),k=1-f*.22;P.push(Math.cos(th)*CW/2*k*.96,Math.sin(th)*CHI*k*.96,-f*CD);}
      const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(P,3));
      const pts=new THREE.Points(G,new THREE.PointsMaterial({color:0x8ff0e0,size:2,sizeAttenuation:false}));g.add(pts);C.pts=pts;
      const jar=new THREE.Mesh(new THREE.CylinderGeometry(.6,.6,1.2,10),new THREE.MeshBasicMaterial({color:0x9fd8d0,transparent:true,opacity:.7}));jar.position.set(0,2.2,-CD+3);g.add(jar);}
    scene.add(g);C.g=g;
    // flying into it is like flying into any rock: side walls and the roof
    const tx=C.nz,tz=-C.nx;
    for(let a=-2;a<=CD+20;a+=12){const cx=C.mx-C.nx*a,cz=C.mz-C.nz*a;
      for(const s of [-1,1])solidCyl(cx+tx*s*(CW/2+6),cz+tz*s*(CW/2+6),-6,CHO*.8,6,4);
      solidCyl(cx,cz,CHI+2,CHO,CW/2+3,CW/2);}
    solidCyl(C.mx-C.nx*(CD+6),C.mz-C.nz*(CD+6),-6,CHO,CW/2+2,CW/2);}})();
/* the cave's frame: a = how far inside the mouth (negative = out on the water), b = sideways from the center line */
const caveLocal=(C,x,z)=>({a:(C.mx-x)*C.nx+(C.mz-z)*C.nz,b:(x-C.mx)*C.nz-(z-C.mz)*C.nx});
let caveHintT=0,caveBusy=false;const caveHinted={};
function caveEnter(C){caveBusy=true;mode='card';ac.u=0;
  const first=!log.caves[C.id];if(first){log.caves[C.id]=Date.now();saveL();addCoins(C.coins);stamp(1);addScore(250);goal('cave',true);if(CAVES.every(q=>log.caves[q.id]))goal('caves3',true);}
  snd.beep(660);setTimeout(()=>snd.beep(990),120);
  const n=CAVES.filter(q=>log.caves[q.id]).length;
  showCard(`<h2>${C.name}</h2><div class="sub">SECRET SEA CAVE · ${n} OF ${CAVES.length} FOUND</div><p class="say">${first?C.say:'The cave is just as you left it: cool, dark and echoing. Nothing more to find, but it\'s a good place to sit out the rain.'}</p>${first?`<div class="got">+1 STAMP · +250 · +${C.coins} COINS</div>`:''}`,
    [['Taxi back out',()=>caveExit(C),true]]);}
function caveExit(C){const x=C.mx+C.nx*40,z=C.mz+C.nz*40;ac.pos.set(x,AC.gearH+floatLift(),z);ac.gYaw=Math.atan2(-C.nx,-C.nz);ac.gPitch=0;ac.u=0;ac.vel.set(0,0,0);ac.ground=true;
  ac.q.setFromEuler(_e.set(0,ac.gYaw,0,'YXZ'));snapCam=true;hideModal();mode='fly';caveBusy=false;toast('Back out on open water. Full throttle when you\'re ready.',2.4);}
anims.push(()=>{if(mode!=='fly'||caveBusy)return;
  for(const C of CAVES){const dx=ac.pos.x-C.mx,dz=ac.pos.z-C.mz;if(dx*dx+dz*dz>200*200)continue;
    const L=caveLocal(C,ac.pos.x,ac.pos.z);
    if(ac.ground){
      // in the channel: keep the wings off the walls; deep enough in and the cave takes over
      if(L.a>-2&&L.a<CD&&Math.abs(L.b)<CWO){
        const lim=CW/2-AC.span/2-.6;
        if(Math.abs(L.b)<CW/2){if(L.a>0&&Math.abs(L.b)>lim){const s=Math.sign(L.b),push=Math.abs(L.b)-lim;ac.pos.x-=C.nz*s*push;ac.pos.z+=C.nx*s*push;}}
        else if(L.a<4){const push=L.a+2;ac.pos.x+=C.nx*push;ac.pos.z+=C.nz*push;ac.u*=.2;}   // nosed into the rock beside the mouth
        else{const s=Math.sign(L.b)||1,push=CWO-Math.abs(L.b);ac.pos.x+=C.nz*s*push;ac.pos.z-=C.nx*s*push;ac.u*=.2;}}
      if(L.a>CD*.45&&Math.abs(L.b)<CW/2){caveEnter(C);return;}}
  }
  // a nudge when you're on the water near a cave you haven't found
  caveHintT-=1/60;if(caveHintT>0||!ac.ground||groundH(ac.pos.x,ac.pos.z)>.25)return;caveHintT=2;
  for(const C of CAVES){if(log.caves[C.id]||caveHinted[C.id])continue;if(Math.hypot(ac.pos.x-C.mx,ac.pos.z-C.mz)<600){caveHinted[C.id]=1;toast(`Your co-pilot's ears prick up. There's a dark opening in the cliffs, right at the waterline.`,3.5);}}});
