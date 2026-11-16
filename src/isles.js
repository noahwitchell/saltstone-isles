/* ---------------- the far archipelago: fourteen more islands round the Saltwhistle chain ----------------
   Each island has a centre, a rough radius (for lookups) and its own height function. Pinnacles and arches are
   meshes (see isleprops.js); the heightfield only gives the ground they stand on. */
const ell2=(x,z,I,rx,rz)=>{const c=Math.cos(I.rot||0),s=Math.sin(I.rot||0),dx=x-I.x,dz=z-I.z;return [(dx*c+dz*s)/rx,(-dx*s+dz*c)/rz];};
const locUV=(I,x,z)=>{const c=Math.cos(I.rot||0),s=Math.sin(I.rot||0),dx=x-I.x,dz=z-I.z;return [dx*c+dz*s,-dx*s+dz*c];};
const fromUV=(I,u,v)=>{const c=Math.cos(I.rot||0),s=Math.sin(I.rot||0);return {x:I.x+u*c-v*s,z:I.z+u*s+v*c};};
function iblob(x,z,I,rx,rz,na,seed){const [u,v]=ell2(x,z,I,rx,rz);return 1-u*u-v*v+fbm(x*.0016,z*.0016,4,seed)*na*1.5*1+fbm(x*.0045,z*.0045,3,seed+5)*na*.7+fbm(x*.011,z*.011,2,seed+9)*na*.25;}
const sea=m=>Math.max(-48,m*150-1);
const ARCH=[
  {id:'sisters',name:'Twin Sisters',x:8300,z:1250,r:900,rot:.4,h(x,z){const m=iblob(x,z,this,820,500,.22,201);if(m<0)return sea(m);const t=smooth(0,.3,m);
     return t*11+(fbm(x*.002,z*.002,4,203)*.5+.5)*26*t;}},
  {id:'puffin',name:'Puffin Rock',x:6500,z:2650,r:380,rot:.9,h(x,z){const m=iblob(x,z,this,300,200,.18,211);if(m<0)return sea(m*1.6);
     return smooth(0,.14,m)*40+fbm(x*.01,z*.01,3,213)*7*smooth(0,.3,m);}},
  {id:'cleft',name:'Cleft Isle',x:8800,z:-6300,r:1250,rot:.25,h(x,z){const m=iblob(x,z,this,1150,780,.16,221);if(m<0)return sea(m);
     const [u,v]=locUV(this,x,z),top=smooth(0,.1,m)*(150+fbm(x*.0025,z*.0025,4,223)*30)+smooth(.1,.6,m)*25;
     const c=85*Math.sin(u/310+.4)+30*Math.sin(u/130),w=48+14*Math.sin(u*.011+1),d=Math.abs(v-c);
     return lerp(-9,top,smooth(w,w+30,d));}},
  {id:'apple',name:'Applecross',x:-2300,z:6900,r:1300,rot:-.3,h(x,z){const m=iblob(x,z,this,1200,820,.25,231);if(m<0)return sea(m);const t=smooth(0,.35,m);
     return t*18+(fbm(x*.0015,z*.0015,4,233)*.5+.5)*80*t;}},
  {id:'salt',name:'The Saltpans',x:-5900,z:2950,r:1100,rot:.7,h(x,z){const m=iblob(x,z,this,1000,680,.2,241);if(m<0)return sea(m*.6);
     const pan=saltPan(x,z);return smooth(0,.2,m)*3.4+fbm(x*.01,z*.01,2,243)*.5-(pan>=0?.9:0);}},
  {id:'mirror',name:'Looking-Glass Isle',x:1400,z:8700,r:1000,rot:0,h(x,z){const m=iblob(x,z,this,900,780,.18,251);if(m<0)return sea(m);const t=smooth(0,.3,m);
     const lr=Math.hypot(x-(this.x-180),z-(this.z+40)),rim=Math.exp(-(((lr-430)/150)**2)),lake=smooth(360,250,lr+fbm(x*.006,z*.006,3,253)*60);
     return lerp(t*12+rim*70*t+(fbm(x*.003,z*.003,3,255)*.5+.5)*14*t,-3.5,lake);}},
  {id:'mesa',name:'Starwatch Mesa',x:-9000,z:-700,r:1000,rot:.3,h(x,z){const m=iblob(x,z,this,900,700,.14,261);if(m<-.6)return -48;if(m<0)return sea(m);
     return smooth(.05,.13,m)*235+smooth(0,.05,m)*22+fbm(x*.004,z*.004,3,263)*6+smooth(.13,.5,m)*8;}},
  {id:'cascade',name:'Cascade Isle',x:2600,z:-7700,r:1100,rot:-.2,h(x,z){const m=iblob(x,z,this,980,760,.2,271);if(m<0)return sea(m);const t=smooth(0,.3,m);
     const [u,v]=locUV(this,x,z),hi=smooth(-150,0,u)*smooth(.08,.25,m),gul=Math.exp(-(((v-60-u*.08)/70)**2))*smooth(-120,350,u);
     return t*20+(fbm(x*.002,z*.002,4,273)*.5+.5)*30*t+hi*(270+fbm(x*.003,z*.003,3,275)*40)-gul*hi*60;}},
  {id:'lantern',name:'Lantern Key',x:6300,z:7700,r:900,rot:.9,h(x,z){const m=iblob(x,z,this,800,430,.2,281);if(m<0)return sea(m*1.3);const t=smooth(0,.4,m);
     return t*5+(fbm(x*.003,z*.003,3,283)*.5+.5)*10*t;}},
  {id:'quarry',name:'Greystone',x:-3800,z:-8300,r:950,rot:.1,h(x,z){const m=iblob(x,z,this,860,700,.2,291);if(m<0)return sea(m);const t=smooth(0,.3,m);
     const [u,v]=locUV(this,x,z),base=t*24+130*Math.exp(-((u+60)**2+(v-60)**2)/(2*330*330))*t+(fbm(x*.003,z*.003,3,293)*.5+.5)*20*t;
     const pr=Math.hypot(u-120,v+40)/260;if(pr>1)return base;const step=26+Math.floor(pr*7)*12+smooth(0,.25,(pr*7)%1)*12*0;return Math.min(base,lerp(step,base,smooth(.85,1,pr)));}},
  {id:'windward',name:'Windward',x:-8300,z:7300,r:1350,rot:-.5,h(x,z){const m=iblob(x,z,this,1300,440,.16,301);if(m<0)return sea(m);const t=smooth(0,.25,m);
     const [u,v]=locUV(this,x,z);return t*14+150*Math.exp(-(((v+70)/150)**2))*t*smooth(-1250,-700,u)*smooth(1250,700,u)+(fbm(x*.003,z*.003,3,303)*.5+.5)*14*t;}},
  {id:'bell',name:'Bell Rock',x:-1700,z:-5300,r:260,rot:0,h(x,z){const m=iblob(x,z,this,150,120,.15,311);if(m<0)return sea(m*2.5);return smooth(0,.25,m)*30+fbm(x*.02,z*.02,2,313)*3;}},
  {id:'tern',name:'Tern Bars',x:9300,z:5300,r:950,rot:.3,h(x,z){let best=-16;for(const [du,dv,rx,rz] of TERN){const o={x:this.x+du,z:this.z+dv,rot:this.rot+du*.0007};const m=iblob(x,z,o,rx,rz,.3,321+du);best=Math.max(best,m*4);}
     return best<0?Math.max(-48,best*3-1.2):best*.35+.3;}},
  {id:'heart',name:'Sweetheart Islet',x:-500,z:4300,r:360,rot:0,h(x,z){const u=(x-this.x)/270,v=-(z-this.z)/270+.25,f=(u*u+v*v-1)**3-u*u*v*v*v;
     const m=-f*1.2+fbm(x*.01,z*.01,2,331)*.12;if(m<0)return Math.max(-48,m*40-1.2);return smooth(0,.15,m)*6+fbm(x*.02,z*.02,2,333)*1.2;}},
];
const TERN=[[0,0,260,70],[-420,240,180,50],[380,-300,220,60],[-180,-420,140,40],[520,260,120,36]];
/* Saltpans: a grid of shallow pans, each a different colour; returns the pan index or -1 on the bunds */
function saltPan(x,z){const I={x:-5900,z:2950,rot:.7},[u,v]=locUV(I,x,z),gu=u/170,gv=v/130,fu=gu-Math.floor(gu),fv=gv-Math.floor(gv);
  if(fu<.08||fv<.1||Math.abs(u)>760||Math.abs(v)>420)return -1;return (hash2(Math.floor(gu),Math.floor(gv),241)*6)|0;}
for(const a of ARCH)ISLES[a.id]=a;
const OUTER=['marram','kettle','farhold',...ARCH.map(a=>a.id)];
const ARCH_STRIPS=[
  {id:'sisters',name:'Sisters Shelf',isle:'sisters',du:-220,dv:-60,hdg:0,len:440,wid:16,surf:'grass'},
  {id:'cleft',name:'Cleft Top',isle:'cleft',du:-20,dv:-430,hdg:0,len:420,wid:16,surf:'dirt'},
  {id:'apple',name:'Applecross',isle:'apple',du:160,dv:-120,hdg:.15,len:620,wid:20,surf:'paved'},
  {id:'salt',name:'Saltpan Flats',isle:'salt',du:-250,dv:380,hdg:0,len:520,wid:20,surf:'sand'},
  {id:'mirror',name:'Glass Meadow',isle:'mirror',du:520,dv:60,hdg:Math.PI/2,len:400,wid:16,surf:'grass'},
  {id:'mesa',name:'Starwatch',isle:'mesa',du:-120,dv:60,hdg:0,len:520,wid:18,surf:'paved'},
  {id:'cascade',name:'Cascade Terrace',isle:'cascade',du:-560,dv:20,hdg:.2+Math.PI/2,len:380,wid:16,surf:'grass'},
  {id:'lantern',name:'Lantern Key',isle:'lantern',du:-60,dv:-40,hdg:0,len:560,wid:20,surf:'paved'},
  {id:'quarry',name:'Greystone Pit',isle:'quarry',du:-260,dv:380,hdg:.25,len:400,wid:16,surf:'dirt'},
  {id:'windward',name:'Windward',isle:'windward',du:-260,dv:220,hdg:0,len:480,wid:18,surf:'grass'},
];
/* du/dv are world offsets (metres east/south of the island centre); hdg is a world-space yaw offset in radians that lines the strip up with the island */
function archStrips(){return ARCH_STRIPS.map(s=>{const I=ISLES[s.isle];let h=(Math.atan2(Math.cos(I.rot+s.hdg),-Math.sin(I.rot+s.hdg))/DEG);h=((h%360)+360)%360;
  return {id:s.id,name:s.name,isle:s.isle,x:Math.round(I.x+s.du),z:Math.round(I.z+s.dv),hdg:Math.round(h),len:s.len,wid:s.wid,surf:s.surf};});}
/* island colours */
const ARCH_COL={
  sisters(h,sl,n1,n2){if(h<3+n1*1.5&&sl<.3)return tc.setHex(0xd9c8a0);if(sl>.4)return tc.setHex(0x8a8078).lerp(tc2.setHex(0x6e6660),n2*.5+.5);return tc.setHex(0x86a85a).lerp(tc2.setHex(0xb0b46a),n1*.5+.5);},
  puffin(h,sl,n1,n2){if(h>30&&sl<.5)return tc.setHex(0x9ab86a).lerp(tc2.setHex(0xeae6d8),n2>.2?.5:0);return tc.setHex(0x7e746e).lerp(tc2.setHex(0x9c9088),(Math.sin(h*.3)*.5+.5));},
  cleft(h,sl,n1,n2){if(h<1)return tc.setHex(0xb89a78);if(sl>.45)return tc.setHex(0xb8704a).lerp(tc2.setHex(0xd8a070),(Math.sin(h*.16+n1*2)*.5+.5));
     return tc.setHex(0xa8a85a).lerp(tc2.setHex(0xc8b070),n1*.5+.5);},
  apple(h,sl,n1,n2,x,z){if(h<3+n1*2&&sl<.3)return tc.setHex(COL.sand);if(sl>.42)return tc.setHex(COL.rock);
     if(orchardAt(x,z))return tc.setHex(0x8cb850).lerp(tc2.setHex(0x9cc45a),n2*.5+.5);
     const [u,v]=locUV(ISLES.apple,x,z),k=hash2(Math.floor(u/120),Math.floor(v/90),235);return tc.setHex(k<.3?0xd8c46c:k<.55?0xc9d27a:k<.8?0x7fae4f:0xe0b45c);},
  salt(h,sl,n1,n2,x,z){const p=saltPan(x,z);if(h<.4&&p<0)return tc.setHex(0xd8ccb0);if(p>=0)return tc.setHex([0xf4eee8,0xf0c8c8,0xe8a8b8,0xbfe0dc,0xf6f2ea,0xd8b8d0][p]);return tc.setHex(0xc8b890).lerp(tc2.setHex(0xe0d4b8),n2*.5+.5);},
  mirror(h,sl,n1,n2){if(h<-.6)return tc.setHex(0x8ab0a0);if(h<2.5&&sl<.3)return tc.setHex(0xd8cc9c);const f=hash2(Math.floor(n1*40),Math.floor(n2*40),257);
     tc.setHex(0x7eb456).lerp(tc2.setHex(0x98c060),n1*.5+.5);if(n2>.3)tc.lerp(tc2.setHex(f<.33?0xe8d060:f<.66?0xd890b8:0xf0ece0),.55);return tc;},
  mesa(h,sl,n1,n2){if(h<3&&sl<.3)return tc.setHex(0xd8b890);if(sl>.35)return tc.setHex([0xc07850,0xd8a070,0xa86048,0xe0b888][Math.floor(h/26+n1*.6)&3]);
     return tc.setHex(0xb8a070).lerp(tc2.setHex(0x9a9a5a),n2*.5+.5);},
  cascade(h,sl,n1,n2){if(h<3&&sl<.3)return tc.setHex(0x9a9488);if(sl>.48)return tc.setHex(0x5a6458).lerp(tc2.setHex(0x7a8070),n2*.5+.5);
     return tc.setHex(0x3f7a3a).lerp(tc2.setHex(0x5a9a44),n1*.5+.5);},
  lantern(h,sl,n1,n2){if(h<2.5+n1)return tc.setHex(0xe0cc98);return tc.setHex(0x6ea84e).lerp(tc2.setHex(0x9ab858),n1*.5+.5);},
  quarry(h,sl,n1,n2,x,z){const [u,v]=locUV(ISLES.quarry,x,z);if(Math.hypot(u-120,v+40)<250)return tc.setHex((Math.floor(h/12)&1)?0xe0d8cc:0xccc4b8);
     if(sl>.4)return tc.setHex(0x8c8a86);if(h<3)return tc.setHex(0xc8b898);return tc.setHex(0x8a9a5a).lerp(tc2.setHex(0xa0a070),n1*.5+.5);},
  windward(h,sl,n1,n2){if(h<3&&sl<.3)return tc.setHex(COL.sand);if(sl>.45)return tc.setHex(COL.rock);return tc.setHex(0x7eab4e).lerp(tc2.setHex(0xa8b860),n1*.5+.5).lerp(tc2.setHex(0x8f9a5a),smooth(60,150,h)*.6);},
  bell(h,sl){return sl>.4||h<4?tc.setHex(0x7a7270):tc.setHex(0x8a9a6a);},
  tern(h){return tc.setHex(h<.8?0xd8c49a:0xeedcb0);},
  heart(h,sl,n1,n2){if(h<1.2)return tc.setHex(0xead8a8);return tc.setHex(0x8cc05a).lerp(tc2.setHex(0xe890a8),n2>.35?.6:0);},
};
const orchardAt=(x,z)=>{const I=ISLES.apple;if((x-I.x)**2+(z-I.z)**2>1500*1500)return false;const h=naturalH(x,z);return h>14&&h<90&&fbm(x*.0018,z*.0018,3,237)>.02;};
