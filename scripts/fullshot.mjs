import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

/**
 * Full-page capture of one route, for reviewing a page's vertical rhythm.
 *
 * `waitUntil: 'domcontentloaded'` rather than `networkidle2`: this page loads
 * the Google Translate widget, which holds connections open, so networkidle2
 * intermittently times out — and a swallowed timeout produced a blank 900px
 * capture that looked like a rendering bug rather than a navigation one. The
 * wait is on the app actually having laid content out instead.
 */
const B = process.env.QA_BASE || 'http://127.0.0.1:5180';
const [route = '/', name = 'full', w = '1280'] = process.argv.slice(2);
fs.mkdirSync('qa-shots/dev', { recursive: true });

const br = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox', '--hide-scrollbars'],
});

const p = await br.newPage();
await p.setViewport({ width: Number(w), height: 900 });
await p.goto(B + route, { waitUntil: 'domcontentloaded', timeout: 60000 });

await p
  .waitForFunction(() => document.documentElement.scrollHeight > window.innerHeight * 1.5, {
    timeout: 20000,
  })
  .catch(() => console.warn('! page never grew past the viewport — capture may be empty'));

await new Promise((r) => setTimeout(r, 2500));

const h = await p.evaluate(() => document.documentElement.scrollHeight);

/*
  Chrome cannot capture a single image taller than roughly 16384px — past that
  the tail of the screenshot is filled with repeated or stale tiles rather than
  failing outright, which reads as a duplicated page and sends you hunting for
  a rendering bug that does not exist. Split the capture instead.
*/
const LIMIT = 16000;
if (h <= LIMIT) {
  await p.screenshot({ path: `qa-shots/dev/${name}.png`, fullPage: true });
  console.log(`full shot ${name} — ${w}x${h}`);
} else {
  const parts = Math.ceil(h / LIMIT);
  console.log(`! ${h}px exceeds Chrome's capture limit — splitting into ${parts}`);
  for (let i = 0; i < parts; i += 1) {
    const top = i * LIMIT;
    await p.screenshot({
      path: `qa-shots/dev/${name}-${i + 1}.png`,
      clip: { x: 0, y: top, width: Number(w), height: Math.min(LIMIT, h - top) },
    });
    console.log(`  part ${i + 1}/${parts} — y ${top}..${Math.min(h, top + LIMIT)}`);
  }
}

await br.close();
