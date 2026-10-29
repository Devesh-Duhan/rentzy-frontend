import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { BRAND_ASSETS, BRAND_ICONS } from '../src/lib/brand.js';
const publicDir=new URL('../public/',import.meta.url);

test('existing ICO directory and bitmap frames are valid and match metadata sizes',()=>{
 const bytes=fs.readFileSync(new URL('favicon.ico',publicDir));
 assert.equal(bytes.readUInt16LE(0),0);assert.equal(bytes.readUInt16LE(2),1);
 const sizes=[];
 for(let index=0;index<bytes.readUInt16LE(4);index++){
  const entry=6+index*16,width=bytes[entry]||256,height=bytes[entry+1]||256;
  const length=bytes.readUInt32LE(entry+8),offset=bytes.readUInt32LE(entry+12);
  assert.ok(offset+length<=bytes.length);assert.ok(offset>=6+bytes.readUInt16LE(4)*16);
  assert.equal(bytes.readUInt32LE(offset),40);assert.equal(bytes.readInt32LE(offset+4),width);assert.equal(bytes.readInt32LE(offset+8),height*2);
  sizes.push(`${width}x${height}`);
 }
 assert.equal(BRAND_ICONS.icon.sizes,sizes.join(' '));assert.equal(BRAND_ICONS.icon.url,'/favicon.ico');
});
test('touch, manifest and social icons exist with honest PNG sizes',()=>{
 for(const icon of [...BRAND_ASSETS.manifestIcons,{src:BRAND_ASSETS.appleTouchIcon,sizes:BRAND_ICONS.apple.sizes},{src:BRAND_ASSETS.socialImage,sizes:'512x512'}]){
  assert.ok(!icon.src.includes('/public/'));
  const bytes=fs.readFileSync(new URL(icon.src.slice(1),publicDir));
  assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.equal(`${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`,icon.sizes);
  assert.notEqual(icon.purpose,'maskable');
 }
});

function worker({offline=false}={}){
 const handlers={},deleted=[];let calls=0;
 const cached={label:'cached'},fresh={label:'network',status:200,type:'basic',clone(){return this;}};
 const self={location:{origin:'https://rentzypro.com'},addEventListener(name,handler){handlers[name]=handler;},clients:{claim:async()=>{}},skipWaiting:async()=>{}};
 const caches={match:async()=>cached,open:async()=>({put:async()=>{},addAll:async()=>{}}),keys:async()=>['rentzypro-v3','rentzypro-v4-brand-assets'],delete:async key=>{deleted.push(key);}};
 vm.runInNewContext(fs.readFileSync(new URL('sw.js',publicDir),'utf8'),{self,caches,URL,Response,fetch:async()=>{calls++;if(offline)throw Error('offline');return fresh;}});
 return {deleted,get calls(){return calls;},async request(path){let response;handlers.fetch({request:{method:'GET',url:new URL(path,self.location.origin).href,mode:'same-origin',headers:{get:()=>''}},respondWith(promise){response=promise;}});return response?await response:undefined;},async activate(){let pending;handlers.activate({waitUntil(promise){pending=promise;}});await pending;}};
}
test('brand URLs refresh from the network even when an old cached icon exists',async()=>{
 for(const path of ['/favicon.ico','/favicon','/manifest.webmanifest','/site.webmanifest',BRAND_ASSETS.appleTouchIcon,BRAND_ASSETS.socialImage]){
  const sw=worker();assert.equal((await sw.request(path)).label,'network');assert.equal(sw.calls,1);
 }
});
test('brand icons retain offline fallback and immutable chunks keep cache-first behavior',async()=>{
 const offline=worker({offline:true});assert.equal((await offline.request('/favicon.ico')).label,'cached');
 const sw=worker();assert.equal((await sw.request('/_next/static/chunks/example.js')).label,'cached');assert.equal(sw.calls,0);
});
test('existing API/private/cross-origin bypass and cache cleanup remain intact',async()=>{
 const sw=worker();for(const path of ['/api/properties','/admin','/seller','/profile','https://images.example/brand.png'])assert.equal(await sw.request(path),undefined);
 assert.equal(sw.calls,0);await sw.activate();assert.deepEqual(sw.deleted,['rentzypro-v3']);
});
