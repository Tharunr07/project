import Field, { controlClasses } from './Field'

/** Multi-line input with an optional live character counter. */
export default function TextArea({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  hint,
  error,
  required = false,
  disabled = false,
  rows = 4,
  maxLength,
  className = '',
  ...rest
}) {
  const fieldId = id || name
  const length = String(value ?? '').length

  return (
    <Field
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
      labelSuffix={
        maxLength ? (
          <span
            className={`text-[0.6875rem] font-medium tabular-nums ${
              length > maxLength * 0.9 ? 'text-crimson-600' : 'text-navy-400'
            }`}
          >
            {length}/{maxLength}
          </span>
        ) : null
      }
    >
      <textarea
        id={fieldId}
        name={name}
        rows={rows}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={controlClasses(error, 'resize-y px-3.5 py-3 leading-relaxed')}
        {...rest}
      />
    </Field>
  )
}
