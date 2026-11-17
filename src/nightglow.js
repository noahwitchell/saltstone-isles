/* ---------------- night finds: things that only glow after dark ----------------
   Landmarks (sights with night:true) you can't see in daylight. They light up at blue hour and night, and only count
   as discovered then. All the glows are one Points cloud with a small shader: each point has a colour, a size, a
   phase and a motion kind (0 twinkle in place, 1 firefly drift, 2 sea glow that pulses in waves, 3 slow wandering wisp). */
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

  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(Cl,3));
  g.setAttribute('aPh',new THREE.Float32BufferAttribute(Ph,1));g.setAttribute('aSz',new THREE.Float32BufferAttribute(Sz,1));g.setAttribute('aKd',new THREE.Float32BufferAttribute(Kd,1));
  const mat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uOn:{value:0}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    vertexShader:`attribute float aPh,aSz,aKd;attribute vec3 color;uniform float uT,uOn;varying vec3 vC;varying float vA;
      void main(){vec3 p=position;float a=1.;
        if(aKd<.5){a=.55+.45*sin(uT*2.3+aPh*7.);}
        else if(aKd<1.5){p+=vec3(sin(uT*.7+aPh*3.)*2.,sin(uT*1.1+aPh)*1.2,cos(uT*.6+aPh*5.)*2.);a=pow(max(0.,sin(uT*1.6+aPh*9.)),3.);}
        else if(aKd<2.5){float w=sin(p.x*.06+p.z*.045-uT*1.4)+sin(p.x*-.04+p.z*.07-uT*.9+aPh);a=clamp(w*.5+.35,0.,1.)*(.6+.4*sin(uT*5.+aPh*11.));}
        else{p+=vec3(sin(uT*.21+aPh*4.)*18.,sin(uT*.5+aPh)*1.5,cos(uT*.17+aPh*6.)*18.);a=.6+.4*sin(uT*.8+aPh);}
        vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;float d=-mv.z;
        gl_PointSize=clamp(aSz*420./d,1.,aSz*2.5);vC=color;vA=a*uOn;}`,
    fragmentShader:`varying vec3 vC;varying float vA;void main(){if(vA<.02)discard;gl_FragColor=vec4(vC*vA*1.4,1.);}`});
  const pts=new THREE.Points(g,mat);pts.frustumCulled=false;pts.renderOrder=4;pts.visible=false;scene.add(pts);
  anims.push(t=>{mat.uniforms.uT.value=t;});
  return {pts,mat,set(on){mat.uniforms.uOn.value=on;pts.visible=on>0;}};})();
