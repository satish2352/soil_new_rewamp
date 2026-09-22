import manifest from '../data/image-manifest.json';

/**
 * Where CMS images are loaded from.
 *
 * Set with VITE_IMAGE_SOURCE in .env:
 *
 *   api-first    ask the API, fall back to the local mirror   (default)
 *   api          API only — no fallback, no local files used
 *   mirror-first serve the mirror, fall back to the API
 *
 * Context: every upload under finalapi.soilchargertechnology.com currently
 * returns 404 — on the live production site as well as here — so `api` alone
 * renders no CMS imagery at all. `scripts/restore-images.mjs` mirrors the
 * originals from the Internet Archive into /img/cms/ as a stopgap.
 *
 * `api-first` is the default because the API is the system of record: the app
 * always asks it first, so the day the uploads are restored the live files take
 * over on their own and the mirror can be deleted.
 */
export const IMAGE_SOURCE = import.meta.env?.VITE_IMAGE_SOURCE || 'api-first';

/** Local mirror path for a live CMS url, or null if it was never mirrored. */
export function localCopy(url) {
  if (!url || IMAGE_SOURCE === 'api') return null;
  if (manifest[url]) return manifest[url];

  // The API occasionally returns a different host spelling for the same file;
  // fall back to matching on folder + filename.
  const m = String(url).match(/uploads\/web\/([^/]+)\/([^/?#]+)$/);
  if (!m) return null;

  const suffix = `/img/cms/${m[1]}/${m[2]}`;
  return Object.values(manifest).includes(suffix) ? suffix : null;
}

/** True when a CMS url has a mirrored copy behind it. */
export const hasLocalCopy = (url) => Boolean(localCopy(url));

/**
 * The ordered list of urls to try for one image.
 * `SmartImage` walks it, moving to the next on error.
 */
export function imageChain(url) {
  if (!url) return [];

  const mirror = localCopy(url);

  switch (IMAGE_SOURCE) {
    case 'api':
      return [url];
    case 'mirror-first':
      return mirror ? [mirror, url] : [url];
    case 'api-first':
    default:
      return mirror ? [url, mirror] : [url];
  }
}

export default localCopy;
