// Sob Medida · Ampla — funciona sem internet (guarda o app no aparelho)
const CACHE='sob-medida-v13';
const ARQS=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
const CDN='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js';
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ARQS).then(()=>c.add(CDN).catch(()=>{}))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET')return;
  if(u.hostname.endsWith('supabase.co'))return; // dados sempre on-line (o app guarda cópia própria)
  if(e.request.mode==='navigate'||u.pathname.endsWith('index.html')){
    // página: tenta a versão nova na internet; sem internet usa a guardada
    e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put('index.html',c));return r}).catch(()=>caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(m=>m||fetch(e.request).then(r=>{if(r.ok&&(u.origin===location.origin||u.hostname.includes('jsdelivr')||u.hostname.includes('gstatic')||u.hostname.includes('googleapis'))){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c))}return r})));
});
