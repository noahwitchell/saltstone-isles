/* ---------------- Ferrow town: a square, shops, school, garage, mill, roads, and things that move ---------------- */
var townSpots=[];
(function town(){
  const it=[],rf=[],lit=[],vc=villageC,dir={x:H.fx,z:H.fz},per={x:H.rx,z:H.rz};
  // town coords: a = along the main street, p = across it (+p toward the harbour)
  const at=(a,p)=>({x:vc.x+dir.x*a+per.x*p,z:vc.z+dir.z*a+per.z*p});
  const gy=(x,z)=>groundH(x,z);
  const DP=[],DC=[];
  const quad=(q4,col,lift=.27)=>{const c=new THREE.Color(col);const q=q4.map(([x,z])=>[x,gy(x,z)+lift,z]);for(const k of [0,2,1,1,2,3]){DP.push(...q[k]);DC.push(c.r,c.g,c.b);}};
  function road(pts,w,col,lift=.26){for(let i=0;i<pts.length-1;i++){const [x0,z0]=pts[i],[x1,z1]=pts[i+1],L=Math.hypot(x1-x0,z1-z0);if(L<.1)continue;const n=Math.max(1,Math.ceil(L/8)),nx=-(z1-z0)/L*w/2,nz=(x1-x0)/L*w/2;
      for(let k=0;k<n;k++){const a=k/n,b=(k+1)/n+.02,ax=x0+(x1-x0)*a,az=z0+(z1-z0)*a,bx=x0+(x1-x0)*Math.min(b,1),bz=z0+(z1-z0)*Math.min(b,1);quad([[ax-nx,az-nz],[ax+nx,az+nz],[bx-nx,bz-nz],[bx+nx,bz+nz]],col,lift);}
      for(let d=0;d<L;d+=12)farmSpots.push({x:x0+(x1-x0)*d/L,z:z0+(z1-z0)*d/L,r:w*.5+4});}}
  const plaza=(a0,a1,p0,p1,col)=>{for(let a=a0;a<a1;a+=6)for(let p=p0;p<p1;p+=6){const A=Math.min(a+6,a1),P=Math.min(p+6,p1);const c=at(a,p),d=at(a,P),e=at(A,p),f=at(A,P);quad([[c.x,c.z],[d.x,d.z],[e.x,e.z],[f.x,f.z]],((a/6+p/6)&1)?col:new THREE.Color(col).multiplyScalar(.93).getHex(),.3);}};
  // a building whose front faces (fx,fz); the ridge runs along the front. Roofs sit ON the walls (no gap).
  function bld(x,z,fx,fz,w,d,hh,wall,roof,o={}){const ry=Math.atan2(fx,fz),lx=fz,lz=-fx;
    const g=[gy(x,z),gy(x+fx*d/2,z+fz*d/2),gy(x-fx*d/2,z-fz*d/2),gy(x+lx*w/2,z+lz*w/2),gy(x-lx*w/2,z-lz*w/2)];
    if(Math.min(...g)<1.2)return null;const base=Math.min(...g)-1.5,gf=gy(x+fx*d/2,z+fz*d/2),top=Math.max(...g)+hh,ht=top-base;
    it.push({geo:BOX(w,ht,d),m:M([x,base+ht/2,z],[0,ry,0]),color:wall});
    if(o.trim)it.push({geo:BOX(w+.3,.5,d+.3),m:M([x,top-.25,z],[0,ry,0]),color:o.trim});
    if(o.flat)rf.push({geo:BOX(w+.8,.7,d+.8),m:M([x,top+.3,z],[0,ry,0]),color:roof});
    else{const r=(d+1)/1.732,sY=o.pitch||.7;rf.push({geo:new THREE.CylinderGeometry(r,r,w+.8,3,1,false,Math.PI/2).rotateZ(Math.PI/2),m:M([x,top+.5*r*sY-.3,z],[0,ry,0],[1,sY,1]),color:roof});}
    const F=(s,y,out=.08)=>[x+fx*(d/2+out)+lx*s,y,z+fz*(d/2+out)+lz*s];
    if(!o.noDoor)it.push({geo:BOX(1.6,2.6,.25),m:M(F(o.doorAt||0,gf+1.3),[0,ry,0]),color:o.door||0x4a3a38});
    const nw=o.win??2;for(let i=0;i<nw;i++){const s=(i-(nw-1)/2)*(w/(nw+.6));if(Math.abs(s-(o.doorAt||0))<1.4)continue;const p=F(s,gf+Math.min(hh*.55,3.4));it.push({geo:BOX(1.3,1.3,.2),m:M(p,[0,ry,0]),color:0xffe6a8});if(i%2===0)lit.push([p[0]+fx*.3,p[1],p[2]+fz*.3,0xffc25a]);
      if(hh>7){const p2=F(s,gf+hh-2.2);it.push({geo:BOX(1.2,1.2,.2),m:M(p2,[0,ry,0]),color:0xffe6a8});}}
    if(o.sign)it.push({geo:BOX(Math.min(w*.6,7),1.3,.3),m:M(F(0,gf+(o.signY||Math.min(hh-.7,4.6)),.15),[0,ry,0]),color:o.sign});
    if(o.awn){for(let k=0;k<4;k++){const s=(k-1.5)*w*.22;const p=F(s,gf+3.2,1.3);it.push({geo:BOX(w*.22,.22,2.6),m:M(p,[-.38,ry,0]),color:k%2?0xf8f4ee:o.awn});}}
    if(o.smoke){const cx=x-lx*w*.3,cz=z-lz*w*.3;it.push({geo:BOX(1.2,3.4,1.2),m:M([cx,top+1.6,cz],[0,ry,0]),color:0x8a6a5c});smokeSpots.unshift(new V3(cx,top+3.6,cz));}
    townSpots.push({x,z,r:Math.max(w,d)*.7});farmSpots.push({x,z,r:Math.max(w,d)*.7});
    return {ry,top,base,gf,lx,lz};}
  const face=s=>({x:-per.x*s,z:-per.z*s});   // shops face the main street from either side
  const shop=(a,side,w,d,hh,wall,roof,o)=>{const p=at(a,side*14),f=face(side);return bld(p.x,p.z,f.x,f.z,w,d,hh,wall,roof,o);};
  // the main street's businesses
  shop(45,-1,14,10,6.2,0xf2e0b0,0x3f6f8f,{awn:0x3f8f5a,sign:0x3f8f5a,win:3,trim:0xf8f4ee});            // Pruitt's General Store
  {const p=at(45,-14),f=face(-1);for(let k=0;k<4;k++)it.push({geo:BOX(1.2,1,1.2),m:M([p.x+f.x*7.6+dir.x*(k*1.5-4),gy(p.x,p.z)+.5+(k===2?1:0),p.z+f.z*7.6+dir.z*(k*1.5-4)],[0,k,0]),color:0xb0884e});}
  const po=shop(-45,-1,11,9,5.8,0xe4edf4,0x2f5f8f,{sign:0xd2493c,win:2,trim:0xf8f4ee});                   // the Post Office
  if(po){const p=at(-45-7,-14+6),y=gy(p.x,p.z);it.push({geo:BOX(.3,10,.3),m:M([p.x,y+5,p.z]),color:0xe8e4dc});const fl=new THREE.Mesh(BOX(3,1.8,.08),toon({vertexColors:false,color:0xd2493c},false));fl.position.set(p.x+1.5,y+9,p.z);scene.add(fl);anims.push(t=>{fl.rotation.y=Math.sin(t*1.7)*.4;});}
  shop(45,1,10,9,5.4,0xf6e2c8,0xc2553f,{awn:0xe0607a,sign:0xe0607a,smoke:1});                            // the Bakery
  shop(-45,1,13,10,8.6,0xe8d0a0,0x3f6f8f,{sign:0x8a5a3a,win:3,smoke:1});                                 // the Gull & Anchor inn
  shop(90,-1,10,9,5,0xdcd0e8,0x6a5a52,{sign:0x7a4ab8,win:2});                                           // the chemist
  shop(-90,1,10,9,5,0xd8e8d0,0x8a5a3a,{sign:0xe8a33a,win:2,awn:0xe8a33a});                               // the hardware store
  // the town square, on the airfield side of the main street
  plaza(-22,22,-34,-4,0xd9cdb0);
  {const c=at(0,-19),y=gy(c.x,c.z);
   it.push({geo:new THREE.CylinderGeometry(5,5.3,1.1,12),m:M([c.x,y+.4,c.z]),color:0xcfc6b4},{geo:new THREE.CylinderGeometry(4.4,4.4,.2,12),m:M([c.x,y+.95,c.z]),color:0x5fb8d0},
     {geo:new THREE.CylinderGeometry(.6,.8,3.4,8),m:M([c.x,y+2.4,c.z]),color:0xcfc6b4},{geo:new THREE.CylinderGeometry(1.8,.6,.7,10),m:M([c.x,y+4.2,c.z]),color:0xcfc6b4});
   const spray=new THREE.Mesh(new THREE.ConeGeometry(1.5,2.2,8,1,true),new THREE.MeshBasicMaterial({color:0xe6f6ff,transparent:true,opacity:.7}));spray.position.set(c.x,y+5.3,c.z);scene.add(spray);
   anims.push(t=>{spray.scale.set(1,.8+Math.sin(t*7)*.15,1);spray.rotation.y=t;});lit.push([c.x,y+5,c.z,0xffe0a0]);
   for(const [a,p] of [[-14,-10],[14,-10],[-14,-28],[14,-28]]){const q=at(a,p),qy=gy(q.x,q.z);it.push({geo:BOX(.3,4.4,.3),m:M([q.x,qy+2.2,q.z]),color:0x2c2833},{geo:BOX(.8,.8,.8),m:M([q.x,qy+4.6,q.z]),color:0xffe6a8});lit.push([q.x,qy+4.6,q.z,0xffe0a0]);}
   for(const [a,p,r] of [[-7,-19,0],[7,-19,0],[0,-12,1],[0,-26,1]]){const q=at(a,p),qy=gy(q.x,q.z),ry=Math.atan2(dir.x,dir.z)+(r?Math.PI/2:0);it.push({geo:BOX(3,.4,1),m:M([q.x,qy+.7,q.z],[0,ry+Math.PI/2,0]),color:0x8a5a3a});}
   // market stalls with striped canopies
   const sc=[0xd2493c,0x3f8fc0,0xe8a33a];[-16,-2,12].forEach((a,i)=>{const q=at(a+3,-31),qy=gy(q.x,q.z),ry=Math.atan2(per.x,per.z);it.push({geo:BOX(4.4,1.1,2.2),m:M([q.x,qy+.6,q.z],[0,ry,0]),color:0xb0884e});
     for(const [u,v] of [[-2,-1],[2,-1],[-2,1],[2,1]])it.push({geo:BOX(.18,2.8,.18),m:M([q.x+per.z*u+per.x*v,qy+1.4,q.z-per.x*u+per.z*v]),color:0x6e5240});
     for(let k=0;k<4;k++)it.push({geo:BOX(1.2,.2,2.8),m:M([q.x+per.z*(k-1.5)*1.2,qy+3,q.z-per.x*(k-1.5)*1.2],[0,ry,0]),color:k%2?0xf8f4ee:sc[i]});
     for(let k=0;k<3;k++)it.push({geo:BOX(.9,.5,.7),m:M([q.x+per.z*(k-1)*1.3,qy+1.35,q.z-per.x*(k-1)*1.3],[0,ry,0]),color:[0xd2493c,0xe8c84a,0x7ab84a][(k+i)%3]});});
   // flower beds at the corners
   for(const [a,p] of [[-19,-7],[19,-7],[-19,-31],[19,-31]]){const q=at(a,p),qy=gy(q.x,q.z);it.push({geo:BOX(3,.6,3),m:M([q.x,qy+.3,q.z]),color:0x5a8a3a});for(let k=0;k<5;k++)it.push({geo:BOX(.5,.5,.5),m:M([q.x+(hash2(k,a,1)-.5)*2.4,qy+.8,q.z+(hash2(k,p,2)-.5)*2.4]),color:[0xe0607a,0xffd36b,0xf8f4ee][k%3]});}
   townSpots.push({x:c.x,z:c.z,r:28});farmSpots.push({x:c.x,z:c.z,r:30});}
  // the road from the square down to the airfield apron, with telegraph poles
  const roadEnd=toWorld(H,40,H.wid/2+4),roadTop=at(0,-34);const apr=[[roadTop.x,roadTop.z],[roadEnd.x,roadEnd.z]];
  road(apr,6,0xc4ab80);
  {const L=Math.hypot(roadEnd.x-roadTop.x,roadEnd.z-roadTop.z),ux=(roadEnd.x-roadTop.x)/L,uz=(roadEnd.z-roadTop.z)/L;let prev=null;
   for(let d=10;d<L-10;d+=32){const x=roadTop.x+ux*d-uz*6,z=roadTop.z+uz*d+ux*6,y=gy(x,z);it.push({geo:BOX(.35,8,.35),m:M([x,y+4,z]),color:0x6e5240},{geo:BOX(2.4,.25,.25),m:M([x,y+7.4,z],[0,Math.atan2(ux,uz)+Math.PI/2,0]),color:0x6e5240});
     const top=new V3(x,y+7.6,z);if(prev)beam(it,prev,top,.06,0x2c2833);prev=top;}
   // Dot's Garage, beside the road near the field: fuel pump, drums, a car on blocks
   const gx=roadTop.x+ux*(L-46)+uz*14,gz=roadTop.z+uz*(L-46)-ux*14;const gr=bld(gx,gz,-uz,ux,14,11,6,0x6f9a94,0x4a5058,{flat:1,sign:0xff7a2e,signY:5.2,door:0x2c2833,win:1,doorAt:-2});
   if(gr){it.push({geo:BOX(6,4.6,.3),m:M([gx-uz*5.6+ux*1.5,gr.gf+2.3,gz+ux*5.6+uz*1.5],[0,gr.ry,0]),color:0x2c2833});
     const px=gx-uz*9+ux*5,pz=gz+ux*9+uz*5,py=gy(px,pz);it.push({geo:BOX(1,2.2,.8),m:M([px,py+1.1,pz],[0,gr.ry,0]),color:0xd2493c},{geo:BOX(1.1,.5,.9),m:M([px,py+2.4,pz],[0,gr.ry,0]),color:0xf8f4ee});lit.push([px,py+2.8,pz,0xffe0a0]);
     for(let k=0;k<5;k++){const dx=gx+ux*(-7.5)+(k-2)*1.1*uz,dz=gz+uz*(-7.5)-(k-2)*1.1*ux;it.push({geo:new THREE.CylinderGeometry(.5,.5,1.3,8),m:M([dx,gy(dx,dz)+.65,dz]),color:[0xd2493c,0x3f6f8f,0xe8a33a][k%3]});}
     const cx=gx-uz*10-ux*4,cz=gz+ux*10-uz*4,cy=gy(cx,cz);it.push({geo:BOX(2,1.1,4),m:M([cx,cy+1.3,cz],[0,gr.ry,0]),color:0x3f8fc0},{geo:BOX(1.8,.9,2),m:M([cx,cy+2.2,cz],[0,gr.ry,0]),color:0x3f8fc0});
     for(const s of [-1,1])for(const e of [-1,1])it.push({geo:BOX(.6,.7,.6),m:M([cx+(s*1)*ux+e*1.3*(-uz)*0,cy+.35,cz],[0,gr.ry,0]),color:0x8a8a92});}}
  // the schoolhouse at the far end of the street, with a bell, a yard and a swing
  {const s=at(-150,0);const f={x:dir.x,z:dir.z};const sb=bld(s.x,s.z,f.x,f.z,15,10,6.4,0xb8443a,0x4a4048,{trim:0xf8f4ee,win:3,door:0xf8f4ee,sign:0xf8f4ee});
   if(sb){const cy=sb.top+3.2;it.push({geo:BOX(2.6,2.6,2.6),m:M([s.x,cy,s.z],[0,sb.ry,0]),color:0xf8f4ee},{geo:new THREE.ConeGeometry(2.4,2.6,4).rotateY(Math.PI/4),m:M([s.x,cy+2.6,s.z],[0,sb.ry,0]),color:0x4a4048},{geo:new THREE.CylinderGeometry(.4,.75,1,8),m:M([s.x,cy,s.z]),color:0xe8b830});
     const yc=at(-172,0),yy=gy(yc.x,yc.z);for(let k=0;k<28;k++){const a=k/28*TAU,q={x:yc.x+Math.cos(a)*14,z:yc.z+Math.sin(a)*14};it.push({geo:BOX(.25,1.2,.25),m:M([q.x,gy(q.x,q.z)+.6,q.z]),color:0xf8f4ee});}
     beam(it,new V3(yc.x-3,yy,yc.z-1.5),new V3(yc.x-3,yy+3.6,yc.z),.14,0x3f6f8f);beam(it,new V3(yc.x-3,yy,yc.z+1.5),new V3(yc.x-3,yy+3.6,yc.z),.14,0x3f6f8f);
     beam(it,new V3(yc.x+3,yy,yc.z-1.5),new V3(yc.x+3,yy+3.6,yc.z),.14,0x3f6f8f);beam(it,new V3(yc.x+3,yy,yc.z+1.5),new V3(yc.x+3,yy+3.6,yc.z),.14,0x3f6f8f);beam(it,new V3(yc.x-3,yy+3.6,yc.z),new V3(yc.x+3,yy+3.6,yc.z),.14,0x3f6f8f);
     const sw=new THREE.Group();sw.add(new THREE.Mesh(merge([{geo:BOX(.06,2.6,.06),m:M([-.5,-1.3,0]),color:0x2c2833},{geo:BOX(.06,2.6,.06),m:M([.5,-1.3,0]),color:0x2c2833},{geo:BOX(1.2,.15,.5),m:M([0,-2.6,0]),color:0xd2493c}]),toon({},false)));sw.position.set(yc.x,yy+3.6,yc.z);scene.add(sw);anims.push(t=>{sw.rotation.x=Math.sin(t*2.2)*.5;});
     townSpots.push({x:yc.x,z:yc.z,r:16});farmSpots.push({x:yc.x,z:yc.z,r:16});
     road([[s.x,s.z],[at(-120,0).x,at(-120,0).z]],6,0xcdb58a);}}
  // the water tower on the rise behind the cross street
  {const q=at(-95,34),y=gy(q.x,q.z);if(y>2){for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]])beam(it,new V3(q.x+a*3,y,q.z+b*3),new V3(q.x+a*2,y+14,q.z+b*2),.25,0x6e5240);
    it.push({geo:new THREE.CylinderGeometry(3.6,3.6,5,12),m:M([q.x,y+16.5,q.z]),color:0x9ab0b8},{geo:new THREE.ConeGeometry(4,2.4,12),m:M([q.x,y+20.2,q.z]),color:0xd2493c});townSpots.push({x:q.x,z:q.z,r:6});farmSpots.push({x:q.x,z:q.z,r:6});}}
  // the lumber mill, out in the woods with a road home
  let mill=null;
  {let best=null;for(let k=0;k<700;k++){const a=rnd()*TAU,d=500+rnd()*800,x=vc.x+Math.cos(a)*d,z=vc.z+Math.sin(a)*d,h=gy(x,z);
     if(h<8||h>140||isleAt(x,z)!=='ferrow'||slopeAt(x,z)>.1||nearStrip(x,z,90)||farmSpots.some(f=>Math.hypot(f.x-x,f.z-z)<f.r+40))continue;const sc=-Math.abs(d-750)*.05-slopeAt(x,z)*200;if(!best||sc>best.sc)best={x,z,h,sc,a};}
   if(best){const {x,z}=best,fx=-Math.cos(best.a),fz=-Math.sin(best.a);const mb=bld(x,z,fx,fz,16,10,7,0x9a6a48,0x5a4a40,{sign:0xe8c84a,win:2,smoke:1});
     if(mb){const lx=mb.lx,lz=mb.lz,P=(u,v)=>[x+fx*u+lx*v,z+fz*u+lz*v];
       // open saw shed with a log riding back and forth to the blade
       const [sx,sz]=P(14,0),sy=gy(sx,sz);for(const u of [-4,4])for(const v of [-10,0,10]){const [px,pz]=[sx+fx*u+lx*v,sz+fz*u+lz*v];it.push({geo:BOX(.5,5,.5),m:M([px,sy+2.5,pz]),color:0x6e5240});}
       rf.push({geo:BOX(22,.5,10),m:M([sx,sy+5.2,sz],[.08,mb.ry,0]),color:0x7d8f9a});it.push({geo:BOX(20,.8,1.6),m:M([sx,sy+.6,sz],[0,mb.ry+Math.PI/2,0]),color:0x8a6a4a});
       const blade=new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.4,.15,14).rotateX(Math.PI/2),toon({vertexColors:false,color:0xd8dce2},false));blade.position.set(sx,sy+1.6,sz);blade.rotation.y=mb.ry+Math.PI/2;scene.add(blade);
       const log1=new THREE.Mesh(new THREE.CylinderGeometry(.7,.7,8,8).rotateZ(Math.PI/2),toon({vertexColors:false,color:0x9a6a3a},false));scene.add(log1);
       anims.push(t=>{blade.rotation.z=t*20;const k=(Math.sin(t*.35)*.5+.5)*12-6;log1.position.set(sx+lx*(k-4),sy+1.7,sz+lz*(k-4));log1.rotation.y=mb.ry;});
       // log piles, plank stacks, a sawdust heap
       for(let r=0;r<3;r++)for(let k=0;k<5-r;k++){const [px,pz]=P(-12,-6+k*1.6+r*.8);it.push({geo:new THREE.CylinderGeometry(.75,.75,9,8).rotateZ(Math.PI/2),m:M([px,gy(px,pz)+.75+r*1.3,pz],[0,mb.ry+Math.PI/2,0]),color:r%2?0x8a5a34:0x9a6a3a});}
       for(let r=0;r<3;r++)for(let k=0;k<4-r;k++){const [px,pz]=P(-12,8+k*1.6+r*.8);it.push({geo:new THREE.CylinderGeometry(.75,.75,9,8).rotateZ(Math.PI/2),m:M([px,gy(px,pz)+.75+r*1.3,pz],[0,mb.ry+Math.PI/2,0]),color:r%2?0x9a6a3a:0x8a5a34});}
       for(let k=0;k<3;k++){const [px,pz]=P(10+k*0,-14-k*3.4);it.push({geo:BOX(6,1.2+k*.4,2.4),m:M([px,gy(px,pz)+.6,pz],[0,mb.ry,0]),color:0xe8d0a0});}
       {const [px,pz]=P(16,13);it.push({geo:new THREE.ConeGeometry(4,3.2,9),m:M([px,gy(px,pz)+1.4,pz]),color:0xe0c890});}
       farmSpots.push({x,z,r:44});townSpots.push({x,z,r:40});
       mark('mill',x,z,best.h,'Ferrow Lumber Mill','Every roof in town started here as a tree. Listen for the saw on a still morning.');
       const end=at(-120,0);const mid={x:(x+end.x)/2+(rnd()-.5)*80,z:(z+end.z)/2+(rnd()-.5)*80};const [rx0,rz0]=P(8,0);
       mill={pts:[[rx0,rz0],[mid.x,mid.z],[end.x,end.z],[vc.x,vc.z]]};road(mill.pts.slice(0,3),5,0xb89a70);}}}
  const dg=new THREE.BufferGeometry();dg.setAttribute('position',new THREE.Float32BufferAttribute(DP,3));dg.setAttribute('color',new THREE.Float32BufferAttribute(DC,3));dg.computeVertexNormals();
  scene.add(new THREE.Mesh(dg,toon({side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2})));
  scene.add(shadowy(new THREE.Mesh(merge(it),toon())));scene.add(shadowy(new THREE.Mesh(merge(rf),toon())));for(const [x,y,z,c] of lit)addLight(x,y,z,c);

  /* ---- things that move on the ground ---- */
  function mover(mesh,pts,speed,lift=0,phase=0){let L=0;const seg=[];for(let i=0;i<pts.length-1;i++){const l=Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]);seg.push(l);L+=l;}
    scene.add(mesh);anims.push(t=>{let s=(t*speed+phase*L)%(2*L);const back=s>L;if(back)s=2*L-s;let i=0;while(i<seg.length-1&&s>seg[i]){s-=seg[i];i++;}
      const a=pts[i],b=pts[i+1],k=Math.min(s/seg[i],1),x=a[0]+(b[0]-a[0])*k,z=a[1]+(b[1]-a[1])*k;mesh.position.set(x,gy(x,z)+lift,z);mesh.rotation.y=Math.atan2(b[0]-a[0],b[1]-a[1])+(back?Math.PI:0);});}
  const wheels=(l,w,y=.45)=>[-1,1].flatMap(s=>[-1,1].map(e=>({geo:new THREE.CylinderGeometry(.5,.5,.4,8).rotateZ(Math.PI/2),m:M([s*w,y,e*l]),color:0x2c2833})));
  const truck=(cab,bed,load)=>{const g=new THREE.Mesh(merge([{geo:BOX(2.3,1.8,1.9),m:M([0,1.5,1.6]),color:cab},{geo:BOX(2.2,.7,1.6),m:M([0,2.1,1.7]),color:0xbfe0f0},{geo:BOX(2.4,.9,3.4),m:M([0,1.05,-.9]),color:bed},
      ...(load==='logs'?[0,1,2].map(i=>({geo:new THREE.CylinderGeometry(.42,.42,3.8,7).rotateX(Math.PI/2),m:M([(i-1)*.8,1.9+(i===1?.5:0),-.9]),color:0x9a6a3a})):[{geo:BOX(1.6,1,1.4),m:M([0,1.9,-1.2]),color:load||0xb0884e}]),...wheels(1.5,1.1)]),toon({},false));g.scale.setScalar(1.25);return g;};
  const P2=(o)=>[o.x,o.z];
  const st=[P2(roadEnd),P2(roadTop),P2(at(0,-4)),P2(at(0,0)),P2(at(115,0))];mover(truck(0xd2493c,0xf8f4ee,0xe8a33a),st,5.5,0,0);
  mover(truck(0x3f8fc0,0xe8e4dc,0xb0884e),[P2(at(-120,0)),P2(at(0,0)),P2(at(0,5)),P2(at(0,40))],4.2,0,.4);
  if(mill)mover(truck(0x3f8f5a,0x6e5240,'logs'),mill.pts,6,0,.2);
  // a tractor working up and down a field
  {let p=null;for(let k=0;k<900&&!p;k++){const x=-2200+rnd()*2050,z=(rnd()-.5)*4200,h=gy(x,z),sl=slopeAt(x,z);if(!isFarm(x,z,h,sl))continue;const ux=Math.cos(-FA),uz=Math.sin(-FA);
     if([-40,40].every(d=>{const q=[x+ux*d,z+uz*d];return isFarm(q[0],q[1],gy(q[0],q[1]),slopeAt(q[0],q[1]));})&&Math.hypot(x-vc.x,z-vc.z)<1800)p={x,z,ux,uz};}
   if(p){const tr=new THREE.Mesh(merge([{geo:BOX(1.8,1.2,2.8),m:M([0,1.3,.3]),color:0xd2493c},{geo:BOX(1.5,1.4,1.3),m:M([0,2.5,-.6]),color:0xd2493c},{geo:BOX(.25,1.4,.25),m:M([.4,2.6,1.2]),color:0x2c2833},
       {geo:new THREE.CylinderGeometry(1,1,.5,10).rotateZ(Math.PI/2),m:M([-1.1,1,-.8]),color:0x2c2833},{geo:new THREE.CylinderGeometry(1,1,.5,10).rotateZ(Math.PI/2),m:M([1.1,1,-.8]),color:0x2c2833},
       {geo:new THREE.CylinderGeometry(.55,.55,.4,8).rotateZ(Math.PI/2),m:M([-.95,.55,1.4]),color:0x2c2833},{geo:new THREE.CylinderGeometry(.55,.55,.4,8).rotateZ(Math.PI/2),m:M([.95,.55,1.4]),color:0x2c2833},{geo:BOX(3.6,.5,1),m:M([0,.4,-2.8]),color:0x8a8a92}]),toon({},false));
     tr.scale.setScalar(1.4);mover(tr,[[p.x-p.ux*40,p.z-p.uz*40],[p.x+p.ux*40,p.z+p.uz*40],[p.x+p.ux*40-p.uz*6,p.z+p.uz*40+p.ux*6],[p.x-p.ux*40-p.uz*6,p.z-p.uz*40+p.ux*6],[p.x-p.ux*40-p.uz*12,p.z-p.uz*40+p.ux*12],[p.x+p.ux*40-p.uz*12,p.z+p.uz*40+p.ux*12]],2.2,.1,0);}}
  // townsfolk strolling round the square and along the street
  const folkC=[0xd2493c,0x3f6f8f,0xe8a33a,0x3f8f5a,0x7a4ab8,0xf8f4ee,0xe0607a,0x8a5a3a];
  const person=i=>{const g=new THREE.Mesh(merge([{geo:BOX(.7,1.1,.45),m:M([0,1.25,0]),color:folkC[i%8]},{geo:BOX(.5,.5,.5),m:M([0,2.1,0]),color:[0xf0c7a4,0xc98c5e,0x8a5a3a][i%3]},{geo:BOX(.6,.8,.4),m:M([0,.4,0]),color:0x3a3440}]),toon({},false));g.scale.setScalar(1.35);(window.FOLK||(window.FOLK=[])).push(g);return g;};
  for(let i=0;i<14;i++){let pts;if(i<6){const r=8+(i%3)*2.5,c=at(0,-19);pts=[...Array(9)].map((_,k)=>{const a=k/8*TAU*(i%2?1:-1)+i;return [c.x+Math.cos(a)*r,c.z+Math.sin(a)*r];});}
    else{const a0=-110+hash2(i,1,5)*80,s=(i%2?1:-1)*3;pts=[P2(at(a0,s)),P2(at(a0+60+hash2(i,2,5)*60,s))];}
    mover(person(i),pts,.9+hash2(i,3,5)*.5,.1,hash2(i,4,5));}
})();

/* ---- life on the water: sailboats, fishing boats with gulls, and a pair of whales ---- */
(function sea(){
  const isSea=(x,z,d=-4)=>groundH(x,z)<d;const ringSea=(x,z,r)=>[...Array(12)].every((_,k)=>isSea(x+Math.cos(k/12*TAU)*r,z+Math.sin(k/12*TAU)*r));
  const sailC=[0xf8f4ee,0xf8f4ee,0xd2493c,0xf0e2a8,0x3f8fc0,0xe8a33a];const hullC=[0xf4efe4,0x3f6f8f,0x2c2833,0xc2553f,0x3f8f5a];
  const tri=(w,h)=>{const s=new THREE.Shape();s.moveTo(0,0);s.lineTo(w,0);s.lineTo(0,h);s.lineTo(0,0);return new THREE.ShapeGeometry(s);};
  const wake=()=>new THREE.Mesh(new THREE.PlaneGeometry(4,16).rotateX(-Math.PI/2).translate(0,.25,10),new THREE.MeshBasicMaterial({color:0xf6f1e4,transparent:true,opacity:.45,depthWrite:false}));
  let n=0;for(const S of STRIPS){for(let k=0;k<30;k++){const a=rnd()*TAU,d=450+rnd()*900,x=S.x+Math.cos(a)*d,z=S.z+Math.sin(a)*d,r=90+rnd()*130;if(!ringSea(x,z,r)||!isSea(x,z,-8))continue;
      const i=n++,g=new THREE.Group(),sc=sailC[i%6];
      g.add(new THREE.Mesh(merge([{geo:BOX(2.6,1.1,8),m:M([0,.35,0]),color:hullC[i%5]},{geo:BOX(2.7,.3,8.1),m:M([0,-.1,0]),color:0xf8f4ee},{geo:BOX(1.6,.8,2.2),m:M([0,1.2,1.4]),color:0xe8d8b8},{geo:BOX(.25,12,.25),m:M([0,6.6,-.6]),color:0xe8e4dc},
        {geo:tri(4.4,10.4).rotateY(-Math.PI/2),m:M([0,1.4,-.4]),color:sc},{geo:tri(2.6,8.6).rotateY(Math.PI/2),m:M([0,1.4,-1]),color:sc===0xf8f4ee?0xf0e2a8:0xf8f4ee}]),toon({side:THREE.DoubleSide},false)));
      g.add(wake());g.scale.setScalar(1.3);scene.add(g);const sp=(.035+rnd()*.025)*(rnd()<.5?1:-1),ph=rnd()*TAU,bsc=scareSpot(x,0,z,'sail');
      anims.push(t=>{const q=ph+t*sp,s=scareOf(bsc,t);g.position.set(x+Math.cos(q)*r,s*Math.abs(Math.sin(t*5))*.8,z+Math.sin(q)*r);g.rotation.y=-q+(sp>0?Math.PI:0);g.rotation.z=(sp>0?-1:1)*.12+Math.sin(t*1.1+ph)*.04+s*Math.sin(t*4.5)*.22;});break;}}
  // fishing boats sitting off the shore with gulls wheeling over them
  const gm=new THREE.MeshBasicMaterial({color:0xf8f4ee,side:THREE.DoubleSide});
  let f=0;for(const S of STRIPS){if(f>=12)break;for(let k=0;k<40;k++){const a=rnd()*TAU,d=300+rnd()*700,x=S.x+Math.cos(a)*d,z=S.z+Math.sin(a)*d;if(!isSea(x,z,-5)||!ringSea(x,z,40))continue;f++;
      const b=new THREE.Mesh(merge([{geo:BOX(3.4,1.6,10),m:M([0,.5,0]),color:[0xd2493c,0x3f6f8f,0x3f8f5a,0xe8a33a][f%4]},{geo:BOX(3.5,.4,10.1),m:M([0,-.2,0]),color:0x2c2833},{geo:BOX(2.4,2.2,3),m:M([0,2.2,2]),color:0xf8f4ee},{geo:BOX(2.5,.3,3.1),m:M([0,3.4,2]),color:0x3f6f8f},
        {geo:BOX(.2,7,.2),m:M([0,4.5,-2.4]),color:0xe8e4dc},{geo:BOX(.15,.15,7),m:M([0,7.2,-5]),color:0xe8e4dc,},{geo:BOX(1.2,.8,1.2),m:M([.6,1.7,-3]),color:0xe8a33a}]),toon({},false));b.scale.setScalar(1.3);b.position.set(x,0,z);const ry=rnd()*TAU;b.rotation.y=ry;scene.add(b);
      const fsc=scareSpot(x,0,z,'boat');anims.push(t=>{const s=scareOf(fsc,t);b.position.y=Math.sin(t*1.2+f)*.18+s*Math.abs(Math.sin(t*5))*.6;b.rotation.z=Math.sin(t*.9+f)*.05+s*Math.sin(t*4)*.16;b.rotation.x=Math.sin(t*.7+f*2)*.03;});addLight(x,4.4,z,0xffe0a0);
      const gsc=scareSpot(x,12,z);for(let k=0;k<4;k++){const gg=new THREE.Group(),wl=new THREE.Group(),wr=new THREE.Group();wl.add(new THREE.Mesh(new THREE.PlaneGeometry(2,.7).translate(-1,0,0).rotateX(-Math.PI/2),gm));wr.add(new THREE.Mesh(new THREE.PlaneGeometry(2,.7).translate(1,0,0).rotateX(-Math.PI/2),gm));gg.add(wl,wr);scene.add(gg);
        const rr=10+k*5,ph=k*1.6,hy=12+k*3;anims.push(t=>{const q=ph+t*.4*(k%2?1:-1),s=scareOf(gsc,t),da=k*1.57+.4;gg.position.set(x+Math.cos(q)*rr+Math.cos(da)*s*40,hy+Math.sin(t+k)*2+s*30,z+Math.sin(q)*rr+Math.sin(da)*s*40);gg.rotation.y=-q;const fl=Math.sin(t*(7+16*s)+k)*.5;wl.rotation.z=fl;wr.rotation.z=-fl;});}
      break;}}
  // whales: they surface every so often, blow, and roll back under
  let w=0;for(let k=0;k<400&&w<3;k++){const x=(rnd()-.5)*20000,z=(rnd()-.5)*18000;if(!ringSea(x,z,260)||!isSea(x,z,-25))continue;w++;
    const body=new THREE.Mesh(merge([{geo:new THREE.IcosahedronGeometry(1,1),m:M([0,0,0],[0,0,0],[3.2,2.2,13]),color:0x3a4a5a},{geo:BOX(5,.4,2),m:M([0,.2,-12.5]),color:0x3a4a5a},{geo:BOX(.5,1.6,1.6),m:M([0,2,-2]),color:0x3a4a5a}]),toon({},false));scene.add(body);
    const spout=new THREE.Mesh(new THREE.ConeGeometry(1.8,9,7,1,true).rotateX(Math.PI),new THREE.MeshBasicMaterial({color:0xf0f6ff,transparent:true,opacity:.75,depthWrite:false}));scene.add(spout);
    const ph=rnd()*30,hd=rnd()*TAU;anims.push(t=>{const T=(t+ph)%26,u=T/26,q=hd+t*.01,px=x+Math.cos(q)*180,pz=z+Math.sin(q)*180;const up=T<5?Math.sin(T/5*Math.PI):0;
      body.position.set(px,-5+up*5.2,pz);body.rotation.set(-(T/5-.5)*.5*(T<5?1:0),-q,0);body.visible=up>0;const s=T>1&&T<2.6?Math.sin((T-1)/1.6*Math.PI):0;spout.visible=s>.02;spout.position.set(px,1.5+s*5,pz);spout.scale.set(s,s,s);});}
})();
