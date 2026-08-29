import Field, { controlClasses } from './Field'

/** Text / number / email / tel / date input with label, hint, error and optional icon. */
export default function FormInput({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  hint,
  error,
  required = false,
  disabled = false,
  icon: Icon,
  prefix,
  suffix,
  labelSuffix,
  className = '',
  inputClassName = '',
  ...rest
}) {
  const fieldId = id || name

  return (
    <Field
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
      labelSuffix={labelSuffix}
    >
      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-navy-400"
          />
        )}
        {prefix && (
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[0.9375rem] font-medium text-navy-500">
            {prefix}
          </span>
        )}

        <input
          id={fieldId}
          name={name}
          type={type}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          className={controlClasses(
            error,
            [
              'h-12',
              Icon || prefix ? 'pl-10' : 'pl-3.5',
              suffix ? 'pr-16' : 'pr-3.5',
              inputClassName,
            ].join(' '),
          )}
          {...rest}
        />

        {suffix && (
          <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-xs font-semibold tracking-wide text-navy-400 uppercase">
            {suffix}
          </span>
        )}
      </div>
    </Field>
  )
}
