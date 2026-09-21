/**
 * Client-side validation. Deliberately light — the Laravel API is still the
 * authority and its 422 field map is merged over these results, so the rules
 * here only catch the obvious mistakes before a round trip.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MOBILE = /^[6-9]\d{9}$/;

export function validate(values, rules, t) {
  const errors = {};

  Object.entries(rules).forEach(([field, checks]) => {
    const raw = values[field];
    const value = typeof raw === 'string' ? raw.trim() : raw;

    for (const check of [].concat(checks)) {
      if (check === 'required') {
        const empty =
          value === undefined || value === null || value === '' ||
          (Array.isArray(value) && value.length === 0);
        if (empty) {
          errors[field] = t('form.required');
          return;
        }
      }

      if (check === 'email' && value && !EMAIL.test(value)) {
        errors[field] = t('form.invalidEmail');
        return;
      }

      // Accepts a leading +91 or 0 the way people actually type a number.
      if (check === 'mobile' && value) {
        const digits = String(value).replace(/\D/g, '').replace(/^(91|0)/, '');
        if (!MOBILE.test(digits)) {
          errors[field] = t('form.invalidMobile');
          return;
        }
      }
    }
  });

  return errors;
}

export const hasErrors = (errors) => Object.keys(errors).length > 0;

/** Scrolls to and focuses the first field that failed. */
export function focusFirstError(formEl, errors) {
  if (!formEl) return;
  const first = Object.keys(errors)[0];
  if (!first) return;
  const el = formEl.querySelector(`[name="${first}"]`);
  if (!el) return;
  el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  el.focus({ preventScroll: true });
}
