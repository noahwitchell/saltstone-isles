/* ---------------- night finds: things that only glow after dark ----------------
   Landmarks (sights with night:true) you can't see in daylight. They light up at blue hour and night, and only count
   as discovered then. All the glows are one Points cloud with a small shader: each point has a color, a size, a
   phase and a motion kind (0 twinkle in place, 1 firefly drift, 2 sea glow that pulses in waves, 3 slow wandering wisp,
   4 a light that comes round in turn (phase = its place in the ring), 5 a slow bob and breathe, 6 mist rising and fading). */
const NIGHT_GLOW=(function nightGlow(){
  let ns=31337;const r=()=>{ns=(Math.imul(ns,1664525)+1013904223)>>>0;return ns/4294967296;};
  const P=[],Cl=[],Ph=[],Sz=[],Kd=[];
  const add=(x,y,z,c,sz,kind)=>{P.push(x,y,z);Cl.push(((c>>16)&255)/255,((c>>8)&255)/255,(c&255)/255);Ph.push(r()*TAU);Sz.push(sz);Kd.push(kind);};
  const far=(x,z,d)=>!Object.values(sights).some(s=>Math.hypot(s.x-x,s.z-z)<d)&&!STRIPS.some(s=>Math.hypot(s.x-x,s.z-z)<400);
  function find(isle,test,tries=3000,fd=500,R0){const I=ISLES[isle],R=R0||(I.r||900)*1.1;for(let n=0;n<tries;n++){const a=r()*TAU,rr=Math.sqrt(r())*R,x=I.x+Math.cos(a)*rr,z=I.z+Math.sin(a)*rr;if(far(x,z,fd)&&test(x,z))return {x,z};}return null;}
  const slope=(x,z)=>Math.hypot(groundH(x+6,z)-groundH(x-6,z),groundH(x,z+6)-groundH(x,z-6))/12;
  const flat=(x,z,lo,hi)=>{const h=groundH(x,z);return h>lo&&h<hi&&slope(x,z)<.12;};
  const put=(id,p,y,name,desc)=>{sights[id]={x:p.x,z:p.z,y,name,desc,night:true};};

  /* Glow Bay: a cove where the water lights up blue where the waves stir it */
  {const p=find('marram',(x,z)=>{const h=groundH(x,z);if(h>-1.5||h<-7)return false;let land=0;for(let k=0;k<8;k++){const a=k/8*TAU;if(groundH(x+Math.cos(a)*160,z+Math.sin(a)*160)>0)land++;}return land>=3&&land<=6;});
    if(p){put('glowbay',p,0,'Glow Bay','The water lights up blue wherever it moves. Rosa says swimming in it feels like flying.');
      for(let i=0;i<520;i++){const a=r()*TAU,d=Math.sqrt(r())*150,x=p.x+Math.cos(a)*d,z=p.z+Math.sin(a)*d;if(groundH(x,z)>-.3)continue;add(x,.25,z,r()<.7?0x3fe8ff:0x7affd8,1+(r()<.25?1:0),2);}}}
  /* Firefly Meadow: a low field full of blinking yellow-green */
  {const p=find('apple',(x,z)=>flat(x,z,8,45)&&flat(x+60,z,8,50)&&flat(x-60,z+40,8,50));
    if(p){put('fireflies',p,groundH(p.x,p.z),'Firefly Meadow','Thousands of them, every summer night. Nobody on Applecross goes to bed early in July.');
      for(let i=0;i<420;i++){const a=r()*TAU,d=Math.sqrt(r())*130,x=p.x+Math.cos(a)*d,z=p.z+Math.sin(a)*d,h=groundH(x,z);if(h<2)continue;add(x,h+1+r()*7,z,r()<.8?0xd8ff5a:0xffe46a,1,1);}}}
  /* Fairy Ring: a perfect circle of glowing mushrooms deep in the pines */
  {const p=find('tall',(x,z)=>{const h=groundH(x,z);return h>15&&h<300&&slope(x,z)<.2&&slope(x+14,z)<.3&&slope(x-14,z)<.3;},6000,280,1500);
    if(p){const y=groundH(p.x,p.z);put('fairyring',p,y,'The Fairy Ring','A ring of mushrooms that glow green at night. Step inside and you owe the fairies a song.');
      const caps=[];for(let i=0;i<26;i++){const a=i/26*TAU+r()*.08,d=12+r()*1.2,x=p.x+Math.cos(a)*d,z=p.z+Math.sin(a)*d,h=groundH(x,z);add(x,h+.9,z,0x7dffb0,2,0);
        caps.push({geo:new THREE.CylinderGeometry(.12,.16,.8,5),m:M([x,h+.4,z]),color:0xe9e0cc},{geo:new THREE.SphereGeometry(.55,6,3,0,TAU,0,Math.PI/2),m:M([x,h+.75,z]),color:0xd8e8c8});}
      for(let i=0;i<60;i++){const a=r()*TAU,d=r()*14;add(p.x+Math.cos(a)*d,y+1+r()*6,p.z+Math.sin(a)*d,0xb8ffd8,1,3);}
      scene.add(new THREE.Mesh(merge(caps),toon()));}}
  /* Glow-worm Cliffs: a steep face speckled with tiny blue lights, like a sky of its own */
  {const p=find('cleft',(x,z)=>slope(x,z)>.9&&groundH(x,z)>20,6000);
    if(p){const y=groundH(p.x,p.z);put('glowworms',p,y,'Glow-worm Cliffs','A whole cliff of glow-worms. From the sea it looks like the stars have fallen into the rock.');
      let n=0;for(let k=0;k<4000&&n<480;k++){const x=p.x+(r()-.5)*220,z=p.z+(r()-.5)*220,h=groundH(x,z);if(slope(x,z)<.6||h<4)continue;
        const gx=groundH(x+2,z)-groundH(x-2,z),gz=groundH(x,z+2)-groundH(x,z-2),L=Math.hypot(gx,gz)||1;add(x-gx/L*.8,h+.4,z-gz/L*.8,r()<.8?0x5ab8ff:0x9ad8ff,1,0);n++;}}}
  /* Wisp Marsh: low flats where pale lights wander about and never quite stay put */
  {const p=find('salt',(x,z)=>flat(x,z,.5,8));
    if(p){put('wisps',p,groundH(p.x,p.z),'Wisp Marsh','Pale lights drifting over the salt flats. Marsh gas, says Dr. Varga. Ghosts, says everybody else.');
      for(let i=0;i<22;i++){const a=r()*TAU,d=Math.sqrt(r())*170,x=p.x+Math.cos(a)*d,z=p.z+Math.sin(a)*d;add(x,Math.max(0,groundH(x,z))+2+r()*4,z,0xd8fff0,2+(r()<.3?1:0),3);}}}

  const addP=(x,y,z,c,sz,kind,ph)=>{add(x,y,z,c,sz,kind);if(ph!=null)Ph[Ph.length-1]=ph;};
  const flatAt=(x,z,lo,hi,s)=>{const h=groundH(x,z);return h>lo&&h<hi&&slope(x,z)<s;};
  /* The Moor Stones: a ring of eleven standing stones on Brackenmoor; at night their tops light one after another, round and round */
  {const p=find('bracken',(x,z)=>flatAt(x,z,8,220,.12)&&flatAt(x+20,z,8,220,.15)&&flatAt(x-18,z+18,8,220,.15),5000,500,1600);
    if(p){const y=groundH(p.x,p.z);put('stones',p,y,'The Moor Stones','Eleven stones in a ring older than anyone can say. At night their tops light up one after another, as if something is walking round.');
      const st=[];for(let i=0;i<11;i++){const a=i/11*TAU,x=p.x+Math.cos(a)*16,z=p.z+Math.sin(a)*16,h=groundH(x,z),ht=5+r()*2.5;
        st.push({geo:new THREE.BoxGeometry(1.8,ht,1.1),m:M([x,h+ht/2-.4,z],[(r()-.5)*.12,-a,(r()-.5)*.12]),color:[0x8a8680,0x9a958c,0x7a766e][i%3]});
        for(let j=0;j<5;j++)addP(x+(r()-.5)*1.4,h+ht+.2+r()*1.2,z+(r()-.5)*1.4,0x9ad8ff,2,4,-i/11*TAU);}
      st.push({geo:new THREE.BoxGeometry(3.4,1,2.2),m:M([p.x,y+.3,p.z],[0,r()*3,0]),color:0x7a766e});
      scene.add(new THREE.Mesh(merge(st),toon()));
      for(let i=0;i<24;i++){const a=r()*TAU,d=r()*12;addP(p.x+Math.cos(a)*d,y+.6+r()*2,p.z+Math.sin(a)*d,0xc8f0ff,1,1);}}}
  /* The Grey Lady: a ghost ship drawn in pale light, riding at anchor off Whalebone Isle */
  {const I=ISLES.whalebone;let p=null;for(let k=0;k<600&&!p;k++){const a=r()*TAU,d=(I.r||700)+350+r()*500,x=I.x+Math.cos(a)*d,z=I.z+Math.sin(a)*d;
      if(groundH(x,z)<-8&&groundH(x+45,z)<-8&&groundH(x-45,z)<-8&&groundH(x,z+45)<-8&&far(x,z,450))p={x,z};}
    if(p){put('ghostship',p,0,'The Grey Lady','A ship made of nothing but a pale glow, riding at anchor off Whalebone. She was lost in 1883. She still keeps her watch.');
      const yaw=r()*TAU,c=Math.cos(yaw),sn=Math.sin(yaw),W=(u,y,v)=>[p.x+u*c-v*sn,y,p.z+u*sn+v*c],C=0xbfe8ff;
      const seg=(A,B,n,sz=1)=>{for(let i=0;i<=n;i++){const t=i/n;addP(...W(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t),C,sz,5,yaw);}};
      for(const v of [-5,5]){seg([-22,4,v*.3],[-14,5,v],8);seg([-14,5,v],[16,5,v],22);seg([16,5,v],[22,7,v*.4],6);seg([-14,1,v*.8],[16,1,v*.8],18);}
      seg([-22,4,0],[-14,1,0],5);seg([22,7,0],[16,1,0],6);
      for(const [u,h] of [[-6,30],[8,26]]){seg([u,5,0],[u,5+h,0],h,2);seg([u,5+h*.85,-7],[u,5+h*.85,7],10);seg([u,5+h*.45,-9],[u,5+h*.45,9],12);
        for(const v of [-7,7])seg([u,5+h*.85,v],[u,5+h*.45,v*1.28],6);seg([u,5+h,0],[-22,4,0],12);}
      seg([22,7,0],[34,12,0],8);addP(...W(-6,37,0),0xffe8a0,3,0);}}
  /* The Moth Lamp: an old iron lamp post deep in Fernhollow's woods, always lit, ringed with moths */
  {const p=find('fern',(x,z)=>flatAt(x,z,15,260,.2),5000,500);
    if(p){const y=groundH(p.x,p.z);put('mothlamp',p,y,'The Moth Lamp','An iron lamp post in the middle of the woods, miles from any road. It\'s always lit. The moths think it\'s the moon.');
      scene.add(new THREE.Mesh(merge([{geo:new THREE.CylinderGeometry(.14,.2,4.2,6),m:M([p.x,y+2.1,p.z]),color:0x2c2833},{geo:new THREE.BoxGeometry(.7,.8,.7),m:M([p.x,y+4.5,p.z]),color:0x2c2833},
        {geo:new THREE.ConeGeometry(.6,.5,4),m:M([p.x,y+5.1,p.z],[0,Math.PI/4,0]),color:0x2c2833},{geo:new THREE.CylinderGeometry(.4,.2,.3,6),m:M([p.x,y+.15,p.z]),color:0x2c2833}]),toon()));
      addP(p.x,y+4.5,p.z,0xffd890,3,0);for(let i=0;i<6;i++)addP(p.x+(r()-.5)*.5,y+4.5+(r()-.5)*.5,p.z+(r()-.5)*.5,0xffe8b0,2,0);
      for(let i=0;i<70;i++){const a=r()*TAU,d=1+r()*5;addP(p.x+Math.cos(a)*d,y+2.5+r()*4,p.z+Math.sin(a)*d,r()<.6?0xe0c8ff:0xfff0d8,1,1);}}}
  /* The Lantern Tide: moon jellies drifting into Oyster Bay after dark, pulsing pink and violet */
  {const p=find('oyster',(x,z)=>{const h=groundH(x,z);if(h>-1.5||h<-9)return false;let land=0;for(let k=0;k<8;k++){const a=k/8*TAU;if(groundH(x+Math.cos(a)*170,z+Math.sin(a)*170)>0)land++;}return land>=2&&land<=6;},5000);
    if(p){put('jellies',p,0,'The Lantern Tide','Moon jellies drift into the bay after dark, hundreds of them, pulsing pink and violet. The fishermen call it the Lantern Tide and stay ashore.');
      for(let j=0;j<46;j++){const a=r()*TAU,d=Math.sqrt(r())*150,x=p.x+Math.cos(a)*d,z=p.z+Math.sin(a)*d;if(groundH(x,z)>-.6)continue;const col=[0xff8ad8,0xc89aff,0x9ad8ff][j%3],ph=r()*TAU;
        addP(x,-.1,z,col,2,5,ph);for(let k=0;k<4;k++)addP(x+(r()-.5)*1.6,-.2-r()*.4,z+(r()-.5)*1.6,col,1,5,ph);}}}
  /* The Breathing Hollow: blue mist rising out of the hollow on Hollowpeak on still nights */
  {const I=ISLES.hollow;let best=null;for(let k=0;k<3000;k++){const a=r()*TAU,d=Math.sqrt(r())*I.r*.55,x=I.x+Math.cos(a)*d,z=I.z+Math.sin(a)*d,h=groundH(x,z);if(h<20||slope(x,z)>.35||!far(x,z,350))continue;
      let rim=0;for(let q=0;q<8;q++){const b=q/8*TAU;rim+=groundH(x+Math.cos(b)*120,z+Math.sin(b)*120)-h;}if(!best||rim>best.rim)best={x,z,h,rim};}
    if(best){put('hollowmist',best,best.h,'The Breathing Hollow','On still nights blue mist rises out of the hollow and drifts up toward the stars. Nobody has found where it comes from.');
      for(let i=0;i<160;i++){const a=r()*TAU,d=Math.sqrt(r())*40,x=best.x+Math.cos(a)*d,z=best.z+Math.sin(a)*d;addP(x,Math.max(best.h,groundH(x,z))+.5,z,r()<.7?0x7ac8ff:0xc8e8ff,1+(r()<.2?1:0),6);}}}
  /* daytime oddities (no glow): the last mailbox on Westmost and the giant's chair on the Anvil */
  {const W_=STRIPS.find(st=>isleAt(st.x,st.z)==='westmost');let p=null;if(W_){for(let k=0;k<200&&!p;k++){const e=r()<.5?1:-1,w=toWorld(W_,e*(W_.len/2-20-r()*40),(r()<.5?1:-1)*(W_.wid/2+10+r()*14));if(flatAt(w.x,w.z,1,200,.3))p={x:w.x,z:w.z};}}
    if(!p)p=find('westmost',(x,z)=>flatAt(x,z,3,200,.3),4000,100);
    if(p){const y=groundH(p.x,p.z);sights.lastbox={x:p.x,z:p.z,y,name:'The Last Mailbox',desc:'A red post box on the edge of the world. Mabel swears nobody has posted a letter from Westmost in forty years. It was emptied this morning.'};
      scene.add(new THREE.Mesh(merge([{geo:new THREE.CylinderGeometry(.55,.6,1.7,10),m:M([p.x,y+.85,p.z]),color:0xd2302a},{geo:new THREE.SphereGeometry(.6,10,5,0,TAU,0,Math.PI/2),m:M([p.x,y+1.7,p.z]),color:0xd2302a},
        {geo:new THREE.BoxGeometry(.6,.1,.1),m:M([p.x,y+1.3,p.z+.56]),color:0x2c2833},{geo:new THREE.CylinderGeometry(.66,.66,.2,10),m:M([p.x,y+.1,p.z]),color:0x2c2833}]),toon()));}}
  {const p=find('anvil',(x,z)=>flatAt(x,z,40,600,.2)&&slope(x+30,z)>.25,6000,350);
    if(p){const y=groundH(p.x,p.z);sights.chair={x:p.x,z:p.z,y,name:'The Giant\'s Chair',desc:'A chair cut out of the rock, twenty feet tall, looking out to sea. Too big for anybody. The seat is warm in the mornings.'};
      const yaw=r()*TAU,c=Math.cos(yaw),sn=Math.sin(yaw),W=(u,h,v)=>[p.x+u*c-v*sn,y+h,p.z+u*sn+v*c],rk=0x8f8a84;
      scene.add(new THREE.Mesh(merge([{geo:new THREE.BoxGeometry(7,2.5,6),m:M(W(0,1.25,0),[0,-yaw,0]),color:rk},{geo:new THREE.BoxGeometry(7,3.5,6),m:M(W(0,3.5-.5,0),[0,-yaw,0]),color:0x9a958c},
        {geo:new THREE.BoxGeometry(7,9,1.6),m:M(W(0,7.5,-3.2),[0,-yaw,0]),color:rk},{geo:new THREE.BoxGeometry(1.4,2.5,6),m:M(W(-3.4,6,0),[0,-yaw,0]),color:0x9a958c},{geo:new THREE.BoxGeometry(1.4,2.5,6),m:M(W(3.4,6,0),[0,-yaw,0]),color:0x9a958c}]),toon()));}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(Cl,3));
  g.setAttribute('aPh',new THREE.Float32BufferAttribute(Ph,1));g.setAttribute('aSz',new THREE.Float32BufferAttribute(Sz,1));g.setAttribute('aKd',new THREE.Float32BufferAttribute(Kd,1));
  const mat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uOn:{value:0}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    vertexShader:`attribute float aPh,aSz,aKd;attribute vec3 color;uniform float uT,uOn;varying vec3 vC;varying float vA;
      void main(){vec3 p=position;float a=1.;
        if(aKd<.5){a=.55+.45*sin(uT*2.3+aPh*7.);}
        else if(aKd<1.5){p+=vec3(sin(uT*.7+aPh*3.)*2.,sin(uT*1.1+aPh)*1.2,cos(uT*.6+aPh*5.)*2.);a=pow(max(0.,sin(uT*1.6+aPh*9.)),3.);}
        else if(aKd<2.5){float w=sin(p.x*.06+p.z*.045-uT*1.4)+sin(p.x*-.04+p.z*.07-uT*.9+aPh);a=clamp(w*.5+.35,0.,1.)*(.6+.4*sin(uT*5.+aPh*11.));}
        else if(aKd<3.5){p+=vec3(sin(uT*.21+aPh*4.)*18.,sin(uT*.5+aPh)*1.5,cos(uT*.17+aPh*6.)*18.);a=.6+.4*sin(uT*.8+aPh);}
        else if(aKd<4.5){a=.12+.88*pow(max(0.,sin(uT*1.1+aPh)),8.);}
        else if(aKd<5.5){p.y+=sin(uT*.7+aPh)*.35;p.x+=sin(uT*.13+aPh)*1.2;a=.5+.5*sin(uT*1.6+aPh*3.);}
        else{float f=fract(uT*.035+aPh*.159);p.y+=f*45.;p.x+=sin(uT*.3+aPh*5.)*4.*f;p.z+=cos(uT*.27+aPh*3.)*4.*f;a=sin(f*3.1416)*.9;}
        vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;float d=-mv.z;
        gl_PointSize=clamp(aSz*420./d,1.,aSz*2.5);vC=color;vA=a*uOn;}`,
    fragmentShader:`varying vec3 vC;varying float vA;void main(){if(vA<.02)discard;gl_FragColor=vec4(vC*vA*1.4,1.);}`});
  const pts=new THREE.Points(g,mat);pts.frustumCulled=false;pts.renderOrder=4;pts.visible=false;scene.add(pts);
  anims.push(t=>{mat.uniforms.uT.value=t;});
  return {pts,mat,set(on){mat.uniforms.uOn.value=on;pts.visible=on>0;}};})();
