import fs from 'node:fs';
import { chromium,devices } from 'playwright';
const base=process.env.PERF_BASE||'http://localhost:3200',label=process.env.PERF_LABEL||'before';
const browser=await chromium.launch({headless:true});const results=[];
for(const mobile of [false,true])for(const route of ['/','/rent','/login']){
 const context=await browser.newContext({...mobile?devices['Pixel 5']:{viewport:{width:1440,height:900}},serviceWorkers:'block'});
 const page=await context.newPage(),session=await context.newCDPSession(page),errors=[],failed=[],apis=[];
 await session.send('Network.enable');await session.send('Network.setCacheDisabled',{cacheDisabled:true});
 await session.send('Emulation.setCPUThrottlingRate',{rate:4});
 await session.send('Network.emulateNetworkConditions',{offline:false,latency:40,downloadThroughput:1.6*1024*1024/8,uploadThroughput:750*1024/8});
 await page.addInitScript(()=>{window.__vitals={lcp:0,cls:0,longTasks:0,maxEvent:0};for(const type of ['largest-contentful-paint','layout-shift','longtask','event'])try{new PerformanceObserver(list=>{for(const e of list.getEntries()){if(type==='largest-contentful-paint')window.__vitals.lcp=e.startTime;if(type==='layout-shift'&&!e.hadRecentInput)window.__vitals.cls+=e.value;if(type==='longtask')window.__vitals.longTasks+=Math.max(0,e.duration-50);if(type==='event')window.__vitals.maxEvent=Math.max(window.__vitals.maxEvent,e.duration);}}).observe({type,buffered:true,durationThreshold:16});}catch{}});
 page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push({url:r.url().replace(/\?.*/,''),error:r.failure()?.errorText}));
 page.on('request',r=>{if(r.url().includes('/api/'))apis.push(r.url().replace(/\?.*/,''));});
 const response=await page.goto(base+route,{waitUntil:'load',timeout:60000});await page.waitForTimeout(6000);
 if(route==='/'&&mobile){await page.getByRole('button',{name:/Start your search/i}).click();await page.waitForTimeout(200);await page.keyboard.press('Escape');}
 const metrics=await page.evaluate(()=>{const entries=performance.getEntriesByType('resource'),nav=performance.getEntriesByType('navigation')[0];return {...window.__vitals,ttfb:nav.responseStart,domContentLoaded:nav.domContentLoadedEventEnd,jsBytes:entries.filter(e=>e.initiatorType==='script').reduce((s,e)=>s+e.encodedBodySize,0),imageBytes:entries.filter(e=>e.initiatorType==='img'||e.initiatorType==='image').reduce((s,e)=>s+e.encodedBodySize,0),jsRequests:entries.filter(e=>e.initiatorType==='script').length,fontRequests:entries.filter(e=>/\.(woff2?|ttf)(\?|$)/.test(e.name)).length,requests:entries.length,overflow:document.documentElement.scrollWidth>innerWidth,images:[...document.images].filter(e=>e.getBoundingClientRect().top<innerHeight).map(e=>({loading:e.loading,fetchPriority:e.fetchPriority,width:e.clientWidth,src:e.currentSrc,complete:e.complete})),resources:entries.filter(e=>e.initiatorType==='script').map(e=>({url:e.name,bytes:e.encodedBodySize}))};});
 const row={route,mobile,status:response.status(),...metrics,apis,errors,failed};results.push(row);console.log(JSON.stringify({...row,images:row.images.length,resources:undefined}));await context.close();
}
await browser.close();fs.writeFileSync(process.env.PERF_OUTPUT || `seo-performance-${label}.json`,JSON.stringify({at:new Date().toISOString(),base,conditions:'Cold cache; Chromium; 4x CPU; 1.6Mbps down/750Kbps up; 40ms latency; 6s post-load sample; single run per route/device. Interaction max duration is lab-only, not field INP.',results},null,2));
