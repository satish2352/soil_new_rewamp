import { createPortal } from 'react-dom';
import { useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEscape, useFocusTrap, useScrollLock } from '../hooks';
import { useI18n } from '../lib/i18n';
import Icon from './Icon';
import { EASE } from '../lib/motion';

/**
 * Accessible dialog: focus trap, Escape to close, scroll lock, backdrop click.
 * Replaces the Bootstrap modals the legacy site used for every form.
 */
export default function Modal({ open, onClose, title, children, size = 'md', footer }) {
  const panelRef = useRef(null);
  const reduce = useReducedMotion();
  const { t } = useI18n();

  useScrollLock(open);
  useEscape(onClose, open);
  useFocusTrap(panelRef, open);

  const widths = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
          <motion.button
            type="button"
            aria-label={t('cta.close')}
            onClick={onClose}
            className="absolute inset-0 h-full w-full cursor-default bg-deep/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            className={`relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden
                        rounded-t-[1.75rem] bg-canvas shadow-lift sm:rounded-[1.5rem]
                        ${widths[size]} sm:mx-gutter`}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: reduce ? 0.2 : 0.4, ease: EASE }}
          >
            <header className="flex items-start justify-between gap-4 border-b border-line bg-cream/70 px-5 py-4 sm:px-7">
              <h2 className="font-display text-fluid-xl text-deep">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label={t('cta.close')}
                className="-mr-1 -mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full
                           text-muted transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <Icon name="close" size={20} />
              </button>
            </header>

            <div className="grow overflow-y-auto overscroll-contain px-5 py-6 sm:px-7">{children}</div>

            {footer && (
              <footer className="border-t border-line bg-cream/50 px-5 py-4 sm:px-7">{footer}</footer>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
