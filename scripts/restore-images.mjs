/**
 * Recovers the site's CMS images from the Internet Archive.
 *
 * Every upload under finalapi.soilchargertechnology.com/public/uploads/web/
 * currently returns HTTP 404 — on the live production site as well as here.
 * The Wayback Machine holds captures of all of them, so this pulls the original
 * files back down into public/img/cms/, preserving the CMS folder layout.
 *
 * These are the client's own images, fetched from a public archive of their own
 * site. They are a stand-in until the uploads are restored on the server: the
 * app still requests the live URL first and only falls back to the local copy,
 * so the moment the server is fixed it serves the live file again.
 *
 * Usage: node scripts/restore-images.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const FOLDERS = [
  'product',
  'blog',
  'gallaryphoto',
  'coverphoto',
  'testimonials',
  'aboutus',
];

const CDX = 'http://web.archive.org/cdx/search/cdx';
const OUT = path.resolve('public/img/cms');
const CACHE = path.resolve('.cache');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** The archive rate-limits; retry with a widening gap. */
async function fetchWithRetry(url, { tries = 4, binary = false } = {}) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(60000) });
      if (res.ok) return binary ? Buffer.from(await res.arrayBuffer()) : await res.text();
      if (res.status === 404) return null;
    } catch {
      /* fall through to the retry */
    }
    await sleep(1500 * (i + 1));
  }
  return null;
}

async function listCaptures(folder) {
  const cached = path.join(CACHE, `cdx_${folder}.txt`);
  if (fs.existsSync(cached)) {
    const txt = fs.readFileSync(cached, 'utf8');
    if (/^\d{14} /m.test(txt)) return parse(txt);
  }

  const url =
    `${CDX}?url=finalapi.soilchargertechnology.com/public/uploads/web/${folder}/*` +
    `&collapse=urlkey&output=text&fl=timestamp,original,statuscode`;
  const txt = await fetchWithRetry(url);
  if (!txt) return [];
  fs.mkdirSync(CACHE, { recursive: true });
  fs.writeFileSync(cached, txt);
  return parse(txt);
}

function parse(txt) {
  return txt
    .split('\n')
    .map((l) => l.trim().split(/\s+/))
    .filter((p) => /^\d{14}$/.test(p[0]) && p[1])
    .map(([timestamp, original, status]) => ({ timestamp, original, status }));
}

let ok = 0;
let failed = 0;
const manifest = {};

for (const folder of FOLDERS) {
  const captures = await listCaptures(folder);
  const dir = path.join(OUT, folder);
  fs.mkdirSync(dir, { recursive: true });
  console.log(`\n${folder} — ${captures.length} archived`);

  for (const cap of captures) {
    const file = decodeURIComponent(cap.original.split('/').pop().split('?')[0]);
    if (!file || /\.(php|html?)$/i.test(file)) continue;

    const dest = path.join(dir, file);
    const rel = `/img/cms/${folder}/${file}`;

    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      manifest[cap.original] = rel;
      ok++;
      continue;
    }

    // `id_` returns the original bytes without the archive's toolbar injection.
    const raw = `https://web.archive.org/web/${cap.timestamp}id_/${cap.original}`;
    const buf = await fetchWithRetry(raw, { binary: true });

    if (!buf || buf.length < 1000) {
      console.log(`  MISS ${file}`);
      failed++;
      continue;
    }
    // An HTML error page would start with '<'.
    if (buf[0] === 0x3c) {
      console.log(`  HTML ${file}`);
      failed++;
      continue;
    }

    fs.writeFileSync(dest, buf);
    manifest[cap.original] = rel;
    ok++;
    console.log(`  ok   ${file} (${Math.round(buf.length / 1024)} KB)`);
    await sleep(250);
  }
}

fs.mkdirSync(path.resolve('src/data'), { recursive: true });
fs.writeFileSync(
  path.resolve('src/data/image-manifest.json'),
  JSON.stringify(manifest, null, 2) + '\n'
);

console.log(`\nrecovered ${ok} · failed ${failed}`);
console.log('manifest: src/data/image-manifest.json');
