/* ---------------- the Westering Isles and the Daybreak Isles ----------------
   Two more island groups, far west and far east, so the chart fills a phone held sideways.
   Same pattern as ARCH: a centre, a rough radius, a rotation and a height function. */
const FAR=[
  /* ---- west ---- */
  {id:'hollow',name:'Hollowpeak',x:-13000,z:-6500,r:1300,rot:.2,h(x,z){const m=iblob(x,z,this,1150,950,.16,401);if(m<0)return sea(m);const t=smooth(0,.3,m);
     const [u,v]=locUV(this,x,z),r=Math.hypot(u-250,v+100),cone=390*Math.pow(smooth(1050,120,r),1.5),crater=smooth(170,95,r)*70;
     return t*16+(fbm(x*.002,z*.002,4,403)*.5+.5)*30*t+(cone-crater+fbm(x*.006,z*.006,3,405)*14*smooth(900,300,r))*t;}},
  {id:'oyster',name:'Oyster Bay',x:-12800,z:2000,r:1200,rot:-.15,h(x,z){const m=iblob(x,z,this,1100,800,.14,411);const [u,v]=locUV(this,x,z);
     const bay=1-((u-380)/720)**2-(v/540)**2+fbm(x*.004,z*.004,3,413)*.12,mm=Math.min(m,-bay*.9);if(mm<0)return sea(mm*.5);
     return smooth(0,.25,mm)*5+(fbm(x*.005,z*.005,3,415)*.5+.5)*9*smooth(.05,.4,mm);}},
  {id:'tolly',name:'Little Tolly',x:-12500,z:7800,r:300,rot:0,h(x,z){const m=iblob(x,z,this,190,160,.12,421);if(m<0)return sea(m*2);return smooth(0,.4,m)*11+fbm(x*.02,z*.02,2,423)*1.5;}},
  {id:'gannet',name:'Gannet Stacks',x:-16800,z:-2000,r:900,rot:.4,h(x,z){const m=iblob(x,z,this,260,190,.2,431);if(m<0)return sea(m*1.4);return smooth(0,.2,m)*26+fbm(x*.01,z*.01,3,433)*6*smooth(0,.3,m);}},
  {id:'ridgeback',name:'Ridgeback',x:-17000,z:8300,r:1500,rot:-.35,h(x,z){const m=iblob(x,z,this,1400,520,.16,441);if(m<0)return sea(m);const t=smooth(0,.25,m),[u,v]=locUV(this,x,z);
     return t*12+230*Math.exp(-(((v-90+Math.sin(u/260)*40)/170)**2))*t*smooth(-1400,-500,u)*smooth(1400,500,u)+(fbm(x*.003,z*.003,3,443)*.5+.5)*16*t;}},
  {id:'fern',name:'Fernhollow',x:-16500,z:-8500,r:1100,rot:.5,h(x,z){const m=iblob(x,z,this,1000,780,.22,451);if(m<0)return sea(m);const t=smooth(0,.3,m);
     return t*14+(fbm(x*.0022,z*.0022,4,453)*.5+.5)*95*t;}},
  {id:'westmost',name:'Westmost',x:-20600,z:-5800,r:500,rot:.3,h(x,z){const m=iblob(x,z,this,320,230,.25,461);if(m<0)return sea(m*1.5);return smooth(0,.18,m)*30+fbm(x*.012,z*.012,3,463)*7*smooth(0,.3,m);}},
  {id:'bracken',name:'Brackenmoor',x:-20000,z:3200,r:1700,rot:.15,h(x,z){const m=iblob(x,z,this,1550,1100,.2,471);if(m<0)return sea(m);const t=smooth(0,.28,m),[u,v]=locUV(this,x,z);
     return t*20+(fbm(x*.0016,z*.0016,4,473)*.5+.5)*55*t+120*Math.exp(-((u+700)**2+(v-450)**2)/(2*380*380))*t;}},
  /* ---- east ---- */
  {id:'sunrise',name:'Sunrise Cay',x:12800,z:-3000,r:1000,rot:.8,h(x,z){const m=iblob(x,z,this,880,720,.16,481);if(m<0)return sea(m*.7);return smooth(0,.4,m)*5+(fbm(x*.004,z*.004,3,483)*.5+.5)*7*smooth(.1,.5,m);}},
  {id:'anvil',name:'The Anvil',x:13200,z:4000,r:1000,rot:.6,h(x,z){const m=iblob(x,z,this,920,660,.12,491);if(m<-.6)return -48;if(m<0)return sea(m);
     return smooth(.04,.12,m)*175+smooth(0,.04,m)*14+fbm(x*.004,z*.004,3,493)*4+smooth(.12,.5,m)*6;}},
  {id:'creel',name:'Creel Isle',x:12600,z:8800,r:900,rot:-.4,h(x,z){const m=iblob(x,z,this,820,560,.2,501);if(m<0)return sea(m);const t=smooth(0,.3,m);return t*9+(fbm(x*.003,z*.003,3,503)*.5+.5)*40*t;}},
  {id:'pine',name:'Pinecrest',x:13600,z:-8600,r:1000,rot:0,h(x,z){const m=iblob(x,z,this,880,820,.15,511);if(m<0)return sea(m);const t=smooth(0,.3,m),r=Math.hypot(x-this.x,z-this.z);
     return t*12+330*Math.pow(smooth(860,0,r),1.7)*t+fbm(x*.006,z*.006,3,513)*10*t;}},
  {id:'fiddler',name:'Fiddler\'s Reach',x:17000,z:600,r:1400,rot:-.6,h(x,z){const m=iblob(x,z,this,1300,620,.16,521);if(m<0)return sea(m);const t=smooth(0,.28,m),[u,v]=locUV(this,x,z);
     return t*10+150*smooth(-80,260,v)*t*smooth(-1300,-600,u)*smooth(1300,600,u)+(fbm(x*.003,z*.003,3,523)*.5+.5)*14*t;}},
  {id:'seals',name:'Seal Skerries',x:17200,z:-5800,r:800,rot:.2,h(x,z){let best=-16;for(const [du,dv,rx,rz] of SKER){const o={x:this.x+du,z:this.z+dv,rot:this.rot+du*.001};best=Math.max(best,iblob(x,z,o,rx,rz,.3,531+du)*5);}
     return best<0?Math.max(-48,best*3-1.5):best*1.4+.4;}},
  {id:'atoll',name:'The Atoll',x:17600,z:6800,r:1100,rot:0,h(x,z){const dx=x-this.x,dz=z-this.z,r=Math.hypot(dx,dz),a=Math.atan2(dz,dx);
     const R=760+fbm(Math.cos(a)*2,Math.sin(a)*2,3,541)*70,band=1-((r-R)/(95+30*Math.sin(a*3)))**2,gap=Math.max(Math.exp(-(((a-.4)/.09)**2)),Math.exp(-(((a+2.4)/.08)**2)));
     const b=band-gap*1.6;if(b>0)return smooth(0,.5,b)*4.5+.4;return r<R?Math.max(-6,-1.2+b*2):Math.max(-48,b*30-2);}},
  {id:'daybreak',name:'Daybreak Head',x:21000,z:-1500,r:1500,rot:.1,h(x,z){const m=iblob(x,z,this,1380,900,.16,551);if(m<0)return sea(m);const t=smooth(0,.12,m),[u,v]=locUV(this,x,z);
     return t*18+150*smooth(-1100,700,u)*smooth(0,.2,m)+(fbm(x*.003,z*.003,3,553)*.5+.5)*22*t;}},
  {id:'whalebone',name:'Whalebone Isle',x:20800,z:8200,r:700,rot:-.3,h(x,z){const m=iblob(x,z,this,560,330,.16,561);if(m<0)return sea(m*.8);return smooth(0,.35,m)*4+(fbm(x*.006,z*.006,3,563)*.5+.5)*6*smooth(.1,.5,m);}},
];
const SKER=[[0,0,200,70],[-380,220,150,55],[320,-260,180,60],[-160,-380,120,45],[460,240,110,40],[120,330,90,35]];
for(const a of FAR){ARCH.push(a);ISLES[a.id]=a;OUTER.push(a.id);}
ARCH_STRIPS.push(
  {id:'hollow',name:'Hollowpeak',isle:'hollow',du:-600,dv:400,hdg:.79,len:440,wid:16,surf:'grass'},
  {id:'oyster',name:'Oyster Bay',isle:'oyster',du:-720,dv:0,hdg:Math.PI/2,len:480,wid:18,surf:'sand'},
  {id:'ridgeback',name:'Ridgeback',isle:'ridgeback',du:300,dv:-300,hdg:0,len:420,wid:16,surf:'dirt'},
  {id:'fern',name:'Fernhollow',isle:'fern',du:-120,dv:120,hdg:.3,len:440,wid:16,surf:'grass'},
  {id:'bracken',name:'Brackenmoor',isle:'bracken',du:100,dv:0,hdg:Math.PI/2,len:660,wid:22,surf:'paved'},
  {id:'sunrise',name:'Sunrise Cay',isle:'sunrise',du:0,dv:0,hdg:0,len:460,wid:18,surf:'sand'},
  {id:'anvil',name:'Anvil Top',isle:'anvil',du:-60,dv:20,hdg:0,len:400,wid:16,surf:'dirt'},
  {id:'creel',name:'Creel Isle',isle:'creel',du:-150,dv:-80,hdg:0,len:420,wid:16,surf:'grass'},
  {id:'fiddler',name:'Fiddler\'s Reach',isle:'fiddler',du:60,dv:-250,hdg:0,len:480,wid:18,surf:'grass'},
  {id:'daybreak',name:'Daybreak Field',isle:'daybreak',du:-700,dv:100,hdg:Math.PI/2,len:640,wid:22,surf:'paved'});
Object.assign(ARCH_COL,{
  hollow(h,sl,n1,n2,x,z){const I=ISLES.hollow,[u,v]=locUV(I,x,z);if(Math.hypot(u-250,v+100)<110&&h>250)return tc.setHex(0x3f78a0).lerp(tc2.setHex(0x5a9ab8),n2*.5+.5);
     if(h<3+n1*1.5&&sl<.3)return tc.setHex(COL.sand);if(sl>.5)return tc.setHex(0x6a6470).lerp(tc2.setHex(0x8a7e80),n2*.5+.5);return tc.setHex(0x5f9a48).lerp(tc2.setHex(0x86ae58),n1*.5+.5).lerp(tc2.setHex(0x8f9a5a),smooth(220,360,h));},
  oyster(h,sl,n1,n2){if(h<4+n1*2)return tc.setHex(0xefdcaa).lerp(tc2.setHex(0xf6ead0),n2*.5+.5);return tc.setHex(0xb4be78).lerp(tc2.setHex(COL.sand),.3+n1*.2);},
  anvil(h,sl,n1,n2){if(h<1.5)return tc.setHex(0xc8a070);if(sl>.42)return tc.setHex(0xc06a40).lerp(tc2.setHex(0xe0a070),(Math.sin(h*.13+n1*2)*.5+.5));if(h>150)return tc.setHex(0xb0a458).lerp(tc2.setHex(0xc8b878),n1*.5+.5);return tc.setHex(0xa89a5a);},
  atoll(h,sl,n1,n2){if(h<1.2)return tc.setHex(0xf2e4b8);return tc.setHex(0xf0dca8).lerp(tc2.setHex(0xa8c070),smooth(2.5,4.2,h)*.6);},
  sunrise(h,sl,n1,n2){if(h<3+n1)return tc.setHex(0xf4e2b0);return tc.setHex(0xc8c27a).lerp(tc2.setHex(0x9ab85a),n2*.5+.5);},
  whalebone(h,sl,n1,n2){return tc.setHex(0xeadcb4).lerp(tc2.setHex(0xd8cc9c),n1*.5+.5);},
  seals(h,sl,n1,n2){return tc.setHex(0x6e6870).lerp(tc2.setHex(0x8e8688),n2*.5+.5);},
  gannet(h,sl,n1,n2){if(sl<.35&&h>18)return tc.setHex(0xeae6d8);return tc.setHex(0x7e746e).lerp(tc2.setHex(0x9c9088),n2*.5+.5);},
  westmost(h,sl,n1,n2){if(sl<.3&&h>20)return tc.setHex(0x8aa060);return tc.setHex(0x6e6468).lerp(tc2.setHex(0x8e8280),n2*.5+.5);},
  bracken(h,sl,n1,n2){if(h<3+n1*1.5&&sl<.3)return tc.setHex(COL.sand);if(sl>.45)return tc.setHex(COL.rock);return tc.setHex(0x9a8a52).lerp(tc2.setHex(0x7a8a4a),n1*.5+.5).lerp(tc2.setHex(0xa86a4a),n2>.35?.45:0);},
});
