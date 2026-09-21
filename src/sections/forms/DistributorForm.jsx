import { useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { submitDistributorRegistration, ValidationError } from '../../lib/api';
import { focusFirstError, hasErrors, validate } from '../../lib/validate';
import { useI18n } from '../../lib/i18n';
import { EASE, motion } from '../../lib/motion';
import { Field, FileField, FormNotice } from '../../components/Field';
import LocationPicker from '../../components/LocationPicker';
import Stepper from '../../components/Stepper';
import Icon from '../../components/Icon';

/**
 * SCT Business Recruitment (distributor registration).
 *
 * The legacy form is a single 27-field modal. Every field, every option and the
 * endpoint are unchanged — only the presentation is staged across four steps so
 * it is usable on a phone. Field names match the API payload exactly.
 */

const EMPTY = {
  fname: '',
  mname: '',
  lname: '',
  phone: '',
  alternate_mobile: '',
  email: '',
  state: '',
  district: '',
  taluka: '',
  city: '',
  business_address: '',
  business_state: '',
  business_district: '',
  business_taluka: '',
  business_city: '',
  where_open_shop: '',
  used_sct: '',
  why_want_take_distributorship: '',
  distributorship_exerience: '',
  experience_farm_garder: '',
  goal: '',
};

/** The six uploads the legacy form requires, with its exact labels. */
const DOCUMENTS = [
  { name: 'aadhar_card_image_front', label: 'Upload Aadhar Card (Front Side)' },
  { name: 'aadhar_card_image_back', label: 'Upload Aadhar Card (Back Side)' },
  { name: 'pan_card', label: 'Upload PAN Card' },
  { name: 'shop_act_image', label: 'Upload Shop ACT /NOC/ RENT Agreement' },
  { name: 'light_bill', label: 'Upload Light Bill' },
  { name: 'product_purchase_bill', label: 'Upload SCT Product Purchase Bill' },
];

/** The five questions, verbatim from the live form. */
const QUESTIONS = [
  {
    name: 'why_want_take_distributorship',
    label: 'WHY YOU WANT TO TAKE DISTRIBUTORSHIP ?',
  },
  {
    name: 'distributorship_exerience',
    label: 'IF YOU USED THEN TELL YOUR EXPERIENCE & INFORMATION ?',
  },
  {
    name: 'experience_farm_garder',
    label: 'SHARE YOUR EXPERIENCE IN FARM & GARDEN ?',
  },
  {
    name: 'goal',
    label:
      'HOW MANY FARMERS DO YOU WANT TO WORK WITH ? & APPROXIMATELY HOW MUCH OF A TECHNOLOGY CAN YOU REACH TO THE FARMERS ? WHAT IS YOUR GOAL?',
  },
];

const SHOP_LEVELS = ['Village Level', 'Taluka Level', 'District Level'];

/** Required fields per step, so a user is never blocked by a later step. */
const STEP_RULES = [
  {
    fname: 'required',
    mname: 'required',
    lname: 'required',
    phone: ['required', 'mobile'],
    alternate_mobile: ['required', 'mobile'],
    email: ['required', 'email'],
    state: 'required',
    district: 'required',
    taluka: 'required',
    city: 'required',
  },
  {
    business_address: 'required',
    business_state: 'required',
    business_district: 'required',
    business_taluka: 'required',
    business_city: 'required',
  },
  {},
  {
    where_open_shop: 'required',
    used_sct: 'required',
    why_want_take_distributorship: 'required',
    distributorship_exerience: 'required',
    experience_farm_garder: 'required',
    goal: 'required',
  },
];

export default function DistributorForm() {
  const { t } = useI18n();
  const formRef = useRef(null);

  const [step, setStep] = useState(0);
  const [values, setValues] = useState(EMPTY);
  const [files, setFiles] = useState({});
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [sending, setSending] = useState(false);

  const steps = [
    t('career.personalDetails'),
    t('career.businessDetails'),
    t('career.requiredDocuments'),
    t('career.questions'),
  ];

  const set = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    setErrors((p) => (p[field] ? { ...p, [field]: undefined } : p));
  };

  const patch = (partial) => {
    setValues((v) => ({ ...v, ...partial }));
    setErrors((p) => {
      const next = { ...p };
      Object.keys(partial).forEach((k) => delete next[k]);
      return next;
    });
  };

  /** Validates only the current step; documents are checked separately. */
  function validateStep(index) {
    const found = validate(values, STEP_RULES[index], t);
    if (index === 2) {
      DOCUMENTS.forEach((d) => {
        if (!files[d.name]) found[d.name] = t('form.required');
      });
    }
    return found;
  }

  function next() {
    const found = validateStep(step);
    setErrors(found);
    if (hasErrors(found)) {
      focusFirstError(formRef.current, found);
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
    formRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
    formRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setNotice(null);

    // Re-check every step, not just the last, before posting.
    const found = STEP_RULES.reduce(
      (acc, _, i) => ({ ...acc, ...validateStep(i) }),
      {}
    );

    setErrors(found);
    if (hasErrors(found)) {
      const firstBadStep = STEP_RULES.findIndex((_, i) => hasErrors(validateStep(i)));
      if (firstBadStep >= 0) setStep(firstBadStep);
      focusFirstError(formRef.current, found);
      return;
    }

    setSending(true);
    try {
      const res = await submitDistributorRegistration({ ...values, ...files });
      setNotice({ status: 'success', message: res?.message || t('form.success') });
      setValues(EMPTY);
      setFiles({});
      setStep(0);
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

  const panel = {
    initial: { opacity: 0, x: 18 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -18 },
    transition: { duration: 0.32, ease: EASE },
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
      <Stepper steps={steps} current={step} onJump={setStep} />

      {notice && <FormNotice {...notice} onDismiss={() => setNotice(null)} />}

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.fieldset key="s0" {...panel} className="grid gap-4 sm:grid-cols-2">
            <legend className="sr-only">{t('career.personalDetails')}</legend>

            <Field label={t('form.firstName')} name="fname" required value={values.fname} onChange={set('fname')} error={errors.fname} autoComplete="given-name" />
            <Field label={t('form.middleName')} name="mname" required value={values.mname} onChange={set('mname')} error={errors.mname} autoComplete="additional-name" />
            <Field label={t('form.lastName')} name="lname" required value={values.lname} onChange={set('lname')} error={errors.lname} autoComplete="family-name" />
            <Field label={t('form.mobile')} name="phone" type="tel" required value={values.phone} onChange={set('phone')} error={errors.phone} autoComplete="tel" inputMode="tel" />
            <Field label={t('form.altMobile')} name="alternate_mobile" type="tel" required value={values.alternate_mobile} onChange={set('alternate_mobile')} error={errors.alternate_mobile} inputMode="tel" />
            <Field label={t('form.email')} name="email" type="email" required value={values.email} onChange={set('email')} error={errors.email} autoComplete="email" inputMode="email" />

            <LocationPicker
              names={{ state: 'state', district: 'district', taluka: 'taluka', village: 'city' }}
              values={values}
              onChange={patch}
              errors={errors}
            />
          </motion.fieldset>
        )}

        {step === 1 && (
          <motion.fieldset key="s1" {...panel} className="grid gap-4 sm:grid-cols-2">
            <legend className="sr-only">{t('career.businessDetails')}</legend>

            <Field
              label="Address of where to start"
              name="business_address"
              as="textarea"
              required
              rows={3}
              value={values.business_address}
              onChange={set('business_address')}
              error={errors.business_address}
              className="sm:col-span-2"
            />

            <LocationPicker
              names={{
                state: 'business_state',
                district: 'business_district',
                taluka: 'business_taluka',
                village: 'business_city',
              }}
              values={values}
              onChange={patch}
              errors={errors}
            />
          </motion.fieldset>
        )}

        {step === 2 && (
          <motion.fieldset key="s2" {...panel} className="grid gap-4 sm:grid-cols-2">
            <legend className="sr-only">{t('career.requiredDocuments')}</legend>

            {DOCUMENTS.map((doc) => (
              <FileField
                key={doc.name}
                label={doc.label}
                name={doc.name}
                accept="image/*,.pdf"
                required
                error={errors[doc.name]}
                onChange={(f) => {
                  setFiles((prev) => ({ ...prev, [doc.name]: f }));
                  setErrors((p) => (p[doc.name] ? { ...p, [doc.name]: undefined } : p));
                }}
              />
            ))}
          </motion.fieldset>
        )}

        {step === 3 && (
          <motion.fieldset key="s3" {...panel} className="grid gap-4 sm:grid-cols-2">
            <legend className="sr-only">{t('career.questions')}</legend>

            <Field
              label="WHERE YOU CAN OPEN THE SHOP ?"
              name="where_open_shop"
              as="select"
              required
              value={values.where_open_shop}
              onChange={set('where_open_shop')}
              error={errors.where_open_shop}
            >
              <option value="">{t('form.choose')}</option>
              {SHOP_LEVELS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </Field>

            <Field
              label="CAN YOU USED SOIL CHARGER TECHNOLOGY ?"
              name="used_sct"
              as="select"
              required
              value={values.used_sct}
              onChange={set('used_sct')}
              error={errors.used_sct}
            >
              <option value="">{t('form.choose')}</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </Field>

            {QUESTIONS.map((q) => (
              <Field
                key={q.name}
                label={q.label}
                name={q.name}
                as="textarea"
                required
                rows={3}
                placeholder="Describe"
                value={values[q.name]}
                onChange={set(q.name)}
                error={errors[q.name]}
                className="sm:col-span-2"
              />
            ))}
          </motion.fieldset>
        )}
      </AnimatePresence>

      <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="btn-ghost disabled:invisible"
        >
          <Icon name="chevronLeft" size={17} />
          {t('cta.back')}
        </button>

        {step < steps.length - 1 ? (
          <button type="button" onClick={next} className="btn-primary">
            {t('cta.next')}
            <Icon name="arrowRight" size={17} />
          </button>
        ) : (
          <button type="submit" disabled={sending} className="btn-primary disabled:opacity-60">
            {sending ? t('form.sending') : t('cta.submit')}
            {!sending && <Icon name="check" size={17} />}
          </button>
        )}
      </div>
    </form>
  );
}
