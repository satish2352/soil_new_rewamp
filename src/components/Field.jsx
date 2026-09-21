import { useId, useState } from 'react';
import { useI18n } from '../lib/i18n';
import Icon from './Icon';

/** Text, email, tel, date, textarea and select share one labelled wrapper. */
export function Field({
  label,
  name,
  type = 'text',
  as = 'input',
  error,
  required,
  hint,
  children,
  className = '',
  ...rest
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const Tag = as;

  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label} {required && <span aria-hidden="true" className="text-[#B4442E]">*</span>}
      </label>

      <Tag
        id={id}
        name={name}
        type={as === 'input' ? type : undefined}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`field ${as === 'textarea' ? 'min-h-[110px] resize-y' : ''} ${
          error ? '!border-[#B4442E] !ring-[#B4442E]/20' : ''
        }`}
        {...rest}
      >
        {children}
      </Tag>

      {hint && !error && <span className="mt-1 block text-fluid-xs text-muted">{hint}</span>}
      {error && (
        <span id={errorId} className="field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

/**
 * File input with a visible filename and a size guard. The native control is
 * kept (so it stays accessible and keyboard-operable) but visually replaced.
 */
export function FileField({
  label,
  name,
  accept,
  required,
  error,
  onChange,
  maxMB = 5,
  className = '',
}) {
  const id = useId();
  const { t } = useI18n();
  const [fileName, setFileName] = useState('');
  const [sizeError, setSizeError] = useState('');

  const handle = (e) => {
    const file = e.target.files?.[0];
    setSizeError('');

    if (!file) {
      setFileName('');
      onChange?.(null);
      return;
    }

    if (file.size > maxMB * 1024 * 1024) {
      setSizeError(t('form.fileTooLarge'));
      e.target.value = '';
      setFileName('');
      onChange?.(null);
      return;
    }

    setFileName(file.name);
    onChange?.(file);
  };

  const shown = error || sizeError;

  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label} {required && <span aria-hidden="true" className="text-[#B4442E]">*</span>}
      </label>

      <label
        htmlFor={id}
        className={`flex min-h-[46px] cursor-pointer items-center gap-3 rounded-xl border border-dashed
                    bg-surface px-4 py-3 text-fluid-sm transition-colors
                    hover:border-primary hover:bg-primary/4
                    ${shown ? 'border-[#B4442E]' : 'border-line'}`}
      >
        <Icon name="upload" size={18} className="shrink-0 text-primary" />
        <span className={`truncate ${fileName ? 'text-ink' : 'text-muted'}`}>
          {fileName || t('form.chooseFile')}
        </span>
      </label>

      <input
        id={id}
        name={name}
        type="file"
        accept={accept}
        required={required}
        onChange={handle}
        aria-invalid={shown ? 'true' : undefined}
        className="sr-only"
      />

      {shown && (
        <span className="field-error" role="alert">
          {shown}
        </span>
      )}
    </div>
  );
}

/** Success / error banner shown after a submission. */
export function FormNotice({ status, message, onDismiss }) {
  if (!status) return null;
  const ok = status === 'success';

  return (
    <div
      role={ok ? 'status' : 'alert'}
      className={`flex items-start gap-3 rounded-2xl border p-4 text-fluid-sm
                  ${ok ? 'border-leaf/40 bg-leaf/10 text-deep' : 'border-[#B4442E]/35 bg-[#B4442E]/8 text-[#8C3423]'}`}
    >
      <Icon name={ok ? 'check' : 'alert'} size={19} className="mt-0.5 shrink-0" />
      <p className="grow wrap-anywhere">{message}</p>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Dismiss" className="shrink-0 opacity-60 hover:opacity-100">
          <Icon name="close" size={16} />
        </button>
      )}
    </div>
  );
}
