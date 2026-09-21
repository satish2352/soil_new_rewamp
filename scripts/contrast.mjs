/** Samples real rendered text/background pairs and reports WCAG contrast. */
import puppeteer from 'puppeteer-core';
const B='http://127.0.0.1:5180';
const br = await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:'new', args:['--no-sandbox']});
const routes = ['/','/products','/careers','/blogs','/contact','/our-team'];
let worst = [];
for (const r of routes) {
  const p = await br.newPage();
  await p.setViewport({width:1440,height:900});
  await p.goto(B+r,{waitUntil:'networkidle2',timeout:45000}).catch(()=>{});
  await p.evaluate(async()=>{for(let y=0;y<9000;y+=500){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,70));}window.scrollTo(0,0);await new Promise(r=>setTimeout(r,900));});
  const bad = await p.evaluate(() => {
    const lum = (c) => { const [r,g,b]=c.map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);}); return 0.2126*r+0.7152*g+0.0722*b; };
    const parse = (s) => { const m=s.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/); return m?[+m[1],+m[2],+m[3],m[4]===undefined?1:+m[4]]:null; };
    // Returns the first opaque backdrop colour, or null when the text sits on a
    // gradient / image / video layer whose effective colour cannot be resolved.
    const bgOf = (el) => {
      let n = el;
      while (n && n !== document.documentElement) {
        const st = getComputedStyle(n);
        if (st.backgroundImage && st.backgroundImage !== 'none') return null;
        const c = parse(st.backgroundColor);
        if (c && c[3] > 0.85) return c;
        n = n.parentElement;
      }
      return [255, 255, 255, 1];
    };
    const out=[];
    document.querySelectorAll('p,span,a,li,h1,h2,h3,h4,button,label,dt,dd').forEach(el=>{
      if(el.children.length) return;
      const txt=(el.innerText||'').trim(); if(txt.length<3) return;
      const st=getComputedStyle(el);
      if(st.visibility==='hidden'||parseFloat(st.opacity)<0.6) return;
      const r=el.getBoundingClientRect(); if(r.width<4||r.height<4) return;
      if(el.closest('.sr-only')||el.classList.contains('sr-only')) return;
      const fg=parse(st.color); if(!fg||fg[3]<0.6) return;
      const bg=bgOf(el); if(!bg) return;
      const L1=lum(fg.slice(0,3)), L2=lum(bg.slice(0,3));
      const ratio=(Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);
      const size=parseFloat(st.fontSize), bold=parseInt(st.fontWeight)>=700;
      const large = size>=24 || (size>=18.66 && bold);
      const min = large?3:4.5;
      if(ratio<min) out.push({ratio:+ratio.toFixed(2),min,size:Math.round(size),txt:txt.slice(0,38)});
    });
    return out;
  });
  await p.close();
  console.log(`${r.padEnd(12)} ${bad.length===0?'OK  all text meets WCAG AA':'FAIL '+bad.length+' below AA'}`);
  bad.slice(0,5).forEach(b=>console.log(`   ${b.ratio}:1 (need ${b.min}) ${b.size}px "${b.txt}"`));
  worst.push(...bad);
}
console.log(`\n${worst.length===0?'PASS':'FAIL'} — ${worst.length} contrast violations across ${routes.length} routes`);
await br.close();
