import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
const B='http://127.0.0.1:5180';
fs.mkdirSync('qa-shots/top',{recursive:true});
const br = await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:'new', args:['--no-sandbox','--hide-scrollbars']});
const jobs = [
  ['/','hero',1440,900,0],
  ['/','hero-mobile',390,844,0],
  ['/','pillars',1440,900,900],
  ['/','products',1440,900,5200],
  ['/products','products-page',1440,1000,300],
  ['/careers','careers',1440,1000,300],
  ['/careers','careers-mobile',390,844,250],
  ['/gallery','gallery',1440,1000,300],
  ['/blogs','blogs',1440,1000,300],
  ['/our-team','team',1440,1000,400],
  ['/contact','contact',1440,1000,300],
];
for (const [route,name,w,h,scroll] of jobs) {
  const p = await br.newPage();
  await p.setViewport({width:w,height:h});
  await p.goto(B+route,{waitUntil:'networkidle2',timeout:45000}).catch(()=>{});
  await p.evaluate(async (s)=>{ window.scrollTo(0,s); await new Promise(r=>setTimeout(r,1400)); }, scroll);
  await p.screenshot({path:`qa-shots/top/${name}.png`});
  await p.close();
  console.log('shot', name);
}
await br.close();
