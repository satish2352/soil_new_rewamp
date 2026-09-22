import { useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { whatsapp } from '../data/site';
import { useI18n } from '../lib/i18n';
import { useEscape } from '../hooks';
import { EASE } from '../lib/motion-react';
import Icon from './Icon';

/**
 * Floating WhatsApp contact. Same three destinations and the same numbers the
 * live site dials — SCT Consulting, SCT Sales, SCT Management — in a modern
 * expanding stack instead of a hover dropup.
 */
export default function WhatsAppWidget() {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const ref = useRef(null);

  useEscape(() => setOpen(false), open);

  return (
    <div
      ref={ref}
      className="fixed bottom-5 right-4 z-[95] flex flex-col items-end gap-3 sm:bottom-7 sm:right-6"
      onBlur={(e) => {
        if (!ref.current?.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <AnimatePresence>
        {open && (
          <motion.ul
            className="flex flex-col items-end gap-2.5"
            initial="hidden"
            animate="show"
            exit="hidden"
            variants={{
              show: { transition: { staggerChildren: 0.06, staggerDirection: -1 } },
              hidden: { transition: { staggerChildren: 0.04 } },
            }}
          >
            {whatsapp.map((entry) => (
              <motion.li
                key={entry.number}
                variants={{
                  hidden: reduce ? { opacity: 0 } : { opacity: 0, x: 24, scale: 0.92 },
                  show: { opacity: 1, x: 0, scale: 1 },
                }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <a
                  href={`https://wa.me/${entry.number}?text=Hello`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-full border border-line bg-canvas/95 py-2 pl-4 pr-2
                             shadow-lift backdrop-blur-md transition-colors hover:border-[#25D366]/50"
                >
                  <span className="text-fluid-xs font-semibold text-ink whitespace-nowrap">
                    {entry.label}
                  </span>
                  <span
                    className="grid h-9 w-9 place-items-center rounded-full bg-[#25D366] text-white
                               transition-transform duration-300 group-hover:scale-105"
                  >
                    <Icon name="whatsapp" size={20} />
                  </span>
                </a>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? t('cta.close') : t('cta.whatsapp')}
        className="relative grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white
                   shadow-lift transition-transform duration-300 ease-organic hover:scale-105 active:scale-95"
      >
        {/* Slow attention pulse; suppressed under reduced motion by the global rule. */}
        {!open && (
          <span
            aria-hidden="true"
            className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-20"
            style={{ animationDuration: '2.6s' }}
          />
        )}
        <span className="relative">
          <Icon name={open ? 'close' : 'whatsapp'} size={open ? 24 : 28} />
        </span>
      </button>
    </div>
  );
}
