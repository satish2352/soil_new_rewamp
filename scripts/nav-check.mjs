import puppeteer from 'puppeteer-core';

/**
 * Client-side navigation check.
 *
 * The page transition wraps <Routes> in AnimatePresence with mode="wait", which
 * introduces two things that can break silently:
 *
 *  1. the outgoing page is still mounted during the exit, so a <Routes> reading
 *     location from context would re-render it as the *new* route mid-exit, and
 *  2. the scroll restore now hangs off the exit completing rather than off the
 *     location changing, so a mistake leaves the new page scrolled half-way
 *     down where the previous one was.
 *
 * Neither shows up in a build or in a screenshot of a directly-loaded URL.
 * This drives the app the way a visitor does: scroll down, click a link, and
 * check where you land.
 */
const BASE = process.env.QA_BASE || 'http://127.0.0.1:5180';

const HOPS = [
  ['Products', '/products', 'Our Products'],
  ['Blog', '/blogs', 'Latest News'],
  ['Career', '/careers', 'Career'],
  ['Contact', '/contact', 'Contact'],
  ['Home', '/', 'SOIL Is HEALTHIER'],
];

const br = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox', '--hide-scrollbars'],
});

const p = await br.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
p.on('console', (m) => {
  if (m.type() === 'error' && !/404|Failed to load resource|ERR_/.test(m.text())) {
    errors.push(m.text().slice(0, 200));
  }
});

await p.setViewport({ width: 1440, height: 900 });
await p.goto(BASE, { waitUntil: 'domcontentloaded' });
await new Promise((r) => setTimeout(r, 2000));

let fails = 0;

for (const [label, expectPath, expectText] of HOPS) {
  // Scroll away from the top first — that is what makes a broken scroll
  // restore visible.
  await p.evaluate(() => window.scrollTo(0, 1800));
  await new Promise((r) => setTimeout(r, 400));

  const clicked = await p.evaluate((text) => {
    const link = [...document.querySelectorAll('header nav a')].find(
      (a) => a.textContent.trim() === text
    );
    if (!link) return false;
    link.click();
    return true;
  }, label);

  if (!clicked) {
    console.log(`FAIL  no nav link labelled "${label}"`);
    fails += 1;
    continue;
  }

  // Long enough for exit (180ms) + entrance (620ms) + lazy chunk fetch.
  await new Promise((r) => setTimeout(r, 2200));

  const state = await p.evaluate(() => ({
    path: location.pathname,
    scroll: window.scrollY,
    text: document.body.innerText.slice(0, 4000),
    opacity: getComputedStyle(document.querySelector('#main > div') || document.body).opacity,
  }));

  const problems = [];
  if (state.path !== expectPath) problems.push(`path ${state.path} ≠ ${expectPath}`);
  if (state.scroll > 4) problems.push(`landed at scrollY ${state.scroll}, expected top`);
  if (!state.text.includes(expectText)) problems.push(`"${expectText}" not rendered`);
  if (Number(state.opacity) < 0.99) problems.push(`transition stuck at opacity ${state.opacity}`);

  if (problems.length) {
    fails += 1;
    console.log(`FAIL  ${label} → ${expectPath}`);
    problems.forEach((x) => console.log(`        ${x}`));
  } else {
    console.log(`OK    ${label} → ${expectPath}  (scrollY ${state.scroll})`);
  }
}

// Back/forward must work too — a transition that swallows popstate is worse
// than no transition.
await p.goBack({ waitUntil: 'domcontentloaded' });
await new Promise((r) => setTimeout(r, 1800));
const backPath = await p.evaluate(() => location.pathname);
console.log(backPath === '/contact' ? 'OK    back button → /contact' : `FAIL  back button → ${backPath}`);
if (backPath !== '/contact') fails += 1;

if (errors.length) {
  console.log(`\nJS errors during navigation (${errors.length}):`);
  [...new Set(errors)].slice(0, 5).forEach((e) => console.log('  ', e));
  fails += 1;
}

await br.close();
console.log(fails ? `\nFAIL — ${fails} problem(s)` : '\nPASS — navigation, scroll restore and transitions all correct');
