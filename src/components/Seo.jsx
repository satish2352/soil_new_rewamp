import { useEffect } from 'react';

const ORIGIN = 'https://www.soilchargertechnology.com';

function upsert(selector, attrs) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(attrs.tag || 'meta');
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'tag' || v == null) return;
    el.setAttribute(k, v);
  });
  return el;
}

/**
 * Per-route title, description, canonical and Open Graph tags.
 * Content is always drawn from real page data — never generated filler.
 */
export default function Seo({ title, description, path, image, type = 'website' }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | Soil Charger Technology` : 'Soil Charger Technology';
    document.title = fullTitle;

    if (description) {
      upsert('meta[name="description"]', { tag: 'meta', name: 'description', content: description });
      upsert('meta[property="og:description"]', {
        tag: 'meta',
        property: 'og:description',
        content: description,
      });
    }

    upsert('meta[property="og:title"]', { tag: 'meta', property: 'og:title', content: fullTitle });
    upsert('meta[property="og:type"]', { tag: 'meta', property: 'og:type', content: type });

    if (path) {
      const url = `${ORIGIN}${path}`;
      upsert('link[rel="canonical"]', { tag: 'link', rel: 'canonical', href: url });
      upsert('meta[property="og:url"]', { tag: 'meta', property: 'og:url', content: url });
    }

    if (image) {
      upsert('meta[property="og:image"]', { tag: 'meta', property: 'og:image', content: image });
    }
  }, [title, description, path, image, type]);

  return null;
}
