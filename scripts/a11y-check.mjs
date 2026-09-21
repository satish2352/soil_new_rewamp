import puppeteer from 'puppeteer-core';
const B='http://127.0.0.1:5180';
const br = await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:'new', args:['--no-sandbox']});

// --- reduced motion -------------------------------------------------------
const p = await br.newPage();
await p.emulateMediaFeatures([{name:'prefers-reduced-motion', value:'reduce'}]);
await p.setViewport({width:1440,height:900});
await p.goto(B+'/',{waitUntil:'networkidle2'}).catch(()=>{});
await p.evaluate(async()=>{window.scrollTo(0,3000);await new Promise(r=>setTimeout(r,900));});
const rm = await p.evaluate(() => {
  // Only elements currently inside the viewport are expected to be visible —
  // anything below the fold is legitimately still waiting for its reveal.
  const vh = window.innerHeight;
  const hidden = [...document.querySelectorAll('section, article, li, h2, h3, p')]
    .filter(el => {
      const r = el.getBoundingClientRect();
      const inView = r.top < vh - 40 && r.bottom > 40 && r.height > 8;
      if (!inView) return false;
      return parseFloat(getComputedStyle(el).opacity) < 0.15;
    });
  const moving = [...document.querySelectorAll('*')].filter(el => {
    const s = getComputedStyle(el);
    return s.animationName !== 'none' && parseFloat(s.animationDuration) > 0.01;
  });
  const longTrans = [...document.querySelectorAll('*')].filter(el =>
    parseFloat(getComputedStyle(el).transitionDuration) > 0.05).length;
  return {invisible: hidden.length, animating: moving.length, longTransitions: longTrans};
});
console.log('REDUCED MOTION:', JSON.stringify(rm));
console.log('  content left invisible :', rm.invisible, rm.invisible===0?'OK':'FAIL');
console.log('  still animating        :', rm.animating, rm.animating===0?'OK':'FAIL');
console.log('  transitions > 50ms     :', rm.longTransitions, rm.longTransitions===0?'OK':'FAIL');
await p.close();

// --- keyboard -------------------------------------------------------------
const k = await br.newPage();
await k.setViewport({width:1440,height:900});
await k.goto(B+'/',{waitUntil:'networkidle2'}).catch(()=>{});
const trail=[]; let noFocusRing=0;
for (let i=0;i<22;i++){
  await k.keyboard.press('Tab');
  const info = await k.evaluate(()=>{
    const el=document.activeElement; if(!el||el===document.body) return null;
    const s=getComputedStyle(el);
    const ring = s.outlineStyle!=='none' && parseFloat(s.outlineWidth)>0;
    return {tag:el.tagName.toLowerCase(), label:(el.innerText||el.getAttribute('aria-label')||el.placeholder||'').trim().slice(0,28), ring};
  });
  if(info){trail.push(info); if(!info.ring) noFocusRing++;}
}
console.log('\nKEYBOARD: first', trail.length, 'stops');
trail.slice(0,10).forEach((t,i)=>console.log(`  ${i+1}. ${t.tag.padEnd(7)} ${t.ring?'[ring]':'[NO RING]'} ${t.label}`));
console.log('  stops without a focus ring:', noFocusRing, noFocusRing===0?'OK':'CHECK');

// Escape closes the mobile menu
await k.setViewport({width:390,height:844});
await k.reload({waitUntil:'networkidle2'}).catch(()=>{});
await k.evaluate(()=>{ [...document.querySelectorAll('button')].find(b=>/menu/i.test(b.getAttribute('aria-label')||''))?.click(); });
await new Promise(r=>setTimeout(r,500));
const openNow = await k.evaluate(()=>!!document.querySelector('[role="dialog"]'));
await k.keyboard.press('Escape');
await new Promise(r=>setTimeout(r,600));
const closedNow = await k.evaluate(()=>!document.querySelector('[role="dialog"]'));
console.log('\nMOBILE MENU: opens', openNow?'OK':'FAIL', '| Escape closes', closedNow?'OK':'FAIL');
await k.close();
await br.close();
