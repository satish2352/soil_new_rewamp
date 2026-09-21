import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { company, contact, nav } from '../data/site';
import { useI18n } from '../lib/i18n';
import { useEscape, useScrollLock, useScrolled } from '../hooks';
import { EASE } from '../lib/motion';
import Icon from './Icon';
import LanguageSelector from './LanguageSelector';

/** Desktop dropdown for a nav item that has children. */
function Dropdown({ item, t }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef();
  const wrapRef = useRef(null);

  // A short close delay keeps the menu usable while the pointer crosses the gap.
  const show = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hide = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 140);
  };

  useEffect(() => () => clearTimeout(closeTimer.current), []);
  useEscape(() => setOpen(false), open);

  return (
    <li
      ref={wrapRef}
      className="relative"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={(e) => {
        if (!wrapRef.current?.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      {item.to ? (
        <NavLink
          to={item.to}
          className={({ isActive }) =>
            `nav-link inline-flex items-center gap-1.5 ${isActive ? 'is-active' : ''}`
          }
          aria-expanded={open}
        >
          {t(`nav.${item.key}`)}
          <Icon name="chevronDown" size={15} className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
        </NavLink>
      ) : (
        <button
          type="button"
          className="nav-link inline-flex items-center gap-1.5"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {t(`nav.${item.key}`)}
          <Icon name="chevronDown" size={15} className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="absolute left-1/2 top-full z-50 mt-2 w-60 -translate-x-1/2 overflow-hidden
                       rounded-2xl border border-line bg-canvas/97 p-1.5 shadow-lift backdrop-blur-md"
          >
            {item.children.map((child) => (
              <li key={child.key}>
                <NavLink
                  to={child.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-fluid-sm text-ink/80 transition-colors
                             hover:bg-primary/8 hover:text-primary"
                >
                  {t(`nav.${child.key}`)}
                </NavLink>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );
}

export default function Header({ onEnquiry }) {
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);
  const scrolled = useScrolled(16);
  const location = useLocation();

  useScrollLock(menuOpen);
  useEscape(() => setMenuOpen(false), menuOpen);

  // Close the mobile sheet whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
    setOpenGroup(null);
  }, [location.pathname, location.search, location.hash]);

  return (
    <>
      <a href="#main" className="sr-only-focusable btn-primary fixed left-4 top-4 z-[200]">
        {t('nav.skip')}
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-[90] transition-all duration-500 ease-organic
                    ${
                      scrolled
                        ? 'border-b border-line/80 bg-canvas/88 backdrop-blur-xl shadow-soft'
                        : 'bg-gradient-to-b from-deep/45 to-transparent'
                    }`}
      >
        {/* Utility strip — the contact details the legacy site kept in a top bar. */}
        <div
          className={`hidden overflow-hidden border-b transition-all duration-500 lg:block
                      ${scrolled ? 'max-h-0 border-transparent opacity-0' : 'max-h-12 border-white/15 opacity-100'}`}
        >
          <div className="shell flex items-center justify-between py-2 text-fluid-xs text-cream/85">
            <a
              href={`mailto:${contact.emails[0].address}`}
              className="inline-flex min-h-[36px] items-center gap-2 transition-colors hover:text-sun"
            >
              <Icon name="mail" size={14} />
              {contact.emails[0].address}
            </a>
            <div className="flex items-center gap-5">
              {contact.phones.map((p) => (
                <a
                  key={p.tel}
                  href={`tel:${p.tel}`}
                  className="inline-flex min-h-[36px] items-center gap-2 transition-colors hover:text-sun"
                >
                  <Icon name="phone" size={14} />
                  {p.display}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="shell flex h-[var(--header-h)] items-center justify-between gap-4">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2.5"
            aria-label={`${company.name} — ${t('nav.home')}`}
          >
            <img
              src="/img/brand/logo-mark.png"
              alt=""
              width="44"
              height="44"
              className="h-10 w-10 rounded-full bg-white/90 object-contain p-1 shadow-soft sm:h-11 sm:w-11"
            />
            <span
              className={`font-display text-[0.95rem] font-semibold leading-tight transition-colors sm:text-fluid-lg
                          ${scrolled ? 'text-deep' : 'text-cream'}`}
            >
              Soil Charger
              <span className="block text-[0.7em] font-normal tracking-[0.14em] opacity-80">
                TECHNOLOGY
              </span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav aria-label="Main" className="hidden xl:block">
            <ul
              className={`flex items-center gap-1 ${scrolled ? 'text-ink' : 'text-cream'}`}
              data-scrolled={scrolled}
            >
              {nav.map((item) =>
                item.children ? (
                  <Dropdown key={item.key} item={item} t={t} />
                ) : (
                  <li key={item.key}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
                    >
                      {t(`nav.${item.key}`)}
                    </NavLink>
                  </li>
                )
              )}
            </ul>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSelector dark={!scrolled} />

            <button
              type="button"
              onClick={onEnquiry}
              className="btn-accent hidden !px-5 !py-2.5 text-fluid-xs lg:inline-flex"
            >
              {t('cta.sendEnquiry')}
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t('nav.menu')}
              aria-expanded={menuOpen}
              className={`grid h-11 w-11 place-items-center rounded-full border transition-colors xl:hidden
                          ${
                            scrolled
                              ? 'border-line text-ink hover:bg-primary/8'
                              : 'border-white/30 text-cream hover:bg-white/10'
                          }`}
            >
              <Icon name="menu" size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile / tablet full-screen sheet */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[110] xl:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div
              className="absolute inset-0 bg-deep/60 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={t('nav.menu')}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: EASE }}
              className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-canvas shadow-lift"
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <span className="font-display text-fluid-lg text-deep">{company.name}</span>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label={t('nav.close')}
                  className="grid h-11 w-11 place-items-center rounded-full text-muted hover:bg-primary/8 hover:text-primary"
                >
                  <Icon name="close" size={22} />
                </button>
              </div>

              <nav aria-label="Mobile" className="grow overflow-y-auto overscroll-contain px-3 py-4">
                <ul className="space-y-1">
                  {nav.map((item) => {
                    const label = t(`nav.${item.key}`);
                    if (!item.children) {
                      return (
                        <li key={item.key}>
                          <NavLink
                            to={item.to}
                            className={({ isActive }) =>
                              `flex min-h-[52px] items-center rounded-xl px-4 text-fluid-base font-medium transition-colors
                               ${isActive ? 'bg-primary/10 text-primary' : 'text-ink hover:bg-cream'}`
                            }
                          >
                            {label}
                          </NavLink>
                        </li>
                      );
                    }

                    const expanded = openGroup === item.key;
                    return (
                      <li key={item.key}>
                        <button
                          type="button"
                          onClick={() => setOpenGroup(expanded ? null : item.key)}
                          aria-expanded={expanded}
                          className="flex min-h-[52px] w-full items-center justify-between rounded-xl px-4
                                     text-fluid-base font-medium text-ink transition-colors hover:bg-cream"
                        >
                          <span>{label}</span>
                          <Icon
                            name="chevronDown"
                            size={18}
                            className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
                          />
                        </button>

                        <AnimatePresence initial={false}>
                          {expanded && (
                            <motion.ul
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: EASE }}
                              className="overflow-hidden pl-3"
                            >
                              {item.to && (
                                <li>
                                  <NavLink
                                    to={item.to}
                                    className="flex min-h-[46px] items-center rounded-lg border-l-2 border-line px-4
                                               text-fluid-sm text-muted hover:border-primary hover:text-primary"
                                  >
                                    {t('cta.viewAll')}
                                  </NavLink>
                                </li>
                              )}
                              {item.children.map((child) => (
                                <li key={child.key}>
                                  <NavLink
                                    to={child.to}
                                    className="flex min-h-[46px] items-center rounded-lg border-l-2 border-line px-4
                                               text-fluid-sm text-ink/75 hover:border-primary hover:text-primary"
                                  >
                                    {t(`nav.${child.key}`)}
                                  </NavLink>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="space-y-3 border-t border-line bg-cream/60 px-5 py-5">
                <LanguageSelector inline />
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEnquiry?.();
                  }}
                  className="btn-accent w-full"
                >
                  {t('cta.sendEnquiry')}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  {contact.phones.map((p) => (
                    <a key={p.tel} href={`tel:${p.tel}`} className="btn-ghost !px-3 text-fluid-xs">
                      <Icon name="phone" size={15} />
                      <span className="truncate">{p.display}</span>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
