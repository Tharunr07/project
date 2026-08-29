import { Star } from 'lucide-react'

const SIZES = { xs: 12, sm: 14, md: 17, lg: 20 }

/**
 * Five-star rating display. Supports halves.
 * Set `interactive` with `onRate` to use it as an input (admin review form).
 */
export default function Rating({
  value = 0,
  size = 'sm',
  showValue = false,
  count,
  tone = 'gold',
  interactive = false,
  onRate,
  className = '',
}) {
  const px = SIZES[size] ?? SIZES.sm
  // Stars are brand red, the way a Michelin guide sets them — the page only
  // has two colours, and a rating is exactly the kind of thing red is for.
  // `tone="amber"` remains for admin screens that need a non-brand star.
  const fill = tone === 'amber' ? 'text-gold-400' : 'text-brand-500'
  const empty = 'text-ink-200'

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className="flex items-center gap-0.5"
        role={interactive ? 'radiogroup' : 'img'}
        aria-label={interactive ? 'Rating' : `Rated ${value} out of 5`}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = value >= star
          const half = !filled && value >= star - 0.5
          const icon = (
            <span className="relative block">
              <Star size={px} className={empty} strokeWidth={1.8} aria-hidden="true" />
              {(filled || half) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: half ? '50%' : '100%' }}
                  aria-hidden="true"
                >
                  <Star size={px} className={fill} fill="currentColor" strokeWidth={0} />
                </span>
              )}
            </span>
          )

          return interactive ? (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={Math.round(value) === star}
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
              onClick={() => onRate?.(star)}
              className="cursor-pointer rounded transition-transform hover:scale-115"
            >
              {icon}
            </button>
          ) : (
            <span key={star}>{icon}</span>
          )
        })}
      </div>

      {showValue && (
        <span className="text-sm font-bold text-ink-900 tabular-nums">{value.toFixed(1)}</span>
      )}
      {count !== undefined && (
        <span className="font-utility text-xs font-semibold text-ink-400">({count})</span>
      )}
    </div>
  )
}
