import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMagnetic } from '../lib/motion-react';

const MotionLink = motion(Link);

/**
 * A CTA that leans toward the pointer.
 *
 * Polymorphic on purpose — the same treatment has to work for a `<button>` that
 * opens a modal, a router `<Link>`, and an `<a>` to an external site, and those
 * three must keep their real elements so keyboard and assistive behaviour stay
 * correct. Passing `to` renders a Link, `href` renders an anchor, neither
 * renders a button.
 *
 * The attraction is capped inside `useMagnetic` at a few pixels: enough to feel
 * alive, never enough for the control to slip out from under the cursor. On
 * touch and under reduced motion it is an ordinary button with no transform.
 */
const MagneticButton = forwardRef(function MagneticButton(
  { children, className = '', strength = 10, to, href, ...rest },
  _forwardedRef
) {
  const { ref, style, handlers } = useMagnetic(strength);

  const common = { ref, style, className, ...handlers, ...rest };

  if (to) {
    return (
      <MotionLink to={to} {...common}>
        {children}
      </MotionLink>
    );
  }

  if (href) {
    return (
      <motion.a href={href} {...common}>
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button type="button" {...common}>
      {children}
    </motion.button>
  );
});

export default MagneticButton;
