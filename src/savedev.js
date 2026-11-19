/* ---------- save backup and dev mode ----------
   Progress lives only in this browser's storage (on an iPhone, each home-screen icon has its own). The save code
   packs it into one line of text you can paste into any other install. Dev mode (tap the build number in Settings
   five times) unlocks a test panel; turning it on first backs up your real progress, turning it off puts it back. */
const SAVE_KEYS={s:'tac-settings',l:'tac-log',r:RESUME},DEV_BACKUP='tac-devbackup';
const rawGet=k=>{try{return localStorage.getItem(k);}catch(e){return null;}},rawSet=(k,v)=>{try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v);}catch(e){}};
/* write straight to storage and reload, with the game's own saving switched off so nothing overwrites it on the way out */
function hardReload(){store.set=()=>{};location.reload();}
function saveCode(){saveL();saveS();const d={};for(const [k,key] of Object.entries(SAVE_KEYS))d[k]=rawGet(key);
  if(settings.dev){const b=JSON.parse(rawGet(DEV_BACKUP)||'{}');d.l=b.l??d.l;d.r=b.r??d.r;}   // in dev mode, back up the real save, not the test one
  return 'SALTSTONE1:'+btoa(unescape(encodeURIComponent(JSON.stringify(d))));}
function readCode(t){t=(t||'').trim().replace(/\s+/g,'');if(!t.startsWith('SALTSTONE1:'))return null;try{const d=JSON.parse(decodeURIComponent(escape(atob(t.slice(11)))));return d&&d.l?d:null;}catch(e){return null;}}
function saveCodeCard(){const code=saveCode();
  showCard(`<h2>Copy save code</h2><div class="sub">ALL YOUR PROGRESS IN ONE LINE</div><p>Copy this and keep it in Notes, or paste it into another install with <b>Load save code</b>.</p>
    <textarea id="saveTxt" readonly style="width:100%;height:110px;font:12px var(--mono);word-break:break-all;background:#fff8ec;border:2px solid #241c2e;border-radius:6px;padding:6px">${code}</textarea>`,
    [['Copy',()=>{const t=$('saveTxt');t.select();(navigator.clipboard?navigator.clipboard.writeText(code):Promise.reject()).then(()=>toast('Save code copied.',1.6)).catch(()=>{try{document.execCommand('copy');toast('Save code copied.',1.6);}catch(e){toast('Select the text and copy it by hand.',2);}});},true],['Back',settingsCard]]);}
function loadCodeCard(){
  showCard(`<h2>Load save code</h2><div class="sub">REPLACES THE PROGRESS IN THIS INSTALL</div><p>Paste a save code from another install.</p>
    <textarea id="loadTxt" style="width:100%;height:110px;font:12px var(--mono);word-break:break-all;background:#fff8ec;border:2px solid #241c2e;border-radius:6px;padding:6px" placeholder="SALTSTONE1:..."></textarea>`,
    [['Load it',()=>{const d=readCode($('loadTxt').value);if(!d){toast('That doesn\'t look like a save code.',2);return;}
      let L={};try{L=JSON.parse(d.l);}catch(e){}
      showCard(`<h2>Replace your progress?</h2><p>The code has <b>day ${L.mail?L.mail.day:1}</b>, <b>${L.stamps||0} stamps</b> and <b>${(L.coins||0).toLocaleString()} coins</b>. What's in this install now will be replaced.</p>`,
        [['Replace it',()=>{rawSet(SAVE_KEYS.l,d.l);rawSet(SAVE_KEYS.r,d.r);if(d.s){let S={};try{S=JSON.parse(d.s);}catch(e){}S.dev=false;rawSet(SAVE_KEYS.s,JSON.stringify(S));}rawSet(DEV_BACKUP,null);hardReload();},true],['Cancel',loadCodeCard]]);},true],['Back',settingsCard]]);}
/* extra rows at the foot of Settings, and the five taps on the build number */
let devTaps=0,devTapT=0;
function settingsExtras(){const cb=$('cardBody');
  const box=document.createElement('div');box.innerHTML=`<h3>SAVE BACKUP · YOUR PROGRESS LIVES ONLY ON THIS DEVICE</h3><div class="btns"><button id="svCopy">COPY SAVE CODE</button><button id="svLoad">LOAD SAVE CODE</button></div>${settings.dev?'<h3 style="color:#c2456a">DEV MODE IS ON · YOUR REAL SAVE IS BACKED UP</h3><div class="btns"><button id="devOpen" class="primary">DEV PANEL</button><button id="devOff">TURN OFF DEV MODE</button></div>':''}`;
  const bn=[...cb.querySelectorAll('.sub')].find(e=>/BUILD/.test(e.textContent));cb.insertBefore(box,bn||null);
  $('svCopy').onclick=saveCodeCard;$('svLoad').onclick=loadCodeCard;
  if(settings.dev){$('devOpen').onclick=devPanel;$('devOff').onclick=devOffCard;}
  if(bn){bn.style.cursor='pointer';bn.onclick=()=>{const t=performance.now();devTaps=t-devTapT<700?devTaps+1:1;devTapT=t;
    if(devTaps>=5){devTaps=0;if(!settings.dev)devOn();else toast('Dev mode is already on.',1.4);}else if(devTaps>=3&&!settings.dev)toast(`${5-devTaps} more for dev mode`,.8);};}}
function devOn(){saveL();rawSet(DEV_BACKUP,JSON.stringify({l:rawGet(SAVE_KEYS.l),r:rawGet(SAVE_KEYS.r),ts:Date.now()}));settings.dev=true;saveS();snd.beep(1320);
  toast('Dev mode on. Your real progress is backed up.',2.2);devPanel();}
function devOffCard(){showCard(`<h2>Turn off dev mode?</h2><p>Your real progress comes back exactly as it was when you turned dev mode on. Everything you did in dev mode is thrown away.</p>`,
  [['Turn it off',()=>{const b=JSON.parse(rawGet(DEV_BACKUP)||'null');if(b){rawSet(SAVE_KEYS.l,b.l);rawSet(SAVE_KEYS.r,b.r);}rawSet(DEV_BACKUP,null);settings.dev=false;rawSet(SAVE_KEYS.s,JSON.stringify(settings));hardReload();},true],['Back',settingsCard]]);}
function devUnlockAll(){SH.plane.owned=PLANES.map(p=>p.id);SH.paint.owned=PAINTS.map(p=>p[0]);SH.smoke.owned=SMOKES.map(p=>p[0]);for(const u of UPG)SH[u.id]=u.max;saveL();applyUpgrades();}
function devResetGarage(){SH.plane={owned:['cub'],sel:'cub'};SH.paint={owned:['classic'],sel:'classic'};SH.smoke={owned:['white'],sel:'white'};for(const u of UPG)SH[u.id]=0;saveL();applyUpgrades();}
function devAll(obj,list,on){for(const k of list){if(on)obj[k]=obj[k]||Date.now();else delete obj[k];}saveL();}
function devToCave(C){SH.plane.owned.includes('float')||SH.plane.owned.push('float');SH.plane.sel='float';applyUpgrades();
  const s=stripById('harbor');spawnQuiet=true;try{spawnField(s);}finally{spawnQuiet=false;}
  setFloats(true);ac.floats=1;const x=C.mx+C.nx*90,z=C.mz+C.nz*90;ac.pos.set(x,AC.gearH+floatLift(),z);ac.gYaw=Math.atan2(C.nx,C.nz);ac.gPitch=0;ac.u=0;ac.vel.set(0,0,0);ac.ground=true;
  ac.q.setFromEuler(_e.set(0,ac.gYaw,0,'YXZ'));snapCam=true;hideModal();$('title').hidden=true;startFly();toast(`On the water outside ${C.name}. Taxi straight in.`,2.4);}
function devPanel(){const n=(o,l)=>l.filter(k=>o[k]).length,sk=Object.keys(sights),gk=GOALS.map(g=>g.id),ck=CAVES.map(c=>c.id);
  const row=(label,btns)=>`<div class="tog"><div><b>${label}</b></div><div class="btns" style="margin:0;justify-content:flex-end">${btns}</div></div>`;
  const b=(id,t)=>`<button data-dev="${id}">${t}</button>`;
  showCard(`<h2>Dev panel</h2><div class="sub" style="color:#c2456a">TEST FREELY · YOUR REAL SAVE COMES BACK WHEN YOU TURN DEV MODE OFF</div>
    ${row(`Coins: ${log.coins.toLocaleString()}`,b('coins','+1,000')+b('coins0','ZERO'))}
    ${row('Garage: planes, parts, paint, smoke',b('unlock','UNLOCK ALL')+b('garage','RESET')+b('shop','OPEN SHOP'))}
    ${row(`Mail: day ${mail.day}${mail.active?' (running)':''}`,b('dayDn','−')+b('dayUp','+')+b('dayGo','START IT'))}
    ${row(`Sea caves: ${n(log.caves,ck)} of ${ck.length}`,b('cavesAll','ALL')+b('cavesNone','NONE'))}
    ${row(`Landmarks: ${n(log.sights,sk)} of ${sk.length}`,b('sightsAll','ALL')+b('sightsNone','NONE'))}
    ${row(`Logbook goals: ${n(log.goals,gk)} of ${gk.length}`,b('goalsAll','ALL')+b('goalsNone','NONE'))}
    ${row('Chart every island',b('chart','CHART ALL'))}
    <h3>GO TO A SEA CAVE (ON FLOATS)</h3><div class="btns">${CAVES.map((C,i)=>`<button data-cave="${i}">${C.name.toUpperCase()}</button>`).join('')}</div>
    <h3>GO TO A FIELD</h3><div class="btns"><button data-dev="fields">PICK A FIELD</button></div>`,
    [['Back',settingsCard,true],['Turn off dev mode',devOffCard]]);
  const A={coins:()=>addCoins(1000),coins0:()=>{log.coins=0;saveL();updScore();},unlock:devUnlockAll,garage:devResetGarage,
    shop:()=>{shopCard(stripById('harbor'),devPanel);return true;},
    dayDn:()=>{mail.day=Math.max(1,mail.day-1);mail.active=false;mail.bag=[];saveL();refreshBag();},dayUp:()=>{mail.day=Math.min(DAYS.length+1,mail.day+1);mail.active=false;mail.bag=[];saveL();refreshBag();},
    dayGo:()=>{offerDay(()=>{hideModal();mode=mode==='title'?'title':'fly';});return true;},
    cavesAll:()=>devAll(log.caves,ck,true),cavesNone:()=>devAll(log.caves,ck,false),sightsAll:()=>devAll(log.sights,sk,true),sightsNone:()=>devAll(log.sights,sk,false),
    goalsAll:()=>devAll(log.goals,gk,true),goalsNone:()=>devAll(log.goals,gk,false),
    chart:()=>{for(const id of ISLE_IDS)log.chart[id]=2;saveL();rebuildChart();},fields:()=>{picker('start');return true;}};
  $('cardBody').querySelectorAll('[data-dev]').forEach(el=>el.addEventListener('click',()=>{snd.click();if(!A[el.dataset.dev]())devPanel();}));
  $('cardBody').querySelectorAll('[data-cave]').forEach(el=>el.addEventListener('click',()=>devToCave(CAVES[+el.dataset.cave])));}
