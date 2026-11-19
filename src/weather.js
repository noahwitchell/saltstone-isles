/* ---------- weather (a test, picked in Settings) ----------
   Clear, Cloudy, Showers, Stormy. Cloudy greys the sky, softens the sun, pulls the haze in and dims the sea glint.
   Showers adds rain streaks round the plane, a hiss of rain and a few bumps. Stormy is darker, windier, bumpier, with
   the odd lightning flash and a roll of thunder. Nothing here fights you hard: it's a change of mood. */
if(!settings.weather)settings.weather='clear';
const WX={clear:{name:'Clear',o:0,rain:0,bump:0,wind:1},cloudy:{name:'Cloudy',o:.6,rain:0,bump:.15,wind:1.4},
  rain:{name:'Showers',o:.8,rain:.55,bump:.45,wind:1.8},storm:{name:'Stormy',o:1,rain:1,bump:1,wind:3}};
const WIND0=WIND.clone();
const _wc=new THREE.Color(),_wg=new THREE.Color();
function greyed(c,o,dk){const l=c.r*.3+c.g*.59+c.b*.11;_wg.setRGB(l*.96,l*.99,l*1.04).multiplyScalar(1-dk);return c.lerp(_wg,o);}
function applyWeather(){const W=WX[settings.weather]||WX.clear,o=W.o;WIND.copy(WIND0).multiplyScalar(W.wind);
  for(const m of cloudGroup.children)m.material.color&&m.material.color.setScalar(1-o*.32);
  WXF.on=o>0;if(!o)return;const T=TOD[tod],dk=o*.22;
  sunL.intensity=T.sunI*(1-o*.65);hemi.intensity=T.hemiI*(1+o*.2);
  const u=skyMat.uniforms;for(const k of ['cZen','cHigh','cHor','cHaze'])greyed(u[k].value,o*.85,dk);u.cSun.value.lerp(u.cHor.value,o*.8);u.uDisc.value=T.disc*(1-o*.9);u.uStars.value=T.stars*(1-o);
  scene.fog.color.copy(u.cHor.value);scene.fog.near=T.fogN*(1-o*.5);scene.fog.far=T.fogF*(1-o*.42);WXF.col.copy(u.cHor.value);WXF.n=scene.fog.near;WXF.f=scene.fog.far;
  const w=waterMat.uniforms;w.fogColor.value.copy(u.cHor.value);w.fogNear.value=scene.fog.near;w.fogFar.value=scene.fog.far;
  for(const k of ['cDeep','cMid','cShal'])greyed(w[k].value,o*.45,dk*.6);w.cGlint.value.multiplyScalar(1-o*.75);
  const pu=postMat.uniforms;pu.sat.value=T.sat*(1-o*.3);pu.con.value=T.con*(1-o*.06);fogK=-1;}
/* rain: streaks in a box that follows the camera */
const RAIN=(()=>{const N=2400,BX=150,BY=90,P=new Float32Array(N*6),seed=[];for(let i=0;i<N;i++)seed.push([Math.random()*BX,Math.random()*BY,Math.random()*BX,.8+Math.random()*.4]);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));
  const m=new THREE.LineBasicMaterial({color:0xdde6f0,transparent:true,opacity:.4,depthWrite:false,fog:false});
  const L=new THREE.LineSegments(g,m);L.frustumCulled=false;L.visible=false;L.renderOrder=7;scene.add(L);
  let fall=0;
  return {update(dt){const W=WX[settings.weather]||WX.clear;L.visible=W.rain>0&&mode!=='title';if(!L.visible)return;
    const n=Math.round(N*W.rain);g.setDrawRange(0,n*2);fall+=dt*38;const c=camera.position,wx=WIND.x*.25,wz=WIND.z*.25;
    for(let i=0;i<n;i++){const s=seed[i],y=((s[1]-fall*s[3])%BY+BY)%BY;
      const x=c.x+(((s[0]-c.x+fall*wx)%BX+BX)%BX)-BX/2,z=c.z+(((s[2]-c.z+fall*wz)%BX+BX)%BX)-BX/2,yy=c.y-BY/2+y,len=1.6*s[3];
      const k=i*6;P[k]=x;P[k+1]=yy;P[k+2]=z;P[k+3]=x+wx*.08;P[k+4]=yy+len;P[k+5]=z+wz*.08;}
    g.attributes.position.needsUpdate=true;m.opacity=.28+.18*W.rain;}};})();
/* rain sound: soft filtered noise, louder in a storm */
const rainSnd={g:null,start(){const c=snd.ctx;if(!c||this.g)return;const b=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    const s=c.createBufferSource();s.buffer=b;s.loop=true;const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=2600;f.Q.value=.5;const h=c.createBiquadFilter();h.type='highshelf';h.frequency.value=5000;h.gain.value=-8;
    this.g=c.createGain();this.g.gain.value=0;s.connect(f).connect(h).connect(this.g).connect(c.destination);s.start();},
  set(v){if(!snd.ctx)return;this.start();if(this.g)this.g.gain.setTargetAtTime(settings.sound?v:0,snd.ctx.currentTime,.4);}};
function thunder(){const c=snd.ctx;if(!c||!settings.sound)return;const t=c.currentTime,b=c.createBuffer(1,c.sampleRate*3,c.sampleRate),d=b.getChannelData(0);let v=0;for(let i=0;i<d.length;i++){v=v*.98+(Math.random()*2-1)*.02;d[i]=v*8;}
  const s=c.createBufferSource();s.buffer=b;const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=180;const g=c.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.55,t+.25);g.gain.exponentialRampToValueAtTime(.001,t+2.9);
  s.connect(f).connect(g).connect(c.destination);s.start(t);}
let flashT=0,nextFlash=12,wxT=0;
function stepWeather(dt){const W=WX[settings.weather]||WX.clear;if(!W.bump)return;const agl=ac.pos.y-AC.gearH-surfH(ac.pos.x,ac.pos.z);if(agl<8)return;const k=W.bump*clamp(agl/40,0,1);
  ac.vel.y+=(vnoise(simT*.9,3,31)-.5)*5*k*dt;ac.vel.x+=(vnoise(simT*.5,4,31)-.5)*3*k*dt;ac.vel.z+=(vnoise(simT*.55,5,31)-.5)*3*k*dt;
  ac.w.z+=(vnoise(simT*1.3,6,31)-.5)*.9*k*dt;ac.w.x+=(vnoise(simT*1.1,7,31)-.5)*.5*k*dt;}
anims.push(t=>{const dt=clamp(t-wxT,0,.1);wxT=t;RAIN.update(dt);const W=WX[settings.weather]||WX.clear;
  rainSnd.set(mode==='fly'||mode==='paused'?W.rain*(camMode==='cockpit'?.05:.08):0);
  if(settings.weather==='storm'&&mode==='fly'){nextFlash-=dt;if(nextFlash<=0){nextFlash=9+Math.random()*16;flashT=.35;setTimeout(thunder,600+Math.random()*1800);}}
  if(flashT>0){flashT-=dt;const f=flashT>0?(Math.sin(flashT*40)>0?1:.35)*flashT/.35:0;postMat.uniforms.mist.value=Math.max(postMat.uniforms.mist.value,f*.55);}});
