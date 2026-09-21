import { useRef, useState } from 'react';
import { enquiryProducts } from '../data/site';
import { submitEnquiry, ValidationError } from '../lib/api';
import { focusFirstError, hasErrors, validate } from '../lib/validate';
import { useI18n } from '../lib/i18n';
import Modal from './Modal';
import { Field, FormNotice } from './Field';
import Icon from './Icon';

const EMPTY = { name: '', email: '', mobile: '', comment: '' };

/**
 * Footer enquiry form. Posts the same five fields to the same endpoint the live
 * site uses (`frontenquiryadd`), with `details` as the comma-joined list of
 * checked product names — identical to the legacy payload.
 */
export default function EnquiryModal({ open, onClose, presetProduct }) {
  const { t } = useI18n();
  const formRef = useRef(null);

  const [values, setValues] = useState(EMPTY);
  const [selected, setSelected] = useState(presetProduct ? [presetProduct] : []);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [sending, setSending] = useState(false);

  const set = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const toggle = (product) =>
    setSelected((list) =>
      list.includes(product) ? list.filter((p) => p !== product) : [...list, product]
    );

  const reset = () => {
    setValues(EMPTY);
    setSelected(presetProduct ? [presetProduct] : []);
    setErrors({});
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setNotice(null);

    const found = validate(
      values,
      {
        name: 'required',
        email: ['required', 'email'],
        mobile: ['required', 'mobile'],
        comment: 'required',
      },
      t
    );

    if (!selected.length) found.details = t('form.selectAtLeastOne');

    setErrors(found);
    if (hasErrors(found)) {
      focusFirstError(formRef.current, found);
      return;
    }

    setSending(true);
    try {
      await submitEnquiry({ ...values, details: selected.join(',') });
      setNotice({ status: 'success', message: t('form.success') });
      reset();
    } catch (err) {
      if (err instanceof ValidationError) {
        setErrors(err.fields);
        focusFirstError(formRef.current, err.fields);
        setNotice({ status: 'error', message: err.message });
      } else {
        setNotice({ status: 'error', message: err.message || t('form.error') });
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t('enquiry.title')} size="lg">
      <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-6">
        {notice && (
          <FormNotice {...notice} onDismiss={() => setNotice(null)} />
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={t('form.fullName')}
            name="name"
            required
            value={values.name}
            onChange={set('name')}
            error={errors.name}
            autoComplete="name"
          />
          <Field
            label={t('form.email')}
            name="email"
            type="email"
            required
            value={values.email}
            onChange={set('email')}
            error={errors.email}
            autoComplete="email"
            inputMode="email"
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
            label={t('form.comment')}
            name="comment"
            as="textarea"
            required
            rows={3}
            value={values.comment}
            onChange={set('comment')}
            error={errors.comment}
            className="sm:col-span-2"
          />
        </div>

        <fieldset>
          <legend className="field-label mb-3">
            {t('enquiry.products')} <span aria-hidden="true" className="text-[#B4442E]">*</span>
          </legend>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {enquiryProducts.map((product) => {
              const checked = selected.includes(product);
              return (
                <label
                  key={product}
                  className={`flex min-h-[46px] cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5
                              text-fluid-sm transition-colors
                              ${
                                checked
                                  ? 'border-primary bg-primary/8 text-primary'
                                  : 'border-line bg-surface text-ink/80 hover:border-primary/40'
                              }`}
                >
                  <input
                    type="checkbox"
                    name="details"
                    value={product}
                    checked={checked}
                    onChange={() => {
                      toggle(product);
                      setErrors((p) => (p.details ? { ...p, details: undefined } : p));
                    }}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors
                                ${checked ? 'border-primary bg-primary text-cream' : 'border-line bg-surface'}`}
                  >
                    {checked && <Icon name="check" size={13} strokeWidth={2.6} />}
                  </span>
                  <span className="wrap-anywhere">{product}</span>
                </label>
              );
            })}
          </div>

          {errors.details && (
            <span className="field-error" role="alert">
              {errors.details}
            </span>
          )}
        </fieldset>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn-ghost">
            {t('cta.cancel')}
          </button>
          <button type="submit" disabled={sending} className="btn-primary disabled:opacity-60">
            {sending ? t('form.sending') : t('cta.submit')}
            {!sending && <Icon name="arrowRight" size={17} />}
          </button>
        </div>
      </form>
    </Modal>
  );
}
