import { chromium } from 'playwright';
import { generateToplistHTML,generateColorsCSS } from '../admin/src/worker.js';
import { COUNTRIES } from '../admin/src/config.js';
const browser=await chromium.launch();
const cases=[{name:'Sin bonus ni condiciones',slug:'empty',bonus:'',methods:'',license:'',min_deposit:'',logo:'https://reframe-toplists.reframe-web.workers.dev/media/vegashero.png'},{name:'Nombre comercial de casino deliberadamente muy largo',slug:'long',bonus:'Condición original '.repeat(12),methods:'EUR, USD, Visa, Mastercard, PayPal',license:'Licencia de prueba larga '.repeat(5),min_deposit:'€20 (bono de bienvenida), €10 en general',logo:'https://reframe-toplists.reframe-web.workers.dev/media/casoola-full.svg'}];
for(const width of [320,681,1440]){
 const p=await browser.newPage({viewport:{width,height:1000}});await p.goto('https://www.flower-home.it/',{waitUntil:'networkidle'});
 await p.evaluate(({html,css})=>{document.querySelector('.toplist[role="list"]').innerHTML=html;document.querySelector('#toplist-custom-colors').outerHTML=css;},{html:generateToplistHTML(cases,COUNTRIES.italy,'it',{}),css:generateColorsCSS({})});
 await p.locator('summary').click();
 const r=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,emptyDetails:document.querySelector('.toplist__item').querySelectorAll('.toplist__bonus,.toplist__details,.toplist__deposit').length,clipped:[...document.querySelectorAll('.toplist__item .toplist__name,.toplist__item .toplist__bonus-value,.toplist__item dd')].filter(x=>x.scrollWidth>x.clientWidth+1).map(x=>x.className)}));
 console.log({width,...r});if(r.overflow||r.emptyDetails||r.clipped.length)throw Error('Edge case regression');await p.close();
}
await browser.close();
