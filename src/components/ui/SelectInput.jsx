import { ChevronDown } from 'lucide-react'
import Field, { controlClasses } from './Field'

/**
 * Native select, styled to match FormInput.
 * `options` accepts plain strings or `{ value, label }` objects.
 */
export default function SelectInput({
  id,
  name,
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  hint,
  error,
  required = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...rest
}) {
  const fieldId = id || name
  const normalised = options.map((option) =>
    typeof option === 'string' ? { value: option, label: option } : option,
  )

  return (
    <Field
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-navy-400"
          />
        )}

        <select
          id={fieldId}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          required={required}
          disabled={disabled}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          className={controlClasses(
            error,
            `h-12 cursor-pointer appearance-none pr-10 ${Icon ? 'pl-10' : 'pl-3.5'} ${
              value ? '' : 'text-navy-400'
            }`,
          )}
          {...rest}
        >
          <option value="" disabled={required}>
            {placeholder}
          </option>
          {normalised.map((option) => (
            <option key={option.value} value={option.value} className="text-navy-900">
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={17}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-navy-400"
        />
      </div>
    </Field>
  )
}
