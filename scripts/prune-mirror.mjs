/**
 * Removes local mirror files that the API is serving again.
 *
 * The mirror in public/img/cms/ exists only because every upload under
 * finalapi.soilchargertechnology.com/public/uploads/web/ returns 404. It is a
 * stopgap, not a second copy to maintain: the moment the server serves a file
 * again, the local duplicate should go, so the API stays the single source of
 * truth for that image.
 *
 * This asks the server for every url in image-manifest.json and deletes the
 * local copy of each one that comes back as a real image, then rewrites the
 * manifest to only the files still missing upstream. Anything the server does
 * not serve is left exactly where it is.
 *
 * A url is only treated as recovered on HTTP 200 + an image content-type + a
 * non-empty body. This server answers some failures with 200, so status alone
 * is not enough to delete a file on.
 *
 * Usage:
 *   node scripts/prune-mirror.mjs           report only, deletes nothing
 *   node scripts/prune-mirror.mjs --apply   delete the recovered copies
 */
import fs from 'node:fs';
import path from 'node:path';

const APPLY = process.argv.includes('--apply');
const MANIFEST = path.resolve('src/data/image-manifest.json');
const PUBLIC = path.resolve('public');
const CONCURRENCY = 8;

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const urls = Object.keys(manifest);

if (!urls.length) {
  console.log('Manifest is empty — nothing mirrored, nothing to prune.');
  process.exit(0);
}

/** Resolves to true only when the server returns a real image body. */
async function isServed(url) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(25000) });
      if (res.status !== 200) return false;
      const type = res.headers.get('content-type') || '';
      const body = await res.arrayBuffer();
      return /^image\//i.test(type) && body.byteLength > 0;
    } catch {
      /* transient — one retry, then treat as not served */
    }
  }
  return false;
}

const recovered = [];
const stillMissing = [];
const queue = [...urls];

async function worker() {
  while (queue.length) {
    const url = queue.shift();
    (await isServed(url) ? recovered : stillMissing).push(url);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

console.log(`\nProbed ${urls.length} mirrored images against the API\n`);
console.log(`  served by the API again : ${recovered.length}`);
console.log(`  still 404 upstream      : ${stillMissing.length}\n`);

if (!recovered.length) {
  console.log('Nothing to prune — the API is not serving any mirrored file yet.');
  console.log('The mirror is still carrying all of the CMS imagery.\n');
  process.exit(0);
}

for (const url of recovered) console.log(`  recovered  ${url.replace(/.*uploads\/web\//, '')}`);

if (!APPLY) {
  console.log(`\nReport only. Re-run with --apply to delete these ${recovered.length} local copies.\n`);
  process.exit(0);
}

let deleted = 0;
for (const url of recovered) {
  // Manifest values are public-root paths ("/img/cms/product/x.png").
  const file = path.join(PUBLIC, manifest[url].replace(/^\//, ''));
  try {
    fs.rmSync(file);
    deleted++;
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
  delete manifest[url];
}

// Drop any folder the pruning emptied, so public/img/cms/ does not keep husks.
const root = path.join(PUBLIC, 'img', 'cms');
if (fs.existsSync(root)) {
  for (const dir of fs.readdirSync(root)) {
    const full = path.join(root, dir);
    if (fs.statSync(full).isDirectory() && !fs.readdirSync(full).length) fs.rmdirSync(full);
  }
  if (!fs.readdirSync(root).length) fs.rmdirSync(root);
}

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');

console.log(`\nDeleted ${deleted} local copies.`);
console.log(`Manifest now holds ${Object.keys(manifest).length} still-missing files.`);
if (!Object.keys(manifest).length) {
  console.log('\nThe mirror is empty — the API is serving everything again.');
  console.log('public/img/cms/ and this script can be removed.\n');
}
