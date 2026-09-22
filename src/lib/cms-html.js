/**
 * Cleans rich text coming from the live CMS.
 *
 * The editor wraps every paragraph in nested `<span style="font-family:Georgia;
 * font-size:12pt">` and friends. Left alone those inline styles override the
 * type system, so API-sourced copy would render differently from the extracted
 * snapshot. This mirrors the cleaning in scripts/extract-content.mjs so both
 * paths produce the same markup.
 *
 * It also drops anything script-like. The CMS is trusted, but this HTML is
 * injected with dangerouslySetInnerHTML, so it should not be a path to script
 * execution if that ever changes.
 */

const VOID_TAGS = new Set(['br', 'img', 'hr', 'input', 'meta', 'link', 'source', 'area', 'col']);

/** Drops orphan closing tags and closes what is left open. */
function balanceTags(html) {
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
      if (at === -1) continue;
      while (stack.length > at + 1) out.push(`</${stack.pop()}>`);
      stack.pop();
      out.push(token);
    } else {
      // <p> cannot nest; browsers auto-close, so do the same here.
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

export function cleanCmsHtml(html) {
  if (!html) return '';
  let s = String(html);

  // Anything executable goes first.
  s = s.replace(/<(script|style|iframe|object|embed)[\s\S]*?<\/\1>/gi, '');
  s = s.replace(/<(script|style|iframe|object|embed)\b[^>]*\/?>/gi, '');
  s = s.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  s = s.replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, '$1="#"');

  // Presentational wrappers the editor leaves behind.
  s = s.replace(/<span[^>]*>/gi, '').replace(/<\/span>/gi, '');
  s = s.replace(/<font[^>]*>/gi, '').replace(/<\/font>/gi, '');
  s = s.replace(/\sstyle="[^"]*"/gi, '');
  s = s.replace(/\sclass="[^"]*"/gi, '');
  s = s.replace(/\s(width|height|align|border|cellpadding|cellspacing|bgcolor)="[^"]*"/gi, '');
  s = s.replace(/<o:p>[\s\S]*?<\/o:p>/gi, '');
  s = s.replace(/<!--[\s\S]*?-->/g, '');

  // Wrappers left empty once the styling is gone.
  s = s.replace(/<p>\s*(?:&nbsp;|\s)*<\/p>/gi, '');
  s = s.replace(/<div>\s*<\/div>/gi, '');

  s = s.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n');

  return balanceTags(s.trim()).trim();
}

export default cleanCmsHtml;
