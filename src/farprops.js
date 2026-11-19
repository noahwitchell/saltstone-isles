/* ---------------- far islands: landmarks, gaps and trees for the Westering and Daybreak Isles ---------------- */
(function farProps(){const it=[],rf=[],lit=[];let fs=777;const fr=()=>{fs=(Math.imul(fs,1664525)+1013904223)>>>0;return fs/4294967296;};
  const at=(id,u,v)=>{const p=fromUV(ISLES[id],u,v);return {x:p.x,z:p.z,h:groundH(p.x,p.z)};};
  /* Hollowpeak: a tarn in the crater on top */
  {const p=at('hollow',250,-100);mark('tarn',p.x,p.z,p.h,'Hollowpeak Tarn','A little lake in the crater, right at the top. The water is so cold it hums.');}
  /* Oyster Bay: a jetty and oyster racks in the sheltered bay */
  {const I=ISLES.oyster,j=at('oyster',-280,40);for(let k=0;k<9;k++){const p=fromUV(I,-280+k*14,40);it.push({geo:BOX(4,.5,13),m:M([p.x,1.2,p.z],[0,-I.rot,0]),color:0xb08a5a},{geo:BOX(.5,4,.5),m:M([p.x,-.5,p.z],[0,0,0]),color:0x6b4a36});}
   for(let r=0;r<4;r++)for(let k=0;k<12;k++){const p=fromUV(I,60+k*22,-200+r*40);if(groundH(p.x,p.z)>-.5)continue;it.push({geo:BOX(1.2,1.4,1.2),m:M([p.x,.2,p.z]),color:0x3a3440});}
   mark('oysters',j.x,j.z,0,'Oyster Bay','The calmest water in the islands. The oyster racks go back three generations.');}
  /* Little Tolly: one enormous old oak, alone on its islet */
  {const I=ISLES.tolly,h=groundH(I.x,I.z);it.push({geo:new THREE.CylinderGeometry(2.2,3.4,16,7),m:M([I.x,h+8,I.z]),color:0x6b4a36});
   for(let k=0;k<9;k++){const a=k/9*TAU,d=k?11:0,s=k?10:13;it.push({geo:new THREE.IcosahedronGeometry(s,0),m:M([I.x+Math.cos(a)*d,h+21+(k%3)*3,I.z+Math.sin(a)*d],[k,k*2,0]),color:[0x5f8f3e,0x6a9a42,0x4f7f38][k%3]});}
   solidCyl(I.x,I.z,h,h+34,20,14);mark('oak',I.x,I.z,h,'The Lone Oak','A whole island for one tree. It was here before any of us, and it looks like it knows it.');}
  /* Gannet Stacks: a crowd of sea stacks round a little islet, with gaps to thread */
  {const I=ISLES.gannet,S=[[-520,-160,150,28,9],[-380,180,120,24,8],[-160,-440,170,30,10],[190,-380,110,22,8],[440,-60,160,30,10],[380,330,130,24,9],[60,480,140,26,9],[-560,330,100,20,7]];
   const P=S.map(([u,v,top,r0,r1],i)=>{const p=fromUV(I,u,v);spireAt(it,p.x,p.z,-14,top,r0,r1,40+i);return {x:p.x,z:p.z,top,r:r0};});
   const pairs=[[0,1],[2,3],[4,5],[5,6],[1,7]];pairs.forEach(([a,b],n)=>{const A=P[a],B=P[b],mx=(A.x+B.x)/2,mz=(A.z+B.z)/2,dx=B.x-A.x,dz=B.z-A.z,L=Math.hypot(dx,dz),w=L/2-Math.max(A.r,B.r)-6;
     if(w>12)flyGate('gannet'+n,'Gannet Stacks gap',mx,mz,0,Math.min(A.top,B.top)-10,Math.atan2(dx,-dz),w,'Between two of the Gannet Stacks.');});
   mark('gannets',I.x,I.z,26,'Gannet Stacks','Eight stacks and ten thousand gannets, all of them shouting.');}
  /* Ridgeback: a stone wall running the length of the ridge */
  {const I=ISLES.ridgeback;let prev=null;for(let u=-1100;u<=1100;u+=60){const p=fromUV(I,u,90-Math.sin(u/260)*40),h=groundH(p.x,p.z);if(h<20){prev=null;continue;}const q=new V3(p.x,h+.6,p.z);if(prev)beam(it,prev,q,1.4,0x9a9088);prev=q;}
   const c=at('ridgeback',0,90);mark('ridgewall',c.x,c.z,c.h,'The Long Wall','Two kilometres of dry-stone wall along the top of Ridgeback. Nobody remembers who built it, or why.');}
  /* Fernhollow: a waterfall-fed pool in the ferns, and a hut */
  {const p=onIsle('fern',(x,z,h)=>h>30&&slopeAt(x,z)<.15&&!nearStrip(x,z,200),(x,z,h)=>h);if(p){it.push({geo:new THREE.CylinderGeometry(14,14,.6,14),m:M([p.x,p.h+.1,p.z]),color:0x4a8ab0});mark('fernpool',p.x,p.z,p.h,'Fernhollow Pool','A green pool under giant ferns. Everyone who swims in it comes out smiling.');}}
  /* Westmost: a lighthouse on the last rock in the west */
  {const I=ISLES.westmost,h=groundH(I.x,I.z),H=32;for(let k=0;k<4;k++)it.push({geo:new THREE.CylinderGeometry(4.2-k*.4-.4,4.2-k*.4,H/4,10),m:M([I.x,h+k*H/4+H/8,I.z]),color:k%2?0xd8463a:0xf4f0e6});
   it.push({geo:new THREE.CylinderGeometry(3,3,4,8),m:M([I.x,h+H+2,I.z]),color:0xfff2b8},{geo:new THREE.ConeGeometry(3.6,3,8),m:M([I.x,h+H+5.5,I.z]),color:0x2c2833});
   lit.push([I.x,h+H+2,I.z,0xfff2b8]);solidCyl(I.x,I.z,h,h+H+7,5,4);mark('westlight',I.x,I.z,h,'Westmost Light','The last light before the open ocean. Its keeper writes to Tomas at Gull Point every week.');}
  /* Brackenmoor: a stone circle on the moor */
  {const c=at('bracken',500,-300);for(let k=0;k<13;k++){const a=k/13*TAU,p={x:c.x+Math.cos(a)*24,z:c.z+Math.sin(a)*24},h=groundH(p.x,p.z);it.push({geo:BOX(2.4,6+fr()*3,1.4),m:M([p.x,h+3,p.z],[0,-a,(fr()-.5)*.12]),color:rockC[k%4]});}
   it.push({geo:BOX(5,1.4,3),m:M([c.x,c.h+.7,c.z]),color:rockC[1]});mark('stones',c.x,c.z,c.h,'The Bracken Stones','Thirteen stones in a ring. At midsummer the sun comes up exactly between two of them.');}
  /* The Anvil: a flat-topped block of red rock with a strip on top */
  {const I=ISLES.anvil,p=at('anvil',600,0);mark('anvil',p.x,p.z,p.h,'The Anvil','A slab of red rock with sheer sides and a runway on top. Take off and you drop straight into the sky.');}
  /* Creel Isle: a little fishing hamlet with lobster pots stacked on the quay */
  {const I=ISLES.creel;for(let k=0;k<6;k++){const p=onIsle('creel',(x,z,h)=>h>2&&h<14&&slopeAt(x,z)<.2&&!nearStrip(x,z,60),()=>fr(),200);if(!p)continue;hutAt(it,rf,p.x,p.z,fr()*3,7,6,3.5,[0xf2e6d0,0xd8e4ea,0xf0d8c0][k%3],[0x3f6f8f,0xd2493c,0x3f8f8a][k%3],2);}
   const q=at('creel',500,-260);for(let k=0;k<14;k++)it.push({geo:BOX(1.6,1,1.6),m:M([q.x+(k%5)*2,Math.max(1,q.h)+.5+Math.floor(k/5),q.z+(k%3)],[0,k,0]),color:k%2?0x8a5a3a:0xb07a48});
   mark('creel',q.x,q.z,q.h,'Creel Isle Quay','Nine families, ninety lobster pots and one argument about whose pots are whose.');}
  /* Pinecrest: a cairn on the summit */
  {const I=ISLES.pine,h=groundH(I.x,I.z);for(let k=0;k<5;k++)it.push({geo:new THREE.DodecahedronGeometry(3.2-k*.5,0),m:M([I.x,h+1.5+k*2.4,I.z],[k,k*2,0]),color:rockC[k%4]});
   mark('cairn',I.x,I.z,h,'Pinecrest Cairn','Everyone who climbs Pinecrest adds a stone. It used to be a lot shorter.');}
  /* Fiddler's Reach: crooked fence lines and a windpump */
  {const p=at('fiddler',-500,-200);it.push({geo:BOX(.6,14,.6),m:M([p.x,p.h+7,p.z]),color:0x9a9088});for(let k=0;k<12;k++){const a=k/12*TAU;it.push({geo:BOX(.3,4,1),m:M([p.x+Math.cos(a)*2,p.h+14+Math.sin(a)*2,p.z],[0,0,a]),color:0xf4f0e6});}
   mark('windpump',p.x,p.z,p.h,'The Fiddler\'s Windpump','It squeaks in a tune. Locals say it plays a different jig for every wind.');}
  /* Seal Skerries: seals hauled out on the rocks */
  {const I=ISLES.seals;for(const [du,dv] of SKER)for(let k=0;k<5;k++){const p=fromUV(I,du+(fr()-.5)*120,dv+(fr()-.5)*30),h=groundH(p.x,p.z);if(h<.5)continue;
     it.push({geo:new THREE.SphereGeometry(1,7,5),m:M([p.x,h+.5,p.z],[0,fr()*3,0],[1,.7,2.4]),color:fr()<.5?0x5a5458:0x8a8490});}
   mark('seals',I.x,I.z,2,'Seal Skerries','Low rocks covered in seals. Fly low and they all look up at once.');}
  /* The Atoll: a ring of sand round a turquoise lagoon */
  {const I=ISLES.atoll;mark('atoll',I.x,I.z,0,'The Atoll','A perfect ring of sand and a lagoon you can see the bottom of. Two channels let the tide in.');
   flyGate('atollA','Atoll channel',I.x+Math.cos(.4)*780,I.z+Math.sin(.4)*780,0,40,.4,32,'Low through the north channel into the lagoon.');}
  /* Daybreak Head: the farthest east, a beacon on the cliff */
  {const p=at('daybreak',1050,0);it.push({geo:BOX(3,9,3),m:M([p.x,p.h+4.5,p.z]),color:0x9a9088},{geo:new THREE.CylinderGeometry(2.4,1.8,2,8),m:M([p.x,p.h+10,p.z]),color:0x3a3440});lit.push([p.x,p.h+11.5,p.z,0xff9a3a]);
   mark('daybreak',p.x,p.z,p.h,'Daybreak Point','The first place in the islands to see the sun come up. There\'s a bench, and it\'s always taken.');}
  /* Whalebone Isle: the ribs of an old whale, arching over the sand */
  {const I=ISLES.whalebone,c=at('whalebone',0,0);for(let k=-5;k<=5;k++){const p=fromUV(I,k*7,0),h=groundH(p.x,p.z),w=10-Math.abs(k)*.9;
     for(let s=0;s<8;s++){const a0=s/8*Math.PI,a1=(s+1)/8*Math.PI,[nx,nz]=[-Math.sin(I.rot),Math.cos(I.rot)];
       beam(it,new V3(p.x+nx*Math.cos(a0)*w,h+Math.sin(a0)*w*.9,p.z+nz*Math.cos(a0)*w),new V3(p.x+nx*Math.cos(a1)*w,h+Math.sin(a1)*w*.9,p.z+nz*Math.cos(a1)*w),.8,0xf2ead8);}}
   mark('whale',c.x,c.z,c.h,'Whalebone Isle','A whale washed up here long ago. Now its ribs are an archway, and the kids play hide and seek in it.');}
  addCells(it,toon(),2500,shadowy);if(rf.length)addCells(rf,toon(),2500,shadowy);for(const [x,y,z,c] of lit)addLight(x,y,z,c);
})();
ARCH_TREES.push(
  ['hollow',1100,(x,z,h)=>h>6&&h<300&&!nearStrip(x,z,55)&&slopeAt(x,z)<.5?{x,z,h,pine:h>120?rnd()<.85:rnd()<.3,s:.7+rnd()*.6}:null],
  ['fern',900,(x,z,h)=>h>5&&!nearStrip(x,z,55)&&slopeAt(x,z)<.45&&fbm(x*.004,z*.004,2,455)>-.15?{x,z,h,pine:rnd()<.15,s:.8+rnd()*.6,col:rnd()<.4?0x4f8a3a:0}:null],
  ['ridgeback',380,(x,z,h)=>h>8&&!nearStrip(x,z,50)&&slopeAt(x,z)<.5?{x,z,h,pine:rnd()<.7,s:.6+rnd()*.5}:null],
  ['bracken',260,(x,z,h)=>h>6&&!nearStrip(x,z,60)&&rnd()<.5?{x,z,h,pine:false,s:.5+rnd()*.4}:null],
  ['pine',1300,(x,z,h)=>h>6&&h<300&&slopeAt(x,z)<.6?{x,z,h,pine:true,s:.7+rnd()*.7,col:rnd()<.5?0x2f5534:0}:null],
  ['creel',200,(x,z,h)=>h>8&&!nearStrip(x,z,50)?{x,z,h,pine:rnd()<.5,s:.6+rnd()*.4}:null],
  ['sunrise',260,(x,z,h)=>h>1.5&&!nearStrip(x,z,30)?{x,z,h,palm:true,pine:false,s:.7+rnd()*.5}:null],
  ['atoll',220,(x,z,h)=>h>1.6?{x,z,h,palm:true,pine:false,s:.7+rnd()*.5}:null],
  ['fiddler',160,(x,z,h)=>h>5&&!nearStrip(x,z,50)&&slopeAt(x,z)<.4?{x,z,h,pine:false,s:.6+rnd()*.5}:null],
  ['anvil',120,(x,z,h)=>h>160&&!nearStrip(x,z,40)?{x,z,h,pine:false,s:.4+rnd()*.3}:null],
);
