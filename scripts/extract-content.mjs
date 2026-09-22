/**
 * Extracts content from the crawled legacy site into src/data/*.json.
 *
 * Everything written here comes from the live site or the live API — nothing is authored.
 * Re-run with:  node scripts/extract-content.mjs <crawlDir>
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CRAWL =
  process.argv[2] ||
  'C:/Users/MYPC~1/AppData/Local/Temp/claude/C--Users-My-Pc-Desktop-New-folder/89008444-b40b-4f2b-a1e6-181c95a971b0/scratchpad/crawl';
const OUT = path.join(ROOT, 'src', 'data');

const read = (p) => fs.readFileSync(path.join(CRAWL, p), 'utf8');
const readJSON = (p) => JSON.parse(read(p));
const exists = (p) => fs.existsSync(path.join(CRAWL, p));

function write(name, data) {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, name), JSON.stringify(data, null, 2) + '\n', 'utf8');
  const n = Array.isArray(data) ? data.length : Object.keys(data).length;
  console.log(`  ${name.padEnd(22)} ${n} entries`);
}

/** Decode the HTML entities the legacy CMS emits. */
function decode(s = '') {
  return String(s)
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&ldquo;/g, '\u201c')
    .replace(/&rdquo;/g, '\u201d')
    .replace(/&hellip;/g, '\u2026')
    .replace(/&ndash;/g, '\u2013')
    .replace(/&mdash;/g, '\u2014')
    .replace(/&deg;/g, '\u00b0')
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d));
}

/**
 * Strips the legacy CMS inline font/colour styling but keeps semantic structure.
 * The CMS wraps every paragraph in nested <span style="font-family:Georgia..."> —
 * those fight the new type system, so the spans go and the text stays.
 */
function cleanRichText(html = '') {
  let s = String(html);
  s = s.replace(/<span[^>]*>/gi, '').replace(/<\/span>/gi, '');
  s = s.replace(/<font[^>]*>/gi, '').replace(/<\/font>/gi, '');
  s = s.replace(/\sstyle="[^"]*"/gi, '');
  s = s.replace(/\sclass="[^"]*"/gi, '');
  s = s.replace(/\s(width|height|align|border|cellpadding|cellspacing|bgcolor)="[^"]*"/gi, '');
  s = s.replace(/<o:p>[\s\S]*?<\/o:p>/gi, '');
  s = s.replace(/<!--[\s\S]*?-->/g, '');
  // Drop wrappers that carry no content once the styling is gone.
  s = s.replace(/<p>\s*(?:&nbsp;|\s)*<\/p>/gi, '');
  s = s.replace(/<div>\s*<\/div>/gi, '');
  s = s.replace(/[ \t]+/g, ' ');
  s = s.replace(/\n{3,}/g, '\n\n');
  return balanceTags(s.trim()).trim();
}

/**
 * The legacy tab panes open mid-element, so every extracted body carries closing
 * tags with no opener (and occasionally the reverse). Drop the orphans and close
 * what is left open, so the fragment is safe to inject.
 */
const VOID_TAGS = new Set(['br', 'img', 'hr', 'input', 'meta', 'link', 'source', 'area', 'col']);

function balanceTags(html = '') {
  const stack = [];
  const out = [];
  const re = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>|[^<]+/g;
  let m;
  while ((m = re.exec(html))) {
    const token = m[0];
    if (token[0] !== '<') {
      out.push(token);
      continue;
    }
    const tag = m[1].toLowerCase();
    if (VOID_TAGS.has(tag) || token.endsWith('/>')) {
      out.push(token);
      continue;
    }
    if (token[1] === '/') {
      const at = stack.lastIndexOf(tag);
      if (at === -1) continue; // orphan closer — drop it
      // Close anything left open inside before closing this one.
      while (stack.length > at + 1) out.push(`</${stack.pop()}>`);
      stack.pop();
      out.push(token);
    } else {
      // A <p> cannot nest — browsers auto-close the open one, so do it here too
      // rather than emit markup React and the parser disagree about.
      if (tag === 'p' && stack.includes('p')) {
        while (stack.length && stack[stack.length - 1] !== 'p') out.push(`</${stack.pop()}>`);
        if (stack.length) out.push(`</${stack.pop()}>`);
      }
      stack.push(tag);
      out.push(token);
    }
  }
  while (stack.length) out.push(`</${stack.pop()}>`);
  return out.join('');
}

/** Plain text from an HTML fragment, for excerpts and meta descriptions. */
function toText(html = '') {
  return decode(
    String(html)
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/(p|div|li|h[1-6])>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim();
}

const slug = (s) =>
  toText(s)
    .toLowerCase()
    .replace(/[^a-z0-9\u0900-\u097f]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70) || 'item';

console.log('Extracting from', CRAWL, '\n');

/* ------------------------------------------------------------------ products */
{
  const api = readJSON('probe_frontproductlist.json');
  const products = api.data.map((p) => {
    const title = decode(p.title || '').trim().replace(/\s+/g, ' ');
    return {
      id: p.id,
      productId: p.product_id,
      slug: slug(title),
      name: title,
      shortDescription: decode(p.short_description || '').trim(),
      longDescription: cleanRichText(p.long_description || ''),
      additionalInfo: cleanRichText(p.additional_info || ''),
      rating: p.rating || null,
      review: p.review ? { by: decode(p.review_person_name || ''), text: decode(p.review) } : null,
      image: p.productphotopath || null,
      altImage: p.photopath || null,
      legacyUrl: `https://www.soilchargertechnology.com/sub-product/${p.id}`,
    };
  });
  write('products.json', products);
}

/* --------------------------------------------------------------------- blogs */
{
  const listing = read('blogs.html');
  const ids = [...new Set([...listing.matchAll(/sub-blogs\?id=(\d+)/g)].map((m) => m[1]))];

  const blogs = ids.map((id) => {
    const file = `blog/${id}.html`;
    let title = '';
    let body = '';
    let image = null;

    if (exists(file)) {
      const html = read(file);
      // The detail page repeats the title in a tab anchor; first occurrence is the full title.
      const t = html.match(/aria-selected="true"[^>]*>\s*([^<]{3,300})</);
      const t2 = html.match(/<a[^>]*href="#blog_0"[^>]*>\s*(?:<span>)?\s*([^<]{3,300})/);
      title = decode((t?.[1] || t2?.[1] || '').trim());
      const img = html.match(/https:\/\/finalapi[^"']*uploads\/web\/blog\/[^"']+/);
      image = img ? img[0] : null;
      // Article body lives in the tab pane.
      const pane = html.match(/id="blog_0"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/);
      body = cleanRichText(pane?.[1] || '');
      // The pane opens mid-element and repeats the title + hero image; drop both,
      // they are rendered by the page chrome instead.
      body = body.replace(/^(?:\s*<\/(?:div|p|span)>)+/i, '').trim();
      body = body.replace(/<img[^>]*>/i, '').trim();
      body = body.replace(/^(?:\s*<\/?(?:div|p)>)+/i, '').trim();
      body = body.replace(/^\s*<h4>[\s\S]*?<\/h4>/i, '').trim();
      body = body.replace(/^(?:\s*<\/?(?:div|p)>)+/i, '').trim();
      // Unwrap the CMS habit of nesting <div> inside <p>, which React refuses to render.
      body = body.replace(/<p>\s*(<div[\s\S]*?)<\/p>/gi, '$1');
      body = body.replace(/<div>/gi, '<p>').replace(/<\/div>/gi, '</p>');
      body = balanceTags(body);
      body = body.replace(/<p>\s*(?:&nbsp;|\s)*<\/p>/gi, '').trim();
      body = balanceTags(body).trim();
      // Several articles open with a bare text node before the first <p>; with
      // no element of its own it collided with the paragraph below it. Promote
      // it to a lead paragraph so the type scale and spacing apply.
      body = body.replace(/^([^<]{20,}?)(?=\s*<)/, '<p class="lead">$1</p>');
    }

    // Fall back to the listing card when a detail page is unavailable.
    if (!title) {
      const card = listing.match(
        new RegExp(`sub-blogs\\?id=${id}[\\s\\S]{0,1200}?<h4><a>([^<]+)</a>`)
      );
      title = decode((card?.[1] || '').trim());
    }

    const text = toText(body);
    return {
      id: Number(id),
      slug: slug(title) + '-' + id,
      title,
      image,
      language: /[\u0900-\u097f]/.test(title) ? 'mr' : 'en',
      excerpt: text.slice(0, 220).trim() + (text.length > 220 ? '\u2026' : ''),
      html: body,
      legacyUrl: `https://www.soilchargertechnology.com/sub-blogs?id=${id}`,
    };
  });

  const usable = blogs.filter((b) => b.title);

  // The article bodies total ~150 KB. Listing pages only need titles, images and
  // excerpts, so the index ships everywhere and the bodies load per article.
  write(
    'blogs.json',
    usable.map(({ html, ...rest }) => rest)
  );
  write(
    'blog-content.json',
    Object.fromEntries(usable.map((b) => [b.id, b.html]))
  );
}

/* ------------------------------------------------------------------- gallery */
{
  const html = read('photo-gallery.html') + read('sub-photo-gallery.html');
  const photos = [
    ...new Set([...html.matchAll(/https:\/\/finalapi[^"']*uploads\/web\/gallaryphoto\/[^"']+/g)].map((m) => m[0])),
  ].map((src, i) => ({ id: i + 1, src }));
  write('gallery.json', photos);
}

/* -------------------------------------------------------------------- videos */
{
  const html = read('vedio-gallery.html') + read('sub-vedio-gallery.html');
  const ids = [...new Set([...html.matchAll(/youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/g)].map((m) => m[1]))];
  write(
    'videos.json',
    ids.map((youtubeId) => ({
      youtubeId,
      embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
      watchUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
      thumbnail: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
    }))
  );
}

/* ----------------------------------------------------------- about / vision */
{
  const about = readJSON('p_frontaboutuslist.json').data[0];
  write('about.json', {
    name: decode(about.title || '').trim(),
    role: 'Founder, Soil Charger Technology',
    location: 'Nashik, Maharashtra',
    image: about.photopath || null,
    html: cleanRichText(about.content || ''),
  });

  const vm = readJSON('p_frontvisionmissionlist.json').data;

  /*
    Both panels keep whatever `photopath` the CMS returns, even though these two
    files (8_gallaryphoto.jpg, 9_gallaryphoto.PNG) are currently 404 and were
    never archived, so they cannot be mirrored. Showing an unrelated gallery
    photo in their place would put a picture on the page that is not the one the
    CMS is pointing at; a panel with no image is honest, and it corrects itself
    the moment the upload is restored.
  */
  const pick = (kind) => {
    const r = vm.find((x) => (x.record_for || '').toLowerCase() === kind);
    if (!r) return null;
    const points = [...String(r.content).matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => toText(m[1]));
    return { title: decode(r.title), points, image: r.photopath || null };
  };

  write('vision-mission.json', { vision: pick('vision'), mission: pick('mission') });
}

/* -------------------------------------------------------------- testimonials */
{
  const rows = readJSON('q_fronttestimonialslist.json').data;
  write(
    'testimonials.json',
    rows.map((t) => {
      const title = decode(t.title || '').trim();
      // Legacy title packs "Name, place, place, district  phone" into one string.
      const phone = (title.match(/(\d[\d\s-]{8,})\s*$/) || [])[1];
      const withoutPhone = phone ? title.slice(0, title.lastIndexOf(phone)).trim() : title;
      const parts = withoutPhone.split(',').map((s) => s.trim()).filter(Boolean);
      return {
        id: t.id,
        name: parts[0] || withoutPhone,
        location: parts.slice(1).join(', ') || null,
        phone: phone ? phone.replace(/\s+/g, '') : null,
        quote: decode(t.content || '').trim(),
        language: (t.language || '').toLowerCase().startsWith('mar') ? 'mr' : 'en',
        image: t.photopath || null,
        rawTitle: title,
      };
    })
  );
}

/* -------------------------------------------------------------------- slider */
{
  const rows = readJSON('q_frontsliderlist.json').data;
  // Records whose photo_one is null render as blank slides on the live site.
  const usable = rows.filter((r) => r.photo_one && r.photopath && !r.photopath.endsWith('/'));

  // One cover was uploaded after the archive's last capture, so there is no
  // recoverable file for it — it would render as an empty frame in the
  // carousel. Keep only slides whose image the mirror actually holds.
  let mirrored = {};
  try {
    mirrored = JSON.parse(fs.readFileSync(path.join(OUT, 'image-manifest.json'), 'utf8'));
  } catch {
    /* mirror not built yet — keep every slide */
  }
  const hasMirror = (url) => !Object.keys(mirrored).length || Boolean(mirrored[url]);

  write(
    'slides.json',
    usable.filter((r) => hasMirror(r.photopath)).map((r) => ({ id: r.id, image: r.photopath }))
  );
}

console.log('\nDone.');
