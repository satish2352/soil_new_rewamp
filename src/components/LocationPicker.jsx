import { useEffect, useState } from 'react';
import { states } from '../data/site';
import { getDistricts, getTalukas, getVillages } from '../lib/api';
import { useI18n } from '../lib/i18n';
import { Field } from './Field';

/**
 * State → District → Taluka → Village cascade.
 *
 * Uses the same three POST endpoints the live site calls, with the same payload
 * keys (`state_id`, `dist_id`, `taluka_id`) and the same `{location_id, name}`
 * response shape. `names` maps the four levels onto whichever field names the
 * parent form submits — the distributor form uses two different sets.
 */
export default function LocationPicker({ names, values, onChange, errors = {}, disabled }) {
  const { t } = useI18n();
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [villages, setVillages] = useState([]);
  const [busy, setBusy] = useState(null);

  const stateId = values[names.state];
  const districtId = values[names.district];
  const talukaId = values[names.taluka];

  useEffect(() => {
    if (!stateId) {
      setDistricts([]);
      return;
    }
    const ctrl = new AbortController();
    setBusy('district');
    getDistricts(stateId, ctrl.signal)
      .then(setDistricts)
      .catch(() => setDistricts([]))
      .finally(() => setBusy(null));
    return () => ctrl.abort();
  }, [stateId]);

  useEffect(() => {
    if (!districtId) {
      setTalukas([]);
      return;
    }
    const ctrl = new AbortController();
    setBusy('taluka');
    getTalukas(districtId, ctrl.signal)
      .then(setTalukas)
      .catch(() => setTalukas([]))
      .finally(() => setBusy(null));
    return () => ctrl.abort();
  }, [districtId]);

  useEffect(() => {
    if (!talukaId) {
      setVillages([]);
      return;
    }
    const ctrl = new AbortController();
    setBusy('village');
    getVillages(talukaId, ctrl.signal)
      .then(setVillages)
      .catch(() => setVillages([]))
      .finally(() => setBusy(null));
    return () => ctrl.abort();
  }, [talukaId]);

  /** Changing a level clears everything below it. */
  const pick = (level) => (e) => {
    const value = e.target.value;
    const clears = {
      state: [names.district, names.taluka, names.village],
      district: [names.taluka, names.village],
      taluka: [names.village],
      village: [],
    }[level];

    onChange({ [names[level]]: value, ...Object.fromEntries(clears.map((k) => [k, ''])) });
  };

  const options = (list) =>
    list.map((o) => (
      <option key={o.location_id} value={o.location_id}>
        {o.name}
      </option>
    ));

  return (
    <>
      <Field
        label={t('form.state')}
        name={names.state}
        as="select"
        required
        disabled={disabled}
        value={values[names.state] || ''}
        onChange={pick('state')}
        error={errors[names.state]}
      >
        <option value="">{t('form.chooseState')}</option>
        {states.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </Field>

      <Field
        label={t('form.district')}
        name={names.district}
        as="select"
        required
        disabled={disabled || !stateId || busy === 'district'}
        value={values[names.district] || ''}
        onChange={pick('district')}
        error={errors[names.district]}
      >
        <option value="">{busy === 'district' ? t('a11y.loading') : t('form.select')}</option>
        {options(districts)}
      </Field>

      <Field
        label={t('form.taluka')}
        name={names.taluka}
        as="select"
        required
        disabled={disabled || !districtId || busy === 'taluka'}
        value={values[names.taluka] || ''}
        onChange={pick('taluka')}
        error={errors[names.taluka]}
      >
        <option value="">{busy === 'taluka' ? t('a11y.loading') : t('form.select')}</option>
        {options(talukas)}
      </Field>

      <Field
        label={t('form.village')}
        name={names.village}
        as="select"
        required
        disabled={disabled || !talukaId || busy === 'village'}
        value={values[names.village] || ''}
        onChange={pick('village')}
        error={errors[names.village]}
      >
        <option value="">{busy === 'village' ? t('a11y.loading') : t('form.select')}</option>
        {options(villages)}
      </Field>
    </>
  );
}
