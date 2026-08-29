import { AlertCircle } from 'lucide-react'

/** Shared label / hint / error chrome for every form control. */
export default function Field({
  id,
  label,
  hint,
  error,
  required,
  className = '',
  labelSuffix,
  children,
}) {
  return (
    <div className={className}>
      {label && (
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          <label htmlFor={id} className="text-[0.8125rem] font-semibold text-navy-800">
            {label}
            {required && (
              <span className="ml-0.5 text-crimson-600" aria-hidden="true">
                *
              </span>
            )}
          </label>
          {labelSuffix}
        </div>
      )}

      {children}

      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-crimson-700"
        >
          <AlertCircle size={13} aria-hidden="true" />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-xs leading-relaxed text-navy-400">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

/** Base classes shared by input / select / textarea so they line up pixel for pixel. */
export const controlClasses = (error, extra = '') =>
  [
    'w-full rounded-xl border bg-white text-[0.9375rem] text-navy-900 transition-colors',
    'placeholder:text-navy-300',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    error
      ? 'border-crimson-400 focus:border-crimson-500 focus:ring-crimson-200'
      : 'border-sand-300 hover:border-navy-300 focus:border-navy-500 focus:ring-navy-200',
    'disabled:cursor-not-allowed disabled:bg-sand-100 disabled:text-navy-400',
    extra,
  ]
    .filter(Boolean)
    .join(' ')
