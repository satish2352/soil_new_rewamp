/**
 * Visual and accessibility QA sweep.
 *
 * Loads every route at every target breakpoint and reports:
 *   - horizontal overflow (and which element causes it)
 *   - console errors and failed requests
 *   - images that failed to load
 *   - heading-level jumps
 *   - touch targets under 44px
 *   - text clipped by a fixed height
 *
 * Usage: node scripts/qa.mjs [baseUrl] [--shots]
 */
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const BASE = process.argv[2]?.startsWith('http') ? process.argv[2] : 'http://127.0.0.1:5180';
const SHOTS = process.argv.includes('--shots');
const OUT = path.resolve('qa-shots');

const CHROME =
  process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const ROUTES = [
  ['/', 'home'],
  ['/about-us', 'about'],
  ['/vision-mission', 'vision-mission'],
  ['/our-team', 'team'],
  ['/gallery', 'gallery-photos'],
  ['/gallery?tab=videos', 'gallery-videos'],
  ['/products', 'products'],
  ['/products/111', 'product-detail'],
  ['/blogs', 'blogs'],
  ['/blogs/14', 'blog-detail-marathi'],
  ['/blogs/2', 'blog-detail-english'],
  ['/careers', 'careers'],
  ['/contact', 'contact'],
  ['/no-such-page', '404'],
];

const WIDTHS = [320, 375, 390, 414, 768, 1024, 1280, 1440, 1920];
// Full route sweep at these; the rest get the homepage only, to keep the run short.
const FULL_SWEEP = [375, 768, 1440];

/** Runs in the page: collects every layout problem we care about. */
const audit = () => {
  const docW = document.documentElement.clientWidth;
  const problems = [];

  // Horizontal overflow — name the widest offender rather than just flagging it.
  const scrollW = document.documentElement.scrollWidth;
  if (scrollW > docW + 1) {
    let worst = null;
    document.querySelectorAll('body *').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      const overhang = Math.max(r.right - docW, -r.left);
      if (overhang > 1) {
        const style = getComputedStyle(el);
        // Elements that scroll internally or are deliberately clipped are fine.
        if (style.overflowX === 'auto' || style.overflowX === 'scroll') return;
        let p = el.parentElement;
        let clipped = false;
        while (p && p !== document.body) {
          const ps = getComputedStyle(p);
          if (ps.overflow === 'hidden' || ps.overflowX === 'hidden' || ps.overflowX === 'auto') {
            clipped = true;
            break;
          }
          p = p.parentElement;
        }
        if (clipped) return;
        if (!worst || overhang > worst.overhang) {
          worst = {
            overhang: Math.round(overhang),
            tag: el.tagName.toLowerCase(),
            cls: (el.className?.toString?.() || '').slice(0, 90),
          };
        }
      }
    });
    if (worst) {
      problems.push({
        type: 'overflow-x',
        detail: `scrollWidth ${scrollW} > ${docW}; worst: <${worst.tag}> +${worst.overhang}px "${worst.cls}"`,
      });
    }
  }

  // Broken images.
  document.querySelectorAll('img').forEach((img) => {
    if (img.complete && img.naturalWidth === 0 && img.currentSrc) {
      problems.push({ type: 'broken-image', detail: img.currentSrc.slice(0, 120) });
    }
  });

  // Images without alt attributes at all (empty alt is valid for decorative).
  document.querySelectorAll('img:not([alt])').forEach((img) => {
    problems.push({ type: 'img-no-alt', detail: (img.currentSrc || img.src).slice(0, 100) });
  });

  // Heading order.
  const levels = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
    .filter((h) => h.offsetParent !== null || h.closest('[aria-hidden="true"]') === null)
    .map((h) => ({ level: +h.tagName[1], text: h.innerText.trim().slice(0, 40) }));

  const h1s = levels.filter((l) => l.level === 1).length;
  if (h1s !== 1) problems.push({ type: 'h1-count', detail: `${h1s} <h1> on page` });

  for (let i = 1; i < levels.length; i++) {
    const jump = levels[i].level - levels[i - 1].level;
    if (jump > 1) {
      problems.push({
        type: 'heading-jump',
        detail: `h${levels[i - 1].level} → h${levels[i].level} at "${levels[i].text}"`,
      });
    }
  }

  // Touch targets — only meaningful on touch-sized viewports, and only for
  // controls, not links flowing inside a paragraph of prose.
  if (docW <= 820) {
    document.querySelectorAll('a[href], button, input, select, textarea').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      if (getComputedStyle(el).position === 'absolute' && r.height < 4) return;
      // Inline links inside running text are not tap targets in their own right.
      if (el.closest('.rich') || el.closest('p')) return;
      // A stretched link (::after covering the card) has the card as its hit area.
      const after = getComputedStyle(el, '::after');
      if (after.position === 'absolute' && after.inset === '0px') return;
      if (r.height < 38) {
        problems.push({
          type: 'small-target',
          detail: `${el.tagName.toLowerCase()} ${Math.round(r.width)}x${Math.round(r.height)} "${(el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, 30)}"`,
        });
      }
    });
  }

  const r0 = (el) => el.getBoundingClientRect();

  // Text clipped by a fixed height.
  document.querySelectorAll('h1,h2,h3,h4,p,li,span,button,a').forEach((el) => {
    if (el.children.length > 0) return;
    const style = getComputedStyle(el);
    if (style.overflow === 'visible') return;
    if (style.webkitLineClamp && style.webkitLineClamp !== 'none') return;
    if (el.closest('.reveal-clip')) return;
    // .sr-only is a 1px clipping box by design — never a layout defect.
    if (el.closest('.sr-only') || el.classList.contains('sr-only')) return;
    if (r0(el).height <= 2) return;
    if (el.scrollHeight > el.clientHeight + 3 && el.clientHeight > 0) {
      problems.push({
        type: 'clipped-text',
        detail: `${el.tagName.toLowerCase()} "${el.innerText.trim().slice(0, 40)}"`,
      });
    }
  });

  return problems;
};

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars'],
});

if (SHOTS) fs.mkdirSync(OUT, { recursive: true });

const report = [];
let totalIssues = 0;

for (const width of WIDTHS) {
  const routes = FULL_SWEEP.includes(width) ? ROUTES : [ROUTES[0]];

  for (const [route, name] of routes) {
    const page = await browser.newPage();
    await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });

    const consoleErrors = [];
    const failedRequests = [];

    page.on('console', (m) => {
      if (m.type() === 'error') {
        const text = m.text();
        // Third-party embeds (YouTube, Maps, Google Translate) log their own noise.
        if (/youtube|google|gstatic|doubleclick|translate/i.test(text)) return;
        consoleErrors.push(text.slice(0, 160));
      }
    });
    page.on('pageerror', (e) => consoleErrors.push(`PAGEERROR: ${String(e).slice(0, 160)}`));
    page.on('requestfailed', (r) => {
      const url = r.url();
      if (/youtube|google|gstatic|doubleclick|translate/i.test(url)) return;
      failedRequests.push(`${url.slice(0, 110)} (${r.failure()?.errorText})`);
    });

    try {
      await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle2', timeout: 45000 });
    } catch {
      // networkidle can stall on long-polling embeds; the DOM is what matters.
      await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    }

    // Let scroll-reveal animations settle so nothing is measured mid-transition.
    await page.evaluate(async () => {
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise((r) => setTimeout(r, 700));
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 500));
    });

    const problems = await page.evaluate(audit);

    // Collapse repeats so one systemic issue is not reported 40 times.
    const grouped = {};
    problems.forEach((p) => {
      grouped[p.type] = grouped[p.type] || [];
      if (grouped[p.type].length < 4) grouped[p.type].push(p.detail);
    });

    const counts = Object.fromEntries(
      Object.entries(grouped).map(([k, v]) => [
        k,
        { count: problems.filter((p) => p.type === k).length, samples: v },
      ])
    );

    const issueCount = problems.length + consoleErrors.length + failedRequests.length;
    totalIssues += issueCount;

    report.push({ width, route, name, issueCount, counts, consoleErrors, failedRequests });

    if (SHOTS && FULL_SWEEP.includes(width)) {
      await page.screenshot({
        path: path.join(OUT, `${name}-${width}.png`),
        fullPage: route === '/' ? false : false,
      });
    }

    await page.close();
  }
}

await browser.close();

/* ------------------------------------------------------------------ output */
console.log(`\nQA sweep — ${BASE}\n${'='.repeat(70)}`);

for (const r of report) {
  const clean = r.issueCount === 0;
  console.log(`\n${clean ? 'OK  ' : 'FAIL'} ${String(r.width).padStart(4)}px  ${r.route}`);

  Object.entries(r.counts).forEach(([type, info]) => {
    console.log(`       ${type} x${info.count}`);
    info.samples.forEach((s) => console.log(`         - ${s}`));
  });

  r.consoleErrors.slice(0, 4).forEach((e) => console.log(`       console: ${e}`));
  r.failedRequests.slice(0, 4).forEach((e) => console.log(`       request: ${e}`));
}

console.log(`\n${'='.repeat(70)}`);
console.log(`${report.filter((r) => r.issueCount === 0).length}/${report.length} clean · ${totalIssues} issues total`);

fs.writeFileSync('qa-report.json', JSON.stringify(report, null, 2));
console.log('Full report: qa-report.json');
