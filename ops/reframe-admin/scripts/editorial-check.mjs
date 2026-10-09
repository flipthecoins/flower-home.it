import { chromium } from 'playwright';
import { readFile, writeFile } from 'node:fs/promises';
import { snapshot } from '../delivery/src/worker.js';
const production = process.argv.includes('--production');
const state=JSON.parse(await readFile('artifacts/current-state.json','utf8'));
const env={SESSIONS:{async get(key){if(key==='media:index')return state.media; const [,kind,country]=key.split(':');return state[country]?.[kind]||null;}}};
const data=await snapshot('italy',env,'https://reframe-toplists.reframe-web.workers.dev');
const browser=await chromium.launch(); const report=[];
try {
 for(const width of [320,360,390,600,680,681,768,900,1024,1440]){
  const page=await browser.newPage({viewport:{width,height:1000}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('https://www.flower-home.it/?design-check=editorial',{waitUntil:'networkidle'});
  const before=await page.locator('.toplist__item').evaluateAll(cs=>cs.map(c=>({name:c.querySelector('.toplist__name').textContent,bonus:c.querySelector('.toplist__bonus-value')?.textContent,links:[...c.querySelectorAll('a')].map(a=>a.href)})));
  if(!production)await page.evaluate(d=>{document.querySelector('.toplist[role="list"]').innerHTML=d.html;document.querySelector('#toplist-custom-colors').outerHTML=d.css;},data);
  await page.locator('.toplist__logo-img').evaluateAll(async imgs=>Promise.all(imgs.map(i=>i.decode().catch(()=>{}))));
  const after=await page.locator('.toplist__item').evaluateAll(cs=>cs.map(c=>({name:c.querySelector('.toplist__name').textContent,bonus:c.querySelector('.toplist__bonus-value')?.textContent,links:[...c.querySelectorAll('a')].map(a=>a.href)})));
  if(JSON.stringify(before)!==JSON.stringify(after))throw Error('Casino content drift');
  const metrics=await page.evaluate(()=>({
   count:document.querySelectorAll('.toplist__item--editorial').length,
   overflow:document.documentElement.scrollWidth>innerWidth,
   bad:[...document.querySelectorAll('.toplist__item')].flatMap(c=>{
    const r=c.getBoundingClientRect(); const im=c.querySelector('img');const bad=[];
    if(r.left<0||r.right>innerWidth+1)bad.push('overflow');
    if(!im.complete||!im.naturalWidth)bad.push('image');
    const ir=im.getBoundingClientRect();
    const expectedLogoWidth=innerWidth<=360?88:innerWidth<=680?112:innerWidth<=1000?96:128;
    if(Math.abs(ir.width-expectedLogoWidth)>1)bad.push('logo width');
    if(Math.abs(ir.height-(innerWidth<=680?72:76))>1)bad.push('logo height');
    const name=c.querySelector('.toplist__name');
    if(name.scrollWidth>name.clientWidth+1)bad.push('name clipping');
    if(ir.right>c.querySelector('.toplist__info').getBoundingClientRect().left+1)bad.push('logo overlap');
    const play=c.querySelector('.btn--play');const ps=getComputedStyle(play);
    if(ps.backgroundColor!=='rgb(21, 128, 61)'||ps.color!=='rgb(255, 255, 255)')bad.push('CTA colors');
    if(play.getBoundingClientRect().height<44)bad.push('CTA touch target');
    if(getComputedStyle(c.querySelector('.btn--review')).color!=='rgb(89, 104, 120)')bad.push('review contrast');
    if(getComputedStyle(c).backgroundColor!=='rgb(255, 255, 255)')bad.push('background');
    if(getComputedStyle(c.querySelector('.toplist__logo')).backgroundColor!=='rgba(0, 0, 0, 0)')bad.push('plate');
    return bad.map(x=>im.alt+':'+x);
   }),
   heights:[...document.querySelectorAll('.toplist__item')].slice(0,3).map(c=>Math.round(c.getBoundingClientRect().height)),
  }));
  const play=page.locator('.toplist__item .btn--play').first();
  await play.hover();
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('.toplist__item .btn--play')).backgroundColor==='rgb(22, 101, 52)',null,{timeout:3000});
  await page.mouse.move(0,0);
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('.toplist__item .btn--play')).backgroundColor==='rgb(21, 128, 61)',null,{timeout:3000});
  await play.focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  const focus=await play.evaluate(e=>({active:e===document.activeElement,visible:e.matches(':focus-visible'),style:getComputedStyle(e).outlineStyle,width:getComputedStyle(e).outlineWidth}));
  if(!focus.active||!focus.visible||focus.style!=='solid'||parseFloat(focus.width)<2)throw Error('CTA keyboard focus failed: '+JSON.stringify({viewport:width,...focus}));
  const summary=page.locator('.toplist__item summary').first();await summary.focus();await page.keyboard.press('Enter');
  if(!await summary.locator('..').evaluate(x=>x.open))throw Error('Details keyboard failed');
  await page.keyboard.press('Enter');
  await page.evaluate(()=>{const r=document.querySelector('.toplist').getBoundingClientRect();document.activeElement?.blur();window.scrollTo({top:window.scrollY+r.top-110,behavior:'instant'});});
  const prefix=production?'live':'local';
  await page.screenshot({path:`artifacts/editorial-${prefix}-${width}.png`});
  // Hide only fixed header for stitched full-list evidence, not the normal viewport capture.
  await page.addStyleTag({content:'header{visibility:hidden !important}'});
  await page.locator('.toplist[role="list"]').screenshot({path:`artifacts/editorial-${prefix}-${width}-list.png`});
  report.push({width,...metrics,errors});await page.close();
 }
}finally{await browser.close();}
console.log(JSON.stringify(report,null,2));
await writeFile(`artifacts/editorial-${production?'live':'local'}-report.json`,JSON.stringify(report,null,2));
if(report.some(r=>r.count!==data.count||r.overflow||r.bad.length||r.errors.length))process.exitCode=1;
