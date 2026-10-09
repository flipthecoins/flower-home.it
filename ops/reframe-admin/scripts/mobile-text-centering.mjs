import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
import { snapshot } from '../delivery/src/worker.js';
const production=process.argv.includes('--production');
const state=JSON.parse(await readFile('artifacts/current-state.json','utf8'));
const env={SESSIONS:{async get(key){if(key==='media:index')return state.media;const [,kind,country]=key.split(':');return state[country]?.[kind]||null;}}};
const data=await snapshot('italy',env,'https://reframe-toplists.reframe-web.workers.dev');
const selectors='.toplist__name,.toplist__bonus-label,.toplist__bonus-value,.btn--play,.btn--review,.toplist__deposit,.toplist__legal,.toplist__details summary,.toplist__detail-row dt,.toplist__detail-row dd,.toplist__payment-list li';
const browser=await chromium.launch();
try{
 for(const width of [320,390,680,681,1440]){
  const page=await browser.newPage({viewport:{width,height:1000}});
  await page.goto('https://www.flower-home.it/',{waitUntil:'networkidle'});
  const styles=()=>page.locator('.toplist__item').evaluateAll((cards,s)=>cards.map(c=>[...c.querySelectorAll(s)].map(e=>({tag:e.tagName,cls:e.className,align:getComputedStyle(e).textAlign,font:getComputedStyle(e).fontSize}))),selectors);
  const before=await styles();
  if(!production)await page.evaluate(d=>{document.querySelector('.toplist[role="list"]').innerHTML=d.html;document.querySelector('#toplist-custom-colors').outerHTML=d.css;},data);
  await page.locator('.toplist__details').evaluateAll(ds=>ds.forEach(d=>d.open=true));
  // Measure the settled disclosure state, not a rotated arrow's transient bounds.
  await page.waitForFunction(()=>[...document.querySelectorAll('.toplist__details summary svg')].every(e=>e.getAnimations().every(a=>a.playState!=='running')));
  if(width<=680){
   const bad=await page.locator('.toplist__item').evaluateAll((cards,s)=>cards.flatMap(c=>[...c.querySelectorAll(s)].filter(e=>getComputedStyle(e).textAlign!=='center').map(e=>c.querySelector('.toplist__name').textContent+':'+e.className+':'+e.tagName)),selectors);
   assert.deepEqual(bad,[],`All mobile text centered at ${width}px`);
   const groups=await page.locator('.toplist__deposit,.toplist__payment-list,.toplist__details summary').evaluateAll(es=>es.map(e=>({cls:e.className||e.tagName,centered:getComputedStyle(e).justifyContent==='center'})));
   assert.ok(groups.every(e=>e.centered),JSON.stringify(groups));
  }else if(!production){assert.deepEqual(await styles(),before,`Desktop typography unchanged at ${width}px`);}
  const clipped=await page.locator('.toplist__item').evaluateAll(cs=>cs.flatMap(c=>[...c.querySelectorAll('summary,dd,.toplist__bonus-value,.toplist__legal')].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>({tag:e.tagName,cls:e.className,scroll:e.scrollWidth,width:e.clientWidth,text:e.textContent.slice(0,60)}))));
  assert.deepEqual(clipped,[],`No clipping in expanded cards at ${width}px`);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  console.log(JSON.stringify({width,centered:width<=680,desktopUnchanged:width>680&&!production,expandedCards:true,pass:true}));
  await page.close();
 }
}finally{await browser.close();}
