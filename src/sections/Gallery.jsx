import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import photos from '../data/gallery.json';
import videos from '../data/videos.json';
import { useI18n } from '../lib/i18n';
import { Reveal } from '../lib/motion-react';
import { SectionHeading, SmartImage } from '../components/ui';
import Lightbox from '../components/Lightbox';
import Icon from '../components/Icon';

/**
 * Photo and video gallery.
 *
 * The legacy site had four routes for two sets of media (`/photo-gallery` and
 * `/sub-photo-gallery` were identical, as were the video pair). They collapse to
 * one gallery with two tabs; every one of the 20 photos and 51 videos is kept.
 */
export default function Gallery({ tab: controlledTab, onTabChange, limit, heading = true }) {
  const { t } = useI18n();
  const [localTab, setLocalTab] = useState('photos');
  const tab = controlledTab ?? localTab;
  const setTab = onTabChange ?? setLocalTab;

  const [lightbox, setLightbox] = useState(null);

  const photoItems = useMemo(
    () =>
      (limit ? photos.slice(0, limit) : photos).map((p) => ({
        type: 'image',
        key: `p-${p.id}`,
        src: p.src,
        alt: '',
      })),
    [limit]
  );

  const videoItems = useMemo(
    () =>
      (limit ? videos.slice(0, limit) : videos).map((v) => ({
        type: 'video',
        key: `v-${v.youtubeId}`,
        embedUrl: v.embedUrl,
        thumbnail: v.thumbnail,
        watchUrl: v.watchUrl,
      })),
    [limit]
  );

  const items = tab === 'photos' ? photoItems : videoItems;

  return (
    <section className="section relative overflow-hidden" aria-labelledby="gallery-title">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 bottom-20 h-[22rem] w-[22rem] blob bg-earth/6"
      />

      <div className="shell">
        {/*
          The tabs sit in the heading row rather than centred beneath it: they
          are the control for this section, and putting them on the heading's
          baseline says so, while keeping the title on the same left edge as
          every other section on the page.
        */}
        {(() => {
          const tabs = (
            <div
              role="tablist"
              aria-label={t('nav.gallery')}
              className="inline-flex gap-1.5 rounded-full border border-line bg-surface p-1.5"
            >
              {[
                { key: 'photos', label: t('gallery.photos'), count: photos.length, icon: 'grid' },
                { key: 'videos', label: t('gallery.videos'), count: videos.length, icon: 'play' },
              ].map((x) => (
                <button
                  key={x.key}
                  type="button"
                  role="tab"
                  aria-selected={tab === x.key}
                  onClick={() => setTab(x.key)}
                  className={`inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 text-fluid-sm
                              font-semibold transition-all duration-300 ease-organic
                              ${
                                tab === x.key
                                  ? 'bg-primary text-cream shadow-soft'
                                  : 'text-ink/70 hover:text-primary'
                              }`}
                >
                  <Icon name={x.icon} size={16} />
                  {x.label}
                  <span className="text-fluid-xs opacity-70 tabular-nums">{x.count}</span>
                </button>
              ))}
            </div>
          );

          return heading ? (
            <SectionHeading
              id="gallery-title"
              eyebrow={t('nav.gallery')}
              title="your dream gallery"
              action={tabs}
            />
          ) : (
            <>
              <h2 id="gallery-title" className="sr-only">
                {t('nav.gallery')}
              </h2>
              <Reveal delay={0.06}>{tabs}</Reveal>
            </>
          );
        })()}

        {/* Masonry-style grid. A denser first tile gives the grid a focal point. */}
        {tab === 'photos' ? (
          <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {photoItems.map((p, i) => (
              <Reveal
                as="li"
                key={p.key}
                delay={Math.min(i, 9) * 0.05}
                className={i === 0 ? 'col-span-2 row-span-2' : ''}
              >
                <button
                  type="button"
                  onClick={() => setLightbox(i)}
                  aria-label={`${t('gallery.openImage')} ${i + 1}`}
                  data-cursor="view"
                  className="group relative block h-full w-full overflow-hidden rounded-2xl
                             border border-line/60 shadow-soft transition-all duration-500 ease-organic
                             hover:-translate-y-1 hover:shadow-lift focus-visible:-translate-y-1"
                >
                  <SmartImage
                    src={p.src}
                    alt=""
                    ratio={i === 0 ? '1 / 1' : '4 / 3'}
                    className="!h-full"
                    imgClassName="transition-transform duration-700 ease-organic group-hover:scale-[1.07]"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 grid place-items-center bg-deep/45 opacity-0
                               transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-cream/95 text-primary">
                      <Icon name="search" size={19} />
                    </span>
                  </span>
                </button>
              </Reveal>
            ))}
          </ul>
        ) : (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {videoItems.map((v, i) => (
              <Reveal as="li" key={v.key} delay={Math.min(i, 8) * 0.05}>
                <button
                  type="button"
                  onClick={() => setLightbox(i)}
                  aria-label={t('gallery.playVideo')}
                  data-cursor="view"
                  className="group relative block w-full overflow-hidden rounded-2xl border border-line/60
                             shadow-soft transition-all duration-500 ease-organic hover:-translate-y-1.5
                             hover:shadow-lift focus-visible:-translate-y-1.5"
                >
                  <SmartImage
                    src={v.thumbnail}
                    alt=""
                    ratio="16 / 9"
                    imgClassName="transition-transform duration-700 ease-organic group-hover:scale-105"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 grid place-items-center bg-deep/30 transition-colors
                               duration-500 group-hover:bg-deep/45"
                  >
                    <span
                      className="grid h-14 w-14 place-items-center rounded-full bg-cream/95 pl-1 text-primary
                                 shadow-lift transition-transform duration-500 ease-organic group-hover:scale-110"
                    >
                      <Icon name="play" size={24} />
                    </span>
                  </span>
                </button>
              </Reveal>
            ))}
          </ul>
        )}

        {limit && (
          <Reveal delay={0.1} className="mt-12">
            <Link to={`/gallery?tab=${tab}`} className="btn-primary">
              {t('cta.viewMore')}
              <Icon name="arrowRight" size={18} />
            </Link>
          </Reveal>
        )}
      </div>

      <Lightbox
        items={items}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onNavigate={setLightbox}
      />
    </section>
  );
}
