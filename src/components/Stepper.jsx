import { motion } from 'framer-motion';
import { useI18n } from '../lib/i18n';
import { EASE } from '../lib/motion-react';
import Icon from './Icon';

/**
 * Progress indicator for the multi-step career forms.
 * Compact on mobile (a bar plus "Step n of m"), full rail from sm upward.
 */
export default function Stepper({ steps, current, onJump }) {
  const { t } = useI18n();
  const pct = ((current + 1) / steps.length) * 100;

  return (
    <div className="mb-8">
      {/* Mobile */}
      <div className="sm:hidden">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-fluid-sm font-semibold text-deep wrap-anywhere">
            {steps[current]}
          </span>
          <span className="shrink-0 text-fluid-xs text-muted tabular-nums">
            {t('career.step')} {current + 1} {t('career.of')} {steps.length}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-line" role="presentation">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.45, ease: EASE }}
          />
        </div>
      </div>

      {/* Desktop */}
      <ol className="hidden items-center gap-2 sm:flex">
        {steps.map((label, i) => {
          const done = i < current;
          const active = i === current;
          const reachable = i <= current;

          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => reachable && onJump?.(i)}
                disabled={!reachable}
                aria-current={active ? 'step' : undefined}
                className={`flex min-h-[44px] items-center gap-2.5 rounded-full px-3 py-1.5 text-left
                            transition-colors duration-300 disabled:cursor-default
                            ${reachable ? 'hover:bg-primary/8' : ''}`}
              >
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-fluid-xs
                              font-semibold transition-colors duration-300
                              ${
                                done
                                  ? 'border-primary bg-primary text-cream'
                                  : active
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-line bg-surface text-muted'
                              }`}
                >
                  {done ? <Icon name="check" size={15} strokeWidth={2.6} /> : i + 1}
                </span>
                <span
                  className={`hidden text-fluid-xs font-medium lg:block wrap-anywhere
                              ${active ? 'text-deep' : 'text-muted'}`}
                >
                  {label}
                </span>
              </button>

              {i < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`h-px grow transition-colors duration-500
                              ${done ? 'bg-primary/50' : 'bg-line'}`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
