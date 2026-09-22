import puppeteer from 'puppeteer-core';

/**
 * Browser-zoom check.
 *
 * Page zoom does not scale the layout — it scales the CSS pixel, so a 1440px
 * window at 150% lays out as a 960px viewport with everything still sized in
 * the same rem. Emulating it as a narrower viewport is therefore exact, not an
 * approximation, and it is what catches the failure mode zoom actually
 * produces: a fixed-width or min-width element that fits at 100% and forces a
 * horizontal scrollbar once the viewport shrinks under it.
 *
 * Reports horizontal overflow, the elements causing it, and any text clipped
 * by a fixed-height container.
 */
const BASE = process.env.QA_BASE || 'http://127.0.0.1:5180';
const SCREEN = 1440;
const ZOOMS = [1, 1.25, 1.5, 1.75, 2];
const ROUTES = ['/', '/products', '/products/111', '/blogs', '/blogs/14', '/careers', '/contact', '/gallery', '/our-team', '/about-us'];

const br = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox', '--hide-scrollbars'],
});

let failures = 0;

for (const zoom of ZOOMS) {
  const width = Math.round(SCREEN / zoom);
  const height = Math.round(900 / zoom);

  for (const route of ROUTES) {
    const p = await br.newPage();
    await p.setViewport({ width, height });
    await p.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await new Promise((r) => setTimeout(r, 1600));

    const result = await p.evaluate(() => {
      const docW = document.documentElement.clientWidth;
      const overflow = document.documentElement.scrollWidth - docW;

      const culprits = [];
      if (overflow > 1) {
        for (const el of document.querySelectorAll('body *')) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          // Ignore anything deliberately clipped or parked off-screen.
          const cs = getComputedStyle(el);
          if (cs.position === 'fixed' || cs.visibility === 'hidden') continue;
          if (r.right > docW + 1 || r.left < -1) {
            culprits.push(
              `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)} → ${Math.round(r.left)}..${Math.round(r.right)}`
            );
          }
          if (culprits.length >= 4) break;
        }
      }

      // Text taller than the box drawn around it.
      const clipped = [];
      for (const el of document.querySelectorAll('h1,h2,h3,h4,p,span,a,button,li,dt,dd')) {
        if (el.children.length) continue;
        const cs = getComputedStyle(el);
        if (cs.overflow === 'visible' || !el.textContent.trim()) continue;
        if (cs.webkitLineClamp && cs.webkitLineClamp !== 'none') continue;

        /*
          Three kinds of element are clipped on purpose and must not be
          reported, or the check drowns in its own noise:

          - `.sr-only` text, which is a 1x1 overflow-hidden box by definition.
            Detected by size rather than class name so it also catches the
            equivalent written by hand.
          - anything inside `.reveal-clip`, the mask a line-reveal animates out
            of — being taller than its box is the entire mechanism.
          - `text-overflow: ellipsis`, which is a deliberate truncation.
        */
        if (el.clientHeight <= 1 || el.clientWidth <= 1) continue;
        if (el.closest('.reveal-clip')) continue;
        if (cs.textOverflow === 'ellipsis') continue;

        if (el.scrollHeight > el.clientHeight + 2) {
          clipped.push(`${el.tagName.toLowerCase()}: ${el.textContent.trim().slice(0, 40)}`);
        }
        if (clipped.length >= 3) break;
      }

      return { overflow, culprits, clipped };
    });

    const bad = result.overflow > 1 || result.clipped.length;
    if (bad) {
      failures += 1;
      console.log(`FAIL ${Math.round(zoom * 100)}% (${width}px) ${route}`);
      if (result.overflow > 1) console.log(`       overflow ${result.overflow}px`);
      result.culprits.forEach((c) => console.log(`       ${c}`));
      result.clipped.forEach((c) => console.log(`       clipped ${c}`));
    }
    await p.close();
  }
  console.log(`— ${Math.round(zoom * 100)}% (${width}px) done`);
}

await br.close();
console.log(
  failures ? `\nFAIL — ${failures} route/zoom combinations with problems` : '\nPASS — no overflow or clipping at any zoom level'
);
