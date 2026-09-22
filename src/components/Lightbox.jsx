import { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEscape, useScrollLock } from '../hooks';
import { useI18n } from '../lib/i18n';
import { EASE } from '../lib/motion-react';
import Icon from './Icon';

/**
 * Full-screen viewer for gallery photos and videos.
 * Arrow keys move between items; Escape closes.
 */
export default function Lightbox({ items, index, onClose, onNavigate }) {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const open = index != null && index >= 0;

  useScrollLock(open);
  useEscape(onClose, open);

  const move = useCallback(
    (dir) => {
      if (!items.length) return;
      onNavigate((index + dir + items.length) % items.length);
    },
    [index, items.length, onNavigate]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') move(1);
      if (e.key === 'ArrowLeft') move(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, move]);

  if (typeof document === 'undefined') return null;
  const item = open ? items[index] : null;

  return createPortal(
    <AnimatePresence>
      {open && item && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={item.type === 'video' ? t('gallery.playVideo') : t('gallery.openImage')}
          className="fixed inset-0 z-[120] flex flex-col bg-deep/96 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
        >
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <span className="text-fluid-sm text-cream/65 tabular-nums">
              {index + 1} / {items.length}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label={t('cta.close')}
              className="grid h-11 w-11 place-items-center rounded-full border border-cream/25
                         text-cream transition-colors hover:bg-cream/12"
            >
              <Icon name="close" size={22} />
            </button>
          </div>

          <div className="relative flex grow items-center justify-center px-3 pb-6 sm:px-16">
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => move(-1)}
                aria-label={t('testimonial.previous')}
                className="absolute left-2 z-10 grid h-12 w-12 place-items-center rounded-full
                           border border-cream/25 text-cream transition-colors hover:bg-cream/12 sm:left-4"
              >
                <Icon name="chevronLeft" size={24} />
              </button>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={item.key ?? index}
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                transition={{ duration: reduce ? 0.18 : 0.35, ease: EASE }}
                className="flex max-h-full w-full max-w-5xl items-center justify-center"
              >
                {item.type === 'video' ? (
                  <div className="w-full overflow-hidden rounded-2xl bg-black shadow-lift" style={{ aspectRatio: '16 / 9' }}>
                    <iframe
                      src={`${item.embedUrl}?autoplay=1&rel=0`}
                      title={t('gallery.playVideo')}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                      className="h-full w-full border-0"
                    />
                  </div>
                ) : (
                  <img
                    src={item.src}
                    alt={item.alt || ''}
                    className="max-h-[78vh] w-auto max-w-full rounded-2xl object-contain shadow-lift"
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {items.length > 1 && (
              <button
                type="button"
                onClick={() => move(1)}
                aria-label={t('testimonial.next')}
                className="absolute right-2 z-10 grid h-12 w-12 place-items-center rounded-full
                           border border-cream/25 text-cream transition-colors hover:bg-cream/12 sm:right-4"
              >
                <Icon name="chevronRight" size={24} />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
