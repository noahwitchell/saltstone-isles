import os
os.chdir(os.path.dirname(os.path.abspath(__file__))+'/..')
head=open('src/head.html').read()
world=open('src/world.js').read().replace('/*@ISLES@*/',open('src/isles.js').read()+'\n'+open('src/farisles.js').read()).replace('/*@ISLEPROPS@*/',open('src/isleprops.js').read()+'\n'+open('src/farprops.js').read()+'\n'+open('src/formations.js').read()+'\n'+open('src/nightglow.js').read()).replace('/*@TOWN@*/',open('src/town.js').read())
game=open('src/game.js').read().replace('/*@PLAY@*/',open('src/play.js').read()+'\n'+open('src/drops.js').read()+'\n'+open('src/switches.js').read()+'\n'+open('src/decor.js').read()+'\n'+open('src/pets.js').read()+'\n'+open('src/shop.js').read()+'\n'+open('src/portraits.js').read()+'\n'+open('src/weather.js').read()+'\n'+open('src/caves.js').read()+'\n'+open('src/savedev.js').read())
out0=head+'\n<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n<script>\n'+world+'\n</script>\n<script>\n'+game+'\n</script>\n'
import hashlib
BUILD=hashlib.sha1(out0.encode()).hexdigest()[:7]
out=out0.replace('__BUILD__',BUILD)
open('game.html','w').write(out)
open('_test.html','w').write('<!doctype html><meta charset="utf-8">\n'+out)
print('built',len(out))

# ---- home-screen web app (GitHub Pages serves /docs) ----
import json, hashlib
i=out.index('</style>')+len('</style>')
headpart,bodypart=out[:i],out[i:]
ver=hashlib.sha1(out.encode()).hexdigest()[:10]
page='''<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">
<meta name="theme-color" content="#1f1a2b">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Saltstone">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="apple-touch-icon-v2.png">
<link rel="icon" href="icon-v2-192.png">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}</style>
'''+headpart+'''
</head><body>
'''+bodypart+'''
<script>if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));</script>
</body></html>
'''
open('docs/index.html','w').write(page)
json.dump({"name":"Saltstone Isles","short_name":"Saltstone","start_url":".","scope":".","display":"fullscreen","orientation":"landscape",
  "background_color":"#1f1a2b","theme_color":"#1f1a2b",
  "icons":[{"src":"icon-v2-192.png","sizes":"192x192","type":"image/png"},{"src":"icon-v2-512.png","sizes":"512x512","type":"image/png","purpose":"any maskable"}]},
  open('docs/manifest.webmanifest','w'),indent=1)
open('docs/sw.js','w').write('''const CACHE='tac-%s';
const CORE=['./','index.html','manifest.webmanifest','icon-v2-192.png','icon-v2-512.png','apple-touch-icon-v2.png',
 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;
 if(e.request.mode==='navigate'||e.request.url.endsWith('index.html')){e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return r;}).catch(()=>caches.match(e.request).then(h=>h||caches.match('index.html'))));return;}
 e.respondWith(caches.match(e.request).then(hit=>{const net=fetch(e.request).then(r=>{if(r&&(r.ok||r.type==='opaque')){const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));}return r;}).catch(()=>hit);return hit||net;}));});
''' % ver)
open('docs/version.txt','w').write(BUILD)
print('web app built',ver,'build',BUILD)
