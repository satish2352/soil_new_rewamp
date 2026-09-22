import { company, pillars } from '../data/site';
import { Marquee } from '../lib/motion-react';
import Icon from '../components/Icon';

/**
 * A moving band between the dark half of the page and the light half.
 *
 * Its job is the section transition, not decoration for its own sake: the
 * deep block (products scene → reach) previously butted straight into the
 * light careers band, and a hard edge between two full-width colour fields is
 * the one place a long page most obviously looks assembled rather than
 * designed. A continuously moving strip reads as a seam.
 *
 * The content is the company's own tagline, its certification line, and the
 * four pillar statements — all already on the page elsewhere, nothing written
 * for the effect. Because every string is repeated verbatim nearby, the band
 * is marked `aria-hidden`: a screen reader gaining nothing from hearing the
 * pillars a second time, in a loop, out of context.
 *
 * Two rows moving in opposition: the top row travels left to right, the bottom
 * row right to left. One row alone reads as a stock ticker; the counter-moving
 * pair is what makes it look deliberate, and the opposed directions are what
 * stop the eye settling into either one.
 */

const ROW_ONE = [company.tagline, company.certification];
const ROW_TWO = pillars.map((p) => p.text);

function Item({ children }) {
  return (
    <span className="flex items-center gap-8 whitespace-nowrap px-8">
      <span className="display text-fluid-xl font-semibold text-cream/85">{children}</span>
      <Icon name="leaf" size={16} className="shrink-0 text-sun/70" />
    </span>
  );
}

export default function Ticker() {
  return (
    <section
      aria-hidden="true"
      className="band-void relative overflow-hidden border-y border-line/40 py-10"
    >
      {/* Top row travels left to right; the bottom row runs back against it. */}
      <Marquee speed={44} direction="ltr" trackClassName="items-center">
        {ROW_ONE.map((text, i) => (
          <Item key={`a-${i}`}>{text}</Item>
        ))}
      </Marquee>

      <div className="h-6" />

      <Marquee speed={58} direction="rtl" trackClassName="items-center">
        {ROW_TWO.map((text, i) => (
          <span key={`b-${i}`} className="flex items-center gap-6 whitespace-nowrap px-6">
            <span className="text-fluid-sm font-medium uppercase tracking-[0.18em] text-muted">
              {text}
            </span>
            <span className="h-1 w-1 shrink-0 rounded-full bg-leaf/60" />
          </span>
        ))}
      </Marquee>
    </section>
  );
}
