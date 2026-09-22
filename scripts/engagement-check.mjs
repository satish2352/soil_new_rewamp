import puppeteer from 'puppeteer-core';

/**
 * Bounce-risk measurement.
 *
 * Bounce rate is decided by things you can measure before anyone scrolls: how
 * long until something is on screen, how long until a tap does anything, and
 * how much has to come down the wire. This measures those under conditions
 * that match the site's actual audience — Indian farmers and distributors on
 * mid-range Android over mobile data — rather than on a desktop on localhost,
 * where every site looks fast.
 *
 * Profiles are the standard Lighthouse throttling presets so the numbers are
 * comparable to anything else you run.
 */
const BASE = process.env.QA_BASE || 'http://127.0.0.1:5190';

const PROFILES = [
  { name: 'desktop, no throttle', cpu: 1, net: null, width: 1440, height: 900 },
  {
    name: 'mid Android, regular 4G',
    cpu: 4,
    net: { download: (4 * 1024 * 1024) / 8, upload: (3 * 1024 * 1024) / 8, latency: 170 },
    width: 390,
    height: 844,
  },
  {
    name: 'low-end Android, slow 4G',
    cpu: 6,
    net: { download: (1.6 * 1024 * 1024) / 8, upload: (750 * 1024) / 8, latency: 300 },
    width: 390,
    height: 844,
  },
];

const br = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox', '--hide-scrollbars'],
});

for (const profile of PROFILES) {
  const p = await br.newPage();
  await p.setViewport({ width: profile.width, height: profile.height });
  await p.setCacheEnabled(false);

  const cdp = await p.createCDPSession();
  if (profile.cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: profile.cpu });
  if (profile.net) {
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: profile.net.latency,
      downloadThroughput: profile.net.download,
      uploadThroughput: profile.net.upload,
    });
  }

  const started = Date.now();
  await p.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 120000 });

  // Wait for the hero headline to be readable — the moment the visitor can
  // actually decide whether this site is for them.
  let heroReadable = null;
  try {
    await p.waitForFunction(
      () => {
        const h1 = document.querySelector('h1');
        if (!h1) return false;
        const r = h1.getBoundingClientRect();
        if (r.width === 0) return false;
        // Not enough for the text to exist — it must not be behind the curtain.
        const curtain = document.querySelector('div[class*="z-[400]"]');
        return !curtain;
      },
      { timeout: 60000 }
    );
    heroReadable = Date.now() - started;
  } catch {
    heroReadable = -1;
  }

  const metrics = await p.evaluate(() => {
    const paint = performance.getEntriesByType('paint');
    const fcp = paint.find((x) => x.name === 'first-contentful-paint');
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    const nav = performance.getEntriesByType('navigation')[0];
    const res = performance.getEntriesByType('resource');
    const bytes = res.reduce((a, r) => a + (r.transferSize || r.encodedBodySize || 0), 0);
    const byKind = {};
    for (const r of res) {
      const k = r.initiatorType === 'img' ? 'img' : /\.css/.test(r.name) ? 'css' : /\.js/.test(r.name) ? 'js' : 'other';
      byKind[k] = (byKind[k] || 0) + (r.transferSize || r.encodedBodySize || 0);
    }
    let cls = 0;
    for (const e of performance.getEntriesByType('layout-shift') || []) {
      if (!e.hadRecentInput) cls += e.value;
    }
    return {
      fcp: fcp ? Math.round(fcp.startTime) : null,
      lcp: lcpEntries.length ? Math.round(lcpEntries[lcpEntries.length - 1].startTime) : null,
      domInteractive: Math.round(nav.domInteractive),
      kb: Math.round(bytes / 1024),
      js: Math.round((byKind.js || 0) / 1024),
      img: Math.round((byKind.img || 0) / 1024),
      cls: Number(cls.toFixed(4)),
      requests: res.length,
    };
  });

  // How much scrolling does the whole page take, and how much of that is a pin
  // that produces no new content? Scroll cost is a bounce factor on mobile.
  const scroll = await p.evaluate(() => {
    const doc = document.documentElement.scrollHeight;
    const pinned = [...document.querySelectorAll('.sticky')].reduce((a, el) => {
      const parent = el.parentElement;
      return a + Math.max(0, parent.offsetHeight - window.innerHeight);
    }, 0);
    return { pageHeight: doc, screens: +(doc / window.innerHeight).toFixed(1), pinnedRunway: pinned };
  });

  console.log(`\n── ${profile.name} (${profile.width}px, ${profile.cpu}x CPU)`);
  console.log(`   first paint        ${metrics.fcp} ms`);
  console.log(`   largest paint      ${metrics.lcp} ms`);
  console.log(`   hero readable      ${heroReadable === -1 ? 'TIMED OUT' : heroReadable + ' ms'}`);
  console.log(`   dom interactive    ${metrics.domInteractive} ms`);
  console.log(`   transferred        ${metrics.kb} KB  (js ${metrics.js} · img ${metrics.img}) over ${metrics.requests} requests`);
  console.log(`   layout shift       ${metrics.cls}`);
  console.log(`   page               ${scroll.pageHeight}px = ${scroll.screens} screens · ${scroll.pinnedRunway}px pinned runway`);

  await p.close();
}

await br.close();
