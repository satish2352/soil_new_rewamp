import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useI18n } from '../lib/i18n';
import { useEscape } from '../hooks';
import { EASE } from '../lib/motion-react';
import Icon from './Icon';

/**
 * English / Marathi / Hindi switch.
 *
 * Selecting a language sets the UI strings we author *and* drives the Google
 * Translate widget the existing site relies on, so CMS content (products, blogs,
 * about) keeps translating exactly as it does today.
 */
export default function LanguageSelector({ dark = false, inline = false }) {
  const { lang, setLang, langs, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEscape(() => setOpen(false), open);

  // Inside the mobile sheet the options are always visible — no popover needed.
  if (inline) {
    return (
      <div>
        <span className="mb-2 block text-fluid-xs font-semibold uppercase tracking-[0.16em] text-muted">
          {t('nav.language')}
        </span>
        <div className="grid grid-cols-3 gap-2">
          {langs.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLang(l.code)}
              aria-pressed={lang === l.code}
              lang={l.code}
              className={`min-h-[44px] rounded-xl border px-2 text-fluid-xs font-semibold transition-colors
                          ${
                            lang === l.code
                              ? 'border-primary bg-primary text-cream'
                              : 'border-line bg-surface text-ink/75 hover:border-primary/40'
                          }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const current = langs.find((l) => l.code === lang) || langs[0];

  return (
    <div
      ref={ref}
      className="relative"
      onBlur={(e) => {
        if (!ref.current?.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t('nav.language')}
        className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-3 py-2
                    text-fluid-xs font-semibold transition-colors
                    ${
                      dark
                        ? 'border-white/30 text-cream hover:bg-white/10'
                        : 'border-line text-ink hover:bg-primary/8'
                    }`}
      >
        <Icon name="globe" size={16} />
        <span className="hidden sm:inline">{current.label}</span>
        <span className="sm:hidden uppercase">{current.code}</span>
        <Icon
          name="chevronDown"
          size={14}
          className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label={t('nav.language')}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-2xl
                       border border-line bg-canvas/97 p-1.5 shadow-lift backdrop-blur-md"
          >
            {langs.map((l) => (
              <li key={l.code} role="option" aria-selected={lang === l.code}>
                <button
                  type="button"
                  lang={l.code}
                  onClick={() => {
                    setLang(l.code);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl px-3.5 py-2.5
                              text-fluid-sm transition-colors
                              ${
                                lang === l.code
                                  ? 'bg-primary/10 font-semibold text-primary'
                                  : 'text-ink/80 hover:bg-cream'
                              }`}
                >
                  {l.label}
                  {lang === l.code && <Icon name="check" size={16} />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* Mount point the Google Translate script attaches to. Hidden via CSS —
          it is driven programmatically from lib/i18n. */}
      <div id="google_translate_element" aria-hidden="true" />
    </div>
  );
}
