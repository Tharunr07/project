import { MapPin, Quote } from 'lucide-react'
import { useReveal } from '../../hooks'
import { formatDate, initials } from '../../utils/format'
import Badge from '../ui/Badge'
import Rating from '../ui/Rating'
import SmartImage from '../ui/SmartImage'

/**
 * Traveller review. Used in the testimonial carousel (`tone="dark"`) and on the
 * reviews page grid (`tone="light"`). `clamp` keeps carousel slides equal height.
 */
export default function ReviewCard({ review, tone = 'light', clamp = false, delay = 0 }) {
  const ref = useReveal()
  const dark = tone === 'dark'

  return (
    <article
      ref={ref}
      className={`reveal flex h-full flex-col rounded-3xl p-6 transition-all duration-400 sm:p-7 ${
        dark
          ? 'bg-white/6 ring-1 ring-inset ring-white/12 backdrop-blur-sm hover:bg-white/10'
          : 'bg-white shadow-card hover:-translate-y-1 hover:shadow-lift'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <Rating value={review.rating} size="sm" />
        <Quote
          size={30}
          strokeWidth={1.4}
          aria-hidden="true"
          className={dark ? 'text-white/20' : 'text-sand-300'}
        />
      </div>

      <blockquote
        className={`mt-4 flex-1 text-[0.9375rem] leading-relaxed ${
          clamp ? 'line-clamp-6' : ''
        } ${dark ? 'text-navy-100' : 'text-navy-600'}`}
      >
        {review.review}
      </blockquote>

      <div
        className={`mt-6 flex items-center gap-3.5 border-t pt-5 ${
          dark ? 'border-white/12' : 'border-sand-200'
        }`}
      >
        {review.avatar ? (
          <SmartImage
            src={review.avatar}
            alt={review.name}
            className="size-12 shrink-0 rounded-full"
          />
        ) : (
          <span
            aria-hidden="true"
            className={`grid size-12 shrink-0 place-content-center rounded-full text-sm font-bold ${
              dark ? 'bg-white/12 text-white' : 'bg-navy-100 text-navy-700'
            }`}
          >
            {initials(review.name)}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p className={`truncate font-bold ${dark ? 'text-white' : 'text-navy-900'}`}>
            {review.name}
          </p>
          <p
            className={`mt-0.5 flex items-center gap-1 truncate text-xs font-medium ${
              dark ? 'text-navy-300' : 'text-navy-400'
            }`}
          >
            <MapPin size={12} aria-hidden="true" />
            {review.hometown}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge tone={dark ? 'glass' : 'crimson'} size="xs">
          {review.trip}
        </Badge>
        <Badge tone={dark ? 'glass' : 'neutral'} size="xs">
          {review.groupType}
        </Badge>
        <span
          className={`ml-auto text-[0.6875rem] font-semibold ${
            dark ? 'text-navy-400' : 'text-navy-400'
          }`}
        >
          {formatDate(review.date)}
        </span>
      </div>
    </article>
  )
}
