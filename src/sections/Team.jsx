import { team } from '../data/site';
import { useI18n } from '../lib/i18n';
import { ImageReveal, Reveal, motion, useFrameParallax } from '../lib/motion-react';
import { SectionHeading, SmartImage } from '../components/ui';

/**
 * The five team members and their roles, exactly as listed on the live site —
 * including the spelling of "Devlopment Director", which is the client's own.
 *
 * Presentation change: the names were set *inside* the portraits, over a heavy
 * opaque scrim that had to cover the lower third of each photograph to hold
 * contrast — so every face was shown with a black bar across the chest. The
 * names now sit under the frame where they read at full contrast with no scrim
 * at all, and the portraits are left alone.
 */
export default function Team() {
  const { t } = useI18n();

  return (
    <section className="band-dark section relative overflow-hidden" aria-labelledby="team-title">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-36 top-16 h-[24rem] w-[24rem] blob bg-leaf/6"
      />

      <div className="shell relative">
        <SectionHeading id="team-title" eyebrow={t('section.team')} title="The people behind SCT" />

        <ul className="mt-14 grid grid-cols-2 gap-5 sm:gap-6 lg:grid-cols-5">
          {team.map((member, i) => (
            <Member key={member.name} member={member} index={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * One portrait.
 *
 * Split out of the list because each card needs its own scroll subscription —
 * `useFrameParallax` is a hook, so it cannot be called inside `.map()`.
 *
 * The parallax is what gives the row depth while you scroll past it: each
 * portrait drifts a little slower than the page inside a fixed frame, so the
 * faces sit *behind* the grid rather than on it. The inner layer is scaled up
 * to cover the travel, otherwise the drift exposes the frame's edge.
 */
function Member({ member, index }) {
  const { ref, style } = useFrameParallax({ distance: 8, scale: 1.16 });

  return (
    <Reveal as="li" delay={index * 0.08} className="group">
      <ImageReveal
        delay={index * 0.05}
        className="relative overflow-hidden rounded-[1.25rem] border border-line/70
                   transition-colors duration-slow group-hover:border-sun/50"
      >
        <div ref={ref} className="relative overflow-hidden" style={{ aspectRatio: '3 / 4' }}>
          <motion.div style={style} className="h-full w-full">
            <SmartImage
              src={member.image}
              alt={`${member.name}, ${member.role}`}
              ratio="auto"
              className="!h-full !bg-[#E8F0E4]"
              imgClassName="transition-transform duration-[900ms] ease-organic group-hover:scale-[1.04]"
            />
          </motion.div>
        </div>
        {/* A light warm wash on hover, not a scrim — the face stays clear. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-sun/25 to-transparent
                     opacity-0 transition-opacity duration-slow ease-organic group-hover:opacity-100"
        />
      </ImageReveal>

      <div className="pt-4">
        <h3 className="font-display text-fluid-base font-semibold leading-tight text-cream wrap-anywhere">
          {member.name}
        </h3>
        <p className="mt-1 text-fluid-xs font-semibold uppercase tracking-[0.12em] text-sun wrap-anywhere">
          {member.role}
        </p>
        <span
          aria-hidden="true"
          className="mt-3 block h-px w-8 bg-sun/50 transition-all duration-slow ease-organic
                     group-hover:w-full group-hover:bg-sun"
        />
      </div>
    </Reveal>
  );
}
