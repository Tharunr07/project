import { useCountUp } from '../../hooks'
import { formatNumber } from '../../utils/format'

/**
 * Editorial stat counter — dark tone for homepage, light tone for About page.
 *
 * Dark: ivory numbers on charcoal, gold accents, vertical dividers.
 * Light: navy numbers on white, crimson accents (About page).
 */
export default function StatsCard({
  value,
  label,
  suffix = '',
  prefix = '',
  icon: Icon,
  tone = 'dark',
  delay = 0,
}) {
  const [ref, current] = useCountUp(value)
  const dark = tone === 'dark'

  return (
    <div
      ref={ref}
      className={`group relative flex flex-col items-center gap-3 px-5 py-6 text-center transition-all duration-400 sm:px-6 sm:py-8 ${
        dark
          ? 'lg:border-r lg:border-white/[0.06] last:lg:border-r-0'
          : 'bg-white shadow-card hover:-translate-y-1 hover:shadow-lift rounded-2xl'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {Icon && (
        <span
          aria-hidden="true"
          className={`mb-1 transition-transform duration-400 group-hover:scale-108 ${
            dark
              ? 'text-gold-400/60'
              : 'text-crimson-600'
          }`}
        >
          <Icon size={18} strokeWidth={1.5} />
        </span>
      )}

      <p
        className={`font-display text-4xl leading-none font-bold tabular-nums sm:text-[2.75rem] ${
          dark ? 'text-bone-100' : 'text-navy-900'
        }`}
      >
        {prefix}
        {formatNumber(current)}
        {suffix && (
          <span className={dark ? 'text-gold-400' : 'text-crimson-600'}>{suffix}</span>
        )}
      </p>

      <p
        className={`text-[0.6875rem] font-semibold tracking-[0.18em] uppercase ${
          dark ? 'text-bone-300/50' : 'text-navy-400'
        }`}
      >
        {label}
      </p>
    </div>
  )
}
