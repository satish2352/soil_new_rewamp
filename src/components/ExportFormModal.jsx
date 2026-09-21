import { useRef, useState } from 'react';
import { contact, states } from '../data/site';
import { focusFirstError, hasErrors, validate } from '../lib/validate';
import { useI18n } from '../lib/i18n';
import Modal from './Modal';
import { Field, FormNotice } from './Field';
import Icon from './Icon';

const EMPTY = {
  company: '',
  mobile: '',
  city: '',
  state: '',
  country: '',
  pincode: '',
  requirements: '',
};

/**
 * Export Form — the modal the "Shop Now" CTA opens.
 *
 * Fields are exactly the seven the live site asks for. On the existing site this
 * form has no action and no submit handler, so it silently does nothing; there
 * is no export endpoint in the API to call. Rather than ship the same dead form,
 * the submission is composed into a mail to the sales address the site already
 * publishes. Swap `deliver()` for an API call the moment an endpoint exists.
 */
const SALES_EMAIL =
  contact.emails.find((e) => e.label === 'For Sales')?.address || contact.emails[0].address;

export default function ExportFormModal({ open, onClose }) {
  const { t } = useI18n();
  const formRef = useRef(null);
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);

  const set = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  function deliver(v) {
    const body = [
      `${t('export.companyName')}: ${v.company}`,
      `${t('form.mobile')}: ${v.mobile}`,
      `${t('export.city')}: ${v.city}`,
      `${t('form.state')}: ${v.state}`,
      `${t('export.country')}: ${v.country}`,
      `${t('export.pincode')}: ${v.pincode}`,
      '',
      `${t('export.requirements')}:`,
      v.requirements,
    ].join('\n');

    window.location.href =
      `mailto:${SALES_EMAIL}` +
      `?subject=${encodeURIComponent(`${t('export.title')} — ${v.company}`)}` +
      `&body=${encodeURIComponent(body)}`;
  }

  function handleSubmit(e) {
    e.preventDefault();
    setNotice(null);

    const found = validate(
      values,
      {
        company: 'required',
        mobile: ['required', 'mobile'],
        city: 'required',
        state: 'required',
        country: 'required',
        pincode: 'required',
        requirements: 'required',
      },
      t
    );

    setErrors(found);
    if (hasErrors(found)) {
      focusFirstError(formRef.current, found);
      return;
    }

    deliver(values);
    setNotice({ status: 'success', message: t('form.success') });
  }

  return (
    <Modal open={open} onClose={onClose} title={t('export.title')} size="lg">
      <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
        {notice && <FormNotice {...notice} onDismiss={() => setNotice(null)} />}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={t('export.companyName')}
            name="company"
            required
            value={values.company}
            onChange={set('company')}
            error={errors.company}
            autoComplete="organization"
            className="sm:col-span-2"
          />
          <Field
            label={t('form.mobile')}
            name="mobile"
            type="tel"
            required
            value={values.mobile}
            onChange={set('mobile')}
            error={errors.mobile}
            autoComplete="tel"
            inputMode="tel"
          />
          <Field
            label={t('export.city')}
            name="city"
            required
            value={values.city}
            onChange={set('city')}
            error={errors.city}
            autoComplete="address-level2"
          />
          <Field
            label={t('form.state')}
            name="state"
            as="select"
            required
            value={values.state}
            onChange={set('state')}
            error={errors.state}
          >
            <option value="">{t('form.chooseState')}</option>
            {states.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </Field>
          <Field
            label={t('export.country')}
            name="country"
            required
            value={values.country}
            onChange={set('country')}
            error={errors.country}
            autoComplete="country-name"
          />
          <Field
            label={t('export.pincode')}
            name="pincode"
            required
            value={values.pincode}
            onChange={set('pincode')}
            error={errors.pincode}
            autoComplete="postal-code"
            inputMode="numeric"
            className="sm:col-span-2"
          />
          <Field
            label={t('export.requirements')}
            name="requirements"
            as="textarea"
            required
            rows={4}
            value={values.requirements}
            onChange={set('requirements')}
            error={errors.requirements}
            className="sm:col-span-2"
          />
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn-ghost">
            {t('cta.cancel')}
          </button>
          <button type="submit" className="btn-primary">
            {t('cta.submit')}
            <Icon name="arrowRight" size={17} />
          </button>
        </div>
      </form>
    </Modal>
  );
}
