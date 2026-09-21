import { useRef, useState } from 'react';
import { submitInternship, ValidationError } from '../../lib/api';
import { focusFirstError, hasErrors, validate } from '../../lib/validate';
import { useI18n } from '../../lib/i18n';
import { Field, FileField, FormNotice } from '../../components/Field';
import Icon from '../../components/Icon';

const EMPTY = { name: '', email: '', mobile: '', qualification: '', address: '' };

/**
 * Internship application.
 * Fields and endpoint match the legacy `internship_form` exactly:
 * name, email, mobile, qualification, address, resume → /api/frontinternshipadd
 */
export default function InternshipForm() {
  const { t } = useI18n();
  const formRef = useRef(null);
  const [values, setValues] = useState(EMPTY);
  const [resume, setResume] = useState(null);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [sending, setSending] = useState(false);

  const set = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    setErrors((p) => (p[field] ? { ...p, [field]: undefined } : p));
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
        qualification: 'required',
        address: 'required',
      },
      t
    );
    if (!resume) found.resume = t('form.required');

    setErrors(found);
    if (hasErrors(found)) {
      focusFirstError(formRef.current, found);
      return;
    }

    setSending(true);
    try {
      const res = await submitInternship({ ...values, resume });
      setNotice({ status: 'success', message: res?.message || t('form.success') });
      setValues(EMPTY);
      setResume(null);
      formRef.current?.reset();
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
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
      {notice && <FormNotice {...notice} onDismiss={() => setNotice(null)} />}

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
          label={t('form.qualification')}
          name="qualification"
          required
          value={values.qualification}
          onChange={set('qualification')}
          error={errors.qualification}
        />
        <Field
          label={t('form.address')}
          name="address"
          as="textarea"
          required
          rows={3}
          value={values.address}
          onChange={set('address')}
          error={errors.address}
          className="sm:col-span-2"
        />
        <FileField
          label={t('form.resume')}
          name="resume"
          accept=".pdf,.doc,.docx"
          required
          error={errors.resume}
          onChange={(f) => {
            setResume(f);
            setErrors((p) => (p.resume ? { ...p, resume: undefined } : p));
          }}
          className="sm:col-span-2"
        />
      </div>

      <button type="submit" disabled={sending} className="btn-primary w-full sm:w-auto disabled:opacity-60">
        {sending ? t('form.sending') : t('cta.save')}
        {!sending && <Icon name="arrowRight" size={17} />}
      </button>
    </form>
  );
}
