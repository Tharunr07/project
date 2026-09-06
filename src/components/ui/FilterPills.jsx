/**
 * Horizontal pill filter. Used for destination categories, gallery categories,
 * package sort options and admin status filters.
 */
export default function FilterPills({
  options = [],
  value,
  onChange,
  label = 'Filter',
  className = '',
}) {
  const safeOptions = Array.isArray(options) ? options : []

  return (
    <div
      role="group"
      aria-label={label}
      className={`no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-1 ${className}`}
    >
      {safeOptions.map((option) => {
        const optValue = typeof option === 'string' ? option : option.value
        const optLabel = typeof option === 'string' ? option : option.label
        const count = typeof option === 'string' ? undefined : option.count
        const active = optValue === value

        return (
          <button
            key={optValue}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(optValue)}
            className={`inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
              active
                ? 'bg-navy-900 text-white shadow-card'
                : 'bg-white text-navy-600 ring-1 ring-inset ring-sand-300 hover:bg-sand-100 hover:text-navy-900'
            }`}
          >
            {optLabel}
            {count !== undefined && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[0.625rem] font-bold ${
                  active ? 'bg-white/15 text-white' : 'bg-sand-200 text-navy-500'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
