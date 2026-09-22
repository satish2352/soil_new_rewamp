/**
 * End-to-end API check.
 *
 * Confirms two separate things for every read endpoint:
 *   1. the endpoint itself answers with the shape the app expects, and
 *   2. the page that consumes it actually issues the request and renders it.
 *
 * Write endpoints are checked statically only. Nothing is ever POSTed to them,
 * because they write into the client's live production database.
 */
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';

const API = 'https://finalapi.soilchargertechnology.com/api';
const SITE = process.argv[2]?.startsWith('http') ? process.argv[2] : 'http://127.0.0.1:5180';
const CHROME =
  process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const READ = [
  { name: 'frontproductlist', expect: (d) => Array.isArray(d.data) && d.data.length, shape: 'title, short_description, productphotopath' },
  { name: 'frontaboutuslist', expect: (d) => Array.isArray(d.data) && d.data.length, shape: 'title, content, photopath' },
  { name: 'frontvisionmissionlist', expect: (d) => Array.isArray(d.data) && d.data.length >= 2, shape: 'record_for, title, content' },
  { name: 'fronttestimonialslist', expect: (d) => Array.isArray(d.data), shape: 'title, content, language, photopath' },
  { name: 'frontsliderlist', expect: (d) => Array.isArray(d.data), shape: 'photo_one, photopath' },
];

const LOCATION = [
  { name: 'districtlist', body: 'state_id=2', expect: (d) => Array.isArray(d.data) && d.data.length },
];

const WRITE = [
  'frontenquiryadd',
  'frontinternshipadd',
  'frontjobpostingadd',
  'frontdistributorregistration',
];

// Which page must be seen calling which endpoint.
const CONSUMERS = [
  { route: '/', endpoints: ['frontproductlist', 'fronttestimonialslist', 'frontaboutuslist', 'frontvisionmissionlist', 'frontsliderlist'] },
  { route: '/products', endpoints: ['frontproductlist'] },
  { route: '/products/111', endpoints: ['frontproductlist'] },
  { route: '/about-us', endpoints: ['frontaboutuslist'] },
  { route: '/vision-mission', endpoints: ['frontvisionmissionlist'] },
];

let failures = 0;
const ok = (cond, label, detail = '') => {
  if (!cond) failures++;
  console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${label}${detail ? '  ' + detail : ''}`);
};

/* ------------------------------------------------------------ 1. endpoints */
console.log('\n1. Endpoint contracts\n');

for (const ep of READ) {
  try {
    const res = await fetch(`${API}/${ep.name}`, { signal: AbortSignal.timeout(30000) });
    const json = await res.json();
    const rows = Array.isArray(json.data) ? json.data.length : 0;
    ok(res.ok && ep.expect(json), `GET  ${ep.name}`, `${res.status} · ${rows} rows · ${ep.shape}`);
  } catch (e) {
    ok(false, `GET  ${ep.name}`, String(e.message).slice(0, 60));
  }
}

for (const ep of LOCATION) {
  try {
    const res = await fetch(`${API}/${ep.name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: ep.body,
      signal: AbortSignal.timeout(30000),
    });
    const json = await res.json();
    ok(res.ok && ep.expect(json), `POST ${ep.name}`, `${res.status} · ${json.data?.length ?? 0} rows (${ep.body})`);
  } catch (e) {
    ok(false, `POST ${ep.name}`, String(e.message).slice(0, 60));
  }
}

/* ------------------------------------------- 2. write endpoints, statically */
console.log('\n2. Write endpoints — contract only, never contacted\n');

/*
  These four endpoints write into the client's live production database, so this
  check deliberately makes NO request to them. It asserts instead that the app
  still sends the field names the legacy site sends — the part that silently
  breaks if someone renames a form field.
*/
const apiSrc = fs.readFileSync('src/lib/api.js', 'utf8');
const EXPECTED_FIELDS = {
  submitEnquiry: ['name', 'email', 'mobile', 'comment', 'details'],
};

for (const name of WRITE) {
  ok(apiSrc.includes(name), `wired  ${name}`, 'declared in src/lib/api.js');
}
for (const [fn, fields] of Object.entries(EXPECTED_FIELDS)) {
  const body = apiSrc.slice(apiSrc.indexOf(fn));
  const missing = fields.filter((f) => !body.slice(0, 400).includes(f));
  ok(missing.length === 0, `payload ${fn}`, missing.length ? `missing ${missing}` : fields.join(', '));
}

/* ------------------------------------------------- 3. pages call the APIs */
console.log('\n3. Pages actually call their endpoints\n');

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox'],
});

for (const { route, endpoints } of CONSUMERS) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const called = new Set();
  page.on('request', (r) => {
    const m = r.url().match(/\/api\/([a-z]+)/i);
    if (m) called.add(m[1]);
  });

  await page.goto(SITE + route, { waitUntil: 'networkidle2', timeout: 45000 }).catch(() => {});
  await page.evaluate(async () => {
    for (let y = 0; y < 9000; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 70));
    }
    await new Promise((r) => setTimeout(r, 1200));
  });

  const missed = endpoints.filter((e) => !called.has(e));
  ok(missed.length === 0, `${route.padEnd(16)} calls ${endpoints.length} endpoint(s)`, missed.length ? `missing: ${missed.join(', ')}` : `[${[...called].join(', ')}]`);

  await page.close();
}

/* ------------------------------------------- 4. rendered from live payload */
console.log('\n4. Live payload reaches the DOM\n');

const checks = [
  { route: '/products', sel: 'article h3', min: 21, label: 'product names rendered' },
  { route: '/about-us', sel: '.rich p', min: 3, label: 'founder story paragraphs' },
  { route: '/vision-mission', sel: 'li', min: 6, label: 'vision + mission bullets' },
];

for (const c of checks) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(SITE + c.route, { waitUntil: 'networkidle2', timeout: 45000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 1500));
  const n = await page.evaluate((sel) => document.querySelectorAll(sel).length, c.sel);
  ok(n >= c.min, `${c.route.padEnd(16)} ${c.label}`, `${n} found (min ${c.min})`);
  await page.close();
}

await browser.close();

console.log(`\n${failures === 0 ? 'PASS' : 'FAIL'} — ${failures} problem(s)\n`);
process.exitCode = failures ? 1 : 0;
